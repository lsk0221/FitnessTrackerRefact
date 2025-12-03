/**
 * OAuth Database Migration
 * 為支持 Google 和 Apple 登入的數據庫遷移
 * 
 * This migration adds support for OAuth providers (Google, Apple)
 * 此遷移為數據庫添加 OAuth 提供商支持（Google、Apple）
 * 
 * Run this migration if your users table doesn't have provider and providerId columns
 * 如果您的 users 表沒有 provider 和 providerId 列，請運行此遷移
 */

-- Check if columns exist, if not add them
-- 檢查列是否存在，如果不存在則添加

-- Add provider column (if not exists)
-- 添加 provider 列（如果不存在）
-- Note: D1 doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS
-- You may need to check manually or use a migration tool
-- 注意：D1 不支持 ALTER TABLE ADD COLUMN IF NOT EXISTS
-- 您可能需要手動檢查或使用遷移工具

-- For new installations, use this CREATE TABLE:
-- 對於新安裝，使用此 CREATE TABLE：
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  password TEXT, -- NULL for OAuth users
  provider TEXT DEFAULT 'email', -- 'email', 'google', 'apple', 'facebook'
  providerId TEXT, -- OAuth provider user ID (e.g., Google sub, Apple sub)
  avatar_url TEXT, -- Optional: profile picture URL
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- For existing installations, add missing columns:
-- 對於現有安裝，添加缺失的列：

-- Add provider column (if missing)
-- ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'email';

-- Add providerId column (if missing)
-- ALTER TABLE users ADD COLUMN providerId TEXT;

-- Add avatar_url column (optional, for profile pictures)
-- ALTER TABLE users ADD COLUMN avatar_url TEXT;

-- Update existing users to have provider = 'email'
-- 更新現有用戶，設置 provider = 'email'
-- UPDATE users SET provider = 'email' WHERE provider IS NULL;

-- Create index for faster lookups
-- 創建索引以加快查找速度
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_providerId ON users(provider, providerId);

/**
 * Migration Notes:
 * 
 * 1. The users table already supports OAuth through:
 *    - provider column: stores the authentication provider ('email', 'google', 'apple', 'facebook')
 *    - providerId column: stores the OAuth provider's user ID
 *    - password column: can be NULL for OAuth users
 * 
 * 2. If your users table was created before OAuth support, you may need to:
 *    - Add provider and providerId columns
 *    - Set provider = 'email' for existing users
 *    - Make password nullable (if it wasn't already)
 * 
 * 3. The avatar_url column is optional but recommended for storing profile pictures
 *    from OAuth providers (Google, Apple, Facebook)
 * 
 * 4. To check your current schema:
 *    PRAGMA table_info(users);
 */

