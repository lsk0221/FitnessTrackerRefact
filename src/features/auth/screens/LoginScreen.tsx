/**
 * Login Screen
 * 登入畫面
 * 
 * This is the main login screen that orchestrates the authentication flow
 * 這是主要的登入畫面，協調認證流程
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  Text
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCloudflareAuth } from '../../../shared/contexts/CloudflareAuthContext';
import { LoginForm } from '../components/LoginForm';
import CustomAlert from '../../../shared/components/navigation/CustomAlert';

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
  
  // Custom alert state
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  // Auth hook
  const {
    signIn,
    signUp,
    signInLocal,
    loading,
    error,
    clearError
  } = useCloudflareAuth();

  // Show custom alert
  const showCustomAlert = (title: string, message: string, buttons: any[]) => {
    setCustomAlert({
      visible: true,
      title,
      message,
      buttons
    });
  };

  // Hide custom alert
  const hideCustomAlert = () => {
    setCustomAlert({
      visible: false,
      title: '',
      message: '',
      buttons: []
    });
  };

  // Handle email authentication
  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('錯誤', '請填寫所有欄位');
      return;
    }

    if (isSignUp && !displayName) {
      Alert.alert('錯誤', '請填寫姓名');
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
        showCustomAlert(
          '帳號已存在', 
          '該郵箱已經註冊過了，請切換到登入模式或使用其他郵箱註冊。',
          [
            { 
              text: '切換到登入', 
              onPress: () => {
                hideCustomAlert();
                setIsSignUp(false);
              },
              style: 'default'
            },
            { 
              text: '取消', 
              onPress: hideCustomAlert,
              style: 'cancel'
            }
          ]
        );
      } else if (error.message.includes('登入失敗') || error.message.includes('帳號或密碼不正確')) {
        // 提供使用本地模式的選項
        showCustomAlert(
          '登入失敗', 
          error.message,
          [
            { 
              text: '使用本地模式', 
              onPress: () => {
                hideCustomAlert();
                handleLocalMode();
              },
              style: 'default'
            },
            {
              text: '切換到註冊',
              onPress: () => {
                hideCustomAlert();
                setIsSignUp(true);
              },
              style: 'default'
            },
            { 
              text: '重試', 
              onPress: hideCustomAlert,
              style: 'cancel'
            }
          ]
        );
      } else if (error.message.includes('無法連接') || error.message.includes('服務器錯誤')) {
        // 網絡或服務器錯誤，建議使用本地模式
        showCustomAlert(
          '連接失敗', 
          error.message,
          [
            { 
              text: '使用本地模式', 
              onPress: () => {
                hideCustomAlert();
                handleLocalMode();
              },
              style: 'default'
            },
            { 
              text: '重試', 
              onPress: hideCustomAlert,
              style: 'cancel'
            }
          ]
        );
      } else {
        showCustomAlert('錯誤', error.message || '操作失敗', [
          { text: '確定', onPress: hideCustomAlert }
        ]);
      }
    }
  };

  // Handle local mode sign in
  const handleLocalMode = async () => {
    try {
      await signInLocal();
      // 成功進入本地模式會自動導航到主應用程式
      console.log('成功進入本地模式');
    } catch (error) {
      showCustomAlert('錯誤', '進入本地模式失敗', [
        { text: '確定', onPress: hideCustomAlert }
      ]);
    }
  };

  // Toggle sign up mode
  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    clearError();
  };

  // DEV: Clear all storage (for testing)
  const handleClearStorage = async () => {
    try {
      await AsyncStorage.clear();
      Alert.alert('成功', '已清除所有本地數據，請重新啟動應用');
      console.log('✅ AsyncStorage cleared successfully');
    } catch (error) {
      Alert.alert('錯誤', '清除數據失敗');
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
      
      {/* Custom Alert */}
      <CustomAlert
        visible={customAlert.visible}
        title={customAlert.title}
        message={customAlert.message}
        buttons={customAlert.buttons}
        theme={theme}
        onClose={hideCustomAlert}
      />
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
});

export default LoginScreen;
