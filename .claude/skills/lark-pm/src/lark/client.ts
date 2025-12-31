/**
 * @spec T004-lark-project-management
 * Lark API client wrapper with retry logic
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
          throw new Error(`Failed to create Base App: ${response.msg}`)
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
          throw new Error(`Failed to create table: ${response.msg}`)
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
          throw new Error(`Failed to list tables: ${response.msg}`)
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
          throw new Error(`Failed to list fields: ${response.msg}`)
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
          throw new Error(`Failed to search records: ${response.msg}`)
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
          throw new Error(`Failed to create record: ${response.msg}`)
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
          throw new Error(`Failed to update record: ${response.msg}`)
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
