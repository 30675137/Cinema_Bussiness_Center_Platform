/**
 * @spec T004-lark-project-management
 * Export tasks command (Excel/CSV)
 */

import { TaskRepository, TaskFilter } from '../../repositories/task-repository.js'
import { LarkClient } from '../../lark/client.js'
import { loadConfig } from '../../config/config-manager.js'
import { Task, TaskStatus, TaskPriority } from '../../models/task.js'
import logger from '../../utils/logger.js'
import chalk from 'chalk'
import ora from 'ora'
import XLSX from 'xlsx'
import { parse as json2csv } from 'json2csv'
import fs from 'fs/promises'

export interface ExportTaskOptions {
  format: 'excel' | 'csv'
  output: string
  status?: string
  priority?: string
  specId?: string
}

export async function exportTasksCommand(options: ExportTaskOptions): Promise<void> {
  const spinner = ora('导出任务数据...').start()

  try {
    const config = await loadConfig()

    if (!config.baseAppToken || !config.tableIds?.tasks) {
      spinner.fail(chalk.red('未找到配置，请先运行 init 命令'))
      return
    }

    const client = new LarkClient()
    const repository = new TaskRepository(
      client,
      config.baseAppToken,
      config.tableIds.tasks
    )

    // Build filter
    const filter: TaskFilter = {}
    if (options.status) filter.status = options.status as TaskStatus
    if (options.priority) filter.priority = options.priority as TaskPriority
    if (options.specId) filter.specId = options.specId

    const tasks = await repository.list({ filter })

    spinner.text = `正在导出 ${tasks.length} 个任务到 ${options.format.toUpperCase()}...`

    if (options.format === 'excel') {
      await exportToExcel(tasks, options.output)
    } else {
      await exportToCSV(tasks, options.output)
    }

    spinner.succeed(chalk.green(`成功导出到 ${options.output}`))

    logger.info(
      { count: tasks.length, format: options.format, output: options.output },
      'Tasks exported'
    )
  } catch (error) {
    spinner.fail(chalk.red('导出任务失败'))
    logger.error({ error }, 'Export tasks command failed')
    throw error
  }
}

/**
 * Export tasks to Excel
 */
async function exportToExcel(tasks: Task[], outputPath: string): Promise<void> {
  const data = tasks.map((task) => ({
    ID: task.id,
    标题: task.title,
    优先级: task.priority,
    状态: task.status,
    规格ID: task.specId || '',
    负责人: task.assignees?.join(', ') || '',
    截止日期: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
    标签: task.tags?.join(', ') || '',
    进度: task.progress !== undefined ? `${task.progress}%` : '',
    预计工时: task.estimatedHours || '',
    实际工时: task.actualHours || '',
    备注: task.notes || '',
    创建时间: task.createdTime
      ? new Date(task.createdTime).toLocaleString()
      : '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '任务列表')

  XLSX.writeFile(workbook, outputPath)
}

/**
 * Export tasks to CSV
 */
async function exportToCSV(tasks: Task[], outputPath: string): Promise<void> {
  const data = tasks.map((task) => ({
    ID: task.id,
    标题: task.title,
    优先级: task.priority,
    状态: task.status,
    规格ID: task.specId || '',
    负责人: task.assignees?.join('; ') || '',
    截止日期: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
    标签: task.tags?.join('; ') || '',
    进度: task.progress !== undefined ? task.progress : '',
    预计工时: task.estimatedHours || '',
    实际工时: task.actualHours || '',
    备注: task.notes || '',
    创建时间: task.createdTime
      ? new Date(task.createdTime).toLocaleString()
      : '',
  }))

  const csv = json2csv(data, {
    fields: [
      'ID',
      '标题',
      '优先级',
      '状态',
      '规格ID',
      '负责人',
      '截止日期',
      '标签',
      '进度',
      '预计工时',
      '实际工时',
      '备注',
      '创建时间',
    ],
  })

  await fs.writeFile(outputPath, '\uFEFF' + csv, 'utf-8') // Add BOM for Excel compatibility
}
