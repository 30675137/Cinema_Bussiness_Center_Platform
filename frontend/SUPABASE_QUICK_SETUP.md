# Supabase E2E 配置 - 快速参考

## 🚀 方法 1: 一键配置脚本（推荐）

```bash
cd frontend
./setup-supabase-e2e.sh
```

按提示输入：
1. **SUPABASE_URL**: `https://xxxxx.supabase.co`
2. **SUPABASE_SERVICE_ROLE_KEY**: `eyJhbGciOiJIUz...`

脚本会自动：
- ✅ 创建 `.env.test` 文件
- ✅ 安装必要的依赖
- ✅ 验证数据库连接
- ✅ 添加到 `.gitignore`

---

## 📝 方法 2: 手动配置

### 步骤 1: 获取凭证

访问 https://app.supabase.com
1. 选择项目
2. 进入 **Settings** > **API**
3. 复制 **Project URL**
4. 复制 **service_role** key

### 步骤 2: 创建配置文件

```bash
cd frontend

cat > .env.test <<'EOF'
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
EOF
```

### 步骤 3: 安装依赖

```bash
npm install --save-dev @supabase/supabase-js dotenv
```

### 步骤 4: 验证配置

```bash
node -e "
require('dotenv').config({ path: '.env.test' });
console.log('URL:', process.env.SUPABASE_URL ? '✅' : '❌');
console.log('Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
"
```

---

## 🎯 配置完成后运行测试

```bash
cd frontend

# UI 模式（推荐）
npm run test:e2e:ui ../scenarios/inventory/E2E-INVENTORY-002.spec.ts

# Headed 模式
npm run test:e2e ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --headed

# 无头模式
npm run test:e2e ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

---

## 🔍 从现有配置获取凭证

如果后端已配置 Supabase，可以查看：

```bash
# 查看后端配置
cat ../backend/src/main/resources/application.yml | grep -A 3 supabase

# 或查看环境变量
env | grep SUPABASE
```

---

## ⚠️ 安全提示

- ❌ **不要**将 `.env.test` 提交到 Git
- ✅ 已自动添加到 `.gitignore`
- ✅ Service Role Key 拥有完全权限，仅用于测试

---

## 📚 详细文档

完整配置指南: `docs/SUPABASE_E2E_CONFIG_GUIDE.md`
