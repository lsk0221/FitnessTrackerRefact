/**
 * Template Types
 * 範本類型定義
 * 
 * TypeScript interfaces for workout templates
 * 訓練範本的 TypeScript 介面
 */

/**
 * Template Exercise
 * 範本中的練習項目
 */
export interface TemplateExercise {
  id: string;
  nameKey: string; // Translation key for exercise name (e.g., 'exercises.Barbell Bench Press')
  muscleGroupKey: string; // Translation key for muscle group (e.g., 'muscleGroups.Chest')
  movementPattern?: string;
  equipment?: string;
  tags?: string[];
  // Optional suggested parameters (numeric only)
  sets?: number;
  reps?: number;
  weight?: number;
  restTime?: number;
  instructions?: string;
  // Legacy fields for backward compatibility (deprecated)
  exercise?: string; // Deprecated: use nameKey instead
  muscleGroup?: string; // Deprecated: use muscleGroupKey instead
}

/**
 * Workout Template
 * 訓練範本
 */
export interface WorkoutTemplate {
  id: string;
  nameKey?: string; // Translation key for template name (e.g., 'templates.ppl_push.name') - for preset templates
  descriptionKey?: string; // Translation key for template description (e.g., 'templates.ppl_push.description') - for preset templates
  difficultyKey?: string; // Translation key for difficulty (e.g., 'difficulties.Intermediate') - for preset templates
  categoryKey?: string; // Translation key for category (e.g., 'categories.Strength') - for preset templates
  exercises: TemplateExercise[] | string; // Can be array or JSON string
  // Legacy fields for backward compatibility (deprecated)
  name?: string; // Deprecated: use nameKey for preset templates, or keep for user templates
  description?: string; // Deprecated: use descriptionKey for preset templates, or keep for user templates
  category?: string; // Deprecated: use categoryKey for preset templates, or keep for user templates
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'; // Deprecated: use difficultyKey for preset templates, or keep for user templates
  estimatedTime?: number; // in minutes
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Template Category
 * 範本分類
 */
export type TemplateCategory = 
  | 'Strength'
  | 'Cardio'
  | 'Hypertrophy'
  | 'Powerlifting'
  | 'Bodyweight'
  | 'Custom'
  | 'Other';

/**
 * Template Filter Options
 * 範本篩選選項
 */
export interface TemplateFilters {
  category?: TemplateCategory;
  difficulty?: WorkoutTemplate['difficulty'];
  searchQuery?: string;
}

/**
 * Service Response Types
 * 服務回應類型
 */
export interface TemplateServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Template Editor Mode
 * 範本編輯器模式
 */
export type EditorMode = 'create' | 'edit' | 'copy';

/**
 * Template Editor State
 * 範本編輯器狀態
 */
export interface TemplateEditorState {
  templateName: string;
  templateDescription: string;
  exercises: TemplateExercise[];
  category: TemplateCategory;
  difficulty: WorkoutTemplate['difficulty'];
  estimatedTime: number;
}


