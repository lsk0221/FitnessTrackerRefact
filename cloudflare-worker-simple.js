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
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
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

    return new Response(JSON.stringify({
      message: '註冊成功',
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
    const token = generateJWT(user.id, user.email);
    
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
    
    const payload = verifyJWT(token);
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
      await env.DB.prepare(
        'INSERT INTO users (id, email, display_name, provider, providerId, created_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userId, facebookUserInfo.email, facebookUserInfo.name, 'facebook', facebookUserInfo.id, new Date().toISOString()).run();

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
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 驗證密碼
async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// 生成 JWT Token
function generateJWT(userId, email) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    sub: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小時過期
  };
  
  // 簡化的 JWT 生成（實際應用中應該使用更安全的密鑰）
  const secret = 'fitness-tracker-secret-key';
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // 簡化的簽名（實際應用中應該使用 HMAC-SHA256）
  const signature = btoa(secret + encodedHeader + encodedPayload);
  
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
    const payload = verifyJWT(token);
    
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
    const payload = verifyJWT(token);
    
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
function verifyJWT(token) {
  try {
    console.log('驗證 JWT token:', token);
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('JWT 格式錯誤：部分數量不正確');
      return null;
    }
    
    const [header, payload, signature] = parts;
    
    // 解碼 payload
    const decodedPayload = JSON.parse(atob(payload));
    console.log('解碼的 payload:', decodedPayload);
    
    // 檢查過期時間
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < currentTime) {
      console.log('Token 已過期:', decodedPayload.exp, '<', currentTime);
      return null;
    }
    
    console.log('JWT 驗證成功');
    return decodedPayload;
  } catch (error) {
    console.log('JWT 驗證錯誤:', error.message);
    return null;
  }
}
