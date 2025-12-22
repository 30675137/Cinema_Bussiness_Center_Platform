# 影院商品管理中台 - 统一数据模型文档

**生成时间**: 2025-12-22
**来源规格**: 014-hall-store-backend, 016-store-reservation-settings, 019-store-association, 020-store-address, 022-store-crud

---

## 概述

本文档整合了影院商品管理中台项目中所有与门店管理相关功能的数据模型，包括实体定义、字段规范、关系映射和数据库 schema。所有数据存储在 Supabase PostgreSQL 数据库中。

---

## 核心实体

### 1. Store (门店)

**说明**: 影院门店基本信息实体，作为整个系统的核心主数据实体。

**表名**: `stores`

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 来源功能 |
|--------|------|------|------|---------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 门店唯一标识 | 014 |
| code | VARCHAR(50) | NOT NULL, UNIQUE | 门店编码（全局唯一） | 014 |
| name | VARCHAR(100) | NOT NULL, UNIQUE (case-insensitive after trim) | 门店名称，去除前后空格后不区分大小写 | 014 |
| region | VARCHAR(50) | NULLABLE | 所属区域（保留字段，向后兼容） | 014 |
| province | VARCHAR(50) | NULL | 所属省份（如"北京市"） | 020 |
| city | VARCHAR(50) | NULL | 所属城市（如"北京市"） | 020 |
| district | VARCHAR(50) | NULL | 所属区县（如"朝阳区"） | 020 |
| address | TEXT | NULL | 详细地址（如"建国路88号SOHO现代城"） | 020 |
| phone | VARCHAR(30) | NULL, CHECK (regex match) | 联系电话（手机号/座机号/400热线） | 020 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'ACTIVE', CHECK (status IN ('ACTIVE', 'INACTIVE')) | 门店状态（启用/停用） | 022 |
| version | BIGINT | NOT NULL, DEFAULT 0 | 乐观锁版本号，每次更新自动递增 | 022 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 | 014 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 最后更新时间 | 014 |
| created_by | UUID | NULL | 创建人ID（外键关联users表，如存在） | 014 |
| updated_by | UUID | NULL | 最后修改人ID（外键关联users表，如存在） | 014 |

**派生字段** (仅前端/后端 DTO):

| 字段名 | 类型 | 说明 | 计算逻辑 |
|--------|------|------|---------|
| addressSummary | String | 地址摘要（格式："城市 区县"） | `${city} ${district}` |

**业务规则**:

1. **门店名称唯一性**: 去除前后空格后，不区分大小写比较（如"北京朝阳店"和" 北京朝阳店 "视为重复）
2. **电话号码格式**: 必须符合手机号(11位,以1开头)或座机号(区号-号码,如010-12345678)或400热线格式
3. **新创建门店默认状态**: ACTIVE
4. **版本号递增**: 每次UPDATE时由JPA @Version自动递增，用于乐观锁冲突检测
5. **逻辑删除**: 门店删除时一般采用"逻辑停用"（置为INACTIVE），不做物理删除，以保留历史数据

**状态流转**:

```
ACTIVE (启用) <--> INACTIVE (停用)
```

- **ACTIVE → INACTIVE**: 运营人员点击"停用"按钮，确认后执行。停用门店在C端预约页面不可见，但已有预约记录不受影响。
- **INACTIVE → ACTIVE**: 运营人员点击"启用"按钮，确认后执行。

**关系**:

- **Store 1:N Hall**: 一个门店有多个影厅（外键在halls.store_id）
- **Store 1:1 ReservationSettings**: 一个门店有一个预约设置（外键在reservation_settings.store_id，UNIQUE约束）
- **Store M:N ScenarioPackage**: 一个门店可被多个场景包关联，通过scenario_package_store_associations中间表实现
- **Store 1:N StoreOperationLog**: 一个门店有多个操作日志（外键在store_operation_logs.store_id）

**数据库索引**:

```sql
-- 主键索引
CREATE UNIQUE INDEX stores_pkey ON stores(id);

-- 唯一索引
CREATE UNIQUE INDEX stores_code_key ON stores(code);

-- 状态索引（用于过滤ACTIVE门店）
CREATE INDEX idx_stores_status ON stores(status);

-- 地址索引（用于按地区筛选）
CREATE INDEX idx_stores_province ON stores(province);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_district ON stores(district);
```

**数据库约束**:

```sql
-- 电话号码格式校验
ALTER TABLE stores
ADD CONSTRAINT chk_phone_format CHECK (
    phone IS NULL OR
    phone ~ '^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$'
);
```

**Java Entity** (后端):

```java
@Entity
@Table(name = "stores")
@Data
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "region", length = 50)
    private String region;

    @Column(name = "province", length = 50)
    private String province;

    @Column(name = "city", length = 50)
    private String city;

    @Column(name = "district", length = 50)
    private String district;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone", length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private StoreStatus status = StoreStatus.ACTIVE;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}

public enum StoreStatus {
    ACTIVE,
    INACTIVE
}
```

**TypeScript Type** (前端):

```typescript
export enum StoreStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Store {
  id: string;
  code: string;
  name: string;
  region?: string;
  province?: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  addressSummary?: string; // 派生字段
  status: StoreStatus;
  version: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy?: string;
  updatedBy?: string;
}
```

---

### 2. Hall (影厅)

**说明**: 影厅资源实体，属于特定门店。

**表名**: `halls`

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 来源功能 |
|--------|------|------|------|---------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 影厅主键 | 014 |
| store_id | UUID | NOT NULL, FK → stores.id | 所属门店主键 | 014 |
| code | VARCHAR(50) | NULL | 影厅编码（可选，门店内唯一） | 014 |
| name | VARCHAR(100) | NOT NULL | 影厅名称 | 014 |
| type | VARCHAR(50) | NOT NULL | 影厅类型（VIP/CP/Party/Public等） | 014 |
| capacity | INTEGER | NOT NULL, CHECK (capacity > 0 AND capacity <= 1000) | 可容纳人数 | 014 |
| tags | TEXT[] | NULL | 标签列表（如"真皮沙发""KTV设备"） | 014 |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'active' | 影厅状态（active/inactive/maintenance） | 014 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 | 014 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 | 014 |

**业务规则**:

1. **store_id** 必须指向一个存在且非物理删除的门店
2. **capacity** 必须为正整数，上限为1000
3. **code** 可以在门店内唯一（UNIQUE (store_id, code)），便于运营快速识别
4. **status** 枚举值:
   - `active`: 可用于新建排期/预约
   - `inactive`: 停用，不再用于新建排期，但历史数据保留
   - `maintenance`: 维护中，可用于维护/锁座时段建模，但不允许业务排期

**关系**:

- **Hall N:1 Store**: 多个影厅属于一个门店（外键store_id）

**数据库索引**:

```sql
CREATE INDEX idx_halls_store_id ON halls(store_id);
CREATE INDEX idx_halls_status ON halls(status);
CREATE INDEX idx_halls_type ON halls(type);
CREATE UNIQUE INDEX idx_halls_store_code ON halls(store_id, code) WHERE code IS NOT NULL;
```

**Java Entity** (后端):

```java
@Entity
@Table(name = "halls")
@Data
public class Hall {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private HallType type;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Type(JsonType.class)
    @Column(name = "tags", columnDefinition = "text[]")
    private List<String> tags;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private HallStatus status = HallStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}

public enum HallType {
    VIP, CP, PARTY, PUBLIC
}

public enum HallStatus {
    ACTIVE, INACTIVE, MAINTENANCE
}
```

**TypeScript Type** (前端):

```typescript
export enum HallType {
  VIP = 'VIP',
  CP = 'CP',
  PARTY = 'Party',
  PUBLIC = 'Public',
}

export enum HallStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

export interface Hall {
  id: string;
  storeId: string;
  code?: string;
  name: string;
  type: HallType;
  capacity: number;
  tags: string[];
  status: HallStatus;
  createdAt: string;
  updatedAt: string;
}
```

---

### 3. ReservationSettings (预约设置)

**说明**: 门店预约设置实体，存储门店的预约规则配置。

**表名**: `reservation_settings`

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 来源功能 |
|--------|------|------|------|---------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 设置唯一标识 | 016 |
| store_id | UUID | FK, UNIQUE, NOT NULL → stores.id ON DELETE CASCADE | 所属门店ID（一对一关系） | 016 |
| time_slots | JSONB | NOT NULL, DEFAULT '[]' | 可预约时间段列表（7天，每天一条） | 016 |
| min_advance_hours | INTEGER | NOT NULL, DEFAULT 1, CHECK > 0 | 最小提前小时数 | 016 |
| max_advance_days | INTEGER | NOT NULL, DEFAULT 30, CHECK > min_advance_hours/24 | 最大提前天数 | 016 |
| duration_unit | INTEGER | NOT NULL, DEFAULT 1, CHECK IN (1,2,4) | 预约单位时长（小时） | 016 |
| deposit_required | BOOLEAN | NOT NULL, DEFAULT FALSE | 是否需要押金 | 016 |
| deposit_amount | DECIMAL(10,2) | CHECK >= 0 | 押金金额（元） | 016 |
| deposit_percentage | INTEGER | CHECK >= 0 AND <= 100 | 押金比例（百分比） | 016 |
| is_active | BOOLEAN | NOT NULL, DEFAULT TRUE | 配置是否生效 | 016 |
| created_by | UUID | NULL | 创建人ID | 016 |
| updated_by | UUID | NULL | 最后修改人ID | 016 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 | 016 |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 更新时间 | 016 |

**JSONB 字段结构 - time_slots**:

```json
[
  {
    "dayOfWeek": 1,        // 1-7 表示周一至周日
    "startTime": "10:00",  // HH:mm 格式
    "endTime": "22:00"     // HH:mm 格式
  },
  {
    "dayOfWeek": 2,
    "startTime": "10:00",
    "endTime": "22:00"
  }
  // ... 最多7条记录（每天一条）
]
```

**业务规则**:

1. **唯一性**: 每个门店（store_id）只能有一个预约设置配置（通过UNIQUE约束保证）
2. **级联删除**: 门店删除时，关联的预约设置自动删除（ON DELETE CASCADE）
3. **默认值**: 新创建门店时自动生成默认配置（周一至周日09:00-21:00，最小提前1小时，最大提前30天，时长单位1小时，无押金）
4. **时间段验证**: startTime必须早于endTime
5. **提前量验证**: max_advance_days * 24 必须大于 min_advance_hours
6. **押金互斥**: deposit_amount和deposit_percentage不能同时设置
7. **门店停用联动**: 门店status变为INACTIVE时，is_active设为false；重新启用时恢复为true

**关系**:

- **ReservationSettings 1:1 Store**: 一个预约设置对应一个门店（外键store_id，UNIQUE约束）

**数据库索引**:

```sql
CREATE UNIQUE INDEX idx_reservation_settings_store_id ON reservation_settings(store_id);
CREATE INDEX idx_reservation_settings_time_slots ON reservation_settings USING GIN (time_slots);
CREATE INDEX idx_reservation_settings_is_active ON reservation_settings(is_active);
```

**数据库约束**:

```sql
-- 提前量业务约束
ALTER TABLE reservation_settings
ADD CONSTRAINT check_advance_time_range
CHECK (max_advance_days * 24 > min_advance_hours);
```

**Java Entity** (后端):

```java
@Entity
@Table(name = "reservation_settings")
@Data
public class ReservationSettings {
    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne
    @JoinColumn(name = "store_id", nullable = false, unique = true)
    private Store store;

    @Type(JsonBinaryType.class)
    @Column(name = "time_slots", columnDefinition = "jsonb", nullable = false)
    private List<TimeSlot> timeSlots = new ArrayList<>();

    @Column(name = "min_advance_hours", nullable = false)
    @Min(1)
    private Integer minAdvanceHours = 1;

    @Column(name = "max_advance_days", nullable = false)
    @Min(1)
    private Integer maxAdvanceDays = 30;

    @Column(name = "duration_unit", nullable = false)
    @Pattern(regexp = "^(1|2|4)$")
    private Integer durationUnit = 1;

    @Column(name = "deposit_required", nullable = false)
    private Boolean depositRequired = false;

    @Column(name = "deposit_amount")
    @DecimalMin("0.0")
    private BigDecimal depositAmount;

    @Column(name = "deposit_percentage")
    @Min(0)
    @Max(100)
    private Integer depositPercentage;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreatedDate
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    @LastModifiedDate
    private Instant updatedAt;
}
```

**TypeScript Type** (前端):

```typescript
export interface TimeSlot {
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export interface ReservationSettings {
  id: string;
  storeId: string;
  timeSlots: TimeSlot[];
  minAdvanceHours: number;
  maxAdvanceDays: number;
  durationUnit: 1 | 2 | 4;
  depositRequired: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

---

### 4. ScenarioPackageStoreAssociation (场景包-门店关联)

**说明**: 场景包与门店的多对多关联关系中间表。

**表名**: `scenario_package_store_associations`

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 来源功能 |
|--------|------|------|------|---------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 关联记录唯一标识 | 019 |
| package_id | UUID | FK, NOT NULL → scenario_packages.id ON DELETE CASCADE | 场景包ID（级联删除） | 019 |
| store_id | UUID | FK, NOT NULL → stores.id ON DELETE RESTRICT | 门店ID（限制删除） | 019 |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 创建时间 | 019 |
| created_by | VARCHAR(100) | NULL | 创建人（用户ID或用户名） | 019 |

**业务规则**:

1. **防止重复关联**: 同一场景包不能重复关联同一门店（UNIQUE约束）
2. **级联删除**: 场景包删除时，关联记录自动删除
3. **限制删除**: 门店被关联时，禁止删除门店
4. **关联的门店必须存在且状态为active**

**关系**:

- **ScenarioPackageStoreAssociation N:1 ScenarioPackage**: 多个关联记录属于一个场景包
- **ScenarioPackageStoreAssociation N:1 Store**: 多个关联记录属于一个门店

**数据库索引**:

```sql
CREATE INDEX idx_pkg_store_package ON scenario_package_store_associations(package_id);
CREATE INDEX idx_pkg_store_store ON scenario_package_store_associations(store_id);
CREATE UNIQUE INDEX unique_package_store ON scenario_package_store_associations(package_id, store_id);
```

**Java Entity** (后端):

```java
@Entity
@Table(name = "scenario_package_store_associations")
@Data
public class ScenarioPackageStoreAssociation {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "package_id", nullable = false)
    private UUID packageId;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}
```

**TypeScript Type** (前端):

```typescript
export interface ScenarioPackageStoreAssociation {
  id: string;
  packageId: string;
  storeId: string;
  store?: StoreSummary;
  createdAt: string;
  createdBy?: string;
}
```

---

### 5. StoreOperationLog (门店操作日志)

**说明**: 记录门店所有操作的审计日志，包括创建、编辑、状态变更和删除。

**表名**: `store_operation_logs`

**字段定义**:

| 字段名 | 类型 | 约束 | 说明 | 来源功能 |
|--------|------|------|------|---------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | 日志唯一标识 | 022 |
| store_id | UUID | NOT NULL, FK → stores.id ON DELETE CASCADE | 关联的门店ID | 022 |
| operation_type | VARCHAR(20) | NOT NULL, CHECK IN ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE') | 操作类型 | 022 |
| operator_id | UUID | NULL | 操作人ID（外键关联users表，如存在） | 022 |
| operator_name | VARCHAR(100) | NULL | 操作人名称（冗余字段，便于查询） | 022 |
| before_value | JSONB | NULL | 修改前的值（JSON格式），仅UPDATE和STATUS_CHANGE有值 | 022 |
| after_value | JSONB | NOT NULL | 修改后的值（JSON格式），所有操作类型都有 | 022 |
| operation_time | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | 操作时间 | 022 |
| ip_address | VARCHAR(45) | NULL | 操作IP地址（支持IPv4和IPv6） | 022 |
| remark | TEXT | NULL | 备注（如删除原因） | 022 |

**业务规则**:

1. **操作类型枚举值**:
   - **CREATE**: 创建门店，before_value为null，after_value包含新门店完整数据
   - **UPDATE**: 编辑门店信息，before_value和after_value包含修改前后的完整数据
   - **STATUS_CHANGE**: 状态变更，before_value和after_value包含修改前后的status字段
   - **DELETE**: 删除门店，before_value包含删除前的门店数据，after_value为null

2. **before_value和after_value的JSONB格式示例**:

```json
{
  "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "name": "北京朝阳店",
  "region": "华北",
  "city": "北京",
  "status": "ACTIVE",
  "version": 3
}
```

3. **ON DELETE CASCADE**: 当门店被删除时，相关的操作日志也被删除（保持数据库清洁）

**关系**:

- **StoreOperationLog N:1 Store**: 多个操作日志属于一个门店（外键store_id）

**数据库索引**:

```sql
CREATE INDEX idx_store_operation_logs_store_id ON store_operation_logs(store_id);
CREATE INDEX idx_store_operation_logs_operation_time ON store_operation_logs(operation_time DESC);
```

**Java Entity** (后端):

```java
@Entity
@Table(name = "store_operation_logs")
@Data
public class StoreOperationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "store_id", nullable = false)
    private UUID storeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false, length = 20)
    private OperationType operationType;

    @Column(name = "operator_id")
    private UUID operatorId;

    @Column(name = "operator_name", length = 100)
    private String operatorName;

    @Type(JsonBinaryType.class)
    @Column(name = "before_value", columnDefinition = "jsonb")
    private Map<String, Object> beforeValue;

    @Type(JsonBinaryType.class)
    @Column(name = "after_value", columnDefinition = "jsonb")
    private Map<String, Object> afterValue;

    @Column(name = "operation_time", nullable = false)
    private Instant operationTime = Instant.now();

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "remark", columnDefinition = "TEXT")
    private String remark;
}

public enum OperationType {
    CREATE,
    UPDATE,
    STATUS_CHANGE,
    DELETE
}
```

**TypeScript Type** (前端):

```typescript
export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  STATUS_CHANGE = 'STATUS_CHANGE',
  DELETE = 'DELETE',
}

export interface StoreOperationLog {
  id: string;
  storeId: string;
  operationType: OperationType;
  operatorId?: string;
  operatorName?: string;
  beforeValue?: Record<string, any>;
  afterValue: Record<string, any>;
  operationTime: string;
  ipAddress?: string;
  remark?: string;
}
```

---

## 实体关系图 (ERD)

```
┌────────────────────────────────────────────────────────────┐
│                          stores                            │
├────────────────────────────────────────────────────────────┤
│ id (PK)                 UUID                               │
│ code                    VARCHAR(50) UNIQUE                 │
│ name                    VARCHAR(100) UNIQUE                │
│ region                  VARCHAR(50)                        │
│ province                VARCHAR(50)          ← 020         │
│ city                    VARCHAR(50)          ← 020         │
│ district                VARCHAR(50)          ← 020         │
│ address                 TEXT                 ← 020         │
│ phone                   VARCHAR(30)          ← 020         │
│ status                  VARCHAR(20)          ← 022         │
│ version                 BIGINT               ← 022         │
│ created_at, updated_at  TIMESTAMPTZ                        │
│ created_by, updated_by  UUID                               │
└──────┬─────────────────┬──────────────────┬────────────────┘
       │ 1               │ 1                │ 1
       │                 │                  │
       │ N               │ 1                │ N
       ▼                 ▼                  ▼
┌─────────────┐   ┌──────────────────┐   ┌──────────────────────┐
│    halls    │   │ reservation_     │   │ store_operation_     │
│             │   │ settings         │   │ logs                 │
├─────────────┤   ├──────────────────┤   ├──────────────────────┤
│ id (PK)     │   │ id (PK)          │   │ id (PK)              │
│ store_id(FK)│   │ store_id(FK,UQ)  │   │ store_id (FK)        │
│ code        │   │ time_slots(JSONB)│   │ operation_type       │
│ name        │   │ min_advance_hours│   │ before_value (JSONB) │
│ type        │   │ max_advance_days │   │ after_value (JSONB)  │
│ capacity    │   │ duration_unit    │   │ operation_time       │
│ tags        │   │ deposit_required │   │ operator_id          │
│ status      │   │ deposit_amount   │   │ operator_name        │
└─────────────┘   │ deposit_percentage│  │ ip_address           │
                  │ is_active        │   │ remark               │
                  └──────────────────┘   └──────────────────────┘

       ┌──────────────────────────────────────────┐
       │ scenario_package_store_associations      │
       ├──────────────────────────────────────────┤
       │ id (PK)                                  │
       │ package_id (FK) → scenario_packages.id   │
       │ store_id (FK) → stores.id                │
       │ created_at, created_by                   │
       └──────────────────────────────────────────┘
                       │
                       │ M
                       ▼
       ┌──────────────────────────────────────────┐
       │          scenario_packages               │
       │          (外部实体，来自017功能)          │
       └──────────────────────────────────────────┘
```

---

## 数据库迁移脚本汇总

### V1__create_stores_and_halls.sql (来自 014-hall-store-backend)

```sql
-- 创建 stores 表
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- 创建 halls 表
CREATE TABLE IF NOT EXISTS halls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    code VARCHAR(50),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0 AND capacity <= 1000),
    tags TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_halls_store_id ON halls(store_id);
CREATE INDEX idx_halls_status ON halls(status);
CREATE INDEX idx_halls_type ON halls(type);
CREATE UNIQUE INDEX idx_halls_store_code ON halls(store_id, code) WHERE code IS NOT NULL;
```

### V2__create_reservation_settings.sql (来自 016-store-reservation-settings)

```sql
-- 扩展UUID生成功能
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 reservation_settings 表
CREATE TABLE reservation_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL UNIQUE,
    time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_advance_hours INTEGER NOT NULL DEFAULT 1 CHECK (min_advance_hours > 0),
    max_advance_days INTEGER NOT NULL DEFAULT 30 CHECK (max_advance_days > 0),
    duration_unit INTEGER NOT NULL DEFAULT 1 CHECK (duration_unit IN (1, 2, 4)),
    deposit_required BOOLEAN NOT NULL DEFAULT FALSE,
    deposit_amount DECIMAL(10, 2) CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
    deposit_percentage INTEGER CHECK (deposit_percentage IS NULL OR (deposit_percentage >= 0 AND deposit_percentage <= 100)),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_reservation_settings_store FOREIGN KEY (store_id)
        REFERENCES stores(id) ON DELETE CASCADE,

    CONSTRAINT check_advance_time_range CHECK (max_advance_days * 24 > min_advance_hours)
);

CREATE UNIQUE INDEX idx_reservation_settings_store_id ON reservation_settings(store_id);
CREATE INDEX idx_reservation_settings_time_slots ON reservation_settings USING GIN (time_slots);
CREATE INDEX idx_reservation_settings_is_active ON reservation_settings(is_active);

-- 创建自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reservation_settings_updated_at
BEFORE UPDATE ON reservation_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### V5__add_store_associations.sql (来自 019-store-association)

```sql
-- 场景包-门店关联表
CREATE TABLE IF NOT EXISTS scenario_package_store_associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    package_id UUID NOT NULL REFERENCES scenario_packages(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by VARCHAR(100),

    CONSTRAINT unique_package_store UNIQUE(package_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_pkg_store_package ON scenario_package_store_associations(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_store_store ON scenario_package_store_associations(store_id);

-- 启用 Row Level Security
ALTER TABLE scenario_package_store_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for scenario_package_store_associations"
    ON scenario_package_store_associations FOR ALL USING (true);

-- 注释
COMMENT ON TABLE scenario_package_store_associations IS '场景包-门店关联表，实现场景包与门店的多对多关系';
COMMENT ON COLUMN scenario_package_store_associations.package_id IS '场景包ID，关联 scenario_packages 表';
COMMENT ON COLUMN scenario_package_store_associations.store_id IS '门店ID，关联 stores 表';
COMMENT ON COLUMN scenario_package_store_associations.created_by IS '创建人（用户ID或用户名）';
```

### V6__add_store_address_fields.sql (来自 020-store-address)

```sql
-- 扩展 stores 表添加地址字段
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS province VARCHAR(50),
ADD COLUMN IF NOT EXISTS city VARCHAR(50),
ADD COLUMN IF NOT EXISTS district VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

-- 添加索引以支持按区域筛选
CREATE INDEX IF NOT EXISTS idx_stores_province ON stores(province);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city);
CREATE INDEX IF NOT EXISTS idx_stores_district ON stores(district);

-- 添加约束：phone 格式校验
ALTER TABLE stores
ADD CONSTRAINT chk_phone_format CHECK (
    phone IS NULL OR
    phone ~ '^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$'
);
```

### V7__add_store_crud_fields.sql (来自 022-store-crud)

```sql
-- 扩展 stores 表添加 status 和 version 字段
ALTER TABLE stores
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
  CHECK (status IN ('ACTIVE', 'INACTIVE')),
ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- 创建索引
CREATE INDEX idx_stores_status ON stores(status);

-- 添加字段注释
COMMENT ON COLUMN stores.status IS '门店状态: ACTIVE(启用) | INACTIVE(停用)';
COMMENT ON COLUMN stores.version IS '乐观锁版本号,每次UPDATE自动递增';

-- 创建 store_operation_logs 表
CREATE TABLE store_operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('CREATE', 'UPDATE', 'STATUS_CHANGE', 'DELETE')),
  operator_id UUID,
  operator_name VARCHAR(100),
  before_value JSONB,
  after_value JSONB,
  operation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address VARCHAR(45),
  remark TEXT
);

-- 创建索引
CREATE INDEX idx_store_operation_logs_store_id ON store_operation_logs(store_id);
CREATE INDEX idx_store_operation_logs_operation_time ON store_operation_logs(operation_time DESC);

-- 添加表和列注释
COMMENT ON TABLE store_operation_logs IS '门店操作审计日志';
COMMENT ON COLUMN store_operation_logs.operation_type IS '操作类型: CREATE | UPDATE | STATUS_CHANGE | DELETE';
COMMENT ON COLUMN store_operation_logs.before_value IS 'JSON格式的修改前快照(UPDATE/STATUS_CHANGE时有值)';
COMMENT ON COLUMN store_operation_logs.after_value IS 'JSON格式的修改后快照';

-- 更新现有 stores 为默认状态（如果已有数据）
UPDATE stores
SET status = 'ACTIVE', version = 0
WHERE status IS NULL OR version IS NULL;
```

---

## 验证规则汇总

### Store 实体验证

| 字段 | 前端验证（Zod） | 后端验证（Bean Validation） |
|------|----------------|--------------------------|
| code | z.string().min(1).max(50) | @NotBlank @Size(max=50) |
| name | z.string().min(1).max(100) | @NotBlank @Size(max=100) |
| province | z.string().max(50) | @Size(max=50) |
| city | z.string().max(50) | @Size(max=50) |
| district | z.string().max(50) | @Size(max=50) |
| address | z.string().max(500).optional() | @Size(max=500) |
| phone | z.string().regex(/^(1[3-9]\d{9})|(0\d{2,3}-?\d{7,8})|(400-?\d{3}-?\d{4})$/) | @Pattern(regexp="^(1[3-9]\\d{9})|(0\\d{2,3}-?\\d{7,8})|(400-?\\d{3}-?\\d{4})$") |
| status | z.enum(['ACTIVE', 'INACTIVE']) | @NotNull |
| version | z.number().int().min(0) | @Version @Min(0) |

### Hall 实体验证

| 字段 | 前端验证（Zod） | 后端验证（Bean Validation） |
|------|----------------|--------------------------|
| store_id | z.string().uuid() | @NotNull |
| name | z.string().min(1).max(100) | @NotBlank @Size(max=100) |
| type | z.enum(['VIP', 'CP', 'Party', 'Public']) | @NotNull |
| capacity | z.number().int().min(1).max(1000) | @Min(1) @Max(1000) |
| status | z.enum(['active', 'inactive', 'maintenance']) | @NotNull |

### ReservationSettings 实体验证

| 字段 | 前端验证（Zod） | 后端验证（Bean Validation） |
|------|----------------|--------------------------|
| store_id | z.string().uuid() | @NotNull |
| time_slots | z.array(timeSlotSchema).length(7) | @Size(min=7, max=7) |
| min_advance_hours | z.number().int().positive() | @Min(1) |
| max_advance_days | z.number().int().positive() | @Min(1) |
| duration_unit | z.union([z.literal(1), z.literal(2), z.literal(4)]) | @Pattern(regexp="^(1|2|4)$") |
| deposit_amount | z.number().nonnegative().optional() | @DecimalMin("0.0") |
| deposit_percentage | z.number().int().min(0).max(100).optional() | @Min(0) @Max(100) |

---

## 技术决策摘要

| 决策点 | 选择方案 | 理由 | 来源功能 |
|--------|---------|------|---------|
| Store Status 枚举建模 | VARCHAR + CHECK约束 | 扩展性好，未来可能增加PENDING、ARCHIVED等状态 | 022 |
| 审计日志实现 | 应用层显式调用 | 灵活控制日志粒度，避免数据库触发器复杂性 | 022 |
| 删除安全策略 | 组合方案（应用查询+数据库约束） | 应用层友好提示+数据库强制约束双重保障 | 022 |
| 表单验证 | Zod（前端）+ Bean Validation（后端） | 双重验证确保数据完整性 | 所有功能 |
| 并发编辑处理 | 乐观锁（@Version） | JPA原生支持，性能好，适合低冲突场景 | 022 |
| 电话号码验证 | 组合正则表达式 | 同时支持手机号、座机号、400热线 | 020 |
| 区域城市数据 | 静态TypeScript常量 | MVP阶段简单实现，后续可扩展为数据库字典 | 020 |
| 时间段存储 | JSONB字段 | PostgreSQL原生支持JSON查询，灵活且性能好 | 016 |
| 门店-场景包关联 | 中间表（多对多） | 支持灵活的关联关系，未来可扩展权重等字段 | 019 |

---

## 附录

### 数据库完整DDL

详见上述各个迁移脚本（V1-V7）。

### API 响应格式标准

所有 API 响应遵循统一格式（参见 `.claude/rules/08-api-standards.md`）:

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2025-12-22T15:00:00Z"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "错误描述",
  "details": { ... },
  "timestamp": "2025-12-22T15:00:00Z"
}
```

### 联系方式

如有疑问，请联系开发团队或查阅 `specs/` 目录下的各个功能规格文档。

---

**文档结束**
