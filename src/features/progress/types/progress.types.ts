/**
 * Progress Feature Type Definitions
 * 進度追蹤類型定義
 */

/**
 * 圖表數據點
 * Chart data point
 */
export interface ChartDataPoint {
  date: string; // ISO string format
  weight: number; // Max weight for that date
  volume: number; // Total volume for that date
}

/**
 * 進度統計數據
 * Progress statistics
 */
export interface ProgressStats {
  total: number; // Total number of training sessions
  maxWeight: number; // Maximum weight/volume recorded
  latest: number; // Latest weight/volume
  improvement: number; // Improvement percentage
}

/**
 * 目標重量配置
 * Target weight configuration
 */
export interface TargetWeight {
  exercise: string; // Exercise key
  value: number; // Target value
  type: 'weight' | 'volume'; // Target type
}

/**
 * 目標重量存儲格式
 * Target weights storage format
 */
export interface TargetWeightsMap {
  [key: string]: number; // Key format: "exercise" or "exercise_volume"
}

/**
 * 圖表類型
 * Chart type
 */
export type ChartType = 'weight' | 'volume';

/**
 * 時間範圍選項
 * Time range option
 */
export type TimeRange = '7d' | '1m' | '3m' | '6m' | 'ytd' | 'ly' | 'all';

/**
 * 進度服務返回結果
 * Progress service operation result
 */
export interface ProgressServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 訓練動作進度數據
 * Exercise progress data
 */
export interface ExerciseProgress {
  exercise: string;
  chartData: ChartDataPoint[];
  stats: ProgressStats;
}

/**
 * 進度查詢參數
 * Progress query parameters
 */
export interface ProgressQueryParams {
  exercise: string;
  timeRange?: TimeRange;
  chartType?: ChartType;
  userId?: string;
}

/**
 * 選擇器狀態
 * Selector state
 */
export interface SelectorState {
  selectedMuscleGroup: string;
  selectedExercise: string;
  selectedTimeRange: TimeRange;
  chartType: ChartType;
}



