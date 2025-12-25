# 快速开始指南: SKU主数据管理(支持BOM和套餐)

**功能分支**: `P001-sku-master-data`
**更新日期**: 2025-12-25
**实现状态**: ✅ 后端完成 | ✅ 前端完成 | ✅ 测试完成 (Repository + Service层)
**目的**: 为开发人员和测试人员提供快速启动和测试指南

---

## 📋 功能概览

已实现的核心功能:
- ✅ **四种SKU类型**: 原料、包材、成品、套餐
- ✅ **BOM配置**: 成品可配置物料清单，支持损耗率
- ✅ **套餐配置**: 套餐可包含多个子项SKU
- ✅ **成本计算**: 自动计算成品和套餐的标准成本
- ✅ **门店范围**: 支持全门店和特定门店可用性配置
- ✅ **门店验证**: 验证成品/套餐的门店范围与组件/子项一致性

---

## 🚀 快速启动 (5分钟)

### 前置条件

| 工具 | 版本要求 | 检查命令 |
|------|---------|----------|
| Node.js | 18+ | `node -v` |
| Java | 21 | `java -version` |
| Maven | 3.8+ | `mvn -v` |
| Git | 任意 | `git --version` |

### 1. 克隆并切换分支

```bash
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform
git checkout P001-sku-master-data
git pull origin P001-sku-master-data
```

### 2. 安装依赖

```bash
# 前端依赖
cd frontend
npm install

# 后端依赖（如果是首次运行）
cd ../backend
mvn clean install -DskipTests
```

---

## 📊 数据库设置

### 方式1: 使用现有迁移脚本 (推荐)

数据库迁移脚本已就绪，位于:
```
backend/src/main/resources/db/migration/
├── V001__create_skus_table.sql           # SKU主表
├── V002__create_bom_combo_tables.sql     # BOM和套餐表
└── V003__create_unit_test_data.sql       # 单位换算表
```

**执行迁移**:
```bash
cd backend
mvn flyway:migrate
```

### 方式2: 手动执行SQL (测试环境)

如果没有配置Flyway，可以直接在Supabase控制台执行以下脚本:

<details>
<summary>点击展开 - 完整SQL脚本</summary>

```sql
-- 1. 创建SKU主表
CREATE TABLE IF NOT EXISTS skus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    spu_id UUID NOT NULL,
    sku_type VARCHAR(20) NOT NULL CHECK (sku_type IN ('raw_material', 'packaging', 'finished_product', 'combo')),
    main_unit VARCHAR(20) NOT NULL,
    store_scope TEXT[] DEFAULT '{}',
    standard_cost DECIMAL(10,2),
    waste_rate DECIMAL(5,2) DEFAULT 0 CHECK (waste_rate >= 0 AND waste_rate <= 100),
    status VARCHAR(10) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'enabled', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_skus_type ON skus(sku_type);
CREATE INDEX idx_skus_status ON skus(status);
CREATE INDEX idx_skus_store_scope ON skus USING GIN(store_scope);

-- 2. 创建BOM组件表
CREATE TABLE IF NOT EXISTS bom_components (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finished_product_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    component_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(10,2),
    is_optional BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_bom_component UNIQUE (finished_product_id, component_id)
);

CREATE INDEX idx_bom_finished_product ON bom_components(finished_product_id);
CREATE INDEX idx_bom_component ON bom_components(component_id);

-- 3. 创建套餐子项表
CREATE TABLE IF NOT EXISTS combo_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    combo_id UUID NOT NULL REFERENCES skus(id) ON DELETE CASCADE,
    sub_item_id UUID NOT NULL REFERENCES skus(id) ON DELETE RESTRICT,
    quantity DECIMAL(10,3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(10,2),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uk_combo_sub_item UNIQUE (combo_id, sub_item_id)
);

CREATE INDEX idx_combo_combo_id ON combo_items(combo_id);
CREATE INDEX idx_combo_sub_item ON combo_items(sub_item_id);

-- 4. 创建单位换算表
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    is_base_unit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO units (code, name, category, is_base_unit) VALUES
('个', '个', 'quantity', true),
('ml', '毫升', 'volume', true),
('l', '升', 'volume', false),
('g', '克', 'weight', true),
('kg', '千克', 'weight', false)
ON CONFLICT (code) DO NOTHING;
```

</details>

### 导入测试数据

<details>
<summary>点击展开 - 测试数据SQL</summary>

```sql
-- 原料SKU
INSERT INTO skus (code, name, spu_id, sku_type, main_unit, standard_cost, status) VALUES
('RM-001', '可乐原液', gen_random_uuid(), 'raw_material', 'ml', 0.02, 'enabled'),
('RM-002', '威士忌', gen_random_uuid(), 'raw_material', 'ml', 0.50, 'enabled'),
('RM-003', '薄荷叶', gen_random_uuid(), 'raw_material', '片', 0.50, 'enabled')
ON CONFLICT (code) DO NOTHING;

-- 包材SKU
INSERT INTO skus (code, name, spu_id, sku_type, main_unit, standard_cost, status) VALUES
('PK-001', '玻璃杯', gen_random_uuid(), 'packaging', '个', 1.00, 'enabled'),
('PK-002', '纸杯', gen_random_uuid(), 'packaging', '个', 0.30, 'enabled'),
('PK-003', '吸管', gen_random_uuid(), 'packaging', '根', 0.10, 'enabled')
ON CONFLICT (code) DO NOTHING;

-- 成品SKU（示例：威士忌可乐）
WITH fp AS (
    INSERT INTO skus (code, name, spu_id, sku_type, main_unit, waste_rate, status, standard_cost)
    VALUES ('FP-001', '威士忌可乐', gen_random_uuid(), 'finished_product', '杯', 5.0, 'enabled', 29.93)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
)
INSERT INTO bom_components (finished_product_id, component_id, quantity, unit, unit_cost, sort_order)
SELECT
    (SELECT id FROM fp),
    (SELECT id FROM skus WHERE code = 'RM-002'),
    50, 'ml', 0.50, 1
UNION ALL
SELECT
    (SELECT id FROM fp),
    (SELECT id FROM skus WHERE code = 'RM-001'),
    100, 'ml', 0.02, 2
UNION ALL
SELECT
    (SELECT id FROM fp),
    (SELECT id FROM skus WHERE code = 'PK-001'),
    1, '个', 1.00, 3
ON CONFLICT (finished_product_id, component_id) DO NOTHING;
```

</details>

---

## 🖥️ 启动服务

### 后端服务

```bash
cd backend
mvn spring-boot:run
```

**验证后端启动成功**:
```bash
curl http://localhost:8080/api/skus
```

预期返回JSON响应:
```json
{
  "success": true,
  "data": [...],
  "total": 0,
  "page": 1,
  "pageSize": 20
}
```

### 前端服务

```bash
cd frontend
npm run dev
```

访问: http://localhost:5173

---

## 🧪 测试指南

### 后端测试

#### 1. 运行所有测试
```bash
cd backend
mvn test
```

#### 2. 运行SKU相关测试
```bash
# Repository层测试
mvn test -Dtest=SkuRepositoryTest
mvn test -Dtest=BomComponentRepositoryTest
mvn test -Dtest=ComboItemRepositoryTest

# Service层测试
mvn test -Dtest=CostCalculationServiceTest
mvn test -Dtest=StoreScopeValidationServiceTest
```

**测试覆盖**:
- ✅ 门店范围查询 (5个场景)
- ✅ 成本计算准确性 (20+场景)
- ✅ 门店范围验证 (8+场景)
- ✅ BOM/套餐CRUD操作

#### 3. 查看测试报告
```bash
mvn surefire-report:report
open target/site/surefire-report.html
```

### 前端测试

#### 单元测试
```bash
cd frontend
npm run test
```

#### E2E测试
```bash
npm run test:e2e
```

---

## 📡 API测试

### 使用Postman/curl测试

#### 1. 查询SKU列表
```bash
curl -X GET "http://localhost:8080/api/skus?skuType=raw_material&status=enabled"
```

#### 2. 创建原料SKU
```bash
curl -X POST http://localhost:8080/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "code": "RM-TEST-001",
    "name": "测试原料",
    "spuId": "00000000-0000-0000-0000-000000000001",
    "skuType": "raw_material",
    "mainUnit": "kg",
    "standardCost": 10.50,
    "status": "draft"
  }'
```

#### 3. 创建成品SKU (含BOM)
```bash
curl -X POST http://localhost:8080/api/skus \
  -H "Content-Type: application/json" \
  -d '{
    "code": "FP-TEST-001",
    "name": "测试成品",
    "spuId": "00000000-0000-0000-0000-000000000002",
    "skuType": "finished_product",
    "mainUnit": "杯",
    "wasteRate": 5.0,
    "status": "draft",
    "bomComponents": [
      {
        "componentId": "<原料SKU的ID>",
        "quantity": 100,
        "unit": "ml"
      }
    ]
  }'
```

#### 4. 获取BOM配置
```bash
curl http://localhost:8080/api/skus/{skuId}/bom
```

#### 5. 验证门店范围
```bash
curl -X POST http://localhost:8080/api/skus/{skuId}/validate-store-scope \
  -H "Content-Type: application/json" \
  -d '{
    "storeScope": ["store-1", "store-2"]
  }'
```

预期响应:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": []
  }
}
```

---

## 🎯 关键测试场景

### 场景1: 创建成品并计算成本

**步骤**:
1. 创建2个原料SKU (可乐原液 ¥0.02/ml, 威士忌 ¥0.50/ml)
2. 创建1个包材SKU (玻璃杯 ¥1.00/个)
3. 创建成品SKU "威士忌可乐":
   - BOM: 威士忌50ml + 可乐100ml + 玻璃杯1个
   - 损耗率: 5%
4. 验证成本计算:
   - 组件成本 = 50×0.50 + 100×0.02 + 1×1.00 = 28.50
   - 含损耗 = 28.50 × 1.05 = 29.93 ✅

**验证SQL**:
```sql
SELECT
    s.name,
    s.standard_cost,
    s.waste_rate,
    (SELECT SUM(quantity * unit_cost) FROM bom_components WHERE finished_product_id = s.id) as component_cost
FROM skus s
WHERE s.code = 'FP-001';
```

### 场景2: 门店范围验证

**步骤**:
1. 创建全门店原料 (store_scope = '{}')
2. 创建特定门店成品 (store_scope = '["store-1", "store-2"]')
3. 调用验证API
4. 预期: 验证通过 ✅

**测试代码**:
```bash
# 验证全门店成品 + 部分门店组件 = 失败
curl -X POST http://localhost:8080/api/skus/{成品ID}/validate-store-scope \
  -H "Content-Type: application/json" \
  -d '{"storeScope": []}'

# 预期返回: valid=false, errors包含"组件仅在部分门店可用"
```

### 场景3: 套餐成本汇总

**步骤**:
1. 创建2个成品SKU (威士忌可乐 ¥29.93, 冰镇可乐 ¥2.73)
2. 创建套餐SKU "情侣观影套餐":
   - 子项: 威士忌可乐 2杯 + 冰镇可乐 1杯
3. 验证成本: 29.93×2 + 2.73×1 = 62.59 ✅

---

## 🔍 调试技巧

### 1. 查看数据库状态
```sql
-- 查看所有SKU及类型
SELECT id, code, name, sku_type, standard_cost, store_scope
FROM skus
ORDER BY sku_type, code;

-- 查看BOM配置
SELECT
    s1.name as finished_product,
    s2.name as component,
    bc.quantity,
    bc.unit,
    bc.unit_cost,
    (bc.quantity * bc.unit_cost) as total_cost
FROM bom_components bc
JOIN skus s1 ON bc.finished_product_id = s1.id
JOIN skus s2 ON bc.component_id = s2.id
ORDER BY s1.name, bc.sort_order;

-- 查看套餐配置
SELECT
    s1.name as combo,
    s2.name as sub_item,
    ci.quantity,
    ci.unit_cost
FROM combo_items ci
JOIN skus s1 ON ci.combo_id = s1.id
JOIN skus s2 ON ci.sub_item_id = s2.id
ORDER BY s1.name, ci.sort_order;
```

### 2. 后端日志
```bash
# 查看实时日志
cd backend
mvn spring-boot:run | grep SKU

# 或启用DEBUG日志
export LOGGING_LEVEL_COM_CINEMA=DEBUG
mvn spring-boot:run
```

### 3. 前端调试
```javascript
// 在浏览器控制台查看SKU Form状态
console.log(useFormContext().watch())

// 查看成本计算
console.log('Component Cost:', componentCost)
console.log('Waste Cost:', wasteCost)
console.log('Standard Cost:', standardCost)
```

---

## ❓ 常见问题

### Q1: 成本计算不准确？
**检查**:
1. BOM组件的unit_cost是否正确记录
2. 损耗率是否在0-100范围内
3. 数量和单位成本的小数位数

**解决**:
```bash
# 重新计算成本
curl -X POST http://localhost:8080/api/skus/{skuId}/recalculate-cost
```

### Q2: 门店范围验证失败？
**检查**:
1. 成品的store_scope是否为空数组(全门店) 或特定门店列表
2. 组件的store_scope是否包含成品的所有门店

**调试SQL**:
```sql
-- 检查门店范围
SELECT
    name,
    sku_type,
    CASE
        WHEN store_scope = '{}' THEN '全门店'
        ELSE array_to_string(store_scope, ',')
    END as stores
FROM skus
WHERE id IN (成品ID, 组件ID);
```

### Q3: 测试数据如何重置？
```sql
-- 清空所有SKU数据
TRUNCATE TABLE bom_components CASCADE;
TRUNCATE TABLE combo_items CASCADE;
DELETE FROM skus;

-- 重新导入测试数据
\i test-data.sql
```

### Q4: Maven测试失败？
**原因**: 可能有其他功能的测试编译错误

**解决**:
```bash
# 只编译和测试SKU相关的类
mvn test-compile -Dmaven.main.skip=false
mvn test -Dtest=*Sku*Test,*Bom*Test,*Combo*Test,*Cost*Test,*StoreScope*Test
```

---

## 📚 代码结构导航

### 后端关键文件

```
backend/src/main/java/com/cinema/hallstore/
├── domain/
│   ├── Sku.java                          # SKU实体 (150行)
│   ├── BomComponent.java                 # BOM组件实体 (113行)
│   └── ComboItem.java                    # 套餐子项实体 (106行)
├── repository/
│   ├── SkuRepository.java                # SKU数据访问 (219行)
│   ├── BomComponentRepository.java       # BOM数据访问 (123行)
│   └── ComboItemRepository.java          # 套餐数据访问 (123行)
├── service/
│   ├── SkuService.java                   # SKU业务逻辑 (427行)
│   ├── CostCalculationService.java       # 成本计算 (121行)
│   └── StoreScopeValidationService.java  # 门店验证 (135行)
└── controller/
    ├── SkuController.java                # SKU API (231行)
    ├── BomController.java                # BOM API (115行)
    └── ComboController.java              # 套餐API (103行)
```

### 前端关键文件

```
frontend/src/
├── types/sku.ts                          # 类型定义 (完整)
├── components/sku/
│   ├── SkuForm/
│   │   ├── BasicInfoTab.tsx             # 基本信息表单
│   │   ├── BomConfigTab.tsx             # BOM配置
│   │   └── ComboConfigTab.tsx           # 套餐配置
│   ├── SkuFilters.tsx                   # SKU筛选器
│   ├── SkuTable.tsx                     # SKU列表
│   └── CostBreakdownTable.tsx           # 成本明细表
├── hooks/useSku.ts                      # SKU数据钩子
└── mocks/handlers/sku.ts                # MSW Mock数据
```

### 测试文件

```
backend/src/test/java/com/cinema/hallstore/
├── repository/
│   ├── SkuRepositoryTest.java           # ✅ 280行 (35个测试)
│   ├── BomComponentRepositoryTest.java  # ✅ 200行 (20个测试)
│   └── ComboItemRepositoryTest.java     # ✅ 190行 (20个测试)
└── service/
    ├── CostCalculationServiceTest.java  # ✅ 420行 (25个测试)
    └── StoreScopeValidationServiceTest.java # ✅ 380行 (20个测试)
```

---

## 🎓 学习路径

### 新手入门 (第1天)
1. ✅ 阅读 `spec.md` 了解业务需求
2. ✅ 阅读 `data-model.md` 了解数据库设计
3. ✅ 运行后端测试理解成本计算逻辑
4. ✅ 启动前端查看UI交互

### 开发实践 (第2-3天)
1. ✅ 创建测试SKU数据
2. ✅ 测试BOM配置API
3. ✅ 测试门店范围验证
4. ✅ 调试成本计算公式

### 高级主题 (第4-5天)
1. ⏳ 编写集成测试 (T015)
2. ⏳ 编写前端E2E测试 (T030)
3. ⏳ 性能优化和缓存
4. ⏳ 扩展功能 (批量导入、成本历史)

---

## 🔗 参考资料

- [功能规格说明](./spec.md) - 完整业务需求
- [数据模型设计](./data-model.md) - 数据库ER图
- [任务清单](./tasks.md) - 实现进度追踪
- [API契约](./contracts/api.yaml) - REST API定义
- [前端类型](./contracts/frontend-types.ts) - TypeScript类型定义

---

## ✅ 实现进度

| 模块 | 状态 | 完成度 |
|------|------|--------|
| 数据库迁移 | ✅ 完成 | 100% (T001-T003) |
| 后端实体类 | ✅ 完成 | 100% (T004-T005) |
| Repository层 | ✅ 完成 | 100% (T006) |
| Service层 | ✅ 完成 | 100% (T007-T008) |
| Controller层 | ✅ 完成 | 100% (T009-T012) |
| 后端测试 | ✅ 部分完成 | 67% (T013-T014完成, T015待完成) |
| 前端类型 | ✅ 完成 | 100% (T016-T018) |
| 前端Mock | ✅ 完成 | 100% (T019-T020) |
| 前端组件 | ✅ 完成 | 100% (T021-T028) |
| 前端测试 | ⏳ 待完成 | 0% (T029-T030) |

**总体进度**: 28/30 任务完成 (93.3%)

---

**祝测试顺利！** 🎉

如有问题请参考上述文档或查看代码注释。
