/**
 * Login Screen
 * 登入畫面
 * 
 * This is the main login screen that orchestrates the authentication flow
 * 這是主要的登入畫面，協調認證流程
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import { useAppAlert } from '../../../shared/hooks/useAppAlert';
import { LoginForm } from '../components/LoginForm';
import { GOOGLE_IOS_CLIENT_ID } from '../../../app/config/cloudflare';
// @ts-ignore - Expo vector icons types
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Complete web browser authentication session
WebBrowser.maybeCompleteAuthSession();

interface LoginScreenProps {
  navigation: any;
  theme: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, theme }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [displayName, setDisplayName] = useState('');

  // Auth hook
  const {
    signIn,
    signUp,
    signInLocal,
    handleGoogleLogin,
    loading,
    error,
    clearError
  } = useCloudflareAuth();

  // App Alert hook
  const { showAlert, showConfirmation, showOptions, renderAlert } = useAppAlert();

  // 防止重複處理同一個 response 的狀態鎖
  // State lock to prevent processing the same response multiple times
  const [isProcessing, setIsProcessing] = useState(false);
  const processedCodesRef = useRef<Set<string>>(new Set());
  const processedIdTokensRef = useRef<Set<string>>(new Set());

  // Google OAuth configuration - iOS Native Flow
  // 強制使用 iOS 原生流程，移除所有 Web 相關參數以避免 Google OAuth 2.0 policy error
  // Force iOS native flow, remove all web-related parameters to avoid Google OAuth 2.0 policy error
  
  // 生成 nonce 以滿足 OpenID Connect 協議要求（使用 id_token 時必須提供）
  // Generate nonce to satisfy OpenID Connect protocol requirement (required when using id_token)
  const nonce = React.useMemo(() => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }, []);

  // 從 iOS Client ID 生成 REVERSED_CLIENT_ID (用於 redirectUri)
  // Generate REVERSED_CLIENT_ID from iOS Client ID (for redirectUri)
  // iOS Client ID 格式: "CLIENT_ID.apps.googleusercontent.com"
  // REVERSED_CLIENT_ID 格式: "com.googleusercontent.apps.CLIENT_ID"
  const reversedClientId = React.useMemo(() => {
    if (!GOOGLE_IOS_CLIENT_ID) return '';
    
    // 提取 Client ID 部分（去掉 .apps.googleusercontent.com 後綴）
    const clientIdPart = GOOGLE_IOS_CLIENT_ID.replace('.apps.googleusercontent.com', '');
    
    // 構建 REVERSED_CLIENT_ID
    return `com.googleusercontent.apps.${clientIdPart}`;
  }, [GOOGLE_IOS_CLIENT_ID]);

  // Google iOS 原生登入強制要求的 Redirect URI 格式
  // Required redirectUri format for Google iOS native login
  const redirectUri = React.useMemo(() => {
    if (!reversedClientId) return '';
    
    // 使用 makeRedirectUri 生成，或直接構建字符串
    // 格式: "com.googleusercontent.apps.CLIENT_ID:/oauth2redirect/google"
    return `${reversedClientId}:/oauth2redirect/google`;
  }, [reversedClientId]);

  // iOS Native Flow: 使用 iosClientId 和對應的 redirectUri
  // iOS Native Flow: Use iosClientId and corresponding redirectUri
  // 注意：必須同時提供 clientId 和 iosClientId，否則 Google 會返回 401: invalid_client
  // Note: Must provide both clientId and iosClientId, otherwise Google returns 401: invalid_client
  // 注意：使用 Authorization Code Flow，需要啟用 PKCE 並交換 code 為 id_token
  // Note: Using Authorization Code Flow, need to enable PKCE and exchange code for id_token
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_IOS_CLIENT_ID, // ✅ 必須明確提供，否則 Google 收不到 Client ID
      iosClientId: GOOGLE_IOS_CLIENT_ID, // iOS Client ID
      redirectUri: redirectUri, // 必需的 redirectUri（使用 REVERSED_CLIENT_ID scheme）
      scopes: ['openid', 'profile', 'email'],
      // responseType 已移除，使用預設值（code 流程）
      usePKCE: true, // ✅ 啟用 PKCE（Code Flow 需要）
      extraParams: {
        nonce: nonce, // 保留 nonce 以增強安全性
      },
    } as any, // 暫時忽略類型檢查以修復 Google 400 錯誤
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  // Debug logs removed for production security
  // 調試日誌已移除以符合生產環境安全要求

  // Diagnostic logs - 診斷日誌（僅在需要時啟用）
  // useEffect(() => {
  //   console.log('=== LoginScreen Debug Info ===');
  //   console.log('1. Platform:', Platform.OS);
  //   console.log('2. iOS Client ID present:', !!GOOGLE_IOS_CLIENT_ID);
  //   console.log('3. iOS Client ID value:', GOOGLE_IOS_CLIENT_ID ? `${GOOGLE_IOS_CLIENT_ID.substring(0, 20)}...` : 'MISSING');
  //   console.log('4. Google Request Object:', !!request);
  //   console.log('============================');
  // }, [request]);

  // Handle Google OAuth response
  useEffect(() => {
    // 強化防護：檢查 request、response 和處理狀態
    // Enhanced protection: check request, response, and processing state
    if (!request || !response || isProcessing) {
      return;
    }

    // 提前檢查已處理的 code/id_token，避免不必要的日誌
    // Early check for processed code/id_token to avoid unnecessary logs
    const params = (response as any)?.params;
    if (params?.id_token && processedIdTokensRef.current.has(params.id_token)) {
      return; // 已處理，直接返回，不打印日誌
    }
    if (params?.code && processedCodesRef.current.has(params.code)) {
      return; // 已處理，直接返回，不打印日誌
    }

    if (response?.type === 'success') {
      // 情況 1: 直接收到 id_token（Implicit Flow）
      if (params?.id_token) {
        const idToken = params.id_token;
        
        // 再次檢查（雙重防護）
        // Double check (defense in depth)
        if (processedIdTokensRef.current.has(idToken)) {
          return;
        }
        
        // 標記為正在處理，並記錄已處理的 id_token
        // Mark as processing and record processed id_token
        setIsProcessing(true);
        processedIdTokensRef.current.add(idToken);
        
        handleGoogleLogin(idToken)
          .then(() => {
            // Success - no logging needed
          })
          .catch((error) => {
            console.error('Google login failed:', error.message || error);
            
            // 只有可重試的錯誤才從已處理列表中移除
            // 400 invalid_grant 等錯誤不應該重試
            // Only remove from processed list for retryable errors
            // 400 invalid_grant and similar errors should NOT be retried
            const errorMessage = error.message?.toLowerCase() || '';
            const errorStatus = error.response?.status || error.status;
            const isRetryableError = 
              errorMessage.includes('network') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('connection') ||
              errorMessage.includes('無法連接') ||
              errorMessage.includes('服務器錯誤') ||
              (errorStatus >= 500); // 5xx 錯誤可重試
            
            // 400 錯誤（如 invalid_grant）絕對不重試
            // 400 errors (like invalid_grant) should NEVER be retried
            const is400Error = errorStatus === 400 || 
                               errorMessage.includes('invalid_grant') ||
                               errorMessage.includes('invalid_request') ||
                               errorMessage.includes('400');
            
            if (!is400Error && isRetryableError) {
              processedIdTokensRef.current.delete(idToken);
            }
            
            showAlert({
              title: 'Google 登入失敗',
              message: error.message || '無法完成 Google 登入',
            });
          })
          .finally(() => {
            setIsProcessing(false);
          });
      }
      // 情況 2: 收到 code，使用 Authorization Code Flow (Backend Exchange)
      // Case 2: Received code, use Authorization Code Flow (Backend Exchange)
      else if (params?.code) {
        const code = params.code;
        
        // 再次檢查（雙重防護）
        // Double check (defense in depth)
        if (processedCodesRef.current.has(code)) {
          return;
        }
        
        // 標記為正在處理，並記錄已處理的 code
        // Mark as processing and record processed code
        setIsProcessing(true);
        processedCodesRef.current.add(code);
        
        // 直接將 code 傳遞給後端，由後端完成交換與驗證
        // Directly pass code to backend, let backend handle exchange and validation
        // Google 要求 iOS 原生應用在交換 Token 時必須提供完整的 Redirect URI
        // Google requires iOS native apps to provide full Redirect URI when exchanging token
        const codeExchangeParams = {
          code: code,
          codeVerifier: request?.codeVerifier || '',
          redirectUri: redirectUri, // 使用完整的 Redirect URI（反轉 Scheme）
        };
        
        handleGoogleLogin(codeExchangeParams)
          .then(() => {
            // Success - no logging needed
          })
          .catch((error) => {
            console.error('Google login failed:', error.message || error);
            
            // 只有可重試的錯誤才從已處理列表中移除
            // 400 invalid_grant 等錯誤不應該重試
            // Only remove from processed list for retryable errors
            // 400 invalid_grant and similar errors should NOT be retried
            const errorMessage = error.message?.toLowerCase() || '';
            const errorStatus = error.response?.status || error.status;
            const isRetryableError = 
              errorMessage.includes('network') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('connection') ||
              errorMessage.includes('無法連接') ||
              errorMessage.includes('服務器錯誤') ||
              (errorStatus >= 500); // 5xx 錯誤可重試
            
            // 400 錯誤（如 invalid_grant）絕對不重試
            // 400 errors (like invalid_grant) should NEVER be retried
            const is400Error = errorStatus === 400 || 
                               errorMessage.includes('invalid_grant') ||
                               errorMessage.includes('invalid_request') ||
                               errorMessage.includes('400');
            
            if (!is400Error && isRetryableError) {
              processedCodesRef.current.delete(code);
            }
            
            showAlert({
              title: 'Google 登入失敗',
              message: error.message || '無法完成 Google 登入',
            });
          })
          .finally(() => {
            setIsProcessing(false);
          });
      }
      // 情況 3: 既沒有 id_token 也沒有 code
      else {
        console.warn('⚠️ Google OAuth success but no id_token or code in params');
        console.warn('⚠️ Available params keys:', params ? Object.keys(params) : 'No params');
        showAlert({
          title: '登入異常',
          message: 'Google 登入成功但未收到身份令牌或授權碼，請重試',
        });
      }
    } else if (response?.type === 'error') {
      const error = (response as any).error;
      console.error('❌ Google OAuth Error Response');
      console.error('❌ Error Code:', error?.code);
      console.error('❌ Error Message:', error?.message);
      
      // Only show error if not user cancellation
      if (error?.message !== 'User cancelled') {
        console.error('❌ Google OAuth error:', error);
        showAlert({
          title: 'Google 登入失敗',
          message: error?.message || '無法完成 Google 登入',
        });
      }
    } else if (response?.type === 'dismiss') {
      // User dismissed - no action needed
    } else if (response) {
      console.warn('Unknown Google OAuth response type:', response.type);
    }
  }, [response, handleGoogleLogin, showAlert, isProcessing, request, redirectUri, nonce]);

  // Handle email authentication
  const handleEmailAuth = async () => {
    if (!email || !password) {
      showAlert({
        title: '錯誤',
        message: '請填寫所有欄位',
      });
      return;
    }

    if (isSignUp && !displayName) {
      showAlert({
        title: '錯誤',
        message: '請填寫姓名',
      });
      return;
    }

    clearError();

    try {
      if (isSignUp) {
        await signUp({ email, password, displayName });
        // 註冊成功後不需要顯示訊息，因為會自動導航到主應用程式
        // Registration success will automatically navigate to main app
      } else {
        await signIn({ email, password });
        // 登入成功後不需要顯示訊息，因為會自動導航到主應用程式
        // Login success will automatically navigate to main app
      }
    } catch (error) {
      // Handle specific error cases
      if (error.message.includes('該郵箱已被註冊')) {
        showOptions({
          title: '帳號已存在',
          options: [
            { 
              text: '切換到登入', 
              onPress: () => setIsSignUp(false),
            },
          ],
          cancelText: '取消',
        });
      } else if (error.message.includes('登入失敗') || error.message.includes('帳號或密碼不正確')) {
        // 提供使用本地模式的選項
        showOptions({
          title: '登入失敗',
          options: [
            { 
              text: '使用本地模式', 
              onPress: () => handleLocalMode(),
            },
            {
              text: '切換到註冊',
              onPress: () => setIsSignUp(true),
            },
          ],
          cancelText: '重試',
        });
      } else if (error.message.includes('無法連接') || error.message.includes('服務器錯誤')) {
        // 網絡或服務器錯誤，建議使用本地模式
        showOptions({
          title: '連接失敗',
          options: [
            { 
              text: '使用本地模式', 
              onPress: () => handleLocalMode(),
            },
          ],
          cancelText: '重試',
        });
      } else {
        showAlert({
          title: '錯誤',
          message: error.message || '操作失敗',
        });
      }
    }
  };

  // Handle local mode sign in
  const handleLocalMode = async () => {
    try {
      await signInLocal();
      // 成功進入本地模式會自動導航到主應用程式
      // Debug log removed for production security
    } catch (error) {
      showAlert({
        title: '錯誤',
        message: '進入本地模式失敗',
      });
    }
  };

  // Toggle sign up mode
  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    clearError();
  };

  // Handle Google login button press
  const handleGoogleLoginPress = async () => {
    // Debug logs removed for production security
    // 調試日誌已移除以符合生產環境安全要求
    
    if (!request || !GOOGLE_IOS_CLIENT_ID) {
      console.error('❌ Google login not configured properly');
      showAlert({
        title: '配置錯誤',
        message: 'Google 登入尚未配置。請檢查 .env 文件中的 EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
      });
      return;
    }

    try {
      // Debug logs removed for production security
      const result = await promptAsync();
      // Debug logs removed for production security
    } catch (error: any) {
      console.error('❌ Google login error details:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error code:', error.code);
      console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      
      showAlert({
        title: 'Google 登入失敗',
        message: error.message || '無法啟動 Google 登入',
      });
    }
  };

  // DEV: Clear all storage (for testing)
  const handleClearStorage = async () => {
    try {
      await AsyncStorage.clear();
      showAlert({
        title: '成功',
        message: '已清除所有本地數據，請重新啟動應用',
      });
      // Debug log removed for production security
    } catch (error) {
      showAlert({
        title: '錯誤',
        message: '清除數據失敗',
      });
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <LoginForm
            email={email}
            password={password}
            displayName={displayName}
            isSignUp={isSignUp}
            loading={loading}
            error={error}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onDisplayNameChange={setDisplayName}
            onToggleSignUp={handleToggleSignUp}
            onSubmit={handleEmailAuth}
            onSkip={handleLocalMode}
            onClearError={clearError}
            theme={theme}
          />

          {/* OAuth Login Section - 始終顯示，即使配置有誤 */}
          <View style={styles.oauthSection}>
            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.borderColor }]} />
              <Text style={[styles.dividerText, { color: theme.textSecondary }]}>
                或使用以下方式繼續
              </Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.borderColor }]} />
            </View>

            {/* Google Login Button - 始終顯示，即使配置有誤 */}
            <TouchableOpacity
              style={[
                styles.googleButton, 
                { 
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.borderColor,
                  opacity: request ? 1 : 0.5, // 配置有誤時半透明
                }
              ]}
              onPress={handleGoogleLoginPress}
              disabled={!request || loading}
            >
              <MaterialCommunityIcons 
                name="google" 
                size={20} 
                color={request ? "#4285F4" : theme.textSecondary} 
                style={styles.googleIcon}
              />
              <Text style={[
                styles.googleButtonText, 
                { 
                  color: request ? theme.textPrimary : theme.textSecondary 
                }
              ]}>
                {request ? '使用 Google 登入' : 'Google 登入（未配置）'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* DEV: Clear Storage Button */}
          <TouchableOpacity 
            onPress={handleClearStorage}
            style={styles.devButton}
          >
            <Text style={styles.devButtonText}>
              🧹 清除所有數據 (測試用)
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {renderAlert()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  devButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.8,
  },
  devButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  oauthSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
