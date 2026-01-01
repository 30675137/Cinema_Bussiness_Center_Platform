/**
 * @spec T004-lark-project-management
 * 智能创建 Product Backlog - 通过自然语言解析
 */

import chalk from 'chalk'
import { getConfig } from '../../config/config-manager.js'
import { LarkClient } from '../../lark/client.js'
import logger from '../../utils/logger.js'

interface SmartCreateOptions {
  input: string
  type?: string
  priority?: string
  specId?: string
}

interface ParsedBacklog {
  title: string
  type?: string
  priority?: string
  description?: string
  acceptanceCriteria?: string
  specId?: string
  tags?: string[]
}

/**
 * 智能解析用户输入，提取 Product Backlog 信息
 */
function parseUserInput(input: string): ParsedBacklog {
  const result: ParsedBacklog = {
    title: input,
  }

  // 检测 Epic（大型spec、功能集）关键词
  const epicKeywords = ['spec', '规格', '功能集', '大型功能', '史诗', 'epic']

  // 检测技术债关键词
  const techDebtKeywords = [
    '技术债',
    '技术负债',
    '代码重构',
    '性能优化',
    '架构优化',
    '技术改进',
    '需要解决',
    '缺少',
    '缺失',
    '不支持',
  ]

  // 检测 Plan 关键词
  const planKeywords = ['plan', '计划', '规划', '实施计划', '设计方案']

  // 检测 Task 关键词
  const taskKeywords = ['task', '任务', '待办', '实现', '开发', '修复']

  const isEpic = epicKeywords.some((keyword) => input.toLowerCase().includes(keyword.toLowerCase()))
  const isTechDebt = techDebtKeywords.some((keyword) => input.includes(keyword))
  const isPlan = planKeywords.some((keyword) => input.toLowerCase().includes(keyword.toLowerCase()))
  const isTask = taskKeywords.some((keyword) => input.toLowerCase().includes(keyword.toLowerCase()))

  // 优先级：Epic > Spike > Plan/Task -> User Story
  if (isEpic) {
    result.type = 'Epic' // Epic = 大型spec/功能集
    result.title = extractTitle(input, epicKeywords)
  } else if (isTechDebt) {
    result.type = 'Spike' // Spike = 技术债/技术调研
    result.title = extractTitle(input, techDebtKeywords)
  } else if (isPlan || isTask) {
    result.type = 'User Story' // Plan/Task 使用 User Story + 标签区分
    result.title = extractTitle(input, [...planKeywords, ...taskKeywords])

    // 设置标签来区分 plan 和 task
    if (isPlan) {
      result.tags = ['Plan', '实施计划']
    } else if (isTask) {
      result.tags = ['Task', '开发任务']
    }
  }

  // 检测优先级关键词
  const priorityMap: Record<string, string> = {
    紧急: '🔴 P0',
    高优先级: '🔴 P0',
    p0: '🔴 P0',
    重要: '🟠 P1',
    p1: '🟠 P1',
    中等: '🟡 P2',
    普通: '🟡 P2',
    p2: '🟡 P2',
    低: '🟢 P3',
    p3: '🟢 P3',
  }

  for (const [keyword, priority] of Object.entries(priorityMap)) {
    if (input.toLowerCase().includes(keyword.toLowerCase())) {
      result.priority = priority
      break
    }
  }

  // 提取描述和验收标准
  const lines = input.split('\n')
  const descriptionLines: string[] = []
  const acLines: string[] = []
  let inAC = false

  for (const line of lines) {
    if (line.includes('验收标准') || line.includes('需要') || line.includes('应该')) {
      inAC = true
      acLines.push(line)
    } else if (inAC) {
      acLines.push(line)
    } else if (line.length > 10) {
      descriptionLines.push(line)
    }
  }

  if (descriptionLines.length > 0) {
    result.description = descriptionLines.join('\n').trim()
  }

  if (acLines.length > 0) {
    result.acceptanceCriteria = acLines.join('\n').trim()
  }

  return result
}

/**
 * 提取标题（去除冗余词语）
 */
function extractTitle(input: string, _removeKeywords: string[]): string {
  let title = input.split('\n')[0].trim()

  // 移除"需要解决"等前缀
  const prefixes = ['需要解决', '需要', '应该', '希望', '想要']
  for (const prefix of prefixes) {
    if (title.startsWith(prefix)) {
      title = title.substring(prefix.length).trim()
    }
  }

  // 限制标题长度
  if (title.length > 100) {
    title = title.substring(0, 97) + '...'
  }

  return title
}

/**
 * 将解析结果转换为飞书字段格式
 */
function toLarkFields(parsed: ParsedBacklog, options: SmartCreateOptions): Record<string, any> {
  const fields: Record<string, any> = {
    标题: parsed.title,
  }

  // 类型（优先使用用户指定的，否则使用解析的，默认 User Story）
  if (options.type) {
    fields['类型'] = options.type
  } else if (parsed.type) {
    fields['类型'] = parsed.type
  } else {
    fields['类型'] = 'User Story'
  }

  // 优先级（优先使用用户指定的，否则使用解析的，默认 P2）
  if (options.priority) {
    fields['优先级'] = options.priority
  } else if (parsed.priority) {
    fields['优先级'] = parsed.priority
  } else {
    fields['优先级'] = '🟡 P2'
  }

  // 状态（默认：待规划）
  fields['状态'] = '📝 待规划'

  // spec_id
  if (options.specId) {
    fields['spec_id'] = options.specId
  } else if (parsed.specId) {
    fields['spec_id'] = parsed.specId
  }

  // 描述
  if (parsed.description) {
    fields['描述'] = parsed.description
  }

  // 验收标准
  if (parsed.acceptanceCriteria) {
    fields['验收标准'] = parsed.acceptanceCriteria
  }

  // 如果有标签，添加到描述开头作为类型标记
  if (parsed.tags && parsed.tags.length > 0) {
    const typeLabel = parsed.tags[0] // 取第一个标签作为类型标记
    const existingDesc = fields['描述'] || ''
    fields['描述'] = `**${typeLabel}**\n\n${existingDesc}`
  }

  return fields
}

/**
 * 智能创建 Product Backlog 命令
 */
export async function smartCreateBacklogCommand(options: SmartCreateOptions): Promise<void> {
  const config = getConfig()

  logger.debug({ config }, 'Loaded configuration')

  if (!config.appToken || !config.tables) {
    logger.error({ config }, 'Configuration validation failed')
    throw new Error(
      `未找到配置。请先运行 /lark-pm init 初始化 Base App 和数据表。\n` +
        `当前配置: appToken=${config.appToken ? '存在' : '缺失'}, tables=${config.tables ? '存在' : '缺失'}`
    )
  }

  // 检查是否有 Product Backlog 表（优先使用 productBacklog，向后兼容 backlog）
  const productBacklogTableId =
    config.tables?.productBacklog || config.tables?.backlog

  if (!productBacklogTableId) {
    throw new Error(
      '未找到 Product Backlog 表配置。\n' +
        '提示：请确认 config.json 中包含 productBacklog 或 backlog 表 ID，\n' +
        '或者手动设置表 ID：\n' +
        '  {\n' +
        '    "baseAppToken": "your-app-token",\n' +
        '    "tableIds": {\n' +
        '      "productBacklog": "tblDiernIQoFU9Yr"\n' +
        '    }\n' +
        '  }'
    )
  }

  console.log(chalk.cyan('\n🤖 智能解析用户输入...\n'))

  // 解析用户输入
  const parsed = parseUserInput(options.input)

  logger.info({ parsed }, 'Parsed user input')

  // 显示解析结果
  console.log(chalk.gray('解析结果:'))
  console.log(chalk.gray('  标题:'), chalk.white(parsed.title))
  console.log(chalk.gray('  类型:'), chalk.white(parsed.type || '未识别'))
  console.log(chalk.gray('  优先级:'), chalk.white(parsed.priority || '未识别'))

  // 构建飞书字段
  const fields = toLarkFields(parsed, options)

  console.log(chalk.cyan('\n📝 准备创建 Product Backlog 记录...\n'))
  console.log(chalk.gray('字段内容:'))
  Object.entries(fields).forEach(([key, value]) => {
    console.log(chalk.gray(`  ${key}:`), chalk.white(String(value).substring(0, 80)))
  })

  // 创建记录
  const larkClient = new LarkClient()

  try {
    const record = await larkClient.createRecord(config.appToken, productBacklogTableId, fields)

    console.log(chalk.green('\n✅ Product Backlog 记录创建成功！\n'))
    console.log(chalk.cyan('记录 ID:'), record.record_id)
    console.log(chalk.cyan('标题:'), fields['标题'])
    console.log(chalk.cyan('类型:'), fields['类型'])
    console.log(chalk.cyan('优先级:'), fields['优先级'])
    console.log(chalk.cyan('状态:'), fields['状态'])

    if (fields['spec_id']) {
      console.log(chalk.cyan('规格 ID:'), fields['spec_id'])
    }

    logger.info({ recordId: record.record_id }, 'Product Backlog created successfully')
  } catch (error) {
    logger.error({ error }, 'Failed to create Product Backlog')
    throw error
  }
}
