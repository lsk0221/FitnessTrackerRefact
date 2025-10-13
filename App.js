/**
 * Fitness Tracker Application Main Entry Point
 * 健身追蹤應用程式主入口點
 * 
 * This is the main entry point of the application, responsible for:
 * 這是應用程式的主要入口點，負責：
 * 1. Providing global context providers
 * 2. Loading saved language preferences
 * 3. Rendering the main app navigator
 * 
 * 1. 提供全局上下文提供者
 * 2. 載入保存的語言偏好
 * 3. 渲染主應用程式導航器
 */

import React from 'react';
import { ThemeProvider } from './src/shared/contexts/ThemeContext';
import { CloudflareAuthProvider } from './src/shared/contexts/CloudflareAuthContext';
import { loadSavedLanguage } from './src/shared/i18n';
import AppNavigator from './src/app/navigation/AppNavigator';

/**
 * Main Application Component
 * 主應用程式組件
 */
export default function App() {
  // Load saved language preferences
  // 載入保存的語言偏好
  React.useEffect(() => {
    loadSavedLanguage();
  }, []);

  return (
    <ThemeProvider>
      <CloudflareAuthProvider>
        <AppNavigator />
      </CloudflareAuthProvider>
    </ThemeProvider>
  );
}
