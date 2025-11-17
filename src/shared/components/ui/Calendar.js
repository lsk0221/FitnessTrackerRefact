/**
 * 月曆組件
 * Calendar Component
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { getMuscleGroupColor } from '../../utils/helpers';

const { width: screenWidth } = Dimensions.get('window');

/**
 * 月曆組件
 * @param {Object} props - 組件屬性
 * @param {Object} props.theme - 主題配置
 * @param {Object} props.workoutData - 訓練數據 { date: { muscleGroups: [] } }
 * @param {Function} props.onDatePress - 日期點擊回調
 * @param {Date|null} props.selectedDate - 外部控制的選中日期
 * @param {Function} props.onSelectedDateChange - 選中日期變更回調
 * @returns {JSX.Element} 月曆組件
 */
const Calendar = ({ theme, workoutData = {}, onDatePress, selectedDate = null, onSelectedDateChange }) => {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fadeAnim] = useState(new Animated.Value(1));

  // 獲取月份的第一天和最後一天
  const getMonthInfo = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay(); // 0 = 星期日
    const daysInMonth = lastDay.getDate();
    
    return { firstDay, lastDay, firstDayOfWeek, daysInMonth };
  };

  // 獲取日期字符串 (YYYY-MM-DD) - 使用本地時間避免時區問題
  const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 獲取某天的訓練數據
  const getWorkoutForDate = (date) => {
    const dateString = getDateString(date);
    return workoutData[dateString] || { muscleGroups: [] };
  };

  // 渲染日期格子
  const renderDateCell = (day, isCurrentMonth = true, monthOffset = 0) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, day);
    const workout = getWorkoutForDate(date);
    const isToday = getDateString(date) === getDateString(new Date());
    const isSelected = selectedDate && getDateString(date) === getDateString(selectedDate);
    const hasWorkout = workout.muscleGroups && workout.muscleGroups.length > 0;
    const uniqueKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}-${monthOffset}`;

    return (
      <TouchableOpacity
        key={uniqueKey}
        style={[
          styles.dateCell,
          {
            backgroundColor: isCurrentMonth ? theme.cardBackground : theme.backgroundColor,
            borderColor: theme.borderColor,
          },
          isToday && styles.todayCell,
          isSelected && styles.selectedCell,
          hasWorkout && isCurrentMonth && styles.workoutDayCell,
        ]}
        onPress={() => {
          onSelectedDateChange && onSelectedDateChange(date);
          onDatePress && onDatePress(date, workout);
        }}
        disabled={!isCurrentMonth}
      >
        <Text
          style={[
            styles.dateText,
            {
              color: isCurrentMonth ? theme.textPrimary : theme.textSecondary,
            },
            isToday && styles.todayText,
            isSelected && styles.selectedText,
          ]}
        >
          {day}
        </Text>
        
        {/* 訓練肌肉群指示器 */}
        {workout.muscleGroups && workout.muscleGroups.length > 0 && (
          <View style={styles.muscleGroupIndicators}>
            {workout.muscleGroups.slice(0, 3).map((muscleGroup, index) => (
              <View
                key={index}
                style={[
                  styles.muscleGroupDot,
                  { backgroundColor: getMuscleGroupColor(muscleGroup, theme) }
                ]}
              />
            ))}
            {workout.muscleGroups.length > 3 && (
              <Text style={[styles.moreIndicator, { color: theme.textSecondary }]}>
                +{workout.muscleGroups.length - 3}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };


  // 渲染月曆
  const renderCalendar = () => {
    const { firstDayOfWeek, daysInMonth } = getMonthInfo(currentDate);
    const days = [];
    
    // 星期標題
    const weekDays = [t('calendar.sun'), t('calendar.mon'), t('calendar.tue'), t('calendar.wed'), t('calendar.thu'), t('calendar.fri'), t('calendar.sat')];
    const weekDayHeaders = weekDays.map((day, index) => (
      <Text key={index} style={[styles.weekDayHeader, { color: theme.textSecondary }]}>
        {day}
      </Text>
    ));

    // 上個月的日期
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(renderDateCell(daysInPrevMonth - i, false, -1));
    }

    // 當月的日期
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(renderDateCell(day, true, 0));
    }

    // 下個月的日期（填滿6行）
    const totalCells = days.length;
    const remainingCells = 42 - totalCells; // 6行 x 7天 = 42個格子
    for (let day = 1; day <= remainingCells; day++) {
      days.push(renderDateCell(day, false, 1));
    }

    return (
      <View style={styles.calendar}>
        <View style={styles.weekDayContainer}>
          {weekDayHeaders}
        </View>
        <View style={styles.daysContainer}>
          {days}
        </View>
      </View>
    );
  };

  // 切換月份
  const changeMonth = (direction) => {
    // 淡出動畫
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // 更新日期
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + direction);
      setCurrentDate(newDate);
      
      // 淡入動畫
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    monthNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    navButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    navButtonText: {
      fontSize: 20,
      fontWeight: 'bold',
      lineHeight: 20,
    },
    monthTitleContainer: {
      alignItems: 'center',
      flex: 1,
      marginHorizontal: 16,
    },
    monthTitleBackground: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 6,
    },
    monthTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    monthTitleUnderline: {
      height: 3,
      width: 60,
      borderRadius: 2,
    },
    calendar: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 16,
      margin: 16,
    },
    weekDayContainer: {
      flexDirection: 'row',
      justifyContent: 'center', // 改為center來置中
      marginBottom: 8,
      paddingHorizontal: 0, // 確保沒有額外的水平padding
    },
    weekDayHeader: {
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      width: (screenWidth - 80) / 7, // 增加額外空間：從64改為80
    },
    daysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center', // 改為center來置中
      alignItems: 'flex-start',
      paddingHorizontal: 0, // 確保沒有額外的水平padding
    },
    dateCell: {
      width: (screenWidth - 80) / 7, // 增加額外空間：從64改為80
      height: 60,
      borderWidth: 1,
      borderColor: theme.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    todayCell: {
      backgroundColor: theme.primaryColor + '20',
      borderColor: theme.primaryColor,
    },
    selectedCell: {
      backgroundColor: theme.primaryColor,
    },
    workoutDayCell: {
      backgroundColor: '#4CAF50' + '20', // 綠色背景，20% 透明度
      borderColor: '#4CAF50' + '40', // 綠色邊框，40% 透明度
    },
    dateText: {
      fontSize: 16,
      fontWeight: '500',
    },
    todayText: {
      color: theme.primaryColor,
      fontWeight: 'bold',
    },
    selectedText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    muscleGroupIndicators: {
      position: 'absolute',
      bottom: 4,
      left: 2,
      right: 2,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    muscleGroupDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 1,
      marginVertical: 1,
    },
    moreIndicator: {
      fontSize: 8,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      {/* 月份導航 */}
      <View style={[styles.monthNavigation, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.navButton, { 
            backgroundColor: theme.primaryColor + '15',
            borderColor: theme.primaryColor + '30',
          }]}
          onPress={() => changeMonth(-1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, { color: theme.primaryColor }]}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.monthTitleContainer}>
          <View style={[styles.monthTitleBackground, { backgroundColor: theme.primaryColor + '10' }]}>
            <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>
              {currentDate.getFullYear()}/{String(currentDate.getMonth() + 1).padStart(2, '0')}
            </Text>
          </View>
          <View style={[styles.monthTitleUnderline, { backgroundColor: theme.primaryColor }]} />
        </View>
        
        <TouchableOpacity
          style={[styles.navButton, { 
            backgroundColor: theme.primaryColor + '15',
            borderColor: theme.primaryColor + '30',
          }]}
          onPress={() => changeMonth(1)}
          activeOpacity={0.7}
        >
          <Text style={[styles.navButtonText, { color: theme.primaryColor }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 月曆 */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {renderCalendar()}
      </Animated.View>
    </View>
  );
};

Calendar.propTypes = {
  theme: PropTypes.object.isRequired,
  workoutData: PropTypes.object,
  onDatePress: PropTypes.func,
  selectedDate: PropTypes.instanceOf(Date),
  onSelectedDateChange: PropTypes.func,
};

export default Calendar;
