/**
 * useQuickLog Hook Tests
 * 快速記錄 Hook 測試
 * 
 * Unit tests for quick log state management hook
 * 快速記錄狀態管理 Hook 的單元測試
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useQuickLog } from '../useQuickLog';
import * as workoutService from '../../../workouts/services/workoutService';
import * as progressService from '../../../progress/services/progressService';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useUnit } from '../../../../shared/hooks/useUnit';
import type { ExerciseEntry } from '../../../live-workout/types/liveWorkout.types';

// Mock dependencies
jest.mock('../../../workouts/services/workoutService');
jest.mock('../../../progress/services/progressService');
jest.mock('../../../auth/hooks/useAuth');
jest.mock('../../../../shared/hooks/useUnit');
jest.mock('../../../../shared/services/api/authService', () => ({
  initializeAuth: jest.fn(),
  getCurrentUser: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('../../../../shared/i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
    changeLanguage: jest.fn(),
  },
}));
jest.mock('expo-localization', () => ({
  __esModule: true,
  default: {
    locale: 'en-US',
  },
}));

const mockedWorkoutService = workoutService as jest.Mocked<typeof workoutService>;
const mockedProgressService = progressService as jest.Mocked<typeof progressService>;
const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockedUseUnit = useUnit as jest.MockedFunction<typeof useUnit>;

// Sample test data
const mockUser = { id: 'user-1', email: 'test@example.com' };

const mockExercise1: ExerciseEntry = {
  id: 'ex-1',
  exercise: 'Bench Press',
  name: 'Bench Press',
  nameKey: 'exercises.bench_press',
  muscleGroup: 'Chest',
  muscleGroupKey: 'muscleGroups.Chest',
  sets: 3,
  reps: 10,
  weight: 100,
};

const mockExercise2: ExerciseEntry = {
  id: 'ex-2',
  exercise: 'Squat',
  name: 'Squat',
  nameKey: 'exercises.squat',
  muscleGroup: 'Legs',
  muscleGroupKey: 'muscleGroups.Legs',
  sets: 4,
  reps: 8,
  weight: 150,
};

describe('useQuickLog', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockedUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
    } as any);

    mockedUseUnit.mockReturnValue({
      currentUnit: 'kg',
      formatWeight: (value: number) => `${value} kg`,
      convertWeightValue: (value: number) => value,
    } as any);

    mockedWorkoutService.getLastWorkoutByExercise.mockResolvedValue({
      success: true,
      data: {
        id: 'last-1',
        exercise: 'Bench Press',
        reps: 10,
        weight: 95,
        sets: 3,
        date: '2024-10-19T10:00:00.000Z',
      },
    } as any);

    mockedProgressService.getTargetWeight.mockResolvedValue({
      success: true,
      data: 100,
    });

    mockedWorkoutService.saveMultipleWorkouts.mockResolvedValue({
      success: true,
      data: [
        { id: 'saved-1', exercise: 'Bench Press', date: new Date().toISOString() },
        { id: 'saved-2', exercise: 'Bench Press', date: new Date().toISOString() },
      ],
    } as any);
  });

  describe('initialization', () => {
    it('should initialize workout data for initial exercises', async () => {
      // Arrange
      const initialExercises = [mockExercise1];

      // Act
      const { result } = renderHook(() => useQuickLog(initialExercises));

      // Assert
      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      expect(mockedWorkoutService.getLastWorkoutByExercise).toHaveBeenCalledWith(
        'Bench Press',
        'user-1'
      );
      expect(mockedProgressService.getTargetWeight).toHaveBeenCalledWith('Bench Press');
    });

    it('should initialize activeExercises with initial exercises', () => {
      // Arrange
      const initialExercises = [mockExercise1, mockExercise2];

      // Act
      const { result } = renderHook(() => useQuickLog(initialExercises));

      // Assert
      expect(result.current.state.activeExercises).toHaveLength(2);
      expect(result.current.state.activeExercises[0].exercise).toBe('Bench Press');
      expect(result.current.state.activeExercises[1].exercise).toBe('Squat');
    });

    it('should handle empty initial exercises', () => {
      // Act
      const { result } = renderHook(() => useQuickLog([]));

      // Assert
      expect(result.current.state.activeExercises).toHaveLength(0);
      expect(result.current.state.workoutData).toEqual({});
    });
  });

  describe('state updates', () => {
    it('should update set data correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Act
      act(() => {
        result.current.actions.updateSetData('Bench Press', 0, 'reps', 12);
      });

      // Assert
      const benchPressData = result.current.state.workoutData['Bench Press'];
      expect(benchPressData.sets[0].reps).toBe(12);
    });

    it('should update weight correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Act
      act(() => {
        result.current.actions.updateSetData('Bench Press', 0, 'weight', 105);
      });

      // Assert
      const benchPressData = result.current.state.workoutData['Bench Press'];
      expect(benchPressData.sets[0].weight).toBe(105);
    });

    it('should add a new set', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      const initialSetCount = result.current.state.workoutData['Bench Press'].sets.length;

      // Act
      act(() => {
        result.current.actions.addSet('Bench Press');
      });

      // Assert
      const benchPressData = result.current.state.workoutData['Bench Press'];
      expect(benchPressData.sets.length).toBe(initialSetCount + 1);
      // New set should copy values from last set
      const lastSet = benchPressData.sets[benchPressData.sets.length - 1];
      const previousSet = benchPressData.sets[benchPressData.sets.length - 2];
      expect(lastSet.reps).toBe(previousSet.reps);
      expect(lastSet.weight).toBe(previousSet.weight);
    });

    it('should remove a set', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Add a set first
      act(() => {
        result.current.actions.addSet('Bench Press');
      });

      const setCountBefore = result.current.state.workoutData['Bench Press'].sets.length;
      expect(setCountBefore).toBeGreaterThan(1);

      // Act
      act(() => {
        result.current.actions.removeSet('Bench Press', 0);
      });

      // Assert
      const benchPressData = result.current.state.workoutData['Bench Press'];
      expect(benchPressData.sets.length).toBe(setCountBefore - 1);
    });

    it('should not remove the last set', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      const initialSetCount = result.current.state.workoutData['Bench Press'].sets.length;

      // Act
      act(() => {
        result.current.actions.removeSet('Bench Press', 0);
      });

      // Assert
      const benchPressData = result.current.state.workoutData['Bench Press'];
      // Should still have at least 1 set
      expect(benchPressData.sets.length).toBe(initialSetCount);
    });
  });

  describe('addNewExercise', () => {
    it('should add a new exercise to activeExercises', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      const newExercise: ExerciseEntry = {
        id: 'ex-3',
        exercise: 'Deadlift',
        name: 'Deadlift',
        nameKey: 'exercises.deadlift',
        muscleGroup: 'Back',
        muscleGroupKey: 'muscleGroups.Back',
        sets: 5,
        reps: 5,
        weight: 180,
      };

      // Act
      await act(async () => {
        await result.current.actions.addNewExercise(newExercise);
      });

      // Assert
      expect(result.current.state.activeExercises).toHaveLength(2);
      expect(result.current.state.activeExercises[1].exercise).toBe('Deadlift');
      expect(result.current.state.workoutData['Deadlift']).toBeDefined();
    });

    it('should throw error if exercise already exists', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.actions.addNewExercise(mockExercise1);
        })
      ).rejects.toThrow('already exists in the list');
    });

    it('should throw error if exercise name is missing', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      const invalidExercise: ExerciseEntry = {
        id: 'ex-invalid',
        exercise: '',
        name: '',
        muscleGroup: 'Chest',
      };

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.actions.addNewExercise(invalidExercise);
        })
      ).rejects.toThrow('Exercise name is required');
    });
  });

  describe('batch save', () => {
    it('should save all workouts in a single batch API call', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([mockExercise1, mockExercise2]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBe(2);
        },
        { timeout: 3000 }
      );

      // Add some sets
      act(() => {
        result.current.actions.addSet('Bench Press');
        result.current.actions.addSet('Squat');
      });

      // Act
      let saveResult: any;
      await act(async () => {
        saveResult = await result.current.actions.saveAllWorkouts();
      });

      // Assert
      expect(saveResult.success).toBe(true);
      expect(saveResult.count).toBeGreaterThan(0);
      
      // Verify saveMultipleWorkouts was called ONCE with all workouts
      expect(mockedWorkoutService.saveMultipleWorkouts).toHaveBeenCalledTimes(1);
      
      const callArgs = mockedWorkoutService.saveMultipleWorkouts.mock.calls[0];
      const workoutsToSave = callArgs[0];
      const userId = callArgs[1];

      expect(userId).toBe('user-1');
      expect(workoutsToSave.length).toBeGreaterThan(0);
      
      // Verify all workouts have correct structure
      workoutsToSave.forEach((workout: any) => {
        expect(workout).toHaveProperty('exercise');
        expect(workout).toHaveProperty('muscleGroup');
        expect(workout).toHaveProperty('weight');
        expect(workout).toHaveProperty('reps');
        expect(workout).toHaveProperty('sets', 1); // Each set is saved as separate record
        expect(workout).toHaveProperty('date');
      });
    });

    it('should return error if user is not logged in', async () => {
      // Arrange
      mockedUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
      } as any);

      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Act
      let saveResult: any;
      await act(async () => {
        saveResult = await result.current.actions.saveAllWorkouts();
      });

      // Assert
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toContain('not logged in');
      expect(mockedWorkoutService.saveMultipleWorkouts).not.toHaveBeenCalled();
    });

    it('should return error if there are no workouts to save', async () => {
      // Arrange
      const { result } = renderHook(() => useQuickLog([]));

      // Act
      let saveResult: any;
      await act(async () => {
        saveResult = await result.current.actions.saveAllWorkouts();
      });

      // Assert
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toContain('No workouts to save');
      expect(mockedWorkoutService.saveMultipleWorkouts).not.toHaveBeenCalled();
    });

    it('should handle save failure correctly', async () => {
      // Arrange
      mockedWorkoutService.saveMultipleWorkouts.mockResolvedValue({
        success: false,
        error: 'Database error',
      } as any);

      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(
        () => {
          expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
        },
        { timeout: 3000 }
      );

      // Act
      let saveResult: any;
      await act(async () => {
        saveResult = await result.current.actions.saveAllWorkouts();
      });

      // Assert
      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toBe('Database error');
      expect(result.current.state.error).toBe('Database error');
    });

    it('should set isSaving state correctly during save', async () => {
      // Arrange
      let resolveSave: (value: any) => void;
      const savePromise = new Promise((resolve) => {
        resolveSave = resolve;
      });

      mockedWorkoutService.saveMultipleWorkouts.mockReturnValue(savePromise as any);

      const { result } = renderHook(() => useQuickLog([mockExercise1]));

      await waitFor(() => {
        expect(Object.keys(result.current.state.workoutData).length).toBeGreaterThan(0);
      });

      // Act
      act(() => {
        result.current.actions.saveAllWorkouts();
      });

      // Assert - should be saving
      await waitFor(() => {
        expect(result.current.state.isSaving).toBe(true);
      });

      // Resolve the promise
      resolveSave!({
        success: true,
        data: [{ id: 'saved-1' }],
      });

      // Assert - should not be saving after completion
      await waitFor(() => {
        expect(result.current.state.isSaving).toBe(false);
      });
    });
  });
});

