/**
 * Authentication Service
 * 認證服務
 * 
 * This service handles all authentication-related API calls
 * 此服務處理所有與認證相關的 API 調用
 */

import { cloudflareAuth } from '../../../app/config/cloudflare';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  isLocalMode?: boolean;
}

export interface AuthResult {
  user: User;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

/**
 * Sign in with email and password
 * 使用電子郵件和密碼登入
 * 
 * @param credentials - 登入憑證 {email, password}
 * @returns Promise<AuthResult> - 包含用戶資料和令牌的結果
 */
export const loginWithEmail = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    console.log('開始 Email 登入...');
    
    // 調用 Cloudflare Auth 服務進行登入
    const result = await cloudflareAuth.login(credentials.email, credentials.password);
    console.log('登入成功，用戶資料:', result.user);
    
    // 保存用戶資料到本地存儲，用於離線訪問
    await AsyncStorage.setItem('user_profile', JSON.stringify(result.user));
    console.log('用戶資料已保存到本地存儲');
    
    return result;
  } catch (error) {
    console.error('Email 登入失敗:', error);
    throw error;
  }
};

/**
 * Register new user with email and password
 * 使用電子郵件和密碼註冊新用戶
 */
export const registerWithEmail = async (credentials: RegisterCredentials): Promise<AuthResult> => {
  try {
    console.log('開始 Email 註冊...');
    
    const result = await cloudflareAuth.register(credentials.email, credentials.password, credentials.displayName);
    console.log('註冊成功，用戶資料:', result.user);
    
    // 保存用戶資料到本地存儲
    await AsyncStorage.setItem('user_profile', JSON.stringify(result.user));
    console.log('用戶資料已保存到本地存儲');
    
    return result;
  } catch (error) {
    console.error('Email 註冊失敗:', error);
    throw error;
  }
};

/**
 * Sign in with local mode (offline)
 * 使用本地模式登入（離線）
 */
export const signInLocalMode = async (): Promise<AuthResult> => {
  try {
    console.log('開始本地模式登入...');
    
    // 創建本地模式用戶
    const localUser: User = {
      id: 'local_user',
      email: 'local@example.com',
      name: '本地用戶',
      displayName: '本地用戶',
      isLocalMode: true
    };
    
    // 保存本地用戶資料
    await AsyncStorage.setItem('user_profile', JSON.stringify(localUser));
    console.log('本地用戶資料已保存');
    
    return { user: localUser };
  } catch (error) {
    console.error('本地模式登入失敗:', error);
    throw error;
  }
};

/**
 * Sign out current user
 * 登出當前用戶
 */
export const signOut = async (): Promise<void> => {
  try {
    console.log('開始登出...');
    
    await cloudflareAuth.logout();
    
    // 清除本地存儲
    await AsyncStorage.removeItem('user_profile');
    console.log('登出成功，本地資料已清除');
  } catch (error) {
    console.error('登出失敗:', error);
    throw error;
  }
};

/**
 * Get current user from local storage
 * 從本地存儲獲取當前用戶
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userProfile = await AsyncStorage.getItem('user_profile');
    if (userProfile) {
      return JSON.parse(userProfile);
    }
    return null;
  } catch (error) {
    console.error('獲取當前用戶失敗:', error);
    return null;
  }
};

/**
 * Get current user profile from cloud
 * 從雲端獲取當前用戶資料
 */
export const getCurrentUserProfile = async (): Promise<User | null> => {
  try {
    console.log('嘗試從雲端獲取用戶資料...');
    const profile = await cloudflareAuth.getProfile();
    if (profile.user) {
      // 更新本地存儲
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile.user));
      console.log('從雲端更新用戶資料:', profile.user);
      return profile.user;
    }
    return null;
  } catch (error: any) {
    const errorMessage = error?.message || '';
    const errorStatus = error?.status || error?.response?.status;
    
    // Check if error is due to invalid/expired token
    const isTokenError = 
      errorMessage.includes('Invalid or expired token') ||
      errorMessage.includes('invalid token') ||
      errorMessage.includes('expired token') ||
      errorStatus === 401 ||
      errorStatus === 403;
    
    if (isTokenError) {
      console.log('檢測到過期或無效的 token，執行登出:', errorMessage);
      // Token 無效，清除認證資料並登出
      try {
        await cloudflareAuth.removeToken();
        await AsyncStorage.removeItem('user_profile');
        console.log('已清除過期 token 和用戶資料');
      } catch (removeError) {
        console.error('清除 token 時發生錯誤:', removeError);
      }
      return null;
    } else {
      // 其他錯誤（如網路問題），返回本地資料作為降級方案
      console.log('雲端用戶資料獲取失敗（非認證錯誤），使用本地資料:', errorMessage);
      return await getCurrentUser();
    }
  }
};

/**
 * Update user profile
 * 更新用戶資料
 */
export const updateUserProfile = async (profileData: Partial<User>): Promise<User> => {
  try {
    console.log('開始更新用戶資料...');
    
    // 獲取當前用戶
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error('用戶未登入');
    }
    
    // 更新用戶資料
    const updatedUser: User = {
      ...currentUser,
      ...profileData,
      // 如果更新了 displayName，同時更新 name 字段以保持兼容性
      ...(profileData.displayName && { name: profileData.displayName })
    };
    
    // 保存到本地存儲
    await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
    
    // 嘗試更新雲端用戶資料（如果 API 可用）
    try {
      await cloudflareAuth.updateProfile(profileData);
      console.log('雲端用戶資料更新成功');
    } catch (apiError) {
      console.log('雲端更新失敗，但本地更新成功:', apiError.message);
      // 雲端更新失敗不影響本地更新
    }
    
    return updatedUser;
  } catch (error) {
    console.error('更新用戶資料失敗:', error);
    throw error;
  }
};

/**
 * Sync workout data to cloud
 * 同步訓練數據到雲端
 */
export const syncWorkoutData = async (workouts: any[]): Promise<any> => {
  try {
    console.log('開始同步訓練數據...');
    const result = await cloudflareAuth.syncWorkoutData(workouts);
    console.log('訓練數據同步成功');
    return result;
  } catch (error) {
    console.error('同步訓練數據失敗:', error);
    throw error;
  }
};

/**
 * Get workout data from cloud
 * 從雲端獲取訓練數據
 */
export const getWorkoutData = async (): Promise<any[]> => {
  try {
    console.log('開始獲取訓練數據...');
    const result = await cloudflareAuth.getWorkoutData();
    console.log('訓練數據獲取成功');
    return result.workouts || [];
  } catch (error) {
    console.error('獲取訓練數據失敗:', error);
    throw error;
  }
};

/**
 * Initialize authentication state
 * 初始化認證狀態
 */
export const initializeAuth = async (): Promise<User | null> => {
  try {
    console.log('=== 開始初始化認證 ===');
    
    // 檢查本地存儲的 token
    const token = await cloudflareAuth.getToken();
    console.log('找到的 token:', token ? '存在' : '不存在');
    
    if (token) {
      try {
        cloudflareAuth.setToken(token);
        console.log('Token 已設置到 cloudflareAuth 實例');
        
        // 先嘗試從本地存儲加載用戶資料
        const localUser = await getCurrentUser();
        if (localUser) {
          console.log('從本地存儲加載用戶資料:', localUser);
        }
        
        // 然後嘗試從雲端獲取最新用戶資料
        const cloudUser = await getCurrentUserProfile();
        if (cloudUser) {
          console.log('從雲端更新用戶資料:', cloudUser);
          return cloudUser;
        }
        
        return localUser;
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Token 無效，清除本地存儲
        await cloudflareAuth.removeToken();
        await AsyncStorage.removeItem('user_profile');
        return null;
      }
    } else {
      // 沒有 token，返回 null
      console.log('沒有找到 token，返回 null');
      return null;
    }
  } catch (error) {
    console.error('Auth initialization error:', error);
    // 清除本地存儲並返回 null
    try {
      await cloudflareAuth.removeToken();
      await AsyncStorage.removeItem('user_profile');
    } catch (removeError) {
      console.error('Token removal error:', removeError);
    }
    return null;
  } finally {
    console.log('=== 認證初始化完成 ===');
  }
};

