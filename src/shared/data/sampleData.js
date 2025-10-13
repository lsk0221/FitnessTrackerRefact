// import uuid from 'react-native-uuid'; // 不再需要，因為 saveWorkout 會自動生成 ID

// 示例訓練數據
export const sampleWorkouts = [
  {
    muscleGroup: 'chest',
    exercise: '臥推',
    sets: 4,
    reps: 12,
    weight: 20,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天前
  },
  {
    muscleGroup: 'chest',
    exercise: '臥推',
    sets: 4,
    reps: 12,
    weight: 22.5,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6天前
  },
  {
    muscleGroup: 'back',
    exercise: '引體向上',
    sets: 3,
    reps: 8,
    weight: 0, // 自重訓練
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5天前
  },
  {
    muscleGroup: 'legs',
    exercise: '深蹲',
    sets: 4,
    reps: 15,
    weight: 40,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4天前
  },
  {
    muscleGroup: 'chest',
    exercise: '臥推',
    sets: 4,
    reps: 12,
    weight: 25,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天前
  },
  {
    muscleGroup: 'shoulders',
    exercise: '肩推',
    sets: 3,
    reps: 10,
    weight: 15,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2天前
  },
  {
    muscleGroup: 'chest',
    exercise: '臥推',
    sets: 4,
    reps: 12,
    weight: 27.5,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1天前
  },
];

// 載入示例數據到 AsyncStorage
export const loadSampleData = async (saveWorkoutFunction) => {
  try {
    console.log('=== 開始載入示例數據 ===');
    console.log('示例數據數量:', sampleWorkouts.length);
    
    if (!saveWorkoutFunction) {
      throw new Error('saveWorkoutFunction is required');
    }
    
    let successCount = 0;
    for (let i = 0; i < sampleWorkouts.length; i++) {
      const workout = sampleWorkouts[i];
      console.log(`正在保存第 ${i + 1} 條記錄:`, workout.muscleGroup, workout.exercise);
      
      const success = await saveWorkoutFunction(workout);
      if (success) {
        successCount++;
        console.log(`✓ 保存成功`);
      } else {
        console.log(`✗ 保存失敗`);
        throw new Error(`Failed to save workout: ${workout.exercise}`);
      }
    }
    
    console.log(`所有示例數據載入完成，成功保存 ${successCount} 條記錄`);
    return true;
  } catch (error) {
    console.error('載入示例數據時發生錯誤:', error);
    return false;
  }
};
