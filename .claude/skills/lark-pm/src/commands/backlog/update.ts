/**
 * @spec T004-lark-project-management
 * 更新 Product Backlog 记录（通用更新）
 *
 * 使用直接 API 调用，绕过 MCP
 */

import chalk from 'chalk'
import logger from '../../utils/logger.js'
import { LarkBitableService } from '../../services/lark-bitable-service.js'
import { getConfig } from '../../config/config-manager.js'

export interface UpdateBacklogOptions {
  recordId: string
  status?: string
  priority?: string
  type?: string
  specId?: string
  assignee?: string
  description?: string
}

export async function updateBacklogCommand(options: UpdateBacklogOptions): Promise<void> {
  try {
    console.log(chalk.blue('\n🔄 更新 Product Backlog 记录...\n'))

    const config = getConfig()
    const backlogTableId = config.tables?.backlog || config.tables?.productBacklog

    if (!backlogTableId) {
      throw new Error('未找到 Product Backlog 表配置')
    }

    // 构建更新字段
    const fields: Record<string, any> = {}

    if (options.status) {
      fields['状态'] = options.status
    }

    if (options.priority) {
      fields['优先级'] = options.priority
    }

    if (options.type) {
      fields['类型'] = options.type
    }

    if (options.specId) {
      fields['spec_id'] = options.specId
    }

    if (options.assignee) {
      fields['负责人'] = options.assignee
    }

    if (options.description) {
      fields['描述'] = options.description
    }

    if (Object.keys(fields).length === 0) {
      throw new Error('至少需要提供一个要更新的字段')
    }

    console.log(chalk.gray(`- Record ID: ${options.recordId}`))
    console.log(chalk.gray(`- 更新字段: ${Object.keys(fields).join(', ')}\n`))

    // 使用新的服务层更新
    const bitableService = new LarkBitableService()
    await bitableService.updateRecord({
      app_token: config.appToken!,
      table_id: backlogTableId,
      record_id: options.recordId,
      fields,
    })

    console.log(chalk.green('\n✅ 更新成功！\n'))

    logger.info({ recordId: options.recordId, fields }, 'Backlog record updated')
  } catch (error) {
    console.error(chalk.red('\n❌ 更新失败:'), (error as Error).message)
    logger.error({ error }, 'Failed to update backlog record')
    process.exit(1)
  }
}
