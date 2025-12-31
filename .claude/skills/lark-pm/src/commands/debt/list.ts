/**
 * @spec T004-lark-project-management
 * List technical debts command with filtering and formatting
 *
 * Updated based on clarifications:
 * - Force pagination (default 20 per page, max 100)
 * - Add --page and --page-size parameters
 * - Display pagination info and navigation hints
 */

import { DebtRepository, DebtFilter } from '../../repositories/debt-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { DebtStatus, DebtSeverity } from '../../models/debt.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface ListDebtOptions {
  status?: string
  severity?: string
  specId?: string
  assignee?: string
  limit?: number
  page?: number
  pageSize?: number
}

export async function listDebtsCommand(options: ListDebtOptions): Promise<void> {
  const spinner = ora('加载技术债列表...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.technicalDebt) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    // Pagination setup (force pagination per clarification Q5)
    const page = options.page || 1
    const pageSize = Math.min(options.pageSize || 20, 100) // Max 100 per page

    const client = new LarkClient()
    const repository = new DebtRepository(
      client,
      config.baseAppToken,
      config.tableIds.technicalDebt
    )

    // Build filter
    const filter: DebtFilter = {}
    if (options.status) filter.status = options.status as DebtStatus
    if (options.severity) filter.severity = options.severity as DebtSeverity
    if (options.specId) filter.specId = options.specId
    if (options.assignee) filter.assignee = options.assignee

    // Fetch all matching debts to calculate total count
    const allDebts = await repository.list({ filter })
    const totalCount = allDebts.length

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalCount)
    const paginatedDebts = allDebts.slice(startIndex, endIndex)

    spinner.succeed(chalk.green(`找到 ${totalCount} 个技术债`))

    if (totalCount === 0) {
      console.log(chalk.gray('\n暂无技术债\n'))
      return
    }

    // Print debts table
    console.log()
    console.log(
      chalk.bold(
        `${'ID'.padEnd(20)} ${'标题'.padEnd(30)} ${'状态'.padEnd(12)} ${'严重程度'.padEnd(10)} ${'规格ID'.padEnd(10)}`
      )
    )
    console.log(chalk.gray('─'.repeat(100)))

    paginatedDebts.forEach((debt) => {
      const statusColor = getStatusColor(debt.status)
      const severityColor = getSeverityColor(debt.severity)

      const title = String(debt.title || '')
      const specId = String(debt.specId || '-')

      console.log(
        `${debt.id.substring(0, 18).padEnd(20)} ` +
          `${title.substring(0, 28).padEnd(30)} ` +
          `${statusColor(debt.status.padEnd(12))} ` +
          `${severityColor(debt.severity.padEnd(10))} ` +
          `${chalk.cyan(specId.padEnd(10))}`
      )
    })

    console.log()

    // Display pagination info (per clarification Q5)
    console.log(
      chalk.cyan(
        `显示第 ${startIndex + 1}-${endIndex} 条，共 ${totalCount} 条记录 | 第 ${page}/${totalPages} 页`
      )
    )

    // Display navigation hints
    if (page < totalPages) {
      console.log(chalk.gray(`使用 --page ${page + 1} 查看下一页`))
    }
    if (page > 1) {
      console.log(chalk.gray(`使用 --page ${page - 1} 查看上一页`))
    }
    console.log(chalk.gray(`使用 --page-size <数量> 调整每页显示数量 (最大100)`))
    console.log()

    logger.info({ count: paginatedDebts.length, totalCount, page, pageSize, filter }, 'Listed technical debts')
  } catch (error) {
    spinner.fail(chalk.red('获取技术债列表失败'))
    logger.error({ error }, 'List debts command failed')
    throw error
  }
}

function getStatusColor(status: DebtStatus): (text: string) => string {
  switch (status) {
    case DebtStatus.Resolved:
      return chalk.green
    case DebtStatus.InProgress:
      return chalk.blue
    case DebtStatus.Deferred:
      return chalk.gray
    default:
      return chalk.yellow
  }
}

function getSeverityColor(severity: DebtSeverity): (text: string) => string {
  switch (severity) {
    case DebtSeverity.Critical:
      return chalk.red
    case DebtSeverity.Medium:
      return chalk.yellow
    default:
      return chalk.green
  }
}
