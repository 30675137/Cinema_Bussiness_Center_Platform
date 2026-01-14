# Quick Start: O012 订单创建时库存预占

**Feature**: O012-order-inventory-reservation  
**Date**: 2026-01-14  

本指南帮助开发者快速上手O012规格的开发和集成工作。

---

## Overview

O012规格实现订单创建时的库存预占机制，**完全复用P005-bom-inventory-deduction的基础设施**。

**核心价值**:
- ✅ 防止库存超卖（行级锁 + 事务保证）
- ✅ 提升用户体验（下单即锁定库存）
- ✅ 降低运营成本（自动释放过期预占）

**工作量**: 3-5天（因P005已实现大部分功能）

---

## Prerequisites

### 1. 技术栈要求

- **Java**: 17+
- **Spring Boot**: 3.x
- **PostgreSQL**: 14+ (通过Supabase)
- **Maven**: 3.8+
- **Node.js**: 18+ (前端开发)
- **React**: 19.2.0 (B端)
- **Taro**: 3.x (C端小程序)

### 2. 依赖规格验证

确认P005规格已完整实施：

```bash
# 检查P005数据库表是否存在
psql $DATABASE_URL -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('store_inventory', 'inventory_reservations', 'bom_snapshots');
"

# 预期输出：3行记录
# store_inventory
# inventory_reservations
# bom_snapshots
```

```bash
# 检查P005 Java服务是否存在
ls backend/src/main/java/com/cinema/inventory/service/InventoryReservationService.java
ls backend/src/main/java/com/cinema/inventory/service/BomExpansionService.java

# 预期：两个文件都存在
```

### 3. 环境配置

```bash
# .env (前端)
VITE_API_BASE_URL=https://ops.cfilmcloud.com/api/v1

# application.yml (后端)
spring:
  datasource:
    url: jdbc:postgresql://db.xxxx.supabase.co:5432/postgres
    username: postgres
    password: ${SUPABASE_DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: validate  # 不要使用update，数据库迁移由Flyway管理
    properties:
      hibernate:
        default_schema: public
```

---

## Phase 1: Backend Implementation (2-3天)

### Step 1: 订单服务集成库存预占

**目标**: 在订单创建流程中调用P005的库存预占服务

**文件**: `backend/src/main/java/com/cinema/order/service/BeverageOrderService.java`

```java
package com.cinema.order.service;

import com.cinema.inventory.service.InventoryReservationService;
import com.cinema.inventory.entity.InventoryReservation;
import com.cinema.order.dto.OrderCreationRequest;
import com.cinema.order.dto.OrderCreationResponse;
import com.cinema.order.entity.BeverageOrder;
import com.cinema.order.repository.BeverageOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * @spec O012-order-inventory-reservation
 * 饮品订单服务（集成库存预占）
 */
@Service
@RequiredArgsConstructor
public class BeverageOrderService {
    
    private final InventoryReservationService reservationService; // P005已有
    private final BeverageOrderRepository orderRepository;
    
    @Transactional(timeout = 30) // 超时保护
    public OrderCreationResponse createOrder(OrderCreationRequest request) {
        // Step 1: 验证订单数据
        validateOrderRequest(request);
        
        // Step 2: 调用库存预占服务（P005已实现）
        Map<UUID, BigDecimal> items = extractSkuQuantities(request.getItems());
        List<InventoryReservation> reservations;
        
        try {
            reservations = reservationService.reserveInventory(
                null, // orderId暂时为null，稍后更新
                request.getStoreId(),
                items
            );
        } catch (InsufficientInventoryException e) {
            // 库存不足，返回缺货清单
            throw new OrderCreationException("ORD_BIZ_002", "库存不足", e.getShortageItems());
        }
        
        // Step 3: 创建订单记录
        BeverageOrder order = BeverageOrder.builder()
            .storeId(request.getStoreId())
            .customerId(request.getCustomerId())
            .orderType(request.getOrderType())
            .status(OrderStatus.PENDING_PAYMENT)
            .totalAmount(calculateTotalAmount(request.getItems()))
            .createdAt(Instant.now())
            .build();
        
        orderRepository.save(order);
        
        // Step 4: 更新预占记录的订单ID
        reservations.forEach(reservation -> {
            reservation.setOrderId(order.getId());
        });
        
        // Step 5: 返回订单创建结果
        return OrderCreationResponse.builder()
            .orderId(order.getId())
            .orderNo(order.getOrderNo())
            .status(order.getStatus().name())
            .totalAmount(order.getTotalAmount())
            .reservationStatus("RESERVED")
            .reservedItems(buildReservedItems(reservations))
            .reservationExpiry(Instant.now().plus(30, ChronoUnit.MINUTES))
            .build();
    }
    
    private void validateOrderRequest(OrderCreationRequest request) {
        if (request.getStoreId() == null) {
            throw new OrderCreationException("ORD_BIZ_001", "门店ID不能为空");
        }
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new OrderCreationException("ORD_BIZ_001", "订单商品清单不能为空");
        }
        // ... 其他验证逻辑
    }
    
    private Map<UUID, BigDecimal> extractSkuQuantities(List<OrderItemRequest> items) {
        Map<UUID, BigDecimal> result = new HashMap<>();
        for (OrderItemRequest item : items) {
            result.put(item.getSkuId(), item.getQuantity());
        }
        return result;
    }
}
```

**关键点**:
1. ✅ 使用 `@Transactional` 保证原子性（订单创建失败则预占自动回滚）
2. ✅ 捕获 `InsufficientInventoryException` 返回友好的库存不足错误
3. ✅ 预占成功后再创建订单记录（避免订单创建失败但预占已扣减）
4. ✅ 更新预占记录的 `order_id`（用于后续取消释放）

---

### Step 2: 订单取消释放库存

**文件**: `backend/src/main/java/com/cinema/order/service/OrderCancellationService.java`

```java
package com.cinema.order.service;

import com.cinema.inventory.service.InventoryReservationService;
import com.cinema.order.entity.BeverageOrder;
import com.cinema.order.repository.BeverageOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

/**
 * @spec O012-order-inventory-reservation
 * 订单取消服务（释放预占库存）
 */
@Service
@RequiredArgsConstructor
public class OrderCancellationService {
    
    private final InventoryReservationService reservationService; // P005已有
    private final BeverageOrderRepository orderRepository;
    
    @Transactional
    public void cancelOrder(UUID orderId) {
        // Step 1: 验证订单状态
        BeverageOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        if (!order.isCancellable()) {
            throw new OrderNotCancellableException(
                "ORD_BIZ_005",
                "订单状态不允许取消: " + order.getStatus()
            );
        }
        
        // Step 2: 释放库存预占（P005已实现）
        try {
            reservationService.releaseReservation(orderId);
        } catch (Exception e) {
            // 记录日志但不阻断订单取消（预占可能已被定时任务释放）
            log.warn("Failed to release reservation for order {}: {}", orderId, e.getMessage());
        }
        
        // Step 3: 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        orderRepository.save(order);
    }
}
```

---

### Step 3: 超时自动释放定时任务

**文件**: `backend/src/main/java/com/cinema/inventory/job/InventoryReservationCleanupJob.java`

```java
package com.cinema.inventory.job;

import com.cinema.inventory.entity.InventoryReservation;
import com.cinema.inventory.entity.InventoryReservation.ReservationStatus;
import com.cinema.inventory.repository.InventoryReservationRepository;
import com.cinema.inventory.service.InventoryReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * @spec O012-order-inventory-reservation
 * 超时订单自动释放定时任务
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InventoryReservationCleanupJob {
    
    private final InventoryReservationRepository reservationRepository;
    private final InventoryReservationService reservationService;
    
    @Scheduled(cron = "0 */5 * * * *") // 每5分钟执行一次
    public void releaseExpiredReservations() {
        Instant expiryThreshold = Instant.now().minus(30, ChronoUnit.MINUTES);
        
        log.info("Starting expired reservation cleanup job, threshold: {}", expiryThreshold);
        
        // 查询超时的活跃预占记录
        List<InventoryReservation> expired = reservationRepository
            .findByStatusAndCreatedAtBefore(ReservationStatus.ACTIVE, expiryThreshold);
        
        if (expired.isEmpty()) {
            log.info("No expired reservations found");
            return;
        }
        
        log.info("Found {} expired reservations to release", expired.size());
        
        // 批量释放
        int successCount = 0;
        for (InventoryReservation reservation : expired) {
            try {
                reservationService.releaseReservation(reservation.getOrderId());
                
                // 更新预占记录状态
                reservation.setStatus(ReservationStatus.EXPIRED);
                reservation.setNotes("超时自动释放");
                reservationRepository.save(reservation);
                
                successCount++;
            } catch (Exception e) {
                log.error("Failed to release expired reservation: {}", reservation.getId(), e);
            }
        }
        
        log.info("Cleanup job completed: {}/{} reservations released", successCount, expired.size());
    }
}
```

**关键配置**:

在 `Application.java` 或配置类中启用定时任务：

```java
@SpringBootApplication
@EnableScheduling // 启用定时任务
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

### Step 4: REST API Controller

**文件**: `backend/src/main/java/com/cinema/order/controller/OrderController.java`

```java
package com.cinema.order.controller;

import com.cinema.order.dto.OrderCreationRequest;
import com.cinema.order.dto.OrderCreationResponse;
import com.cinema.order.service.BeverageOrderService;
import com.cinema.order.service.OrderCancellationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.UUID;

/**
 * @spec O012-order-inventory-reservation
 * 订单API Controller（含库存预占集成）
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final BeverageOrderService orderService;
    private final OrderCancellationService cancellationService;
    
    @PostMapping
    public ResponseEntity<ApiResponse<OrderCreationResponse>> createOrder(
        @Valid @RequestBody OrderCreationRequest request
    ) {
        OrderCreationResponse response = orderService.createOrder(request);
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(ApiResponse.success("订单创建成功", response));
    }
    
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelOrder(@PathVariable UUID orderId) {
        cancellationService.cancelOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("订单取消成功"));
    }
}
```

---

### Step 5: 单元测试

**文件**: `backend/src/test/java/com/cinema/order/service/BeverageOrderServiceTest.java`

```java
package com.cinema.order.service;

import com.cinema.inventory.service.InventoryReservationService;
import com.cinema.order.dto.OrderCreationRequest;
import com.cinema.order.dto.OrderItemRequest;
import com.cinema.order.repository.BeverageOrderRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BeverageOrderServiceTest {
    
    @Mock
    private InventoryReservationService reservationService;
    
    @Mock
    private BeverageOrderRepository orderRepository;
    
    @InjectMocks
    private BeverageOrderService orderService;
    
    @Test
    void createOrder_withSufficientInventory_shouldSucceed() {
        // Given
        UUID storeId = UUID.randomUUID();
        UUID skuId = UUID.randomUUID();
        
        OrderCreationRequest request = OrderCreationRequest.builder()
            .storeId(storeId)
            .customerId(UUID.randomUUID())
            .orderType("BEVERAGE")
            .items(List.of(
                OrderItemRequest.builder()
                    .skuId(skuId)
                    .quantity(BigDecimal.valueOf(2))
                    .unit("杯")
                    .build()
            ))
            .build();
        
        when(reservationService.reserveInventory(isNull(), eq(storeId), anyMap()))
            .thenReturn(List.of(/* mock reservations */));
        
        // When
        var response = orderService.createOrder(request);
        
        // Then
        assertNotNull(response);
        assertEquals("RESERVED", response.getReservationStatus());
        verify(reservationService).reserveInventory(isNull(), eq(storeId), anyMap());
        verify(orderRepository).save(any());
    }
    
    @Test
    void createOrder_withInsufficientInventory_shouldThrowException() {
        // Given
        OrderCreationRequest request = OrderCreationRequest.builder()
            .storeId(UUID.randomUUID())
            .customerId(UUID.randomUUID())
            .items(List.of(/* items */))
            .build();
        
        when(reservationService.reserveInventory(any(), any(), anyMap()))
            .thenThrow(new InsufficientInventoryException(/* shortage items */));
        
        // When & Then
        assertThrows(OrderCreationException.class, () -> {
            orderService.createOrder(request);
        });
        
        verify(orderRepository, never()).save(any()); // 预占失败不应创建订单
    }
}
```

---

## Phase 2: Frontend Implementation (1-2天)

### Step 1: API Service封装

**文件**: `frontend/src/services/orderService.ts`

```typescript
/**
 * @spec O012-order-inventory-reservation
 * 订单API服务（含库存预占集成）
 */
import request from '@/utils/request';

export interface OrderCreationRequest {
  storeId: string;
  customerId: string;
  items: Array<{
    skuId: string;
    quantity: number;
    unit: string;
  }>;
  orderType: 'BEVERAGE' | 'HALL_RESERVATION';
  channel?: 'MINIAPP' | 'WEB' | 'POS';
  notes?: string;
}

export interface OrderCreationResponse {
  orderId: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  reservationStatus: 'RESERVED' | 'PARTIAL_RESERVED' | 'FAILED';
  reservedItems: Array<{
    skuId: string;
    skuName: string;
    reservedQty: number;
    unit: string;
  }>;
  reservationExpiry: string;
}

// 创建订单（集成库存预占）
export async function createOrderWithReservation(
  data: OrderCreationRequest
): Promise<ApiResponse<OrderCreationResponse>> {
  return request.post<ApiResponse<OrderCreationResponse>>('/api/v1/orders', data);
}

// 取消订单（释放库存）
export async function cancelOrder(orderId: string): Promise<ApiResponse<void>> {
  return request.post<ApiResponse<void>>(`/api/v1/orders/${orderId}/cancel`);
}
```

---

### Step 2: React页面集成

**文件**: `frontend/src/pages/order/CreateOrder.tsx`

```tsx
/**
 * @spec O012-order-inventory-reservation
 * 订单创建页面（含库存预占提示）
 */
import React, { useState } from 'react';
import { Button, message, Modal } from 'antd';
import { createOrderWithReservation } from '@/services/orderService';

export const CreateOrderPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (formData: OrderCreationRequest) => {
    setLoading(true);
    
    try {
      const response = await createOrderWithReservation(formData);
      
      if (response.code === '0000') {
        // 订单创建成功，显示预占信息
        message.success('订单创建成功，库存已预占');
        
        // 显示预占过期时间提示
        const expiryTime = new Date(response.data.reservationExpiry);
        Modal.success({
          title: '订单创建成功',
          content: (
            <div>
              <p>订单号: {response.data.orderNo}</p>
              <p>金额: ¥{response.data.totalAmount}</p>
              <p>库存预占状态: {response.data.reservationStatus}</p>
              <p>预占有效期至: {expiryTime.toLocaleString()}</p>
              <p style={{ color: '#ff4d4f' }}>
                ⚠️ 请在30分钟内完成支付，否则库存将自动释放
              </p>
            </div>
          ),
        });
      } else {
        message.error(response.message);
      }
    } catch (error: any) {
      // 库存不足错误特殊处理
      if (error.code === 'ORD_BIZ_002') {
        const shortageItems = error.details?.shortageItems || [];
        
        Modal.error({
          title: '库存不足',
          content: (
            <div>
              <p>以下商品库存不足，无法完成下单：</p>
              <ul>
                {shortageItems.map((item: any) => (
                  <li key={item.skuId}>
                    {item.skuName}: 需要 {item.requiredQty} {item.unit}，
                    可用 {item.availableQty} {item.unit}
                  </li>
                ))}
              </ul>
            </div>
          ),
        });
      } else {
        message.error(error.message || '订单创建失败');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* 订单表单 */}
      <Button type="primary" loading={loading} onClick={handleSubmit}>
        提交订单
      </Button>
    </div>
  );
};
```

---

## Testing & Validation

### 1. 本地环境测试

```bash
# 1. 启动后端服务
cd backend
mvn spring-boot:run

# 2. 启动前端服务
cd frontend
npm run dev

# 3. 访问浏览器
open http://localhost:3000/order/create
```

### 2. 功能验证清单

- [ ] **创建订单（库存充足）**: 预占成功，订单创建成功
- [ ] **创建订单（库存不足）**: 返回库存不足错误，显示缺货清单
- [ ] **取消订单**: 预占释放成功，库存恢复
- [ ] **超时自动释放**: 30分钟后定时任务自动释放预占
- [ ] **并发下单**: 多个用户同时下单不会超卖
- [ ] **事务回滚**: 订单创建失败时预占自动回滚

### 3. 性能测试

```bash
# 使用JMeter或k6进行压力测试
# 目标：100 orders/s, 响应时间 < 500ms

# 示例k6脚本
k6 run --vus 50 --duration 30s order-creation-load-test.js
```

---

## Troubleshooting

### 问题1: 预占记录未关联订单ID

**现象**: `inventory_reservations.order_id` 为 NULL

**原因**: 预占服务调用时传入了 `orderId = null`，但忘记更新

**解决**: 确保在订单创建后执行：

```java
reservations.forEach(res -> res.setOrderId(order.getId()));
```

---

### 问题2: 定时任务未执行

**现象**: 超时订单未自动释放

**检查步骤**:

```bash
# 1. 检查@EnableScheduling是否启用
grep -r "@EnableScheduling" backend/src/

# 2. 检查定时任务日志
tail -f backend/logs/application.log | grep "Cleanup job"

# 3. 手动触发定时任务（用于调试）
curl -X POST http://localhost:8080/actuator/scheduledtasks
```

---

### 问题3: 并发下单导致死锁

**现象**: 高并发时出现 `DeadlockLoserDataAccessException`

**原因**: 多个事务同时锁定多个库存行，顺序不一致

**解决**: 在 `InventoryReservationService` 中按 `skuId` 排序后再锁定：

```java
List<UUID> sortedSkuIds = new ArrayList<>(items.keySet());
Collections.sort(sortedSkuIds); // 统一锁定顺序

for (UUID skuId : sortedSkuIds) {
    Inventory inventory = inventoryRepository.findByStoreIdAndSkuIdForUpdate(storeId, skuId)
        .orElseThrow(() -> new InventoryNotFoundException(skuId));
    // ...
}
```

---

## Next Steps

Phase 1完成后，执行 `/speckit.tasks` 生成详细的任务分解和实施计划。

**预计里程碑**:
- Day 1-2: 后端集成库存预占（订单创建、取消）
- Day 3: 超时释放定时任务 + 单元测试
- Day 4: 前端集成 + UI优化
- Day 5: E2E测试 + 性能测试

---

## References

- [P005-bom-inventory-deduction规格](/specs/P005-bom-inventory-deduction/spec.md)
- [数据模型文档](/specs/O012-order-inventory-reservation/data-model.md)
- [API契约文档](/specs/O012-order-inventory-reservation/contracts/api.yaml)
- [Spring @Scheduled官方文档](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#scheduling)
- [PostgreSQL行级锁](https://www.postgresql.org/docs/current/explicit-locking.html)
