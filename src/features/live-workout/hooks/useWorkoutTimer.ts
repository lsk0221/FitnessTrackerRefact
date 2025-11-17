/**
 * Workout Timer Hook
 * 訓練計時器 Hook
 * 
 * Manages rest timer state and functionality
 * 管理休息計時器狀態和功能
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Vibration } from 'react-native';
import type { TimerState } from '../types/liveWorkout.types';

interface UseWorkoutTimerReturn {
  timerState: TimerState;
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
}

/**
 * Hook for managing workout rest timer
 * 管理訓練休息計時器的 Hook
 */
export const useWorkoutTimer = (
  onTimerComplete?: () => void,
  enableVibration: boolean = true
): UseWorkoutTimerReturn => {
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: 0,
    isRunning: false,
    duration: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timerState.isRunning && timerState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            // Timer completed
            if (enableVibration) {
              Vibration.vibrate([0, 200, 100, 200]);
            }
            if (onTimerComplete) {
              onTimerComplete();
            }
            return {
              ...prev,
              timeLeft: 0,
              isRunning: false,
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1,
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerState.isRunning, timerState.timeLeft, onTimerComplete, enableVibration]);

  /**
   * Start timer with specified duration
   * 以指定時長啟動計時器
   */
  const startTimer = useCallback((duration: number) => {
    setTimerState({
      timeLeft: duration,
      isRunning: true,
      duration,
    });
  }, []);

  /**
   * Pause the timer
   * 暫停計時器
   */
  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  /**
   * Resume the timer
   * 恢復計時器
   */
  const resumeTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
    }));
  }, []);

  /**
   * Reset timer to initial state
   * 重置計時器到初始狀態
   */
  const resetTimer = useCallback(() => {
    setTimerState({
      timeLeft: 0,
      isRunning: false,
      duration: 0,
    });
  }, []);

  /**
   * Skip timer (set to 0 and stop)
   * 跳過計時器（設為0並停止）
   */
  const skipTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      timeLeft: 0,
      isRunning: false,
    }));
  }, []);

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
  };
};


