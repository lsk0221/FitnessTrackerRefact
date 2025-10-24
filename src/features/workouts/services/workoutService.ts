/**
 * Workout Service
 * 訓練記錄服務層 - 處理所有訓練相關的業務邏輯
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, convertWeight } from '../../../shared/constants';
import { generateUniqueId, validateInput } from '../../../shared/utils/helpers';
import { 
  performDataMigration, 
  needsMigration, 
  fixMuscleGroupInconsistency, 
  needsMuscleGroupFix 
} from '../../../shared/services/data/dataMigration';
import { 
  migrateExerciseData, 
  needsExerciseMigration 
} from '../../../shared/utils/data/exerciseDataMigration';
import type { 
  Workout, 
  WorkoutInput, 
  WorkoutUpdate,
  WorkoutServiceResult,
  WorkoutQueryParams 
} from '../types/workout.types';

/**
 * 獲取存儲鍵名（支持多用戶）
 * Get storage key based on user
 */
const getStorageKey = (userId?: string): string => {
  return userId ? `workouts_${userId}` : STORAGE_KEYS.WORKOUTS;
};

/**
 * 載入所有訓練記錄
 * Load all workout records with automatic migration
 */
export const loadWorkouts = async (userId?: string): Promise<WorkoutServiceResult<Workout[]>> => {
  try {
    const dataKey = getStorageKey(userId);
    const stored = await AsyncStorage.getItem(dataKey);
    
    if (!stored) {
      return { success: true, data: [] };
    }
    
    let workouts: Workout[] = JSON.parse(stored);
    
    // Check for data migration needs
    if (needsMigration(workouts)) {
      console.log('檢測到舊格式數據，開始遷移...');
      const migrationSuccess = await performDataMigration(dataKey);
      
      if (migrationSuccess) {
        const migratedStored = await AsyncStorage.getItem(dataKey);
        workouts = migratedStored ? JSON.parse(migratedStored) : [];
        console.log('數據遷移完成');
      } else {
        console.error('數據遷移失敗，使用原始數據');
      }
    } else if (needsExerciseMigration(workouts)) {
      console.log('檢測到訓練動作數據需要遷移...');
      workouts = migrateExerciseData(workouts);
      await AsyncStorage.setItem(dataKey, JSON.stringify(workouts));
      console.log('訓練動作數據遷移完成');
    } else if (needsMuscleGroupFix(workouts)) {
      console.log('檢測到肌肉群格式不一致，開始修復...');
      workouts = fixMuscleGroupInconsistency(workouts);
      await AsyncStorage.setItem(dataKey, JSON.stringify(workouts));
      console.log('肌肉群格式修復完成');
    }
    
    return { success: true, data: workouts };
  } catch (error) {
    console.error('載入訓練記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '載入訓練記錄失敗' 
    };
  }
};

/**
 * 保存新的訓練記錄
 * Save a new workout record
 */
export const saveWorkout = async (
  workoutData: WorkoutInput, 
  userId?: string
): Promise<WorkoutServiceResult<Workout>> => {
  try {
    // Validate input data
    const validation = validateInput(workoutData);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: validation.errors.join(', ') 
      };
    }

    const newWorkout: Workout = {
      id: generateUniqueId(),
      date: workoutData.date || new Date().toISOString(),
      muscleGroup: workoutData.muscleGroup,
      exercise: workoutData.exercise,
      sets: workoutData.sets,
      reps: workoutData.reps,
      weight: workoutData.weight,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const dataKey = getStorageKey(userId);
    
    // Always read the latest data from storage to avoid sync issues
    const stored = await AsyncStorage.getItem(dataKey);
    const currentWorkouts: Workout[] = stored ? JSON.parse(stored) : [];
    const updatedWorkouts = [...currentWorkouts, newWorkout];
    
    await AsyncStorage.setItem(dataKey, JSON.stringify(updatedWorkouts));
    
    return { success: true, data: newWorkout };
  } catch (error) {
    console.error('保存訓練記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '保存訓練記錄失敗' 
    };
  }
};

/**
 * 更新現有訓練記錄
 * Update an existing workout record
 */
export const updateWorkout = async (
  updatedWorkout: WorkoutUpdate, 
  userId?: string
): Promise<WorkoutServiceResult<Workout>> => {
  try {
    if (!updatedWorkout.id) {
      return { success: false, error: '訓練記錄 ID 不能為空' };
    }

    const dataKey = getStorageKey(userId);
    
    // Read the latest data from storage
    const stored = await AsyncStorage.getItem(dataKey);
    const currentWorkouts: Workout[] = stored ? JSON.parse(stored) : [];
    
    const workoutIndex = currentWorkouts.findIndex(w => w.id === updatedWorkout.id);
    if (workoutIndex === -1) {
      return { success: false, error: '找不到要更新的訓練記錄' };
    }

    // Merge the update with existing workout
    const mergedWorkout: Workout = {
      ...currentWorkouts[workoutIndex],
      ...updatedWorkout,
      updatedAt: new Date().toISOString(),
    };

    // Validate the merged workout
    const validation = validateInput(mergedWorkout);
    if (!validation.isValid) {
      return { 
        success: false, 
        error: validation.errors.join(', ') 
      };
    }

    currentWorkouts[workoutIndex] = mergedWorkout;
    
    await AsyncStorage.setItem(dataKey, JSON.stringify(currentWorkouts));
    
    return { success: true, data: mergedWorkout };
  } catch (error) {
    console.error('更新訓練記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '更新訓練記錄失敗' 
    };
  }
};

/**
 * 刪除訓練記錄
 * Delete a workout record
 */
export const deleteWorkout = async (
  workoutId: string, 
  userId?: string
): Promise<WorkoutServiceResult> => {
  try {
    if (!workoutId) {
      return { success: false, error: '訓練記錄 ID 不能為空' };
    }

    const dataKey = getStorageKey(userId);
    
    // Read the latest data from storage
    const stored = await AsyncStorage.getItem(dataKey);
    const currentWorkouts: Workout[] = stored ? JSON.parse(stored) : [];
    
    const updatedWorkouts = currentWorkouts.filter(workout => workout.id !== workoutId);
    
    if (updatedWorkouts.length === currentWorkouts.length) {
      return { success: false, error: '找不到要刪除的訓練記錄' };
    }
    
    await AsyncStorage.setItem(dataKey, JSON.stringify(updatedWorkouts));
    
    return { success: true };
  } catch (error) {
    console.error('刪除訓練記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '刪除訓練記錄失敗' 
    };
  }
};

/**
 * 清除所有訓練記錄
 * Clear all workout records
 */
export const clearAllWorkouts = async (userId?: string): Promise<WorkoutServiceResult> => {
  try {
    const dataKey = getStorageKey(userId);
    await AsyncStorage.removeItem(dataKey);
    
    return { success: true };
  } catch (error) {
    console.error('清除訓練記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '清除訓練記錄失敗' 
    };
  }
};

/**
 * 獲取特定訓練動作的所有記錄
 * Get all workout records for a specific exercise
 */
export const getWorkoutsByExercise = async (
  exercise: string,
  userId?: string
): Promise<WorkoutServiceResult<Workout[]>> => {
  try {
    const result = await loadWorkouts(userId);
    
    if (!result.success || !result.data) {
      return result;
    }

    const filteredWorkouts = result.data
      .filter(workout => 
        workout.exercise === exercise && 
        workout.weight && 
        !isNaN(workout.weight) && 
        workout.weight > 0 &&
        workout.date &&
        !isNaN(new Date(workout.date).getTime())
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { success: true, data: filteredWorkouts };
  } catch (error) {
    console.error('獲取訓練動作記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '獲取訓練動作記錄失敗' 
    };
  }
};

/**
 * 獲取特定訓練動作的最後一次記錄
 * Get the last workout record for a specific exercise
 */
export const getLastWorkoutByExercise = async (
  exercise: string,
  userId?: string
): Promise<WorkoutServiceResult<Workout | null>> => {
  try {
    const result = await getWorkoutsByExercise(exercise, userId);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const lastWorkout = result.data.length > 0 
      ? result.data[result.data.length - 1] 
      : null;

    return { success: true, data: lastWorkout };
  } catch (error) {
    console.error('獲取最後訓練記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '獲取最後訓練記錄失敗' 
    };
  }
};

/**
 * 獲取所有可用的訓練動作列表
 * Get all available exercises
 */
export const getAvailableExercises = async (
  userId?: string
): Promise<WorkoutServiceResult<string[]>> => {
  try {
    const result = await loadWorkouts(userId);
    
    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const exercises = [...new Set(result.data.map(workout => workout.exercise))];
    
    return { success: true, data: exercises };
  } catch (error) {
    console.error('獲取訓練動作列表失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '獲取訓練動作列表失敗' 
    };
  }
};

/**
 * 轉換所有訓練記錄的重量單位
 * Convert all workout records to a new unit
 */
export const convertAllWorkouts = async (
  fromUnit: string,
  toUnit: string,
  userId?: string
): Promise<WorkoutServiceResult> => {
  try {
    if (fromUnit === toUnit) {
      return { success: true };
    }

    const dataKey = getStorageKey(userId);
    const stored = await AsyncStorage.getItem(dataKey);
    
    if (!stored) {
      return { success: true };
    }

    const workouts: Workout[] = JSON.parse(stored);
    const convertedWorkouts = workouts.map(workout => ({
      ...workout,
      weight: convertWeight(workout.weight, fromUnit, toUnit),
      updatedAt: new Date().toISOString(),
    }));
    
    await AsyncStorage.setItem(dataKey, JSON.stringify(convertedWorkouts));
    
    return { success: true };
  } catch (error) {
    console.error('轉換訓練記錄單位失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '轉換單位失敗' 
    };
  }
};

/**
 * 查詢訓練記錄（支持多條件篩選）
 * Query workout records with multiple filters
 */
export const queryWorkouts = async (
  params: WorkoutQueryParams,
  userId?: string
): Promise<WorkoutServiceResult<Workout[]>> => {
  try {
    const result = await loadWorkouts(userId);
    
    if (!result.success || !result.data) {
      return result;
    }

    let filteredWorkouts = result.data;

    // Filter by exercise
    if (params.exercise) {
      filteredWorkouts = filteredWorkouts.filter(w => w.exercise === params.exercise);
    }

    // Filter by muscle group
    if (params.muscleGroup) {
      filteredWorkouts = filteredWorkouts.filter(w => w.muscleGroup === params.muscleGroup);
    }

    // Filter by date range
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      filteredWorkouts = filteredWorkouts.filter(w => new Date(w.date) >= startDate);
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate);
      filteredWorkouts = filteredWorkouts.filter(w => new Date(w.date) <= endDate);
    }

    // Apply limit
    if (params.limit && params.limit > 0) {
      filteredWorkouts = filteredWorkouts.slice(0, params.limit);
    }

    return { success: true, data: filteredWorkouts };
  } catch (error) {
    console.error('查詢訓練記錄失敗:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '查詢訓練記錄失敗' 
    };
  }
};

