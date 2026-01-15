# Feature Specification: 物料单位体系统一方案

**Feature Branch**: `M001-material-unit-system`
**Created**: 2026-01-11
**Status**: Draft
**Input**: 基于 `/docs/业务需求/需求专项说明/物料单位体系统一方案专项说明.md` 文档
**Related Specs**: P002-unit-conversion

---

## Overview

本功能旨在建立统一的物料单位体系，解决当前系统中存在的三大问题：

1. **单位数据硬编码** - 单位列表写在前端代码中，无法动态管理
2. **SKU强依赖SPU** - 原料/包材必须先创建SPU，数据冗余
3. **缺少物料级换算** - 不同规格同类物料无法独立配置换算率

通过建立"单位主数据 + 物料主数据 + 统一换算服务"的完整体系，实现精细化的物料库存管理和 BOM 配方计算。

---

## User Scenarios & Testing

### User Story 1 - 单位主数据管理 (Priority: P1)

作为**系统管理员**，我需要能够管理计量单位的主数据，以便系统各模块可以统一引用规范化的单位信息。

**Why this priority**: 单位是物料、换算的基础依赖，必须首先建立单位主数据才能支撑后续功能。

**Independent Test**: 可通过单位管理界面完成单位的增删改查操作，并验证单位选择器从 API 获取数据而非硬编码。

**Acceptance Scenarios**:

1. **Given** 系统管理员进入单位管理页面，**When** 查看单位列表，**Then** 显示所有单位及其分类（体积/重量/计数），支持按分类筛选
2. **Given** 系统管理员需要新增单位，**When** 填写单位代码、名称、分类并提交，**Then** 新单位创建成功并可在下拉列表中选择
3. **Given** 存在未被引用的单位，**When** 删除该单位，**Then** 单位删除成功
4. **Given** 存在已被物料或换算规则引用的单位，**When** 尝试删除，**Then** 系统阻止删除并提示"该单位已被引用，无法删除"

---

### User Story 2 - 物料主数据管理 (Priority: P1)

作为**采购管理员**，我需要能够创建和管理物料主数据（原料/包材），并配置物料的库存单位、采购单位及换算率，以便支持精细化的采购和库存管理。

**Why this priority**: 物料是采购、库存、BOM 的核心实体，必须独立于 SPU/SKU 体系管理。

**Independent Test**: 可创建物料并配置单位换算，验证物料数据独立于 SPU 体系。

**Acceptance Scenarios**:

1. **Given** 采购管理员需要新增原料，**When** 创建物料时填写名称、类别（原料）、库存单位（ml）、采购单位（瓶）、换算率（500），**Then** 物料创建成功，无需关联 SPU
2. **Given** 物料"朗姆酒"配置了1瓶=500ml换算率，**When** 查看物料详情，**Then** 显示"库存单位: ml，采购单位: 瓶，换算率: 1瓶=500ml"
3. **Given** 管理员编辑物料，**When** 修改换算率从500改为750，**Then** 换算率更新成功，后续换算使用新值
4. **Given** 物料已在 BOM 配方中使用，**When** 尝试删除，**Then** 系统阻止删除并提示引用信息

---

### User Story 3 - 统一换算服务 (Priority: P1)

作为**系统服务调用方**，当需要进行单位换算时，系统应优先使用物料级换算率，若无则降级使用全局换算规则，以便支持不同规格物料的精确换算。

**Why this priority**: 换算服务是采购入库、BOM 扣减的核心能力，必须支持物料级覆盖。

**Independent Test**: 可验证同一单位换算（瓶→ml）在不同物料下返回不同结果。

**Acceptance Scenarios**:

1. **Given** 物料"朗姆酒"配置了1瓶=500ml（use_global_conversion=false），**When** 换算1瓶朗姆酒，**Then** 结果为500ml，source='material'
2. **Given** 物料"威士忌"配置了1瓶=750ml，**When** 换算2瓶威士忌，**Then** 结果为1500ml
3. **Given** 物料设置use_global_conversion=true，**When** 换算1瓶，**Then** 使用全局换算规则，source='global'
4. **Given** 全局规则1L=1000ml，**When** 无物料上下文换算2L，**Then** 结果为2000ml

---

### User Story 4 - 采购入库换算 (Priority: P2)

作为**仓库管理员**，当采购订单入库时，系统应自动将采购数量换算为库存数量，以便库存数据以统一单位管理。

**Why this priority**: 采购入库是物料换算的关键业务场景，依赖物料和换算服务。

**Independent Test**: 可创建采购订单并验证入库数量自动换算正确。

**Acceptance Scenarios**:

1. **Given** 物料"朗姆酒"配置1瓶=500ml，**When** 创建采购订单10瓶并入库，**Then** 库存增加5000ml
2. **Given** 采购单显示"10瓶"，**When** 入库完成后查看库存，**Then** 显示"5000ml（约10瓶）"
3. **Given** 物料"高脚杯"配置1箱=20个，**When** 采购5箱入库，**Then** 库存增加100个

---

### User Story 5 - BOM配方用量换算 (Priority: P2)

作为**配方管理员**，在 BOM 配方中可以选择物料并按计量单位定义用量，系统在订单处理时自动换算并扣减库存。

**Why this priority**: BOM 是物料消耗的核心场景，依赖物料选择和换算能力。

**Independent Test**: 可创建包含物料的 BOM 配方，验证订单处理时库存扣减正确。

**Acceptance Scenarios**:

1. **Given** BOM配方"朗姆鸡尾酒"定义用量朗姆酒50ml/份，**When** 下单10份，**Then** 朗姆酒库存扣减500ml
2. **Given** 库存5000ml，配方用量50ml/份，**When** 售出20份，**Then** 剩余库存4000ml
3. **Given** BOM 组件选择物料时，**When** 选择"朗姆酒"，**Then** 单位下拉自动填充该物料的库存单位（ml）

---

### User Story 6 - 前端单位选择器统一 (Priority: P2)

作为**前端开发者**，现有硬编码的单位下拉组件需要改造为从 API 动态获取单位列表，以便统一数据来源。

**Why this priority**: 统一前端组件依赖单位主数据 API，是体系统一的关键一环。

**Independent Test**: 可验证所有单位选择器从 /api/units 获取数据。

**Acceptance Scenarios**:

1. **Given** 用户打开任意包含单位选择器的表单，**When** 单位选择器加载，**Then** 选项来自 /api/units 接口而非硬编码
2. **Given** 管理员新增了单位"听"，**When** 刷新页面，**Then** 单位选择器中出现"听"选项

---

### Edge Cases

- **单位被删除时**：若单位已被物料或换算规则引用，删除操作被阻止
- **换算精度**：换算结果保留合理的小数位数（根据单位的 decimal_places 配置）
- **循环换算**：复用 P002 的循环检测逻辑，防止 A→B→C→A 的死循环
- **物料级换算不存在时**：自动降级到全局换算链
- **无换算路径时**：返回明确的错误信息"无法找到从X到Y的换算路径"

---

## Requirements

### Functional Requirements

#### 单位管理

- **FR-001**: 系统 MUST 提供单位主数据表，存储单位代码、名称、分类、小数位数等信息
- **FR-002**: 系统 MUST 提供单位的增删改查 API（/api/units）
- **FR-003**: 系统 MUST 预置基础单位数据（ml、L、g、kg、瓶、个、份等）
- **FR-004**: 系统 MUST 在删除单位时检查引用关系，有引用时阻止删除

#### 物料管理

- **FR-005**: 系统 MUST 提供物料主数据表，存储物料编码、名称、类别、库存单位、采购单位、换算率等
- **FR-005.1**: 物料编码 MUST 采用 `MAT-{类别}-{序号}` 格式（类别：RAW=原料, PKG=包材；序号：001-999 三位数字），全局唯一
- **FR-006**: 系统 MUST 支持物料的增删改查 API（/api/materials）
- **FR-007**: 物料创建 MUST 不依赖 SPU，可独立创建
- **FR-008**: 物料 MUST 支持配置"是否使用全局换算"标志

#### 换算服务

- **FR-009**: 系统 MUST 提供统一换算 API（/api/conversions/calculate），支持物料参数
- **FR-010**: 换算服务 MUST 优先使用物料级换算率，无则降级到全局换算
- **FR-011**: 换算结果 MUST 返回换算来源（material/global）和换算路径
- **FR-012**: 系统 MUST 复用 P002 的全局换算链计算和循环检测能力

#### 业务集成

- **FR-013**: 采购订单入库 MUST 自动调用换算服务，将采购数量转换为库存数量
- **FR-014**: BOM 配方组件 MUST 支持选择物料，并按物料单位定义用量
- **FR-014.1**: BOM 组件表 MUST 支持双引用字段（sku_id 和 material_id 互斥），成品组件引用 SKU，原料/包材组件引用 Material
- **FR-015**: 库存管理 MUST 支持物料类型的库存记录
- **FR-015.1**: 库存表 MUST 增加 inventory_item_type 字段（枚举值：MATERIAL/SKU），通过 sku_id 和 material_id 多态引用，确保类型与引用字段一致性

#### 前端改造

- **FR-016**: 所有单位选择器 MUST 从 /api/units 获取数据，不再使用硬编码
- **FR-017**: 物料管理页面 MUST 提供物料列表、新建/编辑表单、换算配置组件

### Key Entities

- **Unit（单位）**: 计量单位主数据，包含代码、名称、分类（体积/重量/计数）、小数位数、是否基础单位
- **Material（物料）**: 原料/包材主数据，包含编码、名称、类别、库存单位、采购单位、换算率、是否使用全局换算
- **UnitConversion（单位换算规则）**: 全局换算规则，复用 P002 现有表结构，新增与单位主数据的关联
- **BomComponent（BOM组件）**: 扩展支持 sku_id 和 material_id 双引用字段（互斥），通过类型字段区分
- **Inventory（库存记录）**: 扩展支持 inventory_item_type 字段（MATERIAL/SKU），通过 sku_id 和 material_id 多态引用

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 单位管理功能上线后，前端所有单位选择器统一从 API 获取数据，消除硬编码
- **SC-002**: 物料创建不再依赖 SPU，原料/包材可独立创建和管理
- **SC-003**: 同一物料的采购入库换算结果与物料配置的换算率一致
- **SC-004**: 不同规格的同类物料（如750ml瓶、500ml瓶）可独立配置换算率，换算结果正确
- **SC-005**: BOM 配方支持选择物料并正确扣减库存
- **SC-006**: 用户完成物料创建（含换算配置）的操作在 3 分钟内完成
- **SC-007**: 换算服务处理请求响应时间 P95 小于 1 秒

---

## Clarifications

### Session 2026-01-11

- Q: Material（物料）实体应该如何与现有的 SPU/SKU 结构关联？ → A: 独立的 Material 实体：Material 与 SPU/SKU 无关联，独立管理
- Q: 现有 SKU 表中的 RAW_MATERIAL 和 PACKAGING 类型数据应该如何处理？ → A: 立即迁移所有 RAW_MATERIAL/PACKAGING 类型的 SKU 数据到 Material 表，删除 SKU 中对应记录（开发阶段可清理全部数据）
- Q: BOM 配方组件在迁移后应该引用 Material 还是继续引用 SKU？ → A: BOM 组件表支持双引用字段（sku_id 和 material_id），成品引用 SKU，原料/包材引用 Material
- Q: 库存表（inventory）应该如何区分物料库存和成品 SKU 库存？ → A: 库存表增加 inventory_item_type 字段（MATERIAL/SKU），通过 sku_id 和 material_id 多态引用
- Q: 物料编码（Material.code）应该采用什么样的编码规则？ → A: MAT-{类别}-{序号}（例：MAT-RAW-001, MAT-PKG-001）

---

## Assumptions

1. **P002 换算能力可复用**：现有 unit_conversions 表和换算链计算逻辑可直接复用
2. **开发阶段数据清理**：开发阶段可清理现有 SKU 表中的 RAW_MATERIAL/PACKAGING 类型数据，迁移到 Material 表后删除原 SKU 记录
3. **单位代码唯一**：单位代码在系统内全局唯一，大小写不敏感
4. **物料类别**：物料类别限定为 RAW_MATERIAL（原料）和 PACKAGING（包材）两种
5. **Material 完全独立于 SPU/SKU**：Material 实体不引用 SPU 或 SKU，原料/包材通过独立的 Material 表管理，成品继续使用 SPU-SKU 模型
6. **SKU 仅保留成品和套餐**：迁移完成后，SKU 表的 sku_type 字段仅保留 FINISHED_PRODUCT 和 COMBO 两种类型
7. **物料编码规则**：采用 MAT-{类别}-{序号} 格式，类别为 RAW（原料）或 PKG（包材），序号为 001-999 三位递增数字

---

## Out of Scope

- 现有成品 SKU/SPU 数据模型的改动（仅清理 RAW_MATERIAL/PACKAGING 类型）
- 多仓库物料库存管理
- 物料成本核算和价格管理
- 供应商管理功能
- 生产环境的数据迁移脚本（本次仅处理开发环境）

---

## Dependencies

- **P002-unit-conversion**: 复用全局换算规则表和换算链计算服务
- **Flyway**: 数据库迁移脚本管理
- **Supabase**: PostgreSQL 数据库

---

## Related Documents

- [物料单位体系统一方案专项说明](/docs/业务需求/需求专项说明/物料单位体系统一方案专项说明.md)
- [P002 单位换算专项说明](/docs/业务需求/需求专项说明/单位换算配置功能专项说明.md)
- [P002 功能规格](/specs/P002-unit-conversion/spec.md)
