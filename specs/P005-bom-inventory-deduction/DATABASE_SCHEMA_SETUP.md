# P005 数据库架构设置指南

**生成时间**: 2025-12-29
**状态**: ⚠️ 数据库表结构缺失,需要执行建表脚本

---

## 🚨 问题诊断

### 错误现象
当尝试在Supabase Dashboard执行测试数据插入脚本时,出现以下错误:

```
Error: Failed to run sql query:
ERROR: 42P01: relation "inventory" does not exist
LINE 1
```

### 根本原因

1. **Flyway迁移被禁用**
   - 位置: `backend/src/main/resources/application.yml` 第32行
   - 配置: `flyway.enabled: false`
   - 影响: Spring Boot启动时不会自动执行数据库迁移,导致表结构未创建

2. **数据库表不存在**
   - 测试脚本引用的表: `inventory` (实际表名: `store_inventory`)
   - 缺失的表: `stores`, `skus`, `bom_components`, `store_inventory`, `inventory_reservations`, `bom_snapshots`, `inventory_transactions`

3. **表名混淆**
   - 代码中使用: `inventory` (逻辑名称)
   - 数据库实际表名: `store_inventory` (物理表名)
   - 原因: P005功能复用了P003功能创建的 `store_inventory` 表

---

## ✅ 解决方案

### 方案1: 一键完整设置脚本 ⭐ **强烈推荐**

这是**最简单、最可靠**的方法,适用于从零开始设置测试环境。

#### 执行步骤

1. **访问Supabase Dashboard SQL Editor**
   ```
   https://supabase.com/dashboard/project/fxhgyxceqrmnpezluaht/sql/new
   ```

2. **打开完整设置脚本**
   - 文件路径: `scripts/p005-complete-setup.sql`
   - 该脚本包含:
     - ✅ 创建所有必需的表结构
     - ✅ 创建索引和约束
     - ✅ 插入测试数据
     - ✅ 验证数据插入成功

3. **复制并执行**
   ```bash
   # 在本地终端查看脚本内容
   cat scripts/p005-complete-setup.sql
   ```
   - 复制全部内容
   - 粘贴到Supabase SQL Editor
   - 点击 "Run" 按钮执行

4. **验证执行结果**
   执行完成后,应该看到以下输出:

   ```
   === TABLES CREATED ===
   bom_components
   bom_snapshots
   inventory_reservations
   inventory_transactions
   skus
   store_inventory
   stores

   === STORES ===
   id: 00000000-0000-0000-0000-000000000099
   name: Test Store P005
   status: ACTIVE

   === SKUs ===
   6 rows returned

   === INVENTORY (store_inventory) ===
   4 rows returned

   === BOM COMPONENTS ===
   5 rows returned

   === SETUP COMPLETE ===
   Stores: 1
   SKUs: 6
   Inventory Records: 4
   BOM Components: 5
   ```

---

### 方案2: 启用Flyway迁移 + 手动插入数据

适用于希望使用标准迁移流程的场景。

#### 步骤1: 启用Flyway

编辑 `backend/src/main/resources/application.yml`:

```yaml
# 将第32行修改为:
flyway:
  enabled: true  # 改为 true
```

#### 步骤2: 运行迁移

```bash
cd backend
./mvnw flyway:migrate
```

或者重启Spring Boot应用,Flyway会自动执行迁移:

```bash
./mvnw spring-boot:run
```

#### 步骤3: 插入测试数据

迁移完成后,在Supabase Dashboard执行:

```bash
# 使用仅包含数据的脚本
cat backend/src/test/resources/test-data/p005-setup-test-data.sql
```

---

### 方案3: 使用pgAdmin或DBeaver

适用于习惯使用GUI工具的用户。

#### 连接配置

```
Host: aws-1-us-east-2.pooler.supabase.com
Port: 6543
Database: postgres
User: postgres.fxhgyxceqrmnpezluaht
Password: ppkZ8sGUEHB0qjFs
```

#### 执行步骤

1. 连接到数据库
2. 打开SQL查询窗口
3. 加载 `scripts/p005-complete-setup.sql`
4. 执行脚本
5. 查看执行结果

---

## 📋 数据库架构说明

### 核心表结构

#### 1. stores (门店表)
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    province VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. skus (商品表)
```sql
CREATE TABLE skus (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- RAW_MATERIAL | FINISHED_PRODUCT
    unit VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3. bom_components (BOM配方表)
```sql
CREATE TABLE bom_components (
    id UUID PRIMARY KEY,
    finished_product_id UUID NOT NULL REFERENCES skus(id),
    component_id UUID NOT NULL REFERENCES skus(id),
    quantity DECIMAL(12, 3) NOT NULL,
    wastage_rate DECIMAL(5, 4) DEFAULT 0,
    UNIQUE (finished_product_id, component_id)
);
```

#### 4. store_inventory (库存表) ⚠️ 关键表
```sql
CREATE TABLE store_inventory (
    id UUID PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES stores(id),
    sku_id UUID NOT NULL REFERENCES skus(id),
    on_hand_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,      -- 现存库存
    available_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,    -- 可用库存 = on_hand - reserved
    reserved_qty DECIMAL(12, 3) NOT NULL DEFAULT 0,     -- 预占库存
    safety_stock DECIMAL(12, 3) DEFAULT 0,
    UNIQUE (store_id, sku_id),
    CHECK (on_hand_qty >= reserved_qty)  -- P005约束
);
```

**重要提示**:
- 表名是 `store_inventory`,不是 `inventory`
- 业务代码中通过JPA实体映射使用 `inventory` 逻辑名

#### 5. inventory_reservations (库存预占记录表)
```sql
CREATE TABLE inventory_reservations (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    store_id UUID NOT NULL,
    sku_id UUID NOT NULL,
    quantity NUMERIC(19,4) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT now()
);
```

#### 6. bom_snapshots (BOM快照表)
```sql
CREATE TABLE bom_snapshots (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL,
    finished_sku_id UUID NOT NULL,
    raw_material_sku_id UUID NOT NULL,
    quantity NUMERIC(19,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    wastage_rate NUMERIC(5,4) DEFAULT 0,
    bom_level INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);
```

---

## 🧪 测试数据清单

执行脚本后将创建以下测试数据:

### 门店
- **ID**: `00000000-0000-0000-0000-000000000099`
- **名称**: Test Store P005
- **状态**: ACTIVE

### 原料SKU (4个)
| ID | 名称 | 类型 | 单位 | 初始库存 |
|----|------|------|------|---------|
| `11111111-...-0001` | 威士忌 | RAW_MATERIAL | ml | 1000.0 ml |
| `11111111-...-0002` | 可乐 | RAW_MATERIAL | ml | 5000.0 ml |
| `11111111-...-0003` | 杯子 | RAW_MATERIAL | 个 | 100.0 个 |
| `11111111-...-0004` | 吸管 | RAW_MATERIAL | 根 | 200.0 根 |

### 成品SKU (2个)
| ID | 名称 | 类型 | 单位 |
|----|------|------|------|
| `22222222-...-0001` | 威士忌可乐鸡尾酒 | FINISHED_PRODUCT | 杯 |
| `22222222-...-0002` | 观影套餐 | FINISHED_PRODUCT | 份 |

### BOM配方

**威士忌可乐鸡尾酒** (单层级):
- 威士忌: 45 ml
- 可乐: 150 ml
- 杯子: 1 个
- 吸管: 1 根

**观影套餐** (多层级):
- 威士忌可乐鸡尾酒: 1 杯
  - (展开后) → 威士忌 45ml, 可乐 150ml, 杯子 1个, 吸管 1根

---

## 🔍 验证脚本

执行设置后,可运行以下查询验证数据:

```sql
-- 1. 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('stores', 'skus', 'bom_components', 'store_inventory')
ORDER BY table_name;

-- 2. 检查测试门店
SELECT * FROM stores WHERE id = '00000000-0000-0000-0000-000000000099'::uuid;

-- 3. 检查库存
SELECT si.*, s.name AS sku_name
FROM store_inventory si
JOIN skus s ON si.sku_id = s.id
WHERE si.store_id = '00000000-0000-0000-0000-000000000099'::uuid
ORDER BY s.name;

-- 4. 检查BOM配方
SELECT bc.*,
       fp.name AS finished_product_name,
       c.name AS component_name,
       bc.quantity || ' ' || c.unit AS quantity_with_unit
FROM bom_components bc
JOIN skus fp ON bc.finished_product_id = fp.id
JOIN skus c ON bc.component_id = c.id
WHERE bc.finished_product_id = '22222222-0000-0000-0000-000000000001'::uuid;
```

---

## 🚀 后续步骤

设置完成后:

1. **重新运行E2E测试**
   ```bash
   npm run test:e2e
   ```

2. **预期结果**
   - ✅ 所有11个测试用例通过
   - ✅ API返回正常数据 (不再是500错误)
   - ✅ 业务逻辑得到验证

3. **测试覆盖率**
   - 检查 `specs/P005-bom-inventory-deduction/TEST_COVERAGE_ANALYSIS.md`
   - 查看剩余未测试功能

---

## 🐛 故障排除

### 问题: UUID类型转换错误

**错误信息**:
```
ERROR: invalid input syntax for type uuid
```

**解决方法**:
确保所有UUID字符串后添加 `::uuid` 类型转换:
```sql
-- ✅ 正确
'00000000-0000-0000-0000-000000000099'::uuid

-- ❌ 错误
'00000000-0000-0000-0000-000000000099'
```

### 问题: 外键约束错误

**错误信息**:
```
ERROR: insert or update on table violates foreign key constraint
```

**解决方法**:
按顺序执行:
1. stores
2. skus
3. store_inventory
4. bom_components

完整脚本已经按正确顺序排列。

### 问题: 表已存在

**错误信息**:
```
ERROR: relation already exists
```

**解决方法**:
脚本使用 `CREATE TABLE IF NOT EXISTS`,可安全重复执行。
如需重置数据,取消注释 PART 4 的 DELETE 语句。

---

## 📚 相关文档

- [E2E测试执行报告](./E2E_TEST_EXECUTION_REPORT.md)
- [测试覆盖率分析](./TEST_COVERAGE_ANALYSIS.md)
- [测试数据准备指南](./TEST_DATA_SETUP_GUIDE.md)
- [自动化执行总结](./AUTOMATION_SUMMARY.md)

---

**最后更新**: 2025-12-29
**维护人**: Claude (E2E Test Executor)
**状态**: ✅ 解决方案已提供,等待用户执行
