---
description: Lark MCP 项目管理工具 - 通过 /lark-pm 命令管理飞书多维表格中的任务、技术债、Bug、功能和测试记录
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [命令类型，如"task list"、"debt create"、"bug export"、"status"、"help"]
---

你是 Lark 项目管理专家。使用 lark-pm CLI 工具来管理飞书多维表格中的项目数据。

用户请求: $ARGUMENTS

## 执行指南

### 1. 工作目录

所有命令必须在 lark-pm skill 目录下执行：

```bash
cd /Users/randy/ycj_tools_box/cursor/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm
```

### 2. 命令结构

所有命令遵循以下格式：

```bash
node dist/index.js <entity> <action> [options]
```

| Entity | 说明 | 已实现 |
|--------|------|--------|
| task | 任务管理 | ✅ |
| debt | 技术债管理 | ✅ |
| bug | Bug 管理 | ✅ |
| feature | 功能矩阵 | ⏳ |
| test | 测试记录 | ⏳ |

| Action | 说明 | 适用实体 |
|--------|------|---------|
| list | 列出记录 | task, debt, bug, feature, test |
| create | 创建记录 | task, debt, bug, feature, test |
| update | 更新记录 | task, debt, bug, feature, test |
| delete | 删除记录（软删除） | task, debt, bug, feature, test |
| export | 导出到 Excel/CSV | task, debt, bug, feature, test |

### 3. 意图识别

首先分析用户输入，确定操作类型：

| 意图 | 关键词/命令 | 执行方式 |
|-----|-----------|---------|
| **帮助** | help, 帮助, ? | 显示可用命令和选项 |
| **状态查询** | status, 状态, 当前状态 | 显示项目统计信息 |
| **任务操作** | task, 任务, 查看任务, 创建任务 | 执行任务相关命令 |
| **技术债操作** | debt, 技术债, 查看债务 | 执行技术债相关命令 |
| **Bug 操作** | bug, 缺陷, 查看bug | 执行 Bug 相关命令 |
| **导出数据** | export, 导出, 下载 | 导出数据到文件 |
| **自然语言** | 列出所有任务, 创建一个高优先级任务... | 解析意图后执行 |

### 4. 执行流程

#### 4.1 帮助命令 (`/lark-pm help` 或 `/lark-pm`)

显示完整的命令使用指南：

```
📋 Lark PM 项目管理工具

可用命令:
  /lark-pm status              查看项目统计信息
  /lark-pm task <action>       任务管理
  /lark-pm debt <action>       技术债管理
  /lark-pm bug <action>        Bug 管理
  /lark-pm help                显示此帮助

实体操作:
  list          列出记录（支持筛选）
  create        创建新记录
  update        更新现有记录
  delete        删除记录（软删除）
  export        导出到 Excel/CSV

示例:
  /lark-pm task list --status "🚀 进行中"
  /lark-pm debt create --title "优化数据库" --severity "🔴 严重"
  /lark-pm bug export --format excel --output ~/bugs.xlsx
  /lark-pm status

字段枚举值:
  状态: 📝 待办 | 🚀 进行中 | ✅ 已完成 | ❌ 已取消
  优先级/严重程度: 🔴 高/严重 | 🟡 中 | 🟢 低/轻微

飞书多维表格: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb
```

#### 4.2 状态查询 (`/lark-pm status`)

**执行步骤**:

1. 切换到 lark-pm 目录
2. 执行以下命令获取统计信息：
   ```bash
   node dist/index.js task list
   node dist/index.js debt list
   node dist/index.js bug list
   ```
3. 解析输出，统计各实体的数量和状态分布
4. 显示汇总报告

**输出格式**:

```
📊 Lark PM 项目状态

飞书 Base App: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb

任务管理:
  总计: 5 个任务
  📝 待办: 2 个
  🚀 进行中: 2 个
  ✅ 已完成: 1 个
  🔴 高优先级: 2 个

技术债管理:
  总计: 3 个技术债
  📝 未处理: 1 个
  🚀 处理中: 1 个
  ❌ 已搁置: 1 个
  🔴 严重: 2 个

Bug 管理:
  总计: 4 个 Bug
  📝 待修复: 2 个
  🚀 修复中: 1 个
  ✅ 已修复: 1 个
  🔴 严重: 1 个

最近更新: 2025-12-31

下一步建议:
- 处理 2 个高优先级任务
- 解决 2 个严重技术债
- 修复 2 个待修复 Bug
```

#### 4.3 任务操作 (`/lark-pm task <action>`)

**4.3.1 列出任务** (`task list`)

**命令格式**:
```bash
node dist/index.js task list [options]
```

**可用选项**:
- `--status <status>`: 按状态筛选（📝 待办 | 🚀 进行中 | ✅ 已完成 | ❌ 已取消）
- `--priority <priority>`: 按优先级筛选（🔴 高 | 🟡 中 | 🟢 低）
- `--spec-id <specId>`: 按规格 ID 筛选（如 S017, P001）
- `--assignee <assignee>`: 按负责人筛选
- `--tags <tags...>`: 按标签筛选（Frontend Backend Test Docs Design Infra）
- `--limit <number>`: 限制返回数量

**示例**:
```bash
# 查看所有任务
/lark-pm task list

# 查看进行中的高优先级任务
/lark-pm task list --status "🚀 进行中" --priority "🔴 高"

# 查看特定规格的任务
/lark-pm task list --spec-id "S017"
```

**4.3.2 创建任务** (`task create`)

**命令格式**:
```bash
node dist/index.js task create --title <title> [options]
```

**必填选项**:
- `--title <title>`: 任务标题

**可选选项**:
- `--priority <priority>`: 优先级（默认：🟡 中）
- `--status <status>`: 状态（默认：📝 待办）
- `--spec-id <specId>`: 规格 ID（格式：X###，如 S017）
- `--assignees <assignees...>`: 负责人列表
- `--due-date <timestamp>`: 截止日期（Unix 时间戳，毫秒）
- `--tags <tags...>`: 标签列表
- `--progress <number>`: 进度（0-100）
- `--estimated-hours <number>`: 预计工时
- `--notes <notes>`: 备注

**示例**:
```bash
/lark-pm task create \
  --title "实现用户登录功能" \
  --priority "🔴 高" \
  --status "📝 待办" \
  --spec-id "U001" \
  --tags Frontend Backend \
  --estimated-hours 16 \
  --notes "需要支持邮箱和手机号登录"
```

**4.3.3 更新任务** (`task update`)

**命令格式**:
```bash
node dist/index.js task update --task-id <taskId> [options]
```

**必填选项**:
- `--task-id <taskId>`: 任务 ID（从 list 命令获取）

**可选选项**: 同 create 命令，额外支持：
- `--actual-hours <number>`: 实际工时

**示例**:
```bash
/lark-pm task update \
  --task-id recv6VDTQts1Xi \
  --status "✅ 已完成" \
  --progress 100 \
  --actual-hours 14
```

**4.3.4 删除任务** (`task delete`)

**命令格式**:
```bash
node dist/index.js task delete --task-id <taskId> --confirm
```

**说明**: 删除操作会将任务状态设置为 "❌ 已取消"（软删除）

**示例**:
```bash
/lark-pm task delete --task-id recv6VDTQts1Xi --confirm
```

**4.3.5 导出任务** (`task export`)

**命令格式**:
```bash
node dist/index.js task export --format <format> --output <path> [filters]
```

**必填选项**:
- `--format <format>`: 导出格式（excel | csv）
- `--output <path>`: 输出文件路径

**可选筛选**: 同 list 命令的筛选选项

**示例**:
```bash
# 导出所有任务到 Excel
/lark-pm task export --format excel --output ~/Desktop/tasks.xlsx

# 只导出进行中的任务到 CSV
/lark-pm task export \
  --format csv \
  --output ~/tasks_in_progress.csv \
  --status "🚀 进行中"
```

#### 4.4 技术债操作 (`/lark-pm debt <action>`)

**4.4.1 列出技术债** (`debt list`)

**命令格式**:
```bash
node dist/index.js debt list [options]
```

**可用选项**:
- `--status <status>`: 按状态筛选（📝 未处理 | 🚀 处理中 | ✅ 已解决 | ❌ 已搁置）
- `--severity <severity>`: 按严重程度筛选（🔴 严重 | 🟡 中 | 🟢 轻微）
- `--spec-id <specId>`: 按规格 ID 筛选
- `--assignee <assignee>`: 按负责人筛选
- `--limit <number>`: 限制返回数量

**示例**:
```bash
# 查看所有严重技术债
/lark-pm debt list --severity "🔴 严重"
```

**4.4.2 创建技术债** (`debt create`)

**命令格式**:
```bash
node dist/index.js debt create --title <title> [options]
```

**必填选项**:
- `--title <title>`: 技术债标题

**可选选项**:
- `--severity <severity>`: 严重程度（默认：🟡 中）
- `--status <status>`: 状态（默认：📝 未处理）
- `--impact <impact>`: 影响范围
- `--spec-id <specId>`: 规格 ID
- `--estimated-effort <number>`: 预估工时
- `--assignee <assignee>`: 负责人
- `--notes <notes>`: 备注

**示例**:
```bash
/lark-pm debt create \
  --title "重构数据库连接池" \
  --severity "🔴 严重" \
  --impact "影响所有数据库查询性能" \
  --spec-id "P001" \
  --estimated-effort 24
```

**4.4.3 更新/删除/导出**: 同任务操作，替换 `task` 为 `debt`，`task-id` 为 `debt-id`

#### 4.5 Bug 操作 (`/lark-pm bug <action>`)

**4.5.1 列出 Bug** (`bug list`)

**可用选项**:
- `--status <status>`: 按状态筛选（📝 待修复 | 🚀 修复中 | ✅ 已修复 | ❌ 不修复）
- `--severity <severity>`: 按严重程度筛选（🔴 严重 | 🟡 中 | 🟢 轻微）
- `--spec-id <specId>`: 按规格 ID 筛选
- `--assignee <assignee>`: 按负责人筛选
- `--limit <number>`: 限制返回数量

**4.5.2 创建 Bug** (`bug create`)

**必填选项**:
- `--title <title>`: Bug 标题

**可选选项**:
- `--severity <severity>`: 严重程度（默认：🟡 中）
- `--status <status>`: 状态（默认：📝 待修复）
- `--reporter <reporter>`: 报告人
- `--assignee <assignee>`: 负责人
- `--spec-id <specId>`: 规格 ID
- `--found-date <timestamp>`: 发现日期（Unix 时间戳）
- `--repro-steps <steps>`: 复现步骤
- `--environment <env>`: 环境信息
- `--notes <notes>`: 备注

**示例**:
```bash
/lark-pm bug create \
  --title "登录按钮失效" \
  --severity "🔴 严重" \
  --spec-id "U001" \
  --repro-steps "1. 打开登录页 2. 点击登录按钮 3. 按钮无响应" \
  --environment "Chrome 120, MacOS"
```

**4.5.3 更新/删除/导出**: 同任务操作，替换 `task` 为 `bug`，`task-id` 为 `bug-id`

### 5. 自然语言意图识别

当用户使用自然语言时，进行意图解析：

**识别规则**:

1. **实体识别**: 任务 | 技术债 | Bug | 功能 | 测试
2. **动作识别**: 列出/查看 | 创建/新建 | 更新/修改 | 删除 | 导出
3. **条件提取**: 状态、优先级、严重程度、规格 ID

**示例**:

| 用户输入 | 解析后的命令 |
|---------|-------------|
| "列出所有任务" | `task list` |
| "创建一个高优先级任务" | `task create --priority "🔴 高"` (然后引导用户输入标题) |
| "查看进行中的 Bug" | `bug list --status "🚀 修复中"` |
| "导出严重技术债到 Excel" | `debt export --severity "🔴 严重" --format excel` (然后询问输出路径) |
| "更新任务 recv6VDTQts1Xi 为已完成" | `task update --task-id recv6VDTQts1Xi --status "✅ 已完成"` |

**缺失参数处理**:

如果必填参数缺失，使用交互式引导：

```
✏️ 请提供以下信息来创建任务：

必填:
- 标题: [等待用户输入]

可选（直接回车跳过）:
- 优先级 (🔴 高/🟡 中/🟢 低): [默认：🟡 中]
- 规格 ID (如 S017): [可选]
- 预计工时: [可选]
```

### 6. 错误处理

| 错误场景 | 处理方式 |
|---------|---------|
| 配置文件缺失 | 提示运行 `node dist/index.js init` 初始化 |
| Token 过期 | 提示运行 `./scripts/get-token.sh` 更新 Token |
| 无效的字段值 | 显示可用枚举值列表 |
| 网络错误 | 显示错误详情并建议重试 |
| 记录不存在 | 提示先运行 list 命令查看可用 ID |

### 7. 特殊命令

#### 7.1 初始化 (`/lark-pm init`)

**说明**: 首次使用时初始化飞书 Base App 和数据表

**执行**:
```bash
cd /Users/randy/ycj_tools_box/cursor/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm
node dist/index.js init
```

**输出**: 创建 5 张表（任务、技术债、Bug、功能、测试记录）并保存配置

#### 7.2 刷新 Token (`/lark-pm refresh-token`)

**说明**: Token 过期时手动刷新

**执行**:
```bash
cd /Users/randy/ycj_tools_box/cursor/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm
./scripts/get-token.sh
```

### 8. 飞书多维表格访问

直接在浏览器打开：
https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb

可在飞书中：
- 📊 可视化查看数据
- 📝 手动编辑记录
- 📈 创建自定义视图
- 🔔 设置提醒

### 9. 注意事项

**Token 有效期**: Tenant Access Token 有效期 2 小时，过期后需重新获取

**软删除策略**: delete 命令不会真正删除记录，而是设置状态为取消/搁置/不修复

**人员字段限制**: 目前 assignee/reporter 字段需要用户 ID，暂不支持文本输入（已记录为 TODO）

### 10. 快捷方式

为常用命令创建别名（可选）:

```bash
alias lpm='cd /Users/randy/ycj_tools_box/cursor/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm && node dist/index.js'
alias lpm-task='lpm task list'
alias lpm-debt='lpm debt list'
alias lpm-bug='lpm bug list'
```

使用示例:
```bash
lpm-task --status "🚀 进行中"
lpm task create --title "新任务"
```
