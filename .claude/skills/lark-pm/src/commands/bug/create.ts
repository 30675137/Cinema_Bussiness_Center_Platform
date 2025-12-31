/**
 * @spec T004-lark-project-management
 * Create bug command
 */

import { BugRepository } from '../../repositories/bug-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { BugInput, BugSeverity, BugStatus } from '../../models/bug.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface CreateBugOptions {
  title: string
  severity?: string
  status?: string
  reporter?: string
  assignee?: string
  specId?: string
  foundDate?: number
  reproSteps?: string
  environment?: string
  notes?: string
}

export async function createBugCommand(options: CreateBugOptions): Promise<void> {
  const spinner = ora('创建 Bug...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.bugs) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    const client = new LarkClient()
    const repository = new BugRepository(client, config.baseAppToken, config.tableIds.bugs)

    const input: BugInput = {
      title: options.title,
      severity: (options.severity as BugSeverity) || BugSeverity.Medium,
      status: (options.status as BugStatus) || BugStatus.Open,
    }

    if (options.reporter) input.reporter = options.reporter
    if (options.assignee) input.assignee = options.assignee
    if (options.specId) input.specId = options.specId
    if (options.foundDate) input.foundDate = options.foundDate
    if (options.reproSteps) input.reproSteps = options.reproSteps
    if (options.environment) input.environment = options.environment
    if (options.notes) input.notes = options.notes

    const bug = await repository.create(input)

    spinner.succeed(chalk.green('Bug 创建成功'))

    console.log()
    console.log(chalk.cyan('Bug ID:'), bug.id)
    console.log(chalk.cyan('标题:'), bug.title)
    console.log(chalk.cyan('状态:'), bug.status)
    console.log(chalk.cyan('严重程度:'), bug.severity)
    if (bug.specId) console.log(chalk.cyan('规格 ID:'), bug.specId)
    console.log()

    logger.info({ bugId: bug.id, title: bug.title }, 'Bug created')
  } catch (error) {
    spinner.fail(chalk.red('创建 Bug 失败'))
    logger.error({ error }, 'Create bug command failed')
    throw error
  }
}
