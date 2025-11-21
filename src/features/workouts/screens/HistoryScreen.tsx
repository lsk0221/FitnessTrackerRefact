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
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { useUnit } from '../../../shared/hooks/useUnit';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import WorkoutCalendar from '../components/WorkoutCalendar';
import WorkoutDetailModal from '../components/WorkoutDetailModal';
import ScreenHeader from '../../../shared/components/ScreenHeader';

/**
 * HistoryScreen Component
 * Clean container component for workout history
 */
const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { currentUnit } = useUnit();
  const { showAlert: showAppAlert, showConfirmation: showAppConfirmation, renderAlert } = useAppAlert();
  
  // Get all state and logic from the hook with alert callbacks
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
    muscleGroupsList,
  } = useWorkoutHistory({
    showAlert: (title: string, message: string) => {
      showAppAlert({ title, message });
    },
    showConfirmation: (options) => {
      showAppConfirmation({
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || t('common.confirm'),
        cancelText: options.cancelText || t('common.cancel'),
        confirmStyle: options.confirmStyle || 'default',
        onConfirm: options.onConfirm,
      });
    },
    showSuccess: (message: string) => {
      showAppAlert({
        title: t('common.success'),
        message,
      });
    },
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title={t('calendar.title')}
        subtitle={t('calendar.subtitle')}
      />

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
          muscleGroupsList={muscleGroupsList}
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
        muscleGroupsList={muscleGroupsList}
      />
      {renderAlert()}
    </View>
  );
};

export default HistoryScreen;


