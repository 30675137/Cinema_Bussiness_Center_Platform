# Research: Lark MCP 项目管理系统

**Phase**: Phase 0 - Technical Research
**Date**: 2025-12-31
**Spec**: [spec.md](./spec.md)

## 研究目标

解决 Claude Code skill 开发的技术选型和架构设计问题,为 Phase 1 设计阶段提供明确的技术决策依据。

## 1. Claude Code Skills 开发模式研究

### 1.1 Skill 注册与调用机制

**研究发现**:
- Claude Code skills 通过 `skill.md` 文件的 YAML frontmatter 注册
- 必需字段: `name`, `description`, `version`
- 调用方式: `/<skill-name> [args]`
- Skill 可以是对话式(引导式)或自动化(直接执行)

**决策**: 采用**扁平化子命令**结构
- 主命令: `/lark-pm`
- 子命令: `task-create`, `task-list`, `bug-create`, `debt-create`, `export` 等
- 理由:
  - 符合 CLI 工具最佳实践
  - 便于用户记忆和使用
  - 避免深层嵌套导致的复杂性

**示例**:
```bash
/lark-pm task-create --title "实现库存查询" --priority high --spec I003
/lark-pm task-list --status 进行中
/lark-pm export --format excel --output tasks.xlsx
```

### 1.2 Skill 项目结构

**参考**: 现有 skills (test-scenario-author, e2e-test-generator)

**决策**: 采用模块化目录结构
```
.claude/skills/lark-pm/
├── skill.md                    # YAML frontmatter + 文档
├── index.ts                    # 入口,解析子命令
├── src/
│   ├── commands/               # 命令处理器(扁平化)
│   ├── lark/                   # 飞书 MCP 客户端封装
│   ├── models/                 # 数据模型
│   ├── utils/                  # 工具函数
│   └── config/                 # 配置管理
└── tests/                      # 测试
```

**理由**:
- 关注点分离: 命令处理、API 调用、业务逻辑分离
- 可测试性: 每个模块独立测试
- 可维护性: 清晰的职责划分

### 1.3 Constitution Check 适配

**研究发现**: Claude Code skill 项目不适用的规则
- ❌ 组件化架构 (N/A for CLI tool)
- ❌ 前端技术栈分层 (N/A)
- ❌ 数据驱动状态管理 (N/A)
- ❌ 后端技术栈约束 (使用飞书 MCP,不涉及自建后端)
- ❌ 可访问性标准 (N/A for CLI)

**仍需遵守的规则**:
- ✅ 功能分支绑定 (T004 前缀)
- ✅ 测试驱动开发 (核心逻辑 100% 覆盖)
- ✅ 代码质量工程化 (TypeScript 严格模式、ESLint)
- ✅ Claude Code Skills 规范 (skill.md + YAML frontmatter)

## 2. Lark MCP API 集成研究

### 2.1 API 调用方式

**研究对象**: `scripts/lark-task-manager.ts` (T003 探索成果)

**发现的问题**:
```typescript
// ❌ 不推荐: 使用 execSync 调用 MCP 客户端
const command = `echo '${JSON.stringify({ name: toolName, arguments: params })}' | npx @anthropic-ai/mcp-client`
const result = execSync(command, { encoding: 'utf8' })
```

**问题分析**:
- 性能差: 每次调用都启动新进程
- 错误处理困难: stdout/stderr 混合
- 类型安全缺失: JSON 字符串无类型检查

**决策**: 使用 **飞书 Node.js SDK**

**技术选型**:
```typescript
// ✅ 推荐: 使用 @larksuiteoapi/node-sdk
import * as lark from '@larksuiteoapi/node-sdk'

const client = new lark.Client({
  appId: process.env.LARK_APP_ID,
  appSecret: process.env.LARK_APP_SECRET,
})

// 类型安全的 API 调用
const response = await client.bitable.appTable.create({
  path: { app_token: appToken },
  data: {
    table: {
      name: '项目任务',
      fields: [...]
    }
  }
})
```

**优势**:
- 完整的 TypeScript 类型定义
- 自动处理认证、重试、分页
- 更好的错误处理和日志记录

### 2.2 认证方式

**研究**: 飞书 API 认证机制

**可选方案**:
1. **Tenant Access Token** (应用身份)
   - 适用场景: 应用代表自己操作数据
   - 有效期: 2 小时
   - 自动刷新

2. **User Access Token** (用户身份)
   - 适用场景: 代表用户操作数据
   - 需要用户授权
   - 权限范围: 用户可访问的数据

**决策**: 优先使用 **User Access Token**

**理由**:
- 项目管理数据属于用户个人工作空间
- 需要访问用户创建的 Base App
- 符合最小权限原则

**配置方式**:
```typescript
// .claude/skills/lark-pm/src/config/lark-config.ts
export const getLarkConfig = () => ({
  appId: process.env.LARK_APP_ID,
  appSecret: process.env.LARK_APP_SECRET,
  userAccessToken: process.env.LARK_USER_ACCESS_TOKEN, // 用户手动配置
})
```

### 2.3 数据组织策略

**决策**: **单个 Base App + 5 个数据表**

**表结构设计**:

| 表名 | 字段数 | 关键字段 |
|------|--------|---------|
| Tasks | 12 | title, status, priority, assignee, specId, dueDate |
| TechnicalDebt | 10 | title, severity, status, impact, specId, estimatedEffort |
| Bugs | 11 | title, severity, status, reporter, assignee, specId, foundDate |
| Features | 9 | name, module, status, priority, owner, specId |
| TestRecords | 10 | testName, type, status, specId, executor, result |

**关联关系**:
- 所有表通过 `specId` 字段关联到项目规格
- 使用飞书"单向关联"字段实现表间引用

**理由**:
- 数据隔离: 不同实体类型独立管理
- 查询性能: 避免大表扫描
- 扩展性: 可独立调整每个表的字段

### 2.4 错误处理策略

**决策**: **指数退避重试 (Exponential Backoff)**

**实现方案**:
```typescript
// .claude/skills/lark-pm/src/utils/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number      // 3
    baseDelay: number       // 1000ms
    maxDelay: number        // 8000ms
    backoffFactor: number   // 2
  }
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < options.maxRetries) {
        const delay = Math.min(
          options.baseDelay * Math.pow(options.backoffFactor, attempt),
          options.maxDelay
        )
        await sleep(delay)
      }
    }
  }

  throw new Error(`Failed after ${options.maxRetries} retries: ${lastError.message}`)
}
```

**重试策略**:
- 第 1 次失败: 等待 1 秒后重试
- 第 2 次失败: 等待 2 秒后重试
- 第 3 次失败: 等待 4 秒后重试
- 第 4 次失败: 抛出错误

**适用场景**:
- 网络波动导致的临时失败
- 飞书 API 限流 (Rate Limit)
- 服务端暂时不可用

### 2.5 并发冲突处理

**决策**: **Last Write Wins (LWW)**

**实现方式**:
- 不进行乐观锁或版本控制
- 直接覆盖写入
- 记录操作日志

**理由**:
- 简化实现
- 项目管理数据冲突概率低
- 符合用户预期(最新操作生效)

**日志记录**:
```typescript
logger.info('Record updated', {
  operation: 'UPDATE_TASK',
  recordId: 'rec123',
  fields: { status: '已完成' },
  timestamp: new Date().toISOString(),
})
```

## 3. CLI 工具技术选型

### 3.1 命令行参数解析

**候选方案**:

| 库 | Stars | 特点 | 示例 |
|----|-------|------|------|
| **commander** | 26.5k | 简单、文档全 | `program.command('task-create')` |
| **yargs** | 11k | 功能强大、交互式 | `.option('title', { type: 'string' })` |
| **oclif** | 8.9k | 框架级、Salesforce 出品 | 重量级 |

**决策**: 使用 **commander**

**理由**:
- 轻量级,学习曲线低
- TypeScript 支持好
- 满足扁平化子命令需求

**示例**:
```typescript
import { Command } from 'commander'

const program = new Command()

program
  .name('lark-pm')
  .description('Lark 项目管理工具')
  .version('1.0.0')

program
  .command('task-create')
  .description('创建新任务')
  .requiredOption('--title <title>', '任务标题')
  .option('--priority <priority>', '优先级', 'medium')
  .option('--spec <specId>', '关联规格 ID')
  .action(async (options) => {
    await createTaskCommand(options)
  })

program.parse()
```

### 3.2 终端输出美化

**需求**:
- 彩色输出(成功绿色、错误红色)
- 表格展示(任务列表)
- Loading 动画(API 调用)

**技术选型**:
- **chalk**: 终端文本着色
- **cli-table3**: ASCII 表格
- **ora**: Loading spinner

**示例**:
```typescript
import chalk from 'chalk'
import Table from 'cli-table3'
import ora from 'ora'

// 彩色输出
console.log(chalk.green('✅ 任务创建成功'))
console.log(chalk.red('❌ API 调用失败'))

// 表格展示
const table = new Table({
  head: ['ID', '标题', '状态', '优先级'],
})
table.push(
  ['1', '实现库存查询', '进行中', '高'],
  ['2', '编写测试', '待办', '中']
)
console.log(table.toString())

// Loading 动画
const spinner = ora('正在创建任务...').start()
await createTask()
spinner.succeed('任务创建成功')
```

### 3.3 数据导出功能

**需求**: 支持导出项目数据为 Excel 或 CSV

**技术选型**:

| 库 | 特点 | 用途 |
|----|------|------|
| **xlsx** | 功能全、体积大 | Excel 导出 |
| **exceljs** | 功能全、流式写入 | 大数据量 Excel |
| **json2csv** | 轻量级 | CSV 导出 |

**决策**:
- Excel 导出: 使用 **xlsx**
- CSV 导出: 使用 **json2csv**

**示例**:
```typescript
import XLSX from 'xlsx'
import { parse } from 'json2csv'

// Excel 导出
const workbook = XLSX.utils.book_new()
const worksheet = XLSX.utils.json_to_sheet(tasks)
XLSX.utils.book_append_sheet(workbook, worksheet, '任务列表')
XLSX.writeFile(workbook, 'tasks.xlsx')

// CSV 导出
const csv = parse(tasks, { fields: ['id', 'title', 'status'] })
fs.writeFileSync('tasks.csv', csv)
```

## 4. 数据验证与类型安全

### 4.1 运行时数据验证

**需求**: 验证用户输入和 API 响应

**技术选型**: 使用 **Zod**

**理由**:
- 与 TypeScript 类型推导无缝集成
- 提供清晰的错误信息
- 支持复杂验证规则

**示例**:
```typescript
import { z } from 'zod'

const TaskSchema = z.object({
  title: z.string().min(1, '任务标题不能为空').max(100, '标题不超过100字符'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['todo', 'in-progress', 'done', 'cancelled']),
  specId: z.string().regex(/^[A-Z]\d{3}$/, '规格 ID 格式错误'),
  dueDate: z.number().optional(),
})

type Task = z.infer<typeof TaskSchema>

// 验证用户输入
const validatedTask = TaskSchema.parse(userInput)
```

### 4.2 TypeScript 严格模式

**配置**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

## 5. 测试策略

### 5.1 单元测试

**框架**: Vitest

**覆盖目标**:
- 核心业务逻辑: **100%**
- 工具函数: ≥ 80%

**测试重点**:
- 重试逻辑: `retryWithBackoff` 函数
- 数据验证: Zod schema 验证
- 命令参数解析: Commander 配置
- 数据转换: Lark API 响应转换为内部模型

**示例**:
```typescript
// tests/utils/retry.test.ts
import { describe, it, expect, vi } from 'vitest'
import { retryWithBackoff } from '../src/utils/retry'

describe('retryWithBackoff', () => {
  it('应该在第二次尝试成功', async () => {
    let attempts = 0
    const fn = vi.fn(async () => {
      attempts++
      if (attempts < 2) throw new Error('Temporary failure')
      return 'success'
    })

    const result = await retryWithBackoff(fn, {
      maxRetries: 3,
      baseDelay: 100,
      maxDelay: 1000,
      backoffFactor: 2,
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
```

### 5.2 集成测试

**策略**: Mock 飞书 API 响应

**工具**: Vitest + MSW (Mock Service Worker)

**示例**:
```typescript
// tests/lark/client.test.ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.post('https://open.feishu.cn/open-apis/bitable/v1/apps/:app_token/tables', () => {
    return HttpResponse.json({
      code: 0,
      data: {
        table_id: 'tbl123',
      },
    })
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

it('应该成功创建数据表', async () => {
  const tableId = await larkClient.createTable(appToken, tableConfig)
  expect(tableId).toBe('tbl123')
})
```

### 5.3 手动 E2E 测试

**策略**: 通过实际调用 `/lark-pm` 命令验证

**测试用例**:
```bash
# 1. 初始化 Base App
/lark-pm init

# 2. 创建任务
/lark-pm task-create --title "实现库存查询" --priority high --spec I003

# 3. 查询任务
/lark-pm task-list --status todo

# 4. 更新任务
/lark-pm task-update --id rec123 --status in-progress

# 5. 导出数据
/lark-pm export --format excel --output tasks.xlsx
```

## 6. 性能目标

### 6.1 响应时间

| 操作 | 目标 | 说明 |
|------|------|------|
| 创建记录 | < 2秒 | 不含网络延迟 |
| 查询 500 条记录 | < 3秒 | 包含数据转换 |
| 导出全部数据 | < 10秒 | 包含文件写入 |

### 6.2 优化策略

**缓存**: 对频繁查询的数据使用内存缓存
```typescript
// 缓存字段定义,避免重复查询
const fieldsCache = new Map<string, LarkField[]>()

async function getFields(appToken: string, tableId: string): Promise<LarkField[]> {
  const cacheKey = `${appToken}:${tableId}`
  if (fieldsCache.has(cacheKey)) {
    return fieldsCache.get(cacheKey)!
  }

  const fields = await larkClient.listFields(appToken, tableId)
  fieldsCache.set(cacheKey, fields)
  return fields
}
```

**批量操作**: 使用批量 API 减少请求次数
```typescript
// 批量创建记录
await larkClient.batchCreateRecords(appToken, tableId, records)
```

## 7. 配置管理

### 7.1 环境变量

**必需配置**:
```bash
# .env
LARK_APP_ID=cli_xxx
LARK_APP_SECRET=xxx
LARK_USER_ACCESS_TOKEN=u-xxx

# 可选配置
LARK_BASE_APP_TOKEN=bascnxxx  # 如果已有 Base App
LARK_LOG_LEVEL=info           # debug, info, warn, error
```

### 7.2 配置文件

**位置**: `.claude/skills/lark-pm/config.json`

**内容**:
```json
{
  "baseAppToken": "bascnxxx",
  "tables": {
    "tasks": "tblxxx",
    "bugs": "tblxxx",
    "debt": "tblxxx",
    "features": "tblxxx",
    "testRecords": "tblxxx"
  },
  "retryOptions": {
    "maxRetries": 3,
    "baseDelay": 1000,
    "maxDelay": 8000,
    "backoffFactor": 2
  }
}
```

## 8. 日志与监控

### 8.1 结构化日志

**实现**:
```typescript
// .claude/skills/lark-pm/src/utils/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LARK_LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
})

// 使用
logger.info({ operation: 'CREATE_TASK', recordId: 'rec123' }, '任务创建成功')
logger.error({ operation: 'API_CALL', error: err.message }, 'API 调用失败')
```

### 8.2 错误日志

**记录内容**:
- 操作类型
- 请求参数
- 错误堆栈
- 重试次数

## 9. 决策总结

| 决策项 | 选择 | 理由 |
|--------|------|------|
| API 调用方式 | @larksuiteoapi/node-sdk | 类型安全、自动重试、完整文档 |
| 认证方式 | User Access Token | 符合用户数据权限模型 |
| 命令结构 | 扁平化子命令 | 易用性、符合 CLI 最佳实践 |
| 参数解析 | commander | 轻量级、TypeScript 支持好 |
| 数据验证 | Zod | 与 TS 集成、清晰错误信息 |
| 重试策略 | 指数退避 (1s, 2s, 4s) | 应对网络波动、限流 |
| 冲突处理 | Last Write Wins | 简化实现、低冲突场景 |
| 数据组织 | 单 Base App + 5 表 | 数据隔离、查询性能 |
| Excel 导出 | xlsx | 功能全、社区活跃 |
| 日志记录 | pino | 结构化、高性能 |

## 10. 风险与限制

### 10.1 技术风险

**飞书 API 限流**:
- 风险: 高频调用可能触发限流
- 缓解: 实现重试逻辑、批量操作

**Token 过期**:
- 风险: User Access Token 可能过期
- 缓解: 提示用户重新配置、文档说明刷新步骤

### 10.2 数据限制

**Base App 容量**:
- 单表最大行数: 10 万行
- 单表最大字段数: 500 个
- 影响: 大型项目可能超限
- 缓解: 文档说明适用范围(中小型项目)

## 11. 后续阶段输入

**Phase 1 (data-model.md) 需要的信息**:
- ✅ 5 个实体的完整字段定义
- ✅ 字段类型映射(Lark API type → TypeScript type)
- ✅ 数据验证规则(Zod schema)

**Phase 1 (contracts/lark-mcp-api.md) 需要的信息**:
- ✅ 使用的飞书 API 端点列表
- ✅ 请求/响应格式
- ✅ 错误码说明

**Phase 1 (quickstart.md) 需要的信息**:
- ✅ 环境配置步骤
- ✅ 基本使用示例
- ✅ 常见问题排查

**Phase 2 (tasks.md) 需要的信息**:
- ✅ 技术选型已确定
- ✅ 架构设计已完成
- ✅ 可以拆解实现任务

---

**研究完成日期**: 2025-12-31
**审核状态**: Phase 0 完成,准备进入 Phase 1
