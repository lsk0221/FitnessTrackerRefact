/**
 * Templates Screen
 * 範本畫面
 * 
 * Main screen for browsing and managing workout templates
 * 瀏覽和管理訓練範本的主畫面
 */

import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import ScreenHeader from '../../../shared/components/ScreenHeader';
import { useTemplates } from '../hooks/useTemplates';
import { WorkoutTemplate } from '../types/template.types';
import TemplateList from '../components/TemplateList';

type RootStackParamList = {
  TemplateEditor: { mode: 'create' | 'edit' | 'copy'; template?: WorkoutTemplate | null };
  WorkoutLobby: { template: WorkoutTemplate };
  [key: string]: any;
};

/**
 * Templates Screen Component
 * Displays user templates and preset templates
 */
const TemplatesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showConfirmation, showAlert: showAppAlert, renderAlert } = useAppAlert();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const styles = createStyles(theme);

  const {
    userTemplates,
    presetTemplates,
    loading,
    refreshing,
    error,
    refreshTemplates,
    deleteUserTemplate,
    loadTemplates,
  } = useTemplates({
    showAlert: (title: string, message: string) => {
      showAppAlert({ title, message });
    },
    showSuccess: (message: string) => {
      showAppAlert({
        title: t('common.success'),
        message,
      });
    },
  });

  /**
   * Reload templates when screen comes into focus
   * This ensures templates list updates when returning from editor
   */
  useFocusEffect(
    useCallback(() => {
      loadTemplates();
    }, [loadTemplates])
  );

  /**
   * Handle create new template
   */
  const handleCreateTemplate = () => {
    navigation.navigate('TemplateEditor', {
      mode: 'create',
      template: null,
    });
  };

  /**
   * Handle edit template
   */
  const handleEditTemplate = (template: WorkoutTemplate) => {
    navigation.navigate('TemplateEditor', {
      mode: 'edit',
      template,
    });
  };

  /**
   * Handle copy preset template
   */
  const handleCopyTemplate = (template: WorkoutTemplate) => {
    showConfirmation({
      title: t('templates.copyTemplate'),
      message: t('templates.copyTemplateMessage', { name: template.name }),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      onConfirm: () => {
            navigation.navigate('TemplateEditor', {
              mode: 'copy',
              template,
            });
          },
    });
  };

  /**
   * Handle delete template
   */
  const handleDeleteTemplate = (template: WorkoutTemplate) => {
    showConfirmation({
      title: t('templates.deleteTemplate'),
      message: t('templates.deleteTemplateMessage', { name: template.name }),
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      confirmStyle: 'destructive',
      onConfirm: async () => {
            await deleteUserTemplate(template.id);
          },
    });
  };

  /**
   * Handle select template (navigate to workout lobby)
   */
  const handleSelectTemplate = (template: WorkoutTemplate) => {
    navigation.navigate('WorkoutLobby', { template });
  };

  /**
   * Show error if any
   */
  React.useEffect(() => {
    if (error) {
      showAppAlert({
        title: t('common.error'),
        message: error,
      });
    }
  }, [error, t, showAppAlert]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title={t('templates.title')}
        subtitle={t('templates.subtitle')}
        rightComponent={
          <TouchableOpacity style={styles.createButton} onPress={handleCreateTemplate} activeOpacity={0.7}>
            <MaterialCommunityIcons name="plus" size={28} color={theme.primaryColor} />
          </TouchableOpacity>
        }
      />

      {/* Loading State - Show on initial load */}
      {loading && userTemplates.length === 0 && presetTemplates.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        /* Content */
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshTemplates}
              tintColor={theme.primaryColor}
            />
          }
        >
        {/* My Templates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('templates.myTemplates')}</Text>
          <TemplateList
            templates={userTemplates}
            isPreset={false}
            emptyMessage={t('templates.noUserTemplates')}
            onTemplatePress={handleSelectTemplate}
            onTemplateEdit={handleEditTemplate}
            onTemplateDelete={handleDeleteTemplate}
            theme={theme}
          />
        </View>

        {/* Preset Templates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('templates.explorePresets')}</Text>
          <TemplateList
            templates={presetTemplates}
            isPreset={true}
            emptyMessage={t('templates.noPresetTemplates')}
            onTemplatePress={handleCopyTemplate}
            onTemplateCopy={handleCopyTemplate}
            theme={theme}
          />
        </View>
      </ScrollView>
      )}
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
      backgroundColor: theme.backgroundColor,
    },
    createButton: {
      padding: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: theme.textSecondary,
    },
  });

export default TemplatesScreen;

