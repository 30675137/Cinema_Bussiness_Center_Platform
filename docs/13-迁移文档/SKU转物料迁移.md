<!-- @spec M001-material-unit-system -->

# SKU → Material 数据迁移指南

## 概述

本文档说明如何将现有 SKU 表中的原料（RAW_MATERIAL）和包装（PACKAGING）数据迁移到新的 Material 表。

## 迁移背景

### 问题

- SKU 表混合存储商品SKU、原料、包装材料，导致语义混乱
- 原料和包装材料不应该有 SPU 关联
- 库存管理和 BOM 配方引用需要明确区分商品和物料

### 解决方案

- 引入独立的 Material 表管理原料和包装材料
- 将 SKU 表中的 RAW_MATERIAL 和 PACKAGING 类型数据迁移到 Material 表
- 更新 Inventory 和 BOM 表的引用关系

## 迁移范围

### 数据表

| 表名 | 操作 | 说明 |
|------|------|------|
| SKU | 读取 + 清理 | 迁移 `sku_type IN ('RAW_MATERIAL', 'PACKAGING')` 数据 |
| Material | 新增 | 接收迁移后的物料数据 |
| Inventory | 更新 | 更新 `item_type` 和 `item_id` 引用 |
| BOM Component | 更新 | 更新 `component_type` 和 `component_id/material_id` 引用 |

### 迁移任务

| 任务 | 描述 | 实现方式 |
|------|------|---------|
| T097 | 记录迁移前统计 | `migration_stats` 临时表 |
| T098 | 迁移 SKU → Material | `INSERT INTO material ... SELECT FROM sku` |
| T099 | 更新 Inventory 引用 | `UPDATE inventory SET item_type='MATERIAL', item_id=...` |
| T100 | 更新 BOM 引用 | `UPDATE bom_component SET component_type='MATERIAL', material_id=...` |
| T101 | 数据完整性验证 | PL/pgSQL 验证脚本 |
| T102 | 记录迁移日志 | `migration_log` 表 |

## 迁移流程

### 前置条件

```sql
-- 检查数据库连接
SELECT current_database(), current_user;

-- 检查待迁移数据量
SELECT sku_type, COUNT(*) AS count
FROM sku
WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING')
GROUP BY sku_type;
```

**预期输出示例：**
```
 sku_type      | count
---------------+-------
 RAW_MATERIAL  |   45
 PACKAGING     |   12
```

### 执行迁移

迁移脚本位于：
```
backend/src/main/resources/db/migration/V2026_01_11_006__migrate_sku_to_material.sql
```

**自动执行（推荐）：**
```bash
cd backend
./mvnw flyway:migrate
```

**手动执行（仅在必要时）：**
```bash
psql -h <host> -U <user> -d <database> -f V2026_01_11_006__migrate_sku_to_material.sql
```

### 迁移步骤详解

#### 步骤 1: 记录迁移前统计

```sql
CREATE TEMP TABLE migration_stats AS
SELECT
    'SKU_RAW_MATERIAL' AS source_table,
    COUNT(*) AS record_count,
    current_timestamp AS snapshot_time
FROM sku
WHERE sku_type = 'RAW_MATERIAL'
UNION ALL
SELECT 'SKU_PACKAGING', COUNT(*), current_timestamp
FROM sku
WHERE sku_type = 'PACKAGING';
```

#### 步骤 2: 迁移数据到 Material 表

**原料类迁移：**
```sql
INSERT INTO material (code, name, category, specification, ...)
SELECT
    'MAT-RAW-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0'),
    name,
    'RAW_MATERIAL'::material_category,
    specification,
    ...
FROM sku
WHERE sku_type = 'RAW_MATERIAL';
```

**包装类迁移：**
```sql
INSERT INTO material (code, name, category, specification, ...)
SELECT
    'MAT-PKG-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 3, '0'),
    name,
    'PACKAGING'::material_category,
    specification,
    ...
FROM sku
WHERE sku_type = 'PACKAGING';
```

#### 步骤 3: 保存映射关系

```sql
CREATE TEMP TABLE sku_material_mapping (
    old_sku_id UUID PRIMARY KEY,
    new_material_id UUID NOT NULL,
    material_code VARCHAR(50),
    sku_code VARCHAR(100)
);
```

#### 步骤 4: 更新 Inventory 引用

```sql
UPDATE inventory inv
SET
    item_type = 'MATERIAL',
    item_id = map.new_material_id,
    updated_at = current_timestamp
FROM sku_material_mapping map
WHERE inv.item_type = 'SKU' AND inv.item_id = map.old_sku_id;
```

#### 步骤 5: 更新 BOM 引用

```sql
UPDATE bom_component bc
SET
    component_type = 'MATERIAL',
    material_id = map.new_material_id,
    component_id = NULL,
    updated_at = current_timestamp
FROM sku_material_mapping map
WHERE bc.component_type = 'SKU' AND bc.component_id = map.old_sku_id;
```

#### 步骤 6: 验证数据完整性

```sql
-- 检查未迁移记录
SELECT COUNT(*) FROM sku
WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING')
  AND id NOT IN (SELECT old_sku_id FROM sku_material_mapping);
-- Expected: 0

-- 检查 Inventory 孤儿记录
SELECT COUNT(*) FROM inventory
WHERE item_type = 'SKU'
  AND item_id IN (SELECT old_sku_id FROM sku_material_mapping);
-- Expected: 0

-- 检查 BOM 孤儿记录
SELECT COUNT(*) FROM bom_component
WHERE component_type = 'SKU'
  AND component_id IN (SELECT old_sku_id FROM sku_material_mapping);
-- Expected: 0
```

## 验证迁移结果

### 1. 检查 Material 表数据

```sql
SELECT
    category,
    COUNT(*) AS count,
    MIN(code) AS first_code,
    MAX(code) AS last_code
FROM material
GROUP BY category;
```

**预期输出：**
```
   category    | count | first_code  | last_code
---------------+-------+-------------+------------
 RAW_MATERIAL  |   45  | MAT-RAW-001 | MAT-RAW-045
 PACKAGING     |   12  | MAT-PKG-001 | MAT-PKG-012
```

### 2. 检查 Inventory 引用更新

```sql
SELECT item_type, COUNT(*) FROM inventory
WHERE item_id IN (SELECT id FROM material)
GROUP BY item_type;
```

**预期输出：**
```
 item_type | count
-----------+-------
 MATERIAL  |   57
```

### 3. 检查 BOM 引用更新

```sql
SELECT component_type, COUNT(*) FROM bom_component
WHERE material_id IN (SELECT id FROM material)
GROUP BY component_type;
```

**预期输出：**
```
 component_type | count
----------------+-------
 MATERIAL       |   28
```

### 4. 查看迁移日志

```sql
SELECT
    migration_name,
    records_migrated,
    records_updated,
    duration_seconds,
    status,
    details
FROM migration_log
WHERE migration_name = 'SKU to Material Migration'
ORDER BY created_at DESC
LIMIT 1;
```

**预期输出示例：**
```json
{
  "migration_name": "SKU to Material Migration",
  "records_migrated": 57,
  "records_updated": 85,
  "duration_seconds": 0.45,
  "status": "SUCCESS",
  "details": {
    "sku_raw_material_count": 45,
    "sku_packaging_count": 12,
    "material_created_count": 57,
    "inventory_updated_count": 57,
    "bom_updated_count": 28,
    "mapping_records": 57
  }
}
```

## 回滚方案

### 场景 1: 迁移失败（验证未通过）

迁移脚本会自动回滚事务，无需手动干预。

### 场景 2: 迁移成功但业务验证失败

**步骤：**

1. 备份 Material 表数据（以防万一）
   ```sql
   CREATE TABLE material_backup AS SELECT * FROM material;
   ```

2. 恢复 Inventory 引用
   ```sql
   UPDATE inventory inv
   SET
       item_type = 'SKU',
       item_id = map.old_sku_id
   FROM sku_material_mapping map
   WHERE inv.item_type = 'MATERIAL' AND inv.item_id = map.new_material_id;
   ```

3. 恢复 BOM 引用
   ```sql
   UPDATE bom_component bc
   SET
       component_type = 'SKU',
       component_id = map.old_sku_id,
       material_id = NULL
   FROM sku_material_mapping map
   WHERE bc.component_type = 'MATERIAL' AND bc.material_id = map.new_material_id;
   ```

4. 删除 Material 表数据
   ```sql
   DELETE FROM material
   WHERE category IN ('RAW_MATERIAL', 'PACKAGING');
   ```

5. 记录回滚日志
   ```sql
   INSERT INTO migration_log (migration_name, migration_type, status, details)
   VALUES (
       'SKU to Material Migration Rollback',
       'ROLLBACK',
       'SUCCESS',
       jsonb_build_object('reason', '业务验证失败，手动回滚')
   );
   ```

## 常见问题

### Q1: 迁移后原 SKU 表中的数据会被删除吗？

**A**: 默认**不会删除**。迁移脚本保留了原 SKU 数据以供审计。如果确认无误，可以手动执行清理：
```sql
DELETE FROM sku WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING');
```

### Q2: 迁移过程中如何保证数据一致性？

**A**: 使用以下机制：
- 事务隔离：整个迁移在单个事务中执行
- 临时映射表：`sku_material_mapping` 保证引用更新准确性
- 完整性验证：PL/pgSQL 脚本验证所有数据已正确迁移
- 错误自动回滚：任何验证失败会自动回滚事务

### Q3: Material 表的 code 是如何生成的？

**A**: 使用格式 `MAT-{RAW|PKG}-{001-999}`：
- `MAT-RAW-001`: 原料类第 1 个
- `MAT-PKG-001`: 包装类第 1 个
- 序号基于 `created_at` 排序

### Q4: 如果有正在运行的业务如何迁移？

**A**: 建议步骤：
1. 进入维护模式（禁止新数据写入）
2. 执行迁移脚本
3. 验证数据完整性
4. 重启应用服务（加载新代码）
5. 退出维护模式

### Q5: 迁移后如何确认业务功能正常？

**A**: 检查清单：
- [ ] 库存查询显示 Material 类型物料
- [ ] BOM 配方显示 Material 组件
- [ ] 单位换算服务正常工作
- [ ] 采购入库自动换算正常
- [ ] 前端单位选择器显示正确

## 监控与日志

### 迁移日志查询

```sql
-- 查看所有迁移记录
SELECT
    migration_name,
    migration_type,
    status,
    records_migrated,
    duration_seconds,
    created_at
FROM migration_log
ORDER BY created_at DESC;

-- 查看失败的迁移
SELECT * FROM migration_log
WHERE status = 'FAILED';
```

### 性能监控

```sql
-- 检查 Material 表索引
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'material';

-- 分析表统计信息
ANALYZE material;
ANALYZE inventory;
ANALYZE bom_component;
```

## 相关文档

- [Material 实体设计](../specs/M001-material-unit-system/spec.md#material-entity)
- [单位换算服务](../specs/M001-material-unit-system/spec.md#conversion-service)
- [数据库 Schema](../backend/src/main/resources/db/migration/)

---

**最后更新**: 2026-01-11
**作者**: Claude Code
**版本**: 1.0.0
