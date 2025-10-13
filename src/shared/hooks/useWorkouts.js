/**
 * Temporary useWorkouts hook
 * 臨時 useWorkouts hook
 * 
 * This is a placeholder until we refactor the Workouts feature
 * 這是佔位符，直到我們重構 Workouts feature
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCloudflareAuth } from '../contexts/CloudflareAuthContext';

export const useWorkouts = () => {
  const { user } = useCloudflareAuth();
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStorageKey = useCallback(() => {
    return user ? `workouts_${user.id}` : 'full_workouts';
  }, [user]);

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storageKey = getStorageKey();
      const storedWorkouts = await AsyncStorage.getItem(storageKey);
      
      if (storedWorkouts) {
        setWorkouts(JSON.parse(storedWorkouts));
      } else {
        setWorkouts([]);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [getStorageKey]);

  const saveWorkout = useCallback(async (workoutData) => {
    try {
      setLoading(true);
      setError(null);
      
      const storageKey = getStorageKey();
      const newWorkout = {
        ...workoutData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      const updatedWorkouts = [...workouts, newWorkout];
      setWorkouts(updatedWorkouts);
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedWorkouts));
      
      return newWorkout;
    } catch (error) {
      console.error('Error saving workout:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [workouts, getStorageKey]);

  const updateWorkout = useCallback(async (updatedWorkout) => {
    try {
      setLoading(true);
      setError(null);
      
      const storageKey = getStorageKey();
      const updatedWorkouts = workouts.map(workout => 
        workout.id === updatedWorkout.id ? updatedWorkout : workout
      );
      
      setWorkouts(updatedWorkouts);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedWorkouts));
      
      return updatedWorkout;
    } catch (error) {
      console.error('Error updating workout:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [workouts, getStorageKey]);

  const deleteWorkout = useCallback(async (workoutId) => {
    try {
      setLoading(true);
      setError(null);
      
      const storageKey = getStorageKey();
      const updatedWorkouts = workouts.filter(workout => workout.id !== workoutId);
      
      setWorkouts(updatedWorkouts);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedWorkouts));
      
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [workouts, getStorageKey]);

  const clearAllWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const storageKey = getStorageKey();
      setWorkouts([]);
      await AsyncStorage.setItem(storageKey, JSON.stringify([]));
      
      return true;
    } catch (error) {
      console.error('Error clearing workouts:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getStorageKey]);

  const getWorkoutsByExercise = useCallback((exercise) => {
    return workouts.filter(workout => workout.exercise === exercise);
  }, [workouts]);

  const getLastWorkoutByExercise = useCallback((exercise) => {
    const exerciseWorkouts = getWorkoutsByExercise(exercise);
    return exerciseWorkouts.length > 0 ? exerciseWorkouts[exerciseWorkouts.length - 1] : null;
  }, [getWorkoutsByExercise]);

  const getAvailableExercises = useCallback(() => {
    const exercises = [...new Set(workouts.map(workout => workout.exercise))];
    return exercises.sort();
  }, [workouts]);

  const convertAllWorkouts = useCallback(async (fromUnit, toUnit) => {
    // Placeholder for unit conversion
    console.log('Unit conversion not implemented yet');
    return workouts;
  }, [workouts]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  return {
    workouts,
    loading,
    error,
    loadWorkouts,
    saveWorkout,
    updateWorkout,
    deleteWorkout,
    clearAllWorkouts,
    getWorkoutsByExercise,
    getLastWorkoutByExercise,
    getAvailableExercises,
    convertAllWorkouts
  };
};
