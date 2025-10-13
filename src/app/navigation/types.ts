/**
 * Navigation Types
 * 導航型別定義
 * 
 * Provides type safety for React Navigation routes and parameters
 * 為 React Navigation 路由和參數提供型別安全
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack Navigator Types
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Tab Navigator Types
export type MainTabParamList = {
  WorkoutStack: NavigatorScreenParams<WorkoutStackParamList>;
  ProgressChart: undefined;
  History: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Workout Stack Navigator Types
export type WorkoutStackParamList = {
  Templates: undefined;
  TemplateEditor: {
    templateId?: string;
    mode: 'create' | 'edit';
  };
  WorkoutLobby: {
    templateId: string;
    templateName: string;
  };
  LiveMode: {
    workoutId: string;
    templateId: string;
  };
  QuickLog: undefined;
};

// Screen Props Types
export type ScreenProps<T extends keyof RootStackParamList> = {
  navigation: any;
  route: {
    params: RootStackParamList[T];
  };
};

// Navigation Hook Types
export type NavigationProp<T extends keyof RootStackParamList> = {
  navigate: (screen: T, params?: RootStackParamList[T]) => void;
  goBack: () => void;
  reset: (state: any) => void;
};

// Route Parameter Types
export type LoginScreenProps = ScreenProps<'Auth'>;
export type TemplateEditorProps = ScreenProps<'WorkoutStack'> & {
  route: {
    params: WorkoutStackParamList['TemplateEditor'];
  };
};
export type LiveModeProps = ScreenProps<'WorkoutStack'> & {
  route: {
    params: WorkoutStackParamList['LiveMode'];
  };
};

// Navigation State Types
export type NavigationState = {
  index: number;
  routes: Array<{
    key: string;
    name: string;
    params?: any;
  }>;
};

// Deep Linking Types
export type DeepLinkParams = {
  screen: string;
  params?: Record<string, any>;
};

// Navigation Events Types
export type NavigationEvent = {
  type: 'focus' | 'blur' | 'beforeRemove';
  target: string;
  data?: any;
};
