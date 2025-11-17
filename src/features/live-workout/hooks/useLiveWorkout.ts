/**
 * Live Workout Hook - Logbook Pattern
 * 即時訓練 Hook - 日誌本模式
 * 
 * Implements the Logbook Pattern: single source of truth (completedLog) with derived views
 * 實現日誌本模式：單一數據源（completedLog）與派生視圖
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLastWorkoutByExercise } from '../../workouts/services/workoutService';
import { finishWorkout } from '../services/liveWorkoutService';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import { generateUniqueId } from '../../../shared/utils/helpers';
import type { 
  ExerciseEntry, 
  SetEntry, 
  CompletedExercise,
  WorkoutSessionData 
} from '../types/liveWorkout.types';

/**
 * Log Entry - SetEntry with exercise identifier for the logbook
 * 日誌條目 - 帶有動作標識符的組數記錄
 */
interface LogEntry extends SetEntry {
  exerciseName: string; // Exercise name to filter by
  exerciseIndex: number; // Exercise index in the plan
}

interface UseLiveWorkoutParams {
  exercises: ExerciseEntry[];
  templateId?: string;
  initialRestTime?: number; // Default rest time in seconds
  onSetCompleted?: (restTime: number) => void; // Callback when a set is completed (not last set)
}

interface LastPerformance {
  reps: number;
  weight: number;
}

interface UseLiveWorkoutReturn {
  // Derived state
  currentExerciseTemplate: ExerciseEntry | null;
  currentExerciseLog: LogEntry[];
  lastPerformance: LastPerformance | null;
  isLoading: boolean;
  
  // Computed flags
  canFinishExercise: boolean;
  canFinishWorkout: boolean;
  
  // Set management
  completeSet: (setIndex: number, reps: number, weight: number) => void;
  unCompleteSet: (setIndex: number) => void;
  adjustReps: (setIndex: number, delta: number, isAbsolute?: boolean) => void;
  adjustWeight: (setIndex: number, delta: number, isAbsolute?: boolean) => void;
  addSet: () => void;
  
  // Exercise navigation
  nextExercise: () => void;
  previousExercise: () => void;
  skipExercise: () => void;
  
  // Workout completion
  finishWorkout: (onComplete?: () => void) => Promise<void>;
  
  // Smart swap
  replaceExercise: (newExercise: ExerciseEntry) => void;
  
  // Metadata
  workoutStartTime: Date;
  templateId?: string;
  currentExerciseIndex: number;
  totalExercises: number;
  completedExercisesCount: number;
}

/**
 * Hook for managing live workout session using Logbook Pattern
 * 使用日誌本模式管理即時訓練會話的 Hook
 */
export const useLiveWorkout = (
  params: UseLiveWorkoutParams
): UseLiveWorkoutReturn => {
  const { exercises, templateId, initialRestTime = 90, onSetCompleted } = params;
  const { user } = useCloudflareAuth();
  const userId = user?.id;

  // Primary state - The Logbook Pattern
  const [workoutPlan, setWorkoutPlan] = useState<ExerciseEntry[]>(exercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [completedLog, setCompletedLog] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastPerformance, setLastPerformance] = useState<LastPerformance | null>(null);
  const [workoutStartTime] = useState<Date>(new Date());

  // Derived state - Computed views
  const currentExerciseTemplate = useMemo(() => {
    return workoutPlan[currentExerciseIndex] || null;
  }, [workoutPlan, currentExerciseIndex]);

  const currentExerciseLog = useMemo(() => {
    if (!currentExerciseTemplate) return [];
    const exerciseName = currentExerciseTemplate.exercise || currentExerciseTemplate.name || '';
    return completedLog.filter(
      entry => entry.exerciseName === exerciseName && entry.exerciseIndex === currentExerciseIndex
    );
  }, [completedLog, currentExerciseTemplate, currentExerciseIndex]);

  // Load last performance when exercise changes
  useEffect(() => {
    if (!currentExerciseTemplate) return;

    const exerciseName = currentExerciseTemplate.exercise || currentExerciseTemplate.name || '';
    if (!exerciseName) return;

    setIsLoading(true);
    getLastWorkoutByExercise(exerciseName, userId)
      .then(result => {
        if (result.success && result.data) {
          setLastPerformance({
            reps: result.data.reps,
            weight: result.data.weight,
          });
        } else {
          setLastPerformance(null);
        }
      })
      .catch(error => {
        console.error('Load last performance failed:', error);
        setLastPerformance(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [currentExerciseIndex, currentExerciseTemplate, userId]);

  /**
   * Complete a set
   * 完成一組
   * 
   * Implements the Golden Rules for Rest Timer:
   * - Rule #1: Timer triggers ONLY when a set is marked complete
   * - Rule #2: Timer NEVER triggers when unchecking, adding sets, or editing
   * - Rule #3: Timer does NOT trigger if it's the last set
   */
  const completeSet = useCallback((setIndex: number, reps: number, weight: number) => {
    if (!currentExerciseTemplate) return;

    const exerciseName = currentExerciseTemplate.exercise || currentExerciseTemplate.name || '';
    const totalSets = currentExerciseTemplate.sets || 3;
    const isLastSet = setIndex === totalSets;

    // Create log entry
    const logEntry: LogEntry = {
      id: generateUniqueId(),
      setNumber: setIndex,
      reps,
      weight,
      completed: true,
      exerciseName,
      exerciseIndex: currentExerciseIndex,
    };

    // Append to logbook
    setCompletedLog(prev => [...prev, logEntry]);

    // Trigger rest timer (Golden Rules)
    if (!isLastSet && onSetCompleted) {
      const restTime = currentExerciseTemplate.restTime || initialRestTime;
      onSetCompleted(restTime);
    }
  }, [currentExerciseTemplate, currentExerciseIndex, initialRestTime, onSetCompleted]);

  /**
   * Uncomplete a set (remove from log)
   * 取消完成一組（從日誌中移除）
   */
  const unCompleteSet = useCallback((setIndex: number) => {
    if (!currentExerciseTemplate) return;

    const exerciseName = currentExerciseTemplate.exercise || currentExerciseTemplate.name || '';
    
    setCompletedLog(prev => 
      prev.filter(
        entry => !(
          entry.exerciseName === exerciseName &&
          entry.exerciseIndex === currentExerciseIndex &&
          entry.setNumber === setIndex
        )
      )
    );
  }, [currentExerciseTemplate, currentExerciseIndex]);

  /**
   * Adjust reps for a set in the log
   * 調整日誌中一組的次數
   */
  const adjustReps = useCallback((setIndex: number, delta: number, isAbsolute: boolean = false) => {
    if (!currentExerciseTemplate) return;

    const exerciseName = currentExerciseTemplate.exercise || currentExerciseTemplate.name || '';
    
    setCompletedLog(prev => 
      prev.map(entry => {
        if (
          entry.exerciseName === exerciseName &&
          entry.exerciseIndex === currentExerciseIndex &&
          entry.setNumber === setIndex
        ) {
          return {
            ...entry,
            reps: isAbsolute ? Math.max(0, delta) : Math.max(0, entry.reps + delta),
          };
        }
        return entry;
      })
    );
  }, [currentExerciseTemplate, currentExerciseIndex]);

  /**
   * Adjust weight for a set in the log
   * 調整日誌中一組的重量
   */
  const adjustWeight = useCallback((setIndex: number, delta: number, isAbsolute: boolean = false) => {
    if (!currentExerciseTemplate) return;

    const exerciseName = currentExerciseTemplate.exercise || currentExerciseTemplate.name || '';
    
    setCompletedLog(prev => 
      prev.map(entry => {
        if (
          entry.exerciseName === exerciseName &&
          entry.exerciseIndex === currentExerciseIndex &&
          entry.setNumber === setIndex
        ) {
          return {
            ...entry,
            weight: isAbsolute ? Math.max(0, delta) : Math.max(0, entry.weight + delta),
          };
        }
        return entry;
      })
    );
  }, [currentExerciseTemplate, currentExerciseIndex]);

  /**
   * Add a set to the workout plan
   * 向訓練計劃添加一組
   */
  const addSet = useCallback(() => {
    setWorkoutPlan(prev => {
      const newPlan = [...prev];
      const currentExercise = newPlan[currentExerciseIndex];
      if (currentExercise) {
        newPlan[currentExerciseIndex] = {
          ...currentExercise,
          sets: (currentExercise.sets || 3) + 1,
        };
      }
      return newPlan;
    });
  }, [currentExerciseIndex]);

  /**
   * Move to next exercise
   * 移到下一個動作
   * 
   * ONLY updates the index - no save logic needed (logbook is already saved)
   */
  const nextExercise = useCallback(() => {
    setCurrentExerciseIndex(prev => 
      Math.min(prev + 1, workoutPlan.length - 1)
    );
  }, [workoutPlan.length]);

  /**
   * Move to previous exercise
   * 移到上一個動作
   * 
   * ONLY updates the index - no save logic needed (logbook is already saved)
   */
  const previousExercise = useCallback(() => {
    setCurrentExerciseIndex(prev => Math.max(prev - 1, 0));
  }, []);

  /**
   * Skip current exercise
   * 跳過當前動作
   */
  const skipExercise = useCallback(() => {
    nextExercise();
  }, [nextExercise]);

  /**
   * Replace current exercise with a new one
   * 用新動作替換當前動作
   */
  const replaceExercise = useCallback((newExercise: ExerciseEntry) => {
    setWorkoutPlan(prev => {
      const newPlan = [...prev];
      newPlan[currentExerciseIndex] = newExercise;
      return newPlan;
    });
  }, [currentExerciseIndex]);

  /**
   * Finish workout and save all data
   * 完成訓練並保存所有數據
   * 
   * Converts the logbook into CompletedExercise format and saves
   */
  const finishWorkoutHandler = useCallback(async (onComplete?: () => void) => {
    // Group log entries by exercise
    const exercisesMap = new Map<string, CompletedExercise>();

    completedLog.forEach(entry => {
      const key = entry.exerciseName;
      if (!exercisesMap.has(key)) {
        exercisesMap.set(key, {
          exercise: entry.exerciseName,
          muscleGroup: workoutPlan[entry.exerciseIndex]?.muscleGroup || '',
          sets: [],
          completedAt: new Date(),
        });
      }
      
      const completedExercise = exercisesMap.get(key)!;
      completedExercise.sets.push({
        id: entry.id,
        setNumber: entry.setNumber,
        reps: entry.reps,
        weight: entry.weight,
        completed: entry.completed,
      });
    });

    // Convert map to array
    const allCompletedExercises: CompletedExercise[] = Array.from(exercisesMap.values());

    // Create session data
    const sessionData: WorkoutSessionData = {
      templateId,
      exercises: allCompletedExercises,
      startTime: workoutStartTime,
      endTime: new Date(),
      duration: Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60),
    };
    
    // Save workout
    try {
      const result = await finishWorkout(sessionData, userId);
      if (result.success) {
        if (onComplete) {
          onComplete();
        }
      } else {
        console.error('Failed to finish workout:', result.error);
      }
    } catch (error) {
      console.error('Error finishing workout:', error);
    }
  }, [completedLog, workoutPlan, templateId, workoutStartTime, userId]);

  // Computed flags
  const canFinishExercise = useMemo(() => {
    return currentExerciseLog.length > 0;
  }, [currentExerciseLog]);

  const canFinishWorkout = useMemo(() => {
    return currentExerciseIndex === workoutPlan.length - 1 && canFinishExercise;
  }, [currentExerciseIndex, workoutPlan.length, canFinishExercise]);

  return {
    // Derived state
    currentExerciseTemplate,
    currentExerciseLog,
    lastPerformance,
    isLoading,
    
    // Computed flags
    canFinishExercise,
    canFinishWorkout,
    
    // Set management
    completeSet,
    unCompleteSet,
    adjustReps,
    adjustWeight,
    addSet,
    
    // Exercise navigation
    nextExercise,
    previousExercise,
    skipExercise,
    
    // Workout completion
    finishWorkout: finishWorkoutHandler,
    
    // Smart swap
    replaceExercise,
    
    // Metadata
    workoutStartTime,
    templateId,
    currentExerciseIndex,
    totalExercises: workoutPlan.length,
    completedExercisesCount: completedLog.length,
  };
};
