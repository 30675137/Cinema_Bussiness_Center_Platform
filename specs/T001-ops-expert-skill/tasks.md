# Tasks: 运营专家技能 (Ops Expert Skill)

**Input**: Design documents from `/specs/T001-ops-expert-skill/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, quickstart.md ✓
**Branch**: `T001-ops-expert-skill`

**Tests**: Python 脚本需要单元测试（宪法要求），Skill/Command 通过手动集成测试验证。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Skill files**: `.claude/skills/ops-expert/`
- **Command file**: `.claude/commands/ops.md`
- **Knowledge base**: `.claude/skills/ops-expert/references/`
- **Scripts**: `.claude/skills/ops-expert/scripts/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and basic configuration

- [x] T001 Create ops-expert skill directory structure at `.claude/skills/ops-expert/{references,examples,scripts}/`
- [x] T002 [P] Create Python package init file at `.claude/skills/ops-expert/scripts/__init__.py`
- [x] T003 [P] Create utils module with helper functions at `.claude/skills/ops-expert/scripts/utils.py`
- [x] T004 [P] Add ops-expert dependencies to project requirements (requests, python-dotenv)

**Checkpoint**: Directory structure ready for content creation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create SKILL.md main file with frontmatter and core abilities at `.claude/skills/ops-expert/SKILL.md`
- [x] T006 Create ops.md slash command file at `.claude/commands/ops.md`
- [x] T007 [P] Create database-schema.md with core table structures at `.claude/skills/ops-expert/references/database-schema.md`
- [x] T008 [P] Create glossary.md with business terms at `.claude/skills/ops-expert/references/glossary.md`
- [x] T009 Implement api_client.py base class with authentication at `.claude/skills/ops-expert/scripts/api_client.py`
- [x] T010 [P] Write unit tests for api_client.py at `.claude/skills/ops-expert/scripts/tests/test_api_client.py`

**Checkpoint**: Foundation ready - Skill can be triggered via `/ops` command

---

## Phase 3: User Story 1 - 通过对话查询系统数据 (Priority: P1) 🎯 MVP

**Goal**: 运营人员可以通过自然语言查询场景包、门店、影厅、预约等数据

**Independent Test**: 执行 `claude /ops 查看所有已发布的场景包` 返回正确的数据列表

### Knowledge Base for User Story 1

- [x] T011 [P] [US1] Create scenario-package.md with query patterns at `.claude/skills/ops-expert/references/scenario-package.md`
- [x] T012 [P] [US1] Create store-management.md with store query rules at `.claude/skills/ops-expert/references/store-management.md`
- [x] T013 [P] [US1] Create hall-management.md with hall query rules at `.claude/skills/ops-expert/references/hall-management.md`
- [x] T014 [P] [US1] Create reservation.md with reservation query rules at `.claude/skills/ops-expert/references/reservation.md`

### Examples for User Story 1

- [x] T015 [US1] Create common-queries.md with query examples at `.claude/skills/ops-expert/examples/common-queries.md`

### Integration for User Story 1

- [x] T016 [US1] Update SKILL.md to reference all query-related documents at `.claude/skills/ops-expert/SKILL.md`
- [x] T017 [US1] Add query intent recognition patterns to ops.md at `.claude/commands/ops.md`

**Checkpoint**: User Story 1 complete - `/ops 查看场景包` should return data via Supabase MCP

---

## Phase 4: User Story 2 - 通过对话执行日常操作 (Priority: P2)

**Goal**: 运营人员可以通过自然语言执行场景包状态变更、门店设置修改等操作

**Independent Test**: 执行 `claude /ops 将场景包"测试"下架` 系统请求确认并执行

### Scripts for User Story 2

- [x] T018 [P] [US2] Implement scenario_ops.py with status update functions at `.claude/skills/ops-expert/scripts/scenario_ops.py`
- [x] T019 [P] [US2] Implement store_ops.py with reservation settings functions at `.claude/skills/ops-expert/scripts/store_ops.py`
- [x] T020 [P] [US2] Write unit tests for scenario_ops.py at `.claude/skills/ops-expert/scripts/tests/test_scenario_ops.py`
- [x] T021 [P] [US2] Write unit tests for store_ops.py at `.claude/skills/ops-expert/scripts/tests/test_store_ops.py`

### Knowledge Base Updates for User Story 2

- [x] T022 [US2] Add operation rules to scenario-package.md (status transitions, confirmation) at `.claude/skills/ops-expert/references/scenario-package.md`
- [x] T023 [US2] Add operation rules to store-management.md (reservation settings) at `.claude/skills/ops-expert/references/store-management.md`

### Integration for User Story 2

- [x] T024 [US2] Add operation intent recognition patterns to ops.md at `.claude/commands/ops.md`
- [x] T025 [US2] Add operation examples to common-queries.md at `.claude/skills/ops-expert/examples/common-queries.md`
- [x] T026 [US2] Update SKILL.md with operation workflow and confirmation rules at `.claude/skills/ops-expert/SKILL.md`

**Checkpoint**: User Story 2 complete - `/ops 下架场景包` should execute with confirmation

---

## Phase 5: User Story 3 - 获取操作指导和系统帮助 (Priority: P3)

**Goal**: 运营人员可以询问操作指导，系统返回操作步骤和业务规则说明

**Independent Test**: 执行 `claude /ops 如何发布一个场景包` 返回完整步骤说明

### Knowledge Base for User Story 3

- [x] T027 [P] [US3] Create ops-guide.md with operation guides and FAQs at `.claude/skills/ops-expert/references/ops-guide.md`
- [x] T028 [US3] Add business rules explanations to scenario-package.md at `.claude/skills/ops-expert/references/scenario-package.md`
- [x] T029 [US3] Add configuration guides to store-management.md at `.claude/skills/ops-expert/references/store-management.md`
- [x] T030 [US3] Add reservation rules to reservation.md at `.claude/skills/ops-expert/references/reservation.md`

### Integration for User Story 3

- [x] T031 [US3] Add help intent recognition patterns to ops.md at `.claude/commands/ops.md`
- [x] T032 [US3] Add help examples to common-queries.md at `.claude/skills/ops-expert/examples/common-queries.md`
- [x] T033 [US3] Update SKILL.md with help workflow at `.claude/skills/ops-expert/SKILL.md`

**Checkpoint**: User Story 3 complete - `/ops 如何发布场景包` returns step-by-step guide

---

## Phase 6: User Story 4 - 批量操作和数据导出 (Priority: P4)

**Goal**: 运营人员可以发起批量操作，系统显示影响范围并要求确认

**Independent Test**: 执行 `claude /ops 将所有门店预约时长改为2小时` 显示受影响门店数量并要求确认

### Scripts for User Story 4

- [x] T034 [P] [US4] Add batch operations to scenario_ops.py at `.claude/skills/ops-expert/scripts/scenario_ops.py`
- [x] T035 [P] [US4] Add batch operations to store_ops.py at `.claude/skills/ops-expert/scripts/store_ops.py`
- [x] T036 [P] [US4] Add export functions to utils.py at `.claude/skills/ops-expert/scripts/utils.py`
- [x] T037 [P] [US4] Write unit tests for batch operations at `.claude/skills/ops-expert/scripts/tests/test_batch_ops.py` (covered in existing tests)

### Knowledge Base Updates for User Story 4

- [x] T038 [US4] Add batch operation rules to ops-guide.md at `.claude/skills/ops-expert/references/ops-guide.md`

### Integration for User Story 4

- [x] T039 [US4] Add batch intent recognition patterns to ops.md at `.claude/commands/ops.md`
- [x] T040 [US4] Add batch operation examples to common-queries.md at `.claude/skills/ops-expert/examples/common-queries.md`
- [x] T041 [US4] Update SKILL.md with batch workflow and double-confirmation rules at `.claude/skills/ops-expert/SKILL.md`

**Checkpoint**: User Story 4 complete - Batch operations work with proper confirmation

---

## Phase 7: User Story 5 - 单位换算专家服务 (Priority: P2) 🆕

**Goal**: 运营人员可以通过对话进行单位换算计算、查询换算规则、配置换算关系

**Independent Test**: 执行 `claude /ops 45ml威士忌等于多少瓶` 返回换算结果和换算路径

**Dependencies**: P002-unit-conversion 后端 API 必须已部署

### API Client Extensions for User Story 5

- [x] T047 [P] [US5] Extend api_client.py with unit conversion methods at `.claude/skills/ops-expert/scripts/api_client.py`
  - ✅ `list_unit_conversions(category, search)` - 获取换算规则列表
  - ✅ `get_unit_conversion(id)` - 获取单条规则
  - ✅ `create_unit_conversion(from_unit, to_unit, rate, category)` - 创建规则
  - ✅ `update_unit_conversion(id, from_unit, to_unit, rate, category)` - 更新规则
  - ✅ `delete_unit_conversion(id)` - 删除规则
  - ✅ `get_unit_conversion_stats()` - 获取统计信息

### Scripts for User Story 5

- [x] T048 [P] [US5] Create query_conversions.py at `.claude/skills/ops-expert/scripts/query_conversions.py`
  - ✅ 查询所有换算规则 / 按类别筛选 / 按单位搜索
  - CLI: `python query_conversions.py [--category volume] [--search 瓶]`

- [x] T049 [P] [US5] Create calculate_conversion.py at `.claude/skills/ops-expert/scripts/calculate_conversion.py`
  - ✅ 执行单位换算计算 / 自动查找换算路径 / 按类别舍入
  - 舍入规则: volume=1位小数, weight=0位, quantity=向上取整
  - CLI: `python calculate_conversion.py <数量> <源单位> <目标单位>`

- [x] T050 [P] [US5] Create create_conversion.py at `.claude/skills/ops-expert/scripts/create_conversion.py`
  - ✅ 解析用户输入 / 验证格式 / 检测循环依赖 / 创建规则
  - CLI: `python create_conversion.py <源单位> <目标单位> <换算率> <类别>`

- [x] T051 [P] [US5] Create update_conversion.py at `.claude/skills/ops-expert/scripts/update_conversion.py`
  - ✅ 更新现有规则 / 检测循环依赖 / 检查 BOM 引用
  - CLI: `python update_conversion.py <规则ID> <源单位> <目标单位> <换算率> <类别>`

- [x] T052 [P] [US5] Create delete_conversion.py at `.claude/skills/ops-expert/scripts/delete_conversion.py`
  - ✅ 检查 BOM 引用 / 检查路径依赖 / 删除规则
  - CLI: `python delete_conversion.py <规则ID> [--force]`

- [x] T053 [P] [US5] Create validate_cycle.py at `.claude/skills/ops-expert/scripts/validate_cycle.py`
  - ✅ 检测循环依赖 / 返回循环路径
  - CLI: `python validate_cycle.py <源单位> <目标单位>`

### Unit Tests for User Story 5

- [x] T054 [P] [US5] Create test_conversion.py at `.claude/skills/ops-expert/scripts/tests/test_conversion.py`
  - ✅ 测试直接换算 / 换算链计算 / 各类别舍入
  - ✅ 测试循环检测 / 路径查找 / 错误处理

### Knowledge Base for User Story 5

- [x] T055 [P] [US5] Create unit-conversion.md at `.claude/skills/ops-expert/references/unit-conversion.md`
  - ✅ 已完成：包含业务规则、数据库结构、API 参考

- [x] T056 [US5] Update database-schema.md with unit_conversions table at `.claude/skills/ops-expert/references/database-schema.md`
  - ✅ 已完成：添加 unit_conversions 表结构

### Integration for User Story 5

- [x] T057 [US5] Update SKILL.md with unit conversion capabilities at `.claude/skills/ops-expert/SKILL.md`
  - ✅ 添加单位换算到核心能力
  - ✅ 添加换算意图识别模式
  - ✅ 添加换算错误处理

- [x] T058 [US5] Add unit conversion intent patterns to ops.md at `.claude/commands/ops.md`
  - ✅ 换算计算: "XX等于多少YY", "换算XX到YY"
  - ✅ 规则查询: "查看换算规则", "搜索单位"
  - ✅ 规则配置: "添加换算规则", "删除换算规则"
  - ✅ 添加完整的单位换算操作章节 (5.1-5.4)
  - ✅ 添加换算相关错误处理模式
  - ✅ 更新可用脚本列表和知识库引用

- [x] T059 [US5] Add unit conversion examples to common-queries.md at `.claude/skills/ops-expert/examples/common-queries.md`
  - ✅ 换算计算示例 / 规则查询示例 / 规则配置示例

**Checkpoint**: User Story 5 complete - `/ops 45ml等于多少瓶` returns calculation with path

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T042 [P] Add error handling patterns to SKILL.md for edge cases at `.claude/skills/ops-expert/SKILL.md`
  - ✅ 已完成：错误处理模式已在 SKILL.md 中定义（PATH_NOT_FOUND, CYCLE_DETECTED 等）
- [x] T043 [P] Add context switching guidance to ops.md at `.claude/commands/ops.md`
  - ✅ 已完成：上下文切换指南章节已存在
- [ ] T044 Review and optimize all reference documents for consistency
- [ ] T045 Run integration tests: query, operation, help, batch scenarios
- [ ] T046 Update quickstart.md with final test commands at `specs/T001-ops-expert-skill/quickstart.md`

### Unit Conversion Integration Tests

- [x] T060 [US5] Verify P002 backend API availability
  - ✅ Test: `curl http://localhost:8080/api/unit-conversions` → 返回 29 条规则
  - ✅ 后端 API 正常运行

- [x] T061 [US5] Run unit conversion integration tests
  - ✅ `python3 calculate_conversion.py 45 ml 瓶` → 0.1瓶 (带舍入)
  - ✅ `python3 query_conversions.py --category volume` → 7 条体积类规则
  - ✅ `python3 query_conversions.py --stats` → 统计信息
  - ✅ `python3 calculate_conversion.py 1 瓶 升` → 0.5升 (换算链: 瓶→ml→升)
  - ✅ `python3 calculate_conversion.py 15 瓶 箱` → 2箱 (计数类向上取整)
  - ✅ `python3 calculate_conversion.py 1 瓶 kg` → 错误处理正确

---

## Dependencies & Execution Order

### Phase Dependencies

```mermaid
graph TD
    P1[Phase 1: Setup] --> P2[Phase 2: Foundational]
    P2 --> P3[Phase 3: US1 Query]
    P2 --> P4[Phase 4: US2 Operations]
    P2 --> P5[Phase 5: US3 Help]
    P2 --> P6[Phase 6: US4 Batch]
    P2 --> P7[Phase 7: US5 Unit Conversion]
    P3 --> P8[Phase 8: Polish]
    P4 --> P8
    P5 --> P8
    P6 --> P8
    P7 --> P8
    EXT[P002 Backend API] --> P7
```

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Query) can proceed independently
  - US2 (Operations) can proceed independently
  - US3 (Help) can proceed independently
  - US4 (Batch) can proceed independently
  - US5 (Unit Conversion) depends on P002 backend API
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - MVP deliverable
- **User Story 2 (P2)**: May reference US1 knowledge base but independently testable
- **User Story 3 (P3)**: May reference US1/US2 knowledge base but independently testable
- **User Story 4 (P4)**: Builds on US2 scripts but independently testable
- **User Story 5 (P2)**: Depends on P002 backend API, extends api_client.py

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003, T004)
- All Foundational tasks marked [P] can run in parallel (T007, T008, T010)
- Once Foundational completes, US1-US5 phases can start in parallel
- Within each story, all tasks marked [P] can run in parallel
- Knowledge base files (references/*.md) can be created in parallel
- US5 scripts (T048-T053) can all run in parallel since they operate on different files

---

## Parallel Example: User Story 1

```bash
# Launch all knowledge base files together:
Task: "T011 [P] [US1] Create scenario-package.md"
Task: "T012 [P] [US1] Create store-management.md"
Task: "T013 [P] [US1] Create hall-management.md"
Task: "T014 [P] [US1] Create reservation.md"
```

## Parallel Example: User Story 2

```bash
# Launch all scripts together:
Task: "T018 [P] [US2] Implement scenario_ops.py"
Task: "T019 [P] [US2] Implement store_ops.py"

# Launch all tests together (after scripts):
Task: "T020 [P] [US2] Write unit tests for scenario_ops.py"
Task: "T021 [P] [US2] Write unit tests for store_ops.py"
```

## Parallel Example: User Story 5

```bash
# Launch all scripts together (after T047 api_client extension):
Task: "T048 [P] [US5] Create query_conversions.py"
Task: "T049 [P] [US5] Create calculate_conversion.py"
Task: "T050 [P] [US5] Create create_conversion.py"
Task: "T051 [P] [US5] Create update_conversion.py"
Task: "T052 [P] [US5] Create delete_conversion.py"
Task: "T053 [P] [US5] Create validate_cycle.py"

# Then create tests:
Task: "T054 [P] [US5] Create test_conversion.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Query)
4. **STOP and VALIDATE**: Test `/ops 查看场景包` independently
5. Deploy/demo if ready - operators can query data!

### Incremental Delivery

1. Setup + Foundational → Skill framework ready
2. Add User Story 1 (Query) → Operators can query data (MVP!)
3. Add User Story 2 (Operations) → Operators can execute actions
4. Add User Story 3 (Help) → Operators get guidance
5. Add User Story 4 (Batch) → Advanced batch operations
6. Add User Story 5 (Unit Conversion) → Unit conversion expert service (requires P002 API)
7. Each story adds value without breaking previous stories

### Recommended Execution Order

**Solo Developer**:
1. T001-T010 (Setup + Foundational)
2. T011-T017 (US1 Query) → Validate MVP
3. T018-T026 (US2 Operations)
4. T027-T033 (US3 Help)
5. T034-T041 (US4 Batch)
6. T047-T059 (US5 Unit Conversion) → Requires P002 backend
7. T042-T046, T060-T061 (Polish)

**Parallel Team (2 developers)**:
1. Both: T001-T010 (Setup + Foundational)
2. Dev A: US1 (T011-T017) | Dev B: US2 scripts (T018-T021)
3. Dev A: US3 (T027-T033) | Dev B: US2 integration (T022-T026)
4. Dev A: US4 | Dev B: US5 scripts (T047-T054)
5. Both: US5 integration (T057-T059) + Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Python script tests should be written before or alongside implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies
- **US5 特别说明**:
  - 依赖 P002-unit-conversion 后端 API，实施前需确认 API 可用
  - 知识库文件 (T055, T056) 已完成
  - 所有 Python 脚本调用后端 API，不直接操作数据库
  - 舍入规则: volume=1位小数, weight=0位, quantity=向上取整

## P002 Backend API Reference (for US5)

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/unit-conversions` | GET | 获取规则列表 |
| `/api/unit-conversions/{id}` | GET | 获取单条规则 |
| `/api/unit-conversions` | POST | 创建规则 |
| `/api/unit-conversions/{id}` | PUT | 更新规则 |
| `/api/unit-conversions/{id}` | DELETE | 删除规则 |
| `/api/unit-conversions/calculate-path` | POST | 计算换算路径 |
| `/api/unit-conversions/validate-cycle` | POST | 验证循环依赖 |
