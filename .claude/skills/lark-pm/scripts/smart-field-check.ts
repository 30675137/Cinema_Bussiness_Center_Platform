/**
 * @spec T004-lark-project-management
 * 智能字段检测 - 通过尝试创建测试任务来精确识别缺失字段
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import chalk from 'chalk';
import { config as dotenvConfig } from 'dotenv';

// 加载环境变量
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

import { LarkClient } from '../src/lark/client.js';
import { loadConfig } from '../src/config/config-manager.js';

const ALL_FIELDS = [
  { name: '标题', type: 'Text', required: true },
  { name: '优先级', type: 'Single Select', required: true },
  { name: '状态', type: 'Single Select', required: true },
  { name: '规格ID', type: 'Text', required: true },
  { name: '标签', type: 'Multi Select', required: false },
  { name: '进度', type: 'Number', required: false },
  { name: '预计工时', type: 'Number', required: false },
  { name: '备注', type: 'Text', required: false },
];

async function detectMissingFields() {
  console.log(chalk.bold.blue('\n🔍 智能字段检测工具\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();

    console.log(chalk.yellow('正在尝试创建测试任务以检测缺失字段...\n'));

    // 尝试创建一个包含所有字段的测试任务
    const testFields: Record<string, any> = {
      '标题': '[测试] 字段检测任务',
      '优先级': '🟢 低',
      '状态': '📝 待办',
      '规格ID': 'TEST',
      '标签': ['Test'],
      '进度': 0,
      '预计工时': 0.1,
      '备注': '这是一个测试任务，用于检测字段是否完整',
    };

    console.log(chalk.gray('尝试创建测试任务...'));

    try {
      const result = await client.createRecord(
        config.baseAppToken!,
        config.tableIds!.tasks,
        { fields: testFields }
      );

      console.log(chalk.green('\n✅ 测试任务创建成功！所有字段已存在。\n'));
      console.log(chalk.cyan('测试任务 ID:'), result.record_id);
      console.log();

      // 删除测试任务
      console.log(chalk.gray('正在清理测试任务...'));
      await client.deleteRecord(
        config.baseAppToken!,
        config.tableIds!.tasks,
        result.record_id
      );
      console.log(chalk.green('✅ 测试任务已清理\n'));

      console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.bold.green('🎉 字段检测通过！可以开始导入了'));
      console.log(chalk.bold.green('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

      console.log(chalk.cyan('下一步：运行导入脚本\n'));
      console.log(chalk.white('   npx tsx scripts/import-o006-tasks.ts\n'));

      return true;

    } catch (error: any) {
      console.log(chalk.yellow('\n⚠️  测试任务创建失败，分析错误信息...\n'));

      if (error.message?.includes('FieldNameNotFound')) {
        console.log(chalk.red('检测到缺失字段！\n'));

        // 尝试逐个字段检测
        console.log(chalk.yellow('正在逐个字段检测...\n'));

        const existingFields: string[] = [];
        const missingFields: string[] = [];

        // 先测试必需字段
        const minimalFields: Record<string, any> = {
          '标题': '[测试] 最小字段测试',
          '优先级': '🟢 低',
          '状态': '📝 待办',
        };

        // 逐个添加可选字段测试
        for (const field of ALL_FIELDS) {
          if (['标题', '优先级', '状态'].includes(field.name)) {
            existingFields.push(field.name);
            console.log(chalk.green(`   ✓ ${field.name} (${field.type})`));
            continue;
          }

          const testValue = field.name === '标签' ? ['Test'] :
                           field.name === '进度' || field.name === '预计工时' ? 0 :
                           'test';

          const testFieldSet = {
            ...minimalFields,
            [field.name]: testValue,
          };

          try {
            const result = await client.createRecord(
              config.baseAppToken!,
              config.tableIds!.tasks,
              { fields: testFieldSet }
            );

            existingFields.push(field.name);
            console.log(chalk.green(`   ✓ ${field.name} (${field.type})`));

            // 清理测试记录
            await client.deleteRecord(
              config.baseAppToken!,
              config.tableIds!.tasks,
              result.record_id
            );

          } catch (fieldError: any) {
            if (fieldError.message?.includes('FieldNameNotFound')) {
              missingFields.push(field.name);
              console.log(chalk.red(`   ✗ ${field.name} (${field.type}) - 缺失`));
            }
          }

          // 避免请求过快
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log();
        console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk.bold.cyan('📊 检测结果'));
        console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

        console.log(chalk.green(`✅ 已存在字段: ${existingFields.length}/${ALL_FIELDS.length}`));
        existingFields.forEach(f => console.log(chalk.gray(`   • ${f}`)));
        console.log();

        if (missingFields.length > 0) {
          console.log(chalk.red(`❌ 缺失字段: ${missingFields.length}`));
          missingFields.forEach(f => console.log(chalk.yellow(`   • ${f}`)));
          console.log();

          console.log(chalk.bold.yellow('📝 请添加以下字段：\n'));

          const missingFieldDefs = ALL_FIELDS.filter(f => missingFields.includes(f.name));
          missingFieldDefs.forEach((field, index) => {
            console.log(chalk.yellow(`   ${index + 1}. ${field.name}`));
            console.log(chalk.gray(`      • 类型: ${field.type}`));

            if (field.name === '标签') {
              console.log(chalk.gray(`      • 选项: Frontend, Backend, Test, Docs, Design, Infra`));
            }
            console.log();
          });

          console.log(chalk.blue('🔗 飞书表格链接：'));
          console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));

          console.log(chalk.cyan('添加完成后，重新运行此脚本验证：'));
          console.log(chalk.white('   npx tsx scripts/smart-field-check.ts\n'));
        }

        return false;

      } else {
        console.log(chalk.red(`未知错误: ${error.message}\n`));
        throw error;
      }
    }

  } catch (error: any) {
    console.error(chalk.red('\n❌ 检测失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

detectMissingFields();
