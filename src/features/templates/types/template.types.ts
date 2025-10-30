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
  exercise: string; // Exercise name
  muscleGroup: string;
  movementPattern?: string;
  equipment?: string;
  tags?: string[];
  // Optional suggested parameters (numeric only)
  sets?: number;
  reps?: number;
  weight?: number;
  restTime?: number;
  instructions?: string;
}

/**
 * Workout Template
 * 訓練範本
 */
export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  exercises: TemplateExercise[] | string; // Can be array or JSON string
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
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


