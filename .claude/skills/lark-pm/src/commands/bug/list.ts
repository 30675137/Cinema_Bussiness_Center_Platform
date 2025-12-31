/**
 * @spec T004-lark-project-management
 * List bugs command with filtering and formatting
 *
 * Updated based on clarifications:
 * - Force pagination (default 20 per page, max 100)
 * - Add --page and --page-size parameters
 * - Display pagination info and navigation hints
 */

import { BugRepository, BugFilter } from '../../repositories/bug-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { BugStatus, BugSeverity } from '../../models/bug.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'

export interface ListBugOptions {
  status?: string
  severity?: string
  specId?: string
  assignee?: string
  limit?: number
  page?: number
  pageSize?: number
}

export async function listBugsCommand(options: ListBugOptions): Promise<void> {
  const spinner = ora('加载 Bug 列表...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.bugs) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    // Pagination setup (force pagination per clarification Q5)
    const page = options.page || 1
    const pageSize = Math.min(options.pageSize || 20, 100) // Max 100 per page

    const client = new LarkClient()
    const repository = new BugRepository(client, config.baseAppToken, config.tableIds.bugs)

    // Build filter
    const filter: BugFilter = {}
    if (options.status) filter.status = options.status as BugStatus
    if (options.severity) filter.severity = options.severity as BugSeverity
    if (options.specId) filter.specId = options.specId
    if (options.assignee) filter.assignee = options.assignee

    // Fetch all matching bugs to calculate total count
    const allBugs = await repository.list({ filter })
    const totalCount = allBugs.length

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = Math.min(startIndex + pageSize, totalCount)
    const paginatedBugs = allBugs.slice(startIndex, endIndex)

    spinner.succeed(chalk.green(`找到 ${totalCount} 个 Bug`))

    if (totalCount === 0) {
      console.log(chalk.gray('\n暂无 Bug\n'))
      return
    }

    // Print bugs table
    console.log()
    console.log(
      chalk.bold(
        `${'ID'.padEnd(20)} ${'标题'.padEnd(30)} ${'状态'.padEnd(12)} ${'严重程度'.padEnd(10)} ${'规格ID'.padEnd(10)}`
      )
    )
    console.log(chalk.gray('─'.repeat(100)))

    paginatedBugs.forEach((bug) => {
      const statusColor = getStatusColor(bug.status)
      const severityColor = getSeverityColor(bug.severity)

      const title = String(bug.title || '')
      const specId = String(bug.specId || '-')

      console.log(
        `${bug.id.substring(0, 18).padEnd(20)} ` +
          `${title.substring(0, 28).padEnd(30)} ` +
          `${statusColor(bug.status.padEnd(12))} ` +
          `${severityColor(bug.severity.padEnd(10))} ` +
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

    logger.info({ count: paginatedBugs.length, totalCount, page, pageSize, filter }, 'Listed bugs')
  } catch (error) {
    spinner.fail(chalk.red('获取 Bug 列表失败'))
    logger.error({ error }, 'List bugs command failed')
    throw error
  }
}

function getStatusColor(status: BugStatus): (text: string) => string {
  switch (status) {
    case BugStatus.Fixed:
      return chalk.green
    case BugStatus.InProgress:
      return chalk.blue
    case BugStatus.WontFix:
      return chalk.gray
    default:
      return chalk.yellow
  }
}

function getSeverityColor(severity: BugSeverity): (text: string) => string {
  switch (severity) {
    case BugSeverity.Critical:
      return chalk.red
    case BugSeverity.Medium:
      return chalk.yellow
    default:
      return chalk.green
  }
}
