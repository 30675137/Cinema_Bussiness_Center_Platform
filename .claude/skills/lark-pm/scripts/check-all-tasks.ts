/**
 * @spec T004-lark-project-management
 * 检查任务表中的所有记录
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

async function checkAllTasks() {
  console.log(chalk.bold.blue('\n📋 检查任务表中的所有记录\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();
    const appToken = config.baseAppToken!;
    const tableId = config.tableIds!.tasks;

    // 获取所有记录（不加过滤条件）
    const result = await client.searchRecords(
      appToken,
      tableId,
      {
        automatic_fields: true,
      }
    );

    console.log(chalk.cyan(`📊 表格共有 ${result.items.length} 条记录\n`));

    if (result.items.length === 0) {
      console.log(chalk.yellow('⚠️  表格为空\n'));
      return;
    }

    console.log(chalk.green('前10条记录：\n'));

    result.items.slice(0, 10).forEach((item: any, index: number) => {
      const title = item.fields['标题'] || '未知标题';
      const specId = item.fields['规格ID'] || '无规格ID';
      const status = item.fields['状态'] || '未知状态';
      console.log(chalk.gray(`   ${index + 1}. ${status} [${specId}] ${title}`));
    });

    console.log();
    console.log(chalk.blue('🔗 查看飞书表格：'));
    console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));

  } catch (error: any) {
    console.error(chalk.red('\n❌ 检查失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

checkAllTasks();
