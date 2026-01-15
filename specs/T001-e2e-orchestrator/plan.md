# Implementation Plan: E2E 测试编排器

**Branch**: `T001-e2e-orchestrator` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T001-e2e-orchestrator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

E2E 测试编排器是一个 Claude Code skill，通过编排多个专业 skill（test-scenario-author、e2e-testdata-planner、e2e-test-generator、e2e-report-configurator、e2e-artifacts-policy、e2e-runner）来协调端到端测试工作流。它支持按标签（module、channel、deploy、priority）选择场景、配置测试参数（workers、retries、timeout）、自动启动跨系统开发服务器（C端/B端）、执行 Playwright 测试，并生成包含执行摘要的独立 HTML 报告包。

**核心功能**:
- 场景选择与过滤（标签、显式 ID）
- 固定顺序 skill 编排（支持可选跳过）
- 跨系统服务管理（自动启动 C端/B端 dev servers）
- Playwright 测试执行（仅 Chromium，支持并行和重试）
- 隔离报告生成（唯一 run_id，HTML 报告 + 工件）

**技术方法**:
- Python 脚本实现 skill 逻辑（CLI 命令解析、skill 调用、服务管理）
- YAML 配置驱动（场景元数据、默认配置）
- Playwright Node.js CLI 集成（`npx playwright test`）
- 进程管理（启动/停止 dev servers，优雅中断处理）

## Technical Context

**Language/Version**:
- Skill 实现: Python 3.8+ (Claude Code skills 标准语言)
- 测试框架: Playwright (通过 Node.js CLI 调用)
- 配置格式: YAML (场景定义), JSON (测试数据、报告摘要)

**Primary Dependencies**:
- Python 标准库: `subprocess` (进程管理), `argparse` (CLI 参数), `pathlib` (文件路径), `json`/`yaml` (配置解析), `datetime` (run_id 生成)
- 外部工具: Playwright CLI (`npx playwright test`), Node.js (v18+)
- 内部 skills: test-scenario-author (T005), e2e-test-generator (T002), e2e-testdata-planner (T003, 计划中)
- 可选 skills: e2e-report-configurator, e2e-artifacts-policy, e2e-runner (使用内置默认实现)

**Storage**:
- 场景 YAML 文件: `scenarios/<module>/<scenario_id>.yaml` (由 T005-e2e-scenario-author 生成)
- 测试数据: `testdata/<dataFile>.json` (由 T003-testdata-manager 管理)
- 测试脚本: `scenarios/<module>/<scenario_id>.spec.ts` (由 T002-e2e-test-generator 生成)
- 报告输出: `test-results/run-{run_id}/` (HTML 报告 + 工件)

**Testing**:
- Skill 单元测试: pytest (测试 Python 逻辑，如场景过滤、配置组装、服务检测)
- Skill 集成测试: pytest + mock subprocess (测试 Playwright CLI 调用、进程管理)
- 端到端验证: 实际运行 orchestrator 并验证报告生成

**Target Platform**:
- 执行环境: macOS/Linux 终端 (Claude Code CLI)
- 测试目标: Chromium 浏览器 (仅)
- 跨系统支持: C端 (http://localhost:10086), B端 (http://localhost:3000)

**Project Type**:
- Claude Code Skill (命令行工具扩展)
- 测试编排工具 (conductor pattern)

**Performance Goals**:
- 编排开销: <30 秒 (不包括实际测试执行时间)
- 并发能力: 支持 100+ 场景，4 workers 并行执行
- 报告生成: <5% 总执行时间开销
- 服务启动: <10 秒 (C端/B端 dev servers)

**Constraints**:
- 必须遵循 Claude Code Skills 开发规范 (YAML frontmatter, skill.md/spec.md/data-model.md/quickstart.md 四文档要求)
- 必须使用 `T###` 模块前缀 (Tool/Infrastructure)
- 必须包含 `@spec T001-e2e-orchestrator` 归属标识
- 仅支持 Chromium 浏览器 (不支持 Firefox/WebKit/mobile)
- 不支持 smoke 标签过滤 (已移除用户故事)
- 依赖 skills 缺失时使用内置默认实现 (graceful degradation)

**Scale/Scope**:
- 场景数量: 支持 100+ 测试场景
- 标签类型: module, channel, deploy, priority (4 种)
- Worker 范围: 1-10 并行 workers
- 重试范围: 0-3 次重试
- 环境支持: dev, staging, prod (3 种环境)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T001-e2e-orchestrator` 与 spec 路径 `specs/T001-e2e-orchestrator/spec.md` 一致，specId 对齐
- [x] **代码归属标识**: 所有 Python 脚本必须包含 `@spec T001-e2e-orchestrator` 注释
- [x] **测试驱动开发**: Skill 核心逻辑（场景过滤、配置组装、服务检测）必须先编写单元测试，测试覆盖率 ≥80%
- [N/A] **组件化架构**: 不适用（非前端 UI 组件开发）
- [N/A] **前端技术栈分层**: 不适用（Claude Code skill，非 B端/C端 前端代码）
- [N/A] **数据驱动状态管理**: 不适用（无需 Zustand/TanStack Query）
- [x] **代码质量工程化**: Python 代码必须通过 pylint/black 检查，遵循 PEP 8 规范
- [N/A] **后端技术栈约束**: 不适用（非 Spring Boot/Supabase 后端开发）
- [x] **Claude Code Skills 开发规范**:
  - ✅ 使用 `T001` 模块前缀 (Tool/Infrastructure)
  - ✅ 必须创建 skill.md (包含 YAML frontmatter)
  - ✅ 必须创建 spec.md (已存在)
  - ⏳ 必须创建 data-model.md (Phase 1)
  - ⏳ 必须创建 quickstart.md (Phase 1)
  - ⏳ skill.md 必须包含 YAML frontmatter (name, description, version)

### 性能与标准检查：
- [x] **性能标准**: 编排开销 <30 秒，支持 100+ 场景并行执行，报告生成开销 <5% 总时间
- [x] **安全标准**:
  - 验证用户输入（标签过滤、配置范围）
  - 安全启动子进程（避免命令注入）
  - 敏感信息处理（不在日志中暴露测试数据）
- [N/A] **可访问性标准**: 不适用（非 UI 界面）

## Project Structure

### Documentation (this feature)

```text
specs/T001-e2e-orchestrator/
├── spec.md              # ✅ 已存在 - 功能规格说明
├── plan.md              # 🔄 当前文件 - 实现计划
├── research.md          # ⏳ Phase 0 输出 - 技术研究
├── data-model.md        # ⏳ Phase 1 输出 - 数据模型
├── quickstart.md        # ⏳ Phase 1 输出 - 快速上手指南
├── contracts/           # ⏳ Phase 1 输出 - API 契约（如需）
│   └── orchestrator-config.schema.json
└── tasks.md             # ⏳ Phase 2 输出 - 开发任务 (/speckit.tasks)
```

### Skill Implementation

```text
.claude/skills/e2e-orchestrator/
├── skill.md                    # ⏳ Skill 功能说明（包含 YAML frontmatter）
├── scripts/
│   ├── orchestrate.py          # 主编排脚本
│   ├── scenario_filter.py      # 场景过滤逻辑
│   ├── config_assembler.py     # 配置组装
│   ├── service_manager.py      # 开发服务器管理
│   ├── skill_executor.py       # Skill 调用编排
│   ├── report_generator.py     # 报告摘要生成
│   └── utils.py                # 工具函数
├── assets/
│   ├── default-config.yaml     # 默认配置模板
│   └── run-config-template.json
├── tests/
│   ├── test_scenario_filter.py
│   ├── test_config_assembler.py
│   ├── test_service_manager.py
│   └── fixtures/               # 测试夹具（模拟场景 YAML）
└── README.md                   # 开发者文档
```

### Test Artifacts (generated during execution)

```text
test-results/
├── run-{run_id}/               # 每次运行的独立目录
│   ├── index.html              # Playwright HTML 报告
│   ├── summary.json            # 执行摘要
│   ├── config.json             # 运行配置快照
│   └── artifacts/              # 测试工件
│       ├── E2E-INVENTORY-001/  # 按场景组织
│       │   ├── trace.zip       # Playwright trace
│       │   ├── video.webm      # 测试视频
│       │   └── screenshot.png  # 截图
│       └── E2E-INVENTORY-002/
└── latest -> run-{latest_id}   # 符号链接到最新运行
```

**Structure Decision**:
- Skill 使用 Python 实现，遵循模块化设计（场景过滤、配置组装、服务管理、报告生成独立模块）
- 测试报告按 run_id 隔离，避免并行运行冲突
- 支持内置默认实现，降低对未创建 skills 的依赖

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | 所有宪法原则检查已通过或标记为 N/A | - |

**说明**:
- 本 skill 作为 Claude Code skill (Tool/Infrastructure)，部分前端相关原则（组件化架构、技术栈分层、状态管理、后端架构）不适用
- 所有适用原则（功能分支绑定、代码归属标识、测试驱动开发、代码质量、Claude Code Skills 规范）均已满足或计划在后续 Phase 完成

---

## Phase 0: Research & Technical Decisions

**Status**: ✅ Complete

**Unknowns to Resolve**:

1. **NEEDS CLARIFICATION**: Playwright CLI 调用最佳实践
   - 如何通过 Python subprocess 调用 `npx playwright test` 并捕获实时输出？
   - 如何传递配置参数（workers、retries、timeout、projects）到 Playwright？
   - 如何检测 Playwright 执行完成和退出状态？

2. **NEEDS CLARIFICATION**: 跨系统开发服务器管理
   - 如何检测场景 YAML 中的 `system` 字段（c-end/b-end）？
   - 如何启动 C端 dev server (`cd hall-reserve-taro && npm run dev:h5`)?
   - 如何启动 B端 dev server (`cd frontend && npm run dev`)?
   - 如何检测服务启动成功（端口监听检查）？
   - 如何优雅停止服务（Ctrl+C 信号传递）？

3. **NEEDS CLARIFICATION**: 场景 YAML 加载与过滤
   - 如何递归扫描 `scenarios/` 目录加载所有 `.yaml` 文件？
   - 如何解析 YAML 中的 `tags` 字段（module、channel、deploy、priority）？
   - 如何实现 AND/OR 标签逻辑（例如 `module:inventory AND priority:p1`）？

4. **NEEDS CLARIFICATION**: Skill 编排调用机制
   - 如何通过 Python 编程方式调用其他 Claude Code skills？
   - 是否需要通过 subprocess 调用 `claude` CLI？
   - 如何传递参数给 skill（如 `test-scenario-author validate <scenario_id>`）？
   - 如何处理 skill 调用失败（回退到内置实现）？

5. **NEEDS CLARIFICATION**: 报告生成与摘要提取
   - Playwright HTML 报告生成在哪里（默认路径）？
   - 如何提取报告中的统计信息（总数、通过、失败、跳过、重试）？
   - 如何生成 `summary.json` 文件？
   - 如何打包报告为独立的 ReportPack？

**Research Tasks**:
- 研究 Playwright CLI 参数和配置文件格式
- 研究 Python subprocess 最佳实践（实时输出、信号处理）
- 研究 Node.js dev server 启动检测方法（端口监听、healthcheck）
- 研究 Claude Code skills 编程调用 API（如果存在）
- 研究 YAML 解析库（PyYAML）和标签过滤算法

**Output**: ✅ `research.md` (已生成)

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete

**Deliverables**:

1. **data-model.md**: 定义以下实体
   - TestScenario (场景 YAML 结构)
   - RunConfig (测试运行配置)
   - ReportPack (报告包结构)
   - TestArtifact (工件元数据)

2. **contracts/orchestrator-config.schema.json**: RunConfig JSON Schema
   - 定义配置文件格式和验证规则
   - 包含环境、baseURL、workers、retries、timeout、projects 字段

3. **quickstart.md**: 快速上手指南
   - Skill 安装和依赖检查
   - 基本命令使用示例
   - 常见问题排查

4. **skill.md**: Skill 功能说明（包含 YAML frontmatter）
   - YAML frontmatter (name, description, version)
   - 命令参数说明
   - 使用示例
   - 工作流程图

**Output**: ✅ data-model.md, ✅ contracts/orchestrator-config.schema.json, ✅ quickstart.md, ⏳ skill.md (需在 .claude/skills/ 创建)

---

## Phase 2: Task Breakdown

**Status**: ⏳ Not Started (use `/speckit.tasks` command to generate tasks.md)

**Note**: Phase 2 任务分解将在 Phase 1 设计完成后，通过 `/speckit.tasks` 命令生成 `tasks.md` 文件。

---

## Next Steps

1. ✅ Complete Technical Context and Constitution Check (本文件)
2. ✅ Execute Phase 0: Research unknowns and generate `research.md`
3. ✅ Execute Phase 1: Design data models, contracts, and quickstart guide
4. ⏳ Create skill.md in `.claude/skills/e2e-orchestrator/` (包含 YAML frontmatter)
5. ⏳ Update agent context via `.specify/scripts/bash/update-agent-context.sh`
6. ⏳ Re-evaluate Constitution Check post-design
7. ⏳ Execute Phase 2: Generate `tasks.md` via `/speckit.tasks`

---

**Generated by**: `/speckit.plan` command
**Date**: 2025-12-30
**Spec Version**: Based on clarified spec.md (Session 2025-12-30)
