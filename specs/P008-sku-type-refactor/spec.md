# Feature Specification: SKU 类型重构 - 移除 SPU productType

**Feature Branch**: `P008-sku-type-refactor`
**Created**: 2026-01-10
**Status**: Draft
**Input**: User description: "采取方案A移除SPU的productType，SKU添加编辑页面可选择SKU类型(成品/包材/原料/套餐)，统一使用Enum"

## 背景

当前系统存在 SPU 和 SKU 产品类型冗余问题：
- SPU 有 `productType` 字段（String 类型）
- SKU 有 `skuType` 字段（Enum 类型）
- 注释声称"SKU创建时继承SPU类型"，但代码未实现
- 存在数据不一致风险和类型冗余

本规格采用**方案 A**：移除 SPU 的 `productType` 字段，让产品类型完全由 SKU 管理。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 创建 SKU 时选择类型 (Priority: P1)

运营人员需要创建新的 SKU（如一种新的原料或成品），在创建页面可以选择 SKU 的类型（原料、包材、成品、套餐），系统根据类型展示不同的必填字段。

**Why this priority**: 这是核心功能，SKU 类型决定后续的业务规则（成本计算、BOM 配置等）

**Independent Test**: 可以通过创建不同类型的 SKU 并验证表单字段变化来测试

**Acceptance Scenarios**:

1. **Given** 用户在 SKU 创建页面，**When** 用户选择"原料"类型，**Then** 表单显示"标准成本"必填字段，隐藏 BOM 配置区域
2. **Given** 用户在 SKU 创建页面，**When** 用户选择"成品"类型，**Then** 表单显示 BOM 配置区域和损耗率字段，隐藏标准成本输入（自动计算）
3. **Given** 用户在 SKU 创建页面，**When** 用户选择"套餐"类型，**Then** 表单显示套餐子项配置区域
4. **Given** 用户未选择 SKU 类型，**When** 用户提交表单，**Then** 系统提示"请选择 SKU 类型"

---

### User Story 2 - 编辑 SKU 时查看和理解类型 (Priority: P2)

运营人员编辑现有 SKU 时，需要看到当前 SKU 的类型，类型创建后不可更改（因为会影响 BOM、成本计算等关联数据）。

**Why this priority**: 确保数据一致性，防止误操作导致业务逻辑混乱

**Independent Test**: 打开已有 SKU 的编辑页面，验证类型显示且不可修改

**Acceptance Scenarios**:

1. **Given** 用户打开一个"成品"类型 SKU 的编辑页面，**When** 页面加载完成，**Then** SKU 类型显示为"成品"且为禁用/只读状态
2. **Given** 用户尝试修改 SKU 类型，**When** 用户点击类型选择器，**Then** 类型不可更改，显示提示"SKU 类型创建后不可修改"

---

### User Story 3 - SPU 不再需要 productType (Priority: P3)

移除 SPU 的 productType 字段后，SPU 创建/编辑表单不再显示产品类型选项，SPU 列表和详情页也不显示产品类型。

**Why this priority**: 消除数据冗余，简化 SPU 管理

**Independent Test**: 创建/编辑 SPU 时不再看到产品类型选项

**Acceptance Scenarios**:

1. **Given** 用户在 SPU 创建页面，**When** 页面加载完成，**Then** 表单不显示"产品类型"字段
2. **Given** 用户查看 SPU 列表，**When** 页面加载完成，**Then** 列表不显示"产品类型"列
3. **Given** 现有 SPU 有 productType 数据，**When** 移除字段后查询，**Then** 系统正常运行，忽略历史 productType 数据

---

### Edge Cases

- 如果已有 SKU 的 spuId 关联的 SPU 被删除，SKU 仍可正常显示和编辑
- SKU 类型选择后，如果用户刷新页面，表单状态应保持
- 批量创建 SKU 时，每个 SKU 可以独立选择类型

## Requirements *(mandatory)*

### Functional Requirements

#### 后端修改

- **FR-001**: 系统必须从 SPU 实体中移除 `productType` 字段
- **FR-002**: 系统必须更新 SPU 相关的 API 响应，不再返回 `productType` 字段
- **FR-003**: 系统必须保持 SKU 的 `skuType` 字段使用 `SkuType` 枚举类型（RAW_MATERIAL, PACKAGING, FINISHED_PRODUCT, COMBO）
- **FR-004**: 系统必须在 SKU 创建时验证 `skuType` 必填
- **FR-005**: 系统必须在 SKU 更新时禁止修改 `skuType` 字段

#### 前端修改

- **FR-006**: SKU 创建页面必须显示 SKU 类型选择器，包含四个选项（原料、包材、成品、套餐）
- **FR-007**: SKU 类型选择器必须使用后端的 SkuType 枚举值（raw_material, packaging, finished_product, combo）
- **FR-008**: SKU 编辑页面必须将 SKU 类型显示为只读状态
- **FR-009**: SPU 创建/编辑页面必须移除产品类型（productType）字段
- **FR-010**: SPU 列表页面必须移除产品类型列
- **FR-011**: SKU 创建表单必须根据所选类型动态显示/隐藏相关字段：
  - 原料/包材：显示"标准成本"必填字段
  - 成品：显示 BOM 配置和损耗率字段
  - 套餐：显示套餐子项配置

#### 数据迁移

- **FR-012**: 历史数据中 SPU 的 `productType` 字段值无需迁移，后端忽略该字段即可
- **FR-013**: 现有 SKU 的 `skuType` 数据保持不变

### Key Entities

- **SKU**: 库存单元，`skuType` 是核心字段，决定业务规则
  - `skuType`: SkuType 枚举（RAW_MATERIAL, PACKAGING, FINISHED_PRODUCT, COMBO）
  - `spuId`: 关联的 SPU ID
  - 根据类型有不同的必填字段和业务逻辑

- **SPU**: 标准产品单元，移除 `productType` 字段后仅管理商品基本信息
  - 名称、品牌、分类、图片、描述等
  - 不再涉及产品类型

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: SKU 创建流程完成时间不超过 2 分钟（包括类型选择和必填字段填写）
- **SC-002**: 100% 的 SKU 创建请求必须包含有效的 skuType 值
- **SC-003**: 所有现有 SKU 数据在重构后正常显示和编辑
- **SC-004**: SPU 创建/编辑页面加载时间不增加（移除字段后应更快）
- **SC-005**: 用户首次使用 SKU 类型选择功能成功率达到 95%（无需查阅帮助文档）

## Assumptions

- 现有 SKU 数据的 `skuType` 值均为有效的枚举值
- 数据库允许 SPU 表的 `productType` 列保留（不做物理删除），后端代码忽略即可
- 前端 SKU 类型显示使用中文标签（原料、包材、成品、套餐），但值使用英文枚举
