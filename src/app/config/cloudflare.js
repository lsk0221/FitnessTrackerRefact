import AsyncStorage from '@react-native-async-storage/async-storage';

// Cloudflare 認證配置
const CLOUDFLARE_CONFIG = {
  // Cloudflare Workers 端點
  API_BASE_URL: 'https://fitness-tracker-api.fitness-tracker.workers.dev',
  
  // 認證端點
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/update-profile',
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
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        // 處理特定的錯誤情況
        if (response.status === 409) {
          throw new Error('該郵箱已被註冊，請使用登入功能或嘗試其他郵箱');
        } else if (response.status === 401) {
          throw new Error('登入失敗，請檢查郵箱和密碼');
        } else if (response.status === 400) {
          throw new Error('請求格式錯誤，請檢查輸入信息');
        } else if (response.status >= 500) {
          throw new Error('服務器錯誤，請稍後再試');
        } else {
          throw new Error(data.message || `API request failed with status ${response.status}`);
        }
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      console.error('Request URL:', url);
      console.error('Request config:', config);
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
  async loginWithGoogle(googleToken) {
    const data = await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ 
        provider: 'google',
        token: googleToken 
      })
    });

    if (data.token) {
      this.setToken(data.token);
      await this.saveToken(data.token);
    }

    return data;
  }

  // Apple 登入
  async loginWithApple(appleToken) {
    const data = await this.request(CLOUDFLARE_CONFIG.ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ 
        provider: 'apple',
        token: appleToken 
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

  // 本地存儲方法
  async saveToken(token) {
    try {
      await AsyncStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to save token:', error);
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  async removeToken() {
    try {
      await AsyncStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }
}

// 創建單例實例
export const cloudflareAuth = new CloudflareAuth();
