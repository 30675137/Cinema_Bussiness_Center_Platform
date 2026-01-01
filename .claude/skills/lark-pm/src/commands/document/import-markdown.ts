/**
 * @spec T004-lark-project-management
 * 导入 Markdown 文档到飞书
 *
 * 注意：此命令会输出待导入的文件列表，实际导入需要由 Claude 通过 MCP 工具执行
 */

import fs from 'fs/promises'
import path from 'path'
import chalk from 'chalk'
import logger from '../../utils/logger.js'

interface ImportMarkdownOptions {
  file?: string
  directory?: string
  recursive?: boolean
}

interface FileToImport {
  filePath: string
  fileName: string
  content: string
  size: number
}

/**
 * 准备单个 Markdown 文件的导入
 */
async function prepareSingleMarkdown(filePath: string): Promise<FileToImport> {
  logger.info({ filePath }, 'Preparing Markdown file for import')

  // 读取 Markdown 文件内容
  const content = await fs.readFile(filePath, 'utf-8')
  const fileName = path.basename(filePath, '.md')

  return {
    filePath,
    fileName,
    content,
    size: Buffer.byteLength(content, 'utf-8'),
  }
}

/**
 * 扫描目录中的所有 Markdown 文件
 */
async function scanMarkdownFiles(
  directory: string,
  recursive: boolean = false
): Promise<string[]> {
  const markdownFiles: string[] = []

  const entries = await fs.readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory() && recursive) {
      // 递归扫描子目录
      const subFiles = await scanMarkdownFiles(fullPath, recursive)
      markdownFiles.push(...subFiles)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      markdownFiles.push(fullPath)
    }
  }

  return markdownFiles
}

/**
 * 导入 Markdown 命令
 *
 * 此命令准备文件并输出导入指令，实际导入由 Claude 通过 MCP 工具执行
 */
export async function importMarkdownCommand(options: ImportMarkdownOptions): Promise<void> {
  console.log(chalk.cyan('\n📦 Markdown 导入工具\n'))

  // 验证参数
  if (!options.file && !options.directory) {
    throw new Error('请指定 --file <文件路径> 或 --directory <目录路径>')
  }

  const filesToImport: FileToImport[] = []

  // 单文件导入
  if (options.file) {
    const filePath = path.resolve(options.file)

    // 检查文件是否存在
    try {
      await fs.access(filePath)
    } catch {
      throw new Error(`文件不存在: ${filePath}`)
    }

    // 检查文件扩展名
    if (!filePath.endsWith('.md')) {
      throw new Error('只支持 .md 文件')
    }

    const fileData = await prepareSingleMarkdown(filePath)
    filesToImport.push(fileData)
  }

  // 批量导入目录
  if (options.directory) {
    const directory = path.resolve(options.directory)

    // 检查目录是否存在
    try {
      const stat = await fs.stat(directory)
      if (!stat.isDirectory()) {
        throw new Error(`不是有效的目录: ${directory}`)
      }
    } catch (error) {
      throw new Error(`目录不存在: ${directory}`)
    }

    console.log(chalk.cyan('🔍 扫描目录:'), chalk.white(directory))
    console.log(
      chalk.cyan('递归扫描:'),
      options.recursive ? chalk.green('是') : chalk.yellow('否')
    )

    const markdownFiles = await scanMarkdownFiles(directory, options.recursive)

    if (markdownFiles.length === 0) {
      console.log(chalk.yellow('\n⚠️  未找到 Markdown 文件\n'))
      return
    }

    console.log(chalk.cyan(`\n找到 ${markdownFiles.length} 个 Markdown 文件\n`))

    // 准备所有文件
    for (const filePath of markdownFiles) {
      try {
        const fileData = await prepareSingleMarkdown(filePath)
        filesToImport.push(fileData)
      } catch (error) {
        console.log(chalk.red(`❌ 读取失败:`), filePath)
        console.log(chalk.gray(`   错误: ${(error as Error).message}`))
      }
    }
  }

  // 输出待导入文件列表
  console.log(chalk.cyan('\n📋 待导入文件列表\n'))

  filesToImport.forEach((file, index) => {
    console.log(chalk.green(`${index + 1}. ${file.fileName}`))
    console.log(chalk.gray(`   路径: ${file.filePath}`))
    console.log(chalk.gray(`   大小: ${formatBytes(file.size)}`))
    console.log(chalk.gray(`   预览: ${file.content.substring(0, 60).trim()}...`))
    console.log()
  })

  console.log(chalk.cyan('📝 总计:'), chalk.white(`${filesToImport.length} 个文件`))

  // 输出导入提示
  console.log(chalk.yellow('\n⚠️  注意：'))
  console.log(
    chalk.gray(
      '此命令已准备好文件内容，但实际导入需要通过 Claude 调用飞书 MCP 工具完成。'
    )
  )
  console.log(chalk.gray('请告诉 Claude："请导入这些文件到飞书文档"\n'))

  // 保存文件列表供 Claude 使用
  const importData = {
    files: filesToImport.map((f) => ({
      fileName: f.fileName,
      filePath: f.filePath,
      content: f.content,
    })),
    timestamp: new Date().toISOString(),
  }

  // 输出 JSON 供 Claude 读取
  console.log(chalk.cyan('\n📤 导入数据 (JSON):\n'))
  console.log(JSON.stringify(importData, null, 2))

  logger.info({ fileCount: filesToImport.length }, 'Files prepared for import')
}

/**
 * 格式化字节数
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
