/**
 * Live Workout Type Definitions
 * 即時訓練類型定義
 */

/**
 * Set Entry - Represents a single set within an exercise
 * 組數記錄 - 代表一個動作中的單組
 */
export interface SetEntry {
  id: string;
  setNumber: number;
  reps: number;
  weight: number; // Always stored in kg internally
  completed: boolean;
  lastPerformance?: string; // Optional display string for last performance
}

/**
 * Exercise Entry - Represents an exercise in the workout plan
 * 動作項目 - 代表訓練計劃中的一個動作
 */
export interface ExerciseEntry {
  id: string;
  nameKey?: string; // Translation key for exercise name (e.g., 'exercises.Barbell Bench Press')
  muscleGroupKey?: string; // Translation key for muscle group (e.g., 'muscleGroups.Chest')
  exercise: string; // Exercise name (legacy, for backward compatibility)
  name?: string; // Alternative name field (legacy, for backward compatibility)
  muscleGroup: string; // Muscle group name (legacy, for backward compatibility)
  movementPattern?: string;
  equipment?: string;
  tags?: string[];
  sets?: number; // Suggested number of sets
  reps?: number; // Suggested number of reps
  weight?: number; // Suggested weight
  restTime?: number; // Suggested rest time in seconds
}

/**
 * Completed Exercise - Represents a completed exercise with all sets
 * 完成的動作 - 代表已完成的所有組數
 */
export interface CompletedExercise {
  nameKey?: string; // Translation key for exercise name (e.g., 'exercises.Barbell Bench Press')
  muscleGroupKey?: string; // Translation key for muscle group (e.g., 'muscleGroups.Chest')
  exercise: string; // Exercise name (legacy, for backward compatibility)
  muscleGroup: string; // Muscle group name (legacy, for backward compatibility)
  sets: SetEntry[];
  completedAt: Date;
}

/**
 * Live Workout State - Main state for active workout session
 * 即時訓練狀態 - 活動訓練會話的主要狀態
 */
export interface LiveWorkoutState {
  // Workout plan
  exercises: ExerciseEntry[];
  templateId?: string;
  
  // Current progress
  currentExerciseIndex: number;
  currentSets: SetEntry[];
  completedExercises: CompletedExercise[];
  
  // Workout metadata
  workoutStartTime: Date;
  workoutEndTime?: Date;
  isWorkoutFinished: boolean;
}

/**
 * Timer State - State for rest timer
 * 計時器狀態 - 休息計時器的狀態
 */
export interface TimerState {
  timeLeft: number; // Time remaining in seconds
  isRunning: boolean;
  duration: number; // Total duration in seconds
}

/**
 * Smart Swap Suggestion - Exercise replacement suggestion
 * 智能替換建議 - 動作替換建議
 */
export interface SmartSwapSuggestion {
  exercise: ExerciseEntry;
  reason: string; // Why this exercise was suggested
  similarityScore?: number; // Optional similarity score
}

/**
 * Workout Session Data - Data structure for saving completed workout
 * 訓練會話數據 - 保存已完成訓練的數據結構
 */
export interface WorkoutSessionData {
  templateId?: string;
  exercises: CompletedExercise[];
  startTime: Date;
  endTime: Date;
  duration: number; // Duration in minutes
}

/**
 * Live Workout Service Result - Standard service response
 * 即時訓練服務結果 - 標準服務響應
 */
export interface LiveWorkoutServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}


