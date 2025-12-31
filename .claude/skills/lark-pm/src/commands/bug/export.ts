/**
 * @spec T004-lark-project-management
 * Export bugs command (Excel/CSV)
 */

import { BugRepository, BugFilter } from '../../repositories/bug-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { Bug, BugStatus, BugSeverity } from '../../models/bug.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'
import XLSX from 'xlsx'
import { parse as json2csv } from 'json2csv'
import fs from 'fs/promises'

export interface ExportBugOptions {
  format: 'excel' | 'csv'
  output: string
  status?: string
  severity?: string
  specId?: string
}

export async function exportBugsCommand(options: ExportBugOptions): Promise<void> {
  const spinner = ora('导出 Bug 数据...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.bugs) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    const client = new LarkClient()
    const repository = new BugRepository(client, config.baseAppToken, config.tableIds.bugs)

    const filter: BugFilter = {}
    if (options.status) filter.status = options.status as BugStatus
    if (options.severity) filter.severity = options.severity as BugSeverity
    if (options.specId) filter.specId = options.specId

    const bugs = await repository.list({ filter })

    spinner.text = `正在导出 ${bugs.length} 个 Bug 到 ${options.format.toUpperCase()}...`

    if (options.format === 'excel') {
      await exportToExcel(bugs, options.output)
    } else {
      await exportToCSV(bugs, options.output)
    }

    spinner.succeed(chalk.green(`成功导出到 ${options.output}`))

    logger.info({ count: bugs.length, format: options.format, output: options.output }, 'Bugs exported')
  } catch (error) {
    spinner.fail(chalk.red('导出 Bug 失败'))
    logger.error({ error }, 'Export bugs command failed')
    throw error
  }
}

async function exportToExcel(bugs: Bug[], outputPath: string): Promise<void> {
  const data = bugs.map((bug) => ({
    ID: bug.id,
    标题: bug.title,
    严重程度: bug.severity,
    状态: bug.status,
    规格ID: bug.specId || '',
    报告人: bug.reporter || '',
    负责人: bug.assignee || '',
    发现日期: bug.foundDate ? new Date(bug.foundDate).toLocaleDateString() : '',
    修复日期: bug.fixedDate ? new Date(bug.fixedDate).toLocaleDateString() : '',
    复现步骤: bug.reproSteps || '',
    环境: bug.environment || '',
    备注: bug.notes || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Bug列表')

  XLSX.writeFile(workbook, outputPath)
}

async function exportToCSV(bugs: Bug[], outputPath: string): Promise<void> {
  const data = bugs.map((bug) => ({
    ID: bug.id,
    标题: bug.title,
    严重程度: bug.severity,
    状态: bug.status,
    规格ID: bug.specId || '',
    报告人: bug.reporter || '',
    负责人: bug.assignee || '',
    发现日期: bug.foundDate ? new Date(bug.foundDate).toLocaleDateString() : '',
    修复日期: bug.fixedDate ? new Date(bug.fixedDate).toLocaleDateString() : '',
    复现步骤: bug.reproSteps || '',
    环境: bug.environment || '',
    备注: bug.notes || '',
  }))

  const csv = json2csv(data, {
    fields: ['ID', '标题', '严重程度', '状态', '规格ID', '报告人', '负责人', '发现日期', '修复日期', '复现步骤', '环境', '备注'],
  })

  await fs.writeFile(outputPath, '\uFEFF' + csv, 'utf-8')
}
