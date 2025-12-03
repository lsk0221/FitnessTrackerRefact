/**
 * WorkoutList Component
 * 訓練列表組件 - 顯示特定日期的訓練記錄列表
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../../shared/i18n';
// Removed exerciseMapping import - using t() function instead
import { EditIcon, DeleteIcon } from '../../../shared/components/navigation/TabIcons';
import { formatWeightWithUnit } from '../../../shared/services/utils/weightFormatter';
import { getMuscleGroupColor } from '../../../shared/utils/helpers';
import { getMainMuscleGroup } from '../../../shared/services/data/exerciseLibraryService';
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
                { backgroundColor: (() => {
                  // Get main muscle group for correct color mapping
                  // 獲取主肌肉群以正確映射顏色
                  const mainGroup = getMainMuscleGroup(workout.muscleGroup || '');
                  return getMuscleGroupColor(mainGroup, theme);
                })() }
              ]}
            >
              <Text style={styles.muscleGroupText}>
                {(() => {
                  // Get main muscle group and translate it
                  // 獲取主肌肉群並翻譯
                  const mainGroup = getMainMuscleGroup(workout.muscleGroup || '');
                  const translationKey = `muscleGroups.${mainGroup}`;
                  const translated = t(translationKey);
                  // If translation fails (returns the key itself), use original name
                  return translated === translationKey ? mainGroup : translated;
                })()}
              </Text>
            </View>
            
            <Text 
              style={styles.exerciseName} 
              numberOfLines={1} 
              adjustsFontSizeToFit={true}
            >
              {(() => {
                // Translate raw English exercise name
                // 翻譯原始英文動作名稱
                const exerciseName = workout.exercise || '';
                if (!exerciseName) return '';
                
                // Check if the name is already in Chinese (contains Chinese characters)
                // 檢查名稱是否已經是中文（包含中文字符）
                const hasChineseChars = /[\u4e00-\u9fa5]/.test(exerciseName);
                if (hasChineseChars) {
                  // Already in Chinese, return as is
                  // 已經是中文，直接返回
                  return exerciseName;
                }
                
                // Convert to snake_case for translation key
                // 轉換為 snake_case 以生成翻譯鍵
                const snakeCase = exerciseName
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '_')
                  .replace(/^_+|_+$/g, '');
                
                // If snakeCase is empty after conversion, return original name
                // 如果轉換後 snakeCase 為空，返回原始名稱
                if (!snakeCase) return exerciseName;
                
                const translationKey = `exercises.${snakeCase}`;
                const translated = t(translationKey);
                // If translation fails (returns the key itself), use original name
                // 如果翻譯失敗（返回鍵本身），使用原始名稱
                return translated === translationKey ? exerciseName : translated;
              })()}
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


