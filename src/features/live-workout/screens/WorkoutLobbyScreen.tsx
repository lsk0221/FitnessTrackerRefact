/**
 * Workout Lobby Screen
 * 訓練大廳畫面
 * 
 * Screen for preparing workout before starting live session
 * 在開始即時會話前準備訓練的畫面
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../../shared/i18n';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import ScreenHeader from '../../../shared/components/ScreenHeader';
// Removed getExerciseName import - using t() function instead
import { getExercisesForMuscleGroup, searchExercisesForWorkout } from '../services/liveWorkoutService';
import type { ExerciseEntry } from '../types/liveWorkout.types';
import type { WorkoutTemplate } from '../../templates/types/template.types';

interface WorkoutLobbyScreenProps {
  route: {
    params?: {
      template?: WorkoutTemplate;
    };
  };
  navigation: any;
}

/**
 * Workout Lobby Screen
 * 訓練大廳畫面
 */
const WorkoutLobbyScreen: React.FC<WorkoutLobbyScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { showConfirmation, showAlert, renderAlert } = useAppAlert();
  const styles = createStyles(theme);

  const { template } = route.params || {};
  const [sessionExercises, setSessionExercises] = useState<ExerciseEntry[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<ExerciseEntry[]>([]);
  const [defaultRestTime, setDefaultRestTime] = useState(90); // Default 90 seconds

  // Initialize exercises from template
  useEffect(() => {
    if (template) {
      let exercises = template.exercises;
      
      // Handle exercises that might be string or array
      if (typeof exercises === 'string') {
        try {
          exercises = JSON.parse(exercises);
        } catch (error) {
          console.error('Failed to parse template exercises:', error);
          exercises = [];
        }
      }

      if (Array.isArray(exercises)) {
        const exerciseEntries: ExerciseEntry[] = exercises.map((ex, index) => ({
          id: ex.id || `ex-${index}`,
          // Preserve translation keys if available (for display)
          // 如果可用，保留翻譯鍵（用於顯示）
          nameKey: ex.nameKey,
          muscleGroupKey: ex.muscleGroupKey,
          // Extract raw English strings for database storage
          // 提取原始英文字符串用於數據庫存儲
          // If nameKey exists, extract the English name from it, otherwise use exercise
          // 如果 nameKey 存在，從中提取英文名稱，否則使用 exercise
          exercise: ex.nameKey ? (() => {
            // Try to get English name from translation key
            // 嘗試從翻譯鍵獲取英文名稱
            const key = ex.nameKey.replace('exercises.', '');
            // Convert snake_case back to readable format (approximate)
            // 將 snake_case 轉換回可讀格式（近似）
            return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          })() : (ex.exercise || ''),
          name: ex.nameKey ? (() => {
            const key = ex.nameKey.replace('exercises.', '');
            return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          })() : (ex.exercise || ''),
          muscleGroup: ex.muscleGroupKey ? ex.muscleGroupKey.replace('muscleGroups.', '') : (ex.muscleGroup || 'Unknown'),
          movementPattern: ex.movementPattern,
          equipment: ex.equipment,
          tags: ex.tags,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.restTime,
        }));
        setSessionExercises(exerciseEntries);
      }
    }
  }, [template]);

  /**
   * Remove exercise from session
   * 從會話中移除動作
   */
  const handleRemoveExercise = (index: number) => {
    showConfirmation({
      title: t('workoutLobby.removeExercise'),
      message: t('workoutLobby.removeExerciseMessage'),
      confirmText: t('common.remove'),
      cancelText: t('common.cancel'),
      confirmStyle: 'destructive',
      onConfirm: () => {
            const newExercises = sessionExercises.filter((_, i) => i !== index);
            setSessionExercises(newExercises);
          },
    });
  };

  /**
   * Add exercise to session
   * 添加動作到會話
   */
  const handleAddExercise = async () => {
    // Load all exercises for selection
    try {
      // For now, we'll use a simple approach - load from first muscle group
      // In a real app, you might want a more sophisticated exercise selector
      const result = await searchExercisesForWorkout('');
      if (result.success && result.data) {
        setAvailableExercises(result.data);
        setShowAddExerciseModal(true);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  /**
   * Select exercise to add
   * 選擇要添加的動作
   */
  const handleSelectExercise = (exercise: ExerciseEntry) => {
    const newExercise: ExerciseEntry = {
      ...exercise,
      id: `ex-${Date.now()}`,
    };
    setSessionExercises([...sessionExercises, newExercise]);
    setShowAddExerciseModal(false);
  };

  /**
   * Adjust rest time
   * 調整休息時間
   */
  const adjustRestTime = (delta: number) => {
    const newTime = defaultRestTime + delta;
    // Clamp between 30 and 300 seconds (5 minutes)
    // 限制在 30 到 300 秒之間（5 分鐘）
    if (newTime >= 30 && newTime <= 300) {
      setDefaultRestTime(newTime);
    }
  };

  /**
   * Start live mode
   * 開始即時模式
   */
  const handleStartLiveMode = () => {
    if (sessionExercises.length === 0) {
      showAlert({
        title: t('workoutLobby.noExercises'),
        message: t('workoutLobby.noExercisesMessage'),
      });
      return;
    }

    navigation.navigate('LiveWorkout', {
      exercises: sessionExercises,
      templateId: template?.id,
      initialRestTime: defaultRestTime,
    });
  };

  /**
   * Start quick log mode
   * 開始快速記錄模式
   */
  const handleStartQuickLog = () => {
    if (sessionExercises.length === 0) {
      showAlert({
        title: t('workoutLobby.noExercises'),
        message: t('workoutLobby.noExercisesMessage'),
      });
      return;
    }

    navigation.navigate('QuickLogWorkout', {
      exercises: sessionExercises,
    });
  };

  /**
   * Render exercise row
   * 渲染動作行
   */
  const renderExerciseRow = (exercise: ExerciseEntry, index: number) => {
    const exerciseName = exercise.nameKey ? t(exercise.nameKey) : (exercise.exercise || exercise.name || 'Unknown Exercise');
    // Use muscleGroupKey if available, otherwise fall back to muscleGroup
    // 如果可用，使用 muscleGroupKey，否則回退到 muscleGroup
    const muscleGroupKey = exercise.muscleGroupKey || exercise.muscleGroup || 'Unknown';
    const muscleGroup = (() => {
      if (muscleGroupKey === 'Unknown') return muscleGroupKey;
      // If it's already a translation key (starts with 'muscleGroups.'), use it directly
      // 如果已經是翻譯鍵（以 'muscleGroups.' 開頭），直接使用
      if (muscleGroupKey.startsWith('muscleGroups.')) {
        const translatedName = t(muscleGroupKey);
        return translatedName === muscleGroupKey ? muscleGroupKey.replace('muscleGroups.', '') : translatedName;
      }
      // Otherwise, construct the translation key
      // 否則，構造翻譯鍵
      const translationKey = `muscleGroups.${muscleGroupKey}`;
      const translatedName = t(translationKey);
      return translatedName === translationKey ? muscleGroupKey : translatedName;
    })();

    return (
      <View style={styles.exerciseRow}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exerciseName}</Text>
          <Text style={styles.exerciseMuscleGroup}>{muscleGroup}</Text>
        </View>
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveExercise(index)}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title={template?.name || t('workoutLobby.title') || 'Workout Lobby'}
        onBack={() => navigation.goBack()}
        paddingTopOffset={20}
      />
      <Text style={styles.subtitle}>{t('workoutLobby.subtitle')}</Text>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('workoutLobby.todaysPlan')}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sessionExercises}
          keyExtractor={(item, index) => `exercise-${index}-${item.id}`}
          renderItem={({ item, index }) => renderExerciseRow(item, index)}
          style={styles.exercisesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {t('workoutLobby.noExercises')}
              </Text>
            </View>
          )}
        />
      </View>

      {/* Rest Time Setting */}
      <View style={styles.restTimeContainer}>
        <Text style={styles.restTimeLabel}>Rest Timer: {defaultRestTime}s</Text>
        <View style={styles.restTimeControls}>
          <TouchableOpacity
            style={styles.restTimeButton}
            onPress={() => adjustRestTime(-30)}
            disabled={defaultRestTime <= 30}
          >
            <Text style={[
              styles.restTimeButtonText,
              defaultRestTime <= 30 && styles.restTimeButtonTextDisabled
            ]}>−</Text>
          </TouchableOpacity>
          <View style={styles.restTimeValueContainer}>
            <Text style={styles.restTimeValue}>{defaultRestTime}s</Text>
          </View>
          <TouchableOpacity
            style={styles.restTimeButton}
            onPress={() => adjustRestTime(30)}
            disabled={defaultRestTime >= 300}
          >
            <Text style={[
              styles.restTimeButtonText,
              defaultRestTime >= 300 && styles.restTimeButtonTextDisabled
            ]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.liveModeButton}
          onPress={handleStartLiveMode}
        >
          <Text style={styles.liveModeButtonText}>
            {t('workoutLobby.startWorkout')}
          </Text>
          <Text style={styles.liveModeButtonSubtext}>
            {t('workoutLobby.liveModeDesc')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickLogButton}
          onPress={handleStartQuickLog}
        >
          <Text style={styles.quickLogButtonText}>
            {t('workoutLobby.batchLog')}
          </Text>
          <Text style={styles.quickLogButtonSubtext}>
            {t('workoutLobby.quickLogDesc')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add exercise modal - simplified for now */}
      {showAddExerciseModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('workoutLobby.addExercise')}</Text>
              <TouchableOpacity onPress={() => setShowAddExerciseModal(false)}>
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableExercises.slice(0, 20)} // Limit to first 20 for performance
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const exerciseName = item.nameKey ? t(item.nameKey) : (item.exercise || item.name || 'Unknown Exercise');
                // Use muscleGroupKey if available, otherwise fall back to muscleGroup
                // 如果可用，使用 muscleGroupKey，否則回退到 muscleGroup
                const muscleGroupKey = item.muscleGroupKey || item.muscleGroup || 'Unknown';
                const muscleGroup = (() => {
                  if (muscleGroupKey === 'Unknown') return muscleGroupKey;
                  // If it's already a translation key (starts with 'muscleGroups.'), use it directly
                  // 如果已經是翻譯鍵（以 'muscleGroups.' 開頭），直接使用
                  if (muscleGroupKey.startsWith('muscleGroups.')) {
                    const translatedName = t(muscleGroupKey);
                    return translatedName === muscleGroupKey ? muscleGroupKey.replace('muscleGroups.', '') : translatedName;
                  }
                  // Otherwise, construct the translation key
                  // 否則，構造翻譯鍵
                  const translationKey = `muscleGroups.${muscleGroupKey}`;
                  const translatedName = t(translationKey);
                  return translatedName === translationKey ? muscleGroupKey : translatedName;
                })();
                
                return (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSelectExercise(item)}
                  >
                    <Text style={styles.suggestionName}>{exerciseName}</Text>
                    <Text style={styles.suggestionReason}>
                      {muscleGroup} • {item.equipment}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={styles.modalContent}
            />
          </View>
        </View>
      )}
      {renderAlert()}
    </View>
  );
};

/**
 * Create styles
 * 創建樣式
 */
const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  header: {
    backgroundColor: theme.cardBackground,
    // paddingTop is set dynamically using insets.top in component
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 28,
    color: theme.textPrimary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingBottom: 10,
    backgroundColor: theme.cardBackground,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  addButton: {
    backgroundColor: theme.primaryColor,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exercisesList: {
    flex: 1,
  },
  exerciseRow: {
    backgroundColor: theme.cardBackground,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  exerciseMuscleGroup: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  exerciseActions: {
    flexDirection: 'row',
    gap: 10,
  },
  removeButton: {
    backgroundColor: theme.errorColor,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
    padding: 20,
    backgroundColor: theme.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.borderColor,
  },
  liveModeButton: {
    flex: 1,
    backgroundColor: theme.primaryColor,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  liveModeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  liveModeButtonSubtext: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  quickLogButton: {
    flex: 1,
    backgroundColor: theme.cardBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.primaryColor,
  },
  quickLogButtonText: {
    color: theme.primaryColor,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickLogButtonSubtext: {
    color: theme.textSecondary,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  restTimeContainer: {
    backgroundColor: theme.cardBackground,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  restTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  restTimeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  restTimeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primaryColor + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.primaryColor,
  },
  restTimeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primaryColor,
  },
  restTimeButtonTextDisabled: {
    opacity: 0.3,
  },
  restTimeValueContainer: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: theme.cardBackground,
    borderRadius: 15,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: theme.textSecondary,
  },
  modalContent: {
    maxHeight: 400,
  },
  suggestionItem: {
    backgroundColor: theme.backgroundColor,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.borderColor,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  suggestionReason: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 4,
  },
});

export default WorkoutLobbyScreen;

