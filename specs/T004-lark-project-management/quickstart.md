# 快速上手指南: Lark MCP 项目管理系统

**Phase**: Phase 1 - Design
**Date**: 2025-12-31
**Spec**: [spec.md](./spec.md)

## 概述

本指南帮助您快速上手使用 `/lark-pm` Claude Code skill 管理项目任务、技术债、Bug、功能矩阵和测试记录。

## 前置条件

### 1. 环境要求

- Node.js 18+ (推荐 20+)
- Claude Code CLI (已安装)
- 飞书账号 (已开通 Base 权限)

### 2. 获取飞书认证信息

**步骤 1: 创建飞书应用**

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 登录并进入"开发者后台"
3. 点击"创建应用"
4. 填写应用信息:
   - 应用名称: `Claude Project Manager`
   - 应用描述: `项目管理工具`
5. 创建成功后,记录:
   - **App ID**: `cli_xxxxxxxxxxxxx`
   - **App Secret**: `xxxxxxxxxxxxxxxxxxxxxx`

**步骤 2: 配置应用权限**

在应用管理页面,开通以下权限:

- `bitable:app` - 多维表格应用权限
- `bitable:app:readonly` - 读取多维表格
- `bitable:app:write` - 写入多维表格
- `contact:user.id:readonly` - 读取用户 ID (用于人员字段)

**步骤 3: 获取 User Access Token**

```bash
# 方式 1: 通过飞书开放平台获取
# 1. 进入应用管理页面
# 2. 点击"获取用户访问凭证"
# 3. 复制 User Access Token

# 方式 2: 通过 OAuth 流程获取 (推荐生产环境)
# 详见: https://open.feishu.cn/document/home/user-identity-introduction
```

### 3. 配置环境变量

创建 `.env` 文件:

```bash
# .env
LARK_APP_ID=cli_xxxxxxxxxxxxx
LARK_APP_SECRET=xxxxxxxxxxxxxxxxxxxxxx
LARK_USER_ACCESS_TOKEN=u-xxxxxxxxxxxxxxxxxxxxxxxxx

# 可选配置
LARK_LOG_LEVEL=info                   # debug, info, warn, error
LARK_BASE_APP_TOKEN=                  # 如果已有 Base App,填写此项
```

**安全提示**: `.env` 文件不要提交到 Git 仓库,请添加到 `.gitignore`。

## 初始化项目

### 1. 创建 Base App

首次使用需要初始化飞书 Base App 和数据表:

```bash
/lark-pm init
```

**交互式配置**:
```
✨ 欢迎使用 Lark 项目管理工具

📋 Base App 配置
  名称: Cinema Platform 项目管理 (默认)
  文件夹: [留空则创建在根目录]
  时区: Asia/Shanghai (默认)

🚀 正在创建 Base App...
✅ Base App 创建成功!
   App Token: bascnxxxxxxxxxxxxx

📊 正在创建数据表...
  ✅ 项目任务 (table_id: tblxxx1)
  ✅ 技术债 (table_id: tblxxx2)
  ✅ Bug记录 (table_id: tblxxx3)
  ✅ 产品功能矩阵 (table_id: tblxxx4)
  ✅ 测试记录 (table_id: tblxxx5)

🎉 初始化完成!

配置信息已保存到: .claude/skills/lark-pm/config.json
您可以在飞书中打开: https://xxx.feishu.cn/base/bascnxxxxxxxxxxxxx
```

**生成的配置文件**:
```json
// .claude/skills/lark-pm/config.json
{
  "baseAppToken": "bascnxxxxxxxxxxxxx",
  "tables": {
    "tasks": "tblxxx1",
    "bugs": "tblxxx2",
    "debt": "tblxxx3",
    "features": "tblxxx4",
    "testRecords": "tblxxx5"
  },
  "createdAt": "2025-12-31T10:00:00Z"
}
```

### 2. 验证配置

```bash
/lark-pm status
```

**输出示例**:
```
📊 Lark PM 状态

Base App: bascnxxxxxxxxxxxxx
  名称: Cinema Platform 项目管理
  URL: https://xxx.feishu.cn/base/bascnxxxxxxxxxxxxx

数据表:
  ✅ 项目任务 (tblxxx1) - 0 条记录
  ✅ 技术债 (tblxxx2) - 0 条记录
  ✅ Bug记录 (tblxxx3) - 0 条记录
  ✅ 产品功能矩阵 (tblxxx4) - 0 条记录
  ✅ 测试记录 (tblxxx5) - 0 条记录

认证状态: ✅ 正常
```

## 核心功能使用

### 1. 任务管理

#### 创建任务

```bash
/lark-pm task-create \
  --title "实现库存查询功能" \
  --priority high \
  --status todo \
  --spec I003 \
  --tags Backend,Frontend \
  --assignee ou_xxx,ou_yyy \
  --due-date 2025-01-15 \
  --estimated-hours 16
```

**参数说明**:
- `--title`: 任务标题 (必需)
- `--priority`: 优先级 (high | medium | low, 默认 medium)
- `--status`: 状态 (todo | in-progress | done | cancelled, 默认 todo)
- `--spec`: 关联规格 ID (如 I003, P004)
- `--tags`: 标签 (逗号分隔: Backend, Frontend, Test, Docs, Design, Infra)
- `--assignee`: 负责人 open_id (逗号分隔,支持多人)
- `--due-date`: 截止日期 (YYYY-MM-DD)
- `--estimated-hours`: 预计工时 (小时)
- `--notes`: 备注

**输出**:
```
✅ 任务创建成功!

任务 ID: recxxx
标题: 实现库存查询功能
优先级: 🔴 高
状态: 📝 待办
关联规格: I003
负责人: @张三, @李四
截止日期: 2025-01-15
标签: Backend, Frontend
预计工时: 16 小时

在飞书中打开: https://xxx.feishu.cn/base/bascnxxx?table=tblxxx&record=recxxx
```

#### 查询任务

```bash
# 列出所有任务
/lark-pm task-list

# 按状态筛选
/lark-pm task-list --status in-progress

# 按规格筛选
/lark-pm task-list --spec I003

# 按负责人筛选
/lark-pm task-list --assignee ou_xxx

# 组合筛选
/lark-pm task-list --status todo --priority high

# 输出格式: 表格 (默认) | json | csv
/lark-pm task-list --format table
```

**输出示例**:
```
📋 任务列表 (共 3 条)

┌─────────┬──────────────────┬──────┬──────┬─────────┬──────────┬──────┐
│ ID      │ 标题             │ 状态 │ 优先 │ 负责人  │ 关联规格 │ 进度 │
├─────────┼──────────────────┼──────┼──────┼─────────┼──────────┼──────┤
│ recxxx1 │ 实现库存查询     │ 🚀   │ 🔴   │ @张三   │ I003     │ 60%  │
│ recxxx2 │ 编写测试用例     │ 📝   │ 🟡   │ @李四   │ I003     │ 0%   │
│ recxxx3 │ 代码审查         │ ✅   │ 🟢   │ @王五   │ I003     │ 100% │
└─────────┴──────────────────┴──────┴──────┴─────────┴──────────┴──────┘
```

#### 更新任务

```bash
/lark-pm task-update recxxx \
  --status in-progress \
  --progress 60 \
  --actual-hours 8.5
```

**参数说明**:
- 第一个参数: 记录 ID (recxxx)
- `--status`: 新状态
- `--progress`: 进度 (0-100)
- `--actual-hours`: 实际工时
- `--notes`: 追加备注

**输出**:
```
✅ 任务更新成功!

任务 ID: recxxx
状态: 📝 待办 → 🚀 进行中
进度: 0% → 60%
实际工时: 8.5 小时
```

#### 删除任务

```bash
/lark-pm task-delete recxxx
```

**交互确认**:
```
⚠️  确认删除任务?

任务: 实现库存查询功能
状态: 🚀 进行中
关联规格: I003

[Y/n]: y

✅ 任务已删除
```

### 2. 技术债管理

#### 创建技术债

```bash
/lark-pm debt-create \
  --title "优化数据库查询性能" \
  --severity critical \
  --impact "影响库存查询响应时间" \
  --spec I003 \
  --estimated-effort 24 \
  --assignee ou_xxx
```

**参数说明**:
- `--title`: 债务标题 (必需)
- `--severity`: 严重程度 (critical | medium | minor, 默认 medium)
- `--status`: 状态 (open | in-progress | resolved | deferred, 默认 open)
- `--impact`: 影响范围
- `--spec`: 关联规格
- `--estimated-effort`: 预计工作量 (小时)
- `--assignee`: 负责人 open_id
- `--notes`: 备注

#### 查询技术债

```bash
# 列出所有技术债
/lark-pm debt-list

# 按严重程度筛选
/lark-pm debt-list --severity critical

# 按状态筛选
/lark-pm debt-list --status open
```

#### 更新技术债

```bash
/lark-pm debt-update recxxx \
  --status resolved \
  --notes "已优化索引,查询时间从 800ms 降至 120ms"
```

### 3. Bug 管理

#### 创建 Bug

```bash
/lark-pm bug-create \
  --title "库存台账导出失败" \
  --severity critical \
  --status open \
  --spec I004 \
  --reporter ou_xxx \
  --assignee ou_yyy \
  --repro-steps "1. 进入库存台账\n2. 点击导出\n3. 报错: undefined" \
  --environment "Chrome 120, macOS 14.2"
```

**参数说明**:
- `--title`: Bug 标题 (必需)
- `--severity`: 严重程度 (critical | medium | minor)
- `--status`: 状态 (open | in-progress | fixed | wontfix)
- `--spec`: 关联规格
- `--reporter`: 报告人 open_id
- `--assignee`: 负责人 open_id
- `--repro-steps`: 复现步骤 (支持 \n 换行)
- `--environment`: 环境信息
- `--notes`: 备注

#### 查询 Bug

```bash
# 列出所有 Bug
/lark-pm bug-list

# 按严重程度筛选
/lark-pm bug-list --severity critical

# 按状态筛选
/lark-pm bug-list --status open

# 按规格筛选
/lark-pm bug-list --spec I004
```

#### 更新 Bug

```bash
/lark-pm bug-update recxxx \
  --status fixed \
  --notes "已修复: 添加了 null 检查"
```

### 4. 功能模块管理

#### 创建功能模块

```bash
/lark-pm feature-create \
  --name "库存实时查询" \
  --module "库存管理" \
  --status planning \
  --priority P0 \
  --spec I003 \
  --owner ou_xxx \
  --planned-release 2025-02-01
```

**参数说明**:
- `--name`: 功能名称 (必需)
- `--module`: 所属模块 (库存管理 | 商品管理 | 订单管理 | 门店管理 | 用户管理 | 报表分析 | 系统管理 | 其他)
- `--status`: 状态 (planning | in-development | released | deprecated)
- `--priority`: 优先级 (P0 | P1 | P2 | P3)
- `--spec`: 关联规格
- `--owner`: 负责人 open_id
- `--planned-release`: 预计上线日期 (YYYY-MM-DD)
- `--notes`: 备注

#### 查询功能模块

```bash
# 列出所有功能模块
/lark-pm feature-list

# 按模块筛选
/lark-pm feature-list --module "库存管理"

# 按状态筛选
/lark-pm feature-list --status in-development

# 按优先级筛选
/lark-pm feature-list --priority P0
```

#### 更新功能模块

```bash
/lark-pm feature-update recxxx \
  --status released \
  --actual-release 2025-01-28 \
  --notes "功能已上线,运行正常"
```

### 5. 测试记录管理

#### 创建测试记录

```bash
/lark-pm test-create \
  --name "库存查询单元测试" \
  --type unit \
  --status passed \
  --spec I003 \
  --executor ou_xxx \
  --coverage 95 \
  --result "所有测试用例通过,覆盖率 95%"
```

**参数说明**:
- `--name`: 测试名称 (必需)
- `--type`: 测试类型 (unit | integration | e2e | manual)
- `--status`: 状态 (not-executed | passed | failed | blocked)
- `--spec`: 关联规格
- `--executor`: 执行人 open_id
- `--execution-date`: 执行日期 (YYYY-MM-DD)
- `--result`: 测试结果
- `--failure-reason`: 失败原因 (仅 status=failed 时)
- `--coverage`: 覆盖率 (0-100)
- `--notes`: 备注

#### 查询测试记录

```bash
# 列出所有测试记录
/lark-pm test-list

# 按类型筛选
/lark-pm test-list --type unit

# 按状态筛选
/lark-pm test-list --status failed

# 按规格筛选
/lark-pm test-list --spec I003
```

#### 更新测试记录

```bash
/lark-pm test-update recxxx \
  --status passed \
  --coverage 98 \
  --result "回归测试通过"
```

## 数据导出

### 导出为 Excel

```bash
# 导出所有数据
/lark-pm export --format excel --output project-data.xlsx

# 导出特定实体
/lark-pm export --entity tasks --format excel --output tasks.xlsx

# 导出特定规格的数据
/lark-pm export --spec I003 --format excel --output I003-data.xlsx
```

**生成的 Excel 文件结构**:
- Sheet 1: 任务列表
- Sheet 2: 技术债
- Sheet 3: Bug记录
- Sheet 4: 功能矩阵
- Sheet 5: 测试记录

### 导出为 CSV

```bash
# 导出任务为 CSV
/lark-pm export --entity tasks --format csv --output tasks.csv

# 导出 Bug 为 CSV
/lark-pm export --entity bugs --format csv --output bugs.csv
```

### 导出为 JSON

```bash
# 导出所有数据为 JSON
/lark-pm export --format json --output project-data.json

# 导出特定实体
/lark-pm export --entity tasks --format json --output tasks.json
```

## 高级用法

### 1. 批量导入

```bash
# 从 JSON 文件批量导入任务
/lark-pm task-import tasks.json

# 从 CSV 文件批量导入
/lark-pm task-import tasks.csv
```

**JSON 格式示例**:
```json
[
  {
    "title": "实现库存查询",
    "priority": "high",
    "status": "todo",
    "specId": "I003",
    "tags": ["Backend", "Frontend"],
    "estimatedHours": 16
  },
  {
    "title": "编写测试用例",
    "priority": "medium",
    "status": "todo",
    "specId": "I003",
    "tags": ["Test"],
    "estimatedHours": 8
  }
]
```

### 2. 统计报表

```bash
# 查看项目统计
/lark-pm stats

# 按规格查看统计
/lark-pm stats --spec I003

# 导出统计报表
/lark-pm stats --export stats.pdf
```

**输出示例**:
```
📊 项目统计

任务总数: 45
  📝 待办: 12 (26.7%)
  🚀 进行中: 8 (17.8%)
  ✅ 已完成: 23 (51.1%)
  ❌ 已取消: 2 (4.4%)

技术债: 7
  🔴 严重: 2
  🟡 中: 3
  🟢 轻微: 2

Bug: 15
  📝 待修复: 5
  🚀 修复中: 3
  ✅ 已修复: 7

功能模块: 12
  📝 规划中: 4
  🚀 开发中: 6
  ✅ 已上线: 2

测试记录: 28
  ✅ 通过: 24 (85.7%)
  ❌ 失败: 3 (10.7%)
  ⏸️ 未执行: 1 (3.6%)
```

### 3. 配置管理

```bash
# 查看当前配置
/lark-pm config show

# 更新配置
/lark-pm config set LARK_LOG_LEVEL=debug

# 重置配置
/lark-pm config reset
```

## 常见问题排查

### 问题 1: 认证失败

**错误信息**:
```
❌ 认证失败,请检查 Token: invalid user access token
```

**解决方案**:
1. 检查 `.env` 文件中的 `LARK_USER_ACCESS_TOKEN` 是否正确
2. Token 可能已过期,重新获取 User Access Token
3. 确认应用权限已开通 (`bitable:app`, `bitable:app:readonly`, `bitable:app:write`)

### 问题 2: 找不到 Base App

**错误信息**:
```
❌ 资源不存在: app not found
```

**解决方案**:
1. 运行 `/lark-pm init` 创建 Base App
2. 检查 `.claude/skills/lark-pm/config.json` 是否存在且包含 `baseAppToken`
3. 在飞书中确认 Base App 未被删除

### 问题 3: API 请求过于频繁

**错误信息**:
```
❌ API 请求过于频繁,请稍后重试
```

**解决方案**:
1. 等待 1-2 分钟后重试
2. 减少批量操作的频率
3. 使用 `--batch-size` 参数控制批量大小:
   ```bash
   /lark-pm task-import tasks.json --batch-size 100
   ```

### 问题 4: 字段类型不匹配

**错误信息**:
```
❌ 请求参数错误: field type mismatch
```

**解决方案**:
1. 检查字段值格式是否正确:
   - 日期: YYYY-MM-DD
   - 人员: open_id (如 ou_xxx)
   - 进度: 0-100 整数
2. 查看 [data-model.md](./data-model.md) 确认字段类型

### 问题 5: 权限不足

**错误信息**:
```
❌ 无权限访问: permission denied
```

**解决方案**:
1. 确认应用已开通所需权限
2. 检查 User Access Token 对应用户是否有 Base App 访问权限
3. 在飞书 Base App 中添加用户为协作者

## 获取帮助

```bash
# 查看命令帮助
/lark-pm --help

# 查看子命令帮助
/lark-pm task-create --help

# 查看版本信息
/lark-pm --version
```

**输出示例**:
```
📋 Lark PM - 项目管理工具

版本: 1.0.0
文档: specs/T004-lark-project-management/

可用命令:
  init              初始化 Base App 和数据表
  status            查看配置状态

  task-create       创建任务
  task-list         列出任务
  task-update       更新任务
  task-delete       删除任务
  task-import       批量导入任务

  debt-create       创建技术债
  debt-list         列出技术债
  debt-update       更新技术债

  bug-create        创建 Bug
  bug-list          列出 Bug
  bug-update        更新 Bug

  feature-create    创建功能模块
  feature-list      列出功能模块
  feature-update    更新功能模块

  test-create       创建测试记录
  test-list         列出测试记录
  test-update       更新测试记录

  export            导出数据
  stats             查看统计
  config            配置管理

使用 '/lark-pm <command> --help' 查看详细帮助
```

## 最佳实践

### 1. 规格 ID 命名规范

使用项目约定的规格 ID 前缀:
- `I###`: 库存管理 (如 I003)
- `P###`: 商品管理 (如 P004)
- `O###`: 订单管理 (如 O003)
- `S###`: 门店管理 (如 S014)
- `T###`: 工具/基础设施 (如 T004)

**示例**:
```bash
/lark-pm task-create --title "实现库存查询" --spec I003
/lark-pm feature-create --name "商品管理" --spec P004
```

### 2. 任务拆分

将大型任务拆分为多个小任务:
```bash
# 主任务
/lark-pm task-create --title "[I003] 库存查询功能" --spec I003

# 子任务
/lark-pm task-create --title "[I003] 后端 API 实现" --spec I003
/lark-pm task-create --title "[I003] 前端界面开发" --spec I003
/lark-pm task-create --title "[I003] 单元测试编写" --spec I003
/lark-pm task-create --title "[I003] 集成测试验证" --spec I003
```

### 3. 定期导出备份

建议每周导出项目数据:
```bash
# 定时任务 (crontab)
0 2 * * 1 /lark-pm export --format excel --output ~/backups/project-$(date +\%Y\%m\%d).xlsx
```

### 4. 使用标签分类

善用标签组织任务:
```bash
# 按技术栈分类
--tags Backend,API          # 后端 API 开发
--tags Frontend,React       # 前端 React 开发
--tags Test,Unit            # 单元测试

# 按优先级分类
--tags Urgent,P0            # 紧急高优
--tags Technical-Debt       # 技术债
--tags Enhancement          # 功能增强
```

## 下一步

- 阅读 [数据模型文档](./data-model.md) 了解详细字段定义
- 查看 [API 契约文档](./contracts/lark-mcp-api.md) 了解底层 API
- 查看 [规格说明](./spec.md) 了解完整功能需求

---

**文档版本**: 1.0.0
**最后更新**: 2025-12-31
**反馈**: 如有问题请在项目仓库提 Issue
