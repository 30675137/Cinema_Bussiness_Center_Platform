# Tasks: 影厅资源后端建模（Store-Hall 一致性）

**Input**: Design documents from `/specs/014-hall-store-backend/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api.yaml`, `quickstart.md`

> 任务列表按用户故事分组，支持独立实现与测试；同时标记可并行执行的任务。

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 为后端 Spring Boot + Supabase 集成准备基础工程与配置骨架。

- [x] T001 初始化后端模块骨架（如 `backend/` 目录、Maven 项目）并在 `backend/pom.xml` 中添加 Spring Boot 3.x 与 JUnit5 基本依赖
- [x] T002 在 `backend/src/main/resources/application.yml` 中增加 Supabase 相关配置占位（`supabase.url`、`supabase.service-role-key` 等），并通过环境变量读取
- [x] T003 [P] 在 `backend/src/main/java/com/cinema/hallstore/config/SupabaseConfig.java` 中定义 `WebClient supabaseWebClient` Bean，统一设置 baseUrl、认证 Header 与超时
- [x] T004 [P] 在 `backend/src/main/java/com/cinema/hallstore/config/GlobalExceptionHandler.java` 中创建全局异常处理器，将验证/业务异常映射为 `ErrorResponse` 结构

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有用户故事共用的基础能力（领域模型、DTO、统一响应封装、日志等）。  
**⚠️ CRITICAL**: 本阶段未完成前，不开始任何 US1/US2/US3 实现。

- [x] T005 在 `backend/src/main/java/com/cinema/hallstore/domain/Store.java` 中实现 Store 领域模型（字段与状态枚举对齐 `data-model.md`）
- [x] T006 在 `backend/src/main/java/com/cinema/hallstore/domain/Hall.java` 中实现 Hall 领域模型（字段、状态与类型枚举对齐 `data-model.md`）
- [x] T007 [P] 在 `backend/src/main/java/com/cinema/hallstore/domain/enums/StoreStatus.java` 与 `HallStatus.java`、`HallType.java` 中定义状态与类型枚举（含注释说明）
- [x] T008 [P] 在 `backend/src/main/java/com/cinema/hallstore/dto/StoreDTO.java` 与 `HallDTO.java` 中定义对外 DTO，字段命名对齐前端 `Hall`/`Store` 类型与 `contracts/api.yaml`
- [x] T009 在 `backend/src/main/java/com/cinema/hallstore/dto/ApiResponse.java` 中实现统一响应包装结构（包含 `data`、`error`、`message` 字段）
- [x] T010 [P] 在 `backend/src/main/java/com/cinema/hallstore/mapper/StoreMapper.java` 与 `HallMapper.java` 中实现 Domain ↔ DTO 映射工具类
- [x] T011 在 `backend/src/test/java/com/cinema/hallstore/domain/` 下为 Store/Hall 领域模型补充基本单元测试（校验枚举与必填字段约束）

---

## Phase 3: User Story 1 - 运营配置影厅主数据 (Priority: P1) 🎯 MVP

**Goal**: 支持运营通过后端 API 维护影厅主数据（创建/编辑/查看/停用），并让前端“影厅资源管理”页按门店拉取统一结构的影厅列表。  
**Independent Test**: 在仅实现 US1 时，可为指定门店创建/编辑/停用影厅；前端调用“按门店查询影厅列表”API 能看到最新影厅数据且字段完全对齐模型。

### Tests for User Story 1

- [x] T012 [P] [US1] 在 `backend/src/test/java/com/cinema/hallstore/contracts/HallAdminContractTest.java` 中为 `/api/admin/halls` 创建/更新接口编写契约测试（基于 `contracts/api.yaml`）
- [x] T013 [P] [US1] 在 `backend/src/test/java/com/cinema/hallstore/contracts/HallQueryContractTest.java` 中为 `GET /api/stores/{storeId}/halls` 编写契约测试，校验返回字段结构

### Implementation for User Story 1

- [x] T014 [P] [US1] 在 `backend/src/main/java/com/cinema/hallstore/repository/HallRepository.java` 中通过 Supabase WebClient 实现按条件查询/创建/更新 Hall 的底层访问方法
- [x] T015 [US1] 在 `backend/src/main/java/com/cinema/hallstore/service/HallService.java` 中实现影厅主数据业务逻辑（含创建、编辑、状态变更与基本校验）
- [x] T016 [US1] 在 `backend/src/main/java/com/cinema/hallstore/controller/HallAdminController.java` 中实现 `/api/admin/halls` POST/PUT/GET 接口（使用 DTO + Service + Mapper）
- [x] T017 [US1] 在 `backend/src/main/java/com/cinema/hallstore/controller/HallQueryController.java` 中实现 `GET /api/stores/{storeId}/halls`，支持按状态与类型筛选
- [x] T018 [US1] 在 `backend/src/test/java/com/cinema/hallstore/service/HallServiceTest.java` 中为创建/编辑/停用影厅编写单元测试，覆盖容量>0、类型枚举、状态流转等规则
- [x] T019 [US1] 在 `backend/src/test/java/com/cinema/hallstore/controller/HallAdminControllerIntegrationTest.java` 中编写集成测试，验证通过 HTTP 调用完成影厅创建与状态更新
- [x] T020 [US1] 在 `backend/src/test/java/com/cinema/hallstore/controller/HallQueryControllerIntegrationTest.java` 中验证按门店查询影厅列表时返回数据与 DTO/前端类型一致

**Checkpoint**: US1 实现后，可独立完成影厅主数据维护与按门店查询，并通过契约/集成测试验证。

---

## Phase 4: User Story 2 - 建模门店-影厅关系 (Priority: P1)

**Goal**: 在数据模型和 API 层面清晰表达 Store 与 Hall 的 1:N 关系，保证按门店维度查询影厅时关系准确，并能支持门店停用时的历史保留策略。  
**Independent Test**: 仅实现 US2 时，可在数据库中配置多个门店与影厅，并通过按门店查询接口准确返回各自影厅集合；门店被停用后关系仍可用于历史查询。

### Tests for User Story 2

- [x] T021 [P] [US2] 在 `backend/src/test/java/com/cinema/hallstore/contracts/StoreHallRelationContractTest.java` 中为 `GET /api/stores/{storeId}/halls` 设计多门店多影厅场景契约测试

### Implementation for User Story 2

- [x] T022 [P] [US2] 在 `backend/src/main/java/com/cinema/hallstore/repository/StoreRepository.java` 中实现基于 Supabase 的 Store 基础查询（按状态过滤）
- [x] T023 [US2] 在 `backend/src/main/java/com/cinema/hallstore/service/StoreService.java` 中实现门店列表与门店详情查询逻辑（含 active/disabled 状态处理）
- [x] T024 [US2] 在 `backend/src/main/java/com/cinema/hallstore/controller/StoreQueryController.java` 中实现 `GET /api/stores` 与 `GET /api/stores/{storeId}` 接口
- [x] T025 [US2] 在 `backend/src/test/java/com/cinema/hallstore/service/StoreServiceTest.java` 中验证多门店、多影厅组合下按门店查询影厅的正确性（含门店停用场景）
- [x] T026 [US2] 在 `backend/src/test/java/com/cinema/hallstore/controller/StoreQueryControllerIntegrationTest.java` 中为门店查询接口编写集成测试，覆盖 active/disabled 状态

**Checkpoint**: US2 完成后，门店与影厅关系可在数据层与 API 层完整表达，并支持历史查询语义。

---

## Phase 5: User Story 3 - 前后端 API 与模型一致性 (Priority: P2)

**Goal**: 确保“影厅资源管理”和“排期甘特图”前端使用的 Hall/Store 类型与后端 API 完全一致，前后端不再需要额外字段映射或重复维护。  
**Independent Test**: 仅实现 US3 时，前端两处页面均可直接消费新的 `/api/stores` 与 `/api/stores/{storeId}/halls` 接口，字段名和含义保持一致，无需前端转换。

### Tests for User Story 3

- [x] T027 [P] [US3] 在 `frontend/src/pages/schedule/__tests__/hallApi.integration.test.ts` 中编写前端集成测试，验证调用新后端 API 时 Hall 类型字段与期望一致

### Implementation for User Story 3

- [x] T028 [P] [US3] 在 `frontend/src/pages/schedule/services/scheduleService.ts` 中新增/调整获取门店与影厅的 API 调用，使之对接 `/api/stores` 与 `/api/stores/{storeId}/halls`
- [x] T029 [US3] 在 `frontend/src/pages/schedule/hooks/useScheduleQueries.ts` 与 `frontend/src/pages/schedule/HallResources.tsx` 中适配新的 Hall/Store 字段（若有命名差异）
- [x] T030 [US3] 在 `frontend/src/pages/schedule/__tests__/hallResources.integration.test.tsx` 中增加对"影厅资源管理"页面的端到端验证（使用 MSW 模拟新后端响应结构）
- [x] T031 [US3] 在 `frontend/src/pages/schedule/__tests__/ganttChart.integration.test.tsx` 中补充针对新 Hall/Store API 的场景，确保排期甘特图页使用统一实体字段

**Checkpoint**: US3 完成后，前后端在 Hall/Store 字段层面完全一致，任何一侧变更需同步更新规范与契约。

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 提升整体可维护性、可观测性与性能，覆盖多用户故事的横切关注点。

- [x] T032 [P] 在 `specs/014-hall-store-backend/` 下补充/更新文档（特别是 `quickstart.md` 与 `data-model.md` 中的最终字段与 API 示例）
- [x] T033 在 `backend/src/main/java/com/cinema/hallstore/` 范围内进行代码清理与重构（消除重复、提升命名、补充注释）
- [x] T034 [P] 在 `backend/src/test/` 中增加缺失的单元/集成测试用例，确保关键路径覆盖率达标
- [x] T035 [P] 根据实际 Supabase 性能表现，检查并优化常用查询（例如添加或调整 Supabase 端索引）
- [x] T036 在 `docs/` 或 `specs/014-hall-store-backend/` 中记录已实现的审计与日志策略，以支持 SC-004

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖，可立即开始
- **Foundational (Phase 2)**: 依赖 Phase 1 完成，阻塞所有用户故事
- **User Stories (Phase 3–5)**: 依赖 Phase 2 完成
  - US1 与 US2（均为 P1）可在基础层完成后并行推进
  - US3（P2）依赖 US1/US2 提供稳定 API 与数据模型
- **Polish (Phase 6)**: 依赖所有计划内用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 基于基础领域模型与 Supabase 集成，无其他故事依赖
- **User Story 2 (P1)**: 依赖已存在的 Store/Hall 领域模型，可与 US1 并行，但在语义上强化关系建模
- **User Story 3 (P2)**: 依赖 US1/US2 暴露的稳定 API 与字段结构，用于前后端一致性校验

### Within Each User Story

- 测试（契约/集成）优先编写，并在实现前确保失败
- 先 Repository，再 Service，最后 Controller 与前端适配
- 保证每个用户故事在本阶段内即可独立验证与回归

---

## Parallel Opportunities

- Phase 1 中标记为 [P] 的配置类与异常处理可并行开发
- Phase 2 中 DTO、枚举和 Mapper 相关任务可在不同文件上并行推进
- US1 中 Repository 与契约测试、Service 单测可在依赖清晰时并行
- US2 的 Store 相关 Repository/Service 与 US1 的 Hall 逻辑可并行，后续在集成测试中汇合
- US3 的前端适配与测试可在后端 API 稳定后，与 Phase 6 中文档与性能优化并行进行

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1 + Phase 2，打好后端基础骨架与领域模型
2. 实现 Phase 3（US1），使运营可维护影厅主数据并通过 API 查询
3. 使用契约与集成测试验证 US1 独立可用，满足基础主数据需求

### Incremental Delivery

1. 在 MVP（US1）稳定后，补充 US2 的门店-影厅关系建模与门店查询接口
2. 随后实现 US3，使前后端类型与 API 完全一致，减少前端适配成本
3. 最后执行 Phase 6 的性能优化、文档补全与横切关注点完善

### Parallel Team Strategy

1. 小团队可先串行完成 Phase 1–3，确保 MVP 可用，再扩展 US2/US3
2. 多人团队可在完成 Phase 1–2 后：
   - 开发者 A 负责 US1（影厅主数据与管理接口）
   - 开发者 B 负责 US2（门店与关系查询）
   - 开发者 C 负责 US3（前端适配与一致性验证）
3. 所有成员在 Phase 6 联合完成重构、性能优化与文档收尾。


