/**
 * useTemplateEditor Hook
 * 範本編輯器 Hook
 * 
 * Custom hook for creating and editing workout templates
 * 用於創建和編輯訓練範本的自定義 Hook
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { WorkoutTemplate, TemplateExercise, EditorMode } from '../types/template.types';
import { createTemplate, updateTemplate, getTemplateById } from '../services/templateService';
import {
  getAllExercises,
  searchExercises as searchExercisesService,
  getExercisesByMuscleGroup,
  saveCustomExercise,
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
 */
export const useTemplateEditor = ({
  mode,
  templateId,
  initialTemplate,
}: UseTemplateEditorParams): UseTemplateEditorReturn => {
  // Get current user for data isolation
  const { user } = useCloudflareAuth();
  const userId = user?.id;

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

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
          const templateName = mode === 'copy' ? `${template.name} (Copy)` : template.name;
          const templateDescription = template.description;
          
          // Parse exercises from JSON string if needed
          const parsedExercises = typeof template.exercises === 'string'
            ? JSON.parse(template.exercises)
            : template.exercises;
          
          // Ensure exercises have valid IDs
          const validExercises = (parsedExercises || []).map((exercise: any, index: number) => ({
            id: exercise.id || `exercise-${Date.now()}-${index}`,
            exercise: exercise.exercise || exercise.name || 'Unknown Exercise',
            muscleGroup: exercise.muscleGroup || exercise.muscle_group || 'Unknown',
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
      Alert.alert('Error', 'Failed to load exercises');
    }
  }, [userId]);

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
      Alert.alert('Error', 'Failed to search exercises');
    }
  }, [loadAvailableExercises]);

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
      Alert.alert('Error', 'Failed to filter exercises');
    }
  }, []);

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
        Alert.alert('Error', 'Please enter an exercise name');
        return;
      }

      if (!muscleGroup || muscleGroup.trim() === '') {
        Alert.alert('Error', 'Please select a muscle group');
        return;
      }

      if (!equipment || equipment.trim() === '') {
        Alert.alert('Error', 'Please select equipment');
        return;
      }

      if (!userId) {
        Alert.alert('Error', 'You must be logged in to create custom exercises');
        return;
      }

      const result = await saveCustomExercise(exerciseName, muscleGroup, equipment, userId);
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to create custom exercise');
        return;
      }

      // Reload exercises to include the new custom exercise
      await loadAvailableExercises();

      Alert.alert('Success', `Custom exercise "${exerciseName}" created successfully!`);
    } catch (err) {
      console.error('Error creating custom exercise:', err);
      Alert.alert('Error', 'Failed to create custom exercise');
    }
  }, [userId, loadAvailableExercises]);

  /**
   * Add an exercise to the template
   * 將練習添加到範本
   */
  const addExercise = useCallback((exercise: Exercise) => {
    // Check if exercise already exists in the template
    const isDuplicate = exercises.some(
      (existingExercise) => existingExercise.exercise === exercise.name
    );

    if (isDuplicate) {
      Alert.alert(
        'Exercise Already Added',
        `"${exercise.name}" is already in this template. Each exercise can only be added once.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const newExercise: TemplateExercise = {
      id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exercise: exercise.name,
      muscleGroup: exercise.muscle_group,
      movementPattern: exercise.movement_pattern,
      equipment: exercise.equipment,
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
    const currentExerciseNames = new Set(
      exercises.map((ex) => ex.exercise)
    );

    const newExercises: TemplateExercise[] = [];
    const duplicates: string[] = [];
    const timestamp = Date.now();

    exercisesToAdd.forEach((exercise, index) => {
      // Check for duplicates
      if (currentExerciseNames.has(exercise.name)) {
        duplicates.push(exercise.name);
        return;
      }

      // Create new exercise entry
      const newExercise: TemplateExercise = {
        id: `exercise-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        exercise: exercise.name,
        muscleGroup: exercise.muscle_group,
        movementPattern: exercise.movement_pattern,
        equipment: exercise.equipment,
        tags: exercise.tags || [],
      };

      newExercises.push(newExercise);
      currentExerciseNames.add(exercise.name);
    });

    // Add all new exercises
    if (newExercises.length > 0) {
      setExercises((prev) => [...prev, ...newExercises]);
    }

    // Show feedback
    if (newExercises.length > 0 && duplicates.length > 0) {
      Alert.alert(
        'Exercises Added',
        `Added ${newExercises.length} exercise(s).\n\n${duplicates.length} duplicate(s) skipped: ${duplicates.join(', ')}`,
        [{ text: 'OK', style: 'default' }]
      );
    } else if (newExercises.length > 0) {
      Alert.alert(
        'Success',
        `Successfully added ${newExercises.length} exercise(s) to template.`,
        [{ text: 'OK', style: 'default' }]
      );
    } else if (duplicates.length > 0) {
      Alert.alert(
        'All Duplicates',
        `All ${duplicates.length} selected exercise(s) are already in this template.`,
        [{ text: 'OK', style: 'default' }]
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
      Alert.alert('Validation Error', validation.errors.join('\n'));
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
      Alert.alert('Success', successMessage);

      return {
        success: true,
        templateId: result.data?.id,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
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

