/**
 * @spec T004-lark-project-management
 * 更新 Product Backlog 记录状态
 *
 * 使用直接 API 调用，绕过 MCP，验证无重启 token 管理方案
 */

import chalk from 'chalk'
import logger from '../../utils/logger.js'
import { LarkBitableService } from '../../services/lark-bitable-service.js'
import { getConfig } from '../../config/config-manager.js'

export interface UpdateBacklogStatusOptions {
  recordId: string
  status: string
}

export async function updateBacklogStatusCommand(options: UpdateBacklogStatusOptions): Promise<void> {
  try {
    console.log(chalk.blue('\n🔄 更新 Product Backlog 记录状态...\n'))

    const config = getConfig()
    const backlogTableId = config.tables?.backlog || config.tables?.productBacklog

    if (!backlogTableId) {
      throw new Error('未找到 Product Backlog 表配置')
    }

    console.log(chalk.gray(`- Record ID: ${options.recordId}`))
    console.log(chalk.gray(`- 新状态: ${options.status}\n`))

    // 使用新的服务层更新
    const bitableService = new LarkBitableService()
    await bitableService.updateRecord({
      app_token: config.appToken!,
      table_id: backlogTableId,
      record_id: options.recordId,
      fields: {
        '状态': options.status,
      },
    })

    console.log(chalk.green('\n✅ 状态更新成功！\n'))

    logger.info({ recordId: options.recordId, status: options.status }, 'Backlog status updated')
  } catch (error) {
    console.error(chalk.red('\n❌ 更新失败:'), (error as Error).message)
    logger.error({ error }, 'Failed to update backlog status')
    process.exit(1)
  }
}
