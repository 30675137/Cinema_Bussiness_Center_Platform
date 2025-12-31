/**
 * @spec T004-lark-project-management
 * Delete technical debt command
 */

import { DebtRepository } from '../../repositories/debt-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface DeleteDebtOptions {
  debtId: string
  confirm?: boolean
}

export async function deleteDebtCommand(options: DeleteDebtOptions): Promise<void> {
  if (!options.confirm) {
    console.log(
      chalk.yellow(
        '\n⚠️  删除操作将把技术债状态设置为"已搁置"。使用 --confirm 标志确认删除。\n'
      )
    )
    return
  }

  const spinner = ora('删除技术债...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.technicalDebt) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    const client = new LarkClient()
    const repository = new DebtRepository(
      client,
      config.baseAppToken,
      config.tableIds.technicalDebt
    )

    await repository.delete(options.debtId)

    spinner.succeed(chalk.green('技术债已删除（状态设置为已搁置）'))

    logger.info({ debtId: options.debtId }, 'Technical debt deleted')
  } catch (error) {
    spinner.fail(chalk.red('删除技术债失败'))
    logger.error({ error }, 'Delete debt command failed')
    throw error
  }
}
