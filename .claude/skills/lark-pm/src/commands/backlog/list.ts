/**
 * @spec T004-lark-project-management
 * 列出 Backlog 命令
 */

import chalk from 'chalk'
import { getConfig } from '../../config/config-manager.js'
import { LarkClient } from '../../lark/client.js'
import { BacklogRepository, BacklogListOptions } from '../../repositories/backlog-repository.js'
import logger from '../../utils/logger.js'

interface ListBacklogsOptions {
  status?: string
  priority?: string
  type?: string
  specId?: string
  assignee?: string
  page?: number
  pageSize?: number
  limit?: number
}

export async function listBacklogsCommand(options: ListBacklogsOptions): Promise<void> {
  const config = getConfig()

  if (!config.appToken || !config.tables?.backlog) {
    throw new Error(
      '未找到 Backlog 表配置。请先运行 /lark-pm init 初始化 Base App 和数据表。'
    )
  }

  const larkClient = new LarkClient()
  const backlogRepo = new BacklogRepository(larkClient, config.appToken, config.tables.backlog)

  // 构建查询选项
  const listOptions: BacklogListOptions = {}

  // 分页参数 (优先使用 page/pageSize, 向后兼容 limit)
  if (options.page !== undefined) {
    listOptions.pageToken = options.page > 1 ? String((options.page - 1) * (options.pageSize || 20)) : undefined
  }

  if (options.pageSize !== undefined) {
    listOptions.pageSize = Math.min(options.pageSize, 100)
  } else if (options.limit !== undefined) {
    listOptions.pageSize = Math.min(options.limit, 100)
  } else {
    listOptions.pageSize = 20
  }

  // 筛选条件
  const filterConditions: string[] = []

  if (options.status) {
    filterConditions.push(`CurrentValue.[状态] = "${parseStatusEmoji(options.status)}"`)
  }

  if (options.priority) {
    filterConditions.push(`CurrentValue.[优先级] = "${parsePriorityEmoji(options.priority)}"`)
  }

  if (options.type) {
    filterConditions.push(`CurrentValue.[类型] = "${parseTypeText(options.type)}"`)
  }

  if (options.specId) {
    filterConditions.push(`CurrentValue.[关联规格] = "${options.specId}"`)
  }

  if (filterConditions.length > 0) {
    listOptions.filter = filterConditions.join(' && ')
  }

  // 获取 Backlog 列表
  const result = await backlogRepo.list(listOptions)

  // 输出结果
  if (result.items.length === 0) {
    console.log(chalk.yellow('\n📋 未找到 Backlog 记录\n'))
    return
  }

  console.log(chalk.green(`\n✅ 找到 ${result.items.length} 条 Backlog 记录（总计 ${result.total} 条）\n`))

  result.items.forEach((backlog, index) => {
    console.log(chalk.cyan(`${index + 1}. [${backlog.id}]`))
    console.log(`   标题: ${backlog.title}`)
    console.log(`   类型: ${backlog.type}`)
    console.log(`   优先级: ${backlog.priority}`)
    console.log(`   状态: ${backlog.status}`)

    if (backlog.description) {
      console.log(`   描述: ${backlog.description.substring(0, 100)}${backlog.description.length > 100 ? '...' : ''}`)
    }

    if (backlog.specId) {
      console.log(`   规格: ${backlog.specId}`)
    }

    if (backlog.estimatedEffort) {
      console.log(`   预估工时: ${backlog.estimatedEffort} 小时`)
    }

    if (backlog.tags && backlog.tags.length > 0) {
      console.log(`   标签: ${backlog.tags.join(', ')}`)
    }

    console.log()
  })

  if (result.hasMore) {
    console.log(chalk.yellow('💡 提示: 还有更多记录，使用 --page 参数查看下一页\n'))
  }

  logger.info({ count: result.items.length, total: result.total }, 'Backlogs listed')
}

function parseStatusEmoji(status: string): string {
  const statusMap: Record<string, string> = {
    待评估: '📝 待评估',
    pending: '📝 待评估',
    已批准: '✅ 已批准',
    approved: '✅ 已批准',
    进行中: '🚀 进行中',
    'in-progress': '🚀 进行中',
    已完成: '✅ 已完成',
    done: '✅ 已完成',
    已拒绝: '❌ 已拒绝',
    rejected: '❌ 已拒绝',
  }

  return statusMap[status.toLowerCase()] || status
}

function parsePriorityEmoji(priority: string): string {
  const priorityMap: Record<string, string> = {
    高: '🔴 高',
    high: '🔴 高',
    中: '🟡 中',
    medium: '🟡 中',
    低: '🟢 低',
    low: '🟢 低',
  }

  return priorityMap[priority.toLowerCase()] || priority
}

function parseTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    功能需求: '功能需求',
    feature: '功能需求',
    功能增强: '功能增强',
    enhancement: '功能增强',
    技术债: '技术债',
    'tech-debt': '技术债',
    缺陷修复: '缺陷修复',
    bug: '缺陷修复',
    技术调研: '技术调研',
    research: '技术调研',
    文档: '文档',
    documentation: '文档',
    docs: '文档',
  }

  return typeMap[type.toLowerCase()] || type
}
