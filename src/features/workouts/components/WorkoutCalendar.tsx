/**
 * WorkoutCalendar Component
 * 訓練日曆組件 - 顯示訓練記錄的月曆視圖
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Calendar from '../../../shared/components/ui/Calendar';
import { getMuscleGroupColor } from '../../../shared/utils/helpers';
import type { WorkoutDataByDate } from '../types/workout.types';

interface WorkoutCalendarProps {
  theme: any;
  workoutData: WorkoutDataByDate;
  onDatePress: (date: Date, workout: { workouts: any[] }) => void;
  selectedDate: Date | null;
  onSelectedDateChange: (date: Date) => void;
  muscleGroupsList?: string[]; // Dynamic muscle groups list for legend
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
  muscleGroupsList = [], // Default to empty array if not provided
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
        
        {/* Use dynamic muscle groups list if available, otherwise fallback to hardcoded list */}
        {(muscleGroupsList.length > 0 ? muscleGroupsList : [
          'Chest', 'Shoulders', 'Back', 'Legs', 'Arms', 'Core', 'Cardio', 'Full Body'
        ]).map((muscleGroup) => {
          const mainGroup = muscleGroup; // Already main groups from useWorkoutHistory
          const translationKey = `muscleGroups.${mainGroup}`;
          const translatedLabel = t(translationKey);
          const displayLabel = translatedLabel === translationKey ? mainGroup : translatedLabel;
          
          return (
            <View key={mainGroup} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: getMuscleGroupColor(mainGroup, theme) }
                ]}
              />
              <Text style={[styles.legendText, { color: theme.textPrimary }]}>
                {displayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
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


