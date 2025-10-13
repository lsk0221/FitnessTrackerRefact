/**
 * 重量格式化工具
 * Weight Formatting Utility
 */

import { UNIT_CONFIG } from '../../constants';
import i18n from '../../i18n';

/**
 * 格式化重量數值（只返回數值，不包含單位）
 * @param {number} weight - 重量數值
 * @param {string} unit - 單位 ('kg' 或 'lb')
 * @returns {string} 格式化後的重量數值字符串
 */
export const formatWeight = (weight, unit) => {
  if (weight === null || weight === undefined || isNaN(weight)) {
    return '0';
  }

  const numWeight = parseFloat(weight);
  
  if (unit === UNIT_CONFIG.KG) {
    // kg 顯示整數
    return Math.round(numWeight).toString();
  } else if (unit === UNIT_CONFIG.LB) {
    // lb 顯示小數點後一位
    return numWeight.toFixed(1);
  }
  
  // 默認顯示整數
  return Math.round(numWeight).toString();
};

/**
 * 格式化重量顯示（包含單位）
 * @param {number} weight - 重量數值
 * @param {string} unit - 單位 ('kg' 或 'lb')
 * @returns {string} 格式化後的重量字符串（包含單位）
 */
export const formatWeightWithUnit = (weight, unit) => {
  const formattedWeight = formatWeight(weight, unit);
  const unitLabel = unit === 'kg' ? (i18n.language === 'zh' ? '公斤' : 'kg') : (i18n.language === 'zh' ? '磅' : 'lb');
  return `${formattedWeight} ${unitLabel}`;
};

/**
 * 解析重量數值（從字符串轉換為數字）
 * @param {string} weightString - 重量字符串
 * @param {string} unit - 單位 ('kg' 或 'lb')
 * @returns {number} 解析後的重量數值
 */
export const parseWeight = (weightString, unit) => {
  if (!weightString || weightString === '') {
    return 0;
  }

  const numWeight = parseFloat(weightString);
  
  if (isNaN(numWeight)) {
    return 0;
  }

  if (unit === UNIT_CONFIG.KG) {
    // kg 返回整數
    return Math.round(numWeight);
  } else if (unit === UNIT_CONFIG.LB) {
    // lb 返回小數點後一位
    return Math.round(numWeight * 10) / 10;
  }
  
  return numWeight;
};

/**
 * 格式化重量輸入（用於輸入框）
 * @param {string} value - 輸入值
 * @param {string} unit - 單位 ('kg' 或 'lb')
 * @returns {string} 格式化後的輸入值
 */
export const formatWeightInput = (value, unit) => {
  if (!value || value === '') {
    return '';
  }

  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return '';
  }

  if (unit === UNIT_CONFIG.KG) {
    // kg 只允許整數輸入
    return Math.round(numValue).toString();
  } else if (unit === UNIT_CONFIG.LB) {
    // lb 允許小數點後一位
    return numValue.toFixed(1);
  }
  
  return value;
};
