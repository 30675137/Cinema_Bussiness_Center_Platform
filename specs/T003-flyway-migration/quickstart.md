# Quickstart: Flyway 数据库迁移

**@spec T003-flyway-migration**

## 快速开始

### 1. 新环境初始化

启动应用即可自动执行所有迁移：

```bash
cd backend
./mvnw spring-boot:run
```

Flyway 会自动：
1. 检测 `flyway_schema_history` 表是否存在
2. 如果不存在，创建历史表并执行所有迁移
3. 如果存在，仅执行新增的迁移脚本

### 2. 检查迁移状态

```bash
# 使用 Maven 插件查看迁移状态
cd backend
./mvnw flyway:info
```

输出示例（实际执行结果 2026-01-11）：
```
+-----------+----------------+-------------------------------------------+------+---------------------+--------------+
| Category  | Version        | Description                               | Type | Installed On        | State        |
+-----------+----------------+-------------------------------------------+------+---------------------+--------------+
|           | 0              | << Flyway Baseline >>                     | BASE | 2025-12-21 07:52:32 | Baseline     |
| Versioned | 1              | create skus table                         | SQL  | 2025-12-21 07:52:37 | Success      |
| Versioned | 2              | create bom combo tables                   | SQL  | 2025-12-21 07:52:48 | Success      |
| ...       | ...            | ...                                       | ...  | ...                 | ...          |
| Versioned | 064            | migrate beverages to skus                 | SQL  | 2025-12-31 09:46:19 | Success      |
| Versioned | 2026.01.04.001 | add version column to menu category       | SQL  | 2026-01-04 07:56:03 | Success      |
| Repeatable|                | 01 seed brands                            | SQL  | 2026-01-10 21:00:28 | Success      |
| Repeatable|                | 02 seed categories                        | SQL  | 2026-01-10 21:01:50 | Success      |
| Repeatable|                | 03 seed unit conversions                  | SQL  | 2026-01-10 21:01:55 | Success      |
+-----------+----------------+-------------------------------------------+------+---------------------+--------------+
Schema version: 2026.01.04.001
Successfully validated 61 migrations (execution time 00:02.xxx)
```

### 3. 创建新迁移脚本

#### 3.1 命名规范

```
V{版本号}__{描述}.sql
```

- **版本号**: 递增数字，如 `065`, `066`
- **描述**: 小写字母和下划线，描述变更内容
- **双下划线**: 版本号和描述之间必须是双下划线 `__`

#### 3.2 示例

```sql
-- backend/src/main/resources/db/migration/V065__add_sku_barcode.sql

-- @spec P009-sku-barcode
-- 添加 SKU 条形码字段

ALTER TABLE skus ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_skus_barcode ON skus(barcode);

COMMENT ON COLUMN skus.barcode IS 'SKU 条形码，用于扫码录入';
```

#### 3.3 最佳实践

1. **幂等性**: 使用 `IF NOT EXISTS`, `IF EXISTS`
2. **原子性**: 一个脚本完成一个逻辑变更
3. **可回滚**: 复杂变更提供对应的回滚脚本
4. **注释**: 添加 `@spec` 标识和功能说明

### 4. 多环境配置

#### 4.1 开发环境 (默认)

```bash
# 使用默认配置启动
./mvnw spring-boot:run
```

#### 4.2 测试环境

```bash
# 指定 test profile
./mvnw spring-boot:run -Dspring.profiles.active=test
```

#### 4.3 生产环境

```bash
# 指定 prod profile
./mvnw spring-boot:run -Dspring.profiles.active=prod
```

### 5. 常用命令

| 命令 | 说明 |
|------|------|
| `./mvnw flyway:info` | 查看迁移状态 |
| `./mvnw flyway:migrate` | 执行迁移 |
| `./mvnw flyway:validate` | 验证迁移脚本 |
| `./mvnw flyway:repair` | 修复历史表 |
| `./mvnw flyway:baseline` | 设置基线版本 |

**注意**: `flyway:clean` 在生产环境被禁用！

---

## 常见问题

### Q1: 迁移失败如何处理？

**步骤**:
1. 查看错误日志，定位失败的脚本
2. 手动修复数据库（如果需要）
3. 修复迁移脚本中的问题
4. 运行 `./mvnw flyway:repair` 更新历史表
5. 重新运行 `./mvnw flyway:migrate`

### Q2: 如何跳过某个迁移？

在 `application.yml` 中配置：

```yaml
spring:
  flyway:
    ignore-migration-patterns: "*:V015,*:V016"
```

### Q3: 现有数据库如何使用 Flyway？

使用 baseline 功能：

```bash
# 设置基线版本为 64（跳过所有 V001-V064）
./mvnw flyway:baseline -Dflyway.baselineVersion=64
```

### Q4: 多人并行开发版本冲突？

Flyway 配置了 `out-of-order: true`，支持乱序执行。

例如：
- 开发者 A 创建 V065
- 开发者 B 创建 V066
- 合并后两个脚本都会执行，不会冲突

### Q5: 如何添加种子数据？

使用 Repeatable Migration：

```sql
-- backend/src/main/resources/db/seed/R__05_seed_test_stores.sql

INSERT INTO stores (id, code, name, status)
VALUES (gen_random_uuid(), 'TEST001', '测试门店', 'active')
ON CONFLICT (code) DO NOTHING;
```

Repeatable Migration 特点：
- 文件名以 `R__` 开头
- 每次内容变化时自动重新执行
- 适合维护基础配置数据

---

## 配置参考

### application.yml (完整配置)

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed
    baseline-on-migrate: true
    baseline-version: 0
    validate-on-migrate: true
    clean-disabled: true
    out-of-order: true
    ignore-migration-patterns: "*:missing,*:future"
    table: flyway_schema_history
    schemas: public
    connect-retries: 3
    connect-retries-interval: 10
```

### 配置项说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `enabled` | `true` | 是否启用 Flyway |
| `locations` | `classpath:db/migration` | 迁移脚本位置 |
| `baseline-on-migrate` | `false` | 是否自动 baseline |
| `baseline-version` | `1` | baseline 版本号 |
| `validate-on-migrate` | `true` | 迁移前验证 |
| `clean-disabled` | `false` | 禁用 clean 命令 |
| `out-of-order` | `false` | 允许乱序执行 |
| `table` | `flyway_schema_history` | 历史表名 |

---

## 联系支持

如遇问题，请：
1. 查看 `backend/logs/application.log` 日志
2. 检查 `flyway_schema_history` 表记录
3. 参考 [Flyway 官方文档](https://flywaydb.org/documentation/)
4. 在项目 Issue 中提问
