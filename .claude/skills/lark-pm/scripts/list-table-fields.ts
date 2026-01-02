/**
 * @spec T004-lark-project-management
 * 列出表格中的所有字段
 */

import { config as dotenvConfig } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '..', '.env');
dotenvConfig({ path: envPath });

import { LarkClient } from '../src/lark/client.js';
import { loadConfig } from '../src/config/config-manager.js';

const REQUIRED_FIELDS = ['标题', '优先级', '状态', '规格ID', '标签', '进度', '预计工时', '备注'];

async function listTableFields() {
  console.log(chalk.bold.blue('\n📋 飞书表格字段列表\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();

    const fields = await client.listFields(
      config.baseAppToken!,
      config.tableIds!.tasks
    );

    console.log(chalk.cyan(`📊 表格共有 ${fields.length} 个字段：\n`));

    fields.forEach((field: any, index: number) => {
      const isRequired = REQUIRED_FIELDS.includes(field.field_name);
      const marker = isRequired ? chalk.green('✓') : chalk.gray('-');
      const typeMap: Record<number, string> = {
        1: '文本',
        2: '数字',
        3: '单选',
        4: '多选',
        5: '日期',
        7: '复选框',
        11: '人员',
        1001: '创建时间',
        1002: '修改时间',
        1003: '创建人',
        1004: '修改人',
      };
      const typeName = typeMap[field.type] || `类型${field.type}`;

      console.log(`   ${marker} ${index + 1}. ${field.field_name} (${typeName})`);
    });

    console.log();
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.cyan('📊 必需字段检查'));
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    const fieldNames = fields.map((f: any) => f.field_name);
    const missingFields = REQUIRED_FIELDS.filter(f => !fieldNames.includes(f));

    if (missingFields.length === 0) {
      console.log(chalk.green('✅ 所有必需字段都已存在！\n'));

      REQUIRED_FIELDS.forEach(fieldName => {
        const field = fields.find((f: any) => f.field_name === fieldName);
        if (field) {
          const typeMap: Record<number, string> = {
            1: '文本',
            2: '数字',
            3: '单选',
            4: '多选',
          };
          console.log(chalk.gray(`   ✓ ${fieldName} (${typeMap[field.type] || `类型${field.type}`})`));
        }
      });

      console.log();
      console.log(chalk.green('🎉 可以开始导入任务了！\n'));
      console.log(chalk.white('   npx tsx scripts/import-o006-tasks.ts\n'));

    } else {
      console.log(chalk.red(`❌ 缺少 ${missingFields.length} 个必需字段：\n`));

      missingFields.forEach((fieldName, index) => {
        console.log(chalk.yellow(`   ${index + 1}. ${fieldName}`));
      });

      console.log();
      console.log(chalk.blue('🔗 请在飞书表格中添加这些字段：'));
      console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));
    }

  } catch (error: any) {
    console.error(chalk.red('\n❌ 获取字段列表失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

listTableFields();
