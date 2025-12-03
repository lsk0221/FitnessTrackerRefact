/**
 * Authentication Hook
 * 認證 Hook
 * 
 * This hook manages authentication state and business logic
 * 此 Hook 管理認證狀態和業務邏輯
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loginWithEmail,
  registerWithEmail,
  signInLocalMode,
  signOut,
  getCurrentUser,
  getCurrentUserProfile,
  updateUserProfile,
  syncWorkoutData,
  getWorkoutData,
  initializeAuth,
  loginWithGoogle,
  loginWithApple,
  User,
  LoginCredentials,
  RegisterCredentials
} from '../../../shared/services/api/authService';

export interface UseAuthReturn {
  // State
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Actions
  signIn: (credentials: LoginCredentials) => Promise<void>;
  signUp: (credentials: RegisterCredentials) => Promise<void>;
  signInLocal: () => Promise<void>;
  handleGoogleLogin: (
    idTokenOrCode: string | { code: string; codeVerifier: string; redirectUri: string }
  ) => Promise<void>;
  handleAppleLogin: (identityToken: string, fullName?: { givenName?: string; familyName?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  syncWorkouts: (workouts: any[]) => Promise<void>;
  getWorkouts: () => Promise<any[]>;
  clearError: () => void;
  refreshAuthState: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed state
  const isAuthenticated = !!user;

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuthState();
  }, []);

  /**
   * Initialize authentication state
   * 初始化認證狀態
   */
  const initializeAuthState = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await initializeAuth();
      setUser(userData);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError(error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with email and password
   * 使用電子郵件和密碼登入
   */
  const signIn = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await loginWithEmail(credentials);
      console.log('Sign in successful, setting user:', result.user);
      setUser(result.user);
      
      // 登入成功後自動同步數據
      await autoSyncData(result.user);
      
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up with email and password
   * 使用電子郵件和密碼註冊
   */
  const signUp = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await registerWithEmail(credentials);
      console.log('Sign up successful, setting user:', result.user);
      setUser(result.user);
      
      // 註冊成功後自動同步數據
      await autoSyncData(result.user);
      
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with local mode
   * 使用本地模式登入
   */
  const signInLocal = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await signInLocalMode();
      setUser(result.user);
      
    } catch (error) {
      console.error('Local sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Google OAuth
   * 使用 Google OAuth 登入
   * 
   * Supports both:
   * - Legacy: idToken as string (Implicit Flow)
   * - New: Authorization Code Flow with { code, codeVerifier, redirectUri }
   */
  const handleGoogleLogin = async (
    idTokenOrCode: string | { code: string; codeVerifier: string; redirectUri: string }
  ) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await loginWithGoogle(idTokenOrCode);
      console.log('Google sign in successful, setting user:', result.user);
      setUser(result.user);
      
      // Auto sync data after login
      await autoSyncData(result.user);
      
    } catch (error) {
      console.error('Google sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in with Apple OAuth
   * 使用 Apple OAuth 登入
   */
  const handleAppleLogin = async (
    identityToken: string,
    fullName?: { givenName?: string; familyName?: string }
  ) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await loginWithApple(identityToken, fullName);
      console.log('Apple sign in successful, setting user:', result.user);
      setUser(result.user);
      
      // Auto sync data after login
      await autoSyncData(result.user);
      
    } catch (error) {
      console.error('Apple sign in error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   * 登出當前用戶
   */
  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      
      await signOut();
      setUser(null);
      
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   * 更新用戶資料
   */
  const updateProfile = async (profileData: Partial<User>) => {
    try {
      setError(null);
      setLoading(true);
      
      const updatedUser = await updateUserProfile(profileData);
      setUser(updatedUser);
      
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sync workout data to cloud
   * 同步訓練數據到雲端
   */
  const syncWorkouts = async (workouts: any[]) => {
    try {
      setError(null);
      await syncWorkoutData(workouts);
    } catch (error) {
      console.error('Sync workouts error:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Get workout data from cloud
   * 從雲端獲取訓練數據
   */
  const getWorkouts = async (): Promise<any[]> => {
    try {
      setError(null);
      return await getWorkoutData();
    } catch (error) {
      console.error('Get workouts error:', error);
      setError(error.message);
      throw error;
    }
  };

  /**
   * Clear error state
   * 清除錯誤狀態
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Refresh authentication state
   * 刷新認證狀態
   */
  const refreshAuthState = async () => {
    try {
      console.log('強制刷新登入狀態...');
      await initializeAuthState();
      console.log('登入狀態刷新完成');
    } catch (error) {
      console.error('刷新登入狀態失敗:', error);
    }
  };

  /**
   * Auto sync data after login/register
   * 登入/註冊後自動同步數據
   */
  const autoSyncData = async (currentUser: User) => {
    try {
      // 檢查同步設定
      const syncEnabled = await AsyncStorage.getItem('syncEnabled');
      if (syncEnabled === 'false') {
        return; // 同步已禁用
      }

      // 獲取當前用戶的本地訓練數據
      const userKey = currentUser ? `workouts_${currentUser.id}` : 'workouts';
      const localWorkouts = await AsyncStorage.getItem(userKey);
      const workouts = localWorkouts ? JSON.parse(localWorkouts) : [];
      
      if (workouts.length > 0) {
        // 同步到雲端
        await syncWorkoutData(workouts);
        console.log('自動同步完成，同步了', workouts.length, '條訓練記錄');
      }
    } catch (error) {
      console.error('自動同步失敗:', error);
      // 不拋出錯誤，避免影響登入流程
    }
  };

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    
    // Actions
    signIn,
    signUp,
    signInLocal,
    handleGoogleLogin,
    handleAppleLogin,
    logout,
    updateProfile,
    syncWorkouts,
    getWorkouts,
    clearError,
    refreshAuthState
  };
};
