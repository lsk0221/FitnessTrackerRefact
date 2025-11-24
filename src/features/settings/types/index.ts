/**
 * Settings Module Types
 * 設定模組類型
 * 
 * Type definitions for the settings module
 * 設定模組的類型定義
 */

export interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  unit: 'kg' | 'lb';
  language: 'en' | 'zh';
}

export interface ProfileUpdateData {
  displayName?: string;
  avatar?: string;
}


