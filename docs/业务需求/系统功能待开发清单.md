# 系统功能待开发清单

> 文档版本：v1.0  
> 创建日期：2026-01-13  
> 文档状态：规划中

---

## 1. 当前系统功能完成度总览

| 模块 | 完成度 | 状态 | 备注 |
|------|:------:|------|------|
| 库存台账查看 | 100% | ✅ 已完成 | 核心基础功能 |
| 库存变动日志/审计 | 100% | ✅ 已完成 | 审计追溯必需 |
| 场景包管理 | 84% | 🟡 基本完成 | User Story 2-4 待开发 |
| 商品管理 (MDM/PIM) | 77% | 🟡 接近完成 | SKU 价格体系待完善 |
| 门店资源管理 | 58% | 🟠 进行中 | 基本可用 |
| BOM/配方管理 | 53% | 🟠 进行中 | 版本管理、成本核算待开发 |
| 采购供应链 | 31% | 🔴 待完善 | 审批、计划待开发 |
| 订单履约 | 31% | 🔴 待完善 | ⚠️ 支付、出品待开发 |
| 库存管理（完整版） | 21% | 🔴 待完善 | ⚠️ 预占、调拨、盘点待开发 |
| 运营报表 | 0% | ⚫ 完全缺失 | ⚠️ 业务运营必需 |

---

## 2. 功能开发优先级规划

### 2.1 P0 - 核心必须（MVP 闭环）

#### 2.1.1 订单履约模块补全

**当前问题**：订单只有31%完成，支付和出品流程缺失

**现有基础**：
- ✅ 订单状态枚举 `OrderStatus`: PENDING_PAYMENT → PAID → SHIPPED → COMPLETED / CANCELLED
- ✅ 订单控制器 `OrderController`: 列表查询、详情、状态更新
- ✅ 饮品订单服务 `BeverageOrderService`: 包含 mockPay 方法
- ✅ 预约订单服务 `ReservationOrderService`: 完整的预约流程

**需要开发的功能特性**：

##### 2.1.1.1 微信/支付宝支付对接

| 特性 | 描述 | 优先级 |
|------|------|--------|
| 微信小程序支付 | 对接微信支付 JSAPI | P0 |
| 支付宝支付 | 对接支付宝小程序支付 | P1 |
| 支付回调处理 | 接收支付结果通知，更新订单状态 | P0 |
| 支付状态查询 | 主动查询支付状态（补偿机制） | P0 |
| 支付超时处理 | 超时未支付自动取消订单 | P0 |

**接口设计**：
```yaml
APIs:
  - POST /api/orders/{id}/pay           # 发起支付（返回支付参数）
  - POST /api/orders/payment/callback   # 支付回调（微信/支付宝通知）
  - GET  /api/orders/{id}/payment-status # 查询支付状态
  - POST /api/orders/{id}/cancel        # 取消订单
```

**业务流程**：
```
[下单] → [调用支付接口] → [跳转支付页] → [支付成功回调] → [更新订单状态]
                                    ↓
                            [支付失败/取消] → [释放库存预占]
```

##### 2.1.1.2 订单状态机完善

| 当前状态 | 允许转换 | 触发条件 |
|----------|----------|----------|
| PENDING_PAYMENT | PAID | 支付成功回调 |
| PENDING_PAYMENT | CANCELLED | 用户取消/超时 |
| PAID | PRODUCING | 开始制作（饮品订单）|
| PAID | SHIPPED | 发货（商品订单）|
| PAID | CANCELLED | 申请退款 |
| PRODUCING | READY | 制作完成 |
| READY | COMPLETED | 核销取餐 |
| SHIPPED | COMPLETED | 确认收货 |

**状态机实现**：
```java
// 建议使用 Spring StateMachine 或自定义状态机
public enum OrderStatus {
    PENDING_PAYMENT("待支付"),
    PAID("已支付"),
    PRODUCING("制作中"),      // 新增
    READY("待取餐"),          // 新增
    SHIPPED("已发货"),
    COMPLETED("已完成"),
    CANCELLED("已取消"),
    REFUNDING("退款中"),      // 新增
    REFUNDED("已退款");       // 新增
}
```

##### 2.1.1.3 核销码生成与验证

| 特性 | 描述 |
|------|------|
| 核销码生成 | 支付成功后生成唯一核销码（6-8位数字）|
| 二维码生成 | 生成核销二维码供门店扫描 |
| 核销验证 | 门店扫码或输入核销码验证 |
| 防重复核销 | 已核销订单不能重复核销 |
| 核销时效 | 核销码有效期控制（如7天）|

**接口设计**：
```yaml
APIs:
  - GET  /api/orders/{id}/verification-code  # 获取核销码
  - POST /api/orders/verify                   # 核销订单
    Body: { "verificationCode": "123456", "storeId": "xxx" }
```

##### 2.1.1.4 退款处理

| 特性 | 描述 |
|------|------|
| 申请退款 | 用户发起退款申请 |
| 退款审核 | 商家审核退款申请（可选）|
| 原路退回 | 调用支付平台退款接口 |
| 退款回调 | 接收退款结果通知 |
| 库存恢复 | 退款成功后恢复库存 |

**接口设计**：
```yaml
APIs:
  - POST /api/orders/{id}/refund        # 申请退款
  - GET  /api/orders/{id}/refund-status # 查询退款状态
```

**业务价值**：⭐⭐⭐⭐⭐（没有支付，业务无法闭环）

**预估工时**：25-35 人天

---

#### 2.1.2 库存预占/释放机制

**当前问题**：订单下单时无法锁定库存，可能导致超卖

**现有基础**：
- ✅ `InventoryReservation` 实体：支持预占记录
- ✅ `InventoryReservationService`: 预占和释放逻辑
- ✅ `InventoryReservationRepository`: 数据访问层
- ✅ `InventoryDeductionService`: 扣减库存服务
- ✅ 行级锁支持：`SELECT FOR UPDATE` 防止并发问题

**需要开发的功能特性**：

##### 2.1.2.1 订单创建时预占

| 特性 | 描述 |
|------|------|
| 下单预占 | 创建订单时自动调用预占服务 |
| BOM展开 | 成品订单自动展开BOM计算物料需求 |
| 可用性检查 | 检查库存是否充足 |
| 原子操作 | 使用事务+行锁保证原子性 |

**业务流程**：
```
[下单请求] → [展开BOM] → [检查库存] → [锁定库存行] → [扣减可用库存] 
    → [增加预占库存] → [创建预占记录] → [返回订单]
```

**现有代码位置**：
- 预占服务：`InventoryReservationService.reserveInventory()`
- BOM展开：`BomExpansionService.expandBomBatch()`

##### 2.1.2.2 订单取消/超时释放

| 特性 | 描述 |
|------|------|
| 取消释放 | 用户取消订单时释放预占 |
| 超时释放 | 订单超时未支付自动释放 |
| 定时任务 | 每分钟扫描过期预占记录 |
| 释放日志 | 记录释放操作日志 |

**接口设计**：
```yaml
APIs:
  - POST /api/inventory/reservations/release  # 手动释放
    Body: { "orderId": "xxx" }

Scheduled Jobs:
  - ReservationCleanupJob: 每分钟执行，清理过期预占
```

**现有代码位置**：
- 释放服务：`InventoryReservationService.releaseReservation()`
- 过期查询：`InventoryReservationRepository.findExpiredReservations()`

##### 2.1.2.3 支付完成后扣减

| 特性 | 描述 |
|------|------|
| 预占转扣减 | 支付成功后将预占转为实际扣减 |
| 双重验证 | 验证预占数量与库存一致 |
| 流水记录 | 生成库存变动流水 |
| BOM快照 | 使用下单时的BOM快照计算 |

**现有代码位置**：
- 扣减服务：`InventoryDeductionService.deductInventory()`
- 流水记录：`InventoryTransaction`

##### 2.1.2.4 预占超时定时任务

```java
@Scheduled(fixedRate = 60000) // 每分钟执行
public void cleanupExpiredReservations() {
    Instant now = Instant.now();
    List<InventoryReservation> expired = reservationRepository
        .findExpiredReservations(ReservationStatus.ACTIVE, now);
    
    for (InventoryReservation reservation : expired) {
        releaseReservation(reservation.getOrderId());
        // 同时取消对应订单
        orderService.cancelOrder(reservation.getOrderId(), "支付超时自动取消");
    }
}
```

##### 2.1.2.5 预占查询与统计

| 特性 | 描述 |
|------|------|
| 按订单查询 | 查询订单的预占记录 |
| 按SKU查询 | 查询SKU的预占情况 |
| 统计报表 | 当前预占总量、超时率等 |

**接口设计**：
```yaml
APIs:
  - GET /api/inventory/reservations          # 预占列表
  - GET /api/inventory/reservations/{orderId} # 订单预占详情
  - GET /api/inventory/reservations/stats     # 预占统计
```

**业务价值**：⭐⭐⭐⭐⭐（防止超卖，保证数据准确性）

**预估工时**：10-15 人天（大部分代码已存在，需集成和完善）

**核心业务规则**：
```
可用库存 = 现存库存 - 预占库存

预占时机：
- 购物车加入: 软预占（5分钟）
- 提交订单: 硬预占（30分钟）
- 支付完成: 转为实际占用
```

---

### 2.2 P1 - 高优先级（业务运营必需）

#### 2.2.1 运营报表/数据分析

**当前问题**：0%完成，无法了解业务运营状况

**现有基础**：
- ✅ 库存流水表 `inventory_transactions`
- ✅ 订单表 `orders`, `beverage_orders`, `reservation_orders`
- ✅ 库存台账表 `store_inventory`

**需要开发的功能特性**：

##### 2.2.1.1 销售报表

| 报表名称 | 描述 | 统计维度 |
|----------|------|----------|
| 日销售汇总 | 当日销售额、订单数、客单价 | 日期、门店 |
| 销售趋势图 | 周/月销售趋势对比 | 时间范围 |
| 商品销量排行 | TOP 10/20/50 销量商品 | 时间、类目 |
| 门店销售对比 | 各门店销售额对比 | 门店、时间 |
| 时段销售分布 | 各时段销售分布 | 小时 |

**接口设计**：
```yaml
APIs:
  - GET /api/reports/sales/daily          # 日销售汇总
  - GET /api/reports/sales/trend          # 销售趋势
  - GET /api/reports/sales/ranking        # 商品排行
  - GET /api/reports/sales/by-store       # 门店对比
  - GET /api/reports/sales/by-hour        # 时段分布
```

**示例查询**：
```sql
-- 日销售汇总
SELECT 
    DATE(created_at) as sale_date,
    COUNT(*) as order_count,
    SUM(total_amount) as total_sales,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE status IN ('PAID', 'COMPLETED')
  AND created_at BETWEEN :start_date AND :end_date
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;
```

##### 2.2.1.2 库存报表

| 报表名称 | 描述 | 统计维度 |
|----------|------|----------|
| 库存概览 | 各门店库存汇总 | 门店、类目 |
| 库存周转率 | SKU/类目周转率分析 | 时间、商品 |
| 库存预警 | 低库存/超库存商品清单 | 门店、状态 |
| 盘点差异 | 盘点差异统计报表 | 时间、门店 |
| 库存成本 | 库存占用资金分析 | 类目、门店 |

**接口设计**：
```yaml
APIs:
  - GET /api/reports/inventory/overview     # 库存概览
  - GET /api/reports/inventory/turnover     # 周转率
  - GET /api/reports/inventory/alerts       # 预警列表
  - GET /api/reports/inventory/cost         # 成本分析
```

**周转率计算公式**：
```
库存周转率 = 销售成本 / 平均库存成本
平均库存 = (期初库存 + 期末库存) / 2
周转天数 = 365 / 库存周转率
```

##### 2.2.1.3 运营看板

| 看板 | 指标 |
|------|------|
| 实时销售看板 | 今日销售额、订单数、实时订单流 |
| 库存预警看板 | 低库存数量、超库存数量、预警商品列表 |
| 订单状态看板 | 待处理订单、异常订单、今日完成率 |

**前端组件**：
```typescript
// 看板数据结构
interface DashboardData {
  // 销售概览
  todaySales: number;
  todayOrders: number;
  avgOrderValue: number;
  salesTrend: { date: string; amount: number }[];
  
  // 库存预警
  lowStockCount: number;
  overStockCount: number;
  alertItems: AlertItem[];
  
  // 订单状态
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  completionRate: number;
}
```

##### 2.2.1.4 数据导出

| 特性 | 描述 |
|------|------|
| Excel导出 | 支持所有报表导出Excel |
| 字段选择 | 用户可选择导出字段 |
| 大数据量 | 支持分页导出、异步导出 |
| 定时报表 | 支持定时发送报表邮件 |

**接口设计**：
```yaml
APIs:
  - POST /api/reports/export              # 导出报表
    Body: {
      "reportType": "sales_daily",
      "format": "xlsx",
      "dateRange": { "start": "2026-01-01", "end": "2026-01-13" },
      "columns": ["date", "orderCount", "totalSales"]
    }
  - GET /api/reports/export/{taskId}      # 查询导出状态
```

**业务价值**：⭐⭐⭐⭐（没有报表，无法了解业务状况）

**预估工时**：30-40 人天

---

#### 2.2.2 库存操作管理后端逻辑

**当前问题**：界面已完成，但后端业务逻辑未实现

**现有基础**：
- ✅ `GoodsReceiptService`: 采购收货入库
- ✅ `InventoryAdjustment`: 库存调整实体
- ✅ `ApprovalService`: 审批服务
- ✅ 前端界面已完成

**需要开发的功能特性**：

##### 2.2.2.1 入库操作 API

| 入库类型 | 描述 | API |
|----------|------|-----|
| 采购入库 | 关联采购单入库 | ✅ 已有 |
| 调拨入库 | 接收调拨商品 | ❌ 待开发 |
| 盘盈入库 | 盘点发现多余 | ❌ 待开发 |
| 退货入库 | 客户退货 | ❌ 待开发 |

**接口设计**：
```yaml
APIs:
  - POST /api/inventory/inbound           # 通用入库
    Body: {
      "type": "TRANSFER_IN | STOCKTAKING_SURPLUS | RETURN_IN",
      "storeId": "xxx",
      "items": [
        { "skuId": "xxx", "quantity": 10, "reason": "..." }
      ],
      "relatedDocNumber": "TR202601130001",  # 关联单号
      "remarks": "备注"
    }
```

##### 2.2.2.2 出库操作 API

| 出库类型 | 描述 | API |
|----------|------|-----|
| 销售出库 | 订单发货 | ✅ 已有 |
| 调拨出库 | 调拨到其他门店 | ❌ 待开发 |
| 报损出库 | 商品损坏 | ❌ 待开发 |
| 领用出库 | 内部领用 | ❌ 待开发 |

**接口设计**：
```yaml
APIs:
  - POST /api/inventory/outbound          # 通用出库
    Body: {
      "type": "TRANSFER_OUT | DAMAGE | INTERNAL_USE",
      "storeId": "xxx",
      "items": [
        { "skuId": "xxx", "quantity": 10, "reason": "..." }
      ],
      "remarks": "备注"
    }
```

**出库校验规则**：
```java
public void validateOutbound(OutboundRequest request) {
    for (OutboundItem item : request.getItems()) {
        Inventory inventory = inventoryRepository
            .findByStoreIdAndSkuId(request.getStoreId(), item.getSkuId())
            .orElseThrow(() -> new InventoryNotFoundException());
        
        // 检查可用库存
        BigDecimal available = inventory.getOnHandQty()
            .subtract(inventory.getReservedQty());
        
        if (available.compareTo(item.getQuantity()) < 0) {
            throw new InsufficientInventoryException(
                "SKU " + item.getSkuId() + " 可用库存不足"
            );
        }
    }
}
```

##### 2.2.2.3 报损申请与审批

| 特性 | 描述 |
|------|------|
| 报损申请 | 提交报损申请（原因、数量、照片）|
| 自动审批 | 报损金额 < 500元自动通过 |
| 主管审批 | 500-2000元需主管审批 |
| 高层审批 | >2000元需高层审批 |
| 审批通过 | 自动扣减库存 |

**现有代码位置**：
- 审批服务：`ApprovalService.approve()`, `ApprovalService.reject()`
- 审批阈值：`APPROVAL_THRESHOLD = 1000`

**报损原因类型**：
```typescript
enum DamageReason {
  EXPIRED = 'EXPIRED',           // 商品过期
  BROKEN = 'BROKEN',             // 商品破损
  NATURAL_LOSS = 'NATURAL_LOSS', // 自然损耗
  CUSTOMER_COMPLAINT = 'CUSTOMER_COMPLAINT', // 客户投诉
  OTHER = 'OTHER'                // 其他原因
}
```

**业务价值**：⭐⭐⭐⭐

**预估工时**：15-20 人天

---

#### 2.2.3 调拨管理

**当前问题**：界面完成，后端逻辑待开发

**需要开发的功能特性**：

##### 2.2.3.1 调拨申请

| 特性 | 描述 |
|------|------|
| 创建申请 | 选择调出/调入门店，添加商品 |
| 库存校验 | 自动检查调出方可用库存 |
| 紧急标记 | 支持标记紧急调拨 |
| 申请审核 | 提交审核流程 |

**接口设计**：
```yaml
APIs:
  - POST /api/inventory/transfers         # 创建调拨单
    Body: {
      "fromStoreId": "xxx",
      "toStoreId": "yyy",
      "isUrgent": false,
      "reason": "门店补货",
      "items": [
        { "skuId": "xxx", "quantity": 10 }
      ]
    }
  - GET /api/inventory/transfers          # 调拨单列表
  - GET /api/inventory/transfers/{id}     # 调拨单详情
```

##### 2.2.3.2 调拨审批

| 特性 | 描述 |
|------|------|
| 审批通过 | 调拨单进入待出库状态 |
| 审批拒绝 | 调拨单状态变为已拒绝 |
| 撤回 | 申请人可撤回未审批的申请 |

**接口设计**：
```yaml
APIs:
  - PUT /api/inventory/transfers/{id}/approve  # 审批通过
  - PUT /api/inventory/transfers/{id}/reject   # 审批拒绝
  - PUT /api/inventory/transfers/{id}/withdraw # 撤回
```

##### 2.2.3.3 调拨出库

| 特性 | 描述 |
|------|------|
| 确认出库 | 调出方确认实际出库数量 |
| 扣减库存 | 自动扣减调出方库存 |
| 状态更新 | 调拨单进入在途状态 |
| 物流信息 | 录入物流单号 |

**接口设计**：
```yaml
APIs:
  - PUT /api/inventory/transfers/{id}/ship    # 调拨出库
    Body: {
      "actualItems": [
        { "skuId": "xxx", "actualQuantity": 10 }
      ],
      "logisticsCompany": "顺丰快递",
      "trackingNumber": "SF123456789"
    }
```

##### 2.2.3.4 调拨收货

| 特性 | 描述 |
|------|------|
| 确认收货 | 调入方确认实际收到数量 |
| 增加库存 | 自动增加调入方库存 |
| 差异记录 | 记录实收与出库差异 |
| 完成状态 | 调拨单状态变为已完成 |

**接口设计**：
```yaml
APIs:
  - PUT /api/inventory/transfers/{id}/receive # 调拨收货
    Body: {
      "actualItems": [
        { "skuId": "xxx", "receivedQuantity": 9, "remarks": "破损1件" }
      ]
    }
```

##### 2.2.3.5 调拨状态机

```
[待审核] → [待出库] → [在途中] → [待收货] → [已完成]
     ↓            ↓           ↓          ↓
 [已拒绝]    [已撤回]   [异常]    [部分收货]
```

**数据模型**：
```java
@Entity
@Table(name = "inventory_transfers")
public class InventoryTransfer {
    @Id
    private UUID id;
    
    private String transferNumber;     // 调拨单号
    private UUID fromStoreId;          // 调出门店
    private UUID toStoreId;            // 调入门店
    private TransferStatus status;     // 调拨状态
    private Boolean isUrgent;          // 是否紧急
    private String reason;             // 调拨原因
    private String logisticsCompany;   // 物流公司
    private String trackingNumber;     // 物流单号
    
    private UUID createdBy;            // 创建人
    private UUID approvedBy;           // 审批人
    private Instant createdAt;
    private Instant approvedAt;
    private Instant shippedAt;
    private Instant receivedAt;
    
    @OneToMany(mappedBy = "transfer")
    private List<InventoryTransferItem> items;
}
```

**业务价值**：⭐⭐⭐⭐

**预估工时**：18-22 人天

---

### 2.3 P2 - 中优先级（体验优化）

#### 2.3.1 盘点模块

**建议功能**：
- [ ] 盘点计划创建（全盘/抽盘/循环盘/动碰盘）
- [ ] 盘点任务分配
- [ ] 移动端扫码盘点
- [ ] 盘盈盘亏自动计算
- [ ] 盘点差异审核
- [ ] 库存自动调整
- [ ] 盘点报表生成

**业务价值**：⭐⭐⭐

**预估工时**：15-20 人天

**审核规则**：
```
🟢 差异率 < 5%: 自动通过
🟡 差异率 5%-10%: 主管审核
🔴 差异率 > 10%: 重新盘点 或 高层审批
```

---

#### 2.3.2 采购供应链补全

**当前问题**：只有31%完成

**建议功能**：
- [ ] 采购计划管理（基于库存预警自动生成）
- [ ] 采购审批流程
- [ ] 供应商管理完善
- [ ] 收货验收流程
- [ ] 采购入库确认
- [ ] 采购报表统计

**业务价值**：⭐⭐⭐

**预估工时**：15-20 人天

---

#### 2.3.3 场景包管理补全

**当前问题**：User Story 2-4未完成（约 46% 待开发）

**建议功能**：
- [ ] User Story 2: 内容配置（权益、物品、服务关联）
- [ ] User Story 3: 定价管理（实时价格计算）
- [ ] User Story 4: 发布/下架流程
- [ ] 场景包预览

**业务价值**：⭐⭐⭐

**预估工时**：50-60 小时（参考现有文档）

---

### 2.4 P3 - 增值功能（商业化增强）

#### 2.4.1 会员中心（新模块）

**建议功能**：
- [ ] 会员注册/登录
- [ ] 会员等级体系
- [ ] 积分账户管理
- [ ] 积分规则配置
- [ ] 会员权益配置
- [ ] 会员画像标签

**业务价值**：⭐⭐⭐⭐

**预估工时**：30-40 人天

**领域模型**：
```
会员聚合根
├── Member (会员)
│   ├── 基础信息
│   ├── 等级信息
│   ├── 积分账户
│   └── 标签列表
├── MemberLevel (等级)
│   ├── 等级规则
│   └── 权益配置
├── PointAccount (积分账户)
│   ├── 可用积分
│   ├── 冻结积分
│   └── 过期积分
└── PointTransaction (积分流水)
```

---

#### 2.4.2 营销中心（新模块）

**建议功能**：

**优惠券管理**
- [ ] 满减券、折扣券、代金券
- [ ] 发放规则配置
- [ ] 核销规则配置
- [ ] 券批次管理

**促销活动**
- [ ] 限时折扣
- [ ] 满减活动
- [ ] 组合套餐优惠

**营销工具（可选）**
- [ ] 秒杀活动
- [ ] 拼团活动
- [ ] 分销功能

**业务价值**：⭐⭐⭐⭐

**预估工时**：40-50 人天

---

#### 2.4.3 结算对账（新模块）

**建议功能**：
- [ ] 支付流水管理
- [ ] 退款流水管理
- [ ] 日结/月结报表
- [ ] 财务对账
- [ ] 租户分账（SaaS场景）

**业务价值**：⭐⭐⭐⭐⭐

**预估工时**：35-45 人天

---

## 3. 建议开发路线图

### 3.1 阶段规划

```
Phase 1: 核心闭环 (4-6周)
├── 订单支付对接 ⭐⭐⭐⭐⭐
├── 库存预占/释放机制 ⭐⭐⭐⭐⭐
└── 基础销售报表 ⭐⭐⭐⭐

Phase 2: 库存完善 (3-4周)
├── 库存操作后端逻辑
├── 调拨管理
└── 盘点模块

Phase 3: 运营支撑 (3-4周)
├── 完整报表体系
├── 运营看板
└── 采购供应链补全

Phase 4: 营销增值 (6-8周)
├── 会员中心
├── 营销中心
└── 结算对账
```

### 3.2 里程碑

| 里程碑 | 预计时间 | 交付物 | 业务意义 |
|--------|----------|--------|----------|
| M1 | +6周 | 支付+预占完成 | 业务闭环可用 |
| M2 | +10周 | 库存操作完善 | 运营效率提升 |
| M3 | +14周 | 报表体系上线 | 数据驱动决策 |
| M4 | +22周 | 会员营销上线 | 商业化增强 |

---

## 4. 工作量估算汇总

| 优先级 | 功能模块 | 预估人天 |
|:------:|----------|:--------:|
| P0 | 订单履约模块补全 | 25 |
| P0 | 库存预占/释放机制 | 12 |
| P1 | 运营报表/数据分析 | 30 |
| P1 | 库存操作管理后端 | 17 |
| P1 | 调拨管理 | 17 |
| P2 | 盘点模块 | 17 |
| P2 | 采购供应链补全 | 17 |
| P2 | 场景包管理补全 | 8 |
| P3 | 会员中心 | 35 |
| P3 | 营销中心 | 45 |
| P3 | 结算对账 | 40 |
| **总计** | - | **263** |

---

## 5. 风险与建议

### 5.1 关键风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 支付对接延迟 | 业务无法闭环 | 提前申请支付接口资质 |
| 库存超卖 | 客户投诉 | 优先实现预占机制 |
| 无数据分析 | 无法决策 | 报表与业务开发并行 |
| 会员营销缺失 | 复购率低 | Phase 4 集中开发 |

### 5.2 开发建议

1. **最紧迫需要完成的功能**：
   - **订单支付** - 没有支付，业务无法闭环
   - **库存预占** - 防止超卖，保证数据准确性
   - **运营报表** - 没有报表，无法了解业务状况

2. **建议先集中精力完成 P0 和 P1 的功能**，形成完整的业务闭环后，再考虑会员、营销等增值功能

3. **采用敏捷迭代方式**，每 2 周交付一个可用功能点

4. **关注技术债务**，在新功能开发同时做好代码重构

---

## 6. 变更记录

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| v1.0 | 2026-01-13 | - | 初始版本，基于系统现状分析 |

---

## 7. 相关文档

- [业务需求规约文档](../业务需求规约文档.md)
- [产品功能文档](../产品功能文档.md)
- [微服务架构拆分方案](./[todo]微服务架构拆分方案.md)
- [场景包预订核心功能需求规约](./场景包预订核心功能需求规约.md)
