#!/usr/bin/env node
/**
 * @spec T004-lark-project-management
 * Main entry point for lark-pm CLI
 */

import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { listTasksCommand } from './commands/task/list.js'
import { createTaskCommand } from './commands/task/create.js'
import { updateTaskCommand } from './commands/task/update.js'
import { deleteTaskCommand } from './commands/task/delete.js'
import { exportTasksCommand } from './commands/task/export.js'
import chalk from 'chalk'

const program = new Command()

program
  .name('lark-pm')
  .description('Lark MCP 项目管理工具 - 管理任务、技术债、Bug、功能和测试记录')
  .version('1.0.0')

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
  .option('--limit <number>', '限制返回数量', parseInt)
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

program.parse()
