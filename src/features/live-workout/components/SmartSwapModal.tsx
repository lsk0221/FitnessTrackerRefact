/**
 * Smart Swap Modal Component
 * 智能替換模態框組件
 * 
 * Modal for replacing current exercise with a suggested alternative
 * 用建議的替代動作替換當前動作的模態框
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../../../shared/i18n';
import { useTheme } from '../../../shared/contexts/ThemeContext';
// Removed getExerciseName import - using t() function instead
import { getSmartSwapSuggestions, searchExercisesForWorkout } from '../services/liveWorkoutService';
import type { ExerciseEntry, SmartSwapSuggestion } from '../types/liveWorkout.types';

interface SmartSwapModalProps {
  visible: boolean;
  onClose: () => void;
  currentExercise: ExerciseEntry | null;
  onSelectExercise: (exercise: ExerciseEntry) => void;
}

/**
 * Smart Swap Modal Component
 * 智能替換模態框組件
 */
const SmartSwapModal: React.FC<SmartSwapModalProps> = ({
  visible,
  onClose,
  currentExercise,
  onSelectExercise,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SmartSwapSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<ExerciseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Normalize suggestions to include reason with exercise
  type ListItem = ExerciseEntry & { reason?: string };
  const listData: ListItem[] = useMemo(() => {
    return searchQuery
      ? searchResults.map(ex => ({ ...ex }))
      : suggestions.map(suggestion => ({ ...suggestion.exercise, reason: suggestion.reason }));
  }, [searchQuery, searchResults, suggestions]);

  // Load suggestions when modal opens
  useEffect(() => {
    if (visible && currentExercise) {
      loadSuggestions();
    }
  }, [visible, currentExercise]);

  /**
   * Load smart swap suggestions
   * 載入智能替換建議
   */
  const loadSuggestions = async () => {
    if (!currentExercise) return;

    setIsLoading(true);
    try {
      const result = await getSmartSwapSuggestions(currentExercise, 5);
      if (result.success && result.data) {
        setSuggestions(result.data);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search exercises
   * 搜尋動作
   */
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await searchExercisesForWorkout(query);
      if (result.success && result.data) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Failed to search exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle exercise selection
   * 處理動作選擇
   */
  const handleSelectExercise = (exercise: ExerciseEntry) => {
    onSelectExercise(exercise);
    onClose();
    setSearchQuery('');
    setSearchResults([]);
  };

  /**
   * Render exercise card
   * 渲染動作卡片
   */
  const renderExerciseCard = (exercise: ExerciseEntry, reason?: string) => {
    // 1. Get display name - Unified naming display logic
    // 獲取顯示名稱 - 統一的命名顯示邏輯
    const displayName = exercise.nameKey 
      ? t(exercise.nameKey) 
      : (exercise.exercise || exercise.name || t('liveMode.unknownExercise') || 'Unknown Exercise');

    // 2. Get muscle group name - Unified muscle group display logic
    // 獲取肌肉群名稱 - 統一的肌肉群顯示邏輯
    const muscleGroupKey = exercise.muscleGroupKey || exercise.muscleGroup || 'Unknown';
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
      style={styles.exerciseCard}
      onPress={() => handleSelectExercise(exercise)}
    >
      <View style={styles.exerciseCardContent}>
        <View style={styles.exerciseIcon}>
          <Text style={styles.exerciseIconText}>
              {displayMuscleGroup?.[0]?.toUpperCase() || 'E'}
          </Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>
              {displayName}
          </Text>
          <Text style={styles.exerciseDetails}>
              {exercise.movementPattern || t('liveMode.unknown') || 'Unknown'} / {displayMuscleGroup} / {exercise.equipment || t('liveMode.unknown') || 'Unknown'}
          </Text>
          {reason && (
            <Text style={styles.reasonText}>{reason}</Text>
          )}
        </View>
        <View style={styles.exerciseAction}>
          <Text style={styles.arrowIcon}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('liveMode.swapExercise')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('liveMode.searchExercises')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
          </View>
        ) : (
          <FlatList<ListItem>
            style={styles.content}
            data={listData}
            keyExtractor={(item, index) => `item-${index}-${item.id}`}
            renderItem={({ item }) => renderExerciseCard(item, item.reason)}
            ListHeaderComponent={() => {
              if (searchQuery) {
                return (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {t('liveMode.searchResults')}
                    </Text>
                  </View>
                );
              } else {
                return (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {t('liveMode.suggestions')}
                    </Text>
                  </View>
                );
              }
            }}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? t('liveMode.noSearchResults')
                    : t('liveMode.noSuggestions')
                  }
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderColor,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
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
  searchIcon: {
    fontSize: 16,
    color: theme.textSecondary,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  exerciseCard: {
    backgroundColor: theme.cardBackground,
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  exerciseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  exerciseIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  exerciseIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 12,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  reasonText: {
    fontSize: 12,
    color: theme.primaryColor,
    fontWeight: '500',
  },
  exerciseAction: {
    marginLeft: 10,
  },
  arrowIcon: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
  },
});

export default SmartSwapModal;

