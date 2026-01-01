/**
 * @spec T004-lark-project-management
 * 上传文件到飞书云盘命令
 */

import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import logger from '../../utils/logger.js'
import { LarkDriveService } from '../../services/lark-drive-service.js'

interface UploadFileOptions {
  file: string
  folder?: string
  name?: string
}

export async function uploadFileCommand(options: UploadFileOptions): Promise<void> {
  try {
    if (!options.file) {
      throw new Error('请指定 --file 参数')
    }

    const filePath = path.resolve(options.file)

    // 检查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      throw new Error(`文件不存在: ${filePath}`)
    }

    const stat = await fs.stat(filePath)
    const fileName = options.name || path.basename(filePath)

    console.log(chalk.blue('\n☁️  开始上传文件到飞书云盘...\n'))
    console.log(chalk.gray(`- 文件路径: ${filePath}`))
    console.log(chalk.gray(`- 文件名称: ${fileName}`))
    console.log(chalk.gray(`- 文件大小: ${formatBytes(stat.size)}`))
    if (options.folder) {
      console.log(chalk.gray(`- 目标文件夹: ${options.folder} (手动指定)`))
    } else if (process.env.LARK_DEFAULT_DRIVE_FOLDER) {
      console.log(chalk.gray(`- 目标文件夹: ${process.env.LARK_DEFAULT_DRIVE_FOLDER} (默认配置)`))
    } else {
      console.log(chalk.gray(`- 目标位置: 云盘根目录`))
    }
    console.log()

    // 使用云盘服务上传
    const driveService = new LarkDriveService()
    const result = await driveService.uploadFile({
      filePath,
      fileName,
      parentFolderToken: options.folder
    })

    console.log(chalk.green('\n✅ 上传成功！\n'))
    console.log(chalk.gray(`文件 Token: ${result.fileToken}`))
    console.log(chalk.gray(`在线链接: ${result.fileUrl}\n`))
    console.log(chalk.yellow('💡 提示：文件已保留原始格式（.md），可以在飞书云盘中下载查看\n'))

    logger.info({ fileToken: result.fileToken, fileName }, 'File uploaded successfully')
  } catch (error) {
    console.error(chalk.red('\n❌ 上传失败:'), (error as Error).message)

    if ((error as Error).message.includes('token')) {
      console.log(chalk.yellow('\n💡 Token 可能已过期，请重新授权：'))
      console.log(chalk.gray('   node dist/index.js auth\n'))
    }

    logger.error({ error, file: options.file }, 'Failed to upload file')
    throw error
  }
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
