#!/usr/bin/env node
/**
 * @spec T004-lark-project-management
 * Main entry point for lark-pm CLI
 */

import 'dotenv/config'
import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { registerAuthCommand } from './commands/auth.js'
import { listTasksCommand } from './commands/task/list.js'
import { createTaskCommand } from './commands/task/create.js'
import { updateTaskCommand } from './commands/task/update.js'
import { deleteTaskCommand } from './commands/task/delete.js'
import { exportTasksCommand } from './commands/task/export.js'
import { listDebtsCommand } from './commands/debt/list.js'
import { createDebtCommand } from './commands/debt/create.js'
import { updateDebtCommand } from './commands/debt/update.js'
import { deleteDebtCommand } from './commands/debt/delete.js'
import { exportDebtsCommand } from './commands/debt/export.js'
import { listBugsCommand } from './commands/bug/list.js'
import { createBugCommand } from './commands/bug/create.js'
import { updateBugCommand } from './commands/bug/update.js'
import { deleteBugCommand } from './commands/bug/delete.js'
import { exportBugsCommand } from './commands/bug/export.js'
import { listBacklogsCommand } from './commands/backlog/list.js'
import { createBacklogCommand } from './commands/backlog/create.js'
import { smartCreateBacklogCommand } from './commands/backlog/smart-create.js'
import { updateBacklogStatusCommand } from './commands/backlog/update-status.js'
import { updateBacklogCommand } from './commands/backlog/update.js'
import { importMarkdownCommand } from './commands/document/import-markdown.js'
import { uploadFileCommand } from './commands/drive/upload.js'
import { getTokenCommand } from './commands/get-token.js'
import { importReadmeCommand } from './commands/import-readme.js'
import chalk from 'chalk'

const program = new Command()

program
  .name('lark-pm')
  .description('Lark MCP 项目管理工具 - 管理任务、技术债、Bug、功能和测试记录')
  .version('1.0.0')

// OAuth authentication
registerAuthCommand(program)

// Get token command (for Claude to obtain valid UAT)
program
  .command('get-token')
  .description('获取当前有效的 User Access Token（供 Claude 使用）')
  .action(async () => {
    try {
      await getTokenCommand()
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Init command
program
  .command('init')
  .description('初始化 Lark Base App 和数据表')
  .action(async () => {
    try {
      await initCommand()
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Task commands
const taskCommand = program.command('task').description('任务管理')

taskCommand
  .command('list')
  .description('列出任务')
  .option('--status <status>', '按状态筛选')
  .option('--priority <priority>', '按优先级筛选')
  .option('--spec-id <specId>', '按规格 ID 筛选')
  .option('--assignee <assignee>', '按负责人筛选')
  .option('--tags <tags...>', '按标签筛选')
  .option('--page <number>', '页码（从1开始）', parseInt)
  .option('--page-size <number>', '每页显示数量（默认20，最大100）', parseInt)
  .option('--limit <number>', '限制返回数量（已弃用，请使用 --page-size）', parseInt)
  .action(async (options) => {
    try {
      await listTasksCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

taskCommand
  .command('create')
  .description('创建任务')
  .requiredOption('--title <title>', '任务标题')
  .option('--priority <priority>', '优先级（高/中/低）')
  .option('--status <status>', '状态')
  .option('--spec-id <specId>', '规格 ID（如 S017）')
  .option('--task-id <taskId>', '任务标识（如 T001）')
  .option('--phase <phase>', '阶段（如 Phase 1: Setup）')
  .option('--story-label <storyLabel>', '用户故事标签（如 US1）')
  .option('--is-parallel', '是否可并行执行')
  .option('--assignees <assignees...>', '负责人列表')
  .option('--due-date <timestamp>', '截止日期（时间戳）', parseInt)
  .option('--tags <tags...>', '标签列表')
  .option('--progress <number>', '进度（0-100）', parseInt)
  .option('--estimated-hours <number>', '预计工时', parseFloat)
  .option('--notes <notes>', '备注')
  .action(async (options) => {
    try {
      await createTaskCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

taskCommand
  .command('update')
  .description('更新任务')
  .requiredOption('--task-id <taskId>', '任务 ID')
  .option('--title <title>', '任务标题')
  .option('--priority <priority>', '优先级')
  .option('--status <status>', '状态')
  .option('--spec-id <specId>', '规格 ID')
  .option('--assignees <assignees...>', '负责人列表')
  .option('--due-date <timestamp>', '截止日期（时间戳）', parseInt)
  .option('--tags <tags...>', '标签列表')
  .option('--progress <number>', '进度（0-100）', parseInt)
  .option('--estimated-hours <number>', '预计工时', parseFloat)
  .option('--actual-hours <number>', '实际工时', parseFloat)
  .option('--notes <notes>', '备注')
  .action(async (options) => {
    try {
      await updateTaskCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

taskCommand
  .command('delete')
  .description('删除任务（设置为已取消状态）')
  .requiredOption('--task-id <taskId>', '任务 ID')
  .option('--confirm', '确认删除')
  .action(async (options) => {
    try {
      await deleteTaskCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

taskCommand
  .command('export')
  .description('导出任务到 Excel 或 CSV')
  .requiredOption('--format <format>', '导出格式（excel 或 csv）')
  .requiredOption('--output <path>', '输出文件路径')
  .option('--status <status>', '按状态筛选')
  .option('--priority <priority>', '按优先级筛选')
  .option('--spec-id <specId>', '按规格 ID 筛选')
  .action(async (options) => {
    try {
      await exportTasksCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Technical Debt commands
const debtCommand = program.command('debt').description('技术债管理')

debtCommand
  .command('list')
  .description('列出技术债')
  .option('--status <status>', '按状态筛选')
  .option('--severity <severity>', '按严重程度筛选')
  .option('--spec-id <specId>', '按规格 ID 筛选')
  .option('--assignee <assignee>', '按负责人筛选')
  .option('--page <number>', '页码（从1开始）', parseInt)
  .option('--page-size <number>', '每页显示数量（默认20，最大100）', parseInt)
  .option('--limit <number>', '限制返回数量（已弃用，请使用 --page-size）', parseInt)
  .action(async (options) => {
    try {
      await listDebtsCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

debtCommand
  .command('create')
  .description('创建技术债')
  .requiredOption('--title <title>', '技术债标题')
  .option('--severity <severity>', '严重程度（严重/中/轻微）')
  .option('--status <status>', '状态')
  .option('--impact <impact>', '影响范围')
  .option('--spec-id <specId>', '规格 ID（如 S017）')
  .option('--estimated-effort <number>', '预估工时', parseFloat)
  .option('--assignee <assignee>', '负责人')
  .option('--notes <notes>', '备注')
  .action(async (options) => {
    try {
      await createDebtCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

debtCommand
  .command('update')
  .description('更新技术债')
  .requiredOption('--debt-id <debtId>', '技术债 ID')
  .option('--title <title>', '技术债标题')
  .option('--severity <severity>', '严重程度')
  .option('--status <status>', '状态')
  .option('--impact <impact>', '影响范围')
  .option('--spec-id <specId>', '规格 ID')
  .option('--estimated-effort <number>', '预估工时', parseFloat)
  .option('--assignee <assignee>', '负责人')
  .option('--found-date <timestamp>', '发现日期（时间戳）', parseInt)
  .option('--resolved-date <timestamp>', '解决日期（时间戳）', parseInt)
  .option('--notes <notes>', '备注')
  .action(async (options) => {
    try {
      await updateDebtCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

debtCommand
  .command('delete')
  .description('删除技术债（设置为已搁置状态）')
  .requiredOption('--debt-id <debtId>', '技术债 ID')
  .option('--confirm', '确认删除')
  .action(async (options) => {
    try {
      await deleteDebtCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

debtCommand
  .command('export')
  .description('导出技术债到 Excel 或 CSV')
  .requiredOption('--format <format>', '导出格式（excel 或 csv）')
  .requiredOption('--output <path>', '输出文件路径')
  .option('--status <status>', '按状态筛选')
  .option('--severity <severity>', '按严重程度筛选')
  .option('--spec-id <specId>', '按规格 ID 筛选')
  .action(async (options) => {
    try {
      await exportDebtsCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Bug commands
const bugCommand = program.command('bug').description('Bug 管理')

bugCommand
  .command('list')
  .description('列出 Bug')
  .option('--status <status>', '按状态筛选')
  .option('--severity <severity>', '按严重程度筛选')
  .option('--spec-id <specId>', '按规格 ID 筛选')
  .option('--assignee <assignee>', '按负责人筛选')
  .option('--page <number>', '页码（从1开始）', parseInt)
  .option('--page-size <number>', '每页显示数量（默认20，最大100）', parseInt)
  .option('--limit <number>', '限制返回数量（已弃用，请使用 --page-size）', parseInt)
  .action(async (options) => {
    try {
      await listBugsCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

bugCommand
  .command('create')
  .description('创建 Bug')
  .requiredOption('--title <title>', 'Bug 标题')
  .option('--severity <severity>', '严重程度（严重/中/轻微）')
  .option('--status <status>', '状态')
  .option('--reporter <reporter>', '报告人')
  .option('--assignee <assignee>', '负责人')
  .option('--spec-id <specId>', '规格 ID（如 S017）')
  .option('--found-date <timestamp>', '发现日期（时间戳）', parseInt)
  .option('--repro-steps <steps>', '复现步骤')
  .option('--environment <env>', '环境信息')
  .option('--notes <notes>', '备注')
  .action(async (options) => {
    try {
      await createBugCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

bugCommand
  .command('update')
  .description('更新 Bug')
  .requiredOption('--bug-id <bugId>', 'Bug ID')
  .option('--title <title>', 'Bug 标题')
  .option('--severity <severity>', '严重程度')
  .option('--status <status>', '状态')
  .option('--reporter <reporter>', '报告人')
  .option('--assignee <assignee>', '负责人')
  .option('--spec-id <specId>', '规格 ID')
  .option('--found-date <timestamp>', '发现日期（时间戳）', parseInt)
  .option('--fixed-date <timestamp>', '修复日期（时间戳）', parseInt)
  .option('--repro-steps <steps>', '复现步骤')
  .option('--environment <env>', '环境信息')
  .option('--notes <notes>', '备注')
  .action(async (options) => {
    try {
      await updateBugCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

bugCommand
  .command('delete')
  .description('删除 Bug（设置为不修复状态）')
  .requiredOption('--bug-id <bugId>', 'Bug ID')
  .option('--confirm', '确认删除')
  .action(async (options) => {
    try {
      await deleteBugCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

bugCommand
  .command('export')
  .description('导出 Bug 到 Excel 或 CSV')
  .requiredOption('--format <format>', '导出格式（excel 或 csv）')
  .requiredOption('--output <path>', '输出文件路径')
  .option('--status <status>', '按状态筛选')
  .option('--severity <severity>', '按严重程度筛选')
  .option('--spec-id <specId>', '按规格 ID 筛选')
  .action(async (options) => {
    try {
      await exportBugsCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Backlog commands
const backlogCommand = program.command('backlog').description('Backlog 管理')

backlogCommand
  .command('list')
  .description('列出 Backlog')
  .option('--status <status>', '按状态筛选')
  .option('--priority <priority>', '按优先级筛选')
  .option('--type <type>', '按类型筛选')
  .option('--spec-id <specId>', '按规格 ID 筛选')
  .option('--assignee <assignee>', '按负责人筛选')
  .option('--page <number>', '页码（从1开始）', parseInt)
  .option('--page-size <number>', '每页显示数量（默认20，最大100）', parseInt)
  .option('--limit <number>', '限制返回数量（已弃用，请使用 --page-size）', parseInt)
  .action(async (options) => {
    try {
      await listBacklogsCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

backlogCommand
  .command('create')
  .description('创建 Backlog')
  .requiredOption('--title <title>', 'Backlog 标题')
  .option('--description <description>', '详细描述')
  .option('--type <type>', '类型（功能需求/功能增强/技术债/缺陷修复/技术调研/文档）')
  .option('--priority <priority>', '优先级（高/中/低）')
  .option('--status <status>', '状态（待评估/已批准/进行中/已完成/已拒绝）')
  .option('--reporter <reporter>', '提出人')
  .option('--assignee <assignee>', '负责人')
  .option('--spec-id <specId>', '规格 ID（如 T004）')
  .option('--estimated-effort <number>', '预估工时', parseFloat)
  .option('--tags <tags...>', '标签列表')
  .option('--notes <notes>', '备注')
  .action(async (options) => {
    try {
      await createBacklogCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

backlogCommand
  .command('smart-create <input>')
  .description('通过自然语言智能创建 Product Backlog（自动识别技术债→Spike类型）')
  .option('--type <type>', '强制指定类型（User Story/Epic/Spike）')
  .option('--priority <priority>', '强制指定优先级（P0/P1/P2/P3）')
  .option('--spec-id <specId>', '规格 ID（如 T004）')
  .action(async (input, options) => {
    try {
      await smartCreateBacklogCommand({ input, ...options })
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

backlogCommand
  .command('update-status')
  .description('更新 Product Backlog 记录状态（直接 API 调用，无需重启）')
  .requiredOption('--record-id <recordId>', 'Record ID')
  .requiredOption('--status <status>', '新状态（📝 待规划/🚀 进行中/✅ 已完成/❌ 已取消）')
  .action(async (options) => {
    try {
      await updateBacklogStatusCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

backlogCommand
  .command('update')
  .description('更新 Product Backlog 记录（直接 API 调用，无需重启）')
  .requiredOption('--record-id <recordId>', 'Record ID')
  .option('--status <status>', '状态（📝 待规划/🚀 进行中/✅ 已完成/❌ 已取消）')
  .option('--priority <priority>', '优先级（P0/P1/P2/P3）')
  .option('--type <type>', '类型（Epic/User Story/Task/Spike）')
  .option('--spec-id <specId>', '规格 ID（如 T004-lark-project-management）')
  .option('--assignee <assignee>', '负责人')
  .option('--description <description>', '描述')
  .action(async (options) => {
    try {
      await updateBacklogCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Document commands
program
  .command('import-markdown')
  .description('导入 Markdown 文档到飞书（准备文件，由 Claude 完成实际导入）')
  .option('--file <path>', '单个 Markdown 文件路径')
  .option('--directory <path>', 'Markdown 文件目录路径')
  .option('--recursive', '递归扫描子目录', false)
  .action(async (options) => {
    try {
      await importMarkdownCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Drive commands
program
  .command('drive-upload')
  .description('上传文件到飞书云盘（保留原始格式）')
  .requiredOption('--file <path>', '文件路径')
  .option('--folder <token>', '目标文件夹 Token（可选，默认为根目录）')
  .option('--name <name>', '文件名称（可选，默认使用原文件名）')
  .action(async (options) => {
    try {
      await uploadFileCommand(options)
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

// Import README command (direct API, bypassing MCP)
program
  .command('import-readme')
  .description('导入 README.md 到飞书文档（直接 API 调用，无需重启）')
  .action(async () => {
    try {
      await importReadmeCommand()
    } catch (error) {
      console.error(chalk.red('\n错误:'), (error as Error).message)
      process.exit(1)
    }
  })

program.parse()
