/**
 * Progress Chart Component
 * 進度圖表組件 - 使用 SVG 渲染折線圖
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Path, Circle, Text as SvgText, Line } from 'react-native-svg';
import { CHART_CONFIG } from '../../../shared/constants';
import { formatWeight } from '../../../shared/services/utils/weightFormatter';
import type { ChartDataPoint, ChartType } from '../types/progress.types';

interface ProgressChartProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  theme: any;
  targetWeight?: number;
  chartType?: ChartType;
  currentUnit?: string;
}

/**
 * Progress Chart Component
 * 顯示訓練進度的折線圖
 */
export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  width,
  height,
  theme,
  targetWeight = 0,
  chartType = 'weight',
  currentUnit = 'kg',
}) => {
  const { t } = useTranslation();
  const [selectedPoint, setSelectedPoint] = useState<ChartDataPoint | null>(null);
  const [selectedX, setSelectedX] = useState<number | null>(null);

  // Local rendering constants to keep this chart visually lighter
  const LINE_WIDTH = 1; // thinner line
  const POINT_RADIUS = 1.1; // smaller dots

  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          {t('progress.noData')}
        </Text>
      </View>
    );
  }

  // Chart configuration
  const padding = CHART_CONFIG.PADDING;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate data range
  const values = data
    .map(d => (chartType === 'volume' ? d.volume : d.weight))
    .filter(v => v > 0 && !isNaN(v));

  if (values.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          {t('progress.noValidData')}
        </Text>
      </View>
    );
  }

  // Calculate range including target weight
  let minWeight = Math.min(...values);
  let maxWeight = Math.max(...values);

  if (targetWeight > 0) {
    minWeight = Math.min(minWeight, targetWeight);
    maxWeight = Math.max(maxWeight, targetWeight);
  }

  // Ensure minimum range
  const minRange = chartType === 'weight' ? 20 : Math.max(20, maxWeight * 0.2);
  const currentRange = maxWeight - minWeight;

  if (currentRange < minRange) {
    const center = (minWeight + maxWeight) / 2;
    minWeight = Math.max(0, center - minRange / 2);
    maxWeight = center + minRange / 2;
  }

  const weightRange = maxWeight - minWeight;
  const weightPadding = weightRange * 0.1 || 1;

  /**
   * Calculate X position based on date
   */
  const getX = (dateString: string): number => {
    if (data.length === 1) {
      return padding.left + chartWidth / 2;
    }

    const dates = data.map(point => new Date(point.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    const currentDate = new Date(dateString);
    const totalTimeRange = maxDate.getTime() - minDate.getTime();
    const currentTimeOffset = currentDate.getTime() - minDate.getTime();

    if (totalTimeRange === 0) {
      return padding.left + chartWidth / 2;
    }

    const timeRatio = currentTimeOffset / totalTimeRange;
    const pointRadius = POINT_RADIUS;
    const availableWidth = chartWidth - pointRadius * 2;
    const x = padding.left + pointRadius + timeRatio * availableWidth;

    return isNaN(x) ? padding.left + pointRadius : x;
  };

  /**
   * Calculate Y position
   */
  const getY = (value: number): number => {
    if (isNaN(value) || value <= 0) return padding.top + chartHeight;
    const chartMinValue = minWeight - weightPadding;
    const chartMaxValue = maxWeight + weightPadding;
    const y =
      padding.top +
      chartHeight -
      ((value - chartMinValue) / (chartMaxValue - chartMinValue)) * chartHeight;
    return isNaN(y) ? padding.top + chartHeight : y;
  };

  /**
   * Handle touch events
   */
  const handleTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const relativeX = locationX - padding.left;
    const ratio = relativeX / chartWidth;

    if (ratio >= 0 && ratio <= 1) {
      let closestPoint: ChartDataPoint | null = null;
      let minDistance = Infinity;

      data.forEach(point => {
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
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedPoint(null);
    setSelectedX(null);
  };

  // Generate line path
  const pathData = data
    .map((point, index) => {
      const x = getX(point.date);
      const y = getY(chartType === 'volume' ? point.volume : point.weight);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate data points
  const dataPoints = data.map((point, index) => {
    const x = getX(point.date);
    const y = getY(chartType === 'volume' ? point.volume : point.weight);
    if (isNaN(x) || isNaN(y)) return null;

    return (
      <Circle
        key={index}
        cx={x}
        cy={y}
        r={POINT_RADIUS}
        fill={theme.primaryColor}
        stroke={theme.primaryColor}
        strokeWidth={LINE_WIDTH}
      />
    );
  });

  // Generate Y-axis labels
  const yAxisLabels = [0, 0.5, 1].map((ratio, index) => {
    const weight = maxWeight - ratio * (maxWeight - minWeight);
    const labelPadding = CHART_CONFIG.LABEL_PADDING;
    let y;
    if (ratio === 0) {
      y = padding.top + labelPadding;
    } else if (ratio === 1) {
      y = padding.top + chartHeight - labelPadding;
    } else {
      y = padding.top + ratio * chartHeight;
    }

    if (isNaN(weight) || isNaN(y) || weight < 0) return null;

    const roundedWeight = Math.round(weight);
    const label = `${roundedWeight}${chartType === 'volume' ? '' : currentUnit}`;

    return (
      <SvgText
        key={index}
        x={5}
        y={y}
        fontSize={CHART_CONFIG.FONT_SIZE.Y_AXIS}
        fill={theme.textSecondary}
        textAnchor="start"
      >
        {label}
      </SvgText>
    );
  });

  // Generate X-axis labels
  const xAxisLabels = (() => {
    if (data.length === 0) return [];

    const dates = data.map(point => new Date(point.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const middleDate = new Date((minDate.getTime() + maxDate.getTime()) / 2);

    const labels = [];

    // Left label
    const leftX = padding.left + 12;
    const leftLabel = `${minDate.getFullYear()}/${String(minDate.getMonth() + 1).padStart(2, '0')}/${String(
      minDate.getDate()
    ).padStart(2, '0')}`;
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

    // Middle label
    if (data.length > 2) {
      const middleX = padding.left + chartWidth / 2;
      const middleLabel = `${middleDate.getFullYear()}/${String(middleDate.getMonth() + 1).padStart(
        2,
        '0'
      )}/${String(middleDate.getDate()).padStart(2, '0')}`;
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

    // Right label
    const rightX = padding.left + chartWidth - 12;
    const rightLabel = `${maxDate.getFullYear()}/${String(maxDate.getMonth() + 1).padStart(2, '0')}/${String(
      maxDate.getDate()
    ).padStart(2, '0')}`;
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
    <View style={styles.chartWrapper}>
      {/* Selected point tooltip */}
      {selectedPoint && selectedX && (
        <View
          style={[
            styles.tooltip,
            {
              left: selectedX - 50,
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderColor,
            },
          ]}
        >
          <Text style={[styles.tooltipDate, { color: theme.textPrimary }]}>
            {new Date(selectedPoint.date)
              .toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              })
              .replace(/\//g, '/')}
          </Text>
          <Text style={[styles.tooltipValue, { color: theme.primaryColor }]}>
            {(() => {
              const value = chartType === 'volume' ? selectedPoint.volume : selectedPoint.weight;
              const unit = chartType === 'volume' ? '' : currentUnit === 'kg' ? t('units.kg') : t('units.lb');
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
        {/* Line */}
        <Path d={pathData} stroke={theme.primaryColor} strokeWidth={LINE_WIDTH} fill="none" />

        {/* Target weight line */}
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

        {/* Data points */}
        {dataPoints}

        {/* Selected point highlight */}
        {selectedPoint && selectedX && (
          <>
            <Circle
              cx={selectedX}
              cy={getY(chartType === 'volume' ? selectedPoint.volume : selectedPoint.weight)}
              r={POINT_RADIUS + 2}
              fill={theme.primaryColor}
              stroke={theme.backgroundColor || '#ffffff'}
              strokeWidth={2}
            />
            <Line
              x1={selectedX}
              y1={padding.top}
              x2={selectedX}
              y2={height - padding.bottom}
              stroke={theme.primaryColor}
              strokeWidth={1}
              strokeDasharray="5,5"
              opacity={0.7}
            />
          </>
        )}

        {/* Y-axis labels */}
        {yAxisLabels}

        {/* X-axis labels */}
        {xAxisLabels}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartWrapper: {
    position: 'relative',
  },
  emptyText: {
    fontSize: 16,
  },
  tooltip: {
    position: 'absolute',
    top: 10,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  tooltipDate: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

