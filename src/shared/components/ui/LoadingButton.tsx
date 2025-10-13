/**
 * Loading Button Component
 * 載入按鈕組件
 * 
 * A button component with built-in loading state management
 * 內建載入狀態管理的按鈕組件
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View
} from 'react-native';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loadingText?: string;
  testID?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  style,
  textStyle,
  loadingText,
  testID
}) => {
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isDisabled ? 0.6 : 1,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 32 },
      medium: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      large: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: '#007AFF',
      },
      secondary: {
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#C7C7CC',
      },
      danger: {
        backgroundColor: '#FF3B30',
      },
    };

    // Width styles
    const widthStyle: ViewStyle = fullWidth ? { width: '100%' } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...widthStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size text styles
    const sizeTextStyles: Record<string, TextStyle> = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    };

    // Variant text styles
    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#007AFF' },
      danger: { color: '#FFFFFF' },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  const getLoadingColor = (): string => {
    const colorMap: Record<string, string> = {
      primary: '#FFFFFF',
      secondary: '#007AFF',
      danger: '#FFFFFF',
    };
    return colorMap[variant];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      activeOpacity={0.8}
    >
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={getLoadingColor()}
            style={styles.loadingIndicator}
          />
        </View>
      )}
      <Text style={getTextStyle()}>
        {loading ? (loadingText || 'Loading...') : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    marginRight: 8,
  },
  loadingIndicator: {
    // Additional loading indicator styles if needed
  },
});

export default LoadingButton;
