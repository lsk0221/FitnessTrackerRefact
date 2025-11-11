/**
 * Progress Chart Screen
 * 進度圖表頁面 - 主容器組件
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../shared/contexts/ThemeContext';
import { useUnit } from '../../../shared/hooks/useUnit';
import { useProgress } from '../hooks/useProgress';
import { ProgressChart } from '../components/ProgressChart';
import { StatsCard } from '../components/StatsCard';
import { ExerciseSelector } from '../components/ExerciseSelector';
import { getExerciseName } from '../../../shared/data/exerciseMapping';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Progress Chart Screen
 * 進度圖表頁面
 */
const ProgressChartScreen: React.FC = () => {
  const { theme } = useTheme();
  const { currentUnit, formatWeight } = useUnit();
  const { t, i18n } = useTranslation();
  const {
    selectedMuscleGroup,
    selectedExercise,
    selectedTimeRange,
    chartType,
    chartData,
    stats,
    targetWeight,
    isLoading,
    refreshing,
    handleMuscleGroupSelect,
    handleExerciseSelect,
    handleTimeRangeSelect,
    handleChartTypeSelect,
    handleTargetWeightSave,
    getAvailableExercisesForMuscleGroup,
    onRefresh,
  } = useProgress();

  const [showTargetWeightModal, setShowTargetWeightModal] = useState(false);
  const [targetWeightInput, setTargetWeightInput] = useState('');

  const styles = createStyles(theme);
  const language = i18n.language === 'zh' ? 'zh' : 'en';

  /**
   * 處理目標重量輸入
   */
  const handleTargetWeightInputSave = async () => {
    const inputWeight = parseFloat(targetWeightInput);
    const success = await handleTargetWeightSave(inputWeight);
    if (success) {
      setShowTargetWeightModal(false);
      setTargetWeightInput('');
    }
  };

  /**
   * 打開目標重量輸入模態框
   */
  const openTargetWeightModal = () => {
    if (selectedExercise) {
      setTargetWeightInput(targetWeight.toString());
      setShowTargetWeightModal(true);
    } else {
      Alert.alert(t('common.info'), t('progress.pleaseSelectExercise'));
    }
  };

  /**
   * 計算進步重量
   */
  const calculateImprovement = () => {
    if (chartData.length < 2) return null;

    const firstData = chartData[0];
    const lastData = chartData[chartData.length - 1];

    let weightDifference = 0;
    let percentageDifference = 0;

    if (chartType === 'weight') {
      const firstWeight = firstData.weight;
      const lastWeight = lastData.weight;
      weightDifference = lastWeight - firstWeight;
      percentageDifference = ((lastWeight - firstWeight) / firstWeight) * 100;
    } else {
      const firstVolume = firstData.volume;
      const lastVolume = lastData.volume;
      weightDifference = lastVolume - firstVolume;
      percentageDifference = ((lastVolume - firstVolume) / firstVolume) * 100;
    }

    const isPositive = weightDifference > 0;
    const formattedWeightDifference = formatWeight(weightDifference);
    const formattedPercentage =
      percentageDifference % 1 === 0 ? percentageDifference.toString() : percentageDifference.toFixed(1);

    const unitLabel = currentUnit === 'kg' ? t('units.kg') : t('units.lb');
    const improvementText = isPositive
      ? `+${formattedWeightDifference} ${unitLabel}`
      : `${formattedWeightDifference} ${unitLabel}`;
    const percentageText = isPositive ? `+${formattedPercentage}%` : `${formattedPercentage}%`;

    return { improvementText, percentageText, isPositive };
  };

  const improvement = calculateImprovement();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('progress.title')}</Text>
        <Text style={styles.subtitle}>{t('progress.subtitle')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primaryColor} colors={[theme.primaryColor]} />}
      >
        {/* Exercise Selector */}
        <ExerciseSelector
          selectedMuscleGroup={selectedMuscleGroup}
          selectedExercise={selectedExercise}
          selectedTimeRange={selectedTimeRange}
          chartType={chartType}
          availableExercises={getAvailableExercisesForMuscleGroup()}
          onMuscleGroupSelect={handleMuscleGroupSelect}
          onExerciseSelect={handleExerciseSelect}
          onTimeRangeSelect={handleTimeRangeSelect}
          onChartTypeSelect={handleChartTypeSelect}
          theme={theme}
          t={t}
          language={language}
        />

        {/* Chart Container */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <Text style={styles.chartTitle}>
                {selectedExercise ? getExerciseName(selectedExercise, language) : t('progress.selectAction')}
              </Text>

              {/* Improvement Display */}
              {selectedExercise && improvement && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressTextContainer}>
                    <Text
                      style={[
                        styles.progressWeight,
                        { color: improvement.isPositive ? '#28a745' : '#dc3545' },
                      ]}
                    >
                      {improvement.improvementText}
                    </Text>
                    <Text
                      style={[
                        styles.progressPercentage,
                        { color: improvement.isPositive ? '#28a745' : '#dc3545' },
                      ]}
                    >
                      {improvement.percentageText}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Progress Chart */}
          <ProgressChart
            data={chartData}
            width={screenWidth - 70}
            height={250}
            theme={theme}
            targetWeight={targetWeight}
            chartType={chartType}
            currentUnit={currentUnit}
          />
        </View>

        {/* Statistics Cards */}
        <StatsCard stats={stats} theme={theme} currentUnit={currentUnit} t={t} />

        {/* Target Weight Section */}
        <View style={styles.targetWeightContainer}>
          <Text style={styles.targetWeightTitle}>
            {chartType === 'volume' ? t('progress.targetVolume') : t('progress.targetWeight')}:{' '}
            {selectedExercise ? (() => {
              const formattedValue = formatWeight(targetWeight);
              const unitLabel = currentUnit === 'kg' ? t('units.kg') : t('units.lb');
              return `${formattedValue} ${unitLabel}`;
            })() : t('progress.pleaseSelectExercise')}
          </Text>
          <TouchableOpacity
            style={[styles.targetWeightButton, !selectedExercise && { opacity: 0.5 }]}
            onPress={openTargetWeightModal}
            disabled={!selectedExercise}
          >
            <Text style={styles.targetWeightButtonText}>
              {selectedExercise
                ? t('progress.setTarget') +
                  (chartType === 'volume' ? t('progress.volume') : t('progress.weight'))
                : t('progress.pleaseSelectExercise')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Target Weight Input Modal */}
      <Modal
        visible={showTargetWeightModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTargetWeightModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t('progress.setTarget')} {getExerciseName(selectedExercise, language)}{' '}
              {chartType === 'volume' ? t('progress.targetVolume') : t('progress.targetWeight')}
            </Text>
            <TextInput
              style={styles.targetWeightInput}
              value={targetWeightInput}
              onChangeText={setTargetWeightInput}
              placeholder={`${t('progress.setTarget')} ${
                chartType === 'volume' ? t('progress.targetVolume') : t('progress.targetWeight')
              } (${currentUnit === 'kg' ? t('units.kg') : t('units.lb')})`}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.targetWeightButton} onPress={handleTargetWeightInputSave}>
              <Text style={styles.targetWeightButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowTargetWeightModal(false)}>
              <Text style={styles.closeButtonText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    content: {
      flex: 1,
      padding: 20,
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
    chartContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    chartTitleContainer: {
      flex: 1,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 4,
    },
    progressContainer: {
      marginTop: 2,
    },
    progressTextContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    progressWeight: {
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 8,
    },
    progressPercentage: {
      fontSize: 14,
      fontWeight: '600',
    },
    targetWeightContainer: {
      backgroundColor: theme.cardBackground,
      borderRadius: 12,
      padding: 15,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    targetWeightTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 10,
    },
    targetWeightButton: {
      backgroundColor: theme.primaryColor,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },
    targetWeightButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    targetWeightInput: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.textPrimary,
      marginBottom: 15,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.cardBackground,
      borderRadius: 20,
      padding: 20,
      width: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: 15,
      textAlign: 'center',
    },
    closeButton: {
      backgroundColor: theme.cardBackground,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    closeButtonText: {
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default ProgressChartScreen;


