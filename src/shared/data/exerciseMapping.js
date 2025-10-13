/**
 * 訓練動作雙語映射系統
 * Exercise Bilingual Mapping System
 */

// 英文鍵值到中英文名稱的映射
export const EXERCISE_MAPPING = {
  // Chest exercises
  'bench_press': {
    en: 'Bench Press',
    zh: '臥推'
  },
  'dumbbell_press': {
    en: 'Dumbbell Press',
    zh: '啞鈴臥推'
  },
  'incline_bench_press': {
    en: 'Incline Bench Press',
    zh: '上斜臥推'
  },
  'dumbbell_flyes': {
    en: 'Dumbbell Flyes',
    zh: '啞鈴飛鳥'
  },
  'push_ups': {
    en: 'Push-ups',
    zh: '伏地挺身'
  },
  'chest_dips': {
    en: 'Chest Dips',
    zh: '胸部撐體'
  },
  'cable_crossover': {
    en: 'Cable Crossover',
    zh: '纜繩交叉'
  },
  'decline_bench_press': {
    en: 'Decline Bench Press',
    zh: '下斜臥推'
  },
  
  // Back exercises
  'pull_ups': {
    en: 'Pull-ups',
    zh: '引體向上'
  },
  'lat_pulldown': {
    en: 'Lat Pulldown',
    zh: '下拉'
  },
  'bent_over_row': {
    en: 'Bent-over Row',
    zh: '俯身划船'
  },
  'deadlift': {
    en: 'Deadlift',
    zh: '硬舉'
  },
  't_bar_row': {
    en: 'T-Bar Row',
    zh: 'T槓划船'
  },
  'seated_cable_row': {
    en: 'Seated Cable Row',
    zh: '坐姿划船'
  },
  'one_arm_dumbbell_row': {
    en: 'One-arm Dumbbell Row',
    zh: '單臂啞鈴划船'
  },
  'face_pulls': {
    en: 'Face Pulls',
    zh: '面拉'
  },
  
  // Legs exercises
  'squats': {
    en: 'Squats',
    zh: '深蹲'
  },
  'lunges': {
    en: 'Lunges',
    zh: '弓步'
  },
  'leg_press': {
    en: 'Leg Press',
    zh: '腿舉'
  },
  'leg_curls': {
    en: 'Leg Curls',
    zh: '腿彎舉'
  },
  'leg_extensions': {
    en: 'Leg Extensions',
    zh: '腿伸展'
  },
  'calf_raises': {
    en: 'Calf Raises',
    zh: '提踵'
  },
  'bulgarian_split_squats': {
    en: 'Bulgarian Split Squats',
    zh: '保加利亞分腿蹲'
  },
  
  // Shoulders exercises
  'overhead_press': {
    en: 'Overhead Press',
    zh: '肩推'
  },
  'shoulder_press': {
    en: 'Shoulder Press',
    zh: '肩推'
  },
  'lateral_raises': {
    en: 'Lateral Raises',
    zh: '側平舉'
  },
  'front_raises': {
    en: 'Front Raises',
    zh: '前平舉'
  },
  'rear_delt_flyes': {
    en: 'Rear Delt Flyes',
    zh: '後三角飛鳥'
  },
  'arnold_press': {
    en: 'Arnold Press',
    zh: '阿諾德推舉'
  },
  'upright_row': {
    en: 'Upright Row',
    zh: '直立划船'
  },
  'shrugs': {
    en: 'Shrugs',
    zh: '聳肩'
  },
  
  // Arms exercises
  'bicep_curls': {
    en: 'Bicep Curls',
    zh: '二頭彎舉'
  },
  'tricep_dips': {
    en: 'Tricep Dips',
    zh: '三頭撐體'
  },
  'hammer_curls': {
    en: 'Hammer Curls',
    zh: '錘式彎舉'
  },
  'tricep_pushdowns': {
    en: 'Tricep Pushdowns',
    zh: '三頭下壓'
  },
  'preacher_curls': {
    en: 'Preacher Curls',
    zh: '牧師椅彎舉'
  },
  'close_grip_bench_press': {
    en: 'Close-grip Bench Press',
    zh: '窄握臥推'
  },
  'cable_curls': {
    en: 'Cable Curls',
    zh: '纜繩彎舉'
  },
  'overhead_tricep_extension': {
    en: 'Overhead Tricep Extension',
    zh: '過頭三頭伸展'
  },
  
  // Core exercises
  'plank': {
    en: 'Plank',
    zh: '平板支撐'
  },
  'crunches': {
    en: 'Crunches',
    zh: '捲腹'
  },
  'russian_twists': {
    en: 'Russian Twists',
    zh: '俄羅斯轉體'
  },
  'mountain_climbers': {
    en: 'Mountain Climbers',
    zh: '登山者'
  },
  'dead_bug': {
    en: 'Dead Bug',
    zh: '死蟲式'
  },
  'bicycle_crunches': {
    en: 'Bicycle Crunches',
    zh: '自行車捲腹'
  },
  'leg_raises': {
    en: 'Leg Raises',
    zh: '抬腿'
  },
  'wood_chops': {
    en: 'Wood Chops',
    zh: '伐木式'
  },
  
  // Cardio exercises
  'running': {
    en: 'Running',
    zh: '跑步'
  },
  'cycling': {
    en: 'Cycling',
    zh: '騎單車'
  },
  'swimming': {
    en: 'Swimming',
    zh: '游泳'
  },
  'jump_rope': {
    en: 'Jump Rope',
    zh: '跳繩'
  },
  'elliptical': {
    en: 'Elliptical',
    zh: '橢圓機'
  },
  'rowing_machine': {
    en: 'Rowing Machine',
    zh: '划船機'
  },
  'stepper': {
    en: 'Stepper',
    zh: '踏步機'
  },
  'hiit': {
    en: 'HIIT',
    zh: 'HIIT'
  }
};

// 肌肉群對應的訓練動作鍵值
export const MUSCLE_GROUP_EXERCISES = {
  'chest': [
    'bench_press',
    'dumbbell_press',
    'incline_bench_press',
    'dumbbell_flyes',
    'push_ups',
    'chest_dips',
    'cable_crossover',
    'decline_bench_press'
  ],
  'back': [
    'pull_ups',
    'lat_pulldown',
    'bent_over_row',
    'deadlift',
    't_bar_row',
    'seated_cable_row',
    'one_arm_dumbbell_row',
    'face_pulls'
  ],
  'legs': [
    'squats',
    'lunges',
    'leg_press',
    'leg_curls',
    'leg_extensions',
    'calf_raises',
    'bulgarian_split_squats'
  ],
  'shoulders': [
    'overhead_press',
    'shoulder_press',
    'lateral_raises',
    'front_raises',
    'rear_delt_flyes',
    'arnold_press',
    'upright_row',
    'shrugs'
  ],
  'arms': [
    'bicep_curls',
    'tricep_dips',
    'hammer_curls',
    'tricep_pushdowns',
    'preacher_curls',
    'close_grip_bench_press',
    'cable_curls',
    'overhead_tricep_extension'
  ],
  'core': [
    'plank',
    'crunches',
    'russian_twists',
    'mountain_climbers',
    'dead_bug',
    'bicycle_crunches',
    'leg_raises',
    'wood_chops'
  ],
  'cardio': [
    'running',
    'cycling',
    'swimming',
    'jump_rope',
    'elliptical',
    'rowing_machine',
    'stepper',
    'hiit'
  ]
};

/**
 * 根據語言獲取訓練動作名稱
 * @param {string} exerciseKey - 訓練動作鍵值
 * @param {string} language - 語言 ('en' 或 'zh')
 * @returns {string} 對應語言的訓練動作名稱
 */
export const getExerciseName = (exerciseKey, language = 'zh') => {
  const exercise = EXERCISE_MAPPING[exerciseKey];
  if (!exercise) {
    return exerciseKey; // 如果找不到映射，返回原始鍵值
  }
  return exercise[language] || exercise.zh;
};

/**
 * 根據語言獲取肌肉群的訓練動作列表
 * @param {string} muscleGroup - 肌肉群鍵值
 * @param {string} language - 語言 ('en' 或 'zh')
 * @returns {Array} 對應語言的訓練動作名稱列表
 */
export const getExercisesForMuscleGroup = (muscleGroup, language = 'zh') => {
  const exerciseKeys = MUSCLE_GROUP_EXERCISES[muscleGroup] || [];
  return exerciseKeys.map(key => getExerciseName(key, language));
};

/**
 * 根據中文名稱查找英文鍵值
 * @param {string} chineseName - 中文名稱
 * @returns {string|null} 英文鍵值，如果找不到則返回 null
 */
export const findExerciseKeyByChineseName = (chineseName) => {
  for (const [key, exercise] of Object.entries(EXERCISE_MAPPING)) {
    if (exercise.zh === chineseName) {
      return key;
    }
  }
  return null;
};

/**
 * 根據英文名稱查找英文鍵值
 * @param {string} englishName - 英文名稱
 * @returns {string|null} 英文鍵值，如果找不到則返回 null
 */
export const findExerciseKeyByEnglishName = (englishName) => {
  for (const [key, exercise] of Object.entries(EXERCISE_MAPPING)) {
    if (exercise.en === englishName) {
      return key;
    }
  }
  return null;
};
