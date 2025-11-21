import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useCloudflareAuth } from '../../shared/contexts/CloudflareAuthContext';
import { useAppAlert } from '../../shared/hooks/useAppAlert';

export const ProfileScreenPlaceholder = () => {
  const { logout, user } = useCloudflareAuth();
  const { t } = useTranslation();
  const { showConfirmation, renderAlert } = useAppAlert();

  const handleLogout = () => {
    showConfirmation({
      title: t('profile.logout') || '登出',
      message: t('profile.confirmLogout') || '確定要登出嗎？',
      confirmText: t('profile.logout') || '登出',
      cancelText: t('common.cancel') || '取消',
      confirmStyle: 'destructive',
      onConfirm: () => logout(),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      <Text style={styles.subtitle}>Feature coming soon...</Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>用戶: {user.displayName || user.email}</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>登出</Text>
      </TouchableOpacity>
      {renderAlert()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  userInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  userText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
