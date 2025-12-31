/**
 * @spec T004-lark-project-management
 * Update task command
 */

import { TaskRepository } from '../../repositories/task-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { TaskInput, TaskPriority, TaskStatus, TaskTag } from '../../models/task.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface UpdateTaskOptions {
  taskId: string
  title?: string
  priority?: string
  status?: string
  specId?: string
  assignees?: string[]
  dueDate?: number
  tags?: string[]
  progress?: number
  estimatedHours?: number
  actualHours?: number
  notes?: string
}

export async function updateTaskCommand(options: UpdateTaskOptions): Promise<void> {
  const spinner = ora('更新任务...').start()

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

    const input: Partial<TaskInput> = {}

    if (options.title) input.title = options.title
    if (options.priority) input.priority = options.priority as TaskPriority
    if (options.status) input.status = options.status as TaskStatus
    if (options.specId) input.specId = options.specId
    if (options.assignees) input.assignees = options.assignees
    if (options.dueDate) input.dueDate = options.dueDate
    if (options.tags) input.tags = options.tags as TaskTag[]
    if (options.progress !== undefined) input.progress = options.progress
    if (options.estimatedHours) input.estimatedHours = options.estimatedHours
    if (options.actualHours) input.actualHours = options.actualHours
    if (options.notes) input.notes = options.notes

    const task = await repository.update(options.taskId, input)

    spinner.succeed(chalk.green('任务更新成功'))

    console.log()
    console.log(chalk.cyan('任务 ID:'), task.id)
    console.log(chalk.cyan('标题:'), task.title)
    console.log(chalk.cyan('状态:'), task.status)
    console.log(chalk.cyan('优先级:'), task.priority)
    if (task.progress !== undefined) {
      console.log(chalk.cyan('进度:'), `${task.progress}%`)
    }
    console.log()

    logger.info({ taskId: task.id }, 'Task updated')
  } catch (error) {
    spinner.fail(chalk.red('更新任务失败'))
    logger.error({ error }, 'Update task command failed')
    throw error
  }
}
