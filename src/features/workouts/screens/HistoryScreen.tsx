/**
 * HistoryScreen
 * 歷程頁面 - 顯示訓練歷史記錄
 * 
 * This is a clean container component that:
 * - Uses the useWorkoutHistory hook for all business logic
 * - Renders WorkoutCalendar and WorkoutDetailModal components
 * - Passes necessary props to child components
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useUnit } from '../../../shared/hooks/useUnit';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import WorkoutCalendar from '../components/WorkoutCalendar';
import WorkoutDetailModal from '../components/WorkoutDetailModal';

/**
 * HistoryScreen Component
 * Clean container component for workout history
 */
const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { currentUnit } = useUnit();
  
  // Get all state and logic from the hook
  const {
    workouts,
    workoutData,
    selectedDate,
    selectedWorkouts,
    isLoading,
    isRefreshing,
    showDetailModal,
    showEditModal,
    editingWorkout,
    editForm,
    loadWorkouts,
    handleDateChange,
    handleDatePress,
    handleRefresh,
    handleAddWorkout,
    handleEditWorkout,
    handleDeleteWorkout,
    handleSaveEdit,
    handleCloseModal,
    handleCloseEditModal,
    updateEditForm,
  } = useWorkoutHistory();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    header: {
      backgroundColor: theme.cardBackground,
      padding: 20,
      paddingTop: 40,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
        <Text style={styles.subtitle}>{t('calendar.subtitle')}</Text>
      </View>

      {/* Calendar and Legend */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primaryColor}
            colors={[theme.primaryColor]}
          />
        }
      >
        <WorkoutCalendar
          theme={theme}
          workoutData={workoutData}
          onDatePress={handleDatePress}
          selectedDate={selectedDate}
          onSelectedDateChange={handleDateChange}
        />
      </ScrollView>

      {/* Detail and Edit Modals */}
      <WorkoutDetailModal
        theme={theme}
        currentUnit={currentUnit}
        showDetailModal={showDetailModal}
        selectedDate={selectedDate}
        selectedWorkouts={selectedWorkouts}
        onCloseDetailModal={handleCloseModal}
        onAddWorkout={handleAddWorkout}
        onEditWorkout={handleEditWorkout}
        onDeleteWorkout={handleDeleteWorkout}
        showEditModal={showEditModal}
        editingWorkout={editingWorkout}
        editForm={editForm}
        onUpdateEditForm={updateEditForm}
        onCloseEditModal={handleCloseEditModal}
        onSaveEdit={handleSaveEdit}
      />
    </View>
  );
};

export default HistoryScreen;


