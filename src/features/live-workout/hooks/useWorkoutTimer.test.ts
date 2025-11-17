/**
 * Workout Timer Hook Tests
 * 訓練計時器 Hook 測試
 * 
 * Unit tests for workout timer hook
 * 訓練計時器 Hook 的單元測試
 */

import { renderHook, act } from '@testing-library/react-native';
import { useWorkoutTimer } from './useWorkoutTimer';

// Mock Vibration
const mockVibrate = jest.fn();
jest.mock('react-native/Libraries/Vibration/Vibration', () => ({
  default: {
    vibrate: mockVibrate,
  },
}));

describe('useWorkoutTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('startTimer', () => {
    it('should set timeLeft and isRunning correctly', () => {
      // Act
      const { result } = renderHook(() => useWorkoutTimer());

      act(() => {
        result.current.startTimer(90);
      });

      // Assert
      expect(result.current.timerState.timeLeft).toBe(90);
      expect(result.current.timerState.isRunning).toBe(true);
      expect(result.current.timerState.duration).toBe(90);
    });
  });

  describe('countdown', () => {
    it('should decrease timeLeft when timer is running', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer());

      act(() => {
        result.current.startTimer(5);
      });

      // Act - Advance time by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      expect(result.current.timerState.timeLeft).toBe(4);
      expect(result.current.timerState.isRunning).toBe(true);
    });

    it('should decrease timeLeft multiple times', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer());

      act(() => {
        result.current.startTimer(10);
      });

      // Act - Advance time by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Assert
      expect(result.current.timerState.timeLeft).toBe(7);
    });

    it('should stop timer and call onTimerComplete when timeLeft reaches 0', () => {
      // Arrange
      const onTimerComplete = jest.fn();
      const { result } = renderHook(() => useWorkoutTimer(onTimerComplete));

      act(() => {
        result.current.startTimer(2);
      });

      // Act - Advance time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Assert
      expect(result.current.timerState.timeLeft).toBe(0);
      expect(result.current.timerState.isRunning).toBe(false);
      expect(onTimerComplete).toHaveBeenCalledTimes(1);
    });

    it('should vibrate when timer completes if vibration is enabled', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer(undefined, true));

      act(() => {
        result.current.startTimer(1);
      });

      // Act - Advance time by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      expect(mockVibrate).toHaveBeenCalledWith([0, 200, 100, 200]);
    });

    it('should not vibrate when vibration is disabled', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer(undefined, false));

      act(() => {
        result.current.startTimer(1);
      });

      // Act - Advance time by 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Assert
      expect(mockVibrate).not.toHaveBeenCalled();
    });
  });

  describe('pauseTimer', () => {
    it('should pause the timer without resetting timeLeft', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer());

      act(() => {
        result.current.startTimer(90);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      const timeBeforePause = result.current.timerState.timeLeft;

      // Act
      act(() => {
        result.current.pauseTimer();
      });

      // Assert
      expect(result.current.timerState.isRunning).toBe(false);
      expect(result.current.timerState.timeLeft).toBe(timeBeforePause);

      // Advance time - should not decrease
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.timerState.timeLeft).toBe(timeBeforePause);
    });
  });

  describe('resumeTimer', () => {
    it('should resume the timer from where it was paused', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer());

      act(() => {
        result.current.startTimer(90);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      const timeBeforeResume = result.current.timerState.timeLeft;

      // Act
      act(() => {
        result.current.resumeTimer();
      });

      // Assert
      expect(result.current.timerState.isRunning).toBe(true);
      expect(result.current.timerState.timeLeft).toBe(timeBeforeResume);

      // Advance time - should decrease
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.timerState.timeLeft).toBe(timeBeforeResume - 1);
    });
  });

  describe('resetTimer', () => {
    it('should reset timer to initial state', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer());

      act(() => {
        result.current.startTimer(90);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Act
      act(() => {
        result.current.resetTimer();
      });

      // Assert
      expect(result.current.timerState.timeLeft).toBe(0);
      expect(result.current.timerState.isRunning).toBe(false);
      expect(result.current.timerState.duration).toBe(0);
    });
  });

  describe('skipTimer', () => {
    it('should set timeLeft to 0 and isRunning to false', () => {
      // Arrange
      const { result } = renderHook(() => useWorkoutTimer());

      act(() => {
        result.current.startTimer(90);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Act
      act(() => {
        result.current.skipTimer();
      });

      // Assert
      expect(result.current.timerState.timeLeft).toBe(0);
      expect(result.current.timerState.isRunning).toBe(false);
      // Duration should remain unchanged
      expect(result.current.timerState.duration).toBe(90);
    });

    it('should not call onTimerComplete when skipped', () => {
      // Arrange
      const onTimerComplete = jest.fn();
      const { result } = renderHook(() => useWorkoutTimer(onTimerComplete));

      act(() => {
        result.current.startTimer(90);
      });

      // Act
      act(() => {
        result.current.skipTimer();
      });

      // Assert
      expect(onTimerComplete).not.toHaveBeenCalled();
    });
  });

  describe('onTimerComplete callback', () => {
    it('should be called exactly once when timer reaches 0', () => {
      // Arrange
      const onTimerComplete = jest.fn();
      const { result } = renderHook(() => useWorkoutTimer(onTimerComplete));

      act(() => {
        result.current.startTimer(3);
      });

      // Act - Advance time by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Assert
      expect(onTimerComplete).toHaveBeenCalledTimes(1);
    });

    it('should not be called if timer is paused before completion', () => {
      // Arrange
      const onTimerComplete = jest.fn();
      const { result } = renderHook(() => useWorkoutTimer(onTimerComplete));

      act(() => {
        result.current.startTimer(5);
      });

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      // Act - Advance time further (should not trigger callback)
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Assert
      expect(onTimerComplete).not.toHaveBeenCalled();
    });

    it('should not be called if timer is skipped', () => {
      // Arrange
      const onTimerComplete = jest.fn();
      const { result } = renderHook(() => useWorkoutTimer(onTimerComplete));

      act(() => {
        result.current.startTimer(5);
      });

      act(() => {
        result.current.skipTimer();
      });

      // Assert
      expect(onTimerComplete).not.toHaveBeenCalled();
    });
  });
});

