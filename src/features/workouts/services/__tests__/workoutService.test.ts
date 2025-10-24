/**
 * Workout Service Tests
 * 訓練服務測試
 * 
 * Integration tests for workout service business logic
 * 訓練服務業務邏輯的集成測試
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as workoutService from '../workoutService';
import { STORAGE_KEYS } from '../../../../shared/constants';
import type { Workout, WorkoutInput } from '../../types/workout.types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock migration utilities
jest.mock('../../../../shared/services/data/dataMigration', () => ({
  performDataMigration: jest.fn().mockResolvedValue(true),
  needsMigration: jest.fn().mockReturnValue(false),
  fixMuscleGroupInconsistency: jest.fn((workouts) => workouts),
  needsMuscleGroupFix: jest.fn().mockReturnValue(false),
}));

jest.mock('../../../../shared/utils/data/exerciseDataMigration', () => ({
  migrateExerciseData: jest.fn((workouts) => workouts),
  needsExerciseMigration: jest.fn().mockReturnValue(false),
}));

// Sample test data
const mockWorkout: Workout = {
  id: 'test-workout-1',
  date: '2024-10-20T10:00:00.000Z',
  muscleGroup: 'chest',
  exercise: 'Bench Press',
  sets: 3,
  reps: 10,
  weight: 100,
  createdAt: '2024-10-20T10:00:00.000Z',
  updatedAt: '2024-10-20T10:00:00.000Z',
};

const mockWorkout2: Workout = {
  id: 'test-workout-2',
  date: '2024-10-21T10:00:00.000Z',
  muscleGroup: 'back',
  exercise: 'Pull-ups',
  sets: 4,
  reps: 8,
  weight: 0,
  createdAt: '2024-10-21T10:00:00.000Z',
  updatedAt: '2024-10-21T10:00:00.000Z',
};

describe('WorkoutService', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('loadWorkouts', () => {
    it('should return empty array when no workouts exist', async () => {
      const result = await workoutService.loadWorkouts();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.WORKOUTS);
    });

    it('should load workouts successfully from storage', async () => {
      const mockWorkouts = [mockWorkout, mockWorkout2];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockWorkouts)
      );

      const result = await workoutService.loadWorkouts();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWorkouts);
      expect(result.data?.length).toBe(2);
    });

    it('should use user-specific storage key when userId is provided', async () => {
      const userId = 'user-123';
      await workoutService.loadWorkouts(userId);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(`workouts_${userId}`);
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const result = await workoutService.loadWorkouts();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Storage error');
    });

    it('should handle invalid JSON data', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await workoutService.loadWorkouts();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('saveWorkout', () => {
    it('should save a new workout successfully', async () => {
      const workoutInput: WorkoutInput = {
        muscleGroup: 'chest',
        exercise: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 100,
      };

      const result = await workoutService.saveWorkout(workoutInput);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.muscleGroup).toBe('chest');
      expect(result.data?.exercise).toBe('Bench Press');
      expect(result.data?.id).toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should add workout to existing workouts', async () => {
      const existingWorkouts = [mockWorkout];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingWorkouts)
      );

      const workoutInput: WorkoutInput = {
        muscleGroup: 'back',
        exercise: 'Pull-ups',
        sets: 4,
        reps: 8,
        weight: 0,
      };

      const result = await workoutService.saveWorkout(workoutInput);

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      // Check that the saved data includes both workouts
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData.length).toBe(2);
    });

    it('should use provided date or default to current date', async () => {
      const specificDate = '2024-10-15T10:00:00.000Z';
      const workoutInput: WorkoutInput = {
        date: specificDate,
        muscleGroup: 'legs',
        exercise: 'Squats',
        sets: 5,
        reps: 5,
        weight: 150,
      };

      const result = await workoutService.saveWorkout(workoutInput);

      expect(result.success).toBe(true);
      expect(result.data?.date).toBe(specificDate);
    });

    it('should validate workout data before saving', async () => {
      const invalidWorkout: any = {
        // Missing required fields
        muscleGroup: '',
        exercise: '',
        sets: 0,
        reps: 0,
        weight: -10,
      };

      const result = await workoutService.saveWorkout(invalidWorkout);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors during save', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const workoutInput: WorkoutInput = {
        muscleGroup: 'chest',
        exercise: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 100,
      };

      const result = await workoutService.saveWorkout(workoutInput);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage error');
    });
  });

  describe('updateWorkout', () => {
    it('should update an existing workout successfully', async () => {
      const existingWorkouts = [mockWorkout, mockWorkout2];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingWorkouts)
      );

      const updatedWorkout = {
        id: mockWorkout.id,
        sets: 5,
        reps: 12,
        weight: 110,
      };

      const result = await workoutService.updateWorkout(updatedWorkout);

      expect(result.success).toBe(true);
      expect(result.data?.sets).toBe(5);
      expect(result.data?.reps).toBe(12);
      expect(result.data?.weight).toBe(110);
      expect(result.data?.updatedAt).toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should fail when workout ID is not provided', async () => {
      const result = await workoutService.updateWorkout({ id: '' });

      expect(result.success).toBe(false);
      expect(result.error).toContain('ID 不能為空');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should fail when workout is not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockWorkout])
      );

      const result = await workoutService.updateWorkout({
        id: 'non-existent-id',
        sets: 5,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('找不到要更新的訓練記錄');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should validate updated workout data', async () => {
      const existingWorkouts = [mockWorkout];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingWorkouts)
      );

      const invalidUpdate = {
        id: mockWorkout.id,
        sets: -1, // Invalid
        reps: 0,
      };

      const result = await workoutService.updateWorkout(invalidUpdate);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should preserve unchanged fields during update', async () => {
      const existingWorkouts = [mockWorkout];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingWorkouts)
      );

      const partialUpdate = {
        id: mockWorkout.id,
        sets: 5,
      };

      const result = await workoutService.updateWorkout(partialUpdate);

      expect(result.success).toBe(true);
      expect(result.data?.sets).toBe(5);
      expect(result.data?.exercise).toBe(mockWorkout.exercise); // Unchanged
      expect(result.data?.muscleGroup).toBe(mockWorkout.muscleGroup); // Unchanged
    });
  });

  describe('deleteWorkout', () => {
    it('should delete a workout successfully', async () => {
      const existingWorkouts = [mockWorkout, mockWorkout2];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingWorkouts)
      );

      const result = await workoutService.deleteWorkout(mockWorkout.id);

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      // Verify the deleted workout is removed
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData.length).toBe(1);
      expect(parsedData[0].id).toBe(mockWorkout2.id);
    });

    it('should fail when workout ID is not provided', async () => {
      const result = await workoutService.deleteWorkout('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('ID 不能為空');
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should fail when workout is not found', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockWorkout])
      );

      const result = await workoutService.deleteWorkout('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('找不到要刪除的訓練記錄');
    });

    it('should handle empty workout list', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      const result = await workoutService.deleteWorkout(mockWorkout.id);

      expect(result.success).toBe(false);
    });
  });

  describe('clearAllWorkouts', () => {
    it('should clear all workouts successfully', async () => {
      const result = await workoutService.clearAllWorkouts();

      expect(result.success).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.WORKOUTS);
    });

    it('should use user-specific storage key when userId is provided', async () => {
      const userId = 'user-123';
      await workoutService.clearAllWorkouts(userId);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`workouts_${userId}`);
    });

    it('should handle storage errors during clear', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      const result = await workoutService.clearAllWorkouts();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage error');
    });
  });

  describe('getWorkoutsByExercise', () => {
    it('should filter workouts by exercise', async () => {
      const workouts = [
        mockWorkout,
        mockWorkout2,
        { ...mockWorkout, id: 'test-3', exercise: 'Bench Press' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(workouts)
      );

      const result = await workoutService.getWorkoutsByExercise('Bench Press');

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data?.every(w => w.exercise === 'Bench Press')).toBe(true);
    });

    it('should return empty array when no matching workouts', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([mockWorkout])
      );

      const result = await workoutService.getWorkoutsByExercise('Non-existent Exercise');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should sort workouts by date ascending', async () => {
      const workout1 = { ...mockWorkout, date: '2024-10-22T10:00:00.000Z' };
      const workout2 = { ...mockWorkout, id: 'test-2', date: '2024-10-20T10:00:00.000Z' };
      const workout3 = { ...mockWorkout, id: 'test-3', date: '2024-10-21T10:00:00.000Z' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([workout1, workout2, workout3])
      );

      const result = await workoutService.getWorkoutsByExercise('Bench Press');

      expect(result.success).toBe(true);
      expect(result.data?.[0].date).toBe('2024-10-20T10:00:00.000Z');
      expect(result.data?.[1].date).toBe('2024-10-21T10:00:00.000Z');
      expect(result.data?.[2].date).toBe('2024-10-22T10:00:00.000Z');
    });

    it('should filter out invalid workouts', async () => {
      const validWorkout = mockWorkout;
      const invalidWorkout1 = { ...mockWorkout, id: 'invalid-1', weight: -10 };
      const invalidWorkout2 = { ...mockWorkout, id: 'invalid-2', weight: 0 };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([validWorkout, invalidWorkout1, invalidWorkout2])
      );

      const result = await workoutService.getWorkoutsByExercise('Bench Press');

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].id).toBe(validWorkout.id);
    });
  });

  describe('getLastWorkoutByExercise', () => {
    it('should return the most recent workout for an exercise', async () => {
      const oldWorkout = { ...mockWorkout, date: '2024-10-20T10:00:00.000Z' };
      const newWorkout = { ...mockWorkout, id: 'test-2', date: '2024-10-22T10:00:00.000Z' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify([oldWorkout, newWorkout])
      );

      const result = await workoutService.getLastWorkoutByExercise('Bench Press');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('test-2');
      expect(result.data?.date).toBe('2024-10-22T10:00:00.000Z');
    });

    it('should return null when no workouts exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));

      const result = await workoutService.getLastWorkoutByExercise('Bench Press');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('getAvailableExercises', () => {
    it('should return unique list of exercises', async () => {
      const workouts = [
        mockWorkout,
        { ...mockWorkout, id: 'test-2', exercise: 'Bench Press' },
        mockWorkout2,
        { ...mockWorkout2, id: 'test-3' },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(workouts)
      );

      const result = await workoutService.getAvailableExercises();

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
      expect(result.data).toContain('Bench Press');
      expect(result.data).toContain('Pull-ups');
    });

    it('should return empty array when no workouts exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await workoutService.getAvailableExercises();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('convertAllWorkouts', () => {
    it('should convert workout weights from kg to lb', async () => {
      const workouts = [
        { ...mockWorkout, weight: 100 },
        { ...mockWorkout2, weight: 50 },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(workouts)
      );

      const result = await workoutService.convertAllWorkouts('kg', 'lb');

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();

      // Check converted values
      const savedData = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      expect(parsedData[0].weight).toBeCloseTo(220, 0); // 100kg = ~220lb
      expect(parsedData[1].weight).toBeCloseTo(110, 0); // 50kg = ~110lb
    });

    it('should not convert when units are the same', async () => {
      const result = await workoutService.convertAllWorkouts('kg', 'kg');

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle empty workout list', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await workoutService.convertAllWorkouts('kg', 'lb');

      expect(result.success).toBe(true);
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('queryWorkouts', () => {
    const workouts = [
      mockWorkout,
      mockWorkout2,
      {
        ...mockWorkout,
        id: 'test-3',
        date: '2024-10-22T10:00:00.000Z',
        muscleGroup: 'legs',
        exercise: 'Squats',
      },
    ];

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(workouts)
      );
    });

    it('should filter by exercise', async () => {
      const result = await workoutService.queryWorkouts({
        exercise: 'Bench Press',
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].exercise).toBe('Bench Press');
    });

    it('should filter by muscle group', async () => {
      const result = await workoutService.queryWorkouts({
        muscleGroup: 'chest',
      });

      expect(result.success).toBe(true);
      expect(result.data?.every(w => w.muscleGroup === 'chest')).toBe(true);
    });

    it('should filter by date range', async () => {
      const result = await workoutService.queryWorkouts({
        startDate: '2024-10-21T00:00:00.000Z',
        endDate: '2024-10-23T00:00:00.000Z',
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
    });

    it('should apply limit', async () => {
      const result = await workoutService.queryWorkouts({
        limit: 2,
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
    });

    it('should combine multiple filters', async () => {
      const result = await workoutService.queryWorkouts({
        muscleGroup: 'chest',
        startDate: '2024-10-20T00:00:00.000Z',
        limit: 1,
      });

      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(1);
      expect(result.data?.[0].muscleGroup).toBe('chest');
    });
  });
});

