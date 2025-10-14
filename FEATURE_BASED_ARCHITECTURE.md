# Fitness Tracker App - Feature-Based Architecture

## 📋 Overview
This document provides a comprehensive overview of the Feature-Based Architecture implemented in the Fitness Tracker React Native application. The project is organized by features rather than by file types, making it easier to maintain, scale, and understand.

## 🏗️ Architecture Principles

### **Feature-Based Organization**
- Each feature is self-contained with its own components, hooks, services, and types
- Shared functionality is placed in the `shared` directory
- App-level configuration and navigation are in the `app` directory

### **Separation of Concerns**
- **UI Components** → `components/`
- **Business Logic** → `hooks/` and `services/`
- **Data Management** → `services/`
- **Type Definitions** → `types/`
- **Screen Components** → `screens/`

---

## 📁 Project Structure

```
src/
├── app/                           # App-level configuration
├── features/                      # Feature-based modules
├── shared/                        # Shared functionality
└── screens/                       # Temporary placeholders
```

---

## 🔐 Authentication Feature

**Location**: `src/features/auth/`

### **Purpose**
Handles user authentication, registration, and session management.

### **Files Structure**
```
auth/
├── components/
│   └── LoginForm.tsx              # Login/Register form component
├── hooks/
│   ├── useAuth.ts                 # Authentication business logic hook
│   └── __tests__/
│       └── useAuth.test.ts        # Unit tests for useAuth hook
├── screens/
│   └── LoginScreen.tsx            # Login screen container
├── services/                      # (Empty - using shared services)
└── types/                         # (Empty - using shared types)
```

### **Key Components**
- **`LoginForm.tsx`** - Reusable form component for login/register
- **`useAuth.ts`** - Core authentication logic and state management
- **`LoginScreen.tsx`** - Main authentication screen container

### **Dependencies**
- Uses `shared/services/api/authService.ts` for API calls
- Uses `shared/contexts/CloudflareAuthContext.js` for global state

---

## 🏋️ Workouts Feature

**Location**: `src/features/workouts/`

### **Purpose**
Manages workout tracking, history, and statistics.

### **Files Structure**
```
workouts/
├── components/                    # (Empty - to be implemented)
├── hooks/                         # (Empty - to be implemented)
├── screens/                       # (Empty - to be implemented)
├── services/                      # (Empty - to be implemented)
└── types/                         # (Empty - to be implemented)
```

### **Planned Components**
- Workout input forms
- Workout history display
- Workout statistics
- Exercise tracking

---

## 📋 Templates Feature

**Location**: `src/features/templates/`

### **Purpose**
Manages workout templates and template editing.

### **Files Structure**
```
templates/
├── components/                    # (Empty - to be implemented)
├── hooks/                         # (Empty - to be implemented)
├── screens/                       # (Empty - to be implemented)
├── services/                      # (Empty - to be implemented)
└── types/                         # (Empty - to be implemented)
```

### **Planned Components**
- Template creation and editing
- Template library management
- Template sharing

---

## 📊 Progress Feature

**Location**: `src/features/progress/`

### **Purpose**
Handles progress tracking, charts, and analytics.

### **Files Structure**
```
progress/
├── components/                    # (Empty - to be implemented)
├── hooks/                         # (Empty - to be implemented)
├── screens/                       # (Empty - to be implemented)
├── services/                      # (Empty - to be implemented)
└── types/                         # (Empty - to be implemented)
```

### **Planned Components**
- Progress charts and graphs
- Analytics dashboard
- Goal tracking

---

## ⚡ Live Workout Feature

**Location**: `src/features/live-workout/`

### **Purpose**
Real-time workout tracking and live mode functionality.

### **Files Structure**
```
live-workout/
├── components/                    # (Empty - to be implemented)
├── hooks/                         # (Empty - to be implemented)
├── screens/                       # (Empty - to be implemented)
├── services/                      # (Empty - to be implemented)
└── types/                         # (Empty - to be implemented)
```

### **Planned Components**
- Live workout timer
- Real-time exercise tracking
- Workout session management

---

## ⚡ Quick Log Feature

**Location**: `src/features/quick-log/`

### **Purpose**
Quick workout logging and rapid data entry.

### **Files Structure**
```
quick-log/
├── components/                    # (Empty - to be implemented)
├── hooks/                         # (Empty - to be implemented)
├── screens/                       # (Empty - to be implemented)
├── services/                      # (Empty - to be implemented)
└── types/                         # (Empty - to be implemented)
```

### **Planned Components**
- Quick exercise logging
- Rapid data entry forms
- One-tap logging

---

## 👤 Profile Feature

**Location**: `src/features/profile/`

### **Purpose**
User profile management and settings.

### **Files Structure**
```
profile/
├── components/                    # (Empty - to be implemented)
├── hooks/                         # (Empty - to be implemented)
├── screens/                       # (Empty - to be implemented)
├── services/                      # (Empty - to be implemented)
└── types/                         # (Empty - to be implemented)
```

### **Planned Components**
- User profile editing
- Settings management
- Account preferences

---

## 🔧 App-Level Configuration

**Location**: `src/app/`

### **Purpose**
Application-level configuration, navigation, and providers.

### **Files Structure**
```
app/
├── config/
│   └── cloudflare.js              # Cloudflare API configuration
├── navigation/
│   ├── AppNavigator.tsx            # Main navigation structure
│   └── types.ts                    # Navigation type definitions
├── providers/                      # (Empty - to be implemented)
└── types/                         # (Empty - to be implemented)
```

### **Key Files**
- **`AppNavigator.tsx`** - Main navigation logic and screen routing
- **`cloudflare.js`** - Backend API configuration
- **`types.ts`** - Navigation type definitions

---

## 🤝 Shared Functionality

**Location**: `src/shared/`

### **Purpose**
Reusable components, services, and utilities used across multiple features.

### **Files Structure**
```
shared/
├── components/
│   ├── charts/
│   │   └── CustomLineChart.js      # Reusable chart component
│   ├── forms/
│   │   └── UnitConversionModal.js  # Unit conversion modal
│   ├── navigation/
│   │   ├── CustomAlert.js          # Custom alert component
│   │   └── TabIcons.js             # Tab navigation icons
│   ├── ui/
│   │   ├── Calendar.js             # Calendar component
│   │   └── LoadingButton.tsx      # Loading button component
│   └── ProgressChartScreen.js      # Progress chart screen
├── constants/
│   └── index.js                    # Application constants
├── contexts/
│   ├── CloudflareAuthContext.js    # Authentication context
│   └── ThemeContext.js             # Theme management context
├── data/
│   ├── exerciseData.js             # Exercise database
│   ├── exerciseMapping.js          # Exercise mapping data
│   ├── hardcodedData.js            # Static data
│   └── sampleData.js               # Sample data for testing
├── hooks/
│   ├── useUnit.js                  # Unit conversion hook
│   └── useWorkouts.js              # Workout data hook
├── i18n.js                         # Internationalization setup
├── locales/
│   ├── en.json                     # English translations
│   └── zh.json                     # Chinese translations
├── services/
│   ├── api/
│   │   ├── authService.ts          # Authentication API service
│   │   └── __tests__/
│   │       └── authService.test.ts  # API service tests
│   ├── data/
│   │   ├── dataMigration.js        # Data migration utilities
│   │   └── dataRecovery.js         # Data recovery tools
│   ├── storage/                    # (Empty - to be implemented)
│   └── utils/
│       └── weightFormatter.js      # Weight formatting utilities
├── types/
│   └── index.js                    # Shared type definitions
└── utils/
    ├── data/
    │   └── exerciseDataMigration.js # Exercise data migration
    ├── helpers/
    │   └── index.js                 # Helper functions
    └── storage/
        └── storage.js               # Storage utilities
```

### **Key Shared Components**
- **`LoadingButton.tsx`** - Reusable button with loading states
- **`CustomLineChart.js`** - Chart visualization component
- **`TabIcons.js`** - Navigation tab icons
- **`CustomAlert.js`** - Custom alert dialog

### **Key Shared Services**
- **`authService.ts`** - Authentication API calls
- **`weightFormatter.js`** - Weight formatting utilities
- **`dataMigration.js`** - Data migration tools

### **Key Shared Contexts**
- **`CloudflareAuthContext.js`** - Global authentication state
- **`ThemeContext.js`** - Theme management (light/dark mode)

---

## 📱 Temporary Placeholders

**Location**: `src/screens/placeholders/`

### **Purpose**
Temporary placeholder screens used during the refactoring process.

### **Files Structure**
```
placeholders/
├── HistoryScreenPlaceholder.tsx    # History screen placeholder
├── LiveModeScreenPlaceholder.tsx   # Live mode placeholder
├── LoginScreenPlaceholder.tsx      # Login screen placeholder
├── ProfileScreenPlaceholder.tsx    # Profile screen placeholder
├── ProgressChartScreenPlaceholder.tsx # Progress chart placeholder
├── QuickLogScreenPlaceholder.tsx  # Quick log placeholder
├── TemplateEditorScreenPlaceholder.tsx # Template editor placeholder
├── TemplatesScreenPlaceholder.tsx # Templates screen placeholder
└── WorkoutLobbyScreenPlaceholder.tsx # Workout lobby placeholder
```

---

## 🧪 Testing Structure

### **Unit Tests**
- **`src/features/auth/hooks/__tests__/useAuth.test.ts`** - Authentication hook tests
- **`src/shared/services/api/__tests__/authService.test.ts`** - API service tests

### **Test Configuration**
- **`src/setupTests.ts`** - Test setup configuration
- **`jest.config.js`** - Jest testing configuration

---

## 📊 Current Implementation Status

### **✅ Completed Features**
- **Authentication** - Fully implemented with login/register functionality
- **Navigation** - Complete navigation structure
- **Theme Management** - Light/dark mode support
- **Shared Components** - Reusable UI components

### **🔄 In Progress**
- **Code Documentation** - Detailed inline comments added
- **Testing Infrastructure** - Unit tests implemented

### **📋 Planned Features**
- **Workouts** - Workout tracking and management
- **Templates** - Template creation and editing
- **Progress** - Progress tracking and analytics
- **Live Workout** - Real-time workout tracking
- **Quick Log** - Quick workout logging
- **Profile** - User profile management

---

## 🎯 Benefits of Feature-Based Architecture

### **1. Maintainability**
- Each feature is self-contained
- Easy to locate and modify specific functionality
- Clear separation of concerns

### **2. Scalability**
- Easy to add new features
- Minimal impact on existing code
- Independent feature development

### **3. Team Collaboration**
- Different developers can work on different features
- Reduced merge conflicts
- Clear ownership of code

### **4. Testing**
- Feature-specific testing
- Easier to mock dependencies
- Isolated test environments

### **5. Code Reusability**
- Shared components and services
- Consistent patterns across features
- Reduced code duplication

---

## 🚀 Next Steps

### **Phase 1: Core Features (Current)**
- ✅ Authentication
- 🔄 Navigation
- 🔄 Theme Management

### **Phase 2: Workout Features**
- 📋 Workouts
- 📋 Templates
- 📋 Progress

### **Phase 3: Advanced Features**
- 📋 Live Workout
- 📋 Quick Log
- 📋 Profile

### **Phase 4: Polish**
- 📋 Performance optimization
- 📋 Advanced testing
- 📋 Documentation

---

## 📚 Documentation

- **`README.md`** - Project overview and setup
- **`REFACTORING_PLAN.md`** - Detailed refactoring plan
- **`FEATURE_BASED_ARCHITECTURE.md`** - This document
- **Inline Comments** - Detailed code documentation

---

*This document is maintained alongside the codebase and should be updated as new features are implemented.*
