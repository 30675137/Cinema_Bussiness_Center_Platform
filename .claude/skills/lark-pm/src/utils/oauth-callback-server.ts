/**
 * @spec T004-lark-project-management
 * OAuth 2.0 回调服务器
 */
import { createServer, Server, IncomingMessage, ServerResponse } from 'http'
import { parse } from 'url'
import logger from './logger.js'

export class OAuthCallbackServer {
  private server: Server | null = null
  private codePromise: Promise<string> | null = null
  private resolveCode: ((code: string) => void) | null = null
  private rejectCode: ((error: Error) => void) | null = null

  /**
   * 启动服务器并等待回调
   */
  async start(port: number = 8080): Promise<string> {
    logger.info(`Starting OAuth callback server on port ${port}`)

    this.codePromise = new Promise((resolve, reject) => {
      this.resolveCode = resolve
      this.rejectCode = reject
    })

    this.server = createServer(
      (req: IncomingMessage, res: ServerResponse) => {
        this.handleRequest(req, res)
      }
    )

    this.server.listen(port, () => {
      logger.info(`OAuth callback server started: http://localhost:${port}`)
    })

    // 设置超时（5 分钟）
    setTimeout(() => {
      if (this.server) {
        this.rejectCode?.(new Error('OAuth authorization timeout'))
        this.stop()
      }
    }, 5 * 60 * 1000)

    return this.codePromise
  }

  /**
   * 处理 HTTP 请求
   */
  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const { query, pathname } = parse(req.url || '', true)

    if (pathname === '/callback') {
      if (query.code) {
        logger.info('Received authorization code')

        // 返回成功页面
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(this.getSuccessHTML())

        // 解析并返回 code
        this.resolveCode?.(query.code as string)

        // 延迟关闭服务器
        setTimeout(() => this.stop(), 2000)
      } else if (query.error) {
        logger.error(`OAuth error: ${query.error}`)

        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
        res.end(this.getErrorHTML(query.error as string))

        this.rejectCode?.(
          new Error(`OAuth error: ${query.error} - ${query.error_description}`)
        )

        setTimeout(() => this.stop(), 2000)
      } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' })
        res.end('Missing authorization code or error parameter')
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    }
  }

  /**
   * 停止服务器
   */
  stop(): void {
    if (this.server) {
      this.server.close()
      this.server = null
      logger.info('OAuth callback server stopped')
    }
  }

  /**
   * 生成成功页面 HTML
   */
  private getSuccessHTML(): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>授权成功</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                           'Helvetica Neue', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .card {
              background: white;
              padding: 48px 40px;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
              max-width: 400px;
              animation: slideIn 0.4s ease-out;
            }
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .checkmark {
              font-size: 72px;
              margin-bottom: 20px;
              animation: bounce 0.6s ease-out;
            }
            @keyframes bounce {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
            h1 {
              color: #333;
              font-size: 28px;
              margin-bottom: 12px;
              font-weight: 600;
            }
            p {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 24px;
            }
            .progress {
              width: 100%;
              height: 4px;
              background: #e0e0e0;
              border-radius: 2px;
              overflow: hidden;
            }
            .progress-bar {
              width: 0%;
              height: 100%;
              background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
              border-radius: 2px;
              animation: progress 3s ease-out forwards;
            }
            @keyframes progress {
              to { width: 100%; }
            }
            .hint {
              margin-top: 16px;
              font-size: 14px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="checkmark">✅</div>
            <h1>授权成功！</h1>
            <p>您已成功授权 Lark PM 访问您的飞书账号</p>
            <div class="progress">
              <div class="progress-bar"></div>
            </div>
            <p class="hint">窗口将在 3 秒后自动关闭...</p>
          </div>
          <script>
            // 3 秒后自动关闭窗口
            setTimeout(() => {
              window.close();
              // 如果无法关闭（某些浏览器限制），显示提示
              setTimeout(() => {
                document.querySelector('.hint').textContent = '您可以手动关闭此窗口了';
              }, 500);
            }, 3000);
          </script>
        </body>
      </html>
    `
  }

  /**
   * 生成错误页面 HTML
   */
  private getErrorHTML(error: string): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>授权失败</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
                           'Helvetica Neue', Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            .card {
              background: white;
              padding: 48px 40px;
              border-radius: 16px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
              max-width: 400px;
            }
            .error-icon {
              font-size: 72px;
              margin-bottom: 20px;
            }
            h1 {
              color: #d32f2f;
              font-size: 28px;
              margin-bottom: 12px;
              font-weight: 600;
            }
            p {
              color: #666;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 16px;
            }
            .error-details {
              background: #ffebee;
              color: #c62828;
              padding: 12px;
              border-radius: 8px;
              font-size: 14px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="error-icon">❌</div>
            <h1>授权失败</h1>
            <p>很抱歉，授权过程中发生了错误</p>
            <div class="error-details">${this.escapeHTML(error)}</div>
            <p style="margin-top: 24px; font-size: 14px; color: #999;">
              请关闭此窗口并重试
            </p>
          </div>
        </body>
      </html>
    `
  }

  /**
   * HTML 转义
   */
  private escapeHTML(str: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return str.replace(/[&<>"']/g, (m) => map[m])
  }
}
