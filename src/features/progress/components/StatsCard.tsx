/**
 * Stats Card Component
 * 統計卡片組件 - 顯示進度統計數據
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatWeight } from '../../../shared/services/utils/weightFormatter';
import type { ProgressStats, ChartType } from '../types/progress.types';

interface StatsCardProps {
  stats: ProgressStats;
  theme: any;
  currentUnit: string;
  t: (key: string) => string;
  isWeightlessExercise?: boolean; // Whether selected exercise is weightless (Cardio)
  chartType?: ChartType; // Current chart type
}

/**
 * Stats Card Component
 * 顯示訓練統計數據的卡片
 */
export const StatsCard: React.FC<StatsCardProps> = ({ 
  stats, 
  theme, 
  currentUnit, 
  t,
  isWeightlessExercise = false,
  chartType = 'weight'
}) => {
  const styles = createStyles(theme);

  // For weightless exercises in volume mode, display reps instead of weight
  // 對於無重量動作在容量模式下，顯示次數而非重量
  const showReps = isWeightlessExercise && chartType === 'volume';
  const displayValue = showReps 
    ? Math.round(stats.maxWeight).toString() // maxWeight is actually max volume (total reps) for weightless exercises
    : formatWeight(stats.maxWeight, currentUnit);
  const displayUnit = showReps 
    ? (t('workout.reps') || t('quickLog.reps') || '次')
    : (currentUnit === 'kg' ? t('units.kg') : t('units.lb'));

  return (
    <View style={styles.container}>
      {/* Total Training Sessions */}
      <View style={styles.statCard}>
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>{t('progress.totalTraining')}</Text>
      </View>

      {/* Highest Record */}
      <View style={styles.statCard}>
        <View style={styles.statValueContainer}>
          <Text style={styles.statValue}>{displayValue}</Text>
          <Text style={styles.statUnit}>{displayUnit}</Text>
        </View>
        <Text style={styles.statLabel}>{t('progress.highestRecord')}</Text>
      </View>

      {/* Improvement Rate */}
      <View style={styles.statCard}>
        <View style={styles.statValueContainer}>
          <Text
            style={[
              styles.statValue,
              { color: stats.improvement >= 0 ? theme.successColor : theme.errorColor },
            ]}
          >
            {stats.improvement >= 0 ? '+' : ''}
            {stats.improvement}
          </Text>
          <Text
            style={[
              styles.statUnit,
              { color: stats.improvement >= 0 ? theme.successColor : theme.errorColor },
            ]}
          >
            %
          </Text>
        </View>
        <Text style={styles.statLabel}>{t('progress.improvementRate')}</Text>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
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
  });



