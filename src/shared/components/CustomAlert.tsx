/**
 * Custom Alert Component
 * 自定義提示框組件
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  StyleSheet,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  theme: {
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    primaryColor: string;
    borderColor: string;
    errorColor?: string;
  };
  onClose: () => void;
  mode?: 'alert' | 'actionsheet';
  cancelText?: string;
}

/**
 * Custom Alert Component
 * 自定義提示框組件
 */
const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [],
  theme,
  onClose,
  mode = 'alert',
  cancelText = 'Cancel',
}) => {
  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onClose();
  };

  // Determine if this is an options menu (ActionSheet mode) or regular alert
  const isOptionsMenu = mode === 'actionsheet' || (buttons.length > 2 && !message);
  
  // Separate regular buttons from cancel button
  const regularButtons = buttons.filter((btn) => btn.style !== 'cancel');
  const cancelButton = buttons.find((btn) => btn.style === 'cancel');
  
  // For options menu, build the complete list with cancel button at the end
  const allOptionsButtons = isOptionsMenu
    ? cancelButton
      ? [...regularButtons, cancelButton]
      : regularButtons
    : [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          {/* Title */}
          {title && (
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {title}
            </Text>
          )}

          {/* Message */}
          {message && (
            <Text style={[styles.message, { color: theme.textSecondary }]}>
              {message}
            </Text>
          )}

          {/* Options Menu: Vertical list */}
          {isOptionsMenu ? (
            <View style={styles.optionsContainer}>
              {allOptionsButtons.length > 0 && (
                <>
                  {/* Regular options (excluding cancel) */}
                  {regularButtons.map((button, index) => {
                    const isDestructive = button.style === 'destructive';
                    const isLastRegular = index === regularButtons.length - 1;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: theme.cardBackground,
                            borderBottomWidth: !isLastRegular || cancelButton ? 1 : 0,
                            borderBottomColor: theme.borderColor,
                            marginTop: index === 0 ? 0 : 0,
                          },
                        ]}
                        onPress={() => handleButtonPress(button)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionButtonText,
                            {
                              color: isDestructive
                                ? theme.errorColor || '#FF3B30'
                                : theme.textPrimary,
                              fontWeight: '600',
                            },
                          ]}
                        >
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  
                  {/* Cancel button with visual separation */}
                  {cancelButton && (
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        styles.cancelOptionButton,
                        {
                          backgroundColor: theme.cardBackground,
                          marginTop: regularButtons.length > 0 ? 12 : 0,
                        },
                      ]}
                      onPress={() => handleButtonPress(cancelButton)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          { color: theme.textPrimary },
                        ]}
                      >
                        {cancelButton.text}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              
              {/* If cancelText is provided separately (for backward compatibility) */}
              {cancelText && !cancelButton && allOptionsButtons.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    styles.cancelOptionButton,
                    {
                      backgroundColor: theme.cardBackground,
                      marginTop: 12,
                    },
                  ]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {cancelText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* Regular Alert: Horizontal buttons */
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    {
                      backgroundColor:
                        button.style === 'cancel'
                          ? theme.borderColor
                          : button.style === 'destructive'
                          ? theme.errorColor || '#FF3B30'
                          : theme.primaryColor,
                      marginLeft: index > 0 ? 10 : 0,
                    },
                  ]}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      {
                        color: '#ffffff',
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: screenWidth - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Options Menu styles (centered vertical list)
  optionsContainer: {
    width: '100%',
    marginTop: 8,
  },
  optionButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    borderRadius: 8,
  },
  optionButtonText: {
    fontSize: 17,
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelOptionButton: {
    marginTop: 12,
    borderRadius: 8,
  },
});

export default CustomAlert;

