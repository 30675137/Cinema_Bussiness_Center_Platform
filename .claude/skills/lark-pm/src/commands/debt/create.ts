/**
 * @spec T004-lark-project-management
 * Create technical debt command
 */

import { DebtRepository } from '../../repositories/debt-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { TechnicalDebtInput, DebtSeverity, DebtStatus } from '../../models/debt.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface CreateDebtOptions {
  title: string
  severity?: string
  status?: string
  impact?: string
  specId?: string
  estimatedEffort?: number
  assignee?: string
  notes?: string
}

export async function createDebtCommand(options: CreateDebtOptions): Promise<void> {
  const spinner = ora('创建技术债...').start()

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

    const input: TechnicalDebtInput = {
      title: options.title,
      severity: (options.severity as DebtSeverity) || DebtSeverity.Medium,
      status: (options.status as DebtStatus) || DebtStatus.Open,
    }

    if (options.impact) input.impact = options.impact
    if (options.specId) input.specId = options.specId
    if (options.estimatedEffort) input.estimatedEffort = options.estimatedEffort
    if (options.assignee) input.assignee = options.assignee
    if (options.notes) input.notes = options.notes

    const debt = await repository.create(input)

    spinner.succeed(chalk.green('技术债创建成功'))

    console.log()
    console.log(chalk.cyan('技术债 ID:'), debt.id)
    console.log(chalk.cyan('标题:'), debt.title)
    console.log(chalk.cyan('状态:'), debt.status)
    console.log(chalk.cyan('严重程度:'), debt.severity)
    if (debt.specId) console.log(chalk.cyan('规格 ID:'), debt.specId)
    console.log()

    logger.info({ debtId: debt.id, title: debt.title }, 'Technical debt created')
  } catch (error) {
    spinner.fail(chalk.red('创建技术债失败'))
    logger.error({ error }, 'Create debt command failed')
    throw error
  }
}
