/**
 * useAuth Hook Tests
 * useAuth Hook 測試
 * 
 * Unit tests for authentication business logic
 * 認證業務邏輯的單元測試
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../useAuth';
import * as authService from '../../../shared/services/api/authService';

// Mock dependencies
jest.mock('../../../shared/services/api/authService');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAuth());
      
      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Sign In', () => {
    it('should sign in successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        provider: 'email'
      };

      mockAuthService.loginWithEmail.mockResolvedValue({
        user: mockUser,
        token: 'mock-token'
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signIn({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle sign in errors', async () => {
      const errorMessage = 'Invalid credentials';
      mockAuthService.loginWithEmail.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signIn({
            email: 'test@example.com',
            password: 'wrongpassword'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Sign Up', () => {
    it('should sign up successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'newuser@example.com',
        displayName: 'New User',
        provider: 'email'
      };

      mockAuthService.registerWithEmail.mockResolvedValue({
        user: mockUser,
        token: 'mock-token'
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp({
          email: 'newuser@example.com',
          password: 'password123',
          displayName: 'New User'
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle sign up errors', async () => {
      const errorMessage = 'Email already exists';
      mockAuthService.registerWithEmail.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        try {
          await result.current.signUp({
            email: 'existing@example.com',
            password: 'password123',
            displayName: 'Existing User'
          });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      mockAuthService.signOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      // First sign in
      const mockUser = { id: '1', email: 'test@example.com', displayName: 'Test User', provider: 'email' };
      mockAuthService.loginWithEmail.mockResolvedValue({ user: mockUser, token: 'mock-token' });

      await act(async () => {
        await result.current.signIn({ email: 'test@example.com', password: 'password123' });
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when clearError is called', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
