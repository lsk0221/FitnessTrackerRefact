/**
 * ScreenHeader Component
 * 通用螢幕標題組件
 * 
 * A reusable header component for all screens with consistent Safe Area handling
 * 用於所有螢幕的可重用標題組件，具備一致的 Safe Area 處理
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface ScreenHeaderProps {
  /**
   * Main title text
   * 主標題文字
   */
  title?: string;
  
  /**
   * Subtitle text (displayed below title)
   * 副標題文字（顯示在標題下方）
   */
  subtitle?: string;
  
  /**
   * Callback when back button is pressed
   * 返回按鈕點擊回調
   */
  onBack?: () => void;
  
  /**
   * Custom component to render on the right side
   * 右側自定義組件
   */
  rightComponent?: React.ReactNode;
  
  /**
   * Custom component to render in the center (overrides title/subtitle)
   * 中間自定義組件（覆蓋標題/副標題）
   */
  centerComponent?: React.ReactNode;
  
  /**
   * Additional style for the header container
   * 標題容器的額外樣式
   */
  style?: ViewStyle;
  
  /**
   * Additional padding top (added to insets.top)
   * 額外的頂部內邊距（添加到 insets.top）
   */
  paddingTopOffset?: number;
}

/**
 * ScreenHeader Component
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightComponent,
  centerComponent,
  style,
  paddingTopOffset = 20, // 統一默認值為 20，與所有屏幕保持一致
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(theme);

  // Safety check
  if (!theme) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + paddingTopOffset },
        style,
      ]}
    >
      {/* Left: Back Button */}
      <View style={styles.leftSection}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.textPrimary}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} />
        )}
      </View>

      {/* Center: Title/Subtitle or Custom Component */}
      <View style={styles.centerSection}>
        {centerComponent ? (
          centerComponent
        ) : (
          <>
            {title && (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </>
        )}
      </View>

      {/* Right: Custom Component */}
      <View style={styles.rightSection}>
        {rightComponent || <View style={styles.rightPlaceholder} />}
      </View>
    </View>
  );
};

/**
 * Create styles
 */
const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 16, // 統一底邊距，確保底線位置一致
      backgroundColor: theme.cardBackground || '#fff',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor || '#e8e8e8',
    },
    leftSection: {
      width: 40,
      alignItems: 'flex-start',
    },
    backButton: {
      padding: 6,
    },
    backButtonPlaceholder: {
      width: 40,
    },
    centerSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      minHeight: 44, // 固定最小高度，確保標題區域高度一致
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.textPrimary,
      textAlign: 'center',
      lineHeight: 24, // 統一行高，確保文字垂直對齊一致
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary || '#888',
      marginTop: 2,
      textAlign: 'center',
      lineHeight: 18, // 統一行高
    },
    rightSection: {
      width: 40,
      alignItems: 'flex-end',
    },
    rightPlaceholder: {
      width: 40,
    },
  });

export default ScreenHeader;

