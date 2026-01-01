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
   * 正确的流程（根据飞书官方文档）：
   * 1. 创建一个空的 docx 文档
   * 2. 将 Markdown 转换为文档块（blocks）
   * 3. 将块插入到文档中
   */
  async importMarkdown(request: ImportDocxRequest): Promise<string> {
    try {
      logger.info({ fileName: request.file_name }, 'Importing markdown to Feishu')

      // Step 1: 创建空文档
      logger.info('Step 1: Creating empty document')
      const createResponse = await this.client.post('/docx/v1/documents', {
        title: request.file_name,
      })

      const documentId = createResponse.data.document.document_id
      logger.info({ documentId }, 'Document created')

      // Step 2: 将 Markdown 转换为文档块
      logger.info('Step 2: Converting markdown to blocks')
      const convertResponse = await this.client.post(
        '/docx/v1/documents/blocks/convert',
        {
          content: request.markdown,
          content_type: 'markdown',
          rich_text_type: 'common',
        }
      )

      const blocks = convertResponse.data.blocks
      logger.info({ blockCount: blocks?.length || 0 }, 'Markdown converted to blocks')

      // Step 3: 将块插入到文档中
      if (blocks && blocks.length > 0) {
        logger.info('Step 3: Inserting blocks into document')

        // 获取文档根块 ID
        const docResponse = await this.client.get(`/docx/v1/documents/${documentId}`)
        const rootBlockId = docResponse.data.document.body.block_id

        // 批量插入块
        await this.client.post(
          `/docx/v1/documents/${documentId}/blocks/${rootBlockId}/children/batch_create`,
          {
            children: blocks,
          }
        )

        logger.info({ documentId }, 'Blocks inserted successfully')
      }

      logger.info({ documentId }, 'Markdown imported successfully')
      return documentId
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
