# Data Model: Flyway 迁移脚本清单

**@spec T003-flyway-migration**

## 1. 迁移脚本完整清单

### 1.1 核心表结构 (V001-V012)

| 版本 | 文件名 | 功能 | 依赖 |
|------|--------|------|------|
| V001 | create_skus_table.sql | SKU 商品表 | 无 |
| V002 | create_bom_combo_tables.sql | BOM/组合商品表 | V001 |
| V003 | create_unit_test_data.sql | 单位换算测试数据 | V001 |
| V004 | create_scenario_packages.sql | 场景包表 | 无 |
| V005 | add_taro_frontend_fields.sql | Taro 前端字段 | V004 |
| V006 | insert_test_scenario_packages.sql | 场景包测试数据 | V004 |
| V007 | rename_background_image_url_to_image.sql | 字段重命名 | V004 |
| V008 | add_store_associations.sql | 门店关联 | stores |
| V009 | add_store_address_fields.sql | 门店地址字段 | stores |
| V010 | create_package_tiers_and_addons.sql | 套餐等级和加购 | V004 |
| V011 | insert_proposal_package_data.sql | 提案套餐数据 | V010 |
| V012 | create_time_slot_overrides.sql | 时段覆盖配置 | V004 |

### 1.2 预约与门店 (V016-V025)

| 版本 | 文件名 | 功能 | 依赖 |
|------|--------|------|------|
| V016_001 | create_reservation_settings.sql | 预约设置表 | stores |
| V022_001 | store_crud_extension.sql | 门店 CRUD 扩展 | stores |
| V023_001 | store_add_cinema_fields.sql | 影院字段 | stores |
| V024_001 | import_yaolai_cinema_data.sql | 耀莱影院数据 | V023_001 |
| V025 | create_reservation_tables.sql | 预约订单表 | stores, halls |

### 1.3 商品主数据 (V026-V035)

| 版本 | 文件名 | 功能 | 依赖 |
|------|--------|------|------|
| V026 | create_skus_table.sql | SKU 表（重复?） | 无 |
| V027 | create_bom_combo_tables.sql | BOM 表（重复?） | V026 |
| V028 | create_unit_conversions.sql | 单位换算表 | 无 |
| V029 | insert_test_data.sql | 测试数据 | V026-V028 |
| V030 | create_spus_table.sql | SPU 表 | 无 |
| V031 | update_spu_specifications.sql | SPU 规格更新 | V030 |
| V032 | create_brands_table.sql | 品牌表 | 无 |
| V033 | create_store_inventory.sql | 门店库存表 | stores, V026 |
| V034 | insert_test_inventory_data.sql | 库存测试数据 | V033 |
| V035 | create_inventory_adjustment_tables.sql | 库存调整表 | V033 |

### 1.4 订单系统 (V038)

| 版本 | 文件名 | 功能 | 依赖 |
|------|--------|------|------|
| V038 | create_product_orders_tables.sql | 商品订单表 | stores, V026 |

### 1.5 饮品系统 (V039-V052)

| 版本 | 文件名 | 功能 | 依赖 |
|------|--------|------|------|
| V039 | create_beverages.sql | 饮品表 | 无 |
| V040 | create_beverage_specs.sql | 饮品规格表 | V039 |
| V041 | create_beverage_recipes.sql | 饮品配方表 | V039 |
| V042 | create_recipe_ingredients.sql | 配方原料表 | V041 |
| V043 | create_beverage_orders.sql | 饮品订单表 | stores |
| V044 | create_beverage_order_items.sql | 订单明细表 | V043 |
| V045 | create_queue_numbers.sql | 取餐号表 | stores |
| V046 | create_order_status_logs.sql | 订单状态日志 | V043 |
| V047 | create_indexes.sql | 索引优化 | V039-V046 |
| V048 | alter_beverage_recipes_columns.sql | 配方列调整 | V041 |
| V049 | alter_recipe_ingredients_sku_id_type.sql | 原料 SKU 类型调整 | V042 |
| V050 | add_missing_columns_to_recipe_ingredients.sql | 原料列补充 | V042 |
| V051 | add_customer_note_to_order_items.sql | 顾客备注字段 | V044 |
| V052 | fix_queue_numbers_status_constraint.sql | 取餐号约束修复 | V045 |

### 1.6 订单与库存扩展 (V053-V064)

| 版本 | 文件名 | 功能 | 依赖 |
|------|--------|------|------|
| V053 | add_order_type_discriminator.sql | 订单类型标识 | V038 |
| V054 | p005_manual_setup.sql | P005 手动设置 | 多表 |
| V055 | add_inventory_reserved_quantity.sql | 库存预留数量 | V033 |
| V058 | create_inventory_reservations.sql | 库存预留表 | V033 |
| V059 | create_bom_snapshots.sql | BOM 快照表 | V002/V027 |
| V060 | extend_inventory_transactions.sql | 库存事务扩展 | V033 |
| V061 | add_version_to_skus.sql | SKU 版本字段 | V026 |
| V062 | create_beverage_sku_mapping_table.sql | 饮品 SKU 映射 | V039, V026 |
| V063 | add_bom_finished_product_type_constraint.sql | BOM 成品约束 | V002/V027 |
| V064 | migrate_beverages_to_skus.sql | 饮品迁移到 SKU | V039, V026 |

### 1.7 渠道商品与分类 (V2026_01_xx)

| 版本 | 文件名 | 功能 | 依赖 |
|------|--------|------|------|
| V2026_01_01_001 | create_channel_product_config.sql | 渠道商品配置 | V026 |
| V2026_01_01_002 | fix_soft_delete_unique_constraint.sql | 软删除约束修复 | 多表 |
| V2026_01_03_001 | add_menu_category.sql | 菜单分类表 | 无 |
| V2026_01_03_002 | migrate_category_data.sql | 分类数据迁移 | V2026_01_03_001 |
| V2026_01_04_001 | add_version_column_to_menu_category.sql | 分类版本字段 | V2026_01_03_001 |

### 1.8 禁用脚本

| 文件名 | 原因 | 状态 |
|--------|------|------|
| V1.3__add_category_constraints.sql.disabled | 约束已存在于数据库 | 已禁用 |
| R2026_01_03_002__rollback_category_migration.sql.disabled | 命名不规范，回滚脚本不应自动执行 | 已禁用 |

### 1.9 可重复迁移（种子数据）

| 文件名 | 功能 | 执行状态 |
|--------|------|----------|
| R__01_seed_brands.sql | 品牌初始化数据 | ✅ 已执行 |
| R__02_seed_categories.sql | 菜单分类初始化数据 | ✅ 已执行 |
| R__03_seed_unit_conversions.sql | 单位换算初始化数据 | ✅ 已执行 |

---

## 2. 执行状态统计

**统计日期**: 2026-01-11

| 类型 | 数量 | 状态 |
|------|------|------|
| 版本化迁移 (Versioned) | 58 | ✅ 全部成功 |
| 可重复迁移 (Repeatable) | 3 | ✅ 全部成功 |
| 禁用脚本 (.disabled) | 2 | ⏸️ 已禁用 |
| **总计** | **63** | - |

### 2.1 关键版本节点

| 版本 | 说明 |
|------|------|
| V001 | 初始 SKU 表 |
| V039 | 饮品系统起点 |
| V064 | 饮品迁移到 SKU |
| V2026.01.04.001 | 最新日期格式版本 |

---

## 2. 实体关系图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   stores    │────<│    halls    │     │   brands    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       │                                       │
       ▼                                       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    skus     │────<│ bom_components │   │    spus     │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       │
       ▼
┌─────────────────────┐     ┌─────────────────────┐
│   store_inventory   │     │  inventory_adjustment │
└─────────────────────┘     └─────────────────────┘
       │
       │
       ▼
┌─────────────────────┐     ┌─────────────────────┐
│   product_orders    │     │   beverage_orders   │
└─────────────────────┘     └─────────────────────┘
```

---

## 3. 初始化数据设计

### 3.1 品牌初始化 (R__01_seed_brands.sql)

```sql
-- @spec T003-flyway-migration
-- 品牌初始化数据

INSERT INTO brands (id, name, code, status, created_by)
VALUES
    (gen_random_uuid(), '默认品牌', 'DEFAULT', 'active', 'flyway-seed'),
    (gen_random_uuid(), '自营品牌', 'SELF', 'active', 'flyway-seed'),
    (gen_random_uuid(), '合作品牌', 'PARTNER', 'active', 'flyway-seed')
ON CONFLICT (code) DO NOTHING;
```

### 3.2 分类初始化 (R__02_seed_categories.sql)

```sql
-- @spec T003-flyway-migration
-- 分类初始化数据

INSERT INTO menu_category (id, name, code, sort_order, status, created_by)
VALUES
    (gen_random_uuid(), '饮品', 'BEVERAGE', 1, 'active', 'flyway-seed'),
    (gen_random_uuid(), '小食', 'SNACK', 2, 'active', 'flyway-seed'),
    (gen_random_uuid(), '套餐', 'COMBO', 3, 'active', 'flyway-seed')
ON CONFLICT (code) DO NOTHING;
```

### 3.3 单位换算初始化 (R__03_seed_unit_conversions.sql)

```sql
-- @spec T003-flyway-migration
-- 单位换算初始化数据

INSERT INTO unit_conversions (id, from_unit, to_unit, conversion_rate, category)
VALUES
    (gen_random_uuid(), 'kg', 'g', 1000, 'WEIGHT'),
    (gen_random_uuid(), 'L', 'ml', 1000, 'VOLUME'),
    (gen_random_uuid(), '箱', '瓶', 24, 'PACKAGE')
ON CONFLICT (from_unit, to_unit) DO NOTHING;
```

---

## 4. 文件组织结构

```
backend/src/main/resources/db/
├── migration/                  # 版本化迁移脚本
│   ├── V001__create_skus_table.sql
│   ├── V002__create_bom_combo_tables.sql
│   ├── ... (现有 60+ 脚本)
│   └── V2026_01_04_001__add_version_column_to_menu_category.sql
│
├── seed/                       # 初始化数据脚本
│   ├── R__01_seed_brands.sql
│   ├── R__02_seed_categories.sql
│   ├── R__03_seed_unit_conversions.sql
│   └── R__04_seed_stores.sql  # 可选：测试门店
│
└── rollback/                   # 回滚脚本（手动执行）
    └── R2026_01_03_002__rollback_category_migration.sql
```

---

## 5. 迁移脚本执行顺序

Flyway 执行顺序（启用 `out-of-order: true`）：

1. V1.3 (语义版本，排在 V1 之后)
2. V001 - V064 (数字版本，按数字排序)
3. V2026_01_01_001 - V2026_01_04_001 (日期版本)
4. R__xxx (Repeatable，每次 checksum 变化时执行)

**注意**: `out-of-order: true` 允许新增脚本在已执行脚本之间执行，适合多人并行开发。
