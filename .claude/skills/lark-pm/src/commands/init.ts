/**
 * @spec T004-lark-project-management
 * Init command to create Base App and tables
 *
 * Updated based on clarifications:
 * - User provides existing Base App Token (interactive prompt)
 * - Validates Token with 3 retries
 * - Checks for existing tables
 * - Prompts user: skip/overwrite/terminate
 */

import { LarkClient } from '../lark/client.js'
import { loadConfig, saveConfig } from '../config/config-manager.js'
import logger from '../utils/logger.js'
import ora from 'ora'
import chalk from 'chalk'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

/**
 * Promisified readline question
 */
function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve)
  })
}

export async function initCommand(): Promise<void> {
  console.log(chalk.bold.blue('\n📊 初始化 Lark 项目管理系统\n'))

  const spinner = ora('检查现有配置...').start()

  const config = await loadConfig()

  if (config.baseAppToken) {
    spinner.warn(chalk.yellow(`已存在 Base App: ${config.baseAppToken}`))

    console.log(chalk.gray('\n提示: 如需重新初始化，请先删除 config.json 文件\n'))
    rl.close()
    return
  }

  spinner.stop()

  // Step 1: Prompt user for Base App Token (with validation and retry)
  let baseAppToken: string | null = null
  let retries = 0
  const MAX_RETRIES = 3

  while (retries < MAX_RETRIES && !baseAppToken) {
    console.log(
      chalk.cyan(
        '\n请输入已存在的 Lark Base App Token (从飞书多维表格 URL 或配置中获取):'
      )
    )
    const input = await question(chalk.gray('Base App Token: '))

    if (!input.trim()) {
      console.log(chalk.red('✗ Token 不能为空'))
      retries++
      continue
    }

    // Validate Token
    const validationSpinner = ora('验证 Token 有效性...').start()
    const client = new LarkClient()

    try {
      // Try to list tables to validate token
      await client.listTables(input.trim())
      baseAppToken = input.trim()
      validationSpinner.succeed(chalk.green('✓ Token 验证成功'))
    } catch (error: any) {
      validationSpinner.fail(chalk.red('✗ Token 验证失败'))
      console.log(
        chalk.yellow(
          `错误: ${error.message || '无法访问该 Base App，请检查 Token 和权限'}`
        )
      )
      retries++

      if (retries < MAX_RETRIES) {
        console.log(chalk.gray(`剩余重试次数: ${MAX_RETRIES - retries}`))
      }
    }
  }

  if (!baseAppToken) {
    console.log(
      chalk.red(
        `\n✗ 已达到最大重试次数 (${MAX_RETRIES})，请检查 Token 和网络连接后重试\n`
      )
    )
    rl.close()
    process.exit(1)
  }

  const client = new LarkClient()

  try {
    // Step 2: Check for existing tables
    const checkSpinner = ora('检查现有数据表...').start()
    const existingTables = await client.listTables(baseAppToken)
    checkSpinner.succeed(chalk.green(`发现 ${existingTables.items?.length || 0} 个现有数据表`))

    const requiredTables = ['任务管理', '技术债', 'Bug 跟踪', '功能矩阵', '测试记录']
    const existingTableNames = new Set(existingTables.items?.map((t: any) => t.name) || [])
    const conflictingTables = requiredTables.filter(name => existingTableNames.has(name))

    // Step 3: Handle existing tables
    if (conflictingTables.length > 0) {
      console.log(chalk.yellow(`\n⚠️  发现 ${conflictingTables.length} 个同名数据表:`))
      conflictingTables.forEach(name => console.log(chalk.gray(`  - ${name}`)))

      console.log(chalk.cyan('\n请选择操作:'))
      console.log(chalk.gray('  1) 跳过已存在的表，仅创建缺失的表'))
      console.log(chalk.gray('  2) 覆盖已存在的表 (警告: 会清空数据)'))
      console.log(chalk.gray('  3) 终止 init 流程'))

      const choice = await question(chalk.cyan('\n请输入选项 (1/2/3): '))

      if (choice.trim() === '3') {
        console.log(chalk.yellow('\n已取消初始化\n'))
        rl.close()
        return
      }

      const skipExisting = choice.trim() === '1'
      const overwrite = choice.trim() === '2'

      if (overwrite) {
        console.log(chalk.red('\n⚠️  警告: 即将删除并重建以下数据表，所有数据将丢失!'))
        conflictingTables.forEach(name => console.log(chalk.red(`  - ${name}`)))

        const confirm = await question(chalk.red('\n确认覆盖? (yes/no): '))
        if (confirm.toLowerCase() !== 'yes') {
          console.log(chalk.yellow('\n已取消初始化\n'))
          rl.close()
          return
        }

        // Note: Table deletion not yet implemented in LarkClient
        // Users should manually delete tables in Feishu UI if needed
        console.log(
          chalk.yellow(
            '\n注意: 请先在飞书 Base 中手动删除冲突的数据表，然后重新运行 init\n'
          )
        )
        rl.close()
        return
      }

      // Create tables (skip or create all)
      const tableSpinner = ora('创建数据表...').start()
      const tablesToCreate = skipExisting
        ? requiredTables.filter(name => !existingTableNames.has(name))
        : requiredTables

      const createdTables: any[] = []
      for (const tableName of tablesToCreate) {
        let table
        switch (tableName) {
          case '任务管理':
            table = await createTaskTable(client, baseAppToken)
            break
          case '技术债':
            table = await createDebtTable(client, baseAppToken)
            break
          case 'Bug 跟踪':
            table = await createBugTable(client, baseAppToken)
            break
          case '功能矩阵':
            table = await createFeatureTable(client, baseAppToken)
            break
          case '测试记录':
            table = await createTestRecordTable(client, baseAppToken)
            break
        }
        if (table) createdTables.push(table)
      }

      tableSpinner.succeed(chalk.green(`创建了 ${createdTables.length} 个数据表`))
    } else {
      // No conflicts, create all tables
      const tableSpinner = ora('创建数据表...').start()

      const tables = await Promise.all([
        createTaskTable(client, baseAppToken),
        createDebtTable(client, baseAppToken),
        createBugTable(client, baseAppToken),
        createFeatureTable(client, baseAppToken),
        createTestRecordTable(client, baseAppToken),
      ])

      tableSpinner.succeed(chalk.green('所有数据表创建成功'))
    }

    // Step 4: Save configuration
    const saveSpinner = ora('保存配置...').start()

    // Get final table list
    const finalTables = await client.listTables(baseAppToken)
    const tableMap: any = {}
    for (const table of finalTables.items || []) {
      switch (table.name) {
        case '任务管理':
          tableMap.tasks = table.table_id
          break
        case '技术债':
          tableMap.technicalDebt = table.table_id
          break
        case 'Bug 跟踪':
          tableMap.bugs = table.table_id
          break
        case '功能矩阵':
          tableMap.features = table.table_id
          break
        case '测试记录':
          tableMap.testRecords = table.table_id
          break
      }
    }

    await saveConfig({
      baseAppToken,
      tableIds: tableMap,
    })

    saveSpinner.succeed(chalk.green('配置已保存到 config.json'))

    // Print summary
    console.log(chalk.bold.green('\n✅ 初始化完成!\n'))
    console.log(chalk.cyan('Base App Token:'), baseAppToken)
    console.log(chalk.cyan('\n数据表:'))
    Object.entries(tableMap).forEach(([key, value]) => {
      console.log(chalk.gray(`  - ${key}: ${value}`))
    })
    console.log()
  } catch (error) {
    logger.error({ error }, 'Init command failed')
    console.log(chalk.red('\n✗ 初始化失败:'), (error as Error).message)
    throw error
  } finally {
    rl.close()
  }
}

/**
 * Create Task table
 */
async function createTaskTable(client: LarkClient, appToken: string) {
  return client.createTable(appToken, '任务管理', [
    { field_name: '标题', type: 1 }, // Text
    { field_name: '优先级', type: 3 }, // Single select
    { field_name: '状态', type: 3 }, // Single select
    { field_name: '规格ID', type: 1 }, // Text
    { field_name: '负责人', type: 11 }, // User
    { field_name: '截止日期', type: 5 }, // Date
    { field_name: '标签', type: 4 }, // Multi select
    { field_name: '进度', type: 2 }, // Number
    { field_name: '预计工时', type: 2 }, // Number
    { field_name: '实际工时', type: 2 }, // Number
    { field_name: '备注', type: 1 }, // Text
  ])
}

/**
 * Create Technical Debt table
 */
async function createDebtTable(client: LarkClient, appToken: string) {
  return client.createTable(appToken, '技术债', [
    { field_name: '标题', type: 1 }, // Text
    { field_name: '严重程度', type: 3 }, // Single select
    { field_name: '状态', type: 3 }, // Single select
    { field_name: '影响范围', type: 1 }, // Text
    { field_name: '规格ID', type: 1 }, // Text
    { field_name: '预估工时', type: 2 }, // Number
    { field_name: '负责人', type: 11 }, // User
    { field_name: '发现日期', type: 5 }, // Date
    { field_name: '解决日期', type: 5 }, // Date
    { field_name: '备注', type: 1 }, // Text
  ])
}

/**
 * Create Bug table
 */
async function createBugTable(client: LarkClient, appToken: string) {
  return client.createTable(appToken, 'Bug 跟踪', [
    { field_name: '标题', type: 1 }, // Text
    { field_name: '严重程度', type: 3 }, // Single select
    { field_name: '状态', type: 3 }, // Single select
    { field_name: '报告人', type: 11 }, // User
    { field_name: '负责人', type: 11 }, // User
    { field_name: '规格ID', type: 1 }, // Text
    { field_name: '发现日期', type: 5 }, // Date
    { field_name: '修复日期', type: 5 }, // Date
    { field_name: '复现步骤', type: 1 }, // Text
    { field_name: '环境信息', type: 1 }, // Text
    { field_name: '备注', type: 1 }, // Text
  ])
}

/**
 * Create Feature table
 */
async function createFeatureTable(client: LarkClient, appToken: string) {
  return client.createTable(appToken, '功能矩阵', [
    { field_name: '功能名称', type: 1 }, // Text
    { field_name: '所属模块', type: 3 }, // Single select
    { field_name: '状态', type: 3 }, // Single select
    { field_name: '优先级', type: 3 }, // Single select
    { field_name: '负责人', type: 11 }, // User
    { field_name: '规格ID', type: 1 }, // Text
    { field_name: '计划上线日期', type: 5 }, // Date
    { field_name: '实际上线日期', type: 5 }, // Date
    { field_name: '备注', type: 1 }, // Text
  ])
}

/**
 * Create Test Record table
 */
async function createTestRecordTable(client: LarkClient, appToken: string) {
  return client.createTable(appToken, '测试记录', [
    { field_name: '测试名称', type: 1 }, // Text
    { field_name: '测试类型', type: 3 }, // Single select
    { field_name: '状态', type: 3 }, // Single select
    { field_name: '规格ID', type: 1 }, // Text
    { field_name: '执行人', type: 11 }, // User
    { field_name: '执行日期', type: 5 }, // Date
    { field_name: '测试结果', type: 1 }, // Text
    { field_name: '失败原因', type: 1 }, // Text
    { field_name: '覆盖率', type: 2 }, // Number
    { field_name: '备注', type: 1 }, // Text
  ])
}
