---
name: lark-pm
description: Lark MCP project management tool for Cinema Business Center Platform. Manage tasks, technical debt, bugs, features, and test records through Feishu/Lark Base. Supports CRUD operations, filtering, data export (Excel/CSV), and project statistics. Trigger keywords lark pm, project management, task tracking, bug tracking, technical debt, 飞书项目管理, 任务跟踪, Bug管理, 技术债.
version: 1.0.0
---

# lark-pm

**@spec T004-lark-project-management**

Lark MCP 项目管理工具 - 通过飞书多维表格管理项目任务、技术债、Bug、功能矩阵和测试记录

## Overview

`lark-pm` is a Claude Code skill that integrates with Lark (Feishu) Base to provide comprehensive project management capabilities. All data is stored in a single Lark Base App with 5 separate tables, enabling real-time collaboration and powerful filtering.

## Features

- **Task Management** (任务跟踪): Create, update, track work tasks with priorities, status, assignees, and deadlines
- **Technical Debt** (技术债记录): Record and manage technical debt with severity levels and resolution tracking
- **Bug Tracking** (Bug管理): Report, assign, and resolve bugs with reproduction steps and status flow
- **Feature Matrix** (功能矩阵): Maintain product feature roadmap with module organization
- **Test Records** (测试记录): Track test execution, coverage, and results

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
- `init` - Create Base App and all 5 tables

### Task Management
- `task-create` - Create new task
- `task-list` - List tasks with filtering
- `task-update` - Update task status/progress
- `task-delete` - Delete task

### Technical Debt
- `debt-create` - Record technical debt
- `debt-list` - List technical debt
- `debt-update` - Update debt status

### Bug Tracking
- `bug-create` - Report new bug
- `bug-list` - List bugs with filtering
- `bug-update` - Update bug status
- `bug-stats` - View bug statistics

### Feature Matrix
- `feature-create` - Add feature module
- `feature-list` - List features
- `feature-update` - Update feature status

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

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

## License

MIT
