/**
 * @spec T004-lark-project-management
 * 导入 README.md 到飞书文档
 *
 * 使用直接 API 调用，绕过 MCP，验证无重启 token 管理方案
 */

import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import logger from '../utils/logger.js'
import { LarkDocxService } from '../services/lark-docx-service.js'

export async function importReadmeCommand(): Promise<void> {
  try {
    console.log(chalk.blue('\n📄 开始导入 README.md 到飞书文档...\n'))

    // 读取 README.md
    const readmePath = path.join(process.cwd(), 'README.md')
    const markdown = await fs.readFile(readmePath, 'utf-8')

    console.log(chalk.gray(`- README.md 路径: ${readmePath}`))
    console.log(chalk.gray(`- Markdown 长度: ${markdown.length} 字符\n`))

    // 使用新的服务层导入
    const docxService = new LarkDocxService()
    const documentId = await docxService.importMarkdown({
      file_name: 'Lark PM - 飞书项目管理工具',
      markdown,
    })

    console.log(chalk.green('\n✅ 导入成功！'))
    console.log(chalk.gray(`\n文档 ID: ${documentId}`))
    console.log(chalk.gray(`在线链接: https://feishu.cn/docx/${documentId}\n`))

    logger.info({ documentId }, 'README.md imported successfully')
  } catch (error) {
    console.error(chalk.red('\n❌ 导入失败:'), (error as Error).message)
    logger.error({ error }, 'Failed to import README.md')
    process.exit(1)
  }
}
