/**
 * App Settings Screen
 * 應用程式設定畫面
 * 
 * System settings and configuration
 * 系統設定和配置
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import { clearAllUserData } from '../../../shared/utils/storage/storage';
import { useSettings } from '../hooks/useSettings';

/**
 * App Settings Screen Component
 * 應用程式設定畫面組件
 */
export const AppSettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useCloudflareAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { showConfirmation, showAlert, renderAlert } = useAppAlert();
  const { state, actions } = useSettings();
  const styles = createStyles(theme);

  /**
   * Handle theme toggle
   * 處理主題切換
   */
  const handleToggleTheme = async () => {
    try {
      await actions.toggleTheme();
    } catch (error) {
      showAlert({
        title: t('common.error') || 'Error',
        message: t('settings.themeToggleError') || 'Failed to toggle theme. Please try again.',
      });
    }
  };

  /**
   * Handle unit toggle
   * 處理單位切換
   */
  const handleToggleUnit = async () => {
    try {
      await actions.toggleUnit();
    } catch (error) {
      showAlert({
        title: t('common.error') || 'Error',
        message: t('settings.unitToggleError') || 'Failed to toggle unit. Please try again.',
      });
    }
  };

  /**
   * Handle logout
   * 處理登出
   */
  const handleLogout = () => {
    showConfirmation({
      title: t('profile.logout') || 'Logout',
      message: t('profile.confirmLogout') || 'Are you sure you want to logout?',
      confirmText: t('profile.logout') || 'Logout',
      cancelText: t('common.cancel') || 'Cancel',
      confirmStyle: 'destructive',
      onConfirm: async () => {
        try {
          await actions.handleLogout();
        } catch (error) {
          showAlert({
            title: t('common.error') || 'Error',
            message: t('profile.logoutError') || 'Failed to logout. Please try again.',
          });
        }
      },
    });
  };

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
            await actions.handleLogout();
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
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t('settings.title') || 'Settings'}
        onBack={() => navigation.goBack()}
        paddingTopOffset={20}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
      >
        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('settings.appSettings') || 'App Settings'}
          </Text>

          {/* Theme Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>
                {t('settings.theme') || 'Theme'}
              </Text>
              <Text style={styles.settingDescription}>
                {state.isDarkMode ? t('settings.darkMode') || 'Dark Mode' : t('settings.lightMode') || 'Light Mode'}
              </Text>
            </View>
            <Switch
              value={state.isDarkMode}
              onValueChange={handleToggleTheme}
              trackColor={{ false: theme.borderColor, true: theme.primaryColor }}
              thumbColor={theme.cardBackground}
            />
          </View>

          {/* Unit Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>
                {t('settings.unit') || 'Weight Unit'}
              </Text>
              <Text style={styles.settingDescription}>
                {state.currentUnit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'}
              </Text>
            </View>
            <Switch
              value={state.currentUnit === 'lb'}
              onValueChange={handleToggleUnit}
              trackColor={{ false: theme.borderColor, true: theme.primaryColor }}
              thumbColor={theme.cardBackground}
            />
          </View>
        </View>

        {/* Data Management Section */}
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

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>
              {t('profile.logout') || 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>
            {t('settings.appVersion') || 'App Version'}: {state.version}
          </Text>
        </View>
      </ScrollView>
      {renderAlert()}
    </SafeAreaView>
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
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
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
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    settingInfo: {
      flex: 1,
      marginRight: 16,
    },
    settingLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    settingDescription: {
      fontSize: 14,
      color: theme.textSecondary,
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
    logoutButton: {
      backgroundColor: theme.errorColor || '#FF3B30',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
    },
    logoutButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    versionSection: {
      marginTop: 20,
      marginBottom: 20,
      alignItems: 'center',
    },
    versionText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
  });


