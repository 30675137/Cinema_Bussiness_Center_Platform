# Research Notes: 影厅资源后端建模（Store-Hall 一致性）

**Branch**: `014-hall-store-backend`  
**Date**: 2025-12-16  
**Spec**: `specs/014-hall-store-backend/spec.md`

> 本研究文件聚焦后端采用 Spring Boot + Supabase 时，如何为 Store/Hall 建模、
> 集成 Supabase，以及与现有前端排期/影厅资源管理页面对齐。

---

## Decision 1: Supabase 集成方式（Spring Boot）

- **Decision**: 使用 Spring Boot 3.x + 官方 Supabase REST/SQL API（通过 HTTP 客户端）
  进行集成，而不是在后端直接使用数据库驱动连接 Supabase PostgreSQL。
- **Rationale**:
  - 宪法要求统一通过 Supabase 作为单一数据源，避免直接绕过 Supabase 的权限和
    审计机制。
  - 通过 HTTP/REST 集成可以沿用 Supabase 提供的 Row-Level Security、Auth 等能力。
  - Spring Boot 原生支持 WebClient/RestTemplate 等 HTTP 客户端，易于封装为仓储
    层。
- **Alternatives considered**:
  - 直接使用 JDBC/ORM（如 JPA/Hibernate）连接 Supabase 提供的 PostgreSQL 实例：
    - 优点：更熟悉的 ORM 体验。
    - 缺点：绕过 Supabase 的部分能力（如 RLS），与宪法“统一通过 Supabase”冲突。

---

## Decision 2: Store/Hall 主键策略

- **Decision**: 在 Supabase 中为 Store 与 Hall 均使用 UUID 作为主键（`store_id`、
  `hall_id`），并在后端领域模型中映射为 `UUID` 或 `String` 类型，前端暴露为
  `string`。
- **Rationale**:
  - Supabase 默认推荐 UUID 作为主键类型，便于水平扩展且不会暴露自增序列。
  - 前端已将 `Hall.id`/`storeId` 视作字符串，使用 UUID 不会增加额外复杂度。
- **Alternatives considered**:
  - 自增整型 ID：
    - 优点：简单易读。
    - 缺点：在多环境、多租户未来扩展时容易发生冲突，也更易暴露内部信息。

---

## Decision 3: Store-Hall 关系建模方式

- **Decision**: 当前阶段采用 Store 1:N Hall 的简单建模，在 Hall 表中加入
  `store_id` 外键指向 Store 表，不额外建立中间关系表。
- **Rationale**:
  - 规格明确：本期不考虑跨门店共享，同一影厅不会同时属于多个门店。
  - 简化模型，减少 Join 和关系表维护成本。
  - 未来如果引入跨门店共享，可以通过新增关系表（多对多）演进，而不破坏现有
    主键。
- **Alternatives considered**:
  - 单独创建 `store_hall_rel` 关系表（多对多）：
    - 优点：未来扩展灵活。
    - 缺点：在本期“单门店拥有影厅”场景下模型过重，增加复杂度且暂不需要。

---

## Decision 4: 与前端类型对齐策略

- **Decision**: 后端对外 API 的 Hall/Store DTO 字段命名和结构必须与前端
  `frontend/src/pages/schedule/types/schedule.types.ts` 中的 Hall 定义兼容，必要时
  在后端增加映射层，而不是改动前端字段名。
- **Rationale**:
  - 现前端排期与影厅资源管理页面已使用 `Hall` 类型，变更成本较高。
  - 保证“前后端 API 与模型一致性”是本特性的核心目标之一。
- **Alternatives considered**:
  - 在后端直接按数据库字段命名（例如 `hall_name` 等），由前端自行映射：
    - 优点：贴近数据库。
    - 缺点：违背“统一模型”，增加前端维护成本与错误风险。

---

## Decision 5: API 粒度与命名

- **Decision**: 本特性只提供与前端直接相关的只读/简单写入 API：
  - `GET /api/stores`：查询门店列表。
  - `GET /api/stores/{storeId}/halls`：按门店查询影厅列表（支持状态与类型筛选）。
  - 后台维护影厅/门店主数据的管理 API 可以统一放在 `/api/admin/stores` /
    `/api/admin/halls` 前缀下，供运营后台使用。
- **Rationale**:
  - 聚焦于支撑现有“影厅资源管理”和“排期甘特图”页面。
  - 将管理接口与前端只读接口分开，便于权限控制与后续演进。
- **Alternatives considered**:
  - 将所有接口统一在一个 `/api/halls` 下，通过查询参数区分：
    - 优点：路径更少。
    - 缺点：语义不清晰，不利于未来扩展。



