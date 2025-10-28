/**
 * WorkoutCalendar Component
 * 訓練日曆組件 - 顯示訓練記錄的月曆視圖
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Calendar from '../../../shared/components/ui/Calendar';
import type { WorkoutDataByDate } from '../types/workout.types';

interface WorkoutCalendarProps {
  theme: any;
  workoutData: WorkoutDataByDate;
  onDatePress: (date: Date, workout: { workouts: any[] }) => void;
  selectedDate: Date | null;
  onSelectedDateChange: (date: Date) => void;
}

/**
 * WorkoutCalendar Component
 * Wraps the shared Calendar component with workout-specific logic
 */
const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({
  theme,
  workoutData,
  onDatePress,
  selectedDate,
  onSelectedDateChange,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Calendar */}
      <Calendar
        theme={theme}
        workoutData={workoutData}
        onDatePress={onDatePress}
        selectedDate={selectedDate}
        onSelectedDateChange={onSelectedDateChange}
      />

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.legendTitle, { color: theme.textPrimary }]}>
          {t('calendar.muscleGroupLegend')}
        </Text>
        
        {Object.entries({
          'chest': t('muscleGroups.chest'),
          'shoulders': t('muscleGroups.shoulders'),
          'back': t('muscleGroups.back'),
          'legs': t('muscleGroups.legs'),
          'arms': t('muscleGroups.arms'),
          'core': t('muscleGroups.core'),
          'cardio': t('muscleGroups.cardio'),
        }).map(([key, label]) => (
          <View key={key} style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: getMuscleGroupColor(key, theme) }
              ]}
            />
            <Text style={[styles.legendText, { color: theme.textPrimary }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

/**
 * 獲取肌肉群顏色
 * Get muscle group color
 */
const getMuscleGroupColor = (muscleGroup: string, theme: any): string => {
  // Core uses theme-adapted color
  if (muscleGroup.toLowerCase() === 'core') {
    return theme.textPrimary;
  }
  
  const colors: Record<string, string> = {
    'chest': '#00BCD4',      // Cyan
    'shoulders': '#2196F3',  // Blue
    'back': '#FF9800',       // Orange
    'legs': '#9C27B0',       // Purple
    'arms': '#F44336',       // Red
    'cardio': '#795548',     // Brown
  };
  
  return colors[muscleGroup.toLowerCase()] || '#00BCD4';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  legend: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
  },
});

export default WorkoutCalendar;


