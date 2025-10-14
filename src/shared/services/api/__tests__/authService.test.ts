/**
 * AuthService Integration Tests
 * AuthService 整合測試
 * 
 * Integration tests for authentication API service
 * 認證 API 服務的整合測試
 */

import {
  loginWithEmail,
  registerWithEmail,
  signOut,
  getCurrentUser,
  updateUserProfile,
  syncWorkoutData,
  getWorkoutData,
  initializeAuth
} from '../authService';

// Mock CloudflareAuth
const mockCloudflareAuth = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  updateProfile: jest.fn(),
  syncWorkoutData: jest.fn(),
  getWorkoutData: jest.fn(),
  getToken: jest.fn(),
  setToken: jest.fn(),
};

jest.mock('../../config/cloudflare', () => ({
  cloudflareAuth: mockCloudflareAuth
}));

describe('AuthService Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithEmail', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResult = {
        user: {
          id: '1',
          email: 'test@example.com',
          displayName: 'Test User',
          provider: 'email'
        },
        token: 'mock-jwt-token'
      };

      mockCloudflareAuth.login.mockResolvedValue(mockResult);

      const result = await loginWithEmail({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockCloudflareAuth.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle login errors', async () => {
      const errorMessage = 'Invalid credentials';
      mockCloudflareAuth.login.mockRejectedValue(new Error(errorMessage));

      await expect(loginWithEmail({
        email: 'test@example.com',
        password: 'wrongpassword'
      })).rejects.toThrow(errorMessage);
    });
  });

  describe('registerWithEmail', () => {
    it('should register successfully with valid data', async () => {
      const mockResult = {
        user: {
          id: '1',
          email: 'newuser@example.com',
          displayName: 'New User',
          provider: 'email'
        },
        token: 'mock-jwt-token'
      };

      mockCloudflareAuth.register.mockResolvedValue(mockResult);

      const result = await registerWithEmail({
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User'
      });

      expect(mockCloudflareAuth.register).toHaveBeenCalledWith(
        'newuser@example.com',
        'password123',
        'New User'
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle registration errors', async () => {
      const errorMessage = 'Email already exists';
      mockCloudflareAuth.register.mockRejectedValue(new Error(errorMessage));

      await expect(registerWithEmail({
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Existing User'
      })).rejects.toThrow(errorMessage);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      mockCloudflareAuth.logout.mockResolvedValue(undefined);

      await signOut();

      expect(mockCloudflareAuth.logout).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        provider: 'email'
      };

      mockCloudflareAuth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await getCurrentUser();

      expect(mockCloudflareAuth.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUpdatedUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Updated Name',
        provider: 'email'
      };

      mockCloudflareAuth.updateProfile.mockResolvedValue(mockUpdatedUser);

      const result = await updateUserProfile({
        displayName: 'Updated Name'
      });

      expect(mockCloudflareAuth.updateProfile).toHaveBeenCalledWith({
        displayName: 'Updated Name'
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('syncWorkoutData', () => {
    it('should sync workout data successfully', async () => {
      const mockWorkouts = [
        { id: '1', exercise: 'bench_press', weight: 100, reps: 10 },
        { id: '2', exercise: 'squats', weight: 150, reps: 8 }
      ];

      const mockResult = { count: 2, message: 'Data synced successfully' };
      mockCloudflareAuth.syncWorkoutData.mockResolvedValue(mockResult);

      const result = await syncWorkoutData(mockWorkouts);

      expect(mockCloudflareAuth.syncWorkoutData).toHaveBeenCalledWith(mockWorkouts);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getWorkoutData', () => {
    it('should retrieve workout data successfully', async () => {
      const mockWorkouts = [
        { id: '1', exercise: 'bench_press', weight: 100, reps: 10 },
        { id: '2', exercise: 'squats', weight: 150, reps: 8 }
      ];

      mockCloudflareAuth.getWorkoutData.mockResolvedValue(mockWorkouts);

      const result = await getWorkoutData();

      expect(mockCloudflareAuth.getWorkoutData).toHaveBeenCalled();
      expect(result).toEqual(mockWorkouts);
    });
  });

  describe('initializeAuth', () => {
    it('should initialize authentication with existing token', async () => {
      const mockToken = 'existing-jwt-token';
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        provider: 'email'
      };

      mockCloudflareAuth.getToken.mockResolvedValue(mockToken);
      mockCloudflareAuth.getCurrentUser.mockResolvedValue(mockUser);

      const result = await initializeAuth();

      expect(mockCloudflareAuth.getToken).toHaveBeenCalled();
      expect(mockCloudflareAuth.setToken).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockUser);
    });

    it('should return null when no token exists', async () => {
      mockCloudflareAuth.getToken.mockResolvedValue(null);

      const result = await initializeAuth();

      expect(result).toBeNull();
    });
  });
});

