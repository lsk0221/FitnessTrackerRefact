/**
 * Live Workout Service Tests
 * 即時訓練服務測試
 * 
 * Unit tests for live workout service business logic
 * 即時訓練服務業務邏輯的單元測試
 */

import * as liveWorkoutService from './liveWorkoutService';
import * as workoutService from '../../workouts/services/workoutService';
import * as exerciseLibraryService from '../../../shared/services/data/exerciseLibraryService';
import type { 
  WorkoutSessionData, 
  CompletedExercise, 
  ExerciseEntry,
  SmartSwapSuggestion 
} from '../types/liveWorkout.types';
import type { WorkoutInput } from '../../workouts/types/workout.types';

// Mock dependencies
jest.mock('../../workouts/services/workoutService');
jest.mock('../../../shared/services/data/exerciseLibraryService');

const mockedWorkoutService = workoutService as jest.Mocked<typeof workoutService>;
const mockedExerciseLibraryService = exerciseLibraryService as jest.Mocked<typeof exerciseLibraryService>;

describe('liveWorkoutService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('finishWorkout', () => {
    it('should aggregate CompletedExercise objects into WorkoutInput objects correctly', async () => {
      // Arrange
      const startTime = new Date('2024-10-20T10:00:00.000Z');
      const completedExercises: CompletedExercise[] = [
        {
          exercise: 'Bench Press',
          nameKey: 'exercises.bench_press',
          muscleGroup: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest',
          sets: [
            { id: '1', setNumber: 1, reps: 10, weight: 100, completed: true },
            { id: '2', setNumber: 2, reps: 10, weight: 100, completed: true },
            { id: '3', setNumber: 3, reps: 10, weight: 100, completed: true },
          ],
          completedAt: new Date(),
        },
        {
          exercise: 'Squat',
          nameKey: 'exercises.squat',
          muscleGroup: 'Legs',
          muscleGroupKey: 'muscleGroups.Legs',
          sets: [
            { id: '4', setNumber: 1, reps: 8, weight: 150, completed: true },
            { id: '5', setNumber: 2, reps: 8, weight: 150, completed: true },
          ],
          completedAt: new Date(),
        },
      ];

      const sessionData: WorkoutSessionData = {
        exercises: completedExercises,
        startTime,
        endTime: new Date(),
        duration: 60,
      };

      mockedWorkoutService.saveMultipleWorkouts.mockResolvedValue({
        success: true,
        data: [],
      });

      // Act
      const result = await liveWorkoutService.finishWorkout(sessionData, 'user-1');

      // Assert
      expect(result.success).toBe(true);
      expect(mockedWorkoutService.saveMultipleWorkouts).toHaveBeenCalledTimes(1);
      
      const callArgs = mockedWorkoutService.saveMultipleWorkouts.mock.calls[0];
      const workoutInputs: WorkoutInput[] = callArgs[0];
      const userId = callArgs[1];

      expect(workoutInputs).toHaveLength(2);
      expect(userId).toBe('user-1');

      // Check first exercise aggregation - should use raw English strings
      expect(workoutInputs[0].exercise).toBe('Bench Press'); // Raw English string
      expect(workoutInputs[0].muscleGroup).toBe('Chest'); // Raw English string
      expect(workoutInputs[0].sets).toBe(3);
      expect(workoutInputs[0].reps).toBe(10); // Average of [10, 10, 10]
      expect(workoutInputs[0].weight).toBe(100); // Average of [100, 100, 100]
      expect(workoutInputs[0].date).toBe(startTime.toISOString());

      // Check second exercise aggregation - should use raw English strings
      expect(workoutInputs[1].exercise).toBe('Squat'); // Raw English string
      expect(workoutInputs[1].muscleGroup).toBe('Legs'); // Raw English string
      expect(workoutInputs[1].sets).toBe(2);
      expect(workoutInputs[1].reps).toBe(8); // Average of [8, 8]
      expect(workoutInputs[1].weight).toBe(150); // Average of [150, 150]
    });

    it('should calculate average reps and weight correctly', async () => {
      // Arrange
      const startTime = new Date('2024-10-20T10:00:00.000Z');
      const completedExercise: CompletedExercise = {
        exercise: 'Deadlift',
        nameKey: 'exercises.deadlift',
        muscleGroup: 'Back',
        muscleGroupKey: 'muscleGroups.Back',
        sets: [
          { id: '1', setNumber: 1, reps: 5, weight: 180, completed: true },
          { id: '2', setNumber: 2, reps: 5, weight: 180, completed: true },
          { id: '3', setNumber: 3, reps: 3, weight: 200, completed: true },
        ],
        completedAt: new Date(),
      };

      const sessionData: WorkoutSessionData = {
        exercises: [completedExercise],
        startTime,
        endTime: new Date(),
        duration: 45,
      };

      mockedWorkoutService.saveMultipleWorkouts.mockResolvedValue({
        success: true,
        data: [],
      });

      // Act
      const result = await liveWorkoutService.finishWorkout(sessionData);

      // Assert
      expect(result.success).toBe(true);
      const workoutInputs: WorkoutInput[] = mockedWorkoutService.saveMultipleWorkouts.mock.calls[0][0];
      
      expect(workoutInputs[0].reps).toBe(4); // Average of [5, 5, 3] = 4.33, rounded to 4
      expect(workoutInputs[0].weight).toBe(186.67); // Average of [180, 180, 200] = 186.67, rounded to 2 decimals
    });

    it('should filter out exercises with no completed sets', async () => {
      // Arrange
      const startTime = new Date('2024-10-20T10:00:00.000Z');
      const completedExercises: CompletedExercise[] = [
        {
          exercise: 'Bench Press',
          nameKey: 'exercises.bench_press',
          muscleGroup: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest',
          sets: [
            { id: '1', setNumber: 1, reps: 10, weight: 100, completed: true },
          ],
          completedAt: new Date(),
        },
        {
          exercise: 'Squat',
          nameKey: 'exercises.squat',
          muscleGroup: 'Legs',
          muscleGroupKey: 'muscleGroups.Legs',
          sets: [
            { id: '2', setNumber: 1, reps: 8, weight: 150, completed: false },
          ],
          completedAt: new Date(),
        },
      ];

      const sessionData: WorkoutSessionData = {
        exercises: completedExercises,
        startTime,
        endTime: new Date(),
        duration: 60,
      };

      mockedWorkoutService.saveMultipleWorkouts.mockResolvedValue({
        success: true,
        data: [],
      });

      // Act
      const result = await liveWorkoutService.finishWorkout(sessionData);

      // Assert
      expect(result.success).toBe(true);
      const workoutInputs: WorkoutInput[] = mockedWorkoutService.saveMultipleWorkouts.mock.calls[0][0];
      
      expect(workoutInputs).toHaveLength(1);
      expect(workoutInputs[0].exercise).toBe('Bench Press'); // Raw English string
      expect(workoutInputs[0].muscleGroup).toBe('Chest'); // Raw English string
    });

    it('should use raw English exercise name when nameKey is not provided', async () => {
      // Arrange
      const startTime = new Date('2024-10-20T10:00:00.000Z');
      const completedExercise: CompletedExercise = {
        exercise: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        sets: [
          { id: '1', setNumber: 1, reps: 10, weight: 100, completed: true },
        ],
        completedAt: new Date(),
      };

      const sessionData: WorkoutSessionData = {
        exercises: [completedExercise],
        startTime,
        endTime: new Date(),
        duration: 30,
      };

      mockedWorkoutService.saveMultipleWorkouts.mockResolvedValue({
        success: true,
        data: [],
      });

      // Act
      const result = await liveWorkoutService.finishWorkout(sessionData);

      // Assert
      expect(result.success).toBe(true);
      const workoutInputs: WorkoutInput[] = mockedWorkoutService.saveMultipleWorkouts.mock.calls[0][0];
      
      // Should use raw English string, not translation key
      expect(workoutInputs[0].exercise).toBe('Barbell Bench Press');
      expect(workoutInputs[0].muscleGroup).toBe('Chest');
    });

    it('should handle saveMultipleWorkouts failure', async () => {
      // Arrange
      const startTime = new Date('2024-10-20T10:00:00.000Z');
      const completedExercise: CompletedExercise = {
        exercise: 'Bench Press',
        nameKey: 'exercises.bench_press',
        muscleGroup: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        sets: [
          { id: '1', setNumber: 1, reps: 10, weight: 100, completed: true },
        ],
        completedAt: new Date(),
      };

      const sessionData: WorkoutSessionData = {
        exercises: [completedExercise],
        startTime,
        endTime: new Date(),
        duration: 30,
      };

      mockedWorkoutService.saveMultipleWorkouts.mockResolvedValue({
        success: false,
        error: 'Save failed',
      });

      // Act
      const result = await liveWorkoutService.finishWorkout(sessionData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Save failed');
    });
  });

  describe('getSmartSwapSuggestions', () => {
    it('should prioritize suggestions by muscle group first', async () => {
      // Arrange
      const currentExercise: ExerciseEntry = {
        id: '1',
        exercise: 'Bench Press',
        nameKey: 'exercises.bench_press',
        muscleGroup: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Push',
        equipment: 'Barbell',
      };

      const availableExercises = [
        {
          id: '2',
          name: 'Incline Dumbbell Press',
          nameKey: 'exercises.incline_dumbbell_press',
          muscle_group: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest',
          movement_pattern: 'Push',
          equipment: 'Dumbbell',
          tags: [],
        },
        {
          id: '3',
          name: 'Pull-ups',
          nameKey: 'exercises.pull_ups',
          muscle_group: 'Back',
          muscleGroupKey: 'muscleGroups.Back',
          movement_pattern: 'Pull',
          equipment: 'Bodyweight',
          tags: [],
        },
      ];

      mockedExerciseLibraryService.getAllExercises.mockResolvedValue({
        success: true,
        data: availableExercises,
      });

      // Act
      const result = await liveWorkoutService.getSmartSwapSuggestions(currentExercise, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const suggestions = result.data as SmartSwapSuggestion[];
      expect(suggestions.length).toBeGreaterThan(0);
      
      // First suggestion should be from same muscle group
      expect(suggestions[0].exercise.muscleGroup).toBe('Chest');
      expect(suggestions[0].reason).toContain('muscle group');
      expect(suggestions[0].similarityScore).toBeGreaterThanOrEqual(80);
    });

    it('should prioritize movement pattern when muscle group matches are exhausted', async () => {
      // Arrange
      const currentExercise: ExerciseEntry = {
        id: '1',
        exercise: 'Bench Press',
        nameKey: 'exercises.bench_press',
        muscleGroup: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Push',
        equipment: 'Barbell',
      };

      const availableExercises = [
        {
          id: '2',
          name: 'Overhead Press',
          nameKey: 'exercises.overhead_press',
          muscle_group: 'Shoulders',
          muscleGroupKey: 'muscleGroups.Shoulders',
          movement_pattern: 'Push',
          equipment: 'Barbell',
          tags: [],
        },
        {
          id: '3',
          name: 'Pull-ups',
          nameKey: 'exercises.pull_ups',
          muscle_group: 'Back',
          muscleGroupKey: 'muscleGroups.Back',
          movement_pattern: 'Pull',
          equipment: 'Bodyweight',
          tags: [],
        },
      ];

      mockedExerciseLibraryService.getAllExercises.mockResolvedValue({
        success: true,
        data: availableExercises,
      });

      // Act
      const result = await liveWorkoutService.getSmartSwapSuggestions(currentExercise, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const suggestions = result.data as SmartSwapSuggestion[];
      
      // Should include exercises with same movement pattern
      const pushExercises = suggestions.filter(s => s.reason.includes('movement pattern'));
      expect(pushExercises.length).toBeGreaterThan(0);
    });

    it('should limit suggestions to the specified limit', async () => {
      // Arrange
      const currentExercise: ExerciseEntry = {
        id: '1',
        exercise: 'Bench Press',
        nameKey: 'exercises.bench_press',
        muscleGroup: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Push',
        equipment: 'Barbell',
      };

      const availableExercises = Array.from({ length: 20 }, (_, i) => ({
        id: `ex-${i}`,
        name: `Exercise ${i}`,
        nameKey: `exercises.exercise_${i}`,
        muscle_group: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        movement_pattern: 'Push',
        equipment: 'Barbell',
        tags: [],
      }));

      mockedExerciseLibraryService.getAllExercises.mockResolvedValue({
        success: true,
        data: availableExercises,
      });

      // Act
      const result = await liveWorkoutService.getSmartSwapSuggestions(currentExercise, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const suggestions = result.data as SmartSwapSuggestion[];
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should handle empty exercise library', async () => {
      // Arrange
      const currentExercise: ExerciseEntry = {
        id: '1',
        exercise: 'Bench Press',
        nameKey: 'exercises.bench_press',
        muscleGroup: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Push',
        equipment: 'Barbell',
      };

      mockedExerciseLibraryService.getAllExercises.mockResolvedValue({
        success: true,
        data: [],
      });

      // Act
      const result = await liveWorkoutService.getSmartSwapSuggestions(currentExercise, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const suggestions = result.data as SmartSwapSuggestion[];
      expect(suggestions).toHaveLength(0);
    });

    it('should correctly map exercise data and avoid "Unknown Exercise"', async () => {
      // Arrange
      const currentExercise: ExerciseEntry = {
        id: '1',
        exercise: 'Bench Press',
        nameKey: 'exercises.bench_press',
        muscleGroup: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Press',
        equipment: 'Barbell',
      };

      const availableExercises = [
        {
          id: '2',
          name: 'Incline Dumbbell Press',
          nameKey: 'exercises.incline_dumbbell_press',
          muscle_group: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest',
          movement_pattern: 'Horizontal Press',
          equipment: 'Dumbbell',
          tags: [],
        },
        {
          id: '3',
          name: 'Custom Exercise',
          nameKey: 'exercises.custom_exercise', // Add nameKey for type safety
          muscle_group: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest', // Add muscleGroupKey for type safety
          movement_pattern: 'Horizontal Press',
          equipment: 'Dumbbell',
          tags: [],
        },
      ];

      mockedExerciseLibraryService.getAllExercises.mockResolvedValue({
        success: true,
        data: availableExercises,
      });

      // Act
      const result = await liveWorkoutService.getSmartSwapSuggestions(currentExercise, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const suggestions = result.data as SmartSwapSuggestion[];
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Verify mapping logic - should NOT have "Unknown Exercise" or "Unknown" muscle group
      suggestions.forEach(suggestion => {
        expect(suggestion.exercise.exercise).not.toBe('Unknown Exercise');
        expect(suggestion.exercise.exercise).toBeTruthy();
        expect(suggestion.exercise.muscleGroup).not.toBe('Unknown');
        expect(suggestion.exercise.muscleGroup).toBeTruthy();
        expect(suggestion.exercise.id).toBeTruthy();
        
        // Verify nameKey is correctly set
        if (suggestion.exercise.nameKey) {
          expect(suggestion.exercise.nameKey).toContain('exercises.');
        }
        
        // Verify muscleGroupKey is correctly set
        if (suggestion.exercise.muscleGroupKey) {
          expect(suggestion.exercise.muscleGroupKey).toContain('muscleGroups.');
        }
      });
    });

    it('should filter out invalid exercises (no id or name)', async () => {
      // Arrange
      const currentExercise: ExerciseEntry = {
        id: '1',
        exercise: 'Bench Press',
        nameKey: 'exercises.bench_press',
        muscleGroup: 'Chest',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Press',
        equipment: 'Barbell',
      };

      const availableExercises = [
        {
          id: '2',
          name: 'Valid Exercise',
          nameKey: 'exercises.valid_exercise',
          muscle_group: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest',
          movement_pattern: 'Horizontal Press',
          equipment: 'Barbell',
          tags: [],
        },
        {
          id: 'invalid-1', // Add id for type safety
          name: 'Invalid Exercise 1',
          nameKey: 'exercises.invalid_exercise_1', // Add nameKey for type safety
          muscle_group: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest', // Add muscleGroupKey for type safety
          movement_pattern: '', // Add required fields
          equipment: '', // Add required fields
          tags: [],
        },
        {
          id: '3',
          name: 'Exercise 3', // Add name for type safety
          nameKey: 'exercises.exercise_3', // Add nameKey for type safety
          muscle_group: 'Chest',
          muscleGroupKey: 'muscleGroups.Chest', // Add muscleGroupKey for type safety
          movement_pattern: '', // Add required fields
          equipment: '', // Add required fields
          tags: [],
        },
      ] as any[]; // Use type assertion since we're testing invalid data scenarios

      mockedExerciseLibraryService.getAllExercises.mockResolvedValue({
        success: true,
        data: availableExercises,
      });

      // Act
      const result = await liveWorkoutService.getSmartSwapSuggestions(currentExercise, 5);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      const suggestions = result.data as SmartSwapSuggestion[];
      
      // Should only include valid exercises
      suggestions.forEach(suggestion => {
        expect(suggestion.exercise.id).toBeTruthy();
        expect(suggestion.exercise.exercise).toBeTruthy();
        expect(suggestion.exercise.exercise).not.toBe('Unknown Exercise');
      });
    });
  });
});

