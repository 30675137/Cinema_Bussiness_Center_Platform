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
  - `GET /api/halls`：查询所有影厅列表（跨门店）。
  - 后台维护影厅/门店主数据的管理 API 可以统一放在 `/api/admin/stores` /
    `/api/admin/halls` 前缀下，供运营后台使用。
- **Rationale**:
  - 聚焦于支撑现有"影厅资源管理"和"排期甘特图"页面。
  - 将管理接口与前端只读接口分开，便于权限控制与后续演进。
  - `/api/halls` 为新增端点，支持前端门店管理页面查看所有影厅的需求。
- **Alternatives considered**:
  - 将所有接口统一在一个 `/api/halls` 下，通过查询参数区分：
    - 优点：路径更少。
    - 缺点：语义不清晰，不利于未来扩展。

---

## Decision 6: 前端门店列表分页策略

- **Decision**: 门店列表页面采用**前端分页**策略，即后端一次性返回所有门店数据
  （不分页），前端使用 Ant Design Table 的 pagination 配置进行客户端分页展示。
- **Rationale**:
  - 预期门店数量为 10-50家，数据量较小（约 5-50KB），一次性加载不会造成性能问题。
  - 前端分页实现更简单，用户体验更流畅（无需等待页面切换请求）。
  - 搜索和筛选功能可以在客户端直接操作完整数据集，响应更快。
  - 如果未来门店数量增长到 100+ 家，可以再升级为后端分页。
- **Alternatives considered**:
  - 后端分页（GET /api/stores?page=1&size=10）：
    - 优点：适合大数据量场景，节省带宽。
    - 缺点：当前数据量下过度设计，增加前后端复杂度，且搜索筛选需要后端配合。

---

## Decision 7: 枚举值序列化一致性策略

- **Decision**: 前后端枚举值统一使用**小写字符串**表示，后端通过 Jackson 的
  `@JsonValue` 和 `@JsonCreator` 注解实现枚举与小写字符串的双向转换。
  - StoreStatus: `"active"`, `"disabled"`
  - HallStatus: `"active"`, `"inactive"`, `"maintenance"`
  - HallType: `"VIP"`, `"Public"`, `"CP"`, `"Party"` (保持原始大小写)
- **Rationale**:
  - 前端 TypeScript 类型定义已使用小写字符串（如 `status: 'active' | 'inactive'`）。
  - 避免前后端枚举值大小写不一致导致的数据转换错误。
  - HallType 因业务语义保持原始大小写（VIP 为大写缩写，Public/Party 为首字母大写）。
- **Alternatives considered**:
  - 后端使用 UPPERCASE 枚举，前端手动转换：
    - 优点：符合 Java 枚举命名惯例。
    - 缺点：违背"前后端模型一致性"原则，增加前端转换负担。

---

## Decision 8: API 响应结构标准化

- **Decision**: 后端 API 响应结构分为两种类型：
  1. **标准响应**（用于 GET /api/stores, GET /api/halls）：
     ```json
     {
       "success": true,
       "data": [...],
       "total": 10,
       "message": "查询成功",
       "code": 200
     }
     ```
  2. **简化响应**（用于 GET /api/stores/{storeId}/halls）：
     ```json
     {
       "data": [...],
       "total": 5
     }
     ```
- **Rationale**:
  - 标准响应提供完整的状态信息（success, message, code），便于前端统一错误处理。
  - 简化响应保持与现有 API 的兼容性（已实现的接口使用简化格式）。
  - 前端通过 TanStack Query 的 `queryFn` 统一处理两种格式。
- **Alternatives considered**:
  - 所有 API 统一使用标准响应格式：
    - 优点：一致性更好。
    - 缺点：需要修改现有接口，影响已有前端页面。

---

## Decision 9: 前端门店管理页面交互方式

- **Decision**: 门店列表页面为**只读展示页面**，不支持点击门店行查看详情或执行其他操作。
  用户仅可通过名称搜索、状态筛选和分页浏览门店列表。
- **Rationale**:
  - 根据澄清会议结论，门店管理页面定位为"参考数据"而非主要业务流程。
  - 门店的创建、编辑、删除操作在后台管理系统中完成，前端仅需查询能力。
  - 避免增加不必要的详情页面复杂度，保持页面职责单一。
  - 如需查看某门店的影厅列表，用户可切换到影厅资源管理页面并使用门店筛选器。
- **Alternatives considered**:
  - 支持点击门店行打开详情弹窗或跳转详情页：
    - 优点：提供更丰富的交互。
    - 缺点：增加开发成本，且当前门店信息字段较少（仅名称、区域、状态），详情页价值有限。

---

## Decision 10: 测试策略与工具选型

- **Decision**: 采用分层测试策略：
  - **后端单元测试**：使用 JUnit 5 + Mockito 测试 Service 和 Repository 层，
    使用 MockWebServer 模拟 Supabase REST API 响应。
  - **后端集成测试**：使用 Spring Boot Test + @WebMvcTest 测试 Controller 层，
    确保 API 契约正确。
  - **前端单元测试**：使用 Vitest + Testing Library 测试组件逻辑和 hooks。
  - **前端集成测试**：使用 MSW (Mock Service Worker) 模拟后端 API，
    测试 TanStack Query 数据流。
  - **E2E 测试**：使用 Playwright 测试关键用户流程（门店列表加载、搜索、筛选）。
- **Rationale**:
  - 分层测试确保每层职责清晰，测试覆盖率高。
  - MockWebServer 可精确模拟 Supabase API 行为，避免依赖真实数据库。
  - MSW 提供接近真实的 HTTP Mock，测试更可靠。
  - Playwright 覆盖端到端流程，确保用户体验符合预期。
- **Alternatives considered**:
  - 使用真实 Supabase 测试环境：
    - 优点：测试更接近生产环境。
    - 缺点：依赖外部服务，测试不稳定，且难以模拟各种边界情况。

---
