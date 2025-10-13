// 預定義的肌肉群組和對應的訓練動作（使用中文）
export const predefinedMuscleGroups = [
  'chest',
  'back', 
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio'
];

export const predefinedExercises = {
  'chest': [
    '臥推',
    '啞鈴臥推',
    '上斜臥推',
    '啞鈴飛鳥',
    '伏地挺身',
    '胸部撐體',
    '纜繩交叉',
    '下斜臥推'
  ],
  'back': [
    '引體向上',
    '下拉',
    '俯身划船',
    '硬舉',
    'T槓划船',
    '坐姿划船',
    '單臂啞鈴划船',
    '面拉'
  ],
  'legs': [
    '深蹲',
    '硬舉',
    '弓步',
    '腿舉',
    '腿彎舉',
    '腿伸展',
    '提踵',
    '保加利亞分腿蹲'
  ],
  'shoulders': [
    '肩推',
    '側平舉',
    '前平舉',
    '後三角飛鳥',
    '阿諾德推舉',
    '直立划船',
    '面拉',
    '聳肩'
  ],
  'arms': [
    '二頭彎舉',
    '三頭撐體',
    '錘式彎舉',
    '三頭下壓',
    '牧師椅彎舉',
    '窄握臥推',
    '纜繩彎舉',
    '過頭三頭伸展'
  ],
  'core': [
    '平板支撐',
    '捲腹',
    '俄羅斯轉體',
    '登山者',
    '死蟲式',
    '自行車捲腹',
    '抬腿',
    '伐木式'
  ],
  'cardio': [
    '跑步',
    '騎單車',
    '游泳',
    '跳繩',
    '橢圓機',
    '划船機',
    '踏步機',
    'HIIT'
  ]
};

// 時間範圍選項
export const timeRangeOptions = [
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last Month', value: '1month' },
  { label: 'Last 3 Months', value: '3months' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'Last Year', value: '1year' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom Range', value: 'custom' }
];

// 根據時間範圍篩選數據
export const filterWorkoutsByTimeRange = (workouts, timeRange, customStartDate = null, customEndDate = null) => {
  if (!workouts || workouts.length === 0) return [];
  
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '1month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case 'ytd':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case '1year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case 'custom':
      if (customStartDate && customEndDate) {
        return workouts.filter(workout => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= customStartDate && workoutDate <= customEndDate;
        });
      }
      return workouts;
    case 'all':
    default:
      return workouts;
  }
  
  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startDate;
  });
};
