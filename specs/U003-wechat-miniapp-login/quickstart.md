# Quickstart: 微信小程序登录功能

**Feature**: U003-wechat-miniapp-login
**Date**: 2025-12-24
**Branch**: `U003-wechat-miniapp-login`

## 前置条件

### 必需工具
- Java 21
- Node.js 18+
- npm/pnpm
- 微信开发者工具
- Supabase 账号

### 必需凭证
- **Supabase Project**: 已创建 Supabase 项目
- **Supabase URL 和 API Key**: 从 Supabase Dashboard > Settings > API 获取
- **微信小程序 AppID 和 AppSecret**: 从微信公众平台获取

## Phase 1: Supabase Auth 环境配置

### T001: 启用 Supabase Auth 功能

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 导航到 **Authentication** > **Settings**
4. 配置 JWT 令牌有效期：
   - **JWT Expiry (Access Token)**: 设置为 `604800` 秒（7天）
   - **Refresh Token Expiry**: 设置为 `2592000` 秒（30天）
5. 点击 **Save** 保存设置

### T002: 创建 GIN 索引支持 openid 查询

在 Supabase Dashboard 中打开 **SQL Editor**，执行以下 SQL：

```sql
-- 创建 GIN 索引支持 user_metadata 中的 openid 查询
CREATE INDEX IF NOT EXISTS idx_users_metadata_openid
  ON auth.users
  USING GIN ((raw_user_meta_data->'openid'));

-- 验证索引创建成功
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users'
  AND schemaname = 'auth'
  AND indexname = 'idx_users_metadata_openid';
```

**预期输出**:
```
indexname                   | indexdef
---------------------------|--------------------------------------------------
idx_users_metadata_openid  | CREATE INDEX ... USING gin ...
```

### T003: 配置 Supabase RLS 策略

在 **SQL Editor** 中执行以下 SQL 创建 RLS 策略：

```sql
-- 启用 auth.users 表的 RLS（默认已启用，此处确认）
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- 策略 1: 用户只能读取自己的信息
CREATE POLICY IF NOT EXISTS "Users can read own data"
  ON auth.users
  FOR SELECT
  USING (auth.uid() = id);

-- 策略 2: 用户只能更新自己的 metadata
CREATE POLICY IF NOT EXISTS "Users can update own metadata"
  ON auth.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 验证策略创建成功
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'auth';
```

**预期输出**:
```
policyname                     | cmd    | roles
-------------------------------|--------|-------
Users can read own data        | SELECT | public
Users can update own metadata  | UPDATE | public
```

## Phase 1: 后端依赖配置

### T004-T006: 添加后端依赖

在 `backend/pom.xml` 中添加以下依赖：

```xml
<!-- Supabase Java Client -->
<dependency>
    <groupId>io.supabase</groupId>
    <artifactId>postgrest-kt</artifactId>
    <version>1.0.0</version>
</dependency>

<!-- OkHttp for WeChat API -->
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.12.0</version>
</dependency>

<!-- JWT Parser -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

### T007-T009: 环境变量配置

1. **创建 `.env` 文件**（不要提交到 Git）:

```bash
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 微信小程序配置
WECHAT_APPID=wx1234567890abcdef
WECHAT_APP_SECRET=your-app-secret-here
```

2. **更新 `backend/src/main/resources/application.yml`**:

```yaml
supabase:
  url: ${SUPABASE_URL}
  anon-key: ${SUPABASE_ANON_KEY}
  service-role-key: ${SUPABASE_SERVICE_ROLE_KEY}

wechat:
  miniprogram:
    app-id: ${WECHAT_APPID}
    app-secret: ${WECHAT_APP_SECRET}
```

3. **验证环境变量加载**:

```bash
cd backend
export $(cat ../.env | xargs)
mvn spring-boot:run
```

## Phase 2: C端 Taro 项目配置

### 安装 Taro 依赖

```bash
cd hall-reserve-taro
npm install @tarojs/taro@3.x
npm install zustand@5.x
npm install @tanstack/react-query@5.x
```

### 配置微信小程序 AppID

更新 `hall-reserve-taro/project.config.json`:

```json
{
  "appid": "wx1234567890abcdef",
  "projectname": "hall-reserve-taro",
  "miniprogramRoot": "dist/",
  "compileType": "miniprogram"
}
```

## 开发服务器启动

### 后端服务

```bash
cd backend
mvn spring-boot:run
```

后端服务将在 `http://localhost:8080` 启动

### C端 H5 开发

```bash
cd hall-reserve-taro
npm run dev:h5
```

H5 应用将在 `http://localhost:10086` 启动

### C端微信小程序开发

```bash
cd hall-reserve-taro
npm run dev:weapp
```

然后用微信开发者工具打开 `hall-reserve-taro/dist/weapp` 目录

## 验证配置

### 1. 验证 Supabase Auth 配置

在 Supabase Dashboard > SQL Editor 执行：

```sql
-- 检查 GIN 索引
SELECT indexname FROM pg_indexes
WHERE tablename = 'users'
  AND schemaname = 'auth'
  AND indexname = 'idx_users_metadata_openid';

-- 检查 RLS 策略
SELECT policyname FROM pg_policies
WHERE tablename = 'users'
  AND schemaname = 'auth';
```

### 2. 验证后端依赖

```bash
cd backend
mvn dependency:tree | grep -E "(supabase|okhttp|jjwt)"
```

### 3. 验证环境变量

```bash
cd backend
mvn spring-boot:run

# 检查日志中是否包含：
# - Supabase URL: https://your-project-id.supabase.co
# - WeChat AppID: wx1234567890abcdef
```

## 常见问题

### Q1: Supabase Auth JWT 配置在哪里？
**A**: Supabase Dashboard > Settings > API > JWT Settings

### Q2: 如何获取 Supabase Service Role Key？
**A**: Supabase Dashboard > Settings > API > Service Role Key（**注意保密，仅后端使用**）

### Q3: 微信 AppSecret 在哪里获取？
**A**: 微信公众平台 > 开发 > 开发设置 > 开发者ID > AppSecret（**注意保密**）

### Q4: GIN 索引创建失败怎么办？
**A**: 确保你使用的是 Supabase Service Role Key 执行 SQL，而非 Anon Key

### Q5: RLS 策略会影响后端 Admin API 吗？
**A**: 不会。后端使用 Service Role Key 可以绕过 RLS 策略执行 adminCreateUser 等操作

## 下一步

完成以上配置后，可以开始执行 tasks.md 中的任务：

- ✅ Phase 1 (T001-T009): Supabase Auth 和后端依赖配置
- 🔜 Phase 2 (T010-T018): 创建外部客户端、DTOs、领域模型
- 🔜 Phase 3 (T019-T027): 实现 User Story 1 - 静默登录

## 参考文档

- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)
- [Supabase Java Client](https://github.com/supabase-community/supabase-java)
- [微信小程序登录](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/login.html)
- [Taro 框架文档](https://taro-docs.jd.com/docs/)
