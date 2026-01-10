# Flyway 数据库迁移指南

**@spec T003-flyway-migration**

## 目录结构

```
db/
├── migration/              # 版本化迁移脚本
│   ├── V1__create_skus_table.sql
│   ├── V2__create_bom_combo_tables.sql
│   └── V2026.01.04.001__add_menu_category.sql
│
├── seed/                   # 可重复迁移（种子数据）
│   ├── R__01_seed_brands.sql
│   ├── R__02_seed_categories.sql
│   └── R__03_seed_unit_conversions.sql
│
└── README.md               # 本文档
```

## 迁移脚本命名规范

### 版本化迁移（Versioned Migration）

**格式**: `V{version}__{description}.sql`

| 组成部分 | 说明 | 示例 |
|---------|------|------|
| `V` | 版本化迁移前缀（固定） | V |
| `{version}` | 版本号（支持多种格式） | `65`, `065`, `2026.01.11.001` |
| `__` | 双下划线分隔符（固定） | __ |
| `{description}` | 描述（下划线分隔单词） | `add_column_to_skus` |
| `.sql` | 文件扩展名（固定） | .sql |

**版本号格式推荐**：
- 简单序号：`V65__xxx.sql`（适合小型项目）
- 日期格式：`V2026.01.11.001__xxx.sql`（推荐，避免多人冲突）

**示例**：
```
V065__add_status_column_to_orders.sql      # 简单序号
V2026.01.11.001__create_audit_log_table.sql # 日期格式（推荐）
```

### 可重复迁移（Repeatable Migration）

**格式**: `R__{description}.sql`

| 组成部分 | 说明 | 示例 |
|---------|------|------|
| `R` | 可重复迁移前缀（固定） | R |
| `__` | 双下划线分隔符（固定） | __ |
| `{description}` | 描述（带序号便于排序） | `01_seed_brands` |
| `.sql` | 文件扩展名（固定） | .sql |

**特点**：
- 每次内容变化时自动重新执行
- 适用于初始化数据、视图、存储过程
- 按字母顺序执行，建议用数字前缀排序

**示例**：
```
R__01_seed_brands.sql
R__02_seed_categories.sql
R__03_seed_unit_conversions.sql
```

## 编写迁移脚本注意事项

### 1. 幂等性

版本化迁移**只执行一次**，无需 IF NOT EXISTS。

可重复迁移**多次执行**，必须保证幂等性：
```sql
-- 使用 ON CONFLICT DO NOTHING
INSERT INTO brands (brand_code, name) VALUES ('BRAND001', '耀莱影院')
ON CONFLICT (brand_code) DO NOTHING;

-- 或使用 IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_skus_name ON skus(name);
```

### 2. 事务安全

默认每个脚本在单独事务中执行。DDL 操作自动回滚失败的语句。

### 3. @spec 标识

每个迁移脚本必须在开头添加规格标识：
```sql
-- @spec T003-flyway-migration
-- 脚本描述...
```

## 常用 Maven 命令

```bash
# 查看迁移状态
mvn flyway:info

# 执行迁移
mvn flyway:migrate

# 修复历史表（删除失败记录）
mvn flyway:repair

# 验证迁移
mvn flyway:validate
```

## 多环境配置

| 环境 | Profile | 配置文件 | 特点 |
|-----|---------|---------|------|
| 开发 | dev | application-dev.yml | out-of-order=true |
| 测试 | test | application-test.yml | clean-disabled=false |
| 生产 | prod | application-prod.yml | out-of-order=false |

## 版本冲突处理

项目启用 `out-of-order: true`，支持并行开发场景：
- 开发者 A 创建 V100，开发者 B 创建 V101
- 即使 V101 先合入主分支并执行，后续执行 V100 也不会报错

**生产环境**建议关闭 out-of-order，确保严格顺序执行。

## 故障排除

### 迁移失败后重试

```bash
# 1. 修复历史表
mvn flyway:repair

# 2. 修复脚本错误

# 3. 重新执行
mvn flyway:migrate
```

### 跳过问题迁移

将问题脚本重命名为 `.disabled`：
```bash
mv V1.3__add_constraints.sql V1.3__add_constraints.sql.disabled
```

---

**创建日期**: 2026-01-11
**维护者**: Claude Code (@spec T003-flyway-migration)
