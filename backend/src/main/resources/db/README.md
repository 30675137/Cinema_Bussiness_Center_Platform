# Flyway 数据库迁移规范

## 目录结构

```
db/migration/
├── baseline/           # 基础表结构（V0001）
├── archive/            # 废弃/历史文件
├── V001__*.sql         # 版本迁移脚本
├── V002__*.sql
└── ...
```

## 版本命名规范

### 标准格式

```
V{版本号}__{描述}.sql
```

### 推荐命名方式

| 格式 | 示例 | 说明 |
|------|------|------|
| 日期序列 | `V2026_01_11_001__xxx.sql` | 推荐用于新迁移 |
| 简单序号 | `V065__xxx.sql` | 历史遗留格式 |

### 命名规则

1. **版本号**：使用 `YYYY_MM_DD_XXX` 格式（推荐）或递增序号
2. **双下划线**：版本号与描述之间必须是 `__`
3. **描述**：使用小写字母和下划线，如 `create_users_table`
4. **后缀**：`.sql`

### 示例

```
V2026_01_11_001__create_procurement_tables.sql
V2026_01_11_002__add_material_support.sql
```

## 迁移类型

| 类型 | 前缀 | 说明 |
|------|------|------|
| 版本迁移 | `V` | 按版本顺序执行一次 |
| 可重复迁移 | `R` | 每次内容变更都会重新执行 |

## 脚本编写规范

### 1. 必须包含的元素

```sql
-- 文件头注释
-- Description: 简要描述
-- Author: 作者
-- Date: 日期

-- DDL 操作
CREATE TABLE IF NOT EXISTS ...;
ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...;

-- 使用 IF EXISTS / IF NOT EXISTS 保证幂等性
```

### 2. 禁止的操作

- ❌ 不要 `DROP TABLE` 生产数据表
- ❌ 不要修改历史迁移脚本
- ❌ 不要在一个脚本中混合多个不相关的变更

### 3. 最佳实践

- ✅ 每个脚本专注于一个功能
- ✅ 使用 `IF EXISTS` / `IF NOT EXISTS` 保证可重复执行
- ✅ 大表变更先在测试环境验证
- ✅ 添加适当的注释

## 执行迁移

### 使用 Flyway CLI

```bash
# 执行迁移
./scripts/db/migrate.sh localhost 15432 postgres

# 查看状态
flyway -url="jdbc:postgresql://localhost:15432/postgres" info
```

### 使用 Spring Boot

应用启动时自动执行（配置 `spring.flyway.enabled=true`）

## 初始化新数据库

对于全新数据库，推荐流程：

```bash
# 1. 执行 baseline schema
psql -f db_backup/schema.sql

# 2. 导入 Flyway 历史记录
psql -f db_backup/flyway_schema_history.sql

# 3. 导入种子数据
psql -f db_backup/seed-data.sql

# 4. 或使用一键脚本
./db_backup/init-db.sh localhost 15432 postgres
```

## archive 目录

存放废弃或历史版本的迁移文件：

- `.bak` - 备份文件
- `.deprecated` - 已废弃
- `.disabled` - 已禁用
- `.v1` / `.v2` - 历史版本

**注意**：archive 目录下的文件不会被 Flyway 执行。

## 故障排查

### 迁移失败

```bash
# 查看失败记录
SELECT * FROM flyway_schema_history WHERE success = false;

# 修复后重置状态
flyway repair
```

### 版本冲突

使用 `outOfOrder=true` 参数允许乱序执行：

```bash
flyway -outOfOrder=true migrate
```

## 相关脚本

| 脚本 | 位置 | 用途 |
|------|------|------|
| `migrate.sh` | `scripts/db/` | 执行 Flyway 迁移 |
| `backup-db.sh` | `scripts/db/` | 备份数据库 |
| `export-schema.sh` | `scripts/db/` | 导出 schema |
| `init-db.sh` | `scripts/db/` | 初始化新数据库 |
