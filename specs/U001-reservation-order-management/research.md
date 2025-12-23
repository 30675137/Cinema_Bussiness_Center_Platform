# Research Document: 预约单管理系统

**Feature**: U001-reservation-order-management
**Date**: 2025-12-23
**Status**: Complete

---

## 1. 依赖模块 API 契约清单

### 1.1 场景包主表 (scenario_packages)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | UUID | 场景包唯一标识 |
| `name` | VARCHAR(255) | 场景包名称 |
| `description` | TEXT | 描述信息 |
| `image` | TEXT | 图片 URL |
| `status` | VARCHAR(20) | 状态: DRAFT/PUBLISHED/UNPUBLISHED |
| `category` | VARCHAR(50) | 分类: MOVIE/TEAM/PARTY |
| `rating` | DECIMAL(3,2) | 评分(0-5分) |
| `tags` | JSONB | 标签数组 |
| `version_lock` | INTEGER | 乐观锁版本号 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |
| `deleted_at` | TIMESTAMPTZ | 软删除时间 |

**相关 API**:
- `GET /api/scenario-packages/{id}` - 获取场景包详情
- `GET /api/scenario-packages/published` - 获取已发布场景包列表(C端)

---

### 1.2 套餐档位表 (package_tiers)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | UUID | 套餐唯一标识 |
| `package_id` | UUID | 关联场景包 ID (FK) |
| `name` | VARCHAR(100) | 套餐名称 |
| `price` | DECIMAL(10,2) | 售价(元) |
| `original_price` | DECIMAL(10,2) | 原价(可选) |
| `tags` | JSONB | 标签数组 |
| `service_description` | TEXT | 服务内容描述 |
| `sort_order` | INTEGER | 排序顺序 |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

**约束**:
- `CHECK (price > 0)`
- `FK (package_id) REFERENCES scenario_packages(id) ON DELETE CASCADE`

**索引**:
- `idx_tier_package ON package_tiers(package_id, sort_order)`

---

### 1.3 加购项表 (addon_items)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | UUID | 加购项唯一标识 |
| `name` | VARCHAR(100) | 加购项名称 |
| `price` | DECIMAL(10,2) | 单价(元) |
| `category` | VARCHAR(50) | 分类: Food/Drink/Service/Decoration |
| `image_url` | TEXT | 图片 |
| `max_quantity` | INTEGER | 单次最大数量(默认 99) |
| `is_active` | BOOLEAN | 是否启用(默认 true) |
| `created_at` | TIMESTAMPTZ | 创建时间 |

**约束**:
- `CHECK (price > 0)`
- `CHECK (category IN ('CATERING', 'BEVERAGE', 'SERVICE', 'DECORATION'))`

**相关 API**:
- `GET /api/addon-items` - 获取所有启用的加购项

---

### 1.4 场景包-加购项关联表 (package_addons)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | UUID | 关联记录 ID |
| `package_id` | UUID | 场景包 ID (FK) |
| `addon_item_id` | UUID | 加购项 ID (FK) |
| `sort_order` | INTEGER | 排序顺序 |
| `is_required` | BOOLEAN | 是否必选 |

**约束**:
- `UNIQUE(package_id, addon_item_id)`

---

### 1.5 时段模板表 (time_slot_templates)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | UUID | 时段模板 ID |
| `package_id` | UUID | 关联场景包 ID (FK) |
| `day_of_week` | INTEGER | 星期几(0=周日, 1=周一, ..., 6=周六) |
| `start_time` | TIME | 开始时间 |
| `end_time` | TIME | 结束时间 |
| `capacity` | INTEGER | 预约容量(可选) |
| `price_adjustment` | JSONB | 价格调整 {"type": "PERCENTAGE"|"FIXED", "value": number} |
| `is_enabled` | BOOLEAN | 是否启用(默认 true) |
| `created_at` | TIMESTAMPTZ | 创建时间 |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

**约束**:
- `CHECK (day_of_week BETWEEN 0 AND 6)`
- `CHECK (end_time > start_time)`
- `FK (package_id) REFERENCES scenario_packages(id) ON DELETE CASCADE`

**索引**:
- `idx_tst_package ON time_slot_templates(package_id)`
- `idx_tst_enabled ON time_slot_templates(package_id, is_enabled) WHERE is_enabled = true`

---

### 1.6 时段库存表 (time_slot_inventory)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `id` | UUID | 库存记录 ID |
| `scenario_package_id` | UUID | 场景包 ID (FK) |
| `date` | DATE | 具体日期 |
| `time_slot` | VARCHAR(20) | 时段标识(如 "10:00-14:00") |
| `total_capacity` | INTEGER | 总容量 |
| `booked_count` | INTEGER | 已预订数量(默认 0) |
| `available_count` | INTEGER | 剩余容量(计算字段) |
| `updated_at` | TIMESTAMPTZ | 更新时间 |

**约束**:
- `UNIQUE(scenario_package_id, date, time_slot)`
- `CHECK (total_capacity > 0)`
- `CHECK (booked_count >= 0 AND booked_count <= total_capacity)`

**计算字段**:
```sql
available_count INTEGER GENERATED ALWAYS AS (total_capacity - booked_count) STORED
```

---

## 2. 库存管理并发控制方案

### 2.1 方案选择: 乐观锁 + 数据库约束

**决策**: 使用**数据库层原子性 UPDATE + 应用层乐观锁**双重保障

**实现方式**:

1. **数据库层原子性更新**:
```sql
-- 扣减库存(预约创建时)
UPDATE time_slot_inventory 
SET booked_count = booked_count + 1, updated_at = NOW()
WHERE scenario_package_id = :packageId 
  AND date = :date 
  AND time_slot = :timeSlot 
  AND booked_count < total_capacity
RETURNING id;
-- 如果返回空则表示库存不足

-- 释放库存(预约取消时)
UPDATE time_slot_inventory 
SET booked_count = booked_count - 1, updated_at = NOW()
WHERE scenario_package_id = :packageId 
  AND date = :date 
  AND time_slot = :timeSlot 
  AND booked_count > 0;
```

2. **应用层乐观锁** (预约单表):
```java
@Entity
@Table(name = "reservation_orders")
public class ReservationOrder {
    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;
    // ...
}
```

**优势**:
- 数据库层保证库存扣减的原子性,无需分布式锁
- CHECK 约束防止库存负数: `CHECK (booked_count >= 0 AND booked_count <= total_capacity)`
- 应用层乐观锁防止预约单状态并发修改冲突

---

## 3. 预约单号生成算法

### 3.1 格式规范

**格式**: `R + yyyyMMddHHmmss + 4位随机数`

**示例**: `R202512231530001234`

**长度**: 19 位固定长度

### 3.2 算法实现

```java
public class ReservationNumberGenerator {
    private static final String PREFIX = "R";
    private static final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyyMMddHHmmss");
    private static final Random RANDOM = new Random();
    
    public String generate() {
        String timestamp = DATE_FORMAT.format(new Date());
        String randomPart = String.format("%04d", RANDOM.nextInt(10000));
        return PREFIX + timestamp + randomPart;
    }
}
```

### 3.3 唯一性保障

1. **时间戳**: 精确到秒,确保大致有序
2. **随机数**: 4 位随机数降低同一秒内冲突概率(最多 10000 笔/秒)
3. **数据库约束**: UNIQUE 索引作为最终保障

```sql
CREATE UNIQUE INDEX idx_reservation_number ON reservation_orders(order_number);
```

**冲突处理**: 如果插入时违反 UNIQUE 约束,则捕获异常并重新生成单号(重试最多 3 次)

---

## 4. 状态机图和状态转换验证表

### 4.1 状态机图

```
                    ┌─────────────────────────────────────────────────────┐
                    │                                                     │
                    ▼                                                     │
┌─────────────┐  confirm(requiresPayment=true)  ┌─────────────┐  pay()  ┌─────────────┐
│   PENDING   │ ───────────────────────────────▶│  CONFIRMED  │────────▶│  COMPLETED  │
│  (待确认)   │                                 │  (已确认)   │         │  (已完成)   │
└─────────────┘                                 └─────────────┘         └─────────────┘
       │                                              │                        ▲
       │ confirm(requiresPayment=false)               │                        │
       └──────────────────────────────────────────────┼────────────────────────┘
                                                      │
       │                                              │
       │ cancel()                                     │ cancel()
       ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CANCELLED (已取消)                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 状态转换规则表

| 当前状态 | 操作 | 目标状态 | 条件 |
|----------|------|----------|------|
| PENDING | confirm(requiresPayment=true) | CONFIRMED | 运营人员确认,要求支付 |
| PENDING | confirm(requiresPayment=false) | COMPLETED | 运营人员确认,无需支付(如企业团建) |
| PENDING | cancel(reason) | CANCELLED | 运营人员取消 + 用户自主取消 |
| PENDING | timeout(24h) | CANCELLED | 自动超时取消(定时任务) |
| CONFIRMED | pay() | COMPLETED | 用户完成支付 |
| CONFIRMED | cancel(reason) | CANCELLED | 运营人员取消(退款处理) |
| CONFIRMED | timeout(24h) | CANCELLED | 支付超时自动取消 |
| COMPLETED | - | - | 终态,不可变更 |
| CANCELLED | - | - | 终态,不可变更 |

### 4.3 非法状态转换(必须阻止)

| 当前状态 | 非法操作 | 阻止原因 |
|----------|----------|----------|
| COMPLETED | cancel | 已完成的预约单无法取消,需走退款流程 |
| COMPLETED | confirm | 已完成状态不需要再次确认 |
| CANCELLED | confirm | 已取消的预约单不可恢复 |
| CANCELLED | pay | 已取消的预约单不可支付 |
| CONFIRMED | confirm | 重复确认无意义 |

---

## 5. API 响应格式标准

### 5.1 统一响应结构 (ApiResponse)

项目中存在两个版本的 ApiResponse,**推荐使用 `com.cinema.hallstore.dto.ApiResponse`**:

```java
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private final T data;           // 成功时返回数据
    private final String error;     // 错误码
    private final String message;   // 错误信息
    private final Object details;   // 错误详情
    private final Instant timestamp;// 响应时间戳

    public static <T> ApiResponse<T> success(T data);
    public static <T> ApiResponse<T> failure(String error, String message, Object details);
}
```

### 5.2 成功响应格式

**单个资源**:
```json
{
  "data": {
    "id": "uuid",
    "orderNumber": "R202512230001",
    "status": "CONFIRMED"
  },
  "timestamp": "2025-12-23T15:00:00Z"
}
```

**列表资源**:
```json
{
  "data": [...],
  "total": 100,
  "timestamp": "2025-12-23T15:00:00Z"
}
```

### 5.3 错误响应格式

```json
{
  "error": "INSUFFICIENT_INVENTORY",
  "message": "该时段预约已满,请选择其他时段",
  "details": {
    "timeSlotId": "uuid",
    "requestedDate": "2025-12-25"
  },
  "timestamp": "2025-12-23T15:00:00Z"
}
```

### 5.4 预约单模块错误码

| 错误码 | HTTP Status | 说明 |
|--------|-------------|------|
| INSUFFICIENT_INVENTORY | 400 | 库存不足 |
| INVALID_STATUS_TRANSITION | 400 | 非法状态转换 |
| RESERVATION_NOT_FOUND | 404 | 预约单不存在 |
| CONCURRENT_UPDATE_CONFLICT | 409 | 并发更新冲突(乐观锁) |
| VALIDATION_ERROR | 400 | 参数验证失败 |
| UNAUTHORIZED | 401 | 未授权 |
| FORBIDDEN | 403 | 权限不足 |

---

## 6. 用户认证机制

### 6.1 JWT Token 认证

**请求头格式**:
```
Authorization: Bearer <token>
```

**Token 解析**:
- C端用户 API: 从 JWT Token 中解析 `user_id`
- B端管理 API: 从 JWT Token 中解析 `operator_id` 和 `roles`

### 6.2 权限控制

| API 类型 | 认证方式 | 权限要求 |
|----------|----------|----------|
| C端用户 API | JWT Token | 登录用户 |
| B端管理 API | JWT Token + Role | ADMIN / OPERATOR 角色 |

---

## 7. 待确认事项

### 7.1 已解决

- [x] Q1: 时段库存管理模块提供原子性扣减 API ✅ (数据库层实现)
- [x] Q2: API 响应格式使用 ApiResponse 统一包装 ✅
- [x] Q3: 乐观锁使用 JPA @Version 注解实现 ✅
- [x] Q4: UUID 扩展已启用 (`gen_random_uuid()`) ✅

### 7.2 待确认

- [ ] Q5: 24小时自动取消定时任务采用 Spring Scheduler 还是 Supabase Edge Functions?
  - **建议**: Spring Boot @Scheduled,每小时扫描一次
- [ ] Q6: C端"我的预约"是否需要实时推送?
  - **建议**: 初期使用轮询(5分钟间隔),后续考虑 WebSocket
- [ ] Q7: 通知服务(短信/站内消息)的调用接口?
  - **待实现**: 创建 NotificationService 接口,先用日志模拟

---

## 8. 参考文档

- [场景包管理规格](../017-scenario-package/spec.md)
- [时段库存管理规格](../016-store-reservation-settings/spec.md)
- [API 响应格式问题总结](../../docs/问题总结/014-API响应格式不一致问题.md)
- [项目宪法](../../.specify/memory/constitution.md)

---

**Research Complete**: 2025-12-23
**Ready for Phase 1 Implementation**: Yes
