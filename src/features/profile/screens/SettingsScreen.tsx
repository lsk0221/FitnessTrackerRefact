/**
 * Settings Screen
 * 設定畫面
 * 
 * Application settings and user data management
 * 應用程式設定和用戶數據管理
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import { clearAllUserData } from '../../../shared/utils/storage/storage';

/**
 * Settings Screen Component
 * 設定畫面組件
 */
export const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, logout } = useCloudflareAuth();
  const { t } = useTranslation();
  const { showConfirmation, showAlert, renderAlert } = useAppAlert();
  const styles = createStyles(theme);

  /**
   * Handle clear all data button press
   * 處理清除所有數據按鈕點擊
   */
  const handleClearAllData = () => {
    showConfirmation({
      title: t('settings.clearDataTitle') || 'Clear All Data',
      message: t('settings.clearDataMessage') || 'Are you sure you want to delete all local data? This action cannot be undone.',
      confirmText: t('settings.clearDataConfirm') || 'Delete',
      cancelText: t('common.cancel') || 'Cancel',
      confirmStyle: 'destructive',
      onConfirm: async () => {
            try {
              if (!user?.id) {
            showAlert({
              title: t('common.error') || 'Error',
              message: t('settings.noUserError') || 'No user ID found. Cannot clear data.',
            });
                return;
              }

              // Clear all user data
              const success = await clearAllUserData(user.id);
              
              if (success) {
                // Logout after clearing data
                await logout();
            showAlert({
              title: t('settings.clearDataSuccess') || 'Success',
              message: t('settings.clearDataSuccessMessage') || 'All data has been cleared. You have been logged out.',
            });
              } else {
            showAlert({
              title: t('common.error') || 'Error',
              message: t('settings.clearDataError') || 'Failed to clear all data. Please try again.',
            });
              }
            } catch (error) {
              console.error('Error clearing user data:', error);
          showAlert({
            title: t('common.error') || 'Error',
            message: t('settings.clearDataError') || 'Failed to clear all data. Please try again.',
          });
            }
          },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('navigation.settings') || 'Settings'}</Text>
        <Text style={styles.subtitle}>
          {t('settings.subtitle') || 'Manage your app settings and data'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t('settings.dataManagement') || 'Data Management'}
        </Text>
        
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleClearAllData}
        >
          <Text style={styles.dangerButtonText}>
            {t('settings.clearAllData') || 'Clear All My Data'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.dangerButtonDescription}>
          {t('settings.clearDataDescription') || 'This will permanently delete all your local workout data, templates, and custom exercises. You will be logged out after this action.'}
        </Text>
      </View>

      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.accountInfo') || 'Account Information'}
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('settings.userId') || 'User ID'}:
            </Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>
          {user.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('settings.email') || 'Email'}:
              </Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}
        </View>
      )}
      {renderAlert()}
    </ScrollView>
  );
};

/**
 * Create styles based on theme
 * 根據主題創建樣式
 */
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    contentContainer: {
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 16,
    },
    dangerButton: {
      backgroundColor: theme.errorColor || '#FF3B30',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      marginBottom: 12,
    },
    dangerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    dangerButtonDescription: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 16,
      color: theme.textPrimary,
      fontWeight: '400',
    },
  });

