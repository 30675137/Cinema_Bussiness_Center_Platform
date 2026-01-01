/**
 * @spec T004-lark-project-management
 * 飞书多维表格服务 - 直接调用飞书多维表格 API
 *
 * 绕过 MCP 工具，直接使用 HTTP 调用飞书多维表格 API
 * 解决 MCP 环境变量不刷新的问题
 */

import { LarkApiClient } from './lark-api-client.js'
import logger from '../utils/logger.js'

export interface SearchRecordsRequest {
  app_token: string
  table_id: string
  filter?: {
    conjunction?: 'and' | 'or'
    conditions?: Array<{
      field_name: string
      operator: string
      value?: string[]
    }>
  }
  sort?: Array<{
    field_name: string
    desc?: boolean
  }>
  field_names?: string[]
  page_size?: number
  page_token?: string
}

export interface UpdateRecordRequest {
  app_token: string
  table_id: string
  record_id: string
  fields: Record<string, any>
}

export interface CreateRecordRequest {
  app_token: string
  table_id: string
  fields: Record<string, any>
}

/**
 * 飞书多维表格服务
 */
export class LarkBitableService {
  private client: LarkApiClient

  constructor() {
    this.client = new LarkApiClient()
  }

  /**
   * 搜索记录
   *
   * 等价于 mcp__lark-mcp__bitable_v1_appTableRecord_search
   */
  async searchRecords(request: SearchRecordsRequest): Promise<any> {
    try {
      logger.info({
        appToken: request.app_token,
        tableId: request.table_id,
        hasFilter: !!request.filter
      }, 'Searching bitable records')

      const response = await this.client.post(
        `/bitable/v1/apps/${request.app_token}/tables/${request.table_id}/records/search`,
        {
          filter: request.filter,
          sort: request.sort,
          field_names: request.field_names,
          page_size: request.page_size || 20,
          page_token: request.page_token,
        }
      )

      logger.info({
        recordCount: response.data?.items?.length || 0
      }, 'Records search completed')

      return response.data
    } catch (error) {
      logger.error({ error }, 'Failed to search records')
      throw error
    }
  }

  /**
   * 更新记录
   *
   * 等价于 mcp__lark-mcp__bitable_v1_appTableRecord_update
   */
  async updateRecord(request: UpdateRecordRequest): Promise<any> {
    try {
      logger.info({
        appToken: request.app_token,
        tableId: request.table_id,
        recordId: request.record_id
      }, 'Updating bitable record')

      const response = await this.client.put(
        `/bitable/v1/apps/${request.app_token}/tables/${request.table_id}/records/${request.record_id}`,
        {
          fields: request.fields,
        }
      )

      logger.info({ recordId: request.record_id }, 'Record updated successfully')
      return response.data
    } catch (error) {
      logger.error({ error, recordId: request.record_id }, 'Failed to update record')
      throw error
    }
  }

  /**
   * 创建记录
   *
   * 等价于 mcp__lark-mcp__bitable_v1_appTableRecord_create
   */
  async createRecord(request: CreateRecordRequest): Promise<any> {
    try {
      logger.info({
        appToken: request.app_token,
        tableId: request.table_id
      }, 'Creating bitable record')

      const response = await this.client.post(
        `/bitable/v1/apps/${request.app_token}/tables/${request.table_id}/records`,
        {
          fields: request.fields,
        }
      )

      logger.info({
        recordId: response.data?.record?.record_id
      }, 'Record created successfully')

      return response.data
    } catch (error) {
      logger.error({ error }, 'Failed to create record')
      throw error
    }
  }

  /**
   * 列出表格字段
   *
   * 等价于 mcp__lark-mcp__bitable_v1_appTableField_list
   */
  async listFields(appToken: string, tableId: string): Promise<any> {
    try {
      logger.info({ appToken, tableId }, 'Listing bitable fields')

      const response = await this.client.get(
        `/bitable/v1/apps/${appToken}/tables/${tableId}/fields`
      )

      logger.info({
        fieldCount: response.data?.items?.length || 0
      }, 'Fields listed successfully')

      return response.data
    } catch (error) {
      logger.error({ error, appToken, tableId }, 'Failed to list fields')
      throw error
    }
  }
}
