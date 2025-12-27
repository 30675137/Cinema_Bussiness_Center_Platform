# Implementation Plan: Doc-Writer Skill Enhancement

**Branch**: `T001-doc-writer-enhance` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T001-doc-writer-enhance/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

增强 doc-writer 技能的软件文档编写能力，添加 `/doc` 命令作为快捷入口（类似 `/ops` 命令模式）。支持多种文档类型生成（TDD、架构、详细设计、接口、数据库、手册、README、发布说明、功能矩阵），提供三种生成模式（全量初始化、单文档生成、增量更新），并实现智能意图识别。

## Technical Context

**Project Type**: Claude Code Skill 增强（Markdown 配置 + Prompt 工程）

**Language/Version**:
- Markdown: 技能定义文件（SKILL.md）、命令配置文件（doc.md）、文档模板
- YAML: 数据源解析配置（source-parsers.yaml）

**Primary Files**:
- `.claude/skills/doc-writer/SKILL.md` - 技能定义文件（主要修改）
- `.claude/commands/doc.md` - 命令配置文件（新建）
- `.claude/skills/doc-writer/templates/` - 文档模板目录（扩展）
- `.claude/skills/doc-writer/source-parsers.yaml` - 数据源解析配置（新建）

**Storage**: 文件系统
- 输入：`specs/` 目录下的 spec.md 文件、额外指定的数据源文件夹
- 输出：`docs/` 目录下的生成文档

**Testing**:
- 手动测试：在 Claude Code 环境中执行 `/doc` 命令验证
- 验收测试：按 spec.md 中定义的 Acceptance Scenarios 验证

**Target Platform**: Claude Code CLI 环境

**Performance Goals**:
- 命令响应时间 ≤ 2 秒（从输入到开始生成）
- 完整 TDD 文档生成 ≤ 30 秒
- 意图识别准确率 ≥ 90%

**Constraints**:
- 遵循 Claude Code Skill 规范（SKILL.md 格式）
- 遵循 Claude Command 规范（frontmatter 配置）
- 与现有 `/ops` 命令模式保持一致

**Reference Implementation**:
- `.claude/skills/ops-expert/SKILL.md` - 参考技能结构
- `.claude/commands/ops.md` - 参考命令配置格式

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T001-doc-writer-enhance` 与规格目录 `specs/T001-doc-writer-enhance/` 一致
- [N/A] **测试驱动开发**: 本功能为 Claude Skill 配置，无传统代码测试；通过手动验收测试验证
- [N/A] **组件化架构**: 本功能为 Markdown 配置文件，不涉及 UI 组件开发
- [N/A] **前端技术栈分层**: 本功能不涉及前端代码
- [N/A] **数据驱动状态管理**: 本功能不涉及状态管理
- [x] **代码质量工程化**: 配置文件遵循 Claude Skill/Command 规范，Markdown 格式规范
- [N/A] **后端技术栈约束**: 本功能不涉及后端代码

### 性能与标准检查：
- [x] **性能标准**: 命令响应 ≤2s，文档生成 ≤30s（在 Success Criteria 中定义）
- [N/A] **安全标准**: 本功能为文档生成，不涉及用户输入验证和安全敏感操作
- [N/A] **可访问性标准**: 本功能输出为 Markdown 文档，不涉及 UI 可访问性

### 适用性说明：
本功能为 Claude Code Skill 增强，主要涉及：
1. Markdown 配置文件编写（SKILL.md, doc.md, 模板文件）
2. YAML 配置文件（source-parsers.yaml）
3. Prompt 工程（智能意图识别、文档生成指令）

大部分前后端相关的宪法原则不适用于本功能类型。

## Project Structure

### Documentation (this feature)

```text
specs/T001-doc-writer-enhance/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (N/A for skill config)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (Claude Skill Files)

```text
.claude/
├── commands/
│   ├── ops.md           # 参考：运营命令配置
│   └── doc.md           # 新建：文档命令配置
├── skills/
│   ├── doc-writer/
│   │   ├── SKILL.md            # 技能定义（主要修改）
│   │   ├── source-parsers.yaml # 数据源解析配置（新建）
│   │   └── templates/          # 文档模板目录
│   │       ├── tdd.md              # 技术设计文档模板（现有）
│   │       ├── architecture.md     # 架构设计文档模板（现有）
│   │       ├── detail-design.md    # 详细设计文档模板（现有）
│   │       ├── api-design.md       # 接口设计文档模板（现有）
│   │       ├── database-design.md  # 数据库设计文档模板（现有）
│   │       ├── manual.md           # 用户手册模板（新建）
│   │       ├── readme.md           # README 模板（新建）
│   │       ├── release-notes.md    # 发布说明模板（新建）
│   │       └── feature-matrix.md   # 功能矩阵模板（新建）
│   └── ops-expert/
│       └── SKILL.md        # 参考：运营技能定义

docs/                       # 输出：生成的文档目录
├── tdd/                    # 技术设计文档
├── architecture/           # 架构设计文档
├── api/                    # 接口设计文档
├── database/               # 数据库设计文档
├── detail-design/{module}/ # 详细设计文档（按模块）
├── product/{module}/       # 产品需求文档（按模块）
├── manual/{module}/        # 用户手册（按模块）
├── guide/{module}/         # 操作指南（按模块）
└── matrix/                 # 产品功能矩阵
    └── feature-matrix.md
```

**Structure Decision**: Claude Code Skill 配置项目，主要涉及 Markdown 和 YAML 配置文件的编写。无传统代码结构，输出为 `docs/` 目录下的文档文件。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
