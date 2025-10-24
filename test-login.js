/**
 * Login Feature Test Script
 * 登入功能測試腳本
 * 
 * This script helps test the login functionality programmatically
 * 此腳本幫助程式化測試登入功能
 */

// Test credentials
const testCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

// Test the authentication flow
async function testLogin() {
  console.log('🧪 Starting Login Feature Test...');
  console.log('📧 Test Email:', testCredentials.email);
  console.log('🔒 Test Password:', testCredentials.password);
  
  try {
    // Simulate the login process
    console.log('⏳ Simulating login process...');
    
    // Check if we can access the auth service
    const authService = require('./src/shared/services/api/authService');
    console.log('✅ Auth service loaded successfully');
    
    // Test the login function
    console.log('🔐 Testing loginWithEmail function...');
    const result = await authService.loginWithEmail(testCredentials);
    
    console.log('✅ Login successful!');
    console.log('👤 User data:', result.user);
    
    return {
      success: true,
      user: result.user,
      message: 'Login test passed successfully'
    };
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Login test failed'
    };
  }
}

// Run the test
if (require.main === module) {
  testLogin()
    .then(result => {
      console.log('\n📊 Test Results:');
      console.log('Success:', result.success);
      console.log('Message:', result.message);
      if (result.user) {
        console.log('User ID:', result.user.id);
        console.log('User Email:', result.user.email);
      }
      if (result.error) {
        console.log('Error:', result.error);
      }
    })
    .catch(error => {
      console.error('Test execution failed:', error);
    });
}

module.exports = { testLogin, testCredentials };

