# Live Mode 到 Progress 分頁的數據流

## 📋 完整代碼文件列表

### 🔵 **階段 1: Live Mode 記錄訓練**

#### 1.1 UI 層 (Screens)
- **`src/features/live-workout/screens/LiveModeScreen.tsx`**
  - 主要 UI 界面
  - 調用 `useLiveWorkout` hook
  - 處理用戶交互（完成組數、完成訓練等）

#### 1.2 業務邏輯層 (Hooks)
- **`src/features/live-workout/hooks/useLiveWorkout.ts`**
  - 核心業務邏輯：Logbook Pattern 實現
  - 管理 `completedLog` 狀態（單一數據源）
  - `finishWorkoutHandler`: 將 logbook 轉換為 `CompletedExercise[]` 並調用 `liveWorkoutService.finishWorkout`

#### 1.3 服務層 (Services)
- **`src/features/live-workout/services/liveWorkoutService.ts`**
  - `finishWorkout()`: 接收 `WorkoutSessionData`，聚合每個 `CompletedExercise` 為 `WorkoutInput[]`
  - 計算平均 reps 和 weight
  - 調用 `workoutService.saveMultipleWorkouts()` 批量保存

#### 1.4 類型定義
- **`src/features/live-workout/types/liveWorkout.types.ts`**
  - `ExerciseEntry`: 動作條目
  - `SetEntry`: 組數條目
  - `CompletedExercise`: 完成的動作（包含多個組數）
  - `WorkoutSessionData`: 訓練會話數據

---

### 🟢 **階段 2: 數據保存到存儲**

#### 2.1 訓練記錄服務層
- **`src/features/workouts/services/workoutService.ts`**
  - `saveMultipleWorkouts()`: 批量保存多個 `WorkoutInput` 為 `Workout[]`
  - `loadWorkouts()`: 從 AsyncStorage 載入所有訓練記錄
  - `getPerformedExercisesList()`: 獲取用戶已執行的動作列表（用於 Progress 篩選）
  - `getWorkoutsByExercise()`: 根據動作名稱獲取訓練記錄（用於 Progress 圖表）

#### 2.2 數據驗證
- **`src/shared/utils/helpers/index.js`**
  - `validateInput()`: 驗證 `WorkoutInput` 數據（檢查 `muscleGroupKey`、`exerciseKey` 等）

#### 2.3 類型定義
- **`src/features/workouts/types/workout.types.ts`**
  - `WorkoutInput`: 輸入數據（包含 `exerciseKey`、`muscleGroupKey`）
  - `Workout`: 存儲的訓練記錄（包含 `id`、`date`、`exerciseKey`、`muscleGroupKey`、`sets`、`reps`、`weight`）

#### 2.4 數據存儲
- **AsyncStorage** (React Native)
  - 存儲鍵: `workouts_${userId}` 或 `@fitness_tracker:workouts`
  - 格式: JSON 數組 `Workout[]`

---

### 🟡 **階段 3: Progress 分頁讀取和顯示**

#### 3.1 UI 層 (Screens)
- **`src/features/progress/screens/ProgressChartScreen.tsx`**
  - 主要 UI 界面
  - 調用 `useProgress` hook
  - 顯示圖表、統計數據、動作選擇器

#### 3.2 業務邏輯層 (Hooks)
- **`src/features/progress/hooks/useProgress.ts`**
  - 核心業務邏輯
  - `loadPerformedExercises()`: 調用 `workoutService.getPerformedExercisesList()` 獲取已執行的動作
  - `loadChartData()`: 調用 `progressService.calculateExerciseProgress()` 計算進度數據
  - 管理篩選器狀態（肌肉群、動作、時間範圍、圖表類型）

#### 3.3 服務層 (Services)
- **`src/features/progress/services/progressService.ts`**
  - `calculateExerciseProgress()`: 調用 `workoutService.getWorkoutsByExercise()` 獲取訓練記錄，計算圖表數據點
  - `filterDataByTimeRange()`: 根據時間範圍過濾數據
  - `saveTargetWeight()` / `getTargetWeight()`: 保存/獲取目標重量

#### 3.4 UI 組件
- **`src/features/progress/components/ExerciseSelector.tsx`**
  - 動作和肌肉群選擇器
  - 使用 `performedExercisesList` 顯示已執行的動作

- **`src/features/progress/components/ProgressChart.tsx`**
  - 圖表顯示組件
  - 接收 `chartData` 和 `chartType` 渲染圖表

- **`src/features/progress/components/StatsCard.tsx`**
  - 統計數據卡片
  - 顯示總數、最大值、最新值、改善率等

#### 3.5 類型定義
- **`src/features/progress/types/progress.types.ts`**
  - `ChartDataPoint`: 圖表數據點（`date`、`value`）
  - `ProgressStats`: 統計數據（`total`、`maxWeight`、`latest`、`improvement`）
  - `TimeRange`: 時間範圍（`'7d'`、`'1m'`、`'3m'`、`'6m'`、`'ytd'`、`'ly'`、`'all'`）
  - `ChartType`: 圖表類型（`'weight'`、`'volume'`）

---

## 🔄 數據流圖

```
┌─────────────────────────────────────────────────────────────┐
│ 階段 1: Live Mode 記錄訓練                                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────┐
    │ LiveModeScreen.tsx                  │
    │ - UI 界面                           │
    │ - 用戶交互                          │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ useLiveWorkout.ts                   │
    │ - Logbook Pattern                   │
    │ - completedLog (單一數據源)          │
    │ - finishWorkoutHandler()            │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ liveWorkoutService.ts               │
    │ - finishWorkout()                   │
    │ - 聚合 CompletedExercise            │
    │ - 轉換為 WorkoutInput[]             │
    └──────────────┬──────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│ 階段 2: 數據保存到存儲                                         │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ workoutService.ts                   │
    │ - saveMultipleWorkouts()            │
    │ - validateInput()                   │
    │ - 保存到 AsyncStorage                │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ AsyncStorage                        │
    │ workouts_${userId}                  │
    │ [Workout, Workout, ...]             │
    └──────────────┬──────────────────────┘
                   │
┌─────────────────────────────────────────────────────────────┐
│ 階段 3: Progress 分頁讀取和顯示                                │
└─────────────────────────────────────────────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ ProgressChartScreen.tsx             │
    │ - UI 界面                           │
    │ - 顯示圖表和統計                     │
    └──────────────┬──────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ useProgress.ts                      │
    │ - loadPerformedExercises()          │
    │ - loadChartData()                   │
    │ - 管理篩選器狀態                     │
    └──────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌──────────────────┐
│ workoutService│    │ progressService  │
│               │    │                  │
│ - getPerformed│    │ - calculateExer- │
│   ExercisesList│   │   ciseProgress() │
│               │    │ - filterDataBy-  │
│ - getWorkouts │    │   TimeRange()    │
│   ByExercise()│    │                  │
└───────────────┘    └──────────────────┘
        │                     │
        └──────────┬──────────┘
                   │
                   ▼
    ┌─────────────────────────────────────┐
    │ ProgressChart.tsx                   │
    │ StatsCard.tsx                       │
    │ ExerciseSelector.tsx                 │
    │ - 渲染圖表和統計數據                  │
    └─────────────────────────────────────┘
```

---

## 📝 關鍵數據轉換點

### 1. `completedLog` → `CompletedExercise[]`
**位置**: `useLiveWorkout.ts` → `finishWorkoutHandler()`
```typescript
// Logbook 條目按動作名稱分組
const exercisesMap = new Map<string, CompletedExercise>();
completedLog.forEach(entry => {
  // 將 LogEntry 轉換為 CompletedExercise
});
```

### 2. `CompletedExercise[]` → `WorkoutInput[]`
**位置**: `liveWorkoutService.ts` → `finishWorkout()`
```typescript
// 每個 CompletedExercise 聚合為一個 WorkoutInput
const workoutInputs = exercises.map(completedExercise => {
  // 計算平均 reps 和 weight
  // 轉換為 exerciseKey 和 muscleGroupKey
});
```

### 3. `WorkoutInput[]` → `Workout[]`
**位置**: `workoutService.ts` → `saveMultipleWorkouts()`
```typescript
// 添加 id、createdAt、updatedAt
const newWorkouts = workouts.map(workoutData => ({
  id: generateUniqueId(),
  ...workoutData,
  createdAt: new Date().toISOString(),
}));
```

### 4. `Workout[]` → `ChartDataPoint[]`
**位置**: `progressService.ts` → `calculateExerciseProgress()`
```typescript
// 將訓練記錄轉換為圖表數據點
const chartData = workouts.map(workout => ({
  date: workout.date,
  value: chartType === 'weight' ? workout.weight : workout.weight * workout.reps * workout.sets,
}));
```

---

## 🔑 關鍵函數調用鏈

```
LiveModeScreen.tsx
  └─> useLiveWorkout.finishWorkout()
      └─> liveWorkoutService.finishWorkout()
          └─> workoutService.saveMultipleWorkouts()
              └─> AsyncStorage.setItem()

ProgressChartScreen.tsx
  └─> useProgress.loadPerformedExercises()
      └─> workoutService.getPerformedExercisesList()
  └─> useProgress.loadChartData()
      └─> progressService.calculateExerciseProgress()
          └─> workoutService.getWorkoutsByExercise()
```

---

## 📦 相關測試文件

- `src/features/live-workout/hooks/useLiveWorkout.test.ts`
- `src/features/live-workout/services/liveWorkoutService.test.ts`
- `src/features/workouts/services/__tests__/workoutService.test.ts`
- `src/features/progress/hooks/useProgress.test.ts`
- `src/features/progress/services/progressService.test.ts`

---

## 🎯 總結

**數據流路徑**:
1. **記錄**: `LiveModeScreen` → `useLiveWorkout` → `liveWorkoutService` → `workoutService` → `AsyncStorage`
2. **讀取**: `ProgressChartScreen` → `useProgress` → `workoutService` / `progressService` → `AsyncStorage`
3. **顯示**: `ProgressChartScreen` → `ProgressChart` / `StatsCard` / `ExerciseSelector`

**關鍵設計模式**:
- **Logbook Pattern**: `useLiveWorkout` 使用單一數據源 `completedLog`
- **Service Layer**: 業務邏輯與 UI 分離
- **Data Aggregation**: 多個組數聚合為單一訓練記錄

