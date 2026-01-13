<!-- @spec M001-material-unit-system -->

# M001 数据库迁移快速指南

**适用场景**: 全新数据库部署 M001 功能

---

## 一、前置检查

### 1.1 确认当前目录

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/backend/src/main/resources/db/migration
pwd
```

**预期输出**: `.../backend/src/main/resources/db/migration`

### 1.2 检查迁移脚本

```bash
ls -1 V2026_01_11_*.sql | grep -v deprecated | sort
```

**预期输出**（7 个脚本）:
```
V2026_01_11_001__create_procurement_tables.sql
V2026_01_11_002__create_po_status_history.sql
V2026_01_11_003__create_units_table.sql
V2026_01_11_004__create_materials_table.sql
V2026_01_11_005__add_material_reference_to_bom_components.sql
V2026_01_11_006__add_material_support_to_inventory.sql
V2026_01_11_007__migrate_sku_to_material_fixed.sql
```

### 1.3 确认废弃脚本已重命名

```bash
ls -1 *.deprecated 2>/dev/null
```

**预期输出**:
```
V2026_01_11_006__migrate_sku_to_material.sql.deprecated
```

如果没有输出，执行：
```bash
# 检查是否存在未重命名的旧脚本
ls -1 V2026_01_11_006__migrate_sku_to_material.sql 2>/dev/null
```

如果存在，手动重命名：
```bash
mv V2026_01_11_006__migrate_sku_to_material.sql \
   V2026_01_11_006__migrate_sku_to_material.sql.deprecated
```

---

## 二、执行迁移（全新部署）

### 2.1 方式一：通过 Maven 执行 Flyway（推荐）

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/backend
./mvnw flyway:migrate
```

**预期输出**（部分）:
```
[INFO] Database: jdbc:postgresql://localhost:5432/cinema_db (PostgreSQL 14.x)
[INFO] Successfully validated 7 migrations (execution time 00:00.123s)
[INFO] Creating Schema History table "public"."flyway_schema_history" ...
[INFO] Current version of schema "public": << Empty Schema >>
[INFO] Migrating schema "public" to version "2026.01.11.001" - create procurement tables
[INFO] Migrating schema "public" to version "2026.01.11.002" - create po status history
[INFO] Migrating schema "public" to version "2026.01.11.003" - create units table
[INFO] Migrating schema "public" to version "2026.01.11.004" - create materials table
[INFO] Migrating schema "public" to version "2026.01.11.005" - add material reference to bom components
[INFO] Migrating schema "public" to version "2026.01.11.006" - add material support to inventory
[INFO] Migrating schema "public" to version "2026.01.11.007" - migrate sku to material fixed
[INFO] Successfully applied 7 migrations to schema "public" (execution time 00:02.456s)
```

### 2.2 方式二：启动应用时自动执行

确保 `application.yml` 配置：
```yaml
spring:
  flyway:
    enabled: true
    baseline-on-migrate: true
```

然后启动应用：
```bash
cd backend
./mvnw spring-boot:run
```

---

## 三、验证迁移成功

### 3.1 检查迁移状态

```bash
cd backend
./mvnw flyway:info
```

**预期输出**（所有脚本 State 为 "Success"）:
```
+-----------+---------+---------------------+------+---------------------+---------+
| Category  | Version | Description         | Type | Installed On        | State   |
+-----------+---------+---------------------+------+---------------------+---------+
| Versioned | 2026... | create procurement  | SQL  | 2026-01-11 10:00:00 | Success |
| Versioned | 2026... | create po status    | SQL  | 2026-01-11 10:00:01 | Success |
| Versioned | 2026... | create units table  | SQL  | 2026-01-11 10:00:02 | Success |
| Versioned | 2026... | create materials    | SQL  | 2026-01-11 10:00:03 | Success |
| Versioned | 2026... | add material ref    | SQL  | 2026-01-11 10:00:04 | Success |
| Versioned | 2026... | add material inv    | SQL  | 2026-01-11 10:00:05 | Success |
| Versioned | 2026... | migrate sku fixed   | SQL  | 2026-01-11 10:00:06 | Success |
+-----------+---------+---------------------+------+---------------------+---------+
```

### 3.2 验证核心表已创建

```sql
-- 连接数据库
psql -h localhost -U cinema_user -d cinema_db

-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('unit', 'material', 'unit_conversion')
ORDER BY table_name;
```

**预期输出**（3 行）:
```
 table_name
----------------
 material
 unit
 unit_conversion
```

### 3.3 验证测试数据

```sql
-- 检查单位数据
SELECT code, name, category FROM unit ORDER BY code;

-- 预期输出（至少 5 条记录）:
  code  |  name  | category
--------+--------+----------
 L      | 升     | VOLUME
 ml     | 毫升   | VOLUME
 kg     | 千克   | WEIGHT
 g      | 克     | WEIGHT
 bottle | 瓶     | COUNT

-- 检查换算规则
SELECT from_unit_code, to_unit_code, rate FROM unit_conversion;

-- 预期输出（至少 2 条记录）:
 from_unit_code | to_unit_code | rate
----------------+--------------+--------
 L              | ml           | 1000.00
 kg             | g            | 1000.00
```

### 3.4 验证 Material 表结构

```sql
\d material

-- 预期输出（表结构）:
                                            Table "public.material"
        Column         |           Type           | Collation | Nullable |      Default
-----------------------+--------------------------+-----------+----------+-------------------
 id                    | uuid                     |           | not null |
 code                  | character varying(50)    |           | not null |
 name                  | character varying(100)   |           | not null |
 category              | material_category        |           | not null |
 specification         | text                     |           |          |
 inventory_unit_id     | uuid                     |           | not null |
 purchase_unit_id      | uuid                     |           | not null |
 conversion_rate       | numeric(10,6)            |           | not null |
 use_global_conversion | boolean                  |           | not null | false
 created_at            | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
 updated_at            | timestamp with time zone |           | not null | CURRENT_TIMESTAMP
Indexes:
    "material_pkey" PRIMARY KEY, btree (id)
    "material_code_key" UNIQUE CONSTRAINT, btree (code)
    "idx_material_category" btree (category)
    "idx_material_code" btree (code)
Check constraints:
    "material_conversion_rate_check" CHECK (conversion_rate > 0::numeric)
```

---

## 四、常见问题

### 问题 1: `relation "inventory" does not exist`

**原因**: 数据库是全新的，还没有执行过任何迁移

**解决**: ✅ 这是正常的！直接执行 `./mvnw flyway:migrate` 即可

---

### 问题 2: `Flyway failed: Checksum mismatch`

**原因**: 迁移脚本内容被修改，但 Flyway 元数据中记录了旧的校验和

**解决**:
```bash
# 方式 1: 修复校验和（如果确定脚本修改是安全的）
cd backend
./mvnw flyway:repair

# 方式 2: 清空数据库重新迁移（仅开发环境）
psql -h localhost -U cinema_user -d cinema_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
./mvnw flyway:migrate
```

---

### 问题 3: `V2026_01_11_007` 脚本执行失败（SKU 表不存在）

**原因**: 数据库中没有 `skus` 表，脚本尝试迁移不存在的数据

**解决**: ✅ **已修复**

脚本已包含智能跳过逻辑：
- 如果 `skus` 表不存在，自动跳过并输出提示
- 如果 `skus` 表存在但无数据，也会跳过
- 全新部署无需任何额外操作

**重要提示**: 项目中 SKU 表名为 **`skus`**（复数），不是 `sku`（单数）。脚本已修正所有表名引用。详见 `docs/migration/CRITICAL-TABLE-NAME-FIX.md`

---

## 五、下一步

迁移成功后，继续：

1. **启动后端服务**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **验证 API 端点**:
   ```bash
   # 测试单位列表 API
   curl http://localhost:8080/api/units

   # 测试物料列表 API
   curl http://localhost:8080/api/materials
   ```

3. **启动前端应用**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **按照验证文档测试功能**:
   参考 `specs/M001-material-unit-system/verification-guide.md`

---

## 六、参考文档

| 文档 | 路径 |
|------|------|
| 完整验证指南 | `specs/M001-material-unit-system/verification-guide.md` |
| 迁移脚本修复说明 | `docs/migration/migration-script-fix-notes.md` |
| SKU→Material 迁移指南 | `docs/migration/sku-to-material-migration.md` |

---

**最后更新**: 2026-01-11
**适用版本**: M001 v1.0.0
