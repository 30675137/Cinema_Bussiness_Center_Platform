# 数据库表结构参考

本文档描述影院商品管理中台的核心数据库表结构，供运营专家查询时参考。

## 核心表概览

| 表名 | 中文名 | 说明 |
|-----|-------|------|
| `stores` | 门店 | 门店基本信息和配置 |
| `halls` | 影厅 | 影厅信息，关联门店 |
| `scenario_packages` | 场景包 | 场景包定义和内容 |
| `reservations` | 预约订单 | 用户预约记录 |
| `store_reservation_settings` | 门店预约设置 | 门店的预约规则配置 |
| `brands` | 品牌 | 品牌信息 |
| `categories` | 分类 | 商品分类 |
| `unit_conversions` | 单位换算 | 单位换算规则配置 |

---

## 详细表结构

### stores（门店）

```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,           -- 门店名称
    code VARCHAR(50),                     -- 门店编码
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- 状态: ACTIVE/INACTIVE
    province VARCHAR(50),                 -- 省份
    city VARCHAR(50),                     -- 城市
    district VARCHAR(50),                 -- 区县
    address TEXT,                         -- 详细地址
    phone VARCHAR(20),                    -- 联系电话
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**常用查询**:
```sql
-- 查询所有启用的门店
SELECT id, name, code, city, status FROM stores WHERE status = 'ACTIVE';

-- 按城市查询门店
SELECT * FROM stores WHERE city = '北京';

-- 统计门店数量
SELECT status, COUNT(*) as count FROM stores GROUP BY status;
```

---

### halls（影厅）

```sql
CREATE TABLE halls (
    id UUID PRIMARY KEY,
    store_id UUID REFERENCES stores(id),  -- 所属门店
    name VARCHAR(100) NOT NULL,           -- 影厅名称
    code VARCHAR(50),                     -- 影厅编码
    capacity INT,                         -- 座位数
    type VARCHAR(50),                     -- 影厅类型: STANDARD/VIP/IMAX
    status VARCHAR(20) DEFAULT 'ACTIVE',  -- 状态
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**常用查询**:
```sql
-- 查询门店的所有影厅
SELECT h.*, s.name as store_name
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE s.name = '旗舰店';

-- 按类型统计影厅
SELECT type, COUNT(*) as count FROM halls GROUP BY type;
```

---

### scenario_packages（场景包）

```sql
CREATE TABLE scenario_packages (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,           -- 场景包名称
    description TEXT,                     -- 描述
    status VARCHAR(20) DEFAULT 'DRAFT',   -- 状态: DRAFT/PUBLISHED/ARCHIVED
    price DECIMAL(10,2),                  -- 价格
    original_price DECIMAL(10,2),         -- 原价
    applicable_halls TEXT[],              -- 适用影厅ID列表
    hard_benefits JSONB,                  -- 硬权益（实物）
    soft_benefits JSONB,                  -- 软权益（服务）
    service_items JSONB,                  -- 服务项目
    valid_from TIMESTAMP,                 -- 有效期开始
    valid_to TIMESTAMP,                   -- 有效期结束
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**状态说明**:
- `DRAFT`: 草稿，可编辑，不对外展示
- `PUBLISHED`: 已发布，对外展示，可预约
- `ARCHIVED`: 已归档，不再使用

**常用查询**:
```sql
-- 查询所有已发布的场景包
SELECT id, name, price, status FROM scenario_packages WHERE status = 'PUBLISHED';

-- 查询场景包详情
SELECT * FROM scenario_packages WHERE name LIKE '%VIP%';

-- 按状态统计
SELECT status, COUNT(*) as count FROM scenario_packages GROUP BY status;
```

---

### reservations（预约订单）

```sql
CREATE TABLE reservations (
    id UUID PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL,        -- 订单号
    user_id UUID,                         -- 用户ID
    store_id UUID REFERENCES stores(id),  -- 门店
    hall_id UUID REFERENCES halls(id),    -- 影厅
    scenario_package_id UUID,             -- 场景包
    status VARCHAR(20) DEFAULT 'PENDING', -- 状态
    reservation_date DATE,                -- 预约日期
    start_time TIME,                      -- 开始时间
    end_time TIME,                        -- 结束时间
    total_amount DECIMAL(10,2),           -- 总金额
    deposit_amount DECIMAL(10,2),         -- 押金金额
    contact_name VARCHAR(50),             -- 联系人
    contact_phone VARCHAR(20),            -- 联系电话
    remark TEXT,                          -- 备注
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**状态说明**:
- `PENDING`: 待确认
- `CONFIRMED`: 已确认
- `COMPLETED`: 已完成
- `CANCELLED`: 已取消

**常用查询**:
```sql
-- 查询本周预约订单
SELECT * FROM reservations
WHERE reservation_date >= DATE_TRUNC('week', CURRENT_DATE)
AND reservation_date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days';

-- 按状态统计
SELECT status, COUNT(*) as count FROM reservations GROUP BY status;

-- 查询门店的预约
SELECT r.*, s.name as store_name
FROM reservations r
JOIN stores s ON r.store_id = s.id
WHERE s.name = '旗舰店';
```

---

### store_reservation_settings（门店预约设置）

```sql
CREATE TABLE store_reservation_settings (
    id UUID PRIMARY KEY,
    store_id UUID REFERENCES stores(id),  -- 门店
    weekday_start_time TIME,              -- 工作日开始时间
    weekday_end_time TIME,                -- 工作日结束时间
    weekend_start_time TIME,              -- 周末开始时间
    weekend_end_time TIME,                -- 周末结束时间
    duration_unit INT DEFAULT 60,         -- 时长单位（分钟）
    min_advance_hours INT DEFAULT 24,     -- 最小提前预约时间（小时）
    max_advance_days INT DEFAULT 30,      -- 最大提前预约天数
    deposit_required BOOLEAN DEFAULT TRUE,-- 是否需要押金
    deposit_amount DECIMAL(10,2),         -- 押金金额
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**常用查询**:
```sql
-- 查询门店的预约设置
SELECT s.name as store_name, rs.*
FROM store_reservation_settings rs
JOIN stores s ON rs.store_id = s.id
WHERE s.name = '旗舰店';

-- 查询所有门店的预约时段
SELECT s.name, rs.weekday_start_time, rs.weekday_end_time,
       rs.weekend_start_time, rs.weekend_end_time
FROM stores s
LEFT JOIN store_reservation_settings rs ON s.id = rs.store_id;
```

---

## 查询技巧

### 模糊搜索
```sql
-- 按名称模糊搜索场景包
SELECT * FROM scenario_packages WHERE name ILIKE '%派对%';
```

### 分页查询
```sql
-- 分页获取数据
SELECT * FROM stores ORDER BY created_at DESC LIMIT 20 OFFSET 0;
```

### 关联查询
```sql
-- 查询预约订单的完整信息
SELECT
    r.order_no,
    r.reservation_date,
    s.name as store_name,
    h.name as hall_name,
    sp.name as package_name,
    r.status,
    r.total_amount
FROM reservations r
LEFT JOIN stores s ON r.store_id = s.id
LEFT JOIN halls h ON r.hall_id = h.id
LEFT JOIN scenario_packages sp ON r.scenario_package_id = sp.id
ORDER BY r.created_at DESC
LIMIT 50;
```

### 统计查询
```sql
-- 本周预约订单数量
SELECT COUNT(*) as total,
       SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed,
       SUM(total_amount) as total_amount
FROM reservations
WHERE reservation_date >= DATE_TRUNC('week', CURRENT_DATE);
```

---

## BOM 相关表

### unit_conversions（单位换算）

```sql
CREATE TABLE unit_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_unit VARCHAR(20) NOT NULL,           -- 源单位
    to_unit VARCHAR(20) NOT NULL,             -- 目标单位
    conversion_rate DECIMAL(10,6) NOT NULL,   -- 换算率：1 from_unit = ? to_unit
    category VARCHAR(20) NOT NULL             -- 类别: volume/weight/quantity
      CHECK (category IN ('volume', 'weight', 'quantity')),
    CONSTRAINT uk_conversion_from_to UNIQUE (from_unit, to_unit)
);
```

**类别说明**:
- `volume`: 体积类（ml, L, 杯, 瓶等）- 默认保留1位小数
- `weight`: 重量类（g, kg, 份等）- 默认取整
- `quantity`: 计数类（个, 打, 箱等）- 默认向上取整

**常用查询**:
```sql
-- 查询所有换算规则
SELECT * FROM unit_conversions ORDER BY category, from_unit;

-- 按类别筛选换算规则
SELECT * FROM unit_conversions WHERE category = 'volume';

-- 搜索包含特定单位的规则
SELECT * FROM unit_conversions
WHERE from_unit ILIKE '%瓶%' OR to_unit ILIKE '%瓶%';

-- 统计各类别规则数量
SELECT category, COUNT(*) as count FROM unit_conversions GROUP BY category;
```

**预置数据**:
系统预置以下基础换算规则：
- 体积: ml↔L (1000), 瓶↔ml (根据产品规格)
- 重量: g↔kg (1000)
- 计数: 个↔打 (12), 瓶↔箱 (12)
