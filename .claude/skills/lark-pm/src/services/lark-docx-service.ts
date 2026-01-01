/**
 * @spec T004-lark-project-management
 * 飞书文档服务 - 直接调用飞书文档 API
 *
 * 绕过 MCP 工具，直接使用 HTTP 调用飞书文档 API
 * 解决 MCP 环境变量不刷新的问题
 */

import { LarkApiClient } from './lark-api-client.js'
import logger from '../utils/logger.js'

export interface ImportDocxRequest {
  file_name: string
  markdown: string
}

export interface ImportDocxResponse {
  document_id: string
}

/**
 * 飞书文档服务
 */
export class LarkDocxService {
  private client: LarkApiClient

  constructor() {
    this.client = new LarkApiClient()
  }

  /**
   * 导入 Markdown 文档到飞书
   *
   * 注意：飞书官方 API 中的 import 接口是内置接口，需要使用特殊的方式调用
   * 这里使用正确的 API 端点
   */
  async importMarkdown(request: ImportDocxRequest): Promise<string> {
    try {
      logger.info({ fileName: request.file_name }, 'Importing markdown to Feishu')

      // 使用正确的 builtin API 端点
      const url = 'https://open.feishu.cn/open-apis/docx/v1/documents/import'
      const tokenManager = this.client['tokenManager']
      const token = await tokenManager.getToken()

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_name: request.file_name,
          markdown: request.markdown,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error({ status: response.status, errorText }, 'Import API request failed')
        throw new Error(`Import failed: ${response.status} ${errorText}`)
      }

      const result: any = await response.json()

      if (result.code !== 0) {
        logger.error({ code: result.code, msg: result.msg }, 'Import API returned error')
        throw new Error(`Import error: ${result.code} - ${result.msg}`)
      }

      if (!result.data?.document_id) {
        throw new Error('Import failed: no document_id returned')
      }

      logger.info({ documentId: result.data.document_id }, 'Markdown imported successfully')
      return result.data.document_id
    } catch (error) {
      logger.error({ error }, 'Failed to import markdown')
      throw error
    }
  }

  /**
   * 搜索飞书文档
   *
   * 等价于 mcp__lark-mcp__docx_builtin_search
   */
  async searchDocuments(searchKey: string, options?: {
    docsTypes?: string[]
    ownerIds?: string[]
    chatIds?: string[]
    count?: number
    offset?: number
  }): Promise<any> {
    try {
      logger.info({ searchKey, options }, 'Searching Feishu documents')

      const response = await this.client.post(
        '/docx/v1/documents/search',
        {
          search_key: searchKey,
          docs_types: options?.docsTypes,
          owner_ids: options?.ownerIds,
          chat_ids: options?.chatIds,
          count: options?.count || 20,
          offset: options?.offset || 0,
        }
      )

      logger.info({ resultCount: response.data?.items?.length || 0 }, 'Search completed')
      return response.data
    } catch (error) {
      logger.error({ error }, 'Failed to search documents')
      throw error
    }
  }

  /**
   * 获取文档原始内容
   *
   * 等价于 mcp__lark-mcp__docx_v1_document_rawContent
   */
  async getRawContent(documentId: string, lang?: number): Promise<string> {
    try {
      logger.info({ documentId, lang }, 'Getting document raw content')

      const queryParams = lang !== undefined ? `?lang=${lang}` : ''
      const response = await this.client.get(
        `/docx/v1/documents/${documentId}/raw_content${queryParams}`
      )

      if (!response.data?.content) {
        throw new Error('Failed to get raw content: no content returned')
      }

      logger.info({ contentLength: response.data.content.length }, 'Raw content retrieved')
      return response.data.content
    } catch (error) {
      logger.error({ error, documentId }, 'Failed to get raw content')
      throw error
    }
  }
}
