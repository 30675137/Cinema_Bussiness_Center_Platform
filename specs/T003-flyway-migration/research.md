# Research: Flyway 数据库迁移管理

**@spec T003-flyway-migration**

## 1. 现有迁移脚本分析

### 1.1 脚本清单统计

| 类别 | 数量 | 版本范围 | 说明 |
|------|------|----------|------|
| 数字版本 (V###) | 52 | V001 - V064 | 主要迁移脚本 |
| 带子版本 (V###_###) | 5 | V016_001 - V024_001 | 预约/门店相关 |
| 日期版本 (V2026_) | 5 | V2026_01_01 - V2026_01_04 | 渠道商品/分类相关 |
| 语义版本 (V1.x) | 1 | V1.3 | 分类约束 |
| Repeatable (R__) | 1 | R2026_01_03_002 | 回滚脚本 |
| 备份文件 (.bak) | 1 | V065 | 已禁用的回滚脚本 |

**总计**: 约 65 个迁移脚本（含 1 个备份文件）

### 1.2 命名规范问题

**问题 1: 混合版本格式**
- 数字版本: `V001__xxx.sql`, `V052__xxx.sql`
- 子版本: `V016_001__xxx.sql`
- 日期版本: `V2026_01_01_001__xxx.sql`
- 语义版本: `V1.3__xxx.sql`

**问题 2: 版本号跳跃**
- V013-V015 缺失（跳跃到 V016_001）
- V036-V037 缺失（跳跃到 V038）
- V056-V057 缺失（跳跃到 V058）

**问题 3: V1.3 版本号特殊**
- `V1.3__add_category_constraints.sql` 使用语义版本格式
- Flyway 会将其视为 `1.3` 而非 `13`
- 执行顺序：在 V1 之后、V2 之前执行（可能导致问题）

### 1.3 脚本依赖关系

```
V001 (skus)
  └── V002 (bom_combo) 依赖 skus
  └── V003 (unit_test_data) 依赖 skus
  └── V026 (skus 重复创建?) - 需要检查

V004 (scenario_packages)
  └── V006 (test_data) 依赖 scenario_packages
  └── V010 (tiers_addons) 依赖 scenario_packages
  └── V011 (proposal_data) 依赖 V010

V030 (spus)
  └── V031 (spu_specifications) 依赖 spus
  └── V032 (brands) 独立

V039-V052 (beverages 系列)
  └── V064 (migrate_beverages_to_skus) 依赖 V039-V052
```

### 1.4 潜在重复脚本

| 脚本 1 | 脚本 2 | 说明 |
|--------|--------|------|
| V001 (create_skus) | V026 (create_skus) | 需要确认是否冲突 |
| V002 (create_bom_combo) | V027 (create_bom_combo) | 需要确认是否冲突 |
| V003 (unit_test_data) | V028 (unit_conversions) | 功能可能重叠 |

---

## 2. Flyway + Spring Boot 3.x 配置研究

### 2.1 当前配置分析

```yaml
# backend/src/main/resources/application.yml
spring:
  flyway:
    enabled: false  # 当前禁用！
    locations: classpath:db/migration
    baseline-on-migrate: true
    baseline-version: 0
    validate-on-migrate: false
    clean-disabled: true
    out-of-order: true
    ignore-migration-patterns: "*:missing,*:future,*:ignored"
```

**当前问题**:
1. `enabled: false` - Flyway 完全禁用
2. `validate-on-migrate: false` - 不验证迁移脚本（存在风险）

### 2.2 推荐配置

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed
    baseline-on-migrate: true
    baseline-version: 0
    validate-on-migrate: true  # 启用验证
    clean-disabled: true       # 禁止 clean（安全）
    out-of-order: true         # 允许乱序执行
    ignore-migration-patterns: "*:missing,*:future"
```

### 2.3 Maven 依赖验证

```xml
<!-- pom.xml 已配置正确 -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

Flyway Maven Plugin 版本: `10.10.0` ✅

---

## 3. Supabase PostgreSQL 兼容性研究

### 3.1 Pooler 模式兼容性

**当前连接配置**:
```
jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres?prepareThreshold=0&sslmode=require
```

**Decision**: Flyway 完全兼容 Supabase Pooler 模式
- `prepareThreshold=0` 禁用 prepared statements（Pooler 模式要求）
- `sslmode=require` 强制 SSL（Supabase 要求）

### 3.2 RLS 策略兼容性

**现有 RLS 配置**:
```sql
-- 来自 schema.sql
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for stores" ON stores FOR ALL USING (true);
```

**Decision**: RLS 策略与 Flyway 兼容
- 所有表使用 `FOR ALL USING (true)` 策略
- Flyway 使用相同的数据库用户执行迁移

### 3.3 权限要求

Flyway 需要以下权限:
- ✅ CREATE TABLE
- ✅ ALTER TABLE
- ✅ CREATE INDEX
- ✅ INSERT/UPDATE/DELETE
- ✅ CREATE FUNCTION/TRIGGER

Supabase `postgres` 用户拥有完整权限 ✅

---

## 4. 多环境配置方案

### 4.1 Spring Profile 策略

| Profile | Flyway 配置 | 种子数据 | clean 权限 |
|---------|------------|---------|-----------|
| dev | enabled, out-of-order | 测试数据 | 禁用 |
| test | enabled, out-of-order | 最小数据 | 允许 |
| prod | enabled, 严格模式 | 仅基础数据 | 禁用 |

### 4.2 配置文件结构

```
backend/src/main/resources/
├── application.yml           # 通用配置
├── application-dev.yml       # 开发环境
├── application-test.yml      # 测试环境
└── application-prod.yml      # 生产环境
```

### 4.3 环境差异配置

**application-dev.yml**:
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed/dev
    out-of-order: true
```

**application-test.yml**:
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed/test
    clean-disabled: false  # 测试环境允许 clean
```

**application-prod.yml**:
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed/prod
    validate-on-migrate: true
    clean-disabled: true
    out-of-order: false  # 生产环境禁止乱序
```

---

## 5. 初始化数据方案

### 5.1 数据来源分析

**需要初始化的数据**:

1. **品牌 (brands)** - V032 已创建表，但无初始数据
2. **分类 (categories)** - 现有 menu_category 表，需要初始化
3. **单位换算 (unit_conversions)** - V028 已创建表
4. **门店 (stores)** - schema.sql 已创建表，V024 有耀莱数据

### 5.2 Repeatable Migration 策略

使用 `R__` 前缀的 Repeatable Migration 管理种子数据：

```
db/seed/
├── R__01_seed_brands.sql           # 品牌初始化
├── R__02_seed_categories.sql       # 分类初始化
├── R__03_seed_unit_conversions.sql # 单位换算初始化
└── R__04_seed_stores.sql           # 门店初始化（dev 环境）
```

**特点**:
- 每次内容变化时重新执行
- 使用 checksum 判断是否需要重新执行
- 适合维护基础配置数据

### 5.3 数据脚本设计原则

1. **幂等性**: 使用 `INSERT ... ON CONFLICT DO NOTHING` 或 `UPSERT`
2. **可追溯**: 添加 `created_by = 'flyway-seed'` 标记
3. **可配置**: 不同环境使用不同数据集

---

## 6. 决策汇总

### Decision 1: 版本号格式统一

**选择**: 保持现有版本号，使用 `out-of-order: true` 兼容

**原因**:
- 重命名现有脚本风险高
- Flyway `out-of-order` 支持混合版本
- 新增脚本使用 `V###__` 数字格式

**替代方案被否决**: 全量重命名脚本 - 风险过高，可能导致现有环境迁移失败

### Decision 2: V1.3 脚本处理

**选择**: 保留 V1.3，使用 `ignore-migration-patterns` 配置

**原因**:
- V1.3 在 Flyway 排序中位于 V1 和 V2 之间
- 如果现有数据库已执行 V1.3，重命名会导致"missing migration"错误
- 配置 `"*:missing"` 忽略此问题

### Decision 3: 重复脚本处理

**选择**: 使用 `IF NOT EXISTS` 语法，无需删除

**原因**:
- V001 和 V026 可能是不同版本的 skus 表
- SQL 使用 `CREATE TABLE IF NOT EXISTS` 安全
- 删除任一脚本可能破坏某些环境的历史记录

### Decision 4: 初始化数据策略

**选择**: Repeatable Migration (R__xxx.sql)

**原因**:
- 种子数据需要随业务迭代更新
- Repeatable Migration 基于 checksum 自动重新执行
- 与版本化迁移清晰分离

**替代方案被否决**:
- 版本化迁移 (V###__seed_xxx.sql) - 一次性执行，不支持更新
- 应用启动脚本 - 无法利用 Flyway 历史记录和幂等性保障

### Decision 5: 多环境配置

**选择**: Spring Profile + 独立配置文件

**原因**:
- 与现有 Spring Boot 配置方式一致
- 环境变量覆盖灵活
- 配置文件版本化管理

---

## 7. 下一步行动

1. ✅ 研究完成 - 本文档
2. ⏳ 创建 data-model.md - 迁移脚本完整清单
3. ⏳ 创建 quickstart.md - 开发者指南
4. ⏳ 创建 tasks.md - 任务分解
