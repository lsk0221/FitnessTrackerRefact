/**
 * Workout Progress Component
 * 訓練進度組件
 * 
 * Displays overall workout progress
 * 顯示整體訓練進度
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../shared/contexts/ThemeContext';

interface WorkoutProgressProps {
  currentExerciseIndex: number;
  totalExercises: number;
  completedExercises: number;
}

/**
 * Workout Progress Component
 * 訓練進度組件
 */
const WorkoutProgress: React.FC<WorkoutProgressProps> = ({
  currentExerciseIndex,
  totalExercises,
  completedExercises,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const progress = totalExercises > 0 
    ? ((currentExerciseIndex + 1) / totalExercises) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      {completedExercises > 0 && (
        <Text style={styles.completedText}>
          {completedExercises} {completedExercises === 1 ? 'completed' : 'completed'}
        </Text>
      )}
    </View>
  );
};

/**
 * Create styles
 * 創建樣式
 */
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: theme.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: theme.borderColor,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.primaryColor,
    borderRadius: 2,
  },
  completedText: {
    fontSize: 11,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default WorkoutProgress;


