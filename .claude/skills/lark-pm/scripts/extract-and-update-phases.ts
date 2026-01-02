/**
 * @spec T004-lark-project-management
 * 从任务备注中提取Phase信息并写入"阶段"字段
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

const FieldType = {
  TEXT: 1,
  NUMBER: 2,
  SINGLE_SELECT: 3,
  MULTI_SELECT: 4,
  DATE: 5,
};

async function extractAndUpdatePhases() {
  console.log(chalk.bold.blue('\n📋 提取Phase信息并更新任务\n'));

  try {
    const config = await loadConfig();
    const client = new LarkClient();
    const appToken = config.baseAppToken!;
    const tableId = config.tableIds!.tasks;

    // Step 1: 检查"阶段"字段是否存在
    console.log(chalk.cyan('🔍 Step 1: 检查"阶段"字段...\n'));
    const fields = await client.listFields(appToken, tableId);
    const fieldNames = fields.map((f: any) => f.field_name);
    const hasPhaseField = fieldNames.includes('阶段');

    if (!hasPhaseField) {
      console.log(chalk.yellow('⚠️  "阶段"字段不存在，正在创建...\n'));

      // 创建单选字段，包含Phase 1到Phase 7
      await client.createField(
        appToken,
        tableId,
        '阶段',
        FieldType.SINGLE_SELECT,
        {
          options: [
            { name: 'Phase 1' },
            { name: 'Phase 2' },
            { name: 'Phase 3' },
            { name: 'Phase 4' },
            { name: 'Phase 5' },
            { name: 'Phase 6' },
            { name: 'Phase 7' },
          ],
        }
      );

      console.log(chalk.green('✅ "阶段"字段创建成功\n'));

      // 等待一下让字段创建完成
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.log(chalk.green('✅ "阶段"字段已存在\n'));
    }

    // Step 2: 获取所有O006任务
    console.log(chalk.cyan('🔍 Step 2: 获取所有O006任务...\n'));
    const result = await client.searchRecords(
      appToken,
      tableId,
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

    console.log(chalk.cyan(`📊 找到 ${result.items.length} 条O006任务\n`));

    if (result.items.length === 0) {
      console.log(chalk.yellow('⚠️  没有找到O006任务，退出\n'));
      return;
    }

    // Step 3: 提取Phase并更新
    console.log(chalk.cyan('🔄 Step 3: 提取Phase信息并更新任务...\n'));

    let successCount = 0;
    let failureCount = 0;
    const failures: Array<{ title: string; error: string }> = [];

    for (const task of result.items) {
      const recordId = task.record_id;

      // 提取标题（可能是对象数组或字符串）
      const titleRaw = task.fields['标题'];
      const title = Array.isArray(titleRaw)
        ? titleRaw.map((t: any) => t.text).join('')
        : (typeof titleRaw === 'string' ? titleRaw : '未知标题');

      // 提取备注（可能是对象数组或字符串）
      const notesRaw = task.fields['备注'];
      const notes = Array.isArray(notesRaw)
        ? notesRaw.map((n: any) => n.text).join(' ')
        : (typeof notesRaw === 'string' ? notesRaw : '');

      // 从备注中提取Phase（格式: "Phase X: ..." 或 "Phase X - ..."）
      const phaseMatch = notes.match(/Phase\s*(\d+)/i);

      if (!phaseMatch) {
        console.log(chalk.gray(`   ⏭️  跳过：${title}（未找到Phase信息）`));
        continue;
      }

      const phaseNumber = phaseMatch[1];
      const phaseName = `Phase ${phaseNumber}`;

      try {
        // 更新任务的"阶段"字段
        await client.updateRecord(
          appToken,
          tableId,
          recordId,
          {
            '阶段': phaseName,
          }
        );

        successCount++;
        console.log(chalk.green(`   ✅ 更新成功：${title} → ${phaseName}`));

        // 速率限制：每次更新后等待200ms
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error: any) {
        failureCount++;
        failures.push({ title, error: error.message });
        console.log(chalk.red(`   ❌ 更新失败：${title} - ${error.message}`));
      }
    }

    // Step 4: 显示总结
    console.log();
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.cyan('📊 更新结果总结'));
    console.log(chalk.bold.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    console.log(chalk.green(`✅ 成功更新: ${successCount} 条`));
    console.log(chalk.red(`❌ 更新失败: ${failureCount} 条`));
    console.log();

    if (failures.length > 0) {
      console.log(chalk.red('失败记录：\n'));
      failures.forEach((f, index) => {
        console.log(chalk.yellow(`   ${index + 1}. ${f.title}`));
        console.log(chalk.gray(`      错误: ${f.error}\n`));
      });
    }

    console.log(chalk.blue('🔗 查看飞书表格：'));
    console.log(chalk.blue('   https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA\n'));

  } catch (error: any) {
    console.error(chalk.red('\n❌ 执行失败:'), error.message || error);
    console.log();
    process.exit(1);
  }
}

extractAndUpdatePhases();
