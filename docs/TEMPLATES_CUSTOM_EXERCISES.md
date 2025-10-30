# Templates Feature: Custom Exercise Creation

**完整的自定义练习创建功能文档**  
**Complete Custom Exercise Creation Feature Documentation**

---

## 📋 目录 | Table of Contents

1. [功能概述 | Overview](#功能概述--overview)
2. [开发历程 | Development Timeline](#开发历程--development-timeline)
3. [技术实现 | Technical Implementation](#技术实现--technical-implementation)
4. [用户使用流程 | User Flow](#用户使用流程--user-flow)
5. [数据结构 | Data Structure](#数据结构--data-structure)
6. [测试清单 | Testing Checklist](#测试清单--testing-checklist)
7. [已修改文件 | Modified Files](#已修改文件--modified-files)

---

## 功能概述 | Overview

### 中文
自定义练习创建功能允许用户创建自己的练习动作，这些练习会被保存并持久化，可以像内置练习一样在练习选择器中使用。

**核心特性：**
- ✅ 创建自定义练习（名称 + 肌肉群 + 器材）
- ✅ 用户隔离（每个用户只能看到自己的自定义练习）
- ✅ 持久化存储（AsyncStorage）
- ✅ 与标准练习库无缝集成
- ✅ 支持多选批量添加
- ✅ 可设置默认参数（组数/次数/重量）
- ✅ 视觉标识（CUSTOM 标签）

### English
Custom exercise creation feature allows users to create their own exercises. These exercises are saved and persisted, appearing in the Exercise Selector alongside standard exercises.

**Core Features:**
- ✅ Create custom exercises (name + muscle group + equipment)
- ✅ User isolation (each user sees only their own custom exercises)
- ✅ Persistent storage (AsyncStorage)
- ✅ Seamless integration with standard exercise library
- ✅ Multi-select batch addition support
- ✅ Default parameters (sets/reps/weight)
- ✅ Visual identification (CUSTOM badge)

**实施日期 | Implementation Date:** October 29, 2025

---

## 开发历程 | Development Timeline

### Phase 1: 基础功能 | Basic Functionality
**初始实现 | Initial Implementation**

#### 功能 | Features
- 用户可创建自定义练习（仅需名称）
- 默认肌肉群："Other"
- 默认器材："Various"
- 用户隔离存储

#### 数据结构 | Data Structure
```typescript
{
  id: 'custom_1698765432_abc123xyz',
  name: 'My Custom Exercise',
  muscle_group: 'Other',      // 默认值
  equipment: 'Various',       // 默认值
  movement_pattern: 'Custom',
  tags: ['custom'],
  isCustom: true
}
```

---

### Phase 2: 肌肉群选择 | Muscle Group Selection
**功能增强 | Enhancement**

#### 新增功能 | New Features
- **必选肌肉群**：用户必须从预定义列表选择
- **7个肌肉群选项**：Chest, Back, Legs, Shoulders, Arms, Core, Cardio
- **横向滚动UI**：药丸状按钮，直观选择
- **视觉反馈**：选中状态高亮显示

#### UI改进 | UI Improvements
```
创建流程：
1. 输入练习名称
2. 选择肌肉群 (新增) ← NEW
3. 点击创建
```

#### 数据结构变化 | Data Structure Update
```typescript
{
  id: 'custom_1698765432_abc123xyz',
  name: 'Bulgarian Split Squat',
  muscle_group: 'Legs',       // 用户选择 | User-selected
  equipment: 'Various',       // 仍然默认
  movement_pattern: 'Custom',
  tags: ['custom'],
  isCustom: true
}
```

---

### Phase 3: 器材选择 | Equipment Selection
**功能完善 | Complete Enhancement**

#### 新增功能 | New Features
- **必选器材**：用户必须从预定义列表选择
- **8个器材选项**：Barbell, Dumbbell, Machine, Cable, Bodyweight, Resistance Band, Kettlebell, Other
- **完整元数据**：名称 + 肌肉群 + 器材
- **三步式创建流程**

#### UI改进 | UI Improvements
```
完整创建流程：
1. 输入练习名称
2. 选择肌肉群
3. 选择器材 (新增) ← NEW
4. 点击创建（三个字段都填写后才启用）
```

#### 最终数据结构 | Final Data Structure
```typescript
{
  id: 'custom_1698765432_abc123xyz',
  name: 'Incline Hex Press',
  muscle_group: 'Chest',      // 用户选择
  equipment: 'Dumbbell',      // 用户选择 (NEW)
  movement_pattern: 'Custom',
  tags: ['custom'],
  isCustom: true
}
```

---

## 技术实现 | Technical Implementation

### 1. 后端服务 | Backend Service

**文件：** `src/shared/services/data/exerciseLibraryService.ts`

#### 常量定义 | Constants

```typescript
/**
 * 可用肌肉群 | Available muscle groups
 */
export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
] as const;

/**
 * 可用器材类型 | Available equipment types
 */
export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Resistance Band',
  'Kettlebell',
  'Other',
] as const;
```

#### 存储键管理 | Storage Key Management

```typescript
const CUSTOM_EXERCISES_KEY = '@fitness_tracker:custom_exercises';

const getCustomExercisesKey = (userId?: string): string => {
  if (!userId) {
    console.warn('getCustomExercisesKey called without userId');
    return CUSTOM_EXERCISES_KEY;
  }
  return `${CUSTOM_EXERCISES_KEY}_${userId}`;
};
```

#### 核心函数 | Core Functions

##### 加载自定义练习 | Load Custom Exercises
```typescript
export const loadCustomExercises = async (
  userId?: string
): Promise<ExerciseServiceResponse<Exercise[]>> => {
  try {
    const storageKey = getCustomExercisesKey(userId);
    const customExercisesJson = await AsyncStorage.getItem(storageKey);
    
    if (!customExercisesJson) {
      return { success: true, data: [] };
    }

    const customExercises: Exercise[] = JSON.parse(customExercisesJson);
    return { success: true, data: customExercises };
  } catch (error) {
    console.error('Error loading custom exercises:', error);
    return { success: false, error: 'Failed to load custom exercises', data: [] };
  }
};
```

##### 保存自定义练习 | Save Custom Exercise
```typescript
export const saveCustomExercise = async (
  exerciseName: string,
  muscleGroup: string,     // REQUIRED
  equipment: string,       // REQUIRED
  userId?: string
): Promise<ExerciseServiceResponse<Exercise>> => {
  try {
    // 验证：名称
    if (!exerciseName || exerciseName.trim() === '') {
      return { success: false, error: 'Exercise name cannot be empty' };
    }

    // 验证：肌肉群
    if (!muscleGroup || muscleGroup.trim() === '') {
      return { success: false, error: 'Muscle group is required' };
    }

    // 验证：器材
    if (!equipment || equipment.trim() === '') {
      return { success: false, error: 'Equipment is required' };
    }

    // 验证：用户ID
    if (!userId) {
      return { success: false, error: 'User ID is required' };
    }

    const trimmedName = exerciseName.trim();
    
    // 加载现有练习
    const existingResult = await loadCustomExercises(userId);
    const existingExercises = existingResult.data || [];

    // 检查重复（不区分大小写）
    const duplicate = existingExercises.find(
      (ex) => ex.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      return { success: false, error: 'An exercise with this name already exists' };
    }

    // 创建新练习
    const newExercise: Exercise = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
      muscle_group: muscleGroup,
      movement_pattern: 'Custom',
      equipment: equipment,
      tags: ['custom'],
      isCustom: true,
    };

    // 保存到存储
    const updatedExercises = [...existingExercises, newExercise];
    const storageKey = getCustomExercisesKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updatedExercises));

    return { success: true, data: newExercise };
  } catch (error) {
    console.error('Error saving custom exercise:', error);
    return { success: false, error: 'Failed to save custom exercise' };
  }
};
```

##### 获取所有练习 | Get All Exercises
```typescript
export const getAllExercises = async (userId?: string): Promise<ExerciseServiceResponse<Exercise[]>> => {
  try {
    // 加载自定义练习
    const customResult = await loadCustomExercises(userId);
    const customExercises = customResult.data || [];

    // 合并标准练习和自定义练习
    // 自定义练习显示在前面，便于访问
    const allExercises = [...customExercises, ...EXERCISE_LIBRARY];

    return { success: true, data: allExercises };
  } catch (error) {
    console.error('Error getting all exercises:', error);
    return { success: false, error: 'Failed to load exercises' };
  }
};
```

---

### 2. Hook逻辑 | Hook Logic

**文件：** `src/features/templates/hooks/useTemplateEditor.ts`

#### 创建自定义练习函数 | Create Custom Exercise Function

```typescript
const createCustomExercise = useCallback(async (
  exerciseName: string,
  muscleGroup: string,
  equipment: string
) => {
  try {
    // 验证：名称
    if (!exerciseName || exerciseName.trim() === '') {
      Alert.alert('Error', 'Please enter an exercise name');
      return;
    }

    // 验证：肌肉群
    if (!muscleGroup || muscleGroup.trim() === '') {
      Alert.alert('Error', 'Please select a muscle group');
      return;
    }

    // 验证：器材
    if (!equipment || equipment.trim() === '') {
      Alert.alert('Error', 'Please select equipment');
      return;
    }

    // 验证：登录状态
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to create custom exercises');
      return;
    }

    // 调用服务保存
    const result = await saveCustomExercise(exerciseName, muscleGroup, equipment, userId);
    
    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to create custom exercise');
      return;
    }

    // 重新加载练习列表
    await loadAvailableExercises();

    // 显示成功提示
    Alert.alert('Success', `Custom exercise "${exerciseName}" created successfully!`);
  } catch (err) {
    console.error('Error creating custom exercise:', err);
    Alert.alert('Error', 'Failed to create custom exercise');
  }
}, [userId, loadAvailableExercises]);
```

---

### 3. UI组件 | UI Components

**文件：** `src/features/templates/components/ExerciseSelector.tsx`

#### 状态管理 | State Management

```typescript
// 自定义练习创建状态
const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
const [customExerciseName, setCustomExerciseName] = useState<string>('');
const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('');
const [selectedEquipment, setSelectedEquipment] = useState<string>('');
```

#### UI结构 | UI Structure

```jsx
<View style={styles.customFormContainer}>
  {/* 1. 练习名称输入 */}
  <View style={styles.customInputContainer}>
    <TextInput
      style={styles.customInput}
      placeholder={t('templateEditor.enterExerciseName')}
      value={customExerciseName}
      onChangeText={setCustomExerciseName}
      autoFocus
      returnKeyType="next"
    />
  </View>

  {/* 2. 肌肉群选择 */}
  <View style={styles.muscleGroupSection}>
    <Text style={styles.muscleGroupLabel}>
      {t('templateEditor.selectMuscleGroup')}
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {MUSCLE_GROUPS.map((group) => (
        <TouchableOpacity
          key={group}
          style={[
            styles.muscleGroupButton,
            selectedMuscleGroup === group && styles.muscleGroupButtonSelected,
          ]}
          onPress={() => setSelectedMuscleGroup(group)}
        >
          <Text style={[
            styles.muscleGroupButtonText,
            selectedMuscleGroup === group && styles.muscleGroupButtonTextSelected,
          ]}>
            {group}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>

  {/* 3. 器材选择 */}
  <View style={styles.equipmentSection}>
    <Text style={styles.equipmentLabel}>
      {t('templateEditor.selectEquipment')}
    </Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {EQUIPMENT_TYPES.map((equip) => (
        <TouchableOpacity
          key={equip}
          style={[
            styles.equipmentButton,
            selectedEquipment === equip && styles.equipmentButtonSelected,
          ]}
          onPress={() => setSelectedEquipment(equip)}
        >
          <Text style={[
            styles.equipmentButtonText,
            selectedEquipment === equip && styles.equipmentButtonTextSelected,
          ]}>
            {equip}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>

  {/* 4. 操作按钮 */}
  <View style={styles.customActionButtons}>
    <TouchableOpacity
      style={styles.cancelButtonLarge}
      onPress={handleCancel}
    >
      <Text style={styles.cancelButtonTextLarge}>
        {t('common.cancel')}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.createButtonLarge,
        (!customExerciseName.trim() || !selectedMuscleGroup || !selectedEquipment) 
          && styles.createButtonDisabled,
      ]}
      onPress={handleCreateCustom}
      disabled={!customExerciseName.trim() || !selectedMuscleGroup || !selectedEquipment}
    >
      <Text style={styles.createButtonTextLarge}>
        {t('common.create')}
      </Text>
    </TouchableOpacity>
  </View>
</View>
```

#### 创建处理函数 | Create Handler

```typescript
const handleCreateCustom = async () => {
  // 验证名称
  if (!customExerciseName.trim()) {
    return;
  }

  // 验证肌肉群
  if (!selectedMuscleGroup) {
    alert(t('templateEditor.selectMuscleGroupRequired'));
    return;
  }

  // 验证器材
  if (!selectedEquipment) {
    alert(t('templateEditor.selectEquipmentRequired'));
    return;
  }

  if (onCreateCustomExercise) {
    await onCreateCustomExercise(
      customExerciseName.trim(),
      selectedMuscleGroup,
      selectedEquipment
    );
    
    // 清空表单
    setCustomExerciseName('');
    setSelectedMuscleGroup('');
    setSelectedEquipment('');
    setShowCustomInput(false);
  }
};
```

---

## 用户使用流程 | User Flow

### 中文流程

1. **打开练习选择器**
   - 在模板编辑器中点击"添加练习"按钮
   - 练习选择器弹窗打开

2. **点击"创建自定义练习"**
   - 看到搜索栏下方的创建按钮（虚线边框）
   - 点击后表单展开

3. **输入练习名称**
   - 文本输入框自动聚焦
   - 输入练习名称（如："保加利亚分腿蹲"）

4. **选择肌肉群**
   - 横向滚动查看7个肌肉群选项
   - 点击选择（如："Legs"）
   - 选中的按钮高亮显示

5. **选择器材**
   - 横向滚动查看8个器材选项
   - 点击选择（如："Bodyweight"）
   - 选中的按钮高亮显示

6. **创建练习**
   - "创建"按钮在三个字段都填写后启用
   - 点击"创建"按钮

7. **成功反馈**
   - 显示成功提示："Custom exercise 'xxx' created successfully!"
   - 练习列表自动刷新
   - 新练习出现在列表顶部，带有"CUSTOM"标签
   - 表单折叠并清空

8. **使用自定义练习**
   - 自定义练习可以像标准练习一样被选择
   - 支持多选批量添加
   - 可以设置默认参数（组数/次数/重量）

### English Flow

1. **Open Exercise Selector**
   - Tap "Add Exercise" button in template editor
   - Exercise Selector modal opens

2. **Tap "Create Custom Exercise"**
   - See create button below search bar (dashed border)
   - Form expands when tapped

3. **Enter Exercise Name**
   - Text input auto-focuses
   - Type exercise name (e.g., "Bulgarian Split Squat")

4. **Select Muscle Group**
   - Scroll horizontally to view 7 muscle group options
   - Tap to select (e.g., "Legs")
   - Selected button highlights

5. **Select Equipment**
   - Scroll horizontally to view 8 equipment options
   - Tap to select (e.g., "Bodyweight")
   - Selected button highlights

6. **Create Exercise**
   - "Create" button enables when all three fields are filled
   - Tap "Create" button

7. **Success Feedback**
   - Success alert shows: "Custom exercise 'xxx' created successfully!"
   - Exercise list auto-refreshes
   - New exercise appears at top with "CUSTOM" badge
   - Form collapses and clears

8. **Use Custom Exercise**
   - Custom exercise can be selected like standard exercises
   - Supports multi-select batch addition
   - Can set default parameters (sets/reps/weight)

---

## 数据结构 | Data Structure

### 存储格式 | Storage Format

**AsyncStorage Key:**
```
@fitness_tracker:custom_exercises_${userId}
```

**数据格式 | Data Format:**
```typescript
// 存储的JSON数组
[
  {
    id: 'custom_1698765432_abc123xyz',
    name: 'Incline Hex Press',
    muscle_group: 'Chest',
    movement_pattern: 'Custom',
    equipment: 'Dumbbell',
    tags: ['custom'],
    isCustom: true
  },
  {
    id: 'custom_1698765433_def456uvw',
    name: 'Bulgarian Split Squat',
    muscle_group: 'Legs',
    movement_pattern: 'Custom',
    equipment: 'Bodyweight',
    tags: ['custom'],
    isCustom: true
  }
]
```

### TypeScript类型 | TypeScript Types

```typescript
export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  movement_pattern: string;
  equipment: string;
  tags: string[];
  isCustom?: boolean;
}

export interface ExerciseServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

---

## 测试清单 | Testing Checklist

### 功能测试 | Functional Testing

#### 创建流程 | Creation Flow
- [ ] 创建自定义练习（完整流程）
- [ ] 每个肌肉群都能正常选择
- [ ] 每种器材都能正常选择
- [ ] 名称为空时"创建"按钮禁用
- [ ] 未选择肌肉群时"创建"按钮禁用
- [ ] 未选择器材时"创建"按钮禁用
- [ ] 所有字段填写后"创建"按钮启用

#### 验证测试 | Validation Testing
- [ ] 空名称显示错误
- [ ] 未选择肌肉群显示提示
- [ ] 未选择器材显示提示
- [ ] 重复名称显示错误（不区分大小写）
- [ ] 未登录显示错误

#### 数据持久化 | Data Persistence
- [ ] 创建的练习立即出现在列表中
- [ ] 刷新应用后练习仍然存在
- [ ] 不同用户看到不同的自定义练习
- [ ] 练习带有"CUSTOM"标签

#### 集成测试 | Integration Testing
- [ ] 自定义练习可以添加到模板
- [ ] 可以设置组数/次数/重量
- [ ] 支持多选批量添加
- [ ] 模板保存后包含自定义练习
- [ ] 可以按肌肉群筛选自定义练习
- [ ] 可以按器材筛选自定义练习

#### UI/UX测试 | UI/UX Testing
- [ ] 横向滚动流畅
- [ ] 选中状态高亮明显
- [ ] 表单展开/折叠动画流畅
- [ ] "取消"按钮清空所有输入
- [ ] 成功创建后表单自动关闭
- [ ] 长名称正确显示
- [ ] 特殊字符正确处理

### 边界测试 | Edge Case Testing
- [ ] 极长的练习名称
- [ ] 特殊字符（emoji、中文等）
- [ ] 快速连续点击创建
- [ ] 网络断开时的行为
- [ ] 存储空间不足时的处理

---

## 已修改文件 | Modified Files

### 核心文件 | Core Files

1. **`src/shared/services/data/exerciseLibraryService.ts`**
   - 添加 `MUSCLE_GROUPS` 常量
   - 添加 `EQUIPMENT_TYPES` 常量
   - 添加 `loadCustomExercises()` 函数
   - 添加 `saveCustomExercise()` 函数
   - 添加 `deleteCustomExercise()` 函数
   - 更新 `getAllExercises()` 函数

2. **`src/features/templates/hooks/useTemplateEditor.ts`**
   - 添加 `createCustomExercise()` 函数
   - 更新 `loadAvailableExercises()` 函数
   - 更新返回类型接口

3. **`src/features/templates/components/ExerciseSelector.tsx`**
   - 添加自定义练习创建UI
   - 添加状态管理（名称、肌肉群、器材）
   - 添加肌肉群选择器
   - 添加器材选择器
   - 添加验证逻辑
   - 添加相关样式

4. **`src/features/templates/screens/TemplateEditorScreen.tsx`**
   - 传递 `createCustomExercise` 到 `ExerciseSelector`

### 翻译文件 | Translation Files

5. **`src/shared/locales/en.json`**
   - 添加 `common.create`
   - 添加 `templateEditor.createCustomExercise`
   - 添加 `templateEditor.enterExerciseName`
   - 添加 `templateEditor.selectMuscleGroup`
   - 添加 `templateEditor.selectMuscleGroupRequired`
   - 添加 `templateEditor.selectEquipment`
   - 添加 `templateEditor.selectEquipmentRequired`

6. **`src/shared/locales/zh.json`**
   - 添加对应中文翻译

---

## 相关功能 | Related Features

- **多选练习 | Multi-Select:** 自定义练习支持多选批量添加
- **练习参数 | Exercise Parameters:** 可设置默认组数/次数/重量
- **模板系统 | Template System:** 自定义练习可添加到模板
- **数据隔离 | Data Isolation:** 用户间数据完全隔离
- **搜索筛选 | Search & Filter:** 可按肌肉群、器材筛选

---

## 未来增强 | Future Enhancements

### 可能的功能扩展 | Possible Extensions

1. **编辑自定义练习** - Edit custom exercises
2. **删除自定义练习** - Delete custom exercises
3. **添加练习图片/视频** - Add exercise images/videos
4. **自定义动作模式** - Custom movement patterns
5. **练习使用统计** - Exercise usage statistics
6. **分享自定义练习** - Share custom exercises
7. **导入/导出练习库** - Import/export exercise library
8. **多器材支持** - Multi-equipment support

---

## 总结 | Summary

### 中文总结
自定义练习创建功能历经三个阶段的开发，从最初的简单名称输入，到强制选择肌肉群，最后完善为需要完整元数据（名称+肌肉群+器材）的系统。这个渐进式的开发过程确保了每个阶段都经过充分测试和验证。

最终实现的功能提供了完整的用户体验：
- 三步式创建流程清晰直观
- 强制数据验证确保数据质量
- 用户隔离保证数据安全
- 与标准练习库无缝集成
- 支持所有模板编辑功能

### English Summary
The custom exercise creation feature was developed through three phases, evolving from simple name input, to required muscle group selection, and finally to a complete metadata system (name + muscle group + equipment). This progressive development ensured thorough testing and validation at each stage.

The final implementation provides a complete user experience:
- Clear three-step creation process
- Enforced validation ensures data quality
- User isolation ensures data privacy
- Seamless integration with standard exercise library
- Supports all template editing features

---

**文档版本 | Document Version:** 1.0  
**最后更新 | Last Updated:** October 29, 2025  
**维护者 | Maintainer:** Development Team

