/**
 * TemplateList Component
 * 範本列表組件
 * 
 * Displays a list of templates with empty state
 * 顯示範本列表及空狀態
 */

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WorkoutTemplate } from '../types/template.types';
import TemplateCard from './TemplateCard';

interface TemplateListProps {
  templates: WorkoutTemplate[];
  isPreset?: boolean;
  emptyMessage?: string;
  onTemplatePress: (template: WorkoutTemplate) => void;
  onTemplateEdit?: (template: WorkoutTemplate) => void;
  onTemplateDelete?: (template: WorkoutTemplate) => void;
  onTemplateCopy?: (template: WorkoutTemplate) => void;
  theme: any;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
}

/**
 * Template List Component
 * Displays a list of templates or empty state
 */
const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  isPreset = false,
  emptyMessage,
  onTemplatePress,
  onTemplateEdit,
  onTemplateDelete,
  onTemplateCopy,
  theme,
  ListHeaderComponent,
  refreshing,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const styles = createStyles(theme);

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>
        {emptyMessage || t('templates.noTemplates')}
      </Text>
    </View>
  );

  /**
   * Render template item
   */
  const renderTemplateItem = ({ item }: { item: WorkoutTemplate }) => (
    <TemplateCard
      template={item}
      isPreset={isPreset}
      onPress={() => onTemplatePress(item)}
      onEdit={onTemplateEdit ? () => onTemplateEdit(item) : undefined}
      onDelete={onTemplateDelete ? () => onTemplateDelete(item) : undefined}
      onCopy={onTemplateCopy ? () => onTemplateCopy(item) : undefined}
      theme={theme}
    />
  );

  /**
   * Generate unique key for each item
   */
  const keyExtractor = (item: WorkoutTemplate, index: number) =>
    `${isPreset ? 'preset' : 'user'}-template-${item.id}-${index}`;

  return (
    <FlatList
      data={templates}
      renderItem={renderTemplateItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderEmptyState}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={[
        styles.listContent,
        templates.length === 0 && styles.emptyListContent,
      ]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

/**
 * Create styles
 */
const createStyles = (theme: any) =>
  StyleSheet.create({
    listContent: {
      paddingBottom: 8,
    },
    emptyListContent: {
      flex: 1,
      justifyContent: 'center',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 40,
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
  });

export default TemplateList;

