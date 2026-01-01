/**
 * @spec T004-lark-project-management
 * 创建 Backlog 命令
 */

import chalk from 'chalk'
import { getConfig } from '../../config/config-manager.js'
import { LarkClient } from '../../lark/client.js'
import { BacklogRepository } from '../../repositories/backlog-repository.js'
import type { BacklogInput } from '../../models/backlog.js'
import { BacklogPriority, BacklogStatus, BacklogType } from '../../models/backlog.js'
import logger from '../../utils/logger.js'

interface CreateBacklogOptions {
  title: string
  description?: string
  type?: string
  priority?: string
  status?: string
  reporter?: string
  assignee?: string
  specId?: string
  estimatedEffort?: number
  tags?: string[]
  notes?: string
}

export async function createBacklogCommand(options: CreateBacklogOptions): Promise<void> {
  const config = getConfig()

  if (!config.appToken || !config.tables?.backlog) {
    throw new Error(
      '未找到 Backlog 表配置。请先运行 /lark-pm init 初始化 Base App 和数据表。'
    )
  }

  const larkClient = new LarkClient()
  const backlogRepo = new BacklogRepository(larkClient, config.appToken, config.tables.backlog)

  // 构建 Backlog 输入
  const backlogInput: BacklogInput = {
    title: options.title,
    description: options.description,
    type: parseBacklogType(options.type),
    priority: parseBacklogPriority(options.priority),
    status: parseBacklogStatus(options.status),
    reporter: options.reporter,
    assignee: options.assignee,
    specId: options.specId,
    estimatedEffort: options.estimatedEffort,
    tags: options.tags,
    notes: options.notes,
  }

  // 创建 Backlog
  const backlog = await backlogRepo.create(backlogInput)

  // 输出成功信息
  console.log(chalk.green('\n✅ Backlog 创建成功！\n'))
  console.log(chalk.cyan('Backlog ID:'), backlog.id)
  console.log(chalk.cyan('标题:'), backlog.title)
  console.log(chalk.cyan('类型:'), backlog.type)
  console.log(chalk.cyan('优先级:'), backlog.priority)
  console.log(chalk.cyan('状态:'), backlog.status)

  if (backlog.description) {
    console.log(chalk.cyan('描述:'), backlog.description)
  }

  if (backlog.specId) {
    console.log(chalk.cyan('关联规格:'), backlog.specId)
  }

  if (backlog.estimatedEffort) {
    console.log(chalk.cyan('预估工时:'), `${backlog.estimatedEffort} 小时`)
  }

  if (backlog.tags && backlog.tags.length > 0) {
    console.log(chalk.cyan('标签:'), backlog.tags.join(', '))
  }

  logger.info({ backlogId: backlog.id }, 'Backlog created successfully')
}

function parseBacklogType(type?: string): BacklogType {
  if (!type) return BacklogType.Feature

  const typeMap: Record<string, BacklogType> = {
    功能需求: BacklogType.Feature,
    feature: BacklogType.Feature,
    功能增强: BacklogType.Enhancement,
    enhancement: BacklogType.Enhancement,
    技术债: BacklogType.TechDebt,
    'tech-debt': BacklogType.TechDebt,
    缺陷修复: BacklogType.Bug,
    bug: BacklogType.Bug,
    技术调研: BacklogType.Research,
    research: BacklogType.Research,
    文档: BacklogType.Documentation,
    documentation: BacklogType.Documentation,
    docs: BacklogType.Documentation,
  }

  return typeMap[type.toLowerCase()] || BacklogType.Feature
}

function parseBacklogPriority(priority?: string): BacklogPriority {
  if (!priority) return BacklogPriority.Medium

  const priorityMap: Record<string, BacklogPriority> = {
    高: BacklogPriority.High,
    high: BacklogPriority.High,
    中: BacklogPriority.Medium,
    medium: BacklogPriority.Medium,
    低: BacklogPriority.Low,
    low: BacklogPriority.Low,
  }

  return priorityMap[priority.toLowerCase()] || BacklogPriority.Medium
}

function parseBacklogStatus(status?: string): BacklogStatus {
  if (!status) return BacklogStatus.Pending

  const statusMap: Record<string, BacklogStatus> = {
    待评估: BacklogStatus.Pending,
    pending: BacklogStatus.Pending,
    已批准: BacklogStatus.Approved,
    approved: BacklogStatus.Approved,
    进行中: BacklogStatus.InProgress,
    'in-progress': BacklogStatus.InProgress,
    已完成: BacklogStatus.Done,
    done: BacklogStatus.Done,
    已拒绝: BacklogStatus.Rejected,
    rejected: BacklogStatus.Rejected,
  }

  return statusMap[status.toLowerCase()] || BacklogStatus.Pending
}
