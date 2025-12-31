/**
 * @spec T004-lark-project-management
 * Update bug command
 */

import { BugRepository } from '../../repositories/bug-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { BugInput, BugSeverity, BugStatus } from '../../models/bug.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface UpdateBugOptions {
  bugId: string
  title?: string
  severity?: string
  status?: string
  reporter?: string
  assignee?: string
  specId?: string
  foundDate?: number
  fixedDate?: number
  reproSteps?: string
  environment?: string
  notes?: string
}

export async function updateBugCommand(options: UpdateBugOptions): Promise<void> {
  const spinner = ora('更新 Bug...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.bugs) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    const client = new LarkClient()
    const repository = new BugRepository(client, config.baseAppToken, config.tableIds.bugs)

    const input: Partial<BugInput> = {}

    if (options.title) input.title = options.title
    if (options.severity) input.severity = options.severity as BugSeverity
    if (options.status) input.status = options.status as BugStatus
    if (options.reporter !== undefined) input.reporter = options.reporter
    if (options.assignee !== undefined) input.assignee = options.assignee
    if (options.specId !== undefined) input.specId = options.specId
    if (options.foundDate !== undefined) input.foundDate = options.foundDate
    if (options.fixedDate !== undefined) input.fixedDate = options.fixedDate
    if (options.reproSteps !== undefined) input.reproSteps = options.reproSteps
    if (options.environment !== undefined) input.environment = options.environment
    if (options.notes !== undefined) input.notes = options.notes

    const bug = await repository.update(options.bugId, input)

    spinner.succeed(chalk.green('Bug 更新成功'))

    console.log()
    console.log(chalk.cyan('Bug ID:'), bug.id)
    console.log(chalk.cyan('标题:'), bug.title)
    console.log(chalk.cyan('状态:'), bug.status)
    console.log(chalk.cyan('严重程度:'), bug.severity)
    if (bug.specId) console.log(chalk.cyan('规格 ID:'), bug.specId)
    console.log()

    logger.info({ bugId: bug.id }, 'Bug updated')
  } catch (error) {
    spinner.fail(chalk.red('更新 Bug 失败'))
    logger.error({ error }, 'Update bug command failed')
    throw error
  }
}
