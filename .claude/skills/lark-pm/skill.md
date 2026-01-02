---
name: lark-pm
description: Lark MCP project management tool for Cinema Business Center Platform. Manage tasks, technical debt, bugs, features, test records, and backlog through Feishu/Lark Base. Supports CRUD operations, filtering, data export (Excel/CSV), Sprint management, and project statistics. Trigger keywords lark pm, project management, task tracking, bug tracking, technical debt, backlog, sprint management, 飞书项目管理, 任务跟踪, Bug管理, 技术债, 待办事项, Sprint管理.
version: 1.2.0
---

# lark-pm

**@spec T004-lark-project-management**

Lark MCP 项目管理工具 - 通过飞书多维表格管理项目任务、技术债、Bug、功能矩阵、测试记录和 Backlog

## Overview

`lark-pm` is a Claude Code skill that integrates with Lark (Feishu) Base to provide comprehensive project management capabilities. All data is stored in a single Lark Base App with 6 separate tables, enabling real-time collaboration and powerful filtering.

## Features

- **Task Management** (任务跟踪): Create, update, track work tasks with priorities, status, assignees, and deadlines
- **Sprint Management** (Sprint管理): Batch import tasks, organize by Sprint tags, track Sprint progress, and manage Sprint lifecycle
- **Technical Debt** (技术债记录): Record and manage technical debt with severity levels and resolution tracking
- **Bug Tracking** (Bug管理): Report, assign, and resolve bugs with reproduction steps and status flow
- **Feature Matrix** (功能矩阵): Maintain product feature roadmap with module organization
- **Test Records** (测试记录): Track test execution, coverage, and results
- **Backlog Management** (Backlog管理): Manage product backlog with types, priorities, and approval workflow

## Installation

1. Copy `.env.example` to `.env` and configure your Lark credentials
2. Run `npm install` to install dependencies
3. Initialize the Base App: `/lark-pm init`

## Quick Start

```bash
# Initialize Base App and tables
/lark-pm init

# Create a task
/lark-pm task-create \
  --title "Implement inventory query" \
  --priority high \
  --spec I003 \
  --assignee ou_xxx

# List tasks
/lark-pm task-list --status todo

# Update task status
/lark-pm task-update recxxx --status in-progress --progress 50

# Export data
/lark-pm export --format excel --output project-data.xlsx
```

## Commands

### Initialization
- `init` - Create Base App and all 6 tables

### Task Management
- `task create` - Create new task
- `task list` - List tasks with filtering
- `task update` - Update task status/progress
- `task delete` - Delete task
- `task export` - Export tasks to Excel/CSV

### Sprint Management (NEW in v1.2.0)
- `sprint import <spec-id>` - Batch import tasks from tasks.md to Lark Base
- `sprint list <sprint-number>` - List tasks in specific Sprint
- `sprint stats` - View statistics for all Sprints
- `sprint progress <sprint-number>` - View Sprint progress (completion rate)
- `sprint start <sprint-number>` - Mark all Sprint tasks as "in progress"
- `sprint complete <sprint-number>` - Mark all Sprint tasks as "completed"
- `sprint export <sprint-number>` - Export Sprint tasks to Excel

### Technical Debt
- `debt create` - Record technical debt
- `debt list` - List technical debt
- `debt update` - Update debt status
- `debt delete` - Delete technical debt
- `debt export` - Export technical debt to Excel/CSV

### Bug Tracking
- `bug create` - Report new bug
- `bug list` - List bugs with filtering
- `bug update` - Update bug status
- `bug delete` - Delete bug
- `bug export` - Export bugs to Excel/CSV

### Backlog Management (Product Backlog / 产品待办列表)
- `backlog create` - Create new backlog item
- `backlog smart-create` - **智能创建 Product Backlog（自动识别技术债→Spike类型）**
- `backlog list` - List backlog items with filtering
- `backlog update` - Update backlog status/priority
- `backlog delete` - Delete backlog item
- `backlog export` - Export backlog to Excel/CSV

**Backlog Types** (Spec 管理层级):
- **Epic**: Large specs / Feature sets (大型规格 / 功能集)
  - 用途：管理完整的 spec (如 T004-lark-project-management)
  - 关键词：spec, 规格, 功能集, 大型功能, 史诗, epic
- **User Story**: User stories / Plans / Tasks (用户故事 / 计划 / 任务)
  - 用途：spec 中的功能点、实施计划、开发任务
  - 通过**标签**区分子类型：
    - `Plan` - 实施计划
    - `Task` - 开发任务
    - 无标签 - 纯用户故事
  - 关键词：plan/计划/规划, task/任务/待办
- **Spike**: Technical research / Technical Debt (技术调研 / 技术债)
  - 用途：技术债务、性能优化、架构改进
  - 关键词：技术债, 需要解决, 缺少, 不支持

### Feature Matrix
- `feature create` - Add feature module
- `feature list` - List features
- `feature update` - Update feature status

### Test Records
- `test-create` - Create test record
- `test-list` - List test records
- `test-update` - Update test results
- `test-coverage` - View coverage report

### Data Export & Stats
- `export` - Export data (Excel/CSV/JSON)
- `stats` - View project statistics
- `status` - Check Base App health

### Configuration
- `config show` - Show current configuration
- `config set` - Update configuration
- `config reset` - Reset configuration

## Data Model

All entities stored in Lark Base tables:

- **Tasks**: Title, priority, status, assignee, spec ID, progress, due date
- **TechnicalDebt**: Title, severity, impact, status, effort estimation
- **Bugs**: Title, severity, status, reproduction steps, reporter, assignee
- **Features**: Name, module, status, priority, owner, release date
- **TestRecords**: Test name, type, status, coverage, execution results

## Architecture

- **Flat command structure**: All commands at `/lark-pm <command>` level
- **Lark MCP integration**: Direct API calls to Feishu Base
- **Retry strategy**: Exponential backoff (1s, 2s, 4s) for API failures
- **Conflict resolution**: Last Write Wins (LWW)
- **Error handling**: Structured logging with pino

## Requirements

- Node.js 18+
- Lark (Feishu) account with Base permissions
- Lark App credentials (App ID, App Secret, User Access Token)

## Documentation

- [Product Backlog 管理指南](./PRODUCT_BACKLOG_GUIDE.md) - **推荐阅读：如何用 Product Backlog 管理 spec、plan、task**
- [Specification](../../../specs/T004-lark-project-management/spec.md)
- [Quick Start Guide](../../../specs/T004-lark-project-management/quickstart.md)
- [Data Model](../../../specs/T004-lark-project-management/data-model.md)
- [API Contracts](../../../specs/T004-lark-project-management/contracts/lark-mcp-api.md)

## Examples

**Create high-priority task**:
```bash
/lark-pm task-create \
  --title "Fix critical bug in checkout" \
  --priority high \
  --status todo \
  --spec O003 \
  --due-date 2025-01-15
```

**List bugs by severity**:
```bash
/lark-pm bug-list --severity critical
```

**Export all tasks**:
```bash
/lark-pm export --entity tasks --format excel
```

**View project statistics**:
```bash
/lark-pm stats --spec I003
```

**Smart create Product Backlog with natural language**:
```bash
# Epic - 管理完整的 spec
/lark-pm backlog smart-create "Spec T004: Lark 项目管理集成" --spec-id T004

# User Story (Plan) - 实施计划
/lark-pm backlog smart-create "制定 Backlog 管理的实施计划"

# User Story (Task) - 开发任务
/lark-pm backlog smart-create "实现 smart-create 命令的自然语言解析功能"

# Spike - 技术债
/lark-pm backlog smart-create "需要解决飞书MCP导入Markdown文档的能力"

# With priority and spec ID
/lark-pm backlog smart-create "紧急：修复库存同步Bug" --priority P0 --spec-id I003
```

**自动识别规则**:
- **Epic 关键词**: spec, 规格, 功能集, 大型功能, 史诗, epic
- **Plan 关键词**: plan, 计划, 规划, 实施计划, 设计方案 → User Story + `Plan` 标签
- **Task 关键词**: task, 任务, 待办, 实现, 开发, 修复 → User Story + `Task` 标签
- **Spike 关键词**: 技术债, 需要解决, 缺少, 不支持, 性能优化, 架构优化

## Sprint Management Guide

### Quick Start: O006 Example

**Batch import all tasks for O006**:
```bash
/lark-pm sprint import O006
```

This will:
1. Parse `specs/O006-miniapp-channel-order/tasks.md`
2. Import 52 tasks organized into 7 Sprints
3. Add Sprint tags (`Sprint-1` ~ `Sprint-7`) to each task
4. Set initial status to `📝 待办`

**View Sprint tasks**:
```bash
/lark-pm sprint list 1  # View Sprint 1 tasks
/lark-pm sprint stats   # View all Sprint statistics
```

**Track Sprint progress**:
```bash
/lark-pm sprint progress 2  # View Sprint 2 completion rate
```

**Manage Sprint lifecycle**:
```bash
/lark-pm sprint start 1     # Start Sprint 1 (mark all as in-progress)
/lark-pm sprint complete 1  # Complete Sprint 1 (mark all as completed)
/lark-pm sprint export 1    # Export Sprint 1 report to Excel
```

### Sprint Organization

Each Phase in `tasks.md` maps to one Sprint:

| Sprint | Phase | Tasks | Hours | Key Deliverables |
|--------|-------|-------|-------|------------------|
| Sprint-1 | Setup & Infrastructure | 4 | 1.75h | Branch, environment, config |
| Sprint-2 | Foundational | 14 | 29h | Types, styles, API, hooks, store |
| Sprint-3 | User Story 1 | 3 | 9.5h | Product menu page |
| Sprint-4 | User Story 2 | 4 | 16.5h | Product detail page |
| Sprint-5 | User Story 3 | 5 | 19h | Cart & order submission |
| Sprint-6 | User Story 4 | 5 | 17.5h | Order list & status |
| Sprint-7 | Polish & Testing | 7 | 30h | Polish, tests, docs |

### Advanced Scripts

For advanced Sprint management, use the CLI scripts:

```bash
cd .claude/skills/lark-pm

# Batch import using TypeScript
npx tsx scripts/import-o006-tasks.ts

# Sprint management shell commands
./scripts/manage-sprints.sh import
./scripts/manage-sprints.sh list 2
./scripts/manage-sprints.sh stats
./scripts/manage-sprints.sh progress 3
```

See [scripts/README.md](./scripts/README.md) for detailed documentation.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
