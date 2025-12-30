# 任务分解：E2E 测试数据规划器

**分支**: `T004-e2e-testdata-planner` | **日期**: 2025-12-30 | **规格**: [spec.md](./spec.md)

本文档按照用户故事优先级（P1、P2、P3）和 TDD 方法组织任务，每个用户故事都可独立测试和交付。

---

## Phase 1: Setup（项目初始化）

### 基础设施搭建

- [ ] **T001** [P] 创建 Skill 目录结构
  - 创建 `.claude/skills/e2e-testdata-planner/` 目录
  - 创建子目录：`scripts/`、`tests/`、`assets/templates/`、`dist/`

- [ ] **T002** [P] 配置 TypeScript 项目
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/package.json`（依赖：zod、js-yaml、@supabase/supabase-js、inquirer）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tsconfig.json`（严格模式）
  - 添加 npm scripts：`build`、`test`、`lint`

- [ ] **T003** [P] 配置测试框架
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/vitest.config.ts`
  - 配置覆盖率阈值（80%+）

- [ ] **T004** 创建 Skill 主文档
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/skill.md`（含 YAML frontmatter）
  - 定义命令格式：`/testdata-planner create|validate|generate|diagnose`
  - 添加示例和快速开始指南

- [ ] **T005** 创建项目测试数据目录
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/testdata/blueprints/`
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/testdata/seeds/`
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/testdata/scripts/`
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/testdata/logs/`
  - 创建 `.gitkeep` 文件保持目录结构

---

## Phase 2: Foundational（基础设施）

### Zod Schemas 定义

- [ ] **T006** [P] 实现 TestdataBlueprint Zod Schema（测试先行）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/schemas.test.ts`
  - 测试蓝图验证规则（id 格式、版本号、依赖引用格式）
  - 实现 Zod schema：`/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/schemas.ts`
  - 导出 `TestdataBlueprintSchema`、`SeedStrategyConfigSchema`、`ApiStrategyConfigSchema`、`DbScriptStrategyConfigSchema`

- [ ] **T007** [P] 实现 DataSupplyStrategy Zod Schema（测试先行）
  - 在 `schemas.test.ts` 中添加策略验证测试
  - 实现 `DataSupplyStrategySchema`、`RetryPolicySchema`
  - 测试超时、重试策略、错误处理验证

- [ ] **T008** 实现 LifecyclePlan Zod Schema（测试先行）
  - 在 `schemas.test.ts` 中添加生命周期计划验证测试
  - 实现 `LifecyclePlanSchema`、`StepSchema`
  - 测试步骤依赖、执行顺序验证

- [ ] **T009** 实现 DataProvenance Zod Schema（测试先行）
  - 在 `schemas.test.ts` 中添加数据来源验证测试
  - 实现 `DataProvenanceSchema`
  - 测试时间一致性、状态转换验证

### 工具模块

- [ ] **T010** [P] 实现文件工具模块（测试先行）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/file-utils.test.ts`
  - 实现 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/utils/file-utils.ts`
  - 函数：`loadYamlFile()`、`loadJsonFile()`、`saveYamlFile()`、`saveJsonFile()`、`validateFilePath()`（防路径遍历）
  - 测试文件加载、路径验证、错误处理

- [ ] **T011** [P] 实现日志模块
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/utils/logger.ts`
  - 支持日志级别：`debug`、`info`、`warn`、`error`
  - 输出格式：`[时间戳] [级别] [消息]`

- [ ] **T012** [P] 实现错误处理模块（测试先行）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/error-handler.test.ts`
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/utils/error-handler.ts`
  - 定义错误类：`BlueprintValidationError`、`CircularDependencyError`、`EnvironmentMismatchError`、`SeedFileNotFoundError`、`DbScriptError`
  - 测试错误消息格式、堆栈跟踪

---

## Phase 3: US1 - 定义测试数据蓝图（P1, MVP）

### 蓝图加载器

- [ ] **T013** [US1] 编写蓝图加载器单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/blueprint-loader.test.ts`
  - 测试场景：
    - 加载有效蓝图文件（YAML 格式）
    - 加载多个蓝图文件（目录扫描）
    - 验证蓝图模式（Zod 验证）
    - 处理缺失蓝图文件错误
    - 处理无效 YAML 格式错误
    - 处理模式验证失败错误
  - 创建测试固件：`/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/fixtures/blueprints/valid-order.blueprint.yaml`
  - 运行测试，确认失败（Red 阶段）

- [ ] **T014** [US1] 实现蓝图加载器核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/blueprint-loader.ts`
  - 实现 `class BlueprintLoader`：
    - `loadBlueprint(filePath: string): TestdataBlueprint`
    - `loadAllBlueprints(dirPath: string): Map<string, TestdataBlueprint>`
    - `validateBlueprint(blueprint: any): TestdataBlueprint`
  - 集成 Zod schema 验证
  - 运行测试，确认通过（Green 阶段）

- [ ] **T015** [US1] 重构蓝图加载器（TDD - Refactor）
  - 提取蓝图注册表类 `BlueprintRegistry`
  - 优化错误消息（包含文件路径、行号）
  - 添加性能日志（加载时间）
  - 运行测试，确认仍通过

### 蓝图验证器

- [ ] **T016** [US1] 编写蓝图验证器单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/validator.test.ts`
  - 测试场景：
    - 验证蓝图所有必填字段
    - 验证 testdata_ref ID 格式
    - 验证依赖引用格式
    - 验证策略配置完整性
    - 验证环境配置一致性
    - 验证蓝图版本号格式
  - 运行测试，确认失败（Red 阶段）

- [ ] **T017** [US1] 实现蓝图验证器核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/validator.ts`
  - 实现 `class BlueprintValidator`：
    - `validateStructure(blueprint: TestdataBlueprint): ValidationResult`
    - `validateDependencyReferences(blueprint: TestdataBlueprint, registry: BlueprintRegistry): ValidationResult`
    - `validateEnvironmentConfig(blueprint: TestdataBlueprint, envProfile: string): ValidationResult`
    - `validateStrategyConfig(blueprint: TestdataBlueprint): ValidationResult`
  - 运行测试，确认通过（Green 阶段）

- [ ] **T018** [US1] 重构验证器（TDD - Refactor）
  - 提取验证规则配置（可扩展验证器）
  - 优化错误聚合（一次验证报告所有错误）
  - 添加验证建议（如推荐使用 db-script 替代大种子文件）
  - 运行测试，确认仍通过

### 验收场景测试

- [ ] **T019** [US1] 实现验收场景 1 - 加载和验证蓝图
  - 创建集成测试 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/us1-scenario1.test.ts`
  - 创建测试蓝图：`/Users/lining/qoder/Cinema_Bussiness_Center_Platform/testdata/blueprints/order.blueprint.yaml`（TD-ORDER-001）
  - 测试步骤：加载蓝图 → 验证结构 → 注册数据契约
  - 断言：蓝图成功加载且所有必填字段已验证

- [ ] **T020** [US1] 实现验收场景 2 - 引用 testdata_ref
  - 在集成测试中创建测试场景引用 `TD-USER-ADMIN`
  - 测试步骤：加载蓝图 → 解析定义 → 验证必填字段
  - 断言：规划器正确解析蓝图定义

- [ ] **T021** [US1] 实现验收场景 3 - 检测依赖问题
  - 创建测试蓝图：`order-with-dependencies.blueprint.yaml`（依赖 TD-USER-001 和 TD-STORE-001）
  - 测试步骤：加载蓝图 → 验证依赖 → 检测循环依赖 → 检测缺失依赖
  - 断言：规划器正确报告循环依赖或缺失依赖错误

---

## Phase 4: US2 - 选择数据供给策略（P1）

### 策略选择器

- [ ] **T022** [US2] 编写策略选择器单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/strategy-selector.test.ts`
  - 测试场景：
    - 根据蓝图配置选择 seed 策略
    - 根据蓝图配置选择 api 策略
    - 根据蓝图配置选择 db-script 策略
    - 验证策略配置完整性
    - 处理无效策略类型错误
  - 运行测试,确认失败（Red 阶段）

- [ ] **T023** [US2] 实现策略选择器核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/strategy-selector.ts`
  - 实现 `class StrategySelector`：
    - `selectStrategy(blueprint: TestdataBlueprint): DataSupplyStrategy`
    - `validateStrategyConfig(strategy: DataSupplyStrategy): void`
  - 运行测试,确认通过（Green 阶段）

- [ ] **T024** [US2] 重构策略选择器（TDD - Refactor）
  - 使用策略模式重构（`SeedStrategy`、`ApiStrategy`、`DbScriptStrategy`）
  - 添加策略工厂方法
  - 运行测试,确认仍通过

### Seed 策略实现

- [ ] **T025** [US2] 编写 Seed Provider 单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/seed-provider.test.ts`
  - 测试场景：
    - 加载 JSON 种子文件
    - 加载 YAML 种子文件
    - 验证种子文件大小（警告 >10MB，错误 >50MB）
    - 处理缺失种子文件错误
    - 处理无效 JSON/YAML 格式错误
  - 创建测试固件：`/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/fixtures/seeds/users.json`
  - 运行测试,确认失败（Red 阶段）

- [ ] **T026** [US2] 实现 Seed Provider 核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/providers/seed-provider.ts`
  - 实现 `class SeedProvider implements DataProvider`：
    - `loadSeed(config: SeedConfig): Promise<any[]>`
    - `validateSeedFile(filePath: string): void`
  - 运行测试,确认通过（Green 阶段）

- [ ] **T027** [US2] 重构 Seed Provider（TDD - Refactor）
  - 添加文件大小警告日志
  - 支持文件编码配置（utf-8、utf-16）
  - 运行测试,确认仍通过

### 验收场景测试

- [ ] **T028** [US2] 实现验收场景 1 - Seed 策略生成 Fixture
  - 创建集成测试 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/us2-scenario1.test.ts`
  - 创建蓝图：`user-seed.blueprint.yaml`（strategy: seed, seedFilePath: testdata/seeds/users.json）
  - 测试步骤：加载蓝图 → 选择策略 → 生成供给计划 → 验证输出 fixture 引用种子文件
  - 断言：生成的计划包含正确的种子文件路径

- [ ] **T029** [US2] 实现验收场景 2 - API 策略生成 Fixture（准备，完整实现在 Phase 6）
  - 创建蓝图：`order-api.blueprint.yaml`（strategy: api, apiEndpoint: /api/test/orders）
  - 测试步骤：加载蓝图 → 选择策略 → 验证策略配置（认证、端点、方法）
  - 断言：策略配置包含 API 端点和认证头（完整实现延后到 T047-T049）

- [ ] **T030** [US2] 实现验收场景 3 - DB-Script 策略生成 Fixture（准备，完整实现在 Phase 6）
  - 创建蓝图：`store-db.blueprint.yaml`（strategy: db-script, dbScriptPath: testdata/scripts/seed-stores.sql）
  - 测试步骤：加载蓝图 → 选择策略 → 验证策略配置（脚本路径、事务）
  - 断言：策略配置包含正确的 SQL 脚本路径（完整实现延后到 T050-T052）

---

## Phase 5: US3 - 生成生命周期计划（P1）

### 依赖解析器

- [ ] **T031** [US3] 编写依赖解析器单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/dependency-resolver.test.ts`
  - 测试场景：
    - 构建依赖图（3 层依赖链）
    - 拓扑排序（正确的执行顺序）
    - 检测循环依赖（A → B → C → A）
    - 处理无依赖蓝图
    - 处理多根节点依赖图
    - 处理缺失依赖引用错误
  - 运行测试,确认失败（Red 阶段）

- [ ] **T032** [US3] 实现依赖解析器核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/dependency-resolver.ts`
  - 实现 `class DependencyResolver`：
    - `buildDependencyGraph(blueprints: Map<string, TestdataBlueprint>): DependencyGraph`
    - `topologicalSort(graph: DependencyGraph): string[]`
    - `detectCycle(graph: DependencyGraph): string[] | null`
    - `calculateDepth(graph: DependencyGraph, nodeId: string): number`
  - 使用 Kahn 算法实现拓扑排序
  - 使用 DFS + 三色标记检测循环
  - 运行测试,确认通过（Green 阶段）

- [ ] **T033** [US3] 重构依赖解析器（TDD - Refactor）
  - 优化依赖图数据结构（使用 Map 代替对象）
  - 添加依赖深度限制验证（最多 10 层）
  - 优化循环检测性能（缓存已访问节点）
  - 运行测试,确认仍通过

### 生命周期生成器

- [ ] **T034** [US3] 编写生命周期生成器单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/lifecycle-generator.test.ts`
  - 测试场景：
    - 生成 setup 步骤（按依赖顺序）
    - 生成 teardown 步骤（反向顺序）
    - 处理不同 fixture 作用域（test、worker、global）
    - 生成步骤依赖关系（dependsOn 字段）
    - 验证步骤超时配置
    - 处理可选步骤（optional: true）
  - 运行测试,确认失败（Red 阶段）

- [ ] **T035** [US3] 实现生命周期生成器核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/lifecycle-generator.ts`
  - 实现 `class LifecycleGenerator`：
    - `generateLifecyclePlan(blueprint: TestdataBlueprint, dependencyOrder: string[]): LifecyclePlan`
    - `generateSetupSteps(blueprint: TestdataBlueprint, dependencies: TestdataBlueprint[]): Step[]`
    - `generateTeardownSteps(setupSteps: Step[]): Step[]`
    - `assignStepDependencies(steps: Step[]): Step[]`
  - 运行测试,确认通过（Green 阶段）

- [ ] **T036** [US3] 重构生命周期生成器（TDD - Refactor）
  - 提取步骤工厂方法（`createLoadSeedStep`、`createCallApiStep`、`createExecuteSqlStep`）
  - 添加步骤变量替换支持（`{{TD-USER-001.userId}}`）
  - 验证总步骤超时不超过 Playwright 限制（30 秒）
  - 运行测试,确认仍通过

### 验收场景测试

- [ ] **T037** [US3] 实现验收场景 1 - 按依赖顺序生成 Setup 序列
  - 创建集成测试 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/us3-scenario1.test.ts`
  - 创建蓝图链：`TD-USER-001` ← `TD-STORE-001` ← `TD-ORDER-001`
  - 测试步骤：加载蓝图 → 解析依赖 → 生成生命周期计划
  - 断言：setup 步骤顺序为 [TD-USER-001, TD-STORE-001, TD-ORDER-001]

- [ ] **T038** [US3] 实现验收场景 2 - 生成反向 Teardown 序列
  - 在集成测试中配置 `teardown: true`
  - 测试步骤：生成生命周期计划 → 验证 teardown 步骤顺序
  - 断言：teardown 步骤顺序为 [TD-ORDER-001, TD-STORE-001, TD-USER-001]（反向）

- [ ] **T039** [US3] 实现验收场景 3 - 生成 Test Fixture
  - 创建蓝图：`order-test-scope.blueprint.yaml`（scope: test）
  - 测试步骤：生成生命周期计划 → 验证 fixture 作用域
  - 断言：生成的计划标记为 `scope: test`，表示每个测试运行前 setup、后 teardown

---

## Phase 6: US4 - 验证数据契约（P2）

### 契约验证器

- [ ] **T040** [US4] 编写契约验证器单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/contract-validator.test.ts`
  - 测试场景：
    - 验证场景引用的 testdata_ref 存在
    - 验证场景引用的所有依赖已满足
    - 验证环境配置匹配（staging vs production）
    - 处理无效 testdata_ref 引用错误
    - 处理缺失依赖错误
    - 处理环境不匹配错误
  - 运行测试,确认失败（Red 阶段）

- [ ] **T041** [US4] 实现契约验证器核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/contract-validator.ts`
  - 实现 `class ContractValidator`：
    - `validateTestdataRefs(scenario: TestScenario, registry: BlueprintRegistry): ValidationResult`
    - `validateDependencies(testdataRef: string, registry: BlueprintRegistry): ValidationResult`
    - `validateEnvironment(testdataRef: string, envProfile: string, registry: BlueprintRegistry): ValidationResult`
  - 运行测试,确认通过（Green 阶段）

- [ ] **T042** [US4] 重构契约验证器（TDD - Refactor）
  - 添加友好的错误提示（如"可用的 testdata_refs: [TD-ORDER-001, TD-USER-001]"）
  - 支持批量验证（一次性报告所有场景的错误）
  - 添加 Levenshtein 距离提示（"Did you mean TD-ORDER-001?"）
  - 运行测试,确认仍通过

### 验收场景测试

- [ ] **T043** [US4] 实现验收场景 1 - 检测无效 testdata_ref
  - 创建集成测试 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/us4-scenario1.test.ts`
  - 创建测试场景：引用不存在的 `TD-ORDER-999`
  - 测试步骤：加载场景 → 运行验证 → 捕获错误
  - 断言：验证器报告错误并显示可用 testdata_refs 列表

- [ ] **T044** [US4] 实现验收场景 2 - 检测缺失依赖
  - 创建测试场景：引用 `TD-ORDER-001`（依赖 TD-USER-001）但未包含 TD-USER-001
  - 测试步骤：运行验证 → 捕获缺失依赖错误
  - 断言：验证器报告缺失依赖 TD-USER-001

- [ ] **T045** [US4] 实现验收场景 3 - 检测环境不匹配
  - 创建蓝图：`payment-prod-only.blueprint.yaml`（environments: [production]）
  - 创建测试场景：使用 `env_profile: staging` 引用该蓝图
  - 测试步骤：运行验证 → 捕获环境不匹配错误
  - 断言：验证器报告环境不匹配（要求 production，实际 staging）

---

## Phase 7: US5 - 生成 Fixture 代码（P2）

### API 策略实现（P2）

- [ ] **T046** [US5] 编写 API Provider 单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/api-provider.test.ts`
  - 测试场景：
    - 调用 API 端点创建测试数据
    - 处理认证（Bearer Token）
    - 处理自定义请求头
    - 处理响应字段映射（responseMapping）
    - 处理 API 超时
    - 处理 API 错误（4xx、5xx）
    - 处理重试逻辑（retryPolicy）
  - 使用 Mock HTTP 客户端（如 nock）
  - 运行测试,确认失败（Red 阶段）

- [ ] **T047** [US5] 实现 API Provider 核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/providers/api-provider.ts`
  - 实现 `class ApiProvider implements DataProvider`：
    - `callApi(config: ApiConfig): Promise<any>`
    - `buildRequest(config: ApiConfig): RequestOptions`
    - `handleResponse(response: Response, mapping?: ResponseMapping): any`
    - `handleRetry(error: Error, retryPolicy: RetryPolicy): Promise<void>`
  - 使用 `node-fetch` 或 `axios` 作为 HTTP 客户端
  - 运行测试,确认通过（Green 阶段）

- [ ] **T048** [US5] 重构 API Provider（TDD - Refactor）
  - 提取认证处理器（`BearerAuthHandler`、`ApiKeyAuthHandler`）
  - 支持请求体变量替换（`{{TD-USER-001.userId}}`）
  - 添加详细的错误日志（请求/响应 body）
  - 运行测试,确认仍通过

### DB-Script 策略实现（P2）

- [ ] **T049** [US5] 编写 DB-Script Provider 单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/db-script-provider.test.ts`
  - 测试场景：
    - 执行 SQL 脚本（通过 Supabase SDK）
    - 处理事务执行
    - 处理 SQL 语法错误
    - 处理数据库权限错误
    - 提取插入的 ID（outputMapping）
    - 处理超时
  - 使用 Mock Supabase 客户端
  - 运行测试,确认失败（Red 阶段）

- [ ] **T050** [US5] 实现 DB-Script Provider 核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/providers/db-script-provider.ts`
  - 实现 `class DbScriptProvider implements DataProvider`：
    - `executeScript(config: DbScriptConfig): Promise<any>`
    - `loadSqlScript(scriptPath: string): Promise<string>`
    - `executeSql(sql: string, transactional: boolean): Promise<any>`
    - `extractOutputs(result: any, mapping: OutputMapping): any`
  - 集成 `@supabase/supabase-js`
  - 运行测试,确认通过（Green 阶段）

- [ ] **T051** [US5] 重构 DB-Script Provider（TDD - Refactor）
  - 支持多语句 SQL 脚本（分号分割）
  - 添加 SQL 安全验证（禁止 DROP、TRUNCATE 等危险操作）
  - 添加执行日志（SQL 语句、影响行数）
  - 运行测试,确认仍通过

### Fixture 代码生成器

- [ ] **T052** [US5] 编写 Fixture 代码生成器单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/fixture-codegen.test.ts`
  - 测试场景：
    - 生成 Seed 策略 fixture 代码
    - 生成 API 策略 fixture 代码
    - 生成 DB-Script 策略 fixture 代码
    - 生成 TypeScript 类型定义
    - 生成正确的导入语句
    - 生成正确的 Playwright fixture 扩展语法
    - 验证生成代码的 TypeScript 类型正确性
  - 运行测试,确认失败（Red 阶段）

- [ ] **T053** [US5] 实现 Fixture 代码生成器核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/fixture-codegen.ts`
  - 实现 `class FixtureCodeGenerator`：
    - `generateFixture(plan: LifecyclePlan, blueprint: TestdataBlueprint): string`
    - `generateSetupCode(steps: Step[]): string`
    - `generateTeardownCode(steps: Step[]): string`
    - `generateTypeDefinition(blueprint: TestdataBlueprint): string`
  - 使用模板字符串生成代码
  - 集成 Prettier 格式化生成代码
  - 运行测试,确认通过（Green 阶段）

- [ ] **T054** [US5] 重构 Fixture 代码生成器（TDD - Refactor）
  - 提取代码模板文件（`/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/assets/templates/fixture-template.ts`）
  - 支持不同作用域的 fixture 生成（test、worker、global）
  - 添加生成代码的头部注释（`@spec`、生成时间、警告信息）
  - 运行测试,确认仍通过

### 验收场景测试

- [ ] **T055** [US5] 实现验收场景 1 - 生成 TypeScript Fixture 代码
  - 创建集成测试 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/us5-scenario1.test.ts`
  - 创建生命周期计划：`order-lifecycle-plan.json`
  - 测试步骤：加载计划 → 生成 fixture 代码 → 验证输出
  - 断言：生成的 `.ts` 文件包含正确的导入、类型定义和 fixture 实现

- [ ] **T056** [US5] 实现验收场景 2 - API 策略 Fixture 包含认证
  - 创建 API 策略蓝图和生命周期计划
  - 测试步骤：生成 fixture 代码 → 检查认证头和错误处理
  - 断言：生成的代码包含 `Authorization: Bearer ${token}` 和 try-catch 块

- [ ] **T057** [US5] 实现验收场景 3 - 验证不同作用域的 Fixture
  - 创建三个蓝图：test、worker、global 作用域
  - 测试步骤：生成 fixtures → 验证 Playwright fixture 扩展语法
  - 断言：每个 fixture 在 Playwright 配置中正确设置作用域

---

## Phase 8: US6 - 诊断供给问题（P3）

### 诊断工具

- [ ] **T058** [US6] 编写诊断工具单元测试（TDD - Red）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/diagnostics.test.ts`
  - 测试场景：
    - 检查 API 端点可达性
    - 检查种子文件存在性
    - 检查数据库脚本存在性
    - 检查数据库连接
    - 检查认证凭据有效性
    - 生成诊断报告
  - 运行测试,确认失败（Red 阶段）

- [ ] **T059** [US6] 实现诊断工具核心逻辑（TDD - Green）
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/diagnostics.ts`
  - 实现 `class DiagnosticsTool`：
    - `diagnoseBlueprint(blueprint: TestdataBlueprint): DiagnosticResult`
    - `checkApiEndpoint(config: ApiConfig): Promise<CheckResult>`
    - `checkSeedFile(config: SeedConfig): Promise<CheckResult>`
    - `checkDbScript(config: DbScriptConfig): Promise<CheckResult>`
    - `generateReport(results: DiagnosticResult[]): string`
  - 运行测试,确认通过（Green 阶段）

- [ ] **T060** [US6] 重构诊断工具（TDD - Refactor）
  - 添加详细的错误建议（如"检查 .env 文件中的 API_BASE_URL"）
  - 支持并行诊断（Promise.all）
  - 添加诊断结果缓存（避免重复检查）
  - 运行测试,确认仍通过

### 验收场景测试

- [ ] **T061** [US6] 实现验收场景 1 - 诊断 API 端点不可达
  - 创建集成测试 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/us6-scenario1.test.ts`
  - 创建蓝图：使用无效 API 端点（http://invalid-endpoint）
  - 测试步骤：运行诊断 → 捕获网络错误
  - 断言：诊断报告包含"网络错误"和重试建议

- [ ] **T062** [US6] 实现验收场景 2 - 诊断缺失种子文件
  - 创建蓝图：引用不存在的种子文件（testdata/seeds/missing.json）
  - 测试步骤：运行诊断 → 捕获文件不存在错误
  - 断言：诊断报告包含缺失文件路径和创建建议

- [ ] **T063** [US6] 实现验收场景 3 - 诊断数据库权限错误
  - 创建蓝图：使用 db-script 策略但权限不足
  - 测试步骤：运行诊断 → 模拟权限错误
  - 断言：诊断报告包含权限错误和所需角色说明

---

## Phase 9: Polish & Cross-Cutting Concerns

### CLI 实现

- [ ] **T064** 实现 CLI 入口点
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/cli.ts`
  - 实现命令：
    - `/testdata-planner create` - 交互式创建蓝图
    - `/testdata-planner validate` - 验证所有蓝图
    - `/testdata-planner generate <testdata-ref>` - 生成 fixture
    - `/testdata-planner diagnose <testdata-ref>` - 诊断供给问题
  - 集成 `inquirer.js` 进行交互式引导
  - 添加 CLI 帮助文档（--help）

- [ ] **T065** 实现交互式蓝图创建向导
  - 实现 `guidedBlueprintCreation()` 函数
  - 引导用户输入：id、description、strategy、dependencies
  - 根据策略类型动态询问配置（seedFilePath、apiEndpoint、dbScriptPath）
  - 生成蓝图 YAML 文件并保存到 `testdata/blueprints/`

- [ ] **T066** 实现蓝图脚手架模板
  - 创建模板文件：
    - `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/assets/templates/blueprint-template.yaml`
    - `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/assets/templates/seed-template.json`
    - `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/assets/templates/db-script-template.sql`
  - 实现 `scaffoldBlueprint(id: string, strategy: StrategyType): void`

### 数据来源跟踪（P2）

- [ ] **T067** 实现数据来源记录器（测试先行）
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/unit/provenance-recorder.test.ts`
  - 实现 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/provenance-recorder.ts`
  - 实现 `class ProvenanceRecorder`：
    - `recordDataCreation(testdataRef: string, dataId: string, metadata: any): void`
    - `recordDataCleanup(testdataRef: string, status: CleanupStatus): void`
    - `saveProvenanceLog(testRunId: string): Promise<void>`
  - 存储格式：JSON 文件（`testdata/logs/provenance-{testRunId}.json`）

- [ ] **T068** 集成数据来源跟踪到 Fixture 生成
  - 修改 `FixtureCodeGenerator` 添加来源记录代码
  - 在 setup 步骤后记录数据创建
  - 在 teardown 步骤后记录数据清理

### 环境配置（P2）

- [ ] **T069** 实现环境配置管理
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/env-config.ts`
  - 实现 `class EnvironmentConfig`：
    - `loadEnvProfile(): string` - 从环境变量 `E2E_ENV_PROFILE` 读取
    - `getApiBaseUrl(envProfile: string): string` - 获取环境特定 API 基础 URL
    - `getDbConfig(envProfile: string): DbConfig` - 获取数据库配置
  - 支持环境：ci、staging、production、local

- [ ] **T070** 实现环境特定蓝图过滤
  - 修改 `BlueprintLoader` 支持环境过滤
  - 实现 `filterBlueprintsByEnvironment(blueprints: Map<string, TestdataBlueprint>, envProfile: string): Map<string, TestdataBlueprint>`
  - 在 CLI 验证命令中添加环境参数（--env staging）

### 集成测试

- [ ] **T071** 实现完整工作流集成测试
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/full-workflow.test.ts`
  - 测试场景：
    - 创建蓝图 → 验证蓝图 → 生成生命周期计划 → 生成 fixture 代码 → 验证生成的 TypeScript 编译通过
  - 使用真实蓝图文件和种子文件

- [ ] **T072** 实现跨 Skill 集成测试
  - 创建测试文件 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/tests/integration/cross-skill-integration.test.ts`
  - 测试场景：
    - test-scenario-author (T001) 生成场景 → e2e-testdata-planner (T004) 验证 testdata_ref
    - e2e-testdata-planner (T004) 生成 fixtures → e2e-test-generator (T002) 导入 fixtures
    - e2e-runner (T003) 执行测试 → 验证 fixtures 正确加载

### 文档与示例

- [ ] **T073** 完善 Skill 文档
  - 更新 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/skill.md`
  - 添加完整的 CLI 命令文档
  - 添加蓝图创建教程
  - 添加故障排查指南

- [ ] **T074** 创建示例蓝图
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/testdata/blueprints/examples/`
  - 添加示例：
    - `user-admin.blueprint.yaml` - Seed 策略示例
    - `order-beverage.blueprint.yaml` - API 策略示例
    - `store-initialization.blueprint.yaml` - DB-Script 策略示例
  - 创建对应的种子文件和 SQL 脚本

- [ ] **T075** 创建快速开始指南
  - 更新 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/specs/T004-e2e-testdata-planner/quickstart.md`
  - 包含：
    - 安装与配置
    - 创建第一个蓝图
    - 生成 fixture
    - 在 Playwright 测试中使用 fixture
    - 常见问题排查

### 性能优化

- [ ] **T076** 实现蓝图缓存机制
  - 添加蓝图加载缓存（基于文件修改时间）
  - 避免重复加载未修改的蓝图
  - 添加缓存失效逻辑

- [ ] **T077** 优化依赖图构建性能
  - 使用懒加载依赖图（仅在需要时构建）
  - 缓存拓扑排序结果
  - 添加性能基准测试

### 错误处理增强

- [ ] **T078** 实现全局错误处理器
  - 创建 `/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/e2e-testdata-planner/scripts/error-handler.ts`
  - 统一错误格式（错误代码、消息、建议）
  - 添加错误恢复建议（如"运行 /testdata-planner diagnose 检查问题"）

- [ ] **T079** 添加详细的错误日志
  - 集成日志库（winston 或内置 logger）
  - 记录所有关键操作（蓝图加载、验证、生成）
  - 支持日志级别配置（DEBUG、INFO、WARN、ERROR）

### 测试覆盖率与质量

- [ ] **T080** 达到测试覆盖率目标
  - 运行覆盖率报告：`npm run test:coverage`
  - 确保覆盖率：Branches ≥80%、Functions ≥80%、Lines ≥80%、Statements ≥80%
  - 补充缺失的边界情况测试

- [ ] **T081** 代码质量检查
  - 运行 ESLint：`npm run lint`
  - 修复所有 linting 错误和警告
  - 运行 Prettier：`npm run format`
  - 确保所有代码文件包含 `@spec T004-e2e-testdata-planner` 标识

### 最终验证

- [ ] **T082** 端到端验证
  - 使用 CLI 创建真实蓝图（TD-ORDER-REAL-001）
  - 生成 fixture 代码并保存到 `tests/fixtures/testdata/`
  - 编写真实 Playwright 测试导入生成的 fixture
  - 运行测试验证 fixture 正常工作

- [ ] **T083** 性能基准测试
  - 验证蓝图加载 <1s（100+ 蓝图）
  - 验证依赖图分析 <2s（5 层依赖链）
  - 验证 fixture 生成 <500ms（单个蓝图）
  - 验证完整工作流 <10s（验证 100+ 场景）

- [ ] **T084** 文档审查
  - 审查所有文档的完整性和准确性
  - 确保示例代码可运行
  - 确保 API 文档与实现一致

---

## 任务统计

- **总任务数**: 84
- **Phase 1 (Setup)**: 5 个任务
- **Phase 2 (Foundational)**: 7 个任务
- **Phase 3 (US1 - P1)**: 9 个任务
- **Phase 4 (US2 - P1)**: 9 个任务
- **Phase 5 (US3 - P1)**: 9 个任务
- **Phase 6 (US4 - P2)**: 6 个任务
- **Phase 7 (US5 - P2)**: 12 个任务
- **Phase 8 (US6 - P3)**: 6 个任务
- **Phase 9 (Polish)**: 21 个任务

## MVP 范围（P1 任务）

MVP 包含 Phase 1-5 的所有任务（39 个任务），覆盖：
- ✅ US1: 定义测试数据蓝图（T013-T021）
- ✅ US2: 选择数据供给策略 - Seed 策略（T022-T030）
- ✅ US3: 生成生命周期计划（T031-T039）
- ✅ 基础设施（T001-T012）

MVP 可交付成果：
1. 加载和验证蓝图
2. Seed 策略支持
3. 生命周期计划生成
4. 基础 CLI 命令（create、validate）

## P2 增强（US4-US5）

P2 包含 Phase 6-7 的任务（18 个任务），覆盖：
- ✅ US4: 验证数据契约（T040-T045）
- ✅ US5: 生成 Fixture 代码（T046-T057）

P2 可交付成果：
1. API 策略支持
2. DB-Script 策略支持
3. Fixture 代码生成
4. 契约验证

## P3 优化（US6）

P3 包含 Phase 8 的任务（6 个任务），覆盖：
- ✅ US6: 诊断供给问题（T058-T063）

P3 可交付成果：
1. 诊断工具
2. 详细错误建议

## 交叉关注点（Phase 9）

Phase 9 包含 21 个任务，覆盖：
- CLI 实现（T064-T066）
- 数据来源跟踪（T067-T068）
- 环境配置（T069-T070）
- 集成测试（T071-T072）
- 文档与示例（T073-T075）
- 性能优化（T076-T077）
- 错误处理增强（T078-T079）
- 测试覆盖率（T080-T081）
- 最终验证（T082-T084）

---

**文档版本**: 1.0.0
**创建日期**: 2025-12-30
**最后更新**: 2025-12-30
**下一步**: 开始执行 Phase 1 - Setup
