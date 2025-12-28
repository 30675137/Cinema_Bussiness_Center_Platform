# Implementation Plan: Claude Skill 文档生成器

**Branch**: `001-skill-doc-generator` | **Date**: 2025-12-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-skill-doc-generator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

实现一个 Claude Skill，能够从 `specs/` 目录下的所有功能规格文档中自动提取和整合数据模型与 API 接口定义，生成统一的 `docs/data-model/data_model.md` 和 `docs/api/api_spec.md` 文档。支持全量生成和增量更新两种模式，通过自然语言触发短语调用，自动识别规格文件源（优先专门文档，回退到 spec.md），智能合并重复实体，标记信息缺口，并提供结构化的处理报告。

## Technical Context

**Language/Version**:
- Python 3.8+ (脚本实现)
- Markdown (Skill 文档格式)
- Claude Skill SDK (如需使用)

**Primary Dependencies**:
- Python 标准库: pathlib, re, json, datetime
- 文件操作: 读取 Markdown 文件，解析文本，生成文档
- 无外部 Python 依赖（纯标准库实现）

**Storage**:
- 输入: `specs/` 目录下的 Markdown 文件 (spec.md, data-model.md, api.md, quickstart.md)
- 输出: `docs/data-model/data_model.md` 和 `docs/api/api_spec.md`
- 脚本位置: `scripts/generate_api_docs.py`

**Testing**:
- 手动测试: 运行脚本验证生成的文档格式和内容
- 边界测试: 测试格式不一致、缺失章节、实体重复等场景
- 回归测试: 验证现有 24 个规格目录的解析结果

**Target Platform**:
- Claude Code CLI (通过 Skill 调用)
- 命令行直接执行 (python3 scripts/generate_api_docs.py)
- 开发环境: macOS/Linux/Windows

**Project Type**:
- Claude Skill 开发 (SKILL.md frontmatter + workflow instructions)
- Python 脚本工具开发 (文档生成自动化)

**Performance Goals**:
- 处理 50+ 规格文件 < 2 分钟
- Skill 触发响应 < 5 秒
- 文档生成内存占用 < 500MB

**Constraints**:
- 必须遵循功能分支绑定（specId 对齐）
- 输出文档必须符合项目 API 标准（.claude/rules/08-api-standards.md）
- 脚本必须存放在 scripts/ 目录
- 文档必须输出到 docs/ 子目录（按类型分类）
- 必须支持容错（格式不一致不应导致流程失败）

**Scale/Scope**:
- 输入: ~50 个规格目录，每个包含 1-4 个 Markdown 文件
- 输出: 2 个整合文档（数据模型 + API 规格）
- Skill 工作流: 7 个步骤（识别文件 → 解析 → 整合 → 生成 → 报告）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: ✅ 当前分支 `001-skill-doc-generator`，specId 与 active_spec 一致
- [x] **测试驱动开发**: ⚠️ **部分适用** - Skill 和脚本开发以手动测试为主，关键解析逻辑需边界测试
- [N/A] **组件化架构**: N/A - 非前端组件开发项目
- [N/A] **前端技术栈分层**: N/A - 非前端应用，为工具脚本和 Skill 开发
- [N/A] **数据驱动状态管理**: N/A - 无状态管理需求
- [x] **代码质量工程化**: ✅ Python 脚本需遵循 PEP 8，Skill 文档需符合格式规范
- [N/A] **后端技术栈约束**: N/A - 无后端服务，仅文件读写操作

### 性能与标准检查：
- [x] **性能标准**: ✅ 目标处理 50+ 规格 < 2 分钟，Skill 响应 < 5 秒
- [x] **安全标准**: ✅ 仅读取项目内文件，无外部输入风险，不涉及用户认证
- [N/A] **可访问性标准**: N/A - 命令行工具，无 UI 界面

### Skill 特定检查：
- [x] **Skill 格式规范**: 必须包含正确的 frontmatter (name, description, version)
- [x] **触发短语明确性**: description 必须包含明确的触发短语和使用场景
- [x] **工作流程清晰性**: 必须提供清晰的步骤说明，指导 Claude 执行任务
- [x] **输出路径规范**: 文档输出到 `docs/data-model/` 和 `docs/api/`，脚本存放于 `scripts/`

## Project Structure

### Documentation (this feature)

```text
specs/001-skill-doc-generator/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (Skill frontmatter schema)
│   └── SKILL_schema.md  # Skill frontmatter 格式规范
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Skill and Script Files (repository root)

```text
.claude/
└── skills/
    └── skill-doc-generator/     # Skill 主目录
        ├── SKILL.md             # Skill 入口文件 (frontmatter + workflow)
        ├── references/          # 参考资源
        │   ├── templates.md     # 文档模板定义
        │   └── parsing-rules.md # 解析规则说明
        └── examples/            # 示例文件
            ├── sample-spec.md        # 示例规格文档
            └── sample-data-model.md  # 预期输出示例

scripts/
└── generate_api_docs.py    # Python 文档生成脚本

docs/
├── data-model/              # 数据模型文档输出目录
│   └── data_model.md       # 整合的数据模型文档
└── api/                     # API 规格文档输出目录
    └── api_spec.md         # 整合的 API 文档

specs/                       # 输入：所有功能规格
├── 001-skill-doc-generator/ # 本功能
├── 014-hall-store-backend/  # 示例规格 (有 data-model.md)
├── 020-store-address/       # 示例规格 (有 data-model.md)
└── [other-specs]/           # 其他规格目录
```

**Structure Decision**: Claude Skill 开发项目，包含 Skill 定义文件 (SKILL.md)、Python 脚本工具 (generate_api_docs.py) 和文档模板。Skill 通过自然语言触发，调用 Python 脚本处理所有规格文件，生成整合文档到 docs/ 目录。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
