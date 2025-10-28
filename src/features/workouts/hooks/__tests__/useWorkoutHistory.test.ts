/**
 * useWorkoutHistory Hook Tests
 * 訓練歷史 Hook 測試
 * 
 * Unit tests for workout history state management hook
 * 訓練歷史狀態管理 Hook 的單元測試
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useWorkoutHistory } from '../useWorkoutHistory';
import * as workoutService from '../../services/workoutService';
import type { Workout } from '../../types/workout.types';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => {
    // Immediately invoke the callback for testing
    callback();
  },
}));

jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock workout service
jest.mock('../../services/workoutService');

// Sample test data
const mockWorkout1: Workout = {
  id: 'workout-1',
  date: '2024-10-20T10:00:00.000Z',
  muscleGroup: 'chest',
  exercise: 'Bench Press',
  sets: 3,
  reps: 10,
  weight: 100,
};

const mockWorkout2: Workout = {
  id: 'workout-2',
  date: '2024-10-21T10:00:00.000Z',
  muscleGroup: 'back',
  exercise: 'Pull-ups',
  sets: 4,
  reps: 8,
  weight: 0,
};

const mockWorkout3: Workout = {
  id: 'workout-3',
  date: '2024-10-20T14:00:00.000Z',
  muscleGroup: 'legs',
  exercise: 'Squats',
  sets: 5,
  reps: 5,
  weight: 150,
};

describe('useWorkoutHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Alert.alert as jest.Mock).mockImplementation(() => {});
    
    // Default mock implementations
    (workoutService.loadWorkouts as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
    });
    (workoutService.saveWorkout as jest.Mock).mockResolvedValue({
      success: true,
      data: mockWorkout1,
    });
    (workoutService.updateWorkout as jest.Mock).mockResolvedValue({
      success: true,
      data: mockWorkout1,
    });
    (workoutService.deleteWorkout as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  describe('Initial State', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(result.current.workouts).toEqual([]);
        expect(result.current.selectedDate).toBeNull();
        expect(result.current.selectedWorkouts).toEqual([]);
        expect(result.current.showDetailModal).toBe(false);
        expect(result.current.showEditModal).toBe(false);
        expect(result.current.editingWorkout).toBeNull();
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should load workouts on mount', async () => {
      const mockWorkouts = [mockWorkout1, mockWorkout2];
      (workoutService.loadWorkouts as jest.Mock).mockResolvedValue({
        success: true,
        data: mockWorkouts,
      });

      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(workoutService.loadWorkouts).toHaveBeenCalled();
        expect(result.current.workouts).toEqual(mockWorkouts);
      });
    });

    it('should handle loading errors', async () => {
      (workoutService.loadWorkouts as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Load failed',
      });

      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('common.error', 'Load failed');
      });
    });
  });

  describe('Workout Data Processing', () => {
    it('should group workouts by date', async () => {
      const mockWorkouts = [mockWorkout1, mockWorkout2, mockWorkout3];
      (workoutService.loadWorkouts as jest.Mock).mockResolvedValue({
        success: true,
        data: mockWorkouts,
      });

      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        const workoutData = result.current.workoutData;
        
        // Check that workouts are grouped by date
        expect(workoutData['2024-10-20']).toBeDefined();
        expect(workoutData['2024-10-21']).toBeDefined();
        
        // Check workout count for Oct 20
        expect(workoutData['2024-10-20'].workouts.length).toBe(2);
        
        // Check muscle groups are deduplicated
        expect(workoutData['2024-10-20'].muscleGroups).toContain('chest');
        expect(workoutData['2024-10-20'].muscleGroups).toContain('legs');
      });
    });

    it('should handle empty workout list', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(result.current.workoutData).toEqual({});
      });
    });
  });

  describe('Date Selection', () => {
    it('should handle date change', async () => {
      const { result } = renderHook(() => useWorkoutHistory());
      const testDate = new Date('2024-10-20');

      await waitFor(() => {
        expect(result.current.selectedDate).toBeNull();
      });

      act(() => {
        result.current.handleDateChange(testDate);
      });

      await waitFor(() => {
        expect(result.current.selectedDate).toEqual(testDate);
      });
    });

    it('should handle date press and open detail modal', async () => {
      const mockWorkouts = [mockWorkout1, mockWorkout3];
      (workoutService.loadWorkouts as jest.Mock).mockResolvedValue({
        success: true,
        data: mockWorkouts,
      });

      const { result } = renderHook(() => useWorkoutHistory());
      const testDate = new Date('2024-10-20');

      await waitFor(() => {
        expect(result.current.workouts.length).toBe(2);
      });

      act(() => {
        result.current.handleDatePress(testDate, { workouts: mockWorkouts });
      });

      await waitFor(() => {
        expect(result.current.selectedDate).toEqual(testDate);
        expect(result.current.selectedWorkouts).toEqual(mockWorkouts);
        expect(result.current.showDetailModal).toBe(true);
      });
    });
  });

  describe('Modal Management', () => {
    it('should close detail modal and reset state', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      // First open the modal
      act(() => {
        result.current.handleDatePress(new Date(), { workouts: [mockWorkout1] });
      });

      await waitFor(() => {
        expect(result.current.showDetailModal).toBe(true);
      });

      // Then close it
      act(() => {
        result.current.handleCloseModal();
      });

      await waitFor(() => {
        expect(result.current.showDetailModal).toBe(false);
        expect(result.current.selectedDate).toBeNull();
        expect(result.current.selectedWorkouts).toEqual([]);
      });
    });

    it('should close edit modal and reset edit state', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      // Set up initial state
      act(() => {
        result.current.handleDatePress(new Date(), { workouts: [mockWorkout1] });
      });

      await waitFor(() => {
        expect(result.current.showDetailModal).toBe(true);
      });

      // Open edit modal
      act(() => {
        result.current.handleEditWorkout(mockWorkout1);
      });

      await waitFor(() => {
        expect(result.current.showEditModal).toBe(true);
      });

      // Close edit modal
      act(() => {
        result.current.handleCloseEditModal();
      });

      await waitFor(() => {
        expect(result.current.showEditModal).toBe(false);
        expect(result.current.editingWorkout).toBeNull();
        expect(result.current.editForm.muscleGroup).toBe('');
        expect(result.current.editForm.exercise).toBe('');
      });
    });
  });

  describe('Add Workout', () => {
    it('should open edit modal for adding new workout', async () => {
      const { result } = renderHook(() => useWorkoutHistory());
      const testDate = new Date('2024-10-20');

      // Select a date first
      act(() => {
        result.current.handleDatePress(testDate, { workouts: [] });
      });

      await waitFor(() => {
        expect(result.current.selectedDate).toEqual(testDate);
      });

      // Trigger add workout
      act(() => {
        result.current.handleAddWorkout();
      });

      await waitFor(() => {
        expect(result.current.showDetailModal).toBe(false);
        expect(result.current.editingWorkout).toBeDefined();
        expect(result.current.editingWorkout?.id).toBe(''); // Empty ID for new workout
      });

      // Wait for modal to open (after setTimeout)
      await waitFor(
        () => {
          expect(result.current.showEditModal).toBe(true);
        },
        { timeout: 300 }
      );
    });

    it('should show error if no date selected', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      act(() => {
        result.current.handleAddWorkout();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'common.error',
          'calendar.selectDateFirst'
        );
      });
    });

    it('should reset edit form when adding new workout', async () => {
      const { result } = renderHook(() => useWorkoutHistory());
      const testDate = new Date('2024-10-20');

      act(() => {
        result.current.handleDatePress(testDate, { workouts: [] });
      });

      await waitFor(() => {
        expect(result.current.selectedDate).toEqual(testDate);
      });

      act(() => {
        result.current.handleAddWorkout();
      });

      await waitFor(() => {
        expect(result.current.editForm.muscleGroup).toBe('');
        expect(result.current.editForm.exercise).toBe('');
        expect(result.current.editForm.sets).toBe('');
        expect(result.current.editForm.reps).toBe('');
        expect(result.current.editForm.weight).toBe('');
      });
    });
  });

  describe('Edit Workout', () => {
    it('should open edit modal with workout data', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      act(() => {
        result.current.handleEditWorkout(mockWorkout1);
      });

      await waitFor(() => {
        expect(result.current.editingWorkout).toEqual(mockWorkout1);
        expect(result.current.editForm.muscleGroup).toBe(mockWorkout1.muscleGroup);
        expect(result.current.editForm.exercise).toBe(mockWorkout1.exercise);
        expect(result.current.editForm.sets).toBe(mockWorkout1.sets.toString());
        expect(result.current.editForm.reps).toBe(mockWorkout1.reps.toString());
        expect(result.current.editForm.weight).toBe(mockWorkout1.weight.toString());
      });

      await waitFor(
        () => {
          expect(result.current.showEditModal).toBe(true);
        },
        { timeout: 300 }
      );
    });

    it('should show error for invalid workout', async () => {
      const { result } = renderHook(() => useWorkoutHistory());
      const invalidWorkout = { ...mockWorkout1, id: '' };

      act(() => {
        result.current.handleEditWorkout(invalidWorkout as Workout);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'common.error',
          'calendar.cannotEditWorkout'
        );
      });
    });
  });

  describe('Delete Workout', () => {
    it('should show confirmation dialog and delete workout', async () => {
      const mockWorkouts = [mockWorkout1, mockWorkout2];
      (workoutService.loadWorkouts as jest.Mock).mockResolvedValue({
        success: true,
        data: mockWorkouts,
      });

      const { result } = renderHook(() => useWorkoutHistory());

      // Setup: select workouts
      await waitFor(() => {
        expect(result.current.workouts.length).toBe(2);
      });

      act(() => {
        result.current.handleDatePress(new Date(), { workouts: mockWorkouts });
      });

      // Mock Alert.alert to auto-confirm deletion
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          const deleteButton = buttons?.find((b: any) => b.style === 'destructive');
          if (deleteButton?.onPress) {
            deleteButton.onPress();
          }
        }
      );

      act(() => {
        result.current.handleDeleteWorkout(mockWorkout1);
      });

      await waitFor(() => {
        expect(workoutService.deleteWorkout).toHaveBeenCalledWith(
          mockWorkout1.id,
          undefined
        );
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'calendar.confirmDelete',
          'calendar.confirmDeleteMessage',
          expect.any(Array)
        );
      });
    });

    it('should show error for invalid workout', async () => {
      const { result } = renderHook(() => useWorkoutHistory());
      const invalidWorkout = { ...mockWorkout1, id: '' };

      act(() => {
        result.current.handleDeleteWorkout(invalidWorkout as Workout);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'common.error',
          'calendar.cannotDeleteWorkout'
        );
      });
    });

    it('should handle delete failure', async () => {
      (workoutService.deleteWorkout as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      const { result } = renderHook(() => useWorkoutHistory());

      // Mock Alert to auto-confirm
      (Alert.alert as jest.Mock).mockImplementation(
        (title, message, buttons) => {
          const deleteButton = buttons?.find((b: any) => b.style === 'destructive');
          if (deleteButton?.onPress) {
            deleteButton.onPress();
          }
        }
      );

      act(() => {
        result.current.handleDeleteWorkout(mockWorkout1);
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'common.error',
          'Delete failed'
        );
      });
    });
  });

  describe('Save Edit', () => {
    it('should validate form before saving', async () => {
      const { result } = renderHook(() => useWorkoutHistory());
      const testDate = new Date('2024-10-20');

      // Setup: prepare for new workout
      act(() => {
        result.current.handleDatePress(testDate, { workouts: [] });
      });

      await waitFor(() => {
        expect(result.current.selectedDate).toEqual(testDate);
      });

      act(() => {
        result.current.handleAddWorkout();
      });

      await waitFor(() => {
        expect(result.current.editingWorkout).toBeDefined();
      });

      // Try to save with empty form
      act(() => {
        result.current.handleSaveEdit();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'common.error',
          'workout.fillAllFields'
        );
        expect(workoutService.saveWorkout).not.toHaveBeenCalled();
      });
    });

    it('should save new workout successfully', async () => {
      const { result } = renderHook(() => useWorkoutHistory());
      const testDate = new Date('2024-10-20');

      // Setup
      act(() => {
        result.current.handleDatePress(testDate, { workouts: [] });
      });

      await waitFor(() => {
        expect(result.current.selectedDate).toEqual(testDate);
      });

      act(() => {
        result.current.handleAddWorkout();
      });

      await waitFor(() => {
        expect(result.current.editingWorkout).toBeDefined();
      });

      // Fill form
      act(() => {
        result.current.updateEditForm({
          muscleGroup: 'chest',
          exercise: 'Bench Press',
          sets: '3',
          reps: '10',
          weight: '100',
        });
      });

      // Save
      await act(async () => {
        await result.current.handleSaveEdit();
      });

      await waitFor(() => {
        expect(workoutService.saveWorkout).toHaveBeenCalledWith(
          expect.objectContaining({
            muscleGroup: 'chest',
            exercise: 'Bench Press',
            sets: 3,
            reps: 10,
            weight: 100,
          }),
          undefined
        );
        expect(Alert.alert).toHaveBeenCalledWith(
          'common.success',
          'calendar.workoutAdded'
        );
      });
    });

    it('should update existing workout successfully', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      // Setup: edit existing workout
      act(() => {
        result.current.handleEditWorkout(mockWorkout1);
      });

      await waitFor(() => {
        expect(result.current.editingWorkout).toEqual(mockWorkout1);
      });

      // Modify form
      act(() => {
        result.current.updateEditForm({
          sets: '5',
          reps: '12',
        });
      });

      // Save
      await act(async () => {
        await result.current.handleSaveEdit();
      });

      await waitFor(() => {
        expect(workoutService.updateWorkout).toHaveBeenCalledWith(
          expect.objectContaining({
            id: mockWorkout1.id,
            sets: 5,
            reps: 12,
          }),
          undefined
        );
        expect(Alert.alert).toHaveBeenCalledWith(
          'common.success',
          'calendar.workoutUpdated'
        );
      });
    });

    it('should handle save failure', async () => {
      (workoutService.saveWorkout as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Save failed',
      });

      const { result } = renderHook(() => useWorkoutHistory());
      const testDate = new Date('2024-10-20');

      // Setup
      act(() => {
        result.current.handleDatePress(testDate, { workouts: [] });
      });

      await waitFor(() => {
        expect(result.current.selectedDate).toEqual(testDate);
      });

      act(() => {
        result.current.handleAddWorkout();
      });

      await waitFor(() => {
        expect(result.current.editingWorkout).toBeDefined();
      });

      // Fill form
      act(() => {
        result.current.updateEditForm({
          muscleGroup: 'chest',
          exercise: 'Bench Press',
          sets: '3',
          reps: '10',
          weight: '100',
        });
      });

      // Save
      await act(async () => {
        await result.current.handleSaveEdit();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('common.error', 'Save failed');
      });
    });
  });

  describe('Form Updates', () => {
    it('should update form fields', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      act(() => {
        result.current.updateEditForm({
          muscleGroup: 'chest',
          exercise: 'Bench Press',
        });
      });

      await waitFor(() => {
        expect(result.current.editForm.muscleGroup).toBe('chest');
        expect(result.current.editForm.exercise).toBe('Bench Press');
      });

      // Update partial fields
      act(() => {
        result.current.updateEditForm({
          sets: '5',
        });
      });

      await waitFor(() => {
        expect(result.current.editForm.muscleGroup).toBe('chest'); // Unchanged
        expect(result.current.editForm.sets).toBe('5');
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should reload workouts on refresh', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      await waitFor(() => {
        expect(workoutService.loadWorkouts).toHaveBeenCalled();
      });

      jest.clearAllMocks();

      await act(async () => {
        await result.current.handleRefresh();
      });

      await waitFor(() => {
        expect(workoutService.loadWorkouts).toHaveBeenCalled();
      });
    });

    it('should manage refreshing state', async () => {
      const { result } = renderHook(() => useWorkoutHistory());

      expect(result.current.isRefreshing).toBe(false);

      const refreshPromise = act(async () => {
        await result.current.handleRefresh();
      });

      await waitFor(() => {
        expect(result.current.isRefreshing).toBe(false);
      });

      await refreshPromise;
    });
  });

  describe('Multi-User Support', () => {
    it('should use userId when provided', async () => {
      const userId = 'user-123';
      const { result } = renderHook(() => useWorkoutHistory(userId));

      await waitFor(() => {
        expect(workoutService.loadWorkouts).toHaveBeenCalledWith(userId);
      });
    });
  });
});


