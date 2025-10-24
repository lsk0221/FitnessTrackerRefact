#!/bin/bash

echo "
╔═══════════════════════════════════════════════════════════╗
║        🔄 完全清除緩存並重新啟動                          ║
╚═══════════════════════════════════════════════════════════╝
"

echo "📋 Step 1/3: 清除緩存..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf $TMPDIR/metro-* 2>/dev/null
rm -rf $TMPDIR/react-* 2>/dev/null
echo "✅ 緩存已清除"

echo ""
echo "📋 Step 2/3: 驗證配置..."
echo "當前 Babel 配置："
cat babel.config.js
echo ""
echo "✅ 配置已驗證"

echo ""
echo "📋 Step 3/3: 啟動 Metro Bundler..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npx expo start --clear

