/**
 * @spec T004-lark-project-management
 * OAuth 授权命令
 */
import { Command } from 'commander'
import chalk from 'chalk'
import { LarkOAuthHelper } from '../utils/lark-oauth-helper.js'
import { TokenManager } from '../utils/token-manager.js'
import logger from '../utils/logger.js'

export function registerAuthCommand(program: Command): void {
  program
    .command('auth')
    .description('通过 OAuth 2.0 获取用户访问令牌 (UAT)')
    .option('--refresh', '使用 refresh_token 刷新 access_token')
    .action(async (options) => {
      try {
        const appId = process.env.LARK_APP_ID
        const appSecret = process.env.LARK_APP_SECRET
        const refreshToken = process.env.LARK_REFRESH_TOKEN

        if (!appId || !appSecret) {
          console.error(
            chalk.red(
              '\n❌ 错误: 缺少 LARK_APP_ID 或 LARK_APP_SECRET\n'
            )
          )
          console.log(chalk.yellow('请在 .env 文件中配置:'))
          console.log(chalk.dim('   LARK_APP_ID=your_app_id'))
          console.log(chalk.dim('   LARK_APP_SECRET=your_app_secret\n'))
          process.exit(1)
        }

        const helper = new LarkOAuthHelper(appId, appSecret)

        if (options.refresh) {
          // 刷新 token
          if (!refreshToken) {
            console.error(
              chalk.red(
                '\n❌ 错误: 缺少 LARK_REFRESH_TOKEN\n'
              )
            )
            console.log(
              chalk.yellow('请先运行 /lark-pm auth 完成首次授权\n')
            )
            process.exit(1)
          }

          console.log(chalk.cyan('\n🔄 正在刷新 access_token...\n'))
          const newToken = await helper.refreshToken(refreshToken)

          // 保存新 token 到 .env
          await helper.saveRefreshedTokenToEnv(newToken)

          // 通知 TokenManager 重新加载 token
          const tokenManager = TokenManager.getInstance()
          await tokenManager.reloadToken()

          console.log(chalk.green('✅ Token 刷新成功！'))
          console.log(chalk.dim(`   新 Token: ${newToken.substring(0, 30)}...\n`))

          // 新的提示（无需重启）
          console.log(chalk.bold.green('🎉 Token 已自动加载，无需重启 Claude Code！'))
          console.log(chalk.cyan('   现在可以直接使用需要 UAT 的命令\n'))
        } else {
          // 完整的 OAuth 授权流程
          const tokens = await helper.authorize()

          // 通知 TokenManager 设置新 token
          const tokenManager = TokenManager.getInstance()
          tokenManager.setToken(tokens.accessToken, tokens.refreshToken, tokens.expiresIn)

          console.log(chalk.bold.green('\n🎉 Token 已自动加载，无需重启 Claude Code！'))
          console.log(chalk.cyan('   现在可以直接使用需要 UAT 的命令\n'))
          console.log(chalk.dim('示例命令:'))
          console.log(chalk.dim('   /lark-pm task-create --title "新任务"'))
          console.log(chalk.dim('   /lark-pm backlog smart-create "新需求"'))
          console.log(chalk.dim('   /lark-pm export --format excel\n'))
        }
      } catch (error) {
        logger.error('Auth command failed', error)
        console.error(chalk.red('\n❌ 授权失败:'), (error as Error).message)
        console.log(chalk.yellow('\n请检查:'))
        console.log(chalk.dim('  1. APP_ID 和 APP_SECRET 是否正确'))
        console.log(chalk.dim('  2. 网络连接是否正常'))
        console.log(chalk.dim('  3. 飞书开放平台应用配置是否正确\n'))
        process.exit(1)
      }
    })
}
