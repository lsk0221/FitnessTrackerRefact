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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import { useSettings } from '../hooks/useSettings';
import { useProfile } from '../hooks/useProfile';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
// @ts-ignore - Expo linear gradient types
import { LinearGradient } from 'expo-linear-gradient';

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
   * Format weight for display
   * 格式化重量顯示
   */
  const formatWeight = (weight: number): string => {
    if (weight === 0) return '-';
    return Math.round(weight).toString();
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
            {/* Identity Card - Player Info */}
            <LinearGradient
              colors={[theme.primaryColor, theme.primaryColor + 'CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.identityCard}
            >
              <View style={styles.identityHeader}>
                {/* Left: Avatar */}
                <View style={styles.identityAvatar}>
                  {state.user.displayName ? (
                    <Text style={styles.identityAvatarText}>
                      {state.user.displayName.charAt(0).toUpperCase()}
                    </Text>
                  ) : (
                    <MaterialCommunityIcons 
                      name="account" 
                      size={40} 
                      color="#FFFFFF" 
                    />
                  )}
                </View>

                {/* Middle: Name & Level */}
                <View style={styles.identityInfo}>
                  <Text style={styles.identityName}>
                    {state.user.displayName || t('profile.user') || 'User'}
                  </Text>
                  <View style={styles.identityLevelBadge}>
                    <Text style={styles.identityLevelText}>
                      Lv.{profileState.stats.level}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Key Stats Row */}
              <View style={styles.identityStats}>
                <View style={styles.identityStatItem}>
                  <MaterialCommunityIcons 
                    name="fire" 
                    size={24} 
                    color={theme.warningColor || '#FF9500'} 
                    style={styles.identityStatIcon}
                  />
                  <Text style={styles.identityStatValue}>
                    {profileState.stats.streak}
                  </Text>
                  <Text style={styles.identityStatLabel}>
                    {t('profile.streak') || 'Streak'}
                  </Text>
                </View>
                
                <View style={styles.identityStatItem}>
                  <MaterialCommunityIcons 
                    name="calendar-check" 
                    size={24} 
                    color="#30B0C7" 
                    style={styles.identityStatIcon}
                  />
                  <Text style={styles.identityStatValue}>
                    {profileState.stats.totalActiveDays}
                  </Text>
                  <Text style={styles.identityStatLabel}>
                    {t('profile.activeDays') || 'Active Days'}
                  </Text>
                </View>
                
                <View style={styles.identityStatItem}>
                  <MaterialCommunityIcons 
                    name="dumbbell" 
                    size={24} 
                    color="#AF52DE" 
                    style={styles.identityStatIcon}
                  />
                  <Text style={styles.identityStatValue}>
                    {profileState.stats.totalWorkouts}
                  </Text>
                  <Text style={styles.identityStatLabel}>
                    {t('profile.totalWorkouts') || 'Workouts'}
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* The Big 3 - Powerlifting Panel */}
            <View style={styles.big3Card}>
              <Text style={styles.big3Title}>
                {t('profile.powerliftingTotal') || 'SBD TOTAL'}
              </Text>
              <Text style={styles.big3Total}>
                {formatWeight(profileState.stats.big3.total)} {profileState.stats.big3.total > 0 ? 'kg' : ''}
              </Text>
              
              <View style={styles.big3Details}>
                <View style={styles.big3Item}>
                  <MaterialCommunityIcons 
                    name="weight-lifter" 
                    size={28} 
                    color={theme.primaryColor} 
                    style={styles.big3Icon}
                  />
                  <Text style={styles.big3Label}>
                    {t('profile.squat') || 'Squat'}
                  </Text>
                  <Text style={styles.big3Value}>
                    {formatWeight(profileState.stats.big3.squat)} {profileState.stats.big3.squat > 0 ? 'kg' : (t('profile.notRecorded') || '尚未紀錄')}
                  </Text>
                </View>
                
                <View style={styles.big3Item}>
                  <MaterialCommunityIcons 
                    name="dumbbell" 
                    size={28} 
                    color={theme.primaryColor} 
                    style={styles.big3Icon}
                  />
                  <Text style={styles.big3Label}>
                    {t('profile.bench') || 'Bench'}
                  </Text>
                  <Text style={styles.big3Value}>
                    {formatWeight(profileState.stats.big3.bench)} {profileState.stats.big3.bench > 0 ? 'kg' : (t('profile.notRecorded') || '尚未紀錄')}
                  </Text>
                </View>
                
                <View style={styles.big3Item}>
                  <MaterialCommunityIcons 
                    name="arrow-up-bold-circle-outline" 
                    size={28} 
                    color={theme.primaryColor} 
                    style={styles.big3Icon}
                  />
                  <Text style={styles.big3Label}>
                    {t('profile.deadlift') || 'Deadlift'}
                  </Text>
                  <Text style={styles.big3Value}>
                    {formatWeight(profileState.stats.big3.deadlift)} {profileState.stats.big3.deadlift > 0 ? 'kg' : (t('profile.notRecorded') || '尚未紀錄')}
                  </Text>
                </View>
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
    // Identity Card Styles
    identityCard: {
      marginHorizontal: 20,
      marginTop: 20,
      borderRadius: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    identityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
    },
    identityAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#FFFFFF',
    },
    identityAvatarText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    identityInfo: {
      flex: 1,
      marginLeft: 16,
    },
    identityName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 8,
    },
    identityLevelBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    identityLevelText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    identityStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    identityStatItem: {
      alignItems: 'center',
      flex: 1,
    },
    identityStatIcon: {
      marginBottom: 8,
    },
    identityStatValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    identityStatLabel: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '500',
    },
    // Big 3 Power Stats Styles
    big3Card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 20,
      marginTop: 20,
      borderWidth: 2,
      borderColor: theme.primaryColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    big3Title: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    big3Total: {
      fontSize: 56,
      fontWeight: '900',
      color: theme.primaryColor,
      textAlign: 'center',
      marginBottom: 24,
      letterSpacing: -1,
    },
    big3Details: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    big3Item: {
      alignItems: 'center',
      flex: 1,
    },
    big3Icon: {
      marginBottom: 8,
    },
    big3Label: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    big3Value: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      textAlign: 'center',
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

