/**
 * Browser Console Test for Login Feature
 * 瀏覽器控制台登入功能測試
 * 
 * Copy and paste this into your browser's console to test the login
 * 複製並貼上此代碼到瀏覽器控制台來測試登入
 */

// Test function to run in browser console
function testLoginFeature() {
  console.log('🧪 Starting Login Feature Test...');
  
  // Test 1: Check if the app is loaded
  console.log('📱 Checking if app is loaded...');
  const appElement = document.querySelector('[data-testid="app"]') || document.body;
  console.log('✅ App element found:', !!appElement);
  
  // Test 2: Look for login form elements
  console.log('🔍 Looking for login form elements...');
  
  // Look for email input
  const emailInput = document.querySelector('input[type="email"]') || 
                    document.querySelector('input[placeholder*="email" i]') ||
                    document.querySelector('input[placeholder*="電子郵件"]');
  console.log('📧 Email input found:', !!emailInput);
  
  // Look for password input
  const passwordInput = document.querySelector('input[type="password"]') ||
                       document.querySelector('input[placeholder*="password" i]') ||
                       document.querySelector('input[placeholder*="密碼"]');
  console.log('🔒 Password input found:', !!passwordInput);
  
  // Look for login button
  const loginButton = document.querySelector('button') ||
                     document.querySelector('[role="button"]') ||
                     document.querySelector('input[type="submit"]');
  console.log('🔘 Login button found:', !!loginButton);
  
  // Test 3: Check console logs
  console.log('📊 Checking for authentication logs...');
  
  // Monitor console for specific messages
  const originalLog = console.log;
  const authLogs = [];
  
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('AppContent') || 
        message.includes('Sign in') || 
        message.includes('user state')) {
      authLogs.push(message);
    }
    originalLog.apply(console, args);
  };
  
  // Test 4: Simulate login if elements are found
  if (emailInput && passwordInput && loginButton) {
    console.log('🎯 Attempting to simulate login...');
    
    // Fill in credentials
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Click login button
    loginButton.click();
    
    // Wait and check for success
    setTimeout(() => {
      console.log('⏰ Checking for login success...');
      console.log('📋 Authentication logs captured:', authLogs);
      
      const successLog = authLogs.find(log => 
        log.includes('AppContent - showing MainApp')
      );
      
      if (successLog) {
        console.log('✅ LOGIN TEST SUCCESSFUL!');
        console.log('🎉 Found success log:', successLog);
      } else {
        console.log('❌ LOGIN TEST FAILED');
        console.log('📋 Available logs:', authLogs);
      }
      
      // Restore original console.log
      console.log = originalLog;
    }, 3000);
    
  } else {
    console.log('❌ Required elements not found');
    console.log('📋 Available elements:');
    console.log('- Email input:', !!emailInput);
    console.log('- Password input:', !!passwordInput);
    console.log('- Login button:', !!loginButton);
  }
}

// Auto-run the test
console.log('🚀 Browser Login Test Ready');
console.log('📝 Run testLoginFeature() to start the test');

// Export for manual execution
window.testLoginFeature = testLoginFeature;