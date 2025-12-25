# Tasks: 单位换算系统 (P002-unit-conversion)

**Input**: Design documents from `/specs/P002-unit-conversion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: 根据项目宪章 (constitution.md) 要求，本功能采用 TDD 开发模式，测试先行。

**Organization**: 任务按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1/US2/US3）
- 包含精确文件路径

---

## Phase 1: Setup (基础设施搭建)

**Purpose**: 项目初始化和基础结构搭建

- [x] T001 [P] 创建前端功能模块目录结构 `frontend/src/features/unit-conversion/`
- [x] T002 [P] 创建前端类型定义 `frontend/src/features/unit-conversion/types/index.ts`
- [x] T003 [P] 创建类别映射工具 `frontend/src/features/unit-conversion/utils/categoryMapping.ts`
- [x] T004 [P] 创建后端功能包目录结构 `backend/src/main/java/com/cinema/unitconversion/`
- [x] T005 [P] 创建后端领域实体 `backend/src/main/java/com/cinema/unitconversion/domain/UnitConversion.java`
- [x] T006 [P] 创建后端枚举 `backend/src/main/java/com/cinema/unitconversion/domain/UnitCategory.java`

---

## Phase 2: Foundational (基础依赖层)

**Purpose**: 所有用户故事依赖的核心基础设施

**CRITICAL**: 此阶段完成后才能开始用户故事实现

### 后端基础层

- [x] T007 创建 DTO: `backend/src/main/java/com/cinema/unitconversion/dto/UnitConversionDto.java`
- [x] T008 [P] 创建请求 DTO: `backend/src/main/java/com/cinema/unitconversion/dto/CreateConversionRequest.java`
- [x] T009 [P] 创建路径响应 DTO: `backend/src/main/java/com/cinema/unitconversion/dto/ConversionPathResponse.java`
- [x] T010 [P] 创建验证错误 DTO: `backend/src/main/java/com/cinema/unitconversion/dto/ValidationErrorResponse.java`
- [x] T011 创建 Repository: `backend/src/main/java/com/cinema/unitconversion/repository/UnitConversionRepository.java`

### 前端基础层

- [x] T012 创建 API 服务层: `frontend/src/features/unit-conversion/services/conversionService.ts`
- [x] T013 创建 MSW Mock Handlers: `frontend/src/mocks/handlers/conversion.ts`
- [x] T014 注册 MSW Handlers 到 `frontend/src/mocks/handlers/index.ts`
- [x] T015 创建 TanStack Query Hooks: `frontend/src/features/unit-conversion/hooks/useConversions.ts`
- [x] T016 创建 Zustand UI Store: `frontend/src/features/unit-conversion/stores/conversionUIStore.ts`
- [x] T017 创建 Zod 验证 Schema: `frontend/src/features/unit-conversion/types/schema.ts`

### 路由配置

- [x] T018 添加路由配置到 `frontend/src/components/layout/Router.tsx` (路由: /bom/conversion)

**Checkpoint**: 基础设施就绪 - 可以开始用户故事实现

---

## Phase 3: User Story 1 - 配置基础单位换算 (Priority: P1) MVP

**Goal**: 实现单位换算规则的 CRUD 管理界面，让管理员能够配置基础换算关系

**Independent Test**: 在配置界面创建换算规则（如"1瓶 = 750ml"）并验证规则正确保存和检索

### Tests for User Story 1 (TDD - 先写测试)

- [ ] T019 [P] [US1] 后端单元测试: `backend/src/test/java/com/cinema/unitconversion/service/UnitConversionServiceTest.java`
- [ ] T020 [P] [US1] 后端集成测试: `backend/src/test/java/com/cinema/unitconversion/controller/UnitConversionControllerIntegrationTest.java`
- [ ] T021 [P] [US1] 前端组件测试: `frontend/src/features/unit-conversion/components/__tests__/ConversionList.test.tsx`
- [ ] T022 [P] [US1] 前端组件测试: `frontend/src/features/unit-conversion/components/__tests__/ConversionForm.test.tsx`
- [ ] T023 [P] [US1] E2E 测试: `frontend/e2e/conversion-crud.spec.ts`

### Backend Implementation for User Story 1

- [x] T024 [US1] 实现 Service: `backend/src/main/java/com/cinema/unitconversion/service/UnitConversionService.java`
  - CRUD 操作: getAll, getById, create, update, delete
  - 验证逻辑: 源单位≠目标单位, 换算率>0, 唯一约束检查
- [x] T025 [US1] 实现 Controller: `backend/src/main/java/com/cinema/unitconversion/controller/UnitConversionController.java`
  - GET /api/unit-conversions (支持 category/search 过滤)
  - GET /api/unit-conversions/{id}
  - POST /api/unit-conversions
  - PUT /api/unit-conversions/{id}
  - DELETE /api/unit-conversions/{id}
  - GET /api/unit-conversions/stats

### Frontend Implementation for User Story 1

- [x] T026 [P] [US1] 实现统计卡片组件: `frontend/src/features/unit-conversion/components/ConversionStats.tsx`
- [x] T027 [P] [US1] 实现列表表格组件: `frontend/src/features/unit-conversion/components/ConversionList.tsx`
  - 搜索过滤、类别过滤
  - 操作按钮（编辑/删除）
  - 数据加载状态
- [x] T028 [US1] 实现表单组件: `frontend/src/features/unit-conversion/components/ConversionForm.tsx`
  - 创建/编辑模式
  - Zod 表单验证
  - 实时换算预览
- [x] T029 [US1] 实现页面组件: `frontend/src/pages/bom/ConversionPage.tsx`
  - 整合 Stats, List, Form 组件
  - 模态框状态管理

**Checkpoint**: 用户故事 1 完成 - 管理员可以 CRUD 换算规则

---

## Phase 4: User Story 2 - 在 BOM 计算中应用换算 (Priority: P2)

**Goal**: 实现循环依赖检测和换算路径计算，支持 BOM 组件的自动单位换算

**Independent Test**: 创建混合单位 BOM，验证系统正确计算换算结果

### Tests for User Story 2 (TDD - 先写测试)

- [ ] T030 [P] [US2] 循环检测工具测试: `frontend/src/features/unit-conversion/utils/__tests__/cycleDetection.test.ts`
- [ ] T031 [P] [US2] 路径查找工具测试: `frontend/src/features/unit-conversion/utils/__tests__/pathFinding.test.ts`
- [ ] T032 [P] [US2] 后端路径服务测试: `backend/src/test/java/com/cinema/unitconversion/service/ConversionPathServiceTest.java`
- [ ] T033 [P] [US2] E2E 测试: `frontend/e2e/conversion-calculation.spec.ts`

### Backend Implementation for User Story 2

- [x] T034 [US2] 实现路径计算服务: `backend/src/main/java/com/cinema/unitconversion/service/ConversionPathService.java`
  - BFS 最短路径算法
  - 累积换算率计算
  - 双向换算支持 (FR-008)
- [x] T035 [US2] 扩展 Controller 添加路径计算端点:
  - POST /api/unit-conversions/validate-cycle
  - POST /api/unit-conversions/calculate-path
- [ ] T036 [US2] 实现 BOM 引用检查 (FR-009): 删除前检查 bom_components 表引用

### Frontend Implementation for User Story 2

- [x] T037 [US2] 实现循环检测工具: `frontend/src/features/unit-conversion/utils/cycleDetection.ts`
  - DFS + 路径追踪算法
  - 返回循环路径 (FR-003)
- [x] T038 [US2] 实现路径查找工具: `frontend/src/features/unit-conversion/utils/pathFinding.ts`
  - BFS 最短路径
  - 支持最多5个中间步骤 (SC-003)
- [x] T039 [US2] 实现换算链可视化组件: `frontend/src/features/unit-conversion/components/ConversionChainGraph.tsx`
  - 显示换算路径
  - 高亮循环路径
- [x] T040 [US2] 创建换算计算 Hook: `frontend/src/features/unit-conversion/hooks/useConversionCalculation.ts`
  - useValidateCycle mutation
  - useCalculatePath mutation
- [x] T041 [US2] 在 ConversionForm 中集成循环检测
  - 提交前调用 validate-cycle API
  - 显示循环路径错误信息

**Checkpoint**: 用户故事 2 完成 - 系统支持循环检测和路径计算

---

## Phase 5: User Story 3 - 处理换算中的舍入规则 (Priority: P3)

**Goal**: 实现按单位类型的默认舍入精度配置

**Independent Test**: 配置舍入规则，验证所有计算遵守规则

### Tests for User Story 3 (TDD - 先写测试)

- [ ] T042 [P] [US3] 舍入工具测试: `frontend/src/features/unit-conversion/utils/__tests__/rounding.test.ts`
- [ ] T043 [P] [US3] 后端舍入测试: `backend/src/test/java/com/cinema/unitconversion/service/RoundingServiceTest.java`

### Implementation for User Story 3

- [x] T044 [US3] 实现前端舍入工具: `frontend/src/features/unit-conversion/utils/rounding.ts`
  - 按 UnitCategory 应用默认精度
  - VOLUME: 1位小数, WEIGHT: 0位, COUNT: 0位
- [x] T045 [US3] 在后端枚举 UnitCategory 中添加 defaultPrecision 属性
- [x] T046 [US3] 在路径计算结果中应用舍入规则
- [x] T047 [US3] 在 ConversionChainGraph 中显示舍入后的结果

**Checkpoint**: 用户故事 3 完成 - 系统支持舍入规则

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的优化和完善

- [x] T048 [P] 添加加载骨架屏到列表组件
- [x] T049 [P] 添加操作成功/失败的 Toast 提示 (已内置于组件)
- [ ] T050 [P] 实现表格虚拟滚动（如规则数量 > 100）- 当前使用分页替代
- [x] T051 [P] 添加键盘导航支持 (WCAG 2.1 AA)
- [x] T052 [P] 完善错误边界处理
- [ ] T053 运行 quickstart.md 验证，确保开发流程可用
- [ ] T054 代码审查和重构优化

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Phase 1 完成 - **阻塞所有用户故事**
- **User Stories (Phase 3-5)**: 依赖 Phase 2 完成
  - US1 (P1) 优先完成
  - US2 (P2) 可在 US1 完成后开始
  - US3 (P3) 可在 US2 完成后开始
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Phase 2 完成后可开始 - 基础 CRUD 功能
- **User Story 2 (P2)**: 可在 US1 进行中并行开始后端部分，前端需等 US1 组件完成
- **User Story 3 (P3)**: 依赖 US2 的路径计算功能

### Within Each User Story

1. **测试先行**: 必须先写测试并确保测试失败
2. **后端先于前端**: 后端 API 完成后前端才能集成
3. **组件先于页面**: 子组件完成后才能组装页面
4. **每个任务完成后提交代码**

### Parallel Opportunities

```text
# Phase 1 并行任务组:
T001, T002, T003 (前端) | T004, T005, T006 (后端)

# Phase 2 并行任务组:
T008, T009, T010 (后端 DTO) | T012, T013 (前端服务)

# US1 测试并行组:
T019, T020 (后端) | T021, T022, T023 (前端)

# US1 前端组件并行组:
T026, T027 (Stats, List) → T028 (Form) → T029 (Page)

# US2 测试并行组:
T030, T031 (前端工具) | T032 (后端) | T033 (E2E)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: 测试 CRUD 功能
5. 可部署/演示 MVP

### Incremental Delivery

1. Setup + Foundational → 基础设施就绪
2. User Story 1 → CRUD 管理界面 → 部署/演示 (MVP!)
3. User Story 2 → 循环检测和路径计算 → 部署/演示
4. User Story 3 → 舍入规则 → 部署/演示
5. 每个故事增量交付价值

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签映射到特定用户故事以便追溯
- 遵循 TDD: 测试失败 → 实现 → 测试通过 → 重构
- 每个任务或逻辑组完成后提交
- 在任何 Checkpoint 停止以独立验证故事
- 避免: 模糊任务、同文件冲突、破坏独立性的跨故事依赖
