import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Export API Base URL for easy access
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://fitness-tracker-api.fitness-tracker.workers.dev';

/**
 * Google OAuth Client ID (Web)
 * Reads from environment variable EXPO_PUBLIC_GOOGLE_CLIENT_ID
 * Falls back to platform-specific Client IDs if Web Client ID is not configured
 * 
 * Security: This should NEVER have a hardcoded fallback value.
 * If missing, it will fallback to iOS/Android Client ID or log a warning.
 */
export const GOOGLE_CLIENT_ID = (() => {
  // Check for Web Client ID first
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  
  // Check if at least one Client ID is configured
  const hasWebClientId = webClientId && webClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE' && webClientId.trim() !== '';
  const hasIosClientId = iosClientId && iosClientId !== 'YOUR_GOOGLE_IOS_CLIENT_ID_HERE' && iosClientId.trim() !== '';
  const hasAndroidClientId = androidClientId && androidClientId !== 'YOUR_GOOGLE_ANDROID_CLIENT_ID_HERE' && androidClientId.trim() !== '';
  
  const isGoogleConfigured = hasWebClientId || hasIosClientId || hasAndroidClientId;
  
  // If Web Client ID is configured, use it
  if (hasWebClientId) {
    return webClientId;
  }
  
  // Fallback to iOS Client ID if available (for backward compatibility)
  if (hasIosClientId) {
    if (__DEV__) {
      console.warn('⚠️ [Config Info]: Using iOS Client ID as fallback for GOOGLE_CLIENT_ID');
      console.warn('💡 Consider setting EXPO_PUBLIC_GOOGLE_CLIENT_ID for web/universal use');
    }
    return iosClientId;
  }
  
  // Fallback to Android Client ID if available
  if (hasAndroidClientId) {
    if (__DEV__) {
      console.warn('⚠️ [Config Info]: Using Android Client ID as fallback for GOOGLE_CLIENT_ID');
      console.warn('💡 Consider setting EXPO_PUBLIC_GOOGLE_CLIENT_ID for web/universal use');
    }
    return androidClientId;
  }
  
  // No Client ID configured at all
  if (!isGoogleConfigured) {
    const errorMessage = 'No Google Client ID configured. Please set at least one Client ID in your .env file.';
    
    if (__DEV__) {
      console.error('❌ [Config Error]:', errorMessage);
      console.error('📝 Please add one of the following to your .env file:');
      console.error('   - EXPO_PUBLIC_GOOGLE_CLIENT_ID (Web/Universal)');
      console.error('   - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID (iOS)');
      console.error('   - EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID (Android)');
      console.error('💡 See .env.example for reference');
    } else {
      console.warn('⚠️ [Config Warning]:', errorMessage);
    }
    
    return '';
  }
  
  return '';
})();

/**
 * Google OAuth iOS Client ID
 * Reads from environment variable EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
 * 
 * Used for native iOS Google Sign-In
 * Security: This should NEVER have a hardcoded fallback value.
 */
export const GOOGLE_IOS_CLIENT_ID = (() => {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  
  if (!iosClientId || iosClientId === 'YOUR_GOOGLE_IOS_CLIENT_ID_HERE' || iosClientId.trim() === '') {
    if (__DEV__) {
      console.warn('⚠️ [Config Warning]: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not configured. iOS native Google Sign-In may not work.');
      console.warn('📝 Please add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID to your .env file for iOS native login');
    }
    
    return '';
  }
  
  return iosClientId;
})();

// Cloudflare 認證配置
const CLOUDFLARE_CONFIG = {
  // Cloudflare Workers 端點
  // Read from environment variable with fallback to hardcoded URL
  API_BASE_URL,
  
  // 認證端點
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/update-profile',
    CHANGE_PASSWORD: '/auth/change-password',
    SYNC_DATA: '/data/sync',
    GET_DATA: '/data/get'
  }
};

// 認證 API 類
export class CloudflareAuth {
  constructor() {
    this.baseURL = CLOUDFLARE_CONFIG.API_BASE_URL;
    this.token = null;
  }

  // 設置認證令牌
  setToken(token) {
    this.token = token;
  }

  // 獲取認證頭
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  // 通用 API 請求方法
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      console.log('Making API request to:', url);
      console.log('Request config:', config);
      
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Check content-type before parsing JSON
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      
      let data;
      if (isJson) {
        data = await response.json();
        console.log('Response data:', data);
      } else {
        // Server returned non-JSON (likely HTML error page)
        const text = await response.text();
        console.error('Server returned non-JSON response:', text.substring(0, 200));
        
        // Provide more specific error message for 500 errors
        if (response.status >= 500) {
          throw new Error(`服務器內部錯誤（狀態碼: ${response.status}）。Cloudflare Worker 可能未正確部署或配置。請檢查 Worker 的數據庫綁定和日誌。`);
        } else {
          throw new Error(`服務器返回了非 JSON 格式的響應（狀態碼: ${response.status}）。API 可能未正確配置或端點不存在。`);
        }
      }

      if (!response.ok) {
        // 處理特定的錯誤情況
        if (response.status === 409) {
          throw new Error('該郵箱已被註冊，請使用登入功能或嘗試其他郵箱');
        } else if (response.status === 401) {
          // 提供更詳細的錯誤信息
          const errorMessage = data.error || data.message || '登入失敗';
          if (errorMessage.includes('登入失敗')) {
            throw new Error('登入失敗：帳號或密碼不正確。如果您是新用戶，請先註冊。或者您可以使用「本地模式」來離線使用應用。');
          } else {
            throw new Error(errorMessage);
          }
        } else if (response.status === 400) {
          throw new Error('請求格式錯誤，請檢查輸入信息');
        } else if (response.status === 404) {
          throw new Error('API 端點不存在，請檢查 API 配置');
        } else if (response.status >= 500) {
          throw new Error('服務器錯誤，請稍後再試或使用「本地模式」');
        } else {
          throw new Error(data.error || data.message || `API request failed with status ${response.status}`);
        }
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      console.error('Request URL:', url);
      console.error('Request config:', config);
      
      // 處理網絡錯誤
      if (error.message === 'Network request failed' || error.message.includes('fetch')) {
        throw new Error('無法連接到服務器，請檢查網絡連接或使用「本地模式」');
      }
      
      // 處理 JSON 解析錯誤
      if (error instanceof SyntaxError) {
        throw new Error('服務器返回無效數據，API 可能未正確配置');
      }
      
      throw error;
    }
  }

  // 登入
  async login(email, password) {
    const data = await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.token) {
      this.setToken(data.token);
      await this.saveToken(data.token);
    }

    return data;
  }

  // 註冊
  async register(email, password, displayName) {
    const data = await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName })
    });

    if (data.token) {
      this.setToken(data.token);
      await this.saveToken(data.token);
    }

    return data;
  }

  // Google 登入
  // Supports both idToken (legacy) and Authorization Code Flow (code, codeVerifier, redirectUri)
  async loginWithGoogle(idTokenOrCode) {
    // Support both legacy idToken string and new code object
    let requestBody;
    if (typeof idTokenOrCode === 'string') {
      // Legacy: idToken as string
      requestBody = { idToken: idTokenOrCode };
    } else {
      // New: Authorization Code Flow
      requestBody = {
        code: idTokenOrCode.code,
        codeVerifier: idTokenOrCode.codeVerifier,
        redirectUri: idTokenOrCode.redirectUri,
      };
    }

    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify(requestBody)
    });

    if (data.token) {
      this.setToken(data.token);
      await this.saveToken(data.token);
    }

    return data;
  }

  // Apple 登入
  async loginWithApple(identityToken, fullName) {
    const data = await this.request('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ 
        identityToken,
        user: fullName 
      })
    });

    if (data.token) {
      this.setToken(data.token);
      await this.saveToken(data.token);
    }

    return data;
  }

  // Facebook 登入
  async loginWithFacebook(facebookToken) {
    const data = await this.request('/auth/facebook', {
      method: 'POST',
      body: JSON.stringify({ 
        accessToken: facebookToken 
      })
    });

    if (data.token) {
      this.setToken(data.token);
      await this.saveToken(data.token);
    }

    return data;
  }

  // 登出
  async logout() {
    try {
      await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.LOGOUT, {
        method: 'POST'
      });
    } finally {
      this.setToken(null);
      await this.removeToken();
    }
  }

  // 獲取用戶資料
  async getProfile() {
    return await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.PROFILE);
  }

  // 更新用戶資料
  async updateProfile(profileData) {
    return await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  // 修改密碼
  async changePassword(currentPassword, newPassword) {
    return await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.CHANGE_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }

  // 同步訓練數據
  async syncWorkoutData(workouts) {
    return await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.SYNC_DATA, {
      method: 'POST',
      body: JSON.stringify({ workouts })
    });
  }

  // 獲取訓練數據
  async getWorkoutData() {
    return await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.GET_DATA);
  }

  // 檢查 API 連接狀態
  async checkConnectivity() {
    try {
      console.log('檢查 API 連接狀態...');
      const url = `${this.baseURL}/health`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // 即使沒有 /health 端點，只要能連接到服務器就返回 true
      console.log('API 連接檢查狀態:', response.status);
      return response.status < 500; // 只要不是服務器錯誤就認為可連接
    } catch (error) {
      console.error('API 連接檢查失敗:', error);
      return false;
    }
  }

  // 本地存儲方法
  // 使用 SecureStore 存儲 JWT Token（硬體級加密保護）
  async saveToken(token) {
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  async getToken() {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  async removeToken() {
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }
}

// 創建單例實例
export const cloudflareAuth = new CloudflareAuth();
