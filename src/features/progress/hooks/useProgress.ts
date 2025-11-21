/**
 * Progress Hook
 * 進度追蹤 Hook - 管理進度圖表的狀態和邏輯
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';

/**
 * Progress hook callbacks interface
 * 進度 Hook 回調介面
 */
export interface UseProgressCallbacks {
  showAlert?: (title: string, message: string) => void;
}
import { getAvailableExercises, loadWorkouts, getPerformedExercisesList } from '../../workouts/services/workoutService';
import type { PerformedExercise } from '../../workouts/services/workoutService';
import { getMainMuscleGroup } from '../../../shared/services/data/exerciseLibraryService';
import { 
  calculateExerciseProgress, 
  saveTargetWeight, 
  getTargetWeight,
  loadLastExercise,
  saveLastExercise 
} from '../services/progressService';
// Removed exerciseMapping import - using t() function and translation keys instead
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../shared/constants';
import type { 
  ChartDataPoint, 
  ProgressStats, 
  TimeRange, 
  ChartType 
} from '../types/progress.types';
import type { Workout } from '../../workouts/types/workout.types';

/**
 * useProgress Hook
 * 管理進度圖表的所有狀態和業務邏輯
 * @param callbacks - Optional callbacks for showing alerts
 */
export const useProgress = (callbacks?: UseProgressCallbacks) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  // Extract callbacks with defaults
  const showAlert = callbacks?.showAlert || ((title: string, message: string) => {
    console.warn('Alert not handled:', title, message);
  });

  // State
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('1m');
  const [chartType, setChartType] = useState<ChartType>('weight');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [stats, setStats] = useState<ProgressStats>({
    total: 0,
    maxWeight: 0,
    latest: 0,
    improvement: 0,
  });
  const [targetWeight, setTargetWeight] = useState<number>(0);
  const [customExercises, setCustomExercises] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Map of exercise names to their muscle groups from actual workout records
  const [performedExercises, setPerformedExercises] = useState<Map<string, string>>(new Map());
  // List of performed exercises with name and muscle group
  const [performedExercisesList, setPerformedExercisesList] = useState<PerformedExercise[]>([]);
  // Dynamic list of muscle groups from performed exercises only
  const [muscleGroupsList, setMuscleGroupsList] = useState<string[]>([]);
  // Track if initial auto-selection has been performed
  const hasInitialAutoSelection = useRef(false);
  // Track if user has manually interacted with selections
  const hasManualInteraction = useRef(false);

  /**
   * 載入自定義訓練動作
   */
  const loadCustomExercises = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      if (stored) {
        setCustomExercises(JSON.parse(stored));
      }
    } catch (error) {
      console.error('載入自定義訓練動作失敗:', error);
    }
  }, []);

  /**
   * 載入用戶實際執行的動作列表（從訓練記錄中）
   * Load list of exercises that user has actually performed (from workout records)
   */
  const loadPerformedExercises = useCallback(async () => {
    try {
      // Get performed exercises list from workout service
      const result = await getPerformedExercisesList(user?.id);
      
      if (!result.success || !result.data) {
        setPerformedExercisesList([]);
        setPerformedExercises(new Map());
        setMuscleGroupsList([]);
        return;
      }

      const performedList = result.data;
      setPerformedExercisesList(performedList);

      // Create a map of exercise names to their muscle groups
      // 創建動作名稱到肌肉群的映射
      const exerciseMap = new Map<string, string>();
      performedList.forEach(ex => {
        exerciseMap.set(ex.name, ex.muscleGroup);
      });
      setPerformedExercises(exerciseMap);

      // Generate unique muscle groups list from performed exercises
      // Apply mapping to convert sub-groups to main groups
      // 從已執行的動作中生成獨特的肌肉群列表
      // 應用映射將子群組轉換為主群組
      const uniqueMuscleGroups = Array.from(
        new Set(performedList.map(ex => getMainMuscleGroup(ex.muscleGroup)))
      )
        .filter(mg => mg) // Filter out empty/null values
        .sort(); // Sort alphabetically
      setMuscleGroupsList(uniqueMuscleGroups);
    } catch (error) {
      console.error('載入已執行動作列表失敗:', error);
      setPerformedExercisesList([]);
      setPerformedExercises(new Map());
      setMuscleGroupsList([]);
    }
  }, [user?.id]);

  /**
   * 載入目標重量
   */
  const loadTargetWeightForExercise = useCallback(async (exercise: string, type: ChartType) => {
    if (!exercise) {
      setTargetWeight(0);
      return;
    }

    const result = await getTargetWeight(exercise, type);
    if (result.success && result.data !== undefined) {
      setTargetWeight(result.data);
    } else {
      setTargetWeight(0);
    }
  }, []);

  /**
   * 載入訓練進度數據
   */
  const loadProgressData = useCallback(async () => {
    if (!selectedExercise) {
      setChartData([]);
      setStats({
        total: 0,
        maxWeight: 0,
        latest: 0,
        improvement: 0,
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await calculateExerciseProgress(
        selectedExercise,
        selectedTimeRange,
        user?.id,
        chartType // Pass chartType to handle weight vs volume filtering
      );

      if (result.success && result.data) {
        setChartData(result.data.chartData);
        // Recalculate stats based on chart type
        const dataForStats = result.data.chartData;
        const values = dataForStats
          .map(d => (chartType === 'volume' ? d.volume : d.weight))
          .filter(v => v > 0 && !isNaN(v));

        if (values.length > 0) {
          const total = values.length;
          const maxWeight = Math.max(...values);
          const latest = values[values.length - 1];
          let improvement = 0;
          if (values.length > 1) {
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            improvement = ((lastValue - firstValue) / firstValue) * 100;
          }
          setStats({
            total,
            maxWeight,
            latest,
            improvement: Math.round(improvement * 10) / 10,
          });
        } else {
          setStats({
            total: 0,
            maxWeight: 0,
            latest: 0,
            improvement: 0,
          });
        }
      } else {
        console.error('載入進度數據失敗:', result.error);
      }
    } catch (error) {
      console.error('載入進度數據失敗:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedExercise, selectedTimeRange, chartType, user?.id]);

  /**
   * 處理肌肉群選擇
   */
  const handleMuscleGroupSelect = useCallback((muscleGroup: string) => {
    hasManualInteraction.current = true; // Mark that user is manually interacting
    setSelectedMuscleGroup(muscleGroup);
    setSelectedExercise(''); // Reset exercise selection
  }, []);

  /**
   * 處理動作選擇
   */
  const handleExerciseSelect = useCallback((exercise: string) => {
    hasManualInteraction.current = true; // Mark that user is manually interacting
    
    // The exercise parameter is the translated display name
    // We need to find the original English name from performedExercisesList
    // 動作參數是翻譯後的顯示名稱
    // 我們需要從 performedExercisesList 中找到原始英文名稱
    let originalExerciseName = exercise;
    
    // Try to find the original English name by matching translated names
    // 嘗試通過匹配翻譯後的名稱來找到原始英文名稱
    for (const performedEx of performedExercisesList) {
      const snakeCase = performedEx.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const translationKey = `exercises.${snakeCase}`;
      const translated = t(translationKey);
      if (translated === exercise || performedEx.name === exercise) {
        originalExerciseName = performedEx.name;
        break;
      }
    }
    
    // Store the original English name (not translation key)
    // 存儲原始英文名稱（不是翻譯鍵）
    setSelectedExercise(originalExerciseName);
    // Save last exercise for next time
    if (selectedMuscleGroup) {
      saveLastExercise(selectedMuscleGroup, originalExerciseName);
    }
  }, [performedExercisesList, selectedMuscleGroup, t]);

  /**
   * 處理時間範圍選擇
   */
  const handleTimeRangeSelect = useCallback((timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
  }, []);

  /**
   * 處理圖表類型選擇
   */
  const handleChartTypeSelect = useCallback((type: ChartType) => {
    setChartType(type);
  }, []);

  /**
   * 處理目標重量保存
   */
  const handleTargetWeightSave = useCallback(async (weight: number) => {
    if (!selectedExercise) {
      showAlert(t('common.error'), t('progress.pleaseSelectExercise'));
      return false;
    }

    if (isNaN(weight) || weight <= 0) {
      showAlert(t('common.error'), t('progress.pleaseEnterValidValue'));
      return false;
    }

    const result = await saveTargetWeight(selectedExercise, weight, chartType);
    if (result.success) {
      setTargetWeight(weight);
      return true;
    } else {
      showAlert(t('common.error'), result.error || t('progress.saveTargetWeightFailed'));
      return false;
    }
  }, [selectedExercise, chartType, t, showAlert]);

  /**
   * 獲取可用的動作列表（僅顯示用戶實際執行過的動作）
   * Get available exercises list (only shows exercises user has actually performed)
   * 
   * Filters exercises by main muscle group, showing all sub-groups when a main group is selected
   * 根據主肌肉群過濾動作，選擇主群組時顯示所有子群組
   */
  const getAvailableExercisesForMuscleGroup = useCallback(() => {
    if (!selectedMuscleGroup) return [];
    
    const currentLanguage = i18n.language === 'zh' ? 'zh' : 'en';
    
    // Filter performed exercises by selected main muscle group
    // Use getMainMuscleGroup to map sub-groups to main groups
    // 根據選中的主肌肉群過濾已執行的動作
    // 使用 getMainMuscleGroup 將子群組映射到主群組
    const performedExercisesForGroup: string[] = [];
    performedExercisesList.forEach(exercise => {
      // Get the main group for this exercise's muscle group
      // 獲取此動作肌肉群的主群組
      const exerciseMainGroup = getMainMuscleGroup(exercise.muscleGroup);
      
      // If the exercise's main group matches the selected main group, include it
      // 如果動作的主群組與選中的主群組匹配，則包含它
      if (exerciseMainGroup === selectedMuscleGroup) {
        // Exercise name is raw English string, convert to translation key for display
        // 動作名稱是原始英文字符串，轉換為翻譯鍵以顯示
        const exerciseName = exercise.name || '';
        if (exerciseName) {
          // Convert to snake_case for translation key
          const snakeCase = exerciseName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
          const translationKey = `exercises.${snakeCase}`;
          const translated = t(translationKey);
          // Use translated name if available, otherwise use original
          const displayName = translated === translationKey ? exerciseName : translated;
          performedExercisesForGroup.push(displayName);
        }
      }
    });
    
    // Remove duplicates and sort
    // 去重並排序
    const uniqueExercises = Array.from(new Set(performedExercisesForGroup)).sort();
    
    return uniqueExercises;
  }, [selectedMuscleGroup, performedExercisesList, i18n.language]);

  /**
   * 下拉刷新
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProgressData();
      await loadCustomExercises();
      await loadPerformedExercises();
    } catch (error) {
      console.error('刷新數據失敗:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadProgressData, loadCustomExercises, loadPerformedExercises]);

  /**
   * 自動選擇第一個有數據的動作（僅在初始載入時執行）
   * Auto-select first exercise (only runs on initial load)
   */
  const autoSelectFirstExercise = useCallback(async () => {
    // Don't run if user has manually interacted or if we've already done initial selection
    // 如果用戶已手動交互或已完成初始選擇，則不執行
    if (hasManualInteraction.current || hasInitialAutoSelection.current) {
      return;
    }

    try {
      // Use performed exercises from actual workout records
      // 使用實際訓練記錄中的已執行動作
      if (performedExercisesList.length > 0) {
        // Get first exercise from performed exercises list
        const firstExercise = performedExercisesList[0];
        
        // Only auto-select if nothing is currently selected
        // 僅在當前沒有選擇時自動選擇
        if (!selectedMuscleGroup && !selectedExercise) {
          // Use main muscle group for the selected group
          // 使用主肌肉群作為選中的群組
          const mainMuscleGroup = getMainMuscleGroup(firstExercise.muscleGroup);
          setSelectedMuscleGroup(mainMuscleGroup);
          setSelectedExercise(firstExercise.name);
          hasInitialAutoSelection.current = true;
        }
      } else {
        // Fallback to getAvailableExercises if no performed exercises loaded yet
        // 如果尚未載入已執行動作，則回退到 getAvailableExercises
        const result = await getAvailableExercises(user?.id);
        if (result.success && result.data && result.data.length > 0) {
          const firstExercise = result.data[0];
          
          // Find muscle group for this exercise from performed exercises
          const exerciseMuscleGroup = performedExercises.get(firstExercise);
          if (exerciseMuscleGroup && !selectedMuscleGroup && !selectedExercise) {
            // Use main muscle group for the selected group
            // 使用主肌肉群作為選中的群組
            const mainMuscleGroup = getMainMuscleGroup(exerciseMuscleGroup);
            setSelectedMuscleGroup(mainMuscleGroup);
            setSelectedExercise(firstExercise);
            hasInitialAutoSelection.current = true;
          }
        }
      }
    } catch (error) {
      console.error('自動選擇動作失敗:', error);
    }
  }, [performedExercisesList, performedExercises, selectedMuscleGroup, selectedExercise, user?.id]);

  /**
   * 載入上次選擇的動作
   * Returns true if a selection was successfully loaded
   */
  const loadLastExerciseSelection = useCallback(async (): Promise<boolean> => {
    const result = await loadLastExercise();
    if (result.success && result.data) {
      const { muscleGroup, exercise } = result.data;
      if (muscleGroup && exercise) {
        // Validate selection against performed exercises
        // 根據已執行動作驗證選擇
        const exerciseMuscleGroup = performedExercises.get(exercise);
        if (exerciseMuscleGroup) {
          // Convert saved muscle group to main group and compare
          // 將保存的肌肉群轉換為主群組並比較
          const exerciseMainGroup = getMainMuscleGroup(exerciseMuscleGroup);
          const savedMainGroup = getMainMuscleGroup(muscleGroup);
          
          if (exerciseMainGroup === savedMainGroup) {
            // Use main muscle group for the selected group
            // 使用主肌肉群作為選中的群組
            setSelectedMuscleGroup(exerciseMainGroup);
            setSelectedExercise(exercise);
            return true; // Successfully loaded last selection
          }
        }
      }
    }
    return false; // No valid last selection found
  }, [performedExercises]);

  // Load data when exercise or time range changes
  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  // Load target weight when exercise or chart type changes
  useEffect(() => {
    loadTargetWeightForExercise(selectedExercise, chartType);
  }, [selectedExercise, chartType, loadTargetWeightForExercise]);

  // Initial load
  useEffect(() => {
    loadCustomExercises();
    loadPerformedExercises();
  }, [loadCustomExercises, loadPerformedExercises]);

  // Load last exercise selection after performed exercises are loaded (only once)
  useEffect(() => {
    const loadInitialSelection = async () => {
      if (performedExercises.size > 0 && !hasInitialAutoSelection.current && !hasManualInteraction.current) {
        const loadedLastSelection = await loadLastExerciseSelection();
        // After trying to load last selection, if nothing was selected, do auto-selection
        // 嘗試載入上次選擇後，如果沒有選擇任何內容，則執行自動選擇
        if (!loadedLastSelection) {
          // No valid last selection found, do auto-selection
          autoSelectFirstExercise();
        } else {
          // Successfully loaded last selection
          hasInitialAutoSelection.current = true;
        }
      }
    };
    
    loadInitialSelection();
  }, [performedExercises.size, loadLastExerciseSelection, autoSelectFirstExercise]);

  // Auto-select first exercise only on initial load (when both are empty AND no manual interaction)
  // This effect should NOT run when user manually changes selections
  // Note: This is a fallback in case loadLastExerciseSelection doesn't trigger auto-selection
  useEffect(() => {
    // Only run if:
    // 1. We have performed exercises loaded
    // 2. Nothing is currently selected (both muscle group and exercise are empty)
    // 3. User hasn't manually interacted yet
    // 4. We haven't done initial auto-selection yet
    if (
      performedExercises.size > 0 &&
      !selectedExercise &&
      !selectedMuscleGroup &&
      !hasManualInteraction.current &&
      !hasInitialAutoSelection.current
    ) {
      // Double-check refs before executing (defensive programming)
      if (!hasManualInteraction.current && !hasInitialAutoSelection.current) {
        autoSelectFirstExercise();
      }
    }
  }, [performedExercises.size, autoSelectFirstExercise]); // Only depend on size, not the map itself or selected states

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadProgressData();
      loadCustomExercises();
      loadPerformedExercises();
    }, [loadProgressData, loadCustomExercises, loadPerformedExercises])
  );

  return {
    // State
    selectedMuscleGroup,
    selectedExercise,
    selectedTimeRange,
    chartType,
    chartData,
    stats,
    targetWeight,
    isLoading,
    refreshing,
    muscleGroupsList, // Dynamic muscle groups list

    // Actions
    handleMuscleGroupSelect,
    handleExerciseSelect,
    handleTimeRangeSelect,
    handleChartTypeSelect,
    handleTargetWeightSave,
    getAvailableExercisesForMuscleGroup,
    onRefresh,
  };
};

