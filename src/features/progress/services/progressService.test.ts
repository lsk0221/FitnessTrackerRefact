import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  filterDataByTimeRange,
  calculateStats,
  calculateExerciseProgress,
  loadTargetWeights,
  saveTargetWeight,
  loadLastExercise,
  saveLastExercise,
} from './progressService';

// Mock workoutService dependency
jest.mock('../../workouts/services/workoutService', () => ({
  getWorkoutsByExercise: jest.fn(),
}));

import { getWorkoutsByExercise } from '../../workouts/services/workoutService';

const mockGetItem = AsyncStorage.getItem as jest.Mock;
const mockSetItem = AsyncStorage.setItem as jest.Mock;

describe('progressService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('filterDataByTimeRange', () => {
    const now = new Date();
    const fmt = (d: Date) => d.toISOString();
    const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

    const data = [
      { date: fmt(daysAgo(400)), weight: 50, volume: 1000 }, // last year or earlier
      { date: fmt(daysAgo(30)), weight: 60, volume: 1200 },
      { date: fmt(daysAgo(5)), weight: 65, volume: 1400 },
      { date: fmt(daysAgo(1)), weight: 67, volume: 1500 },
    ];

    it('returns all for all', () => {
      expect(filterDataByTimeRange(data, 'all')).toHaveLength(data.length);
    });

    it('filters 7d', () => {
      const res = filterDataByTimeRange(data, '7d');
      expect(res.every(d => new Date(d.date) >= daysAgo(7))).toBe(true);
    });

    it('filters 1m', () => {
      const res = filterDataByTimeRange(data, '1m');
      expect(res.every(d => new Date(d.date) >= new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()))).toBe(true);
    });

    it('filters ytd', () => {
      const res = filterDataByTimeRange(data, 'ytd');
      const start = new Date(now.getFullYear(), 0, 1);
      expect(res.every(d => new Date(d.date) >= start)).toBe(true);
    });
  });

  describe('calculateStats', () => {
    it('handles empty data', () => {
      expect(calculateStats([], 'weight')).toEqual({ total: 0, maxWeight: 0, latest: 0, improvement: 0 });
    });

    it('computes stats for weight', () => {
      const data = [
        { date: '2024-01-01T00:00:00.000Z', weight: 50, volume: 500 },
        { date: '2024-02-01T00:00:00.000Z', weight: 60, volume: 800 },
        { date: '2024-03-01T00:00:00.000Z', weight: 65, volume: 900 },
      ];
      const res = calculateStats(data, 'weight');
      expect(res.total).toBe(3);
      expect(res.maxWeight).toBe(65);
      expect(res.latest).toBe(65);
      expect(res.improvement).toBeCloseTo(((65 - 50) / 50) * 100, 1);
    });

    it('computes stats for volume', () => {
      const data = [
        { date: '2024-01-01T00:00:00.000Z', weight: 50, volume: 500 },
        { date: '2024-02-01T00:00:00.000Z', weight: 60, volume: 1200 },
      ];
      const res = calculateStats(data, 'volume');
      expect(res.total).toBe(2);
      expect(res.maxWeight).toBe(1200);
      expect(res.latest).toBe(1200);
      expect(res.improvement).toBeCloseTo(((1200 - 500) / 500) * 100, 1);
    });
  });

  describe('calculateExerciseProgress', () => {
    it('handles no workouts', async () => {
      (getWorkoutsByExercise as jest.Mock).mockResolvedValue({ success: true, data: [] });
      const res = await calculateExerciseProgress('bench_press', 'all');
      expect(res.success).toBe(true);
      expect(res.data?.chartData).toEqual([]);
      expect(res.data?.stats.total).toBe(0);
    });

    it('aggregates multiple workouts on same day', async () => {
      (getWorkoutsByExercise as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          { id: '1', date: '2024-01-01T10:00:00.000Z', muscleGroup: 'chest', exercise: 'bench_press', sets: 3, reps: 5, weight: 60 },
          { id: '2', date: '2024-01-01T18:00:00.000Z', muscleGroup: 'chest', exercise: 'bench_press', sets: 3, reps: 5, weight: 65 },
          { id: '3', date: '2024-01-02T10:00:00.000Z', muscleGroup: 'chest', exercise: 'bench_press', sets: 3, reps: 5, weight: 62 },
        ],
      });
      const res = await calculateExerciseProgress('bench_press', 'all');
      expect(res.success).toBe(true);
      expect(res.data?.chartData.length).toBe(2); // two dates
      const day1 = res.data?.chartData[0]!;
      expect(day1.weight).toBe(65); // max weight for that day
      expect(day1.volume).toBeGreaterThan(0); // aggregated volume
    });

    it('filters by time range before grouping', async () => {
      (getWorkoutsByExercise as jest.Mock).mockResolvedValue({
        success: true,
        data: [
          { id: '1', date: new Date().toISOString(), muscleGroup: 'chest', exercise: 'bench_press', sets: 3, reps: 5, weight: 70 },
          { id: '2', date: '2020-01-01T00:00:00.000Z', muscleGroup: 'chest', exercise: 'bench_press', sets: 3, reps: 5, weight: 40 },
        ],
      });
      const res = await calculateExerciseProgress('bench_press', '7d');
      expect(res.success).toBe(true);
      expect(res.data?.chartData.length).toBe(1);
    });
  });

  describe('target weights', () => {
    it('saves and loads target weight (weight mode)', async () => {
      mockGetItem.mockResolvedValueOnce(null); // initial load
      const save = await saveTargetWeight('bench_press', 100, 'weight');
      expect(save.success).toBe(true);

      // Ensure setItem was called with merged map
      expect(mockSetItem).toHaveBeenCalled();

      // Now load
      const stored = mockSetItem.mock.calls[0][1];
      mockGetItem.mockResolvedValueOnce(stored);
      const loaded = await loadTargetWeights();
      expect(loaded.success).toBe(true);
      expect(loaded.data?.bench_press).toBe(100);
    });
  });

  describe('last exercise', () => {
    it('saves and loads last exercise selection', async () => {
      const save = await saveLastExercise('chest', 'bench_press');
      expect(save.success).toBe(true);
      const stored = mockSetItem.mock.calls[mockSetItem.mock.calls.length - 1][1];
      mockGetItem.mockResolvedValueOnce(stored);
      const loaded = await loadLastExercise();
      expect(loaded.success).toBe(true);
      expect(loaded.data).toEqual({ muscleGroup: 'chest', exercise: 'bench_press' });
    });
  });
});




