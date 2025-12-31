/**
 * @spec T004-lark-project-management
 * Export technical debts command (Excel/CSV)
 */

import { DebtRepository, DebtFilter } from '../../repositories/debt-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { TechnicalDebt, DebtStatus, DebtSeverity } from '../../models/debt.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'
import XLSX from 'xlsx'
import { parse as json2csv } from 'json2csv'
import fs from 'fs/promises'

export interface ExportDebtOptions {
  format: 'excel' | 'csv'
  output: string
  status?: string
  severity?: string
  specId?: string
}

export async function exportDebtsCommand(options: ExportDebtOptions): Promise<void> {
  const spinner = ora('导出技术债数据...').start()

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

    // Build filter
    const filter: DebtFilter = {}
    if (options.status) filter.status = options.status as DebtStatus
    if (options.severity) filter.severity = options.severity as DebtSeverity
    if (options.specId) filter.specId = options.specId

    const debts = await repository.list({ filter })

    spinner.text = `正在导出 ${debts.length} 个技术债到 ${options.format.toUpperCase()}...`

    if (options.format === 'excel') {
      await exportToExcel(debts, options.output)
    } else {
      await exportToCSV(debts, options.output)
    }

    spinner.succeed(chalk.green(`成功导出到 ${options.output}`))

    logger.info(
      { count: debts.length, format: options.format, output: options.output },
      'Technical debts exported'
    )
  } catch (error) {
    spinner.fail(chalk.red('导出技术债失败'))
    logger.error({ error }, 'Export debts command failed')
    throw error
  }
}

/**
 * Export technical debts to Excel
 */
async function exportToExcel(debts: TechnicalDebt[], outputPath: string): Promise<void> {
  const data = debts.map((debt) => ({
    ID: debt.id,
    标题: debt.title,
    严重程度: debt.severity,
    状态: debt.status,
    规格ID: debt.specId || '',
    影响范围: debt.impact || '',
    负责人: debt.assignee || '',
    预估工时: debt.estimatedEffort || '',
    发现日期: debt.foundDate ? new Date(debt.foundDate).toLocaleDateString() : '',
    解决日期: debt.resolvedDate ? new Date(debt.resolvedDate).toLocaleDateString() : '',
    备注: debt.notes || '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '技术债列表')

  XLSX.writeFile(workbook, outputPath)
}

/**
 * Export technical debts to CSV
 */
async function exportToCSV(debts: TechnicalDebt[], outputPath: string): Promise<void> {
  const data = debts.map((debt) => ({
    ID: debt.id,
    标题: debt.title,
    严重程度: debt.severity,
    状态: debt.status,
    规格ID: debt.specId || '',
    影响范围: debt.impact || '',
    负责人: debt.assignee || '',
    预估工时: debt.estimatedEffort || '',
    发现日期: debt.foundDate ? new Date(debt.foundDate).toLocaleDateString() : '',
    解决日期: debt.resolvedDate ? new Date(debt.resolvedDate).toLocaleDateString() : '',
    备注: debt.notes || '',
  }))

  const csv = json2csv(data, {
    fields: [
      'ID',
      '标题',
      '严重程度',
      '状态',
      '规格ID',
      '影响范围',
      '负责人',
      '预估工时',
      '发现日期',
      '解决日期',
      '备注',
    ],
  })

  await fs.writeFile(outputPath, '\uFEFF' + csv, 'utf-8') // Add BOM for Excel compatibility
}
