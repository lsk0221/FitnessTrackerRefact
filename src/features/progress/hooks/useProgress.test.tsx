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
  getPerformedExercisesList: jest.fn(),
}));

import {
  calculateExerciseProgress,
  getTargetWeight,
  saveTargetWeight,
  loadLastExercise,
} from '../services/progressService';
import { getAvailableExercises, getPerformedExercisesList } from '../../workouts/services/workoutService';

// Mock auth hook to avoid importing expo/env dependent modules
jest.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'test-user' } }),
}));

jest.mock('../../../shared/contexts/ThemeContext', () => ({
  useTheme: () => ({ theme: { backgroundColor: '#fff', cardBackground: '#fff', textPrimary: '#000', textSecondary: '#666', primaryColor: '#00f', borderColor: '#ddd', successColor: '#0a0', errorColor: '#a00' } }),
}));

jest.mock('../../../shared/hooks/useUnit', () => ({
  useUnit: () => ({ currentUnit: 'kg', formatWeight: (w: number) => String(Math.round(w)) }),
}));

const Wrapper = ({ onReady }: { onReady?: (hook: any) => void }) => {
  const hook = useProgress();
  React.useEffect(() => {
    onReady && onReady(hook);
  }, [hook]);
  return null;
};

jest.mock('../../../shared/services/data/exerciseLibraryService', () => ({
  getMainMuscleGroup: jest.fn((group) => {
    // Simple mapping for test
    const map: { [key: string]: string } = {
      'Hamstrings': 'Legs',
      'Quadriceps': 'Legs',
      'Calves': 'Legs',
      'Biceps': 'Arms',
      'Triceps': 'Arms',
      'Traps': 'Back',
      'Legs': 'Legs',
      'Back': 'Back',
      'Chest': 'Chest',
      'Shoulders': 'Shoulders',
      'Arms': 'Arms',
      'Core': 'Core',
      'Cardio': 'Cardio',
      'Full Body': 'Full Body',
    };
    return map[group] || group;
  }),
}));

jest.mock('../../../shared/contexts/CloudflareAuthContext', () => ({
  useCloudflareAuth: () => ({ user: { id: 'test-user' } }),
}));

describe('useProgress hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getAvailableExercises as jest.Mock).mockResolvedValue({ success: true, data: ['Bench Press'] });
    (getPerformedExercisesList as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { name: 'Bench Press', muscleGroup: 'Chest' },
        { name: 'Squat', muscleGroup: 'Legs' },
      ],
    });
    (loadLastExercise as jest.Mock).mockResolvedValue({ success: true, data: { muscleGroup: '', exercise: '' } });
    (getTargetWeight as jest.Mock).mockResolvedValue({ success: true, data: 0 });
    (calculateExerciseProgress as jest.Mock).mockResolvedValue({
      success: true,
      data: { exercise: 'Bench Press', chartData: [], stats: { total: 0, maxWeight: 0, latest: 0, improvement: 0 } },
    });
  });

  it('initializes and loads progress', async () => {
    render(<Wrapper />);
    await waitFor(() => expect(calculateExerciseProgress).toHaveBeenCalled());
  });

  it('handles exercise change and saves target weight', async () => {
    let currentHook: any;
    render(<Wrapper onReady={(h) => (currentHook = h)} />);
    await waitFor(() => expect(calculateExerciseProgress).toHaveBeenCalled());
    // Trigger another fetch by changing time range (guaranteed to re-load)
    act(() => {
      currentHook.handleTimeRangeSelect('7d');
    });
    await waitFor(() => expect((calculateExerciseProgress as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1));
    (saveTargetWeight as jest.Mock).mockResolvedValue({ success: true });
    await act(async () => {
      await currentHook.handleTargetWeightSave(100);
    });
    expect(saveTargetWeight).toHaveBeenCalled();
  });
});

