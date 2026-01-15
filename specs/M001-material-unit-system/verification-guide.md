<!-- @spec M001-material-unit-system -->

# M001 物料单位体系统一 - 功能验证操作手册

**版本**: 1.0.0
**创建日期**: 2026-01-11
**适用范围**: 影院商品管理中台 - 物料单位体系功能验证

---

## 一、验证准备

### 1.1 环境要求

| 环境 | 要求 |
|------|------|
| 后端服务 | Spring Boot 应用已启动 (http://localhost:8080) |
| 前端应用 | React 应用已启动 (http://localhost:3000) |
| 数据库 | PostgreSQL 已运行，数据迁移已执行 |
| 测试账号 | 具有物料管理、单位管理权限的账号 |

### 1.2 执行数据库迁移

**重要**: M001 功能依赖以下 Flyway 迁移脚本，必须先执行迁移：

```bash
# 方式 1: 通过 Maven 执行 Flyway 迁移（推荐）
cd backend
./mvnw flyway:migrate

# 方式 2: 启动 Spring Boot 应用时自动执行（如配置了 spring.flyway.enabled=true）
./mvnw spring-boot:run
```

**迁移脚本清单**（按执行顺序）:

| 序号 | 脚本文件 | 功能说明 | 状态 |
|------|---------|---------|------|
| 1 | `V2026_01_11_003__create_units_table.sql` | 创建 unit 表和 ENUM 类型 | ✅ 必需 |
| 2 | `V2026_01_11_004__create_materials_table.sql` | 创建 material 表和序列 | ✅ 必需 |
| 3 | `V028__create_unit_conversions.sql` | 创建 unit_conversion 表 | ✅ 必需 |
| 4 | `V2026_01_11_005__add_material_reference_to_bom_components.sql` | BOM 组件增加 material 引用 | ✅ 必需 |
| 5 | `V2026_01_11_006__add_material_support_to_inventory.sql` | Inventory 增加 material 引用 | ✅ 必需 |
| 6 | `V003__create_unit_test_data.sql` | 插入测试单位数据 | ✅ 必需 |
| 7 | `V2026_01_11_007__migrate_sku_to_material_fixed.sql` | **SKU → Material 数据迁移（修复版）** | ⚠️ 可选* |

**注意**:
- **脚本 7 (数据迁移)** 仅在以下情况执行：
  - 数据库中已存在 `sku` 表且包含 `RAW_MATERIAL` 或 `PACKAGING` 类型的记录
  - 需要将旧的 SKU 数据迁移到新的 Material 表
- 如果是**全新部署**（无历史 SKU 数据），可跳过脚本 7
- **废弃脚本**: `V2026_01_11_006__migrate_sku_to_material.sql.deprecated` 已被标记为废弃，不会执行

**验证迁移执行成功**:

```bash
# 检查迁移状态
cd backend
./mvnw flyway:info

# 预期输出应显示所有迁移脚本状态为 "Success"
```

**或直接查询数据库**:

```sql
-- 验证表是否存在
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('unit', 'material', 'unit_conversion')
ORDER BY table_name;

-- 预期返回 3 行: material, unit, unit_conversion
```

### 1.3 前置数据准备

如果测试数据脚本 `V003__create_unit_test_data.sql` 未自动执行，手动插入以下测试数据：

```sql
-- 插入测试单位数据
INSERT INTO unit (id, code, name, category) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'L', '升', 'VOLUME'),
('550e8400-e29b-41d4-a716-446655440002', 'ml', '毫升', 'VOLUME'),
('550e8400-e29b-41d4-a716-446655440003', 'kg', '千克', 'WEIGHT'),
('550e8400-e29b-41d4-a716-446655440004', 'g', '克', 'WEIGHT'),
('550e8400-e29b-41d4-a716-446655440005', 'bottle', '瓶', 'COUNT')
ON CONFLICT (id) DO NOTHING;

-- 插入全局换算规则
INSERT INTO unit_conversion (id, from_unit_code, to_unit_code, rate) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'L', 'ml', 1000.00),
('660e8400-e29b-41d4-a716-446655440002', 'kg', 'g', 1000.00)
ON CONFLICT (id) DO NOTHING;

-- 验证数据插入成功
SELECT COUNT(*) FROM unit;          -- 应返回至少 5
SELECT COUNT(*) FROM unit_conversion; -- 应返回至少 2
```

---

## 二、菜单导航路径

### 2.1 单位管理入口

**导航路径**:
`基础设置与主数据` → `单位 & 换算规则管理`

**菜单 Key**: `/basic-settings/units`

**功能覆盖**:
- 单位主数据查询（按分类筛选）
- 单位创建（体积/重量/计数）
- 全局换算规则配置
- 换算规则查询与编辑

### 2.2 物料管理入口

**导航路径**:
`BOM/配方 & 成本管理` → `原料库/物料主数据`

**菜单 Key**: `/bom/materials`

**功能覆盖**:
- 物料主数据查询（按分类筛选：原料/包装材料）
- 物料创建（自动生成编码 MAT-RAW-###/MAT-PKG-###）
- 物料级换算率配置
- 库存单位/采购单位选择

### 2.3 单位换算工具

**导航路径**:
`BOM/配方 & 成本管理` → `单位换算/损耗率配置`

**菜单 Key**: `/bom/conversion`

**功能覆盖**:
- 单位换算计算器
- 换算可用性检查
- 物料级换算优先级测试
- 换算路径追踪

---

## 三、功能验证场景

### 场景 1: 单位主数据管理 (User Story 1)

#### 测试步骤

**步骤 1.1: 查询单位列表**

1. 登录系统，进入菜单：`基础设置与主数据` → `单位 & 换算规则管理`
2. 验证单位列表显示所有单位数据
3. 使用分类筛选器，选择"体积 (VOLUME)"，验证仅显示体积单位（升、毫升）
4. 选择"重量 (WEIGHT)"，验证显示重量单位（千克、克）

**预期结果**:
- 单位列表正确显示，包含单位代码、名称、分类
- 分类筛选功能正常，过滤结果准确

**API 验证**:
```bash
# 查询所有单位
curl -X GET http://localhost:8080/api/units

# 查询体积单位
curl -X GET "http://localhost:8080/api/units?category=VOLUME"
```

**预期响应**:
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "code": "L", "name": "升", "category": "VOLUME" },
    { "id": "uuid", "code": "ml", "name": "毫升", "category": "VOLUME" }
  ],
  "timestamp": "2026-01-11T10:00:00Z"
}
```

---

**步骤 1.2: 创建新单位**

1. 点击"新增单位"按钮
2. 填写表单：
   - 单位代码: `oz`
   - 单位名称: `盎司`
   - 单位分类: `VOLUME` (体积)
3. 点击"提交"

**预期结果**:
- 提交成功，显示成功消息
- 单位列表自动刷新，新单位出现在列表中
- 新单位代码唯一，无重复

**API 验证**:
```bash
curl -X POST http://localhost:8080/api/units \
  -H "Content-Type: application/json" \
  -d '{
    "code": "oz",
    "name": "盎司",
    "category": "VOLUME"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "code": "oz",
    "name": "盎司",
    "category": "VOLUME"
  },
  "timestamp": "2026-01-11T10:05:00Z"
}
```

---

**步骤 1.3: 验证单位代码唯一性**

1. 再次点击"新增单位"
2. 尝试创建重复代码的单位：
   - 单位代码: `L` (已存在)
   - 单位名称: `公升`
   - 单位分类: `VOLUME`
3. 点击"提交"

**预期结果**:
- 提交失败，显示错误消息："单位代码已存在"
- 错误响应包含错误码 `UNIT_DUP_001` (假设已定义)

**数据库验证**:
```sql
-- 验证单位代码唯一性约束
SELECT code, COUNT(*) FROM unit GROUP BY code HAVING COUNT(*) > 1;
```

**预期结果**: 返回 0 行（无重复代码）

---

### 场景 2: 物料主数据管理 (User Story 2)

#### 测试步骤

**步骤 2.1: 创建原料物料**

1. 进入菜单：`BOM/配方 & 成本管理` → `原料库/物料主数据`
2. 点击"新增物料"按钮
3. 填写表单：
   - 物料名称: `可乐糖浆`
   - 物料分类: `原料 (RAW_MATERIAL)`
   - 规格说明: `5L装`
   - 库存单位: 选择 `L (升)`
   - 采购单位: 选择 `bottle (瓶)`
   - 换算率: `5.00` (1瓶 = 5升)
   - 使用全局换算: `否` (使用物料级换算)
4. 点击"提交"

**预期结果**:
- 提交成功，物料编码自动生成为 `MAT-RAW-001` (假设是第一个原料)
- 物料列表刷新，新物料出现
- 物料详情显示：库存单位 `L`，采购单位 `bottle`，换算率 `5.00`

**API 验证**:
```bash
curl -X POST http://localhost:8080/api/materials \
  -H "Content-Type: application/json" \
  -d '{
    "name": "可乐糖浆",
    "category": "RAW_MATERIAL",
    "specification": "5L装",
    "inventoryUnitId": "550e8400-e29b-41d4-a716-446655440001",
    "purchaseUnitId": "550e8400-e29b-41d4-a716-446655440005",
    "conversionRate": 5.00,
    "useGlobalConversion": false
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "id": "material-uuid",
    "code": "MAT-RAW-001",
    "name": "可乐糖浆",
    "category": "RAW_MATERIAL",
    "specification": "5L装",
    "inventoryUnitId": "550e8400-e29b-41d4-a716-446655440001",
    "purchaseUnitId": "550e8400-e29b-41d4-a716-446655440005",
    "conversionRate": 5.00,
    "useGlobalConversion": false,
    "createdAt": "2026-01-11T10:10:00Z"
  },
  "timestamp": "2026-01-11T10:10:00Z"
}
```

**数据库验证**:
```sql
-- 验证物料编码格式和序列
SELECT code, name, category, conversion_rate, use_global_conversion
FROM material
WHERE code LIKE 'MAT-RAW-%'
ORDER BY code;
```

**预期结果**:
- 物料编码格式正确：`MAT-RAW-001`, `MAT-RAW-002`, ...
- 换算率和全局换算标志正确存储

---

**步骤 2.2: 创建包装材料物料**

1. 再次点击"新增物料"
2. 填写表单：
   - 物料名称: `纸杯（中杯）`
   - 物料分类: `包装材料 (PACKAGING)`
   - 规格说明: `500ml容量`
   - 库存单位: 选择 `个 (unit)` (假设已创建)
   - 采购单位: 选择 `个 (unit)`
   - 换算率: `1.00` (1个 = 1个)
   - 使用全局换算: `是` (使用全局换算)
3. 点击"提交"

**预期结果**:
- 物料编码自动生成为 `MAT-PKG-001` (假设是第一个包装材料)
- `useGlobalConversion` 为 `true`，换算率字段禁用或忽略

**数据库验证**:
```sql
-- 验证包装材料编码
SELECT code, name, category, use_global_conversion
FROM material
WHERE category = 'PACKAGING'
ORDER BY code;
```

**预期结果**: 编码格式为 `MAT-PKG-###`

---

**步骤 2.3: 验证物料编码自动生成**

1. 创建第三个原料物料：`柠檬汁`
2. 观察物料编码

**预期结果**:
- 物料编码自动生成为 `MAT-RAW-002` (序列递增)
- 不同分类的编码序列独立（原料和包装材料各自递增）

**数据库验证**:
```sql
-- 检查编码序列是否连续
SELECT code FROM material WHERE category = 'RAW_MATERIAL' ORDER BY code;
SELECT code FROM material WHERE category = 'PACKAGING' ORDER BY code;
```

---

### 场景 3: 单位换算服务 (User Story 3)

#### 测试步骤

**步骤 3.1: 全局换算规则测试**

1. 进入菜单：`BOM/配方 & 成本管理` → `单位换算/损耗率配置`
2. 打开"单位换算计算器"
3. 填写换算表单：
   - 源单位: `L (升)`
   - 目标单位: `ml (毫升)`
   - 数量: `2.5`
   - 物料: 留空 (使用全局换算)
4. 点击"换算"

**预期结果**:
- 换算成功，显示结果：`2500 ml`
- 换算路径显示：`全局换算规则 (L → ml, 倍率: 1000.00)`

**API 验证**:
```bash
curl -X POST http://localhost:8080/api/conversions/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fromUnitCode": "L",
    "toUnitCode": "ml",
    "quantity": 2.5
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "originalQuantity": 2.5,
    "fromUnitCode": "L",
    "toUnitCode": "ml",
    "convertedQuantity": 2500.00,
    "source": "GLOBAL",
    "conversionPath": "全局换算规则 (L → ml, 倍率: 1000.00)"
  },
  "timestamp": "2026-01-11T10:20:00Z"
}
```

---

**步骤 3.2: 双向换算测试（反向换算）**

1. 在换算计算器中填写：
   - 源单位: `ml (毫升)`
   - 目标单位: `L (升)`
   - 数量: `5000`
2. 点击"换算"

**预期结果**:
- 换算成功，显示结果：`5 L`
- 换算路径显示：`全局换算规则（反向） (ml → L, 倍率: 0.001000)`

**API 验证**:
```bash
curl -X POST http://localhost:8080/api/conversions/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fromUnitCode": "ml",
    "toUnitCode": "L",
    "quantity": 5000
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "originalQuantity": 5000,
    "fromUnitCode": "ml",
    "toUnitCode": "L",
    "convertedQuantity": 5.000000,
    "source": "GLOBAL",
    "conversionPath": "全局换算规则（反向） (ml → L, 倍率: 0.001000)"
  }
}
```

---

**步骤 3.3: 物料级换算优先级测试**

1. 在换算计算器中填写：
   - 源单位: `bottle (瓶)`
   - 目标单位: `L (升)`
   - 数量: `10`
   - 物料: 选择 `可乐糖浆 (MAT-RAW-001)` (物料级换算率 5.00)
2. 点击"换算"

**预期结果**:
- 换算成功，显示结果：`50 L` (10瓶 × 5升/瓶)
- 换算路径显示：`物料级换算 (bottle → L, 物料: 可乐糖浆, 倍率: 5.00)`
- 换算来源标识为 `MATERIAL` (物料级)

**API 验证**:
```bash
curl -X POST http://localhost:8080/api/conversions/convert \
  -H "Content-Type: application/json" \
  -d '{
    "fromUnitCode": "bottle",
    "toUnitCode": "L",
    "quantity": 10,
    "materialId": "material-uuid-of-可乐糖浆"
  }'
```

**预期响应**:
```json
{
  "success": true,
  "data": {
    "originalQuantity": 10,
    "fromUnitCode": "bottle",
    "toUnitCode": "L",
    "convertedQuantity": 50.00,
    "source": "MATERIAL",
    "conversionPath": "物料级换算 (bottle → L, 物料: 可乐糖浆, 倍率: 5.00)"
  }
}
```

---

**步骤 3.4: 换算可用性检查**

1. 在换算计算器中点击"检查换算可用性"功能
2. 测试以下组合：
   - `L` → `ml`：应返回"可换算"
   - `L` → `kg`：应返回"不可换算" (跨分类)
   - `bottle` → `L` (指定物料"可乐糖浆")：应返回"可换算"

**API 验证**:
```bash
# 测试可换算
curl -X GET "http://localhost:8080/api/conversions/can-convert?fromUnitCode=L&toUnitCode=ml"

# 测试不可换算
curl -X GET "http://localhost:8080/api/conversions/can-convert?fromUnitCode=L&toUnitCode=kg"
```

**预期响应**:
```json
// 可换算
{ "success": true, "data": true }

// 不可换算
{ "success": true, "data": false }
```

---

### 场景 4: 采购入库单位换算 (User Story 4)

#### 测试步骤

**步骤 4.1: 创建采购入库单**

1. 进入"采购入库"模块（假设菜单路径：`采购管理` → `采购入库单`）
2. 创建新的入库单：
   - 物料: 选择 `可乐糖浆 (MAT-RAW-001)`
   - 采购数量: `20` 瓶 (采购单位)
   - 系统应自动换算库存数量: `100` L (库存单位)
3. 保存入库单

**预期结果**:
- 入库单显示：
  - 采购数量：20 瓶
  - 库存数量：100 L（自动换算，20 × 5 = 100）
- 数据库中 `purchase_quantity` 和 `inventory_quantity` 正确存储

**数据库验证**:
```sql
-- 验证入库单换算
SELECT
    id,
    material_id,
    purchase_quantity,
    purchase_unit_id,
    inventory_quantity,
    inventory_unit_id
FROM procurement_inbound
WHERE material_id = (SELECT id FROM material WHERE code = 'MAT-RAW-001')
ORDER BY created_at DESC
LIMIT 1;
```

**预期结果**:
- `purchase_quantity`: 20
- `inventory_quantity`: 100

---

**步骤 4.2: 验证库存台账更新**

1. 进入菜单：`基础设置与主数据` → `库存台账查看` (假设路径)
2. 查询物料 `可乐糖浆` 的库存记录
3. 验证最新一条库存流水记录

**预期结果**:
- 库存台账显示：
  - 物料：可乐糖浆 (MAT-RAW-001)
  - 数量变动：+100 L
  - 单位：L (库存单位)
  - 来源单据：采购入库单编号

**数据库验证**:
```sql
-- 验证库存台账
SELECT
    material_id,
    quantity_change,
    unit_id,
    operation_type,
    reference_type,
    reference_id
FROM inventory_ledger
WHERE material_id = (SELECT id FROM material WHERE code = 'MAT-RAW-001')
ORDER BY operation_time DESC
LIMIT 1;
```

**预期结果**:
- `quantity_change`: 100.00
- `unit_id`: 库存单位 ID (L)
- `operation_type`: 'INBOUND' (入库)

---

### 场景 5: BOM 配方单位换算 (User Story 5)

#### 测试步骤

**步骤 5.1: 创建 BOM 配方**

1. 进入菜单：`BOM/配方 & 成本管理` → `BOM 配方管理` (假设路径)
2. 创建新的 BOM 配方：
   - 成品：`可乐（中杯）`
   - 添加组件：
     - 组件 1：`可乐糖浆 (Material)` - 数量 `50` ml
     - 组件 2：`水 (Material)` - 数量 `450` ml
     - 组件 3：`纸杯（中杯）(Material)` - 数量 `1` 个
3. 保存 BOM

**预期结果**:
- BOM 保存成功
- 系统自动计算总成本（基于各组件的单位成本和数量）
- BOM 详情正确显示各组件的数量和单位

**数据库验证**:
```sql
-- 验证 BOM 组件 Dual Reference
SELECT
    id,
    bom_id,
    component_type,
    component_id,
    material_id,
    quantity,
    unit_id
FROM bom_component
WHERE bom_id = (SELECT id FROM bom WHERE product_name = '可乐（中杯）')
ORDER BY sort_order;
```

**预期结果**:
- 每行记录 `component_type` 为 'MATERIAL'
- `material_id` 有值，`component_id` 为 NULL (符合 XOR 约束)
- 数量和单位正确存储

---

**步骤 5.2: 生产计划单位换算**

1. 进入"生产计划"模块（假设菜单路径：`生产管理` → `生产计划`）
2. 创建生产计划：
   - 成品：`可乐（中杯）`
   - 计划产量：`100` 杯
3. 系统应自动计算原料需求：
   - 可乐糖浆：`5000` ml = `5` L (库存单位)
   - 水：`45000` ml = `45` L
   - 纸杯：`100` 个

**预期结果**:
- 生产计划显示正确的原料需求量（已换算为库存单位）
- 原料需求量可与当前库存比对，判断是否可以生产

---

### 场景 6: 前端单位选择器组件 (User Story 6)

#### 测试步骤

**步骤 6.1: 单位选择器基本功能**

1. 进入任意包含单位选择器的表单（如创建物料表单）
2. 点击"库存单位"下拉框
3. 验证功能：
   - 单位列表正确显示（格式：`升 (L)`）
   - 搜索功能：输入"升"，过滤显示包含"升"的单位
   - 加载状态：首次打开时显示加载动画

**预期结果**:
- 单位选择器显示所有单位
- 搜索过滤功能正常
- 选中单位后，表单字段正确更新

---

**步骤 6.2: 单位分类过滤**

1. 在创建物料表单中：
   - 库存单位选择器：应仅显示与物料分类匹配的单位
     - 若物料分类为"原料"，且原料通常以体积计量，则优先显示体积单位
   - 采购单位选择器：无分类限制，显示所有单位

**预期结果**:
- 单位选择器根据 `category` 属性正确过滤（如传入 `category="VOLUME"` 时仅显示体积单位）
- 无分类限制时显示所有单位

---

**步骤 6.3: 单位换算模态框**

1. 在物料详情页或任意页面，点击"单位换算"按钮（假设已集成 UnitConversionModal 组件）
2. 填写换算表单：
   - 源单位：`L`
   - 目标单位：`ml`
   - 数量：`3.5`
   - 物料：留空或选择物料
3. 点击"换算"

**预期结果**:
- 模态框显示换算结果：`3500 ml`
- 显示换算路径和来源（全局/物料级）
- 关闭模态框后，可复制换算结果

---

## 四、API 端点完整验证

### 4.1 Unit API

| 端点 | 方法 | 功能 | 测试命令 |
|------|------|------|---------|
| `/api/units` | GET | 查询单位列表 | `curl -X GET http://localhost:8080/api/units` |
| `/api/units?category=VOLUME` | GET | 按分类查询 | `curl -X GET http://localhost:8080/api/units?category=VOLUME` |
| `/api/units` | POST | 创建单位 | 见步骤 1.2 |

### 4.2 Material API

| 端点 | 方法 | 功能 | 测试命令 |
|------|------|------|---------|
| `/api/materials` | GET | 查询物料列表 | `curl -X GET http://localhost:8080/api/materials` |
| `/api/materials?category=RAW_MATERIAL` | GET | 按分类查询 | `curl -X GET http://localhost:8080/api/materials?category=RAW_MATERIAL` |
| `/api/materials` | POST | 创建物料 | 见步骤 2.1 |
| `/api/materials/{id}` | GET | 查询单个物料 | `curl -X GET http://localhost:8080/api/materials/{uuid}` |
| `/api/materials/{id}` | PUT | 更新物料 | `curl -X PUT http://localhost:8080/api/materials/{uuid} -d '{"name":"新名称"}'` |
| `/api/materials/{id}` | DELETE | 删除物料 | `curl -X DELETE http://localhost:8080/api/materials/{uuid}` |

### 4.3 Conversion API

| 端点 | 方法 | 功能 | 测试命令 |
|------|------|------|---------|
| `/api/conversions/convert` | POST | 执行换算 | 见步骤 3.1 |
| `/api/conversions/can-convert` | GET | 检查换算可用性 | 见步骤 3.4 |

### 4.4 UnitConversion API

| 端点 | 方法 | 功能 | 测试命令 |
|------|------|------|---------|
| `/api/unit-conversions` | GET | 查询全局换算规则 | `curl -X GET http://localhost:8080/api/unit-conversions` |
| `/api/unit-conversions` | POST | 创建换算规则 | `curl -X POST http://localhost:8080/api/unit-conversions -d '{"fromUnitCode":"L","toUnitCode":"ml","rate":1000}'` |

---

## 五、数据库验证 SQL

### 5.1 物料编码验证

```sql
-- 验证物料编码格式和序列
SELECT
    code,
    name,
    category,
    created_at
FROM material
ORDER BY code;

-- 预期结果：编码格式 MAT-RAW-###, MAT-PKG-###，序列连续无间断
```

### 5.2 换算规则验证

```sql
-- 验证全局换算规则
SELECT
    from_unit_code,
    to_unit_code,
    rate
FROM unit_conversion
ORDER BY from_unit_code, to_unit_code;

-- 验证物料级换算
SELECT
    m.code AS material_code,
    m.name AS material_name,
    u1.code AS inventory_unit,
    u2.code AS purchase_unit,
    m.conversion_rate,
    m.use_global_conversion
FROM material m
JOIN unit u1 ON m.inventory_unit_id = u1.id
JOIN unit u2 ON m.purchase_unit_id = u2.id
WHERE m.use_global_conversion = false;
```

### 5.3 BOM 组件 Dual Reference 验证

```sql
-- 验证 BOM 组件 XOR 约束
SELECT
    id,
    component_type,
    component_id,
    material_id,
    CASE
        WHEN component_id IS NULL AND material_id IS NOT NULL THEN 'VALID (Material)'
        WHEN component_id IS NOT NULL AND material_id IS NULL THEN 'VALID (SKU)'
        ELSE 'INVALID (XOR violation)'
    END AS validation_status
FROM bom_component;

-- 预期结果：所有记录 validation_status 为 'VALID'
```

### 5.4 库存台账换算验证

```sql
-- 验证库存台账单位一致性
SELECT
    il.id,
    m.code AS material_code,
    il.quantity_change,
    u.code AS unit_code,
    m.inventory_unit_id,
    u.id AS ledger_unit_id,
    CASE
        WHEN m.inventory_unit_id = u.id THEN 'VALID'
        ELSE 'INVALID (unit mismatch)'
    END AS validation_status
FROM inventory_ledger il
JOIN material m ON il.material_id = m.id
JOIN unit u ON il.unit_id = u.id
WHERE il.material_id IS NOT NULL
ORDER BY il.operation_time DESC
LIMIT 50;

-- 预期结果：所有记录 validation_status 为 'VALID'
```

---

## 六、数据迁移验证（仅首次部署）

如果是从 SKU 迁移到 Material 的首次部署，执行以下验证：

### 6.1 执行迁移验证脚本

```bash
# 在 PostgreSQL 中执行
psql -h localhost -U cinema_user -d cinema_db -f backend/src/test/resources/migration/verify_sku_to_material_migration.sql
```

### 6.2 迁移验证点

| 验证点 | SQL 查询 | 预期结果 |
|-------|---------|---------|
| 迁移数据统计 | `SELECT * FROM migration_stats;` | 原料和包装材料数量正确 |
| Material 编码唯一 | `SELECT code, COUNT(*) FROM material GROUP BY code HAVING COUNT(*) > 1;` | 0 行 |
| Inventory 引用更新 | `SELECT COUNT(*) FROM inventory WHERE item_type='SKU' AND item_id IN (SELECT old_sku_id FROM sku_material_mapping);` | 0 行 |
| BOM 引用更新 | `SELECT COUNT(*) FROM bom_component WHERE component_type='SKU' AND component_id IN (SELECT old_sku_id FROM sku_material_mapping);` | 0 行 |
| 无孤儿记录 | `SELECT COUNT(*) FROM sku_material_mapping WHERE new_material_id NOT IN (SELECT id FROM material);` | 0 行 |
| 迁移日志 | `SELECT * FROM migration_log WHERE operation='SKU_TO_MATERIAL_MIGRATION';` | 1 行，status='SUCCESS' |

详细验证请参考：`docs/migration/sku-to-material-migration.md`

---

## 七、集成测试验证

### 7.1 运行后端集成测试

```bash
cd backend

# 运行所有集成测试
./mvnw test -Dtest=*IntegrationTest

# 运行 Material 集成测试
./mvnw test -Dtest=MaterialIntegrationTest

# 运行 Conversion 集成测试
./mvnw test -Dtest=ConversionIntegrationTest
```

**预期结果**:
- 所有测试通过（绿色）
- MaterialIntegrationTest: 7/7 通过
- ConversionIntegrationTest: 8/8 通过
- 测试覆盖率 ≥ 70%

### 7.2 前端组件单元测试（如已编写）

```bash
cd frontend

# 运行前端单元测试
npm run test

# 运行覆盖率测试
npm run test:coverage
```

**预期结果**:
- UnitSelector 组件测试通过
- UnitDisplay 组件测试通过
- useUnitConversion Hook 测试通过
- 测试覆盖率 ≥ 70%

---

## 八、常见问题排查

### 问题 1: 换算失败，提示"未找到换算规则"

**原因**: 缺少全局换算规则或物料级换算配置错误

**解决方案**:
1. 检查全局换算规则表：
   ```sql
   SELECT * FROM unit_conversion WHERE from_unit_code='L' AND to_unit_code='ml';
   ```
2. 如缺失，手动添加：
   ```sql
   INSERT INTO unit_conversion (id, from_unit_code, to_unit_code, rate)
   VALUES (gen_random_uuid(), 'L', 'ml', 1000.00);
   ```
3. 或检查物料的 `useGlobalConversion` 标志和 `conversionRate` 配置

---

### 问题 2: 物料编码生成重复

**原因**: 序列未正确初始化或并发插入导致冲突

**解决方案**:
1. 检查序列当前值：
   ```sql
   SELECT last_value FROM material_code_seq;
   ```
2. 重置序列（仅开发环境）：
   ```sql
   SELECT setval('material_code_seq', (SELECT MAX(SUBSTRING(code FROM 9)::INT) FROM material) + 1);
   ```
3. 验证唯一约束：
   ```sql
   SELECT code, COUNT(*) FROM material GROUP BY code HAVING COUNT(*) > 1;
   ```

---

### 问题 3: 前端单位选择器无数据

**原因**: API 请求失败或单位表为空

**解决方案**:
1. 打开浏览器开发者工具（F12），检查网络请求：
   - 请求 URL: `http://localhost:8080/api/units`
   - 响应状态: 应为 200 OK
   - 响应数据: `data` 字段应包含单位数组
2. 检查后端日志，确认 API 正常响应
3. 验证数据库：
   ```sql
   SELECT * FROM unit;
   ```

---

### 问题 4: BOM 组件保存失败，提示约束违规

**原因**: XOR 约束违规（`component_id` 和 `material_id` 同时为空或同时有值）

**解决方案**:
1. 检查前端表单逻辑，确保：
   - 选择 SKU 时，`componentId` 有值，`materialId` 为 NULL
   - 选择 Material 时，`materialId` 有值，`componentId` 为 NULL
2. 验证约束定义：
   ```sql
   SELECT conname, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conrelid = 'bom_component'::regclass
   AND conname LIKE '%xor%';
   ```

---

## 九、验收标准

### 9.1 功能完整性检查清单

- [ ] **单位管理**:
  - [ ] 单位列表查询正常，支持分类筛选
  - [ ] 单位创建成功，编码唯一
  - [ ] 全局换算规则创建和查询正常

- [ ] **物料管理**:
  - [ ] 物料创建成功，编码自动生成格式正确（MAT-RAW-###/MAT-PKG-###）
  - [ ] 物料列表查询正常，支持分类筛选
  - [ ] 物料级换算配置保存正确
  - [ ] 全局换算开关正常工作

- [ ] **单位换算**:
  - [ ] 全局换算正常（L ↔ ml, kg ↔ g）
  - [ ] 双向换算正常（正向和反向）
  - [ ] 物料级换算优先级正确（物料级 > 全局）
  - [ ] 换算可用性检查准确
  - [ ] 相同单位直接返回

- [ ] **业务集成**:
  - [ ] 采购入库单位自动换算（采购单位 → 库存单位）
  - [ ] 库存台账单位一致性（统一使用库存单位）
  - [ ] BOM 配方组件单位正确存储
  - [ ] 生产计划原料需求换算正确

- [ ] **前端组件**:
  - [ ] UnitSelector 组件正常显示和搜索
  - [ ] UnitDisplay 组件正确展示单位信息
  - [ ] UnitConversionModal 换算模态框功能完整
  - [ ] useUnitConversion Hook 换算逻辑正确

- [ ] **数据迁移（首次部署）**:
  - [ ] SKU → Material 迁移成功
  - [ ] 库存和 BOM 引用更新完成
  - [ ] 10 项验证点全部通过
  - [ ] 迁移日志记录正确

- [ ] **测试覆盖**:
  - [ ] 后端集成测试全部通过（Material 7 个，Conversion 8 个）
  - [ ] 前端组件单元测试通过
  - [ ] 测试覆盖率 ≥ 70%

### 9.2 性能指标

- [ ] API 响应时间 P95 ≤ 1 秒
- [ ] 单位换算操作 ≤ 200 毫秒
- [ ] 物料列表查询（含换算）≤ 500 毫秒

### 9.3 数据完整性

- [ ] 无重复物料编码
- [ ] 无孤儿引用（Inventory/BOM 引用的 Material 存在）
- [ ] 单位换算规则一致性（无循环引用）
- [ ] BOM 组件 XOR 约束无违规

---

## 十、附录

### A. 参考文档

| 文档 | 路径 |
|------|------|
| 功能规格 | `specs/M001-material-unit-system/spec.md` |
| 实现计划 | `specs/M001-material-unit-system/plan.md` |
| 任务清单 | `specs/M001-material-unit-system/tasks.md` |
| API 规范 | `specs/M001-material-unit-system/contracts/api.yaml` |
| 数据模型 | `specs/M001-material-unit-system/data-model.md` |
| 迁移指南 | `docs/migration/sku-to-material-migration.md` |
| 前端组件指南 | `docs/frontend/unit-component-guide.md` |
| Phase 10 总结 | `docs/M001-phase10-summary.md` |

### B. 联系方式

| 角色 | 联系方式 |
|------|---------|
| 产品经理 | (待填写) |
| 技术负责人 | (待填写) |
| 测试负责人 | (待填写) |

---

**验证完成确认**:

- 验证人: ________________
- 验证日期: ________________
- 验证结果: □ 通过  □ 未通过（需修复问题：______________）

---

**文档版本历史**:

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|---------|
| 1.0.0 | 2026-01-11 | Claude Code | 初始版本，覆盖 Phase 1-10 所有功能 |

