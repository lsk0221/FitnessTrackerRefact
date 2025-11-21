/**
 * useTemplateEditor Hook
 * 範本編輯器 Hook
 * 
 * Custom hook for creating and editing workout templates
 * 用於創建和編輯訓練範本的自定義 Hook
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutTemplate, TemplateExercise, EditorMode } from '../types/template.types';
import { createTemplate, updateTemplate, getTemplateById } from '../services/templateService';

/**
 * Template editor hook callbacks interface
 * 範本編輯器 Hook 回調介面
 */
export interface UseTemplateEditorCallbacks {
  showAlert?: (title: string, message: string) => void;
  showSuccess?: (message: string) => void;
}
import {
  getAllExercises,
  searchExercises as searchExercisesService,
  getExercisesByMuscleGroup,
  saveCustomExercise,
  getMuscleGroups,
  Exercise,
} from '../../../shared/services/data/exerciseLibraryService';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';

interface UseTemplateEditorParams {
  mode: EditorMode;
  templateId?: string;
  initialTemplate?: WorkoutTemplate | null;
}

interface UseTemplateEditorReturn {
  // Template state
  templateName: string;
  templateDescription: string;
  exercises: TemplateExercise[];
  category: string;
  difficulty: WorkoutTemplate['difficulty'];
  estimatedTime: number;

  // Exercise library state
  availableExercises: Exercise[];
  showExerciseSelector: boolean;
  exerciseSearchQuery: string;
  selectedMuscleGroup: string | null;
  muscleGroupsList: string[]; // Dynamic muscle groups list

  // UI state
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Template actions
  setTemplateName: (name: string) => void;
  setTemplateDescription: (description: string) => void;
  setCategory: (category: string) => void;
  setDifficulty: (difficulty: WorkoutTemplate['difficulty']) => void;
  setEstimatedTime: (time: number) => void;

  // Exercise actions
  addExercise: (exercise: Exercise) => void;
  addMultipleExercises: (exercises: Exercise[]) => void;
  removeExercise: (exerciseId: string) => void;
  updateExercise: (exerciseId: string, updates: Partial<TemplateExercise>) => void;
  reorderExercises: (exercises: TemplateExercise[]) => void;

  // Exercise library actions
  loadAvailableExercises: () => Promise<void>;
  searchExercises: (query: string) => Promise<void>;
  filterExercisesByMuscleGroup: (muscleGroup: string) => Promise<void>;
  setShowExerciseSelector: (show: boolean) => void;
  setExerciseSearchQuery: (query: string) => void;
  createCustomExercise: (exerciseName: string, muscleGroup: string, equipment: string) => Promise<void>;

  // Save action
  saveTemplate: () => Promise<{ success: boolean; templateId?: string }>;

  // Validation
  validateTemplate: () => { isValid: boolean; errors: string[] };

  // Change detection
  hasUnsavedChanges: () => boolean;
}

/**
 * Hook for managing template editor state and actions
 * 管理範本編輯器狀態和操作的 Hook
 * @param params - Hook parameters
 * @param callbacks - Optional callbacks for showing alerts
 */
export const useTemplateEditor = (
  {
  mode,
  templateId,
  initialTemplate,
  }: UseTemplateEditorParams,
  callbacks?: UseTemplateEditorCallbacks
): UseTemplateEditorReturn => {
  // Get current user for data isolation
  const { user } = useCloudflareAuth();
  const userId = user?.id;
  const { t } = useTranslation();
  
  // Extract callbacks with defaults
  const showAlert = callbacks?.showAlert || ((title: string, message: string) => {
    console.warn('Alert not handled:', title, message);
  });
  const showSuccess = callbacks?.showSuccess || ((message: string) => {
    console.log('Success:', message);
  });

  // Template state
  const [templateName, setTemplateName] = useState<string>('');
  const [templateDescription, setTemplateDescription] = useState<string>('');
  const [exercises, setExercises] = useState<TemplateExercise[]>([]);
  const [category, setCategory] = useState<string>('Custom');
  const [difficulty, setDifficulty] = useState<WorkoutTemplate['difficulty']>('Intermediate');
  const [estimatedTime, setEstimatedTime] = useState<number>(60);

  // Store initial template data for change detection
  const initialTemplateDataRef = useRef<{
    name: string;
    description: string;
    exercises: TemplateExercise[];
    category: string;
    difficulty: WorkoutTemplate['difficulty'];
    estimatedTime: number;
  } | null>(null);

  // Exercise library state
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState<boolean>(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState<string>('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [muscleGroupsList, setMuscleGroupsList] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load muscle groups on mount
   * 載入肌肉群列表
   */
  useEffect(() => {
    loadMuscleGroups();
  }, [loadMuscleGroups]);

  /**
   * Initialize template data based on mode
   * 根據模式初始化範本數據
   */
  useEffect(() => {
    const initializeTemplate = async () => {
      if (mode === 'create') {
        // Reset to default values for create mode
        setTemplateName('');
        setTemplateDescription('');
        setExercises([]);
        setCategory('Custom');
        setDifficulty('Intermediate');
        setEstimatedTime(60);
        return;
      }

      // Load template for edit or copy mode
      setLoading(true);
      try {
        let template: WorkoutTemplate | null = initialTemplate || null;

        // If templateId is provided, fetch the template
        if (templateId && !template) {
          const result = await getTemplateById(templateId, userId);
          if (result.success && result.data) {
            template = result.data;
          }
        }

        if (template) {
          // For preset templates, preserve translation keys; for user templates, use the stored name
          // 對於預設範本，保留翻譯鍵；對於用戶範本，使用存儲的名稱
          let templateName: string;
          let templateDescription: string;
          
          if (mode === 'copy' && template.nameKey) {
            // Preset template being copied - use translated name with (Copy) suffix
            // 正在複製的預設範本 - 使用翻譯後的名稱並添加 (Copy) 後綴
            const translatedName = t(template.nameKey);
            templateName = `${translatedName} (Copy)`;
            templateDescription = template.descriptionKey ? t(template.descriptionKey) : (template.description || '');
          } else if (mode === 'copy') {
            // User template being copied - use stored name with (Copy) suffix
            // 正在複製的用戶範本 - 使用存儲的名稱並添加 (Copy) 後綴
            templateName = `${template.name || ''} (Copy)`;
            templateDescription = template.description || '';
          } else {
            // Edit mode - use stored values
            // 編輯模式 - 使用存儲的值
            templateName = template.name || '';
            templateDescription = template.description || '';
          }
          
          // Parse exercises from JSON string if needed
          const parsedExercises = typeof template.exercises === 'string'
            ? JSON.parse(template.exercises)
            : template.exercises;
          
          // Ensure exercises have valid IDs and preserve translation keys
          // 確保動作有有效的 ID 並保留翻譯鍵
          const validExercises = (parsedExercises || []).map((exercise: any, index: number) => ({
            id: exercise.id || `exercise-${Date.now()}-${index}`,
            nameKey: exercise.nameKey || (exercise.exercise?.startsWith('exercises.') ? exercise.exercise : undefined),
            muscleGroupKey: exercise.muscleGroupKey || (exercise.muscleGroup?.startsWith('muscleGroups.') ? exercise.muscleGroup : undefined),
            // Legacy fields for backward compatibility
            exercise: exercise.nameKey?.replace('exercises.', '') || exercise.exercise || exercise.name || 'Unknown Exercise',
            muscleGroup: exercise.muscleGroupKey?.replace('muscleGroups.', '') || exercise.muscleGroup || exercise.muscle_group || 'Unknown',
            movementPattern: exercise.movementPattern || exercise.movement_pattern || 'Unknown',
            equipment: exercise.equipment || 'Unknown',
            tags: exercise.tags || [],
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            restTime: exercise.restTime,
            instructions: exercise.instructions,
          }));
          
          const templateCategory = template.category || 'Custom';
          const templateDifficulty = template.difficulty || 'Intermediate';
          const templateEstimatedTime = template.estimatedTime || 60;
          
          setTemplateName(templateName);
          setTemplateDescription(templateDescription);
          setExercises(validExercises);
          setCategory(templateCategory);
          setDifficulty(templateDifficulty);
          setEstimatedTime(templateEstimatedTime);

          // Store initial template data for change detection (only for edit mode)
          if (mode === 'edit') {
            initialTemplateDataRef.current = {
              name: templateName,
              description: templateDescription,
              exercises: JSON.parse(JSON.stringify(validExercises)), // Deep copy
              category: templateCategory,
              difficulty: templateDifficulty,
              estimatedTime: templateEstimatedTime,
            };
          } else {
            // For copy/create modes, no initial data to compare against
            initialTemplateDataRef.current = null;
          }
        }
      } catch (err) {
        console.error('Error initializing template:', err);
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    initializeTemplate();
  }, [mode, templateId, initialTemplate, userId]);

  /**
   * Load all available exercises (standard + custom)
   * 載入所有可用練習（標準 + 自定義）
   */
  const loadAvailableExercises = useCallback(async () => {
    try {
      const result = await getAllExercises(userId);
      if (result.success && result.data) {
        setAvailableExercises(result.data);
      }
    } catch (err) {
      console.error('Error loading exercises:', err);
      showAlert('Error', 'Failed to load exercises');
    }
  }, [userId, showAlert]);

  /**
   * Load dynamic muscle groups list
   * 載入動態肌肉群列表
   */
  const loadMuscleGroups = useCallback(async () => {
    try {
      const result = await getMuscleGroups();
      if (result.success && result.data) {
        setMuscleGroupsList(result.data);
      } else {
        console.error('載入肌肉群列表失敗:', result.error);
      }
    } catch (error) {
      console.error('載入肌肉群列表失敗:', error);
    }
  }, []);

  /**
   * Search exercises by query
   * 搜尋練習
   */
  const searchExercises = useCallback(async (query: string) => {
    setExerciseSearchQuery(query);
    
    if (!query.trim()) {
      await loadAvailableExercises();
      return;
    }

    try {
      const result = await searchExercisesService(query);
      if (result.success && result.data) {
        setAvailableExercises(result.data);
      }
    } catch (err) {
      console.error('Error searching exercises:', err);
      showAlert('Error', 'Failed to search exercises');
    }
  }, [loadAvailableExercises, showAlert]);

  /**
   * Filter exercises by muscle group
   * 按肌肉群篩選練習
   */
  const filterExercisesByMuscleGroup = useCallback(async (muscleGroup: string) => {
    setSelectedMuscleGroup(muscleGroup);
    
    try {
      const result = await getExercisesByMuscleGroup(muscleGroup);
      if (result.success && result.data) {
        setAvailableExercises(result.data);
      }
    } catch (err) {
      console.error('Error filtering exercises:', err);
      showAlert('Error', 'Failed to filter exercises');
    }
  }, [showAlert]);

  /**
   * Create a custom exercise
   * 創建自定義練習
   */
  const createCustomExercise = useCallback(async (
    exerciseName: string,
    muscleGroup: string,
    equipment: string
  ) => {
    try {
      if (!exerciseName || exerciseName.trim() === '') {
        showAlert('Error', 'Please enter an exercise name');
        return;
      }

      if (!muscleGroup || muscleGroup.trim() === '') {
        showAlert('Error', 'Please select a muscle group');
        return;
      }

      if (!equipment || equipment.trim() === '') {
        showAlert('Error', 'Please select equipment');
        return;
      }

      if (!userId) {
        showAlert('Error', 'You must be logged in to create custom exercises');
        return;
      }

      const result = await saveCustomExercise(exerciseName, muscleGroup, equipment, userId);
      
      if (!result.success) {
        showAlert('Error', result.error || 'Failed to create custom exercise');
        return;
      }

      // Reload exercises to include the new custom exercise
      await loadAvailableExercises();

      showSuccess(`Custom exercise "${exerciseName}" created successfully!`);
    } catch (err) {
      console.error('Error creating custom exercise:', err);
      showAlert('Error', 'Failed to create custom exercise');
    }
  }, [userId, loadAvailableExercises, showAlert, showSuccess]);

  /**
   * Add an exercise to the template
   * 將練習添加到範本
   */
  const addExercise = useCallback((exercise: Exercise) => {
    // Check if exercise already exists in the template (by nameKey or name)
    const isDuplicate = exercises.some(
      (existingExercise) => 
        (existingExercise.nameKey && exercise.nameKey && existingExercise.nameKey === exercise.nameKey) ||
        (!existingExercise.nameKey && !exercise.nameKey && existingExercise.exercise === exercise.name)
    );

    if (isDuplicate) {
      showAlert(
        'Exercise Already Added',
        `"${exercise.name || exercise.nameKey}" is already in this template. Each exercise can only be added once.`
      );
      return;
    }

    const newExercise: TemplateExercise = {
      id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nameKey: exercise.nameKey,
      muscleGroupKey: exercise.muscleGroupKey,
      // Legacy fields for backward compatibility
      exercise: exercise.nameKey?.replace('exercises.', '') || exercise.name || 'Unknown Exercise',
      muscleGroup: exercise.muscleGroupKey?.replace('muscleGroups.', '') || exercise.muscle_group || 'Unknown',
      movementPattern: exercise.movement_pattern || 'Unknown',
      equipment: exercise.equipment || 'Unknown',
      tags: exercise.tags || [],
    };

    setExercises((prev) => [...prev, newExercise]);
    setShowExerciseSelector(false);
  }, [exercises]);

  /**
   * Add multiple exercises to the template at once
   * 一次將多個練習添加到範本
   */
  const addMultipleExercises = useCallback((exercisesToAdd: Exercise[]) => {
    const currentExerciseKeys = new Set(
      exercises.map((ex) => ex.nameKey || ex.exercise)
    );

    const newExercises: TemplateExercise[] = [];
    const duplicates: string[] = [];
    const timestamp = Date.now();

    exercisesToAdd.forEach((exercise, index) => {
      // Check for duplicates (by nameKey or name)
      const exerciseKey = exercise.nameKey || exercise.name;
      if (currentExerciseKeys.has(exerciseKey)) {
        duplicates.push(exercise.name || exercise.nameKey || 'Unknown');
        return;
      }

      // Create new exercise entry with translation keys
      const newExercise: TemplateExercise = {
        id: `exercise-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        nameKey: exercise.nameKey,
        muscleGroupKey: exercise.muscleGroupKey,
        // Legacy fields for backward compatibility
        exercise: exercise.nameKey?.replace('exercises.', '') || exercise.name || 'Unknown Exercise',
        muscleGroup: exercise.muscleGroupKey?.replace('muscleGroups.', '') || exercise.muscle_group || 'Unknown',
        movementPattern: exercise.movement_pattern || 'Unknown',
        equipment: exercise.equipment || 'Unknown',
        tags: exercise.tags || [],
      };

      newExercises.push(newExercise);
      currentExerciseKeys.add(exerciseKey);
    });

    // Add all new exercises
    if (newExercises.length > 0) {
      setExercises((prev) => [...prev, ...newExercises]);
    }

    // Show feedback
    if (newExercises.length > 0 && duplicates.length > 0) {
      showAlert(
        'Exercises Added',
        `Added ${newExercises.length} exercise(s).\n\n${duplicates.length} duplicate(s) skipped: ${duplicates.join(', ')}`
      );
    } else if (newExercises.length > 0) {
      showSuccess(`Successfully added ${newExercises.length} exercise(s) to template.`);
    } else if (duplicates.length > 0) {
      showAlert(
        'All Duplicates',
        `All ${duplicates.length} selected exercise(s) are already in this template.`
      );
    }

    setShowExerciseSelector(false);
  }, [exercises]);

  /**
   * Remove an exercise from the template
   * 從範本中刪除練習
   */
  const removeExercise = useCallback((exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  }, []);

  /**
   * Update an exercise in the template
   * 更新範本中的練習
   */
  const updateExercise = useCallback(
    (exerciseId: string, updates: Partial<TemplateExercise>) => {
      setExercises((prev) =>
        prev.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex))
      );
    },
    []
  );

  /**
   * Reorder exercises
   * 重新排序練習
   */
  const reorderExercises = useCallback((newExercises: TemplateExercise[]) => {
    setExercises(newExercises);
  }, []);

  /**
   * Validate template before saving
   * 保存前驗證範本
   */
  const validateTemplate = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!templateName.trim()) {
      errors.push('Template name is required');
    }

    if (exercises.length === 0) {
      errors.push('At least one exercise is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [templateName, exercises]);

  /**
   * Check if there are unsaved changes
   * 檢查是否有未保存的更改
   */
  const hasUnsavedChanges = useCallback((): boolean => {
    // In create mode, check if user has entered any data
    if (mode === 'create') {
      return (
        templateName.trim().length > 0 ||
        templateDescription.trim().length > 0 ||
        exercises.length > 0
      );
    }

    // In copy mode, treat as create mode
    if (mode === 'copy') {
      return (
        templateName.trim().length > 0 ||
        templateDescription.trim().length > 0 ||
        exercises.length > 0
      );
    }

    // In edit mode, compare with initial data
    if (mode === 'edit' && initialTemplateDataRef.current) {
      const initial = initialTemplateDataRef.current;
      
      // Compare basic fields
      if (templateName !== initial.name) return true;
      if (templateDescription !== initial.description) return true;
      if (category !== initial.category) return true;
      if (difficulty !== initial.difficulty) return true;
      if (estimatedTime !== initial.estimatedTime) return true;
      
      // Compare exercises (check length first for quick return)
      if (exercises.length !== initial.exercises.length) return true;
      
      // Deep compare exercises
      const currentExercisesJson = JSON.stringify(exercises);
      const initialExercisesJson = JSON.stringify(initial.exercises);
      if (currentExercisesJson !== initialExercisesJson) return true;
      
      // No changes detected
      return false;
    }

    // Fallback: if no initial data, assume no changes
    return false;
  }, [
    mode,
    templateName,
    templateDescription,
    exercises,
    category,
    difficulty,
    estimatedTime,
  ]);

  /**
   * Save the template
   * 保存範本
   */
  const saveTemplate = useCallback(async (): Promise<{
    success: boolean;
    templateId?: string;
  }> => {
    // Validate template
    const validation = validateTemplate();
    if (!validation.isValid) {
      showAlert('Validation Error', validation.errors.join('\n'));
      return { success: false };
    }

    setSaving(true);
    setError(null);

    try {
      // Convert weight strings to numbers before saving
      const exercisesWithNumericWeights = exercises.map((ex) => {
        const exerciseCopy = { ...ex };
        
        // Convert weight from string to number
        if (typeof exerciseCopy.weight === 'string') {
          const parsed = parseFloat(exerciseCopy.weight);
          exerciseCopy.weight = isNaN(parsed) || exerciseCopy.weight === '' || exerciseCopy.weight === '.' 
            ? undefined 
            : parsed;
        }
        
        return exerciseCopy;
      });

      const templateData = {
        name: templateName.trim(),
        description: templateDescription.trim(),
        exercises: exercisesWithNumericWeights,
        category,
        difficulty,
        estimatedTime,
      };

      let result;
      if (mode === 'edit' && templateId) {
        // Update existing template
        result = await updateTemplate(templateId, templateData, userId);
      } else {
        // Create new template (for 'create' or 'copy' mode)
        result = await createTemplate(templateData, userId);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to save template');
      }

      const successMessage =
        mode === 'edit' ? 'Template updated successfully' : 'Template created successfully';
      showSuccess(successMessage);

      return {
        success: true,
        templateId: result.data?.id,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      setError(errorMessage);
      showAlert('Error', errorMessage);
      console.error('Error saving template:', err);
      return { success: false };
    } finally {
      setSaving(false);
    }
  }, [
    mode,
    templateId,
    templateName,
    templateDescription,
    exercises,
    category,
    difficulty,
    estimatedTime,
    validateTemplate,
    userId,
    showAlert,
    showSuccess,
  ]);

  return {
    // Template state
    templateName,
    templateDescription,
    exercises,
    category,
    difficulty,
    estimatedTime,

    // Exercise library state
    availableExercises,
    showExerciseSelector,
    exerciseSearchQuery,
    selectedMuscleGroup,
    muscleGroupsList, // Dynamic muscle groups list

    // UI state
    loading,
    saving,
    error,

    // Template actions
    setTemplateName,
    setTemplateDescription,
    setCategory,
    setDifficulty,
    setEstimatedTime,

    // Exercise actions
    addExercise,
    addMultipleExercises,
    removeExercise,
    updateExercise,
    reorderExercises,

    // Exercise library actions
    loadAvailableExercises,
    searchExercises,
    filterExercisesByMuscleGroup,
    setShowExerciseSelector,
    setExerciseSearchQuery,
    createCustomExercise,

    // Save action
    saveTemplate,

    // Validation
    validateTemplate,

    // Change detection
    hasUnsavedChanges,
  };
};

