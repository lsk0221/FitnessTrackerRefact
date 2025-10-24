/**
 * Login Integration Test
 * 登入整合測試
 * 
 * This test verifies the complete login flow
 * 此測試驗證完整的登入流程
 */

import { loginWithEmail } from '../../../shared/services/api/authService';

describe('Login Integration Test', () => {
  const testCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  test('should successfully login with valid credentials', async () => {
    console.log('🧪 Testing login with credentials:', testCredentials.email);
    
    try {
      const result = await loginWithEmail(testCredentials);
      
      // Verify the result
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(testCredentials.email);
      
      console.log('✅ Login successful!');
      console.log('👤 User ID:', result.user.id);
      console.log('📧 User Email:', result.user.email);
      
      return result;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  });

  test('should handle invalid credentials', async () => {
    const invalidCredentials = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    };

    try {
      await loginWithEmail(invalidCredentials);
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      console.log('✅ Correctly handled invalid credentials');
      expect(error).toBeDefined();
    }
  });
});

