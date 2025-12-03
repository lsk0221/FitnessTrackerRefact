/**
 * Live Workout Service
 * 即時訓練服務層 - 處理所有即時訓練相關的業務邏輯
 */

import { saveMultipleWorkouts } from '../../workouts/services/workoutService';
import { getAllExercises, getExercisesByMuscleGroup, searchExercises } from '../../../shared/services/data/exerciseLibraryService';
import type { 
  WorkoutSessionData, 
  CompletedExercise, 
  ExerciseEntry,
  SmartSwapSuggestion,
  LiveWorkoutServiceResult 
} from '../types/liveWorkout.types';
import type { WorkoutInput } from '../../workouts/types/workout.types';

/**
 * Calculate average of numbers
 * 計算數字平均值
 */
const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return sum / numbers.length;
};

/**
 * Finish workout and save all completed exercises as workout records
 * 完成訓練並將所有完成的動作保存為訓練記錄
 * 
 * Each CompletedExercise (e.g., "Bench Press, 3 sets") is saved as ONE Workout record
 * 每個完成的動作（例如「臥推，3組」）保存為一條訓練記錄
 */
export const finishWorkout = async (
  sessionData: WorkoutSessionData,
  userId?: string
): Promise<LiveWorkoutServiceResult> => {
  try {
    const { exercises, startTime } = sessionData;
    
    // Aggregate each completed exercise into a single workout record
    // 將每個完成的動作聚合為一條訓練記錄
    const workoutInputs: WorkoutInput[] = exercises.map(completedExercise => {
      // Filter only completed sets
      // 只計算已完成的組數
      const completedSets = completedExercise.sets.filter(set => set.completed);
      
      if (completedSets.length === 0) {
        // Skip exercises with no completed sets
        // 跳過沒有完成組數的動作
        return null;
      }
      
      // Calculate aggregated values
      // 計算聚合值
      const reps = calculateAverage(completedSets.map(set => set.reps));
      const weight = calculateAverage(completedSets.map(set => set.weight));
      
      // Extract raw English strings (no translation keys)
      // 提取原始英文字符串（不使用翻譯鍵）
      // Get exercise name - use exercise field
      // 獲取動作名稱 - 使用 exercise 字段
      const exerciseName = completedExercise.exercise || '';
      
      // Get muscle group - use raw string directly
      // 獲取肌肉群 - 直接使用原始字符串
      const muscleGroupName = completedExercise.muscleGroup || '';
      
      const workoutInput: WorkoutInput = {
        date: startTime.toISOString(),
        muscleGroup: muscleGroupName, // Raw English string (e.g., "Back", "Chest")
        exercise: exerciseName, // Raw English string (e.g., "Pull-ups", "Bench Press")
        sets: completedSets.length, // Total number of completed sets
        reps: Math.round(reps), // Round to nearest integer
        weight: Math.round(weight * 100) / 100, // Round to 2 decimal places
      };
      
      return workoutInput;
    }).filter((input): input is WorkoutInput => input !== null);

    // Save all workouts in a single batch operation
    // 一次性批量保存所有訓練記錄
    const result = await saveMultipleWorkouts(workoutInputs, userId);
    
    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to save workout records',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Finish workout failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to finish workout',
    };
  }
};

/**
 * Get smart swap suggestions for an exercise
 * 獲取動作的智能替換建議
 */
export const getSmartSwapSuggestions = async (
  currentExercise: ExerciseEntry,
  limit: number = 5
): Promise<LiveWorkoutServiceResult<SmartSwapSuggestion[]>> => {
  try {
    const allExercisesResult = await getAllExercises();
    
    if (!allExercisesResult.success || !allExercisesResult.data) {
      return {
        success: false,
        error: 'Failed to load exercises',
      };
    }

    const allExercises = allExercisesResult.data;
    const suggestions: SmartSwapSuggestion[] = [];

    // Filter out the current exercise
    // 過濾掉當前動作
    const currentExerciseNameKey = currentExercise.nameKey || currentExercise.exercise || currentExercise.name || '';
    const availableExercises = allExercises.filter(ex => {
      const exNameKey = ex.nameKey || ex.name || '';
      return exNameKey !== currentExerciseNameKey && 
             ex.id !== currentExercise.id;
    });

    /**
     * Helper function to map Exercise to ExerciseEntry
     * 將 Exercise 映射為 ExerciseEntry 的輔助函數
     */
    const mapExerciseToEntry = (ex: any): ExerciseEntry => {
      // Extract name from nameKey if available, otherwise use name or id as fallback
      // 如果可用，從 nameKey 中提取名稱，否則使用 name 或 id 作為後備
      const nameFromKey = ex.nameKey?.replace('exercises.', '') || '';
      const exerciseName = nameFromKey || ex.name || ex.id || 'Unknown Exercise';
      
      // Extract muscle group from muscleGroupKey if available, otherwise use muscle_group
      // 如果可用，從 muscleGroupKey 中提取肌肉群，否則使用 muscle_group
      const muscleGroupFromKey = ex.muscleGroupKey?.replace('muscleGroups.', '') || '';
      const muscleGroupName = muscleGroupFromKey || ex.muscle_group || 'Unknown';
      
      // Ensure nameKey doesn't have double prefix
      // 確保 nameKey 沒有重複前綴
      let finalNameKey = ex.nameKey;
      if (!finalNameKey) {
        // Check if exerciseName already has exercises. prefix
        // 檢查 exerciseName 是否已經有 exercises. 前綴
        if (exerciseName.startsWith('exercises.')) {
          finalNameKey = exerciseName;
        } else {
          finalNameKey = `exercises.${exerciseName.toLowerCase().replace(/\s+/g, '_')}`;
        }
      }
      
      return {
        id: ex.id || `unknown_${Date.now()}`,
        nameKey: finalNameKey,
        muscleGroupKey: ex.muscleGroupKey || `muscleGroups.${muscleGroupName}`,
        exercise: exerciseName,
        name: exerciseName,
        muscleGroup: muscleGroupName,
        movementPattern: ex.movement_pattern || '',
        equipment: ex.equipment || '',
        tags: ex.tags || [],
      } as ExerciseEntry;
    };

    // Priority 1: Same muscle group and movement pattern
    if (currentExercise.muscleGroup && currentExercise.movementPattern) {
      const currentMuscleGroupKey = currentExercise.muscleGroupKey || `muscleGroups.${currentExercise.muscleGroup}`;
      const sameMuscleAndPattern = availableExercises
        .filter(ex => {
          const exMuscleGroupKey = ex.muscleGroupKey || `muscleGroups.${ex.muscle_group || ''}`;
          return (
            exMuscleGroupKey.toLowerCase() === currentMuscleGroupKey.toLowerCase() &&
          ex.movement_pattern?.toLowerCase() === currentExercise.movementPattern.toLowerCase()
          );
        })
        .slice(0, limit)
        .map(ex => {
          const entry = mapExerciseToEntry(ex);
          return {
            exercise: entry,
          reason: 'Same muscle group and movement pattern',
          similarityScore: 100,
          };
        })
        .filter(item => item.exercise.id && item.exercise.exercise !== 'Unknown Exercise');
      suggestions.push(...sameMuscleAndPattern);
    }

    // Priority 2: Same muscle group
    if (currentExercise.muscleGroup && suggestions.length < limit) {
      const currentMuscleGroupKey = currentExercise.muscleGroupKey || `muscleGroups.${currentExercise.muscleGroup}`;
      const sameMuscleGroup = availableExercises
        .filter(ex => {
          const exMuscleGroupKey = ex.muscleGroupKey || `muscleGroups.${ex.muscle_group || ''}`;
          const exNameKey = ex.nameKey || ex.name || '';
          return (
            exMuscleGroupKey.toLowerCase() === currentMuscleGroupKey.toLowerCase() &&
            !suggestions.some(s => {
              const sNameKey = s.exercise.nameKey || s.exercise.exercise || '';
              return sNameKey === exNameKey;
            })
          );
        })
        .slice(0, limit - suggestions.length)
        .map(ex => {
          const entry = mapExerciseToEntry(ex);
          return {
            exercise: entry,
          reason: 'Same muscle group',
          similarityScore: 80,
          };
        })
        .filter(item => item.exercise.id && item.exercise.exercise !== 'Unknown Exercise');
      suggestions.push(...sameMuscleGroup);
    }

    // Priority 3: Same movement pattern
    if (currentExercise.movementPattern && suggestions.length < limit) {
      const samePattern = availableExercises
        .filter(ex => {
          const exNameKey = ex.nameKey || ex.name || '';
          return (
          ex.movement_pattern?.toLowerCase() === currentExercise.movementPattern.toLowerCase() &&
            !suggestions.some(s => {
              const sNameKey = s.exercise.nameKey || s.exercise.exercise || '';
              return sNameKey === exNameKey;
            })
          );
        })
        .slice(0, limit - suggestions.length)
        .map(ex => {
          const entry = mapExerciseToEntry(ex);
          return {
            exercise: entry,
          reason: 'Same movement pattern',
          similarityScore: 60,
          };
        })
        .filter(item => item.exercise.id && item.exercise.exercise !== 'Unknown Exercise');
      suggestions.push(...samePattern);
    }

    // Priority 4: Same equipment
    if (currentExercise.equipment && suggestions.length < limit) {
      const sameEquipment = availableExercises
        .filter(ex => {
          const exNameKey = ex.nameKey || ex.name || '';
          return (
          ex.equipment?.toLowerCase() === currentExercise.equipment.toLowerCase() &&
            !suggestions.some(s => {
              const sNameKey = s.exercise.nameKey || s.exercise.exercise || '';
              return sNameKey === exNameKey;
            })
          );
        })
        .slice(0, limit - suggestions.length)
        .map(ex => {
          const entry = mapExerciseToEntry(ex);
          return {
            exercise: entry,
          reason: 'Same equipment',
          similarityScore: 40,
          };
        })
        .filter(item => item.exercise.id && item.exercise.exercise !== 'Unknown Exercise');
      suggestions.push(...sameEquipment);
    }

    // Sort by similarity score (highest first) and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
      .slice(0, limit);

    return {
      success: true,
      data: sortedSuggestions,
    };
  } catch (error) {
    console.error('Get smart swap suggestions failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get suggestions',
    };
  }
};

/**
 * Get exercises by muscle group for adding to workout
 * 根據肌肉群獲取動作（用於添加到訓練）
 */
export const getExercisesForMuscleGroup = async (
  muscleGroup: string
): Promise<LiveWorkoutServiceResult<ExerciseEntry[]>> => {
  try {
    const result = await getExercisesByMuscleGroup(muscleGroup);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to load exercises',
      };
    }

    const exercises: ExerciseEntry[] = result.data.map(ex => ({
      id: ex.id,
      exercise: ex.nameKey?.replace('exercises.', '') || ex.name || '',
      name: ex.nameKey?.replace('exercises.', '') || ex.name || '',
      nameKey: (() => {
        if (ex.nameKey) return ex.nameKey;
        const name = ex.name || '';
        if (!name) return '';
        // Check if name already has exercises. prefix
        // 檢查名稱是否已經有 exercises. 前綴
        if (name.startsWith('exercises.')) return name;
        return `exercises.${name}`;
      })(),
      muscleGroup: ex.muscleGroupKey?.replace('muscleGroups.', '') || ex.muscle_group || '',
      muscleGroupKey: ex.muscleGroupKey || `muscleGroups.${ex.muscle_group || ''}`,
      movementPattern: ex.movement_pattern,
      equipment: ex.equipment,
      tags: ex.tags,
    }));

    return {
      success: true,
      data: exercises,
    };
  } catch (error) {
    console.error('Get exercises for muscle group failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get exercises',
    };
  }
};

/**
 * Search exercises by query
 * 搜尋動作
 */
export const searchExercisesForWorkout = async (
  query: string
): Promise<LiveWorkoutServiceResult<ExerciseEntry[]>> => {
  try {
    const result = await searchExercises(query);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to search exercises',
      };
    }

    const exercises: ExerciseEntry[] = result.data.map(ex => ({
      id: ex.id,
      exercise: ex.nameKey?.replace('exercises.', '') || ex.name || '',
      name: ex.nameKey?.replace('exercises.', '') || ex.name || '',
      nameKey: (() => {
        if (ex.nameKey) return ex.nameKey;
        const name = ex.name || '';
        if (!name) return '';
        // Check if name already has exercises. prefix
        // 檢查名稱是否已經有 exercises. 前綴
        if (name.startsWith('exercises.')) return name;
        return `exercises.${name}`;
      })(),
      muscleGroup: ex.muscleGroupKey?.replace('muscleGroups.', '') || ex.muscle_group || '',
      muscleGroupKey: ex.muscleGroupKey || `muscleGroups.${ex.muscle_group || ''}`,
      movementPattern: ex.movement_pattern,
      equipment: ex.equipment,
      tags: ex.tags,
    }));

    return {
      success: true,
      data: exercises,
    };
  } catch (error) {
    console.error('Search exercises failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search exercises',
    };
  }
};

