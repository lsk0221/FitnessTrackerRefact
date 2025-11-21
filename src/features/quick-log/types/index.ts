/**
 * Quick Log Type Definitions
 * 快速記錄類型定義
 */

/**
 * Quick Set - Represents a single set in quick log mode
 * 快速組數 - 代表快速記錄模式中的單個組數
 */
export interface QuickSet {
  reps: number;
  weight: number;
}

/**
 * Quick Log Exercise Data - Represents exercise data in quick log mode
 * 快速記錄動作數據 - 代表快速記錄模式中的動作數據
 */
export interface QuickLogExerciseData {
  exercise: string;
  muscleGroup: string;
  sets: QuickSet[];
  lastRecord: string;
}

/**
 * Save All Workouts Result
 * 保存所有訓練結果
 */
export interface SaveAllWorkoutsResult {
  success: boolean;
  count: number;
  error?: string;
}

