/**
 * 單位轉換確認視窗組件
 * Unit Conversion Confirmation Modal Component
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * 單位轉換確認視窗
 * @param {Object} props - 組件屬性
 * @param {boolean} props.visible - 是否顯示視窗
 * @param {string} props.fromUnit - 當前單位
 * @param {string} props.toUnit - 目標單位
 * @param {Function} props.onConfirm - 確認回調
 * @param {Function} props.onCancel - 取消回調
 * @param {Object} props.theme - 主題配置
 * @returns {JSX.Element} 單位轉換確認視窗組件
 */
const UnitConversionModal = ({ 
  visible, 
  fromUnit, 
  toUnit, 
  onConfirm, 
  onCancel, 
  theme 
}) => {
  const { t } = useTranslation();
  // 動畫值
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // 顯示動畫
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 隱藏動畫
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };


  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 24,
      width: screenWidth * 0.85,
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 10,
      },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    header: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      textAlign: 'center',
    },
    content: {
      marginBottom: 24,
    },
    warningText: {
      fontSize: 16,
      color: theme.textPrimary,
      textAlign: 'center',
      lineHeight: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: theme.backgroundColor,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    confirmButton: {
      backgroundColor: theme.primaryColor,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.textPrimary,
    },
    confirmButtonText: {
      color: '#FFFFFF',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <Animated.View 
        style={[styles.overlay, { opacity: opacityValue }]}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* 標題區域 */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.convertUnit')}</Text>
          </View>

          {/* 內容區域 */}
          <View style={styles.content}>
            <Text style={styles.warningText}>
              {t('settings.convertUnitMessage')}
            </Text>
          </View>

          {/* 按鈕區域 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {t('settings.confirmConvert')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

UnitConversionModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  fromUnit: PropTypes.string.isRequired,
  toUnit: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
};

export default UnitConversionModal;