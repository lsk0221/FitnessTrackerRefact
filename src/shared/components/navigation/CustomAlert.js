/**
 * 自定義提示框組件
 * Custom Alert Component
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated
} from 'react-native';
import PropTypes from 'prop-types';

const { width: screenWidth } = Dimensions.get('window');

/**
 * 自定義提示框組件
 * @param {Object} props - 組件屬性
 * @param {boolean} props.visible - 是否顯示
 * @param {string} props.title - 標題
 * @param {string} props.message - 訊息內容
 * @param {Array} props.buttons - 按鈕配置
 * @param {Object} props.theme - 主題配置
 * @param {Function} props.onClose - 關閉回調
 * @returns {JSX.Element} 自定義提示框組件
 */
const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  buttons = [], 
  theme, 
  onClose 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
          {/* 標題 */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {title}
          </Text>
          
          {/* 訊息內容 */}
          <Text style={[styles.message, { color: theme.textSecondary }]}>
            {message}
          </Text>
          
          {/* 按鈕區域 */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  {
                    backgroundColor: button.style === 'cancel' 
                      ? theme.borderColor 
                      : theme.primaryColor,
                    marginLeft: index > 0 ? 10 : 0
                  }
                ]}
                onPress={() => {
                  if (button.onPress) {
                    button.onPress();
                  }
                  onClose();
                }}
              >
                <Text style={[
                  styles.buttonText,
                  {
                    color: button.style === 'cancel' 
                      ? theme.textSecondary 
                      : '#ffffff'
                  }
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
};

// 組件屬性驗證
CustomAlert.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttons: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string.isRequired,
    onPress: PropTypes.func,
    style: PropTypes.oneOf(['default', 'cancel'])
  })),
  theme: PropTypes.shape({
    cardBackground: PropTypes.string.isRequired,
    textPrimary: PropTypes.string.isRequired,
    textSecondary: PropTypes.string.isRequired,
    primaryColor: PropTypes.string.isRequired,
    borderColor: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CustomAlert;
