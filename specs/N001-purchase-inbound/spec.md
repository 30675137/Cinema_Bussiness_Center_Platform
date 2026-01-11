# Feature Specification: 采购入库模块

**Feature Branch**: `N001-purchase-inbound`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "完整实现采购入库模块 - 采购订单创建、到货验收、收货入库功能，支持新SKU入库和库存初始化"

## 功能概述

为影院商品管理系统提供完整的采购入库管理功能，覆盖从采购订单创建到商品入库的全流程。该模块解决新 SKU 无法入库的问题，支持：
- 采购订单管理（创建、审核、跟踪）
- 到货验收（核对商品、数量确认）
- 收货入库（库存记录创建/更新）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 采购订单创建 (Priority: P1)

采购管理员根据门店商品需求创建采购订单，选择供应商和目标门店，添加需要采购的 SKU 明细，设置采购数量和预计到货日期。

**Why this priority**: 采购订单是整个入库流程的起点，没有订单就无法进行后续的验收和入库操作。这是最基础的功能。

**Independent Test**: 可以通过创建一个包含多个 SKU 的采购订单，验证订单号自动生成、金额计算正确、状态流转正常来独立测试。

**Acceptance Scenarios**:

1. **Given** 用户在采购订单列表页, **When** 点击"新建采购订单"并填写供应商、门店、SKU明细、数量, **Then** 系统生成唯一订单号并保存订单，状态为"草稿"
2. **Given** 采购订单处于"草稿"状态, **When** 用户点击"提交审核", **Then** 订单状态变为"待审核"，等待审批
3. **Given** 采购订单处于"待审核"状态, **When** 审批人同意, **Then** 订单状态变为"已审核"，可以进行收货
4. **Given** 订单明细中添加了多个 SKU, **When** 用户修改数量或单价, **Then** 系统实时计算行小计和订单总金额

---

### User Story 2 - 收货入库 (Priority: P1)

仓库管理员基于已审核的采购订单进行收货入库操作，核对实际到货商品和数量，确认收货后系统自动创建或更新库存记录。

**Why this priority**: 这是解决"新 SKU 无法入库"问题的核心功能。收货入库会自动为新 SKU 创建库存记录，或为已有 SKU 增加库存数量。

**Independent Test**: 可以通过对一个包含新 SKU 和已有 SKU 的采购订单进行收货，验证新 SKU 库存记录被创建、已有 SKU 库存数量增加。

**Acceptance Scenarios**:

1. **Given** 采购订单状态为"已审核", **When** 用户点击"新建收货入库", **Then** 系统显示订单明细，用户可以输入本次收货数量
2. **Given** 收货入库单中某 SKU 在目标门店没有库存记录, **When** 确认收货, **Then** 系统自动创建该 SKU 的库存记录，on_hand_qty 和 available_qty 设为收货数量
3. **Given** 收货入库单中某 SKU 在目标门店已有库存记录, **When** 确认收货, **Then** 系统将收货数量加到现有库存的 on_hand_qty 和 available_qty
4. **Given** 订单总数量为 100，本次收货数量为 60, **When** 确认收货, **Then** 订单状态变为"部分收货"，剩余 40 待收货

---

### User Story 3 - 采购订单跟踪 (Priority: P2)

采购管理员在订单列表页查看所有采购订单的状态，筛选不同状态的订单，追踪采购进度和收货情况。

**Why this priority**: 订单跟踪是日常运营的重要功能，但不影响核心的入库流程，可以在核心功能完成后实现。

**Independent Test**: 可以通过筛选不同状态的订单、查看订单详情、确认收货进度来独立测试。

**Acceptance Scenarios**:

1. **Given** 系统中存在多个采购订单, **When** 用户按状态筛选"待收货", **Then** 只显示状态为"已审核"且未完全收货的订单
2. **Given** 用户查看某个订单详情, **When** 该订单有多次收货记录, **Then** 显示每次收货的时间、数量和操作人
3. **Given** 采购订单处于"草稿"状态, **When** 用户删除订单, **Then** 订单被删除；已提交的订单不可删除

---

### User Story 4 - 采购订单审批 (Priority: P2)

审批人查看待审批的采购订单，审核订单内容后决定同意或拒绝，拒绝时需填写原因。

**Why this priority**: 审批流程是规范采购管理的重要环节，但在 MVP 阶段可以简化（如自动审批）。

**Independent Test**: 可以通过提交订单、审批人审核、验证状态流转来独立测试。

**Acceptance Scenarios**:

1. **Given** 订单状态为"待审核", **When** 审批人点击"同意", **Then** 订单状态变为"已审核"
2. **Given** 订单状态为"待审核", **When** 审批人点击"拒绝"并填写原因, **Then** 订单状态变为"已拒绝"，显示拒绝原因
3. **Given** 订单状态为"已拒绝", **When** 创建人修改订单后重新提交, **Then** 订单状态变为"待审核"

---

### Edge Cases

- 采购订单中的 SKU 已被禁用？系统应提示"该商品已停用，无法采购"
- 收货数量超过订单数量？系统应允许（超量收货），但给出警告提示
- 同一订单同时被多人操作收货？系统应使用乐观锁防止重复收货
- 门店不存在或已停用？系统应阻止向该门店创建采购订单或收货

## Requirements *(mandatory)*

### Functional Requirements

**采购订单管理**
- **FR-001**: 系统必须支持创建采购订单，包含供应商、目标门店、计划到货日期、订单明细
- **FR-002**: 系统必须自动生成唯一采购订单号，格式为 PO + 日期 + 序号（如 PO202601110001）
- **FR-003**: 订单明细必须支持添加多个 SKU，每行包含 SKU、数量、单价、小计
- **FR-004**: 系统必须实时计算订单总金额（所有行小计之和）
- **FR-005**: 系统必须支持保存草稿和提交审核两种操作
- **FR-006**: 系统必须记录订单的创建人、创建时间、修改时间

**采购订单审批**
- **FR-007**: 系统必须支持订单审批流程，包括同意和拒绝操作
- **FR-008**: 拒绝订单时必须填写拒绝原因
- **FR-009**: 被拒绝的订单必须支持修改后重新提交

**收货入库**
- **FR-010**: 系统必须支持基于已审核采购订单创建收货入库单
- **FR-011**: 收货入库单必须显示订单明细，支持输入本次收货数量
- **FR-012**: 系统必须支持部分收货（本次收货数量小于订单数量）
- **FR-013**: 确认收货后，系统必须自动更新库存：
  - 如果 SKU+门店 组合的库存记录不存在，创建新记录
  - 如果库存记录已存在，增加 on_hand_qty 和 available_qty
- **FR-014**: 系统必须记录收货流水，包含收货时间、数量、操作人
- **FR-015**: 系统必须根据收货情况更新订单状态（部分收货/全部收货/已关闭）

**订单状态管理**
- **FR-016**: 系统必须支持以下订单状态：草稿、待审核、已审核、已拒绝、部分收货、已收货、已关闭
- **FR-017**: 草稿状态的订单可以删除，其他状态不可删除
- **FR-018**: 系统必须支持按状态、门店、供应商、日期范围筛选订单

### 表单设计规范

#### 收货入库单表单字段分类

基于采购订单创建收货入库单时，表单字段分为三类：

| 字段类型 | 说明 | 交互状态 | 验证规则 |
|---------|------|---------|---------|
| **继承字段** | 从采购订单自动带入 | `disabled=true` | 无验证（数据来源已校验） |
| **必填字段** | 用户必须填写 | `disabled=false` | `required=true` |
| **可选字段** | 用户可选填写 | `disabled=false` | 无 required 验证 |

#### 收货入库单字段映射

| 字段名 | 字段类型 | 数据来源 | 说明 |
|--------|---------|---------|------|
| 采购单号 | 继承字段 | `PurchaseOrder.orderNumber` | 自动带入，不可修改 |
| 供应商 | 继承字段 | `PurchaseOrder.supplier.name` | 自动带入，不可修改 |
| 收货日期 | 必填字段 | 用户输入 | 默认当前日期时间 |
| 收货仓库 | 必填字段 | 用户选择 | 目标门店/仓库 |
| 收货人 | 可选字段 | 用户输入 | 经手人姓名 |
| 联系电话 | 可选字段 | 用户输入 | 联系方式 |
| 备注说明 | 可选字段 | 用户输入 | 补充说明 |
| 收货明细 | 继承+用户输入 | 混合 | SKU/订购数量继承，实收数量/质检状态用户填写 |

#### 设计原则

- **FR-019**: 继承字段必须禁用编辑（`disabled=true`），且不设置表单验证规则
- **FR-020**: 继承字段应显示 tooltip 提示数据来源（如"供应商信息继承自采购订单"）
- **FR-021**: 必填字段必须设置 `required=true` 验证规则，并提供清晰的错误提示
- **FR-022**: 从采购订单创建收货单时，系统必须自动填充所有继承字段

### Key Entities

- **采购订单 (PurchaseOrder)**: 采购主单据，包含订单号、供应商、目标门店、状态、总金额、计划到货日期
- **采购订单明细 (PurchaseOrderItem)**: 订单行项目，包含 SKU、数量、单价、小计
- **收货入库单 (GoodsReceipt)**: 收货单据，关联采购订单，记录实际收货信息
- **收货入库明细 (GoodsReceiptItem)**: 收货行项目，包含 SKU、本次收货数量
- **库存记录 (StoreInventory)**: 门店-SKU 维度的库存记录，收货后自动创建或更新

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可以在 3 分钟内完成一个包含 5 个 SKU 的采购订单创建
- **SC-002**: 收货入库操作完成后，库存数量在 5 秒内更新可见
- **SC-003**: 新 SKU 首次入库后，可以在库存查询页面立即查到该 SKU 的库存记录
- **SC-004**: 系统支持同时处理 50 个采购订单的并发收货操作
- **SC-005**: 订单列表筛选结果在 2 秒内返回
- **SC-006**: 采购入库流程完成后，库存调整功能可以正常操作新入库的 SKU

## Assumptions

1. 供应商信息已在系统中维护（本模块不包含供应商管理）
2. SKU 主数据已在系统中维护（本模块不包含 SKU 创建）
3. 门店信息已在系统中维护
4. 审批流程简化为单级审批（创建人提交 → 审批人审核）
5. 暂不支持退货入库功能，后续版本迭代
6. 采购单价由用户手动输入，暂不支持价格表自动带入

## Out of Scope

- 供应商档案管理
- 财务付款/发票处理
- 退货入库/退供管理
- 采购价格自动计算
- 多级审批流程

## 现有前端组件复用分析

### 复用总结

| 菜单功能 | 现有组件 | 复用状态 | 说明 |
|---------|---------|---------|------|
| 供应商管理 | SupplierList.tsx, SupplierDetail.tsx | ✅ 可复用 | UI 完整，需替换 Mock 数据为 JPA API |
| 采购订单列表 | PurchaseOrderList.tsx | ✅ 可复用 | UI 完整，需替换 Mock 数据 |
| 新建采购订单 | PurchaseOrders.tsx | ⚠️ 需完善 | 基础表单存在，但"采购明细"功能未开发 |
| 新建收货入库 | ReceivingForm.tsx | ✅ 可复用 | UI 完整，需替换 Mock 数据 |
| 收货入库列表 | ReceivingList.tsx | ✅ 可复用 | UI 完整，需替换 Mock 数据 |
| 收货入库详情 | ReceivingDetail.tsx | ✅ 可复用 | UI 完整，需替换 Mock 数据 |
| 调拨管理 | TransferManagePage.tsx | ✅ 可复用 | UI 完整，需替换 Mock 数据 |
| 异常/短缺/拒收登记 | - | ❌ 不存在 | 需新建或在收货入库流程中集成 |
| 入库单历史/查询 | ReceivingList.tsx | ✅ 复用 | 同收货入库列表 |

### 详细分析

#### 1. 供应商管理 (Out of Scope - 但前端 UI 已存在)

**位置**: `frontend/src/pages/procurement/SupplierList.tsx`, `SupplierDetail.tsx`

**现状**:
- UI 组件完整，支持列表、搜索、新建/编辑 Modal
- 使用 Mock 数据 (lines 56-118)
- 类型定义完整 (`types/supplier.ts`)

**本期处理**: 根据 spec Out of Scope，供应商管理不在本期范围内，前端 UI 保持现状。

---

#### 2. 采购订单 (PO)

**位置**: `frontend/src/pages/procurement/PurchaseOrders.tsx`, `PurchaseOrderList.tsx`

**现状 - PurchaseOrderList.tsx**:
- ✅ 完整的列表 UI，支持状态筛选、分页
- ❌ 使用 Mock 数据 (line 34-35)
- ✅ 类型定义完整 (`types/purchase.ts`)

**现状 - PurchaseOrders.tsx (新建)**:
- ✅ 基础表单：供应商、门店、备注字段
- ⚠️ **缺失关键功能**: 采购明细（SKU 选择、数量、单价）显示 "采购明细功能开发中" (line 130)
- ❌ 无 API 集成

**后端需求**: 需实现 JPA 实体和 Repository

---

#### 3. 收货入库

**位置**:
- `frontend/src/pages/procurement/ReceivingForm.tsx` (新建)
- `frontend/src/pages/procurement/ReceivingList.tsx` (列表)
- `frontend/src/pages/procurement/ReceivingDetail.tsx` (详情)

**现状**:
- ✅ ReceivingForm: 完整的收货入库表单，支持明细表格、质检状态
- ✅ ReceivingList: 完整的列表 UI，支持状态筛选、统计卡片
- ✅ ReceivingDetail: 完整的详情页，包含操作时间线
- ❌ 全部使用 Mock 数据
- ✅ 类型定义完整 (`types/receipt.ts`)

**后端需求**: 需实现 JPA 实体和 Repository，关键是库存更新逻辑

---

#### 4. 调拨管理

**位置**: `frontend/src/pages/procurement/TransferManagePage.tsx`

**现状**:
- ✅ 完整的调拨管理 UI（列表、新建、编辑、详情）
- ✅ 使用 Zustand store (`transferStore`)
- ❌ Mock 数据

**本期处理**: 调拨管理不在本期核心范围，但 UI 已存在，可作为后续迭代。

---

#### 5. 异常/短缺/拒收/报损登记

**现状**: ❌ 未找到独立组件

**处理方案**: 在收货入库流程中集成，通过 `qualityStatus` 字段处理异常情况

---

### 后端实现优先级

基于前端复用分析，后端 JPA 实现优先级如下：

1. **P0 - 核心实体** (本期必须)
   - `PurchaseOrderEntity` + `PurchaseOrderItemEntity` (JPA)
   - `GoodsReceiptEntity` + `GoodsReceiptItemEntity` (JPA)
   - `StoreInventoryEntity` 库存更新逻辑

2. **P1 - API 端点** (本期必须)
   - POST/GET/PUT `/api/purchase-orders` - 采购订单 CRUD
   - POST/GET `/api/goods-receipts` - 收货入库 CRUD
   - 收货时自动更新 `store_inventory` 表

3. **P2 - 增强功能** (后续迭代)
   - 供应商管理 API
   - 调拨管理 API
   - 异常登记独立模块

### 前端改造工作

| 组件 | 改造内容 | 工作量 |
|------|---------|-------|
| PurchaseOrders.tsx | 完成采购明细 SKU 选择器 | 中 |
| PurchaseOrderList.tsx | 替换 Mock → API | 小 |
| ReceivingForm.tsx | 替换 Mock → API | 小 |
| ReceivingList.tsx | 替换 Mock → API | 小 |
| ReceivingDetail.tsx | 替换 Mock → API | 小 |
