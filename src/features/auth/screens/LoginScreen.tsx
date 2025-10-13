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
  Alert
} from 'react-native';
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
              onPress: () => setIsSignUp(false),
              style: 'default'
            },
            { 
              text: '取消', 
              style: 'cancel'
            }
          ]
        );
      } else {
        showCustomAlert('錯誤', error.message || '操作失敗', [
          { text: '確定', onPress: () => {} }
        ]);
      }
    }
  };

  // Handle local mode sign in
  const handleLocalMode = async () => {
    try {
      await signInLocal();
      Alert.alert('本地模式', '您已進入本地模式，數據不會同步到雲端');
    } catch (error) {
      Alert.alert('錯誤', '進入本地模式失敗');
    }
  };

  // Toggle sign up mode
  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    clearError();
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
});

export default LoginScreen;
