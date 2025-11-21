/**
 * Quick Log Hook
 * 快速記錄 Hook
 * 
 * This hook manages quick log state and business logic
 * 此 Hook 管理快速記錄狀態和業務邏輯
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useUnit } from '../../../shared/hooks/useUnit';
import { getLastWorkoutByExercise, saveMultipleWorkouts } from '../../workouts/services/workoutService';
import { getTargetWeight } from '../../progress/services/progressService';
import type { WorkoutInput } from '../../workouts/types/workout.types';
import type { ExerciseEntry } from '../../live-workout/types/liveWorkout.types';
import type { QuickSet, QuickLogExerciseData, SaveAllWorkoutsResult } from '../types';

export interface UseQuickLogReturn {
  // State
  state: {
    workoutData: Record<string, QuickLogExerciseData>;
    activeExercises: ExerciseEntry[];
    isSaving: boolean;
    error: string | null;
  };
  // Actions
  actions: {
    updateSetData: (exerciseName: string, setIndex: number, field: keyof QuickSet, value: number) => void;
    addSet: (exerciseName: string) => void;
    removeSet: (exerciseName: string, setIndex: number) => void;
    addNewExercise: (exercise: ExerciseEntry) => Promise<void>;
    saveAllWorkouts: () => Promise<SaveAllWorkoutsResult>;
  };
}

/**
 * Quick Log Hook
 * @param initialExercises - Initial exercises from route params
 */
export const useQuickLog = (initialExercises: ExerciseEntry[] = []): UseQuickLogReturn => {
  const { user } = useAuth();
  const { currentUnit, convertWeightValue } = useUnit();
  
  // State
  const [workoutData, setWorkoutData] = useState<Record<string, QuickLogExerciseData>>({});
  const [activeExercises, setActiveExercises] = useState<ExerciseEntry[]>(initialExercises);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Prepare exercise data (fetch last workout and target weight)
   * 準備動作數據（獲取上次訓練記錄和目標重量）
   * 
   * This is a helper function that can be used for both batch initialization
   * and single exercise addition
   * 這是一個輔助函數，可用於批量初始化和單個動作添加
   */
  const prepareExerciseData = useCallback(async (
    exercise: ExerciseEntry
  ): Promise<QuickLogExerciseData> => {
    const exerciseName = exercise.exercise || exercise.name || '';
    
    if (!exerciseName) {
      throw new Error('Exercise name is required');
    }

    try {
      // Get last workout for this exercise
      const lastWorkoutResult = await getLastWorkoutByExercise(
        exerciseName,
        user?.id
      );
      const lastWorkout = lastWorkoutResult.success ? lastWorkoutResult.data : null;

      // Get target weight
      const targetWeightResult = await getTargetWeight(exerciseName);
      const targetWeight = targetWeightResult.success ? targetWeightResult.data || 0 : 0;

      return {
        exercise: exerciseName,
        muscleGroup: exercise.muscleGroup || '',
        sets: lastWorkout
          ? [
              {
                reps: lastWorkout.reps || 10,
                weight: lastWorkout.weight || targetWeight || 0,
              },
            ]
          : [{ reps: 10, weight: targetWeight || 0 }],
        lastRecord: lastWorkout
          ? `${lastWorkout.sets} sets x ${lastWorkout.reps || 10} reps x ${convertWeightValue(
              lastWorkout.weight || 0
            )}${currentUnit}`
          : 'No previous record',
      };
    } catch (err) {
      console.error(`Error preparing data for ${exerciseName}:`, err);
      // Return default data on error
      return {
        exercise: exerciseName,
        muscleGroup: exercise.muscleGroup || '',
        sets: [{ reps: 10, weight: 0 }],
        lastRecord: 'No previous record',
      };
    }
  }, [user?.id, currentUnit, convertWeightValue]);

  /**
   * Initialize workout data for all exercises
   * 初始化所有動作的訓練數據
   */
  const initializeWorkoutData = useCallback(async () => {
    const initialData: Record<string, QuickLogExerciseData> = {};
    
    for (const exercise of initialExercises) {
      const exerciseName = exercise.exercise || exercise.name || '';
      if (!exerciseName) continue;

      try {
        const exerciseData = await prepareExerciseData(exercise);
        initialData[exerciseName] = exerciseData;
      } catch (err) {
        console.error(`Error initializing data for ${exerciseName}:`, err);
        setError(`Failed to initialize data for ${exerciseName}`);
        initialData[exerciseName] = {
          exercise: exerciseName,
          muscleGroup: exercise.muscleGroup || '',
          sets: [{ reps: 10, weight: 0 }],
          lastRecord: 'No previous record',
        };
      }
    }
    
    setWorkoutData(initialData);
  }, [initialExercises, prepareExerciseData]);

  // Initialize workout data when initial exercises change
  useEffect(() => {
    if (initialExercises.length > 0) {
      setActiveExercises(initialExercises);
      initializeWorkoutData();
    }
  }, [initialExercises, initializeWorkoutData]);

  /**
   * Update set data
   * 更新組數數據
   */
  const updateSetData = (
    exerciseName: string,
    setIndex: number,
    field: keyof QuickSet,
    value: number
  ) => {
    setWorkoutData((prev) => {
      const exercise = prev[exerciseName];
      if (!exercise) return prev;

      return {
        ...prev,
        [exerciseName]: {
          ...exercise,
          sets: exercise.sets.map((set, index) =>
            index === setIndex ? { ...set, [field]: value } : set
          ),
        },
      };
    });
  };

  /**
   * Add a new set
   * 添加新組數
   */
  const addSet = (exerciseName: string) => {
    setWorkoutData((prev) => {
      const exercise = prev[exerciseName];
      if (!exercise) return prev;

      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSet: QuickSet = {
        reps: lastSet.reps,
        weight: lastSet.weight,
      };

      return {
        ...prev,
        [exerciseName]: {
          ...exercise,
          sets: [...exercise.sets, newSet],
        },
      };
    });
  };

  /**
   * Remove a set
   * 移除組數
   */
  const removeSet = (exerciseName: string, setIndex: number) => {
    setWorkoutData((prev) => {
      const exercise = prev[exerciseName];
      if (!exercise || exercise.sets.length <= 1) return prev;

      return {
        ...prev,
        [exerciseName]: {
          ...exercise,
          sets: exercise.sets.filter((_, index) => index !== setIndex),
        },
      };
    });
  };

  /**
   * Add a new exercise to the active list
   * 添加新動作到活動列表
   */
  const addNewExercise = async (exercise: ExerciseEntry): Promise<void> => {
    const exerciseName = exercise.exercise || exercise.name || '';
    
    if (!exerciseName) {
      throw new Error('Exercise name is required');
    }

    // Check if exercise already exists
    // 檢查動作是否已存在
    const exists = activeExercises.some(
      (ex) => (ex.exercise || ex.name) === exerciseName
    );

    if (exists) {
      throw new Error(`Exercise "${exerciseName}" already exists in the list. Please select a different exercise.`);
    }

    try {
      // Prepare exercise data
      // 準備動作數據
      const exerciseData = await prepareExerciseData(exercise);

      // Update workout data
      // 更新訓練數據
      setWorkoutData((prev) => ({
        ...prev,
        [exerciseName]: exerciseData,
      }));

      // Add to active exercises list
      // 添加到活動動作列表
      setActiveExercises((prev) => [...prev, exercise]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add exercise';
      console.error('Error adding exercise:', err);
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Save all workouts
   * 保存所有訓練數據
   * 
   * Returns a Promise with result, does not handle UI alerts or navigation
   * 返回一個包含結果的 Promise，不處理 UI 提示或導航
   * 
   * Optimized: Uses batch save instead of individual API calls
   * 優化：使用批量保存而不是單個 API 調用
   */
  const saveAllWorkouts = async (): Promise<SaveAllWorkoutsResult> => {
    try {
      setIsSaving(true);
      setError(null);

      if (!user) {
        return {
          success: false,
          count: 0,
          error: 'User not logged in.',
        };
      }

      const today = new Date().toISOString();
      const workoutsToSave: WorkoutInput[] = [];

      // Collect all sets from all exercises - "What You See Is What You Get"
      // 收集所有練習的所有組數 - "所見即所得"
      for (const [exerciseName, data] of Object.entries(workoutData)) {
        // Save all sets for this exercise
        // 保存此練習的所有組數
        for (const set of data.sets) {
          const workoutRecord: WorkoutInput = {
            exercise: exerciseName,
            muscleGroup: data.muscleGroup,
            weight: set.weight,
            reps: set.reps,
            sets: 1, // Each set is saved as a separate workout record
            date: today,
          };
          workoutsToSave.push(workoutRecord);
        }
      }

      // Check if there are any workouts to save
      // 檢查是否有任何訓練記錄需要保存
      if (workoutsToSave.length === 0) {
        return {
          success: false,
          count: 0,
          error: 'No workouts to save.',
        };
      }

      // Batch save all workouts in a single API call
      // 在單一 API 調用中批量保存所有訓練記錄
      const result = await saveMultipleWorkouts(workoutsToSave, user.id);

      if (result.success && result.data) {
        return {
          success: true,
          count: result.data.length,
        };
      } else {
        const errorMessage = result.error || 'Failed to save workouts.';
        console.error('批量保存訓練數據失敗:', errorMessage);
        setError(errorMessage);
        return {
          success: false,
          count: 0,
          error: errorMessage,
        };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save workouts.';
      console.error('保存訓練數據失敗:', err);
      setError(errorMessage);
      return {
        success: false,
        count: 0,
        error: errorMessage,
      };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    state: {
      workoutData,
      activeExercises,
      isSaving,
      error,
    },
    actions: {
      updateSetData,
      addSet,
      removeSet,
      addNewExercise,
      saveAllWorkouts,
    },
  };
};
