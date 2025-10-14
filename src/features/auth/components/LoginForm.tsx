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
  // Dynamic styles based on theme
  // 根據主題動態生成樣式，支援深色/淺色模式
  const dynamicStyles = {
    container: {
      backgroundColor: theme.backgroundColor, // 容器背景色
    },
    title: {
      color: theme.textPrimary, // 主標題文字顏色
    },
    subtitle: {
      color: theme.textSecondary, // 副標題文字顏色
    },
    input: {
      backgroundColor: theme.cardBackground, // 輸入框背景色
      borderColor: theme.borderColor, // 輸入框邊框顏色
      color: theme.textPrimary, // 輸入框文字顏色
    },
    inputPlaceholder: {
      color: theme.textSecondary, // 輸入框佔位符顏色
    },
    button: {
      backgroundColor: theme.primaryColor, // 主要按鈕背景色
    },
    buttonText: {
      color: '#ffffff', // 按鈕文字顏色（固定白色）
    },
    secondaryButton: {
      backgroundColor: 'transparent', // 次要按鈕背景色（透明）
      borderColor: theme.primaryColor, // 次要按鈕邊框顏色
      borderWidth: 1, // 次要按鈕邊框寬度
    },
    secondaryButtonText: {
      color: theme.primaryColor, // 次要按鈕文字顏色
    },
    errorText: {
      color: '#FF3B30', // 錯誤文字顏色（紅色）
    },
    linkText: {
      color: theme.primaryColor, // 連結文字顏色
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section - 標題區域 */}
      <View style={styles.header}>
        {/* Dynamic title based on sign up mode - 根據註冊模式動態顯示標題 */}
        <Text style={[styles.title, dynamicStyles.title]}>
          {isSignUp ? '註冊帳戶' : '歡迎回來'}
        </Text>
        {/* Dynamic subtitle - 動態副標題 */}
        <Text style={[styles.subtitle, dynamicStyles.subtitle]}>
          {isSignUp ? '創建您的健身追蹤帳戶' : '登入您的健身追蹤帳戶'}
        </Text>
      </View>

      {/* Form Section - 表單區域 */}
      <View style={styles.form}>
        {/* Display Name Input - Only shown during sign up - 姓名輸入框，僅在註冊時顯示 */}
        {isSignUp && (
          <View style={styles.inputContainer}>
            <Text style={[styles.label, dynamicStyles.subtitle]}>姓名</Text>
            <TextInput
              style={[styles.input, dynamicStyles.input]}
              value={displayName}
              onChangeText={onDisplayNameChange}
              placeholder="請輸入您的姓名"
              placeholderTextColor={dynamicStyles.inputPlaceholder.color}
              autoCapitalize="words" // 自動大寫每個單詞的首字母
            />
          </View>
        )}

        {/* Email Input - 電子郵件輸入框 */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, dynamicStyles.subtitle]}>電子郵件</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={email}
            onChangeText={onEmailChange}
            placeholder="請輸入電子郵件"
            placeholderTextColor={dynamicStyles.inputPlaceholder.color}
            keyboardType="email-address" // 顯示電子郵件鍵盤
            autoCapitalize="none" // 不自動大寫
            autoCorrect={false} // 關閉自動修正
          />
        </View>

        {/* Password Input - 密碼輸入框 */}
        <View style={styles.inputContainer}>
          <Text style={[styles.label, dynamicStyles.subtitle]}>密碼</Text>
          <TextInput
            style={[styles.input, dynamicStyles.input]}
            value={password}
            onChangeText={onPasswordChange}
            placeholder="請輸入密碼"
            placeholderTextColor={dynamicStyles.inputPlaceholder.color}
            secureTextEntry // 隱藏密碼文字
            autoCapitalize="none" // 不自動大寫
          />
        </View>

        {/* Error Message Display - 錯誤訊息顯示 */}
        {error && (
          <Text style={[styles.errorText, dynamicStyles.errorText]}>
            {error}
          </Text>
        )}

        {/* Main Action Button - 主要操作按鈕 */}
        <LoadingButton
          title={isSignUp ? '註冊' : '登入'} // 動態按鈕文字
          onPress={onSubmit} // 提交表單
          loading={loading} // 載入狀態
          variant="primary" // 主要樣式
          size="large" // 大尺寸
          fullWidth // 全寬度
          loadingText={isSignUp ? '註冊中...' : '登入中...'} // 載入時文字
          style={[styles.button, dynamicStyles.button]}
        />

        {/* Toggle Between Sign Up/Login - 切換註冊/登入模式 */}
        <TouchableOpacity
          style={[styles.secondaryButton, dynamicStyles.secondaryButton]}
          onPress={() => {
            onToggleSignUp(); // 切換模式
            onClearError(); // 清除錯誤訊息
          }}
        >
          <Text style={[styles.secondaryButtonText, dynamicStyles.secondaryButtonText]}>
            {isSignUp ? '已有帳戶？登入' : '沒有帳戶？註冊'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Skip Login Option - 跳過登入選項 */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={onSkip} // 跳過登入，使用本地模式
      >
        <Text style={[styles.skipText, dynamicStyles.linkText]}>
          暫時跳過，使用本地模式
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Static styles for the login form
// 登入表單的靜態樣式
const styles = StyleSheet.create({
  container: {
    flex: 1, // 佔滿整個容器
  },
  header: {
    alignItems: 'center', // 標題置中
    marginBottom: 40, // 底部間距
  },
  title: {
    fontSize: 28, // 主標題字體大小
    fontWeight: 'bold', // 粗體
    marginBottom: 8, // 底部間距
  },
  subtitle: {
    fontSize: 16, // 副標題字體大小
    textAlign: 'center', // 文字置中
  },
  form: {
    marginBottom: 30, // 表單底部間距
  },
  inputContainer: {
    marginBottom: 20, // 每個輸入框容器的底部間距
  },
  label: {
    fontSize: 14, // 標籤字體大小
    fontWeight: '600', // 半粗體
    marginBottom: 8, // 標籤底部間距
  },
  input: {
    borderWidth: 1, // 輸入框邊框寬度
    borderRadius: 8, // 輸入框圓角
    padding: 12, // 輸入框內邊距
    fontSize: 16, // 輸入框字體大小
  },
  button: {
    borderRadius: 8, // 按鈕圓角
    padding: 16, // 按鈕內邊距
    alignItems: 'center', // 按鈕內容置中
  },
  buttonText: {
    fontSize: 16, // 按鈕文字字體大小
    fontWeight: '600', // 按鈕文字半粗體
  },
  secondaryButton: {
    borderRadius: 8, // 次要按鈕圓角
    padding: 16, // 次要按鈕內邊距
    alignItems: 'center', // 次要按鈕內容置中
    marginTop: 12, // 次要按鈕頂部間距（與主按鈕分開）
  },
  secondaryButtonText: {
    fontSize: 16, // 次要按鈕文字字體大小
    fontWeight: '600', // 次要按鈕文字半粗體
  },
  errorText: {
    fontSize: 14, // 錯誤文字字體大小
    textAlign: 'center', // 錯誤文字置中
    marginBottom: 16, // 錯誤文字底部間距
  },
  skipButton: {
    alignItems: 'center', // 跳過按鈕置中
    padding: 16, // 跳過按鈕內邊距
  },
  skipText: {
    fontSize: 14, // 跳過文字字體大小
    textDecorationLine: 'underline', // 跳過文字下劃線
  },
});
