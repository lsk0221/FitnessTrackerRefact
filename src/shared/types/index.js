/**
 * 應用程式類型定義
 * Application Type Definitions
 */

import PropTypes from 'prop-types';

// 訓練記錄類型
export const WorkoutType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  date: PropTypes.string.isRequired,
  muscleGroup: PropTypes.string.isRequired,
  exercise: PropTypes.string.isRequired,
  sets: PropTypes.number.isRequired,
  reps: PropTypes.number.isRequired,
  weight: PropTypes.number.isRequired
});

// 圖表數據點類型
export const ChartDataPointType = PropTypes.shape({
  date: PropTypes.string.isRequired,
  weight: PropTypes.number.isRequired
});

// 統計數據類型
export const StatsType = PropTypes.shape({
  total: PropTypes.number.isRequired,
  average: PropTypes.number.isRequired,
  latest: PropTypes.number.isRequired,
  improvement: PropTypes.number.isRequired
});

// 用戶類型
export const UserType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  name: PropTypes.string,
  createdAt: PropTypes.string
});

// 主題類型
export const ThemeType = PropTypes.shape({
  backgroundColor: PropTypes.string.isRequired,
  cardBackground: PropTypes.string.isRequired,
  textPrimary: PropTypes.string.isRequired,
  textSecondary: PropTypes.string.isRequired,
  primaryColor: PropTypes.string.isRequired,
  borderColor: PropTypes.string.isRequired,
  successColor: PropTypes.string.isRequired,
  errorColor: PropTypes.string.isRequired,
  warningColor: PropTypes.string.isRequired
});

// 自定義訓練動作類型
export const CustomExerciseType = PropTypes.shape({
  muscleGroup: PropTypes.string.isRequired,
  exercise: PropTypes.string.isRequired
});

// 時間範圍選項類型
export const TimeRangeOptionType = PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
});

// 導航參數類型
export const NavigationParamsType = PropTypes.shape({
  theme: ThemeType,
  isDarkMode: PropTypes.bool,
  toggleTheme: PropTypes.func
});

// 組件 Props 類型定義
export const ComponentProps = {
  // 圖表組件
  CustomLineChart: {
    data: PropTypes.arrayOf(ChartDataPointType).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    theme: ThemeType.isRequired
  },
  
  // 訓練輸入頁面
  WorkoutInputScreen: {
    theme: ThemeType.isRequired
  },
  
  // 進度圖表頁面
  ProgressChartScreen: {
    theme: ThemeType.isRequired
  },
  
  // 設定頁面
  SettingsScreen: {
    theme: ThemeType.isRequired
  },
  
  // 個人資料頁面
  ProfileScreen: {
    theme: ThemeType.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    toggleTheme: PropTypes.func.isRequired
  },
  
  // 登入頁面
  LoginScreen: {
    theme: ThemeType.isRequired
  }
};

// 導出所有類型
export default {
  WorkoutType,
  ChartDataPointType,
  StatsType,
  UserType,
  ThemeType,
  CustomExerciseType,
  TimeRangeOptionType,
  NavigationParamsType,
  ComponentProps
};
