/**
 * @spec T004-lark-project-management
 * Delete task command
 */

import { TaskRepository } from '../../repositories/task-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface DeleteTaskOptions {
  taskId: string
  confirm?: boolean
}

export async function deleteTaskCommand(options: DeleteTaskOptions): Promise<void> {
  if (!options.confirm) {
    console.log(
      chalk.yellow(
        '\n⚠️  删除操作将把任务状态设置为"已取消"。使用 --confirm 标志确认删除。\n'
      )
    )
    return
  }

  const spinner = ora('删除任务...').start()

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

    await repository.delete(options.taskId)

    spinner.succeed(chalk.green('任务已删除（状态设置为已取消）'))

    logger.info({ taskId: options.taskId }, 'Task deleted')
  } catch (error) {
    spinner.fail(chalk.red('删除任务失败'))
    logger.error({ error }, 'Delete task command failed')
    throw error
  }
}
