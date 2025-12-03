# Cloudflare Worker Google OAuth 配置指南
# Cloudflare Worker Google OAuth Configuration Guide

## 概述 | Overview

本文檔說明如何在 Cloudflare Worker 中配置多個 Google OAuth Client ID（Web、iOS、Android），以支持不同平台的登入。
This document explains how to configure multiple Google OAuth Client IDs (Web, iOS, Android) in Cloudflare Worker to support login from different platforms.

---

## 配置步驟 | Configuration Steps

### 1. 獲取 Google Client IDs | Get Google Client IDs

在 [Google Cloud Console](https://console.cloud.google.com/) 中創建並獲取以下 Client IDs：

1. **Web Client ID** (`GOOGLE_CLIENT_ID`)
   - 類型：Web application
   - 用於：Web 平台和通用 OAuth

2. **iOS Client ID** (`GOOGLE_IOS_CLIENT_ID`)
   - 類型：iOS
   - Bundle ID：`com.lsk0221.fitnesstracker`（與 `app.json` 中的 `bundleIdentifier` 一致）
   - 用於：iOS 原生登入

3. **Android Client ID** (`GOOGLE_ANDROID_CLIENT_ID`) - 可選
   - 類型：Android
   - Package name：`com.fitnesstracker.simple`（與 `app.json` 中的 `package` 一致）
   - 用於：Android 原生登入

---

## 2. 設置 Cloudflare Worker Secrets | Set Cloudflare Worker Secrets

### 方法 1：使用 Wrangler CLI（推薦）

```bash
# 設置 Web Client ID
wrangler secret put GOOGLE_CLIENT_ID

# 設置 iOS Client ID（必需，用於 iOS 原生登入）
wrangler secret put GOOGLE_IOS_CLIENT_ID

# 設置 Android Client ID（可選）
wrangler secret put GOOGLE_ANDROID_CLIENT_ID
```

執行命令後，Wrangler 會提示您輸入對應的值。

### 方法 2：使用 Cloudflare Dashboard

1. 訪問 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 選擇您的帳戶 > Workers & Pages
3. 選擇 `fitness-tracker-api` Worker
4. 導航到 **Settings** > **Variables and Secrets**
5. 在 **Encrypted** 部分，點擊 **Add variable**
6. 添加以下變數：
   - `GOOGLE_CLIENT_ID`（可選，如果只使用 iOS）
   - `GOOGLE_IOS_CLIENT_ID`（必需）
   - `GOOGLE_ANDROID_CLIENT_ID`（可選）

---

## 3. 本地開發配置 | Local Development Configuration

在項目根目錄創建 `.dev.vars` 文件（此文件已在 `.gitignore` 中，不會被提交）：

```bash
# .dev.vars
GOOGLE_CLIENT_ID=your-google-web-client-id-here
GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id-here
GOOGLE_ANDROID_CLIENT_ID=your-google-android-client-id-here
```

**注意：** `.dev.vars` 文件僅用於本地開發，不會部署到 Cloudflare。

---

## 4. 驗證配置 | Verify Configuration

### 檢查 Secrets 是否已設置

```bash
# 列出所有 secrets（不會顯示值）
wrangler secret list
```

### 測試 Google 登入

1. 在 iOS 應用中測試 Google 登入
2. 檢查 Cloudflare Worker 日誌：
   ```bash
   wrangler tail
   ```
3. 查看日誌輸出，應該看到：
   ```
   Google token validated successfully for Client ID: 910699452659-qh1kp3sv547rsrhbf5pfocc5uunvu1rs.apps.googleusercontent.com
   ```

---

## 後端驗證邏輯 | Backend Validation Logic

### 修改後的驗證流程

1. **構建允許的 Client ID 列表**：
   ```javascript
   const allowedClientIds = [];
   if (env.GOOGLE_CLIENT_ID) allowedClientIds.push(env.GOOGLE_CLIENT_ID);
   if (env.GOOGLE_IOS_CLIENT_ID) allowedClientIds.push(env.GOOGLE_IOS_CLIENT_ID);
   if (env.GOOGLE_ANDROID_CLIENT_ID) allowedClientIds.push(env.GOOGLE_ANDROID_CLIENT_ID);
   ```

2. **驗證 Token**：
   - 使用 Google 的 `tokeninfo` 端點驗證 ID Token
   - 檢查 Token 的 `aud`（audience）是否在允許的 Client ID 列表中
   - 如果匹配，提取用戶信息並完成登入

### 安全檢查

- ✅ 至少需要配置一個 Client ID（Web、iOS 或 Android）
- ✅ Token 的 `aud` 必須匹配其中一個允許的 Client ID
- ✅ 使用 Google 官方 `tokeninfo` 端點驗證 Token

---

## 故障排除 | Troubleshooting

### 問題 1：`Google OAuth not configured`

**原因：** 沒有配置任何 Google Client ID

**解決方案：**
- 確保至少設置了 `GOOGLE_IOS_CLIENT_ID`（用於 iOS 登入）
- 使用 `wrangler secret put GOOGLE_IOS_CLIENT_ID` 設置

### 問題 2：`Invalid Google token`

**原因：** Token 的 `aud` 不匹配任何允許的 Client ID

**解決方案：**
- 檢查前端使用的 Client ID 是否已添加到 Cloudflare Secrets
- 檢查 Cloudflare Worker 日誌中的錯誤信息：
  ```
  Google token audience mismatch: <actual_aud> expected: <allowed_ids>
  ```

### 問題 3：本地開發無法驗證 Token

**原因：** `.dev.vars` 文件未配置或格式錯誤

**解決方案：**
- 確認 `.dev.vars` 文件在項目根目錄
- 確認文件格式正確（每行一個變數）
- 重啟本地開發服務器

---

## 相關文件 | Related Files

- `cloudflare-worker-simple.js` - 後端驗證邏輯
- `wrangler.toml` - Wrangler 配置文件
- `.dev.vars` - 本地開發環境變數（不提交到 Git）
- `app.json` - 應用配置（包含 Bundle ID 和 Package Name）

---

## 重要提醒 | Important Notes

1. **安全性**：
   - 永遠不要將 Client ID 提交到 Git
   - 使用 `wrangler secret put` 或 Cloudflare Dashboard 設置 Secrets
   - `.dev.vars` 文件已在 `.gitignore` 中

2. **最小配置**：
   - 如果只使用 iOS 登入，只需設置 `GOOGLE_IOS_CLIENT_ID`
   - Web 和 Android Client ID 是可選的

3. **更新 Secrets**：
   - 如果更改了 Google Client ID，記得更新 Cloudflare Secrets
   - 使用 `wrangler secret put <VARIABLE_NAME>` 更新

---

**最後更新：** 2025-01-24  
**狀態：** ✅ 支持多平台 Google OAuth Client ID 驗證

