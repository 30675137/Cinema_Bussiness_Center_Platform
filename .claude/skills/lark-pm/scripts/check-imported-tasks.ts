/**
 * @spec T004-lark-project-management
 * 检查已导入的 O006 任务
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

async function checkImportedTasks() {
  console.log(chalk.bold.blue('\n🔍 检查已导入的 O006 任务\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();

    // 搜索 O006 任务
    const result = await client.searchRecords(
      config.baseAppToken!,
      config.tableIds!.tasks,
      {
        filter: {
          conjunction: 'and',
          conditions: [
            {
              field_name: '规格ID',
              operator: 'is',
              value: ['O006'],
            },
          ],
        },
        automatic_fields: true,
      }
    );

    console.log(chalk.cyan(`📊 找到 ${result.items.length} 条 O006 任务记录\n`));

    if (result.items.length > 0) {
      console.log(chalk.green('✅ 成功导入的任务：\n'));

      result.items.forEach((item: any, index: number) => {
        const title = item.fields['标题'] || '未知标题';
        const status = item.fields['状态'] || '未知状态';
        console.log(chalk.gray(`   ${index + 1}. ${status} ${title}`));
      });

      console.log();
      console.log(chalk.blue('🔗 查看飞书表格：'));
      console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));
    } else {
      console.log(chalk.yellow('⚠️  没有找到已导入的 O006 任务\n'));
      console.log(chalk.gray('可能原因：'));
      console.log(chalk.gray('1. 字段缺失导致所有任务创建失败'));
      console.log(chalk.gray('2. 表格中确实没有数据\n'));
    }
  } catch (error: any) {
    console.error(chalk.red('\n❌ 检查失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

checkImportedTasks();
