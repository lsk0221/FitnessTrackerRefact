# Google OAuth Redirect URI 配置指南
# Google OAuth Redirect URI Configuration Guide

## 当前配置 | Current Configuration

### 应用配置 | App Configuration

**Scheme:** `fitnesstracker`  
**Path:** `auth`  
**完整 Redirect URI:** 根据平台自动生成

### 生成的 Redirect URI（按平台）| Generated Redirect URIs (by Platform)

#### iOS / Android (原生应用)
```
fitnesstracker://auth
```

#### Web (开发环境)
```
http://localhost:8081/auth
```
或
```
http://localhost:19006/auth
```

#### Web (生产环境 - 如果有)
```
https://your-production-domain.com/auth
```

---

## Google Cloud Console 配置步骤 | Google Cloud Console Setup

### 步骤 1: 访问 Google Cloud Console

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择您的项目
3. 导航到 **APIs & Services** > **Credentials**
4. 找到您的 **Web Client ID** (用于 OAuth 2.0)
5. 点击编辑（铅笔图标）

### 步骤 2: 添加授权重定向 URI

在 **Authorized redirect URIs** 部分，添加以下 URI：

#### 必须添加的 URI（根据您的使用场景）

**1. iOS 应用:**
```
fitnesstracker://auth
```

**2. Android 应用:**
```
fitnesstracker://auth
```

**3. Web 开发环境:**
```
http://localhost:8081/auth
http://localhost:19006/auth
```

**4. Web 生产环境（如果有）:**
```
https://your-production-domain.com/auth
```

### 步骤 3: 添加授权的 JavaScript 源（仅 Web）

如果支持 Web 平台，在 **Authorized JavaScript origins** 部分添加：

**开发环境:**
```
http://localhost:8081
http://localhost:19006
```

**生产环境（如果有）:**
```
https://your-production-domain.com
```

### 步骤 4: 保存更改

点击 **Save** 保存所有更改。

---

## 验证配置 | Verify Configuration

### 方法 1: 查看应用日志

在开发模式下，应用启动时会自动打印 redirect URI：

```
🔗 Google OAuth Redirect URI: fitnesstracker://auth
📱 Platform: ios
```

### 方法 2: 测试 OAuth 流程

1. 在应用中点击 "使用 Google 登入" 按钮
2. 如果配置正确，会打开 Google 登录页面
3. 登录成功后会自动重定向回应用

### 方法 3: 检查错误信息

如果 redirect URI 配置错误，您会看到类似以下错误：

```
Error: redirect_uri_mismatch
```

这表示 Google Cloud Console 中的 redirect URI 与应用生成的不匹配。

---

## 常见问题 | Common Issues

### 问题 1: redirect_uri_mismatch 错误

**原因:** Google Cloud Console 中的 redirect URI 与应用生成的不匹配

**解决方案:**
1. 检查应用日志中的实际 redirect URI
2. 确保 Google Cloud Console 中配置了完全相同的 URI
3. 注意大小写和特殊字符必须完全匹配

### 问题 2: iOS 上无法重定向回应用

**原因:** `app.json` 中缺少 scheme 配置

**解决方案:**
确保 `app.json` 中有以下配置：
```json
{
  "expo": {
    "ios": {
      "scheme": "fitnesstracker"
    },
    "android": {
      "scheme": "fitnesstracker"
    }
  }
}
```

### 问题 3: Web 平台无法工作

**原因:** Web 平台需要 HTTP/HTTPS redirect URI，不是 custom scheme

**解决方案:**
1. 确保添加了 `http://localhost:8081/auth` 到 Google Cloud Console
2. 如果使用自定义域名，添加 `https://your-domain.com/auth`

---

## 配置检查清单 | Configuration Checklist

在开始测试之前，请确认：

- [ ] Google Cloud Console 中已添加 `fitnesstracker://auth`
- [ ] `app.json` 中已配置 `scheme: "fitnesstracker"`
- [ ] 如果支持 Web，已添加 `http://localhost:8081/auth`
- [ ] `.env` 文件中已设置 `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] 已重启 Expo 开发服务器（如果修改了环境变量）

---

## 测试步骤 | Testing Steps

### iOS 测试

1. 运行 `npx expo start --ios`
2. 点击 "使用 Google 登入"
3. 选择 Google 账户
4. 授权后应自动返回应用

### Android 测试

1. 运行 `npx expo start --android`
2. 点击 "使用 Google 登入"
3. 选择 Google 账户
4. 授权后应自动返回应用

### Web 测试

1. 运行 `npx expo start --web`
2. 点击 "使用 Google 登入"
3. 选择 Google 账户
4. 授权后应重定向回应用

---

## 安全注意事项 | Security Notes

1. **不要在生产环境使用 localhost**
   - 生产环境必须使用 HTTPS
   - 使用您的实际域名

2. **保护 Client ID**
   - Client ID 可以公开（前端使用）
   - 但不要泄露 Client Secret（如果有）

3. **定期检查配置**
   - 确保只添加必要的 redirect URI
   - 移除不再使用的 URI

---

## 相关文件 | Related Files

- `app.json` - 应用配置（包含 scheme）
- `src/features/auth/screens/LoginScreen.tsx` - OAuth 配置
- `.env` - 环境变量（包含 GOOGLE_CLIENT_ID）
- `docs/OAUTH_IMPLEMENTATION.md` - OAuth 实现文档

---

**最后更新:** 2025-01-24  
**状态:** ✅ 已配置并测试

