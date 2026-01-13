# Supabase E2E 测试配置指南

**目的**: 配置 Supabase 数据库连接，使 E2E 测试能够验证库存状态和事务记录

---

## 📋 前提条件

您需要有一个正在运行的 Supabase 项目。

---

## 🔑 步骤 1: 获取 Supabase 凭证

### 方法 1: 从 Supabase Dashboard 获取

1. **登录 Supabase Dashboard**
   - 访问: https://app.supabase.com
   - 登录您的账户
   - 选择您的项目

2. **获取 Project URL**
   - 在左侧菜单点击 **Settings** (设置)
   - 点击 **API**
   - 找到 **Project URL** 部分
   - 复制 URL，格式类似: `https://xxxxxxxxxxxxx.supabase.co`

3. **获取 Service Role Key**
   - 在同一页面 (**Settings > API**)
   - 找到 **Project API keys** 部分
   - 找到 **service_role** (secret) 密钥
   - 点击 **Reveal** 显示密钥
   - ⚠️ **重要**: 这是一个敏感密钥，拥有绕过 RLS 的权限
   - 复制该密钥

**示例**:
```
Project URL: https://xyzabcdefghijk.supabase.co
Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiY2RlZmdoaWprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYxNjE2MTYxNiwiZXhwIjoxOTMxNzM3NjE2fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 方法 2: 从现有配置文件获取

如果您的后端已经配置了 Supabase，可以从以下文件查找:

```bash
# 查看后端配置
cat backend/src/main/resources/application.yml | grep -A 5 supabase

# 或者查看环境变量
env | grep SUPABASE
```

---

## 🔧 步骤 2: 配置环境变量

### 选项 1: 创建 `.env.test` 文件 (推荐)

在 `frontend` 目录创建 `.env.test` 文件:

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/frontend

cat > .env.test <<'EOF'
# Supabase Configuration for E2E Tests
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional: Enable debug logging
DEBUG=supabase:*
EOF
```

**替换实际值**:
```bash
# 用您的实际值替换
SUPABASE_URL=https://xyzabcdefghijk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 选项 2: 添加到现有 `.env` 文件

如果 `frontend/.env` 文件已存在，追加配置:

```bash
cd frontend

# 追加配置
cat >> .env <<'EOF'

# E2E Test Database Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
```

### 选项 3: 使用命令行环境变量 (临时)

运行测试时临时设置:

```bash
cd frontend

SUPABASE_URL=https://xyzabcdefghijk.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
npm run test:e2e ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

---

## 📝 步骤 3: 验证配置

### 3.1 创建测试脚本验证连接

创建临时验证脚本:

```bash
cd frontend

cat > verify-supabase.js <<'EOF'
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verifying Supabase configuration...\n');
console.log('SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('\n❌ Missing configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

(async () => {
  try {
    // Test connection by querying a simple table
    const { data, error } = await supabase
      .from('inventory')
      .select('count')
      .limit(1);

    if (error) {
      console.error('\n❌ Connection failed:', error.message);
      process.exit(1);
    }

    console.log('\n✅ Supabase connection successful!');
    console.log('✅ Database access verified');
    console.log('\nYou can now run E2E tests with database assertions.');
  } catch (err) {
    console.error('\n❌ Connection error:', err.message);
    process.exit(1);
  }
})();
EOF

# 安装依赖
npm install @supabase/supabase-js dotenv

# 运行验证
node verify-supabase.js
```

**预期输出**:
```
🔍 Verifying Supabase configuration...

SUPABASE_URL: ✅ Set
SUPABASE_SERVICE_ROLE_KEY: ✅ Set

✅ Supabase connection successful!
✅ Database access verified

You can now run E2E tests with database assertions.
```

---

## 🔐 安全最佳实践

### 1. 添加 `.env` 到 `.gitignore`

确保敏感信息不会被提交到 Git:

```bash
cd frontend

# 检查 .gitignore 是否包含 .env
grep -q "^\.env" .gitignore || echo ".env" >> .gitignore
grep -q "^\.env\.test" .gitignore || echo ".env.test" >> .gitignore
```

### 2. 使用环境变量模板

创建 `.env.example` 模板文件供团队参考:

```bash
cd frontend

cat > .env.example <<'EOF'
# Supabase Configuration
# Get these values from: https://app.supabase.com/project/_/settings/api

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Note: NEVER commit .env file to git!
# Copy this file to .env and fill in your actual values
EOF

git add .env.example
```

### 3. 使用不同的密钥用于测试环境

**生产环境**: 使用受限权限的 `anon` key
**测试环境**: 使用 `service_role` key (仅限本地/CI)

---

## 📦 步骤 4: 安装 Supabase 依赖

测试脚本需要 `@supabase/supabase-js` 包:

```bash
cd frontend

# 安装 Supabase 客户端
npm install --save-dev @supabase/supabase-js

# 安装 dotenv (用于加载 .env 文件)
npm install --save-dev dotenv
```

---

## 🧪 步骤 5: 运行测试

配置完成后，运行 E2E 测试:

```bash
cd frontend

# 方式 1: 使用 .env 文件
npm run test:e2e ../scenarios/inventory/E2E-INVENTORY-002.spec.ts

# 方式 2: 使用 .env.test 文件
npm run test:e2e ../scenarios/inventory/E2E-INVENTORY-002.spec.ts -- --env-file=.env.test

# 方式 3: UI 模式
npm run test:e2e:ui ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

---

## 🐛 故障排查

### 问题 1: "Missing Supabase configuration"

**错误信息**:
```
Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set
```

**解决方案**:
```bash
# 检查环境变量是否加载
cd frontend
node -e "require('dotenv').config(); console.log('URL:', process.env.SUPABASE_URL); console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');"

# 如果未加载，检查 .env 文件是否存在
ls -la .env .env.test

# 重新创建 .env 文件
cat > .env <<'EOF'
SUPABASE_URL=https://your-actual-url.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-key
EOF
```

### 问题 2: "Connection refused" 或 "Invalid API key"

**错误信息**:
```
Error: Failed to connect to Supabase: Invalid API key
```

**解决方案**:
1. 确认 URL 和 Key 正确复制（没有多余空格）
2. 确认使用的是 `service_role` key，不是 `anon` key
3. 在 Supabase Dashboard 重新生成密钥

```bash
# 重新获取密钥
# 1. 登录 https://app.supabase.com
# 2. 进入项目 Settings > API
# 3. 复制 service_role key
# 4. 更新 .env 文件
```

### 问题 3: "Table 'inventory' does not exist"

**错误信息**:
```
Error: relation "inventory" does not exist
```

**解决方案**:
检查数据库表是否已创建:

```sql
-- 在 Supabase SQL Editor 中运行
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('inventory', 'inventory_transactions');
```

如果表不存在，运行迁移脚本:
```bash
cd backend
./run-migration.sh
```

### 问题 4: "Permission denied" 或 RLS 错误

**错误信息**:
```
Error: new row violates row-level security policy
```

**解决方案**:
确保使用 `service_role` key，它会绕过 RLS 策略:

```typescript
// scenarios/inventory/helpers/dbAssertions.ts
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false  // 使用 service role，绕过 RLS
  }
});
```

---

## 📊 完整配置检查清单

运行测试前，确认以下项目:

- [ ] ✅ 已获取 `SUPABASE_URL`
- [ ] ✅ 已获取 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] ✅ 已创建 `frontend/.env` 或 `frontend/.env.test` 文件
- [ ] ✅ 已将 `.env` 添加到 `.gitignore`
- [ ] ✅ 已安装 `@supabase/supabase-js` 依赖
- [ ] ✅ 已运行验证脚本确认连接成功
- [ ] ✅ 数据库表 `inventory` 和 `inventory_transactions` 已创建
- [ ] ✅ C端、B端、后端服务器正在运行

---

## 🎯 快速配置命令（一键执行）

```bash
#!/bin/bash
# 快速配置 Supabase E2E 测试

cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/frontend

# 提示用户输入凭证
echo "🔧 Supabase E2E 测试配置"
echo ""
read -p "请输入 SUPABASE_URL: " SUPABASE_URL
read -p "请输入 SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_KEY

# 创建 .env.test 文件
cat > .env.test <<EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_KEY
EOF

echo ""
echo "✅ 配置已保存到 frontend/.env.test"

# 安装依赖
echo ""
echo "📦 安装 Supabase 依赖..."
npm install --save-dev @supabase/supabase-js dotenv

# 验证连接
echo ""
echo "🔍 验证 Supabase 连接..."

node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.test' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

(async () => {
  try {
    const { data, error } = await supabase.from('inventory').select('count').limit(1);
    if (error) throw error;
    console.log('\\n✅ Supabase 连接成功！');
    console.log('✅ 您现在可以运行 E2E 测试了');
  } catch (err) {
    console.error('\\n❌ 连接失败:', err.message);
    process.exit(1);
  }
})();
"

echo ""
echo "🚀 运行测试:"
echo "   npm run test:e2e ../scenarios/inventory/E2E-INVENTORY-002.spec.ts"
```

保存为 `setup-supabase.sh`，然后运行:

```bash
cd frontend
chmod +x setup-supabase.sh
./setup-supabase.sh
```

---

## 📚 相关文档

- Supabase 官方文档: https://supabase.com/docs
- Supabase JavaScript 客户端: https://supabase.com/docs/reference/javascript
- E2E 测试实现报告: `docs/E2E_IMPLEMENTATION_COMPLETE.md`

---

**配置完成后，您可以运行 E2E 测试并验证数据库断言了！** 🎉
