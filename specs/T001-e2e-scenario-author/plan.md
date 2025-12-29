# Implementation Plan: E2E 场景创作者 Skill (scenario-author)

**Branch**: `T001-e2e-scenario-author` | **Date**: 2025-12-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/T001-e2e-scenario-author/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

创建 Claude Code skill `/scenario-author`,通过对话式交互、模板填充和自动生成三种模式,辅助 QA 工程师创建、编辑、验证和管理 E2E 测试场景 YAML 文件。Skill 支持从项目规格文档(spec.md)自动解析用户故事和验收场景,批量生成符合 E2EScenarioSpec 规范的场景文件,存储在 `scenarios/<module>/` 目录下,实现场景与环境/数据的解耦,并提供标签筛选和规范验证功能。

## Technical Context

**Language/Version**:
- **Skill Implementation**: Markdown (skill.md) + TypeScript/JavaScript (辅助脚本,可选)
- **Python Version**: Python 3.8+ (用于 YAML 解析和 spec.md 文本处理脚本)
- **Node.js Version**: 18+ (用于 JavaScript 脚本执行,如适用)

**Primary Dependencies**:
- **Claude Code Platform**: Skill 运行环境,支持文件系统读写、Markdown 渲染、对话管理
- **YAML Processing**: PyYAML 或 js-yaml (用于 YAML 解析和生成)
- **Markdown Parsing**: Python markdown 库或 remark/unified (用于 spec.md 解析)
- **File System**: Node.js fs/path 或 Python pathlib (用于场景文件管理)
- **Text Processing**: Python re 模块 (用于 Given-When-Then 模式匹配)

**Storage**:
- **场景文件**: 存储在项目根目录 `scenarios/<module>/` 下,格式为 `<scenario_id>.yaml`
- **Skill 文件**: 存储在 `.claude/skills/scenario-author/` 目录下
  - `skill.md` - Skill 主文档
  - `references/` - 参考文档和使用指南
  - `assets/templates/` - E2EScenarioSpec YAML 模板
  - `scripts/` - Python/JavaScript 辅助脚本(可选)

**Testing**:
- **Skill 功能测试**: 通过实际调用 `/scenario-author` 命令验证对话流程、文件生成和验证功能
- **脚本测试**: 对 Python/JavaScript 脚本使用 pytest/jest 进行单元测试
- **场景验证**: 使用 YAML schema 验证生成的场景文件格式正确性

**Target Platform**:
- **Claude Code CLI**: skill 运行的主要平台
- **Operating Systems**: macOS, Linux, Windows (通过 Claude Code 跨平台支持)
- **File System**: 需要读写权限访问项目根目录和 specs/ 目录

**Project Type**:
- **Claude Code Skill**: 对话式开发辅助工具
- **工具类型**: E2E 测试资产管理工具

**Performance Goals**:
- 对话式生成单个场景: < 2 分钟
- 批量生成(从 spec.md): 每个场景 < 10 秒,总计 < 3 分钟(10-15 个场景)
- 场景列表查询: < 1 秒(< 500 个场景)
- 场景验证: < 5 秒

**Constraints**:
- **纯文本处理**: Skill 不执行场景,仅生成和管理 YAML 文件
- **无数据库依赖**: 场景数据完全基于文件系统,通过文件名和目录组织
- **Git 版本控制**: 场景文件依赖 Git 进行版本管理,skill 不实现独立版本系统
- **规格格式依赖**: 依赖项目规格遵循统一格式(包含"用户场景与测试"章节)

**Scale/Scope**:
- **场景数量**: 支持管理 500 个以内的场景(超过则性能可能下降)
- **模块数量**: 支持 10+ 个业务模块(order, inventory, store, hall, etc.)
- **命令覆盖**: create(对话生成), template(模板填充), generate(批量自动生成), edit, validate, list, delete

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T001-e2e-scenario-author`,规格路径 `specs/T001-e2e-scenario-author/spec.md`,specId 一致 ✅
- [x] **测试驱动开发**: Skill 功能测试通过实际调用验证,脚本使用 pytest/jest 单元测试 ✅ (适用范围:辅助脚本)
- [N/A] **组件化架构**: Skill 为纯 Markdown 文档 + 脚本,无 UI 组件,不适用
- [N/A] **前端技术栈分层**: Skill 不涉及 B端/C端 UI 开发,不适用
- [N/A] **数据驱动状态管理**: Skill 无状态管理需求,场景数据为静态 YAML 文件,不适用
- [x] **代码质量工程化**: Python/JavaScript 脚本必须通过 linter (flake8/eslint) 和类型检查 (mypy/tsc) ✅
- [N/A] **后端技术栈约束**: Skill 不涉及后端 API 开发,不适用
- [x] **代码归属标识**: Skill 主文档和脚本必须包含 `@spec T001-e2e-scenario-author` 标识 ✅

### 性能与标准检查：
- [x] **性能标准**: 对话生成 < 2分钟,批量生成 < 3分钟,查询 < 1秒,验证 < 5秒 ✅
- [x] **安全标准**: YAML 解析使用 safe_load 防止代码注入,文件路径验证防止路径遍历 ✅
- [N/A] **可访问性标准**: Skill 为命令行工具,无 UI 可访问性要求,不适用

### Skill 特定检查：
- [x] **Skill 结构规范**: 必须包含 skill.md, references/, assets/templates/, scripts/ (可选)
- [x] **YAML 规范遵循**: 生成的场景必须符合 E2EScenarioSpec 格式,通过 schema 验证
- [x] **环境解耦验证**: 生成的场景禁止硬编码 baseURL/环境标识/具体数据
- [x] **Git 集成**: 场景文件必须存储在 Git 仓库中,支持版本控制

## Project Structure

### Documentation (this feature)

```text
specs/T001-e2e-scenario-author/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output - E2EScenarioSpec YAML schema definition
├── quickstart.md        # Phase 1 output - Skill usage guide
├── contracts/           # Phase 1 output - 不适用(无 API 契约),改为 YAML schema
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Skill Implementation (repository root)

```text
.claude/skills/scenario-author/
├── skill.md                    # Skill 主文档 (Claude Code skill 定义)
├── references/                 # 参考文档
│   ├── e2e-scenario-spec.md   # E2EScenarioSpec 格式说明
│   ├── usage-guide.md         # 详细使用指南
│   └── examples/              # 示例场景 YAML
│       ├── order-example.yaml
│       └── inventory-example.yaml
├── assets/
│   └── templates/             # YAML 模板
│       ├── base-scenario.yaml # 基础场景模板
│       └── scenario-schema.json # YAML schema (用于验证)
└── scripts/                   # 辅助脚本 (可选)
    ├── parse_spec.py          # 解析 spec.md 提取用户故事
    ├── generate_scenario.py   # 批量生成场景 YAML
    ├── validate_scenario.py   # 验证场景格式和解耦原则
    └── list_scenarios.py      # 列出和筛选场景

scenarios/                     # 生成的场景文件 (by skill)
├── order/                    # 订单模块场景
│   ├── E2E-ORDER-001.yaml
│   └── E2E-ORDER-002.yaml
├── inventory/                # 库存模块场景
│   ├── E2E-INVENTORY-001.yaml
│   └── E2E-INVENTORY-002.yaml
└── [other-modules]/

specs/                        # 项目规格文档
├── T001-e2e-scenario-author/
├── P005-bom-inventory-deduction/
│   └── spec.md              # skill 将解析此文件生成场景
└── [other-specs]/
```

**Structure Decision**: Claude Code skill 实现,核心为 `skill.md` Markdown 文档,辅以 Python 脚本进行 YAML 处理和 spec.md 解析。Skill 生成的场景文件按模块组织存储在 `scenarios/<module>/` 目录下,便于 Git 版本控制和团队协作。无前端 UI 组件,无后端 API,纯文件系统操作。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
