#!/bin/bash

echo "
╔═══════════════════════════════════════════════════════════╗
║         🚀 FitnessTracker - 啟動測試環境                  ║
╚═══════════════════════════════════════════════════════════╝
"

# 檢查當前目錄
if [ ! -f "package.json" ]; then
    echo "❌ 錯誤：請在專案根目錄執行此腳本"
    exit 1
fi

echo "📋 正在進行環境檢查..."
echo ""

# 檢查 .env 文件
if [ -f ".env" ]; then
    echo "✅ .env 文件存在"
    grep "EXPO_PUBLIC_API_URL" .env
else
    echo "⚠️  警告：.env 文件不存在"
fi

echo ""

# 檢查後端連線
echo "🌐 測試後端連線..."
if curl -s -f -o /dev/null https://fitness-tracker-api.fitness-tracker.workers.dev/auth/login -X POST -H "Content-Type: application/json" -d '{}'; then
    echo "✅ 後端連線正常"
else
    echo "⚠️  後端連線可能有問題，但繼續啟動..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 正在啟動 Expo 開發伺服器..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 請在手機上："
echo "   1. 打開 Expo Go 應用"
echo "   2. 掃描下方的 QR Code"
echo "   3. 或輸入顯示的 URL"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 啟動 Expo
npm start
