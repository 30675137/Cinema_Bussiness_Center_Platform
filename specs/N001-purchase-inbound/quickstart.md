# Quickstart: 采购入库模块开发指南

**Spec**: N001-purchase-inbound
**Date**: 2026-01-11

## 开发环境准备

### 1. 启动后端

```bash
cd backend
./mvnw spring-boot:run
```

后端启动后访问: http://localhost:8080

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端启动后访问: http://localhost:3000

### 3. 数据库迁移

确保 Flyway 迁移脚本已创建：

```bash
# 创建迁移文件
# backend/src/main/resources/db/migration/V2026_01_11_001__create_procurement_tables.sql
```

迁移脚本内容见 [data-model.md](./data-model.md) 中的 Flyway Migration Script 部分。

## 后端开发步骤

### Step 1: 创建 Entity 类

位置: `backend/src/main/java/com/cinema/procurement/entity/`

1. `SupplierEntity.java`
2. `PurchaseOrderEntity.java`
3. `PurchaseOrderItemEntity.java`
4. `GoodsReceiptEntity.java`
5. `GoodsReceiptItemEntity.java`

**关键点**:
- 所有文件必须添加 `@spec N001-purchase-inbound` 注释
- 使用 `@Version` 注解实现乐观锁
- 使用 `@ManyToOne(fetch = FetchType.LAZY)` 延迟加载关联

### Step 2: 创建 Repository 接口

位置: `backend/src/main/java/com/cinema/procurement/repository/`

```java
/**
 * @spec N001-purchase-inbound
 */
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrderEntity, UUID> {
    // 见 data-model.md
}
```

### Step 3: 创建 Service 层

位置: `backend/src/main/java/com/cinema/procurement/service/`

核心业务逻辑:

```java
/**
 * @spec N001-purchase-inbound
 */
@Service
public class PurchaseOrderService {

    @Transactional
    public PurchaseOrderDTO create(CreatePurchaseOrderRequest request) {
        // 1. 生成订单号
        String orderNumber = generateOrderNumber();

        // 2. 创建订单
        PurchaseOrderEntity order = new PurchaseOrderEntity();
        order.setOrderNumber(orderNumber);
        order.setStatus(PurchaseOrderStatus.DRAFT);
        // ...

        return mapper.toDTO(repository.save(order));
    }
}
```

### Step 4: 创建 Controller 层

位置: `backend/src/main/java/com/cinema/procurement/controller/`

```java
/**
 * @spec N001-purchase-inbound
 */
@RestController
@RequestMapping("/api/purchase-orders")
public class PurchaseOrderController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrderDTO>>> list(
            @RequestParam(required = false) UUID storeId,
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        // ...
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderDTO>> create(
            @Valid @RequestBody CreatePurchaseOrderRequest request) {
        // ...
    }
}
```

## 前端开发步骤

### Step 1: 创建 API 服务

位置: `frontend/src/features/procurement/services/`

```typescript
// purchaseOrderApi.ts
/** @spec N001-purchase-inbound */

import { apiClient } from '@/services/apiClient';
import type { PurchaseOrder, CreatePurchaseOrderRequest } from '../types';

export const purchaseOrderApi = {
  list: (params: ListParams) =>
    apiClient.get<PurchaseOrderListResponse>('/api/purchase-orders', { params }),

  create: (data: CreatePurchaseOrderRequest) =>
    apiClient.post<PurchaseOrderResponse>('/api/purchase-orders', data),

  getById: (id: string) =>
    apiClient.get<PurchaseOrderDetailResponse>(`/api/purchase-orders/${id}`),

  submit: (id: string) =>
    apiClient.post<PurchaseOrderResponse>(`/api/purchase-orders/${id}/submit`),

  approve: (id: string) =>
    apiClient.post<PurchaseOrderResponse>(`/api/purchase-orders/${id}/approve`),

  reject: (id: string, reason: string) =>
    apiClient.post<PurchaseOrderResponse>(`/api/purchase-orders/${id}/reject`, { reason }),
};
```

### Step 2: 创建 TanStack Query Hooks

位置: `frontend/src/features/procurement/hooks/`

```typescript
// usePurchaseOrders.ts
/** @spec N001-purchase-inbound */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseOrderApi } from '../services/purchaseOrderApi';

export const usePurchaseOrders = (params: ListParams) => {
  return useQuery({
    queryKey: ['purchaseOrders', params],
    queryFn: () => purchaseOrderApi.list(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseOrderApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
};

export const useSubmitPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseOrderApi.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
};
```

### Step 3: 改造现有页面

#### PurchaseOrderList.tsx 改造

```typescript
// 改造前 (Mock 数据)
const [orders, setOrders] = useState<PurchaseOrder[]>(mockOrders);

// 改造后 (TanStack Query)
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';

const { data, isLoading, error } = usePurchaseOrders({
  storeId,
  status,
  page,
  pageSize,
});
```

#### PurchaseOrders.tsx 改造 (新建订单)

需要完成采购明细 SKU 选择器：

```typescript
// 添加 SKU 选择器组件
import { SkuSelector } from '@/components/SkuSelector';

const handleAddItem = (sku: Sku) => {
  setItems([...items, {
    skuId: sku.id,
    skuName: sku.name,
    skuCode: sku.code,
    quantity: 1,
    unitPrice: 0,
  }]);
};
```

## 测试数据

### 测试供应商

| ID | Code | Name |
|----|------|------|
| (auto) | SUP001 | 北京食品供应商 |
| (auto) | SUP002 | 上海饮料批发 |
| (auto) | SUP003 | 广州零食配送 |

### 测试门店

使用现有门店数据（stores 表）

### 测试 SKU

使用现有 SKU 数据（skus 表）

## API 测试

### 创建采购订单

```bash
curl -X POST http://localhost:8080/api/purchase-orders \
  -H "Content-Type: application/json" \
  -d '{
    "supplierId": "供应商UUID",
    "storeId": "门店UUID",
    "plannedArrivalDate": "2026-01-15",
    "items": [
      {
        "skuId": "SKU UUID",
        "quantity": 100,
        "unitPrice": 10.00
      }
    ]
  }'
```

### 提交审核

```bash
curl -X POST http://localhost:8080/api/purchase-orders/{id}/submit
```

### 审批通过

```bash
curl -X POST http://localhost:8080/api/purchase-orders/{id}/approve
```

### 创建收货入库单

```bash
curl -X POST http://localhost:8080/api/goods-receipts \
  -H "Content-Type: application/json" \
  -d '{
    "purchaseOrderId": "采购订单UUID",
    "items": [
      {
        "skuId": "SKU UUID",
        "receivedQty": 50,
        "qualityStatus": "QUALIFIED"
      }
    ]
  }'
```

### 确认收货

```bash
curl -X POST http://localhost:8080/api/goods-receipts/{id}/confirm
```

## 验收标准

### 后端

- [ ] 所有 JPA Entity 创建完成
- [ ] 所有 Repository 接口定义完成
- [ ] PurchaseOrderService 核心逻辑实现
- [ ] GoodsReceiptService 核心逻辑实现（含库存更新）
- [ ] Controller 层 API 端点实现
- [ ] 单元测试覆盖率 ≥ 80%

### 前端

- [ ] API 服务层创建完成
- [ ] TanStack Query Hooks 创建完成
- [ ] PurchaseOrderList 页面改造完成
- [ ] PurchaseOrders 页面 SKU 选择器完成
- [ ] ReceivingForm 页面改造完成
- [ ] ReceivingList 页面改造完成
- [ ] ReceivingDetail 页面改造完成

### 集成测试

- [ ] 创建采购订单 → 提交审核 → 审批通过 完整流程
- [ ] 创建收货入库单 → 确认收货 → 库存更新 完整流程
- [ ] 部分收货场景验证
- [ ] 乐观锁冲突场景验证

## 常见问题

### Q1: 订单号生成冲突

**问题**: 高并发下订单号可能重复

**解决**: 使用 PostgreSQL sequence，确保原子性

### Q2: 库存更新失败

**问题**: 乐观锁冲突导致更新失败

**解决**: 捕获 `OptimisticLockException`，提示用户刷新后重试

### Q3: 前端类型不匹配

**问题**: 后端返回字段与前端类型定义不一致

**解决**: 根据 `contracts/api.yaml` 更新 `types/purchase.ts`

## 下一步

完成开发后，执行 `/speckit.tasks` 生成详细任务列表。
