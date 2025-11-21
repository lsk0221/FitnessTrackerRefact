/**
 * Live Mode Screen
 * 即時模式畫面
 * 
 * Main screen for active workout session
 * 活動訓練會話的主畫面
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../../shared/i18n';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import { useLiveWorkout } from '../hooks/useLiveWorkout';
import { useWorkoutTimer } from '../hooks/useWorkoutTimer';
// Removed getExerciseName import - using t() function instead
import SetTracker from '../components/SetTracker';
import RestTimer from '../components/RestTimer';
import WorkoutProgress from '../components/WorkoutProgress';
import SmartSwapModal from '../components/SmartSwapModal';
import { searchExercisesForWorkout } from '../services/liveWorkoutService';
import type { ExerciseEntry } from '../types/liveWorkout.types';

interface LiveModeScreenProps {
  route: {
    params?: {
      exercises: ExerciseEntry[];
      templateId?: string;
      initialRestTime?: number;
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
  const { showConfirmation, showOptions, showAlert, showPopover, renderAlert } = useAppAlert();
  
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

  // Extract route parameters with fallback values
  // 從路由參數中提取值，並設置預設值
  const { 
    exercises = [], 
    templateId, 
    initialRestTime = 90 // Default rest time in seconds (fallback if not provided)
  } = route.params || {};
  const [showSmartSwapModal, setShowSmartSwapModal] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExerciseEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs for measuring button positions
  const moreOptionsButtonRef = useRef<TouchableOpacity>(null);

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
   * 
   * Automatically starts rest timer without confirmation for better UX
   * 自動啟動休息計時器，無需確認，提升用戶體驗
   */
  const handleSetCompleted = useCallback((restTime: number) => {
    // Automatically start rest timer - user can skip if needed
    // 自動啟動休息計時器 - 用戶可以隨時跳過
            startTimer(restTime);
  }, [startTimer]);

  // Initialize live workout hook with user-configured rest time
  // 使用使用者設定的休息時間初始化即時訓練 Hook
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
    addExercise,
    removeCurrentExercise,
    updateCurrentExerciseRestTime,
    workoutStartTime,
    templateId: workoutTemplateId,
    currentExerciseIndex,
    totalExercises,
    completedExercisesCount,
  } = useLiveWorkout({
    exercises,
    templateId,
    initialRestTime, // User-configured rest time from WorkoutLobbyScreen
    onSetCompleted: handleSetCompleted,
  });

  // Calculate effective rest time for current exercise
  // 計算當前練習的有效休息時間
  const effectiveRestTime = useMemo(() => {
    return currentExerciseTemplate?.restTime ?? initialRestTime;
  }, [currentExerciseTemplate?.restTime, initialRestTime]);

  /**
   * Handle skip timer - no confirmation needed for better UX
   * 處理跳過計時器 - 無需確認，提升用戶體驗
   */
  const handleSkipTimer = () => {
            skipTimer();
  };

  /**
   * Handle finish exercise
   * 處理完成動作
   */
  const handleFinishExercise = () => {
    if (!canFinishExercise) {
      showAlert({
        title: t('liveMode.noSetsCompleted'),
        message: t('liveMode.noSetsCompletedMessage'),
      });
      return;
    }

    if (canFinishWorkout) {
      // Last exercise, finish workout
      showConfirmation({
        title: t('liveMode.finishWorkout'),
        message: t('liveMode.finishWorkoutMessage'),
        confirmText: t('common.confirm'),
        cancelText: t('common.cancel'),
        onConfirm: () => {
              finishWorkoutHandler(() => {
            showAlert({
              title: t('liveMode.workoutComplete'),
              message: t('liveMode.workoutCompleteMessage'),
              buttons: [
                    {
                      text: t('common.confirm'),
                      onPress: () => navigation.navigate('TemplatesMain'),
                    },
              ],
            });
              });
            },
      });
    } else {
      // Move to next exercise
      nextExercise();
      resetTimer();
    }
  };

  /**
   * Handle more options menu
   * 處理更多選項菜單
   */
  const handleMoreOptions = useCallback(() => {
    // Measure button position using ref
    if (moreOptionsButtonRef.current) {
      moreOptionsButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
        showPopover({
          anchorRect: {
            x: pageX,
            y: pageY,
            width: width || 40,
            height: height || 40,
          },
          options: [
            {
              text: t('liveMode.smartSwap') || 'Smart Swap',
              onPress: () => setShowSmartSwapModal(true),
            },
            {
              text: t('liveMode.addExercise') || 'Add Exercise',
              onPress: () => setShowAddExerciseModal(true),
            },
            {
              text: t('liveMode.removeExercise') || 'Remove Exercise',
              isDestructive: true,
              onPress: handleRemoveExercise,
            },
          ],
          cancelText: t('common.cancel') || 'Cancel',
        });
      });
    } else {
      // Fallback: use showOptions if ref is not available
      showOptions({
        title: t('liveMode.moreOptions') || 'More Options',
        options: [
          {
            text: t('liveMode.smartSwap') || 'Smart Swap',
            onPress: () => setShowSmartSwapModal(true),
          },
          {
            text: t('liveMode.addExercise') || 'Add Exercise',
            onPress: () => setShowAddExerciseModal(true),
          },
          {
            text: t('liveMode.removeExercise') || 'Remove Exercise',
            style: 'destructive',
            onPress: handleRemoveExercise,
          },
        ],
        cancelText: t('common.cancel') || 'Cancel',
      });
    }
  }, [showPopover, showOptions, t, handleRemoveExercise, setShowSmartSwapModal, setShowAddExerciseModal]);

  /**
   * Handle remove exercise - immediately execute without confirmation
   * 處理刪除動作 - 立即執行，無需確認
   */
  const handleRemoveExercise = () => {
    // Remove exercise immediately without confirmation
    // 立即移除練習，無需確認
    const isEmpty = removeCurrentExercise();
    
    // If workout becomes empty, show options to add exercise or finish
    // 如果訓練變為空，顯示選項以添加練習或完成
    if (isEmpty) {
      // Use setTimeout to ensure Popover is closed first
      setTimeout(() => {
        showOptions({
          title: t('liveMode.workoutEmpty') || 'Workout Empty',
          options: [
            {
              text: t('liveMode.addExercise') || 'Add Exercise',
              onPress: () => setShowAddExerciseModal(true),
            },
            {
              text: t('common.finish') || 'Finish',
              onPress: () => navigation.goBack(),
            },
          ],
        });
      }, 100);
    }
  };

  /**
   * Handle search exercises
   * 處理搜尋動作
   */
  const handleSearchExercises = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchExercisesForWorkout(query);
      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching exercises:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Handle add exercise from search
   * 處理從搜尋結果添加動作
   */
  const handleAddExerciseFromSearch = (exercise: ExerciseEntry) => {
    addExercise(exercise);
    setShowAddExerciseModal(false);
    setSearchQuery('');
    setSearchResults([]);
    showAlert({
      title: t('liveMode.exerciseAdded') || 'Exercise Added',
      message: t('liveMode.exerciseAddedMessage') || 'Exercise has been added to your workout.',
    });
  };

  /**
   * Render exercise search result item
   * 渲染動作搜尋結果項目
   */
  const renderExerciseResult = ({ item }: { item: ExerciseEntry }) => {
    const displayName = item.nameKey 
      ? t(item.nameKey) 
      : (item.exercise || item.name || t('liveMode.unknownExercise') || 'Unknown Exercise');
    
    const muscleGroupKey = item.muscleGroupKey || item.muscleGroup || 'Unknown';
    const displayMuscleGroup = (() => {
      if (muscleGroupKey === 'Unknown') return muscleGroupKey;
      if (muscleGroupKey.startsWith('muscleGroups.')) {
        const translatedName = t(muscleGroupKey);
        return translatedName === muscleGroupKey ? muscleGroupKey.replace('muscleGroups.', '') : translatedName;
      }
      const translationKey = `muscleGroups.${muscleGroupKey}`;
      const translatedName = t(translationKey);
      return translatedName === translationKey ? muscleGroupKey : translatedName;
    })();

    return (
      <TouchableOpacity
        style={styles.exerciseResultItem}
        onPress={() => handleAddExerciseFromSearch(item)}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseResultContent}>
          <View style={styles.exerciseResultIcon}>
            <Text style={styles.exerciseResultIconText}>
              {displayMuscleGroup?.[0]?.toUpperCase() || 'E'}
            </Text>
          </View>
          <View style={styles.exerciseResultInfo}>
            <Text style={styles.exerciseResultName}>{displayName}</Text>
            <Text style={styles.exerciseResultDetails}>
              {displayMuscleGroup} / {item.equipment || t('liveMode.unknown') || 'Unknown'}
            </Text>
          </View>
          <MaterialCommunityIcons name="plus-circle" size={24} color={theme.primaryColor} />
        </View>
      </TouchableOpacity>
    );
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

  // Handle empty workout state
  // 處理空訓練狀態
  if (!currentExerciseTemplate || totalExercises === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerSubtitle}>0/0</Text>
          </View>
          <TouchableOpacity
            ref={moreOptionsButtonRef}
            style={styles.editButton}
            onPress={handleMoreOptions}
          >
            <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.primaryColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyWorkoutContainer}>
          <MaterialCommunityIcons name="dumbbell" size={64} color={theme.textSecondary} />
          <Text style={styles.emptyWorkoutText}>
            {t('liveMode.noExercises') || 'No exercises in workout'}
          </Text>
          <Text style={styles.emptyWorkoutSubtext}>
            {t('liveMode.addExerciseToStart') || 'Add an exercise to start your workout'}
          </Text>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowAddExerciseModal(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addExerciseButtonText}>
              {t('liveMode.addExercise') || 'Add Exercise'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Add Exercise Modal for empty state */}
        <Modal
          visible={showAddExerciseModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setShowAddExerciseModal(false);
            setSearchQuery('');
            setSearchResults([]);
          }}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.backgroundColor }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t('liveMode.addExercise') || 'Add Exercise'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddExerciseModal(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder={t('liveMode.searchExercises') || 'Search exercises...'}
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchExercises}
                autoFocus
              />
              {isSearching && (
                <ActivityIndicator size="small" color={theme.primaryColor} style={styles.searchLoader} />
              )}
              {!isSearching && searchQuery && (
                <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
              )}
            </View>
            {searchQuery ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => `search-${item.id || index}`}
                renderItem={renderExerciseResult}
                ListEmptyComponent={
                  !isSearching ? (
                    <View style={styles.emptySearchContainer}>
                      <Text style={styles.emptySearchText}>
                        {t('liveMode.noSearchResults') || 'No exercises found'}
                      </Text>
                    </View>
                  ) : null
                }
                style={styles.searchResultsList}
              />
            ) : (
              <View style={styles.emptySearchContainer}>
                <Text style={styles.emptySearchText}>
                  {t('liveMode.searchHint') || 'Type to search for exercises...'}
                </Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>
        {renderAlert()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        onBack={() => navigation.goBack()}
        centerComponent={
          <Text style={styles.headerSubtitle}>
            {currentExerciseIndex + 1}/{totalExercises}
          </Text>
        }
        rightComponent={
        <TouchableOpacity
          style={styles.editButton}
            onPress={handleMoreOptions}
        >
            <MaterialCommunityIcons name="dots-horizontal" size={20} color={theme.primaryColor} />
        </TouchableOpacity>
        }
        paddingTopOffset={8}
      />

      {/* Mode indicator - Compact */}
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
        {/* Current exercise header - Compact Layout */}
        <View style={styles.exerciseHeader}>
          {/* Compact Title Row: [< Icon] [Exercise Name + Muscle Group (Centered)] [> Icon] */}
          <View style={styles.exerciseTitleRow}>
            <TouchableOpacity
              style={[
                styles.navIconButton,
                currentExerciseIndex === 0 && styles.navIconButtonDisabled
              ]}
              onPress={handlePreviousExercise}
              disabled={currentExerciseIndex === 0}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="chevron-left" 
                size={24} 
                color={currentExerciseIndex === 0 ? theme.textSecondary : theme.primaryColor} 
              />
            </TouchableOpacity>
            
            <View style={styles.exerciseTitleCenter}>
              <Text style={styles.exerciseName} numberOfLines={1} ellipsizeMode="tail">
                {currentExerciseTemplate.nameKey ? t(currentExerciseTemplate.nameKey) : (currentExerciseTemplate.exercise || currentExerciseTemplate.name || t('liveMode.unknownExercise'))}
              </Text>
              <Text style={styles.exerciseMuscleGroup} numberOfLines={1}>
                {(() => {
                  const muscleGroupKey = currentExerciseTemplate.muscleGroupKey || currentExerciseTemplate.muscleGroup || 'Unknown';
                  if (muscleGroupKey === 'Unknown') return muscleGroupKey;
                  if (muscleGroupKey.startsWith('muscleGroups.')) {
                    const translatedName = t(muscleGroupKey);
                    return translatedName === muscleGroupKey ? muscleGroupKey.replace('muscleGroups.', '') : translatedName;
                  }
                  const translationKey = `muscleGroups.${muscleGroupKey}`;
                  const translatedName = t(translationKey);
                  return translatedName === translationKey ? muscleGroupKey : translatedName;
                })()}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.navIconButton,
                currentExerciseIndex === totalExercises - 1 && styles.navIconButtonDisabled
              ]}
              onPress={handleNextExercise}
              disabled={currentExerciseIndex === totalExercises - 1}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={currentExerciseIndex === totalExercises - 1 ? theme.textSecondary : theme.primaryColor} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Rest Time Control - Single Line */}
          <View style={styles.restTimeControl}>
            <Text style={styles.restTimeLabelInline}>
              {t('liveMode.rest') || 'Rest:'}
          </Text>
            <View style={styles.restTimeControls}>
              <TouchableOpacity
                style={[
                  styles.restTimeButton,
                  effectiveRestTime <= 0 && styles.restTimeButtonDisabled,
                ]}
                onPress={() => {
                  const newTime = Math.max(0, effectiveRestTime - 30);
                  updateCurrentExerciseRestTime(newTime);
                }}
                disabled={effectiveRestTime <= 0}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="minus" 
                  size={14} 
                  color={effectiveRestTime <= 0 ? theme.textSecondary : theme.primaryColor} 
                />
              </TouchableOpacity>
              
              <View style={styles.restTimeValueContainer}>
                <Text style={styles.restTimeValue}>{effectiveRestTime}s</Text>
              </View>
              
              <TouchableOpacity
                style={styles.restTimeButton}
                onPress={() => {
                  const newTime = effectiveRestTime + 30;
                  updateCurrentExerciseRestTime(newTime);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="plus" size={14} color={theme.primaryColor} />
              </TouchableOpacity>
            </View>
          </View>
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

      {/* Custom Alert */}
      {renderAlert()}

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddExerciseModal(false);
          setSearchQuery('');
          setSearchResults([]);
        }}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.backgroundColor }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {t('liveMode.addExercise') || 'Add Exercise'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddExerciseModal(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={t('liveMode.searchExercises') || 'Search exercises...'}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={handleSearchExercises}
              autoFocus
            />
            {isSearching && (
              <ActivityIndicator size="small" color={theme.primaryColor} style={styles.searchLoader} />
            )}
            {!isSearching && searchQuery && (
              <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
            )}
          </View>

          {/* Search results */}
          {searchQuery ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => `search-${item.id || index}`}
              renderItem={renderExerciseResult}
              ListEmptyComponent={
                !isSearching ? (
                  <View style={styles.emptySearchContainer}>
                    <Text style={styles.emptySearchText}>
                      {t('liveMode.noSearchResults') || 'No exercises found'}
                    </Text>
                  </View>
                ) : null
              }
              style={styles.searchResultsList}
            />
          ) : (
            <View style={styles.emptySearchContainer}>
              <Text style={styles.emptySearchText}>
                {t('liveMode.searchHint') || 'Type to search for exercises...'}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
    backgroundColor: '#f0f2f5',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  editButton: {
    padding: 6,
  },
  modeIndicator: {
    backgroundColor: theme.primaryColor,
    paddingVertical: 4,
    alignItems: 'center',
  },
  modeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
  exerciseHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.cardBackground || '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor || '#e8e8e8',
    marginBottom: 8,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  navIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.primaryColor + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconButtonDisabled: {
    opacity: 0.3,
  },
  exerciseTitleCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  exerciseName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },
  exerciseMuscleGroup: {
    fontSize: 12,
    color: theme.textSecondary || '#888',
    fontWeight: '500',
    textAlign: 'center',
  },
  restTimeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.borderColor || '#e8e8e8',
  },
  restTimeLabelInline: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary || '#888',
    marginRight: 4,
  },
  restTimeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.primaryColor ? theme.primaryColor + '10' : 'rgba(0, 122, 255, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  restTimeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.cardBackground || '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.primaryColor || '#007AFF',
  },
  restTimeButtonDisabled: {
    opacity: 0.4,
    borderColor: theme.borderColor || '#e8e8e8',
  },
  restTimeValueContainer: {
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restTimeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textPrimary || '#000',
  },
  bottomActions: {
    padding: 12,
    backgroundColor: theme.cardBackground || '#fff',
    borderTopWidth: 1,
    borderTopColor: theme.borderColor || '#e8e8e8',
  },
  finishButton: {
    backgroundColor: '#ccc',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  finishButtonActive: {
    backgroundColor: theme.primaryColor,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: theme.errorColor,
    textAlign: 'center',
    marginTop: 50,
  },
  // Add Exercise Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.backgroundColor,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.textPrimary,
  },
  searchLoader: {
    marginLeft: 10,
  },
  searchResultsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseResultItem: {
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  exerciseResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  exerciseResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseResultIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseResultInfo: {
    flex: 1,
  },
  exerciseResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  exerciseResultDetails: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  emptySearchContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearchText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  // Empty workout state styles
  emptyWorkoutContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyWorkoutText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyWorkoutSubtext: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryColor,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },
  addExerciseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LiveModeScreen;

