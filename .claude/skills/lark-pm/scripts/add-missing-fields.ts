/**
 * @spec T004-lark-project-management
 * 向飞书表格添加缺失的字段（保留现有数据）
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(chalk.bold.blue('\n📝 飞书表格字段补充指南\n'))

console.log(chalk.yellow('根据错误日志分析，您的飞书"任务管理"表格缺少以下字段：'))
console.log()

console.log(chalk.bold.cyan('🔧 需要添加的字段清单：'))
console.log()

const fieldsToAdd = [
  {
    name: '规格ID',
    type: '文本',
    required: true,
    description: '用于关联 spec 规格标识符（如 O006）',
  },
  {
    name: '预计工时',
    type: '数字',
    required: false,
    description: '任务预估工时（单位：小时）',
  },
  {
    name: '标签',
    type: '多选',
    required: false,
    description: '任务分类标签（如 Frontend, Backend, Test 等）',
    options: ['Frontend', 'Backend', 'Test', 'Docs', 'Design', 'Infra'],
  },
  {
    name: '进度',
    type: '数字',
    required: false,
    description: '任务完成进度（0-100）',
  },
  {
    name: '备注',
    type: '文本',
    required: false,
    description: '任务详细说明和依赖关系',
  },
]

fieldsToAdd.forEach((field, index) => {
  console.log(chalk.yellow(`${index + 1}. ${field.name}`))
  console.log(chalk.gray(`   类型: ${field.type}`))
  console.log(chalk.gray(`   必需: ${field.required ? '是' : '否'}`))
  console.log(chalk.gray(`   说明: ${field.description}`))
  if (field.options) {
    console.log(chalk.gray(`   选项: ${field.options.join(', ')}`))
  }
  console.log()
})

console.log(chalk.bold.cyan('📋 添加字段步骤：'))
console.log()
console.log(chalk.white('1️⃣  打开飞书多维表格'))
console.log(chalk.gray('   访问: https://base.feishu.cn'))
console.log(chalk.gray('   找到 "项目管理系统" → "任务管理" 表格'))
console.log()

console.log(chalk.white('2️⃣  添加字段'))
console.log(chalk.gray('   a. 在表格右侧点击 "+ 添加字段" 按钮'))
console.log(chalk.gray('   b. 输入字段名称（必须与上述名称完全一致）'))
console.log(chalk.gray('   c. 选择对应的字段类型'))
console.log(chalk.gray('   d. 如果是"多选"类型，添加上述选项'))
console.log(chalk.gray('   e. 点击"确定"保存'))
console.log(chalk.gray('   f. 重复以上步骤，添加所有缺失字段'))
console.log()

console.log(chalk.white('3️⃣  验证字段'))
console.log(chalk.gray('   确保以下字段全部存在：'))
console.log(chalk.gray('   ✓ 标题 (文本)'))
console.log(chalk.gray('   ✓ 优先级 (单选)'))
console.log(chalk.gray('   ✓ 状态 (单选)'))
console.log(chalk.gray('   ✓ 规格ID (文本) ← 新增'))
console.log(chalk.gray('   ✓ 标签 (多选) ← 新增'))
console.log(chalk.gray('   ✓ 进度 (数字) ← 新增'))
console.log(chalk.gray('   ✓ 预计工时 (数字) ← 新增'))
console.log(chalk.gray('   ✓ 备注 (文本) ← 新增'))
console.log()

console.log(chalk.white('4️⃣  重新运行导入'))
console.log(chalk.gray('   cd .claude/skills/lark-pm'))
console.log(chalk.gray('   npx tsx scripts/import-o006-tasks.ts'))
console.log()

console.log(chalk.bold.green('💡 提示：'))
console.log(chalk.gray('   • 字段名称必须完全一致（包括中文字符）'))
console.log(chalk.gray('   • 添加字段不会影响现有数据'))
console.log(chalk.gray('   • "多选"类型的"标签"字段选项可以先添加基本的 6 个'))
console.log(chalk.gray('   • 后续可以在飞书表格中随时追加更多选项'))
console.log()

console.log(chalk.bold.cyan('🔗 快速访问链接：'))
console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA'))
console.log()

console.log(chalk.bold.yellow('⚠️  常见问题：'))
console.log()
console.log(chalk.yellow('Q: 为什么字段名称必须完全一致？'))
console.log(chalk.gray('A: 代码通过字段名称（如"规格ID"）来映射数据，名称不匹配会导致"FieldNameNotFound"错误'))
console.log()
console.log(chalk.yellow('Q: "标签"字段的选项有哪些？'))
console.log(chalk.gray('A: Frontend, Backend, Test, Docs, Design, Infra（6 个基础选项）'))
console.log()
console.log(chalk.yellow('Q: 添加字段后需要重启服务吗？'))
console.log(chalk.gray('A: 不需要，直接重新运行导入脚本即可'))
console.log()

console.log(chalk.bold.green('✅ 添加完所有字段后，您的 O006 Sprint 任务导入将顺利完成！'))
console.log()
