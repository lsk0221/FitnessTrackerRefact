// NOTE: Skipped due to RN/JSX transform limitations in current Jest env
import React from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { useProgress } from './useProgress';

jest.mock('../services/progressService', () => ({
  calculateExerciseProgress: jest.fn(),
  getTargetWeight: jest.fn(),
  saveTargetWeight: jest.fn(),
  loadLastExercise: jest.fn(),
  saveLastExercise: jest.fn(),
}));

jest.mock('../../workouts/services/workoutService', () => ({
  getAvailableExercises: jest.fn(),
}));

import {
  calculateExerciseProgress,
  getTargetWeight,
  saveTargetWeight,
  loadLastExercise,
} from '../services/progressService';
import { getAvailableExercises } from '../../workouts/services/workoutService';

jest.mock('../../../shared/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: { backgroundColor: '#fff', cardBackground: '#fff', textPrimary: '#000', textSecondary: '#666', primaryColor: '#00f', borderColor: '#ddd', successColor: '#0a0', errorColor: '#a00' } }),
}));

jest.mock('../../../shared/hooks/useUnit', () => ({
  useUnit: () => ({ currentUnit: 'kg', formatWeight: (w) => String(Math.round(w)) }),
}));

const Wrapper = ({ onReady }) => {
  const hook = useProgress();
  React.useEffect(() => {
    onReady && onReady(hook);
  }, [hook]);
  return null;
};

describe('useProgress hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAvailableExercises.mockResolvedValue({ success: true, data: ['bench_press'] });
    loadLastExercise.mockResolvedValue({ success: true, data: { muscleGroup: '', exercise: '' } });
    getTargetWeight.mockResolvedValue({ success: true, data: 0 });
    calculateExerciseProgress.mockResolvedValue({
      success: true,
      data: { exercise: 'bench_press', chartData: [], stats: { total: 0, maxWeight: 0, latest: 0, improvement: 0 } },
    });
  });

  it('initializes and loads progress', async () => {
    const onReady = jest.fn();
    render(<Wrapper onReady={onReady} />);
    await waitFor(() => expect(calculateExerciseProgress).toHaveBeenCalled());
  });

  it('handles exercise change and saves target weight', async () => {
    const onReady = jest.fn();
    const saveSpy = saveTargetWeight;
    saveSpy.mockResolvedValue({ success: true });
    render(<Wrapper onReady={onReady} />);
    let hook;
    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
      hook = onReady.mock.calls[0][0];
    });
    act(() => {
      hook.handleExerciseSelect('bench_press');
    });
    await waitFor(() => expect(calculateExerciseProgress).toHaveBeenCalledTimes(2));
    await act(async () => {
      await hook.handleTargetWeightSave(100);
    });
    expect(saveSpy).toHaveBeenCalled();
  });
});


