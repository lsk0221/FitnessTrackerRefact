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
    nameKey: 'templates.ppl_push.name',
    descriptionKey: 'templates.ppl_push.description',
    difficultyKey: 'difficulties.Intermediate',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex1',
        nameKey: 'exercises.barbell_bench_press',
        muscleGroupKey: 'muscleGroups.Chest',
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
        nameKey: 'exercises.incline_dumbbell_press',
        muscleGroupKey: 'muscleGroups.Chest',
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
        nameKey: 'exercises.overhead_press',
        muscleGroupKey: 'muscleGroups.Shoulders',
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
        nameKey: 'exercises.close_grip_bench_press',
        muscleGroupKey: 'muscleGroups.Triceps',
        movementPattern: 'Horizontal Press',
        equipment: 'Barbell',
        sets: 3,
        reps: 10,
        weight: 50,
        restTime: 90,
        instructions: 'Grip bar with hands closer than shoulder width',
      },
    ],
    estimatedTime: 60,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ppl_pull',
    nameKey: 'templates.ppl_pull.name',
    descriptionKey: 'templates.ppl_pull.description',
    difficultyKey: 'difficulties.Intermediate',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex5',
        nameKey: 'exercises.deadlift',
        muscleGroupKey: 'muscleGroups.Back',
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
        nameKey: 'exercises.pull_ups',
        muscleGroupKey: 'muscleGroups.Back',
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
        nameKey: 'exercises.barbell_rows',
        muscleGroupKey: 'muscleGroups.Back',
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
        nameKey: 'exercises.barbell_curls',
        muscleGroupKey: 'muscleGroups.Biceps',
        movementPattern: 'Curl',
        equipment: 'Barbell',
        sets: 3,
        reps: 12,
        weight: 20,
        restTime: 60,
        instructions: 'Stand with feet shoulder-width apart, curl bar up',
      },
    ],
    estimatedTime: 65,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ppl_legs',
    nameKey: 'templates.ppl_legs.name',
    descriptionKey: 'templates.ppl_legs.description',
    difficultyKey: 'difficulties.Intermediate',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex9',
        nameKey: 'exercises.squat',
        muscleGroupKey: 'muscleGroups.Legs',
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
        nameKey: 'exercises.romanian_deadlift',
        muscleGroupKey: 'muscleGroups.Hamstrings',
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
        nameKey: 'exercises.bulgarian_split_squats',
        muscleGroupKey: 'muscleGroups.Legs',
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
        nameKey: 'exercises.calf_raises',
        muscleGroupKey: 'muscleGroups.Calves',
        movementPattern: 'Calf Raise',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 18,
        weight: 20,
        restTime: 60,
        instructions: 'Stand on edge of step, raise up on toes',
      },
    ],
    estimatedTime: 70,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'hiit_cardio',
    nameKey: 'templates.hiit_cardio.name',
    descriptionKey: 'templates.hiit_cardio.description',
    difficultyKey: 'difficulties.Advanced',
    categoryKey: 'categories.Cardio',
    exercises: [
      {
        id: 'ex13',
        nameKey: 'exercises.burpees',
        muscleGroupKey: 'muscleGroups.Full Body',
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
        nameKey: 'exercises.mountain_climbers',
        muscleGroupKey: 'muscleGroups.Core',
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
        nameKey: 'exercises.jump_squats',
        muscleGroupKey: 'muscleGroups.Legs',
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
        nameKey: 'exercises.high_knees',
        muscleGroupKey: 'muscleGroups.Legs',
        movementPattern: 'Dynamic',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 30,
        weight: 0,
        restTime: 30,
        instructions: 'Run in place bringing knees up high',
      },
    ],
    estimatedTime: 25,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Beginner Templates - 新手模板
  {
    id: 'beginner_machine_fullbody',
    nameKey: 'templates.presets.beginner_fullbody_name',
    descriptionKey: 'templates.presets.beginner_fullbody_desc',
    difficultyKey: 'difficulties.Beginner',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_beginner_1',
        nameKey: 'exercises.barbell_bench_press', // Using bench press as machine chest press
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Press',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 40,
        restTime: 90,
        instructions: 'Sit on machine, push handles forward',
      },
      {
        id: 'ex_beginner_2',
        nameKey: 'exercises.lat_pulldowns',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Vertical Pull',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 30,
        restTime: 90,
        instructions: 'Pull bar down to upper chest',
      },
      {
        id: 'ex_beginner_3',
        nameKey: 'exercises.leg_press',
        muscleGroupKey: 'muscleGroups.Legs',
        movementPattern: 'Squat',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 50,
        restTime: 90,
        instructions: 'Push platform away with legs',
      },
      {
        id: 'ex_beginner_4',
        nameKey: 'exercises.overhead_press',
        muscleGroupKey: 'muscleGroups.Shoulders',
        movementPattern: 'Vertical Press',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 25,
        restTime: 90,
        instructions: 'Press handles overhead',
      },
      {
        id: 'ex_beginner_5',
        nameKey: 'exercises.seated_cable_row',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Horizontal Pull',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 30,
        restTime: 90,
        instructions: 'Pull handles to lower chest',
      },
    ],
    estimatedTime: 50,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'beginner_machine_push',
    nameKey: 'templates.presets.beginner_push_name',
    descriptionKey: 'templates.presets.beginner_push_desc',
    difficultyKey: 'difficulties.Beginner',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_beginner_push_1',
        nameKey: 'exercises.barbell_bench_press',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Press',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 40,
        restTime: 90,
        instructions: 'Sit on machine, push handles forward',
      },
      {
        id: 'ex_beginner_push_2',
        nameKey: 'exercises.overhead_press',
        muscleGroupKey: 'muscleGroups.Shoulders',
        movementPattern: 'Vertical Press',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 25,
        restTime: 90,
        instructions: 'Press handles overhead',
      },
      {
        id: 'ex_beginner_push_3',
        nameKey: 'exercises.cable_crossover',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Fly',
        equipment: 'Machine',
        sets: 3,
        reps: 15,
        weight: 15,
        restTime: 60,
        instructions: 'Bring handles together in front of chest',
      },
      {
        id: 'ex_beginner_push_4',
        nameKey: 'exercises.tricep_pushdowns',
        muscleGroupKey: 'muscleGroups.Triceps',
        movementPattern: 'Isolation',
        equipment: 'Cable',
        sets: 3,
        reps: 12,
        weight: 20,
        restTime: 60,
        instructions: 'Push cable down with triceps',
      },
    ],
    estimatedTime: 45,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'beginner_machine_pull',
    nameKey: 'templates.presets.beginner_pull_name',
    descriptionKey: 'templates.presets.beginner_pull_desc',
    difficultyKey: 'difficulties.Beginner',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_beginner_pull_1',
        nameKey: 'exercises.lat_pulldowns',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Vertical Pull',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 30,
        restTime: 90,
        instructions: 'Pull bar down to upper chest',
      },
      {
        id: 'ex_beginner_pull_2',
        nameKey: 'exercises.seated_cable_row',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Horizontal Pull',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 30,
        restTime: 90,
        instructions: 'Pull handles to lower chest',
      },
      {
        id: 'ex_beginner_pull_3',
        nameKey: 'exercises.rear_delt_flyes',
        muscleGroupKey: 'muscleGroups.Shoulders',
        movementPattern: 'Isolation',
        equipment: 'Machine',
        sets: 3,
        reps: 15,
        weight: 10,
        restTime: 60,
        instructions: 'Reverse fly motion on machine',
      },
      {
        id: 'ex_beginner_pull_4',
        nameKey: 'exercises.barbell_curls',
        muscleGroupKey: 'muscleGroups.Biceps',
        movementPattern: 'Curl',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 15,
        restTime: 60,
        instructions: 'Curl handles with biceps',
      },
    ],
    estimatedTime: 45,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'beginner_machine_legs',
    nameKey: 'templates.presets.beginner_legs_name',
    descriptionKey: 'templates.presets.beginner_legs_desc',
    difficultyKey: 'difficulties.Beginner',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_beginner_legs_1',
        nameKey: 'exercises.leg_press',
        muscleGroupKey: 'muscleGroups.Legs',
        movementPattern: 'Squat',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 50,
        restTime: 90,
        instructions: 'Push platform away with legs',
      },
      {
        id: 'ex_beginner_legs_2',
        nameKey: 'exercises.leg_extensions',
        muscleGroupKey: 'muscleGroups.Quadriceps',
        movementPattern: 'Isolation',
        equipment: 'Machine',
        sets: 3,
        reps: 15,
        weight: 20,
        restTime: 60,
        instructions: 'Extend legs against resistance',
      },
      {
        id: 'ex_beginner_legs_3',
        nameKey: 'exercises.leg_curls',
        muscleGroupKey: 'muscleGroups.Hamstrings',
        movementPattern: 'Isolation',
        equipment: 'Machine',
        sets: 3,
        reps: 15,
        weight: 20,
        restTime: 60,
        instructions: 'Curl legs against resistance',
      },
      {
        id: 'ex_beginner_legs_4',
        nameKey: 'exercises.calf_raises',
        muscleGroupKey: 'muscleGroups.Calves',
        movementPattern: 'Calf Raise',
        equipment: 'Machine',
        sets: 3,
        reps: 15,
        weight: 30,
        restTime: 60,
        instructions: 'Raise up on toes',
      },
    ],
    estimatedTime: 45,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Advanced Templates - 進階模板
  {
    id: 'adv_split_chest',
    nameKey: 'templates.presets.adv_chest_name',
    descriptionKey: 'templates.presets.adv_chest_desc',
    difficultyKey: 'difficulties.Advanced',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_adv_chest_1',
        nameKey: 'exercises.barbell_bench_press',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Press',
        equipment: 'Barbell',
        sets: 4,
        reps: 8,
        weight: 80,
        restTime: 180,
        instructions: 'Lie flat on bench, grip bar slightly wider than shoulders',
      },
      {
        id: 'ex_adv_chest_2',
        nameKey: 'exercises.incline_dumbbell_press',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Incline Press',
        equipment: 'Dumbbell',
        sets: 4,
        reps: 10,
        weight: 30,
        restTime: 120,
        instructions: 'Set bench to 30-45 degree incline',
      },
      {
        id: 'ex_adv_chest_3',
        nameKey: 'exercises.cable_crossover',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Fly',
        equipment: 'Cable',
        sets: 3,
        reps: 12,
        weight: 20,
        restTime: 90,
        instructions: 'Bring cables together in front of chest',
      },
      {
        id: 'ex_adv_chest_4',
        nameKey: 'exercises.chest_dips',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Dip',
        equipment: 'Bodyweight',
        sets: 3,
        reps: 12,
        weight: 0,
        restTime: 120,
        instructions: 'Lower body until shoulders below elbows, push up',
      },
    ],
    estimatedTime: 70,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'adv_split_back',
    nameKey: 'templates.presets.adv_back_name',
    descriptionKey: 'templates.presets.adv_back_desc',
    difficultyKey: 'difficulties.Advanced',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_adv_back_1',
        nameKey: 'exercises.deadlift',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Hip Hinge',
        equipment: 'Barbell',
        sets: 4,
        reps: 5,
        weight: 120,
        restTime: 240,
        instructions: 'Lift bar from floor to standing position',
      },
      {
        id: 'ex_adv_back_2',
        nameKey: 'exercises.pull_ups',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Vertical Pull',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 10,
        weight: 0,
        restTime: 120,
        instructions: 'Hang from bar and pull body up until chin over bar',
      },
      {
        id: 'ex_adv_back_3',
        nameKey: 'exercises.barbell_rows',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Horizontal Pull',
        equipment: 'Barbell',
        sets: 4,
        reps: 8,
        weight: 70,
        restTime: 120,
        instructions: 'Bend over and row bar to lower chest',
      },
      {
        id: 'ex_adv_back_4',
        nameKey: 'exercises.lat_pulldowns',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Vertical Pull',
        equipment: 'Machine',
        sets: 3,
        reps: 12,
        weight: 50,
        restTime: 90,
        instructions: 'Pull bar down to upper chest',
      },
    ],
    estimatedTime: 75,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'adv_split_shoulders',
    nameKey: 'templates.presets.adv_shoulder_name',
    descriptionKey: 'templates.presets.adv_shoulder_desc',
    difficultyKey: 'difficulties.Advanced',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_adv_shoulder_1',
        nameKey: 'exercises.overhead_press',
        muscleGroupKey: 'muscleGroups.Shoulders',
        movementPattern: 'Vertical Press',
        equipment: 'Barbell',
        sets: 4,
        reps: 8,
        weight: 50,
        restTime: 120,
        instructions: 'Press bar from shoulder level to overhead',
      },
      {
        id: 'ex_adv_shoulder_2',
        nameKey: 'exercises.lateral_raises',
        muscleGroupKey: 'muscleGroups.Shoulders',
        movementPattern: 'Lateral Raise',
        equipment: 'Dumbbell',
        sets: 4,
        reps: 12,
        weight: 12.5,
        restTime: 90,
        instructions: 'Raise dumbbells to sides until parallel to floor',
      },
      {
        id: 'ex_adv_shoulder_3',
        nameKey: 'exercises.face_pulls',
        muscleGroupKey: 'muscleGroups.Shoulders',
        movementPattern: 'Horizontal Pull',
        equipment: 'Cable',
        sets: 4,
        reps: 15,
        weight: 20,
        restTime: 90,
        instructions: 'Pull cable to face level, external rotation',
      },
      {
        id: 'ex_adv_shoulder_4',
        nameKey: 'exercises.front_raises',
        muscleGroupKey: 'muscleGroups.Shoulders',
        movementPattern: 'Front Raise',
        equipment: 'Dumbbell',
        sets: 3,
        reps: 12,
        weight: 10,
        restTime: 60,
        instructions: 'Raise dumbbells in front until parallel to floor',
      },
    ],
    estimatedTime: 60,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'adv_split_legs',
    nameKey: 'templates.presets.adv_legs_name',
    descriptionKey: 'templates.presets.adv_legs_desc',
    difficultyKey: 'difficulties.Advanced',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_adv_legs_1',
        nameKey: 'exercises.squat',
        muscleGroupKey: 'muscleGroups.Legs',
        movementPattern: 'Squat',
        equipment: 'Barbell',
        sets: 4,
        reps: 8,
        weight: 100,
        restTime: 180,
        instructions: 'Stand with feet shoulder-width apart, squat down until thighs parallel',
      },
      {
        id: 'ex_adv_legs_2',
        nameKey: 'exercises.romanian_deadlift',
        muscleGroupKey: 'muscleGroups.Hamstrings',
        movementPattern: 'Hip Hinge',
        equipment: 'Barbell',
        sets: 4,
        reps: 10,
        weight: 80,
        restTime: 120,
        instructions: 'Hinge at hips, lower bar along legs',
      },
      {
        id: 'ex_adv_legs_3',
        nameKey: 'exercises.leg_extensions',
        muscleGroupKey: 'muscleGroups.Quadriceps',
        movementPattern: 'Isolation',
        equipment: 'Machine',
        sets: 3,
        reps: 15,
        weight: 30,
        restTime: 90,
        instructions: 'Extend legs against resistance',
      },
      {
        id: 'ex_adv_legs_4',
        nameKey: 'exercises.leg_curls',
        muscleGroupKey: 'muscleGroups.Hamstrings',
        movementPattern: 'Isolation',
        equipment: 'Machine',
        sets: 3,
        reps: 15,
        weight: 30,
        restTime: 90,
        instructions: 'Curl legs against resistance',
      },
      {
        id: 'ex_adv_legs_5',
        nameKey: 'exercises.calf_raises',
        muscleGroupKey: 'muscleGroups.Calves',
        movementPattern: 'Calf Raise',
        equipment: 'Bodyweight',
        sets: 4,
        reps: 20,
        weight: 0,
        restTime: 60,
        instructions: 'Stand on edge of step, raise up on toes',
      },
    ],
    estimatedTime: 80,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'adv_split_arms',
    nameKey: 'templates.presets.adv_arms_name',
    descriptionKey: 'templates.presets.adv_arms_desc',
    difficultyKey: 'difficulties.Advanced',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_adv_arms_1',
        nameKey: 'exercises.barbell_curls',
        muscleGroupKey: 'muscleGroups.Biceps',
        movementPattern: 'Curl',
        equipment: 'Barbell',
        sets: 4,
        reps: 10,
        weight: 25,
        restTime: 90,
        instructions: 'Stand with feet shoulder-width apart, curl bar up',
      },
      {
        id: 'ex_adv_arms_2',
        nameKey: 'exercises.tricep_pushdowns',
        muscleGroupKey: 'muscleGroups.Triceps',
        movementPattern: 'Isolation',
        equipment: 'Cable',
        sets: 4,
        reps: 12,
        weight: 30,
        restTime: 90,
        instructions: 'Push cable down with triceps',
      },
      {
        id: 'ex_adv_arms_3',
        nameKey: 'exercises.hammer_curls',
        muscleGroupKey: 'muscleGroups.Biceps',
        movementPattern: 'Curl',
        equipment: 'Dumbbell',
        sets: 3,
        reps: 12,
        weight: 15,
        restTime: 60,
        instructions: 'Curl dumbbells with neutral grip',
      },
      {
        id: 'ex_adv_arms_4',
        nameKey: 'exercises.overhead_tricep_extension',
        muscleGroupKey: 'muscleGroups.Triceps',
        movementPattern: 'Isolation',
        equipment: 'Dumbbell',
        sets: 3,
        reps: 12,
        weight: 12.5,
        restTime: 90,
        instructions: 'Extend dumbbell overhead with triceps (skullcrusher variation)',
      },
    ],
    estimatedTime: 55,
    createdAt: '2024-01-01T00:00:00Z',
  },
  // Powerlifting Big 3 (SBD) - 健力三項
  {
    id: 'powerlifting_big3',
    nameKey: 'templates.presets.powerlifting_name',
    descriptionKey: 'templates.presets.powerlifting_desc',
    difficultyKey: 'difficulties.Advanced',
    categoryKey: 'categories.Strength',
    exercises: [
      {
        id: 'ex_powerlifting_1',
        nameKey: 'exercises.squat',
        muscleGroupKey: 'muscleGroups.Legs',
        movementPattern: 'Squat',
        equipment: 'Barbell',
        sets: 5,
        reps: 5,
        weight: 100,
        restTime: 180,
        instructions: 'Stand with feet shoulder-width apart, squat down until thighs parallel to floor',
      },
      {
        id: 'ex_powerlifting_2',
        nameKey: 'exercises.barbell_bench_press',
        muscleGroupKey: 'muscleGroups.Chest',
        movementPattern: 'Horizontal Press',
        equipment: 'Barbell',
        sets: 5,
        reps: 5,
        weight: 80,
        restTime: 180,
        instructions: 'Lie flat on bench, grip bar slightly wider than shoulders',
      },
      {
        id: 'ex_powerlifting_3',
        nameKey: 'exercises.deadlift',
        muscleGroupKey: 'muscleGroups.Back',
        movementPattern: 'Hip Hinge',
        equipment: 'Barbell',
        sets: 3,
        reps: 3,
        weight: 120,
        restTime: 180,
        instructions: 'Lift bar from floor to standing position, keep back straight',
      },
    ],
    estimatedTime: 90,
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

