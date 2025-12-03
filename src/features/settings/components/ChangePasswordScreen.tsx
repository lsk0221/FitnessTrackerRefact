/**
 * Change Password Screen
 * 修改密碼畫面
 * 
 * Screen for changing user password
 * 用於修改用戶密碼的畫面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import { LoadingButton } from '../../../shared/components/ui/LoadingButton';
import { useProfile } from '../hooks/useProfile';

/**
 * Change Password Screen Component
 * 修改密碼畫面組件
 */
export const ChangePasswordScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { showAlert, renderAlert } = useAppAlert();
  const { state: profileState, actions: profileActions } = useProfile();
  const styles = createStyles(theme);

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Validate password form
   * 驗證密碼表單
   */
  const validateForm = (): string | null => {
    if (!currentPassword.trim()) {
      return t('profile.currentPasswordRequired') || 'Current password is required';
    }

    if (!newPassword.trim()) {
      return t('profile.newPasswordRequired') || 'New password is required';
    }

    if (newPassword.length < 6) {
      return t('profile.passwordTooShort') || 'Password must be at least 6 characters';
    }

    if (newPassword !== confirmPassword) {
      return t('profile.passwordMismatch') || 'New passwords do not match';
    }

    if (currentPassword === newPassword) {
      return t('profile.passwordSame') || 'New password must be different from current password';
    }

    return null;
  };

  /**
   * Handle change password
   * 處理修改密碼
   */
  const handleChangePassword = async () => {
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      showAlert({
        title: t('common.error') || 'Error',
        message: validationError,
      });
      return;
    }

    try {
      const success = await profileActions.changePassword(
        currentPassword.trim(),
        newPassword.trim()
      );

      if (success) {
        showAlert({
          title: t('common.success') || 'Success',
          message: t('profile.passwordChangedSuccess') || 'Password changed successfully',
        });

        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        showAlert({
          title: t('common.error') || 'Error',
          message: profileState.error || t('profile.passwordChangeError') || 'Failed to change password. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert({
        title: t('common.error') || 'Error',
        message: profileState.error || t('profile.passwordChangeError') || 'Failed to change password. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t('profile.changePassword') || 'Change Password'}
        onBack={() => navigation.goBack()}
        paddingTopOffset={20}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('profile.currentPassword') || 'Current Password'}
          </Text>
          <TextInput
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t('profile.enterCurrentPassword') || 'Enter current password'}
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('profile.newPassword') || 'New Password'}
          </Text>
          <TextInput
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('profile.enterNewPassword') || 'Enter new password'}
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoCapitalize="none"
          />
          <Text style={styles.hint}>
            {t('profile.passwordHint') || 'Password must be at least 6 characters'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            {t('profile.confirmPassword') || 'Confirm New Password'}
          </Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('profile.enterConfirmPassword') || 'Confirm new password'}
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <View style={styles.buttonContainer}>
          <LoadingButton
            title={t('profile.changePassword') || 'Change Password'}
            onPress={handleChangePassword}
            loading={profileState.isLoading}
            variant="primary"
            size="large"
            fullWidth
            loadingText={t('profile.changingPassword') || 'Changing Password...'}
          />
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
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.cardBackground || theme.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.borderColor,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.textPrimary,
    },
    hint: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
      paddingHorizontal: 4,
    },
    buttonContainer: {
      marginTop: 20,
      marginBottom: 20,
    },
  });


