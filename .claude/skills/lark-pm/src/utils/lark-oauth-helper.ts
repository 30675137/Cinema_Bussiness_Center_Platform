/**
 * @spec T004-lark-project-management
 * Lark OAuth 2.0 授权助手
 */
import open from 'open'
import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { OAuthCallbackServer } from './oauth-callback-server.js'
import logger from './logger.js'

export interface OAuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export class LarkOAuthHelper {
  private readonly APP_ID: string
  private readonly APP_SECRET: string
  private readonly REDIRECT_URI = 'http://localhost:8080/callback'
  private readonly SCOPES = [
    'bitable:app', // 多维表格权限
    'drive:drive', // 云文档权限(包含读写)
  ]

  constructor(appId: string, appSecret: string) {
    this.APP_ID = appId
    this.APP_SECRET = appSecret

    if (!this.APP_ID || !this.APP_SECRET) {
      throw new Error(
        'Missing APP_ID or APP_SECRET. Please configure them in .env file'
      )
    }
  }

  /**
   * 执行完整的 OAuth 授权流程
   */
  async authorize(): Promise<OAuthTokens> {
    console.log(chalk.bold.cyan('\n🚀 开始 OAuth 2.0 授权流程...\n'))

    try {
      // 1. 启动回调服务器
      const serverSpinner = ora('Step 1: 启动本地回调服务器...').start()
      const server = new OAuthCallbackServer()
      const codePromise = server.start(8080)
      serverSpinner.succeed('已启动回调服务器: http://localhost:8080')

      // 2. 生成授权 URL
      const urlSpinner = ora('Step 2: 生成授权链接...').start()
      const authUrl = this.buildAuthUrl()
      urlSpinner.succeed('已生成授权链接')
      console.log(chalk.dim(`   ${authUrl}\n`))

      // 3. 打开浏览器
      const browserSpinner = ora('Step 3: 正在打开浏览器...').start()
      await open(authUrl)
      browserSpinner.succeed('已打开浏览器')
      console.log(
        chalk.yellow(
          '   👉 请在浏览器中登录飞书并点击「同意授权」\n'
        )
      )

      // 4. 等待回调
      const authSpinner = ora('Step 4: 等待用户授权...').start()
      const code = await codePromise
      authSpinner.succeed('已获取 authorization_code')

      // 5. 交换 token
      const tokenSpinner = ora('Step 5: 正在交换 access_token...').start()
      const tokens = await this.exchangeCodeForToken(code)
      tokenSpinner.succeed('已获取 user_access_token')

      // 6. 保存到 .env
      const saveSpinner = ora('Step 6: 保存 token 到 .env 文件...').start()
      await this.saveTokensToEnv(tokens)
      saveSpinner.succeed('保存成功！')

      console.log(chalk.bold.green('\n🎉 OAuth 授权完成！\n'))
      console.log(
        chalk.dim(`   Access Token: ${tokens.accessToken.substring(0, 30)}...`)
      )
      console.log(chalk.dim(`   有效期: ${tokens.expiresIn / 3600} 小时\n`))

      return tokens
    } catch (error) {
      logger.error('OAuth authorization failed', error)
      throw error
    }
  }

  /**
   * 生成授权 URL
   */
  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      app_id: this.APP_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES.join(' '),
      state: this.generateRandomState(),
    })

    return `https://open.feishu.cn/open-apis/authen/v1/authorize?${params}`
  }

  /**
   * 获取 app_access_token
   */
  private async getAppAccessToken(): Promise<string> {
    logger.info('Getting app access token')

    const response = await fetch(
      'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          app_id: this.APP_ID,
          app_secret: this.APP_SECRET,
        }),
      }
    )

    const data = await response.json() as any

    if (data.code !== 0) {
      logger.error('Failed to get app access token', data)
      throw new Error(`Failed to get app access token: ${data.msg || JSON.stringify(data)}`)
    }

    return data.app_access_token
  }

  /**
   * 交换 code 为 token
   */
  private async exchangeCodeForToken(code: string): Promise<OAuthTokens> {
    logger.info('Exchanging authorization code for access token')

    // 先获取 app_access_token
    const appAccessToken = await this.getAppAccessToken()

    const response = await fetch(
      'https://open.feishu.cn/open-apis/authen/v1/oidc/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${appAccessToken}`,
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
        }),
      }
    )

    const data = await response.json() as any

    logger.info('Token exchange response', data)

    if (data.code !== 0) {
      logger.error('Failed to exchange code for token', data)
      throw new Error(`Failed to exchange code: ${data.msg || JSON.stringify(data)}`)
    }

    logger.info('Successfully obtained access token')

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresIn: data.data.expires_in,
    }
  }

  /**
   * 刷新 access token
   */
  async refreshToken(refreshToken: string): Promise<string> {
    logger.info('Refreshing access token')

    // 先获取 app_access_token
    const appAccessToken = await this.getAppAccessToken()

    const response = await fetch(
      'https://open.feishu.cn/open-apis/authen/v1/oidc/refresh_access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${appAccessToken}`,
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      }
    )

    const data = await response.json() as any

    logger.info('Token refresh response', data)

    if (data.code !== 0) {
      logger.error('Failed to refresh token', data)
      throw new Error(`Failed to refresh token: ${data.msg || JSON.stringify(data)}`)
    }

    logger.info('Successfully refreshed access token')

    return data.data.access_token
  }

  /**
   * 保存刷新后的 access token 到 .env 文件
   */
  async saveRefreshedTokenToEnv(accessToken: string): Promise<void> {
    const envPath = path.join(process.cwd(), '.env')

    try {
      // 读取现有 .env
      let envContent = await fs.readFile(envPath, 'utf-8')

      // 更新 access token
      envContent = this.updateEnvLine(
        envContent,
        'LARK_USER_ACCESS_TOKEN',
        accessToken
      )

      // 写回文件
      await fs.writeFile(envPath, envContent, 'utf-8')

      logger.info('Refreshed token saved to .env file')
    } catch (error) {
      logger.error('Failed to save refreshed token to .env', error)
      throw new Error('Failed to save refreshed token to .env file')
    }
  }

  /**
   * 保存 tokens 到 .env 文件
   */
  private async saveTokensToEnv(tokens: OAuthTokens): Promise<void> {
    const envPath = path.join(process.cwd(), '.env')

    try {
      // 读取现有 .env
      let envContent = await fs.readFile(envPath, 'utf-8')

      // 更新或添加 tokens
      envContent = this.updateEnvLine(
        envContent,
        'LARK_USER_ACCESS_TOKEN',
        tokens.accessToken
      )
      envContent = this.updateEnvLine(
        envContent,
        'LARK_REFRESH_TOKEN',
        tokens.refreshToken
      )

      // 写回文件
      await fs.writeFile(envPath, envContent, 'utf-8')

      logger.info('Tokens saved to .env file')
    } catch (error) {
      logger.error('Failed to save tokens to .env', error)
      throw new Error('Failed to save tokens to .env file')
    }
  }

  /**
   * 更新 .env 文件中的一行
   */
  private updateEnvLine(content: string, key: string, value: string): string {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    const line = `${key}=${value}`

    if (regex.test(content)) {
      return content.replace(regex, line)
    } else {
      return content.trim() + `\n${line}\n`
    }
  }

  /**
   * 生成随机 state 参数
   */
  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  /**
   * 检查 token 是否需要刷新
   */
  static async ensureValidToken(
    accessToken: string,
    refreshToken: string,
    appId: string,
    appSecret: string
  ): Promise<string> {
    // 简单检查：如果 token 存在就使用
    // 未来可以添加 token 过期时间检测
    if (!accessToken || accessToken.length < 20) {
      logger.warn('Access token is invalid, refreshing...')
      const helper = new LarkOAuthHelper(appId, appSecret)
      return await helper.refreshToken(refreshToken)
    }

    return accessToken
  }
}
