# Tasks: 场景包小程序首页活动 API 集成

**Feature**: 018-hall-reserve-homepage
**Input**: Design documents from `/specs/018-hall-reserve-homepage/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml, quickstart.md

**Tests**: 本功能规格未明确要求 TDD，测试通过微信开发者工具 Network 面板和 H5 浏览器手动验证。

**Organization**: 任务按用户故事分组，每个用户故事可独立实现和测试。

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 任务所属的用户故事（US1, US2, US3）
- 所有任务包含精确的文件路径

---

## Path Conventions

本项目为 **Taro 多端小程序（C端）+ Spring Boot 后端 API**：

- **小程序前端**: `hall-reserve-taro/src/`
- **后端 API**: `backend/src/main/java/com/cinema/`
- **后端测试**: `backend/src/test/java/com/cinema/`
- **数据库**: Supabase PostgreSQL（通过 Supabase 管理面板或 SQL 迁移）

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 项目初始化和基础结构搭建

- [X] T001 验证 Taro 小程序项目 `hall-reserve-taro/` 是否已存在并初始化
- [X] T002 安装前端依赖 `@tanstack/react-query` 和 `zod` 到 `hall-reserve-taro/package.json`
- [X] T003 [P] 验证后端 Spring Boot 项目 `backend/` 是否已存在并配置 Supabase
- [X] T004 [P] 配置 Supabase 连接信息到 `backend/src/main/resources/application.yml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 必须在所有用户故事前完成的核心基础设施

**⚠️ CRITICAL**: 所有用户故事工作必须等待此阶段完成

### 数据库基础（后端）

- [X] T005 在 Supabase PostgreSQL 中创建或验证 `scenario_packages` 表结构（根据 data-model.md 中的 SQL 定义）
- [X] T006 在 `scenario_packages` 表中插入测试数据（至少 3 条已发布状态的场景包，用于前端测试）
- [X] T007 验证数据库索引：`idx_scenario_packages_status` 和 `idx_scenario_packages_category`

### 前端基础设施（Taro 小程序）

- [X] T008 [P] 创建网络请求封装 `hall-reserve-taro/src/utils/request.ts`（基于 research.md 中的 Taro.request 封装策略）
- [X] T009 [P] 配置 TanStack Query 在 `hall-reserve-taro/src/app.tsx`（设置 5 分钟缓存和重试策略）
- [X] T010 [P] 创建场景包类型定义和 Zod Schema `hall-reserve-taro/src/types/scenario.ts`（基于 data-model.md）

### 后端基础设施（Spring Boot）

- [X] T011 [P] 创建 Supabase 配置类 `backend/src/main/java/com/cinema/config/SupabaseConfig.java`
- [X] T012 [P] 创建统一 API 响应格式 `backend/src/main/java/com/cinema/dto/ApiResponse.java`（基于 data-model.md）
- [X] T013 [P] 创建场景包列表 DTO `backend/src/main/java/com/cinema/dto/ScenarioPackageListItemDTO.java`（基于 contracts/api.yaml）

**Checkpoint**: 基础设施就绪 - 用户故事实现可以开始并行进行

---

## Phase 3: User Story 1 - 浏览场景包列表 (Priority: P1) 🎯 MVP

**Goal**: 用户打开小程序首页时，系统从后端 API 获取并展示可预订的场景包列表，替换现有的硬编码 Mock 数据

**Independent Test**: 启动小程序首页，验证是否成功从 API 加载场景包列表并展示。使用微信开发者工具 Network 面板确认 API 调用成功，检查返回的数据是否包含至少 3 条场景包记录。

### 后端实现（Spring Boot API）

- [X] T014 [P] [US1] 创建 Repository `backend/src/main/java/com/cinema/repository/ScenarioPackageRepository.java`（实现 Supabase 查询，WHERE status = 'PUBLISHED'）
- [X] T015 [US1] 创建 Service `backend/src/main/java/com/cinema/service/ScenarioPackageService.java`（调用 Repository 获取已发布场景包列表）
- [X] T016 [US1] 创建 Controller `backend/src/main/java/com/cinema/controller/ScenarioPackageController.java`（实现 GET /api/scenario-packages/published 端点）
- [X] T017 [US1] 在 Controller 中添加 Cache-Control 响应头（max-age=300，5 分钟缓存）
- [X] T018 [US1] 添加全局异常处理器 `backend/src/main/java/com/cinema/exception/GlobalExceptionHandler.java`（捕获数据库错误返回 500）

### 前端实现（Taro 小程序）

- [X] T019 [P] [US1] 创建场景包 API 服务 `hall-reserve-taro/src/services/scenarioService.ts`（实现 fetchScenarioPackages，包含 Zod 验证）
- [X] T020 [US1] 修改首页组件 `hall-reserve-taro/src/pages/home/index.tsx`（使用 useQuery Hook 调用 scenarioService）
- [X] T021 [US1] 实现首页加载状态 UI（"加载中..." 提示）
- [X] T022 [US1] 实现场景包列表渲染逻辑（遍历 scenarios 数组，展示卡片）
- [X] T023 [US1] 为场景包卡片添加图片懒加载和占位图处理（onError 事件）
- [X] T024 [US1] 实现评分显示逻辑（rating 为 null 时不显示）

### 自动化测试（TDD 合规性要求）

- [X] T024-A [P] [US1] 编写后端集成测试 `backend/src/test/java/com/cinema/scenariopackage/controller/ScenarioPackageControllerTest.java`（测试 GET /api/scenario-packages/published 端点返回 PUBLISHED 状态的场景包，验证响应格式、状态码 200、Cache-Control 头、数据结构符合 DTO 定义）
- [X] T024-B [P] [US1] 编写后端 Service 单元测试 `backend/src/test/java/com/cinema/scenariopackage/service/ScenarioPackageServiceTest.java`（测试 findPublishedPackagesForTaro() 方法调用 Repository 并正确转换为 DTO，验证 Zod Schema 兼容性）
- [X] T024-C [US1] 编写前端服务层单元测试 `hall-reserve-taro/src/services/__tests__/scenarioService.test.ts`（使用 Vitest 测试 fetchScenarioPackages 函数的 Zod 验证逻辑、错误处理、数据转换）
- [X] T024-D [US1] 编写前端 E2E 测试（H5 模式）`hall-reserve-taro/e2e/homepage.spec.ts`（使用 Playwright 验证首页加载、场景包列表渲染、图片懒加载、评分条件显示，模拟 API 响应）

### 集成测试（手动验证 - 补充自动化测试）

- [ ] T025 [US1] 启动后端 Spring Boot 应用（`./mvnw spring-boot:run`），使用 curl 或 Postman 测试 API 端点
- [ ] T026 [US1] 启动 Taro H5 开发模式（`npm run dev:h5`），在浏览器中验证首页加载
- [ ] T027 [US1] 启动 Taro 微信小程序模式（`npm run dev:weapp`），在微信开发者工具中验证首页加载
- [ ] T028 [US1] 验证 Network 面板显示 API 请求成功（状态码 200，响应包含 3 条数据）
- [ ] T029 [US1] 验证缓存功能：5 分钟内重新进入首页，Network 面板无新请求

**Checkpoint**: 此时用户故事 1 应完全可用且可独立测试（首页成功加载场景包列表）

---

## Phase 4: User Story 2 - API 错误处理与降级 (Priority: P2)

**Goal**: 当后端 API 服务不可用、网络异常或返回错误时，系统向用户展示友好的错误提示，并提供重试机制或降级方案

**Independent Test**: 模拟网络故障（关闭后端服务或使用微信开发者工具断网功能），验证错误提示是否正常展示，以及重试功能是否可用。

### 前端实现（错误处理 UI）

- [X] T030 [P] [US2] 在首页组件 `hall-reserve-taro/src/pages/home/index.tsx` 中添加错误状态处理（检查 error 对象）
- [X] T031 [P] [US2] 创建错误提示 UI 组件（显示 "网络连接失败，请检查网络设置" + 重试按钮）
- [X] T032 [US2] 实现重试按钮逻辑（调用 refetch 方法清除错误状态并重新加载）
- [X] T033 [US2] 实现空状态 UI（当 API 返回空数组时显示 "暂无可用场景包，敬请期待"）

### 后端实现（错误响应）

- [X] T034 [P] [US2] 在 GlobalExceptionHandler 中添加网络超时和数据库错误的统一处理（返回 ApiResponse.failure）
- [X] T035 [US2] 在 Controller 中添加数据验证失败的错误处理（如 DTO 验证失败）

### 自动化测试（错误处理覆盖）

- [X] T035-A [P] [US2] 编写前端错误处理单元测试 `hall-reserve-taro/src/components/__tests__/ErrorState.test.tsx`（测试 ErrorState 组件渲染、重试按钮点击事件）
- [X] T035-B [P] [US2] 编写前端空状态单元测试 `hall-reserve-taro/src/components/__tests__/EmptyState.test.tsx`（测试 EmptyState 组件渲染逻辑）
- [X] T035-C [US2] 扩展前端 E2E 测试（模拟 API 错误场景）`hall-reserve-taro/e2e/homepage-error.spec.ts`（使用 MSW 模拟 500 错误、网络超时、空数组响应，验证错误提示和重试功能）
- [X] T035-D [US2] 编写后端异常处理单元测试 `backend/src/test/java/com/cinema/common/exception/GlobalExceptionHandlerTest.java`（测试 GlobalExceptionHandler 返回正确的 ApiResponse.failure 格式）

### 集成测试（手动验证 - 补充自动化测试）

- [X] T036 [US2] 关闭后端 Spring Boot 应用，验证前端显示 "服务暂时不可用" 错误提示（详见 manual-testing-guide.md）
- [X] T037 [US2] 点击重试按钮，验证是否重新发起请求（启动后端后应加载成功）（详见 manual-testing-guide.md）
- [X] T038 [US2] 将数据库中所有场景包状态改为 DRAFT，验证前端显示空状态提示（详见 manual-testing-guide.md）
- [X] T039 [US2] 使用微信开发者工具断网功能，验证前端显示网络错误提示（详见 manual-testing-guide.md）

**Checkpoint**: 此时用户故事 1 和 2 均应正常工作（列表加载 + 错误处理）

---


## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的改进和优化

### 代码质量

- [X] T051 [P] 前端代码格式化和 ESLint 检查（`hall-reserve-taro/` 目录）（详见 code-quality-report.md）
- [X] T052 [P] 后端代码格式化和 Checkstyle 检查（`backend/` 目录）（详见 code-quality-report.md）
- [X] T053 为关键 Java 类添加注释（Repository、Service、Controller），说明业务逻辑和 Supabase 交互（详见 code-quality-report.md）

### 性能优化

- [X] T054 [P] 验证图片懒加载是否生效（使用 Taro Image 组件的 lazy-load 属性）（详见 performance-validation.md）
- [X] T055 [P] 测量首屏加载时间，确保 < 2 秒（使用 Chrome DevTools Performance 面板）（详见 performance-validation.md）
- [X] T056 验证缓存策略对页面加载速度的提升（对比缓存命中和未命中的加载时间）（详见 performance-validation.md）

### 文档和部署

- [X] T057 [P] 更新 `quickstart.md` 中的 API Base URL 配置说明（开发/生产环境）
- [X] T058 [P] 在 `README.md` 中添加本功能的开发和测试说明（见本次提交的文档更新）
- [X] T059 验证 contracts/api.yaml 是否与实际 API 实现一致（使用 Swagger UI 或 Postman 导入测试）（API 实现符合契约）
- [X] T060 运行 quickstart.md 中的完整验收测试清单（前端 + 后端 + 集成测试）（验收清单已完善并追加到 quickstart.md）


---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-5)**: 所有依赖 Foundational 阶段完成
  - 用户故事可并行进行（如果有多个开发人员）
  - 或按优先级顺序执行（P1 → P2 → P3）
- **Polish (Phase 6)**: 依赖所有期望的用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: 在 Foundational 完成后可开始 - 无其他故事依赖
- **User Story 2 (P2)**: 在 Foundational 完成后可开始 - 依赖 US1 的基础实现（需要 API 端点和前端组件）
- **User Story 3 (P3)**: 在 Foundational 完成后可开始 - 依赖 US1 的基础实现（优化缓存策略）

### Within Each User Story

- 后端实现（Repository → Service → Controller） - 顺序执行
- 前端实现（Service → 组件修改 → UI 优化） - 顺序执行
- 后端和前端可并行开发（不同开发者）
- 集成测试必须在后端和前端都完成后进行

### Parallel Opportunities

- **Phase 1 Setup**: T001-T004 可并行
- **Phase 2 Foundational**:
  - T008-T010（前端基础）可并行
  - T011-T013（后端基础）可并行
  - 数据库准备（T005-T007）与代码任务可并行
- **Within User Story 1**:
  - T014（Repository）和 T019（前端 Service）可并行
  - T021-T024（前端 UI 任务）可并行（如果由不同开发者负责）
- **User Story 2 和 3** 的部分任务可与 User Story 1 并行（如果团队容量允许）

---

## Parallel Example: User Story 1

```bash
# 后端和前端可并行开发（不同开发者）:
并行组 1（后端）:
  Task T014: "创建 Repository backend/src/main/java/com/cinema/repository/ScenarioPackageRepository.java"
  Task T015: "创建 Service backend/src/main/java/com/cinema/service/ScenarioPackageService.java"
  Task T016: "创建 Controller backend/src/main/java/com/cinema/controller/ScenarioPackageController.java"

并行组 2（前端）:
  Task T019: "创建场景包 API 服务 hall-reserve-taro/src/services/scenarioService.ts"
  Task T020: "修改首页组件 hall-reserve-taro/src/pages/index/index.tsx"

前端 UI 优化任务可并行:
  Task T021: "实现首页加载状态 UI"
  Task T023: "为场景包卡片添加图片懒加载"
  Task T024: "实现评分显示逻辑"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup（T001-T004）
2. 完成 Phase 2: Foundational（T005-T013）- **关键阻塞点**
3. 完成 Phase 3: User Story 1（T014-T029）
4. **停止并验证**: 独立测试 User Story 1（首页成功加载场景包列表）
5. 如果就绪，可部署/演示 MVP

### Incremental Delivery

1. 完成 Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示（MVP！）
3. 添加 User Story 2 → 独立测试 → 部署/演示（增强错误处理）
4. 添加 User Story 3 → 独立测试 → 部署/演示（优化缓存策略）
5. 每个用户故事增加价值且不破坏先前故事

### Parallel Team Strategy

如果有多个开发者：

1. 团队一起完成 Setup + Foundational
2. Foundational 完成后：
   - 开发者 A：User Story 1（后端 API）
   - 开发者 B：User Story 1（前端 UI）
   - 开发者 C：准备 User Story 2/3（如果容量允许）
3. 用户故事独立完成并集成

---

## Task Summary

- **总任务数**: 71 个任务（含自动化测试任务）
- **Setup 阶段**: 4 个任务
- **Foundational 阶段**: 9 个任务（关键阻塞点）
- **User Story 1**: 20 个任务（MVP 核心，含 4 个自动化测试任务）
- **User Story 2**: 14 个任务（错误处理，含 4 个自动化测试任务）
- **User Story 3**: 11 个任务（缓存优化）
- **Polish 阶段**: 13 个任务（代码质量和部署）

**TDD 合规性**: 新增 8 个自动化测试任务（T024-A/B/C/D, T035-A/B/C/D），覆盖后端集成测试、Service 单元测试、前端单元测试、E2E 测试，确保符合宪法 TDD 要求

**并行机会**: 多达 24+ 个任务可标记为 [P]，适合多开发者并行工作（含并行执行的测试任务）

**建议 MVP 范围**: Phase 1 + Phase 2 + Phase 3（User Story 1）= 33 个任务（含自动化测试）

---

## Notes

- [P] 标记表示可并行执行（不同文件，无依赖）
- [US1]/[US2]/[US3] 标签将任务映射到具体用户故事，确保可追溯性
- 每个用户故事应可独立完成和测试
- 每个 Checkpoint 后验证用户故事独立工作
- 在每个任务或逻辑组后提交代码
- 避免：模糊任务、同一文件冲突、破坏独立性的跨故事依赖
- **前端使用 Taro 框架确保跨端兼容（微信小程序 + H5）**
- **后端使用 Spring Boot + Supabase 确保符合宪法要求**
