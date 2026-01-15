# Technical Research: 订单创建时库存预占

**Feature**: O012-order-inventory-reservation  
**Date**: 2026-01-14  
**Research Phase**: Phase 0  

---

## Research Summary

本研究阶段验证O012规格可以**完全复用P005-bom-inventory-deduction已实现的库存预占基础设施**,无需重复开发核心预占逻辑。

**主要发现**:
- ✅ P005已实现完整的库存预占服务 (`InventoryReservationService`)
- ✅ P005已实现BOM展开算法 (`BomExpansionService`)
- ✅ P005已实现行级锁并发控制 (`SELECT FOR UPDATE`)
- ✅ 数据库Schema已就绪 (`store_inventory.reserved_qty`, `inventory_reservations` 表)
- ⚠️ 需要实现订单服务层的集成逻辑和超时释放定时任务

---

## Research Questions & Answers

### Q1: 如何防止并发场景下的库存超卖?

**Answer** (from P005 implementation):

P005已实现基于PostgreSQL行级锁的并发控制机制:

```java
// backend/src/main/java/com/cinema/inventory/repository/InventoryRepository.java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT i FROM Inventory i WHERE i.storeId = :storeId AND i.skuId = :skuId")
Optional<Inventory> findByStoreIdAndSkuIdForUpdate(
    @Param("storeId") UUID storeId,
    @Param("skuId") UUID skuId
);
```

**工作原理**:
1. `SELECT FOR UPDATE` 在读取库存行时加排他锁
2. 其他事务必须等待当前事务提交或回滚才能获取锁
3. 锁超时时间: 10秒 (配置在 `TransactionConfig`)
4. 事务隔离级别: `READ_COMMITTED`

**验证结果**:
- ✅ P005 E2E测试验证了100个并发订单场景下零超卖
- ✅ 测试文件: `frontend/tests/e2e/p005-bom-inventory/04-concurrent-operations.spec.ts`

**决策**: O012无需重复实现,直接调用P005的 `findByStoreIdAndSkuIdForUpdate()` 即可。

---

### Q2: BOM展开算法如何处理多层级套餐?

**Answer** (from P005 implementation):

P005已实现DFS递归算法,支持最大3层嵌套:

```java
// backend/src/main/java/com/cinema/inventory/service/BomExpansionService.java
public List<MaterialRequirement> expandBomBatch(Map<UUID, BigDecimal> skuQuantities) {
    Map<UUID, MaterialRequirement> aggregatedMaterials = new HashMap<>();
    
    for (Map.Entry<UUID, BigDecimal> entry : skuQuantities.entrySet()) {
        UUID skuId = entry.getKey();
        BigDecimal quantity = entry.getValue();
        
        // 递归展开 (max depth 3)
        expandBomRecursive(skuId, quantity, 1, aggregatedMaterials);
    }
    
    return new ArrayList<>(aggregatedMaterials.values());
}
```

**关键特性**:
1. 使用 `HashMap<UUID, MaterialRequirement>` 自动聚合相同原料
2. 支持损耗率计算: `quantity × (1 + wastage_rate)`
3. 缓存优化: `@Cacheable(value = BOM_FORMULAS_CACHE, key = "#skuId")`
4. 防止无限递归: 最大深度限制为3层

**性能指标** (from P005):
- 单订单BOM展开 + 库存检查 + 锁定 < 500ms
- 支持并发 ≥ 100 orders/s

**决策**: O012无需修改BOM展开逻辑,直接调用 `BomExpansionService.expandBomBatch()` 即可。

---

### Q3: 如何确保预占和释放的原子性?

**Answer** (from P005 implementation):

P005在预占服务中使用Spring事务管理保证原子性:

```java
// backend/src/main/java/com/cinema/inventory/service/InventoryReservationService.java
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, timeout = 30)
public List<InventoryReservation> reserveInventory(
    UUID orderId,
    UUID storeId,
    Map<UUID, BigDecimal> items
) {
    // Step 1: BOM展开
    List<MaterialRequirement> materials = bomExpansionService.expandBomBatch(items);
    
    // Step 2: 锁定并检查库存
    for (MaterialRequirement material : materials) {
        Inventory inventory = inventoryRepository
            .findByStoreIdAndSkuIdForUpdate(storeId, material.getSkuId()) // 行锁
            .orElseThrow(...);
        
        if (inventory.calculateAvailableForReservation().compareTo(material.getQuantity()) < 0) {
            throw new InsufficientInventoryException(...); // 触发回滚
        }
        
        // Step 3: 更新reserved_qty
        inventory.setReservedQty(inventory.getReservedQty().add(material.getQuantity()));
        inventoryRepository.save(inventory);
    }
    
    // Step 4: 创建预占记录
    List<InventoryReservation> reservations = ...;
    reservationRepository.saveAll(reservations);
    
    // Step 5: 创建BOM快照
    bomSnapshotService.createSnapshots(orderId, skuIds);
    
    return reservations; // 事务提交
}
```

**事务保证**:
- ✅ 任一SKU库存不足 → 全部回滚,不创建预占记录
- ✅ 数据库异常 → 全部回滚
- ✅ 超时(30秒) → 自动回滚并释放锁

**释放逻辑** (同样原子性):

```java
@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
public int releaseReservation(UUID orderId) {
    List<InventoryReservation> reservations = reservationRepository
        .findByOrderIdAndStatus(orderId, ReservationStatus.ACTIVE);
    
    for (InventoryReservation reservation : reservations) {
        Inventory inventory = inventoryRepository
            .findByStoreIdAndSkuIdForUpdate(...) // 行锁
            .orElseThrow(...);
        
        // 释放reserved_qty
        inventory.setReservedQty(inventory.getReservedQty().subtract(reservation.getReservedQuantity()));
        inventoryRepository.save(inventory);
        
        // 更新预占记录状态
        reservation.markAsCancelled();
        reservationRepository.save(reservation);
    }
    
    return reservations.size();
}
```

**决策**: O012无需重新实现事务逻辑,P005的事务管理已完整覆盖预占和释放场景。

---

### Q4: 超时订单如何自动释放预占?

**Answer** (O012需实现):

P005未实现超时自动释放,O012需补充定时任务:

**实现方案**:

```java
/**
 * @spec O012-order-inventory-reservation
 * 超时订单自动释放定时任务
 */
@Component
public class InventoryReservationCleanupJob {
    
    private final InventoryReservationRepository reservationRepository;
    private final InventoryReservationService reservationService;
    
    /**
     * 每5分钟执行一次
     * Cron: "0 */5 * * * *"
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void releaseExpiredReservations() {
        Instant expiryThreshold = Instant.now().minus(30, ChronoUnit.MINUTES);
        
        // 查询超时的活跃预占记录
        List<InventoryReservation> expired = reservationRepository
            .findByStatusAndCreatedAtBefore(ReservationStatus.ACTIVE, expiryThreshold);
        
        if (expired.isEmpty()) {
            return; // 无超时记录
        }
        
        logger.info("Found {} expired reservations, releasing...", expired.size());
        
        // 批量释放
        int successCount = 0;
        int failureCount = 0;
        
        for (InventoryReservation reservation : expired) {
            try {
                reservationService.releaseReservation(reservation.getOrderId());
                reservation.setStatus(ReservationStatus.EXPIRED);
                reservationRepository.save(reservation);
                successCount++;
            } catch (Exception e) {
                logger.error("Failed to release expired reservation: {}", reservation.getId(), e);
                failureCount++;
            }
        }
        
        logger.info("Expired reservation cleanup completed: {} success, {} failure", 
            successCount, failureCount);
    }
}
```

**配置要求**:
- Spring Boot `@EnableScheduling` 注解启用定时任务
- 超时阈值: 30分钟 (可配置: `reservation.expiry.minutes=30`)
- 执行频率: 每5分钟

**监控指标**:
- 每次执行释放的预占记录数量
- 释放成功率
- 释放失败时的异常日志

**决策**: O012需实现此定时任务,作为核心功能的一部分。

---

### Q5: 如何处理订单取消场景?

**Answer** (O012需集成):

P005已提供释放API,O012需在订单取消流程中调用:

**集成点1: 饮品订单取消**

```java
/**
 * @spec O012-order-inventory-reservation
 * O003饮品订单服务扩展
 */
@Service
public class BeverageOrderService {
    
    private final InventoryReservationService reservationService; // P005已有
    
    @Transactional
    public void cancelOrder(UUID orderId) {
        // Step 1: 查询订单
        BeverageOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        // Step 2: 验证订单状态是否允许取消
        if (!order.canCancel()) {
            throw new OrderException(OrderErrorCode.ORD_BIZ_002, 
                "订单状态不允许取消: " + order.getStatus());
        }
        
        // Step 3: 释放预占库存 (调用P005 API)
        try {
            int releasedCount = reservationService.releaseReservation(orderId);
            logger.info("Released {} reservations for cancelled order: {}", releasedCount, orderId);
        } catch (Exception e) {
            logger.error("Failed to release reservations for order: {}", orderId, e);
            // 继续取消订单,但记录异常用于后续人工处理
        }
        
        // Step 4: 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        orderRepository.save(order);
    }
}
```

**集成点2: 场次预订取消 (U001)**

```java
@Service
public class ReservationOrderService {
    
    @Transactional
    public void cancelReservation(UUID reservationId) {
        // 类似逻辑: 查询预订 → 释放预占 → 更新状态
        reservationService.releaseReservation(reservationId);
        // ...
    }
}
```

**异常处理策略**:
- 预占释放失败不阻塞订单取消
- 记录失败日志,触发人工核查告警
- 提供管理后台手动释放预占的功能

**决策**: O012需在订单服务层集成释放调用逻辑。

---

### Q6: 前端如何显示预占状态和错误提示?

**Answer** (O012需实现):

**B端订单列表页面** (`frontend/src/pages/orders/OrderList.tsx`):

```typescript
// 订单列表数据类型
interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  reservationStatus: 'RESERVED' | 'RELEASED' | 'EXPIRED' | null; // 新增
  createdAt: string;
  // ...
}

// 显示预占状态标签
const ReservationStatusBadge = ({ status }: { status: string | null }) => {
  if (!status) return null;
  
  const config = {
    RESERVED: { color: 'blue', text: '已预占' },
    RELEASED: { color: 'default', text: '已释放' },
    EXPIRED: { color: 'red', text: '超时释放' }
  };
  
  return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
};
```

**C端订单确认页面** (`miniapp-ordering-taro/src/pages/order-confirm/index.tsx`):

```typescript
const handleSubmitOrder = async () => {
  try {
    const response = await orderService.createOrder({
      userId: currentUserId,
      storeId: selectedStoreId,
      items: cartItems
    });
    
    Taro.showToast({ title: '下单成功', icon: 'success' });
    Taro.navigateTo({ url: '/pages/order-detail/index?id=' + response.orderId });
    
  } catch (error) {
    // 处理库存不足错误
    if (error.error === 'ORD_BIZ_001') {
      const shortages = error.details.shortages;
      const shortageList = shortages.map(s => 
        `${s.skuName}: 需要${s.required}${s.unit}, 可用${s.available}${s.unit}`
      ).join('\n');
      
      Taro.showModal({
        title: '库存不足',
        content: `以下商品库存不足，无法下单:\n${shortageList}`,
        showCancel: false
      });
    } else {
      Taro.showToast({ title: '下单失败: ' + error.message, icon: 'error' });
    }
  }
};
```

**决策**: O012需在前端页面集成预占状态显示和错误提示逻辑。

---

## Technology Stack Evaluation

### Selected Technologies

| 技术 | 用途 | 决策依据 |
|------|------|---------|
| Spring Boot 3.x `@Transactional` | 事务管理 | P005已使用,保持一致性 |
| Spring `@Scheduled` | 定时任务 | 标准Spring功能,无需引入额外依赖 |
| PostgreSQL `SELECT FOR UPDATE` | 行级锁 | P005已使用,性能经过验证 |
| TanStack Query | B端订单状态管理 | 现有技术栈,复用现有模式 |
| Taro.showModal | C端错误提示 | Taro标准API,跨端兼容 |

### Rejected Alternatives

| 技术 | 原因 |
|------|------|
| Redis分布式锁 | PostgreSQL行锁已满足并发控制需求,引入Redis增加复杂度 |
| Quartz定时任务框架 | Spring `@Scheduled` 已满足需求,无需引入重型框架 |
| 消息队列(RabbitMQ/Kafka) | 同步预占即可满足业务需求,异步处理增加复杂度 |
| 乐观锁 | 高并发场景下乐观锁重试成本高,行锁性能更优 |

---

## Dependencies & Integration Points

### Reused P005 Services

| 服务类 | 方法 | 用途 |
|--------|------|------|
| `InventoryReservationService` | `reserveInventory(orderId, storeId, items)` | 创建预占 |
| `InventoryReservationService` | `releaseReservation(orderId)` | 释放预占 |
| `BomExpansionService` | `expandBomBatch(skuQuantities)` | BOM展开 |
| `BomSnapshotService` | `createSnapshots(orderId, skuIds)` | 配方快照 |

### New Services (O012)

| 服务类 | 方法 | 用途 |
|--------|------|------|
| `OrderCancellationService` | `cancelOrder(orderId)` | 统一订单取消逻辑 |
| `InventoryReservationCleanupJob` | `releaseExpiredReservations()` | 超时自动释放 |

### Integration with Existing Modules

| 模块 | 集成点 | 变更类型 |
|------|--------|---------|
| O003-beverage-order | `BeverageOrderService.createOrder()` | 新增预占调用 |
| O003-beverage-order | `BeverageOrderService.cancelOrder()` | 新增释放调用 |
| U001-reservation-order | `ReservationOrderService.createReservation()` | 新增预占调用 |
| U001-reservation-order | `ReservationOrderService.cancelReservation()` | 新增释放调用 |

---

## Performance Considerations

### Expected Performance

| 场景 | 目标 | 验证方法 |
|------|------|---------|
| 订单创建+预占 | < 500ms | JMeter压测100并发 |
| 订单取消+释放 | < 200ms | 单元测试验证 |
| 超时释放批量 | < 3s (100条) | 定时任务日志监控 |

### Optimization Strategies

1. **BOM展开缓存** (P005已实现):
   - `@Cacheable(value = BOM_FORMULAS_CACHE, key = "#skuId")`
   - 缓存时间: 30分钟
   - 缓存失效策略: LRU

2. **批量查询优化**:
   - 超时释放使用批量查询: `findByStatusAndCreatedAtBefore()`
   - 避免N+1查询问题

3. **索引优化** (P005已创建):
   - `idx_inventory_lock` on `(store_id, sku_id)` - 行锁性能
   - `idx_reservations_status_expires` on `(status, created_at)` - 超时查询

---

## Risk Assessment

### Technical Risks

| 风险 | 影响 | 缓解措施 | 责任人 |
|------|------|---------|--------|
| 定时任务重复执行 | 重复释放预占,数据不一致 | 使用分布式锁或数据库唯一约束 | Backend开发 |
| 预占释放失败 | 库存死锁 | 记录失败日志,提供手动释放接口 | Backend开发 |
| 超时阈值配置错误 | 过早释放或过晚释放 | 提供可配置参数,默认30分钟 | 运维 |
| 并发订单创建性能 | 高峰期响应慢 | 行锁超时时间设置为10秒,超时自动回滚 | Backend开发 |

### Business Risks

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 用户下单后未支付 | 库存长时间被锁定 | 30分钟超时自动释放 |
| BOM配方变更影响已下单订单 | 履约时扣减数量不符 | P005已创建BOM快照机制 |
| 跨门店调拨影响预占 | 预占库存被调走导致履约失败 | 待P006调拨功能实现时添加预占检查 |

---

## Conclusion

O012规格的技术研究结果表明:

✅ **可行性**: P005已提供完整的库存预占基础设施,O012无需重复开发核心逻辑  
✅ **性能**: P005性能指标已满足O012需求(500ms预占响应时间, 100 orders/s并发能力)  
✅ **安全性**: P005行级锁机制已通过E2E测试验证,可防止超卖  
⚠️ **待实现**: 订单服务集成、超时释放定时任务、前端状态显示  

**预计工作量**: 3-5天

**关键技术债务**: 无

**下一步**: 进入Phase 1设计阶段,生成 `data-model.md` 和 API contracts。
