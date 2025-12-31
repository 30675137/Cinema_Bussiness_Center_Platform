/**
 * @spec T004-lark-project-management
 * Delete bug command
 */

import { BugRepository } from '../../repositories/bug-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface DeleteBugOptions {
  bugId: string
  confirm?: boolean
}

export async function deleteBugCommand(options: DeleteBugOptions): Promise<void> {
  if (!options.confirm) {
    console.log(
      chalk.yellow('\n⚠️  删除操作将把 Bug 状态设置为"不修复"。使用 --confirm 标志确认删除。\n')
    )
    return
  }

  const spinner = ora('删除 Bug...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.bugs) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    const client = new LarkClient()
    const repository = new BugRepository(client, config.baseAppToken, config.tableIds.bugs)

    await repository.delete(options.bugId)

    spinner.succeed(chalk.green('Bug 已删除（状态设置为不修复）'))

    logger.info({ bugId: options.bugId }, 'Bug deleted')
  } catch (error) {
    spinner.fail(chalk.red('删除 Bug 失败'))
    logger.error({ error }, 'Delete bug command failed')
    throw error
  }
}
