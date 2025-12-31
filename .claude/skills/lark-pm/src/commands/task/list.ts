/**
 * @spec T004-lark-project-management
 * List tasks command with filtering and formatting
 */

import { TaskRepository, TaskFilter } from '../../repositories/task-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { TaskStatus, TaskPriority } from '../../models/task.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface ListTaskOptions {
  status?: string
  priority?: string
  specId?: string
  assignee?: string
  tags?: string[]
  limit?: number
}

export async function listTasksCommand(options: ListTaskOptions): Promise<void> {
  const spinner = ora('加载任务列表...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.tasks) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    const client = new LarkClient()
    const repository = new TaskRepository(
      client,
      config.baseAppToken,
      config.tableIds.tasks
    )

    // Build filter
    const filter: TaskFilter = {}
    if (options.status) filter.status = options.status as TaskStatus
    if (options.priority) filter.priority = options.priority as TaskPriority
    if (options.specId) filter.specId = options.specId
    if (options.assignee) filter.assignee = options.assignee
    if (options.tags) filter.tags = options.tags

    const tasks = await repository.list({
      filter,
      sortBy: 'createdTime',
      sortDesc: true,
      limit: options.limit,
    })

    spinner.succeed(chalk.green(`找到 ${tasks.length} 个任务`))

    if (tasks.length === 0) {
      console.log(chalk.gray('\n暂无任务\n'))
      return
    }

    // Print tasks table
    console.log()
    console.log(
      chalk.bold(
        `${'ID'.padEnd(20)} ${'标题'.padEnd(30)} ${'状态'.padEnd(12)} ${'优先级'.padEnd(10)} ${'规格ID'.padEnd(10)}`
      )
    )
    console.log(chalk.gray('─'.repeat(100)))

    tasks.forEach((task) => {
      const statusColor = getStatusColor(task.status)
      const priorityColor = getPriorityColor(task.priority)

      console.log(
        `${task.id.substring(0, 18).padEnd(20)} ` +
          `${task.title.substring(0, 28).padEnd(30)} ` +
          `${statusColor(task.status.padEnd(12))} ` +
          `${priorityColor(task.priority.padEnd(10))} ` +
          `${chalk.cyan((task.specId || '-').padEnd(10))}`
      )
    })

    console.log()

    logger.info({ count: tasks.length, filter }, 'Listed tasks')
  } catch (error) {
    spinner.fail(chalk.red('获取任务列表失败'))
    logger.error({ error }, 'List tasks command failed')
    throw error
  }
}

function getStatusColor(status: TaskStatus): (text: string) => string {
  switch (status) {
    case TaskStatus.Done:
      return chalk.green
    case TaskStatus.InProgress:
      return chalk.blue
    case TaskStatus.Cancelled:
      return chalk.gray
    default:
      return chalk.yellow
  }
}

function getPriorityColor(priority: TaskPriority): (text: string) => string {
  switch (priority) {
    case TaskPriority.High:
      return chalk.red
    case TaskPriority.Medium:
      return chalk.yellow
    default:
      return chalk.green
  }
}
