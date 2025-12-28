# Data Model: 场景包管理

**Feature**: 017-scenario-package
**Date**: 2025-12-19
**Dependencies**: research.md (技术决策依据)

---

## Overview

场景包管理数据模型采用**快照模式 + 版本管理**设计，确保历史数据完整性和查询性能。核心设计原则：

1. **版本隔离**：每个版本独立存储，通过 `base_package_id` 关联同一场景包的所有版本
2. **快照保留**：关联的 item/service 名称和价格在添加时快照存储，防止主数据变更影响历史版本
3. **乐观锁控制**：使用 `version` 列防止并发修改冲突
4. **软删除支持**：主表支持软删除（`deleted_at`），关联表级联删除

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ScenarioPackage (场景包)                     │
│  - id (PK)                                                           │
│  - base_package_id (FK to self, 版本分组)                            │
│  - version (版本号)                                                  │
│  - name, description, background_image_url                           │
│  - status (DRAFT/PUBLISHED/UNPUBLISHED)                             │
│  - is_latest (是否最新版本)                                          │
│  - version_lock (乐观锁)                                             │
│  - created_at, updated_at, deleted_at, created_by                    │
└─────────┬───────────────┬───────────────┬────────────────┬───────────┘
          │               │               │                │
          │ 1:1           │ 1:N           │ M:N            │ 1:1
          ▼               ▼               ▼                ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │ PackageRule  │ │PackageContent│ │ HallType     │ │PackagePricing│
   │ (规则)       │ │  (内容组合)  │ │ (影厅类型)   │ │  (定价)      │
   ├──────────────┤ ├──────────────┤ └──────────────┘ ├──────────────┤
   │- duration    │ │  ┌─────────┐ │                  │- package_price│
   │- min_people  │ │  │ Benefit │ │                  │- reference_   │
   │- max_people  │ │  │ (硬权益)│ │                  │  price_snapshot│
   └──────────────┘ │  ├─────────┤ │                  │- discount_%   │
                    │  │  Item   │ │                  │- discount_amt │
                    │  │ (软权益)│ │                  └──────────────┘
                    │  ├─────────┤ │
                    │  │ Service │ │
                    │  │ (服务)  │ │
                    │  └─────────┘ │
                    └──────────────┘
```

---

## Core Entities

### 1. ScenarioPackage (场景包主表)

**Purpose**: 场景包的核心实体，存储基本信息和版本管理元数据。

**Table**: `scenario_packages`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK | 场景包唯一标识（每个版本独立 ID） |
| `base_package_id` | UUID | FK (self), NULLABLE | 指向基础包 ID（所有版本共享），首版本为 NULL |
| `version` | INTEGER | NOT NULL, DEFAULT 1 | 版本号，从 1 开始递增 |
| `name` | VARCHAR(255) | NOT NULL | 场景包名称 |
| `description` | TEXT | NULLABLE | 描述信息 |
| `background_image_url` | TEXT | NULLABLE | 背景图片 URL（Supabase Storage 公开链接） |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | 状态：DRAFT/PUBLISHED/UNPUBLISHED |
| `is_latest` | BOOLEAN | NOT NULL, DEFAULT true | 是否为最新版本（查询优化） |
| `version_lock` | INTEGER | NOT NULL, DEFAULT 0 | 乐观锁版本号（防并发冲突） |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | 软删除时间戳 |
| `created_by` | VARCHAR(100) | NULLABLE | 创建人（用户 ID 或名称） |

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_pkg_base_version ON scenario_packages(base_package_id, version)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_pkg_latest ON scenario_packages(base_package_id, is_latest)
    WHERE is_latest = true AND deleted_at IS NULL;
CREATE INDEX idx_pkg_status ON scenario_packages(status)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_pkg_created_at ON scenario_packages(created_at DESC);
```

**Validation Rules**:
- `name`: 长度 1-255 字符，不能为空白
- `status`: 枚举值仅限 `DRAFT`, `PUBLISHED`, `UNPUBLISHED`
- `version`: 必须 > 0
- `background_image_url`: 如果非空，必须是有效的 HTTPS URL

**State Transitions**:
```
DRAFT ──publish──> PUBLISHED ──unpublish──> UNPUBLISHED
  ↑                   │                         │
  └───────────────────┴─────────────────────────┘
              (edit creates new version)
```

---

### 2. PackageRule (场景包规则)

**Purpose**: 定义场景包的使用规则（时长、人数范围）。

**Table**: `package_rules`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK | 规则 ID |
| `package_id` | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE, UNIQUE | 关联的场景包 ID（1:1 关系） |
| `duration_hours` | DECIMAL(5,2) | NOT NULL, CHECK (> 0) | 时长（小时），支持小数（如 2.5 小时） |
| `min_people` | INTEGER | NULLABLE, CHECK (>= 0) | 最小人数，NULL 表示不限 |
| `max_people` | INTEGER | NULLABLE, CHECK (>= min_people OR NULL) | 最大人数，NULL 表示不限 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_rule_package ON package_rules(package_id);
```

**Validation Rules**:
- `duration_hours`: 必须 > 0，精度最多 2 位小数
- `min_people` 和 `max_people`: 如果都非空，`min_people ≤ max_people`
- 场景包删除时级联删除规则

---

### 3. PackageHallAssociation (场景包-影厅关联)

**Purpose**: 多对多关系，记录场景包适用的影厅类型。

**Table**: `package_hall_associations`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK | 关联 ID |
| `package_id` | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |
| `hall_type_id` | UUID | FK (`hall_types.id`) ON DELETE RESTRICT | 影厅类型 ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**Constraints**:
```sql
UNIQUE(package_id, hall_type_id);  -- 防止重复关联
```

**Indexes**:
```sql
CREATE INDEX idx_pkg_hall_package ON package_hall_associations(package_id);
CREATE INDEX idx_pkg_hall_hall ON package_hall_associations(hall_type_id);
```

**Cascade Behavior**:
- 删除场景包：级联删除所有关联（`ON DELETE CASCADE`）
- 删除影厅类型：阻止删除（`ON DELETE RESTRICT`），必须先解除关联

---

### 4. PackageBenefit (场景包硬权益)

**Purpose**: 记录观影购票优惠权益（折扣票价、免费场次等）。

**Table**: `package_benefits`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK | 硬权益 ID |
| `package_id` | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |
| `benefit_type` | VARCHAR(50) | NOT NULL | 类型：DISCOUNT_TICKET/FREE_SCREENING |
| `discount_rate` | DECIMAL(5,2) | NULLABLE, CHECK (0 < discount_rate ≤ 1) | 折扣率（如 0.75 表示 75 折） |
| `free_count` | INTEGER | NULLABLE, CHECK (>= 0) | 免费场次数量 |
| `description` | TEXT | NULLABLE | 权益描述 |
| `sort_order` | INTEGER | DEFAULT 0 | 排序序号 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**Indexes**:
```sql
CREATE INDEX idx_benefit_package ON package_benefits(package_id, sort_order);
```

**Validation Rules**:
- `benefit_type = 'DISCOUNT_TICKET'` 时，`discount_rate` 必填，`free_count` 应为 NULL
- `benefit_type = 'FREE_SCREENING'` 时，`free_count` 必填，`discount_rate` 应为 NULL

---

### 5. PackageItem (场景包软权益 - 单品)

**Purpose**: 记录场景包包含的单品及数量，使用快照保留添加时的名称和价格。

**Table**: `package_items`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK | 单品项 ID |
| `package_id` | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |
| `item_id` | UUID | FK (`items.id`) ON DELETE RESTRICT | 单品主数据 ID |
| `quantity` | INTEGER | NOT NULL, CHECK (> 0) | 数量 |
| `item_name_snapshot` | VARCHAR(255) | NOT NULL | 单品名称快照（添加时的名称） |
| `item_price_snapshot` | DECIMAL(10,2) | NOT NULL | 单品价格快照（添加时的价格） |
| `sort_order` | INTEGER | DEFAULT 0 | 排序序号 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**Indexes**:
```sql
CREATE INDEX idx_item_package ON package_items(package_id, sort_order);
CREATE INDEX idx_item_item_id ON package_items(item_id);
```

**Cascade Behavior**:
- 删除场景包：级联删除所有单品项
- 删除单品主数据：阻止删除，必须先解除关联

**Snapshot Logic**:
- 添加单品时，自动从 `items` 表复制 `name` 和 `price` 到快照字段
- 查询历史版本时使用快照字段，确保价格不受主数据变更影响
- 查询最新版本时可 JOIN `items` 表获取实时价格

---

### 6. PackageService (场景包服务项目)

**Purpose**: 记录场景包包含的服务项目（如管家服务、布置服务），使用快照保留添加时的名称和价格。

**Table**: `package_services`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK | 服务项 ID |
| `package_id` | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE | 场景包 ID |
| `service_id` | UUID | FK (`services.id`) ON DELETE RESTRICT | 服务主数据 ID |
| `service_name_snapshot` | VARCHAR(255) | NOT NULL | 服务名称快照 |
| `service_price_snapshot` | DECIMAL(10,2) | NOT NULL | 服务价格快照 |
| `sort_order` | INTEGER | DEFAULT 0 | 排序序号 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |

**Indexes**:
```sql
CREATE INDEX idx_service_package ON package_services(package_id, sort_order);
CREATE INDEX idx_service_service_id ON package_services(service_id);
```

**Cascade Behavior**: 同 `package_items`

---

### 7. PackagePricing (场景包定价)

**Purpose**: 存储场景包的定价策略（打包价格、参考总价快照、优惠信息）。

**Table**: `package_pricing`

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `id` | UUID | PK | 定价 ID |
| `package_id` | UUID | FK (`scenario_packages.id`) ON DELETE CASCADE, UNIQUE | 场景包 ID（1:1 关系） |
| `package_price` | DECIMAL(10,2) | NOT NULL, CHECK (> 0) | 打包一口价 |
| `reference_price_snapshot` | DECIMAL(10,2) | NULLABLE | 参考总价快照（保存时计算） |
| `discount_percentage` | DECIMAL(5,2) | NULLABLE | 优惠比例（%），自动计算 |
| `discount_amount` | DECIMAL(10,2) | NULLABLE | 优惠金额，自动计算 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 创建时间 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新时间 |

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_pricing_package ON package_pricing(package_id);
```

**Calculated Fields**:
```
discount_percentage = (package_price / reference_price_snapshot) × 100
discount_amount = reference_price_snapshot - package_price
```

**Snapshot Timing**:
- `reference_price_snapshot` 在保存定价时计算并存储
- 如果 item/service 价格变更，运营人员需手动重新确认打包价格，触发快照更新

---

## Database Schema (DDL)

完整的 PostgreSQL DDL 脚本：

```sql
-- 1. 场景包主表
CREATE TABLE scenario_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_package_id UUID REFERENCES scenario_packages(id) ON DELETE RESTRICT,
    version INTEGER NOT NULL DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    background_image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')),
    is_latest BOOLEAN NOT NULL DEFAULT true,
    version_lock INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_by VARCHAR(100)
);

CREATE UNIQUE INDEX idx_pkg_base_version ON scenario_packages(base_package_id, version) WHERE deleted_at IS NULL;
CREATE INDEX idx_pkg_latest ON scenario_packages(base_package_id, is_latest) WHERE is_latest = true AND deleted_at IS NULL;
CREATE INDEX idx_pkg_status ON scenario_packages(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_pkg_created_at ON scenario_packages(created_at DESC);

-- 2. 场景包规则
CREATE TABLE package_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL UNIQUE REFERENCES scenario_packages(id) ON DELETE CASCADE,
    duration_hours DECIMAL(5,2) NOT NULL CHECK (duration_hours > 0),
    min_people INTEGER CHECK (min_people IS NULL OR min_people >= 0),
    max_people INTEGER CHECK (max_people IS NULL OR (min_people IS NULL OR max_people >= min_people)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_rule_package ON package_rules(package_id);

-- 3. 场景包-影厅关联
CREATE TABLE package_hall_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    hall_type_id UUID NOT NULL REFERENCES hall_types(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(package_id, hall_type_id)
);

CREATE INDEX idx_pkg_hall_package ON package_hall_associations(package_id);
CREATE INDEX idx_pkg_hall_hall ON package_hall_associations(hall_type_id);

-- 4. 场景包硬权益
CREATE TABLE package_benefits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    benefit_type VARCHAR(50) NOT NULL CHECK (benefit_type IN ('DISCOUNT_TICKET', 'FREE_SCREENING')),
    discount_rate DECIMAL(5,2) CHECK (discount_rate IS NULL OR (discount_rate > 0 AND discount_rate <= 1)),
    free_count INTEGER CHECK (free_count IS NULL OR free_count >= 0),
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_benefit_package ON package_benefits(package_id, sort_order);

-- 5. 场景包软权益（单品）
CREATE TABLE package_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    item_name_snapshot VARCHAR(255) NOT NULL,
    item_price_snapshot DECIMAL(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_package ON package_items(package_id, sort_order);
CREATE INDEX idx_item_item_id ON package_items(item_id);

-- 6. 场景包服务项目
CREATE TABLE package_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    service_name_snapshot VARCHAR(255) NOT NULL,
    service_price_snapshot DECIMAL(10,2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_package ON package_services(package_id, sort_order);
CREATE INDEX idx_service_service_id ON package_services(service_id);

-- 7. 场景包定价
CREATE TABLE package_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL UNIQUE REFERENCES scenario_packages(id) ON DELETE CASCADE,
    package_price DECIMAL(10,2) NOT NULL CHECK (package_price > 0),
    reference_price_snapshot DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_pricing_package ON package_pricing(package_id);

-- Triggers: 自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scenario_packages_updated_at BEFORE UPDATE ON scenario_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_package_pricing_updated_at BEFORE UPDATE ON package_pricing
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Query Patterns

### 1. 查询最新版本场景包列表（带筛选）

```sql
SELECT
    sp.*,
    pr.duration_hours, pr.min_people, pr.max_people,
    pp.package_price, pp.discount_percentage,
    COUNT(DISTINCT pha.hall_type_id) AS hall_count,
    COUNT(DISTINCT pi.id) AS item_count,
    COUNT(DISTINCT ps.id) AS service_count
FROM scenario_packages sp
LEFT JOIN package_rules pr ON sp.id = pr.package_id
LEFT JOIN package_pricing pp ON sp.id = pp.package_id
LEFT JOIN package_hall_associations pha ON sp.id = pha.package_id
LEFT JOIN package_items pi ON sp.id = pi.package_id
LEFT JOIN package_services ps ON sp.id = ps.package_id
WHERE sp.is_latest = true
  AND sp.deleted_at IS NULL
  AND sp.status = ? -- 筛选条件：状态
  AND pha.hall_type_id IN (?) -- 筛选条件：影厅类型
GROUP BY sp.id, pr.id, pp.id
ORDER BY sp.created_at DESC
LIMIT ? OFFSET ?;
```

### 2. 查询单个场景包完整信息（含所有关联）

```sql
-- 主表查询
SELECT * FROM scenario_packages WHERE id = ? AND deleted_at IS NULL;

-- 规则查询
SELECT * FROM package_rules WHERE package_id = ?;

-- 影厅关联查询
SELECT ht.id, ht.name
FROM package_hall_associations pha
JOIN hall_types ht ON pha.hall_type_id = ht.id
WHERE pha.package_id = ?;

-- 硬权益查询
SELECT * FROM package_benefits WHERE package_id = ? ORDER BY sort_order;

-- 软权益查询
SELECT * FROM package_items WHERE package_id = ? ORDER BY sort_order;

-- 服务查询
SELECT * FROM package_services WHERE package_id = ? ORDER BY sort_order;

-- 定价查询
SELECT * FROM package_pricing WHERE package_id = ?;
```

### 3. 计算实时参考总价

```sql
SELECT
    COALESCE(
        (SELECT SUM(i.price * pi.quantity)
         FROM package_items pi
         JOIN items i ON pi.item_id = i.id
         WHERE pi.package_id = ?), 0
    ) +
    COALESCE(
        (SELECT SUM(s.price)
         FROM package_services ps
         JOIN services s ON ps.service_id = s.id
         WHERE ps.package_id = ?), 0
    ) AS reference_price;
```

### 4. 创建新版本（快照复制）

```sql
-- 步骤 1：插入新场景包版本
INSERT INTO scenario_packages (base_package_id, version, name, description, background_image_url, status, is_latest, created_by)
SELECT
    COALESCE(base_package_id, id), -- 如果是首版本，base_package_id = 自身 id
    version + 1,
    name,
    description,
    background_image_url,
    'DRAFT', -- 新版本默认为草稿
    true, -- 新版本为最新
    ?  -- 创建人
FROM scenario_packages
WHERE id = ?
RETURNING id AS new_package_id;

-- 步骤 2：将旧版本的 is_latest 设为 false
UPDATE scenario_packages SET is_latest = false WHERE id = ?;

-- 步骤 3-8：复制所有关联数据（rules, halls, benefits, items, services, pricing）
-- 示例：复制 items
INSERT INTO package_items (package_id, item_id, quantity, item_name_snapshot, item_price_snapshot, sort_order)
SELECT <new_package_id>, item_id, quantity, item_name_snapshot, item_price_snapshot, sort_order
FROM package_items
WHERE package_id = ?;
```

---

## Data Integrity Rules

1. **外键约束**：所有关联表通过外键约束保证引用完整性
2. **级联删除**：删除场景包时级联删除所有从属数据（rules, items, services, pricing）
3. **限制删除**：删除主数据（hall_types, items, services）时必须先解除场景包关联
4. **唯一性约束**：
   - `(base_package_id, version)` 唯一（同一基础包的版本号不重复）
   - `(package_id, hall_type_id)` 唯一（同一场景包不重复关联同一影厅）
5. **Check 约束**：
   - 价格、数量必须 > 0
   - 人数范围：`min_people ≤ max_people`
   - 状态枚举值限制
6. **软删除**：`scenario_packages` 表使用 `deleted_at` 字段，查询时过滤 `deleted_at IS NULL`

---

## Migration Strategy

1. **初始化**：执行上述 DDL 脚本创建所有表和索引
2. **数据迁移**（如有旧数据）：
   - 导入现有场景包数据到 `scenario_packages` 表（version=1, base_package_id=NULL）
   - 导入关联的规则、内容、定价数据
3. **版本更新**：使用数据库迁移工具（如 Flyway, Liquibase）管理 schema 变更

---

## Performance Considerations

1. **索引策略**：
   - 复合索引 `(base_package_id, is_latest)` 加速"最新版本"查询
   - 状态字段索引支持筛选查询
   - 外键字段索引支持 JOIN 查询

2. **查询优化**：
   - 避免 N+1 查询，使用批量查询或 JSON 聚合
   - 分页查询大列表，避免全表扫描
   - 使用 `is_latest` 标记减少版本号比较开销

3. **数据量估算**：
   - 1000 个场景包，平均 3 个版本 → 3000 行主表数据
   - 每个包平均 5 个 items + 2 个 services → 21000 行关联数据
   - 预计总数据量 < 50MB，性能压力较小

---

## Next Steps

1. ✅ 数据模型设计完成
2. 🔄 生成 API 契约（`contracts/api.yaml`），定义所有端点的请求/响应格式
3. ⏳ 生成开发快速入门文档（`quickstart.md`），指导开发人员实现
