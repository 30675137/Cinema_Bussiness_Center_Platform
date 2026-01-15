# Tasks: Flyway 数据库迁移管理

**@spec T003-flyway-migration**

**Input**: Design documents from `/specs/T003-flyway-migration/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), quickstart.md (✅)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 验证项目依赖和基础环境配置

- [ ] T001 验证 pom.xml 中 Flyway 依赖版本（flyway-core, flyway-database-postgresql）
- [ ] T002 [P] 确认 Java 17 运行环境配置正确
- [ ] T003 [P] 验证 Supabase PostgreSQL 连接配置（prepareThreshold=0, sslmode=require）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Flyway 核心配置启用，所有用户故事的前置条件

**⚠️ CRITICAL**: 此阶段必须完成后才能进行任何用户故事

- [ ] T004 [US-ALL] 修改 `backend/src/main/resources/application.yml`，设置 `spring.flyway.enabled: true`
- [ ] T005 [P] [US-ALL] 添加 Flyway 基础配置项到 application.yml:
  ```yaml
  spring.flyway:
    baseline-on-migrate: true
    baseline-version: 0
    validate-on-migrate: true
    clean-disabled: true
    out-of-order: true
    table: flyway_schema_history
  ```
- [ ] T006 [P] [US-ALL] 确认 db/migration 目录存在且包含现有迁移脚本
- [ ] T007 [US-ALL] 运行 `./mvnw flyway:info` 验证 Flyway 配置生效

**Checkpoint**: Flyway 核心配置完成，可查看迁移脚本状态

---

## Phase 3: User Story 1 - 新环境一键初始化 (Priority: P1) 🎯 MVP

**Goal**: 开发人员在新环境中执行 `./mvnw spring-boot:run` 即可完成数据库初始化

**Independent Test**: 在空 PostgreSQL 数据库启动应用，验证表结构和基础数据自动创建

### Implementation for User Story 1

- [ ] T008 [US1] 分析现有迁移脚本执行顺序（V001-V064, V2026_xx 系列）
- [ ] T009 [US1] 验证 `backend/src/main/resources/db/migration/` 中脚本命名符合 Flyway 规范
- [ ] T010 [P] [US1] 创建 `backend/src/main/resources/db/seed/` 目录用于存放初始化数据脚本
- [ ] T011 [US1] 创建 `R__01_seed_brands.sql` - 品牌初始化数据（使用 ON CONFLICT DO NOTHING）
- [ ] T012 [P] [US1] 创建 `R__02_seed_categories.sql` - 分类初始化数据
- [ ] T013 [P] [US1] 创建 `R__03_seed_unit_conversions.sql` - 单位换算初始化数据
- [ ] T014 [US1] 更新 application.yml 添加 seed 目录到 locations:
  ```yaml
  spring.flyway.locations: classpath:db/migration,classpath:db/seed
  ```
- [ ] T015 [US1] 在空数据库上执行 `./mvnw spring-boot:run` 验证全量迁移成功
- [ ] T016 [US1] 验证 flyway_schema_history 表记录完整

**Checkpoint**: 新环境一键初始化功能完成，应用可正常启动

---

## Phase 4: User Story 2 - 数据库变更版本化管理 (Priority: P1)

**Goal**: 所有数据库结构变更通过版本化迁移脚本管理，可追溯可同步

**Independent Test**: 创建新迁移脚本 V065，验证其按顺序执行并记录到历史表

### Implementation for User Story 2

- [ ] T017 [US2] 创建迁移脚本命名规范文档（V{版本号}__{描述}.sql）
- [ ] T018 [US2] 创建示例迁移脚本 `V065__example_add_column.sql`（用于验证，后续删除）
- [ ] T019 [US2] 运行 `./mvnw flyway:migrate` 验证新脚本按顺序执行
- [ ] T020 [US2] 验证 flyway_schema_history 表中新增 V065 记录
- [ ] T021 [US2] 删除示例脚本，运行 `./mvnw flyway:repair` 更新历史表
- [ ] T022 [US2] 验证 `out-of-order: true` 配置支持并行开发场景

**Checkpoint**: 版本化管理机制验证完成

---

## Phase 5: User Story 3 - 多环境配置支持 (Priority: P2)

**Goal**: 支持 dev/test/prod 三个环境使用不同的 Flyway 配置

**Independent Test**: 切换 Spring Profile，验证不同环境使用对应配置

### Implementation for User Story 3

- [ ] T023 [US3] 创建 `backend/src/main/resources/application-dev.yml`:
  ```yaml
  spring.flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed
    out-of-order: true
  ```
- [ ] T024 [P] [US3] 创建 `backend/src/main/resources/application-test.yml`:
  ```yaml
  spring.flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed/test
    clean-disabled: false  # 测试环境允许 clean
  ```
- [ ] T025 [P] [US3] 创建 `backend/src/main/resources/application-prod.yml`:
  ```yaml
  spring.flyway:
    enabled: true
    locations: classpath:db/migration,classpath:db/seed/prod
    validate-on-migrate: true
    clean-disabled: true
    out-of-order: false  # 生产环境禁止乱序
  ```
- [ ] T026 [US3] 创建 `backend/src/main/resources/db/seed/test/` 目录，存放测试数据脚本
- [ ] T027 [P] [US3] 创建 `backend/src/main/resources/db/seed/prod/` 目录，存放生产基础数据
- [ ] T028 [US3] 验证 `./mvnw spring-boot:run -Dspring.profiles.active=dev` 使用 dev 配置
- [ ] T029 [US3] 验证 `./mvnw spring-boot:run -Dspring.profiles.active=test` 使用 test 配置
- [ ] T030 [US3] 验证 `./mvnw spring-boot:run -Dspring.profiles.active=prod` 使用 prod 配置

**Checkpoint**: 多环境配置完成，可通过 Profile 切换

---

## Phase 6: User Story 4 - 现有迁移脚本整合 (Priority: P2)

**Goal**: 整合现有 60+ 个迁移脚本，解决命名冲突和版本格式不一致问题

**Independent Test**: 在干净数据库上按顺序执行所有脚本，无冲突无错误

### Implementation for User Story 4

- [ ] T031 [US4] 审查 V001-V012 核心表结构脚本，确认使用 IF NOT EXISTS
- [ ] T032 [P] [US4] 审查 V016-V025 预约与门店脚本，确认依赖关系正确
- [ ] T033 [P] [US4] 审查 V026-V035 商品主数据脚本，确认与 V001-V002 无冲突
- [ ] T034 [P] [US4] 审查 V039-V052 饮品系统脚本，确认索引创建正确
- [ ] T035 [P] [US4] 审查 V053-V064 订单与库存扩展脚本，确认 BOM 快照逻辑
- [ ] T036 [US4] 审查 V2026_01_xx 日期格式脚本，确认与数字版本共存无冲突
- [ ] T037 [US4] 处理 V1.3 语义版本脚本：
  - 如已执行：添加到 `ignore-migration-patterns`
  - 如未执行：考虑重命名或禁用
- [ ] T038 [US4] 配置 `ignore-migration-patterns: "*:missing,*:future"` 忽略缺失脚本
- [ ] T039 [US4] 在干净数据库执行全量迁移验证：
  ```bash
  ./mvnw flyway:clean flyway:migrate  # 仅在测试环境
  ```
- [ ] T040 [US4] 记录所有脚本执行状态到 data-model.md

**Checkpoint**: 现有脚本整合完成，全量迁移可成功执行

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 文档更新、测试验证、最终清理

- [ ] T041 [P] 更新 `specs/T003-flyway-migration/quickstart.md` 添加实际操作截图/输出示例
- [ ] T042 [P] 更新 `CLAUDE.md` 添加 Flyway 相关命令说明
- [ ] T043 [P] 创建 `backend/src/main/resources/db/README.md` 说明迁移脚本组织结构
- [ ] T044 验证 SC-001: 新环境初始化时间 < 5 分钟
- [ ] T045 验证 SC-002: 所有迁移脚本可在干净数据库成功执行
- [ ] T046 验证 SC-003: 增量迁移执行时间 < 1 分钟
- [ ] T047 更新 Lark PM 技术债记录状态为完成

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP 核心功能
- **User Story 2 (Phase 4)**: Depends on Foundational - 可与 US1 并行
- **User Story 3 (Phase 5)**: Depends on US1 completion - 需要基础配置完成
- **User Story 4 (Phase 6)**: Depends on Foundational - 可与 US1/US2 并行
- **Polish (Phase 7)**: Depends on all user stories completion

### User Story Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKING)
    ↓
    ├── Phase 3: US1 (P1) ─────────────┐
    ├── Phase 4: US2 (P1) [parallel] ──┼── Can run in parallel
    └── Phase 6: US4 (P2) [parallel] ──┘
            ↓
    Phase 5: US3 (P2) - requires US1 configuration
            ↓
    Phase 7: Polish
```

### Parallel Opportunities

- T002, T003 可并行（Setup 阶段）
- T005, T006 可并行（Foundational 阶段）
- T010, T011, T012, T013 可并行（US1 seed 脚本创建）
- T023, T024, T025 可并行（US3 多环境配置）
- T031-T035 可并行（US4 脚本审查）
- T041, T042, T043 可并行（Polish 阶段）

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (3 tasks)
2. Complete Phase 2: Foundational (4 tasks) ← CRITICAL
3. Complete Phase 3: User Story 1 (9 tasks)
4. **STOP and VALIDATE**: 在空数据库测试一键初始化
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Flyway enabled
2. Add US1 → 一键初始化可用 (MVP!)
3. Add US2 → 版本化管理验证完成
4. Add US3 → 多环境配置完成
5. Add US4 → 现有脚本整合完成
6. Polish → 文档完善，技术债关闭

---

## Notes

- **Java 17**: 项目强制使用 Java 17，禁止其他版本
- **Supabase**: 使用 Pooler 模式连接，需要 `prepareThreshold=0`
- **out-of-order**: 启用以支持多人并行开发和混合版本格式
- **clean-disabled**: 生产环境必须禁用，测试环境可启用
- **Repeatable Migration**: 使用 `R__xxx.sql` 管理种子数据，支持内容更新后自动重新执行
