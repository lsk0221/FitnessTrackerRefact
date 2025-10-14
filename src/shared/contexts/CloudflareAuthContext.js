/**
 * Cloudflare Authentication Context
 * Cloudflare 認證上下文
 * 
 * This context provides authentication state and methods throughout the app
 * 此上下文在整個應用程式中提供認證狀態和方法
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth'; // 導入認證 hook

// 創建認證上下文
const CloudflareAuthContext = createContext();

/**
 * Hook to use authentication context
 * 使用認證上下文的 Hook
 * 
 * @returns {Object} Authentication state and methods
 * @throws {Error} If used outside of CloudflareAuthProvider
 */
export const useCloudflareAuth = () => {
  const context = useContext(CloudflareAuthContext);
  if (!context) {
    throw new Error('useCloudflareAuth must be used within a CloudflareAuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * 認證提供者組件
 * 
 * Wraps the app with authentication context
 * 用認證上下文包裝應用程式
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const CloudflareAuthProvider = ({ children }) => {
  // 使用認證 hook 獲取認證狀態和方法
  const auth = useAuth();

  return (
    <CloudflareAuthContext.Provider value={auth}>
      {children}
    </CloudflareAuthContext.Provider>
  );
};
