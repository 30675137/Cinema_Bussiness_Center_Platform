/**
 * @spec T004-lark-project-management
 * Lark API client wrapper with retry logic
 *
 * Updated based on clarifications:
 * - Enhanced permission error handling (403 errors)
 * - User-friendly error messages for common permission issues
 */

import * as lark from '@larksuiteoapi/node-sdk'
import type {
  LarkBaseApp,
  LarkTable,
  LarkField,
  LarkRecord,
  LarkListRecordsResponse,
  LarkSearchRecordsRequest,
} from '../types/lark-api.js'
import { loadLarkConfig } from '../config/lark-config.js'
import { withRetry } from '../utils/retry.js'
import logger from '../utils/logger.js'

/**
 * Custom error for permission issues
 */
export class LarkPermissionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LarkPermissionError'
  }
}

export class LarkClient {
  private client: lark.Client

  constructor() {
    const config = loadLarkConfig()
    this.client = new lark.Client({
      appId: config.appId,
      appSecret: config.appSecret,
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    })
  }

  /**
   * Handle Lark API errors with user-friendly messages
   */
  private handleLarkError(response: any, operation: string): void {
    // Check for permission errors (code 99991663 or HTTP 403)
    if (response.code === 99991663 || response.code === 403) {
      throw new LarkPermissionError(
        `权限不足：无法${operation}。请检查以下事项：\n` +
          `1. 确认 Base App Token 是否正确\n` +
          `2. 确认您的飞书应用是否有访问该 Base 的权限\n` +
          `3. 在飞书 Base 中，进入「设置」->「权限管理」，添加应用的访问权限\n` +
          `4. 如果问题持续，请联系 Base 管理员授予权限`
      )
    }

    // Generic error
    throw new Error(`${operation}失败: ${response.msg || '未知错误'}`)
  }

  /**
   * Create a new Base App
   */
  async createBaseApp(name: string, folderToken?: string): Promise<LarkBaseApp> {
    return withRetry(
      async () => {
        logger.info({ name, folderToken }, 'Creating Base App')
        const response = await this.client.bitable.app.create({
          data: {
            name,
            folder_token: folderToken,
          },
        })

        if (response.code !== 0) {
          this.handleLarkError(response, '创建 Base App')
        }

        logger.info({ appToken: response.data?.app?.app_token }, 'Base App created')
        return response.data!.app as LarkBaseApp
      },
      {
        onRetry: (error, attempt) => {
          logger.warn({ error, attempt }, 'Retrying createBaseApp')
        },
      }
    )
  }

  /**
   * Create a new table in Base App
   */
  async createTable(
    appToken: string,
    name: string,
    fields?: Array<{ field_name: string; type: number }>
  ): Promise<LarkTable> {
    return withRetry(
      async () => {
        logger.info({ appToken, name }, 'Creating table')
        const response = await this.client.bitable.appTable.create({
          path: { app_token: appToken },
          data: {
            table: {
              name,
              fields,
            },
          },
        })

        if (response.code !== 0) {
          this.handleLarkError(response, '创建数据表')
        }

        logger.info({ tableId: response.data?.table_id }, 'Table created')
        return response.data as LarkTable
      },
      {
        onRetry: (error, attempt) => {
          logger.warn({ error, attempt }, 'Retrying createTable')
        },
      }
    )
  }

  /**
   * List all tables in Base App
   */
  async listTables(appToken: string): Promise<LarkTable[]> {
    return withRetry(
      async () => {
        logger.info({ appToken }, 'Listing tables')
        const response = await this.client.bitable.appTable.list({
          path: { app_token: appToken },
        })

        if (response.code !== 0) {
          this.handleLarkError(response, '列出数据表')
        }

        return (response.data?.items || []) as LarkTable[]
      },
      {
        onRetry: (error, attempt) => {
          logger.warn({ error, attempt }, 'Retrying listTables')
        },
      }
    )
  }

  /**
   * List all fields in a table
   */
  async listFields(appToken: string, tableId: string): Promise<LarkField[]> {
    return withRetry(
      async () => {
        logger.info({ appToken, tableId }, 'Listing fields')
        const response = await this.client.bitable.appTableField.list({
          path: { app_token: appToken, table_id: tableId },
        })

        if (response.code !== 0) {
          this.handleLarkError(response, '列出字段')
        }

        return (response.data?.items || []) as LarkField[]
      },
      {
        onRetry: (error, attempt) => {
          logger.warn({ error, attempt }, 'Retrying listFields')
        },
      }
    )
  }

  /**
   * Search records in a table
   */
  async searchRecords(
    appToken: string,
    tableId: string,
    request: LarkSearchRecordsRequest
  ): Promise<LarkListRecordsResponse> {
    return withRetry(
      async () => {
        logger.info({ appToken, tableId, request }, 'Searching records')
        const response = await this.client.bitable.appTableRecord.search({
          path: { app_token: appToken, table_id: tableId },
          data: request,
        })

        if (response.code !== 0) {
          this.handleLarkError(response, '查询记录')
        }

        return {
          has_more: response.data?.has_more || false,
          page_token: response.data?.page_token,
          total: response.data?.total || 0,
          items: (response.data?.items || []) as LarkRecord[],
        }
      },
      {
        onRetry: (error, attempt) => {
          logger.warn({ error, attempt }, 'Retrying searchRecords')
        },
      }
    )
  }

  /**
   * Create a new record
   */
  async createRecord(
    appToken: string,
    tableId: string,
    fields: Record<string, any>
  ): Promise<LarkRecord> {
    return withRetry(
      async () => {
        logger.info({ appToken, tableId, fields }, 'Creating record')
        const response = await this.client.bitable.appTableRecord.create({
          path: { app_token: appToken, table_id: tableId },
          data: { fields },
        })

        if (response.code !== 0) {
          this.handleLarkError(response, '创建记录')
        }

        logger.info({ recordId: response.data?.record?.record_id }, 'Record created')
        return response.data!.record as LarkRecord
      },
      {
        onRetry: (error, attempt) => {
          logger.warn({ error, attempt }, 'Retrying createRecord')
        },
      }
    )
  }

  /**
   * Update an existing record
   */
  async updateRecord(
    appToken: string,
    tableId: string,
    recordId: string,
    fields: Record<string, any>
  ): Promise<LarkRecord> {
    return withRetry(
      async () => {
        logger.info({ appToken, tableId, recordId, fields }, 'Updating record')
        const response = await this.client.bitable.appTableRecord.update({
          path: { app_token: appToken, table_id: tableId, record_id: recordId },
          data: { fields },
        })

        if (response.code !== 0) {
          this.handleLarkError(response, '更新记录')
        }

        logger.info({ recordId }, 'Record updated')
        return response.data!.record as LarkRecord
      },
      {
        onRetry: (error, attempt) => {
          logger.warn({ error, attempt }, 'Retrying updateRecord')
        },
      }
    )
  }
}
