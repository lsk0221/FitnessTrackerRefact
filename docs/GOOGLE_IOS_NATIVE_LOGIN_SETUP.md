# Google iOS 原生登入配置指南
# Google iOS Native Login Configuration Guide

## 概述 | Overview

本文檔說明如何配置 Google iOS 原生登入功能。
This document explains how to configure Google iOS native login functionality.

---

## 步驟 1: 獲取 iOS Client ID | Step 1: Get iOS Client ID

### 1.1 在 Google Cloud Console 中創建 iOS Client ID

1. 訪問 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇您的項目
3. 導航到 **APIs & Services** > **Credentials**
4. 點擊 **+ CREATE CREDENTIALS** > **OAuth client ID**
5. 選擇 **iOS** 作為應用程式類型
6. 輸入 **Bundle ID**: `com.lsk0221.fitnesstracker` (與 `app.json` 中的 `bundleIdentifier` 一致)
7. 點擊 **Create**
8. 複製生成的 **Client ID** (格式類似: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)

### 1.2 計算 REVERSED_CLIENT_ID

**REVERSED_CLIENT_ID** 是 iOS Client ID 的反向格式，用於 URL Scheme 配置。

**計算方法：**
1. 取您的 iOS Client ID: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
2. 反轉格式: `com.googleusercontent.apps.123456789-abcdefghijklmnop`
3. 這就是您的 **REVERSED_CLIENT_ID**

**範例：**
- iOS Client ID: `910699452659-f5bci2eqhoglcuf3igs9ts61pv85bjf0.apps.googleusercontent.com`
- REVERSED_CLIENT_ID: `com.googleusercontent.apps.910699452659-f5bci2eqhoglcuf3igs9ts61pv85bjf0`

---

## 步驟 2: 配置環境變數 | Step 2: Configure Environment Variables

### 2.1 更新 `.env` 文件

在 `.env` 文件中添加：

```bash
# Google OAuth iOS Client ID
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=您的iOS_Client_ID_這裡
```

**範例：**
```bash
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=910699452659-f5bci2eqhoglcuf3igs9ts61pv85bjf0.apps.googleusercontent.com
```

### 2.2 更新 `app.json`

在 `app.json` 的 `ios.infoPlist.CFBundleURLTypes[0].CFBundleURLSchemes` 中，將佔位符替換為您的 REVERSED_CLIENT_ID：

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "fitnesstracker",
              "com.googleusercontent.apps.910699452659-f5bci2eqhoglcuf3igs9ts61pv85bjf0"
            ]
          }
        ]
      }
    }
  }
}
```

**重要：**
- 保留 `"fitnesstracker"` (應用程式的自定義 scheme)
- 添加您的 REVERSED_CLIENT_ID 作為第二個 scheme
- REVERSED_CLIENT_ID 必須完全匹配（包括大小寫）

---

## 步驟 3: 驗證配置 | Step 3: Verify Configuration

### 3.1 檢查環境變數

運行應用後，查看控制台輸出：

```
⚠️ [Config Warning]: EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID is not configured...
```

如果看到此警告，說明環境變數未正確設置。

### 3.2 檢查 URL Schemes

在 Xcode 中：
1. 打開 `ios/FitnessTrackerSimple.xcworkspace`
2. 選擇項目 > Target > Info
3. 檢查 **URL Types** 是否包含：
   - `fitnesstracker`
   - 您的 REVERSED_CLIENT_ID

---

## 步驟 4: 測試 | Step 4: Testing

### 4.1 重新構建 iOS App

```bash
# 清理構建
cd ios
rm -rf build
cd ..

# 重新預構建
npx expo prebuild --clean

# 構建 iOS App
npx expo run:ios
```

### 4.2 測試 Google 登入

1. 在 iOS 設備或模擬器上運行應用
2. 點擊 "使用 Google 登入" 按鈕
3. 應該使用原生 Google Sign-In SDK（而不是網頁視圖）
4. 登入成功後應自動返回應用

---

## 故障排除 | Troubleshooting

### 問題 1: URL Scheme 不匹配

**錯誤訊息：** `redirect_uri_mismatch`

**解決方案：**
- 確認 `app.json` 中的 REVERSED_CLIENT_ID 與 Google Cloud Console 中的 iOS Client ID 匹配
- 確認 Bundle ID 與 Google Cloud Console 中配置的一致

### 問題 2: 仍然使用網頁登入

**原因：** `iosClientId` 未正確配置

**解決方案：**
- 檢查 `.env` 文件中的 `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- 重啟 Expo 開發服務器
- 確認 `LoginScreen.tsx` 中使用了 `GOOGLE_IOS_CLIENT_ID`

### 問題 3: 編譯錯誤

**錯誤訊息：** `CFBundleURLTypes` 相關錯誤

**解決方案：**
- 確認 `app.json` 中的 JSON 格式正確
- 確認 REVERSED_CLIENT_ID 格式正確（以 `com.googleusercontent.apps.` 開頭）

---

## 配置檢查清單 | Configuration Checklist

在開始測試之前，請確認：

- [ ] 已在 Google Cloud Console 創建 iOS Client ID
- [ ] 已計算 REVERSED_CLIENT_ID
- [ ] `.env` 文件中已設置 `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- [ ] `app.json` 中的 `CFBundleURLSchemes` 包含 REVERSED_CLIENT_ID
- [ ] Bundle ID 與 Google Cloud Console 配置一致
- [ ] 已重啟 Expo 開發服務器
- [ ] 已重新構建 iOS App (`npx expo prebuild --clean`)

---

## 相關文件 | Related Files

- `app.json` - iOS URL Scheme 配置
- `.env` - 環境變數配置
- `src/app/config/cloudflare.js` - Google Client ID 配置
- `src/features/auth/screens/LoginScreen.tsx` - OAuth 登入邏輯

---

**最後更新:** 2025-01-24  
**狀態:** ✅ 配置結構已更新

