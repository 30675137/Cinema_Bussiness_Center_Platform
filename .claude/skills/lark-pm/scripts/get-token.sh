#!/bin/bash
# @spec T004-lark-project-management
# Helper script to get Lark access token

set -e

echo "=========================================="
echo "飞书访问令牌获取工具"
echo "=========================================="
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "❌ 需要安装 jq 工具"
    echo "安装命令: brew install jq"
    exit 1
fi

# Read App ID and Secret
read -p "请输入 App ID: " APP_ID
read -s -p "请输入 App Secret: " APP_SECRET
echo ""
echo ""

# Get Tenant Access Token
echo "🔄 正在获取 Tenant Access Token..."

RESPONSE=$(curl -s -X POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal \
  -H 'Content-Type: application/json' \
  -d "{
    \"app_id\": \"$APP_ID\",
    \"app_secret\": \"$APP_SECRET\"
  }")

# Check if successful
CODE=$(echo $RESPONSE | jq -r '.code')

if [ "$CODE" != "0" ]; then
    echo "❌ 获取 Token 失败"
    echo "错误信息: $(echo $RESPONSE | jq -r '.msg')"
    exit 1
fi

TOKEN=$(echo $RESPONSE | jq -r '.tenant_access_token')

echo "✅ Token 获取成功！"
echo ""
echo "=========================================="
echo "请将以下内容复制到 .env 文件："
echo "=========================================="
echo ""
echo "LARK_APP_ID=$APP_ID"
echo "LARK_APP_SECRET=$APP_SECRET"
echo "LARK_USER_ACCESS_TOKEN=$TOKEN"
echo "LOG_LEVEL=info"
echo ""
echo "=========================================="
echo "⚠️  注意: Tenant Access Token 有效期为 2 小时"
echo "⚠️  如需长期使用，请使用 User Access Token"
echo "=========================================="
