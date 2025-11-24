/**
 * Edit Profile Screen
 * 編輯個人資料畫面
 * 
 * Screen for editing user profile information
 * 用於編輯用戶個人資料信息的畫面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import { LoadingButton } from '../../../shared/components/ui/LoadingButton';
import { useProfile } from '../hooks/useProfile';

/**
 * Edit Profile Screen Component
 * 編輯個人資料畫面組件
 */
export const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useCloudflareAuth();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { showAlert, renderAlert } = useAppAlert();
  const { state: profileState, actions: profileActions } = useProfile();
  const styles = createStyles(theme);

  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || '');

  // Sync form state with profile data
  useEffect(() => {
    if (profileState.profile?.displayName) {
      setDisplayName(profileState.profile.displayName);
    } else if (user?.displayName || user?.name) {
      setDisplayName(user.displayName || user.name || '');
    }
  }, [profileState.profile, user]);

  /**
   * Handle save profile
   * 處理保存個人資料
   */
  const handleSave = async () => {
    if (!displayName.trim()) {
      showAlert({
        title: t('common.error') || 'Error',
        message: t('profile.nameRequired') || 'Display name is required',
      });
      return;
    }

    // Check if display name has changed
    const currentDisplayName = profileState.profile?.displayName || user?.displayName || user?.name || '';
    if (displayName.trim() === currentDisplayName.trim()) {
      showAlert({
        title: t('common.info') || 'Info',
        message: t('profile.noChanges') || 'No changes to save',
      });
      return;
    }

    try {
      const success = await profileActions.updateProfile({
        displayName: displayName.trim(),
      });

      if (success) {
        showAlert({
          title: t('common.success') || 'Success',
          message: t('profile.updateSuccess') || 'Profile updated successfully',
        });

        // Navigate back after a short delay
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } else {
        showAlert({
          title: t('common.error') || 'Error',
          message: profileState.error || t('profile.updateError') || 'Failed to update profile. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert({
        title: t('common.error') || 'Error',
        message: t('profile.updateError') || 'Failed to update profile. Please try again.',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t('profile.edit') || 'Edit Profile'}
        onBack={() => navigation.goBack()}
        paddingTopOffset={20}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.label}>
            {t('profile.displayName') || 'Display Name'}
          </Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('profile.enterDisplayName') || 'Enter display name'}
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
          />
        </View>

        {user?.email && (
          <View style={styles.section}>
            <Text style={styles.label}>
              {t('profile.email') || 'Email'}
            </Text>
            <Text style={styles.readOnlyValue}>{user.email}</Text>
            <Text style={styles.hint}>
              {t('profile.emailReadOnly') || 'Email cannot be changed'}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <LoadingButton
            title={t('common.save') || 'Save'}
            onPress={handleSave}
            loading={profileState.isLoading}
            variant="primary"
            size="large"
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
    readOnlyValue: {
      fontSize: 16,
      color: theme.textSecondary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.cardBackground || theme.inputBackground,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.borderColor,
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

