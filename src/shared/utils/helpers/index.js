/**
 * 工具函數集合
 * Utility Functions Collection
 */

/**
 * 格式化日期為 yyyy/mm/dd 格式
 * Format date to yyyy/mm/dd format
 * @param {string} dateString - ISO 日期字符串
 * @returns {string} 格式化後的日期字符串
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};

/**
 * 計算日期範圍
 * Calculate date range
 * @param {string} timeRange - 時間範圍選項
 * @returns {number} 天數
 */
export const getDateRangeDays = (timeRange) => {
  const timeRangeMap = {
    '7d': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    'ytd': 365,
    'ly': 365,
    'all': Infinity,
  };
  
  return timeRangeMap[timeRange] || Infinity;
};

/**
 * 根據時間範圍篩選數據
 * Filter data by time range
 * @param {Array} data - 原始數據數組
 * @param {string} timeRange - 時間範圍
 * @returns {Array} 篩選後的數據
 */
export const filterDataByTimeRange = (data, timeRange) => {
  if (timeRange === 'all') {
    return data.sort((a, b) => new Date(a.date) - new Date(b.date)); // 按日期升序排序
  }
  
  const days = getDateRangeDays(timeRange);
  if (days === Infinity) {
    return data.sort((a, b) => new Date(a.date) - new Date(b.date)); // 按日期升序排序
  }
  
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  return data
    .filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate && !isNaN(itemDate.getTime());
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // 按日期升序排序
};

/**
 * 計算統計數據
 * Calculate statistics
 * @param {Array} data - 數據數組
 * @returns {Object} 統計數據對象
 */
export const calculateStats = (data) => {
  if (!data || data.length === 0) {
    return {
      total: 0,
      maxWeight: 0,
      latest: 0,
      improvement: 0
    };
  }
  
  const weights = data.map(d => d.weight).filter(w => w > 0 && !isNaN(w));
  
  if (weights.length === 0) {
    return {
      total: 0,
      maxWeight: 0,
      latest: 0,
      improvement: 0
    };
  }
  
  const total = weights.length;
  const maxWeight = Math.max(...weights);
  const latest = weights[weights.length - 1];
  
  let improvement = 0;
  if (weights.length > 1) {
    const firstWeight = weights[0];
    const lastWeight = weights[weights.length - 1];
    improvement = ((lastWeight - firstWeight) / firstWeight) * 100;
  }
  
  return {
    total,
    maxWeight,
    latest,
    improvement: Math.round(improvement * 10) / 10
  };
};

/**
 * 生成唯一 ID
 * Generate unique ID
 * @returns {string} 唯一 ID
 */
export const generateUniqueId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

/**
 * Convert exercise name to translation key
 * 將動作名稱轉換為翻譯鍵
 * @param {string} exerciseName - Raw English exercise name (e.g., "Barbell Bench Press")
 * @returns {string} Translation key (e.g., "exercises.barbell_bench_press")
 */
export const getExerciseTranslationKey = (exerciseName) => {
  if (!exerciseName) return '';
  // If already a translation key, return as is
  if (exerciseName.startsWith('exercises.')) {
    return exerciseName;
  }
  // Convert to snake_case
  const snakeCase = exerciseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `exercises.${snakeCase}`;
};

/**
 * Get color for a main muscle group
 * 獲取主肌肉群的顏色
 * 
 * @param {string} mainMuscleGroup - Main muscle group name (e.g., "Chest", "Arms", "Legs")
 * @param {any} theme - Theme object with textPrimary color
 * @returns {string} Color hex code
 */
export const getMuscleGroupColor = (mainMuscleGroup, theme) => {
  if (!mainMuscleGroup) {
    return '#00BCD4'; // Default cyan
  }

  // Core uses theme-adapted color
  if (mainMuscleGroup.toLowerCase() === 'core') {
    return theme?.textPrimary || '#000000';
  }

  // Complete color map for all MAIN muscle groups
  const colors = {
    'chest': '#00BCD4',        // Cyan
    'shoulders': '#2196F3',    // Blue
    'back': '#FF9800',         // Orange
    'legs': '#9C27B0',         // Purple
    'arms': '#F44336',         // Red
    'cardio': '#795548',       // Brown
    'full body': '#4CAF50',    // Green
    'fullbody': '#4CAF50',     // Alternative format
  };

  const lowerGroup = mainMuscleGroup.toLowerCase();
  return colors[lowerGroup] || '#00BCD4'; // Default cyan
};

/**
 * 驗證輸入數據
 * Validate input data
 * @param {Object} data - 輸入數據
 * @returns {Object} 驗證結果
 */
export const validateInput = (data) => {
  const errors = [];
  
  // Check for muscle group (raw English string)
  // 檢查肌肉群（原始英文字符串）
  if (!data.muscleGroup || (typeof data.muscleGroup === 'string' && data.muscleGroup.trim() === '')) {
    errors.push('肌肉群不能為空');
  }
  
  // Check for exercise (raw English string)
  // 檢查訓練動作（原始英文字符串）
  if (!data.exercise || (typeof data.exercise === 'string' && data.exercise.trim() === '')) {
    errors.push('訓練動作不能為空');
  }
  
  if (!data.sets || data.sets <= 0) {
    errors.push('組數必須大於 0');
  }
  
  if (!data.reps || data.reps <= 0) {
    errors.push('次數必須大於 0');
  }
  
  if (data.weight < 0) {
    errors.push('重量不能為負數');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 深拷貝對象
 * Deep clone object
 * @param {Object} obj - 要拷貝的對象
 * @returns {Object} 深拷貝後的對象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * 防抖函數
 * Debounce function
 * @param {Function} func - 要防抖的函數
 * @param {number} wait - 等待時間（毫秒）
 * @returns {Function} 防抖後的函數
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * 節流函數
 * Throttle function
 * @param {Function} func - 要節流的函數
 * @param {number} limit - 限制時間（毫秒）
 * @returns {Function} 節流後的函數
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
