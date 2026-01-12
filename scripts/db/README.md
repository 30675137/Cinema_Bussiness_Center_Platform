# 数据库运维脚本 (scripts/db)

本目录包含数据库运维相关的 Shell 脚本。

## 脚本列表

| 脚本 | 用途 | 参数 |
|------|------|------|
| `init-db.sh` | 初始化新数据库 | `<host> <port> <password>` |
| `migrate.sh` | 执行 Flyway 迁移 | `<host> <port> <password>` |
| `backup-db.sh` | 备份数据库 | `<host> <port> <password>` |
| `export-schema.sh` | 导出 schema 和 seed data | `<host> <port> <password>` |

## 使用说明

### 1. 初始化新数据库

用于全新环境，执行 baseline schema + flyway history + seed data：

```bash
./init-db.sh localhost 15432 postgres
```

### 2. 执行 Flyway 迁移

用于已存在的数据库，执行增量迁移：

```bash
./migrate.sh localhost 15432 postgres
```

### 3. 备份数据库

生成完整备份文件到 `db_backup/` 目录：

```bash
./backup-db.sh localhost 15432 postgres
```

### 4. 导出 Schema

分别导出 DDL 和数据到 `db_backup/schema.sql` 和 `db_backup/seed-data.sql`：

```bash
./export-schema.sh localhost 15432 postgres
```

## 默认参数

所有脚本的默认参数：
- Host: `localhost`
- Port: `15432`（Docker Supabase 端口）
- Password: `postgres`

## 常见场景

### 场景一：本地开发环境初始化

```bash
# 启动 Docker Supabase
docker-compose -f docker-compose.test.yml up -d

# 初始化数据库
./scripts/db/init-db.sh
```

### 场景二：开发过程中执行迁移

```bash
# 创建新的迁移脚本后
./scripts/db/migrate.sh
```

### 场景三：发布前导出最新 Schema

```bash
# 导出最新结构
./scripts/db/export-schema.sh

# 提交到 Git
git add db_backup/
git commit -m "chore: update db schema"
```

## 依赖

- `psql` - PostgreSQL 客户端
- `pg_dump` - PostgreSQL 备份工具
- `flyway` - Flyway CLI（仅 migrate.sh 需要）

## 注意事项

1. 确保数据库容器已启动
2. 检查端口映射是否正确（默认 15432）
3. 生产环境使用前请仔细确认参数
