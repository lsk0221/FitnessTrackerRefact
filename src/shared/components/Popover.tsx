/**
 * Popover Component
 * 彈出式選單組件
 * 
 * A reusable popover component that displays options near a trigger element
 * 可重用的彈出式選單組件，在觸發元素附近顯示選項
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface PopoverOption {
  text: string;
  onPress: () => void;
  isDestructive?: boolean;
  isCancel?: boolean;
}

export interface PopoverProps {
  isVisible: boolean;
  anchorRect: { x: number; y: number; width: number; height: number } | null;
  options: PopoverOption[];
  onClose: () => void;
  title?: string;
  theme: {
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    borderColor: string;
    errorColor?: string;
  };
}

/**
 * Calculate popover position based on anchor rect and screen boundaries
 * 根據錨點矩形和螢幕邊界計算彈出式選單的位置
 */
const calculatePopoverPosition = (
  anchorRect: { x: number; y: number; width: number; height: number },
  popoverWidth: number,
  popoverHeight: number
): { top: number; left: number } => {
  const padding = 8; // Padding from screen edges
  const spacing = 0; // No spacing - popover should be flush with anchor
  
  // Default: position below and align to left edge of anchor (flush)
  let top = anchorRect.y + anchorRect.height + spacing;
  let left = anchorRect.x;

  // Check if popover would overflow right edge
  if (left + popoverWidth > screenWidth - padding) {
    // Position to the left of anchor instead
    left = anchorRect.x + anchorRect.width - popoverWidth;
    
    // If still overflows, align to right edge of screen
    if (left < padding) {
      left = screenWidth - popoverWidth - padding;
    }
  }

  // Check if popover would overflow left edge
  if (left < padding) {
    left = padding;
  }

  // Check if popover would overflow bottom edge
  if (top + popoverHeight > screenHeight - padding) {
    // Position above anchor instead (flush)
    top = anchorRect.y - popoverHeight - spacing;
    
    // If still overflows, align to top edge of screen
    if (top < padding) {
      top = padding;
    }
  }

  // Ensure popover doesn't go above screen
  if (top < padding) {
    top = padding;
  }

  return { top, left };
};

/**
 * Popover Component
 * 彈出式選單組件
 */
const Popover: React.FC<PopoverProps> = ({
  isVisible,
  anchorRect,
  options,
  onClose,
  title,
  theme,
}) => {
  const [popoverLayout, setPopoverLayout] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculate position when anchorRect or popoverLayout changes
  useEffect(() => {
    if (isVisible && anchorRect && popoverLayout) {
      const calculatedPosition = calculatePopoverPosition(
        anchorRect,
        popoverLayout.width,
        popoverLayout.height
      );
      setPosition(calculatedPosition);
    }
  }, [isVisible, anchorRect, popoverLayout]);

  // Reset position when popover is hidden
  useEffect(() => {
    if (!isVisible) {
      setPosition(null);
      setPopoverLayout(null);
    }
  }, [isVisible]);

  const handleOptionPress = (option: PopoverOption) => {
    option.onPress();
    onClose();
  };

  // All options are treated equally (no special cancel handling)
  // 所有選項都同等對待（無特殊取消處理）
  const allOptions = options;

  if (!isVisible || !anchorRect) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <Pressable
        style={styles.overlay}
        onPress={onClose}
      >
        <View
          style={[
            styles.popoverContainer,
            position && {
              top: position.top,
              left: position.left,
            },
            {
              backgroundColor: theme.cardBackground,
              width: anchorRect.width, // Match anchor button width dynamically
            },
          ]}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setPopoverLayout({ width, height });
          }}
        >
          {/* Title */}
          {title && (
            <View style={[styles.titleContainer, { borderBottomColor: theme.borderColor }]}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {title}
              </Text>
            </View>
          )}

          {/* All Options (no special cancel handling) */}
          {allOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                {
                  borderBottomWidth: index < allOptions.length - 1 ? 1 : 0,
                  borderBottomColor: theme.borderColor,
                },
              ]}
              onPress={() => handleOptionPress(option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  {
                    color: option.isDestructive
                      ? theme.errorColor || '#FF3B30'
                      : theme.textPrimary,
                  },
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  popoverContainer: {
    position: 'absolute',
    // Width is set dynamically to match anchor button width
    borderRadius: 8, // Slightly smaller radius for compact look
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    overflow: 'hidden',
  },
  titleContainer: {
    paddingVertical: 8, // Reduced from 12
    paddingHorizontal: 12, // Reduced from 16
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 13, // Reduced from 14
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3, // Reduced from 0.5
  },
  option: {
    paddingVertical: 10, // Reduced from 14
    paddingHorizontal: 12, // Reduced from 16
    minHeight: 36, // Reduced from 44
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 13, // Reduced from 16
    fontWeight: '500',
    textAlign: 'left',
  },
});

export default Popover;

