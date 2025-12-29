# Implementation Plan: E2E 场景创建工具 (test-scenario-author)

**Branch**: `T001-e2e-scenario-author` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T001-e2e-scenario-author/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

创建 Claude Code Skill 辅助 QA 工程师快速创建、管理和验证标准化的 E2E 测试场景 YAML 文件。Skill 支持对话式创建、模板填充、从 spec.md 批量生成、标签筛选和规范验证等功能。技术方案采用 Markdown skill + Python 脚本混合架构,使用 PyYAML + jsonschema 进行 YAML 处理和验证,正则表达式解析 spec.md 中的用户故事,pathlib 进行跨平台文件操作。场景文件通过 Git 版本控制,与环境配置和测试数据解耦,确保可复用性。

## Technical Context

**Language/Version**:
- Python 3.8+ (Skill 脚本语言)
- Markdown (Skill 主文档格式)
- YAML (场景文件格式)
- JSON Schema (场景验证)

**Primary Dependencies**:
- PyYAML 6.0+ (YAML 解析和生成)
- jsonschema 4.17+ (JSON Schema 验证)
- pathlib (Python 标准库,文件操作)
- re (Python 标准库,正则表达式)

**Storage**:
- Git 仓库文件系统存储 (`scenarios/<module>/<scenario_id>.yaml`)
- 无数据库依赖,纯文件系统操作
- 场景文件受 Git 版本控制,支持历史追溯和回退

**Testing**:
- pytest (Python 单元测试)
- 集成测试(完整工作流: create → validate → list)
- 示例场景文件用于手动测试
- 边缘用例测试(空场景、超大场景、非法字符等)

**Target Platform**:
- Claude Code CLI (命令行工具)
- macOS / Linux / Windows (跨平台支持)
- 与 CI/CD 集成(可在自动化流程中调用 skill)

**Project Type**:
- Claude Code Skill (扩展 Claude Code 功能的对话式工具)
- 辅助测试工程,非测试执行引擎

**Performance Goals**:
- 单个场景生成 < 1 秒
- 批量生成 100 个场景 < 10 秒
- 验证单个场景 < 100 毫秒
- 列出 500+ 场景 < 2 秒

**Constraints**:
- 必须遵循 Constitution Principle 8 (Claude Code Skills Development Standards)
- 场景必须与环境配置和测试数据解耦
- 使用 `@spec T001` 标识所有文件归属
- Skill 名称为 `test-scenario-author`,命令前缀为 `/test-scenario-author`

**Scale/Scope**:
- 支持管理 500+ 场景文件
- 7 个核心命令(create, template, generate, validate, list, edit, delete)
- 5 个用户故事,57 个实现任务
- 适用于多模块项目(订单、库存、门店等)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T001-e2e-scenario-author`,active_spec 指向 `specs/T001-e2e-scenario-author/spec.md` - ✅ 一致
- [x] **测试驱动开发**: Skill 核心脚本(parse_spec.py, generate_scenario.py, validate_scenario.py)必须先编写 pytest 单元测试 - ✅ 已在 tasks.md 中规划
- [N/A] **组件化架构**: 不适用(非 UI 组件项目,是 CLI Skill)
- [N/A] **前端技术栈分层**: 不适用(非前端项目,是 Python CLI 工具)
- [N/A] **数据驱动状态管理**: 不适用(无状态管理需求,是脚本工具)
- [x] **代码质量工程化**: Python 代码必须遵循 PEP 8,使用类型提示,通过 pylint/flake8 检查 - ✅ 已在 tasks.md 中规划
- [N/A] **后端技术栈约束**: 不适用(无后端服务,仅文件系统操作)
- [x] **Claude Code Skills 开发标准 (Principle 8)**: 必须包含 skill.md, spec.md, data-model.md, quickstart.md,使用 T### 模块前缀 - ✅ 符合

### 性能与标准检查：
- [x] **性能标准**: 单个场景生成 < 1 秒,批量生成 100 个场景 < 10 秒,列表查询 < 2 秒 - ✅ 已定义性能目标
- [x] **安全标准**: 使用 `yaml.safe_load()` 防止代码注入,验证文件路径防止路径遍历攻击,限制文件大小 < 1MB - ✅ 已在 research.md 中定义安全措施
- [N/A] **可访问性标准**: 不适用(CLI 工具,非 UI 界面)

## Project Structure

### Documentation (this feature)

```text
specs/T001-e2e-scenario-author/
├── spec.md              # Feature specification (用户故事、验收场景)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (技术方案研究)
├── data-model.md        # Phase 1 output (E2EScenarioSpec YAML schema)
├── quickstart.md        # Phase 1 output (Skill 使用快速开始)
├── contracts/           # Phase 1 output
│   └── scenario-schema.json  # JSON Schema 验证规则
└── tasks.md             # Phase 2 output (57 个实现任务)
```

### Skill Structure (repository root)

```text
.claude/skills/test-scenario-author/
├── skill.md                     # 主 Skill 定义文件,包含 7 个命令的对话流程
│                                # Commands: create, template, generate, validate, list, edit, delete
│
├── references/                  # 参考文档目录
│   ├── e2e-scenario-spec.md    # E2EScenarioSpec 格式规范说明
│   └── usage-guide.md          # 详细使用指南
│
├── assets/templates/            # 模板和 Schema 资源
│   ├── base-scenario.yaml      # 基础 YAML 模板
│   └── scenario-schema.json    # JSON Schema 验证规则(从 contracts/ 复制)
│
└── scripts/                     # Python 辅助脚本
    ├── __init__.py             # Python 包初始化
    ├── parse_spec.py           # 解析 spec.md 提取用户故事和验收场景
    ├── generate_scenario.py    # 生成场景 YAML 文件
    ├── validate_scenario.py    # 验证场景符合 E2EScenarioSpec 规范
    ├── list_scenarios.py       # 列出和筛选场景
    └── id_generator.py         # 生成唯一 scenario_id
```

### Scenario Storage (repository root)

```text
scenarios/                       # 场景文件存储目录(Git 版本控制)
├── order/                      # 订单模块场景
│   ├── E2E-ORDER-001.yaml
│   ├── E2E-ORDER-002.yaml
│   └── E2E-ORDER-003.yaml
├── inventory/                  # 库存模块场景
│   ├── E2E-INVENTORY-001.yaml
│   └── E2E-INVENTORY-002.yaml
├── store/                      # 门店模块场景
│   └── E2E-STORE-001.yaml
└── payment/                    # 支付模块场景
    └── E2E-PAYMENT-001.yaml
```

### Testing Structure

```text
.claude/skills/test-scenario-author/
└── tests/                      # pytest 测试目录
    ├── __init__.py
    ├── test_parse_spec.py     # 测试 spec.md 解析
    ├── test_generate_scenario.py  # 测试场景生成
    ├── test_validate_scenario.py  # 测试场景验证
    ├── test_list_scenarios.py     # 测试场景列表和筛选
    ├── test_id_generator.py       # 测试 ID 生成
    ├── fixtures/                  # 测试数据
    │   ├── sample_spec.md
    │   ├── valid_scenario.yaml
    │   └── invalid_scenario.yaml
    └── conftest.py                # pytest 配置
```

**Structure Decision**: Claude Code Skill 扩展结构,使用 Markdown 驱动对话流程,Python 脚本处理复杂逻辑(解析、生成、验证)。场景文件按模块组织在 `scenarios/` 目录下,由 Git 管理版本历史。Skill 目录包含主文档(skill.md)、参考资料(references/)、模板资源(assets/templates/)和辅助脚本(scripts/),遵循 Constitution Principle 8 的 Claude Code Skills 开发标准。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无宪法违规 - 所有适用的宪法原则检查均已通过:

✅ 功能分支绑定正确 (T001-e2e-scenario-author)
✅ 测试驱动开发已规划 (pytest 单元测试 + 集成测试)
✅ 代码质量工程化已规划 (PEP 8, pylint/flake8, 类型提示)
✅ Claude Code Skills 开发标准已遵循 (Principle 8)
✅ 性能标准已定义 (< 1 秒单个生成, < 10 秒批量生成)
✅ 安全标准已定义 (yaml.safe_load, 路径验证, 文件大小限制)

不适用的原则(N/A)已在 Constitution Check 中明确标注(前端架构、状态管理、后端架构等不适用于 CLI Skill 项目)。
