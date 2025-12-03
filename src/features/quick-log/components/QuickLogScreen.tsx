/**
 * 快速記錄模式畫面
 * Quick Log Mode Screen
 * 
 * 功能：
 * - 快速批量記錄訓練數據
 * - 顯示上次記錄作為參考
 * - 簡化的數據輸入界面
 * - 批量保存功能
 * 
 * Based on the Quick Log Mode interface design
 * 
 * This is a presentational component - all business logic is in useQuickLog hook
 * 這是一個展示組件 - 所有業務邏輯都在 useQuickLog hook 中
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useUnit } from '../../../shared/hooks/useUnit';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { LoadingButton } from '../../../shared/components/ui/LoadingButton';
import { useQuickLog } from '../hooks/useQuickLog';
import { searchExercisesForWorkout } from '../../live-workout/services/liveWorkoutService';
import type { ExerciseEntry } from '../../live-workout/types/liveWorkout.types';
import type { WorkoutTemplate } from '../../templates/types/template.types';

interface QuickLogScreenProps {
  navigation: any;
  route: {
    params?: {
      exercises?: ExerciseEntry[];
      template?: WorkoutTemplate;
    };
  };
}

const QuickLogScreen: React.FC<QuickLogScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { currentUnit } = useUnit();
  const { showAlert, renderAlert } = useAppAlert();
  const styles = createStyles(theme);

  // 從路由參數獲取練習列表和模板
  const { exercises = [], template } = route.params || {};

  // Use Quick Log Hook - 所有業務邏輯都在這裡
  const { state, actions } = useQuickLog(exercises);
  const {
    workoutData,
    activeExercises,
    isSaving,
    error,
  } = state;

  const {
    updateSetData,
    addSet,
    removeSet,
    addNewExercise,
    saveAllWorkouts,
  } = actions;

  // Add Exercise Modal State
  // 新增動作模態框狀態
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ExerciseEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle search exercises
  // 處理搜尋動作
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

  // Handle add exercise
  // 處理添加動作
  const handleAddExercise = async (exercise: ExerciseEntry) => {
    try {
      await addNewExercise(exercise);
      setShowAddExerciseModal(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Failed to add exercise';
      // Translate common error messages
      if (errorMessage.includes('already exists')) {
        errorMessage = t('quickLog.exerciseAlreadyExists') || errorMessage;
      }
      showAlert({
        title: t('common.error') || 'Error',
        message: errorMessage,
      });
    }
  };

  // Handle save all workouts with UI feedback
  // 處理保存所有訓練，並提供 UI 反饋
  const handleSaveAllWorkouts = async () => {
    try {
      const result = await saveAllWorkouts();

      if (result.success && result.count > 0) {
        showAlert({
          title: t('quickLog.success') || 'Success',
          message: t('quickLog.savedMessage', { count: result.count }) ||
            `Saved ${result.count} workout(s)`,
          buttons: [
            {
              text: t('common.confirm') || 'OK',
              onPress: () => navigation.navigate('TemplatesMain'),
            },
          ],
        });
      } else if (result.success && result.count === 0) {
        // No data to save
        showAlert({
          title: t('quickLog.noData') || 'No Data',
          message: result.error || t('quickLog.noDataMessage') || 'No workouts to save.',
        });
      } else {
        // Save failed
        showAlert({
          title: t('common.error') || 'Error',
          message: result.error || t('quickLog.saveFailed') || 'Failed to save workouts.',
        });
      }
    } catch (err) {
      console.error('Error saving workouts:', err);
      const errorMessage = err instanceof Error ? err.message : (state.error || t('quickLog.saveFailed') || 'Failed to save workouts.');
      showAlert({
        title: t('common.error') || 'Error',
        message: errorMessage,
      });
    }
  };

  // Adjust numeric value helper
  // 調整數值輔助函數
  const adjustValue = (
    exerciseName: string,
    setIndex: number,
    field: 'reps' | 'weight',
    delta: number
  ) => {
    const data = workoutData[exerciseName];
    if (!data || !data.sets[setIndex]) return;

    const currentValue = data.sets[setIndex][field];
    const newValue = Math.max(0, currentValue + delta);
    updateSetData(exerciseName, setIndex, field, newValue);
  };

  // 渲染練習卡片
  const renderExerciseCard = (exercise: ExerciseEntry) => {
    const exerciseName = exercise.exercise || exercise.name || '';
    const data = workoutData[exerciseName];

    if (!data) return null;

    return (
      <View key={exerciseName} style={styles.exerciseCard}>
        {/* Exercise Header */}
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            <Text style={styles.lastRecord}>LAST: {data.lastRecord}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              // TODO: Implement delete exercise functionality
              showAlert({
                title: 'Delete Exercise',
                message: 'Delete functionality coming soon',
              });
            }}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color={theme.errorColor} />
          </TouchableOpacity>
        </View>

        {/* Sets Section */}
        <View style={styles.setsSection}>
          {data.sets.map((set, index) => (
            <View key={index} style={styles.setRow}>
              <View style={styles.setNumberContainer}>
                <Text style={styles.setNumber}>{index + 1}</Text>
              </View>

              {/* Reps Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reps</Text>
                <View style={styles.inputWithButtons}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustValue(exerciseName, index, 'reps', -1)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.numberInput}
                    value={set.reps.toString()}
                    onChangeText={(value) =>
                      updateSetData(exerciseName, index, 'reps', parseInt(value) || 0)
                    }
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustValue(exerciseName, index, 'reps', 1)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weight Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight ({currentUnit})</Text>
                <View style={styles.inputWithButtons}>
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustValue(exerciseName, index, 'weight', -2.5)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="minus" size={16} color={theme.primaryColor} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.numberInput}
                    value={set.weight.toString()}
                    onChangeText={(value) =>
                      updateSetData(exerciseName, index, 'weight', parseFloat(value) || 0)
                    }
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    style={styles.adjustButton}
                    onPress={() => adjustValue(exerciseName, index, 'weight', 2.5)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="plus" size={16} color={theme.primaryColor} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remove Set Button */}
              {data.sets.length > 1 && (
                <TouchableOpacity
                  style={styles.removeSetButton}
                  onPress={() => removeSet(exerciseName, index)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color={theme.errorColor} />
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Add Set Button */}
          <TouchableOpacity
            style={styles.addSetButton}
            onPress={() => addSet(exerciseName)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus-circle" size={20} color={theme.primaryColor} />
            <Text style={styles.addSetButtonText}>
              {t('quickLog.addSet') || 'Add Set'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('quickLog.title') || 'Quick Log'}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddExerciseModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={28} color={theme.primaryColor} />
          </TouchableOpacity>
        </View>

        {/* Template Name */}
        {template && (
          <View style={styles.templateHeader}>
            <Text style={styles.templateName}>
              {template.name || template.nameKey || t('quickLog.quickLogWorkout') || 'Quick Log Workout'}
            </Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={20} color={theme.errorColor} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {activeExercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={64}
                color={theme.textSecondary}
              />
              <Text style={styles.emptyText}>沒有練習項目</Text>
            </View>
          ) : (
            activeExercises.map((exercise) => renderExerciseCard(exercise))
          )}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <LoadingButton
            title="開始訓練"
            onPress={() => navigation.navigate('LiveWorkout', { exercises: activeExercises, template })}
            variant="primary"
            size="large"
            fullWidth
            style={styles.startWorkoutButton}
          />
          <LoadingButton
            title="批量保存"
            onPress={handleSaveAllWorkouts}
            loading={isSaving}
            variant="secondary"
            size="large"
            fullWidth
            loadingText="保存中..."
          />
        </View>

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
              <Text style={styles.modalTitle}>新增動作</Text>
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

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={theme.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="搜尋動作..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchExercises}
                autoFocus
              />
              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={theme.primaryColor}
                  style={styles.searchLoader}
                />
              )}
            </View>

            {/* Search Results */}
            <FlatList
              data={searchResults}
              keyExtractor={(item, index) => item.id?.toString() || `${item.exercise || item.name}-${index}`}
              renderItem={({ item }) => {
                const exerciseName = item.exercise || item.name || '';
                const isAlreadyAdded = activeExercises.some(
                  (ex) => (ex.exercise || ex.name) === exerciseName
                );

                return (
                  <TouchableOpacity
                    style={[
                      styles.exerciseResultItem,
                      isAlreadyAdded && styles.exerciseResultItemDisabled,
                    ]}
                    onPress={() => !isAlreadyAdded && handleAddExercise(item)}
                    disabled={isAlreadyAdded}
                    activeOpacity={0.7}
                  >
                    <View style={styles.exerciseResultContent}>
                      <Text style={styles.exerciseResultName}>{exerciseName}</Text>
                      {item.muscleGroup && (
                        <Text style={styles.exerciseResultMuscleGroup}>
                          {item.muscleGroup}
                        </Text>
                      )}
                    </View>
                    {isAlreadyAdded ? (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color={theme.textSecondary}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="plus-circle"
                        size={24}
                        color={theme.primaryColor}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                searchQuery.trim() ? (
                  <View style={styles.emptySearchContainer}>
                    <MaterialCommunityIcons
                      name="magnify"
                      size={48}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.emptySearchText}>
                      {isSearching ? '搜尋中...' : '沒有找到動作'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptySearchContainer}>
                    <MaterialCommunityIcons
                      name="magnify"
                      size={48}
                      color={theme.textSecondary}
                    />
                    <Text style={styles.emptySearchText}>輸入動作名稱開始搜尋</Text>
                  </View>
                )
              }
              contentContainerStyle={styles.searchResultsContainer}
            />
          </SafeAreaView>
        </Modal>
        {renderAlert()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// 樣式定義
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
      flex: 1,
      textAlign: 'center',
    },
    addButton: {
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    templateHeader: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    templateName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.primaryColor,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.errorColor + '15',
      borderLeftWidth: 3,
      borderLeftColor: theme.errorColor,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 8,
    },
    errorText: {
      fontSize: 14,
      color: theme.errorColor,
      marginLeft: 8,
      flex: 1,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: 16,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 16,
    },
    exerciseCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.shadowOpacity,
      shadowRadius: 4,
      elevation: 2,
    },
    exerciseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    lastRecord: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    deleteButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.errorColor + '15',
    },
    setsSection: {
      marginTop: 8,
    },
    setRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    setNumberContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primaryColor + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    setNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.primaryColor,
    },
    inputContainer: {
      flex: 1,
      marginRight: 8,
    },
    inputLabel: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 6,
      fontWeight: '500',
    },
    inputWithButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundColor,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.borderColor,
      overflow: 'hidden',
    },
    adjustButton: {
      padding: 8,
      backgroundColor: theme.primaryColor + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberInput: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 8,
      fontSize: 16,
      color: theme.textPrimary,
      backgroundColor: theme.cardBackground,
    },
    removeSetButton: {
      padding: 4,
      marginLeft: 8,
    },
    addSetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: theme.primaryColor + '15',
      marginTop: 8,
    },
    addSetButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.primaryColor,
      marginLeft: 8,
    },
    bottomActions: {
      padding: 16,
      backgroundColor: theme.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      gap: 12,
    },
    startWorkoutButton: {
      marginBottom: 0,
    },
    // Add Exercise Modal Styles
    modalContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
    },
    searchLoader: {
      marginLeft: 8,
    },
    searchResultsContainer: {
      padding: 16,
    },
    exerciseResultItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      marginBottom: 8,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    exerciseResultItemDisabled: {
      opacity: 0.5,
    },
    exerciseResultContent: {
      flex: 1,
    },
    exerciseResultName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    exerciseResultMuscleGroup: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    emptySearchContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptySearchText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 16,
    },
  });

export default QuickLogScreen;
