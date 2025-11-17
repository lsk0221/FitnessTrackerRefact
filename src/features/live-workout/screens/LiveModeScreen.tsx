/**
 * Live Mode Screen
 * 即時模式畫面
 * 
 * Main screen for active workout session
 * 活動訓練會話的主畫面
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../../shared/i18n';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useLiveWorkout } from '../hooks/useLiveWorkout';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
// Removed getExerciseName import - using t() function instead
import SetTracker from '../components/SetTracker';
import RestTimer from '../components/RestTimer';
import WorkoutProgress from '../components/WorkoutProgress';
import SmartSwapModal from '../components/SmartSwapModal';
import type { ExerciseEntry } from '../types/liveWorkout.types';

interface LiveModeScreenProps {
  route: {
    params?: {
      exercises: ExerciseEntry[];
      templateId?: string;
    };
  };
  navigation: any;
}

/**
 * Live Mode Screen
 * 即時模式畫面
 */
const LiveModeScreen: React.FC<LiveModeScreenProps> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  // Safety check: ensure theme is defined
  if (!theme) {
    console.error('LiveModeScreen: theme is undefined');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Theme not available</Text>
      </View>
    );
  }
  
  const styles = createStyles(theme);

  const { exercises = [], templateId } = route.params || {};
  const [showSmartSwapModal, setShowSmartSwapModal] = useState(false);

  // Initialize timer hook
  const {
    timerState,
    startTimer,
    skipTimer,
    resetTimer,
  } = useWorkoutTimer(() => {
    // Timer completed callback
    console.log('Rest timer completed');
  });

  /**
   * Handle set completed - called by useLiveWorkout when a set is marked complete
   * 處理組數完成 - 當組數被標記為完成時由 useLiveWorkout 調用
   */
  const handleSetCompleted = useCallback((restTime: number) => {
    // Ask user if they want to start rest timer
    Alert.alert(
      t('liveMode.setComplete'),
      t('liveMode.startRest'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => {
            startTimer(restTime);
          },
        },
      ]
    );
  }, [t, startTimer]);

  // Initialize live workout hook
  const {
    currentExerciseTemplate,
    currentExerciseLog,
    lastPerformance,
    isLoading,
    canFinishExercise,
    canFinishWorkout,
    completeSet,
    unCompleteSet,
    adjustReps,
    adjustWeight,
    addSet,
    nextExercise,
    previousExercise,
    skipExercise,
    finishWorkout: finishWorkoutHandler,
    replaceExercise,
    workoutStartTime,
    templateId: workoutTemplateId,
    currentExerciseIndex,
    totalExercises,
    completedExercisesCount,
  } = useLiveWorkout({
    exercises,
    templateId,
    initialRestTime: 90,
    onSetCompleted: handleSetCompleted,
  });

  /**
   * Handle skip timer with confirmation
   * 處理跳過計時器（帶確認）
   */
  const handleSkipTimer = () => {
    Alert.alert(
      t('liveMode.skipRest'),
      t('liveMode.skipRestConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => {
            skipTimer();
          },
        },
      ]
    );
  };

  /**
   * Handle finish exercise
   * 處理完成動作
   */
  const handleFinishExercise = () => {
    if (!canFinishExercise) {
      Alert.alert(
        t('liveMode.noSetsCompleted'),
        t('liveMode.noSetsCompletedMessage')
      );
      return;
    }

    if (canFinishWorkout) {
      // Last exercise, finish workout
      Alert.alert(
        t('liveMode.finishWorkout'),
        t('liveMode.finishWorkoutMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.confirm'),
            onPress: () => {
              finishWorkoutHandler(() => {
                Alert.alert(
                  t('liveMode.workoutComplete'),
                  t('liveMode.workoutCompleteMessage'),
                  [
                    {
                      text: t('common.confirm'),
                      onPress: () => navigation.navigate('TemplatesMain'),
                    },
                  ]
                );
              });
            },
          },
        ]
      );
    } else {
      // Move to next exercise
      nextExercise();
      resetTimer();
    }
  };

  /**
   * Handle smart swap
   * 處理智能替換
   */
  const handleSmartSwap = () => {
    setShowSmartSwapModal(true);
  };

  /**
   * Handle exercise replacement
   * 處理動作替換
   */
  const handleSelectReplacementExercise = (newExercise: ExerciseEntry) => {
    replaceExercise(newExercise);
    setShowSmartSwapModal(false);
  };

  /**
   * Handle next exercise navigation
   * 處理下一個動作導航
   */
  const handleNextExercise = () => {
    nextExercise();
    resetTimer();
  };

  /**
   * Handle previous exercise navigation
   * 處理上一個動作導航
   */
  const handlePreviousExercise = () => {
    previousExercise();
    resetTimer();
  };

  if (!currentExerciseTemplate) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('liveMode.noExercise')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerSubtitle}>
            ({currentExerciseIndex + 1}/{totalExercises})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleSmartSwap}
        >
          <Text style={styles.editButtonText}>{t('liveMode.edit')} →</Text>
        </TouchableOpacity>
      </View>

      {/* Mode indicator */}
      <View style={styles.modeIndicator}>
        <Text style={styles.modeText}>{t('liveMode.liveMode')}</Text>
      </View>

      {/* Progress */}
      <WorkoutProgress
        currentExerciseIndex={currentExerciseIndex}
        totalExercises={totalExercises}
        completedExercises={completedExercisesCount}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current exercise header */}
        <View style={styles.exerciseHeader}>
          {/* Exercise navigation buttons */}
          <View style={styles.exerciseNavigation}>
            <TouchableOpacity
              style={[
                styles.navButton,
                currentExerciseIndex === 0 && styles.navButtonDisabled
              ]}
              onPress={handlePreviousExercise}
              disabled={currentExerciseIndex === 0}
            >
              <Text style={[
                styles.navButtonText,
                currentExerciseIndex === 0 && styles.navButtonTextDisabled
              ]}>
                ← {t('liveMode.previous')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.navButton,
                currentExerciseIndex === totalExercises - 1 && styles.navButtonDisabled
              ]}
              onPress={handleNextExercise}
              disabled={currentExerciseIndex === totalExercises - 1}
            >
              <Text style={[
                styles.navButtonText,
                currentExerciseIndex === totalExercises - 1 && styles.navButtonTextDisabled
              ]}>
                {t('liveMode.next')} →
              </Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.exerciseName}>
            {currentExerciseTemplate.nameKey ? t(currentExerciseTemplate.nameKey) : (currentExerciseTemplate.exercise || currentExerciseTemplate.name || 'Unknown Exercise')}
          </Text>
          <Text style={styles.exerciseMuscleGroup}>
            {(() => {
              // Use muscleGroupKey if available, otherwise fall back to muscleGroup
              // 如果可用，使用 muscleGroupKey，否則回退到 muscleGroup
              const muscleGroupKey = currentExerciseTemplate.muscleGroupKey || currentExerciseTemplate.muscleGroup || 'Unknown';
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
            })()}
          </Text>
        </View>

        {/* Set tracker */}
        <SetTracker
          templateSets={currentExerciseTemplate.sets || 3}
          templateReps={currentExerciseTemplate.reps || 10}
          templateWeight={currentExerciseTemplate.weight || 0}
          currentExerciseLog={currentExerciseLog}
          lastPerformance={lastPerformance}
          onCompleteSet={completeSet}
          onUnCompleteSet={unCompleteSet}
          onAdjustReps={adjustReps}
          onAdjustWeight={adjustWeight}
          onAddSet={addSet}
        />
      </ScrollView>

      {/* Rest timer overlay */}
      {timerState.isRunning && timerState.timeLeft > 0 && (
        <RestTimer
          timerState={timerState}
          onSkip={handleSkipTimer}
        />
      )}

      {/* Finish button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[
            styles.finishButton,
            canFinishExercise && styles.finishButtonActive,
          ]}
          onPress={handleFinishExercise}
        >
          <Text style={styles.finishButtonText}>
            {canFinishWorkout
              ? t('liveMode.finishWorkout')
              : t('liveMode.finishExercise')
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Smart swap modal */}
      <SmartSwapModal
        visible={showSmartSwapModal}
        onClose={() => setShowSmartSwapModal(false)}
        currentExercise={currentExerciseTemplate}
        onSelectExercise={handleSelectReplacementExercise}
      />
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
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 55,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.textPrimary,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 16,
    color: theme.primaryColor,
    fontWeight: '600',
  },
  modeIndicator: {
    backgroundColor: theme.primaryColor,
    paddingVertical: 6,
    alignItems: 'center',
  },
  modeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  exerciseHeader: {
    paddingHorizontal: 25,
    paddingVertical: 30,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    marginBottom: 10,
  },
  exerciseNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  navButtonTextDisabled: {
    color: '#999',
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 8,
  },
  exerciseMuscleGroup: {
    fontSize: 18,
    color: '#888',
    fontWeight: '500',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  finishButton: {
    backgroundColor: '#ccc',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonActive: {
    backgroundColor: theme.primaryColor,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: theme.errorColor,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default LiveModeScreen;

