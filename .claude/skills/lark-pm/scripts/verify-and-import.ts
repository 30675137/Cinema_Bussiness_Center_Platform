/**
 * @spec T004-lark-project-management
 * 验证字段并执行 O006 Sprint 导入 - 一键执行版本
 *
 * 使用方式:
 * npx tsx scripts/verify-and-import.ts
 *
 * 功能:
 * 1. 如果表格为空且缺少字段，提供完整的字段添加指南
 * 2. 如果字段已添加，自动执行导入
 * 3. 导入完成后显示后续操作指南
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { config as dotenvConfig } from 'dotenv';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

import { LarkClient } from '../src/lark/client.js';
import { loadConfig } from '../src/config/config-manager.js';

const REQUIRED_FIELDS = ['标题', '优先级', '状态', '规格ID', '标签', '进度', '预计工时', '备注'];

const FIELD_DEFINITIONS = [
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
    description: '任务分类标签',
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
];

async function checkFieldsAndImport() {
  console.log(chalk.bold.blue('\n🚀 O006 Sprint 一键导入工具\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();

    // 步骤 1: 尝试检测字段
    console.log(chalk.yellow('步骤 1/3: 检测飞书表格字段...\n'));

    let missingFields: string[] = [];
    let hasData = false;

    try {
      const result = await client.searchRecords(
        config.baseAppToken!,
        config.tableIds!.tasks,
        {
          filter: { conjunction: 'and', conditions: [] },
          automatic_fields: true,
        }
      );

      if (result.items.length > 0) {
        hasData = true;
        const existingFields = Object.keys(result.items[0].fields);
        missingFields = REQUIRED_FIELDS.filter(f => !existingFields.includes(f));

        console.log(chalk.green('✅ 表格中有数据，已检测到以下字段：'));
        existingFields.forEach(field => {
          const isRequired = REQUIRED_FIELDS.includes(field);
          console.log(chalk.gray(`   ${isRequired ? '✓' : '-'} ${field}`));
        });
        console.log();
      } else {
        console.log(chalk.yellow('⚠️  表格为空，将尝试创建测试任务来检测字段\n'));
      }
    } catch (error: any) {
      console.log(chalk.red(`❌ 检测失败: ${error.message}\n`));
    }

    // 步骤 2: 如果表格为空或有缺失字段，提供明确指引
    if (!hasData || missingFields.length > 0) {
      console.log(chalk.bold.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
      console.log(chalk.bold.yellow('⚠️  需要手动添加字段（Lark API 限制）\n'));
      console.log(chalk.bold.red('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      console.log(chalk.cyan('由于飞书 API 限制，无法通过代码自动创建字段。'));
      console.log(chalk.cyan('请按以下步骤在飞书表格中手动添加字段（约 2-3 分钟）：\n'));

      console.log(chalk.bold.white('📋 步骤 A: 打开飞书表格\n'));
      console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));

      console.log(chalk.bold.white('📋 步骤 B: 添加以下字段（点击表格右侧 "+" 按钮）\n'));

      FIELD_DEFINITIONS.forEach((field, index) => {
        console.log(chalk.yellow(`   ${index + 1}. ${field.name}`));
        console.log(chalk.gray(`      • 字段类型: ${field.type}`));
        console.log(chalk.gray(`      • 说明: ${field.description}`));
        if (field.options) {
          console.log(chalk.gray(`      • 选项: ${field.options.join(', ')}`));
        }
        console.log();
      });

      console.log(chalk.bold.white('📋 步骤 C: 添加完成后，重新运行此脚本\n'));
      console.log(chalk.gray('   npx tsx scripts/verify-and-import.ts\n'));

      console.log(chalk.bold.green('💡 提示：'));
      console.log(chalk.gray('   • 字段名称必须完全一致（包括中文字符）'));
      console.log(chalk.gray('   • 不会删除现有数据或字段（仅增加）'));
      console.log(chalk.gray('   • "多选"类型的"标签"字段需添加 6 个选项\n'));

      process.exit(1);
    }

    // 步骤 3: 字段完备，执行导入
    console.log(chalk.bold.green('步骤 2/3: ✅ 所有字段已就绪！\n'));
    console.log(chalk.cyan('步骤 3/3: 开始批量导入 40 个 O006 Sprint 任务...\n'));

    const projectRoot = path.resolve(__dirname, '..');
    process.chdir(projectRoot);

    try {
      execSync('npx tsx scripts/import-o006-tasks.ts', {
        stdio: 'inherit',
        cwd: projectRoot,
      });

      console.log(chalk.bold.green('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.bold.green('✅ Sprint 导入完成！'));
      console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      console.log(chalk.cyan('📊 已导入内容：\n'));
      console.log(chalk.gray('   • 40 个任务，分布在 7 个 Sprint'));
      console.log(chalk.gray('   • 预计总工时: 123.25 小时'));
      console.log(chalk.gray('   • Sprint 信息存储在任务标题中（如 [Sprint-1]）\n'));

      console.log(chalk.cyan('📝 后续操作：\n'));
      console.log(chalk.gray('   # 查看所有 Sprint 统计'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh stats\n'));
      console.log(chalk.gray('   # 查看 Sprint 1 任务'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh list 1\n'));
      console.log(chalk.gray('   # 启动 Sprint 1'));
      console.log(chalk.white('   ./scripts/manage-sprints.sh start 1\n'));

      console.log(chalk.blue('🔗 飞书表格链接：'));
      console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));

    } catch (error: any) {
      console.log(chalk.red('\n❌ 导入过程中出现错误\n'));

      if (error.message?.includes('FieldNameNotFound')) {
        console.log(chalk.yellow('⚠️  仍然检测到字段缺失错误'));
        console.log(chalk.gray('   可能原因：'));
        console.log(chalk.gray('   1. 字段名称不完全匹配（检查中文字符）'));
        console.log(chalk.gray('   2. 字段类型不正确（如"标签"必须是"多选"类型）'));
        console.log(chalk.gray('   3. 浏览器缓存问题（刷新飞书页面后重试）\n'));
      }

      throw error;
    }

  } catch (error: any) {
    console.error(chalk.red('\n❌ 执行失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

checkFieldsAndImport();
