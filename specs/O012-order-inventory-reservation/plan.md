# Implementation Plan: 订单创建时库存预占

**Branch**: `feat/O012-order-inventory-reservation` | **Date**: 2026-01-14 | **Spec**: [spec.md](./spec.md)

## Summary

本规格实现订单创建时的库存预占机制,基于已有的P005-bom-inventory-deduction基础设施。主要内容：

- **下单预占**: 创建订单时自动调用预占服务,展开BOM计算物料需求,检查库存可用性,使用事务+行锁保证原子性扣减
- **取消释放**: 订单取消或超时时自动释放预占库存
- **审计追踪**: 记录详细的预占/释放操作日志

**技术方法**: 复用P005已有的 `InventoryReservationService`、`BomExpansionService`、`InventoryRepository`(行锁支持),集成到O003(饮品订单)和U001(场次预订)的订单创建流程中。

## Technical Context

**Language/Version**: Java 17 + Spring Boot 3.x  
**Primary Dependencies**: Spring Data JPA, Supabase PostgreSQL Client, Caffeine Cache, Jackson  
**Storage**: Supabase PostgreSQL (复用 `store_inventory`, `inventory_reservations`, `bom_snapshots` 表,由P005创建)  
**Testing**: JUnit 5, Mockito, Vitest (前端), Playwright (E2E)  
**Target Platform**: Linux server (backend), Chrome/Edge (B端), 微信小程序 (C端)  
**Project Type**: Web application (backend + frontend)  
**Performance Goals**: 
- 订单预占响应时间 < 500ms (包含BOM展开 + 库存检查 + 锁定)
- 并发订单处理能力 ≥ 100 orders/s without overselling
- 超时订单自动释放延迟 < 5分钟 (定时任务每5分钟执行)

**Constraints**: 
- 必须复用P005已有的库存预占服务(`InventoryReservationService`),避免重复实现
- 必须与O003(饮品订单)、U001(场次预订)业务流程集成
- 必须支持订单取消、支付超时两种释放场景
- 库存数据一致性要求 ≥ 99.99%

**Scale/Scope**: 
- Backend: 订单创建时调用预占API,订单取消时调用释放API
- C端(Taro): 订单创建流程集成预占失败提示(如库存不足)
- B端(React): 订单管理页面显示预占状态,支持手动释放预占
- 定时任务: 自动释放超时订单的预占库存(30分钟超时)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `feat/O012-order-inventory-reservation` 与 specId `O012` 一致,active_spec 已绑定 ✅
- [x] **代码归属标识**: 所有新增代码文件将标注 `@spec O012-order-inventory-reservation` ✅
- [x] **测试驱动开发**: 预占/释放/超时处理等关键业务流程将先编写测试(JUnit + Mockito),目标覆盖率100% ✅
- [x] **组件化架构**: B端订单页面复用现有Ant Design组件,C端复用Taro UI组件 ✅
- [x] **前端技术栈分层**: B端使用React 19.2.0+Ant Design 6.1.0，C端使用Taro 3.x，严格分离 ✅
- [x] **数据驱动与状态管理**: B端使用TanStack Query管理订单状态,C端使用Taro存储API ✅
- [x] **代码质量与工程化**: TypeScript严格模式,ESLint+Prettier,Git提交规范 ✅
- [x] **Spring Boot + Supabase 统一后端栈**: 使用Spring Boot 3.x + Supabase PostgreSQL ✅
- [x] **API响应格式标准化**: 统一使用 `ApiResponse<T>` 包装响应,错误使用标准化错误码(如 `INV_BIZ_001`) ✅
- [x] **API异常编号规范**: 使用 `ORD_*` 系列错误码(订单模块) ✅
- [x] **API测试规范**: 在 `specs/O012-order-inventory-reservation/postman/` 提供Postman测试脚本 ✅
- [x] **业务概念澄清文档**: 已创建 `business-clarification.md` 文档 N/A (已在spec.md中澄清)
- [x] **规格驱动开发**: 所有实现基于完整的规格文档(spec.md) ✅
- [x] **持续集成与质量门禁**: 所有测试通过后才能合并 ✅
- [x] **认证与权限要求分层**: B端暂不实现认证授权,C端按实际需求实现 ✅

**Gate Result**: ✅ **PASS** - 所有强制原则已满足,可进入Phase 0研究

## Project Structure

### Documentation (this feature)

```text
specs/O012-order-inventory-reservation/
├── spec.md                  # 功能规格说明 (已完成)
├── checklists/
│   └── requirements.md      # 规格质量检查清单 (已完成)
├── plan.md                  # 本文件 (Phase 0-1 输出)
├── research.md              # Phase 0 技术调研输出
├── data-model.md            # Phase 1 数据模型设计
├── quickstart.md            # Phase 1 开发快速上手指南
├── contracts/               # Phase 1 API契约定义
│   ├── api.yaml            # OpenAPI规范
│   └── README.md           # API集成说明
└── postman/                 # Postman测试脚本
    ├── O012-order-reservation.postman_collection.json
    └── O012-local.postman_environment.json
```

### Source Code (repository root)

**选择的结构**: **Option 2: Web application** (backend + frontend 分离)

```text
backend/src/main/java/com/cinema/
├── order/                    # 订单模块 (集成预占逻辑)
│   ├── controller/
│   │   ├── BeverageOrderController.java      # O003饮品订单API (调用预占)
│   │   └── ReservationOrderController.java   # U001场次预订API (调用预占)
│   ├── service/
│   │   ├── BeverageOrderService.java         # 订单创建时调用预占
│   │   ├── ReservationOrderService.java      # 预订创建时调用预占
│   │   └── OrderCancellationService.java     # 订单取消时调用释放 (新增)
│   ├── dto/
│   │   ├── OrderCreationRequest.java
│   │   ├── OrderCreationResponse.java
│   │   └── OrderReservationStatus.java       # 预占状态枚举 (新增)
│   └── exception/
│       └── OrderException.java
│
├── inventory/                # 库存模块 (P005已有,无需修改)
│   ├── service/
│   │   ├── InventoryReservationService.java  # 核心预占服务 (P005已实现)
│   │   ├── BomExpansionService.java          # BOM展开服务 (P005已实现)
│   │   └── BomSnapshotService.java           # BOM快照服务 (P005已实现)
│   ├── repository/
│   │   ├── InventoryRepository.java          # 含SELECT FOR UPDATE (P005已实现)
│   │   ├── InventoryReservationRepository.java # P005已实现
│   │   └── BomSnapshotRepository.java        # P005已实现
│   └── entity/
│       ├── Inventory.java                    # 含reserved_qty字段 (P005已实现)
│       ├── InventoryReservation.java         # P005已实现
│       └── BomSnapshot.java                  # P005已实现
│
└── scheduled/                # 定时任务模块
    └── InventoryReservationCleanupJob.java   # 超时释放定时任务 (新增)

frontend/src/                 # B端管理后台
├── pages/
│   └── orders/
│       ├── OrderList.tsx                     # 订单列表 (显示预占状态)
│       └── OrderDetail.tsx                   # 订单详情 (显示预占明细)
├── services/
│   └── orderService.ts                       # 订单API封装
└── types/
    └── order.ts                              # 订单类型定义

miniapp-ordering-taro/src/    # C端小程序 (Taro)
├── pages/
│   └── order-confirm/
│       └── index.tsx                         # 订单确认页 (集成预占错误提示)
└── services/
    └── orderService.ts                       # 订单API封装

tests/                        # 测试代码
├── unit/
│   └── inventory/
│       └── InventoryReservationServiceTest.java  # P005已有
├── integration/
│   └── order/
│       └── OrderCreationWithReservationTest.java # 新增集成测试
└── e2e/
    └── order-reservation-flow.spec.ts        # E2E测试 (Playwright)
```

**Structure Decision**: 

本规格采用**集成点模式**，完全复用P005已有的基础设施，不新增独立模块。

**实际目录结构**:
```
backend/src/main/java/com/cinema/
├── order/service/              # 订单服务（集成库存预占）
│   ├── BeverageOrderService.java    ✅ 调用P005的InventoryReservationService
│   └── OrderCancellationService.java ✅ 调用P005的releaseReservation()
├── inventory/job/              # 定时任务（新增）
│   └── InventoryReservationCleanupJob.java ✅ 超时自动释放
└── inventory/service/          # P005已有（完全复用）
    ├── InventoryReservationService.java
    ├── BomExpansionService.java
    └── BomSnapshotService.java

frontend/src/
├── services/orderService.ts    # API封装（新增预占响应字段）
└── pages/order/
    └── CreateOrder.tsx         # 订单创建页面（新增库存预占提示）
```

**复用的P005基础设施**:
- ✅ 数据库表: `store_inventory`, `inventory_reservations`, `bom_snapshots`
- ✅ 服务层: `InventoryReservationService.reserveInventory()`, `releaseReservation()`
- ✅ Repository: `InventoryRepository.findByStoreIdAndSkuIdForUpdate()` (行级锁)
- ✅ 实体类: `Inventory`, `InventoryReservation`, `BomSnapshot`

**O012新增内容**:
- ✅ 订单服务集成层（调用P005 API）
- ✅ 超时释放定时任务
- ✅ 前端预占状态展示

## Phase 0: Outline & Research

### Research Questions (已解答 by P005)

**Question 1**: 如何防止并发场景下的库存超卖?  
**Answer (from P005)**: 
- 使用 `SELECT FOR UPDATE` 行级锁(PostgreSQL `LockModeType.PESSIMISTIC_WRITE`)
- 事务隔离级别: `READ_COMMITTED`
- Repository方法: `findByStoreIdAndSkuIdForUpdate(storeId, skuId)`
- 锁超时时间: 10秒(配置在 `TransactionConfig`)

**Question 2**: BOM展开算法如何处理多层级套餐?  
**Answer (from P005)**:
- DFS递归算法,最大深度3层
- 使用 `HashMap<UUID, MaterialRequirement>` 聚合相同原料
- 支持损耗率计算: `quantity × (1 + wastage_rate)`
- 缓存优化: `@Cacheable(value = BOM_FORMULAS_CACHE, key = "#skuId")`

**Question 3**: 如何确保预占和释放的原子性?  
**Answer (from P005)**:
- `@Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class, timeout = 30)`
- 先锁定库存(`findByStoreIdAndSkuIdForUpdate`),再更新 `reserved_qty`
- 失败时自动回滚,不影响库存状态

**Question 4**: 超时订单如何自动释放预占?  
**Answer (待实现)**:
- Spring `@Scheduled` 定时任务,每5分钟执行一次
- 查询 `created_at < now() - 30 minutes AND status = 'ACTIVE'` 的预占记录
- 调用 `InventoryReservationService.releaseReservation(orderId)` 释放

### Research Output (research.md)

**Key Findings**:

1. **P005基础设施完全可复用**:
   - `InventoryReservationService.reserveInventory()` 已实现预占逻辑
   - `InventoryReservationService.releaseReservation()` 已实现释放逻辑
   - `BomExpansionService.expandBomBatch()` 已实现BOM展开
   - `BomSnapshotService.createSnapshots()` 已实现配方快照

2. **数据库Schema已就绪** (by P005):
   - `store_inventory` 表已有 `reserved_qty` 字段
   - `inventory_reservations` 表已创建(含ACTIVE/RELEASED/CANCELLED/EXPIRED状态)
   - `bom_snapshots` 表已创建

3. **集成点**:
   - **O003饮品订单**: 在 `BeverageOrderService.createOrder()` 中调用预占API
   - **U001场次预订**: 在 `ReservationOrderService.createReservation()` 中调用预占API
   - **订单取消**: 新增 `OrderCancellationService` 统一处理取消逻辑

4. **待实现内容** (本次O012 scope):
   - 订单服务集成预占调用逻辑
   - 订单取消触发预占释放
   - 超时订单自动释放定时任务
   - 前端订单页面显示预占状态
   - C端下单流程集成预占失败提示

5. **无需实现内容** (P005已有):
   - ✅ 库存预占核心服务
   - ✅ BOM展开算法
   - ✅ 行级锁并发控制
   - ✅ 预占记录数据模型

## Phase 1: Design & Contracts

### Data Model Extensions (data-model.md)

**No new tables needed** - 完全复用P005已有表结构:

1. **store_inventory** (P005已创建):
   - `reserved_qty` 字段: 预占库存数量
   - `available_qty` 字段: 可用库存 (computed: on_hand_qty - reserved_qty)

2. **inventory_reservations** (P005已创建):
   - `order_id`: 关联订单ID
   - `sku_id`: 预占的SKU ID
   - `reserved_quantity`: 预占数量
   - `status`: ACTIVE | FULFILLED | CANCELLED | EXPIRED
   - `created_at`, `fulfilled_at`, `cancelled_at`

3. **bom_snapshots** (P005已创建):
   - `order_id`: 关联订单ID
   - `finished_sku_id`: 成品SKU ID
   - `raw_material_sku_id`: 原料SKU ID
   - `quantity`: BOM用量

### API Contracts (contracts/api.yaml)

#### 订单创建API (集成预占)

```yaml
POST /api/orders/beverage
Request:
  userId: UUID
  storeId: UUID
  items:
    - skuId: UUID
      quantity: integer

Response (成功):
  orderId: UUID
  orderNumber: string
  reservationStatus: "RESERVED"
  reservedItems:
    - skuId: UUID
      skuName: string
      reservedQuantity: decimal
      unit: string

Response (库存不足):
  error: "ORD_BIZ_001"
  message: "库存不足，无法完成预占"
  details:
    shortages:
      - skuId: UUID
        skuName: string
        required: decimal
        available: decimal
        shortage: decimal
```

#### 订单取消API (触发释放)

```yaml
POST /api/orders/{orderId}/cancel
Response:
  orderId: UUID
  status: "CANCELLED"
  reservationStatus: "RELEASED"
  releasedItems:
    - skuId: UUID
      releasedQuantity: decimal
```

### Integration Flow (quickstart.md)

**Flow 1: 订单创建 + 库存预占**

```java
/**
 * @spec O012-order-inventory-reservation
 * 饮品订单创建服务
 */
@Service
public class BeverageOrderService {
    
    private final InventoryReservationService reservationService; // P005已有

    @Transactional
    public OrderCreationResponse createOrder(OrderCreationRequest request) {
        // Step 1: 验证订单数据
        validateOrderRequest(request);
        
        // Step 2: 调用库存预占服务 (P005已实现)
        Map<UUID, BigDecimal> items = extractSkuQuantities(request.getItems());
        List<InventoryReservation> reservations = reservationService.reserveInventory(
            null, // orderId暂时为null,稍后更新
            request.getStoreId(),
            items
        );
        
        // Step 3: 创建订单记录
        BeverageOrder order = createOrderEntity(request);
        orderRepository.save(order);
        
        // Step 4: 更新预占记录的订单ID
        updateReservationOrderId(reservations, order.getId());
        
        // Step 5: 返回订单创建结果
        return buildResponse(order, reservations);
    }
}
```

**Flow 2: 订单取消 + 释放预占**

```java
/**
 * @spec O012-order-inventory-reservation
 * 订单取消服务
 */
@Service
public class OrderCancellationService {
    
    private final InventoryReservationService reservationService; // P005已有

    @Transactional
    public void cancelOrder(UUID orderId) {
        // Step 1: 查询订单
        BeverageOrder order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        // Step 2: 释放预占库存 (P005已实现)
        int releasedCount = reservationService.releaseReservation(orderId);
        logger.info("Released {} reservations for cancelled order: {}", releasedCount, orderId);
        
        // Step 3: 更新订单状态
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }
}
```

**Flow 3: 超时订单自动释放**

```java
/**
 * @spec O012-order-inventory-reservation
 * 超时订单自动释放定时任务
 */
@Component
public class InventoryReservationCleanupJob {
    
    private final InventoryReservationRepository reservationRepository;
    private final InventoryReservationService reservationService;

    @Scheduled(cron = "0 */5 * * * *") // Every 5 minutes
    public void releaseExpiredReservations() {
        Instant expiryThreshold = Instant.now().minus(30, ChronoUnit.MINUTES);
        
        // 查询超时的活跃预占记录
        List<InventoryReservation> expired = reservationRepository
            .findByStatusAndCreatedAtBefore(ReservationStatus.ACTIVE, expiryThreshold);
        
        // 批量释放
        for (InventoryReservation reservation : expired) {
            try {
                reservationService.releaseReservation(reservation.getOrderId());
                reservation.setStatus(ReservationStatus.EXPIRED);
                reservationRepository.save(reservation);
            } catch (Exception e) {
                logger.error("Failed to release expired reservation: {}", reservation.getId(), e);
            }
        }
        
        logger.info("Released {} expired reservations", expired.size());
    }
}
```

## Agent Context Update

执行 `.specify/scripts/bash/update-agent-context.sh qoder` 以更新Qoder的上下文:

**New Technology Stack Entries**:
- Spring Boot 3.x `@Scheduled` 定时任务
- PostgreSQL `SELECT FOR UPDATE` 行级锁
- TanStack Query 订单状态管理(B端)
- Taro.showModal 错误提示(C端)

## Summary

O012规格将**复用P005已有的库存预占基础设施**,仅需在订单服务层集成预占/释放调用逻辑,以及实现超时订单自动释放定时任务。

**核心集成点**:
1. 订单创建 → 调用 `InventoryReservationService.reserveInventory()`
2. 订单取消 → 调用 `InventoryReservationService.releaseReservation()`
3. 定时任务 → 自动释放超时订单的预占

**预计工作量**: 3-5天 (因大部分基础设施已由P005实现)

**Phase 2 Next**: 执行 `/speckit.tasks` 生成详细的任务分解和实施计划。
**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
│   └── InventoryReservationCleanupJob.java ✅ 超时自动释放
└── inventory/service/          # P005已有（完全复用）
    ├── InventoryReservationService.java
    ├── BomExpansionService.java
    └── BomSnapshotService.java

frontend/src/
├── services/orderService.ts    # API封装（新增预占响应字段）
└── pages/order/
    └── CreateOrder.tsx         # 订单创建页面（新增库存预占提示）
```

**复用的P005基础设施**:
- ✅ 数据库表: `store_inventory`, `inventory_reservations`, `bom_snapshots`
- ✅ 服务层: `InventoryReservationService.reserveInventory()`, `releaseReservation()`
- ✅ Repository: `InventoryRepository.findByStoreIdAndSkuIdForUpdate()` (行级锁)
- ✅ 实体类: `Inventory`, `InventoryReservation`, `BomSnapshot`

**O012新增内容**:
- ✅ 订单服务集成层（调用P005 API）
- ✅ 超时释放定时任务
- ✅ 前端预占状态展示

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

✅ **无任何宪法违规项，无需填写此表。**

本规格完全符合项目宪法的所有强制原则：
- ✅ 复用P005基础设施，不新增重复模块
- ✅ 使用统一的Supabase PostgreSQL后端
- ✅ 使用Java 17 + Spring Boot 3.x技术栈
- ✅ 遵循RESTful API设计规范
- ✅ 使用事务和行级锁保证数据一致性
