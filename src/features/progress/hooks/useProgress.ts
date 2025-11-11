/**
 * Progress Hook
 * 進度追蹤 Hook - 管理進度圖表的狀態和邏輯
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/hooks/useAuth';
import { getAvailableExercises } from '../../workouts/services/workoutService';
import { 
  calculateExerciseProgress, 
  saveTargetWeight, 
  getTargetWeight,
  loadLastExercise,
  saveLastExercise 
} from '../services/progressService';
import { MUSCLE_GROUPS } from '../../../shared/constants';
import { 
  getExercisesForMuscleGroup, 
  findExerciseKeyByChineseName, 
  findExerciseKeyByEnglishName,
  MUSCLE_GROUP_EXERCISES 
} from '../../../shared/data/exerciseMapping';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../../shared/constants';
import type { 
  ChartDataPoint, 
  ProgressStats, 
  TimeRange, 
  ChartType 
} from '../types/progress.types';

/**
 * useProgress Hook
 * 管理進度圖表的所有狀態和業務邏輯
 */
export const useProgress = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

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
        user?.id
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
    setSelectedMuscleGroup(muscleGroup);
    setSelectedExercise(''); // Reset exercise selection
  }, []);

  /**
   * 處理動作選擇
   */
  const handleExerciseSelect = useCallback((exercise: string) => {
    // Convert display name to English key
    const currentLanguage = i18n.language === 'zh' ? 'zh' : 'en';
    let exerciseKey = exercise;
    
    if (currentLanguage === 'zh') {
      const foundKey = findExerciseKeyByChineseName(exercise);
      if (foundKey) exerciseKey = foundKey;
    } else {
      const foundKey = findExerciseKeyByEnglishName(exercise);
      if (foundKey) exerciseKey = foundKey;
    }

    setSelectedExercise(exerciseKey);
    // Save last exercise for next time
    if (selectedMuscleGroup) {
      saveLastExercise(selectedMuscleGroup, exerciseKey);
    }
  }, [i18n.language, selectedMuscleGroup]);

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
      Alert.alert(t('common.error'), t('progress.pleaseSelectExercise'));
      return false;
    }

    if (isNaN(weight) || weight <= 0) {
      Alert.alert(t('common.error'), t('progress.pleaseEnterValidValue'));
      return false;
    }

    const result = await saveTargetWeight(selectedExercise, weight, chartType);
    if (result.success) {
      setTargetWeight(weight);
      return true;
    } else {
      Alert.alert(t('common.error'), result.error || t('progress.saveTargetWeightFailed'));
      return false;
    }
  }, [selectedExercise, chartType, t]);

  /**
   * 獲取可用的動作列表
   */
  const getAvailableExercisesForMuscleGroup = useCallback(() => {
    if (!selectedMuscleGroup) return [];
    const currentLanguage = i18n.language === 'zh' ? 'zh' : 'en';
    const defaultExercises = getExercisesForMuscleGroup(selectedMuscleGroup, currentLanguage);
    const customExercisesForGroup = customExercises[selectedMuscleGroup] || [];
    return [...customExercisesForGroup, ...defaultExercises];
  }, [selectedMuscleGroup, customExercises, i18n.language]);

  /**
   * 下拉刷新
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProgressData();
      await loadCustomExercises();
    } catch (error) {
      console.error('刷新數據失敗:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadProgressData, loadCustomExercises]);

  /**
   * 自動選擇第一個有數據的動作
   */
  const autoSelectFirstExercise = useCallback(async () => {
    try {
      const result = await getAvailableExercises(user?.id);
      if (result.success && result.data && result.data.length > 0) {
        const firstExercise = result.data[0];

        // Check if current selection is valid
        let currentSelectionValid = false;
        if (selectedMuscleGroup && selectedExercise) {
          const availableKeys = MUSCLE_GROUP_EXERCISES[selectedMuscleGroup] || [];
          currentSelectionValid = availableKeys.includes(selectedExercise);
        }

        // If current selection is invalid, select first exercise
        if (!currentSelectionValid) {
          // Find muscle group for this exercise
          for (const muscleGroup of MUSCLE_GROUPS) {
            const exerciseKeys = MUSCLE_GROUP_EXERCISES[muscleGroup] || [];
            if (exerciseKeys.includes(firstExercise)) {
              setSelectedMuscleGroup(muscleGroup);
              setSelectedExercise(firstExercise);
              return;
            }
          }

          // Check custom exercises
          for (const [muscleGroup, customExerciseList] of Object.entries(customExercises)) {
            if (customExerciseList.includes(firstExercise)) {
              setSelectedMuscleGroup(muscleGroup);
              setSelectedExercise(firstExercise);
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('自動選擇動作失敗:', error);
    }
  }, [user?.id, selectedMuscleGroup, selectedExercise, customExercises]);

  /**
   * 載入上次選擇的動作
   */
  const loadLastExerciseSelection = useCallback(async () => {
    const result = await loadLastExercise();
    if (result.success && result.data) {
      const { muscleGroup, exercise } = result.data;
      if (muscleGroup && exercise) {
        // Validate selection
        const availableKeys = MUSCLE_GROUP_EXERCISES[muscleGroup] || [];
        if (availableKeys.includes(exercise)) {
          setSelectedMuscleGroup(muscleGroup);
          setSelectedExercise(exercise);
        }
      }
    }
  }, []);

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
    loadLastExerciseSelection();
  }, [loadCustomExercises, loadLastExerciseSelection]);

  // Auto-select first exercise only on initial load (when both are empty)
  useEffect(() => {
    if (!selectedExercise && !selectedMuscleGroup) {
      autoSelectFirstExercise();
    }
  }, [selectedExercise, selectedMuscleGroup, autoSelectFirstExercise]);

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      loadProgressData();
      loadCustomExercises();
    }, [loadProgressData, loadCustomExercises])
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

