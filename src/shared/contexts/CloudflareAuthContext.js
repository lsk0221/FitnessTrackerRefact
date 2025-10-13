import React, { createContext, useContext } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';

const CloudflareAuthContext = createContext();

export const useCloudflareAuth = () => {
  const context = useContext(CloudflareAuthContext);
  if (!context) {
    throw new Error('useCloudflareAuth must be used within a CloudflareAuthProvider');
  }
  return context;
};

export const CloudflareAuthProvider = ({ children }) => {
  const auth = useAuth();

  return (
    <CloudflareAuthContext.Provider value={auth}>
      {children}
    </CloudflareAuthContext.Provider>
  );
};
