/**
 * @spec T004-lark-project-management
 * Create task command
 */

import { TaskRepository } from '../../repositories/task-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { TaskInput, TaskPriority, TaskStatus, TaskTag } from '../../models/task.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface CreateTaskOptions {
  title: string
  priority?: string
  status?: string
  specId?: string
  assignees?: string[]
  dueDate?: number
  tags?: string[]
  progress?: number
  estimatedHours?: number
  notes?: string
}

export async function createTaskCommand(options: CreateTaskOptions): Promise<void> {
  const spinner = ora('创建任务...').start()

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

    const input: TaskInput = {
      title: options.title,
      priority: (options.priority as TaskPriority) || TaskPriority.Medium,
      status: (options.status as TaskStatus) || TaskStatus.Todo,
    }

    if (options.specId) input.specId = options.specId
    if (options.assignees) input.assignees = options.assignees
    if (options.dueDate) input.dueDate = options.dueDate
    if (options.tags) input.tags = options.tags as TaskTag[]
    if (options.progress !== undefined) input.progress = options.progress
    if (options.estimatedHours) input.estimatedHours = options.estimatedHours
    if (options.notes) input.notes = options.notes

    const task = await repository.create(input)

    spinner.succeed(chalk.green('任务创建成功'))

    console.log()
    console.log(chalk.cyan('任务 ID:'), task.id)
    console.log(chalk.cyan('标题:'), task.title)
    console.log(chalk.cyan('状态:'), task.status)
    console.log(chalk.cyan('优先级:'), task.priority)
    if (task.specId) console.log(chalk.cyan('规格 ID:'), task.specId)
    console.log()

    logger.info({ taskId: task.id, title: task.title }, 'Task created')
  } catch (error) {
    spinner.fail(chalk.red('创建任务失败'))
    logger.error({ error }, 'Create task command failed')
    throw error
  }
}
