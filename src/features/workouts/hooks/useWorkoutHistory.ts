/**
 * useWorkoutHistory Hook
 * 訓練歷史管理 Hook - 管理 HistoryScreen 的所有狀態和邏輯
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import * as workoutService from '../services/workoutService';
import { getMuscleGroups, getMainMuscleGroup } from '../../../shared/services/data/exerciseLibraryService';
import type { Workout, WorkoutDataByDate } from '../types/workout.types';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';

/**
 * Alert callbacks interface
 * 提示框回調介面
 */
export interface UseWorkoutHistoryCallbacks {
  showAlert?: (title: string, message: string) => void;
  showConfirmation?: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: 'default' | 'destructive';
    onConfirm: () => void;
  }) => void;
  showSuccess?: (message: string) => void;
}

/**
 * 編輯表單狀態
 * Edit form state interface
 */
export interface EditFormState {
  muscleGroup: string;
  exercise: string;
  sets: string;
  reps: string;
  weight: string;
}

/**
 * useWorkoutHistory Hook 返回值
 * useWorkoutHistory Hook return type
 */
export interface UseWorkoutHistoryReturn {
  // Data state
  workouts: Workout[];
  workoutData: WorkoutDataByDate;
  selectedDate: Date | null;
  selectedWorkouts: Workout[];
  
  // UI state
  isLoading: boolean;
  isRefreshing: boolean;
  showDetailModal: boolean;
  showEditModal: boolean;
  
  // Edit state
  editingWorkout: Workout | null;
  editForm: EditFormState;
  
  // Data operations
  loadWorkouts: () => Promise<void>;
  handleDateChange: (date: Date) => void;
  handleDatePress: (date: Date, workout: { workouts: Workout[] }) => void;
  handleRefresh: () => Promise<void>;
  
  // CRUD operations
  handleAddWorkout: () => void;
  handleEditWorkout: (workout: Workout) => void;
  handleDeleteWorkout: (workout: Workout) => void;
  handleSaveEdit: () => Promise<void>;
  
  // Modal operations
  handleCloseModal: () => void;
  handleCloseEditModal: () => void;
  
  // Form operations
  updateEditForm: (updates: Partial<EditFormState>) => void;
  
  // Muscle groups list
  muscleGroupsList: string[];
}

/**
 * useWorkoutHistory Hook
 * @param callbacks - Optional callbacks for showing alerts
 * @returns Hook return values
 */
export const useWorkoutHistory = (callbacks?: UseWorkoutHistoryCallbacks): UseWorkoutHistoryReturn => {
  const { t } = useTranslation();
  // Get current user for data isolation
  const { user } = useCloudflareAuth();
  const userId = user?.id;
  
  // Extract callbacks with defaults
  const showAlert = callbacks?.showAlert || ((title: string, message: string) => {
    console.warn('Alert not handled:', title, message);
  });
  const showConfirmation = callbacks?.showConfirmation || ((options: any) => {
    console.warn('Confirmation not handled:', options.title);
    options.onConfirm();
  });
  const showSuccess = callbacks?.showSuccess || ((message: string) => {
    console.log('Success:', message);
  });
  
  /**
   * Helper function to close all modals and show alert
   * 輔助函數：關閉所有模態框並顯示提示
   */
  const closeModalsAndShowAlert = useCallback((title: string, message: string, delay: number = 100) => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setTimeout(() => {
      showAlert(title, message);
    }, delay);
  }, [showAlert, setShowDetailModal, setShowEditModal]);
  
  /**
   * Helper function to close all modals and show success
   * 輔助函數：關閉所有模態框並顯示成功消息
   */
  const closeModalsAndShowSuccess = useCallback((message: string, delay: number = 200) => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setTimeout(() => {
      showSuccess(message);
    }, delay);
  }, [showSuccess, setShowDetailModal, setShowEditModal]);
  
  // Data state
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState<Workout[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Edit state
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    muscleGroup: '',
    exercise: '',
    sets: '',
    reps: '',
    weight: ''
  });
  
  // Dynamic muscle groups list (main groups from workouts)
  const [muscleGroupsList, setMuscleGroupsList] = useState<string[]>([]);

  /**
   * 載入訓練記錄
   * Load workout records
   */
  const loadWorkouts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await workoutService.loadWorkouts(userId);
      
      if (result.success && result.data) {
        setWorkouts(result.data);
      } else {
        console.error('載入訓練記錄失敗:', result.error);
        closeModalsAndShowAlert(t('common.error'), result.error || t('calendar.loadFailed'));
      }
    } catch (error) {
      console.error('載入訓練記錄異常:', error);
      closeModalsAndShowAlert(t('common.error'), t('calendar.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [userId, t]);

  /**
   * 載入動態肌肉群列表
   * Load dynamic muscle groups list from user's workout history (main groups only)
   */
  const loadMuscleGroups = useCallback(() => {
    try {
      // Extract unique main muscle groups from workouts
      // 從訓練記錄中提取唯一的主肌肉群
      const mainGroupsSet = new Set<string>();
      
      workouts.forEach(workout => {
        if (workout.muscleGroup) {
          const mainGroup = getMainMuscleGroup(workout.muscleGroup);
          mainGroupsSet.add(mainGroup);
        }
      });
      
      // Convert to sorted array
      const mainGroupsList = Array.from(mainGroupsSet).sort();
      setMuscleGroupsList(mainGroupsList);
    } catch (error) {
      console.error('載入肌肉群列表失敗:', error);
      setMuscleGroupsList([]);
    }
  }, [workouts]);

  /**
   * 處理下拉刷新
   * Handle pull to refresh
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadWorkouts();
    setIsRefreshing(false);
  }, [loadWorkouts]);

  /**
   * 處理訓練數據，按日期分組
   * Process workout data, grouped by date
   * Uses main muscle groups for consistent grouping and colors
   */
  const workoutData = useMemo<WorkoutDataByDate>(() => {
    const processedData: WorkoutDataByDate = {};
    
    workouts.forEach(workout => {
      // Use local time to avoid timezone issues
      const date = new Date(workout.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      if (!processedData[dateString]) {
        processedData[dateString] = {
          muscleGroups: [],
          workouts: []
        };
      }
      
      // Get main muscle group for consistent grouping
      // 獲取主肌肉群以進行一致的分組
      const mainMuscleGroup = getMainMuscleGroup(workout.muscleGroup || '');
      
      // Add main muscle group (deduplicated)
      // 添加主肌肉群（去重）
      if (!processedData[dateString].muscleGroups.includes(mainMuscleGroup)) {
        processedData[dateString].muscleGroups.push(mainMuscleGroup);
      }
      
      // Add workout record
      processedData[dateString].workouts.push(workout);
    });
    
    return processedData;
  }, [workouts]);

  /**
   * 處理日期點擊
   * Handle date press
   */
  const handleDatePress = useCallback((date: Date, workout: { workouts: Workout[] }) => {
    setSelectedDate(date);
    setSelectedWorkouts(workout.workouts || []);
    setShowDetailModal(true);
  }, []);

  /**
   * 處理選中日期變更
   * Handle selected date change
   */
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  /**
   * 關閉詳情模態框
   * Close detail modal
   */
  const handleCloseModal = useCallback(() => {
    setShowDetailModal(false);
    setSelectedDate(null);
    setSelectedWorkouts([]);
  }, []);

  /**
   * 處理新增訓練記錄
   * Handle add workout
   */
  const handleAddWorkout = useCallback(() => {
    if (!selectedDate) {
      closeModalsAndShowAlert(t('common.error'), t('calendar.selectDateFirst'));
      return;
    }
    
    // Reset edit form
    setEditForm({
      muscleGroup: '',
      exercise: '',
      sets: '',
      reps: '',
      weight: ''
    });
    
    // Create a new workout placeholder with selected date
    setEditingWorkout({
      id: '', // Empty ID indicates new workout
      date: selectedDate.toISOString(),
      muscleGroup: '',
      exercise: '',
      sets: 0,
      reps: 0,
      weight: 0
    });
    
    // Close detail modal and open edit modal
    setShowDetailModal(false);
    setTimeout(() => {
      setShowEditModal(true);
    }, 200);
  }, [selectedDate, t, closeModalsAndShowAlert, setShowDetailModal, setEditForm, setEditingWorkout, setShowEditModal]);

  /**
   * 處理編輯訓練記錄
   * Handle edit workout
   */
  const handleEditWorkout = useCallback((workout: Workout) => {
    if (!workout || !workout.id) {
      closeModalsAndShowAlert(t('common.error'), t('calendar.cannotEditWorkout'));
      return;
    }
    
    // Close detail modal first
    setShowDetailModal(false);
    
    setEditingWorkout(workout);
    setEditForm({
      muscleGroup: workout.muscleGroup || '',
      exercise: workout.exercise || '',
      sets: workout.sets ? workout.sets.toString() : '',
      reps: workout.reps ? workout.reps.toString() : '',
      weight: workout.weight ? workout.weight.toString() : ''
    });
    
    // Open edit modal after detail modal is closed
    setTimeout(() => {
      setShowEditModal(true);
    }, 200);
  }, [t, closeModalsAndShowAlert, setShowDetailModal, setEditingWorkout, setEditForm, setShowEditModal]);

  /**
   * 處理刪除訓練記錄
   * Handle delete workout
   */
  const handleDeleteWorkout = useCallback((workout: Workout) => {
    if (!workout || !workout.id) {
      closeModalsAndShowAlert(t('common.error'), t('calendar.cannotDeleteWorkout'));
      return;
    }
    
    // Close detail modal first to ensure confirmation dialog is visible
    // 先關閉詳情模態框，確保確認對話框可見
    setShowDetailModal(false);
    
    // Show confirmation after a short delay to ensure modal is closed
    // 短暫延遲後顯示確認對話框，確保模態框已關閉
    setTimeout(() => {
      showConfirmation({
        title: t('calendar.confirmDelete'),
        message: t('calendar.confirmDeleteMessage'),
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
        confirmStyle: 'destructive',
        onConfirm: async () => {
            const result = await workoutService.deleteWorkout(workout.id, userId);
            
            if (result.success) {
              // Reload workouts
              await loadWorkouts();
              // Update selected workouts list
              const updatedWorkouts = selectedWorkouts.filter(w => w.id !== workout.id);
              setSelectedWorkouts(updatedWorkouts);
          
          // Show success message after modal is closed
          closeModalsAndShowSuccess(t('calendar.workoutDeleted'), 200);
            } else {
          closeModalsAndShowAlert(t('common.error'), result.error || t('calendar.deleteFailed'), 200);
            }
      },
      });
    }, 100);
  }, [userId, t, loadWorkouts, selectedWorkouts, showConfirmation, closeModalsAndShowAlert, closeModalsAndShowSuccess, setShowDetailModal]);

  /**
   * 處理保存編輯
   * Handle save edit
   */
  const handleSaveEdit = useCallback(async () => {
    if (!editingWorkout) {
      closeModalsAndShowAlert(t('common.error'), t('calendar.invalidWorkout'));
      return;
    }
    
    // Validate form inputs
    if (!editForm.muscleGroup || !editForm.exercise || !editForm.sets || !editForm.reps || !editForm.weight) {
      closeModalsAndShowAlert(t('common.error'), t('workout.fillAllFields'));
      return;
    }

    try {
      const workoutData = {
        muscleGroup: editForm.muscleGroup,
        exercise: editForm.exercise,
        sets: parseInt(editForm.sets),
        reps: parseInt(editForm.reps),
        weight: parseFloat(editForm.weight),
        date: editingWorkout.date
      };

      let result;
      if (editingWorkout.id) {
        // Update existing workout
        result = await workoutService.updateWorkout(
          { ...workoutData, id: editingWorkout.id },
          userId
        );
      } else {
        // Create new workout
        result = await workoutService.saveWorkout(workoutData, userId);
      }

      if (result.success) {
        // Close edit modal first
        setShowEditModal(false);
        setEditingWorkout(null);
        
        // Reload workouts to update UI
        await loadWorkouts();
        
        // Show success message after modal is closed
        const successMessage = editingWorkout.id ? t('calendar.workoutUpdated') : t('calendar.workoutAdded');
        closeModalsAndShowSuccess(successMessage, 200);
      } else {
        closeModalsAndShowAlert(t('common.error'), result.error || t('calendar.saveFailed'));
      }
    } catch (error) {
      console.error('保存訓練記錄錯誤:', error);
      const errorMessage = t('calendar.saveFailedWithError') + ': ' + (error instanceof Error ? error.message : 'Unknown error');
      closeModalsAndShowAlert(t('common.error'), errorMessage);
    }
  }, [editingWorkout, editForm, userId, t, loadWorkouts, closeModalsAndShowAlert, closeModalsAndShowSuccess, setShowEditModal, setEditingWorkout]);

  /**
   * 關閉編輯模態框
   * Close edit modal
   */
  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingWorkout(null);
    setEditForm({
      muscleGroup: '',
      exercise: '',
      sets: '',
      reps: '',
      weight: ''
    });
    
    // Reopen detail modal if there was a selected date
    if (selectedDate && selectedWorkouts.length > 0) {
      setTimeout(() => {
        setShowDetailModal(true);
      }, 100);
    }
  }, [selectedDate, selectedWorkouts]);

  /**
   * 更新編輯表單
   * Update edit form
   */
  const updateEditForm = useCallback((updates: Partial<EditFormState>) => {
    setEditForm(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * 當訓練記錄變化時更新肌肉群列表
   * Update muscle groups list when workouts change
   */
  useEffect(() => {
    loadMuscleGroups();
  }, [loadMuscleGroups]);

  /**
   * 當頁面獲得焦點時重新載入數據
   * Reload data when screen gains focus
   */
  useFocusEffect(
    useCallback(() => {
      loadWorkouts();
      // loadMuscleGroups will be called automatically when workouts change
      // loadMuscleGroups 會在訓練記錄變化時自動調用
    }, [loadWorkouts])
  );

  return {
    // Data state
    workouts,
    workoutData,
    selectedDate,
    selectedWorkouts,
    
    // UI state
    isLoading,
    isRefreshing,
    showDetailModal,
    showEditModal,
    
    // Edit state
    editingWorkout,
    editForm,
    
    // Data operations
    loadWorkouts,
    handleDateChange,
    handleDatePress,
    handleRefresh,
    
    // CRUD operations
    handleAddWorkout,
    handleEditWorkout,
    handleDeleteWorkout,
    handleSaveEdit,
    
    // Modal operations
    handleCloseModal,
    handleCloseEditModal,
    
    // Form operations
    updateEditForm,
    
    // Muscle groups list
    muscleGroupsList,
  };
};


