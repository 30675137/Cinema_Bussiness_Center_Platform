# Implementation Plan: Lark MCP 项目管理系统

**Branch**: `T004-lark-project-management` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T004-lark-project-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

通过飞书 MCP 服务实现项目管理系统,作为 Claude Code skill 提供任务跟踪、技术债记录、Bug 管理、产品功能矩阵和测试记录管理功能。采用 `/lark-pm` 命令调用,扁平化子命令结构,所有数据存储在单个飞书 Base App 的 5 个数据表中,采用指数退避重试策略处理 API 失败,Last Write Wins 策略处理并发冲突。

## Technical Context

**Language/Version**:
- TypeScript 5.9.3+ (Claude Code skill implementation)
- Node.js 18+ (runtime environment)

**Primary Dependencies**:
- **Claude Code SDK**: 用于 skill 注册和命令处理
- **Lark MCP Client**: 飞书 MCP 服务客户端
  - `@larksuiteoapi/node-sdk` 或直接 HTTP 调用
- **Command Line Interface**:
  - `commander` 或 `yargs` - CLI 参数解析
  - `chalk` - 终端输出着色
  - `ora` - Loading 动画
- **Data Export**:
  - `xlsx` 或 `exceljs` - Excel 导出
  - `json2csv` - CSV 导出
- **Error Handling**:
  - 自定义 retry 工具(指数退避)
  - 结构化日志记录

**Storage**:
- 飞书多维表格 (Lark Base/Bitable) 作为唯一数据源
- 单个 Base App 包含 5 个数据表: Tasks, TechnicalDebt, Bugs, Features, TestRecords
- 无本地数据库,所有数据通过飞书 MCP API 读写

**Testing**:
- Vitest - 单元测试
- 手动 E2E 测试 - 通过实际调用 `/lark-pm` 命令验证

**Target Platform**:
- 命令行工具,运行在 Claude Code CLI 环境中
- 跨平台支持: macOS, Linux, Windows (通过 Node.js)

**Project Type**:
- Claude Code Skill (技术基础设施工具)
- 命令行界面应用 (CLI tool)
- 飞书 MCP 服务集成

**Performance Goals**:
- 命令响应时间 < 2秒 (不含网络延迟)
- 支持查询 500+ 条记录,响应时间 < 3秒
- 导出数据(所有记录)< 10秒

**Constraints**:
- 必须遵循 Claude Code Skills 开发规范(见 `.claude/rules/10-claude-code-skills.md`)
- 必须包含完整的 `skill.md` 文件(含 YAML frontmatter)
- 必须使用 T### 模块前缀(Tool/Infrastructure)
- API 调用失败必须采用指数退避重试策略
- 并发冲突采用 Last Write Wins 策略

**Scale/Scope**:
- 支持管理 10000 条记录以内的项目数据
- 5 类数据实体: 任务、技术债、Bug、功能矩阵、测试记录
- 15+ 子命令覆盖 CRUD 操作

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 `T004-lark-project-management`,使用 T### 模块前缀(Tool/Infrastructure),符合 Claude Code skills 编码要求
- [x] **测试驱动开发**: 关键业务流程(API 调用、重试逻辑、数据转换)必须先编写测试,确保核心逻辑测试覆盖率 100%
- [x] **代码质量工程化**: 必须通过 TypeScript 严格类型检查、ESLint 检查、所有质量门禁
- [x] **Claude Code Skills 规范**:
  - 必须包含 `skill.md` 文件,含 YAML frontmatter(name, description, version)
  - 必须包含 spec.md, data-model.md, quickstart.md 三个文档
  - 必须包含 `@spec T004` 归属标识
- [x] **模块化架构**: 代码必须按功能模块组织(command handlers, lark client, retry logic, export utilities)

### 性能与标准检查：
- [x] **性能标准**: 命令响应 <2秒, 查询 500+ 记录 <3秒, 导出数据 <10秒
- [x] **安全标准**:
  - 飞书 API Token 通过环境变量或配置文件管理,不得硬编码
  - 用户输入必须验证,防止注入攻击
- [x] **错误处理标准**: API 调用失败采用指数退避重试(3次,间隔 1s/2s/4s),记录详细日志

### 不适用的检查项（N/A for Claude Code Skill）：
- **组件化架构** (N/A) - CLI 工具不涉及 UI 组件
- **前端技术栈分层** (N/A) - 非前端项目
- **数据驱动状态管理** (N/A) - CLI 工具无状态管理需求
- **后端技术栈约束** (N/A) - 使用飞书 MCP 服务,不涉及自建后端
- **可访问性标准** (N/A) - CLI 工具无 UI 可访问性要求

## Project Structure

### Documentation (this feature)

```text
specs/T004-lark-project-management/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output - Lark API contract definitions
│   └── lark-mcp-api.md  # 飞书 MCP API 接口定义
├── checklists/          # Quality checklists
│   └── requirements.md  # Requirements checklist
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (Claude Code Skill)

```text
.claude/skills/lark-pm/
├── skill.md                    # Skill definition (YAML frontmatter + documentation)
├── index.ts                    # Main entry point, skill registration
├── src/
│   ├── commands/               # Command handlers (扁平化结构)
│   │   ├── task-create.ts     # /lark-pm task-create
│   │   ├── task-list.ts       # /lark-pm task-list
│   │   ├── task-update.ts     # /lark-pm task-update
│   │   ├── bug-create.ts      # /lark-pm bug-create
│   │   ├── bug-list.ts        # /lark-pm bug-list
│   │   ├── debt-create.ts     # /lark-pm debt-create
│   │   ├── feature-create.ts  # /lark-pm feature-create
│   │   ├── test-create.ts     # /lark-pm test-create
│   │   └── export.ts          # /lark-pm export
│   ├── lark/                   # Lark MCP client
│   │   ├── client.ts          # 飞书 API 客户端封装
│   │   ├── base-app.ts        # Base App 管理
│   │   ├── table.ts           # 数据表操作
│   │   ├── record.ts          # 记录 CRUD
│   │   └── notification.ts    # 通知发送
│   ├── models/                 # Data models (TypeScript interfaces)
│   │   ├── task.ts            # Task 实体
│   │   ├── debt.ts            # TechnicalDebt 实体
│   │   ├── bug.ts             # Bug 实体
│   │   ├── feature.ts         # FeatureModule 实体
│   │   └── test-record.ts     # TestRecord 实体
│   ├── utils/                  # Utility functions
│   │   ├── retry.ts           # 指数退避重试工具
│   │   ├── logger.ts          # 日志工具
│   │   ├── validator.ts       # 数据验证
│   │   └── export.ts          # Excel/CSV 导出
│   ├── config/                 # Configuration
│   │   └── lark-config.ts     # 飞书配置(token, app_id 等)
│   └── types/                  # TypeScript type definitions
│       └── lark-api.ts        # 飞书 API 类型定义
├── tests/                      # Test files
│   ├── commands/              # Command tests
│   ├── lark/                  # Lark client tests
│   ├── utils/                 # Utility tests
│   └── fixtures/              # Test data
├── assets/                     # Static assets
│   └── templates/             # 模板文件(如 Excel 模板)
└── references/                 # Reference documentation
    └── lark-mcp-api.md        # 飞书 MCP API 参考
```

**Structure Decision**: Claude Code skill 采用模块化架构,命令处理器扁平化组织(符合子命令结构),飞书 MCP 客户端独立封装,工具函数模块化,完整的类型定义和测试覆盖。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - All constitution checks passed. No violations to justify.

---

## Phase 0: Research (COMPLETED ✅)

**Output**: [research.md](./research.md)

**Key Decisions**:
- **API 调用方式**: 使用 `@larksuiteoapi/node-sdk` 代替 execSync
- **认证方式**: User Access Token (用户身份)
- **命令结构**: 扁平化子命令 (`/lark-pm task-create`)
- **CLI 参数解析**: commander
- **数据验证**: Zod
- **重试策略**: 指数退避 (1s, 2s, 4s)
- **冲突处理**: Last Write Wins
- **数据组织**: 单 Base App + 5 表
- **Excel 导出**: xlsx
- **日志记录**: pino

---

## Phase 1: Design (COMPLETED ✅)

**Outputs**:
- [data-model.md](./data-model.md) - 5 个实体的完整字段定义、TypeScript 类型、Zod schema
- [contracts/lark-mcp-api.md](./contracts/lark-mcp-api.md) - 飞书 MCP API 契约文档
- [quickstart.md](./quickstart.md) - 快速上手指南

**Data Model Summary**:
- **Task**: 12 字段 (任务管理)
- **TechnicalDebt**: 10 字段 (技术债)
- **Bug**: 11 字段 (缺陷管理)
- **FeatureModule**: 9 字段 (功能矩阵)
- **TestRecord**: 10 字段 (测试记录)

**API Contract Summary**:
- Base App 管理: 创建、列出
- 数据表管理: 创建、列出、列出字段
- 记录 CRUD: 创建、查询、更新、删除、批量创建
- 错误处理: 重试策略、错误码映射
- 性能优化: 批量操作、字段缓存、分页查询

---

## Phase 2: Implementation

**Next Step**: 运行 `/speckit.tasks` 生成任务分解文档 (tasks.md)

**Pre-requisites**:
- ✅ Phase 0 research completed
- ✅ Phase 1 design artifacts completed
- ⏸️ Pending: Update agent context (run update-agent-context.sh)
