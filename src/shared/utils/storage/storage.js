import AsyncStorage from '@react-native-async-storage/async-storage';

// 儲存訓練資料
export const saveWorkout = async (workoutData) => {
  try {
    const existingWorkouts = await AsyncStorage.getItem('workouts');
    const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
    workouts.push(workoutData);
    await AsyncStorage.setItem('workouts', JSON.stringify(workouts));
    return true;
  } catch (error) {
    console.error('儲存訓練資料時發生錯誤:', error);
    return false;
  }
};

// 儲存目標重量
export const saveTargetWeight = async (exercise, targetWeight) => {
  try {
    const existingTargets = await AsyncStorage.getItem('targetWeights');
    const targets = existingTargets ? JSON.parse(existingTargets) : {};
    targets[exercise] = targetWeight;
    await AsyncStorage.setItem('targetWeights', JSON.stringify(targets));
    return true;
  } catch (error) {
    console.error('儲存目標重量時發生錯誤:', error);
    return false;
  }
};

// 讀取目標重量
export const getTargetWeight = async (exercise) => {
  try {
    const existingTargets = await AsyncStorage.getItem('targetWeights');
    const targets = existingTargets ? JSON.parse(existingTargets) : {};
    return targets[exercise] || null;
  } catch (error) {
    console.error('讀取目標重量時發生錯誤:', error);
    return null;
  }
};

// 儲存自訂肌肉群組
export const saveCustomMuscleGroup = async (muscleGroup) => {
  try {
    const existingGroups = await AsyncStorage.getItem('customMuscleGroups');
    const groups = existingGroups ? JSON.parse(existingGroups) : [];
    if (!groups.includes(muscleGroup)) {
      groups.push(muscleGroup);
      await AsyncStorage.setItem('customMuscleGroups', JSON.stringify(groups));
    }
    return true;
  } catch (error) {
    console.error('儲存自訂肌肉群組時發生錯誤:', error);
    return false;
  }
};

// 讀取自訂肌肉群組
export const getCustomMuscleGroups = async () => {
  try {
    const existingGroups = await AsyncStorage.getItem('customMuscleGroups');
    return existingGroups ? JSON.parse(existingGroups) : [];
  } catch (error) {
    console.error('讀取自訂肌肉群組時發生錯誤:', error);
    return [];
  }
};

// 儲存自訂訓練動作
export const saveCustomExercise = async (muscleGroup, exercise) => {
  try {
    const existingExercises = await AsyncStorage.getItem('customExercises');
    const exercises = existingExercises ? JSON.parse(existingExercises) : {};
    if (!exercises[muscleGroup]) {
      exercises[muscleGroup] = [];
    }
    if (!exercises[muscleGroup].includes(exercise)) {
      exercises[muscleGroup].push(exercise);
      await AsyncStorage.setItem('customExercises', JSON.stringify(exercises));
    }
    return true;
  } catch (error) {
    console.error('儲存自訂訓練動作時發生錯誤:', error);
    return false;
  }
};

// 讀取自訂訓練動作
export const getCustomExercises = async (muscleGroup) => {
  try {
    const existingExercises = await AsyncStorage.getItem('customExercises');
    const exercises = existingExercises ? JSON.parse(existingExercises) : {};
    return exercises[muscleGroup] || [];
  } catch (error) {
    console.error('讀取自訂訓練動作時發生錯誤:', error);
    return [];
  }
};

// 取得特定訓練動作的最後一次記錄
export const getLastWorkoutForExercise = async (exercise) => {
  try {
    const allWorkouts = await getAllWorkouts();
    const exerciseWorkouts = allWorkouts
      .filter(workout => workout.exercise === exercise)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return exerciseWorkouts.length > 0 ? exerciseWorkouts[0] : null;
  } catch (error) {
    console.error('讀取最後一次訓練記錄時發生錯誤:', error);
    return null;
  }
};

// 讀取所有訓練資料
export const getAllWorkouts = async () => {
  try {
    const existingWorkouts = await AsyncStorage.getItem('workouts');
    return existingWorkouts ? JSON.parse(existingWorkouts) : [];
  } catch (error) {
    console.error('讀取訓練資料時發生錯誤:', error);
    return [];
  }
};

// 根據訓練動作篩選資料
export const getWorkoutsByExercise = async (exercise) => {
  try {
    const allWorkouts = await getAllWorkouts();
    return allWorkouts.filter(workout => workout.exercise === exercise);
  } catch (error) {
    console.error('篩選訓練資料時發生錯誤:', error);
    return [];
  }
};

// 取得所有可用的訓練動作
export const getAvailableExercises = async () => {
  try {
    const allWorkouts = await getAllWorkouts();
    return [...new Set(allWorkouts.map(workout => workout.exercise))];
  } catch (error) {
    console.error('取得訓練動作清單時發生錯誤:', error);
    return [];
  }
};

// 清除所有資料
export const clearAllWorkouts = async () => {
  try {
    await AsyncStorage.removeItem('workouts');
    return true;
  } catch (error) {
    console.error('清除訓練資料時發生錯誤:', error);
    return false;
  }
};

// 刪除特定訓練記錄
export const deleteWorkout = async (workoutId) => {
  try {
    const allWorkouts = await getAllWorkouts();
    const filteredWorkouts = allWorkouts.filter(workout => workout.id !== workoutId);
    await AsyncStorage.setItem('workouts', JSON.stringify(filteredWorkouts));
    return true;
  } catch (error) {
    console.error('刪除訓練記錄時發生錯誤:', error);
    return false;
  }
};

// 儲存上次的完整訓練數據
export const saveLastSelections = async (muscleGroup, exercise, sets, reps, weight) => {
  try {
    const lastSelections = {
      muscleGroup: muscleGroup || '',
      exercise: exercise || '',
      sets: sets || '',
      reps: reps || '',
      weight: weight || '',
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem('lastSelections', JSON.stringify(lastSelections));
    return true;
  } catch (error) {
    console.error('儲存上次選擇時發生錯誤:', error);
    return false;
  }
};

// 讀取上次的完整訓練數據
export const getLastSelections = async () => {
  try {
    const lastSelections = await AsyncStorage.getItem('lastSelections');
    if (lastSelections) {
      const parsed = JSON.parse(lastSelections);
      // 檢查是否在24小時內，如果是則返回，否則返回空值
      const now = new Date();
      const lastTime = new Date(parsed.timestamp);
      const hoursDiff = (now - lastTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return {
          muscleGroup: parsed.muscleGroup || '',
          exercise: parsed.exercise || '',
          sets: parsed.sets || '',
          reps: parsed.reps || '',
          weight: parsed.weight || ''
        };
      }
    }
    return { 
      muscleGroup: '', 
      exercise: '', 
      sets: '', 
      reps: '', 
      weight: '' 
    };
  } catch (error) {
    console.error('讀取上次選擇時發生錯誤:', error);
    return { 
      muscleGroup: '', 
      exercise: '', 
      sets: '', 
      reps: '', 
      weight: '' 
    };
  }
};

// 儲存最後訓練的動作
export const saveLastExercise = async (muscleGroup, exercise) => {
  try {
    const lastExercise = {
      muscleGroup: muscleGroup || '',
      exercise: exercise || '',
      timestamp: new Date().toISOString()
    };
    await AsyncStorage.setItem('lastExercise', JSON.stringify(lastExercise));
    return true;
  } catch (error) {
    console.error('儲存最後訓練動作時發生錯誤:', error);
    return false;
  }
};

// 讀取最後訓練的動作
export const getLastExercise = async () => {
  try {
    const lastExercise = await AsyncStorage.getItem('lastExercise');
    if (lastExercise) {
      const parsed = JSON.parse(lastExercise);
      // 檢查是否在7天內，如果是則返回，否則返回空值
      const now = new Date();
      const lastTime = new Date(parsed.timestamp);
      const daysDiff = (now - lastTime) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 7) {
        return {
          muscleGroup: parsed.muscleGroup || '',
          exercise: parsed.exercise || ''
        };
      }
    }
    return { muscleGroup: '', exercise: '' };
  } catch (error) {
    console.error('讀取最後訓練動作時發生錯誤:', error);
    return { muscleGroup: '', exercise: '' };
  }
};

/**
 * Clear all user-specific data for a given user ID
 * 清除指定用戶 ID 的所有用戶特定數據
 * 
 * @param {string} userId - The user ID to clear data for
 * @returns {Promise<boolean>} Success status
 */
export const clearAllUserData = async (userId) => {
  try {
    if (!userId) {
      console.warn('clearAllUserData called without userId');
      return false;
    }

    // Get all keys from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Define patterns for user-specific keys
    const userSpecificKeyPatterns = [
      `workouts_${userId}`,
      `@fitness_tracker:user_templates_${userId}`,
      `@fitness_tracker:custom_exercises_${userId}`,
      `target_weights_${userId}`,
      `last_exercise_${userId}`,
      `user_profile_${userId}`,
    ];

    // Find all keys that match user-specific patterns
    const keysToRemove = allKeys.filter(key => {
      // Check if key matches any user-specific pattern
      return userSpecificKeyPatterns.some(pattern => key === pattern) ||
             // Also check for keys that start with the pattern (for nested keys)
             userSpecificKeyPatterns.some(pattern => key.startsWith(pattern));
    });

    // Also clear generic keys that should be reset (non-user-specific but should be cleared)
    const genericKeysToRemove = [
      'user_profile',
      'lastSelections',
      'lastExercise',
    ];

    // Combine all keys to remove
    const allKeysToRemove = [...keysToRemove, ...genericKeysToRemove.filter(key => allKeys.includes(key))];

    if (allKeysToRemove.length === 0) {
      console.log('No user-specific data found to clear');
      return true;
    }

    // Remove all keys in a single batch operation
    await AsyncStorage.multiRemove(allKeysToRemove);
    
    console.log(`Cleared ${allKeysToRemove.length} keys for user ${userId}:`, allKeysToRemove);
    return true;
  } catch (error) {
    console.error('清除用戶數據時發生錯誤:', error);
    return false;
  }
};
