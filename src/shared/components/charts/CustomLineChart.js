/**
 * 自定義折線圖組件
 * Custom Line Chart Component
 */

import React, { useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import { CHART_CONFIG, convertWeight } from '../../constants';
import { formatWeight } from '../../services/utils/weightFormatter';
import PropTypes from 'prop-types';

const { width: screenWidth } = Dimensions.get('window');

/**
 * 自定義折線圖組件
 * @param {Object} props - 組件屬性
 * @param {Array} props.data - 圖表數據
 * @param {number} props.width - 圖表寬度
 * @param {number} props.height - 圖表高度
 * @param {Object} props.theme - 主題配置
 * @param {number} props.targetWeight - 目標重量
 * @param {string} props.chartType - 圖表類型：'weight' 或 'volume'
 * @param {string} props.currentUnit - 當前單位：'kg' 或 'lb'
 * @returns {JSX.Element} 折線圖組件
 */
const CustomLineChart = ({ data, width, height, theme, targetWeight = 0, chartType = 'weight', currentUnit = 'kg' }) => {
  const { t } = useTranslation();
  // 互動狀態
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedX, setSelectedX] = useState(null);

  // 如果沒有數據，顯示空狀態
  if (!data || data.length === 0) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <SvgText
          x={width / 2}
          y={height / 2}
          fontSize="16"
          fill={theme.textSecondary}
          textAnchor="middle"
        >
          {t('progress.noData')}
        </SvgText>
      </View>
    );
  }

  // 圖表配置
  const padding = CHART_CONFIG.PADDING;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 計算數據範圍
  const values = data.map(d => chartType === 'volume' ? d.volume : d.weight).filter(v => v > 0 && !isNaN(v));
  
  if (values.length === 0) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <SvgText
          x={width / 2}
          y={height / 2}
          fontSize="16"
          fill={theme.textSecondary}
          textAnchor="middle"
        >
          {t('progress.noValidData')}
        </SvgText>
      </View>
    );
  }

  // 計算數據範圍，包含目標重量
  let minWeight = Math.min(...values);
  let maxWeight = Math.max(...values);
  
  // 如果有目標重量，將其包含在範圍內
  if (targetWeight > 0) {
    minWeight = Math.min(minWeight, targetWeight);
    maxWeight = Math.max(maxWeight, targetWeight);
  }
  
  // 確保最小範圍（重量模式為 20kg，用量模式為最大值的 20%）
  const minRange = chartType === 'weight' ? 20 : Math.max(20, maxWeight * 0.2);
  const currentRange = maxWeight - minWeight;
  
  if (currentRange < minRange) {
    const center = (minWeight + maxWeight) / 2;
    minWeight = Math.max(0, center - minRange / 2);
    maxWeight = center + minRange / 2;
  }
  
  const weightRange = maxWeight - minWeight;
  const weightPadding = weightRange * 0.1 || 1; // 防止 weightRange 為 0

  /**
   * 處理觸摸事件
   * @param {Object} event - 觸摸事件
   */
  const handleTouch = (event) => {
    const { locationX } = event.nativeEvent;
    const padding = CHART_CONFIG.PADDING;
    const chartWidth = width - padding.left - padding.right;
    
    // 計算觸摸位置在圖表中的相對位置
    const relativeX = locationX - padding.left;
    const ratio = relativeX / chartWidth;
    
    if (ratio >= 0 && ratio <= 1) {
      // 找到最接近的數據點
      let closestPoint = null;
      let minDistance = Infinity;
      
      data.forEach((point) => {
        const pointX = getX(point.date);
        const distance = Math.abs(pointX - locationX);
        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });
      
      if (closestPoint) {
        setSelectedPoint(closestPoint);
        setSelectedX(getX(closestPoint.date));
      }
    }
  };

  /**
   * 清除選擇
   */
  const clearSelection = () => {
    setSelectedPoint(null);
    setSelectedX(null);
  };

  /**
   * 計算 X 軸位置（基於日期）
   * @param {string} dateString - 日期字符串
   * @returns {number} X 軸位置
   */
  const getX = (dateString) => {
    if (data.length === 1) {
      return padding.left + chartWidth / 2; // 單個點時居中
    }
    
    // 計算日期範圍
    const dates = data.map(point => new Date(point.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // 計算當前日期在日期範圍中的比例
    const currentDate = new Date(dateString);
    const totalTimeRange = maxDate.getTime() - minDate.getTime();
    const currentTimeOffset = currentDate.getTime() - minDate.getTime();
    
    // 如果日期範圍為 0（同一天），居中顯示
    if (totalTimeRange === 0) {
      return padding.left + chartWidth / 2;
    }
    
    const timeRatio = currentTimeOffset / totalTimeRange;
    
    // 為左右兩端預留點的半徑空間
    const pointRadius = CHART_CONFIG.POINT_RADIUS;
    const availableWidth = chartWidth - (pointRadius * 2);
    const x = padding.left + pointRadius + timeRatio * availableWidth;
    
    return isNaN(x) ? padding.left + pointRadius : x;
  };

  /**
   * 計算 Y 軸位置
   * @param {number} value - 數值（重量或用量）
   * @returns {number} Y 軸位置
   */
  const getY = (value) => {
    if (isNaN(value) || value <= 0) return padding.top + chartHeight;
    // 使用帶 padding 的數值範圍，為折線上下預留空間
    const chartMinValue = minWeight - weightPadding;
    const chartMaxValue = maxWeight + weightPadding;
    const y = padding.top + chartHeight - ((value - chartMinValue) / (chartMaxValue - chartMinValue)) * chartHeight;
    return isNaN(y) ? padding.top + chartHeight : y;
  };

  // 生成折線路徑
  const pathData = data.map((point, index) => {
    const x = getX(point.date);
    const y = getY(chartType === 'volume' ? point.volume : point.weight);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // 生成數據點
  const dataPoints = data.map((point, index) => {
    const x = getX(point.date);
    const y = getY(chartType === 'volume' ? point.volume : point.weight);
    if (isNaN(x) || isNaN(y)) return null;
    
    return (
      <Circle
        key={index}
        cx={x}
        cy={y}
        r={CHART_CONFIG.POINT_RADIUS}
        fill={theme.primaryColor}
        stroke={theme.primaryColor}
        strokeWidth={CHART_CONFIG.LINE_WIDTH}
      />
    );
  });

  // 生成 Y 軸標籤
  const yAxisLabels = [0, 0.5, 1].map((ratio, index) => {
    // 使用調整後的重量範圍（包含目標重量和最小範圍）
    const weight = maxWeight - ratio * (maxWeight - minWeight);
    
    // 為 Y 軸標籤預留空間，不碰到折線圖邊框
    const labelPadding = CHART_CONFIG.LABEL_PADDING;
    let y;
    if (ratio === 0) {
      // 最大值：向下縮
      y = padding.top + labelPadding;
    } else if (ratio === 1) {
      // 最小值：向上縮
      y = padding.top + chartHeight - labelPadding;
    } else {
      // 中間值：保持居中
      y = padding.top + ratio * chartHeight;
    }
    
    if (isNaN(weight) || isNaN(y) || weight < 0) return null;
    
    return (
      <SvgText
        key={index}
        x={5}
        y={y}
        fontSize={CHART_CONFIG.FONT_SIZE.Y_AXIS}
        fill={theme.textSecondary}
        textAnchor="start"
      >
        {(() => {
          // 折線圖 Y 軸直接取值至整數
          // 注意：傳入的數據已經是正確的單位，不需要再次轉換
          const roundedWeight = Math.round(weight);
          return `${roundedWeight}${chartType === 'volume' ? '' : currentUnit}`;
        })()}
      </SvgText>
    );
  });

  // 生成 X 軸標籤
  const xAxisLabels = (() => {
    if (data.length === 0) return [];
    
    // 計算日期範圍
    const dates = data.map(point => new Date(point.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    // 計算中間日期（基於日期範圍，不是數據點）
    const middleDate = new Date((minDate.getTime() + maxDate.getTime()) / 2);
    
    const labels = [];
    
    // 左端標籤（最早日期）
    const leftX = padding.left + 12;
    const leftLabel = `${minDate.getFullYear()}/${String(minDate.getMonth() + 1).padStart(2, '0')}/${String(minDate.getDate()).padStart(2, '0')}`;
    labels.push(
      <SvgText
        key="left"
        x={leftX}
        y={height - 10}
        fontSize={CHART_CONFIG.FONT_SIZE.X_AXIS}
        fill={theme.textSecondary}
        textAnchor="start"
      >
        {leftLabel}
      </SvgText>
    );
    
    // 中間標籤（日期範圍的中間點）
    if (data.length > 2) {
      const middleX = padding.left + chartWidth / 2;
      const middleLabel = `${middleDate.getFullYear()}/${String(middleDate.getMonth() + 1).padStart(2, '0')}/${String(middleDate.getDate()).padStart(2, '0')}`;
      labels.push(
        <SvgText
          key="middle"
          x={middleX}
          y={height - 10}
          fontSize={CHART_CONFIG.FONT_SIZE.X_AXIS}
          fill={theme.textSecondary}
          textAnchor="middle"
        >
          {middleLabel}
        </SvgText>
      );
    }
    
    // 右端標籤（最晚日期）
    const rightX = padding.left + chartWidth - 12;
    const rightLabel = `${maxDate.getFullYear()}/${String(maxDate.getMonth() + 1).padStart(2, '0')}/${String(maxDate.getDate()).padStart(2, '0')}`;
    labels.push(
      <SvgText
        key="right"
        x={rightX}
        y={height - 10}
        fontSize={CHART_CONFIG.FONT_SIZE.X_AXIS}
        fill={theme.textSecondary}
        textAnchor="end"
      >
        {rightLabel}
      </SvgText>
    );
    
    return labels;
  })();

  return (
    <View style={{ position: 'relative' }}>
      {/* 顯示選中點的數據 */}
      {selectedPoint && (
        <View style={{
          position: 'absolute',
          top: 10,
          left: selectedX - 50,
          backgroundColor: theme.cardBackground || '#2d2d2d',
          padding: 8,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: theme.borderColor || '#404040',
          zIndex: 10,
          minWidth: 100,
          alignItems: 'center'
        }}>
          <Text style={{
            color: theme.textPrimary || '#ffffff',
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {new Date(selectedPoint.date).toLocaleDateString('zh-TW', { 
              year: 'numeric',
              month: '2-digit', 
              day: '2-digit' 
            }).replace(/\//g, '/')}
          </Text>
          <Text style={{
            color: theme.primaryColor || '#007bff',
            fontSize: 14,
            fontWeight: 'bold'
          }}>
            {(() => {
              let value = chartType === 'volume' ? selectedPoint.volume : selectedPoint.weight;
              const unit = chartType === 'volume' ? '' : (currentUnit === 'kg' ? t('units.kg') : t('units.lb'));
              
              // 注意：傳入的數據已經是正確的單位，不需要再次轉換
              
              // 根據單位格式化數值
              const formattedValue = formatWeight(value, currentUnit);
              return `${formattedValue} ${unit}`;
            })()}
          </Text>
        </View>
      )}
      
      <Svg 
        width={width} 
        height={height}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={clearSelection}
      >
        {/* 折線 */}
        <Path
          d={pathData}
          stroke={theme.primaryColor}
          strokeWidth={CHART_CONFIG.LINE_WIDTH}
          fill="none"
        />
        
        {/* 目標重量線 */}
        {targetWeight > 0 && (
          <Line
            x1={padding.left}
            y1={getY(targetWeight)}
            x2={padding.left + chartWidth}
            y2={getY(targetWeight)}
            stroke="#FF8C00"
            strokeWidth={2}
            strokeDasharray="8,4"
            opacity={0.8}
          />
        )}
        
        {/* 數據點 */}
        {dataPoints}
        
        {/* 選中的數據點（高亮顯示） */}
        {selectedPoint && (
          <Circle
            cx={selectedX}
            cy={getY(chartType === 'volume' ? selectedPoint.volume : selectedPoint.weight)}
            r={CHART_CONFIG.POINT_RADIUS + 2}
            fill={theme.primaryColor}
            stroke={theme.backgroundColor || '#ffffff'}
            strokeWidth={2}
          />
        )}
        
        {/* 垂直虛線 */}
        {selectedX && (
          <Line
            x1={selectedX}
            y1={CHART_CONFIG.PADDING.top}
            x2={selectedX}
            y2={height - CHART_CONFIG.PADDING.bottom}
            stroke={theme.primaryColor}
            strokeWidth={1}
            strokeDasharray="5,5"
            opacity={0.7}
          />
        )}
        
        {/* Y軸標籤 */}
        {yAxisLabels}
        
        {/* X軸標籤 */}
        {xAxisLabels}
      </Svg>
    </View>
  );
};

// 組件屬性驗證
CustomLineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired,
    weight: PropTypes.number.isRequired,
    volume: PropTypes.number
  })).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  theme: PropTypes.shape({
    primaryColor: PropTypes.string.isRequired,
    textSecondary: PropTypes.string.isRequired
  }).isRequired,
  targetWeight: PropTypes.number,
  chartType: PropTypes.oneOf(['weight', 'volume']),
  currentUnit: PropTypes.oneOf(['kg', 'lb'])
};

export default CustomLineChart;
