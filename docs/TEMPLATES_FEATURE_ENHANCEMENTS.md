# Templates Feature: Feature Enhancements

**所有模板功能增强文档**  
**All Template Feature Enhancements Documentation**

---

## 📋 目录 | Table of Contents

1. [功能增强 #1: 多选练习 | Multi-Select Exercises](#功能增强-1-多选练习--multi-select-exercises)
2. [功能增强 #2: 练习参数编辑 | Exercise Parameters](#功能增强-2-练习参数编辑--exercise-parameters)
3. [功能增强 #3: 纯数字输入 | Numeric-Only Input](#功能增强-3-纯数字输入--numeric-only-input)
4. [功能增强 #4: 小数重量支持 | Decimal Weight Support](#功能增强-4-小数重量支持--decimal-weight-support)

---

## 功能增强 #1: 多选练习 | Multi-Select Exercises

### 概述 | Overview

**实施日期 | Date:** 2025-10-29  
**状态 | Status:** ✅ Implemented

#### 中文
允许用户在练习选择器中一次选择多个练习，然后批量添加到模板中。显著提升了创建包含多个练习的模板的效率。

#### English
Allows users to select multiple exercises at once from the Exercise Selector and add them in batch to the template. Significantly improves efficiency when creating templates with multiple exercises.

---

### 功能特性 | Features

#### 1. 多选模式 | Multi-Select Mode

**UI变化 | UI Changes:**
- 点击练习不再立即添加并关闭模态框
- 点击练习在选中/未选中之间切换
- 选中的练习显示视觉反馈（背景色、边框、复选标记）
- 添加"确认"按钮批量添加所有选中的练习

#### 2. 视觉反馈 | Visual Feedback

**选中状态 | Selected State:**
- 背景色：主题色透明度15% (`primaryColor + '15'`)
- 边框：主题色实线，2px
- 复选标记：白色✓在主题色圆形背景上
- 练习名称：主题色高亮

**未选中状态 | Unselected State:**
- 标准卡片背景
- 标准边框
- "+" 加号图标

---

### 技术实现 | Technical Implementation

#### 1. ExerciseSelector 组件 | ExerciseSelector Component

**文件 | File:** `src/features/templates/components/ExerciseSelector.tsx`

##### 添加状态 | Added State

```typescript
const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
```

##### 切换选择函数 | Toggle Selection Function

```typescript
const toggleExerciseSelection = (exercise: Exercise) => {
  setSelectedExercises((prev) => {
    const isSelected = prev.some((ex) => ex.id === exercise.id);
    if (isSelected) {
      return prev.filter((ex) => ex.id !== exercise.id);
    } else {
      return [...prev, exercise];
    }
  });
};
```

##### 确认按钮 | Confirm Button

```typescript
const handleConfirm = () => {
  if (selectedExercises.length > 0 && onConfirmSelection) {
    onConfirmSelection(selectedExercises);
    setSelectedExercises([]);
    onClose();
  }
};
```

##### 页脚UI | Footer UI

```tsx
<View style={styles.footer}>
  <View style={styles.footerContent}>
    <Text style={styles.exerciseCount}>
      {exercises.length} exercises available
    </Text>
    {selectedExercises.length > 0 && onConfirmSelection && (
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirm}
      >
        <Text style={styles.confirmButtonText}>
          {t('common.confirm')} ({selectedExercises.length})
        </Text>
      </TouchableOpacity>
    )}
  </View>
</View>
```

---

#### 2. useTemplateEditor Hook

**文件 | File:** `src/features/templates/hooks/useTemplateEditor.ts`

##### 批量添加函数 | Batch Add Function

```typescript
const addMultipleExercises = useCallback((exercises: Exercise[]) => {
  const newExercises: TemplateExercise[] = [];
  const duplicates: string[] = [];
  const skipped: string[] = [];

  exercises.forEach((exercise) => {
    // 检查重复
    const isDuplicate = exercisesState.some(
      (existingEx) => existingEx.exercise === exercise.name
    );

    if (isDuplicate) {
      duplicates.push(exercise.name);
      return;
    }

    // 创建新练习
    const newExercise: TemplateExercise = {
      id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      exercise: exercise.name,
      muscleGroup: exercise.muscle_group,
      movementPattern: exercise.movement_pattern,
      equipment: exercise.equipment,
      tags: exercise.tags || [],
    };

    newExercises.push(newExercise);
  });

  // 添加所有新练习
  if (newExercises.length > 0) {
    setExercises((prev) => [...prev, ...newExercises]);
  }

  // 显示反馈
  if (newExercises.length > 0 && duplicates.length === 0) {
    Alert.alert(
      'Success',
      `Added ${newExercises.length} exercise(s) to template`,
      [{ text: 'OK', style: 'default' }]
    );
  } else if (newExercises.length > 0 && duplicates.length > 0) {
    Alert.alert(
      'Partially Added',
      `Added ${newExercises.length} exercise(s). Skipped ${duplicates.length} duplicate(s).`,
      [{ text: 'OK', style: 'default' }]
    );
  } else if (duplicates.length > 0) {
    Alert.alert(
      'Duplicates Found',
      `All selected exercises are already in the template.`,
      [{ text: 'OK', style: 'default' }]
    );
  }
}, [exercisesState]);
```

---

### 用户体验流程 | User Flow

```
1. 用户打开练习选择器
   ↓
2. 点击多个练习（不关闭模态框）
   - 每次点击切换选中状态
   - 视觉反馈显示选中的练习
   ↓
3. 查看已选择数量
   - 页脚显示"确认 (3)"按钮
   ↓
4. 点击"确认"按钮
   ↓
5. 系统处理：
   - 检查每个练习是否重复
   - 添加非重复练习
   - 显示结果反馈
   ↓
6. 模态框关闭
   - 选择状态清空
   - 模板显示新添加的练习
```

---

### 优势 | Benefits

**修改前 | Before:**
- ❌ 每次只能添加一个练习
- ❌ 添加后立即关闭模态框
- ❌ 添加多个练习需要重复打开/关闭
- ❌ 效率低，用户体验差

**修改后 | After:**
- ✅ 一次选择多个练习
- ✅ 模态框保持打开直到确认
- ✅ 批量添加，一次完成
- ✅ 重复检查和反馈
- ✅ 显著提升效率

---

## 功能增强 #2: 练习参数编辑 | Exercise Parameters

### 概述 | Overview

**实施日期 | Date:** 2025-10-29  
**状态 | Status:** ✅ Implemented

#### 中文
允许用户在模板中为每个练习设置默认参数：组数(sets)、次数(reps)、重量(weight)。这些参数在创建基于模板的训练时作为建议值。

#### English
Allows users to set default parameters for each exercise in a template: sets, reps, and weight. These parameters serve as suggested values when creating workouts based on the template.

---

### 功能特性 | Features

#### 1. 参数输入字段 | Parameter Input Fields

**为每个练习添加三个输入框：**
- **组数 (Sets):** 整数输入，如 3, 4, 5
- **次数 (Reps):** 整数输入，如 8, 10, 12
- **重量 (Weight):** 小数输入，如 60, 80.5, 100.0

#### 2. 可选参数 | Optional Parameters

- 参数是可选的（不是必填）
- 可以只设置部分参数
- 空参数在使用时不显示建议值

---

### 数据结构 | Data Structure

#### TemplateExercise 接口 | TemplateExercise Interface

**文件 | File:** `src/features/templates/types/template.types.ts`

```typescript
export interface TemplateExercise {
  id: string;
  exercise: string; // 练习名称
  muscleGroup: string;
  movementPattern?: string;
  equipment?: string;
  tags?: string[];
  
  // 可选的建议参数 (新增)
  sets?: number;        // 组数
  reps?: number;        // 次数
  weight?: string;      // 重量 (编辑时为字符串，保存时转为number)
  
  restTime?: number;    // 休息时间(秒)
  instructions?: string; // 说明
}
```

---

### 技术实现 | Technical Implementation

#### 1. TemplateEditorForm 组件

**文件 | File:** `src/features/templates/components/TemplateEditorForm.tsx`

##### 参数输入UI | Parameter Input UI

```tsx
{/* 默认参数部分 */}
<View style={styles.parameterSection}>
  <Text style={styles.sectionLabel}>
    {t('templateEditor.defaultParameters')}
  </Text>
  
  {/* 组数输入 */}
  <View style={styles.paramInputContainer}>
    <Text style={styles.paramInputLabel}>
      {t('templateEditor.sets')}
    </Text>
    <TextInput
      style={styles.paramInput}
      value={exercise.sets?.toString() || ''}
      onChangeText={(value) => {
        const sanitized = value.replace(/[^0-9]/g, '');
        const numValue = sanitized === '' ? undefined : parseInt(sanitized, 10);
        onUpdateExercise(exercise.id, { sets: numValue });
      }}
      placeholder="4"
      placeholderTextColor={theme.textSecondary}
      keyboardType="numeric"
      maxLength={2}
    />
  </View>
  
  {/* 次数输入 */}
  <View style={styles.paramInputContainer}>
    <Text style={styles.paramInputLabel}>
      {t('templateEditor.reps')}
    </Text>
    <TextInput
      style={styles.paramInput}
      value={exercise.reps?.toString() || ''}
      onChangeText={(value) => {
        const sanitized = value.replace(/[^0-9]/g, '');
        const numValue = sanitized === '' ? undefined : parseInt(sanitized, 10);
        onUpdateExercise(exercise.id, { reps: numValue });
      }}
      placeholder="10"
      placeholderTextColor={theme.textSecondary}
      keyboardType="numeric"
      maxLength={3}
    />
  </View>
  
  {/* 重量输入 */}
  <View style={styles.paramInputContainer}>
    <Text style={styles.paramInputLabel}>
      {t('templateEditor.weight')}
    </Text>
    <TextInput
      style={styles.paramInput}
      value={exercise.weight?.toString() || ''}
      onChangeText={(value) => {
        // 允许数字和一个小数点
        let sanitized = value.replace(/[^0-9.]/g, '');
        
        // 确保只有一个小数点
        const parts = sanitized.split('.');
        if (parts.length > 2) {
          sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
        
        const stringValue = sanitized === '' ? undefined : sanitized;
        onUpdateExercise(exercise.id, { weight: stringValue as any });
      }}
      placeholder="80"
      placeholderTextColor={theme.textSecondary}
      keyboardType="decimal-pad"
      maxLength={6}
    />
  </View>
</View>
```

---

#### 2. useTemplateEditor Hook

**文件 | File:** `src/features/templates/hooks/useTemplateEditor.ts`

##### 更新练习函数 | Update Exercise Function

```typescript
const updateExercise = useCallback((
  exerciseId: string,
  updates: Partial<TemplateExercise>
) => {
  setExercises((prev) =>
    prev.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex))
  );
}, []);
```

##### 保存时转换重量 | Convert Weight on Save

```typescript
const saveTemplate = useCallback(async (): Promise<{
  success: boolean;
  templateId?: string;
}> => {
  // ... 验证 ...
  
  try {
    // 保存前将重量字符串转为数字
    const exercisesWithNumericWeights = exercises.map((ex) => {
      const exerciseCopy = { ...ex };
      
      // 转换重量从字符串到数字
      if (typeof exerciseCopy.weight === 'string') {
        const parsed = parseFloat(exerciseCopy.weight);
        exerciseCopy.weight = isNaN(parsed) || 
                             exerciseCopy.weight === '' || 
                             exerciseCopy.weight === '.' 
          ? undefined 
          : parsed;
      }
      
      return exerciseCopy;
    });

    const templateData = {
      name: templateName.trim(),
      description: templateDescription.trim(),
      exercises: exercisesWithNumericWeights,
      category,
      difficulty,
      estimatedTime,
    };

    // 保存逻辑...
  } catch (err) {
    // 错误处理...
  }
}, [/* dependencies */]);
```

---

### 输入验证 | Input Validation

#### 组数和次数 | Sets and Reps
```typescript
// 只允许整数
const sanitized = value.replace(/[^0-9]/g, '');
const numValue = sanitized === '' ? undefined : parseInt(sanitized, 10);
```

**特性 | Features:**
- 自动移除非数字字符
- 空值设为 `undefined`
- 使用 `parseInt()` 确保整数

#### 重量 | Weight
```typescript
// 允许数字和一个小数点
let sanitized = value.replace(/[^0-9.]/g, '');

// 确保只有一个小数点
const parts = sanitized.split('.');
if (parts.length > 2) {
  sanitized = parts[0] + '.' + parts.slice(1).join('');
}
```

**特性 | Features:**
- 允许小数点
- 仅允许一个小数点
- 保存前转换为 `number`
- 空值/无效值设为 `undefined`

---

## 功能增强 #3: 纯数字输入 | Numeric-Only Input

### 概述 | Overview

**实施日期 | Date:** 2025-10-29  
**状态 | Status:** ✅ Implemented

#### 中文
简化了练习参数输入，确保只接受纯数字。组数和次数使用整数，重量使用小数。

#### English
Simplified exercise parameter input to accept only pure numeric values. Sets and reps use integers, weight uses decimals.

---

### 实现细节 | Implementation Details

#### 1. Keyboard Types | 键盘类型

```typescript
// 组数和次数 - 数字键盘
keyboardType="numeric"

// 重量 - 带小数点的数字键盘
keyboardType="decimal-pad"
```

#### 2. 占位符 | Placeholders

**更新前 | Before:**
```typescript
placeholder="8-12"     // 范围值
placeholder="Body Weight + 20kg"  // 复杂描述
```

**更新后 | After:**
```typescript
placeholder="10"       // 纯数字
placeholder="80"       // 纯数字
```

#### 3. 输入清理 | Input Sanitization

**组数/次数 | Sets/Reps:**
```typescript
const sanitized = value.replace(/[^0-9]/g, '');
// 移除所有非数字字符
```

**重量 | Weight:**
```typescript
let sanitized = value.replace(/[^0-9.]/g, '');
// 仅保留数字和小数点

// 确保只有一个小数点
const parts = sanitized.split('.');
if (parts.length > 2) {
  sanitized = parts[0] + '.' + parts.slice(1).join('');
}
```

---

### 预设模板更新 | Preset Templates Update

**文件 | File:** `src/features/templates/services/templateService.ts`

#### 更新所有预设值为纯数字 | Updated All Preset Values to Pure Numbers

**更新前 | Before:**
```typescript
{
  exercise: 'Barbell Bench Press',
  sets: 4,
  reps: '8-12',              // ❌ 字符串范围
  weight: 'Body Weight + 20kg',  // ❌ 文本描述
}
```

**更新后 | After:**
```typescript
{
  exercise: 'Barbell Bench Press',
  sets: 4,
  reps: 10,          // ✅ 纯数字
  weight: 60.5,      // ✅ 纯数字（小数）
}
```

---

## 功能增强 #4: 小数重量支持 | Decimal Weight Support

### 概述 | Overview

**实施日期 | Date:** 2025-10-29  
**状态 | Status:** ✅ Implemented (Bug Fixed)

#### 中文
重量输入字段支持小数（浮点数），如 80.5, 100.0, 62.25。修复了输入小数点时立即消失的bug。

#### English
Weight input field supports decimals (floating-point numbers) like 80.5, 100.0, 62.25. Fixed bug where decimal point would immediately disappear when typed.

---

### Bug: 小数点立即消失 | Bug: Decimal Point Disappears

#### 问题 | Problem

用户输入小数点（如在"80"后输入"."）时，小数点会在输入框中短暂出现然后立即消失。

**原因 | Root Cause:**
```typescript
// 错误的方法：立即转换为number
const numValue = value === '' ? undefined : parseFloat(value);
onUpdateExercise(exercise.id, { weight: numValue });

// 当用户输入"80."时：
parseFloat("80.") // 返回 80
// 小数点丢失！
```

---

### 修复方案 | Fix

#### 1. 数据类型策略 | Data Type Strategy

**编辑时 | During Editing:**
```typescript
// 保持为字符串以保留小数点
weight?: string;
```

**保存时 | On Save:**
```typescript
// 转换为number
weight?: number;
```

---

#### 2. 状态管理 | State Management

**TemplateExercise 接口 | TemplateExercise Interface:**
```typescript
export interface TemplateExercise {
  // ...
  weight?: string;  // 编辑时为字符串
}
```

**TemplateEditorForm 输入处理 | Input Handling:**
```typescript
<TextInput
  value={exercise.weight?.toString() || ''}
  onChangeText={(value) => {
    // 清理：允许数字和一个小数点
    let sanitized = value.replace(/[^0-9.]/g, '');
    
    // 确保只有一个小数点
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // 保持为字符串以保留小数点
    const stringValue = sanitized === '' ? undefined : sanitized;
    onUpdateExercise(exercise.id, { weight: stringValue as any });
  }}
  keyboardType="decimal-pad"
  maxLength={6}
/>
```

---

#### 3. 保存转换 | Save Conversion

**useTemplateEditor.ts:**
```typescript
const saveTemplate = useCallback(async () => {
  // ...
  
  // 保存前转换重量为数字
  const exercisesWithNumericWeights = exercises.map((ex) => {
    const exerciseCopy = { ...ex };
    
    // 转换重量从字符串到数字
    if (typeof exerciseCopy.weight === 'string') {
      const parsed = parseFloat(exerciseCopy.weight);
      exerciseCopy.weight = isNaN(parsed) || 
                           exerciseCopy.weight === '' || 
                           exerciseCopy.weight === '.' 
        ? undefined 
        : parsed;
    }
    
    return exerciseCopy;
  });

  const templateData = {
    // ...
    exercises: exercisesWithNumericWeights, // 现在包含数字重量
  };
  
  // 保存...
}, [/* dependencies */]);
```

---

### 边界情况处理 | Edge Cases Handled

#### 1. 仅输入小数点 | Just Decimal Point
```typescript
输入: "."
存储: "." (字符串)
保存时: undefined (无效值)
```

#### 2. 多个小数点 | Multiple Decimal Points
```typescript
输入: "80.5.5"
清理后: "80.55" (第二个.变成5)
保存时: 80.55
```

#### 3. 空值 | Empty Value
```typescript
输入: "" (清空)
存储: undefined
保存时: undefined
```

#### 4. 完整小数 | Complete Decimal
```typescript
输入: "80.5"
存储: "80.5" (字符串，保留小数点)
显示: "80.5" (可见)
保存时: 80.5 (数字)
```

---

### 工作流程 | Workflow

```
用户输入 "80"
   ↓
状态: weight = "80" (字符串)
显示: "80"
   ↓
用户输入 "."
   ↓
状态: weight = "80." (字符串，保留点)
显示: "80." (小数点可见！✅)
   ↓
用户输入 "5"
   ↓
状态: weight = "80.5" (字符串)
显示: "80.5"
   ↓
用户点击保存
   ↓
转换: parseFloat("80.5") = 80.5
   ↓
保存: weight = 80.5 (数字)
   ↓
下次打开:
加载: weight = 80.5 (数字)
显示: "80.5" (转为字符串显示)
```

---

## 📊 总体影响 | Overall Impact

### 用户体验改进 | UX Improvements

**修改前 | Before:**
- ❌ 每次只能添加一个练习
- ❌ 无法设置练习参数
- ❌ 重量不支持小数
- ❌ 输入复杂，包含文本描述

**修改后 | After:**
- ✅ 支持多选批量添加
- ✅ 可以设置组数/次数/重量
- ✅ 重量支持小数输入
- ✅ 纯数字输入，清晰简单
- ✅ 小数点正确保留和显示

---

### 数据质量 | Data Quality

**改进 | Improvements:**
- ✅ 标准化的数字格式
- ✅ 类型安全（TypeScript验证）
- ✅ 一致的数据结构
- ✅ 正确的小数处理
- ✅ 边界情况妥善处理

---

## 📁 已修改文件汇总 | Files Modified Summary

### 核心文件 | Core Files

1. **`src/features/templates/types/template.types.ts`**
   - 添加可选参数字段（sets, reps, weight）

2. **`src/features/templates/hooks/useTemplateEditor.ts`**
   - 添加 `addMultipleExercises` 函数
   - 添加 `updateExercise` 函数
   - 更新 `saveTemplate` 添加重量转换逻辑

3. **`src/features/templates/components/ExerciseSelector.tsx`**
   - 添加多选状态管理
   - 添加选择切换逻辑
   - 添加确认按钮和页脚UI
   - 更新渲染逻辑显示选中状态

4. **`src/features/templates/components/TemplateEditorForm.tsx`**
   - 添加练习参数输入字段
   - 添加输入清理逻辑
   - 添加相关样式

5. **`src/features/templates/services/templateService.ts`**
   - 更新预设模板使用纯数字值

### 翻译文件 | Translation Files

6. **`src/shared/locales/en.json`**
   - 添加参数相关翻译键

7. **`src/shared/locales/zh.json`**
   - 添加对应中文翻译

---

## 🎯 测试清单 | Testing Checklist

### 多选测试 | Multi-Select Tests
- [x] 选择多个练习
- [x] 取消选择
- [x] 确认按钮显示数量
- [x] 批量添加成功
- [x] 重复检查正常工作
- [x] 反馈消息正确

### 参数编辑测试 | Parameter Editing Tests
- [x] 设置组数（整数）
- [x] 设置次数（整数）
- [x] 设置重量（小数）
- [x] 清空参数
- [x] 保存并重新加载
- [x] 参数正确保存

### 数字输入测试 | Numeric Input Tests
- [x] 组数仅接受整数
- [x] 次数仅接受整数
- [x] 重量接受小数
- [x] 自动移除非数字字符
- [x] 占位符显示正确

### 小数输入测试 | Decimal Input Tests
- [x] 输入"80.5"正确显示
- [x] 小数点不会消失
- [x] 仅允许一个小数点
- [x] 空值正确处理
- [x] 保存后值正确
- [x] 重新加载后显示正确

---

## 📝 总结 | Summary

### 中文总结

本文档整合了模板功能的四个重要功能增强：

1. **多选练习**：显著提升创建包含多个练习的模板的效率
2. **练习参数编辑**：允许为每个练习设置建议的组数、次数和重量
3. **纯数字输入**：简化输入，确保数据质量和一致性
4. **小数重量支持**：正确支持和保存小数重量值

这些增强共同创建了一个功能完整、易用且数据质量高的模板编辑系统。

### English Summary

This document consolidates four important feature enhancements for the templates feature:

1. **Multi-Select Exercises**: Significantly improves efficiency when creating templates with multiple exercises
2. **Exercise Parameters**: Allows setting suggested sets, reps, and weight for each exercise
3. **Numeric-Only Input**: Simplifies input and ensures data quality and consistency
4. **Decimal Weight Support**: Properly supports and saves decimal weight values

Together, these enhancements create a fully-featured, user-friendly template editing system with high data quality.

---

**文档版本 | Document Version:** 1.0  
**最后更新 | Last Updated:** October 29, 2025  
**所有功能状态 | All Features Status:** ✅ Implemented

