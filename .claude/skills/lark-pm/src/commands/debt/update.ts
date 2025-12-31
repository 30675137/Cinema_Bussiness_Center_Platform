/**
 * @spec T004-lark-project-management
 * Update technical debt command
 */

import { DebtRepository } from '../../repositories/debt-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { TechnicalDebtInput, DebtSeverity, DebtStatus } from '../../models/debt.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface UpdateDebtOptions {
  debtId: string
  title?: string
  severity?: string
  status?: string
  impact?: string
  specId?: string
  estimatedEffort?: number
  assignee?: string
  foundDate?: number
  resolvedDate?: number
  notes?: string
}

export async function updateDebtCommand(options: UpdateDebtOptions): Promise<void> {
  const spinner = ora('更新技术债...').start()

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

    const input: Partial<TechnicalDebtInput> = {}

    if (options.title) input.title = options.title
    if (options.severity) input.severity = options.severity as DebtSeverity
    if (options.status) input.status = options.status as DebtStatus
    if (options.impact !== undefined) input.impact = options.impact
    if (options.specId !== undefined) input.specId = options.specId
    if (options.estimatedEffort !== undefined) input.estimatedEffort = options.estimatedEffort
    if (options.assignee !== undefined) input.assignee = options.assignee
    if (options.foundDate !== undefined) input.foundDate = options.foundDate
    if (options.resolvedDate !== undefined) input.resolvedDate = options.resolvedDate
    if (options.notes !== undefined) input.notes = options.notes

    const debt = await repository.update(options.debtId, input)

    spinner.succeed(chalk.green('技术债更新成功'))

    console.log()
    console.log(chalk.cyan('技术债 ID:'), debt.id)
    console.log(chalk.cyan('标题:'), debt.title)
    console.log(chalk.cyan('状态:'), debt.status)
    console.log(chalk.cyan('严重程度:'), debt.severity)
    if (debt.specId) console.log(chalk.cyan('规格 ID:'), debt.specId)
    console.log()

    logger.info({ debtId: debt.id }, 'Technical debt updated')
  } catch (error) {
    spinner.fail(chalk.red('更新技术债失败'))
    logger.error({ error }, 'Update debt command failed')
    throw error
  }
}
