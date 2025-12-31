/**
 * @spec T004-lark-project-management
 * Init command to create Base App and tables
 */

import { LarkClient } from '../lark/client.js'
import { loadConfig, saveConfig } from '../config/config-manager.js'
import logger from '../utils/logger.js'
import ora from 'ora'
import chalk from 'chalk'

export async function initCommand(): Promise<void> {
  console.log(chalk.bold.blue('\n📊 初始化 Lark 项目管理系统\n'))

  const spinner = ora('检查现有配置...').start()

  const config = await loadConfig()

  if (config.baseAppToken) {
    spinner.warn(
      chalk.yellow(`已存在 Base App: ${config.baseAppToken}`)
    )

    console.log(
      chalk.gray('\n提示: 如需重新初始化，请先删除 config.json 文件\n')
    )
    return
  }

  spinner.text = '创建 Base App...'

  const client = new LarkClient()

  try {
    // Create Base App
    const app = await client.createBaseApp('项目管理系统')
    spinner.succeed(chalk.green(`Base App 创建成功: ${app.name}`))

    logger.info(
      { appToken: app.app_token, url: app.url },
      'Base App created'
    )

    // Create tables
    const tableSpinner = ora('创建数据表...').start()

    const tables = await Promise.all([
      createTaskTable(client, app.app_token),
      createDebtTable(client, app.app_token),
      createBugTable(client, app.app_token),
      createFeatureTable(client, app.app_token),
      createTestRecordTable(client, app.app_token),
    ])

    tableSpinner.succeed(chalk.green('所有数据表创建成功'))

    // Save configuration
    const saveSpinner = ora('保存配置...').start()

    await saveConfig({
      baseAppToken: app.app_token,
      tableIds: {
        tasks: tables[0].table_id,
        technicalDebt: tables[1].table_id,
        bugs: tables[2].table_id,
        features: tables[3].table_id,
        testRecords: tables[4].table_id,
      },
    })

    saveSpinner.succeed(chalk.green('配置已保存到 config.json'))

    // Print summary
    console.log(chalk.bold.green('\n✅ 初始化完成!\n'))
    console.log(chalk.cyan('Base App URL:'), chalk.underline(app.url))
    console.log(chalk.cyan('App Token:'), app.app_token)
    console.log(chalk.cyan('\n创建的数据表:'))
    console.log(chalk.gray(`  - 任务管理: ${tables[0].table_id}`))
    console.log(chalk.gray(`  - 技术债: ${tables[1].table_id}`))
    console.log(chalk.gray(`  - Bug 跟踪: ${tables[2].table_id}`))
    console.log(chalk.gray(`  - 功能矩阵: ${tables[3].table_id}`))
    console.log(chalk.gray(`  - 测试记录: ${tables[4].table_id}`))
    console.log()
  } catch (error) {
    spinner.fail(chalk.red('初始化失败'))
    logger.error({ error }, 'Init command failed')
    throw error
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
