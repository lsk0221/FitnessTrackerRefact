/**
 * Login Form Component
 * 登入表單組件
 * 
 * This is a "dumb" component that handles the login form UI
 * 這是一個"啞"組件，處理登入表單 UI
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { LoadingButton } from '../../../shared/components/ui/LoadingButton';

export interface LoginFormProps {
  // Form state
  email: string;
  password: string;
  displayName: string;
  isSignUp: boolean;
  loading: boolean;
  error: string | null;
  
  // Form handlers
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onDisplayNameChange: (name: string) => void;
  onToggleSignUp: () => void;
  onSubmit: () => void;
  onSkip: () => void;
  onClearError: () => void;
  
  // Theme
  theme: any;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  displayName,
  isSignUp,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
  onToggleSignUp,
  onSubmit,
  onSkip,
  onClearError,
  theme
}) => {
  const dynamicStyles = {
    container: {
      backgroundColor: theme.backgroundColor,
    },
    title: {
      color: theme.textPrimary,
    },
    subtitle: {
      color: theme.textSecondary,
    },
    input: {
      backgroundColor: theme.cardBackground,
      borderColor: theme.borderColor,
      color: theme.textPrimary,
    },
    inputPlaceholder: {
      color: theme.textSecondary,
    },
    button: {
      backgroundColor: theme.primaryColor,
    },
    buttonText: {
      color: '#ffffff',
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderColor: theme.primaryColor,
      borderWidth: 1,
    },
    secondaryButtonText: {
      color: theme.primaryColor,
    },
    errorText: {
      color: '#FF3B30',
    },
    linkText: {
      color: theme.primaryColor,
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, dynamicStyles.title]}>
          {isSignUp ? '註冊帳戶' : '歡迎回來'}
        </Text>
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          {isSignUp ? '創建您的健身追蹤帳戶' : '登入您的健身追蹤帳戶'}
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, dynamicStyles.subtitle]}>姓名</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={displayName}
              onChangeText={onDisplayNameChange}
              placeholder="請輸入您的姓名"
              placeholderTextColor={dynamicStyles.inputPlaceholder.color}
              autoCapitalize="words"
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, dynamicStyles.subtitle]}>電子郵件</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={email}
            onChangeText={onEmailChange}
            placeholder="請輸入電子郵件"
            placeholderTextColor={dynamicStyles.inputPlaceholder.color}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, dynamicStyles.subtitle]}>密碼</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={password}
            onChangeText={onPasswordChange}
            placeholder="請輸入密碼"
            placeholderTextColor={dynamicStyles.inputPlaceholder.color}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {/* Error Message */}
        {error && (
          <Text style={[styles.errorText, dynamicStyles.errorText]}>
            {error}
          </Text>
        )}

        {/* Main Button */}
        <LoadingButton
          title={isSignUp ? '註冊' : '登入'}
          onPress={onSubmit}
          loading={loading}
          variant="primary"
          size="large"
          fullWidth
          loadingText={isSignUp ? '註冊中...' : '登入中...'}
          style={[styles.button, dynamicStyles.button]}
        />

        {/* Toggle Sign Up/Login */}
        <TouchableOpacity
          style={[styles.secondaryButton, dynamicStyles.secondaryButton]}
          onPress={() => {
            onToggleSignUp();
            onClearError();
          }}
        >
          <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>
            {isSignUp ? '已有帳戶？登入' : '沒有帳戶？註冊'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Skip Login */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onSkip}
      >
        <Text style={[styles.skipText, dynamicStyles.linkText]}>
          暫時跳過，使用本地模式
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  skipButton: {
    alignItems: 'center',
    padding: 16,
  },
  skipText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
