/**
 * TemplateCard Component
 * 範本卡片組件
 * 
 * Displays a single template card with actions
 * 顯示單個範本卡片及其操作
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WorkoutTemplate, TemplateExercise } from '../types/template.types';

interface TemplateCardProps {
  template: WorkoutTemplate;
  isPreset?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  theme: any;
}

/**
 * Template Card Component
 * Displays template information and action buttons
 */
const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isPreset = false,
  onPress,
  onEdit,
  onDelete,
  onCopy,
  theme,
}) => {
  const { t } = useTranslation();
  const styles = createStyles(theme);

  // Parse exercises to get count
  const exerciseCount = Array.isArray(template.exercises)
    ? template.exercises.length
    : (() => {
        try {
          return typeof template.exercises === 'string'
            ? JSON.parse(template.exercises).length
            : 0;
        } catch {
          return 0;
        }
      })();

  return (
    <TouchableOpacity
      style={[styles.card, isPreset && styles.presetCard]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Preset Badge */}
      {isPreset && (
        <View style={styles.presetBadge}>
          <Text style={styles.presetBadgeText}>{t('templates.preset')}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.templateName}>
            {template.nameKey ? t(template.nameKey) : (template.name || '')}
          </Text>
          {(template.difficultyKey || template.difficulty) && (
            <View style={[styles.difficultyBadge, getDifficultyColor(template.difficulty || 'Intermediate')]}>
              <Text style={styles.difficultyText}>
                {template.difficultyKey ? t(template.difficultyKey) : (template.difficulty ? t(`difficulties.${template.difficulty}`) : '')}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons for User Templates */}
        {!isPreset && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Description */}
      {(template.descriptionKey || template.description) && (
        <Text style={styles.description} numberOfLines={2}>
          {template.descriptionKey ? t(template.descriptionKey) : (template.description || '')}
        </Text>
      )}

      {/* Info Row */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>{t('templates.exercises')}: </Text>
          <Text style={styles.infoValue}>{exerciseCount}</Text>
        </View>

        {template.estimatedTime && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('templates.estimatedTime')}: </Text>
            <Text style={styles.infoValue}>{template.estimatedTime} min</Text>
          </View>
        )}

        {(template.categoryKey || template.category) && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {template.categoryKey ? t(template.categoryKey) : (template.category ? t(`categories.${template.category}`) : '')}
            </Text>
          </View>
        )}
      </View>

      {/* Copy Button for Preset Templates */}
      {isPreset && onCopy && (
        <TouchableOpacity
          style={styles.copyButton}
          onPress={(e) => {
            e.stopPropagation();
            onCopy();
          }}
        >
          <Text style={styles.copyButtonText}>📋 {t('templates.copyTemplate')}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

/**
 * Get difficulty badge color
 */
const getDifficultyColor = (
  difficulty: WorkoutTemplate['difficulty']
): { backgroundColor: string } => {
  switch (difficulty) {
    case 'Beginner':
      return { backgroundColor: '#4CAF50' };
    case 'Intermediate':
      return { backgroundColor: '#FF9800' };
    case 'Advanced':
      return { backgroundColor: '#F44336' };
    default:
      return { backgroundColor: '#9E9E9E' };
  }
};

/**
 * Create styles
 */
const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    presetCard: {
      borderColor: theme.primaryColor,
      borderWidth: 1.5,
    },
    presetBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      backgroundColor: theme.primaryColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 1,
    },
    presetBadgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    headerLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },
    templateName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      flexShrink: 1,
    },
    difficultyBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    difficultyText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: 'bold',
    },
    actions: {
      flexDirection: 'row',
      gap: 8,
      marginLeft: 8,
    },
    actionButton: {
      padding: 4,
    },
    actionIcon: {
      fontSize: 16,
    },
    description: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    infoValue: {
      fontSize: 12,
      color: theme.textPrimary,
      fontWeight: '600',
    },
    categoryBadge: {
      backgroundColor: theme.primaryColor + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: 11,
      color: theme.primaryColor,
      fontWeight: 'bold',
    },
    copyButton: {
      marginTop: 12,
      backgroundColor: theme.primaryColor,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    copyButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: 'bold',
    },
  });

export default TemplateCard;

