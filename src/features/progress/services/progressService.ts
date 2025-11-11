/**
 * Progress Service
 * 進度追蹤服務層 - 處理所有進度相關的業務邏輯
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../shared/constants';
import { getWorkoutsByExercise } from '../../workouts/services/workoutService';
import type { Workout } from '../../workouts/types/workout.types';
import type {
  ChartDataPoint,
  ProgressStats,
  TargetWeightsMap,
  TimeRange,
  ChartType,
  ProgressServiceResult,
  ExerciseProgress,
} from '../types/progress.types';

/**
 * 根據時間範圍過濾數據
 * Filter data by time range
 */
export const filterDataByTimeRange = (data: ChartDataPoint[], timeRange: TimeRange): ChartDataPoint[] => {
  if (timeRange === 'all') return data;

  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case 'ytd':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'ly':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      const endDate = new Date(now.getFullYear() - 1, 11, 31);
      return data.filter(d => {
        const itemDate = new Date(d.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    default:
      return data;
  }

  return data.filter(d => new Date(d.date) >= startDate);
};

/**
 * 根據時間範圍過濾訓練記錄
 * Filter workout records by time range
 */
export const filterWorkoutsByTimeRange = (workouts: Workout[], timeRange: TimeRange): Workout[] => {
  if (timeRange === 'all') return workouts;

  const now = new Date();
  let startDate: Date;

  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case 'ytd':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'ly':
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      const endDate = new Date(now.getFullYear() - 1, 11, 31);
      return workouts.filter(w => {
        const itemDate = new Date(w.date);
        return itemDate >= startDate && itemDate <= endDate;
      });
    default:
      return workouts;
  }

  return workouts.filter(w => new Date(w.date) >= startDate);
};

/**
 * 計算指定訓練動作的進度數據
 * Calculate progress data for a specific exercise
 */
export const calculateExerciseProgress = async (
  exercise: string,
  timeRange: TimeRange = 'all',
  userId?: string
): Promise<ProgressServiceResult<ExerciseProgress>> => {
  try {
    // Get all workouts for this exercise
    const result = await getWorkoutsByExercise(exercise, userId);

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || '獲取訓練記錄失敗',
      };
    }

    const workouts = result.data;

    // Filter by time range
    const filteredWorkouts = filterWorkoutsByTimeRange(workouts, timeRange);

    // Group by date and process
    const groupedByDate: { [date: string]: Workout[] } = {};

    filteredWorkouts.forEach(workout => {
      const dateKey = workout.date.split('T')[0]; // Only date part, ignore time

      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(workout);
    });

    // Process each date's data
    const chartData: ChartDataPoint[] = Object.keys(groupedByDate).map(dateKey => {
      const dayWorkouts = groupedByDate[dateKey];

      if (dayWorkouts.length === 1) {
        // Single record, use directly
        const workout = dayWorkouts[0];
        const volume = workout.weight * workout.reps * workout.sets;

        return {
          date: workout.date,
          weight: workout.weight,
          volume: volume,
        };
      } else {
        // Multiple records, need to aggregate
        // Weight: take maximum weight
        const maxWeight = Math.max(...dayWorkouts.map(w => w.weight));

        // Volume: sum all volumes
        const totalVolume = dayWorkouts.reduce((sum, workout) => {
          return sum + workout.weight * workout.reps * workout.sets;
        }, 0);

        return {
          date: dayWorkouts[0].date, // Use first record's timestamp
          weight: maxWeight,
          volume: totalVolume,
        };
      }
    });

    // Sort by date
    const sortedChartData = chartData.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate statistics
    const stats = calculateStats(sortedChartData, 'weight');

    return {
      success: true,
      data: {
        exercise,
        chartData: sortedChartData,
        stats,
      },
    };
  } catch (error) {
    console.error('計算訓練進度失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '計算訓練進度失敗',
    };
  }
};

/**
 * 計算統計數據
 * Calculate statistics
 */
export const calculateStats = (data: ChartDataPoint[], chartType: ChartType = 'weight'): ProgressStats => {
  if (!data || data.length === 0) {
    return {
      total: 0,
      maxWeight: 0,
      latest: 0,
      improvement: 0,
    };
  }

  const values = data
    .map(d => (chartType === 'volume' ? d.volume : d.weight))
    .filter(v => v > 0 && !isNaN(v));

  if (values.length === 0) {
    return {
      total: 0,
      maxWeight: 0,
      latest: 0,
      improvement: 0,
    };
  }

  const total = values.length;
  const maxWeight = Math.max(...values);
  const latest = values[values.length - 1];

  let improvement = 0;
  if (values.length > 1) {
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    improvement = ((lastValue - firstValue) / firstValue) * 100;
  }

  return {
    total,
    maxWeight,
    latest,
    improvement: Math.round(improvement * 10) / 10, // Round to 1 decimal place
  };
};

/**
 * 載入目標重量
 * Load target weights
 */
export const loadTargetWeights = async (): Promise<ProgressServiceResult<TargetWeightsMap>> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.TARGET_WEIGHTS);
    if (stored) {
      const targetWeights: TargetWeightsMap = JSON.parse(stored);
      return { success: true, data: targetWeights };
    }
    return { success: true, data: {} };
  } catch (error) {
    console.error('載入目標重量失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '載入目標重量失敗',
    };
  }
};

/**
 * 保存目標重量
 * Save target weight for an exercise
 */
export const saveTargetWeight = async (
  exercise: string,
  weight: number,
  type: ChartType = 'weight'
): Promise<ProgressServiceResult> => {
  try {
    const key = type === 'volume' ? `${exercise}_volume` : exercise;

    // Load existing target weights
    const result = await loadTargetWeights();
    const currentTargets = result.success && result.data ? result.data : {};

    // Update with new target
    const updatedTargets: TargetWeightsMap = {
      ...currentTargets,
      [key]: weight,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.TARGET_WEIGHTS, JSON.stringify(updatedTargets));

    return { success: true };
  } catch (error) {
    console.error('保存目標重量失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存目標重量失敗',
    };
  }
};

/**
 * 獲取目標重量
 * Get target weight for an exercise
 */
export const getTargetWeight = async (
  exercise: string,
  type: ChartType = 'weight'
): Promise<ProgressServiceResult<number>> => {
  try {
    const result = await loadTargetWeights();
    if (!result.success || !result.data) {
      return { success: true, data: 0 };
    }

    const key = type === 'volume' ? `${exercise}_volume` : exercise;
    const targetWeight = result.data[key] || 0;

    return { success: true, data: targetWeight };
  } catch (error) {
    console.error('獲取目標重量失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '獲取目標重量失敗',
    };
  }
};

/**
 * 載入最後訓練的動作
 * Load last exercised exercise
 */
export const loadLastExercise = async (): Promise<
  ProgressServiceResult<{ muscleGroup: string; exercise: string }>
> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_EXERCISE);
    if (stored) {
      const lastExercise = JSON.parse(stored);
      return { success: true, data: lastExercise };
    }
    return { success: true, data: { muscleGroup: '', exercise: '' } };
  } catch (error) {
    console.error('載入最後訓練動作失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '載入最後訓練動作失敗',
    };
  }
};

/**
 * 保存最後訓練的動作
 * Save last exercised exercise
 */
export const saveLastExercise = async (muscleGroup: string, exercise: string): Promise<ProgressServiceResult> => {
  try {
    const lastExercise = { muscleGroup, exercise };
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_EXERCISE, JSON.stringify(lastExercise));
    return { success: true };
  } catch (error) {
    console.error('保存最後訓練動作失敗:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '保存最後訓練動作失敗',
    };
  }
};


