/**
 * @spec T004-lark-project-management
 * 获取当前有效的 User Access Token
 *
 * 用途：
 * - 供 Claude 在调用 MCP 工具前获取最新的 token
 * - 自动检测并刷新过期的 token
 * - 输出 JSON 格式方便解析
 */

import { TokenManager } from '../utils/token-manager.js'
import logger from '../utils/logger.js'

export async function getTokenCommand(): Promise<void> {
  try {
    const tokenManager = TokenManager.getInstance()

    // 获取有效的 token（自动刷新如果需要）
    const token = await tokenManager.getToken()
    const expiry = tokenManager.getTokenExpiry()

    // 输出 JSON 格式（方便 Claude 解析）
    const result = {
      success: true,
      token,
      expiresAt: expiry?.toISOString(),
      message: 'Token is valid',
    }

    console.log(JSON.stringify(result, null, 2))

    // 调试信息（写入日志，不输出到控制台）
    logger.info({
      tokenLength: token.length,
      expiresAt: expiry?.toISOString(),
    }, 'Token retrieved successfully')
  } catch (error) {
    logger.error('Failed to get token', error)

    const errorResult = {
      success: false,
      error: (error as Error).message,
      message: 'Failed to get token. Please run "/lark-pm auth" to authenticate.',
    }

    console.log(JSON.stringify(errorResult, null, 2))
    process.exit(1)
  }
}
