/**
 * @spec T004-lark-project-management
 * Backlog 数据访问层
 */

import type { Backlog, BacklogInput } from '../models/backlog.js'
import { backlogToLarkFields, larkFieldsToBacklog } from '../models/backlog.js'
import { LarkClient } from '../lark/client.js'
import type { LarkRecord } from '../types/lark-api.js'
import logger from '../utils/logger.js'

export interface BacklogListOptions {
  pageSize?: number
  pageToken?: string
  filter?: string
}

export class BacklogRepository {
  constructor(
    private larkClient: LarkClient,
    private appToken: string,
    private tableId: string
  ) {}

  /**
   * 创建 Backlog
   */
  async create(backlog: BacklogInput): Promise<Backlog> {
    logger.info({ title: backlog.title }, 'Creating backlog')

    const fields = backlogToLarkFields(backlog)
    const record = await this.larkClient.createRecord(this.appToken, this.tableId, fields)

    logger.info({ recordId: record.record_id }, 'Backlog created')

    return this.mapRecordToBacklog(record)
  }

  /**
   * 列出 Backlog
   */
  async list(options?: BacklogListOptions): Promise<{ items: Backlog[]; total: number; hasMore: boolean }> {
    logger.info({ options }, 'Listing backlogs')

    const searchRequest: any = {}

    if (options?.filter) {
      searchRequest.filter = {
        conjunction: 'and',
        conditions: [
          {
            field_name: '状态',
            operator: 'isNotEmpty',
            value: [],
          },
        ],
      }
    }

    if (options?.pageSize) {
      searchRequest.page_size = options.pageSize
    }

    if (options?.pageToken) {
      searchRequest.page_token = options.pageToken
    }

    const response = await this.larkClient.searchRecords(this.appToken, this.tableId, searchRequest)

    const items = response.items.map((item: LarkRecord) => this.mapRecordToBacklog(item))

    logger.info({ count: items.length, total: response.total }, 'Backlogs listed')

    return {
      items,
      total: response.total || items.length,
      hasMore: !!response.page_token,
    }
  }

  /**
   * 更新 Backlog
   */
  async update(backlogId: string, updates: Partial<BacklogInput>): Promise<void> {
    logger.info({ backlogId, updates }, 'Updating backlog')

    const fields = backlogToLarkFields(updates as BacklogInput)
    await this.larkClient.updateRecord(this.appToken, this.tableId, backlogId, fields)

    logger.info({ backlogId }, 'Backlog updated')
  }

  /**
   * 删除 Backlog (软删除: 设置为已拒绝)
   */
  async delete(backlogId: string): Promise<void> {
    logger.info({ backlogId }, 'Deleting backlog (soft delete)')

    await this.larkClient.updateRecord(this.appToken, this.tableId, backlogId, {
      状态: '❌ 已拒绝',
    })

    logger.info({ backlogId }, 'Backlog marked as rejected')
  }

  /**
   * 将 Lark 记录映射为 Backlog 对象
   */
  private mapRecordToBacklog(record: LarkRecord): Backlog {
    return larkFieldsToBacklog(record.record_id, record.fields)
  }
}
