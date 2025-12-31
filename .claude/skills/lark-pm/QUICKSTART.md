# Lark PM Quick Start Guide

**@spec T004-lark-project-management**

This guide helps you get started with the `lark-pm` CLI tool for managing your project tasks, technical debt, bugs, features, and test records using Lark (Feishu) Base.

## Prerequisites

1. **Lark (Feishu) Account**: You need a Lark/Feishu account with access to create or manage Base Apps
2. **Base App**: Create a Base App in Lark or have access to an existing one
3. **Lark Application**: Create a Lark application and get the credentials
4. **Node.js**: Version 18 or higher

## Installation

```bash
# From the project root
cd .claude/skills/lark-pm

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### 1. Set up environment variables

Create a `.env` file in `.claude/skills/lark-pm/`:

```bash
# Lark App Credentials
LARK_APP_ID=your_app_id_here
LARK_APP_SECRET=your_app_secret_here

# Optional: User Access Token (if using user-level permissions)
LARK_USER_ACCESS_TOKEN=your_user_access_token_here
```

**How to get these credentials:**

1. Go to [Lark Open Platform](https://open.feishu.cn/app)
2. Create a new application or select an existing one
3. Copy the App ID and App Secret
4. Grant the app permissions:
   - `bitable:app` - Read and write Base Apps
   - `bitable:table` - Read and write tables
   - `bitable:record` - Read and write records

### 2. Initialize the Base App

The init command will guide you through setting up your Base App:

```bash
npm run dev init
```

**What happens during init:**

1. **Provide Base App Token**: You'll be prompted to enter your existing Base App Token
   - Find it in the Base App URL: `https://your-domain.feishu.cn/base/YOUR_BASE_APP_TOKEN`
   - The token will be validated with 3 retry attempts

2. **Handle existing tables**: If tables with the same names exist, you'll choose:
   - **Skip existing tables**: Keep existing tables and only create missing ones
   - **Overwrite tables**: Manually delete conflicting tables in Feishu UI first
   - **Terminate**: Cancel the initialization

3. **Configuration saved**: Your Base App Token and table IDs are saved to `config.json`

**Example init session:**

```
📊 初始化 Lark 项目管理系统

请输入已存在的 Lark Base App Token (从飞书多维表格 URL 或配置中获取):
Base App Token: bascnAbCdEfGhIjKlMnOpQrS

✓ Token 验证成功
✓ 发现 0 个现有数据表
✓ 创建了 5 个数据表
✓ 配置已保存到 config.json

✅ 初始化完成!

Base App Token: bascnAbCdEfGhIjKlMnOpQrS

数据表:
  - tasks: tblAbCdEfGhIjKlMn
  - technicalDebt: tblBcDeFgHiJkLmNo
  - bugs: tblCdEfGhIjKlMnOp
  - features: tblDeFgHiJkLmNoPq
  - testRecords: tblEfGhIjKlMnOpQr
```

## Basic Usage

### Task Management

```bash
# Create a task
npm run dev task create \
  --title "Implement user authentication" \
  --priority high \
  --spec-id I003 \
  --status todo

# List tasks (with pagination)
npm run dev task list --status todo --page 1 --page-size 20

# Update task status
npm run dev task update \
  --task-id recXXXXXXXXXXXX \
  --status in-progress \
  --progress 50

# Delete task (sets to cancelled)
npm run dev task delete --task-id recXXXXXXXXXXXX --confirm
```

### Technical Debt Management

```bash
# Create technical debt
npm run dev debt create \
  --title "Refactor authentication module" \
  --severity critical \
  --impact "All user login flows" \
  --estimated-effort 16

# List technical debt (with pagination)
npm run dev debt list --severity critical --page 1

# Update debt status
npm run dev debt update \
  --debt-id recXXXXXXXXXXXX \
  --status in-progress

# Export to Excel
npm run dev debt export \
  --format excel \
  --output ./technical-debt.xlsx
```

### Bug Tracking

```bash
# Create bug
npm run dev bug create \
  --title "Login button not responsive" \
  --severity high \
  --reporter "user@example.com" \
  --environment "Chrome 120, macOS"

# List bugs (with pagination)
npm run dev bug list --severity high --page 1 --page-size 20

# Update bug status
npm run dev bug update \
  --bug-id recXXXXXXXXXXXX \
  --status in-progress \
  --assignee "dev@example.com"

# Export bugs
npm run dev bug export \
  --format csv \
  --output ./bugs.csv \
  --status open
```

## Pagination

All `list` commands support pagination (per clarification Q5):

- **Default page size**: 20 records
- **Maximum page size**: 100 records
- **Parameters**:
  - `--page <number>`: Page number (starts from 1)
  - `--page-size <number>`: Records per page (max 100)

**Example output:**

```
找到 156 个任务

ID                  标题                          状态         优先级      规格ID    
────────────────────────────────────────────────────────────────────────────────────
recABC123456789    Implement login              todo         high        I003      
recDEF987654321    Fix navigation bug           in-progress  medium      I005      
...

显示第 1-20 条，共 156 条记录 | 第 1/8 页
使用 --page 2 查看下一页
使用 --page-size <数量> 调整每页显示数量 (最大100)
```

## Permission Errors

If you encounter a permission error (403), the system will provide helpful guidance:

```
权限不足：无法列出数据表。请检查以下事项：
1. 确认 Base App Token 是否正确
2. 确认您的飞书应用是否有访问该 Base 的权限
3. 在飞书 Base 中，进入「设置」->「权限管理」，添加应用的访问权限
4. 如果问题持续，请联系 Base 管理员授予权限
```

**How to fix permission errors:**

1. **Check Base App Token**: Ensure the token in `config.json` is correct
2. **Grant app permissions**: In Lark Base, go to Settings → Permission Management → Add your app
3. **Contact admin**: If you don't have permission, ask the Base owner to grant access

## Export Data

Export your project data to Excel or CSV:

```bash
# Export all tasks to Excel
npm run dev task export \
  --format excel \
  --output ./project-tasks.xlsx

# Export filtered bugs to CSV
npm run dev bug export \
  --format csv \
  --output ./critical-bugs.csv \
  --severity critical
```

## Common Workflows

### Daily Standup Preparation

```bash
# Check in-progress tasks
npm run dev task list --status in-progress

# Check high-priority bugs
npm run dev bug list --severity high --status open

# Check critical technical debt
npm run dev debt list --severity critical --status identified
```

### Sprint Planning

```bash
# Export all pending tasks
npm run dev task export \
  --format excel \
  --output ./sprint-backlog.xlsx \
  --status todo

# Create sprint tasks
npm run dev task create \
  --title "Sprint 5 Planning" \
  --priority high \
  --spec-id S017
```

### Weekly Reports

```bash
# Export completed tasks
npm run dev task export \
  --format excel \
  --output ./weekly-completed.xlsx \
  --status done

# Export resolved technical debt
npm run dev debt export \
  --format csv \
  --output ./debt-resolved.csv \
  --status resolved
```

## Troubleshooting

### Issue: "未找到配置，请先运行 init 命令"

**Solution**: Run `npm run dev init` to initialize the Base App and create the configuration.

### Issue: Token validation fails

**Possible causes:**
- Invalid Base App Token
- Network issues
- App doesn't have permission to access the Base

**Solution**:
1. Verify the Base App Token from the Feishu URL
2. Check your network connection
3. Ensure the app has the correct permissions

### Issue: Tables already exist during init

**Solution**: Choose one of the following:
- **Skip existing tables**: Recommended if you want to preserve existing data
- **Overwrite tables**: Manually delete the conflicting tables in Feishu UI first, then rerun init
- **Terminate**: Cancel and check your Base App manually

## Next Steps

- Read the full [specification](../../../specs/T004-lark-project-management/spec.md)
- Check the [data model](../../../specs/T004-lark-project-management/data-model.md)
- Explore [advanced features](../../../specs/T004-lark-project-management/plan.md)

## Support

For issues and questions:
- Check the [FAQ](../../../specs/T004-lark-project-management/spec.md#faq)
- Review the [troubleshooting guide](../../../specs/T004-lark-project-management/spec.md#troubleshooting)
- Open an issue in the project repository

---

**Last Updated**: 2025-12-31  
**Version**: 1.0.0  
**Based on clarifications**: Q1-Q5 (init flow, pagination, permission handling)
