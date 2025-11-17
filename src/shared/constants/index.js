/**
 * 應用程式常量配置
 * Application Constants Configuration
 */

// 時間範圍選項
export const TIME_RANGE_OPTIONS = [
  { label: '最近7天', value: '7d' },
  { label: '最近1個月', value: '1m' },
  { label: '最近3個月', value: '3m' },
  { label: '最近6個月', value: '6m' },
  { label: '今年至今', value: 'ytd' },
  { label: '去年', value: 'ly' },
  { label: '全部', value: 'all' },
];

// 訓練動作映射（使用中文）
export const EXERCISE_MAPPING = {
  'chest': ['臥推', '啞鈴飛鳥', '伏地挺身', '上斜臥推'],
  'back': ['引體向上', '划船', '下拉', '硬舉'],
  'legs': ['深蹲', '弓步', '腿舉', '提踵'],
  'shoulders': ['肩推', '側平舉', '後三角飛鳥'],
  'arms': ['二頭彎舉', '三頭撐體', '錘式彎舉'],
  'core': ['平板支撐', '捲腹', '俄羅斯轉體', '登山者'],
  'cardio': ['跑步', '騎單車', '游泳', '跳繩', '橢圓機', '划船機', '踏步機', 'HIIT']
};

// 存儲鍵名
export const STORAGE_KEYS = {
  WORKOUTS: 'full_workouts',
  TARGET_WEIGHT: 'target_weight',
  TARGET_WEIGHTS: 'target_weights', // 新增：每個訓練動作的目標重量
  CUSTOM_EXERCISES: 'custom_exercises',
  THEME: 'theme_preference',
  SYNC_ENABLED: 'sync_enabled',
  UNIT_PREFERENCE: 'unit_preference', // 新增：單位偏好設定
  LAST_EXERCISE: 'last_exercise' // 最後訓練的動作
};

// 單位配置
export const UNIT_CONFIG = {
  KG: {
    name: 'kg',
    label: '公斤 (kg)',
    conversionFactor: 1 // kg 轉 kg 的轉換係數
  },
  LB: {
    name: 'lb',
    label: '磅 (lb)',
    conversionFactor: 2.2 // kg 轉 lb 的轉換係數 (簡化為 1kg = 2.2lb)
  }
};

// 單位轉換函數
export const convertWeight = (weight, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return weight;
  
  // 先轉換為 kg
  let weightInKg = weight;
  if (fromUnit === 'lb') {
    weightInKg = weight / UNIT_CONFIG.LB.conversionFactor;
  }
  
  // 再轉換為目標單位
  if (toUnit === 'lb') {
    const convertedWeight = weightInKg * UNIT_CONFIG.LB.conversionFactor;
    // lb 顯示小數點後一位
    return parseFloat(convertedWeight.toFixed(1));
  }
  
  // kg 顯示整數
  return Math.round(weightInKg);
};

// 圖表配置
export const CHART_CONFIG = {
  PADDING: { top: 15, right: 1, bottom: 35, left: 1 },
  LABEL_PADDING: 9,
  POINT_RADIUS: 4,
  LINE_WIDTH: 2,
  FONT_SIZE: {
    Y_AXIS: 12,
    X_AXIS: 11
  }
};

// API 配置
export const API_CONFIG = {
  CLOUDFLARE_WORKER_URL: 'https://fitness-tracker-api.your-subdomain.workers.dev',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3
};

// 主題配置
export const THEME_CONFIG = {
  LIGHT: {
    backgroundColor: '#ffffff',
    cardBackground: '#f8f9fa',
    textPrimary: '#212529',
    textSecondary: '#6c757d',
    primaryColor: '#007bff',
    borderColor: '#dee2e6',
    successColor: '#28a745',
    errorColor: '#dc3545',
    warningColor: '#ffc107'
  },
  DARK: {
    backgroundColor: '#1a1a1a',
    cardBackground: '#2d2d2d',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    primaryColor: '#007bff',
    borderColor: '#404040',
    successColor: '#28a745',
    errorColor: '#dc3545',
    warningColor: '#ffc107'
  }
};

// 錯誤訊息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '網路連接失敗，請檢查您的網路設置',
  AUTH_FAILED: '登入失敗，請檢查您的帳戶資訊',
  SYNC_FAILED: '同步失敗，請稍後再試',
  INVALID_INPUT: '輸入格式不正確，請重新輸入',
  STORAGE_ERROR: '數據存儲失敗，請重試'
};

// 成功訊息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登入成功',
  SYNC_SUCCESS: '數據同步成功',
  SAVE_SUCCESS: '數據保存成功',
  DELETE_SUCCESS: '刪除成功'
};
