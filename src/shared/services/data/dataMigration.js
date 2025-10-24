/**
 * 數據遷移工具
 * Data Migration Utility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';

// 舊格式到新格式的映射
const MUSCLE_GROUP_MAPPING = {
  // 英文格式
  'Chest': 'chest',
  'Back': 'back',
  'Legs': 'legs',
  'Shoulders': 'shoulders',
  'Arms': 'arms',
  'Core': 'core',
  'Cardio': 'cardio',
  // 中文格式
  '胸部': 'chest',
  '背部': 'back',
  '腿部': 'legs',
  '肩部': 'shoulders',
  '手臂': 'arms',
  '核心': 'core',
  '有氧': 'cardio'
};

const EXERCISE_MAPPING = {
  // Chest exercises
  'Bench Press': '臥推',
  'Dumbbell Press': '啞鈴臥推',
  'Incline Bench Press': '上斜臥推',
  'Dumbbell Flyes': '啞鈴飛鳥',
  'Push-ups': '伏地挺身',
  'Chest Dips': '胸部撐體',
  'Cable Crossover': '纜繩交叉',
  'Decline Bench Press': '下斜臥推',
  
  // Back exercises
  'Pull-ups': '引體向上',
  'Lat Pulldown': '下拉',
  'Bent-over Row': '俯身划船',
  'Deadlift': '硬舉',
  'T-Bar Row': 'T槓划船',
  'Seated Cable Row': '坐姿划船',
  'One-arm Dumbbell Row': '單臂啞鈴划船',
  'Face Pulls': '面拉',
  'Rows': '划船',
  
  // Legs exercises
  'Squats': '深蹲',
  'Deadlifts': '硬舉',
  'Lunges': '弓步',
  'Leg Press': '腿舉',
  'Leg Curls': '腿彎舉',
  'Leg Extensions': '腿伸展',
  'Calf Raises': '提踵',
  'Bulgarian Split Squats': '保加利亞分腿蹲',
  
  // Shoulders exercises
  'Overhead Press': '肩推',
  'Shoulder Press': '肩推',
  'Lateral Raises': '側平舉',
  'Front Raises': '前平舉',
  'Rear Delt Flyes': '後三角飛鳥',
  'Arnold Press': '阿諾德推舉',
  'Upright Row': '直立划船',
  'Shrugs': '聳肩',
  
  // Arms exercises
  'Bicep Curls': '二頭彎舉',
  'Tricep Dips': '三頭撐體',
  'Hammer Curls': '錘式彎舉',
  'Tricep Pushdowns': '三頭下壓',
  'Preacher Curls': '牧師椅彎舉',
  'Close-grip Bench Press': '窄握臥推',
  'Cable Curls': '纜繩彎舉',
  'Overhead Tricep Extension': '過頭三頭伸展',
  
  // Core exercises
  'Plank': '平板支撐',
  'Crunches': '捲腹',
  'Russian Twists': '俄羅斯轉體',
  'Mountain Climbers': '登山者',
  'Dead Bug': '死蟲式',
  'Bicycle Crunches': '自行車捲腹',
  'Leg Raises': '抬腿',
  'Wood Chops': '伐木式',
  
  // Cardio exercises
  '跑步': '跑步',
  '騎單車': '騎單車',
  '游泳': '游泳',
  '跳繩': '跳繩',
  '橢圓機': '橢圓機',
  '划船機': '划船機',
  '踏步機': '踏步機',
  'HIIT': 'HIIT'
};

/**
 * 遷移訓練數據
 * @param {Array} workouts - 原始訓練數據
 * @returns {Array} 遷移後的訓練數據
 */
export const migrateWorkoutData = (workouts) => {
  if (!workouts || !Array.isArray(workouts)) {
    return [];
  }

  return workouts.map(workout => {
    const migratedWorkout = { ...workout };
    
    // 遷移肌肉群名稱
    if (workout.muscleGroup && MUSCLE_GROUP_MAPPING[workout.muscleGroup]) {
      migratedWorkout.muscleGroup = MUSCLE_GROUP_MAPPING[workout.muscleGroup];
    }
    
    // 遷移訓練動作名稱
    if (workout.exercise && EXERCISE_MAPPING[workout.exercise]) {
      migratedWorkout.exercise = EXERCISE_MAPPING[workout.exercise];
    }
    
    return migratedWorkout;
  });
};

/**
 * 檢查是否需要數據遷移
 * @param {Array} workouts - 訓練數據
 * @returns {boolean} 是否需要遷移
 */
export const needsMigration = (workouts) => {
  if (!workouts || !Array.isArray(workouts)) {
    return false;
  }

  return workouts.some(workout => {
    // 檢查是否有舊格式的肌肉群名稱
    const hasOldMuscleGroup = workout.muscleGroup && 
      Object.keys(MUSCLE_GROUP_MAPPING).includes(workout.muscleGroup);
    
    // 檢查是否有舊格式的訓練動作名稱
    const hasOldExercise = workout.exercise && 
      Object.keys(EXERCISE_MAPPING).includes(workout.exercise);
    
    return hasOldMuscleGroup || hasOldExercise;
  });
};

/**
 * 執行數據遷移
 * @param {string} storageKey - 存儲鍵名
 * @returns {Promise<boolean>} 遷移是否成功
 */
export const performDataMigration = async (storageKey) => {
  try {
    console.log('開始數據遷移...');
    
    // 讀取現有數據
    const stored = await AsyncStorage.getItem(storageKey);
    if (!stored) {
      console.log('沒有找到需要遷移的數據');
      return true;
    }

    const workouts = JSON.parse(stored);
    console.log(`找到 ${workouts.length} 條訓練記錄`);

    // 檢查是否需要遷移
    if (!needsMigration(workouts)) {
      console.log('數據已經是正確格式，無需遷移');
      return true;
    }

    // 執行遷移
    const migratedWorkouts = migrateWorkoutData(workouts);
    console.log('數據遷移完成');

    // 保存遷移後的數據
    await AsyncStorage.setItem(storageKey, JSON.stringify(migratedWorkouts));
    console.log('遷移後的數據已保存');

    return true;
  } catch (error) {
    console.error('數據遷移失敗:', error);
    return false;
  }
};

/**
 * 檢查並修復肌肉群格式不一致的問題
 * @param {Array} workouts - 訓練數據
 * @returns {Array} 修復後的訓練數據
 */
export const fixMuscleGroupInconsistency = (workouts) => {
  if (!workouts || !Array.isArray(workouts)) {
    return [];
  }

  return workouts.map(workout => {
    const fixedWorkout = { ...workout };
    
    // 修復肌肉群格式
    if (workout.muscleGroup && MUSCLE_GROUP_MAPPING[workout.muscleGroup]) {
      fixedWorkout.muscleGroup = MUSCLE_GROUP_MAPPING[workout.muscleGroup];
      console.log(`修復肌肉群: ${workout.muscleGroup} -> ${fixedWorkout.muscleGroup}`);
    }
    
    return fixedWorkout;
  });
};

/**
 * 檢查是否需要修復肌肉群格式不一致
 * @param {Array} workouts - 訓練數據
 * @returns {boolean} 是否需要修復
 */
export const needsMuscleGroupFix = (workouts) => {
  if (!workouts || !Array.isArray(workouts)) {
    return false;
  }

  return workouts.some(workout => {
    return workout.muscleGroup && MUSCLE_GROUP_MAPPING[workout.muscleGroup];
  });
};

/**
 * 遷移所有用戶的訓練數據
 * @returns {Promise<boolean>} 遷移是否成功
 */
export const migrateAllUserData = async () => {
  try {
    console.log('開始遷移所有用戶數據...');
    
    // 遷移默認用戶數據
    const defaultSuccess = await performDataMigration(STORAGE_KEYS.WORKOUTS);
    
    // 遷移已登入用戶數據（如果有的話）
    // 這裡可以添加更多用戶數據的遷移邏輯
    
    console.log('所有用戶數據遷移完成');
    return defaultSuccess;
  } catch (error) {
    console.error('遷移所有用戶數據失敗:', error);
    return false;
  }
};
