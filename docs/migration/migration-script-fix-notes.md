<!-- @spec M001-material-unit-system -->

# 数据迁移脚本修复说明

**日期**: 2026-01-11
**影响脚本**: `V2026_01_11_006__migrate_sku_to_material.sql` → `V2026_01_11_007__migrate_sku_to_material_fixed.sql`

---

## 问题描述

原迁移脚本 `V2026_01_11_006__migrate_sku_to_material.sql` 存在**严重的映射逻辑缺陷**，导致 SKU 与 Material 的 ID 映射不准确。

### 问题代码

```sql
-- ❌ 错误的映射逻辑（第 64-72 行）
INSERT INTO sku_material_mapping (old_sku_id, new_material_id, material_code, sku_code)
SELECT
    s.id AS old_sku_id,
    m.id AS new_material_id,
    m.code AS material_code,
    s.code AS sku_code
FROM sku s
JOIN material m ON s.name = m.name AND s.created_at = m.created_at  -- 🔴 问题所在
WHERE s.sku_type = 'RAW_MATERIAL';
```

### 问题分析

1. **JOIN 条件不可靠**：
   - `s.name = m.name`: 多个 SKU 可能有相同名称
   - `s.created_at = m.created_at`: 时间戳精度到秒，多个记录可能同时创建
   - 无法保证 1:1 映射

2. **RETURNING 子句未被使用**：
   - 第 61 行使用了 `RETURNING id, code`，但返回的数据没有被捕获
   - 无法利用 `INSERT ... RETURNING` 建立准确映射

3. **潜在后果**：
   - 映射错误导致 Inventory 和 BOM 引用指向错误的 Material
   - 数据完整性被破坏

---

## 修复方案

新脚本 `V2026_01_11_007__migrate_sku_to_material_fixed.sql` 使用 **CTE + ROW_NUMBER() 窗口函数** 确保准确映射。

### 核心修复逻辑

```sql
-- ✅ 正确的映射逻辑
WITH inserted_materials AS (
    INSERT INTO material (...)
    SELECT
        gen_random_uuid() AS id,
        'MAT-RAW-' || LPAD(ROW_NUMBER() OVER (ORDER BY s.id)::TEXT, 3, '0') AS code,
        ...
    FROM sku s
    WHERE s.sku_type = 'RAW_MATERIAL'
    ORDER BY s.id  -- 关键：按 SKU ID 排序
    RETURNING id, code, name, created_at
),
sku_raw_ordered AS (
    SELECT
        s.id AS sku_id,
        s.code AS sku_code,
        ROW_NUMBER() OVER (ORDER BY s.id) AS rn  -- 关键：行号确保顺序
    FROM sku s
    WHERE s.sku_type = 'RAW_MATERIAL'
    ORDER BY s.id
),
material_raw_ordered AS (
    SELECT
        m.id AS material_id,
        m.code AS material_code,
        ROW_NUMBER() OVER (ORDER BY m.code) AS rn  -- 关键：行号匹配
    FROM inserted_materials m
)
INSERT INTO temp_sku_material_mapping (old_sku_id, new_material_id, material_code, sku_code)
SELECT
    s.sku_id,
    m.material_id,
    m.material_code,
    s.sku_code
FROM sku_raw_ordered s
JOIN material_raw_ordered m ON s.rn = m.rn;  -- 🟢 通过行号精确匹配
```

### 修复亮点

1. **INSERT ... RETURNING 捕获新 ID**：
   - 使用 CTE `inserted_materials` 捕获新插入的 Material 记录
   - 避免二次查询

2. **ROW_NUMBER() 窗口函数**：
   - SKU 和 Material 都按 ID/code 排序并分配行号
   - 通过行号 (`rn`) 实现精确的 1:1 映射

3. **排序一致性**：
   - SKU 按 `s.id` 排序
   - Material 按 `m.code` 排序（编码中已包含 ROW_NUMBER）
   - 确保顺序一致性

---

## 验证方法

### 1. 执行前验证（检查 SKU 数据）

```sql
-- 查看待迁移的 SKU 记录
SELECT
    id,
    code,
    name,
    sku_type,
    created_at
FROM sku
WHERE sku_type IN ('RAW_MATERIAL', 'PACKAGING')
ORDER BY sku_type, id;
```

### 2. 执行迁移脚本

```bash
cd backend
./mvnw flyway:migrate
```

### 3. 执行后验证（检查映射）

```sql
-- 验证映射记录数
SELECT COUNT(*) AS mapping_count FROM temp_sku_material_mapping;

-- 验证映射唯一性（应无重复）
SELECT old_sku_id, COUNT(*)
FROM temp_sku_material_mapping
GROUP BY old_sku_id
HAVING COUNT(*) > 1;

-- 验证 Material 编码格式
SELECT code, category
FROM material
WHERE category IN ('RAW_MATERIAL', 'PACKAGING')
ORDER BY code;

-- 验证 Inventory 引用更新
SELECT
    item_type,
    COUNT(*) AS count
FROM inventory
WHERE item_id IN (SELECT old_sku_id FROM temp_sku_material_mapping)
GROUP BY item_type;
-- 预期：item_type = 'MATERIAL'

-- 验证 BOM 引用更新
SELECT
    component_type,
    COUNT(*) AS count
FROM bom_component
WHERE component_id IN (SELECT old_sku_id FROM temp_sku_material_mapping)
   OR material_id IN (SELECT new_material_id FROM temp_sku_material_mapping)
GROUP BY component_type;
-- 预期：component_type = 'MATERIAL'
```

### 4. 迁移日志检查

```sql
-- 查看迁移日志
SELECT
    migration_name,
    status,
    records_migrated,
    records_updated,
    duration_seconds,
    details
FROM migration_log
WHERE migration_name LIKE 'SKU to Material Migration%'
ORDER BY created_at DESC;
```

---

## 重要提醒

### ⚠️ 如果已执行旧脚本（V2026_01_11_006）

**必须先回滚数据**，再执行新脚本：

```sql
-- 1. 回滚 Inventory 引用
UPDATE inventory
SET item_type = 'SKU', item_id = map.old_sku_id
FROM sku_material_mapping map
WHERE inventory.item_type = 'MATERIAL' AND inventory.item_id = map.new_material_id;

-- 2. 回滚 BOM 引用
UPDATE bom_component
SET component_type = 'SKU', component_id = map.old_sku_id, material_id = NULL
FROM sku_material_mapping map
WHERE bom_component.component_type = 'MATERIAL' AND bom_component.material_id = map.new_material_id;

-- 3. 删除错误的 Material 记录
DELETE FROM material WHERE category IN ('RAW_MATERIAL', 'PACKAGING');

-- 4. 清理映射表
DROP TABLE IF EXISTS sku_material_mapping;

-- 5. 删除错误的迁移日志
DELETE FROM migration_log WHERE migration_name = 'SKU to Material Migration';

-- 6. 更新 Flyway 元数据（标记旧脚本为失败）
UPDATE flyway_schema_history
SET success = false
WHERE script = 'V2026_01_11_006__migrate_sku_to_material.sql';
```

### ✅ 如果尚未执行旧脚本

直接执行新脚本即可：

```bash
cd backend
./mvnw flyway:migrate
```

Flyway 会跳过已标记为 `.deprecated` 的脚本。

---

## 文件变更记录

| 文件 | 状态 | 说明 |
|------|------|------|
| `V2026_01_11_006__migrate_sku_to_material.sql` | ❌ 废弃 | 重命名为 `.deprecated`，不再执行 |
| `V2026_01_11_007__migrate_sku_to_material_fixed.sql` | ✅ 使用 | 修复后的迁移脚本 |

---

## 相关文档

- 迁移指南：`docs/migration/sku-to-material-migration.md`
- 验证脚本：`backend/src/test/resources/migration/verify_sku_to_material_migration.sql`
- 功能验证：`specs/M001-material-unit-system/verification-guide.md`

---

**修复人**: Claude Code
**审核状态**: ⏳ 待审核
**优先级**: 🔴 高（数据完整性关键）
