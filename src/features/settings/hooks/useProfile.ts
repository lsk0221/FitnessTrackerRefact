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
  streak: number; // Current consecutive days
  totalWorkouts: number; // Total workout sessions
  totalActiveDays: number; // Total unique training days
  level: number; // User level
  big3: {
    squat: number;    // Squat 1RM (or max record)
    bench: number;    // Bench Press 1RM
    deadlift: number; // Deadlift 1RM
    total: number;    // S+B+D total
  };
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
 * Calculate total active days (unique training dates)
 * 計算總活躍天數（不重複日期）
 */
const calculateTotalActiveDays = (workouts: Workout[]): number => {
  const uniqueDates = new Set(
    workouts.map(w => {
      const date = new Date(w.date);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    })
  );
  return uniqueDates.size;
};

/**
 * Calculate Big 3 (Squat, Bench Press, Deadlift) max weights
 * 計算健力三項（深蹲、臥推、硬舉）最大重量
 */
const calculateBig3 = (workouts: Workout[]): { squat: number; bench: number; deadlift: number; total: number } => {
  let maxSquat = 0;
  let maxBench = 0;
  let maxDeadlift = 0;

  workouts.forEach(workout => {
    const exerciseName = (workout.exercise || '').toLowerCase().trim();
    const weight = workout.weight || 0;

    if (weight <= 0) return; // Skip zero or negative weights

    // Match Squat variations (case-insensitive)
    // 匹配深蹲變體（不區分大小寫）
    if (exerciseName.includes('squat') && 
        !exerciseName.includes('jump') && 
        !exerciseName.includes('split') &&
        weight > maxSquat) {
      maxSquat = weight;
    }

    // Match Bench Press variations (case-insensitive)
    // 匹配臥推變體（不區分大小寫）
    if ((exerciseName.includes('bench') && exerciseName.includes('press')) || 
        exerciseName.includes('bench press') ||
        exerciseName === 'barbell bench press' ||
        exerciseName === 'bench press' ||
        (exerciseName.includes('bench') && !exerciseName.includes('incline') && !exerciseName.includes('decline'))) {
      if (weight > maxBench) {
        maxBench = weight;
      }
    }

    // Match Deadlift variations (case-insensitive)
    // 匹配硬舉變體（不區分大小寫），排除羅馬尼亞硬舉
    if (exerciseName.includes('deadlift') && 
        !exerciseName.includes('romanian') && 
        !exerciseName.includes('stiff') &&
        weight > maxDeadlift) {
      maxDeadlift = weight;
    }
  });

  return {
    squat: maxSquat,
    bench: maxBench,
    deadlift: maxDeadlift,
    total: maxSquat + maxBench + maxDeadlift,
  };
};

/**
 * Calculate user level based on total workouts
 * 根據總訓練次數計算用戶等級
 */
const calculateLevel = (totalWorkouts: number): number => {
  return Math.floor(totalWorkouts / 10) + 1;
};

export const useProfile = (): UseProfileReturn => {
  const { user, refreshAuthState } = useCloudflareAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    streak: 0,
    totalWorkouts: 0,
    totalActiveDays: 0,
    level: 1,
    big3: {
      squat: 0,
      bench: 0,
      deadlift: 0,
      total: 0,
    },
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
      const streak = calculateStreak(workouts);
      const totalActiveDays = calculateTotalActiveDays(workouts);
      const big3 = calculateBig3(workouts);
      const level = calculateLevel(totalWorkouts);

      setStats({
        streak,
        totalWorkouts,
        totalActiveDays,
        level,
        big3,
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

