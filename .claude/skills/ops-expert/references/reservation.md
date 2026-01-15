# 预约管理规则

本文档描述预约订单（Reservation）的业务规则和管理流程。

---

## 数据模型

### 基本信息

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 唯一标识 |
| order_no | String | 订单号（唯一） |
| user_id | UUID | 用户 ID |
| store_id | UUID | 门店 ID |
| hall_id | UUID | 影厅 ID |
| scenario_package_id | UUID | 场景包 ID |
| status | Enum | 状态 |
| reservation_date | Date | 预约日期 |
| start_time | Time | 开始时间 |
| end_time | Time | 结束时间 |
| total_amount | Decimal | 总金额 |
| deposit_amount | Decimal | 押金金额 |
| contact_name | String | 联系人姓名 |
| contact_phone | String | 联系电话 |
| remark | Text | 备注 |

---

## 状态流转

```
     创建预约
         │
         ▼
    ┌─────────┐
    │ PENDING │──────────────────────────────┐
    │ (待确认) │                              │
    └────┬────┘                              │
         │ 商家确认                           │ 取消
         ▼                                   │
   ┌───────────┐                             │
   │ CONFIRMED │────────────────┐            │
   │ (已确认)  │                │            │
   └─────┬─────┘                │            │
         │ 服务完成              │ 取消        │
         ▼                      │            │
   ┌───────────┐                │            │
   │ COMPLETED │                │            │
   │ (已完成)  │                │            │
   └───────────┘                │            │
                                ▼            ▼
                          ┌───────────┐
                          │ CANCELLED │
                          │ (已取消)  │
                          └───────────┘
```

### 状态说明

| 状态 | 英文 | 说明 | 可取消 |
|-----|------|------|--------|
| 待确认 | PENDING | 用户已提交，等待商家确认 | 是 |
| 已确认 | CONFIRMED | 商家已确认，等待履约 | 需审核 |
| 已完成 | COMPLETED | 服务已完成 | 否 |
| 已取消 | CANCELLED | 订单已取消 | - |

---

## 预约时间规则

### 时间约束

1. **工作日时段**: 按门店设置的 weekday_start_time ~ weekday_end_time
2. **周末时段**: 按门店设置的 weekend_start_time ~ weekend_end_time
3. **时长单位**: 预约时长必须是 duration_unit 的整数倍

### 提前量约束

1. **最小提前时间**: 不能预约 min_advance_hours 小时内的时段
2. **最大提前天数**: 不能预约 max_advance_days 天后的时段

### 示例

```sql
-- 门店设置
-- min_advance_hours = 24
-- max_advance_days = 30

-- 假设今天是 2025-01-01 10:00
-- 可预约范围: 2025-01-02 10:00 ~ 2025-01-31 23:59
```

---

## 常用查询

### 查询预约列表

```sql
SELECT
    r.order_no, r.reservation_date, r.start_time, r.end_time,
    r.status, r.total_amount,
    s.name as store_name,
    h.name as hall_name,
    sp.name as package_name
FROM reservations r
LEFT JOIN stores s ON r.store_id = s.id
LEFT JOIN halls h ON r.hall_id = h.id
LEFT JOIN scenario_packages sp ON r.scenario_package_id = sp.id
ORDER BY r.created_at DESC
LIMIT 100;
```

### 按状态查询

```sql
-- 待确认订单
SELECT * FROM reservations WHERE status = 'PENDING' ORDER BY created_at;

-- 已确认待履约
SELECT * FROM reservations
WHERE status = 'CONFIRMED'
  AND reservation_date >= CURRENT_DATE
ORDER BY reservation_date, start_time;
```

### 按门店查询

```sql
SELECT
    r.*,
    h.name as hall_name
FROM reservations r
JOIN halls h ON r.hall_id = h.id
WHERE r.store_id = '门店ID'
ORDER BY r.reservation_date DESC;
```

### 按日期范围查询

```sql
-- 本周预约
SELECT * FROM reservations
WHERE reservation_date >= DATE_TRUNC('week', CURRENT_DATE)
  AND reservation_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
ORDER BY reservation_date, start_time;

-- 今日预约
SELECT * FROM reservations
WHERE reservation_date = CURRENT_DATE
ORDER BY start_time;
```

### 预约统计

```sql
-- 按状态统计
SELECT status, COUNT(*) as count
FROM reservations
GROUP BY status;

-- 按门店统计本月订单
SELECT
    s.name as store_name,
    COUNT(r.id) as order_count,
    SUM(r.total_amount) as total_revenue
FROM reservations r
JOIN stores s ON r.store_id = s.id
WHERE r.reservation_date >= DATE_TRUNC('month', CURRENT_DATE)
  AND r.status IN ('CONFIRMED', 'COMPLETED')
GROUP BY s.id, s.name
ORDER BY total_revenue DESC;

-- 按日期统计
SELECT
    reservation_date,
    COUNT(*) as order_count,
    SUM(total_amount) as daily_revenue
FROM reservations
WHERE status IN ('CONFIRMED', 'COMPLETED')
GROUP BY reservation_date
ORDER BY reservation_date DESC
LIMIT 30;
```

### 查询时段冲突

```sql
-- 检查某影厅某日期是否有时段冲突
SELECT id, start_time, end_time, status
FROM reservations
WHERE hall_id = '影厅ID'
  AND reservation_date = '2025-01-15'
  AND status IN ('PENDING', 'CONFIRMED')
ORDER BY start_time;
```

---

## 操作指南

### 确认预约

1. 检查时段是否可用（无冲突）
2. 检查场景包是否仍然有效
3. 执行确认：`UPDATE reservations SET status = 'CONFIRMED' WHERE id = ?`
4. 通知用户确认结果

### 完成预约

1. 确认服务已完成
2. 执行完成：`UPDATE reservations SET status = 'COMPLETED' WHERE id = ?`
3. 处理押金退还

### 取消预约

1. 检查当前状态是否可取消
2. 检查取消时间是否在允许范围
3. 执行取消：`UPDATE reservations SET status = 'CANCELLED' WHERE id = ?`
4. 处理退款（如适用）

---

## 押金规则

### 押金收取

- 根据门店设置的 `deposit_required` 决定是否收取
- 押金金额按门店设置的 `deposit_amount`

### 押金退还

| 场景 | 退还规则 |
|-----|---------|
| 服务完成 | 全额退还 |
| 用户取消（提前24小时） | 全额退还 |
| 用户取消（24小时内） | 扣除50% |
| 用户爽约 | 不退还 |
| 商家取消 | 全额退还 |

---

## 注意事项

1. **订单号**自动生成，不可修改
2. **待确认订单**应在 24 小时内处理，避免用户等待过久
3. **时段冲突**检查应在确认时再次验证
4. **取消订单**需要记录取消原因，便于统计分析
5. **押金处理**应与财务系统对接，确保准确
