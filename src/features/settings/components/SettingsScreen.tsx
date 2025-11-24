/**
 * Profile Screen (SettingsScreen)
 * 個人資料畫面
 * 
 * User profile information display
 * 用戶個人資料信息顯示
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import { useSettings } from '../hooks/useSettings';
import { useProfile } from '../hooks/useProfile';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Profile Screen Component
 * 個人資料畫面組件
 */
export const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { state } = useSettings();
  const { state: profileState } = useProfile();
  const styles = createStyles(theme);

  /**
   * Format volume for display
   * 格式化重量顯示
   */
  const formatVolume = (volume: number): string => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`;
    }
    return Math.round(volume).toString();
  };

  /**
   * Navigate to App Settings
   * 導航到應用程式設定
   */
  const handleNavigateToSettings = () => {
    navigation.navigate('AppSettings' as never);
  };

  /**
   * Navigate to Edit Profile
   * 導航到編輯個人資料
   */
  const handleNavigateToEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  /**
   * Navigate to Change Password
   * 導航到修改密碼
   */
  const handleNavigateToChangePassword = () => {
    navigation.navigate('ChangePassword' as never);
  };

  // Settings icon button for header
  const settingsIconButton = (
    <TouchableOpacity
      style={styles.settingsIconButton}
      onPress={handleNavigateToSettings}
    >
      <MaterialCommunityIcons 
        name="cog" 
        size={24} 
        color={theme.primaryColor} 
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t('profile.title') || t('navigation.profile') || 'Profile'}
        subtitle={t('profile.subtitle') || 'Your profile information'}
        rightComponent={settingsIconButton}
        paddingTopOffset={20}
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.contentContainer}
      >
        {state.user && (
          <>
            {/* Avatar Section */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                {state.user.displayName ? (
                  <Text style={styles.avatarText}>
                    {state.user.displayName.charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <MaterialCommunityIcons 
                    name="account" 
                    size={50} 
                    color={theme.primaryColor} 
                  />
                )}
              </View>
            </View>

            {/* Career Stats Section */}
            <View style={styles.statsContainer}>
              {/* Streak Card */}
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statValue}>{profileState.stats.currentStreak}</Text>
                <Text style={styles.statLabel}>
                  {t('profile.streak') || 'Streak'}
                </Text>
              </View>

              {/* Workouts Card */}
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🏋️</Text>
                <Text style={styles.statValue}>{profileState.stats.totalWorkouts}</Text>
                <Text style={styles.statLabel}>
                  {t('profile.totalWorkouts') || 'Workouts'}
                </Text>
              </View>

              {/* Volume Card */}
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>⚖️</Text>
                <Text style={styles.statValue}>
                  {formatVolume(profileState.stats.totalVolume)}
                </Text>
                <Text style={styles.statLabel}>
                  {t('profile.totalVolume') || 'Volume'}
                </Text>
              </View>
            </View>

            {/* Level Progress Section */}
            <View style={styles.levelCard}>
              <View style={styles.levelHeader}>
                <Text style={styles.levelTitle}>
                  {t('profile.level') || 'Level'} {profileState.stats.level}
                </Text>
                <Text style={styles.levelSubtitle}>
                  {profileState.stats.levelTitle}
                </Text>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${profileState.stats.nextLevelProgress}%` }
                  ]} 
                />
              </View>
              
              <Text style={styles.progressText}>
                {Math.round(profileState.stats.nextLevelProgress)}% {t('profile.toNextLevel') || 'to next level'}
              </Text>
            </View>

            {/* Info Card Section */}
            <View style={styles.infoCard}>
              {state.user.displayName && (
                <Text style={styles.displayName}>
                  {state.user.displayName}
                </Text>
              )}
              
              {state.user.email && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>
                    {t('settings.email') || 'Email'}
                  </Text>
                  <Text style={styles.infoValue}>{state.user.email}</Text>
                </View>
              )}
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>
                  {t('settings.userId') || 'User ID'}
                </Text>
                <Text style={styles.infoValue}>{state.user.id}</Text>
              </View>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleNavigateToEditProfile}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="account-edit" 
                size={22} 
                color={theme.primaryColor} 
              />
              <Text style={styles.editProfileButtonText}>
                {t('profile.edit') || 'Edit Profile'}
              </Text>
            </TouchableOpacity>

            {/* Change Password Button */}
            <TouchableOpacity
              style={styles.changePasswordButton}
              onPress={handleNavigateToChangePassword}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="lock-reset" 
                size={22} 
                color={theme.primaryColor} 
              />
              <Text style={styles.changePasswordButtonText}>
                {t('profile.changePassword') || 'Change Password'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
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
      paddingBottom: 20,
    },
    avatarContainer: {
      alignItems: 'center',
      marginTop: 30,
      marginBottom: 20,
    },
    avatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.primaryColor + '10',
      borderWidth: 3,
      borderColor: theme.primaryColor,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    avatarText: {
      fontSize: 42,
      fontWeight: 'bold',
      color: theme.primaryColor,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: theme.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    statEmoji: {
      fontSize: 28,
      marginBottom: 8,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    levelCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    levelHeader: {
      marginBottom: 16,
    },
    levelTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.primaryColor,
      marginBottom: 4,
    },
    levelSubtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: theme.borderColor,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.primaryColor,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    infoCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    displayName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 16,
    },
    infoItem: {
      marginBottom: 16,
    },
    infoLabel: {
      fontSize: 12,
      color: theme.primaryColor,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    infoValue: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '400',
    },
    settingsIconButton: {
      padding: 4,
    },
    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 20,
      marginHorizontal: 20,
      marginTop: 20,
      borderWidth: 1,
      borderColor: theme.primaryColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    editProfileButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primaryColor,
      marginLeft: 8,
    },
    changePasswordButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      paddingVertical: 15,
      paddingHorizontal: 20,
      marginHorizontal: 20,
      marginTop: 12,
      borderWidth: 1,
      borderColor: theme.primaryColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    changePasswordButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primaryColor,
      marginLeft: 8,
    },
  });

