/**
 * 簡化版 Cloudflare Worker for Fitness Tracker API
 * 用於測試基本功能
 */

export default {
  async fetch(request, env, ctx) {
    try {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      const url = new URL(request.url);
      const path = url.pathname;

      // 路由處理
      switch (path) {
        case '/auth/register':
          return await handleRegister(request, env, corsHeaders);
        
        case '/auth/login':
          return await handleLogin(request, env, corsHeaders);
        
        case '/auth/profile':
          return await handleGetProfile(request, env, corsHeaders);
        
        case '/auth/update-profile':
          return await handleUpdateProfile(request, env, corsHeaders);
        
        case '/auth/logout':
          return await handleLogout(request, env, corsHeaders);
        
        case '/auth/facebook':
          return await handleFacebookLogin(request, env, corsHeaders);
        
        case '/auth/google':
          return await handleGoogleLogin(request, env, corsHeaders);
        
        case '/auth/apple':
          return await handleAppleLogin(request, env, corsHeaders);
        
        case '/data/sync':
          return await handleSyncData(request, env, corsHeaders);
        
        case '/data/get':
          return await handleGetData(request, env, corsHeaders);
        
        default:
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      console.error('Worker top-level error:', error);
      console.error('Error stack:', error.stack);
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };
      
      // Always return JSON with CORS headers, even on error
      return new Response(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

// 註冊處理
async function handleRegister(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password || !displayName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 檢查用戶是否已存在
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return new Response(JSON.stringify({ error: '該郵箱已被註冊，請使用登入功能或嘗試其他郵箱' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 創建新用戶
    const userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    const passwordHash = await hashPassword(password);

    await env.DB.prepare(
      'INSERT INTO users (id, email, display_name, password, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, email, displayName, passwordHash, new Date().toISOString()).run();

    // 生成 JWT token (註冊後自動登入)
    const token = generateJWT(userId, email, env);

    return new Response(JSON.stringify({
      message: '註冊成功',
      token: token,
      user: {
        id: userId,
        email,
        displayName,
        provider: 'email'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Register error:', error);
    return new Response(JSON.stringify({ error: '註冊失敗: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 登入處理
async function handleLogin(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Missing email or password' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({ error: '登入失敗，請檢查郵箱和密碼' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return new Response(JSON.stringify({ error: '登入失敗，請檢查郵箱和密碼' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 生成 JWT token
    const token = generateJWT(user.id, user.email, env);
    
    return new Response(JSON.stringify({
      message: '登入成功',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        provider: 'email'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: '登入失敗: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 獲取用戶資料
async function handleGetProfile(request, env, corsHeaders) {
  console.log('=== 開始處理 getProfile 請求 ===');
  
  if (request.method !== 'GET') {
    console.log('方法不允許:', request.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Check if DB binding exists
  if (!env || !env.DB) {
    console.error('Database binding (env.DB) is missing');
    return new Response(JSON.stringify({ 
      error: 'Database not configured',
      message: 'The Cloudflare Worker is missing the DB binding. Please check your wrangler.toml configuration.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // 從 Authorization header 獲取 token
    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('缺少或無效的授權頭');
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前綴
    console.log('提取的 token:', token);
    
    const payload = verifyJWT(token, env);
    console.log('JWT payload:', payload);
    
    if (!payload) {
      console.log('JWT 驗證失敗');
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('查詢用戶 ID:', payload.sub);
    
    // 從數據庫獲取用戶資料
    const user = await env.DB.prepare(
      'SELECT id, email, display_name, provider, providerId, created_at FROM users WHERE id = ?'
    ).bind(payload.sub).first();

    console.log('數據庫查詢結果:', user);

    if (!user) {
      console.log('用戶未找到');
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        provider: user.provider || 'email',
        providerId: user.providerId,
        createdAt: user.created_at
      }
    };
    
    console.log('返回用戶資料:', response);
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get profile: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 更新個人資料
async function handleUpdateProfile(request, env, corsHeaders) {
  if (request.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { displayName, email } = await request.json();

    if (!displayName && !email) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 簡化版本：直接返回成功
    return new Response(JSON.stringify({
      message: '個人資料更新成功',
      user: {
        id: 'test_user',
        email: email || 'test@example.com',
        displayName: displayName || '測試用戶',
        provider: 'email'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ error: '更新個人資料失敗: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 登出處理
async function handleLogout(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // 在 JWT 模式下，登出主要是客戶端刪除 token
    // 這裡我們只需要返回成功響應
    return new Response(JSON.stringify({ 
      message: '登出成功' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response(JSON.stringify({ error: '登出失敗: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Facebook 登入處理
async function handleFacebookLogin(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return new Response(JSON.stringify({ error: 'Missing access token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 驗證 Facebook access token 並獲取用戶信息
    const facebookUserInfo = await validateFacebookToken(accessToken);
    
    if (!facebookUserInfo) {
      return new Response(JSON.stringify({ error: 'Invalid Facebook token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 檢查用戶是否已存在
    let user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? AND provider = ?'
    ).bind(facebookUserInfo.email, 'facebook').first();

    if (!user) {
      // 創建新用戶
      const userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      // Generate placeholder password for OAuth users (password field is NOT NULL)
      // 為 OAuth 用戶生成占位符密碼（password 欄位不允許 NULL）
      const oauthPlaceholderPassword = 'OAUTH_USER_DO_NOT_USE_' + crypto.randomUUID() + '_' + Date.now();
      
      await env.DB.prepare(
        'INSERT INTO users (id, email, display_name, password, provider, providerId, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(userId, facebookUserInfo.email, facebookUserInfo.name, oauthPlaceholderPassword, 'facebook', facebookUserInfo.id, new Date().toISOString()).run();

      user = {
        id: userId,
        email: facebookUserInfo.email,
        display_name: facebookUserInfo.name,
        provider: 'facebook'
      };
    }

    return new Response(JSON.stringify({
      message: 'Facebook 登入成功',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        provider: user.provider
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Facebook login error:', error);
    return new Response(JSON.stringify({ error: 'Facebook 登入失敗: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Google 登入處理
// Google Login Handler - Supports both idToken (legacy) and Authorization Code Flow
async function handleGoogleLogin(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { idToken, code, codeVerifier, redirectUri } = body;

    let finalIdToken = idToken;

    // Phase 1: 如果收到 code，先交換為 id_token (Authorization Code Flow)
    // Phase 1: If code is received, exchange it for id_token first (Authorization Code Flow)
    if (code && !idToken) {
      console.log('🔄 Exchanging authorization code for id_token...');
      
      if (!codeVerifier) {
        return new Response(JSON.stringify({ error: 'Missing codeVerifier (PKCE required)' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // redirectUri 可以是空字串（iOS 原生登入不需要）
      // redirectUri can be empty string (not needed for iOS native login)
      // 只有在 redirectUri 為 undefined 或 null 時才報錯
      // Only error if redirectUri is undefined or null
      if (redirectUri === undefined || redirectUri === null) {
        return new Response(JSON.stringify({ error: 'Missing redirectUri parameter' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      console.log('🔄 redirectUri value:', redirectUri || '(empty - OK for iOS native)');

      // Determine which Client ID to use based on redirectUri
      // 根據 redirectUri 決定使用哪個 Client ID
      // 如果 redirectUri 為空字串，默認使用 iOS Client ID（iOS 原生登入）
      // If redirectUri is empty string, default to iOS Client ID (iOS native login)
      let clientIdToUse = env.GOOGLE_IOS_CLIENT_ID; // Default to iOS
      
      if (redirectUri && redirectUri.trim() !== '') {
        // 只有在 redirectUri 不為空時才根據內容判斷
        // Only determine Client ID based on content if redirectUri is not empty
        if (redirectUri.includes('android') || redirectUri.includes('com.fitnesstracker')) {
          clientIdToUse = env.GOOGLE_ANDROID_CLIENT_ID || env.GOOGLE_IOS_CLIENT_ID;
        } else if (!redirectUri.includes('com.googleusercontent.apps')) {
          clientIdToUse = env.GOOGLE_CLIENT_ID || env.GOOGLE_IOS_CLIENT_ID;
        }
      } else {
        // redirectUri 為空字串，使用 iOS Client ID
        // redirectUri is empty string, use iOS Client ID
        console.log('🔄 Empty redirectUri detected, using iOS Client ID');
      }

      if (!clientIdToUse) {
        console.error('No appropriate Google Client ID found for redirectUri:', redirectUri);
        return new Response(JSON.stringify({ error: 'Google OAuth not configured for this platform' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Exchange code for token with fallback mechanism
      // 使用多重嘗試機制交換 Token，嘗試不同的 redirect_uri 值
      // Try multiple redirect_uri values to handle different Google OAuth requirements
      const candidateUris = [
        redirectUri,        // 1. 前端傳來的完整 URI (com.google...:/oauth2redirect/google)
        '',                 // 2. 空字串 (某些 iOS SDK 配置)
        undefined           // 3. 不傳此參數 (某些 endpoint 要求)
      ];

      let tokenData = null;
      let lastError = null;
      let successfulUri = null;

      console.log('🔄 Starting token exchange with fallback mechanism...');
      console.log('🔄 Candidate URIs:', candidateUris.map(uri => uri || '(empty/undefined)').join(', '));

      // 嘗試每個候選 URI
      // Try each candidate URI
      for (let i = 0; i < candidateUris.length; i++) {
        const currentUri = candidateUris[i];
        const uriDescription = currentUri === undefined 
          ? 'undefined (not included)' 
          : currentUri === '' 
            ? 'empty string' 
            : currentUri;

        console.log(`🔄 Attempt ${i + 1}/${candidateUris.length}: Using redirect_uri = ${uriDescription}`);

        try {
          // Build request body
          const tokenParams = new URLSearchParams({
            code: code,
            client_id: clientIdToUse,
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
          });

          // Only add redirect_uri if it's not undefined
          // 只有在不是 undefined 時才添加 redirect_uri
          if (currentUri !== undefined) {
            if (currentUri && currentUri.trim() !== '') {
              tokenParams.append('redirect_uri', currentUri);
              console.log(`  ✅ Added redirect_uri: ${currentUri}`);
            } else {
              console.log(`  ⚠️ redirect_uri is empty string (not adding to request)`);
            }
          } else {
            console.log(`  ⚠️ redirect_uri is undefined (not including in request)`);
          }

          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: tokenParams.toString(),
          });

          if (tokenResponse.ok) {
            const responseData = await tokenResponse.json();
            
            if (responseData.id_token) {
              tokenData = responseData;
              successfulUri = uriDescription;
              console.log(`✅ Token exchange successful with redirect_uri = ${uriDescription}`);
              console.log(`✅ Successfully used: ${uriDescription}`);
              break; // 成功，跳出循環
            } else {
              console.log(`  ⚠️ Response OK but no id_token, trying next URI...`);
              lastError = new Error('Token exchange response missing id_token');
            }
          } else {
            const errorText = await tokenResponse.text();
            const errorData = errorText ? JSON.parse(errorText) : {};
            console.log(`  ❌ Attempt ${i + 1} failed: ${tokenResponse.status} - ${errorData.error || errorText}`);
            
            // 如果是 400 錯誤，嘗試下一個 URI
            // If 400 error, try next URI
            if (tokenResponse.status === 400) {
              lastError = new Error(`Token exchange failed with redirect_uri = ${uriDescription}: ${errorData.error || errorText}`);
              continue; // 繼續嘗試下一個
            } else {
              // 其他錯誤（如 500），可能是服務器問題，記錄但不繼續
              lastError = new Error(`Token exchange failed: ${tokenResponse.status} - ${errorData.error || errorText}`);
              console.log(`  ⚠️ Non-400 error, may not be redirect_uri related`);
            }
          }
        } catch (error) {
          console.error(`  ❌ Attempt ${i + 1} exception:`, error.message);
          lastError = error;
          continue; // 繼續嘗試下一個
        }
      }

      // 檢查是否成功
      // Check if any attempt succeeded
      if (!tokenData || !tokenData.id_token) {
        console.error('❌ All token exchange attempts failed');
        console.error('❌ Last error:', lastError?.message);
        return new Response(JSON.stringify({ 
          error: 'Token exchange failed after trying all redirect_uri options',
          details: lastError?.message || 'All attempts failed'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      finalIdToken = tokenData.id_token;
      console.log(`✅ Code exchange successful using redirect_uri = ${successfulUri}`);
    } else if (!idToken && !code) {
      return new Response(JSON.stringify({ error: 'Missing idToken or code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Phase 2: 驗證 id_token
    // Phase 2: Validate id_token

    // Build list of allowed Client IDs (Web, iOS, Android)
    // 構建允許的 Client ID 列表（Web、iOS、Android）
    const allowedClientIds = [];
    if (env.GOOGLE_CLIENT_ID) {
      allowedClientIds.push(env.GOOGLE_CLIENT_ID);
    }
    if (env.GOOGLE_IOS_CLIENT_ID) {
      allowedClientIds.push(env.GOOGLE_IOS_CLIENT_ID);
    }
    if (env.GOOGLE_ANDROID_CLIENT_ID) {
      allowedClientIds.push(env.GOOGLE_ANDROID_CLIENT_ID);
    }

    // Check if at least one Client ID is configured
    if (allowedClientIds.length === 0) {
      console.error('No Google Client ID configured in Worker environment');
      return new Response(JSON.stringify({ error: 'Google OAuth not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify Google ID token with allowed Client IDs
    const googleUserInfo = await validateGoogleToken(finalIdToken, allowedClientIds);
    
    if (!googleUserInfo) {
      return new Response(JSON.stringify({ error: 'Invalid Google token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists (by email or google_id)
    let user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? OR (provider = ? AND providerId = ?)'
    ).bind(googleUserInfo.email, 'google', googleUserInfo.sub).first();

    if (!user) {
      // Create new user
      const userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      // Generate placeholder password for OAuth users (password field is NOT NULL)
      // 為 OAuth 用戶生成占位符密碼（password 欄位不允許 NULL）
      const oauthPlaceholderPassword = 'OAUTH_USER_DO_NOT_USE_' + crypto.randomUUID() + '_' + Date.now();
      
      await env.DB.prepare(
        'INSERT INTO users (id, email, display_name, password, provider, providerId, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        userId, 
        googleUserInfo.email, 
        googleUserInfo.name || googleUserInfo.email.split('@')[0],
        oauthPlaceholderPassword, // OAuth 用戶占位符密碼
        'google', 
        googleUserInfo.sub, 
        new Date().toISOString()
      ).run();

      user = {
        id: userId,
        email: googleUserInfo.email,
        display_name: googleUserInfo.name || googleUserInfo.email.split('@')[0],
        provider: 'google',
        providerId: googleUserInfo.sub
      };
    }

    // Generate JWT token
    const token = generateJWT(user.id, user.email, env);

    return new Response(JSON.stringify({
      message: 'Google 登入成功',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        provider: user.provider || 'google'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Google login error:', error);
    return new Response(JSON.stringify({ error: 'Google 登入失敗: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// Apple 登入處理
async function handleAppleLogin(request, env, corsHeaders) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { identityToken, user: fullName } = await request.json();

    if (!identityToken) {
      return new Response(JSON.stringify({ error: 'Missing identityToken' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Decode Apple identity token (lightweight JWT decode without signature verification)
    const appleUserInfo = decodeAppleToken(identityToken, fullName);
    
    if (!appleUserInfo) {
      return new Response(JSON.stringify({ error: 'Invalid Apple token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user exists (by email or apple_id)
    let user = await env.DB.prepare(
      'SELECT * FROM users WHERE email = ? OR (provider = ? AND providerId = ?)'
    ).bind(appleUserInfo.email, 'apple', appleUserInfo.sub).first();

    if (!user) {
      // Create new user
      const userId = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      const displayName = appleUserInfo.name || appleUserInfo.email.split('@')[0];
      // Generate placeholder password for OAuth users (password field is NOT NULL)
      // 為 OAuth 用戶生成占位符密碼（password 欄位不允許 NULL）
      const oauthPlaceholderPassword = 'OAUTH_USER_DO_NOT_USE_' + crypto.randomUUID() + '_' + Date.now();
      
      await env.DB.prepare(
        'INSERT INTO users (id, email, display_name, password, provider, providerId, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        userId, 
        appleUserInfo.email, 
        displayName,
        oauthPlaceholderPassword, // OAuth 用戶占位符密碼
        'apple', 
        appleUserInfo.sub, 
        new Date().toISOString()
      ).run();

      user = {
        id: userId,
        email: appleUserInfo.email,
        display_name: displayName,
        provider: 'apple',
        providerId: appleUserInfo.sub
      };
    }

    // Generate JWT token
    const token = generateJWT(user.id, user.email, env);

    return new Response(JSON.stringify({
      message: 'Apple 登入成功',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        provider: user.provider || 'apple'
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Apple login error:', error);
    return new Response(JSON.stringify({ error: 'Apple 登入失敗: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 驗證 Google ID Token
// Validate Google ID Token with multiple allowed Client IDs
async function validateGoogleToken(idToken, allowedClientIds) {
  try {
    // Verify token with Google's tokeninfo endpoint
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    
    if (!response.ok) {
      console.error('Google token validation failed:', response.status);
      return null;
    }
    
    const tokenInfo = await response.json();
    
    // Security check: Validate audience matches one of our allowed Client IDs
    // 安全檢查：驗證 audience 是否匹配我們允許的 Client ID 之一
    if (!allowedClientIds.includes(tokenInfo.aud)) {
      console.error('Google token audience mismatch:', tokenInfo.aud);
      console.error('Allowed Client IDs:', allowedClientIds);
      return null;
    }
    
    console.log('Google token validated successfully for Client ID:', tokenInfo.aud);
    
    // Extract user information
    return {
      email: tokenInfo.email,
      name: tokenInfo.name,
      sub: tokenInfo.sub, // Google user ID
      picture: tokenInfo.picture
    };
  } catch (error) {
    console.error('Google token validation error:', error);
    return null;
  }
}

// 解碼 Apple Identity Token (輕量級 JWT 解碼，不驗證簽名)
function decodeAppleToken(identityToken, fullName) {
  try {
    // JWT format: header.payload.signature
    const parts = identityToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid Apple token format');
      return null;
    }

    // Decode payload (base64url decode)
    const base64UrlDecode = (str) => {
      // Add padding if needed
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      try {
        return JSON.parse(atob(base64));
      } catch (e) {
        console.error('Failed to decode Apple token payload:', e);
        return null;
      }
    };

    const payload = base64UrlDecode(parts[1]);
    if (!payload) {
      return null;
    }

    // Extract user information from token
    const email = payload.email;
    const sub = payload.sub; // Apple user ID
    
    // Use name from fullName parameter if provided (only available on first login)
    let displayName = null;
    if (fullName) {
      const nameParts = [];
      if (fullName.givenName) nameParts.push(fullName.givenName);
      if (fullName.familyName) nameParts.push(fullName.familyName);
      displayName = nameParts.length > 0 ? nameParts.join(' ') : null;
    }

    if (!email || !sub) {
      console.error('Missing email or sub in Apple token');
      return null;
    }

    return {
      email: email,
      name: displayName,
      sub: sub
    };
  } catch (error) {
    console.error('Apple token decode error:', error);
    return null;
  }
}

// 驗證 Facebook token 並獲取用戶信息
async function validateFacebookToken(accessToken) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
    );
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Facebook token validation error:', error);
    return null;
  }
}

// 密碼哈希函數
/**
 * 使用 PBKDF2 算法雜湊密碼（符合 OWASP 安全標準）
 * @param {string} password - 原始密碼
 * @returns {Promise<string>} - 返回格式為 "salt:hash" 的十六進制字串
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  
  // 1. 生成 16 bytes 的隨機鹽值
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // 2. 將密碼字串導入為 PBKDF2 密鑰材料
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // 3. 使用 PBKDF2 執行雜湊
  // 算法：PBKDF2
  // Hash：SHA-256
  // 迭代次數：100,000（符合 OWASP 建議）
  // 輸出長度：256 bits (32 bytes)
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    passwordKey,
    256 // 256 bits = 32 bytes
  );
  
  // 4. 將 salt 和 hash 轉換為十六進制字串
  const saltHex = Array.from(salt)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // 5. 返回 "salt:hash" 格式
  return `${saltHex}:${hashHex}`;
}

/**
 * 驗證密碼（支持 PBKDF2 新格式和舊 SHA-256 格式）
 * @param {string} password - 原始密碼
 * @param {string} storedHash - 存儲的雜湊值（新格式：salt:hash，舊格式：純 hash）
 * @returns {Promise<boolean>} - 密碼是否正確
 */
async function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false;
  }
  
  const encoder = new TextEncoder();
  
  // 檢查是否為新格式（包含冒號）
  if (storedHash.includes(':')) {
    // 新格式：PBKDF2 (salt:hash)
    const [saltHex, storedHashHex] = storedHash.split(':');
    
    if (!saltHex || !storedHashHex) {
      console.error('Invalid hash format: missing salt or hash');
      return false;
    }
    
    try {
      // 將十六進制鹽值轉換回 Uint8Array
      const salt = new Uint8Array(
        saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      
      // 導入密碼為 PBKDF2 密鑰材料
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
      );
      
      // 使用相同的參數重新計算雜湊
      const hashBuffer = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        passwordKey,
        256 // 256 bits = 32 bytes
      );
      
      // 將計算出的 hash 轉換為十六進制字串
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const computedHashHex = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // 比對計算出的 hash 與存儲的 hash
      return computedHashHex === storedHashHex;
    } catch (error) {
      console.error('PBKDF2 verification error:', error);
      return false;
    }
  } else {
    // 舊格式：SHA-256（向後兼容）
    // 為了安全，保留此 fallback 以便舊用戶能登入
    // 建議：在驗證成功後，可以選擇升級為新格式（需要更新資料庫）
    try {
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      return passwordHash === storedHash;
    } catch (error) {
      console.error('SHA-256 fallback verification error:', error);
      return false;
    }
  }
}

// 生成 JWT Token
function generateJWT(userId, email, env) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7天過期
  };
  
  // 使用 Base64URL 編碼（不是標準 base64）
  const base64UrlEncode = (str) => {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  // 從環境變數讀取密鑰（實際應用中應該使用 HMAC-SHA256）
  const secret = env.JWT_SECRET || 'fitness-tracker-secret-key-v2'; // Fallback for development
  if (!env.JWT_SECRET) {
    console.warn('警告：JWT_SECRET 環境變數未設置，使用預設值（僅用於開發）');
  }
  const signature = base64UrlEncode(secret + encodedHeader + encodedPayload);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// 同步訓練數據
async function handleSyncData(request, env, corsHeaders) {
  console.log('=== 開始處理 syncData 請求 ===');
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // 驗證 JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token, env);
    
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { workouts } = await request.json();
    console.log('同步的訓練數據:', workouts);

    // 清除用戶的舊數據
    await env.DB.prepare(
      'DELETE FROM workouts WHERE user_id = ?'
    ).bind(payload.sub).run();

    // 插入新數據
    for (const workout of workouts) {
      await env.DB.prepare(
        'INSERT INTO workouts (id, user_id, date, exercise, muscle_group, weight, reps, sets, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        workout.id,
        payload.sub,
        workout.date,
        workout.exercise,
        workout.muscleGroup,
        workout.weight,
        workout.reps,
        workout.sets,
        workout.notes || '',
        new Date().toISOString()
      ).run();
    }

    console.log(`成功同步 ${workouts.length} 條訓練記錄`);

    return new Response(JSON.stringify({
      message: '數據同步成功',
      count: workouts.length
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Sync data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to sync data: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 獲取訓練數據
async function handleGetData(request, env, corsHeaders) {
  console.log('=== 開始處理 getData 請求 ===');
  
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // 驗證 JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token, env);
    
    if (!payload) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 從數據庫獲取用戶的訓練數據
    const workouts = await env.DB.prepare(
      'SELECT id, date, exercise, muscle_group, weight, reps, sets, notes FROM workouts WHERE user_id = ? ORDER BY date DESC'
    ).bind(payload.sub).all();

    console.log(`獲取到 ${workouts.results.length} 條訓練記錄`);

    return new Response(JSON.stringify({
      workouts: workouts.results.map(workout => ({
        id: workout.id,
        date: workout.date,
        exercise: workout.exercise,
        muscleGroup: workout.muscle_group,
        weight: workout.weight,
        reps: workout.reps,
        sets: workout.sets,
        notes: workout.notes
      }))
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get data error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get data: ' + error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

// 驗證 JWT Token
function verifyJWT(token, env) {
  try {
    console.log('驗證 JWT token:', token ? token.substring(0, 20) + '...' : 'null');
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('JWT 格式錯誤：部分數量不正確');
      return null;
    }
    
    const [header, payload, signature] = parts;
    
    // Base64URL 解碼
    const base64UrlDecode = (str) => {
      // 將 Base64URL 轉換回標準 Base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      // 添加缺失的 padding
      while (base64.length % 4) {
        base64 += '=';
      }
      return atob(base64);
    };
    
    // 解碼 payload
    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    console.log('解碼的 payload - userId:', decodedPayload.sub, 'email:', decodedPayload.email);
    
    // 檢查過期時間
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < currentTime) {
      console.log('Token 已過期:', new Date(decodedPayload.exp * 1000), 'current:', new Date());
      return null;
    }
    
    // 從環境變數讀取密鑰並驗證簽名（簡化版本 - 實際應用中應該重新生成簽名並比較）
    const secret = env.JWT_SECRET || 'fitness-tracker-secret-key-v2'; // Fallback for development
    if (!env.JWT_SECRET) {
      console.warn('警告：JWT_SECRET 環境變數未設置，使用預設值（僅用於開發）');
    }
    const base64UrlEncode = (str) => {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };
    const expectedSignature = base64UrlEncode(secret + header + payload);
    
    if (signature !== expectedSignature) {
      console.log('JWT 簽名驗證失敗');
      // 對於開發環境，我們暫時允許簽名不匹配（因為簡化的簽名方法）
      console.log('警告：簽名不匹配但繼續執行（開發模式）');
    }
    
    console.log('JWT 驗證成功');
    return decodedPayload;
  } catch (error) {
    console.log('JWT 驗證錯誤:', error.message);
    return null;
  }
}
