/**
 * useTemplates Hook
 * 範本管理 Hook
 * 
 * Custom hook for managing workout templates
 * 用於管理訓練範本的自定義 Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { WorkoutTemplate } from '../types/template.types';

/**
 * Templates hook callbacks interface
 * 範本 Hook 回調介面
 */
export interface UseTemplatesCallbacks {
  showAlert?: (title: string, message: string) => void;
  showSuccess?: (message: string) => void;
}
import {
  getUserTemplates,
  getPresetTemplates,
  deleteTemplate,
  searchTemplates as searchTemplatesService,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
} from '../services/templateService';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';

interface UseTemplatesReturn {
  // State
  userTemplates: WorkoutTemplate[];
  presetTemplates: WorkoutTemplate[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;

  // Actions
  loadTemplates: () => Promise<void>;
  refreshTemplates: () => Promise<void>;
  deleteUserTemplate: (id: string) => Promise<void>;
  searchTemplates: (query: string) => Promise<void>;
  filterByCategory: (category: string) => Promise<void>;
  filterByDifficulty: (difficulty: WorkoutTemplate['difficulty']) => Promise<void>;
  clearFilters: () => Promise<void>;
}

/**
 * Hook for managing workout templates
 * 管理訓練範本的 Hook
 * @param callbacks - Optional callbacks for showing alerts
 */
export const useTemplates = (callbacks?: UseTemplatesCallbacks): UseTemplatesReturn => {
  // Get current user for data isolation
  const { user } = useCloudflareAuth();
  const userId = user?.id;
  
  // Extract callbacks with defaults
  const showAlert = callbacks?.showAlert || ((title: string, message: string) => {
    console.warn('Alert not handled:', title, message);
  });
  const showSuccess = callbacks?.showSuccess || ((message: string) => {
    console.log('Success:', message);
  });

  // State
  const [userTemplates, setUserTemplates] = useState<WorkoutTemplate[]>([]);
  const [presetTemplates, setPresetTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all templates (user + preset)
   * 載入所有範本（用戶 + 預設）
   */
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userResult, presetResult] = await Promise.all([
        getUserTemplates(userId),
        getPresetTemplates(),
      ]);

      if (!userResult.success) {
        throw new Error(userResult.error || 'Failed to load user templates');
      }

      if (!presetResult.success) {
        throw new Error(presetResult.error || 'Failed to load preset templates');
      }

      setUserTemplates(userResult.data || []);
      setPresetTemplates(presetResult.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Refresh templates (for pull-to-refresh)
   * 刷新範本（用於下拉刷新）
   */
  const refreshTemplates = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTemplates();
    } finally {
      setRefreshing(false);
    }
  }, [loadTemplates]);

  /**
   * Delete a user template
   * 刪除用戶範本
   */
  const deleteUserTemplate = useCallback(
    async (id: string) => {
      try {
        const result = await deleteTemplate(id, userId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to delete template');
        }

        // Refresh templates after deletion
        await loadTemplates();

        showSuccess('Template deleted successfully');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete template';
        showAlert('Error', errorMessage);
        console.error('Error deleting template:', err);
      }
    },
    [loadTemplates, userId, showAlert, showSuccess]
  );

  /**
   * Search templates by query
   * 搜尋範本
   */
  const searchTemplates = useCallback(async (query: string) => {
    if (!query.trim()) {
      // If query is empty, reload all templates
      await loadTemplates();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await searchTemplatesService(query, userId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to search templates');
      }

      // Separate user and preset templates from search results
      const allResults = result.data || [];
      const userResults = allResults.filter((t) => t.id.startsWith('user_'));
      const presetResults = allResults.filter((t) => !t.id.startsWith('user_'));

      setUserTemplates(userResults);
      setPresetTemplates(presetResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search templates';
      setError(errorMessage);
      console.error('Error searching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, loadTemplates]);

  /**
   * Filter templates by category
   * 按類別篩選範本
   */
  const filterByCategory = useCallback(async (category: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTemplatesByCategory(category as any, userId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to filter templates');
      }

      // Separate user and preset templates from results
      const allResults = result.data || [];
      const userResults = allResults.filter((t) => t.id.startsWith('user_'));
      const presetResults = allResults.filter((t) => !t.id.startsWith('user_'));

      setUserTemplates(userResults);
      setPresetTemplates(presetResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to filter templates';
      setError(errorMessage);
      console.error('Error filtering templates:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Filter templates by difficulty
   * 按難度篩選範本
   */
  const filterByDifficulty = useCallback(
    async (difficulty: WorkoutTemplate['difficulty']) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTemplatesByDifficulty(difficulty, userId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to filter templates');
        }

        // Separate user and preset templates from results
        const allResults = result.data || [];
        const userResults = allResults.filter((t) => t.id.startsWith('user_'));
        const presetResults = allResults.filter((t) => !t.id.startsWith('user_'));

        setUserTemplates(userResults);
        setPresetTemplates(presetResults);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to filter templates';
        setError(errorMessage);
        console.error('Error filtering templates:', err);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  /**
   * Clear all filters and reload templates
   * 清除所有篩選並重新載入範本
   */
  const clearFilters = useCallback(async () => {
    await loadTemplates();
  }, [loadTemplates]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    // State
    userTemplates,
    presetTemplates,
    loading,
    refreshing,
    error,

    // Actions
    loadTemplates,
    refreshTemplates,
    deleteUserTemplate,
    searchTemplates,
    filterByCategory,
    filterByDifficulty,
    clearFilters,
  };
};

