/**
 * WorkoutList Component
 * 訓練列表組件 - 顯示特定日期的訓練記錄列表
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../../shared/i18n';
import { getExerciseName } from '../../../shared/data/exerciseMapping';
import { EditIcon, DeleteIcon } from '../../../shared/components/navigation/TabIcons';
import { formatWeightWithUnit } from '../../../shared/services/utils/weightFormatter';
import type { Workout } from '../types/workout.types';

interface WorkoutListProps {
  theme: any;
  workouts: Workout[];
  currentUnit: string;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  maxHeight?: number;
}

/**
 * WorkoutList Component
 * Displays a list of workouts for a selected date
 */
const WorkoutList: React.FC<WorkoutListProps> = ({
  theme,
  workouts,
  currentUnit,
  onEdit,
  onDelete,
  maxHeight = 400,
}) => {
  const { t } = useTranslation();

  /**
   * 獲取肌肉群顏色
   * Get muscle group color
   */
  const getMuscleGroupColor = (muscleGroup: string): string => {
    if (muscleGroup.toLowerCase() === 'core') {
      return theme.textPrimary;
    }
    
    const colors: Record<string, string> = {
      'chest': '#00BCD4',
      'shoulders': '#2196F3',
      'back': '#FF9800',
      'legs': '#9C27B0',
      'arms': '#F44336',
      'cardio': '#795548',
    };
    
    return colors[muscleGroup.toLowerCase()] || '#00BCD4';
  };

  const styles = StyleSheet.create({
    scrollView: {
      maxHeight,
    },
    scrollContent: {
      paddingBottom: 16,
    },
    workoutItem: {
      backgroundColor: theme.backgroundColor,
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    workoutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    muscleGroupTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 8,
    },
    muscleGroupText: {
      color: '#ffffff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    exerciseName: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginHorizontal: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 8,
      marginLeft: 4,
    },
    workoutDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    workoutDetail: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  if (workouts.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>
          {t('calendar.noWorkoutsToday')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {workouts.map((workout, index) => (
        <View key={index} style={styles.workoutItem}>
          <View style={styles.workoutHeader}>
            <View
              style={[
                styles.muscleGroupTag,
                { backgroundColor: getMuscleGroupColor(workout.muscleGroup) }
              ]}
            >
              <Text style={styles.muscleGroupText}>
                {(() => {
                  const muscleGroupKey = workout.muscleGroup?.toLowerCase();
                  const translation = t(`muscleGroups.${muscleGroupKey}`);
                  // If translation fails (returns the key itself), use fallback
                  if (translation === `muscleGroups.${muscleGroupKey}`) {
                    return muscleGroupKey || workout.muscleGroup;
                  }
                  return translation;
                })()}
              </Text>
            </View>
            
            <Text 
              style={styles.exerciseName} 
              numberOfLines={1} 
              adjustsFontSizeToFit={true}
            >
              {getExerciseName(workout.exercise, i18n.language === 'zh' ? 'zh' : 'en')}
            </Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(workout)}
              >
                <EditIcon color={theme.textSecondary} size={18} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(workout)}
              >
                <DeleteIcon color={theme.errorColor} size={18} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.workoutDetails}>
            <Text style={styles.workoutDetail}>
              {workout.sets} {t('workout.sets')} × {workout.reps} {t('workout.reps')}
            </Text>
            <Text style={styles.workoutDetail}>
              {formatWeightWithUnit(workout.weight, currentUnit)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default WorkoutList;

