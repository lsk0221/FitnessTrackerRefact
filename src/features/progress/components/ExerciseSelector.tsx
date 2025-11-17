/**
 * Exercise Selector Component
 * 訓練動作選擇組件 - 包含肌肉群和動作選擇
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { TIME_RANGE_OPTIONS } from '../../../shared/constants';
// Removed getExerciseName import - using t() function instead
import type { TimeRange, ChartType } from '../types/progress.types';

interface ExerciseSelectorProps {
  selectedMuscleGroup: string;
  selectedExercise: string;
  selectedTimeRange: TimeRange;
  chartType: ChartType;
  availableExercises: string[];
  muscleGroupsList: string[]; // Dynamic muscle groups list
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
  const [showTimeRangeModal, setShowTimeRangeModal] = useState(false);

  const styles = createStyles(theme);

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
              // selectedExercise is raw English string, convert to translation key
              // selectedExercise 是原始英文字符串，轉換為翻譯鍵
              const snakeCase = selectedExercise
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_')
                .replace(/^_+|_+$/g, '');
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
          style={[styles.chartTypeButton, chartType === 'weight' && styles.chartTypeButtonActive]}
          onPress={() => onChartTypeSelect('weight')}
        >
          <Text style={[styles.chartTypeButtonText, chartType === 'weight' && styles.chartTypeButtonTextActive]}>
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

        <TouchableOpacity style={styles.timeRangeButton} onPress={() => setShowTimeRangeModal(true)}>
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
              {availableExercises.map(exercise => (
                <TouchableOpacity
                  key={exercise}
                  style={styles.modalOption}
                  onPress={() => {
                    onExerciseSelect(exercise);
                    setShowExerciseModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{exercise}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowExerciseModal(false)}>
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Range Modal */}
      <Modal
        visible={showTimeRangeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeRangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('progress.selectTimeRange')}</Text>
            <ScrollView style={styles.modalScrollView}>
              {TIME_RANGE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={styles.modalOption}
                  onPress={() => {
                    onTimeRangeSelect(option.value as TimeRange);
                    setShowTimeRangeModal(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{t(`timeRange.${option.value}`)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTimeRangeModal(false)}>
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    timeRangeButton: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginLeft: 'auto',
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



