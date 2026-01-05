# 影厅管理规则

本文档描述影厅（Hall）的业务规则和管理流程。

---

## 数据模型

### 基本信息

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 唯一标识 |
| store_id | UUID | 所属门店 ID |
| name | String | 影厅名称 |
| code | String | 影厅编码 |
| capacity | Integer | 座位数 |
| type | Enum | 类型：STANDARD/VIP/IMAX |
| status | Enum | 状态：ACTIVE/INACTIVE |

### 影厅类型

| 类型 | 英文 | 说明 | 典型座位数 |
|-----|------|------|-----------|
| 标准厅 | STANDARD | 普通放映厅/活动厅 | 50-150 |
| VIP厅 | VIP | 高端私密空间 | 20-50 |
| IMAX厅 | IMAX | 巨幕影厅 | 200-400 |

---

## 状态管理

### 状态说明

| 状态 | 英文 | 说明 |
|-----|------|------|
| 启用 | ACTIVE | 正常使用，可被场景包选择 |
| 停用 | INACTIVE | 暂停使用，不可被选择 |

### 影厅与门店状态关系

- 门店停用时，其下所有影厅自动不可预约（但影厅状态不变）
- 影厅停用时，只影响该影厅的预约
- 影厅重新启用时，需要门店也处于启用状态

---

## 常用查询

### 查询所有影厅

```sql
SELECT
    h.id, h.name, h.code, h.type, h.capacity, h.status,
    s.name as store_name
FROM halls h
JOIN stores s ON h.store_id = s.id
ORDER BY s.name, h.name;
```

### 查询门店的影厅

```sql
SELECT id, name, code, type, capacity, status
FROM halls
WHERE store_id = '门店ID'
ORDER BY name;
```

### 按类型查询影厅

```sql
SELECT
    h.*, s.name as store_name
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE h.type = 'VIP'
ORDER BY s.name, h.name;
```

### 查询可用的影厅

```sql
SELECT
    h.id, h.name, h.type, h.capacity,
    s.name as store_name
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE h.status = 'ACTIVE'
  AND s.status = 'ACTIVE'
ORDER BY s.name, h.name;
```

### 影厅统计

```sql
-- 按类型统计
SELECT type, COUNT(*) as count
FROM halls
GROUP BY type;

-- 按门店统计
SELECT
    s.name as store_name,
    COUNT(h.id) as hall_count,
    SUM(h.capacity) as total_capacity
FROM stores s
LEFT JOIN halls h ON s.id = h.store_id
GROUP BY s.id, s.name;
```

### 查询影厅的预约情况

```sql
SELECT
    h.id, h.name,
    COUNT(r.id) as total_reservations,
    SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN r.status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed
FROM halls h
LEFT JOIN reservations r ON h.id = r.hall_id
WHERE h.store_id = '门店ID'
GROUP BY h.id, h.name;
```

---

## 影厅与场景包关联

### 查询影厅适用的场景包

```sql
SELECT
    sp.id, sp.name, sp.price, sp.status
FROM scenario_packages sp
WHERE sp.status = 'PUBLISHED'
  AND '影厅ID' = ANY(sp.applicable_halls);
```

### 查询场景包的适用影厅

```sql
SELECT
    h.id, h.name, h.type, h.capacity,
    s.name as store_name
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE h.id = ANY(
    SELECT UNNEST(applicable_halls)
    FROM scenario_packages
    WHERE id = '场景包ID'
);
```

---

## 操作指南

### 创建影厅

1. 选择所属门店
2. 填写影厅信息（名称、类型、座位数）
3. 影厅编码在门店内唯一
4. 创建后默认状态为 ACTIVE

### 停用影厅

1. 检查是否有待履约预约
2. 检查是否被场景包引用
3. 显示影响范围
4. 确认后执行停用

### 修改影厅信息

1. 名称、类型、座位数可随时修改
2. 所属门店不建议修改
3. 修改类型后，可能影响场景包展示

---

## 容量管理

### 座位数使用场景

- 用于预约时的容量提示
- 用于活动策划的人数限制
- 用于价格计算（部分场景包按人数计费）

### 容量验证

```sql
-- 检查预约人数是否超过容量
SELECT
    r.id,
    r.contact_name,
    h.capacity,
    CASE WHEN r.guest_count > h.capacity
         THEN '超出容量'
         ELSE '正常'
    END as capacity_check
FROM reservations r
JOIN halls h ON r.hall_id = h.id
WHERE r.status IN ('PENDING', 'CONFIRMED');
```

---

## 注意事项

1. **影厅编码**在门店内唯一，用于内部标识
2. **类型选择**影响用户筛选和展示排序
3. **座位数**应与实际容量一致，影响用户预期
4. **停用影厅**前应检查关联的场景包和预约
5. **门店停用**会影响所有影厅的预约可用性
