#!/bin/bash
# 簡易ローカルサーバー起動スクリプト
# Usage: ./start.sh [port]

PORT=${1:-8000}

echo "🚀 PDF Editor を http://localhost:${PORT} で起動します..."
echo "   停止するには Ctrl+C を押してください"
echo ""

if command -v python3 &> /dev/null; then
  python3 -m http.server ${PORT}
elif command -v python &> /dev/null; then
  python -m SimpleHTTPServer ${PORT}
elif command -v npx &> /dev/null; then
  npx serve -l ${PORT} .
else
  echo "❌ Python または Node.js (npx) が見つかりません"
  echo "   index.html を直接ブラウザで開いてみてください"
  exit 1
fi
