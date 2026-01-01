/**
 * @spec T004-lark-project-management
 * Token 管理器 - 动态管理和刷新 User Access Token
 *
 * 混合方案：
 * 1. TypeScript 代码管理 token 生命周期（加载、检测过期、刷新）
 * 2. 通过命令输出当前有效的 token
 * 3. Claude 在调用 MCP 工具时使用最新的 token
 *
 * 优势：
 * - 无需重启即可自动刷新 token
 * - TypeScript 控制 token 逻辑，MCP 只负责 API 调用
 * - 向后兼容现有架构
 */

import fsSync from 'fs'
import path from 'path'
import logger from './logger.js'
import { LarkOAuthHelper } from './lark-oauth-helper.js'

interface TokenInfo {
  accessToken: string
  refreshToken: string
  expiresAt: number // 过期时间戳（毫秒）
}

/**
 * Token 管理器
 *
 * 功能：
 * 1. 从 .env 加载 token
 * 2. 自动检测 token 过期并刷新
 * 3. 提供统一的 getToken() 接口
 * 4. 无需重启即可使用新 token
 */
export class TokenManager {
  private static instance: TokenManager
  private tokenInfo: TokenInfo | null = null
  private readonly REFRESH_BUFFER = 5 * 60 * 1000 // 提前 5 分钟刷新
  private readonly envPath: string

  private constructor() {
    this.envPath = path.join(process.cwd(), '.env')
    this.loadTokenFromEnv()
  }

  /**
   * 获取 TokenManager 单例
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  /**
   * 从 .env 文件加载 token 信息
   */
  private loadTokenFromEnv(): void {
    try {
      if (!fsSync.existsSync(this.envPath)) {
        logger.warn('No .env file found, token not loaded')
        return
      }

      const envContent = fsSync.readFileSync(this.envPath, 'utf-8')
      const accessToken = this.extractEnvValue(envContent, 'LARK_USER_ACCESS_TOKEN')
      const refreshToken = this.extractEnvValue(envContent, 'LARK_REFRESH_TOKEN')

      if (!accessToken || !refreshToken) {
        logger.warn('Token not found in .env file')
        return
      }

      // 假设 token 有效期为 2 小时（飞书默认）
      // 实际过期时间应该在 OAuth 时保存到 .env
      const expiresAt = Date.now() + 2 * 60 * 60 * 1000

      this.tokenInfo = {
        accessToken,
        refreshToken,
        expiresAt,
      }

      logger.info('Token loaded from .env file')
    } catch (error) {
      logger.error('Failed to load token from .env', error)
    }
  }

  /**
   * 从 .env 内容中提取环境变量值
   */
  private extractEnvValue(content: string, key: string): string | null {
    const regex = new RegExp(`^${key}=(.*)$`, 'm')
    const match = content.match(regex)
    return match ? match[1].trim() : null
  }

  /**
   * 获取有效的 access token
   *
   * 逻辑：
   * 1. 如果 token 未过期，直接返回
   * 2. 如果即将过期（5分钟内），自动刷新
   * 3. 如果已过期，刷新后返回
   */
  async getToken(): Promise<string> {
    // 首次调用或 token 不存在，尝试重新加载
    if (!this.tokenInfo) {
      this.loadTokenFromEnv()
    }

    if (!this.tokenInfo) {
      throw new Error(
        'No user access token found. Please run "/lark-pm auth" to obtain token.'
      )
    }

    // 检查是否需要刷新
    const now = Date.now()
    const needsRefresh = this.tokenInfo.expiresAt - now < this.REFRESH_BUFFER

    if (needsRefresh) {
      logger.info('Token is expiring soon, refreshing...')
      await this.refreshToken()
    }

    return this.tokenInfo.accessToken
  }

  /**
   * 刷新 access token
   */
  private async refreshToken(): Promise<void> {
    if (!this.tokenInfo) {
      throw new Error('Cannot refresh token: token info not available')
    }

    const appId = process.env.LARK_APP_ID
    const appSecret = process.env.LARK_APP_SECRET

    if (!appId || !appSecret) {
      throw new Error('LARK_APP_ID or LARK_APP_SECRET not configured')
    }

    try {
      const helper = new LarkOAuthHelper(appId, appSecret)
      const newAccessToken = await helper.refreshToken(this.tokenInfo.refreshToken)

      // 更新内存中的 token
      this.tokenInfo.accessToken = newAccessToken
      this.tokenInfo.expiresAt = Date.now() + 2 * 60 * 60 * 1000 // 2 小时

      // 保存到 .env 文件
      await helper.saveRefreshedTokenToEnv(newAccessToken)

      logger.info('Token refreshed successfully')
    } catch (error) {
      logger.error('Failed to refresh token', error)
      throw new Error('Token refresh failed. Please run "/lark-pm auth" to re-authenticate.')
    }
  }

  /**
   * 强制重新加载 token（在 OAuth 后调用）
   */
  async reloadToken(): Promise<void> {
    logger.info('Reloading token from .env')
    this.loadTokenFromEnv()
  }

  /**
   * 手动设置 token（在 OAuth 成功后调用）
   */
  setToken(accessToken: string, refreshToken: string, expiresIn: number): void {
    this.tokenInfo = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000,
    }
    logger.info('Token set manually', { expiresIn })
  }

  /**
   * 检查 token 是否已配置
   */
  hasToken(): boolean {
    return this.tokenInfo !== null
  }

  /**
   * 获取 token 过期时间（用于调试）
   */
  getTokenExpiry(): Date | null {
    return this.tokenInfo ? new Date(this.tokenInfo.expiresAt) : null
  }
}
