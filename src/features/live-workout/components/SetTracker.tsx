/**
 * Set Tracker Component - Logbook Pattern
 * 組數追蹤組件 - 日誌本模式
 * 
 * Renders sets based on template, checking logbook for existing entries
 * 根據模板渲染組數，檢查日誌本中的現有條目
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useUnit } from '../../../shared/hooks/useUnit';
import type { ExerciseEntry } from '../types/liveWorkout.types';

/**
 * Log Entry interface (matches useLiveWorkout)
 */
interface LogEntry {
  id: string;
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
  exerciseName: string;
  exerciseIndex: number;
}

interface SetTrackerProps {
  templateSets: number; // Number of sets from template (e.g., 4)
  templateReps: number; // Default reps from template (e.g., 10)
  templateWeight?: number; // Default weight from template
  currentExerciseLog: LogEntry[]; // Filtered log entries for current exercise
  lastPerformance?: { reps: number; weight: number } | null; // Last workout data
  onCompleteSet: (setIndex: number, reps: number, weight: number) => void;
  onUnCompleteSet: (setIndex: number) => void;
  onAdjustReps: (setIndex: number, delta: number, isAbsolute?: boolean) => void;
  onAdjustWeight: (setIndex: number, delta: number, isAbsolute?: boolean) => void;
  onAddSet: () => void;
}

/**
 * Set Tracker Component
 * 組數追蹤組件
 */
const SetTracker: React.FC<SetTrackerProps> = ({
  templateSets,
  templateReps,
  templateWeight = 0,
  currentExerciseLog,
  lastPerformance,
  onCompleteSet,
  onUnCompleteSet,
  onAdjustReps,
  onAdjustWeight,
  onAddSet,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { currentUnit, convertWeightValue } = useUnit();
  
  // Safety check: ensure theme is defined
  if (!theme) {
    console.error('SetTracker: theme is undefined');
    return null;
  }
  
  const styles = createStyles(theme);

  const [showInputModal, setShowInputModal] = useState(false);
  const [editingSet, setEditingSet] = useState<{ setIndex: number; field: 'reps' | 'weight' } | null>(null);
  const [inputValue, setInputValue] = useState('');

  /**
   * Get log entry for a specific set index
   * 獲取特定組數索引的日誌條目
   */
  const getLogEntry = (setIndex: number): LogEntry | undefined => {
    return currentExerciseLog.find(entry => entry.setNumber === setIndex);
  };

  /**
   * Get default reps for a set (from log, last performance, or template)
   * 獲取組數的默認次數（從日誌、上次表現或模板）
   */
  const getDefaultReps = (setIndex: number): number => {
    const logEntry = getLogEntry(setIndex);
    if (logEntry) return logEntry.reps;
    if (lastPerformance) return lastPerformance.reps;
    return templateReps;
  };

  /**
   * Get default weight for a set (from log, last performance, or template)
   * 獲取組數的默認重量（從日誌、上次表現或模板）
   */
  const getDefaultWeight = (setIndex: number): number => {
    const logEntry = getLogEntry(setIndex);
    if (logEntry) return logEntry.weight;
    if (lastPerformance) return lastPerformance.weight;
    return templateWeight;
  };

  /**
   * Check if a set is completed
   * 檢查組數是否已完成
   */
  const isSetCompleted = (setIndex: number): boolean => {
    const logEntry = getLogEntry(setIndex);
    return logEntry?.completed || false;
  };

  /**
   * Handle set completion toggle
   * 處理組數完成切換
   */
  const handleSetToggle = (setIndex: number) => {
    const logEntry = getLogEntry(setIndex);
    if (logEntry && logEntry.completed) {
      // Uncomplete the set
      onUnCompleteSet(setIndex);
    } else {
      // Complete the set with current/default values
      const reps = logEntry?.reps || getDefaultReps(setIndex);
      const weight = logEntry?.weight || getDefaultWeight(setIndex);
      onCompleteSet(setIndex, reps, weight);
    }
  };

  /**
   * Open input modal for editing set value
   * 打開輸入模態框以編輯組數值
   */
  const openInputModal = (setIndex: number, field: 'reps' | 'weight', currentValue: number) => {
    setEditingSet({ setIndex, field });
    setInputValue(currentValue.toString());
    setShowInputModal(true);
  };

  /**
   * Handle input confirmation
   * 處理輸入確認
   */
  const handleConfirmInput = () => {
    if (!editingSet) return;

    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setShowInputModal(false);
      return;
    }

    if (editingSet.field === 'reps') {
      onAdjustReps(editingSet.setIndex, value, true);
    } else if (editingSet.field === 'weight') {
      onAdjustWeight(editingSet.setIndex, value, true);
    }

    setShowInputModal(false);
    setEditingSet(null);
    setInputValue('');
  };

  /**
   * Render a single set row
   * 渲染單個組數行
   */
  const renderSetRow = (setIndex: number) => {
    const logEntry = getLogEntry(setIndex);
    const isCompleted = isSetCompleted(setIndex);
    const currentReps = logEntry?.reps || getDefaultReps(setIndex);
    const currentWeight = logEntry?.weight || getDefaultWeight(setIndex);
    const displayWeight = convertWeightValue(currentWeight);

    return (
      <View key={setIndex} style={styles.setRow}>
        {/* SET column */}
        <View style={styles.setColumn}>
          <Text style={styles.setNumber}>#{setIndex}</Text>
        </View>

        {/* REPS column */}
        <View style={styles.repsColumn}>
          <View style={styles.setControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => onAdjustReps(setIndex, -1)}
            >
              <Text style={styles.controlButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.valueButton}
              onPress={() => openInputModal(setIndex, 'reps', currentReps)}
            >
              <Text style={[styles.valueText, isCompleted && styles.completedValue]}>
                {currentReps}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => onAdjustReps(setIndex, 1)}
            >
              <Text style={styles.controlButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WEIGHT column */}
        <View style={styles.weightColumn}>
          <View style={styles.setControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => onAdjustWeight(setIndex, -2.5)}
            >
              <Text style={styles.controlButtonText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.valueButton}
              onPress={() => openInputModal(setIndex, 'weight', currentWeight)}
            >
              <Text style={[styles.valueText, isCompleted && styles.completedValue]}>
                {displayWeight}
              </Text>
              <Text style={styles.unitText}>{currentUnit}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => onAdjustWeight(setIndex, 2.5)}
            >
              <Text style={styles.controlButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CHECKBOX column */}
        <View style={styles.checkboxColumn}>
          <TouchableOpacity
            style={[styles.checkbox, isCompleted && styles.checkboxChecked]}
            onPress={() => handleSetToggle(setIndex)}
          >
            {isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{t('liveMode.set')}</Text>
        <Text style={styles.headerText}>{t('liveMode.reps')}</Text>
        <Text style={styles.headerText}>{t('liveMode.weight')}</Text>
        <Text style={styles.headerText}>{t('liveMode.done')}</Text>
      </View>

      {/* Set rows - render from 1 to templateSets */}
      {Array.from({ length: templateSets }, (_, index) => index + 1).map(setIndex =>
        renderSetRow(setIndex)
      )}

      {/* Add set button */}
      <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
        <Text style={styles.addSetButtonText}>+ {t('liveMode.addSet')}</Text>
      </TouchableOpacity>

      {/* Input modal */}
      <Modal
        visible={showInputModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInputModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingSet?.field === 'reps' ? t('liveMode.editReps') : t('liveMode.editWeight')}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="0"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowInputModal(false)}
              >
                <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleConfirmInput}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  {t('common.confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

/**
 * Create styles based on theme
 * 根據主題創建樣式
 */
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.backgroundColor || theme.cardBackground || '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor || '#e0e0e0',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.textSecondary || '#666666',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor || '#e0e0e0',
  },
  setColumn: {
    flex: 1,
    alignItems: 'center',
  },
  setNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary || '#333333',
  },
  repsColumn: {
    flex: 2,
  },
  weightColumn: {
    flex: 2,
  },
  checkboxColumn: {
    flex: 1,
    alignItems: 'center',
  },
  setControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primaryColor || '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.backgroundColor || theme.cardBackground || '#ffffff',
  },
  valueButton: {
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.textPrimary || '#333333',
  },
  completedValue: {
    color: theme.primaryColor || '#007AFF',
    fontWeight: '600',
  },
  unitText: {
    fontSize: 12,
    color: theme.textSecondary || '#666666',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.borderColor || '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.backgroundColor || theme.cardBackground || '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: theme.primaryColor || '#007AFF',
    borderColor: theme.primaryColor || '#007AFF',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.backgroundColor || theme.cardBackground || '#ffffff',
  },
  addSetButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: (theme.primaryColor || '#007AFF') + '20',
    alignItems: 'center',
  },
  addSetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primaryColor || '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.backgroundColor || theme.cardBackground || '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary || '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: theme.borderColor || '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.textPrimary || '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: theme.borderColor || '#e0e0e0',
    marginRight: 8,
  },
  modalButtonConfirm: {
    backgroundColor: theme.primaryColor || '#007AFF',
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary || '#333333',
  },
  modalButtonTextConfirm: {
    color: theme.backgroundColor || theme.cardBackground || '#ffffff',
  },
});

export default SetTracker;
