/**
 * Template Editor Screen
 * 範本編輯器畫面
 * 
 * Screen for creating and editing workout templates
 * 用於創建和編輯訓練範本的畫面
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useTemplateEditor } from '../hooks/useTemplateEditor';
import { WorkoutTemplate, EditorMode } from '../types/template.types';
import TemplateEditorForm from '../components/TemplateEditorForm';
import ExerciseSelector from '../components/ExerciseSelector';

type RootStackParamList = {
  TemplateEditor: {
    mode: EditorMode;
    template?: WorkoutTemplate | null;
  };
  Templates: undefined;
  [key: string]: any;
};

type TemplateEditorScreenRouteProp = RouteProp<RootStackParamList, 'TemplateEditor'>;

/**
 * Template Editor Screen Component
 * Handles template creation and editing
 */
const TemplateEditorScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<TemplateEditorScreenRouteProp>();
  const styles = createStyles(theme);

  const { mode = 'create', template = null } = route.params || {};

  const {
    // Template state
    templateName,
    templateDescription,
    exercises,

    // Exercise library state
    availableExercises,
    showExerciseSelector,
    exerciseSearchQuery,

    // UI state
    loading,
    saving,

    // Template actions
    setTemplateName,
    setTemplateDescription,

    // Exercise actions
    addExercise,
    addMultipleExercises,
    removeExercise,
    updateExercise,

    // Exercise library actions
    loadAvailableExercises,
    searchExercises,
    createCustomExercise,
    setShowExerciseSelector,

    // Save action
    saveTemplate,

    // Change detection
    hasUnsavedChanges,
  } = useTemplateEditor({
    mode,
    templateId: template?.id,
    initialTemplate: template,
  });

  /**
   * Get screen title based on mode
   */
  const getTitle = () => {
    switch (mode) {
      case 'create':
        return t('templateEditor.createTemplate');
      case 'edit':
        return t('templateEditor.editTemplate');
      case 'copy':
        return t('templateEditor.copyTemplate');
      default:
        return t('templateEditor.title');
    }
  };

  /**
   * Handle save template
   */
  const handleSaveTemplate = async () => {
    const result = await saveTemplate();
    if (result.success) {
      // Navigate back to templates screen
      navigation.goBack();
    }
  };

  /**
   * Handle back press with unsaved changes warning
   */
  const handleBackPress = () => {
    // Check if there are actual unsaved changes
    if (hasUnsavedChanges()) {
      Alert.alert(
        t('templateEditor.unsavedChanges'),
        t('templateEditor.unsavedChangesMessage'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.discard'),
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      // No changes, go back directly
      navigation.goBack();
    }
  };

  /**
   * Handle add exercise button press
   */
  const handleAddExercisePress = async () => {
    setShowExerciseSelector(true);
    await loadAvailableExercises();
  };

  /**
   * Show loading state
   */
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{getTitle()}</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSaveTemplate}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.content}>
        <TemplateEditorForm
          templateName={templateName}
          templateDescription={templateDescription}
          exercises={exercises}
          onNameChange={setTemplateName}
          onDescriptionChange={setTemplateDescription}
          onAddExercisePress={handleAddExercisePress}
          onRemoveExercise={removeExercise}
          onUpdateExercise={updateExercise}
          theme={theme}
        />
      </View>

      {/* Exercise Selector Modal */}
        <ExerciseSelector
          visible={showExerciseSelector}
          onClose={() => setShowExerciseSelector(false)}
          onSelectExercise={(exercise) => {
            addExercise(exercise);
          }}
          onConfirmSelection={(selectedExercises) => {
            addMultipleExercises(selectedExercises);
          }}
          onCreateCustomExercise={createCustomExercise}
          exercises={availableExercises}
          searchQuery={exerciseSearchQuery}
          onSearchChange={searchExercises}
          onLoadExercises={loadAvailableExercises}
          theme={theme}
        />
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
      backgroundColor: theme.backgroundColor,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.textSecondary,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: theme.cardBackground,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    backButton: {
      padding: 4,
      minWidth: 60,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.primaryColor,
      fontWeight: '600',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      flex: 1,
      textAlign: 'center',
    },
    saveButton: {
      backgroundColor: theme.primaryColor,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      minWidth: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    content: {
      flex: 1,
      padding: 20,
    },
  });

export default TemplateEditorScreen;

