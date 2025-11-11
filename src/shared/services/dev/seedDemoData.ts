/**
 * Dev Seeder - Populate demo workouts for testing Progress feature
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants';
import type { Workout } from '../../../features/workouts/types/workout.types';

const getStorageKey = (userId?: string): string => {
  return userId ? `workouts_${userId}` : STORAGE_KEYS.WORKOUTS;
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const generateWorkouts = (): Workout[] => {
  const now = new Date();
  const baseStart = addDays(now, -60);

  const templates: Array<{
    muscleGroup: string;
    exercise: string;
    baseWeight: number;
  }> = [
    { muscleGroup: 'chest', exercise: 'bench_press', baseWeight: 60 },
    { muscleGroup: 'legs', exercise: 'squats', baseWeight: 80 },
    { muscleGroup: 'back', exercise: 'deadlift', baseWeight: 90 },
  ];

  const workouts: Workout[] = [];

  templates.forEach((tpl, idx) => {
    // 10 sessions per exercise across the timeline
    for (let i = 0; i < 10; i++) {
      const date = addDays(baseStart, i * 6 + idx); // spread sessions
      const progression = i * randomInt(1, 3); // simple progression
      const weight = tpl.baseWeight + progression + randomInt(-2, 2);

      workouts.push({
        id: `${tpl.exercise}_${date.getTime()}`,
        date: date.toISOString(),
        muscleGroup: tpl.muscleGroup,
        exercise: tpl.exercise,
        sets: 3,
        reps: 5 + randomInt(0, 3),
        weight: Math.max(20, weight),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  });

  // Sort by date ascending
  workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return workouts;
};

export const seedWorkoutsForEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const data = generateWorkouts();

    // Save under user-specific key (email) and global key for safety
    const userKey = getStorageKey(email);
    const globalKey = getStorageKey();

    await AsyncStorage.setItem(userKey, JSON.stringify(data));
    await AsyncStorage.setItem(globalKey, JSON.stringify(data));

    return { success: true };
  } catch (error) {
    console.error('Seeding demo workouts failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'unknown error' };
  }
};

export const seedWorkoutsForUserId = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const data = generateWorkouts();
    const key = getStorageKey(userId);
    await AsyncStorage.setItem(key, JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error('Seeding demo workouts for userId failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'unknown error' };
  }
};

export default seedWorkoutsForEmail;


