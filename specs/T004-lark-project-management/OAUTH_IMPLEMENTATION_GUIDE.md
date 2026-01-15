# OAuth 2.0 自动授权流程实施指南

**@spec T004-lark-project-management**

## 核心问题

**Q: 能用 APP_ID + APP_SECRET 直接获取 UAT 吗？**

**A: ❌ 不能！**

必须通过 OAuth 2.0 授权流程：

```
APP_ID + APP_SECRET
    → ❌ 不能直接获取 UAT
    → ✅ 只能获取 tenant_access_token

UAT 获取流程：
用户授权 → authorization_code → APP_ID + APP_SECRET + code → UAT
```

## OAuth 2.0 完整流程图

```
┌─────────────┐
│   开发者    │
└──────┬──────┘
       │ 1. 调用 /lark-pm auth
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 1: 启动本地 HTTP 服务器 (localhost:8080)        │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 2: 生成授权 URL                                │
│  https://open.feishu.cn/open-apis/authen/v1/        │
│  authorize?app_id=xxx&redirect_uri=http://          │
│  localhost:8080/callback&scope=bitable:app          │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 3: 打开浏览器 (自动)                            │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌──────────────┐
│   用户浏览器  │  ← 用户登录飞书账号
└──────┬───────┘
       │ 用户点击「同意授权」
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 4: 飞书重定向到 localhost:8080/callback?       │
│  code=abc123&state=xyz                               │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 5: 本地服务器接收 authorization_code           │
│  code = "abc123"                                     │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 6: 交换 code 为 UAT                            │
│  POST /open-apis/authen/v1/oidc/access_token        │
│  {                                                   │
│    grant_type: "authorization_code",                │
│    code: "abc123",                                  │
│    app_id: APP_ID,                                  │
│    app_secret: APP_SECRET                           │
│  }                                                   │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 7: 获取 UAT 和 refresh_token                   │
│  {                                                   │
│    access_token: "u-abc...",                        │
│    refresh_token: "ur-def...",                      │
│    expires_in: 7200                                 │
│  }                                                   │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────────────────┐
│  Step 8: 保存到 .env 文件                            │
│  LARK_USER_ACCESS_TOKEN=u-abc...                    │
│  LARK_REFRESH_TOKEN=ur-def...                       │
└──────┬──────────────────────────────────────────────┘
       │
       ↓
┌─────────────┐
│   完成！    │
└─────────────┘
```

## 代码实现

### 1. OAuth 服务器实现

```typescript
/**
 * @spec T004-lark-project-management
 * OAuth 2.0 回调服务器
 */
import { createServer } from 'http'
import { parse } from 'url'

export class OAuthCallbackServer {
  private server: ReturnType<typeof createServer> | null = null
  private codePromise: Promise<string> | null = null
  private resolveCode: ((code: string) => void) | null = null

  /**
   * 启动服务器并等待回调
   */
  async start(port: number = 8080): Promise<string> {
    this.codePromise = new Promise((resolve) => {
      this.resolveCode = resolve
    })

    this.server = createServer((req, res) => {
      const { query } = parse(req.url || '', true)

      if (query.code) {
        // 返回成功页面
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>授权成功</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .success-card {
                  background: white;
                  padding: 40px;
                  border-radius: 12px;
                  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                  text-align: center;
                }
                .checkmark {
                  font-size: 64px;
                  color: #4caf50;
                }
                h1 { color: #333; margin: 20px 0 10px; }
                p { color: #666; margin: 0 0 20px; }
              </style>
            </head>
            <body>
              <div class="success-card">
                <div class="checkmark">✅</div>
                <h1>授权成功！</h1>
                <p>您可以关闭此窗口并返回终端继续操作</p>
              </div>
              <script>
                // 3 秒后自动关闭
                setTimeout(() => window.close(), 3000)
              </script>
            </body>
          </html>
        `)

        // 解析并返回 code
        this.resolveCode?.(query.code as string)

        // 延迟关闭服务器
        setTimeout(() => this.stop(), 2000)
      } else {
        res.writeHead(400)
        res.end('Missing authorization code')
      }
    })

    this.server.listen(port, () => {
      console.log(`🌐 OAuth 回调服务器已启动: http://localhost:${port}`)
    })

    return this.codePromise
  }

  /**
   * 停止服务器
   */
  stop(): void {
    this.server?.close()
    this.server = null
  }
}
```

### 2. OAuth 助手主类

```typescript
/**
 * @spec T004-lark-project-management
 * Lark OAuth 2.0 授权助手
 */
import open from 'open'
import fs from 'fs/promises'
import path from 'path'

export class LarkOAuthHelper {
  private readonly APP_ID: string
  private readonly APP_SECRET: string
  private readonly REDIRECT_URI = 'http://localhost:8080/callback'
  private readonly SCOPES = [
    'bitable:app',        // 多维表格权限
    'docs:write',         // 文档写入权限
    'docs:read',          // 文档读取权限
  ]

  constructor(appId: string, appSecret: string) {
    this.APP_ID = appId
    this.APP_SECRET = appSecret
  }

  /**
   * 执行完整的 OAuth 授权流程
   */
  async authorize(): Promise<{ accessToken: string; refreshToken: string }> {
    console.log('🚀 开始 OAuth 2.0 授权流程...\n')

    // 1. 启动回调服务器
    console.log('📡 Step 1: 启动本地回调服务器...')
    const server = new OAuthCallbackServer()
    const codePromise = server.start(8080)

    // 2. 生成授权 URL
    console.log('🔗 Step 2: 生成授权链接...')
    const authUrl = this.buildAuthUrl()
    console.log(`   授权链接: ${authUrl}\n`)

    // 3. 打开浏览器
    console.log('🌐 Step 3: 正在打开浏览器...')
    console.log('   请在浏览器中登录并点击「同意授权」\n')
    await open(authUrl)

    // 4. 等待回调
    console.log('⏳ Step 4: 等待用户授权...')
    const code = await codePromise
    console.log('✅ 已获取 authorization_code\n')

    // 5. 交换 token
    console.log('🔄 Step 5: 正在交换 access_token...')
    const tokens = await this.exchangeCodeForToken(code)
    console.log('✅ 已获取 user_access_token\n')

    // 6. 保存到 .env
    console.log('💾 Step 6: 保存 token 到 .env 文件...')
    await this.saveTokensToEnv(tokens)
    console.log('✅ 保存成功！\n')

    console.log('🎉 OAuth 授权完成！')
    console.log(`   Access Token: ${tokens.accessToken.substring(0, 20)}...`)
    console.log(`   有效期: ${tokens.expiresIn / 3600} 小时\n`)

    return tokens
  }

  /**
   * 生成授权 URL
   */
  private buildAuthUrl(): string {
    const params = new URLSearchParams({
      app_id: this.APP_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES.join(' '),
      state: Math.random().toString(36).substring(7),
    })

    return `https://open.feishu.cn/open-apis/authen/v1/authorize?${params}`
  }

  /**
   * 交换 code 为 token
   */
  private async exchangeCodeForToken(code: string): Promise<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }> {
    const response = await fetch(
      'https://open.feishu.cn/open-apis/authen/v1/oidc/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          app_id: this.APP_ID,
          app_secret: this.APP_SECRET,
        }),
      }
    )

    const data = await response.json()

    if (data.code !== 0) {
      throw new Error(`Failed to exchange code: ${data.msg}`)
    }

    return {
      accessToken: data.data.access_token,
      refreshToken: data.data.refresh_token,
      expiresIn: data.data.expires_in,
    }
  }

  /**
   * 刷新 token
   */
  async refreshToken(refreshToken: string): Promise<string> {
    const response = await fetch(
      'https://open.feishu.cn/open-apis/authen/v1/oidc/refresh_access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          app_id: this.APP_ID,
          app_secret: this.APP_SECRET,
        }),
      }
    )

    const data = await response.json()
    return data.data.access_token
  }

  /**
   * 保存 tokens 到 .env 文件
   */
  private async saveTokensToEnv(tokens: {
    accessToken: string
    refreshToken: string
  }): Promise<void> {
    const envPath = path.join(
      process.cwd(),
      '.claude/skills/lark-pm/.env'
    )

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
  }

  /**
   * 更新 .env 文件中的一行
   */
  private updateEnvLine(
    content: string,
    key: string,
    value: string
  ): string {
    const regex = new RegExp(`^${key}=.*$`, 'm')
    const line = `${key}=${value}`

    if (regex.test(content)) {
      return content.replace(regex, line)
    } else {
      return content + `\n${line}`
    }
  }
}
```

### 3. CLI 命令集成

```typescript
/**
 * @spec T004-lark-project-management
 * lark-pm auth 命令
 */
import { Command } from 'commander'
import { LarkOAuthHelper } from './oauth-helper'

export function registerAuthCommand(program: Command): void {
  program
    .command('auth')
    .description('通过 OAuth 2.0 获取用户访问令牌 (UAT)')
    .action(async () => {
      try {
        const helper = new LarkOAuthHelper(
          process.env.LARK_APP_ID!,
          process.env.LARK_APP_SECRET!
        )

        await helper.authorize()

        console.log('\n✨ 现在可以使用需要 UAT 的命令了！')
        console.log('   例如: /lark-pm export --format excel')
      } catch (error) {
        console.error('❌ 授权失败:', error)
        process.exit(1)
      }
    })
}
```

## 使用方法

### 首次使用

```bash
# 1. 运行授权命令
/lark-pm auth

# 输出：
# 🚀 开始 OAuth 2.0 授权流程...
# 📡 Step 1: 启动本地回调服务器...
# 🌐 OAuth 回调服务器已启动: http://localhost:8080
# 🔗 Step 2: 生成授权链接...
# 🌐 Step 3: 正在打开浏览器...
#    请在浏览器中登录并点击「同意授权」
#
# ⏳ Step 4: 等待用户授权...
# ✅ 已获取 authorization_code
# 🔄 Step 5: 正在交换 access_token...
# ✅ 已获取 user_access_token
# 💾 Step 6: 保存 token 到 .env 文件...
# ✅ 保存成功！
#
# 🎉 OAuth 授权完成！
#    Access Token: u-g104cvcr7HS7Z4XE...
#    有效期: 2 小时
#
# ✨ 现在可以使用需要 UAT 的命令了！
```

### Token 刷新（自动）

```typescript
/**
 * 在每次 API 调用前自动检查和刷新 token
 */
async function ensureValidToken(): Promise<string> {
  const token = process.env.LARK_USER_ACCESS_TOKEN!
  const refreshToken = process.env.LARK_REFRESH_TOKEN!

  // 检查 token 是否即将过期（提前 10 分钟刷新）
  if (isTokenExpiringSoon(token)) {
    console.log('🔄 Token 即将过期，正在自动刷新...')
    const helper = new LarkOAuthHelper(
      process.env.LARK_APP_ID!,
      process.env.LARK_APP_SECRET!
    )
    const newToken = await helper.refreshToken(refreshToken)
    await saveTokenToEnv('LARK_USER_ACCESS_TOKEN', newToken)
    return newToken
  }

  return token
}
```

## 安全注意事项

1. **不要提交 .env 文件到 Git**
   ```gitignore
   .env
   .env.local
   ```

2. **使用 HTTPS 重定向 URI（生产环境）**
   ```typescript
   const REDIRECT_URI =
     process.env.NODE_ENV === 'production'
       ? 'https://your-domain.com/oauth/callback'
       : 'http://localhost:8080/callback'
   ```

3. **验证 state 参数**
   ```typescript
   const state = generateRandomString()
   // 保存 state
   // 在回调中验证
   if (receivedState !== state) {
     throw new Error('Invalid state parameter')
   }
   ```

## 总结

### ✅ 可以实现的

1. **一次授权，长期使用**
   - 用户只需点击一次「同意授权」
   - Token 自动刷新
   - 有效期 2 小时（可无限刷新）

2. **完全自动化**
   - 打开浏览器：自动
   - 启动回调服务器：自动
   - 交换 token：自动
   - 保存 .env：自动

3. **良好的用户体验**
   - 清晰的进度提示
   - 美观的成功页面
   - 自动关闭浏览器窗口

### ❌ 不能实现的

1. **完全无用户交互**
   - 用户必须点击一次「同意授权」
   - 这是 OAuth 2.0 安全机制的要求
   - **无法绕过**

2. **用 APP_ID + APP_SECRET 直接获取 UAT**
   - 这违反 OAuth 2.0 标准
   - 飞书 API 不支持
   - **不可能实现**

## 下一步

1. **立即**: 手动更新 UAT 完成文档导入
2. **下一个 Sprint**: 实现 OAuth 2.0 自动授权流程
3. **未来**: Token 自动刷新和过期检测

---

**创建人**: Claude Code
**相关 Spec**: T004-lark-project-management
**优先级**: 🟠 P1
