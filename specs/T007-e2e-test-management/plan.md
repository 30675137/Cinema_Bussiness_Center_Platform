# Implementation Plan: E2E 测试管理规范

**Branch**: `T007-e2e-test-management` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T007-e2e-test-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

本计划实现 E2E 测试管理规范，包含以下核心能力：
1. **统一入口增强** - 扩展 `/e2e` skill 支持更多子命令（testcase、report 等）
2. **人工测试用例管理** - 创建、管理、执行人工测试用例（YAML 格式）
3. **Markdown 文档生成** - 新增 `manual-testcase-generator` skill，支持从 TC YAML 和 E2E 场景 YAML 生成人工验证文档
4. **服务自动化管理** - 自动检测、启动、健康检查 C端/B端/后端服务
5. **测试报告静态网站** - 报告聚合页面、历史对比、本地服务器
6. **目录结构优化** - 规范 scenarios/、testcases/、reports/ 等路径

## Technical Context

<!--
  This is a Claude Code Skill spec (T###). Technical context focuses on skill development,
  not traditional frontend/backend development.
-->

**Skill Type**: Claude Code CLI Tool Extension (Skills)

**Language/Version**:
- Skill Definition: Markdown (skill.md with YAML frontmatter)
- Scripts: TypeScript/JavaScript (Node.js runtime for automation scripts)
- Test Framework: Playwright 1.57.0 (E2E test execution)

**Primary Dependencies**:
- Existing E2E Skills: test-scenario-author, e2e-test-generator, e2e-runner, e2e-testdata-planner, e2e-report-configurator, e2e-admin
- Node.js 18+ (runtime for dev servers and scripts)
- Playwright (test execution and report generation)
- YAML Parser (js-yaml for scenario/testcase parsing)

**Storage**:
- YAML files: `scenarios/`, `testcases/` directories
- Markdown docs: `scenarios/<module>/docs/`, `testcases/<module>/docs/`
- Test reports: `reports/e2e/` with timestamped subdirectories
- Service config: `.claude/skills/e2e-admin/assets/service-config.yaml`

**Testing**:
- Skill validation: Manual testing of skill commands
- Script testing: Node.js script unit tests (if applicable)
- Integration testing: End-to-end workflow validation

**Target Platform**:
- Claude Code CLI (macOS, Linux, Windows via WSL)
- Development environment with Node.js, npm, Playwright installed

**Project Type**:
- Claude Code Skill Enhancement (extends existing e2e skill)
- New Skill Creation (manual-testcase-generator)

**Performance Goals**:
- Report portal page load: < 3 seconds
- Service startup detection: < 60 seconds (configurable)
- Document generation: < 5 seconds per file

**Constraints**:
- Must follow Claude Code Skills Development Standards (Constitution Principle 8)
- All skill.md files must include YAML frontmatter (name, description, version)
- Must maintain backward compatibility with existing e2e skills

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查（Claude Code Skill 适配）：

- [x] **功能分支绑定**: 当前分支 `T007-e2e-test-management` 与 active_spec 一致 ✓
- [x] **代码归属标识**: 所有 skill.md 文件必须包含 `@spec T007` 标识 ✓
- [ ] **测试驱动开发**: 必须提供至少 3 个真实使用场景的测试用例
- [x] **Claude Code Skills 开发规范**:
  - [x] skill.md 必须包含 YAML frontmatter (name, description, version) ✓
  - [x] 必须创建 data-model.md 定义数据模型 ✓
  - [x] 必须创建 quickstart.md 快速上手指南 ✓
  - [x] 触发关键词必须包含中英文 ✓

### N/A 规则（不适用于 Claude Code Skill 开发）：

- **组件化架构**: N/A - Skill 不涉及 React 组件开发
- **前端技术栈分层**: N/A - Skill 不涉及 B端/C端 UI 开发
- **数据驱动状态管理**: N/A - Skill 不涉及 Zustand/TanStack Query
- **后端技术栈约束**: N/A - Skill 不涉及 Spring Boot/Supabase 开发

### 性能与标准检查：
- [x] **性能标准**: 报告页面加载 < 3 秒，服务启动检测 < 60 秒 ✓
- [x] **安全标准**: N/A - Skill 不涉及用户认证/敏感数据
- [x] **可访问性标准**: N/A - Skill 主要为 CLI 工具，无 UI 界面

## Project Structure

### Documentation (this feature)

```text
specs/T007-e2e-test-management/
├── spec.md              # Feature specification ✓
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output - YAML schemas for testcases
├── quickstart.md        # Phase 1 output - Quick start guide
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (Skills & Directories)

```text
.claude/skills/
├── e2e/                              # Enhanced unified entry (existing)
│   ├── skill.md                      # Updated with new subcommands
│   └── scripts/
├── manual-testcase-generator/        # NEW skill (T007)
│   ├── skill.md                      # Skill definition with YAML frontmatter
│   ├── assets/
│   │   └── templates/
│   │       ├── testcase-doc.md.tpl   # TC YAML → Markdown template
│   │       └── scenario-doc.md.tpl   # E2E YAML → Markdown template
│   └── references/
├── e2e-admin/                        # Enhanced orchestrator (existing)
│   ├── skill.md
│   └── assets/
│       └── service-config.yaml       # Service automation config
├── test-scenario-author/             # Existing
├── e2e-test-generator/               # Existing
├── e2e-runner/                       # Existing
├── e2e-testdata-planner/             # Existing
└── e2e-report-configurator/          # Existing

scenarios/                            # E2E scenario YAML files
├── <module>/
│   ├── E2E-<MODULE>-<NUMBER>.yaml
│   └── docs/                         # Generated Markdown docs
│       └── E2E-<MODULE>-<NUMBER>.md

testcases/                            # Manual test case YAML files
├── <module>/
│   ├── TC-<MODULE>-<NUMBER>.yaml
│   └── docs/                         # Generated Markdown docs
│       └── TC-<MODULE>-<NUMBER>.md

testdata/                             # Test data blueprints
├── blueprints/
└── seeds/

reports/                              # Test reports
└── e2e/
    ├── e2e-portal/                   # Report aggregation page
    │   ├── index.html
    │   └── reports.json
    └── run-<timestamp>-<hash>/       # Individual run reports
```

**Structure Decision**: Claude Code Skill-based architecture with enhanced unified entry point (`/e2e`), new `manual-testcase-generator` skill, and standardized directory structure for scenarios, testcases, and reports.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
