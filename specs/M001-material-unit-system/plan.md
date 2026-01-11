# Implementation Plan: 物料单位体系统一方案

**@spec M001-material-unit-system**

**Feature Branch**: `M001-material-unit-system`
**Created**: 2026-01-11
**Status**: Draft

---

## Overview

本实现计划基于 [spec.md](./spec.md) 规格文档，旨在建立统一的物料单位体系，包括：

1. **单位主数据管理**：将硬编码的单位列表迁移到数据库，提供 CRUD API
2. **物料主数据管理**：建立独立于 SPU/SKU 的物料模型，支持物料级换算配置
3. **统一换算服务**：扩展 P002 换算能力，支持物料级换算率优先查找
4. **业务集成**：在采购入库、BOM 配方中集成物料和换算服务

---

## Architecture Design

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  单位管理页面  │  物料管理页面  │  统一单位选择器组件      │
└──────────────┬──────────────────┬───────────────────────────┘
               │                  │
               ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API Layer (Spring Boot)             │
├─────────────────────────────────────────────────────────────┤
│  /api/units     │  /api/materials  │  /api/conversions/*    │
└─────────────────┴──────────────────┴────────────────────────┘
               │                  │                │
               ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
├─────────────────────────────────────────────────────────────┤
│  UnitService    │  MaterialService │  UnifiedConversionService│
│                 │                  │  (扩展 P002 能力)         │
└─────────────────┴──────────────────┴────────────────────────┘
               │                  │                │
               ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer (JPA)                     │
├─────────────────────────────────────────────────────────────┤
│  UnitRepository │  MaterialRepository │  UnitConversionRepo  │
└─────────────────┴──────────────────────┴────────────────────┘
               │                  │                │
               ▼                  ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (Supabase PostgreSQL)              │
├─────────────────────────────────────────────────────────────┤
│  units (新)     │  materials (新)     │  unit_conversions    │
└─────────────────┴──────────────────────┴────────────────────┘
```

### Database Schema Design

#### 1. units 表（单位主数据）

```sql
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,           -- 单位代码（如 ml, L, bottle）
    name VARCHAR(50) NOT NULL,                  -- 单位名称（如 毫升, 升, 瓶）
    category VARCHAR(20) NOT NULL,              -- 分类：VOLUME, WEIGHT, COUNT
    decimal_places INTEGER NOT NULL DEFAULT 2,  -- 小数位数
    is_base_unit BOOLEAN NOT NULL DEFAULT false,-- 是否基础单位
    description TEXT,                           -- 描述
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT units_category_check CHECK (category IN ('VOLUME', 'WEIGHT', 'COUNT'))
);

CREATE INDEX idx_units_category ON units(category);
CREATE INDEX idx_units_code ON units(code);
```

**预置数据**：
```sql
INSERT INTO units (code, name, category, decimal_places, is_base_unit) VALUES
('ml', '毫升', 'VOLUME', 1, true),
('L', '升', 'VOLUME', 2, false),
('bottle', '瓶', 'VOLUME', 2, false),
('cup', '杯', 'VOLUME', 1, false),
('g', '克', 'WEIGHT', 1, true),
('kg', '千克', 'WEIGHT', 2, false),
('piece', '个', 'COUNT', 0, true),
('box', '箱', 'COUNT', 0, false),
('serving', '份', 'COUNT', 0, false);
```

#### 2. materials 表（物料主数据）

```sql
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,           -- 物料编码（如 MAT-RUM-001）
    name VARCHAR(100) NOT NULL,                 -- 物料名称（如 朗姆酒）
    category VARCHAR(20) NOT NULL,              -- 类别：RAW_MATERIAL, PACKAGING
    inventory_unit_code VARCHAR(20) NOT NULL,   -- 库存单位代码（外键 → units.code）
    purchase_unit_code VARCHAR(20),             -- 采购单位代码（外键 → units.code）
    conversion_rate NUMERIC(10, 6),             -- 物料级换算率（采购→库存）
    use_global_conversion BOOLEAN DEFAULT false,-- 是否使用全局换算
    description TEXT,                           -- 描述
    status VARCHAR(20) DEFAULT 'ACTIVE',        -- 状态：ACTIVE, INACTIVE
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT materials_category_check CHECK (category IN ('RAW_MATERIAL', 'PACKAGING')),
    CONSTRAINT materials_status_check CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT fk_inventory_unit FOREIGN KEY (inventory_unit_code) REFERENCES units(code),
    CONSTRAINT fk_purchase_unit FOREIGN KEY (purchase_unit_code) REFERENCES units(code)
);

CREATE INDEX idx_materials_category ON materials(category);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_code ON materials(code);
```

#### 3. unit_conversions 表（复用 P002，新增关联）

```sql
-- 现有表结构保持不变，新增注释说明
COMMENT ON TABLE unit_conversions IS '全局单位换算规则表（P002）。
物料级换算优先级高于此表，当物料未配置换算或 use_global_conversion=true 时使用此表。';
```

### Module Structure

```
backend/src/main/java/com/cinema/
├── unit/                          # 单位主数据模块（新建）
│   ├── controller/
│   │   └── UnitController.java    # /api/units CRUD
│   ├── domain/
│   │   ├── Unit.java              # 单位实体
│   │   └── UnitCategory.java      # 枚举：VOLUME, WEIGHT, COUNT
│   ├── dto/
│   │   ├── UnitRequest.java
│   │   ├── UnitResponse.java
│   │   └── UnitListResponse.java
│   ├── repository/
│   │   └── UnitRepository.java    # JPA Repository
│   ├── service/
│   │   ├── UnitService.java       # 业务逻辑
│   │   └── impl/
│   │       └── UnitServiceImpl.java
│   └── exception/
│       ├── UnitNotFoundException.java
│       └── UnitInUseException.java
│
├── material/                      # 物料主数据模块（新建）
│   ├── controller/
│   │   └── MaterialController.java # /api/materials CRUD
│   ├── domain/
│   │   ├── Material.java           # 物料实体
│   │   └── MaterialCategory.java   # 枚举：RAW_MATERIAL, PACKAGING
│   ├── dto/
│   │   ├── MaterialRequest.java
│   │   ├── MaterialResponse.java
│   │   └── MaterialConversionConfigDTO.java
│   ├── repository/
│   │   └── MaterialRepository.java
│   ├── service/
│   │   ├── MaterialService.java
│   │   └── impl/
│   │       └── MaterialServiceImpl.java
│   └── exception/
│       ├── MaterialNotFoundException.java
│       └── MaterialInUseException.java
│
└── unitconversion/                # 复用 P002，扩展功能
    ├── service/
    │   ├── UnifiedConversionService.java  # 新增：统一换算服务
    │   └── impl/
    │       └── UnifiedConversionServiceImpl.java
    └── dto/
        ├── ConversionRequest.java  # 新增 materialId 参数
        └── ConversionResponse.java # 新增 source 字段（material/global）
```

### Frontend Structure

```
frontend/src/
├── components/
│   ├── unit/                      # 单位管理组件（新建）
│   │   ├── UnitList.tsx           # 单位列表
│   │   ├── UnitForm.tsx           # 单位新建/编辑表单
│   │   └── UnitSelector.tsx       # 统一单位选择器组件
│   │
│   ├── material/                  # 物料管理组件（新建）
│   │   ├── MaterialList.tsx       # 物料列表
│   │   ├── MaterialForm.tsx       # 物料新建/编辑表单
│   │   └── MaterialConversionConfig.tsx  # 物料换算配置组件
│   │
│   └── common/
│       └── UnitSelector.tsx       # 迁移现有硬编码组件到 API 驱动
│
├── pages/
│   ├── unit/                      # 单位管理页面（新建）
│   │   ├── UnitManagement.tsx     # 单位管理主页
│   │   └── UnitDetail.tsx         # 单位详情页
│   │
│   └── material/                  # 物料管理页面（新建）
│       ├── MaterialManagement.tsx # 物料管理主页
│       └── MaterialDetail.tsx     # 物料详情页
│
├── services/
│   ├── unitService.ts             # 单位 API 服务（新建）
│   └── materialService.ts         # 物料 API 服务（新建）
│
├── hooks/
│   ├── useUnits.ts                # 单位数据 Hook（新建）
│   └── useMaterials.ts            # 物料数据 Hook（新建）
│
└── types/
    ├── unit.ts                    # 单位类型定义（新建）
    └── material.ts                # 物料类型定义（新建）
```

---

## Implementation Phases

### Phase 1: 基础设施层 - 单位主数据 (P1)

**目标**：建立单位主数据表和 CRUD API

**Deliverables**:
1. ✅ 数据库迁移脚本 `V202601110001__create_units_table.sql`
2. ✅ 后端 `Unit` 实体、Repository、Service、Controller
3. ✅ 前端 `UnitService`、`useUnits` Hook
4. ✅ 单位管理页面（列表、新建、编辑、删除）
5. ✅ 单元测试覆盖率 ≥80%

**API Endpoints**:
- `GET /api/units` - 获取单位列表（支持分类筛选）
- `GET /api/units/{id}` - 获取单位详情
- `POST /api/units` - 创建单位
- `PUT /api/units/{id}` - 更新单位
- `DELETE /api/units/{id}` - 删除单位（检查引用）

**Validation Rules**:
- 单位代码全局唯一，不区分大小写
- 删除时检查 `materials` 表和 `unit_conversions` 表的引用
- 分类必须是 VOLUME/WEIGHT/COUNT 之一

---

### Phase 2: 核心业务层 - 物料主数据 (P1)

**目标**：建立物料主数据表和 CRUD API，支持物料级换算配置

**Deliverables**:
1. ✅ 数据库迁移脚本 `V202601110002__create_materials_table.sql`
2. ✅ 后端 `Material` 实体、Repository、Service、Controller
3. ✅ 前端 `MaterialService`、`useMaterials` Hook
4. ✅ 物料管理页面（列表、新建、编辑、删除）
5. ✅ 物料换算配置组件（配置采购单位、换算率、是否使用全局换算）
6. ✅ 单元测试覆盖率 ≥80%

**API Endpoints**:
- `GET /api/materials` - 获取物料列表（支持分类筛选）
- `GET /api/materials/{id}` - 获取物料详情
- `POST /api/materials` - 创建物料
- `PUT /api/materials/{id}` - 更新物料
- `DELETE /api/materials/{id}` - 删除物料（检查引用）
- `PUT /api/materials/{id}/conversion` - 更新物料换算配置

**Validation Rules**:
- 物料编码全局唯一
- 库存单位必须存在于 `units` 表
- 采购单位必须存在于 `units` 表（可为空）
- 如果配置了 `purchase_unit_code`，则 `conversion_rate` 必填
- 删除时检查 BOM 配方、库存记录的引用

---

### Phase 3: 换算服务层 - 统一换算 API (P1)

**目标**：扩展 P002 换算服务，支持物料级换算优先查找

**Deliverables**:
1. ✅ `UnifiedConversionService` 服务类
2. ✅ 扩展 `/api/conversions/calculate` API，新增 `materialId` 参数
3. ✅ 换算逻辑：优先查找物料级换算率，无则降级到全局换算
4. ✅ 换算响应包含 `source` 字段（material/global）
5. ✅ 单元测试覆盖率 100%（包含优先级逻辑测试）

**API Endpoint** (扩展现有):
- `POST /api/conversions/calculate`
  ```json
  {
    "fromUnit": "bottle",
    "toUnit": "ml",
    "quantity": 10,
    "materialId": "uuid-optional"  // 新增参数
  }
  ```

  **Response**:
  ```json
  {
    "success": true,
    "data": {
      "result": 5000,
      "fromUnit": "bottle",
      "toUnit": "ml",
      "originalQuantity": 10,
      "source": "material",  // 新增字段：material | global
      "conversionPath": ["bottle", "ml"],
      "conversionRate": 500
    }
  }
  ```

**Conversion Priority Logic**:
```java
public ConversionResult calculate(ConversionRequest request) {
    // 1. 如果传入 materialId，查找物料级换算
    if (request.getMaterialId() != null) {
        Material material = materialRepository.findById(request.getMaterialId())
            .orElseThrow(() -> new MaterialNotFoundException(...));

        // 1.1 如果物料配置了换算且 use_global_conversion=false
        if (!material.getUseGlobalConversion()
            && material.getPurchaseUnitCode() != null
            && material.getConversionRate() != null) {
            // 使用物料级换算
            return calculateWithMaterialConversion(material, request);
        }
    }

    // 2. 降级到全局换算（复用 P002 逻辑）
    return calculateWithGlobalConversion(request);
}
```

---

### Phase 4: 业务集成 - 采购入库换算 (P2)

**目标**：在采购订单入库时自动调用换算服务，将采购数量转换为库存数量

**Deliverables**:
1. ✅ 扩展 `ProcurementService` 入库逻辑，集成换算服务
2. ✅ 入库单据显示"采购数量 + 库存数量"双单位
3. ✅ 集成测试验证换算正确性

**Integration Points**:
- 修改 `backend/src/main/java/com/cinema/procurement/service/ProcurementService.java`
- 在 `confirmReceipt()` 方法中调用 `UnifiedConversionService`

**Example Flow**:
```
采购订单: 10瓶朗姆酒（物料级换算 1瓶=500ml）
  ↓
入库确认
  ↓
调用 UnifiedConversionService.calculate(bottle→ml, 10, materialId=朗姆酒ID)
  ↓
返回 5000ml（source=material）
  ↓
库存增加 5000ml
```

---

### Phase 5: 业务集成 - BOM 配方用量 (P2)

**目标**：BOM 配方支持选择物料，并在订单处理时自动换算扣减库存

**Deliverables**:
1. ✅ 扩展 `BOM` 配方组件，新增 `material_id` 字段
2. ✅ 前端 BOM 表单支持选择物料（非 SKU）
3. ✅ 订单处理时调用换算服务扣减物料库存
4. ✅ 集成测试验证扣减正确性

**Database Migration**:
```sql
-- V202601110003__add_material_to_bom.sql
ALTER TABLE bom_components ADD COLUMN material_id UUID;
ALTER TABLE bom_components ADD CONSTRAINT fk_bom_material
    FOREIGN KEY (material_id) REFERENCES materials(id);
```

**BOM Processing Logic**:
```java
// 处理 BOM 订单时
for (BomComponent component : bom.getComponents()) {
    if (component.getMaterialId() != null) {
        // 物料组件：调用换算服务
        ConversionResult result = conversionService.calculate(
            component.getUnit(),
            material.getInventoryUnitCode(),
            component.getQuantity(),
            component.getMaterialId()
        );
        inventoryService.deductStock(material.getId(), result.getResult());
    } else {
        // SKU 组件：保持原有逻辑
        inventoryService.deductStock(component.getSkuId(), component.getQuantity());
    }
}
```

---

### Phase 6: 前端改造 - 统一单位选择器 (P2)

**目标**：将硬编码的单位下拉组件改造为从 API 动态获取

**Deliverables**:
1. ✅ 新建 `UnitSelector` 组件（基于 Ant Design Select）
2. ✅ 使用 `useUnits` Hook 从 `/api/units` 获取数据
3. ✅ 支持按分类筛选（VOLUME/WEIGHT/COUNT）
4. ✅ 迁移所有现有单位选择器到新组件
5. ✅ 删除硬编码的单位常量文件

**Component API**:
```tsx
interface UnitSelectorProps {
  value?: string;                    // 选中的单位代码
  onChange?: (unitCode: string) => void;
  category?: 'VOLUME' | 'WEIGHT' | 'COUNT';  // 按分类筛选
  placeholder?: string;
  disabled?: boolean;
}

// 使用示例
<UnitSelector
  category="VOLUME"
  value={formData.unit}
  onChange={(unit) => setFormData({...formData, unit})}
/>
```

**Migration Checklist**:
- [ ] `frontend/src/components/sku/SkuForm.tsx` 中的单位选择器
- [ ] `frontend/src/components/bom/BomComponentForm.tsx` 中的单位选择器
- [ ] `frontend/src/components/procurement/PurchaseOrderForm.tsx` 中的单位选择器
- [ ] 其他包含单位选择器的表单组件

---

## Testing Strategy

### Unit Tests

#### Backend Tests

**UnitServiceTest.java**:
- ✅ 测试创建单位（正常、重复代码）
- ✅ 测试删除单位（正常、被引用）
- ✅ 测试按分类筛选

**MaterialServiceTest.java**:
- ✅ 测试创建物料（正常、无效单位）
- ✅ 测试配置换算（采购单位+换算率）
- ✅ 测试删除物料（正常、被 BOM 引用）

**UnifiedConversionServiceTest.java**:
- ✅ 测试物料级换算优先级（有物料配置时使用物料级）
- ✅ 测试降级到全局换算（无物料配置时）
- ✅ 测试 use_global_conversion 标志
- ✅ 测试换算来源字段（source=material/global）

#### Frontend Tests

**UnitSelector.test.tsx**:
- ✅ 测试从 API 加载单位列表
- ✅ 测试按分类筛选
- ✅ 测试选择单位触发 onChange

**MaterialForm.test.tsx**:
- ✅ 测试表单验证（库存单位必填）
- ✅ 测试换算配置（采购单位+换算率）
- ✅ 测试提交成功

### Integration Tests

**ProcurementIntegrationTest.java**:
- ✅ 测试采购入库自动换算
- ✅ 测试换算结果正确写入库存
- ✅ 验证双单位显示（采购10瓶 → 库存5000ml）

**BomProcessingIntegrationTest.java**:
- ✅ 测试 BOM 订单处理时物料扣减
- ✅ 测试混合 BOM（物料组件 + SKU 组件）
- ✅ 验证库存扣减正确

### E2E Tests (Playwright)

**unit-management.spec.ts**:
- ✅ 创建单位 → 查看列表 → 编辑 → 删除
- ✅ 尝试删除被引用的单位 → 显示错误提示

**material-management.spec.ts**:
- ✅ 创建物料 → 配置换算 → 保存成功
- ✅ 在采购订单中选择物料 → 入库 → 验证库存增加

**unified-conversion.spec.ts**:
- ✅ 创建物料级换算 → 采购入库 → 验证使用物料级换算
- ✅ 禁用物料级换算 → 采购入库 → 验证降级到全局换算

---

## Migration Strategy

### 数据迁移

**Phase 1: 预置单位数据**
- 在 `V202601110001` 迁移脚本中插入基础单位数据
- 确保现有系统使用的单位（ml、L、g、kg、瓶、个）全部预置

**Phase 2: 渐进式迁移**
- 不修改现有 SKU/SPU 数据模型
- 新创建的原料/包材使用物料模型
- 现有成品 SKU 继续使用 SPU-SKU 模型

**Phase 3: 兼容性保障**
- 在 BOM 组件表中，`sku_id` 和 `material_id` 字段互斥但不强制
- 订单处理逻辑同时支持 SKU 和物料两种路径

### 前端迁移

**Step 1: 新建组件**
- 创建 `UnitSelector` 组件，与现有硬编码组件并存
- 在新页面（单位管理、物料管理）中优先使用新组件

**Step 2: 逐步替换**
- 逐个页面替换硬编码单位选择器为 `UnitSelector`
- 测试确保功能无影响

**Step 3: 清理硬编码**
- 删除硬编码的单位常量文件（如 `frontend/src/constants/units.ts`）
- 更新文档说明单位来源为 API

---

## Risk Mitigation

### 风险 1: 换算服务性能下降

**风险描述**: 物料级换算查找增加数据库查询，可能导致换算 API 响应变慢

**缓解措施**:
- 在 `materials` 表的 `id` 字段上建立索引
- 使用 Redis 缓存物料换算配置（TTL=5分钟）
- 监控换算 API 的 P95 响应时间，目标 <1s

### 风险 2: 单位被误删导致数据不一致

**风险描述**: 管理员删除单位后，物料表中的 `inventory_unit_code` 外键失效

**缓解措施**:
- 使用外键约束 `ON DELETE RESTRICT` 阻止级联删除
- 在删除 API 中显式检查引用关系
- 前端显示"该单位被 X 个物料使用，无法删除"错误提示

### 风险 3: 前端迁移导致旧页面功能异常

**风险描述**: 替换硬编码单位选择器时可能遗漏某些页面，导致单位选项缺失

**缓解措施**:
- 使用全局搜索 `grep -r "hardcoded.*unit"` 查找硬编码位置
- 保留硬编码常量文件，在所有迁移完成后统一删除
- 在测试环境中完整回归测试所有涉及单位选择的页面

---

## Performance Targets

| 指标 | 目标 |
|------|------|
| 单位列表 API 响应时间 (P95) | ≤ 500ms |
| 物料创建 API 响应时间 (P95) | ≤ 800ms |
| 统一换算 API 响应时间 (P95) | ≤ 1s |
| 前端单位选择器加载时间 | ≤ 300ms |
| 采购入库换算处理时间 | ≤ 2s |

---

## Success Metrics

| 指标 | 目标值 | 验证方式 |
|------|--------|---------|
| 单位管理功能上线后，前端单位选择器 API 调用成功率 | ≥99% | 监控 `/api/units` 接口成功率 |
| 物料创建成功率（无 SPU 依赖） | 100% | 测试环境创建100个物料样本 |
| 采购入库换算准确率 | 100% | 对比人工计算结果 |
| 不同规格物料换算结果差异化 | 100% | 测试500ml瓶和750ml瓶换算结果不同 |
| BOM 配方物料扣减准确率 | 100% | 集成测试验证 |
| 用户完成物料创建（含换算配置）的平均时长 | ≤ 3分钟 | 用户测试记录 |
| 换算服务响应时间 P95 | ≤ 1s | APM 监控 |

---

## Dependencies

### External Dependencies
- **P002-unit-conversion**: 复用全局换算表和换算链计算逻辑
- **Supabase PostgreSQL**: 数据库服务
- **Flyway**: 数据库迁移工具

### Internal Dependencies
- **采购模块 (procurement)**: 需要调用换算服务
- **BOM 模块**: 需要支持物料组件
- **库存模块 (inventory)**: 需要支持物料类型库存

---

## Rollback Plan

如果 M001 上线后发现严重问题，按以下步骤回滚：

### Step 1: 停用物料相关功能
```sql
-- 临时禁用物料创建
UPDATE materials SET status = 'INACTIVE' WHERE status = 'ACTIVE';
```

### Step 2: 切换前端到硬编码单位
```bash
# 回滚前端代码到迁移前版本
git revert <migration-commit-hash>
npm run build && npm run deploy
```

### Step 3: 回滚数据库迁移
```bash
# 使用 Flyway 回滚
cd backend
./mvnw flyway:undo -Dflyway.target=<previous-version>
```

### Step 4: 验证回滚
- 测试现有 SKU 创建功能正常
- 验证单位选择器显示硬编码列表
- 确认采购入库流程正常

---

## Timeline Estimate

| Phase | 工作量估算 | 依赖 |
|-------|----------|------|
| Phase 1: 单位主数据 | 3人日 | - |
| Phase 2: 物料主数据 | 5人日 | Phase 1 |
| Phase 3: 统一换算服务 | 4人日 | Phase 1, Phase 2, P002 |
| Phase 4: 采购入库集成 | 3人日 | Phase 2, Phase 3 |
| Phase 5: BOM 配方集成 | 4人日 | Phase 2, Phase 3 |
| Phase 6: 前端单位选择器 | 3人日 | Phase 1 |
| 集成测试 & Bug 修复 | 3人日 | All Phases |
| **总计** | **25人日** | - |

---

## Related Documents

- [M001 功能规格](./spec.md)
- [P002 单位换算专项说明](/docs/业务需求/需求专项说明/单位换算配置功能专项说明.md)
- [物料单位体系统一方案专项说明](/docs/业务需求/需求专项说明/物料单位体系统一方案专项说明.md)
- [数据库迁移脚本](./migrations/)
- [API 契约定义](./contracts/api.yaml)
