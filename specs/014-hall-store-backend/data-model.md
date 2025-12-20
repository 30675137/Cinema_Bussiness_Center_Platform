# Data Model: 影厅资源后端建模（Store-Hall 一致性）

**Branch**: `014-hall-store-backend`  
**Spec**: `specs/014-hall-store-backend/spec.md`  
**Date**: 2025-12-16

> 本数据模型基于 Spring Boot + Supabase 架构，围绕 Store（门店）与 Hall（影厅）
> 主数据与 1:N 关系展开，暂不考虑多租户和跨门店共享。

---

## 1. Store（门店）实体

### 1.1 表结构（Supabase / PostgreSQL）

- 表名建议：`stores`

字段：

| 字段名      | 类型        | 约束                         | 说明                         |
|------------|------------|------------------------------|------------------------------|
| `id`       | UUID       | PK, 默认 `gen_random_uuid()` | 内部主键（后端/DB 使用）    |
| `code`     | TEXT       | UNIQUE, NOT NULL             | 门店编码（对外展示/集成用） |
| `name`     | TEXT       | NOT NULL                     | 门店名称                     |
| `region`   | TEXT       | NULLABLE                     | 所属区域/城市                |
| `status`   | TEXT       | NOT NULL, 默认 `'active'`    | 门店状态：`active/disabled` |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()   | 创建时间                     |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()   | 更新时间                     |

### 1.2 业务规则与验证

- `code` 在全局范围内必须唯一，用于前端/运营识别门店和对接其他系统。
- `status` 枚举：
  - `active`：启用，前端可在新建排期/预约等界面选择。
  - `disabled`：停用，仅在历史/报表查询中可见。
- 删除门店时一般采用“逻辑停用”（置为 `disabled`），不做物理删除，以保留历史
  排期与影厅关系。

---

## 2. Hall（影厅）实体

### 2.1 表结构（Supabase / PostgreSQL）

- 表名建议：`halls`

字段：

| 字段名        | 类型        | 约束                                | 说明                                         |
|--------------|------------|-------------------------------------|----------------------------------------------|
| `id`         | UUID       | PK, 默认 `gen_random_uuid()`        | 影厅主键                                     |
| `store_id`   | UUID       | NOT NULL, FK → `stores.id`          | 所属门店主键                                 |
| `code`       | TEXT       | NOT NULL                            | 影厅编码（可选唯一，按门店范围约束）        |
| `name`       | TEXT       | NOT NULL                            | 影厅名称                                     |
| `type`       | TEXT       | NOT NULL                            | 影厅类型：`VIP/CP/Party/Public` 等          |
| `capacity`   | INTEGER    | NOT NULL                            | 可容纳人数（> 0）                            |
| `tags`       | TEXT[]     | NULLABLE                            | 标签列表（如“真皮沙发”“KTV设备”）          |
| `status`     | TEXT       | NOT NULL, 默认 `'active'`           | 影厅状态：`active/inactive/maintenance` 等  |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()           | 创建时间                                     |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now()           | 更新时间                                     |

### 2.2 业务规则与验证

- `store_id` 必须指向一个存在且非物理删除的门店。
- `capacity` 必须为正整数，建议在规格中约定上限（例如 1000）以防止异常值。
- `code` 可以在门店内唯一（`UNIQUE (store_id, code)`），便于运营快速识别；如不需
  编码，可暂不强制唯一。
- `status` 最少包括：
  - `active`：可用于新建排期/预约。
  - `inactive`：停用，不再用于新建排期，但历史数据保留。
  - `maintenance`：维护中，可用于维护/锁座时段建模，但不允许业务排期。

---

## 3. Store-Hall 关系建模

### 3.1 当前阶段（一对多）

- 关系：`Store 1:N Hall`，由 `halls.store_id` 外键表达。
- 不存在 Hall 跨多个 Store 的场景（**不支持跨门店共享**）。
- 查询某门店的影厅列表示例（伪 SQL）：

```sql
SELECT h.*
FROM halls h
JOIN stores s ON h.store_id = s.id
WHERE s.id = :storeId
  AND s.status = 'active';
```

### 3.2 未来扩展（仅备注，不在本期实现）

- 如未来需要跨门店共享影厅，可引入 `store_hall_rel` 关系表：
  - 字段：`store_id`, `hall_id`, `relation_type` 等。
  - 本期不设计该表，只在此预留演进方向说明。

---

## 4. 后端领域模型（简要）

### 4.1 Store Domain Model（示例）

```java
public class Store {
  private UUID id;
  private String code;
  private String name;
  private String region;
  private StoreStatus status; // ACTIVE, DISABLED
  private Instant createdAt;
  private Instant updatedAt;
}
```

### 4.2 Hall Domain Model（示例）

```java
public class Hall {
  private UUID id;
  private UUID storeId;
  private String code;
  private String name;
  private HallType type;      // VIP, CP, PARTY, PUBLIC...
  private int capacity;
  private List<String> tags;
  private HallStatus status;  // ACTIVE, INACTIVE, MAINTENANCE...
  private Instant createdAt;
  private Instant updatedAt;
}
```

> 实际实现中可引入 DTO（对外 API）与 Domain/Entity 分层，以适配 Supabase 返回
> 结构和前端字段命名需求。

---

## 5. 与前端模型的映射

当前前端 `Hall` 类型参考（简化）：

- 文件：`frontend/src/pages/schedule/types/schedule.types.ts`
- 字段：`id, name, capacity, type, tags, status, createdAt, updatedAt` 等。

映射策略：

- Supabase 表字段 → 后端 DTO 属性 → 前端 Hall 类型：
  - `halls.id` → `Hall.id`（string/UUID）
  - `halls.name` → `Hall.name`
  - `halls.capacity` → `Hall.capacity`
  - `halls.type` → `Hall.type`
  - `halls.tags` → `Hall.tags`
  - `halls.status` → `Hall.status`
  - `halls.created_at` → `Hall.createdAt`
  - `halls.updated_at` → `Hall.updatedAt`
- 前端使用的 `storeId` 将在调用查询接口时作为参数或在 API 响应中体现（例如在
  影厅列表响应中附带 `storeId` 字段，或由 URL 路径 `/stores/{storeId}/halls` 表达）。

---

## 6. 状态与生命周期（简要）

- Store 生命周期：
  - 创建 → `active`
  - 业务停用 → `disabled`（保留历史数据）
- Hall 生命周期：
  - 创建 → `active`
  - 维护/锁座时段使用 `status = maintenance` 或通过排期事件表达（本特性主要关注
    主数据，不改动排期事件模型）。
  - 长期停用 → `inactive`

> 具体状态对排期事件的影响在排期特性（013-schedule-management）中定义，本特
> 性仅负责主数据层面的状态字段及语义对齐。

---

## 7. API 响应示例

### 7.1 门店列表响应

```json
GET /api/stores?status=ACTIVE

{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "code": "STORE-SH",
      "name": "上海门店",
      "region": "上海",
      "status": "ACTIVE",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

### 7.2 按门店查询影厅列表响应

```json
GET /api/stores/550e8400-e29b-41d4-a716-446655440001/halls?status=ACTIVE

{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "VIP影厅A",
      "capacity": 120,
      "type": "VIP",
      "tags": ["真皮沙发", "KTV设备"],
      "status": "active",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-10T14:20:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "name": "公众厅B",
      "capacity": 200,
      "type": "Public",
      "tags": [],
      "status": "active",
      "createdAt": "2025-01-02T00:00:00Z",
      "updatedAt": "2025-01-02T00:00:00Z"
    }
  ],
  "total": 2
}
```

### 7.3 字段命名规范

后端返回的 DTO 使用 camelCase 命名，与前端 TypeScript 类型保持一致：

| Supabase 表字段 | 后端 DTO 字段 | 前端类型字段 |
|----------------|--------------|-------------|
| `id`           | `id`         | `id`        |
| `store_id`     | `storeId`    | `storeId`   |
| `created_at`   | `createdAt`  | `createdAt` |
| `updated_at`   | `updatedAt`  | `updatedAt` |

---

## 8. 实现参考

相关源文件位置：

**后端**:
- 领域模型: `backend/src/main/java/com/cinema/hallstore/domain/`
- DTO: `backend/src/main/java/com/cinema/hallstore/dto/`
- Repository: `backend/src/main/java/com/cinema/hallstore/repository/`
- Service: `backend/src/main/java/com/cinema/hallstore/service/`
- Controller: `backend/src/main/java/com/cinema/hallstore/controller/`

**前端**:
- 类型定义: `frontend/src/pages/schedule/types/schedule.types.ts`
- API 服务: `frontend/src/pages/schedule/services/scheduleService.ts`
- Query Hooks: `frontend/src/pages/schedule/hooks/useScheduleQueries.ts`



