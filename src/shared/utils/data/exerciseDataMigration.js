/**
 * 訓練動作數據遷移工具
 * Exercise Data Migration Utility
 */

import { findExerciseKeyByChineseName, findExerciseKeyByEnglishName } from '../../data/exerciseMapping';

/**
 * 遷移訓練數據中的訓練動作名稱
 * 將中文名稱轉換為英文鍵值
 * @param {Array} workouts - 原始訓練數據
 * @returns {Array} 遷移後的訓練數據
 */
export const migrateExerciseData = (workouts) => {
  if (!workouts || !Array.isArray(workouts)) {
    return [];
  }

  return workouts.map(workout => {
    const migratedWorkout = { ...workout };
    
    // 遷移訓練動作名稱
    if (workout.exercise) {
      // 嘗試將中文名稱轉換為英文鍵值
      const exerciseKey = findExerciseKeyByChineseName(workout.exercise);
      if (exerciseKey) {
        migratedWorkout.exercise = exerciseKey;
        console.log(`遷移訓練動作: ${workout.exercise} -> ${exerciseKey}`);
      } else {
        // 如果找不到對應的鍵值，檢查是否已經是英文鍵值
        const englishKey = findExerciseKeyByEnglishName(workout.exercise);
        if (!englishKey) {
          // 如果既不是中文名稱也不是英文鍵值，保持原值
          console.warn(`無法遷移訓練動作: ${workout.exercise}`);
        }
      }
    }
    
    return migratedWorkout;
  });
};

/**
 * 檢查是否需要數據遷移
 * @param {Array} workouts - 訓練數據
 * @returns {boolean} 是否需要遷移
 */
export const needsExerciseMigration = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return false;
  }
  
  // 檢查是否有任何訓練記錄的 exercise 是中文名稱
  return workouts.some(workout => {
    if (!workout.exercise) return false;
    
    // 檢查是否是中文名稱（簡單的檢查：包含中文字符）
    const hasChinese = /[\u4e00-\u9fff]/.test(workout.exercise);
    if (hasChinese) {
      // 進一步檢查是否在映射中存在
      const exerciseKey = findExerciseKeyByChineseName(workout.exercise);
      return !!exerciseKey; // 如果找到對應的鍵值，則需要遷移
    }
    
    return false;
  });
};
