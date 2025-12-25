# Implementation Plan: 运营专家技能 (Ops Expert Skill)

**Branch**: `T001-ops-expert-skill` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T001-ops-expert-skill/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

开发一个 Claude Code 运营专家技能，使运营人员能够通过自然语言对话方式查询系统数据、执行日常操作、获取操作指导。技术方案采用 Agent + Skill 组合架构：Agent (`agents/ops-expert.md`) 负责交互执行和意图识别，Skill (`skills/ops-expert/SKILL.md`) 提供业务知识库。查询操作通过 Supabase MCP 直接读取数据库，写操作通过封装的 Python 脚本调用后端 REST API。

## Technical Context

**Language/Version**:
- Claude Code Skill/Agent: Markdown + YAML frontmatter
- Python 脚本: Python 3.8+ (用于 API 操作封装)
- 项目虚拟环境: venv/poetry (与 `.specify/scripts/` 共享)

**Primary Dependencies**:
- Supabase MCP: 数据库查询
- Python requests: REST API 调用
- 现有 specs 目录: 业务知识来源

**Storage**:
- 查询: Supabase MCP 直接读取数据库
- 写操作: Python 脚本调用后端 REST API
- 知识库: 静态 Markdown 文件 (从 specs 生成 + 手动补充)

**Testing**:
- 手动测试: 通过 `/ops` 命令触发 Agent，验证意图识别和操作执行
- 脚本测试: Python 脚本单元测试 (pytest)

**Target Platform**:
- Claude Code CLI 环境
- macOS / Linux 终端

**Project Type**:
- Claude Code Skill + Agent 开发
- 不涉及前端 UI 或后端服务开发

**Performance Goals**:
- 查询响应: <30 秒获取数据结果
- 意图识别: <2 秒提供引导提示

**Constraints**:
- 必须使用 Slash command `/ops` 触发
- 知识库覆盖全部规划模块，操作能力随模块实现扩展
- Python 脚本使用项目虚拟环境

**Scale/Scope**:
- 知识库: 覆盖 ~40 个 specs 目录的业务规则
- 操作脚本: 覆盖场景包、门店、影厅、预约等核心模块的 CRUD 操作

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T001-ops-expert-skill` 等于 active_spec 指向路径中的 specId ✓
- [x] **测试驱动开发**: Python 脚本需要编写单元测试；Agent/Skill 通过手动集成测试验证
- [x] **组件化架构**: Agent 和 Skill 分离，知识库使用 references/ 目录组织
- [x] **前端技术栈分层**: 本功能不涉及前端 UI 开发，仅 Claude Code 终端交互 ✓
- [x] **数据驱动状态管理**: 不适用（非前端应用）✓
- [x] **代码质量工程化**: Python 脚本遵循 PEP8，Markdown 遵循项目规范
- [x] **后端技术栈约束**: 写操作通过 REST API 调用，保持与 Spring Boot + Supabase 架构一致 ✓

### 性能与标准检查：
- [x] **性能标准**: 查询 <30s，意图引导 <2s ✓
- [x] **安全标准**: Python 脚本使用环境变量存储 API Token，不硬编码敏感信息
- [x] **可访问性标准**: 不适用（CLI 交互）✓

## Project Structure

### Documentation (this feature)

```text
specs/T001-ops-expert-skill/
├── spec.md              # Feature specification ✓
├── plan.md              # This file ✓
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (N/A - no database entities)
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (N/A - no new APIs)
```

### Source Code (repository root)

```text
.claude/
├── commands/
│   └── ops.md                    # Slash command 入口 (调用 Agent)
├── skills/
│   └── ops-expert/               # 运营专家知识库
│       ├── SKILL.md              # Skill 主文件 (触发条件 + 核心能力)
│       ├── references/           # 业务知识参考
│       │   ├── scenario-package.md   # 场景包管理规则
│       │   ├── store-management.md   # 门店管理规则
│       │   ├── hall-management.md    # 影厅管理规则
│       │   ├── reservation.md        # 预约管理规则
│       │   ├── ops-guide.md          # 运营操作指南 (手动维护)
│       │   └── glossary.md           # 业务术语表
│       ├── examples/             # 对话示例
│       │   └── common-queries.md # 常见查询示例
│       └── scripts/              # Python 操作脚本
│           ├── __init__.py
│           ├── api_client.py     # REST API 客户端封装
│           ├── scenario_ops.py   # 场景包操作
│           ├── store_ops.py      # 门店操作
│           └── utils.py          # 工具函数
└── agents/                       # (可选) Agent 定义
    └── ops-expert.md             # 运营专家 Agent (如需独立 Agent)
```

**Structure Decision**:
- 采用 Skill + Command 组合模式（而非独立 Agent）
- Skill 提供业务知识库，Command (`/ops`) 提供触发入口
- Python 脚本封装写操作，通过 `Bash()` 工具调用

## Complexity Tracking

> **无宪法违规需要记录**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

## Implementation Phases

### Phase 0: Research (已完成澄清)
- [x] Claude Code Skill 结构研究 (通过 Context7 完成)
- [x] 技术决策确认 (Supabase MCP + Python 脚本)
- [x] 触发方式确认 (Slash command `/ops`)

### Phase 1: Design & Contracts
- [ ] 生成 SKILL.md 模板
- [ ] 设计 references/ 目录结构
- [ ] 设计 Python 脚本接口
- [ ] 生成 quickstart.md

### Phase 2: Tasks (由 /speckit.tasks 生成)
- 待 Phase 1 完成后执行
