/**
 * 數據恢復工具
 * Data Recovery Utility
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cloudflareAuth } from '../config/cloudflare';

class DataRecovery {
  /**
   * 檢查所有可能的數據存儲位置
   */
  async checkAllDataSources() {
    console.log('=== 開始檢查數據源 ===');
    
    const results = {
      localStorage: {},
      cloudStorage: {},
      userProfiles: {},
      workoutData: {}
    };

    try {
      // 1. 檢查本地存儲的所有鍵
      const allKeys = await AsyncStorage.getAllKeys();
      console.log('本地存儲的所有鍵:', allKeys);

      for (const key of allKeys) {
        try {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            results.localStorage[key] = JSON.parse(value);
            console.log(`本地存儲 [${key}]:`, JSON.parse(value));
          }
        } catch (error) {
          console.log(`讀取 ${key} 失敗:`, error.message);
        }
      }

      // 2. 檢查用戶資料
      const userProfile = await AsyncStorage.getItem('user_profile');
      if (userProfile) {
        results.userProfiles.local = JSON.parse(userProfile);
        console.log('本地用戶資料:', JSON.parse(userProfile));
      }

      // 3. 檢查訓練數據
      const workoutKeys = allKeys.filter(key => key.startsWith('workouts'));
      for (const key of workoutKeys) {
        try {
          const workouts = await AsyncStorage.getItem(key);
          if (workouts) {
            results.workoutData[key] = JSON.parse(workouts);
            console.log(`訓練數據 [${key}]:`, JSON.parse(workouts));
          }
        } catch (error) {
          console.log(`讀取訓練數據 ${key} 失敗:`, error.message);
        }
      }

      // 4. 嘗試從雲端獲取數據
      try {
        const token = await cloudflareAuth.getToken();
        if (token) {
          console.log('找到雲端 token，嘗試獲取數據...');
          
          // 獲取用戶資料
          try {
            const profile = await cloudflareAuth.getProfile();
            results.userProfiles.cloud = profile;
            console.log('雲端用戶資料:', profile);
          } catch (error) {
            console.log('獲取雲端用戶資料失敗:', error.message);
          }

          // 獲取訓練數據
          try {
            const workouts = await cloudflareAuth.getWorkoutData();
            results.workoutData.cloud = workouts;
            console.log('雲端訓練數據:', workouts);
          } catch (error) {
            console.log('獲取雲端訓練數據失敗:', error.message);
          }
        } else {
          console.log('沒有找到雲端 token');
        }
      } catch (error) {
        console.log('雲端數據檢查失敗:', error.message);
      }

    } catch (error) {
      console.error('數據檢查過程出錯:', error);
    }

    console.log('=== 數據檢查完成 ===');
    return results;
  }

  /**
   * 恢復數據到當前項目
   */
  async recoverData() {
    console.log('=== 開始數據恢復 ===');
    
    try {
      const dataSources = await this.checkAllDataSources();
      
      // 恢復用戶資料
      if (dataSources.userProfiles.cloud?.user) {
        await AsyncStorage.setItem('user_profile', JSON.stringify(dataSources.userProfiles.cloud.user));
        console.log('已恢復雲端用戶資料');
      } else if (dataSources.userProfiles.local) {
        console.log('使用本地用戶資料');
      }

      // 恢復訓練數據
      let recoveredWorkouts = [];
      
      // 優先使用雲端數據
      if (dataSources.workoutData.cloud?.workouts) {
        recoveredWorkouts = dataSources.workoutData.cloud.workouts;
        console.log('使用雲端訓練數據:', recoveredWorkouts.length, '條記錄');
      } else {
        // 使用本地數據
        for (const [key, workouts] of Object.entries(dataSources.workoutData)) {
          if (Array.isArray(workouts) && workouts.length > 0) {
            recoveredWorkouts = [...recoveredWorkouts, ...workouts];
            console.log(`從 ${key} 恢復了 ${workouts.length} 條記錄`);
          }
        }
      }

      // 保存恢復的數據
      if (recoveredWorkouts.length > 0) {
        const userProfile = dataSources.userProfiles.cloud?.user || dataSources.userProfiles.local;
        const userKey = userProfile ? `workouts_${userProfile.id}` : 'workouts';
        
        // 確保數據有正確的格式和 ID
        const formattedWorkouts = recoveredWorkouts.map((workout, index) => ({
          ...workout,
          id: workout.id || `recovered_${Date.now()}_${index}`,
          date: workout.date || new Date().toISOString(),
          exercise: workout.exercise || '未知運動',
          muscleGroup: workout.muscleGroup || '全身',
          weight: workout.weight || 0,
          reps: workout.reps || 0,
          sets: workout.sets || 1
        }));
        
        await AsyncStorage.setItem(userKey, JSON.stringify(formattedWorkouts));
        console.log(`已恢復 ${formattedWorkouts.length} 條訓練記錄到 ${userKey}`);
        console.log('恢復的數據樣本:', formattedWorkouts.slice(0, 2));
        
        // 同時保存到通用 workouts 鍵（以防萬一）
        await AsyncStorage.setItem('workouts', JSON.stringify(formattedWorkouts));
        console.log('同時保存到通用 workouts 鍵');
        
        return {
          success: true,
          message: `成功恢復 ${formattedWorkouts.length} 條訓練記錄`,
          workouts: formattedWorkouts,
          userKey: userKey
        };
      } else {
        return {
          success: false,
          message: '沒有找到可恢復的訓練數據',
          workouts: []
        };
      }

    } catch (error) {
      console.error('數據恢復失敗:', error);
      return {
        success: false,
        message: `數據恢復失敗: ${error.message}`,
        workouts: []
      };
    }
  }

  /**
   * 創建示例數據（如果沒有找到任何數據）
   */
  async createSampleData() {
    console.log('=== 創建示例數據 ===');
    
    const sampleWorkouts = [
      {
        id: 'sample_1',
        date: new Date().toISOString(),
        exercise: '深蹲',
        muscleGroup: '腿部',
        weight: 60,
        reps: 12,
        sets: 3,
        notes: '恢復的示例數據'
      },
      {
        id: 'sample_2',
        date: new Date(Date.now() - 86400000).toISOString(), // 昨天
        exercise: '臥推',
        muscleGroup: '胸部',
        weight: 80,
        reps: 10,
        sets: 3,
        notes: '恢復的示例數據'
      }
    ];

    try {
      const userProfile = await AsyncStorage.getItem('user_profile');
      const userKey = userProfile ? `workouts_${JSON.parse(userProfile).id}` : 'workouts';
      
      await AsyncStorage.setItem(userKey, JSON.stringify(sampleWorkouts));
      console.log('已創建示例數據');
      
      return {
        success: true,
        message: '已創建示例數據',
        workouts: sampleWorkouts
      };
    } catch (error) {
      console.error('創建示例數據失敗:', error);
      return {
        success: false,
        message: `創建示例數據失敗: ${error.message}`,
        workouts: []
      };
    }
  }
}

export const dataRecovery = new DataRecovery();
