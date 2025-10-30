/**
 * Templates Feature - Barrel Export
 * 範本功能 - 統一導出
 * 
 * Central export file for the templates feature
 * 範本功能的中心導出文件
 */

// Screens
export { default as TemplatesScreen } from './screens/TemplatesScreen';
export { default as TemplateEditorScreen } from './screens/TemplateEditorScreen';

// Components
export { default as TemplateCard } from './components/TemplateCard';
export { default as TemplateList } from './components/TemplateList';
export { default as ExerciseSelector } from './components/ExerciseSelector';
export { default as TemplateEditorForm } from './components/TemplateEditorForm';

// Hooks
export { useTemplates } from './hooks/useTemplates';
export { useTemplateEditor } from './hooks/useTemplateEditor';

// Services
export * from './services/templateService';

// Types
export * from './types/template.types';

