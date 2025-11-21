/**
 * TemplateEditorForm Component
 * 範本編輯器表單組件
 * 
 * Form for creating and editing workout templates
 * 用於創建和編輯訓練範本的表單
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { TemplateExercise } from '../types/template.types';

interface TemplateEditorFormProps {
  templateName: string;
  templateDescription: string;
  exercises: TemplateExercise[];
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onAddExercisePress: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateExercise: (exerciseId: string, updates: Partial<TemplateExercise>) => void;
  theme: any;
}

/**
 * Template Editor Form Component
 * Contains form fields and exercise list for template editing
 */
const TemplateEditorForm: React.FC<TemplateEditorFormProps> = ({
  templateName,
  templateDescription,
  exercises,
  onNameChange,
  onDescriptionChange,
  onAddExercisePress,
  onRemoveExercise,
  onUpdateExercise,
  theme,
}) => {
  const { t } = useTranslation();
  const { showConfirmation, renderAlert } = useAppAlert();
  const styles = createStyles(theme);

  /**
   * Handle remove exercise with confirmation
   */
  const handleRemoveExercise = (exerciseId: string, exerciseName: string) => {
    showConfirmation({
      title: t('templateEditor.removeExercise'),
      message: t('templateEditor.removeExerciseMessage', { name: exerciseName }),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      confirmStyle: 'destructive',
      onConfirm: () => onRemoveExercise(exerciseId),
    });
  };

  /**
   * Render exercise item
   */
  const renderExerciseItem = (exercise: TemplateExercise, index: number) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseIndex}>{index + 1}</Text>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.exercise}</Text>
          <View style={styles.exerciseDetails}>
            <Text style={styles.exerciseDetailText}>
              {exercise.muscleGroup} • {exercise.equipment}
            </Text>
            {exercise.movementPattern && (
              <Text style={styles.exerciseDetailText}>• {exercise.movementPattern}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleRemoveExercise(exercise.id, exercise.exercise)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Parameters (Editable) */}
      <View style={styles.exerciseParamsSection}>
        <Text style={styles.paramsSectionTitle}>
          {t('templateEditor.defaultParameters')}
        </Text>
        
        <View style={styles.paramInputs}>
          {/* Sets Input */}
          <View style={styles.paramInputContainer}>
            <Text style={styles.paramInputLabel}>{t('templateEditor.sets')}</Text>
            <TextInput
              style={styles.paramInput}
              value={exercise.sets?.toString() || ''}
              onChangeText={(value) => {
                // Sanitize: only allow digits
                const sanitized = value.replace(/[^0-9]/g, '');
                const numValue = sanitized === '' ? undefined : parseInt(sanitized, 10);
                onUpdateExercise(exercise.id, { sets: numValue });
              }}
              placeholder="3"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Reps Input */}
          <View style={styles.paramInputContainer}>
            <Text style={styles.paramInputLabel}>{t('templateEditor.reps')}</Text>
            <TextInput
              style={styles.paramInput}
              value={exercise.reps?.toString() || ''}
              onChangeText={(value) => {
                // Sanitize: only allow digits
                const sanitized = value.replace(/[^0-9]/g, '');
                const numValue = sanitized === '' ? undefined : parseInt(sanitized, 10);
                onUpdateExercise(exercise.id, { reps: numValue });
              }}
              placeholder="10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          {/* Weight Input */}
          <View style={styles.paramInputContainer}>
            <Text style={styles.paramInputLabel}>{t('templateEditor.weight')}</Text>
            <TextInput
              style={styles.paramInput}
              value={exercise.weight?.toString() || ''}
              onChangeText={(value) => {
                // Sanitize: allow digits and one decimal point
                let sanitized = value.replace(/[^0-9.]/g, '');
                
                // Ensure only one decimal point
                const parts = sanitized.split('.');
                if (parts.length > 2) {
                  sanitized = parts[0] + '.' + parts.slice(1).join('');
                }
                
                // Keep as string to preserve decimal point during typing
                // Will be converted to number when saving
                const stringValue = sanitized === '' ? undefined : sanitized;
                
                onUpdateExercise(exercise.id, { weight: stringValue as any });
              }}
              placeholder="80"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              maxLength={6}
            />
          </View>
        </View>

        {/* Rest Time Setting */}
        <View style={styles.restTimeContainer}>
          <Text style={styles.restTimeLabel}>
            {t('templateEditor.restTime') || 'Rest Time'}
          </Text>
          <View style={styles.restTimeControls}>
            <TouchableOpacity
              style={styles.restTimeButton}
              onPress={() => {
                const currentRestTime = exercise.restTime || 0;
                const newRestTime = Math.max(0, currentRestTime - 30);
                onUpdateExercise(exercise.id, { 
                  restTime: newRestTime > 0 ? newRestTime : undefined 
                });
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="minus" size={16} color={theme.primaryColor} />
            </TouchableOpacity>
            
            <View style={styles.restTimeValueContainer}>
              <Text style={styles.restTimeValue}>
                {exercise.restTime ? `${exercise.restTime}s` : (t('templateEditor.useGlobal') || 'Global')}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.restTimeButton}
              onPress={() => {
                const currentRestTime = exercise.restTime || 0;
                const newRestTime = currentRestTime + 30;
                onUpdateExercise(exercise.id, { restTime: newRestTime });
              }}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="plus" size={16} color={theme.primaryColor} />
            </TouchableOpacity>
          </View>
          {exercise.restTime && (
            <TouchableOpacity
              style={styles.clearRestTimeButton}
              onPress={() => {
                onUpdateExercise(exercise.id, { restTime: undefined });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearRestTimeText}>
                {t('templateEditor.useGlobal') || 'Use Global'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Template Name */}
      <View style={styles.section}>
        <Text style={styles.label}>
          {t('templateEditor.templateName')} <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={templateName}
          onChangeText={onNameChange}
          placeholder={t('templateEditor.enterTemplateName')}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      {/* Template Description */}
      <View style={styles.section}>
        <Text style={styles.label}>{t('templateEditor.templateDescription')}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={templateDescription}
          onChangeText={onDescriptionChange}
          placeholder={t('templateEditor.enterTemplateDescription')}
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Exercises Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t('templateEditor.exercises')} <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.exerciseCount}>
            {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
          </Text>
        </View>

        {/* Add Exercise Button */}
        <TouchableOpacity
          style={styles.addExerciseButton}
          onPress={onAddExercisePress}
          activeOpacity={0.7}
        >
          <Text style={styles.addExerciseButtonText}>
            + {t('templateEditor.addExercise')}
          </Text>
        </TouchableOpacity>

        {/* Exercise List */}
        {exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>{t('templateEditor.noExercises')}</Text>
            <Text style={styles.emptyHint}>{t('templateEditor.addExerciseHint')}</Text>
          </View>
        ) : (
          <View style={styles.exerciseList}>
            {exercises.map((exercise, index) => renderExerciseItem(exercise, index))}
          </View>
        )}
      </View>

      {/* Spacer at bottom */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
      {renderAlert()}
    </View>
  );
};

/**
 * Create styles
 */
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    exerciseCount: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
      marginBottom: 8,
    },
    required: {
      color: theme.errorColor || '#F44336',
    },
    input: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.textPrimary,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    addExerciseButton: {
      backgroundColor: theme.primaryColor,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 16,
    },
    addExerciseButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    exerciseList: {
      gap: 12,
    },
    exerciseCard: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    exerciseHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    exerciseIndex: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.primaryColor,
      marginRight: 12,
      marginTop: 2,
    },
    exerciseInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 6,
    },
    exerciseDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    exerciseDetailText: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    exerciseParamsSection: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    },
    paramsSectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    paramInputs: {
      flexDirection: 'row',
      gap: 8,
    },
    paramInputContainer: {
      flex: 1,
    },
    paramInputLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      marginBottom: 4,
      fontWeight: '500',
    },
    paramInput: {
      backgroundColor: theme.backgroundColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 14,
      color: theme.textPrimary,
      textAlign: 'center',
    },
    restTimeContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
    },
    restTimeLabel: {
      fontSize: 11,
      color: theme.textSecondary,
      marginBottom: 8,
      fontWeight: '500',
    },
    restTimeControls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    restTimeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.primaryColor,
    },
    restTimeValueContainer: {
      minWidth: 80,
      alignItems: 'center',
      justifyContent: 'center',
    },
    restTimeValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
      textAlign: 'center',
    },
    clearRestTimeButton: {
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignSelf: 'center',
      borderRadius: 6,
      backgroundColor: theme.backgroundColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    clearRestTimeText: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    deleteButton: {
      padding: 8,
      marginLeft: 8,
    },
    deleteButtonText: {
      fontSize: 18,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderStyle: 'dashed',
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
      marginBottom: 8,
    },
    emptyHint: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      opacity: 0.7,
    },
    bottomSpacer: {
      height: 20,
    },
  });

export default TemplateEditorForm;

