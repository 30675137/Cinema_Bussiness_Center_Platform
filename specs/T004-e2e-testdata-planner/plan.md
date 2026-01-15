# 实现计划：E2E 测试数据规划器

**分支**: `T004-e2e-testdata-planner` | **日期**: 2025-12-30 | **规格**: [spec.md](./spec.md)
**输入**: 功能规格来自 `/specs/T004-e2e-testdata-planner/spec.md`

**说明**: 此模板由 `/speckit.plan` 命令填写。详见 `.specify/templates/commands/plan.md` 了解执行工作流。

## 摘要

本功能实现一个 Claude Code Skill，作为 E2E 测试数据管理的核心规划器，负责定义测试数据蓝图（testdata blueprints）、配置数据供给策略（seed/api/db-script）、生成生命周期计划（setup/teardown），并为 Playwright 测试生成类型安全的 fixtures。该 skill 是测试数据契约与供给策略的单一真实来源，与 test-scenario-author (T001)、e2e-test-generator (T002)、e2e-runner (T003) 紧密集成，形成完整的 E2E 测试工作流。

技术方法：使用 TypeScript + Node.js + Zod 实现，支持 YAML 蓝图定义、Playwright fixtures 代码生成、依赖图分析和循环依赖检测。采用 TDD 方法开发，确保数据契约验证、策略选择和生命周期生成的正确性。

## 技术上下文

**语言/版本**:
- TypeScript 5.x（严格模式）
- Node.js 18+ (用于 CLI 执行和文件操作)
- Playwright 1.40+ (fixture 系统的目标框架)

**主要依赖**:
- **Zod** ^3.22.0 - 蓝图模式验证和运行时类型检查
- **js-yaml** ^4.1.0 - YAML 蓝图文件解析
- **Playwright** ^1.40.0 - Fixture 系统（测试框架依赖）
- **Supabase Client** ^2.x - db-script 策略的数据库访问
- **Node.js fs/promises** - 文件系统操作（蓝图加载、fixture 生成）
- **Vitest** ^1.0.0 - 单元测试框架
- **graphlib** ^2.1.8 - 依赖图分析和循环检测（可选）

**存储**:
- **蓝图存储**: `testdata/blueprints/*.blueprint.yaml` (版本控制)
- **种子文件**: `testdata/seeds/*.json` 或 `*.yaml` (静态测试数据)
- **数据库脚本**: `testdata/scripts/*.sql` (Supabase SQL 脚本)
- **生成的 fixtures**: `tests/fixtures/testdata/*.fixture.ts` (自动生成，不入版本控制)
- **数据来源日志**: `testdata/logs/provenance.json` (可选，用于调试)

**测试**:
- Vitest (单元测试) - 覆盖蓝图加载、策略选择、生命周期生成、依赖解析、fixture 代码生成
- 集成测试 - 完整工作流测试（蓝图 → 生命周期计划 → fixture 生成 → Playwright 执行）
- E2E 测试 (可选) - 使用生成的 fixtures 验证真实测试场景

**目标平台**:
- Claude Code CLI (作为 skill 调用)
- Playwright 测试环境（fixture 执行环境）
- CI/CD 环境（蓝图验证作为质量门禁）

**项目类型**:
- Claude Code Skill (CLI 工具扩展)
- 测试数据管理工具
- 代码生成器（Playwright fixtures）

**性能目标**:
- 蓝图加载与验证: <1 秒（100+ 蓝图文件）
- 依赖图分析: <2 秒（5 层依赖链，100+ 节点）
- Fixture 代码生成: <500ms（单个蓝图）
- 完整工作流: <10 秒（验证 100+ 场景的 testdata_ref）

**约束**:
- 必须符合功能分支绑定（specId 对齐）
- 必须符合测试驱动开发（TDD）
- 必须符合代码质量与工程化（TypeScript 严格模式、ESLint、Prettier）
- 必须符合 Claude Code Skills 开发规范（skill.md 包含 YAML frontmatter、完整文档）
- 蓝图文件大小限制：单个文件 ≤ 1MB
- 依赖深度限制：最多 10 层依赖链
- 种子文件大小限制：≤ 10MB（更大的数据集使用 db-script）

**规模/范围**:
- 支持 3 种数据供给策略（seed/api/db-script）
- 支持 3 种 fixture 作用域（test/worker/global）
- 支持复杂依赖链（最多 10 层）
- 支持环境特定配置（staging/production）
- 支持版本化蓝图模式
- 支持干运行模式（预览生命周期计划）

## 宪法检查

*门禁：必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T004-e2e-testdata-planner` 匹配 spec ID，active_spec 已对齐
- [x] **测试驱动开发**: 将采用 TDD 方法，关键模块（蓝图加载、依赖解析、fixture 生成）先写测试
- [x] **代码归属标识**: 所有代码文件将包含 `@spec T004-e2e-testdata-planner` 标识
- [N/A] **组件化架构**: 不适用于 CLI 工具（非 UI 组件）
- [N/A] **前端技术栈分层**: 不适用于后端工具/基础设施
- [N/A] **数据驱动状态管理**: 不适用于 CLI 工具（无 UI 状态）
- [x] **代码质量工程化**: 必须通过 TypeScript 严格检查、ESLint、Prettier、Vitest 单元测试
- [N/A] **后端技术栈约束**: 不适用于独立的 Node.js CLI 工具（不是 Spring Boot 应用）
- [x] **Claude Code Skills 开发规范**: 必须创建 skill.md（含 YAML frontmatter）、spec.md、data-model.md、quickstart.md

### 性能与标准检查：
- [x] **性能标准**: 蓝图验证 <10s（100+ 场景），依赖图分析 <2s，fixture 生成 <500ms
- [x] **安全标准**: 使用 Zod 验证蓝图模式，防止路径遍历攻击（种子文件、脚本路径验证）
- [N/A] **可访问性标准**: 不适用于 CLI 工具（无 UI 界面）

### Skill 特定检查：
- [x] **YAML Frontmatter 要求**: skill.md 必须包含 name、description、version 字段
- [x] **文档完整性**: 必须提供 skill.md、spec.md、data-model.md、quickstart.md 四个文档
- [x] **命令调用格式**: 使用 `/testdata-planner` 格式，支持子命令（validate、generate、diagnose）
- [x] **工作流定义**: skill.md 必须明确定义对话流程（引导式蓝图创建）或自动化流程（批量验证）
- [x] **输出规范**: 生成的 fixtures 使用标准命名（`testdata-{ref}.fixture.ts`），提供执行结果摘要

## 项目结构

### 文档（此功能）

```text
specs/T004-e2e-testdata-planner/
├── spec.md               # 功能规格（已创建）
├── plan.md               # 本文件（实现计划）
├── research.md           # Phase 0 输出（研究文档）
├── data-model.md         # Phase 1 输出（数据模型）
├── quickstart.md         # Phase 1 输出（快速开始）
├── contracts/            # Phase 1 输出（YAML schemas）
│   ├── TestdataBlueprint.schema.yaml
│   ├── DataSupplyStrategy.schema.yaml
│   ├── LifecyclePlan.schema.yaml
│   └── DataProvenance.schema.yaml
├── checklists/           # 质量检查清单
│   └── requirements.md   # 需求检查清单（已创建）
└── tasks.md              # Phase 2 输出（由 /speckit.tasks 创建）
```

### Skill 实现（仓库根目录）

```text
.claude/skills/e2e-testdata-planner/
├── skill.md              # Skill 文档（含 YAML frontmatter）
├── README.md             # 开发文档
├── package.json          # NPM 依赖和脚本
├── tsconfig.json         # TypeScript 配置
├── vitest.config.ts      # Vitest 配置
├── scripts/              # 实现代码（TypeScript）
│   ├── cli.ts            # CLI 入口点
│   ├── blueprint-loader.ts    # 蓝图加载器
│   ├── strategy-selector.ts   # 策略选择器
│   ├── lifecycle-generator.ts # 生命周期生成器
│   ├── dependency-resolver.ts # 依赖解析器
│   ├── fixture-codegen.ts     # Fixture 代码生成器
│   ├── validator.ts           # 蓝图验证器
│   ├── schemas.ts             # Zod schemas
│   └── utils/                 # 工具模块
│       ├── file-utils.ts
│       ├── logger.ts
│       └── error-handler.ts
├── assets/templates/     # 模板文件
│   ├── blueprint-template.yaml
│   ├── seed-template.json
│   ├── db-script-template.sql
│   └── fixture-template.ts
├── tests/                # 单元测试与集成测试
│   ├── unit/
│   │   ├── blueprint-loader.test.ts
│   │   ├── dependency-resolver.test.ts
│   │   ├── lifecycle-generator.test.ts
│   │   └── fixture-codegen.test.ts
│   ├── integration/
│   │   ├── full-workflow.test.ts
│   │   └── cross-skill-integration.test.ts
│   └── fixtures/         # 测试数据
│       ├── blueprints/
│       ├── seeds/
│       └── expected-output/
└── dist/                 # 编译输出（不入版本控制）
```

### 测试数据文件位置（项目根目录）

```text
testdata/
├── blueprints/           # 蓝图定义
│   ├── order.blueprint.yaml
│   ├── user.blueprint.yaml
│   └── store.blueprint.yaml
├── seeds/                # 种子文件
│   ├── users.json
│   ├── stores.json
│   └── products.yaml
├── scripts/              # 数据库脚本
│   ├── seed-orders.sql
│   └── seed-inventory.sql
└── logs/                 # 数据来源日志（可选）
    └── provenance.json

tests/fixtures/testdata/  # 生成的 fixtures
├── testdata-TD-ORDER-001.fixture.ts
├── testdata-TD-USER-ADMIN.fixture.ts
└── testdata-TD-STORE-001.fixture.ts
```

**结构决策**: Claude Code Skill 采用模块化 TypeScript 实现，遵循单一职责原则。蓝图加载、策略选择、依赖解析、生命周期生成、fixture 代码生成各自独立，便于测试和维护。使用 Zod 进行运行时验证，确保蓝图格式正确性。生成的 fixtures 与测试代码分离，避免版本控制冲突。

## 复杂度跟踪

> **仅在宪法检查中有需要说明的违规时填写**

| 违规项 | 为何需要 | 拒绝更简单方案的原因 |
|--------|----------|---------------------|
| 无 | N/A | N/A |

*本 skill 完全符合宪法要求，无需特殊豁免。*

## Phase 0: 大纲与研究

### 待研究的技术决策

1. **依赖图分析库选择**:
   - 问题：如何高效检测循环依赖并生成正确的 setup/teardown 顺序？
   - 候选方案：graphlib、自实现 DFS/拓扑排序
   - 需要研究：性能对比、API 易用性、TypeScript 支持

2. **Fixture 代码生成策略**:
   - 问题：如何生成类型安全且可读性高的 Playwright fixtures？
   - 候选方案：模板字符串拼接、AST 操作（babel/ts-morph）、代码模板引擎
   - 需要研究：生成代码的类型安全性、可维护性、性能

3. **Supabase 客户端集成**:
   - 问题：db-script 策略如何安全执行 SQL 脚本？
   - 候选方案：Supabase JS SDK、直接 HTTP API、SQL 文件解析 + 批量执行
   - 需要研究：权限控制、事务支持、错误处理

4. **蓝图版本控制**:
   - 问题：如何支持蓝图模式演化（FR-016）？
   - 候选方案：语义化版本号、迁移脚本、向后兼容检查
   - 需要研究：版本匹配规则、迁移工具设计

5. **数据来源跟踪**:
   - 问题：如何持久化数据来源元数据（FR-013）？
   - 候选方案：JSON 文件、SQLite 数据库、Supabase 表
   - 需要研究：查询性能、并发访问、清理策略

6. **环境特定配置**:
   - 问题：如何支持 staging/production 环境差异（FR-008）？
   - 候选方案：环境变量、蓝图条件字段、多环境蓝图文件
   - 需要研究：配置优先级、覆盖规则、验证逻辑

7. **种子文件加载优化**:
   - 问题：如何处理大种子文件（>10MB）？
   - 候选方案：流式读取、分块加载、数据库批量导入
   - 需要研究：内存占用、加载时间、Playwright fixture 兼容性

8. **CLI 用户体验设计**:
   - 问题：如何提供友好的对话式引导创建蓝图？
   - 候选方案：inquirer.js、prompts、自定义输入处理
   - 需要研究：交互流程设计、输入验证、错误提示

### 研究任务分配

将创建研究代理来回答这些技术问题，并生成 `research.md` 文档。

## Phase 1: 设计与契约

### 数据模型提取

从功能规格中提取的核心实体：

1. **TestdataBlueprint** - 测试数据蓝图
2. **DataSupplyStrategy** - 数据供给策略
3. **LifecyclePlan** - 生命周期计划
4. **DataProvenance** - 数据来源

将生成 `data-model.md` 详细描述这些实体。

### API 契约生成

虽然这是 CLI 工具而非 REST API，但需要定义：
- YAML 蓝图模式（OpenAPI style schemas）
- 生成的 Playwright fixture 接口（TypeScript types）
- CLI 命令参数规范

将生成 `/contracts/` 目录下的 YAML schemas。

### 快速开始指南

将生成 `quickstart.md` 包含：
- 安装与配置
- 创建第一个蓝图
- 生成 fixture
- 在测试中使用 fixture
- 常见问题排查

## 下一步

Phase 0 和 Phase 1 将由 `/speckit.plan` 命令自动完成。Phase 2（任务分解）需要单独运行 `/speckit.tasks` 命令。
