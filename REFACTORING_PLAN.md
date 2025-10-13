# Fitness Tracker App - Refactoring Plan

## Overview
This document outlines the detailed migration plan for transforming the Fitness Tracker React Native application from a "vibe coding" structure to a well-organized, feature-based architecture.

## Proposed New Directory Structure

```
src/
├── features/                    # Feature-based modules
│   ├── auth/                    # Authentication feature
│   │   ├── components/          # Auth-specific UI components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthProvider.tsx
│   │   ├── hooks/               # Auth-specific hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useAuthState.ts
│   │   ├── services/            # Auth business logic
│   │   │   ├── authService.ts
│   │   │   └── cloudflareAuthService.ts
│   │   ├── types/               # Auth type definitions
│   │   │   └── auth.types.ts
│   │   └── screens/             # Auth screens
│   │       └── LoginScreen.tsx
│   │
│   ├── workouts/                # Workout management feature
│   │   ├── components/
│   │   │   ├── WorkoutForm.tsx
│   │   │   ├── WorkoutHistory.tsx
│   │   │   ├── WorkoutCard.tsx
│   │   │   └── WorkoutStats.tsx
│   │   ├── hooks/
│   │   │   ├── useWorkouts.ts
│   │   │   ├── useWorkoutHistory.ts
│   │   │   └── useWorkoutStats.ts
│   │   ├── services/
│   │   │   ├── workoutService.ts
│   │   │   └── workoutStorageService.ts
│   │   ├── types/
│   │   │   └── workout.types.ts
│   │   └── screens/
│   │       ├── HistoryScreen.tsx
│   │       └── WorkoutInputScreen.tsx
│   │
│   ├── templates/               # Template management feature
│   │   ├── components/
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── TemplateEditor.tsx
│   │   │   ├── TemplateList.tsx
│   │   │   └── ExerciseSelector.tsx
│   │   ├── hooks/
│   │   │   ├── useTemplates.ts
│   │   │   └── useTemplateEditor.ts
│   │   ├── services/
│   │   │   ├── templateService.ts
│   │   │   └── exerciseLibraryService.ts
│   │   ├── types/
│   │   │   └── template.types.ts
│   │   └── screens/
│   │       ├── TemplatesScreen.tsx
│   │       └── TemplateEditorScreen.tsx
│   │
│   ├── live-workout/            # Live workout tracking feature
│   │   ├── components/
│   │   │   ├── LiveWorkoutTimer.tsx
│   │   │   ├── SetTracker.tsx
│   │   │   ├── RestTimer.tsx
│   │   │   └── WorkoutProgress.tsx
│   │   ├── hooks/
│   │   │   ├── useLiveWorkout.ts
│   │   │   └── useWorkoutTimer.ts
│   │   ├── services/
│   │   │   └── liveWorkoutService.ts
│   │   ├── types/
│   │   │   └── liveWorkout.types.ts
│   │   └── screens/
│   │       ├── LiveModeScreen.tsx
│   │       └── WorkoutLobbyScreen.tsx
│   │
│   ├── quick-log/               # Quick logging feature
│   │   ├── components/
│   │   │   ├── QuickLogForm.tsx
│   │   │   ├── BatchLogForm.tsx
│   │   │   └── ExerciseQuickEntry.tsx
│   │   ├── hooks/
│   │   │   └── useQuickLog.ts
│   │   ├── services/
│   │   │   └── quickLogService.ts
│   │   ├── types/
│   │   │   └── quickLog.types.ts
│   │   └── screens/
│   │       └── QuickLogScreen.tsx
│   │
│   ├── progress/                # Progress tracking feature
│   │   ├── components/
│   │   │   ├── ProgressChart.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── ProgressCalendar.tsx
│   │   ├── hooks/
│   │   │   ├── useProgress.ts
│   │   │   └── useProgressStats.ts
│   │   ├── services/
│   │   │   └── progressService.ts
│   │   ├── types/
│   │   │   └── progress.types.ts
│   │   └── screens/
│   │       └── ProgressChartScreen.tsx
│   │
│   └── profile/                 # User profile feature
│       ├── components/
│       │   ├── ProfileStats.tsx
│       │   ├── ProfileSettings.tsx
│       │   └── UserAvatar.tsx
│       ├── hooks/
│       │   └── useProfile.ts
│       ├── services/
│       │   └── profileService.ts
│       ├── types/
│       │   └── profile.types.ts
│       └── screens/
│           ├── ProfileScreen.tsx
│           └── SettingsScreen.tsx
│
├── shared/                      # Shared utilities and components
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # Basic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── charts/              # Chart components
│   │   │   ├── CustomLineChart.tsx
│   │   │   └── ChartContainer.tsx
│   │   ├── forms/               # Form components
│   │   │   ├── FormField.tsx
│   │   │   └── FormValidation.tsx
│   │   └── navigation/           # Navigation components
│   │       ├── TabIcons.tsx
│   │       └── CustomAlert.tsx
│   ├── hooks/                   # Shared hooks
│   │   ├── useTheme.ts
│   │   ├── useUnit.ts
│   │   ├── useStorage.ts
│   │   └── useApi.ts
│   ├── services/                # Shared services
│   │   ├── storage/             # Storage services
│   │   │   ├── asyncStorageService.ts
│   │   │   ├── sqliteService.ts
│   │   │   └── storageMigrationService.ts
│   │   ├── api/                 # API services
│   │   │   ├── apiClient.ts
│   │   │   ├── cloudflareApiService.ts
│   │   │   └── apiErrorHandler.ts
│   │   ├── data/                # Data services
│   │   │   ├── dataMigrationService.ts
│   │   │   ├── dataRecoveryService.ts
│   │   │   └── dataValidationService.ts
│   │   └── utils/               # Utility services
│   │       ├── weightFormatter.ts
│   │       ├── dateFormatter.ts
│   │       └── unitConverter.ts
│   ├── contexts/                # Shared contexts
│   │   ├── ThemeContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── AppStateContext.tsx
│   ├── types/                   # Shared type definitions
│   │   ├── common.types.ts
│   │   ├── api.types.ts
│   │   └── navigation.types.ts
│   ├── constants/               # App constants
│   │   ├── index.ts
│   │   ├── storageKeys.ts
│   │   └── apiEndpoints.ts
│   ├── utils/                   # Utility functions
│   │   ├── helpers/
│   │   │   ├── index.ts
│   │   │   ├── validation.ts
│   │   │   └── formatting.ts
│   │   ├── storage/
│   │   │   ├── storage.ts
│   │   │   └── debugStorage.ts
│   │   └── data/
│   │       ├── dataMigration.ts
│   │       ├── dataRecovery.ts
│   │       └── exerciseDataMigration.ts
│   └── data/                    # Static data
│       ├── exerciseData.ts
│       ├── exerciseMapping.ts
│       ├── hardcodedData.ts
│       └── sampleData.ts
│
└── app/                         # App-level configuration
    ├── navigation/              # Navigation setup
    │   ├── AppNavigator.tsx
    │   ├── AuthNavigator.tsx
    │   ├── MainNavigator.tsx
    │   └── navigationTypes.ts
    ├── providers/               # App providers
    │   ├── AppProviders.tsx
    │   ├── ThemeProvider.tsx
    │   └── AuthProvider.tsx
    ├── types/                   # App-level types
    │   └── app.types.ts
    └── config/                  # App configuration
        ├── appConfig.ts
        ├── cloudflare.ts
        └── database.ts
```

## Migration Plan Table

| Feature/Module | Current Files | New Target Location | Refactoring Steps |
|---|---|---|---|
| ✅ **Authentication** | `src/contexts/CloudflareAuthContext.js`<br>`src/contexts/AuthContext.js`<br>`src/screens/LoginScreen.js`<br>`src/config/cloudflare.js` | `src/features/auth/` | ✅ **COMPLETED** - Extract login/register forms into components, create `useAuth` hook for logic, move API calls to `shared/services/authService.ts`, consolidate auth contexts. Fixed useCallback closure issues and dual authentication engine problem. |
| **Workouts** | `src/hooks/useWorkouts.js`<br>`src/screens/HistoryScreen.js`<br>`src/components/WorkoutInputForm.js`<br>`src/utils/storage.js` | `src/features/workouts/` | Extract workout CRUD operations into `workoutService.ts`, create `useWorkoutHistory` hook, move calendar logic to `WorkoutHistory` component, separate data access from UI |
| **Templates** | `src/screens/TemplatesScreen.js`<br>`src/screens/TemplateEditorScreen.js`<br>`src/components/TemplateEditor.js`<br>`src/components/TemplateManagement.js`<br>`src/data/hardcodedData.js` | `src/features/templates/` | Extract template CRUD operations into `templateService.ts`, create `useTemplates` hook, move exercise library to `shared/data/`, separate template editor logic |
| **Live Workout** | `src/screens/LiveModeScreen.js`<br>`src/components/LiveWorkout.js`<br>`src/components/SmartSwapModal.js` | `src/features/live-workout/` | Extract timer logic into `useWorkoutTimer` hook, create `SetTracker` component, move smart swap logic to `liveWorkoutService.ts`, separate UI from business logic |
| **Quick Log** | `src/screens/QuickLogScreen.js`<br>`src/components/QuickLogWorkout.js` | `src/features/quick-log/` | Extract batch logging logic into `quickLogService.ts`, create `useQuickLog` hook, separate form components from screen logic |
| **Progress Tracking** | `src/components/ProgressChartScreen.js`<br>`src/components/CustomLineChart.js`<br>`src/hooks/useTargetWeights.js` | `src/features/progress/` | Extract chart logic into `ProgressChart` component, create `useProgress` hook, move stats calculations to `progressService.ts`, separate chart rendering from data processing |
| **Profile** | `src/screens/ProfileScreen.js`<br>`src/screens/SettingsScreen.js`<br>`src/hooks/useUnit.js` | `src/features/profile/` | Extract profile management logic into `profileService.ts`, create `useProfile` hook, move settings logic to separate components, consolidate unit management |
| ✅ **Shared UI** | `src/components/TabIcons.js`<br>`src/components/CustomAlert.js`<br>`src/components/Calendar.js`<br>`src/components/UnitConversionModal.js` | `src/shared/components/` | ✅ Move reusable components to `shared/components/`, create component library structure, extract common UI patterns |
| ✅ **Data Management** | `src/database/DatabaseManager.js`<br>`src/database/HybridDataManager.js`<br>`src/database/schema.js`<br>`src/utils/dataMigration.js`<br>`src/utils/dataRecovery.js` | `src/shared/services/` | ✅ Consolidate data management into `shared/services/storage/`, create unified data access layer, move migration logic to `storageMigrationService.ts` |
| ✅ **Theme & UI** | `src/contexts/ThemeContext.js`<br>`src/constants/index.js`<br>`src/types/index.js` | `src/shared/` | ✅ Move theme context to `shared/contexts/`, consolidate constants into `shared/constants/`, move types to `shared/types/` |
| ✅ **Navigation** | `App.js`<br>`index.js` | `src/app/navigation/` | ✅ Extract navigation setup into `AppNavigator.tsx`, create provider structure in `app/providers/`, separate navigation logic from app initialization |
| ✅ **Internationalization** | `src/i18n.js`<br>`src/locales/en.json`<br>`src/locales/zh.json` | `src/shared/` | ✅ Move i18n setup to `shared/`, create language service, consolidate translation management |

## Key Benefits of This Architecture

### **Feature-Based Organization**
- **Clear boundaries** between features
- **Easier maintenance** with related code grouped together
- **Better testability** with isolated feature modules
- **Improved reusability** of components and services

### **Shared Layer Benefits**
- **DRY principle** with reusable components and services
- **Consistent patterns** across features
- **Centralized utilities** and common functionality
- **Unified data access** layer

### **App Layer Benefits**
- **Clean separation** of app-level concerns
- **Centralized configuration** and providers
- **Clear navigation** structure
- **Easier onboarding** for new developers

## Migration Strategy

### ✅ **Phase 1: Foundation** (COMPLETED)
1. ✅ Create new directory structure
2. ✅ Move shared utilities and components
3. ✅ Set up new navigation structure
4. ✅ Create base providers and contexts

### **Phase 2: Core Features** (Priority Order)
1. ✅ **Authentication** - Foundation for user management (COMPLETED)
2. 🔄 **Workouts** - Core business logic (NEXT)
3. **Templates** - Template management system
4. **Progress** - Data visualization

### **Phase 3: Advanced Features**
1. **Live Workout** - Real-time tracking
2. **Quick Log** - Batch operations
3. **Profile** - User management

### **Phase 4: Polish**
1. **Shared Components** - UI library
2. **Data Management** - Storage optimization
3. **Internationalization** - i18n setup

## Implementation Guidelines

### **File Naming Conventions**
- **Components**: PascalCase (e.g., `WorkoutCard.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useWorkouts.ts`)
- **Services**: camelCase ending with 'Service' (e.g., `workoutService.ts`)
- **Types**: camelCase ending with 'types' (e.g., `workout.types.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEYS.ts`)

### **Import/Export Patterns**
- **Barrel exports** for feature modules
- **Named exports** for services and utilities
- **Default exports** for components and screens
- **Type-only imports** for TypeScript types

### **Code Organization Principles**
- **Single Responsibility**: Each file has one clear purpose
- **Dependency Inversion**: High-level modules don't depend on low-level modules
- **Interface Segregation**: Small, focused interfaces
- **Open/Closed**: Open for extension, closed for modification

## Success Metrics

### **Code Quality Improvements**
- **Reduced file sizes**: Target <300 lines per file
- **Improved testability**: Isolated business logic
- **Better maintainability**: Clear separation of concerns
- **Enhanced reusability**: Shared components and services

### **Developer Experience**
- **Faster onboarding**: Clear project structure
- **Easier debugging**: Isolated feature modules
- **Better collaboration**: Feature-based organization
- **Improved performance**: Optimized imports and lazy loading

This plan provides a clear roadmap for transforming the current "vibe coding" structure into a well-organized, maintainable, and scalable feature-based architecture. Each feature can be refactored independently, allowing for incremental progress and testing.

## Current Progress Summary

### **✅ Completed Features**

#### **Authentication Feature - COMPLETED**
- **Files Created**: 
  - `src/features/auth/hooks/useAuth.ts` - Authentication business logic
  - `src/features/auth/components/LoginForm.tsx` - Reusable login form component
  - `src/features/auth/screens/LoginScreen.tsx` - Main login screen
  - `src/shared/services/api/authService.ts` - API service layer
- **Key Fixes Applied**:
  - Fixed useCallback closure issues causing state update problems
  - Resolved dual authentication engine problem
  - Implemented single source of truth for authentication state
  - Added proper error handling and loading states
- **Functionality**: 
  - ✅ Email/password login
  - ✅ User registration with auto-login
  - ✅ Logout functionality
  - ✅ Session management
  - ✅ Automatic navigation after authentication

#### **Foundation Layer - COMPLETED**
- **Directory Structure**: Feature-based architecture implemented
- **Shared Components**: Reusable UI components moved to `src/shared/`
- **Navigation**: Clean navigation structure with proper authentication flow
- **Context Management**: Unified theme and authentication contexts

### **🔄 Next Steps**

#### **Workouts Feature - READY TO START**
- **Priority**: High (core business logic)
- **Estimated Time**: 2-3 days
- **Key Components**:
  - Workout CRUD operations
  - Workout history management
  - Calendar integration
  - Data persistence and synchronization

### **📊 Progress Statistics**
- **Total Features**: 8
- **Completed**: 1 (Authentication)
- **In Progress**: 0
- **Remaining**: 7
- **Completion Rate**: 12.5%

---
*Refactoring Plan created on: $(date)*
*Total features identified: 12*
*Migration phases: 4*
*Last updated: Authentication feature completed*
