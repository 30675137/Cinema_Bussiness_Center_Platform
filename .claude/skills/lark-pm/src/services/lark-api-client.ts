/**
 * @spec T004-lark-project-management
 * Lark API 直接调用客户端 - 绕过 MCP，直接使用 HTTP 调用飞书 API
 *
 * 目的：解决 MCP 环境变量刷新问题
 * - MCP 服务器进程在启动时加载环境变量，之后不会重新加载
 * - 直接使用 fetch API 调用飞书，可以动态获取 TokenManager 的最新 token
 * - 完全绕过 MCP 层，实现真正的无重启 token 更新
 */

import logger from '../utils/logger.js'
import { TokenManager } from '../utils/token-manager.js'

const LARK_API_BASE = 'https://open.feishu.cn/open-apis'

export interface LarkApiResponse<T = any> {
  code: number
  msg: string
  data?: T
}

/**
 * Lark API 客户端
 *
 * 核心优势：
 * - 使用 TokenManager 动态获取最新 token
 * - 不依赖 MCP 环境变量
 * - 支持自动 token 刷新
 * - 无需重启 Claude Code
 */
export class LarkApiClient {
  private tokenManager: TokenManager

  constructor() {
    this.tokenManager = TokenManager.getInstance()
  }

  /**
   * 发送 HTTP 请求到飞书 API
   */
  private async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    useUserToken = true
  ): Promise<LarkApiResponse<T>> {
    try {
      // 动态获取最新 token（自动刷新过期 token）
      const token = useUserToken ? await this.tokenManager.getToken() : undefined

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const url = `${LARK_API_BASE}${path}`

      logger.debug({ method, url, hasBody: !!body }, 'Sending Lark API request')

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error({ status: response.status, errorText }, 'Lark API request failed')
        throw new Error(`Lark API request failed: ${response.status} ${errorText}`)
      }

      const result = await response.json() as LarkApiResponse<T>

      if (result.code !== 0) {
        logger.error({ code: result.code, msg: result.msg }, 'Lark API returned error')
        throw new Error(`Lark API error: ${result.code} - ${result.msg}`)
      }

      logger.debug({ code: result.code }, 'Lark API request successful')
      return result
    } catch (error) {
      logger.error({ error, path }, 'Lark API request exception')
      throw error
    }
  }

  /**
   * GET 请求
   */
  async get<T = any>(path: string, useUserToken = true): Promise<LarkApiResponse<T>> {
    return this.request<T>('GET', path, undefined, useUserToken)
  }

  /**
   * POST 请求
   */
  async post<T = any>(path: string, body: any, useUserToken = true): Promise<LarkApiResponse<T>> {
    return this.request<T>('POST', path, body, useUserToken)
  }

  /**
   * PUT 请求
   */
  async put<T = any>(path: string, body: any, useUserToken = true): Promise<LarkApiResponse<T>> {
    return this.request<T>('PUT', path, body, useUserToken)
  }

  /**
   * DELETE 请求
   */
  async delete<T = any>(path: string, useUserToken = true): Promise<LarkApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, useUserToken)
  }
}
