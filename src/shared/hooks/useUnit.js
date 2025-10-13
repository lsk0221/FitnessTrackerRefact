/**
 * 單位管理 Hook
 * Unit Management Hook
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, UNIT_CONFIG, convertWeight } from '../constants';
import { formatWeight as formatWeightUtil } from '../services/utils/weightFormatter';
import { useTranslation } from 'react-i18next';

/**
 * 單位管理 Hook
 * @returns {Object} 單位相關的狀態和方法
 */
export const useUnit = () => {
  const [currentUnit, setCurrentUnit] = useState('kg');
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  /**
   * 載入單位偏好設定
   */
  const loadUnitPreference = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.UNIT_PREFERENCE);
      if (stored) {
        setCurrentUnit(stored);
      } else {
        // 預設為 kg
        setCurrentUnit('kg');
      }
    } catch (error) {
      console.error('載入單位偏好失敗:', error);
      setCurrentUnit('kg');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 保存單位偏好設定
   */
  const saveUnitPreference = useCallback(async (unit) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.UNIT_PREFERENCE, unit);
      setCurrentUnit(unit);
    } catch (error) {
      console.error('保存單位偏好失敗:', error);
      throw error; // 重新拋出錯誤以便上層處理
    }
  }, []);

  /**
   * 轉換重量數值
   */
  const convertWeightValue = useCallback((weight, fromUnit = 'kg') => {
    if (!weight || isNaN(weight)) return 0;
    return convertWeight(weight, fromUnit, currentUnit);
  }, [currentUnit]);

  /**
   * 格式化重量顯示
   */
  const formatWeight = useCallback((weight, fromUnit = 'kg') => {
    const convertedWeight = convertWeightValue(weight, fromUnit);
    // 使用新的格式化工具，只返回數值
    const formattedWeight = formatWeightUtil(convertedWeight, currentUnit);
    return formattedWeight;
  }, [currentUnit, convertWeightValue]);

  /**
   * 獲取當前單位標籤
   */
  const getCurrentUnitLabel = useCallback(() => {
    return t(`units.${currentUnit}`);
  }, [currentUnit, t]);

  /**
   * 獲取可用單位選項
   */
  const getUnitOptions = useCallback(() => {
    return Object.values(UNIT_CONFIG).map(unit => ({
      ...unit,
      label: t(`units.${unit.name}`)
    }));
  }, [t]);

  // 初始化載入單位偏好
  useEffect(() => {
    loadUnitPreference();
  }, [loadUnitPreference]);

  return {
    currentUnit,
    setCurrentUnit,
    loading,
    saveUnitPreference,
    convertWeightValue,
    formatWeight,
    getCurrentUnitLabel,
    getUnitOptions
  };
};
