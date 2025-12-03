/**
 * Exercise Selector Component
 * 訓練動作選擇組件 - 包含肌肉群和動作選擇
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { TIME_RANGE_OPTIONS } from '../../../shared/constants';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
// Removed getExerciseName import - using t() function instead
import type { TimeRange, ChartType } from '../types/progress.types';

interface ExerciseSelectorProps {
  selectedMuscleGroup: string;
  selectedExercise: string;
  selectedTimeRange: TimeRange;
  chartType: ChartType;
  availableExercises: string[];
  muscleGroupsList: string[]; // Dynamic muscle groups list
  isWeightlessExercise?: boolean; // Whether selected exercise is weightless (Cardio)
  onMuscleGroupSelect: (muscleGroup: string) => void;
  onExerciseSelect: (exercise: string) => void;
  onTimeRangeSelect: (timeRange: TimeRange) => void;
  onChartTypeSelect: (chartType: ChartType) => void;
  theme: any;
  t: (key: string) => string;
  language: string;
}

/**
 * Exercise Selector Component
 * 訓練動作選擇組件（包含肌肉群、動作、時間範圍、圖表類型）
 */
export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  selectedMuscleGroup,
  selectedExercise,
  selectedTimeRange,
  chartType,
  availableExercises,
  muscleGroupsList,
  isWeightlessExercise = false,
  onMuscleGroupSelect,
  onExerciseSelect,
  onTimeRangeSelect,
  onChartTypeSelect,
  theme,
  t,
  language,
}) => {
  const [showMuscleGroupModal, setShowMuscleGroupModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const { showPopover, renderAlert } = useAppAlert();
  
  // Ref for time range button
  const timeRangeButtonRef = useRef<TouchableOpacity>(null);

  const styles = createStyles(theme);
  
  /**
   * Handle time range selection using Popover
   * 使用 Popover 處理時間範圍選擇
   */
  const handleTimeRangePress = useCallback(() => {
    if (timeRangeButtonRef.current) {
      timeRangeButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        showPopover({
          anchorRect: {
            x: pageX,
            y: pageY,
            width: width || 100,
            height: height || 40,
          },
          options: TIME_RANGE_OPTIONS.map((option) => ({
            text: t(`timeRange.${option.value}`),
            onPress: () => onTimeRangeSelect(option.value as TimeRange),
          })),
        });
      });
    }
  }, [showPopover, t, onTimeRangeSelect]);

  return (
    <>
      {/* Muscle Group and Exercise Selection Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.selectionButton} onPress={() => setShowMuscleGroupModal(true)}>
          <Text style={styles.selectionButtonText}>
            {selectedMuscleGroup ? t(`muscleGroups.${selectedMuscleGroup}`) : t('progress.selectMuscleGroup')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.selectionButton, !selectedMuscleGroup && styles.disabledButton]}
          onPress={() => selectedMuscleGroup && setShowExerciseModal(true)}
          disabled={!selectedMuscleGroup}
        >
          <Text style={[styles.selectionButtonText, !selectedMuscleGroup && styles.disabledButtonText]}>
            {selectedExercise ? (() => {
              // selectedExercise might be translation key, translated name, or raw English string
              // selectedExercise 可能是翻譯鍵、翻譯後的名稱或原始英文字符串
              if (!selectedExercise) return t('progress.selectExercise');
              
              // Check if already a translation key (e.g., "exercises.overhead_tricep_extension")
              // 檢查是否已經是翻譯鍵（例如 "exercises.overhead_tricep_extension"）
              if (selectedExercise.startsWith('exercises.')) {
                const translated = t(selectedExercise);
                return translated === selectedExercise ? selectedExercise.replace('exercises.', '') : translated;
              }
              
              // Check if already in Chinese
              // 檢查是否已經是中文
              const hasChineseChars = /[\u4e00-\u9fa5]/.test(selectedExercise);
              if (hasChineseChars) return selectedExercise;
              
              // Convert to snake_case for translation key
              // 轉換為 snake_case 以生成翻譯鍵
              const snakeCase = selectedExercise
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
              
              if (!snakeCase) return selectedExercise;
              
              const translationKey = `exercises.${snakeCase}`;
              const translated = t(translationKey);
              return translated === translationKey ? selectedExercise : translated;
            })() : t('progress.selectExercise')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Type Selection */}
      <View style={styles.chartTypeContainer}>
        <TouchableOpacity
          style={[
            styles.chartTypeButton, 
            chartType === 'weight' && styles.chartTypeButtonActive,
            isWeightlessExercise && styles.chartTypeButtonDisabled
          ]}
          onPress={() => !isWeightlessExercise && onChartTypeSelect('weight')}
          disabled={isWeightlessExercise}
        >
          <Text style={[
            styles.chartTypeButtonText, 
            chartType === 'weight' && styles.chartTypeButtonTextActive,
            isWeightlessExercise && styles.chartTypeButtonTextDisabled
          ]}>
            {t('progress.weight')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chartTypeButton, chartType === 'volume' && styles.chartTypeButtonActive]}
          onPress={() => onChartTypeSelect('volume')}
        >
          <Text style={[styles.chartTypeButtonText, chartType === 'volume' && styles.chartTypeButtonTextActive]}>
            {t('progress.volume')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          ref={timeRangeButtonRef}
          style={styles.timeRangeButton}
          onPress={handleTimeRangePress}
        >
          <Text style={styles.timeRangeButtonText}>{t(`timeRange.${selectedTimeRange}`)}</Text>
        </TouchableOpacity>
      </View>

      {/* Muscle Group Modal */}
      <Modal
        visible={showMuscleGroupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMuscleGroupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('workout.selectMuscleGroup')}</Text>
            <ScrollView style={styles.modalScrollView}>
              {muscleGroupsList.map(muscleGroup => {
                // Translate muscle group name using translation key
                // 使用翻譯鍵翻譯肌肉群名稱
                const translationKey = `muscleGroups.${muscleGroup}`;
                const translatedName = t(translationKey);
                // If translation returns the key itself (no translation found), use the original name
                // 如果翻譯返回鍵本身（找不到翻譯），則使用原始名稱
                const displayName = translatedName === translationKey ? muscleGroup : translatedName;
                
                return (
                  <TouchableOpacity
                    key={muscleGroup}
                    style={styles.modalOption}
                    onPress={() => {
                      onMuscleGroupSelect(muscleGroup);
                      setShowMuscleGroupModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{displayName}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowMuscleGroupModal(false)}>
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Exercise Modal */}
      <Modal
        visible={showExerciseModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('workout.selectExercise')}</Text>
            <ScrollView style={styles.modalScrollView}>
              {availableExercises.map(exercise => {
                // Get display name - exercise might be translated name, original name, or translation key
                // 獲取顯示名稱 - exercise 可能是翻譯後的名稱、原始名稱或翻譯鍵
                let displayName: string;
                
                if (!exercise) {
                  displayName = '';
                } else if (exercise.startsWith('exercises.')) {
                  // Already a translation key
                  // 已經是翻譯鍵
                  const translated = t(exercise);
                  displayName = translated === exercise ? exercise.replace('exercises.', '') : translated;
                } else {
                  // Check if already in Chinese
                  // 檢查是否已經是中文
                  const hasChineseChars = /[\u4e00-\u9fa5]/.test(exercise);
                  if (hasChineseChars) {
                    displayName = exercise;
                  } else {
                    // Try to translate from English name
                    // 嘗試從英文名稱翻譯
                    const snakeCase = exercise
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '_')
                      .replace(/^_+|_+$/g, '');
                    
                    if (snakeCase) {
                      const translationKey = `exercises.${snakeCase}`;
                      const translated = t(translationKey);
                      displayName = translated === translationKey ? exercise : translated;
                    } else {
                      displayName = exercise;
                    }
                  }
                }
                
                return (
                  <TouchableOpacity
                    key={exercise}
                    style={styles.modalOption}
                    onPress={() => {
                      onExerciseSelect(exercise);
                      setShowExerciseModal(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{displayName}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowExerciseModal(false)}>
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {renderAlert()}
    </>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
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
    chartTypeContainer: {
      flexDirection: 'row',
      marginBottom: 15,
      gap: 8,
      alignItems: 'center',
    },
    chartTypeButton: {
      backgroundColor: theme.backgroundColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    chartTypeButtonActive: {
      backgroundColor: theme.primaryColor,
      borderColor: theme.primaryColor,
    },
    chartTypeButtonText: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    chartTypeButtonTextActive: {
      color: '#ffffff',
    },
    chartTypeButtonDisabled: {
      opacity: 0.5,
      backgroundColor: theme.cardBackground,
    },
    chartTypeButtonTextDisabled: {
      color: theme.textSecondary,
      opacity: 0.5,
    },
    timeRangeButton: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginLeft: 'auto',
      minWidth: 100, // Fixed minimum width to prevent text length from affecting button size
      width: 100, // Fixed width to ensure consistent button size
    },
    timeRangeButtonText: {
      fontSize: 14,
      color: theme.textPrimary,
      textAlign: 'center',
      fontWeight: '500',
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
      maxHeight: '70%',
    },
    modalScrollView: {
      maxHeight: 400,
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



