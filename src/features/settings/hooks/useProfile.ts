/**
 * Profile Hook
 * 個人資料 Hook
 * 
 * Manages user profile data and business logic
 * 管理用戶個人資料數據和業務邏輯
 */

import { useState, useEffect, useCallback } from 'react';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import { 
  updateUserProfile as updateUserProfileService,
  changePassword as changePasswordService 
} from '../../../shared/services/api/authService';
import { loadWorkouts } from '../../workouts/services/workoutService';
import type { Workout } from '../../workouts/types/workout.types';

export interface UserProfile {
  id: string;
  displayName?: string;
  email?: string;
  avatar?: string;
}

export interface ProfileStats {
  totalWorkouts: number;
  currentStreak: number;
  totalVolume: number; // in kg
  level: number;
  nextLevelProgress: number; // 0-100
  levelTitle: string;
}

export interface UseProfileReturn {
  // State
  state: {
    profile: UserProfile | null;
    stats: ProfileStats;
    isLoading: boolean;
    error: string | null;
  };
  // Actions
  actions: {
    updateProfile: (updates: { displayName?: string }) => Promise<boolean>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
    refreshProfile: () => Promise<void>;
  };
}

/**
 * Profile Hook
 * 個人資料 Hook
 * 
 * Manages user profile data and update operations
 * 管理用戶個人資料數據和更新操作
 */
/**
 * Calculate streak days
 * 計算連續訓練天數
 */
const calculateStreak = (workouts: Workout[]): number => {
  if (workouts.length === 0) return 0;

  // Get unique dates and sort them
  const uniqueDates = Array.from(
    new Set(workouts.map(w => new Date(w.date).toDateString()))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (uniqueDates.length === 0) return 0;

  // Check if the most recent workout was today or yesterday
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  let streak = 0;
  let checkDate = uniqueDates[0];
  
  // If most recent workout is today or yesterday, start counting
  if (checkDate === today || checkDate === yesterday) {
    streak = 1;
    
    // Count consecutive days
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = new Date(uniqueDates[i - 1]);
      const daysDiff = Math.floor(
        (previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
      );
      
      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
  }

  return streak;
};

/**
 * Calculate total volume
 * 計算總重量
 */
const calculateTotalVolume = (workouts: Workout[]): number => {
  return workouts.reduce((total, workout) => {
    // weight is already in kg internally
    const volume = (workout.weight || 0) * (workout.sets || 0) * (workout.reps || 0);
    return total + volume;
  }, 0);
};

/**
 * Get level title based on level
 * 根據等級獲取稱號
 */
const getLevelTitle = (level: number): string => {
  if (level < 5) return '初學者';
  if (level < 10) return '健身愛好者';
  if (level < 20) return '訓練達人';
  if (level < 30) return '健身專家';
  if (level < 50) return '健身大師';
  return '傳奇健身者';
};

/**
 * Calculate level and progress
 * 計算等級和進度
 */
const calculateLevel = (totalWorkouts: number): { level: number; progress: number } => {
  const workoutsPerLevel = 10;
  const level = Math.floor(totalWorkouts / workoutsPerLevel) + 1;
  const workoutsInCurrentLevel = totalWorkouts % workoutsPerLevel;
  const progress = (workoutsInCurrentLevel / workoutsPerLevel) * 100;
  
  return { level, progress };
};

export const useProfile = (): UseProfileReturn => {
  const { user, refreshAuthState } = useCloudflareAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalWorkouts: 0,
    currentStreak: 0,
    totalVolume: 0,
    level: 1,
    nextLevelProgress: 0,
    levelTitle: '初學者',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load profile from user data
   * 從用戶數據載入個人資料
   */
  useEffect(() => {
    if (user) {
      setProfile({
        id: user.id,
        displayName: user.displayName || user.name,
        email: user.email,
        avatar: user.avatar,
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  /**
   * Update profile
   * 更新個人資料
   * 
   * Calls backend API to update user profile data and refreshes global auth context
   * 調用後端 API 更新用戶個人資料數據並刷新全局認證上下文
   */
  const updateProfile = useCallback(async (updates: { displayName?: string }): Promise<boolean> => {
    if (!user || !profile) {
      setError('User not logged in');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Call backend API to update profile
      const updatedUser = await updateUserProfileService({
        displayName: updates.displayName,
      });

      // Step 2: Update local profile state immediately
      setProfile({
        id: updatedUser.id,
        displayName: updatedUser.displayName || updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      });

      // Step 3: Refresh global auth context to sync with all components
      // This ensures SettingsScreen and other components see the updated user data
      if (refreshAuthState) {
        await refreshAuthState();
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [user, profile, refreshAuthState]);

  /**
   * Change password
   * 修改密碼
   * 
   * Calls backend API to change user password
   * 調用後端 API 修改用戶密碼
   */
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> => {
    if (!user) {
      setError('User not logged in');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      await changePasswordService(currentPassword, newPassword);
      setIsLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  }, [user]);

  /**
   * Calculate and update stats
   * 計算並更新統計數據
   */
  const calculateStats = useCallback(async (userId: string) => {
    try {
      const result = await loadWorkouts(userId);
      
      if (!result.success || !result.data) {
        return;
      }

      const workouts = result.data;
      const totalWorkouts = workouts.length;
      const currentStreak = calculateStreak(workouts);
      const totalVolume = calculateTotalVolume(workouts);
      const { level, progress } = calculateLevel(totalWorkouts);
      const levelTitle = getLevelTitle(level);

      setStats({
        totalWorkouts,
        currentStreak,
        totalVolume,
        level,
        nextLevelProgress: progress,
        levelTitle,
      });
    } catch (err) {
      console.error('計算統計數據失敗:', err);
    }
  }, []);

  /**
   * Refresh profile data
   * 刷新個人資料數據
   * 
   * Reloads profile data from user context and calculates stats
   * 從用戶上下文重新載入個人資料數據並計算統計數據
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Reload profile from updated user context
      if (user) {
        setProfile({
          id: user.id,
          displayName: user.displayName || user.name,
          email: user.email,
          avatar: user.avatar,
        });

        // Calculate stats
        await calculateStats(user.id);
      }

      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh profile';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [user, calculateStats]);

  // Load stats when user changes
  useEffect(() => {
    if (user?.id) {
      calculateStats(user.id);
    }
  }, [user?.id, calculateStats]);

  return {
    state: {
      profile,
      stats,
      isLoading,
      error,
    },
    actions: {
      updateProfile,
      changePassword,
      refreshProfile,
    },
  };
};

