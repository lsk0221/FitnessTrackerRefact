/**
 * Settings Hook
 * 設定 Hook
 * 
 * Manages settings-related state and business logic
 * 管理設定相關的狀態和業務邏輯
 */

import { useCallback } from 'react';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useUnit } from '../../../shared/hooks/useUnit';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';

export interface UseSettingsReturn {
  // State
  state: {
    // Theme settings
    isDarkMode: boolean;
    themeMode: 'light' | 'dark';
    // Unit settings
    currentUnit: 'kg' | 'lb';
    unitSystem: 'metric' | 'imperial';
    // App version
    version: string;
    // User info
    user: any | null;
  };
  // Actions
  actions: {
    toggleTheme: () => Promise<void>;
    toggleUnit: () => Promise<void>;
    changeUnit: (unit: 'kg' | 'lb') => Promise<void>;
    handleLogout: () => Promise<void>;
  };
}

/**
 * Settings Hook
 * 設定 Hook
 * 
 * Manages app settings including theme, unit preferences, and user logout
 * 管理應用程式設定，包括主題、單位偏好和用戶登出
 */
export const useSettings = (): UseSettingsReturn => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUnit, saveUnitPreference } = useUnit();
  const { user, logout } = useCloudflareAuth();

  // App version - can be replaced with expo-constants if needed
  const version = '1.0.0';

  /**
   * Toggle theme between light and dark
   * 在淺色和深色主題之間切換
   */
  const handleToggleTheme = useCallback(async () => {
    try {
      await toggleTheme();
    } catch (error) {
      console.error('Failed to toggle theme:', error);
      throw error;
    }
  }, [toggleTheme]);

  /**
   * Toggle unit between kg and lb
   * 在 kg 和 lb 之間切換單位
   */
  const handleToggleUnit = useCallback(async () => {
    try {
      const newUnit = currentUnit === 'kg' ? 'lb' : 'kg';
      await saveUnitPreference(newUnit);
    } catch (error) {
      console.error('Failed to toggle unit:', error);
      throw error;
    }
  }, [currentUnit, saveUnitPreference]);

  /**
   * Change unit to specific value
   * 更改單位為特定值
   */
  const handleChangeUnit = useCallback(async (unit: 'kg' | 'lb') => {
    try {
      if (unit !== currentUnit) {
        await saveUnitPreference(unit);
      }
    } catch (error) {
      console.error('Failed to change unit:', error);
      throw error;
    }
  }, [currentUnit, saveUnitPreference]);

  /**
   * Handle user logout
   * 處理用戶登出
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
      throw error;
    }
  }, [logout]);

  // Determine unit system based on current unit
  const unitSystem = currentUnit === 'kg' ? 'metric' : 'imperial';
  const themeMode = isDarkMode ? 'dark' : 'light';

  return {
    state: {
      isDarkMode: isDarkMode || false,
      themeMode,
      currentUnit: currentUnit as 'kg' | 'lb',
      unitSystem,
      version,
      user,
    },
    actions: {
      toggleTheme: handleToggleTheme,
      toggleUnit: handleToggleUnit,
      changeUnit: handleChangeUnit,
      handleLogout,
    },
  };
};

