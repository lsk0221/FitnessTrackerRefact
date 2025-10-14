/**
 * Theme Context
 * 主題上下文
 * 
 * Manages light/dark theme state and provides theme colors
 * 管理淺色/深色主題狀態並提供主題顏色
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 創建主題上下文
const ThemeContext = createContext();

/**
 * Hook to use theme context
 * 使用主題上下文的 Hook
 * 
 * @returns {Object} Theme state and methods
 * @throws {Error} If used outside of ThemeProvider
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Theme Provider Component
 * 主題提供者組件
 * 
 * Wraps the app with theme context and manages theme state
 * 用主題上下文包裝應用程式並管理主題狀態
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ThemeProvider = ({ children }) => {
  // 深色模式狀態，預設為淺色模式
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 組件掛載時載入主題偏好
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Load theme preference from local storage
   * 從本地存儲載入主題偏好
   */
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark'); // 根據存儲的值設置深色模式
      }
    } catch (error) {
      console.error('載入主題偏好時發生錯誤:', error);
    }
  };

  /**
   * Toggle between light and dark theme
   * 在淺色和深色主題之間切換
   */
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode; // 切換主題
      setIsDarkMode(newTheme);
      // 保存主題偏好到本地存儲
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('儲存主題偏好時發生錯誤:', error);
    }
  };

  // 淺色主題顏色定義
  const lightTheme = {
    backgroundColor: '#f8f9fa', // 主背景色（淺灰）
    cardBackground: '#ffffff', // 卡片背景色（白色）
    textPrimary: '#333333', // 主要文字色（深灰）
    textSecondary: '#666666', // 次要文字色（中灰）
    textTertiary: '#999999', // 第三級文字色（淺灰）
    borderColor: '#e0e0e0', // 邊框色（淺灰）
    primaryColor: '#007AFF', // 主要顏色（藍色）
    successColor: '#34C759', // 成功色（綠色）
    warningColor: '#FF9500', // 警告色（橙色）
    errorColor: '#FF3B30', // 錯誤色（紅色）
    shadowColor: '#000000', // 陰影色（黑色）
    shadowOpacity: 0.1, // 陰影透明度
  };

  // 深色主題顏色定義
  const darkTheme = {
    backgroundColor: '#1a1a1a', // 主背景色（深黑）
    cardBackground: '#2a2a2a', // 卡片背景色（深灰）
    textPrimary: '#ffffff', // 主要文字色（白色）
    textSecondary: '#cccccc', // 次要文字色（淺灰）
    textTertiary: '#999999', // 第三級文字色（中灰）
    borderColor: '#4a4a4a', // 邊框色（中灰）
    primaryColor: '#34C759', // 主要顏色（綠色）
    successColor: '#34C759', // 成功色（綠色）
    warningColor: '#FF9500', // 警告色（橙色）
    errorColor: '#FF453A', // 錯誤色（紅色）
    shadowColor: '#000000', // 陰影色（黑色）
    shadowOpacity: 0.3, // 陰影透明度（更深）
  };

  // 根據深色模式狀態選擇主題
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
