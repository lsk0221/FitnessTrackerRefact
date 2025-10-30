/**
 * Template Service
 * 範本服務
 * 
 * Business logic for workout template management
 * 訓練範本管理的業務邏輯
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WorkoutTemplate,
  TemplateExercise,
  TemplateServiceResponse,
  TemplateCategory,
} from '../types/template.types';

// Storage keys
const STORAGE_KEYS = {
  USER_TEMPLATES: '@fitness_tracker:user_templates',
  PRESET_TEMPLATES: '@fitness_tracker:preset_templates',
} as const;

/**
 * Get user-specific storage key for templates
 * 獲取用戶特定的範本存儲鍵
 */
const getUserTemplatesKey = (userId?: string): string => {
  if (!userId) {
    // Fallback for cases without userId (shouldn't happen in normal flow)
    console.warn('getUserTemplatesKey called without userId, using default key');
    return STORAGE_KEYS.USER_TEMPLATES;
  }
  return `${STORAGE_KEYS.USER_TEMPLATES}_${userId}`;
};

// Preset templates data
const PRESET_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'ppl_push',
    name: 'Classic PPL - Push',
    description: 'Classic push day workout focusing on chest, shoulders, and triceps',
    exercises: [
      {
        id: 'ex1',
        exercise: 'Barbell Bench Press',
        muscleGroup: 'Chest',
        movementPattern: 'Horizontal Press',
        equipment: 'Barbell',
        sets: 4,
        reps: 10,
        weight: 60.5,
        restTime: 120,
        instructions: 'Lie flat on bench, grip bar slightly wider than shoulders',
      },
      {
        id: 'ex2',
        exercise: 'Incline Dumbbell Press',
        muscleGroup: 'Chest',
        movementPattern: 'Incline Press',
        equipment: 'Dumbbell',
        sets: 3,
        reps: 12,
        weight: 22.5,
        restTime: 90,
        instructions: 'Set bench to 30-45 degree incline',
      },
      {
        id: 'ex3',
        exercise: 'Overhead Press',
        muscleGroup: 'Shoulders',
        movementPattern: 'Vertical Press',
        equipment: 'Barbell',
        sets: 4,
        reps: 8,
        weight: 40,
        restTime: 120,
        instructions: 'Press bar from shoulder level to overhead',
      },
      {
        id: 'ex4',
        exercise: 'Close Grip Bench Press',
        muscleGroup: 'Triceps',
        movementPattern: 'Horizontal Press',
        equipment: 'Barbell',
        sets: 3,
        reps: 10,
        weight: 50,
        restTime: 90,
        instructions: 'Grip bar with hands closer than shoulder width',
      },
    ],
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedTime: 60,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ppl_pull',
    name: 'Classic PPL - Pull',
    description: 'Classic pull day workout focusing on back and biceps',
    exercises: [
      {
        id: 'ex5',
        exercise: 'Deadlift',
        muscleGroup: 'Back',
        movementPattern: 'Hip Hinge',
        equipment: 'Barbell',
        sets: 4,
        reps: 6,
        weight: 100,
        restTime: 180,
        instructions: 'Lift bar from floor to standing position',
      },
      {
        id: 'ex6',
        exercise: 'Pull-ups',
        muscleGroup: 'Back',
        movementPattern: 'Vertical Pull',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 10,
        weight: 0,
        restTime: 120,
        instructions: 'Hang from bar and pull body up until chin over bar',
      },
      {
        id: 'ex7',
        exercise: 'Barbell Rows',
        muscleGroup: 'Back',
        movementPattern: 'Horizontal Pull',
        equipment: 'Barbell',
        sets: 4,
        reps: 10,
        weight: 60,
        restTime: 120,
        instructions: 'Bend over and row bar to lower chest',
      },
      {
        id: 'ex8',
        exercise: 'Barbell Curls',
        muscleGroup: 'Biceps',
        movementPattern: 'Curl',
        equipment: 'Barbell',
        sets: 3,
        reps: 12,
        weight: 20,
        restTime: 60,
        instructions: 'Stand with feet shoulder-width apart, curl bar up',
      },
    ],
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedTime: 65,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ppl_legs',
    name: 'Classic PPL - Legs',
    description: 'Leg day workout focusing on quads, hamstrings, and glutes',
    exercises: [
      {
        id: 'ex9',
        exercise: 'Squat',
        muscleGroup: 'Legs',
        movementPattern: 'Squat',
        equipment: 'Barbell',
        sets: 4,
        reps: 10,
        weight: 80,
        restTime: 150,
        instructions: 'Stand with feet shoulder-width apart, squat down until thighs parallel',
      },
      {
        id: 'ex10',
        exercise: 'Romanian Deadlift',
        muscleGroup: 'Hamstrings',
        movementPattern: 'Hip Hinge',
        equipment: 'Barbell',
        sets: 4,
        reps: 10,
        weight: 70,
        restTime: 120,
        instructions: 'Hinge at hips, lower bar along legs',
      },
      {
        id: 'ex11',
        exercise: 'Bulgarian Split Squats',
        muscleGroup: 'Legs',
        movementPattern: 'Lunge',
        equipment: 'Bodyweight',
        sets: 3,
        reps: 12,
        weight: 0,
        restTime: 90,
        instructions: 'One foot elevated behind, squat down on front leg',
      },
      {
        id: 'ex12',
        exercise: 'Calf Raises',
        muscleGroup: 'Calves',
        movementPattern: 'Calf Raise',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 18,
        weight: 20,
        restTime: 60,
        instructions: 'Stand on edge of step, raise up on toes',
      },
    ],
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedTime: 70,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'hiit_cardio',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for cardiovascular fitness',
    exercises: [
      {
        id: 'ex13',
        exercise: 'Burpees',
        muscleGroup: 'Full Body',
        movementPattern: 'Compound',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 15,
        weight: 0,
        restTime: 30,
        instructions: 'Squat down, jump back to plank, do push-up, jump forward, jump up',
      },
      {
        id: 'ex14',
        exercise: 'Mountain Climbers',
        muscleGroup: 'Core',
        movementPattern: 'Dynamic',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 20,
        weight: 0,
        restTime: 30,
        instructions: 'In plank position, alternate bringing knees to chest',
      },
      {
        id: 'ex15',
        exercise: 'Jump Squats',
        muscleGroup: 'Legs',
        movementPattern: 'Explosive',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 15,
        weight: 0,
        restTime: 30,
        instructions: 'Squat down and explode up into a jump',
      },
      {
        id: 'ex16',
        exercise: 'High Knees',
        muscleGroup: 'Legs',
        movementPattern: 'Dynamic',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 30,
        weight: 0,
        restTime: 30,
        instructions: 'Run in place bringing knees up high',
      },
    ],
    category: 'Cardio',
    difficulty: 'Advanced',
    estimatedTime: 25,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

/**
 * Parse exercises from JSON string or return array as-is
 * 從 JSON 字串解析練習或直接返回陣列
 */
const parseExercises = (exercises: TemplateExercise[] | string): TemplateExercise[] => {
  if (typeof exercises === 'string') {
    try {
      return JSON.parse(exercises);
    } catch (error) {
      console.error('Failed to parse exercises JSON:', error);
      return [];
    }
  }
  return Array.isArray(exercises) ? exercises : [];
};

/**
 * Normalize template data ensuring exercises are in correct format
 * 標準化範本數據，確保練習格式正確
 */
const normalizeTemplate = (template: WorkoutTemplate): WorkoutTemplate => {
  return {
    ...template,
    exercises: parseExercises(template.exercises),
  };
};

/**
 * Get all preset templates
 * 獲取所有預設範本
 */
export const getPresetTemplates = async (): Promise<TemplateServiceResponse<WorkoutTemplate[]>> => {
  try {
    return {
      success: true,
      data: PRESET_TEMPLATES.map(normalizeTemplate),
    };
  } catch (error) {
    console.error('Error getting preset templates:', error);
    return {
      success: false,
      error: 'Failed to load preset templates',
    };
  }
};

/**
 * Get all user templates
 * 獲取所有用戶範本
 */
export const getUserTemplates = async (userId?: string): Promise<TemplateServiceResponse<WorkoutTemplate[]>> => {
  try {
    const storageKey = getUserTemplatesKey(userId);
    const templatesJson = await AsyncStorage.getItem(storageKey);
    if (!templatesJson) {
      return { success: true, data: [] };
    }

    const templates: WorkoutTemplate[] = JSON.parse(templatesJson);
    return {
      success: true,
      data: templates.map(normalizeTemplate),
    };
  } catch (error) {
    console.error('Error getting user templates:', error);
    return {
      success: false,
      error: 'Failed to load user templates',
    };
  }
};

/**
 * Get all templates (preset + user)
 * 獲取所有範本（預設 + 用戶）
 */
export const getAllTemplates = async (userId?: string): Promise<TemplateServiceResponse<WorkoutTemplate[]>> => {
  try {
    const [presetResult, userResult] = await Promise.all([
      getPresetTemplates(),
      getUserTemplates(userId),
    ]);

    if (!presetResult.success || !userResult.success) {
      throw new Error('Failed to load templates');
    }

    return {
      success: true,
      data: [...(presetResult.data || []), ...(userResult.data || [])],
    };
  } catch (error) {
    console.error('Error getting all templates:', error);
    return {
      success: false,
      error: 'Failed to load templates',
    };
  }
};

/**
 * Get template by ID
 * 根據 ID 獲取範本
 */
export const getTemplateById = async (
  id: string,
  userId?: string
): Promise<TemplateServiceResponse<WorkoutTemplate>> => {
  try {
    const allTemplatesResult = await getAllTemplates(userId);
    if (!allTemplatesResult.success || !allTemplatesResult.data) {
      throw new Error('Failed to load templates');
    }

    const template = allTemplatesResult.data.find((t) => t.id === id);
    if (!template) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    return {
      success: true,
      data: normalizeTemplate(template),
    };
  } catch (error) {
    console.error('Error getting template by ID:', error);
    return {
      success: false,
      error: 'Failed to load template',
    };
  }
};

/**
 * Create a new user template
 * 創建新的用戶範本
 */
export const createTemplate = async (
  templateData: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>,
  userId?: string
): Promise<TemplateServiceResponse<WorkoutTemplate>> => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required to create a template',
      };
    }

    const userTemplatesResult = await getUserTemplates(userId);
    if (!userTemplatesResult.success) {
      throw new Error('Failed to load user templates');
    }

    const newTemplate: WorkoutTemplate = {
      id: `user_${Date.now()}`,
      ...templateData,
      exercises: parseExercises(templateData.exercises),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const storageKey = getUserTemplatesKey(userId);
    const updatedTemplates = [...(userTemplatesResult.data || []), newTemplate];
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedTemplates));

    return {
      success: true,
      data: newTemplate,
    };
  } catch (error) {
    console.error('Error creating template:', error);
    return {
      success: false,
      error: 'Failed to create template',
    };
  }
};

/**
 * Update an existing user template
 * 更新現有用戶範本
 */
export const updateTemplate = async (
  id: string,
  templateData: Partial<Omit<WorkoutTemplate, 'id' | 'createdAt'>>,
  userId?: string
): Promise<TemplateServiceResponse<WorkoutTemplate>> => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required to update a template',
      };
    }

    // Only allow updating user templates
    if (!id.startsWith('user_')) {
      return {
        success: false,
        error: 'Cannot update preset templates',
      };
    }

    const userTemplatesResult = await getUserTemplates(userId);
    if (!userTemplatesResult.success || !userTemplatesResult.data) {
      throw new Error('Failed to load user templates');
    }

    const templateIndex = userTemplatesResult.data.findIndex((t) => t.id === id);
    if (templateIndex === -1) {
      return {
        success: false,
        error: 'Template not found',
      };
    }

    const updatedTemplate: WorkoutTemplate = {
      ...userTemplatesResult.data[templateIndex],
      ...templateData,
      exercises: templateData.exercises
        ? parseExercises(templateData.exercises)
        : userTemplatesResult.data[templateIndex].exercises,
      updatedAt: new Date().toISOString(),
    };

    const updatedTemplates = [...userTemplatesResult.data];
    updatedTemplates[templateIndex] = updatedTemplate;

    const storageKey = getUserTemplatesKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedTemplates));

    return {
      success: true,
      data: updatedTemplate,
    };
  } catch (error) {
    console.error('Error updating template:', error);
    return {
      success: false,
      error: 'Failed to update template',
    };
  }
};

/**
 * Delete a user template
 * 刪除用戶範本
 */
export const deleteTemplate = async (id: string, userId?: string): Promise<TemplateServiceResponse<void>> => {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'User ID is required to delete a template',
      };
    }

    // Only allow deleting user templates
    if (!id.startsWith('user_')) {
      return {
        success: false,
        error: 'Cannot delete preset templates',
      };
    }

    const userTemplatesResult = await getUserTemplates(userId);
    if (!userTemplatesResult.success || !userTemplatesResult.data) {
      throw new Error('Failed to load user templates');
    }

    const updatedTemplates = userTemplatesResult.data.filter((t) => t.id !== id);
    const storageKey = getUserTemplatesKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedTemplates));

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting template:', error);
    return {
      success: false,
      error: 'Failed to delete template',
    };
  }
};

/**
 * Search templates by query
 * 搜尋範本
 */
export const searchTemplates = async (
  query: string,
  userId?: string
): Promise<TemplateServiceResponse<WorkoutTemplate[]>> => {
  try {
    const allTemplatesResult = await getAllTemplates(userId);
    if (!allTemplatesResult.success || !allTemplatesResult.data) {
      throw new Error('Failed to load templates');
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = allTemplatesResult.data.filter((template) => {
      const exercises = parseExercises(template.exercises);
      return (
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        exercises.some((exercise) => exercise.exercise.toLowerCase().includes(lowercaseQuery))
      );
    });

    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error('Error searching templates:', error);
    return {
      success: false,
      error: 'Failed to search templates',
    };
  }
};

/**
 * Filter templates by category
 * 按類別篩選範本
 */
export const getTemplatesByCategory = async (
  category: TemplateCategory,
  userId?: string
): Promise<TemplateServiceResponse<WorkoutTemplate[]>> => {
  try {
    const allTemplatesResult = await getAllTemplates(userId);
    if (!allTemplatesResult.success || !allTemplatesResult.data) {
      throw new Error('Failed to load templates');
    }

    const filtered = allTemplatesResult.data.filter((t) => t.category === category);
    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error('Error filtering templates by category:', error);
    return {
      success: false,
      error: 'Failed to filter templates',
    };
  }
};

/**
 * Filter templates by difficulty
 * 按難度篩選範本
 */
export const getTemplatesByDifficulty = async (
  difficulty: WorkoutTemplate['difficulty'],
  userId?: string
): Promise<TemplateServiceResponse<WorkoutTemplate[]>> => {
  try {
    const allTemplatesResult = await getAllTemplates(userId);
    if (!allTemplatesResult.success || !allTemplatesResult.data) {
      throw new Error('Failed to load templates');
    }

    const filtered = allTemplatesResult.data.filter((t) => t.difficulty === difficulty);
    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    console.error('Error filtering templates by difficulty:', error);
    return {
      success: false,
      error: 'Failed to filter templates',
    };
  }
};

