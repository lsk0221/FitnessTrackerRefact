/**
 * Exercise Library Service
 * 練習庫服務
 * 
 * Service for managing the exercise library
 * 管理練習庫的服務
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  movement_pattern: string;
  equipment: string;
  tags: string[];
  isCustom?: boolean; // Flag to indicate if this is a user-created exercise
}

/**
 * Available muscle groups for exercises
 */
export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
] as const;

/**
 * Available equipment types for exercises
 */
export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Resistance Band',
  'Kettlebell',
  'Other',
] as const;

export interface ExerciseServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Exercise library data
const EXERCISE_LIBRARY: Exercise[] = [
  // Chest exercises
  {
    id: 'ex_chest_1',
    name: 'Barbell Bench Press',
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Press',
    equipment: 'Barbell',
    tags: ['compound', 'push'],
  },
  {
    id: 'ex_chest_2',
    name: 'Incline Dumbbell Press',
    muscle_group: 'Chest',
    movement_pattern: 'Incline Press',
    equipment: 'Dumbbell',
    tags: ['compound', 'push'],
  },
  {
    id: 'ex_chest_3',
    name: 'Push-ups',
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Press',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'push'],
  },
  {
    id: 'ex_chest_4',
    name: 'Dumbbell Flyes',
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Fly',
    equipment: 'Dumbbell',
    tags: ['isolation', 'push'],
  },
  {
    id: 'ex_chest_5',
    name: 'Cable Crossover',
    muscle_group: 'Chest',
    movement_pattern: 'Horizontal Fly',
    equipment: 'Cable',
    tags: ['isolation', 'push'],
  },
  {
    id: 'ex_chest_6',
    name: 'Decline Bench Press',
    muscle_group: 'Chest',
    movement_pattern: 'Decline Press',
    equipment: 'Barbell',
    tags: ['compound', 'push'],
  },
  {
    id: 'ex_chest_7',
    name: 'Chest Dips',
    muscle_group: 'Chest',
    movement_pattern: 'Dip',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'push', 'compound'],
  },

  // Back exercises
  {
    id: 'ex_back_1',
    name: 'Deadlift',
    muscle_group: 'Back',
    movement_pattern: 'Hip Hinge',
    equipment: 'Barbell',
    tags: ['compound', 'pull'],
  },
  {
    id: 'ex_back_2',
    name: 'Pull-ups',
    muscle_group: 'Back',
    movement_pattern: 'Vertical Pull',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'pull', 'compound'],
  },
  {
    id: 'ex_back_3',
    name: 'Barbell Rows',
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    equipment: 'Barbell',
    tags: ['compound', 'pull'],
  },
  {
    id: 'ex_back_4',
    name: 'Lat Pulldowns',
    muscle_group: 'Back',
    movement_pattern: 'Vertical Pull',
    equipment: 'Machine',
    tags: ['compound', 'pull'],
  },
  {
    id: 'ex_back_5',
    name: 'T-Bar Row',
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    equipment: 'Barbell',
    tags: ['compound', 'pull'],
  },
  {
    id: 'ex_back_6',
    name: 'Seated Cable Row',
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    equipment: 'Cable',
    tags: ['compound', 'pull'],
  },
  {
    id: 'ex_back_7',
    name: 'One-arm Dumbbell Row',
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    equipment: 'Dumbbell',
    tags: ['compound', 'pull'],
  },
  {
    id: 'ex_back_8',
    name: 'Face Pulls',
    muscle_group: 'Back',
    movement_pattern: 'Horizontal Pull',
    equipment: 'Cable',
    tags: ['isolation', 'pull'],
  },

  // Legs exercises
  {
    id: 'ex_legs_1',
    name: 'Squat',
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    equipment: 'Barbell',
    tags: ['compound', 'legs'],
  },
  {
    id: 'ex_legs_2',
    name: 'Romanian Deadlift',
    muscle_group: 'Hamstrings',
    movement_pattern: 'Hip Hinge',
    equipment: 'Barbell',
    tags: ['compound', 'legs'],
  },
  {
    id: 'ex_legs_3',
    name: 'Lunges',
    muscle_group: 'Legs',
    movement_pattern: 'Lunge',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'legs'],
  },
  {
    id: 'ex_legs_4',
    name: 'Calf Raises',
    muscle_group: 'Calves',
    movement_pattern: 'Calf Raise',
    equipment: 'Bodyweight',
    tags: ['isolation', 'legs'],
  },
  {
    id: 'ex_legs_5',
    name: 'Leg Press',
    muscle_group: 'Legs',
    movement_pattern: 'Squat',
    equipment: 'Machine',
    tags: ['compound', 'legs'],
  },
  {
    id: 'ex_legs_6',
    name: 'Leg Curls',
    muscle_group: 'Hamstrings',
    movement_pattern: 'Curl',
    equipment: 'Machine',
    tags: ['isolation', 'legs'],
  },
  {
    id: 'ex_legs_7',
    name: 'Leg Extensions',
    muscle_group: 'Quadriceps',
    movement_pattern: 'Extension',
    equipment: 'Machine',
    tags: ['isolation', 'legs'],
  },
  {
    id: 'ex_legs_8',
    name: 'Bulgarian Split Squats',
    muscle_group: 'Legs',
    movement_pattern: 'Lunge',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'legs', 'unilateral'],
  },

  // Shoulders exercises
  {
    id: 'ex_shoulders_1',
    name: 'Overhead Press',
    muscle_group: 'Shoulders',
    movement_pattern: 'Vertical Press',
    equipment: 'Barbell',
    tags: ['compound', 'push'],
  },
  {
    id: 'ex_shoulders_2',
    name: 'Lateral Raises',
    muscle_group: 'Shoulders',
    movement_pattern: 'Lateral Raise',
    equipment: 'Dumbbell',
    tags: ['isolation', 'push'],
  },
  {
    id: 'ex_shoulders_3',
    name: 'Rear Delt Flyes',
    muscle_group: 'Shoulders',
    movement_pattern: 'Horizontal Fly',
    equipment: 'Dumbbell',
    tags: ['isolation', 'pull'],
  },
  {
    id: 'ex_shoulders_4',
    name: 'Arnold Press',
    muscle_group: 'Shoulders',
    movement_pattern: 'Vertical Press',
    equipment: 'Dumbbell',
    tags: ['compound', 'push'],
  },
  {
    id: 'ex_shoulders_5',
    name: 'Front Raises',
    muscle_group: 'Shoulders',
    movement_pattern: 'Front Raise',
    equipment: 'Dumbbell',
    tags: ['isolation', 'push'],
  },
  {
    id: 'ex_shoulders_6',
    name: 'Upright Row',
    muscle_group: 'Shoulders',
    movement_pattern: 'Vertical Pull',
    equipment: 'Barbell',
    tags: ['compound', 'pull'],
  },
  {
    id: 'ex_shoulders_7',
    name: 'Shrugs',
    muscle_group: 'Traps',
    movement_pattern: 'Shrug',
    equipment: 'Barbell',
    tags: ['isolation', 'pull'],
  },

  // Arms exercises
  {
    id: 'ex_arms_1',
    name: 'Barbell Curls',
    muscle_group: 'Biceps',
    movement_pattern: 'Curl',
    equipment: 'Barbell',
    tags: ['isolation', 'pull'],
  },
  {
    id: 'ex_arms_2',
    name: 'Tricep Dips',
    muscle_group: 'Triceps',
    movement_pattern: 'Dip',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'push'],
  },
  {
    id: 'ex_arms_3',
    name: 'Hammer Curls',
    muscle_group: 'Biceps',
    movement_pattern: 'Curl',
    equipment: 'Dumbbell',
    tags: ['isolation', 'pull'],
  },
  {
    id: 'ex_arms_4',
    name: 'Tricep Pushdowns',
    muscle_group: 'Triceps',
    movement_pattern: 'Extension',
    equipment: 'Cable',
    tags: ['isolation', 'push'],
  },
  {
    id: 'ex_arms_5',
    name: 'Preacher Curls',
    muscle_group: 'Biceps',
    movement_pattern: 'Curl',
    equipment: 'Barbell',
    tags: ['isolation', 'pull'],
  },
  {
    id: 'ex_arms_6',
    name: 'Close-grip Bench Press',
    muscle_group: 'Triceps',
    movement_pattern: 'Horizontal Press',
    equipment: 'Barbell',
    tags: ['compound', 'push'],
  },
  {
    id: 'ex_arms_7',
    name: 'Cable Curls',
    muscle_group: 'Biceps',
    movement_pattern: 'Curl',
    equipment: 'Cable',
    tags: ['isolation', 'pull'],
  },
  {
    id: 'ex_arms_8',
    name: 'Overhead Tricep Extension',
    muscle_group: 'Triceps',
    movement_pattern: 'Extension',
    equipment: 'Dumbbell',
    tags: ['isolation', 'push'],
  },

  // Core exercises
  {
    id: 'ex_core_1',
    name: 'Plank',
    muscle_group: 'Core',
    movement_pattern: 'Isometric',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'core', 'isometric'],
  },
  {
    id: 'ex_core_2',
    name: 'Russian Twists',
    muscle_group: 'Core',
    movement_pattern: 'Rotation',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'core'],
  },
  {
    id: 'ex_core_3',
    name: 'Mountain Climbers',
    muscle_group: 'Core',
    movement_pattern: 'Dynamic',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'core', 'cardio'],
  },
  {
    id: 'ex_core_4',
    name: 'Crunches',
    muscle_group: 'Core',
    movement_pattern: 'Flexion',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'core'],
  },
  {
    id: 'ex_core_5',
    name: 'Dead Bug',
    muscle_group: 'Core',
    movement_pattern: 'Anti-Extension',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'core'],
  },
  {
    id: 'ex_core_6',
    name: 'Bicycle Crunches',
    muscle_group: 'Core',
    movement_pattern: 'Rotation',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'core'],
  },
  {
    id: 'ex_core_7',
    name: 'Leg Raises',
    muscle_group: 'Core',
    movement_pattern: 'Flexion',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'core'],
  },
  {
    id: 'ex_core_8',
    name: 'Wood Chops',
    muscle_group: 'Core',
    movement_pattern: 'Rotation',
    equipment: 'Cable',
    tags: ['core', 'rotation'],
  },

  // Cardio exercises
  {
    id: 'ex_cardio_1',
    name: 'Burpees',
    muscle_group: 'Full Body',
    movement_pattern: 'Compound',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'cardio', 'full-body'],
  },
  {
    id: 'ex_cardio_2',
    name: 'Jump Squats',
    muscle_group: 'Legs',
    movement_pattern: 'Explosive',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'cardio', 'explosive'],
  },
  {
    id: 'ex_cardio_3',
    name: 'High Knees',
    muscle_group: 'Legs',
    movement_pattern: 'Dynamic',
    equipment: 'Bodyweight',
    tags: ['bodyweight', 'cardio'],
  },
  {
    id: 'ex_cardio_4',
    name: 'Running',
    muscle_group: 'Cardio',
    movement_pattern: 'Locomotion',
    equipment: 'None',
    tags: ['cardio', 'endurance'],
  },
  {
    id: 'ex_cardio_5',
    name: 'Cycling',
    muscle_group: 'Cardio',
    movement_pattern: 'Locomotion',
    equipment: 'Bike',
    tags: ['cardio', 'endurance'],
  },
  {
    id: 'ex_cardio_6',
    name: 'Jump Rope',
    muscle_group: 'Cardio',
    movement_pattern: 'Jump',
    equipment: 'Rope',
    tags: ['cardio', 'coordination'],
  },
  {
    id: 'ex_cardio_7',
    name: 'Rowing Machine',
    muscle_group: 'Full Body',
    movement_pattern: 'Pull',
    equipment: 'Machine',
    tags: ['cardio', 'full-body'],
  },
];

/**
 * Get all exercises (standard + custom)
 * 獲取所有練習（標準 + 自定義）
 */
export const getAllExercises = async (userId?: string): Promise<ExerciseServiceResponse<Exercise[]>> => {
  try {
    // Load custom exercises for the user
    const customResult = await loadCustomExercises(userId);
    const customExercises = customResult.data || [];

    // Merge standard and custom exercises
    // Custom exercises are added at the beginning for easy access
    const allExercises = [...customExercises, ...EXERCISE_LIBRARY];

    return {
      success: true,
      data: allExercises,
    };
  } catch (error) {
    console.error('Error getting all exercises:', error);
    return {
      success: false,
      error: 'Failed to load exercises',
    };
  }
};

/**
 * Get exercises by muscle group
 * 根據肌肉群獲取練習
 */
export const getExercisesByMuscleGroup = async (
  muscleGroup: string
): Promise<ExerciseServiceResponse<Exercise[]>> => {
  try {
    const filtered = EXERCISE_LIBRARY.filter(
      (exercise) => exercise.muscle_group.toLowerCase() === muscleGroup.toLowerCase()
    );
    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error('Error getting exercises by muscle group:', error);
    return {
      success: false,
      error: 'Failed to load exercises',
    };
  }
};

/**
 * Get exercises by equipment
 * 根據器械獲取練習
 */
export const getExercisesByEquipment = async (
  equipment: string
): Promise<ExerciseServiceResponse<Exercise[]>> => {
  try {
    const filtered = EXERCISE_LIBRARY.filter(
      (exercise) => exercise.equipment.toLowerCase() === equipment.toLowerCase()
    );
    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error('Error getting exercises by equipment:', error);
    return {
      success: false,
      error: 'Failed to load exercises',
    };
  }
};

/**
 * Search exercises by query
 * 搜尋練習
 */
export const searchExercises = async (
  query: string
): Promise<ExerciseServiceResponse<Exercise[]>> => {
  try {
    const lowercaseQuery = query.toLowerCase();
    const filtered = EXERCISE_LIBRARY.filter(
      (exercise) =>
        exercise.name.toLowerCase().includes(lowercaseQuery) ||
        exercise.muscle_group.toLowerCase().includes(lowercaseQuery) ||
        exercise.equipment.toLowerCase().includes(lowercaseQuery) ||
        exercise.movement_pattern.toLowerCase().includes(lowercaseQuery)
    );
    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error('Error searching exercises:', error);
    return {
      success: false,
      error: 'Failed to search exercises',
    };
  }
};

/**
 * Get unique muscle groups
 * 獲取所有獨特的肌肉群
 */
export const getMuscleGroups = async (): Promise<ExerciseServiceResponse<string[]>> => {
  try {
    const muscleGroups = [...new Set(EXERCISE_LIBRARY.map((exercise) => exercise.muscle_group))];
    return {
      success: true,
      data: muscleGroups.sort(),
    };
  } catch (error) {
    console.error('Error getting muscle groups:', error);
    return {
      success: false,
      error: 'Failed to load muscle groups',
    };
  }
};

/**
 * Get unique equipment types
 * 獲取所有獨特的器械類型
 */
export const getEquipmentTypes = async (): Promise<ExerciseServiceResponse<string[]>> => {
  try {
    const equipmentTypes = [...new Set(EXERCISE_LIBRARY.map((exercise) => exercise.equipment))];
    return {
      success: true,
      data: equipmentTypes.sort(),
    };
  } catch (error) {
    console.error('Error getting equipment types:', error);
    return {
      success: false,
      error: 'Failed to load equipment types',
    };
  }
};

/**
 * Get exercise by ID
 * 根據 ID 獲取練習
 */
export const getExerciseById = async (
  id: string
): Promise<ExerciseServiceResponse<Exercise>> => {
  try {
    const exercise = EXERCISE_LIBRARY.find((ex) => ex.id === id);
    if (!exercise) {
      return {
        success: false,
        error: 'Exercise not found',
      };
    }
    return {
      success: true,
      data: exercise,
    };
  } catch (error) {
    console.error('Error getting exercise by ID:', error);
    return {
      success: false,
      error: 'Failed to load exercise',
    };
  }
};

/**
 * Storage key for custom exercises
 */
const CUSTOM_EXERCISES_KEY = '@fitness_tracker:custom_exercises';

/**
 * Get storage key for user's custom exercises
 */
const getCustomExercisesKey = (userId?: string): string => {
  if (!userId) {
    console.warn('getCustomExercisesKey called without userId, using default key');
    return CUSTOM_EXERCISES_KEY;
  }
  return `${CUSTOM_EXERCISES_KEY}_${userId}`;
};

/**
 * Load custom exercises for a user
 * 載入用戶的自定義練習
 */
export const loadCustomExercises = async (
  userId?: string
): Promise<ExerciseServiceResponse<Exercise[]>> => {
  try {
    const storageKey = getCustomExercisesKey(userId);
    const customExercisesJson = await AsyncStorage.getItem(storageKey);
    
    if (!customExercisesJson) {
      return {
        success: true,
        data: [],
      };
    }

    const customExercises: Exercise[] = JSON.parse(customExercisesJson);
    return {
      success: true,
      data: customExercises,
    };
  } catch (error) {
    console.error('Error loading custom exercises:', error);
    return {
      success: false,
      error: 'Failed to load custom exercises',
      data: [],
    };
  }
};

/**
 * Save a new custom exercise for a user
 * 保存用戶的新自定義練習
 */
export const saveCustomExercise = async (
  exerciseName: string,
  muscleGroup: string,
  equipment: string,
  userId?: string
): Promise<ExerciseServiceResponse<Exercise>> => {
  try {
    if (!exerciseName || exerciseName.trim() === '') {
      return {
        success: false,
        error: 'Exercise name cannot be empty',
      };
    }

    if (!muscleGroup || muscleGroup.trim() === '') {
      return {
        success: false,
        error: 'Muscle group is required',
      };
    }

    if (!equipment || equipment.trim() === '') {
      return {
        success: false,
        error: 'Equipment is required',
      };
    }

    if (!userId) {
      return {
        success: false,
        error: 'User ID is required to save custom exercise',
      };
    }

    const trimmedName = exerciseName.trim();
    
    // Load existing custom exercises
    const existingResult = await loadCustomExercises(userId);
    const existingExercises = existingResult.data || [];

    // Check for duplicates (case-insensitive)
    const duplicate = existingExercises.find(
      (ex) => ex.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      return {
        success: false,
        error: 'An exercise with this name already exists',
      };
    }

    // Create new custom exercise
    const newExercise: Exercise = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      muscle_group: muscleGroup,
      movement_pattern: 'Custom',
      equipment: equipment,
      tags: ['custom'],
      isCustom: true,
    };

    // Add to list
    const updatedExercises = [...existingExercises, newExercise];

    // Save to storage
    const storageKey = getCustomExercisesKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExercises));

    return {
      success: true,
      data: newExercise,
    };
  } catch (error) {
    console.error('Error saving custom exercise:', error);
    return {
      success: false,
      error: 'Failed to save custom exercise',
    };
  }
};

/**
 * Delete a custom exercise
 * 刪除自定義練習
 */
export const deleteCustomExercise = async (
  exerciseId: string,
  userId?: string
): Promise<ExerciseServiceResponse<void>> => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required to delete custom exercise',
      };
    }

    // Load existing custom exercises
    const existingResult = await loadCustomExercises(userId);
    const existingExercises = existingResult.data || [];

    // Filter out the exercise to delete
    const updatedExercises = existingExercises.filter((ex) => ex.id !== exerciseId);

    // Save to storage
    const storageKey = getCustomExercisesKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExercises));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting custom exercise:', error);
    return {
      success: false,
      error: 'Failed to delete custom exercise',
    };
  }
};

