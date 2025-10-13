/**
 * 進度圖表頁面組件
 * Progress Chart Screen Component
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  TextInput,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useWorkouts } from '../hooks/useWorkouts';
import { useUnit } from '../hooks/useUnit';
import { useTranslation } from 'react-i18next';
import CustomLineChart from './charts/CustomLineChart';
import { TIME_RANGE_OPTIONS, STORAGE_KEYS, MUSCLE_GROUPS, convertWeight } from '../constants';
import { getExerciseName, getExercisesForMuscleGroup, findExerciseKeyByChineseName, findExerciseKeyByEnglishName, MUSCLE_GROUP_EXERCISES } from '../data/exerciseMapping';
import i18n from '../i18n';
import { filterDataByTimeRange, calculateStats } from '../utils/helpers';
import { formatWeight, formatWeightWithUnit } from '../services/utils/weightFormatter';
import { getLastExercise } from '../utils/storage/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PropTypes from 'prop-types';

const { width: screenWidth } = Dimensions.get('window');

/**
 * 進度圖表頁面組件
 * @param {Object} props - 組件屬性
 * @param {Object} props.theme - 主題配置
 * @returns {JSX.Element} 進度圖表頁面組件
 */
const ProgressChartScreen = ({ theme }) => {
  const styles = createStyles(theme);
  
  // 狀態管理
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1m');
  const [showMuscleGroupModal, setShowMuscleGroupModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTargetWeightModal, setShowTargetWeightModal] = useState(false);
  const [targetWeightInput, setTargetWeightInput] = useState('');
  const [targetWeights, setTargetWeights] = useState({}); // 改為存儲每個訓練動作的目標重量
  const [customExercises, setCustomExercises] = useState({}); // 自定義訓練動作
  const [chartType, setChartType] = useState('weight'); // 圖表類型：'weight' 或 'volume'

  // 使用自定義 Hook
  const { workouts, loadWorkouts, getWorkoutsByExercise, getAvailableExercises } = useWorkouts();
  const { currentUnit, formatWeight, convertWeightValue } = useUnit();
  const { t } = useTranslation();

  // 下拉刷新處理函數
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadWorkouts();
    } catch (error) {
      console.error('刷新數據失敗:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadWorkouts]);

  /**
   * 載入所有訓練動作的目標重量
   */
  const loadTargetWeights = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.TARGET_WEIGHTS);
      if (stored) {
        setTargetWeights(JSON.parse(stored));
      }
    } catch (error) {
      console.error('載入目標重量失敗:', error);
    }
  };

  /**
   * 載入最後訓練的動作
   */
  const loadLastExercise = async () => {
    try {
      const lastExercise = await getLastExercise();
      if (lastExercise.muscleGroup && lastExercise.exercise) {
        // 驗證選擇的有效性
        const availableKeys = MUSCLE_GROUP_EXERCISES[lastExercise.muscleGroup] || [];
        if (availableKeys.includes(lastExercise.exercise)) {
          setSelectedMuscleGroup(lastExercise.muscleGroup);
          setSelectedExercise(lastExercise.exercise);
        } else {
          // 如果選擇無效，清除選擇，讓默認選擇邏輯處理
          setSelectedMuscleGroup('');
          setSelectedExercise('');
        }
      }
    } catch (error) {
      console.error('載入最後訓練動作失敗:', error);
    }
  };

  /**
   * 載入自定義訓練動作
   */
  const loadCustomExercises = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_EXERCISES);
      if (stored) {
        setCustomExercises(JSON.parse(stored));
      }
    } catch (error) {
      console.error('載入自定義訓練動作失敗:', error);
    }
  };

  /**
   * 保存特定訓練動作的目標重量
   */
  const saveTargetWeight = async (exercise, weight, type = 'weight') => {
    try {
      const key = type === 'volume' ? `${exercise}_volume` : exercise;
      const newTargetWeights = {
        ...targetWeights,
        [key]: weight
      };
      setTargetWeights(newTargetWeights);
      await AsyncStorage.setItem(STORAGE_KEYS.TARGET_WEIGHTS, JSON.stringify(newTargetWeights));
    } catch (error) {
      console.error('保存目標重量失敗:', error);
    }
  };

  /**
   * 獲取當前訓練動作的目標重量
   */
  const getCurrentTargetWeight = () => {
    if (!selectedExercise) return 0;
    
    // 根據圖表類型獲取對應的目標重量
    const key = chartType === 'volume' ? `${selectedExercise}_volume` : selectedExercise;
    return targetWeights[key] || 0;
  };

  /**
   * 處理肌肉群選擇
   */
  const handleMuscleGroupSelect = (muscleGroup) => {
    setSelectedMuscleGroup(muscleGroup);
    setSelectedExercise(''); // 重置動作選擇
    setShowMuscleGroupModal(false);
  };

  /**
   * 處理動作選擇
   */
  const handleExerciseSelect = (exercise) => {
    // 將顯示名稱轉換為英文鍵值
    const currentLanguage = i18n.language === 'zh' ? 'zh' : 'en';
    let exerciseKey = exercise;
    if (currentLanguage === 'zh') {
      exerciseKey = findExerciseKeyByChineseName(exercise);
    } else {
      exerciseKey = findExerciseKeyByEnglishName(exercise);
    }
    // 如果找不到對應的鍵值，使用原始值
    if (!exerciseKey) {
      exerciseKey = exercise;
    }
    setSelectedExercise(exerciseKey);
    setShowExerciseModal(false);
  };

  /**
   * 獲取可用的動作列表（與紀錄訓練保持一致）
   */
  const getAvailableExercisesForMuscleGroup = () => {
    if (!selectedMuscleGroup) return [];
    const currentLanguage = i18n.language === 'zh' ? 'zh' : 'en';
    const defaultExercises = getExercisesForMuscleGroup(selectedMuscleGroup, currentLanguage);
    const customExercisesForGroup = customExercises[selectedMuscleGroup] || [];
    return [...customExercisesForGroup, ...defaultExercises];
  };

  /**
   * 獲取可用的動作鍵值列表（用於數據匹配）
   */
  const getAvailableExerciseKeysForMuscleGroup = () => {
    if (!selectedMuscleGroup) return [];
    const exerciseKeys = MUSCLE_GROUP_EXERCISES[selectedMuscleGroup] || [];
    const customExercisesForGroup = customExercises[selectedMuscleGroup] || [];
    return [...customExercisesForGroup, ...exerciseKeys];
  };

  /**
   * 處理目標重量保存
   */
  const handleTargetWeightSave = () => {
    if (!selectedExercise) {
      Alert.alert(t('common.error'), t('progress.pleaseSelectExercise'));
      return;
    }
    
    const inputWeight = parseFloat(targetWeightInput);
    if (!isNaN(inputWeight) && inputWeight > 0) {
      // 注意：用戶輸入的數值已經是當前單位的值，直接保存即可
      // 因為目標重量會隨著單位轉換而自動轉換
      saveTargetWeight(selectedExercise, inputWeight, chartType);
      setShowTargetWeightModal(false);
      setTargetWeightInput('');
    } else {
      Alert.alert(t('common.error'), t('progress.pleaseEnterValidValue'));
    }
  };

  /**
   * 獲取篩選後的圖表數據
   */
  const getFilteredData = () => {
    if (!selectedExercise) return [];

    let filteredWorkouts = getWorkoutsByExercise(selectedExercise);
    
    // 根據時間範圍篩選
    filteredWorkouts = filterDataByTimeRange(filteredWorkouts, selectedTimeRange);
    
    // 按日期分組處理同一日同一動作的多個記錄
    const groupedByDate = {};
    
    filteredWorkouts.forEach(workout => {
      const date = workout.date.split('T')[0]; // 只取日期部分，忽略時間
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(workout);
    });
    
    // 處理每個日期的數據
    const processedData = Object.keys(groupedByDate).map(date => {
      const dayWorkouts = groupedByDate[date];
      
      if (dayWorkouts.length === 1) {
        // 只有一個記錄，直接使用
        const workout = dayWorkouts[0];
        const displayWeight = workout.weight;
        const volume = displayWeight * workout.reps * workout.sets;
        
        return {
          date: workout.date,
          weight: displayWeight,
          volume: volume
        };
      } else {
        // 多個記錄，需要合併
        // 重量：取最高重量
        const maxWeight = Math.max(...dayWorkouts.map(w => w.weight));
        
        // 容量：取總和
        const totalVolume = dayWorkouts.reduce((sum, workout) => {
          return sum + (workout.weight * workout.reps * workout.sets);
        }, 0);
        
        return {
          date: dayWorkouts[0].date, // 使用第一個記錄的完整日期時間
          weight: maxWeight,
          volume: totalVolume
        };
      }
    });
    
    // 按日期排序
    return processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  /**
   * 獲取統計數據
   */
  const getStats = () => {
    const data = getFilteredData();
    if (chartType === 'volume') {
      return calculateVolumeStats(data);
    }
    return calculateStats(data);
  };

  /**
   * 獲取所有訓練記錄的統計數據
   */
  const getAllWorkoutsStats = () => {
    // 根據時間範圍篩選所有訓練記錄
    const filteredWorkouts = filterDataByTimeRange(workouts, selectedTimeRange);
    return {
      totalWorkouts: filteredWorkouts.length,
      totalExercises: [...new Set(filteredWorkouts.map(w => w.exercise))].length,
      totalMuscleGroups: [...new Set(filteredWorkouts.map(w => w.muscleGroup))].length
    };
  };

  /**
   * 計算容量統計數據
   */
  const calculateVolumeStats = (data) => {
    if (!data || data.length === 0) {
      return {
        total: 0,
        maxWeight: 0,
        latest: 0,
        improvement: 0
      };
    }
    
    const volumes = data.map(d => d.volume).filter(v => v > 0 && !isNaN(v));
    
    if (volumes.length === 0) {
      return {
        total: 0,
        maxWeight: 0,
        latest: 0,
        improvement: 0
      };
    }
    
    const total = volumes.length;
    const maxWeight = Math.max(...volumes);
    const latest = volumes[volumes.length - 1];
    
    let improvement = 0;
    if (volumes.length > 1) {
      const firstVolume = volumes[0];
      const lastVolume = volumes[volumes.length - 1];
      improvement = ((lastVolume - firstVolume) / firstVolume) * 100;
    }
    
    return {
      total,
      maxWeight,
      latest,
      improvement: Math.round(improvement * 10) / 10
    };
  };

  // 初始化
  useEffect(() => {
    loadTargetWeights();
    loadCustomExercises();
  }, []);

  // 頁面獲得焦點時重新載入數據
  useFocusEffect(
    React.useCallback(() => {
      // 頁面獲得焦點時重新載入訓練記錄和自定義動作
      loadWorkouts();
      loadCustomExercises();
      loadLastExercise();
    }, [loadWorkouts])
  );

  // 自動選擇第一個肌肉群和動作
  useEffect(() => {
    if (workouts.length > 0) {
      const exercises = getAvailableExercises();
      if (exercises.length > 0) {
        // 找到第一個有數據的動作所屬的肌肉群
        const firstExercise = exercises[0]; // 這是英文鍵值，如 'bench_press'
        
        // 檢查當前選擇是否有效
        let currentSelectionValid = false;
        if (selectedMuscleGroup && selectedExercise) {
          // 檢查當前選擇是否在可用選項中
          const availableKeys = MUSCLE_GROUP_EXERCISES[selectedMuscleGroup] || [];
          currentSelectionValid = availableKeys.includes(selectedExercise);
        }
        
        // 如果當前選擇無效，則進行默認選擇
        if (!currentSelectionValid) {
          // 先檢查預設動作映射
          for (const muscleGroup of MUSCLE_GROUPS) {
            // 獲取該肌肉群的所有英文鍵值
            const exerciseKeys = MUSCLE_GROUP_EXERCISES[muscleGroup] || [];
            
            if (exerciseKeys.includes(firstExercise)) {
              setSelectedMuscleGroup(muscleGroup);
              setSelectedExercise(firstExercise);
              return;
            }
          }
          
          // 如果不在預設映射中，檢查自定義動作
          for (const [muscleGroup, customExerciseList] of Object.entries(customExercises)) {
            if (customExerciseList.includes(firstExercise)) {
              setSelectedMuscleGroup(muscleGroup);
              setSelectedExercise(firstExercise);
              return;
            }
          }
        }
      }
    }
  }, [workouts, selectedMuscleGroup, selectedExercise, customExercises]);

  const chartData = getFilteredData();
  const stats = getStats();

  return (
    <View style={styles.container}>
      {/* 標題 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('progress.title')}</Text>
        <Text style={styles.subtitle}>{t('progress.subtitle')}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primaryColor}
            colors={[theme.primaryColor]}
          />
        }
      >
        
        {/* 肌肉群和動作選擇按鈕 */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.selectionButton}
            onPress={() => setShowMuscleGroupModal(true)}
          >
            <Text style={styles.selectionButtonText}>
              {selectedMuscleGroup ? t(`muscleGroups.${selectedMuscleGroup}`) : t('progress.selectExercise')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.selectionButton, !selectedMuscleGroup && styles.disabledButton]}
            onPress={() => selectedMuscleGroup && setShowExerciseModal(true)}
            disabled={!selectedMuscleGroup}
          >
            <Text style={[styles.selectionButtonText, !selectedMuscleGroup && styles.disabledButtonText]}>
              {selectedExercise ? getExerciseName(selectedExercise, i18n.language === 'zh' ? 'zh' : 'en') : t('progress.selectExercise')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 圖表容器 */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>
                {selectedExercise ? getExerciseName(selectedExercise, i18n.language === 'zh' ? 'zh' : 'en') : t('progress.selectAction')}
              </Text>
              {/* 進步重量顯示 */}
              {selectedExercise && chartData.length > 0 && (
                <View style={styles.progressContainer}>
                  {(() => {
                    // 計算實際的重量差異
                    let weightDifference = 0;
                    let percentageDifference = 0;
                    
                    if (chartData.length > 1) {
                      const firstData = chartData[0];
                      const lastData = chartData[chartData.length - 1];
                      
                      if (chartType === 'weight') {
                        // 重量模式：計算重量差異
                        const firstWeight = firstData.weight;
                        const lastWeight = lastData.weight;
                        weightDifference = lastWeight - firstWeight;
                        percentageDifference = ((lastWeight - firstWeight) / firstWeight) * 100;
                      } else {
                        // 容量模式：計算容量差異
                        const firstVolume = firstData.volume;
                        const lastVolume = lastData.volume;
                        weightDifference = lastVolume - firstVolume;
                        percentageDifference = ((lastVolume - firstVolume) / firstVolume) * 100;
                      }
                    }
                    
                    const isPositive = weightDifference > 0;
                    const unit = currentUnit; // 容量和重量都使用相同的單位
                    
                    // 注意：weightDifference 已經是當前單位的值，不需要再次轉換
                    const displayWeightDifference = weightDifference;
                    
                    // 根據單位格式化重量差異
                    const formattedWeightDifference = formatWeight(displayWeightDifference, currentUnit);
                    const formattedPercentage = percentageDifference % 1 === 0 
                      ? percentageDifference.toString() 
                      : percentageDifference.toFixed(1);
                    
                    const unitLabel = unit === 'kg' ? t('units.kg') : t('units.lb');
                    const improvementText = isPositive ? `+${formattedWeightDifference} ${unitLabel}` : `${formattedWeightDifference} ${unitLabel}`;
                    const percentageText = isPositive ? `+${formattedPercentage}%` : `${formattedPercentage}%`;
                    
                    return (
                      <View style={styles.progressTextContainer}>
                        <Text style={[
                          styles.progressWeight,
                          { color: isPositive ? '#28a745' : '#dc3545' }
                        ]}>
                          {improvementText}
                        </Text>
                        <Text style={[
                          styles.progressPercentage,
                          { color: isPositive ? '#28a745' : '#dc3545' }
                        ]}>
                          {percentageText}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              )}
              
              {/* 圖表類型選擇按鍵 */}
              <View style={styles.chartTypeContainer}>
                <TouchableOpacity 
                  style={[styles.chartTypeButton, chartType === 'weight' && styles.chartTypeButtonActive]}
                  onPress={() => setChartType('weight')}
                >
                  <Text style={[styles.chartTypeButtonText, chartType === 'weight' && styles.chartTypeButtonTextActive]}>
                    {t('progress.weight')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.chartTypeButton, chartType === 'volume' && styles.chartTypeButtonActive]}
                  onPress={() => setChartType('volume')}
                >
                  <Text style={[styles.chartTypeButtonText, chartType === 'volume' && styles.chartTypeButtonTextActive]}>
                    {t('progress.volume')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.timeRangeButton}
              onPress={() => setShowTimeRangeModal(true)}
            >
              <Text style={styles.timeRangeButtonText}>
                {t(`timeRange.${selectedTimeRange}`)}
              </Text>
            </TouchableOpacity>
          </View>
          <CustomLineChart 
            data={chartData} 
            width={screenWidth - 70} 
            height={250} 
            theme={theme}
            targetWeight={getCurrentTargetWeight()}
            chartType={chartType}
            currentUnit={currentUnit}
          />
        </View>

        {/* 統計數據 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>{t('progress.totalTraining')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>
                {(() => {
                  const value = stats.maxWeight;
                  const unit = currentUnit; // 容量和重量都使用相同的單位
                  
                  // 注意：stats.maxWeight 已經是當前單位的值，不需要再次轉換
                  
                  // 根據單位格式化數值
                  const formattedValue = formatWeight(value, currentUnit);
                  return formattedValue;
                })()}
              </Text>
              <Text style={styles.statUnit}>
                {currentUnit === 'kg' ? t('units.kg') : t('units.lb')}
              </Text>
            </View>
            <Text style={styles.statLabel}>{t('progress.highestRecord')}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statValueContainer}>
              <Text style={[styles.statValue, { color: stats.improvement >= 0 ? theme.successColor : theme.errorColor }]}>
                {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
              </Text>
              <Text style={[styles.statUnit, { color: stats.improvement >= 0 ? theme.successColor : theme.errorColor }]}>
                %
              </Text>
            </View>
            <Text style={styles.statLabel}>{t('progress.improvementRate')}</Text>
          </View>
        </View>

        {/* 目標重量設定 */}
        <View style={styles.targetWeightContainer}>
          <Text style={styles.targetWeightTitle}>
            {chartType === 'volume' ? t('progress.targetVolume') : t('progress.targetWeight')}: {selectedExercise ? (() => {
              const value = getCurrentTargetWeight();
              const unit = currentUnit; // 容量和重量都使用相同的單位
              
              // 注意：目標重量已經是當前單位的值，不需要再次轉換
              
              // 根據單位格式化數值
              const formattedValue = formatWeight(value, currentUnit);
              const unitLabel = unit === 'kg' ? t('units.kg') : t('units.lb');
              return `${formattedValue} ${unitLabel}`;
            })() : t('progress.pleaseSelectExercise')}
          </Text>
          <TouchableOpacity 
            style={[styles.targetWeightButton, !selectedExercise && { opacity: 0.5 }]}
            onPress={() => {
              if (selectedExercise) {
                // 顯示當前目標重量（已經是當前單位的值）
                const currentValue = getCurrentTargetWeight();
                setTargetWeightInput(currentValue.toString());
                setShowTargetWeightModal(true);
              } else {
                Alert.alert(t('common.info'), t('progress.pleaseSelectExercise'));
              }
            }}
            disabled={!selectedExercise}
          >
            <Text style={styles.targetWeightButtonText}>
              {selectedExercise ? t('progress.setTarget') + (chartType === 'volume' ? t('progress.volume') : t('progress.weight')) : t('progress.pleaseSelectExercise')}
            </Text>
          </TouchableOpacity>
        </View>

      {/* 肌肉群選擇模態框 */}
      <Modal
        visible={showMuscleGroupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMuscleGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('workout.selectMuscleGroup')}</Text>
            {MUSCLE_GROUPS.map((muscleGroup) => (
              <TouchableOpacity
                key={muscleGroup}
                style={styles.modalOption}
                onPress={() => handleMuscleGroupSelect(muscleGroup)}
              >
                <Text style={styles.modalOptionText}>{t(`muscleGroups.${muscleGroup}`)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowMuscleGroupModal(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 動作選擇模態框 */}
      <Modal
        visible={showExerciseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('workout.selectExercise')}</Text>
            {getAvailableExercisesForMuscleGroup().map((exercise) => (
              <TouchableOpacity
                key={exercise}
                style={styles.modalOption}
                onPress={() => handleExerciseSelect(exercise)}
              >
                <Text style={styles.modalOptionText}>{exercise}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowExerciseModal(false)}
            >
              <Text style={styles.closeButtonText}>關閉</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 時間範圍選擇模態框 */}
      <Modal
        visible={showTimeRangeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeRangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('progress.selectTimeRange')}</Text>
            {TIME_RANGE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedTimeRange(option.value);
                  setShowTimeRangeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{t(`timeRange.${option.value}`)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTimeRangeModal(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 目標重量輸入模態框 */}
      <Modal
        visible={showTargetWeightModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTargetWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('progress.setTarget')} {getExerciseName(selectedExercise, i18n.language === 'zh' ? 'zh' : 'en')} {chartType === 'volume' ? t('progress.targetVolume') : t('progress.targetWeight')}</Text>
            <TextInput
              style={styles.targetWeightInput}
              value={targetWeightInput}
              onChangeText={setTargetWeightInput}
              placeholder={`${t('progress.setTarget')} ${chartType === 'volume' ? t('progress.targetVolume') : t('progress.targetWeight')} (${currentUnit === 'kg' ? t('units.kg') : t('units.lb')})`}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.targetWeightButton}
              onPress={handleTargetWeightSave}
            >
              <Text style={styles.targetWeightButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTargetWeightModal(false)}
            >
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </View>
  );
};

// 樣式定義
const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    backgroundColor: theme.cardBackground,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  selectionButton: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  selectionButtonText: {
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: theme.backgroundColor,
  },
  disabledButtonText: {
    color: theme.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  statCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    minHeight: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 0.5,
    borderColor: theme.borderColor,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.primaryColor,
    textAlign: 'center',
    lineHeight: 24,
  },
  statUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primaryColor,
    marginLeft: 2,
    lineHeight: 20,
  },
  statLabel: {
    fontSize: 13,
    color: theme.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  chartContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitleContainer: {
    flex: 1,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  progressContainer: {
    marginTop: 2,
  },
  progressTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 8,
  },
  chartTypeButton: {
    backgroundColor: theme.backgroundColor,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chartTypeButtonActive: {
    backgroundColor: theme.primaryColor,
    borderColor: theme.primaryColor,
  },
  chartTypeButtonText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  chartTypeButtonTextActive: {
    color: '#ffffff',
  },
  timeRangeButton: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  timeRangeButtonText: {
    fontSize: 12,
    color: theme.textPrimary,
    textAlign: 'center',
  },
  targetWeightContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  targetWeightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 10,
  },
  targetWeightButton: {
    backgroundColor: theme.primaryColor,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  targetWeightButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  targetWeightInput: {
    backgroundColor: theme.cardBackground,
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.textPrimary,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.cardBackground,
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  modalOptionText: {
    fontSize: 16,
    color: theme.textPrimary,
  },
  closeButton: {
    backgroundColor: theme.primaryColor,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// 組件屬性驗證
ProgressChartScreen.propTypes = {
  theme: PropTypes.shape({
    backgroundColor: PropTypes.string.isRequired,
    cardBackground: PropTypes.string.isRequired,
    textPrimary: PropTypes.string.isRequired,
    textSecondary: PropTypes.string.isRequired,
    primaryColor: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
    successColor: PropTypes.string.isRequired,
    errorColor: PropTypes.string.isRequired
  }).isRequired
};

export default ProgressChartScreen;
