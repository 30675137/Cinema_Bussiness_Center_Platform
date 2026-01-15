# N001-purchase-inbound 功能验证文档

**@spec N001-purchase-inbound**
**版本**: 1.1.0
**创建日期**: 2026-01-11
**最后更新**: 2026-01-11
**状态**: 功能验证完成

---

## 1. 功能概述

采购入库模块 (N001-purchase-inbound) 为影院商品管理系统提供完整的采购入库管理功能，覆盖从采购订单创建到商品入库的全流程。

### 1.1 核心功能

| 功能模块 | 描述 |
|---------|------|
| 采购订单管理 | 创建、查询、编辑、删除采购订单 |
| 订单审批流程 | 提交审核、审批通过、审批拒绝 |
| 收货入库 | 基于已审核订单创建收货单，确认收货更新库存 |
| 订单跟踪 | 状态变更历史、订单统计摘要、待审批列表 |

### 1.2 状态流转图

```
┌─────────┐    提交审核    ┌──────────────┐    审批通过    ┌──────────┐
│  DRAFT  │ ───────────→ │ PENDING_APPROVAL │ ──────────→ │ APPROVED │
│  草稿   │              │    待审核      │              │  已审核   │
└─────────┘              └──────────────┘              └──────────┘
     │                         │                           │
     │                         │ 审批拒绝                    │ 部分收货
     │                         ↓                           ↓
     │                   ┌──────────┐              ┌──────────────┐
     │                   │ REJECTED │              │ PARTIAL_RECEIVED │
     │                   │  已拒绝   │              │   部分收货    │
     │                   └──────────┘              └──────────────┘
     │                                                    │
     │                                                    │ 全部收货
     │                                                    ↓
     │                                            ┌──────────────┐
     │                                            │ FULLY_RECEIVED │
     │                                            │   全部收货    │
     │                                            └──────────────┘
     │                                                    │
     │                                                    │ 关闭
     │                                                    ↓
     │                                              ┌────────┐
     └─────────────── 删除 ──────────────────────→ │ CLOSED │
                                                   │  已关闭 │
                                                   └────────┘
```

---

## 2. 后端 API 端点清单

### 2.1 采购订单 API (`/api/purchase-orders`)

| 方法 | 端点 | 描述 | 状态码 |
|------|------|------|--------|
| GET | `/api/purchase-orders` | 获取采购订单列表 | 200 |
| GET | `/api/purchase-orders/{id}` | 获取采购订单详情 | 200, 404 |
| POST | `/api/purchase-orders` | 创建采购订单 | 201, 400 |
| DELETE | `/api/purchase-orders/{id}` | 删除采购订单（仅草稿） | 204, 400, 404 |
| POST | `/api/purchase-orders/{id}/submit` | 提交审核 | 200, 400 |
| POST | `/api/purchase-orders/{id}/approve` | 审批通过 | 200, 400 |
| POST | `/api/purchase-orders/{id}/reject` | 审批拒绝 | 200, 400 |
| GET | `/api/purchase-orders/{id}/history` | 获取状态变更历史 | 200 |
| GET | `/api/purchase-orders/summary` | 获取订单统计摘要 | 200 |
| GET | `/api/purchase-orders/pending-approval` | 获取待审批订单列表 | 200 |

### 2.2 收货入库 API (`/api/goods-receipts`)

| 方法 | 端点 | 描述 | 状态码 |
|------|------|------|--------|
| GET | `/api/goods-receipts` | 获取收货入库单列表 | 200 |
| GET | `/api/goods-receipts/{id}` | 获取收货入库单详情 | 200, 404 |
| POST | `/api/goods-receipts` | 创建收货入库单 | 201, 400 |
| POST | `/api/goods-receipts/{id}/confirm` | 确认收货 | 200, 400 |
| POST | `/api/goods-receipts/{id}/cancel` | 取消收货单 | 200, 400 |

### 2.3 供应商 API (`/api/suppliers`)

| 方法 | 端点 | 描述 | 状态码 |
|------|------|------|--------|
| GET | `/api/suppliers` | 获取供应商列表 | 200 |

---

## 3. 验证测试用例

### 3.1 US1 - 采购订单创建

#### TC-001: 创建采购订单成功

**前置条件**:
- 系统中存在有效供应商
- 系统中存在有效门店
- 系统中存在有效 SKU

**请求**:
```bash
curl -X POST http://localhost:8080/api/purchase-orders \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "<supplier-uuid>",
    "storeId": "<store-uuid>",
    "plannedArrivalDate": "2026-01-20",
    "remarks": "测试采购订单",
    "items": [
      {
        "skuId": "<sku-uuid-1>",
        "quantity": 100,
        "unitPrice": 10.50
      },
      {
        "skuId": "<sku-uuid-2>",
        "quantity": 50,
        "unitPrice": 25.00
      }
    ]
  }'
```

**预期响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "<generated-uuid>",
    "orderNumber": "PO202601110001",
    "status": "DRAFT",
    "totalAmount": 2300.00,
    "version": 0
  },
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 201
- [ ] `orderNumber` 符合格式 `PO + 日期 + 序号`
- [ ] `status` 为 `DRAFT`
- [ ] `totalAmount` = 100 * 10.50 + 50 * 25.00 = 2300.00
- [ ] `version` 为 0

---

#### TC-002: 创建采购订单 - 缺少必填字段

**请求**:
```bash
curl -X POST http://localhost:8080/api/purchase-orders \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "<supplier-uuid>",
    "items": []
  }'
```

**预期响应** (400 Bad Request):
```json
{
  "success": false,
  "error": "PO_VAL_001",
  "message": "storeId: 门店ID不能为空, items: 订单明细不能为空",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 400
- [ ] `success` 为 `false`
- [ ] `error` 包含错误编号
- [ ] `message` 说明缺失的字段

---

#### TC-003: 提交采购订单审核

**前置条件**:
- 存在状态为 `DRAFT` 的采购订单

**请求**:
```bash
curl -X POST http://localhost:8080/api/purchase-orders/<order-id>/submit
```

**预期响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "<order-id>",
    "status": "PENDING_APPROVAL"
  },
  "message": "提交审核成功",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 200
- [ ] `status` 变为 `PENDING_APPROVAL`
- [ ] 状态变更历史记录被创建 (可通过 `/history` 接口验证)

---

#### TC-004: 提交非草稿状态订单 - 失败

**前置条件**:
- 存在状态为 `APPROVED` 的采购订单

**请求**:
```bash
curl -X POST http://localhost:8080/api/purchase-orders/<order-id>/submit
```

**预期响应** (400 Bad Request):
```json
{
  "success": false,
  "error": "PO_BIZ_001",
  "message": "只有草稿状态的订单才能提交审核",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 400
- [ ] `error` 为业务错误编号

---

### 3.2 US2 - 收货入库

#### TC-005: 创建收货入库单成功

**前置条件**:
- 存在状态为 `APPROVED` 的采购订单

**请求**:
```bash
curl -X POST http://localhost:8080/api/goods-receipts \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseOrderId": "<order-id>",
    "remarks": "首批收货",
    "items": [
      {
        "skuId": "<sku-uuid-1>",
        "receivedQty": 80,
        "qualityStatus": "QUALIFIED"
      },
      {
        "skuId": "<sku-uuid-2>",
        "receivedQty": 50,
        "qualityStatus": "QUALIFIED"
      }
    ]
  }'
```

**预期响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "<generated-uuid>",
    "receiptNumber": "GR202601110001",
    "status": "PENDING"
  },
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 201
- [ ] `receiptNumber` 符合格式 `GR + 日期 + 序号`
- [ ] `status` 为 `PENDING`

---

#### TC-006: 确认收货 - 库存更新

**前置条件**:
- 存在状态为 `PENDING` 的收货入库单
- SKU-1 在目标门店没有库存记录（测试新建）
- SKU-2 在目标门店已有库存记录（测试累加）

**请求**:
```bash
curl -X POST http://localhost:8080/api/goods-receipts/<receipt-id>/confirm
```

**预期响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "<receipt-id>",
    "status": "CONFIRMED",
    "receivedAt": "2026-01-11T10:30:00Z"
  },
  "message": "收货确认成功，库存已更新",
  "timestamp": "2026-01-11T10:30:00Z"
}
```

**数据库验证**:
```sql
-- 验证新 SKU 库存记录被创建
SELECT * FROM store_inventory
WHERE store_id = '<store-id>' AND sku_id = '<sku-uuid-1>';

-- 验证 on_hand_qty = 80, available_qty = 80

-- 验证已有 SKU 库存数量增加
SELECT * FROM store_inventory
WHERE store_id = '<store-id>' AND sku_id = '<sku-uuid-2>';

-- 验证 on_hand_qty 和 available_qty 增加了 50
```

**验证点**:
- [ ] 返回状态码 200
- [ ] `status` 变为 `CONFIRMED`
- [ ] `receivedAt` 被设置
- [ ] 新 SKU 库存记录被创建
- [ ] 已有 SKU 库存数量增加
- [ ] 采购订单状态更新（全部收货 → `FULLY_RECEIVED`，部分收货 → `PARTIAL_RECEIVED`）

---

#### TC-007: 部分收货 - 订单状态更新

**前置条件**:
- 采购订单包含 SKU-1 数量 100
- 本次收货仅收 60

**请求**:
```bash
curl -X POST http://localhost:8080/api/goods-receipts \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseOrderId": "<order-id>",
    "items": [
      {
        "skuId": "<sku-uuid-1>",
        "receivedQty": 60,
        "qualityStatus": "QUALIFIED"
      }
    ]
  }'
```

**验证点**:
- [ ] 收货单创建成功
- [ ] 确认收货后，采购订单状态变为 `PARTIAL_RECEIVED`
- [ ] 订单明细中 `receivedQty` = 60，`pendingQty` = 40

---

### 3.3 US3 - 采购订单跟踪

#### TC-008: 获取订单状态变更历史

**前置条件**:
- 存在经历了多次状态变更的采购订单

**请求**:
```bash
curl -X GET http://localhost:8080/api/purchase-orders/<order-id>/history
```

**预期响应** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "<history-id-1>",
      "fromStatus": null,
      "toStatus": "DRAFT",
      "changedByName": "系统",
      "remarks": null,
      "createdAt": "2026-01-11T09:00:00Z"
    },
    {
      "id": "<history-id-2>",
      "fromStatus": "DRAFT",
      "toStatus": "PENDING_APPROVAL",
      "changedByName": "张三",
      "remarks": null,
      "createdAt": "2026-01-11T09:30:00Z"
    },
    {
      "id": "<history-id-3>",
      "fromStatus": "PENDING_APPROVAL",
      "toStatus": "APPROVED",
      "changedByName": "李四",
      "remarks": null,
      "createdAt": "2026-01-11T10:00:00Z"
    }
  ],
  "timestamp": "2026-01-11T10:30:00Z"
}
```

**验证点**:
- [ ] 返回完整的状态变更历史
- [ ] 按时间顺序排列
- [ ] `fromStatus` 首条记录为 `null`

---

#### TC-009: 获取订单统计摘要

**请求**:
```bash
curl -X GET "http://localhost:8080/api/purchase-orders/summary?storeId=<store-id>"
```

**预期响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "draftCount": 5,
    "pendingApprovalCount": 3,
    "approvedCount": 10,
    "partialReceivedCount": 2
  },
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 各状态计数正确
- [ ] 支持按门店筛选

---

### 3.4 US4 - 采购订单审批

#### TC-010: 审批通过

**前置条件**:
- 存在状态为 `PENDING_APPROVAL` 的采购订单

**请求**:
```bash
curl -X POST http://localhost:8080/api/purchase-orders/<order-id>/approve
```

**预期响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "<order-id>",
    "status": "APPROVED",
    "approvedAt": "2026-01-11T10:00:00Z"
  },
  "message": "审批通过",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 200
- [ ] `status` 变为 `APPROVED`
- [ ] `approvedAt` 被设置
- [ ] 状态变更历史被记录

---

#### TC-011: 审批拒绝

**前置条件**:
- 存在状态为 `PENDING_APPROVAL` 的采购订单

**请求**:
```bash
curl -X POST http://localhost:8080/api/purchase-orders/<order-id>/reject \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "价格超出预算"
  }'
```

**预期响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "<order-id>",
    "status": "REJECTED",
    "rejectionReason": "价格超出预算"
  },
  "message": "已拒绝",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 200
- [ ] `status` 变为 `REJECTED`
- [ ] `rejectionReason` 被保存
- [ ] 状态变更历史包含拒绝原因

---

#### TC-012: 审批拒绝 - 缺少原因

**请求**:
```bash
curl -X POST http://localhost:8080/api/purchase-orders/<order-id>/reject \
  -H "Content-Type: application/json" \
  -d '{}'
```

**预期响应** (400 Bad Request):
```json
{
  "success": false,
  "error": "PO_VAL_001",
  "message": "拒绝原因不能为空",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 400
- [ ] 提示拒绝原因为必填

---

### 3.5 异常处理

#### TC-013: 乐观锁冲突

**前置条件**:
- 用户 A 和用户 B 同时获取同一订单（version = 0）
- 用户 A 先提交更新（version 变为 1）
- 用户 B 再提交更新（version 仍为 0）

**预期响应** (409 Conflict):
```json
{
  "success": false,
  "error": "PO_BIZ_002",
  "message": "数据已被其他用户修改，请刷新后重试",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 409
- [ ] 错误信息提示刷新重试

---

#### TC-014: 资源不存在

**请求**:
```bash
curl -X GET http://localhost:8080/api/purchase-orders/00000000-0000-0000-0000-000000000000
```

**预期响应** (404 Not Found):
```json
{
  "success": false,
  "error": "PO_NTF_001",
  "message": "采购订单不存在",
  "timestamp": "2026-01-11T10:00:00Z"
}
```

**验证点**:
- [ ] 返回状态码 404
- [ ] 错误编号为 `PO_NTF_001`

---

## 4. 前端验证项

### 4.1 TanStack Query Hooks

| Hook | 功能 | 验证方法 | 状态 |
|------|------|---------|------|
| `usePurchaseOrders` | 获取采购订单列表 | 页面加载后数据正确显示 | ✅ 已验证 |
| `usePurchaseOrder` | 获取单个订单详情 | 点击订单后详情正确加载 | ✅ 已验证 |
| `useCreatePurchaseOrder` | 创建采购订单 | 提交表单后订单创建成功 | ✅ 已验证 |
| `useDeletePurchaseOrder` | 删除采购订单 | 删除后列表自动刷新 | ✅ 已验证 |
| `useSubmitPurchaseOrder` | 提交审核 | 状态变更后 UI 更新 | ✅ 已验证 |
| `useApprovePurchaseOrder` | 审批通过 | 审批后状态变更 | ✅ 已验证 |
| `useRejectPurchaseOrder` | 审批拒绝 | 需填写原因，拒绝后状态变更 | ✅ 已验证 |
| `useGoodsReceipts` | 获取收货入库单列表 | 列表数据正确 | ✅ 已验证 |
| `useGoodsReceipt` | 获取收货单详情 | 详情数据正确 | ✅ 已验证 |
| `useCreateGoodsReceipt` | 创建收货单 | 基于订单创建成功 | ✅ 已验证 (2026-01-11) |
| `useConfirmGoodsReceipt` | 确认收货 | 库存更新提示显示 | ✅ 已验证 |
| `useCancelGoodsReceipt` | 取消收货单 | 状态变更后 UI 更新 | ✅ 已验证 |
| `usePurchaseOrderHistory` | 获取状态历史 | 时间线正确显示 | ✅ 已验证 |
| `usePurchaseOrderSummary` | 获取统计摘要 | 数字卡片正确显示 | ✅ 已验证 |
| `usePendingApprovalOrders` | 获取待审批列表 | 审批列表正确 | ✅ 已验证 |

### 4.2 UI 交互验证

- [x] 采购订单列表支持分页
- [x] 采购订单列表支持按状态筛选
- [x] 采购订单列表支持按门店筛选
- [x] 采购订单列表支持按供应商筛选 (2026-01-11 修复 JPQL 查询)
- [x] 新建订单表单验证（必填字段）
- [x] 订单明细支持添加多个 SKU
- [x] 订单金额实时计算
- [x] 状态变更后 UI 自动刷新
- [x] 收货入库支持部分收货
- [x] 质检状态可选择（合格/不合格/待检验）
- [x] 拒绝原因弹窗必填验证
- [x] 收货入库单创建成功后跳转列表页 (2026-01-11 修复)
- [x] 收货入库列表显示真实 API 数据 (2026-01-11 修复)

---

## 5. 数据库验证 SQL

### 5.1 验证采购订单创建

```sql
-- 验证订单主表
SELECT
  id, order_number, status, total_amount, version, created_at
FROM purchase_orders
WHERE order_number = 'PO202601110001';

-- 验证订单明细
SELECT
  poi.id, s.name as sku_name, poi.quantity, poi.unit_price, poi.line_amount
FROM purchase_order_items poi
JOIN sku s ON poi.sku_id = s.id
WHERE poi.purchase_order_id = '<order-id>';
```

### 5.2 验证状态变更历史

```sql
SELECT
  from_status, to_status, changed_by_name, remarks, created_at
FROM purchase_order_status_history
WHERE purchase_order_id = '<order-id>'
ORDER BY created_at;
```

### 5.3 验证库存更新

```sql
-- 收货前
SELECT on_hand_qty, available_qty
FROM store_inventory
WHERE store_id = '<store-id>' AND sku_id = '<sku-id>';

-- 收货后（应增加收货数量）
SELECT on_hand_qty, available_qty
FROM store_inventory
WHERE store_id = '<store-id>' AND sku_id = '<sku-id>';
```

### 5.4 验证收货入库单

```sql
-- 收货单主表
SELECT
  id, receipt_number, status, received_at
FROM goods_receipts
WHERE purchase_order_id = '<order-id>';

-- 收货明细
SELECT
  gri.id, s.name as sku_name, gri.ordered_qty, gri.received_qty, gri.quality_status
FROM goods_receipt_items gri
JOIN sku s ON gri.sku_id = s.id
WHERE gri.goods_receipt_id = '<receipt-id>';
```

---

## 6. 错误码清单

| 错误码 | HTTP 状态码 | 描述 |
|-------|------------|------|
| `PO_VAL_001` | 400 | 参数校验失败 |
| `PO_NTF_001` | 404 | 资源不存在 |
| `PO_BIZ_001` | 400 | 业务规则冲突（状态不允许操作） |
| `PO_BIZ_002` | 409 | 乐观锁冲突（并发修改） |
| `PO_SYS_001` | 500 | 系统内部错误 |

---

## 7. 性能验收标准

| 指标 | 标准 | 验证方法 |
|------|------|---------|
| 订单列表加载 | ≤ 2 秒 | 计时器或 Network 面板 |
| 订单创建响应 | ≤ 1 秒 | API 响应时间 |
| 收货确认（含库存更新） | ≤ 5 秒 | API 响应时间 |
| 并发处理 | 50 个订单/秒 | 压力测试 |

---

## 8. 验证执行记录

| 测试用例 | 执行日期 | 执行人 | 结果 | 备注 |
|---------|---------|--------|------|------|
| TC-001 | 2026-01-11 | Claude | ✅ Pass | 创建订单成功 |
| TC-002 | 2026-01-11 | Claude | ✅ Pass | 验证缺少必填字段返回400 |
| TC-003 | 2026-01-11 | Claude | ✅ Pass | 提交审核状态变更正常 |
| TC-004 | 2026-01-11 | Claude | ✅ Pass | 非草稿状态提交被拒绝 |
| TC-005 | 2026-01-11 | Claude | ✅ Pass | 收货入库单创建成功 |
| TC-006 | 2026-01-11 | Claude | ✅ Pass | 确认收货后库存更新 |
| TC-007 | 2026-01-11 | Claude | ✅ Pass | 部分收货订单状态更新 |
| TC-008 | 2026-01-11 | Claude | ✅ Pass | 状态历史记录完整 |
| TC-009 | 2026-01-11 | Claude | ✅ Pass | 统计摘要数据正确 |
| TC-010 | 2026-01-11 | Claude | ✅ Pass | 审批通过流程正常 |
| TC-011 | 2026-01-11 | Claude | ✅ Pass | 审批拒绝流程正常 |
| TC-012 | 2026-01-11 | Claude | ✅ Pass | 拒绝必填原因验证 |
| TC-013 | - | - | ⏳ Pending | 待进行压力测试 |
| TC-014 | 2026-01-11 | Claude | ✅ Pass | 404资源不存在验证 |

---

## 9. 附录

### 9.1 相关文件清单

**后端**:
- `backend/src/main/java/com/cinema/procurement/entity/` - JPA 实体
- `backend/src/main/java/com/cinema/procurement/repository/` - 数据仓库
- `backend/src/main/java/com/cinema/procurement/service/` - 业务服务
- `backend/src/main/java/com/cinema/procurement/controller/` - API 控制器
- `backend/src/main/java/com/cinema/procurement/dto/` - 数据传输对象
- `backend/src/main/java/com/cinema/procurement/exception/` - 异常处理
- `backend/src/main/resources/db/migration/V2026_01_11_*` - 数据库迁移

**前端**:
- `frontend/src/features/procurement/types/` - TypeScript 类型
- `frontend/src/features/procurement/services/` - API 服务
- `frontend/src/features/procurement/hooks/` - TanStack Query Hooks
- `frontend/src/features/procurement/index.ts` - 模块入口

### 9.2 API 契约文档

完整 OpenAPI 3.0 规范请参考: `specs/N001-purchase-inbound/contracts/api.yaml`

---

**文档维护人**: Claude Code
**最后更新**: 2026-01-11
