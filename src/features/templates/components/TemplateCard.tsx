/**
 * TemplateCard Component
 * 範本卡片組件
 * 
 * Displays a single template card with actions
 * 顯示單個範本卡片及其操作
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
            <View style={[styles.difficultyBadge, getDifficultyColor(template.difficultyKey, template.difficulty)]}>
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
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="pencil-outline" 
                  size={20} 
                  color={theme.textPrimary} 
                />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons 
                  name="trash-can-outline" 
                  size={20} 
                  color={theme.textSecondary} 
                />
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
            <Text style={styles.infoValue}>
              {template.estimatedTime} {t('templates.min') || 'min'}
            </Text>
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
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons 
            name="content-copy" 
            size={16} 
            color="#FFFFFF" 
          />
          <Text style={styles.copyButtonText}>{t('templates.copyTemplate')}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

/**
 * Get difficulty badge color
 * 獲取難度標籤顏色
 * 
 * Enhanced matching logic with case-insensitive comparison
 * 增強的匹配邏輯，支持大小寫不敏感比較
 */
const getDifficultyColor = (
  difficultyKey?: string,
  difficulty?: WorkoutTemplate['difficulty']
): { backgroundColor: string } => {
  // Extract difficulty level from key or use direct value
  // 從 key 中提取難度等級或使用直接值
  let level = '';
  
  if (difficultyKey) {
    // Extract from key like "difficulties.Beginner" or "difficulties.Intermediate"
    // 從類似 "difficulties.Beginner" 或 "difficulties.Intermediate" 的 key 中提取
    const parts = difficultyKey.split('.');
    level = parts[parts.length - 1] || '';
  } else if (difficulty) {
    level = difficulty;
  }
  
  // Convert to lowercase for case-insensitive comparison
  // 統一轉為小寫以進行大小寫不敏感比較
  const normalizedLevel = (level || '').toLowerCase().trim();
  
  // Match with enhanced logic - check in order of specificity
  // 增強的匹配邏輯 - 按特定性順序檢查
  
  // Beginner (初級) - Green
  // Check for beginner first
  if (normalizedLevel === 'beginner' || 
      normalizedLevel.includes('beginner') || 
      normalizedLevel.includes('novice') || 
      normalizedLevel === '初級' ||
      normalizedLevel.includes('初級')) {
    return { backgroundColor: '#4CAF50' }; // Green - 綠色
  }
  
  // Advanced (高級) - Red
  // Check for advanced before intermediate to avoid false matches
  // 先檢查 advanced 避免誤匹配
  if (normalizedLevel === 'advanced' || 
      normalizedLevel.includes('advanced') || 
      normalizedLevel.includes('expert') || 
      normalizedLevel === '高級' ||
      normalizedLevel.includes('高級')) {
    return { backgroundColor: '#F44336' }; // Red - 紅色
  }
  
  // Intermediate (中級) - Orange
  // Check intermediate last
  if (normalizedLevel === 'intermediate' || 
      normalizedLevel.includes('intermediate') || 
      normalizedLevel === '中級' ||
      normalizedLevel.includes('中級')) {
    return { backgroundColor: '#FF9800' }; // Orange - 橙色
  }
  
  // Default: Grey for unknown difficulty
  // 預設：未知難度顯示灰色
  return { backgroundColor: '#9E9E9E' };
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
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    copyButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: 'bold',
    },
  });

export default TemplateCard;

