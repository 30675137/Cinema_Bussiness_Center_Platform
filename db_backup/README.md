# 数据库备份目录 (db_backup)

本目录包含数据库初始化和备份相关文件。

**最后更新**: 2026-01-11 (Baseline Reset)

## 文件说明

| 文件 | 用途 |
|------|------|
| `schema.sql` | 完整的数据库表结构 DDL（61 个表 + 索引），与 `V001__baseline_schema_2026_01_11.sql` 同步 |
| `seed-data.sql` | 初始化数据（计量单位、分类、品牌等），与 `V002__seed_data.sql` 同步 |
| `flyway_schema_history.sql` | Flyway 版本记录表数据（仅参考） |
| `init-db.sh` | 一键初始化数据库脚本 |
| `postgres_full_*.sql` | 完整数据库备份文件（历史） |

## 使用场景

### 1. 初始化新数据库

```bash
# 方式一：使用一键脚本（推荐）
./init-db.sh localhost 15432 postgres

# 方式二：手动执行
psql -h localhost -p 15432 -U postgres -d postgres -f schema.sql
psql -h localhost -p 15432 -U postgres -d postgres -f flyway_schema_history.sql
psql -h localhost -p 15432 -U postgres -d postgres -f seed-data.sql
```

### 2. 恢复数据库

```bash
# 从完整备份恢复
psql -h localhost -p 15432 -U postgres -d postgres -f postgres_full_20260106_151519.sql
```

### 3. 导出新的备份

使用 `scripts/db/` 目录下的脚本：

```bash
# 导出 schema 和 seed data
../scripts/db/export-schema.sh localhost 15432 postgres

# 完整备份
../scripts/db/backup-db.sh localhost 15432 postgres
```

## 注意事项

1. **不要直接修改这些文件**，它们应该通过脚本自动生成
2. 初始化新库后，使用 Flyway 执行增量迁移
3. `schema.sql` 对应 Flyway baseline 版本，包含所有基础表结构
