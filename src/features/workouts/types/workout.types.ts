/**
 * Workout Type Definitions
 * 訓練記錄類型定義
 */

/**
 * 單次訓練記錄
 * Single workout record
 */
export interface Workout {
  id: string;
  date: string; // ISO string format
  muscleGroup: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number; // Always stored in kg internally
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 新增訓練記錄的輸入數據
 * Input data for creating a new workout
 */
export interface WorkoutInput {
  date?: string; // Optional, defaults to current date
  muscleGroup: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
}

/**
 * 更新訓練記錄的輸入數據
 * Input data for updating a workout
 */
export interface WorkoutUpdate extends Partial<WorkoutInput> {
  id: string;
}

/**
 * 按日期分組的訓練數據
 * Workout data grouped by date
 */
export interface WorkoutDataByDate {
  [dateString: string]: {
    muscleGroups: string[];
    workouts: Workout[];
  };
}

/**
 * 訓練統計數據
 * Workout statistics
 */
export interface WorkoutStats {
  total: number;
  maxWeight: number;
  latest: number;
  improvement: number;
}

/**
 * 訓練驗證結果
 * Workout validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 訓練查詢參數
 * Workout query parameters
 */
export interface WorkoutQueryParams {
  exercise?: string;
  muscleGroup?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

/**
 * 訓練服務返回結果
 * Workout service operation result
 */
export interface WorkoutServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

