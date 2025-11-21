/**
 * WorkoutDetailModal Component
 * 訓練詳情模態框組件 - 顯示和編輯訓練記錄
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../../shared/i18n';
import { formatDate } from '../../../shared/utils/helpers';
import { getAllExercises } from '../../../shared/services/data/exerciseLibraryService';
import { PlusIcon } from '../../../shared/components/navigation/TabIcons';
import WorkoutList from './WorkoutList';
import type { Workout } from '../types/workout.types';
import type { EditFormState } from '../hooks/useWorkoutHistory';
import type { Exercise } from '../../../shared/services/data/exerciseLibraryService';

interface WorkoutDetailModalProps {
  theme: any;
  currentUnit: string;
  
  // Detail modal props
  showDetailModal: boolean;
  selectedDate: Date | null;
  selectedWorkouts: Workout[];
  onCloseDetailModal: () => void;
  onAddWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onDeleteWorkout: (workout: Workout) => void;
  
  // Edit modal props
  showEditModal: boolean;
  editingWorkout: Workout | null;
  editForm: EditFormState;
  onUpdateEditForm: (updates: Partial<EditFormState>) => void;
  onCloseEditModal: () => void;
  onSaveEdit: () => void;
  muscleGroupsList?: string[]; // Dynamic muscle groups list
}

/**
 * WorkoutDetailModal Component
 * Displays workout details and edit functionality
 */
const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({
  theme,
  currentUnit,
  showDetailModal,
  selectedDate,
  selectedWorkouts,
  onCloseDetailModal,
  onAddWorkout,
  onEditWorkout,
  onDeleteWorkout,
  showEditModal,
  editingWorkout,
  editForm,
  onUpdateEditForm,
  onCloseEditModal,
  onSaveEdit,
  muscleGroupsList = [], // Default to empty array if not provided
}) => {
  const { t } = useTranslation();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);

  // Load all exercises on mount
  useEffect(() => {
    const loadExercises = async () => {
      const result = await getAllExercises();
      if (result.success && result.data) {
        setAllExercises(result.data);
      }
    };
    loadExercises();
  }, []);

  // Helper function to get exercises for a muscle group
  const getExercisesForMuscleGroup = (muscleGroup: string): string[] => {
    const muscleGroupKey = `muscleGroups.${muscleGroup}`;
    const filtered = allExercises.filter(ex => {
      const exMuscleGroup = ex.muscleGroupKey || ex.muscle_group || '';
      return exMuscleGroup === muscleGroupKey || exMuscleGroup === muscleGroup;
    });
    return filtered.map(ex => {
      const nameKey = ex.nameKey || ex.name || '';
      return nameKey.startsWith('exercises.') ? nameKey : `exercises.${nameKey}`;
    });
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxHeight: '80%',
      zIndex: 1001,
      justifyContent: 'space-between',
    },
    modalTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      position: 'relative',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
      flex: 1,
      textAlign: 'center',
    },
    addButton: {
      position: 'absolute',
      right: 0,
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.backgroundColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    closeButton: {
      backgroundColor: theme.primaryColor,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    closeButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    // Edit modal styles
    editModalScrollView: {
      maxHeight: 400,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      backgroundColor: theme.cardBackground,
      borderColor: theme.borderColor,
      color: theme.textPrimary,
    },
    muscleGroupContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    muscleGroupOption: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      marginRight: 8,
      marginBottom: 8,
      borderColor: theme.borderColor,
    },
    selectedMuscleGroup: {
      backgroundColor: theme.primaryColor,
    },
    muscleGroupOptionText: {
      fontSize: 14,
      fontWeight: '500',
    },
    exerciseContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    exerciseOption: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      marginBottom: 8,
      width: '48%',
      alignItems: 'center',
      borderColor: theme.borderColor,
    },
    selectedExercise: {
      backgroundColor: theme.primaryColor,
    },
    exerciseOptionText: {
      fontSize: 14,
      textAlign: 'center',
    },
    editModalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    editButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 8,
    },
    cancelButton: {
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    saveButton: {
      backgroundColor: theme.primaryColor,
    },
    editButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <>
      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="fade"
        onRequestClose={onCloseDetailModal}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>
                {selectedDate ? formatDate(selectedDate.toISOString()) : ''}
              </Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={onAddWorkout}
              >
                <PlusIcon color={theme.primaryColor} size={24} />
              </TouchableOpacity>
            </View>
            
            <WorkoutList
              theme={theme}
              workouts={selectedWorkouts}
              currentUnit={currentUnit}
              onEdit={onEditWorkout}
              onDelete={onDeleteWorkout}
            />
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onCloseDetailModal}
            >
              <Text style={styles.closeButtonText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={onCloseEditModal}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('calendar.editWorkout')}</Text>
            
            <ScrollView 
              style={styles.editModalScrollView} 
              showsVerticalScrollIndicator={false}
            >
              {/* Muscle Group Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('workout.muscleGroup')}</Text>
                <View style={styles.muscleGroupContainer}>
                  {muscleGroupsList.length > 0 ? muscleGroupsList.map((group) => {
                    // Translate muscle group name using translation key
                    // 使用翻譯鍵翻譯肌肉群名稱
                    const translationKey = `muscleGroups.${group}`;
                    const translatedName = t(translationKey);
                    // If translation returns the key itself (no translation found), use the original name
                    // 如果翻譯返回鍵本身（找不到翻譯），則使用原始名稱
                    const displayName = translatedName === translationKey ? group : translatedName;
                    
                    return (
                      <TouchableOpacity
                        key={group}
                        style={[
                          styles.muscleGroupOption,
                          editForm.muscleGroup === group && styles.selectedMuscleGroup,
                        ]}
                        onPress={() => onUpdateEditForm({ muscleGroup: group })}
                      >
                        <Text
                          style={[
                            styles.muscleGroupOptionText,
                            {
                              color: editForm.muscleGroup === group
                                ? '#ffffff'
                                : theme.textPrimary,
                            },
                          ]}
                        >
                          {displayName}
                        </Text>
                      </TouchableOpacity>
                    );
                  }) : (
                    <Text style={styles.muscleGroupOptionText}>
                      {t('common.loading')}...
                    </Text>
                  )}
                </View>
              </View>

              {/* Exercise Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('workout.exercise')}</Text>
                <View style={styles.exerciseContainer}>
                  {(() => {
                    const currentLanguage = i18n.language === 'zh' ? 'zh' : 'en';
                    let exercisesToShow: string[] = [];
                    
                    if (editForm.muscleGroup) {
                      exercisesToShow = getExercisesForMuscleGroup(
                        editForm.muscleGroup
                      );
                    } else {
                      // Show all exercises if no muscle group selected
                      exercisesToShow = muscleGroupsList.flatMap(group =>
                        getExercisesForMuscleGroup(group)
                      );
                      // Deduplicate
                      exercisesToShow = [...new Set(exercisesToShow)];
                    }
                    
                    return exercisesToShow.map((exercise) => (
                      <TouchableOpacity
                        key={exercise}
                        style={[
                          styles.exerciseOption,
                          editForm.exercise === exercise && styles.selectedExercise,
                          {
                            backgroundColor:
                              editForm.exercise === exercise
                                ? theme.primaryColor
                                : theme.cardBackground,
                          },
                        ]}
                        onPress={() => onUpdateEditForm({ exercise })}
                      >
                        <Text
                          style={[
                            styles.exerciseOptionText,
                            {
                              color:
                                editForm.exercise === exercise
                                  ? '#ffffff'
                                  : theme.textPrimary,
                            },
                          ]}
                        >
                          {exercise}
                        </Text>
                      </TouchableOpacity>
                    ));
                  })()}
                </View>
              </View>

              {/* Sets Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('workout.sets')}</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.sets}
                  onChangeText={(text) => onUpdateEditForm({ sets: text })}
                  placeholder={`${t('workout.enter')} ${t('workout.sets')}`}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              {/* Reps Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>{t('workout.reps')}</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.reps}
                  onChangeText={(text) => onUpdateEditForm({ reps: text })}
                  placeholder={`${t('workout.enter')} ${t('workout.reps')}`}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              {/* Weight Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {t('workout.weight')} ({currentUnit === 'kg' ? t('units.kg') : t('units.lb')})
                </Text>
                <TextInput
                  style={styles.input}
                  value={editForm.weight}
                  onChangeText={(text) => onUpdateEditForm({ weight: text })}
                  placeholder={`${t('workout.weight')} (${currentUnit === 'kg' ? t('units.kg') : t('units.lb')})`}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.editModalButtons}>
              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={onCloseEditModal}
              >
                <Text style={styles.editButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.editButton, styles.saveButton]}
                onPress={onSaveEdit}
              >
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default WorkoutDetailModal;


