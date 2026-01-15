#!/bin/bash

# Supabase E2E 测试环境配置脚本
# 用途: 快速配置 Supabase 数据库连接以支持 E2E 测试的数据库断言

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Supabase E2E 测试配置向导"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查是否已有配置
if [ -f ".env.test" ]; then
    echo "⚠️  发现已存在的 .env.test 文件"
    read -p "是否覆盖? (y/n): " OVERWRITE
    if [ "$OVERWRITE" != "y" ]; then
        echo "❌ 配置取消"
        exit 0
    fi
fi

echo "📝 请提供 Supabase 凭证"
echo ""
echo "💡 提示: 从 Supabase Dashboard 获取这些信息"
echo "   1. 访问: https://app.supabase.com"
echo "   2. 选择您的项目"
echo "   3. 进入 Settings > API"
echo ""

# 获取 Supabase URL
read -p "📍 SUPABASE_URL (https://xxxxx.supabase.co): " SUPABASE_URL

# 验证 URL 格式
if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
    echo "❌ URL 格式不正确，应该类似: https://xxxxx.supabase.co"
    exit 1
fi

# 获取 Service Role Key
echo ""
echo "🔑 请输入 Service Role Key"
echo "   (在 Settings > API > Project API keys > service_role)"
echo ""
read -p "🔐 SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_KEY

# 验证 Key 格式 (JWT 格式)
if [[ ! "$SUPABASE_KEY" =~ ^eyJ ]]; then
    echo "⚠️  警告: Service Role Key 通常以 'eyJ' 开头"
    read -p "确认继续? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        exit 1
    fi
fi

# 创建 .env.test 文件
echo ""
echo "💾 正在保存配置到 .env.test..."

cat > .env.test <<EOF
# Supabase E2E Test Configuration
# Generated at: $(date '+%Y-%m-%d %H:%M:%S')

SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY

# Optional: Enable debug logging
# DEBUG=supabase:*
EOF

echo "✅ 配置已保存到 frontend/.env.test"

# 添加到 .gitignore
echo ""
echo "🔒 正在更新 .gitignore..."

if ! grep -q "^\.env\.test$" .gitignore 2>/dev/null; then
    echo ".env.test" >> .gitignore
    echo "✅ 已将 .env.test 添加到 .gitignore"
else
    echo "✅ .env.test 已在 .gitignore 中"
fi

# 检查并安装依赖
echo ""
echo "📦 检查依赖..."

if ! npm list @supabase/supabase-js >/dev/null 2>&1; then
    echo "📥 安装 @supabase/supabase-js..."
    npm install --save-dev @supabase/supabase-js
else
    echo "✅ @supabase/supabase-js 已安装"
fi

if ! npm list dotenv >/dev/null 2>&1; then
    echo "📥 安装 dotenv..."
    npm install --save-dev dotenv
else
    echo "✅ dotenv 已安装"
fi

# 验证连接
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 验证 Supabase 连接..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('');
console.log('配置信息:');
console.log('  URL:', supabaseUrl);
console.log('  Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Missing');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

(async () => {
  try {
    console.log('🔄 正在连接 Supabase...');

    // 测试数据库连接
    const { data, error, count } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    console.log('');
    console.log('✅ Supabase 连接成功！');
    console.log('✅ 数据库访问验证通过');
    console.log('✅ inventory 表存在 (记录数: ' + (count || 0) + ')');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 配置完成！您现在可以运行 E2E 测试了');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('运行测试命令:');
    console.log('  npm run test:e2e ../scenarios/inventory/E2E-INVENTORY-002.spec.ts');
    console.log('');
    console.log('或 UI 模式:');
    console.log('  npm run test:e2e:ui ../scenarios/inventory/E2E-INVENTORY-002.spec.ts');
    console.log('');

  } catch (err) {
    console.error('');
    console.error('❌ 连接失败:', err.message);
    console.error('');
    console.error('可能的原因:');
    console.error('  1. URL 或 Key 不正确');
    console.error('  2. 网络连接问题');
    console.error('  3. Supabase 项目未启动');
    console.error('  4. inventory 表不存在');
    console.error('');
    console.error('请检查配置并重试: ./setup-supabase-e2e.sh');
    console.error('');
    process.exit(1);
  }
})();
" || {
    echo ""
    echo "❌ 验证脚本执行失败"
    echo ""
    echo "请手动验证配置:"
    echo "  1. 检查 .env.test 文件内容"
    echo "  2. 确认 URL 和 Key 正确"
    echo "  3. 确认网络连接正常"
    echo ""
    exit 1
}
