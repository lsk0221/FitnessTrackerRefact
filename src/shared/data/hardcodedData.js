/**
 * Hardcoded Data for Fitness Tracker App
 * 健身追蹤應用程式的硬編碼數據
 */

// 預設模板數據
export const presetTemplates = [
  {
    id: 'ppl_push',
    name: 'Classic PPL - Push',
    description: 'Classic push day workout focusing on chest, shoulders, and triceps',
    exercises: [
      { 
        id: 'ex1', 
        name: 'Barbell Bench Press', 
        muscleGroup: 'Chest', 
        sets: 4, 
        reps: '8-12', 
        weight: 'Body Weight + 20kg',
        restTime: 120,
        instructions: 'Lie flat on bench, grip bar slightly wider than shoulders'
      },
      { 
        id: 'ex2', 
        name: 'Incline Dumbbell Press', 
        muscleGroup: 'Chest', 
        sets: 3, 
        reps: '10-15', 
        weight: '25kg each',
        restTime: 90,
        instructions: 'Set bench to 30-45 degree incline'
      },
      { 
        id: 'ex3', 
        name: 'Overhead Press', 
        muscleGroup: 'Shoulders', 
        sets: 4, 
        reps: '6-10', 
        weight: 'Body Weight',
        restTime: 120,
        instructions: 'Press bar from shoulder level to overhead'
      },
      { 
        id: 'ex4', 
        name: 'Close Grip Bench Press', 
        muscleGroup: 'Triceps', 
        sets: 3, 
        reps: '8-12', 
        weight: 'Body Weight + 10kg',
        restTime: 90,
        instructions: 'Grip bar with hands closer than shoulder width'
      }
    ],
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedTime: 60,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ppl_pull',
    name: 'Classic PPL - Pull',
    description: 'Classic pull day workout focusing on back and biceps',
    exercises: [
      { 
        id: 'ex5', 
        name: 'Deadlift', 
        muscleGroup: 'Back', 
        sets: 4, 
        reps: '5-8', 
        weight: 'Body Weight + 40kg',
        restTime: 180,
        instructions: 'Lift bar from floor to standing position'
      },
      { 
        id: 'ex6', 
        name: 'Pull-ups', 
        muscleGroup: 'Back', 
        sets: 4, 
        reps: '6-12', 
        weight: 'Body Weight',
        restTime: 120,
        instructions: 'Hang from bar and pull body up until chin over bar'
      },
      { 
        id: 'ex7', 
        name: 'Barbell Rows', 
        muscleGroup: 'Back', 
        sets: 4, 
        reps: '8-12', 
        weight: 'Body Weight + 15kg',
        restTime: 120,
        instructions: 'Bend over and row bar to lower chest'
      },
      { 
        id: 'ex8', 
        name: 'Barbell Curls', 
        muscleGroup: 'Biceps', 
        sets: 3, 
        reps: '10-15', 
        weight: '20kg',
        restTime: 60,
        instructions: 'Stand with feet shoulder-width apart, curl bar up'
      }
    ],
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedTime: 65,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ppl_legs',
    name: 'Classic PPL - Legs',
    description: 'Leg day workout focusing on quads, hamstrings, and glutes',
    exercises: [
      { 
        id: 'ex9', 
        name: 'Squat', 
        muscleGroup: 'Legs', 
        sets: 4, 
        reps: '8-12', 
        weight: 'Body Weight + 30kg',
        restTime: 150,
        instructions: 'Stand with feet shoulder-width apart, squat down until thighs parallel'
      },
      { 
        id: 'ex10', 
        name: 'Romanian Deadlift', 
        muscleGroup: 'Hamstrings', 
        sets: 4, 
        reps: '8-12', 
        weight: 'Body Weight + 25kg',
        restTime: 120,
        instructions: 'Hinge at hips, lower bar along legs'
      },
      { 
        id: 'ex11', 
        name: 'Bulgarian Split Squats', 
        muscleGroup: 'Legs', 
        sets: 3, 
        reps: '10-15 each', 
        weight: 'Body Weight',
        restTime: 90,
        instructions: 'One foot elevated behind, squat down on front leg'
      },
      { 
        id: 'ex12', 
        name: 'Calf Raises', 
        muscleGroup: 'Calves', 
        sets: 4, 
        reps: '15-20', 
        weight: 'Body Weight + 20kg',
        restTime: 60,
        instructions: 'Stand on edge of step, raise up on toes'
      }
    ],
    category: 'Strength',
    difficulty: 'Intermediate',
    estimatedTime: 70,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'hiit_cardio',
    name: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for cardiovascular fitness',
    exercises: [
      { 
        id: 'ex13', 
        name: 'Burpees', 
        muscleGroup: 'Full Body', 
        sets: 4, 
        reps: '30 seconds', 
        weight: 'Body Weight',
        restTime: 30,
        instructions: 'Squat down, jump back to plank, do push-up, jump forward, jump up'
      },
      { 
        id: 'ex14', 
        name: 'Mountain Climbers', 
        muscleGroup: 'Core', 
        sets: 4, 
        reps: '30 seconds', 
        weight: 'Body Weight',
        restTime: 30,
        instructions: 'In plank position, alternate bringing knees to chest'
      },
      { 
        id: 'ex15', 
        name: 'Jump Squats', 
        muscleGroup: 'Legs', 
        sets: 4, 
        reps: '30 seconds', 
        weight: 'Body Weight',
        restTime: 30,
        instructions: 'Squat down and explode up into a jump'
      },
      { 
        id: 'ex16', 
        name: 'High Knees', 
        muscleGroup: 'Legs', 
        sets: 4, 
        reps: '30 seconds', 
        weight: 'Body Weight',
        restTime: 30,
        instructions: 'Run in place bringing knees up high'
      }
    ],
    category: 'Cardio',
    difficulty: 'Advanced',
    estimatedTime: 25,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// 用戶模板數據 (動態存儲)
let userTemplates = [
  {
    id: 'user_1',
    name: 'My Upper Body',
    description: 'Custom upper body workout',
    exercises: [
      { 
        id: 'uex1', 
        name: 'Push-ups', 
        muscleGroup: 'Chest', 
        sets: 3, 
        reps: '15-20', 
        weight: 'Body Weight',
        restTime: 60,
        instructions: 'Standard push-up form'
      },
      { 
        id: 'uex2', 
        name: 'Pull-ups', 
        muscleGroup: 'Back', 
        sets: 3, 
        reps: '8-12', 
        weight: 'Body Weight',
        restTime: 90,
        instructions: 'Hang and pull up until chin over bar'
      }
    ],
    category: 'Custom',
    difficulty: 'Beginner',
    estimatedTime: 30,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  }
];

// 練習庫數據
export const exerciseLibrary = [
  // 胸部練習
  { id: 'ex_chest_1', name: 'Barbell Bench Press', muscleGroup: 'Chest', movementPattern: 'Horizontal Press', equipment: 'Barbell' },
  { id: 'ex_chest_2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest', movementPattern: 'Incline Press', equipment: 'Dumbbell' },
  { id: 'ex_chest_3', name: 'Push-ups', muscleGroup: 'Chest', movementPattern: 'Horizontal Press', equipment: 'Bodyweight' },
  { id: 'ex_chest_4', name: 'Dumbbell Flyes', muscleGroup: 'Chest', movementPattern: 'Horizontal Fly', equipment: 'Dumbbell' },
  
  // 背部練習
  { id: 'ex_back_1', name: 'Deadlift', muscleGroup: 'Back', movementPattern: 'Hip Hinge', equipment: 'Barbell' },
  { id: 'ex_back_2', name: 'Pull-ups', muscleGroup: 'Back', movementPattern: 'Vertical Pull', equipment: 'Bodyweight' },
  { id: 'ex_back_3', name: 'Barbell Rows', muscleGroup: 'Back', movementPattern: 'Horizontal Pull', equipment: 'Barbell' },
  { id: 'ex_back_4', name: 'Lat Pulldowns', muscleGroup: 'Back', movementPattern: 'Vertical Pull', equipment: 'Machine' },
  
  // 腿部練習
  { id: 'ex_legs_1', name: 'Squat', muscleGroup: 'Legs', movementPattern: 'Squat', equipment: 'Barbell' },
  { id: 'ex_legs_2', name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', movementPattern: 'Hip Hinge', equipment: 'Barbell' },
  { id: 'ex_legs_3', name: 'Lunges', muscleGroup: 'Legs', movementPattern: 'Lunge', equipment: 'Bodyweight' },
  { id: 'ex_legs_4', name: 'Calf Raises', muscleGroup: 'Calves', movementPattern: 'Calf Raise', equipment: 'Bodyweight' },
  
  // 肩膀練習
  { id: 'ex_shoulders_1', name: 'Overhead Press', muscleGroup: 'Shoulders', movementPattern: 'Vertical Press', equipment: 'Barbell' },
  { id: 'ex_shoulders_2', name: 'Lateral Raises', muscleGroup: 'Shoulders', movementPattern: 'Lateral Raise', equipment: 'Dumbbell' },
  { id: 'ex_shoulders_3', name: 'Rear Delt Flyes', muscleGroup: 'Shoulders', movementPattern: 'Horizontal Fly', equipment: 'Dumbbell' },
  
  // 手臂練習
  { id: 'ex_arms_1', name: 'Barbell Curls', muscleGroup: 'Biceps', movementPattern: 'Curl', equipment: 'Barbell' },
  { id: 'ex_arms_2', name: 'Tricep Dips', muscleGroup: 'Triceps', movementPattern: 'Dip', equipment: 'Bodyweight' },
  { id: 'ex_arms_3', name: 'Hammer Curls', muscleGroup: 'Biceps', movementPattern: 'Curl', equipment: 'Dumbbell' },
  
  // 核心練習
  { id: 'ex_core_1', name: 'Plank', muscleGroup: 'Core', movementPattern: 'Isometric', equipment: 'Bodyweight' },
  { id: 'ex_core_2', name: 'Russian Twists', muscleGroup: 'Core', movementPattern: 'Rotation', equipment: 'Bodyweight' },
  { id: 'ex_core_3', name: 'Mountain Climbers', muscleGroup: 'Core', movementPattern: 'Dynamic', equipment: 'Bodyweight' },
  
  // 有氧練習
  { id: 'ex_cardio_1', name: 'Burpees', muscleGroup: 'Full Body', movementPattern: 'Compound', equipment: 'Bodyweight' },
  { id: 'ex_cardio_2', name: 'Jump Squats', muscleGroup: 'Legs', movementPattern: 'Explosive', equipment: 'Bodyweight' },
  { id: 'ex_cardio_3', name: 'High Knees', muscleGroup: 'Legs', movementPattern: 'Dynamic', equipment: 'Bodyweight' }
];

// 模擬訓練會話數據
export const workoutSessions = [
  {
    id: 'session_1',
    date: '2024-01-20T09:00:00Z',
    duration: 65,
    notes: 'Great workout, felt strong today',
    templateId: 'ppl_push',
    templateName: 'Classic PPL - Push',
    exercises: [
      {
        exerciseId: 'ex1',
        exerciseName: 'Barbell Bench Press',
        sets: [
          { setNumber: 1, reps: 10, weight: 80, completed: true },
          { setNumber: 2, reps: 8, weight: 85, completed: true },
          { setNumber: 3, reps: 6, weight: 90, completed: true }
        ]
      },
      {
        exerciseId: 'ex2',
        exerciseName: 'Incline Dumbbell Press',
        sets: [
          { setNumber: 1, reps: 12, weight: 25, completed: true },
          { setNumber: 2, reps: 10, weight: 27.5, completed: true },
          { setNumber: 3, reps: 8, weight: 30, completed: true }
        ]
      }
    ]
  }
];

// 獲取用戶模板
export const getUserTemplates = () => {
  return [...userTemplates];
};

// 獲取所有模板 (預設 + 用戶)
export const getAllTemplates = () => {
  return [...presetTemplates, ...userTemplates];
};

// 根據ID獲取模板
export const getTemplateById = (id) => {
  const allTemplates = getAllTemplates();
  return allTemplates.find(template => template.id === id);
};

// 根據類別獲取模板
export const getTemplatesByCategory = (category) => {
  const allTemplates = getAllTemplates();
  return allTemplates.filter(template => template.category === category);
};

// 根據難度獲取模板
export const getTemplatesByDifficulty = (difficulty) => {
  const allTemplates = getAllTemplates();
  return allTemplates.filter(template => template.difficulty === difficulty);
};

// 搜索模板
export const searchTemplates = (query) => {
  const allTemplates = getAllTemplates();
  const lowercaseQuery = query.toLowerCase();
  return allTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.exercises.some(exercise => 
      exercise.name.toLowerCase().includes(lowercaseQuery)
    )
  );
};

// 獲取所有練習
export const getExercises = () => {
  return exerciseLibrary;
};

// 根據肌肉群獲取練習
export const getExercisesByMuscleGroup = (muscleGroup) => {
  return exerciseLibrary.filter(exercise => exercise.muscleGroup === muscleGroup);
};

// 搜索練習
export const searchExercises = (query) => {
  const lowercaseQuery = query.toLowerCase();
  return exerciseLibrary.filter(exercise => 
    exercise.name.toLowerCase().includes(lowercaseQuery) ||
    exercise.muscleGroup.toLowerCase().includes(lowercaseQuery) ||
    exercise.equipment.toLowerCase().includes(lowercaseQuery)
  );
};

// 保存用戶模板
export const saveUserTemplate = (templateData) => {
  // 處理 exercises 數據格式
  let processedExercises = templateData.exercises;
  if (typeof processedExercises === 'string') {
    try {
      processedExercises = JSON.parse(processedExercises);
    } catch (error) {
      console.error('解析 exercises JSON 失敗:', error);
      processedExercises = [];
    }
  }
  
  const newTemplate = {
    id: `user_${Date.now()}`,
    ...templateData,
    exercises: processedExercises, // 確保是數組格式
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 真正保存到用戶模板數組
  userTemplates.push(newTemplate);
  console.log('保存用戶模板成功:', newTemplate);
  console.log('當前用戶模板數量:', userTemplates.length);
  return newTemplate;
};

// 更新用戶模板
export const updateUserTemplate = (templateId, templateData) => {
  const templateIndex = userTemplates.findIndex(template => template.id === templateId);
  if (templateIndex !== -1) {
    userTemplates[templateIndex] = {
      ...userTemplates[templateIndex],
      ...templateData,
      updatedAt: new Date().toISOString()
    };
    console.log('更新用戶模板成功:', templateId);
    return { success: true };
  } else {
    console.log('找不到要更新的模板:', templateId);
    return { success: false };
  }
};

// 刪除用戶模板
export const deleteUserTemplate = (templateId) => {
  const templateIndex = userTemplates.findIndex(template => template.id === templateId);
  if (templateIndex !== -1) {
    userTemplates.splice(templateIndex, 1);
    console.log('刪除用戶模板成功:', templateId);
    return { success: true };
  } else {
    console.log('找不到要刪除的模板:', templateId);
    return { success: false };
  }
};

// 模擬保存訓練會話
export const saveWorkoutSession = (sessionData) => {
  const newSession = {
    id: `session_${Date.now()}`,
    ...sessionData,
    createdAt: new Date().toISOString()
  };
  
  console.log('模擬保存訓練會話:', newSession);
  return newSession;
};
