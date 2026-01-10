# Tasks: 采购入库模块

**Spec**: N001-purchase-inbound
**Generated**: 2026-01-11
**Total Tasks**: 42

## Overview

### User Stories
| ID | Priority | Story | Tasks |
|----|----------|-------|-------|
| US1 | P1 | 采购订单创建 | 12 |
| US2 | P1 | 收货入库 | 10 |
| US3 | P2 | 采购订单跟踪 | 8 |
| US4 | P2 | 采购订单审批 | 6 |

### MVP Scope
- Phase 1: Setup
- Phase 2: Foundational
- Phase 3: US1 采购订单创建

---

## Phase 1: Setup

**Goal**: 项目初始化和数据库迁移

- [ ] T001 创建 Flyway 迁移脚本 `backend/src/main/resources/db/migration/V2026_01_11_001__create_procurement_tables.sql`
- [ ] T002 创建 procurement 模块目录结构 `backend/src/main/java/com/cinema/procurement/`
- [ ] T003 创建枚举类型 PurchaseOrderStatus, GoodsReceiptStatus, QualityStatus, SupplierStatus `backend/src/main/java/com/cinema/procurement/entity/`

---

## Phase 2: Foundational

**Goal**: 创建基础实体和仓库，为所有用户故事提供共享基础设施

- [ ] T004 [P] 创建 SupplierEntity 实体类 `backend/src/main/java/com/cinema/procurement/entity/SupplierEntity.java`
- [ ] T005 [P] 创建 SupplierRepository 接口 `backend/src/main/java/com/cinema/procurement/repository/SupplierRepository.java`
- [ ] T006 [P] 创建 SupplierDTO 和 SupplierMapper `backend/src/main/java/com/cinema/procurement/dto/`
- [ ] T007 创建 SupplierService 服务层 `backend/src/main/java/com/cinema/procurement/service/SupplierService.java`
- [ ] T008 创建 SupplierController 控制器 `backend/src/main/java/com/cinema/procurement/controller/SupplierController.java`
- [ ] T009 创建前端 API 服务基础配置 `frontend/src/features/procurement/services/apiClient.ts`

---

## Phase 3: US1 采购订单创建

**Goal**: 门店采购人员可以创建采购订单，选择供应商和商品，设置采购数量和单价

**User Story**: 作为门店采购人员，我希望能够创建采购订单，以便向供应商订购门店所需的商品

### Backend Tasks

- [ ] T010 [US1] 创建 PurchaseOrderEntity 实体类 `backend/src/main/java/com/cinema/procurement/entity/PurchaseOrderEntity.java`
- [ ] T011 [US1] 创建 PurchaseOrderItemEntity 实体类 `backend/src/main/java/com/cinema/procurement/entity/PurchaseOrderItemEntity.java`
- [ ] T012 [P] [US1] 创建 PurchaseOrderRepository 接口 `backend/src/main/java/com/cinema/procurement/repository/PurchaseOrderRepository.java`
- [ ] T013 [P] [US1] 创建 PurchaseOrderItemRepository 接口 `backend/src/main/java/com/cinema/procurement/repository/PurchaseOrderItemRepository.java`
- [ ] T014 [US1] 创建 PurchaseOrderDTO 和相关 DTO `backend/src/main/java/com/cinema/procurement/dto/PurchaseOrderDTO.java`
- [ ] T015 [US1] 创建 CreatePurchaseOrderRequest DTO `backend/src/main/java/com/cinema/procurement/dto/CreatePurchaseOrderRequest.java`
- [ ] T016 [US1] 实现 PurchaseOrderService 创建订单逻辑 `backend/src/main/java/com/cinema/procurement/service/PurchaseOrderService.java`
- [ ] T017 [US1] 实现 PurchaseOrderController POST /api/purchase-orders `backend/src/main/java/com/cinema/procurement/controller/PurchaseOrderController.java`

### Frontend Tasks

- [ ] T018 [P] [US1] 创建 purchaseOrderApi 服务 `frontend/src/features/procurement/services/purchaseOrderApi.ts`
- [ ] T019 [P] [US1] 创建 usePurchaseOrders Hook `frontend/src/features/procurement/hooks/usePurchaseOrders.ts`
- [ ] T020 [US1] 改造 PurchaseOrders.tsx 完成 SKU 选择器 `frontend/src/pages/procurement/PurchaseOrders.tsx`
- [ ] T021 [US1] 集成测试：创建采购订单完整流程

---

## Phase 4: US2 收货入库

**Goal**: 门店收货人员可以创建收货单，记录实际收货数量和质量状态，确认后自动更新库存

**User Story**: 作为门店收货人员，我希望能够根据采购订单创建收货入库单，以便记录实际到货情况并更新库存

### Backend Tasks

- [ ] T022 [US2] 创建 GoodsReceiptEntity 实体类 `backend/src/main/java/com/cinema/procurement/entity/GoodsReceiptEntity.java`
- [ ] T023 [US2] 创建 GoodsReceiptItemEntity 实体类 `backend/src/main/java/com/cinema/procurement/entity/GoodsReceiptItemEntity.java`
- [ ] T024 [P] [US2] 创建 GoodsReceiptRepository 接口 `backend/src/main/java/com/cinema/procurement/repository/GoodsReceiptRepository.java`
- [ ] T025 [P] [US2] 创建 GoodsReceiptItemRepository 接口 `backend/src/main/java/com/cinema/procurement/repository/GoodsReceiptItemRepository.java`
- [ ] T026 [US2] 创建 GoodsReceiptDTO 和相关 DTO `backend/src/main/java/com/cinema/procurement/dto/GoodsReceiptDTO.java`
- [ ] T027 [US2] 实现 GoodsReceiptService 含库存更新逻辑 `backend/src/main/java/com/cinema/procurement/service/GoodsReceiptService.java`
- [ ] T028 [US2] 实现 GoodsReceiptController 全部端点 `backend/src/main/java/com/cinema/procurement/controller/GoodsReceiptController.java`

### Frontend Tasks

- [ ] T029 [P] [US2] 创建 goodsReceiptApi 服务 `frontend/src/features/procurement/services/goodsReceiptApi.ts`
- [ ] T030 [P] [US2] 创建 useGoodsReceipts Hook `frontend/src/features/procurement/hooks/useGoodsReceipts.ts`
- [ ] T031 [US2] 改造 ReceivingForm.tsx 替换 Mock 数据 `frontend/src/pages/procurement/ReceivingForm.tsx`
- [ ] T032 [US2] 集成测试：收货入库并验证库存更新

---

## Phase 5: US3 采购订单跟踪

**Goal**: 门店采购人员可以查看采购订单列表和详情，跟踪订单状态和收货进度

**User Story**: 作为门店采购人员，我希望能够查看采购订单列表和详情，以便跟踪订单状态和收货进度

### Backend Tasks

- [ ] T033 [US3] 实现 PurchaseOrderController GET /api/purchase-orders 列表查询 `backend/src/main/java/com/cinema/procurement/controller/PurchaseOrderController.java`
- [ ] T034 [US3] 实现 PurchaseOrderController GET /api/purchase-orders/{id} 详情查询 `backend/src/main/java/com/cinema/procurement/controller/PurchaseOrderController.java`

### Frontend Tasks

- [ ] T035 [US3] 改造 PurchaseOrderList.tsx 替换 Mock 数据 `frontend/src/pages/procurement/PurchaseOrderList.tsx`
- [ ] T036 [US3] 改造 ReceivingList.tsx 替换 Mock 数据 `frontend/src/pages/procurement/ReceivingList.tsx`
- [ ] T037 [US3] 改造 ReceivingDetail.tsx 替换 Mock 数据 `frontend/src/pages/procurement/ReceivingDetail.tsx`
- [ ] T038 [US3] 集成测试：订单列表和详情查询

---

## Phase 6: US4 采购订单审批

**Goal**: 门店管理人员可以审批采购订单，通过或拒绝并填写原因

**User Story**: 作为门店管理人员，我希望能够审批采购订单，以便控制采购支出

### Backend Tasks

- [ ] T039 [US4] 实现 PurchaseOrderController POST /api/purchase-orders/{id}/submit `backend/src/main/java/com/cinema/procurement/controller/PurchaseOrderController.java`
- [ ] T040 [US4] 实现 PurchaseOrderController POST /api/purchase-orders/{id}/approve `backend/src/main/java/com/cinema/procurement/controller/PurchaseOrderController.java`
- [ ] T041 [US4] 实现 PurchaseOrderController POST /api/purchase-orders/{id}/reject `backend/src/main/java/com/cinema/procurement/controller/PurchaseOrderController.java`

### Frontend Tasks

- [ ] T042 [US4] 添加审批操作按钮到 PurchaseOrderList.tsx `frontend/src/pages/procurement/PurchaseOrderList.tsx`

---

## Phase 7: Polish & Cross-cutting

**Goal**: 完善细节、优化性能、添加错误处理

- [ ] T043 添加全局异常处理 BusinessException `backend/src/main/java/com/cinema/procurement/exception/`
- [ ] T044 添加 API 响应格式统一 ApiResponse `backend/src/main/java/com/cinema/common/dto/ApiResponse.java`
- [ ] T045 前端错误处理和 Toast 提示优化
- [ ] T046 端到端测试：完整采购入库流程验证

---

## Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
┌───────────────────────────────────────┐
│  Phase 3 (US1) ──→ Phase 4 (US2)      │
│       ↓                ↓              │
│  Phase 5 (US3)    Phase 6 (US4)       │
└───────────────────────────────────────┘
    ↓
Phase 7 (Polish)
```

**关键依赖说明**:
- US2 (收货入库) 依赖 US1 (采购订单创建)，因为收货单关联采购订单
- US3 (订单跟踪) 可与 US4 (审批) 并行开发
- Phase 7 在所有功能完成后执行

## Parallel Execution Examples

### Phase 2 并行任务
```
T004 (SupplierEntity) ─┬─→ T007 (SupplierService)
T005 (SupplierRepo)   ─┤
T006 (SupplierDTO)    ─┘
```

### Phase 3 并行任务
```
T010-T017 (Backend) ──→ T021 (集成测试)
T018-T019 (Frontend) ──┤
T020 (SKU选择器)     ──┘
```

---

## Implementation Strategy

1. **MVP First**: Phase 1-3 构成最小可行产品，优先完成
2. **Incremental Delivery**: 每个 Phase 完成后可独立测试和演示
3. **Backend First**: 每个 User Story 先完成后端，再完成前端
4. **Test Integration**: 每个 Phase 结束时执行集成测试

---

## Validation Checklist

- [ ] 所有任务包含 `- [ ]` 复选框格式
- [ ] 所有任务包含 Task ID (T001-T046)
- [ ] User Story 相关任务包含 [US#] 标签
- [ ] 可并行任务包含 [P] 标签
- [ ] 所有任务包含文件路径
- [ ] 依赖关系清晰定义
