/**
 * @spec T004-lark-project-management
 * 诊断飞书表格字段，找出缺失的字段
 */

import { LarkClient } from '../src/lark/client.js'
import { loadConfig } from '../src/config/config-manager.js'
import chalk from 'chalk'

// 任务表需要的字段
const REQUIRED_TASK_FIELDS = [
  { name: '标题', type: 'Text', required: true },
  { name: '优先级', type: 'Single Select', required: true },
  { name: '状态', type: 'Single Select', required: true },
  { name: '规格ID', type: 'Text', required: true },
  { name: '负责人', type: 'User', required: false },
  { name: '截止日期', type: 'Date', required: false },
  { name: '标签', type: 'Multi Select', required: false },
  { name: '进度', type: 'Number', required: false },
  { name: '预计工时', type: 'Number', required: false },
  { name: '实际工时', type: 'Number', required: false },
  { name: '备注', type: 'Text', required: false },
]

async function main() {
  console.log(chalk.bold.blue('\n🔍 飞书表格字段诊断工具\n'))

  const config = await loadConfig()

  if (!config.baseAppToken || !config.tableIds?.tasks) {
    console.log(chalk.red('❌ 未找到配置，请先运行 init 命令'))
    process.exit(1)
  }

  const client = new LarkClient()

  console.log(chalk.cyan('Base App Token:'), config.baseAppToken)
  console.log(chalk.cyan('Tasks Table ID:'), config.tableIds.tasks)
  console.log()

  try {
    // 获取表格信息
    console.log(chalk.yellow('📋 正在获取表格字段信息...'))

    // 尝试使用不同的 API 方法获取字段信息
    // 方法1: 通过搜索空记录来推断字段
    const searchResult = await client.searchRecords(
      config.baseAppToken,
      config.tableIds.tasks,
      {
        filter: {
          conjunction: 'and',
          conditions: [],
        },
        automatic_fields: true,
      }
    )

    console.log(chalk.green('✅ 成功获取表格数据'))
    console.log(chalk.gray(`   总记录数: ${searchResult.total || searchResult.items.length}`))
    console.log()

    if (searchResult.items.length > 0) {
      const sampleRecord = searchResult.items[0]
      const existingFields = Object.keys(sampleRecord.fields)

      console.log(chalk.bold.cyan('📊 现有字段列表:'))
      existingFields.forEach((field, index) => {
        const value = sampleRecord.fields[field]
        const type = Array.isArray(value)
          ? 'Array'
          : typeof value === 'number'
          ? 'Number'
          : typeof value === 'object'
          ? 'Object'
          : 'Text'
        console.log(chalk.gray(`   ${index + 1}. ${field} (${type})`))
      })
      console.log()

      // 检查缺失字段
      console.log(chalk.bold.yellow('🔍 字段匹配检查:'))
      const missingFields: typeof REQUIRED_TASK_FIELDS = []
      const matchedFields: typeof REQUIRED_TASK_FIELDS = []

      REQUIRED_TASK_FIELDS.forEach((requiredField) => {
        const exists = existingFields.includes(requiredField.name)
        if (exists) {
          matchedFields.push(requiredField)
          console.log(
            chalk.green(`   ✅ ${requiredField.name} (${requiredField.type})`)
          )
        } else {
          missingFields.push(requiredField)
          const marker = requiredField.required ? chalk.red('❌ 必需') : chalk.yellow('⚠️  可选')
          console.log(
            `   ${marker} ${requiredField.name} (${requiredField.type})`
          )
        }
      })
      console.log()

      // 汇总结果
      console.log(chalk.bold.cyan('📊 诊断结果:'))
      console.log(chalk.green(`   ✅ 已匹配字段: ${matchedFields.length}/${REQUIRED_TASK_FIELDS.length}`))
      console.log(chalk.yellow(`   ⚠️  缺失字段: ${missingFields.length}`))
      console.log()

      if (missingFields.length > 0) {
        console.log(chalk.bold.red('⚠️  需要添加的字段:'))
        console.log()

        missingFields.forEach((field) => {
          const typeMapping: Record<string, string> = {
            'Text': '文本',
            'Number': '数字',
            'Single Select': '单选',
            'Multi Select': '多选',
            'User': '人员',
            'Date': '日期',
          }

          console.log(chalk.yellow(`   字段名称: ${field.name}`))
          console.log(chalk.gray(`   字段类型: ${typeMapping[field.type] || field.type}`))
          console.log(chalk.gray(`   是否必需: ${field.required ? '是' : '否'}`))
          console.log()
        })

        console.log(chalk.bold.cyan('📝 添加字段步骤:'))
        console.log(chalk.gray('   1. 打开飞书多维表格'))
        console.log(chalk.gray('   2. 在表格右侧点击 "+ 添加字段"'))
        console.log(chalk.gray('   3. 逐个添加上述缺失字段'))
        console.log(chalk.gray('   4. 确保字段名称和类型完全匹配'))
        console.log(chalk.gray('   5. 重新运行批量导入脚本'))
        console.log()

        // 生成飞书表格链接
        console.log(chalk.bold.cyan('🔗 快速访问:'))
        console.log(
          chalk.blue(
            `   https://base.feishu.cn/base/${config.baseAppToken}?table=${config.tableIds.tasks}`
          )
        )
        console.log()
      } else {
        console.log(chalk.bold.green('✅ 所有必需字段都已存在！'))
        console.log(chalk.gray('   您可以重新运行批量导入脚本'))
        console.log()
      }
    } else {
      console.log(chalk.yellow('⚠️  表格中暂无记录，无法推断字段结构'))
      console.log(chalk.gray('   建议先手动创建一条测试记录'))
      console.log()

      console.log(chalk.bold.cyan('📝 推荐操作:'))
      console.log(chalk.gray('   1. 打开飞书多维表格'))
      console.log(chalk.gray('   2. 手动创建一条测试任务记录'))
      console.log(chalk.gray('   3. 重新运行此诊断脚本'))
      console.log()
    }
  } catch (error: any) {
    console.log(chalk.red('❌ 诊断失败'))
    console.log(chalk.gray(`   错误信息: ${error.message || error}`))
    console.log()

    if (error.message?.includes('FieldNameNotFound')) {
      console.log(chalk.yellow('⚠️  检测到字段名称不匹配'))
      console.log(
        chalk.gray('   这意味着代码中使用的字段名在表格中不存在')
      )
      console.log()
    }

    throw error
  }
}

main().catch((error) => {
  console.error(chalk.red('\n错误:'), error.message || error)
  process.exit(1)
})
