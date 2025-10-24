/**
 * Workouts Feature - Barrel Export
 * 訓練功能 - 統一導出
 * 
 * This file provides a centralized export point for the workouts feature
 * 此文件為訓練功能提供統一的導出點
 */

// Types
export type {
  Workout,
  WorkoutInput,
  WorkoutUpdate,
  WorkoutDataByDate,
  WorkoutStats,
  ValidationResult,
  WorkoutQueryParams,
  WorkoutServiceResult,
} from './types/workout.types';

// Services
export {
  loadWorkouts,
  saveWorkout,
  updateWorkout,
  deleteWorkout,
  clearAllWorkouts,
  getWorkoutsByExercise,
  getLastWorkoutByExercise,
  getAvailableExercises,
  convertAllWorkouts,
  queryWorkouts,
} from './services/workoutService';

// Hooks
export { useWorkoutHistory } from './hooks/useWorkoutHistory';
export type { UseWorkoutHistoryReturn, EditFormState } from './hooks/useWorkoutHistory';

// Components
export { default as WorkoutCalendar } from './components/WorkoutCalendar';
export { default as WorkoutList } from './components/WorkoutList';
export { default as WorkoutDetailModal } from './components/WorkoutDetailModal';

// Screens
export { default as HistoryScreen } from './screens/HistoryScreen';

