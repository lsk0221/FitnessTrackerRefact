/**
 * ExerciseSelector Component
 * 練習選擇器組件
 * 
 * Modal for selecting exercises from the library
 * 從練習庫中選擇練習的模態框
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Exercise, EQUIPMENT_TYPES } from '../../../shared/services/data/exerciseLibraryService';

interface ExerciseSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
  onConfirmSelection?: (exercises: Exercise[]) => void; // New prop for batch selection
  onCreateCustomExercise?: (exerciseName: string, muscleGroup: string, equipment: string) => Promise<void>; // Updated: now requires equipment too
  exercises: Exercise[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onLoadExercises: () => Promise<void>;
  muscleGroupsList?: string[]; // Dynamic muscle groups list (optional for backward compatibility)
  loading?: boolean;
  theme: any;
}

/**
 * Exercise Selector Component
 * Modal for browsing and selecting exercises
 */
const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  visible,
  onClose,
  onSelectExercise,
  onConfirmSelection,
  onCreateCustomExercise,
  exercises,
  searchQuery,
  onSearchChange,
  onLoadExercises,
  muscleGroupsList = [], // Default to empty array if not provided
  loading = false,
  theme,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  // State for multi-select
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  
  // State for custom exercise creation
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customExerciseName, setCustomExerciseName] = useState<string>('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');

  // Load exercises when modal opens
  useEffect(() => {
    if (visible && exercises.length === 0) {
      onLoadExercises();
    }
  }, [visible]);

  // Clear selections and custom input when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedExercises([]);
      setShowCustomInput(false);
      setCustomExerciseName('');
      setSelectedMuscleGroup('');
      setSelectedEquipment('');
    }
  }, [visible]);

  /**
   * Check if an exercise is selected
   */
  const isExerciseSelected = (exercise: Exercise): boolean => {
    return selectedExercises.some((ex) => ex.id === exercise.id);
  };

  /**
   * Toggle exercise selection
   */
  const toggleExerciseSelection = (exercise: Exercise) => {
    if (isExerciseSelected(exercise)) {
      // Remove from selection
      setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exercise.id));
    } else {
      // Add to selection
      setSelectedExercises((prev) => [...prev, exercise]);
    }
  };

  /**
   * Handle confirm button press
   */
  const handleConfirm = () => {
    if (selectedExercises.length > 0 && onConfirmSelection) {
      onConfirmSelection(selectedExercises);
      setSelectedExercises([]);
      onClose();
    }
  };

  /**
   * Handle single exercise selection (original behavior)
   */
  const handleSingleSelect = (exercise: Exercise) => {
    onSelectExercise(exercise);
    // Don't close modal, allow continued selection
  };

  /**
   * Handle custom exercise creation
   */
  const handleCreateCustom = async () => {
    if (!customExerciseName.trim()) {
      return;
    }

    if (!selectedMuscleGroup) {
      // Show alert if no muscle group selected
      alert(t('templateEditor.selectMuscleGroupRequired'));
      return;
    }

    if (!selectedEquipment) {
      // Show alert if no equipment selected
      alert(t('templateEditor.selectEquipmentRequired'));
      return;
    }

    if (onCreateCustomExercise) {
      await onCreateCustomExercise(customExerciseName.trim(), selectedMuscleGroup, selectedEquipment);
      // Clear input and hide after creation
      setCustomExerciseName('');
      setSelectedMuscleGroup('');
      setSelectedEquipment('');
      setShowCustomInput(false);
    }
  };

  /**
   * Render exercise item
   */
  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const isSelected = isExerciseSelected(item);
    
    // Get display name - use translation key if available, fallback to name
    // 獲取顯示名稱 - 優先使用翻譯鍵，否則使用名稱
    const displayName = item.nameKey 
      ? t(item.nameKey) 
      : (item.name || t('templates.unknownExercise') || 'Unknown Exercise');
    
    // Get muscle group display name
    // 獲取肌肉群顯示名稱
    const displayMuscleGroup = item.muscleGroupKey
      ? t(item.muscleGroupKey)
      : (item.muscle_group || t('templates.unknown') || 'Unknown');
    
    return (
      <TouchableOpacity
        style={[
          styles.exerciseItem,
          isSelected && styles.exerciseItemSelected,
        ]}
        onPress={() => toggleExerciseSelection(item)}
        activeOpacity={0.7}
      >
        <View style={styles.exerciseItemContent}>
          <View style={styles.exerciseNameRow}>
            <Text style={[styles.exerciseName, isSelected && styles.exerciseNameSelected]}>
              {displayName}
            </Text>
            {item.isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>
                  {t('templates.custom') || 'CUSTOM'}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.exerciseDetails}>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{displayMuscleGroup}</Text>
            </View>
            <View style={styles.detailBadge}>
              <Text style={styles.detailText}>{item.equipment}</Text>
            </View>
          </View>
          {item.movement_pattern && (
            <Text style={styles.movementPattern}>{item.movement_pattern}</Text>
          )}
        </View>
        {isSelected ? (
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        ) : (
          <Text style={styles.addIcon}>+</Text>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏋️</Text>
      <Text style={styles.emptyText}>
        {searchQuery
          ? t('templates.noExercisesFound')
          : t('templates.noExercisesAvailable')}
      </Text>
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={theme.primaryColor} />
      <Text style={styles.loadingText}>{t('common.loading')}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.title}>{t('templateEditor.addExercise')}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={t('templates.searchExercises')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => onSearchChange('')}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Custom Exercise Creation */}
        {onCreateCustomExercise && (
          <View style={styles.customExerciseContainer}>
            {!showCustomInput ? (
              <TouchableOpacity
                style={styles.addCustomButton}
                onPress={() => setShowCustomInput(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addCustomButtonText}>
                  + {t('templateEditor.createCustomExercise')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.customFormContainer}>
                {/* Exercise Name Input */}
                <View style={styles.customInputContainer}>
                  <TextInput
                    style={styles.customInput}
                    placeholder={t('templateEditor.enterExerciseName')}
                    placeholderTextColor={theme.textSecondary}
                    value={customExerciseName}
                    onChangeText={setCustomExerciseName}
                    autoFocus
                    returnKeyType="next"
                  />
                </View>

                {/* Muscle Group Selection */}
                <View style={styles.muscleGroupSection}>
                  <Text style={styles.muscleGroupLabel}>
                    {t('templateEditor.selectMuscleGroup')}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.muscleGroupScrollContent}
                  >
                    {muscleGroupsList.length > 0 ? muscleGroupsList.map((group) => (
                      <TouchableOpacity
                        key={group}
                        style={[
                          styles.muscleGroupButton,
                          selectedMuscleGroup === group && styles.muscleGroupButtonSelected,
                        ]}
                        onPress={() => setSelectedMuscleGroup(group)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.muscleGroupButtonText,
                            selectedMuscleGroup === group && styles.muscleGroupButtonTextSelected,
                          ]}
                        >
                          {group}
                        </Text>
                      </TouchableOpacity>
                    )) : (
                      <Text style={styles.muscleGroupButtonText}>
                        {t('common.loading')}...
                      </Text>
                    )}
                  </ScrollView>
                </View>

                {/* Equipment Selection */}
                <View style={styles.equipmentSection}>
                  <Text style={styles.equipmentLabel}>
                    {t('templateEditor.selectEquipment')}
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.equipmentScrollContent}
                  >
                    {EQUIPMENT_TYPES.map((equip) => (
                      <TouchableOpacity
                        key={equip}
                        style={[
                          styles.equipmentButton,
                          selectedEquipment === equip && styles.equipmentButtonSelected,
                        ]}
                        onPress={() => setSelectedEquipment(equip)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.equipmentButtonText,
                            selectedEquipment === equip && styles.equipmentButtonTextSelected,
                          ]}
                        >
                          {equip}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Action Buttons */}
                <View style={styles.customActionButtons}>
                  <TouchableOpacity
                    style={styles.cancelButtonLarge}
                    onPress={() => {
                      setShowCustomInput(false);
                      setCustomExerciseName('');
                      setSelectedMuscleGroup('');
                      setSelectedEquipment('');
                    }}
                  >
                    <Text style={styles.cancelButtonTextLarge}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.createButtonLarge,
                      (!customExerciseName.trim() || !selectedMuscleGroup || !selectedEquipment) && styles.createButtonDisabled,
                    ]}
                    onPress={handleCreateCustom}
                    disabled={!customExerciseName.trim() || !selectedMuscleGroup || !selectedEquipment}
                  >
                    <Text style={[
                      styles.createButtonTextLarge,
                      (!customExerciseName.trim() || !selectedMuscleGroup || !selectedEquipment) && styles.createButtonTextDisabled,
                    ]}>
                      {t('common.create')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Exercise List */}
        {loading ? (
          renderLoadingState()
        ) : (
          <FlatList
            data={exercises}
            renderItem={renderExerciseItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={[
              styles.listContent,
              exercises.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={true}
          />
        )}

        {/* Footer with Confirm Button */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.exerciseCount}>
              {selectedExercises.length > 0
                ? `${selectedExercises.length} ${t('templates.selected') || 'selected'}`
                : `${exercises.length} ${t('templates.exercisesAvailable')}`}
            </Text>
            {selectedExercises.length > 0 && onConfirmSelection && (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>
                  {t('common.confirm')} ({selectedExercises.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Create styles
 */
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      // paddingTop is set dynamically using insets.top in component
      paddingBottom: 20,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    closeButton: {
      padding: 8,
    },
    closeButtonText: {
      fontSize: 24,
      color: theme.textSecondary,
      fontWeight: '300',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    searchInput: {
      flex: 1,
      height: 44,
      backgroundColor: theme.backgroundColor,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    clearButton: {
      marginLeft: 8,
      padding: 8,
    },
    clearButtonText: {
      fontSize: 18,
      color: theme.textSecondary,
    },
    listContent: {
      padding: 16,
    },
    emptyListContent: {
      flex: 1,
      justifyContent: 'center',
    },
    exerciseItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.cardBackground,
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    exerciseItemSelected: {
      backgroundColor: theme.primaryColor + '15',
      borderColor: theme.primaryColor,
      borderWidth: 2,
    },
    exerciseItemContent: {
      flex: 1,
      marginRight: 12,
    },
    exerciseNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary,
      flex: 1,
    },
    exerciseNameSelected: {
      color: theme.primaryColor,
    },
    customBadge: {
      backgroundColor: theme.primaryColor,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      marginLeft: 8,
    },
    customBadgeText: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    exerciseDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 4,
    },
    detailBadge: {
      backgroundColor: theme.primaryColor + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    detailText: {
      fontSize: 11,
      color: theme.primaryColor,
      fontWeight: '600',
    },
    movementPattern: {
      fontSize: 12,
      color: theme.textSecondary,
      marginTop: 4,
    },
    addIcon: {
      fontSize: 24,
      color: theme.primaryColor,
      fontWeight: 'bold',
    },
    checkmarkContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.primaryColor,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkmark: {
      fontSize: 18,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    loadingState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      fontSize: 16,
      color: theme.textSecondary,
      marginTop: 12,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      paddingBottom: 34, // Extra padding for safe area on iOS
      backgroundColor: theme.cardBackground,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    },
    footerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    exerciseCount: {
      fontSize: 14,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    confirmButton: {
      backgroundColor: theme.primaryColor,
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    confirmButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    customExerciseContainer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    addCustomButton: {
      backgroundColor: theme.primaryColor + '15',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.primaryColor + '40',
      borderStyle: 'dashed',
    },
    addCustomButtonText: {
      color: theme.primaryColor,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    customFormContainer: {
      gap: 12,
    },
    customInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    customInput: {
      flex: 1,
      height: 44,
      backgroundColor: theme.backgroundColor,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.primaryColor,
    },
    muscleGroupSection: {
      marginTop: 4,
    },
    muscleGroupLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    muscleGroupScrollContent: {
      paddingVertical: 2,
    },
    muscleGroupButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.backgroundColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
      marginRight: 8,
    },
    muscleGroupButtonSelected: {
      backgroundColor: theme.primaryColor,
      borderColor: theme.primaryColor,
    },
    muscleGroupButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    muscleGroupButtonTextSelected: {
      color: '#FFFFFF',
    },
    equipmentSection: {
      marginTop: 4,
    },
    equipmentLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
    },
    equipmentScrollContent: {
      paddingVertical: 2,
    },
    equipmentButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: theme.backgroundColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
      marginRight: 8,
    },
    equipmentButtonSelected: {
      backgroundColor: theme.primaryColor,
      borderColor: theme.primaryColor,
    },
    equipmentButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    equipmentButtonTextSelected: {
      color: '#FFFFFF',
    },
    customActionButtons: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    cancelButtonLarge: {
      flex: 1,
      height: 44,
      backgroundColor: theme.textSecondary + '20',
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButtonTextLarge: {
      color: theme.textSecondary,
      fontSize: 15,
      fontWeight: '600',
    },
    createButtonLarge: {
      flex: 1,
      height: 44,
      backgroundColor: theme.primaryColor,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    createButtonDisabled: {
      opacity: 0.5,
    },
    createButtonTextLarge: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    createButtonTextDisabled: {
      opacity: 0.5,
    },
  });

export default ExerciseSelector;

