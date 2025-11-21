/**
 * Rest Timer Component
 * 休息計時器組件
 * 
 * Displays rest timer countdown overlay
 * 顯示休息計時器倒數覆蓋層
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import type { TimerState } from '../types/liveWorkout.types';

interface RestTimerProps {
  timerState: TimerState;
  onSkip: () => void;
}

/**
 * Rest Timer Component
 * 休息計時器組件
 */
const RestTimer: React.FC<RestTimerProps> = ({
  timerState,
  onSkip,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!timerState.isRunning && timerState.timeLeft === 0) {
    return null; // Don't render if timer is not active
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.label}>{t('liveMode.restTime')}</Text>
        <View style={styles.circularTimer}>
          <Text style={styles.timerText}>
            {formatTime(timerState.timeLeft)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="close-circle" size={24} color="#FFFFFF" />
          <Text style={styles.skipButtonText}>
            {t('liveMode.skipRest') || 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Create styles
 * 創建樣式
 */
const createStyles = (theme: any) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  circularTimer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 6,
    borderColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.primaryColor,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 160,
    gap: 8,
    // Enhanced visibility
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});

export default RestTimer;


