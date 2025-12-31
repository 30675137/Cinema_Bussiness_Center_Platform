# Supabase 连接问题诊断报告

**@spec O004-beverage-sku-reuse**
**日期**: 2025-12-31
**问题状态**: 🔴 阻塞 - 需要 Supabase 管理员介入

---

## 问题摘要

Flyway 迁移无法连接到 Supabase PostgreSQL 数据库（Pooler 模式和直连模式均失败）。

## 已测试的连接方式

### 测试 1: Pooler 模式 (aws-1-us-east-2)
```
URL: jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres
结果: ❌ Connection reset (认证阶段失败)
错误: doAuthentication() 中连接被重置
```

### 测试 2: Pooler 模式 + 禁用 SSL
```
URL: jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=disable
结果: ❌ Connection reset (认证阶段失败)
结论: 不是 SSL 配置问题
```

### 测试 3: Pooler 模式 (aws-0-us-east-1)
```
URL: jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres
结果: ❌ Read timed out
```

### 测试 4: 直连模式 (db.*.supabase.co:5432)
```
URL: jdbc:postgresql://db.fxhgyxceqrmnpezluaht.supabase.co:5432/postgres
结果: ❌ DNS 解析失败 / Read timed out
```

### 测试 5: 网络连通性测试
```bash
# Supabase REST API
curl -I https://fxhgyxceqrmnpezluaht.supabase.co
结果: ✅ HTTP/2 200 OK

# PostgreSQL Pooler 端口
nc -zv aws-1-us-east-2.pooler.supabase.com 6543
结果: ✅ TCP 连接成功

# 直连端口
nc -zv db.fxhgyxceqrmnpezluaht.supabase.co 5432
结果: ❌ DNS 解析失败
```

## 关键发现

1. **网络层面正常**:
   - ✅ Supabase REST API 可访问
   - ✅ PostgreSQL Pooler 端口 6543 TCP 连接成功
   - ✅ 不是防火墙阻止 TCP 连接

2. **认证层面失败**:
   - ❌ 错误发生在 `ConnectionFactoryImpl.doAuthentication()`
   - ❌ 不是 SSL 问题（禁用 SSL 后仍失败）
   - ❌ 不是 Java 版本问题（Java 17 也失败）

3. **可能原因分析**:
   - **Supabase 项目配置变更**: IP 白名单、连接限制、Pooler 配置
   - **密码或用户名变更**: 数据库密码可能已更新
   - **Pooler 模式限制**: 可能需要特定的连接参数或认证方式
   - **区域限制**: 本地 IP 可能不在 Supabase 允许的区域列表中

## 需要在 Supabase Dashboard 检查的配置

### 步骤 1: 登录 Supabase Dashboard
1. 访问: https://supabase.com/dashboard
2. 选择项目: `fxhgyxceqrmnpezluaht`

### 步骤 2: 检查数据库连接配置
导航到 **Settings** → **Database**

#### 2.1 验证连接字符串
检查 **Connection string** 部分:
- **Transaction mode (Pooler)**: 应显示正确的 Pooler 连接字符串
- **Session mode**: 检查是否有直连选项
- **URI**: 复制最新的连接 URI

#### 2.2 检查连接池配置
检查 **Connection pooling** 部分:
- **Pooler status**: 确认是否启用
- **Pool mode**: 应为 `Transaction` 模式
- **Max connections**: 检查是否达到限制

#### 2.3 检查 IP 白名单
检查 **Network restrictions** 或 **IP allow list** 部分:
- 如果启用了 IP 白名单，添加当前 IP: `<您的本地 IP>`
- 或临时禁用 IP 白名单以测试连接

### 步骤 3: 验证数据库密码
导航到 **Settings** → **Database** → **Database password**

1. 点击 **Reset database password** 生成新密码
2. 复制新密码
3. 更新以下文件中的密码:
   - `backend/pom.xml` (Flyway 配置)
   - `backend/src/main/resources/application.yml` (Spring Boot 配置)

### 步骤 4: 检查项目日志
导航到 **Logs** → **Database logs**

1. 查找与 `postgres.fxhgyxceqrmnpezluaht` 相关的连接拒绝日志
2. 查找 `authentication failed` 或 `connection refused` 错误
3. 记录具体的错误信息

## 临时解决方案（供测试）

### 方案 1: 使用 Supabase CLI（如已安装）
```bash
# 登录 Supabase
supabase login

# 连接到项目
supabase link --project-ref fxhgyxceqrmnpezluaht

# 运行迁移
supabase db push --dry-run
supabase db push
```

### 方案 2: 使用 Supabase Studio SQL Editor
1. 登录 Supabase Dashboard
2. 导航到 **SQL Editor**
3. 手动执行迁移 SQL:
   - 复制 `src/main/resources/db/migration/V064__migrate_beverages_to_skus.sql`
   - 粘贴到 SQL Editor 并执行
   - 验证结果

### 方案 3: 请求 DevOps 支持
如果您没有 Supabase Dashboard 访问权限:

1. 联系 DevOps 或数据库管理员
2. 提供以下信息:
   - 项目 ID: `fxhgyxceqrmnpezluaht`
   - 需要执行的迁移文件: `V064__migrate_beverages_to_skus.sql`
   - 错误日志: 见上方测试结果

## 正确的连接配置（待验证）

根据 Supabase 官方文档，正确的 JDBC 连接字符串格式应为:

### Pooler 模式 (推荐用于应用运行时)
```
jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:6543/postgres?user=postgres.fxhgyxceqrmnpezluaht&password=<password>&sslmode=require
```

### 直连模式 (推荐用于迁移工具)
```
jdbc:postgresql://aws-0-us-east-1.compute.supabase.com:5432/postgres?user=postgres.fxhgyxceqrmnpezluaht&password=<password>&sslmode=require
```

**注意**:
- 主机名可能需要根据项目实际区域调整 (`us-east-1` vs `us-east-2`)
- 密码需要从 Supabase Dashboard 获取最新值

## 下一步行动

1. **立即执行** (优先级 P0):
   - [ ] 登录 Supabase Dashboard 验证项目配置
   - [ ] 检查 IP 白名单设置
   - [ ] 验证数据库密码是否正确
   - [ ] 复制最新的连接字符串

2. **配置修复** (优先级 P1):
   - [ ] 更新 `pom.xml` 和 `application.yml` 中的连接字符串
   - [ ] 如需要，添加本地 IP 到白名单
   - [ ] 重新测试 Flyway 迁移

3. **备选方案** (优先级 P2):
   - [ ] 如仍失败，使用 Supabase Studio SQL Editor 手动执行迁移
   - [ ] 或请求 DevOps 团队协助执行迁移

## 相关文档

- Supabase 连接字符串文档: https://supabase.com/docs/guides/database/connecting-to-postgres
- Flyway Maven Plugin 配置: https://flywaydb.org/documentation/usage/maven/
- PostgreSQL JDBC 驱动文档: https://jdbc.postgresql.org/documentation/

---

**创建时间**: 2025-12-31 17:15
**创建人**: Claude Code Agent
**状态**: 🔴 等待 Supabase Dashboard 配置验证
