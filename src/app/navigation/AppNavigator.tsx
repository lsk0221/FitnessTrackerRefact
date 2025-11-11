/**
 * Main Application Navigator
 * 主應用程式導航器
 * 
 * This file contains the main navigation structure for the application
 * 此文件包含應用程式的主要導航結構
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

// Shared components - 共享組件
import { WorkoutIcon, ProgressIcon, ProfileIcon, SettingsIcon, HistoryIcon } from '../../shared/components/navigation/TabIcons';
import { useTheme } from '../../shared/contexts/ThemeContext'; // 主題上下文
import { useCloudflareAuth } from '../../shared/contexts/CloudflareAuthContext'; // 認證上下文

// Screen imports (temporary placeholders - will be replaced with actual features)
// 畫面導入（臨時佔位符 - 將被實際功能取代）
import { WorkoutLobbyScreenPlaceholder } from '../../screens/placeholders/WorkoutLobbyScreenPlaceholder';
import { LiveModeScreenPlaceholder } from '../../screens/placeholders/LiveModeScreenPlaceholder';
import { QuickLogScreenPlaceholder } from '../../screens/placeholders/QuickLogScreenPlaceholder';
import { ProfileScreenPlaceholder } from '../../screens/placeholders/ProfileScreenPlaceholder';
import { SettingsScreenPlaceholder } from '../../screens/placeholders/SettingsScreenPlaceholder';

// Real Feature Screens - 真實功能畫面
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import HistoryScreen from '../../features/workouts/screens/HistoryScreen';
import { TemplatesScreen, TemplateEditorScreen } from '../../features/templates';
import ProgressChartScreen from '../../features/progress/screens/ProgressChartScreen';

// Create navigators - 創建導航器
const Tab = createBottomTabNavigator(); // 底部標籤導航器
const Stack = createStackNavigator(); // 堆疊導航器

/**
 * Workout Flow Stack Navigator
 * 訓練流程堆疊導航器
 * 
 * Handles navigation for all workout-related screens
 * 處理訓練相關的所有畫面導航
 */
const WorkoutStack = () => {
  const { theme } = useTheme();
  
  return (
    // @ts-ignore - React Navigation v7 type compatibility issue with React 19
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TemplatesMain" component={TemplatesScreen} />
      <Stack.Screen name="TemplateEditor" component={TemplateEditorScreen} />
      <Stack.Screen name="WorkoutLobby" component={WorkoutLobbyScreenPlaceholder} />
      <Stack.Screen name="LiveWorkout" component={LiveModeScreenPlaceholder} />
      <Stack.Screen name="QuickLogWorkout" component={QuickLogScreenPlaceholder} />
    </Stack.Navigator>
  );
};

/**
 * Main Application Component
 * 主應用程式組件
 * 
 * Contains bottom tab navigation with main features:
 * 包含底部標籤導航，提供主要功能：
 * 1. Record Workout - Input training data
 * 2. View Progress - Display progress charts
 * 3. Profile - User information and settings
 * 4. Settings - Application settings
 */
const MainApp = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();
  
  return (
    // @ts-ignore - React Navigation v7 type compatibility issue with React 19
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.cardBackground,
          borderTopColor: theme.borderColor,
        },
        tabBarActiveTintColor: theme.primaryColor,
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tab.Screen 
        name="WorkoutStack" 
        component={WorkoutStack}
        options={{
          title: t('navigation.workout'),
          tabBarIcon: ({ color }) => (
            <WorkoutIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProgressChart" 
        component={ProgressChartScreen}
        options={{
          title: t('navigation.progress'),
          tabBarIcon: ({ color }) => (
            <ProgressIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{
          title: t('navigation.history'),
          tabBarIcon: ({ color }) => (
            <HistoryIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreenPlaceholder}
        options={{
          title: t('navigation.profile'),
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreenPlaceholder}
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color }) => (
            <SettingsIcon color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Authentication Navigator
 * 認證導航器
 * 
 * Handles user login and registration flow
 * 處理用戶登入和註冊流程
 */
const AuthNavigator = () => {
  const { theme } = useTheme();
  
  return (
    // @ts-ignore - React Navigation v7 type compatibility issue with React 19
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} theme={theme || {}} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

/**
 * Application Content Component
 * 應用程式內容組件
 * 
 * Determines whether to show main app or login screen based on user authentication state
 * 根據用戶認證狀態決定顯示主應用程式還是登入頁面
 */
const AppContent = () => {
  const { user } = useCloudflareAuth();
  
  // Debug: Log user state changes
  console.log('AppContent - user state:', user ? 'logged in' : 'not logged in');

  // If user is logged in, show main application
  // 如果用戶已登入，顯示主應用程式
  if (user) {
    console.log('AppContent - showing MainApp');
    return <MainApp />;
  }
  
  // Otherwise show login screen
  // 否則顯示登入頁面
  console.log('AppContent - showing AuthNavigator');
  return <AuthNavigator />;
};

/**
 * Main App Navigator
 * 主應用程式導航器
 * 
 * This is the main navigation component that wraps the entire app
 * 這是包裝整個應用程式的主要導航組件
 */
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppContent />
    </NavigationContainer>
  );
}
