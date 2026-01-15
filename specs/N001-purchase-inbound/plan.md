# Implementation Plan: 采购入库模块

**Branch**: `feat/N001-purchase-inbound` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/N001-purchase-inbound/spec.md`

## Summary

为影院商品管理系统实现完整的采购入库模块，包括采购订单管理（创建、审批、跟踪）和收货入库功能。该模块解决新 SKU 无法入库的问题，收货入库时自动创建或更新库存记录。

**技术方案**：
- **后端**：Spring Boot 3.x + JPA (用户指定) + Supabase PostgreSQL
- **前端**：复用现有 UI 组件，替换 Mock 数据为 API 调用
- **核心功能**：采购订单 CRUD、收货入库、库存自动更新

## Technical Context

**Language/Version**:
- B端（管理后台）: TypeScript 5.9.3 + React 19.2.0 (frontend), Java 17 + Spring Boot 3.x (backend)

**Primary Dependencies**:
- B端: Ant Design 6.1.0, Zustand 5.0.9, TanStack Query 5.90.12, React Router 7.10.1
- 后端: Spring Data JPA, Supabase PostgreSQL, Maven

**Storage**: Supabase PostgreSQL 作为主要后端数据源，使用 JPA 直接访问数据库

**Testing**:
- B端: Vitest (unit tests) + Playwright (e2e tests) + Testing Library
- 后端: JUnit + Mockito

**Target Platform**:
- B端: Web browser (Chrome, Firefox, Safari, Edge) + Spring Boot backend API

**Project Type**:
- Full-stack web application (Spring Boot backend + React frontend for B端 admin interface)

**Performance Goals**:
- B端: <3s app startup, <500ms page transitions, support 1000+ list items with virtual scrolling
- API: P95 响应时间 ≤ 1s

**Constraints**:
- 后端数据访问必须使用 JPA（用户指定）
- 复用现有 Inventory 实体关系（Inventory ↔ Sku, Inventory ↔ StoreEntity）
- 遵循项目现有的 Entity/Repository/Service/Controller 分层架构

**Scale/Scope**:
- B端: 采购入库模块，约 5 个页面（订单列表、订单详情、新建订单、收货入库、收货详情）
- 约 4 个 JPA 实体（PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem）
- 约 8 个 API 端点

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `feat/N001-purchase-inbound` 中的 specId `N001` 等于 active_spec 指向路径 `N001-purchase-inbound` 中的 specId
- [x] **测试驱动开发**: 关键业务流程（订单创建、收货入库、库存更新）必须先编写测试
- [x] **组件化架构**: 前端复用现有组件（ReceivingForm, ReceivingList, PurchaseOrderList），遵循原子设计理念
- [x] **前端技术栈分层**: B端使用 React + Ant Design，无 C端 需求
- [x] **数据驱动状态管理**: 使用 Zustand + TanStack Query 管理状态
- [x] **代码质量工程化**: 所有新增代码必须包含 `@spec N001-purchase-inbound` 标识
- [x] **后端技术栈约束**: 后端使用 Spring Boot + JPA 直连 Supabase PostgreSQL

### 性能与标准检查：
- [x] **性能标准**: API P95 ≤ 1s，页面切换 < 500ms
- [x] **安全标准**: 使用 Zod 数据验证，防止 XSS；B端暂不实现认证授权
- [x] **可访问性标准**: 复用现有 Ant Design 组件，已符合 WCAG 2.1 AA

## Project Structure

### Documentation (this feature)

```text
specs/N001-purchase-inbound/
├── plan.md              # This file
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output - JPA entities
├── quickstart.md        # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec validation checklist (completed)
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI 3.0 specification
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/src/main/java/com/cinema/
├── procurement/                    # NEW: 采购入库模块
│   ├── entity/
│   │   ├── PurchaseOrderEntity.java      # 采购订单主表
│   │   ├── PurchaseOrderItemEntity.java  # 采购订单明细
│   │   ├── GoodsReceiptEntity.java       # 收货入库单
│   │   └── GoodsReceiptItemEntity.java   # 收货入库明细
│   ├── repository/
│   │   ├── PurchaseOrderRepository.java
│   │   ├── PurchaseOrderItemRepository.java
│   │   ├── GoodsReceiptRepository.java
│   │   └── GoodsReceiptItemRepository.java
│   ├── service/
│   │   ├── PurchaseOrderService.java     # 订单业务逻辑
│   │   └── GoodsReceiptService.java      # 收货入库+库存更新
│   ├── controller/
│   │   ├── PurchaseOrderController.java
│   │   └── GoodsReceiptController.java
│   └── dto/
│       ├── PurchaseOrderDTO.java
│       ├── PurchaseOrderItemDTO.java
│       ├── GoodsReceiptDTO.java
│       └── CreateGoodsReceiptRequest.java

frontend/src/
├── features/procurement/           # 采购入库模块（复用现有）
│   ├── hooks/
│   │   ├── usePurchaseOrders.ts    # TanStack Query hooks (需创建)
│   │   └── useGoodsReceipts.ts
│   ├── services/
│   │   ├── purchaseOrderApi.ts     # API 调用服务 (需创建)
│   │   └── goodsReceiptApi.ts
│   └── types/
│       └── index.ts                # 类型定义更新
├── pages/procurement/              # 现有页面（需改造）
│   ├── PurchaseOrders.tsx          # 需完善采购明细 SKU 选择器
│   ├── PurchaseOrderList.tsx       # 替换 Mock → API
│   ├── ReceivingForm.tsx           # 替换 Mock → API
│   ├── ReceivingList.tsx           # 替换 Mock → API
│   └── ReceivingDetail.tsx         # 替换 Mock → API
```

**Structure Decision**:
- 后端新增 `procurement` 模块，与现有 `inventory` 模块解耦但共享 Inventory 实体
- 前端复用现有 UI 组件，仅需替换 Mock 数据源为 API 调用
- 收货入库时调用 `inventory` 模块的库存更新服务

## Existing Code References

### 关键复用代码

| 文件 | 用途 | 复用方式 |
|------|------|---------|
| `Inventory.java` | 库存实体 | 收货入库时更新 on_hand_qty, available_qty |
| `StoreInventoryJpaRepository.java` | 库存查询 | 查询 SKU+门店 组合是否已有库存 |
| `Sku.java` | SKU 实体 | 采购明细关联 SKU |
| `StoreEntity.java` | 门店实体 | 采购订单/收货单关联门店 |

### 前端复用组件

| 组件 | 位置 | 改造内容 |
|------|------|---------|
| PurchaseOrders.tsx | pages/procurement | 完成采购明细 SKU 选择器（line 130 显示"开发中"）|
| PurchaseOrderList.tsx | pages/procurement | 替换 Mock 数据（lines 34-233）|
| ReceivingForm.tsx | pages/procurement | 替换 Mock 数据（lines 64-102）|
| ReceivingList.tsx | pages/procurement | 替换 Mock 数据（lines 39-318）|
| ReceivingDetail.tsx | pages/procurement | 替换 Mock 数据（lines 65-175）|

## Complexity Tracking

| 决策 | 原因 | 被拒绝的更简单方案 |
|------|------|-------------------|
| 新增 procurement 模块 | 采购入库是独立领域，避免污染 inventory 模块 | 直接在 inventory 模块添加代码（职责不清） |
| JPA 实体关联 | 用户明确要求使用 JPA | 继续使用 Supabase REST API（用户拒绝） |

## Phase 0 Research Items

以下问题需要在 research.md 中解决：

1. **数据库表结构**: 确认 purchase_orders, purchase_order_items, goods_receipts, goods_receipt_items 表是否已存在
2. **供应商数据**: 确认 suppliers 表结构和现有数据
3. **订单号生成策略**: 确认 PostgreSQL sequence 或 UUID 策略
4. **乐观锁实现**: 确认并发收货场景的锁机制

## Next Steps

1. 执行 Phase 0 Research - 研究现有数据库表结构
2. 生成 data-model.md - 定义 JPA 实体
3. 生成 contracts/api.yaml - OpenAPI 3.0 规范
4. 生成 quickstart.md - 开发指南
5. 执行 /speckit.tasks 生成任务列表
