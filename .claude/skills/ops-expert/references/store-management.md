# 门店管理规则

本文档描述门店（Store）的业务规则和管理流程。

---

## 数据模型

### 基本信息

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 唯一标识 |
| name | String | 门店名称 |
| code | String | 门店编码（唯一） |
| status | Enum | 状态：ACTIVE/INACTIVE |
| province | String | 省份 |
| city | String | 城市 |
| district | String | 区县 |
| address | Text | 详细地址 |
| phone | String | 联系电话 |

### 关联数据

- **影厅 (halls)**: 一对多关系，一个门店有多个影厅
- **预约设置 (store_reservation_settings)**: 一对一关系
- **预约订单 (reservations)**: 一对多关系

---

## 状态管理

### 状态说明

| 状态 | 英文 | 说明 | 影响 |
|-----|------|------|------|
| 启用 | ACTIVE | 正常营业 | 可接受预约，对外展示 |
| 停用 | INACTIVE | 暂停营业 | 不接受新预约，不对外展示 |

### 状态变更规则

**启用 → 停用**:
- 检查是否有待履约的预约订单
- 如有，需要先处理（完成、取消或转移）
- 停用后，关联的影厅也会停止接受预约

**停用 → 启用**:
- 检查门店信息是否完整
- 检查预约设置是否配置
- 启用后恢复正常营业

---

## 常用查询

### 查询所有门店

```sql
SELECT id, name, code, city, status, phone
FROM stores
ORDER BY created_at DESC;
```

### 查询启用的门店

```sql
SELECT id, name, code, city
FROM stores
WHERE status = 'ACTIVE'
ORDER BY name;
```

### 按城市查询门店

```sql
SELECT id, name, code, address, phone
FROM stores
WHERE city = '北京'
ORDER BY name;
```

### 查询门店详情

```sql
SELECT
    s.*,
    (SELECT COUNT(*) FROM halls h WHERE h.store_id = s.id) as hall_count,
    (SELECT COUNT(*) FROM reservations r
     WHERE r.store_id = s.id AND r.status = 'PENDING') as pending_orders
FROM stores s
WHERE s.id = '门店ID';
```

### 门店统计

```sql
SELECT
    status,
    COUNT(*) as count,
    city,
    COUNT(*) as city_count
FROM stores
GROUP BY status, city;
```

### 查询门店及其预约设置

```sql
SELECT
    s.id, s.name, s.code, s.status,
    rs.weekday_start_time, rs.weekday_end_time,
    rs.weekend_start_time, rs.weekend_end_time,
    rs.duration_unit, rs.deposit_amount
FROM stores s
LEFT JOIN store_reservation_settings rs ON s.id = rs.store_id
WHERE s.status = 'ACTIVE';
```

---

## 预约设置

### 设置项说明

| 设置项 | 字段名 | 说明 | 默认值 |
|-------|--------|------|--------|
| 工作日开始时间 | weekday_start_time | 周一至周五可预约开始时间 | 10:00 |
| 工作日结束时间 | weekday_end_time | 周一至周五可预约结束时间 | 22:00 |
| 周末开始时间 | weekend_start_time | 周六日可预约开始时间 | 09:00 |
| 周末结束时间 | weekend_end_time | 周六日可预约结束时间 | 23:00 |
| 时长单位 | duration_unit | 预约时长单位（分钟） | 60 |
| 最小提前时间 | min_advance_hours | 最少提前预约小时数 | 24 |
| 最大提前天数 | max_advance_days | 最多提前预约天数 | 30 |
| 是否需要押金 | deposit_required | 预约是否需要支付押金 | true |
| 押金金额 | deposit_amount | 押金金额（元） | 500 |

### 修改预约设置

```sql
UPDATE store_reservation_settings
SET
    weekday_start_time = '09:00',
    weekday_end_time = '21:00',
    duration_unit = 120,
    updated_at = NOW()
WHERE store_id = '门店ID';
```

### 批量修改时长单位

```sql
UPDATE store_reservation_settings
SET
    duration_unit = 120,
    updated_at = NOW()
WHERE store_id IN (SELECT id FROM stores WHERE city = '北京');
```

---

## 操作指南

### 创建门店

1. 填写门店基本信息（名称、编码、地址等）
2. 门店编码必须唯一
3. 创建后默认状态为 ACTIVE
4. 需要配置预约设置才能接受预约

### 停用门店

1. 检查待履约预约数量
2. 显示影响范围（预约数、影厅数）
3. 确认后执行停用
4. 通知相关用户（如有必要）

### 修改预约设置

1. 显示当前设置
2. 确认修改内容
3. 执行更新
4. 新设置仅影响新预约，已有预约不受影响

---

## 注意事项

1. **门店编码**一旦设置不建议修改，可能影响外部系统集成
2. **停用门店**会影响用户预约体验，建议提前通知
3. **预约设置修改**只影响新预约，已有预约按原设置执行
4. **地址信息**应保持完整和准确，用于用户导航
