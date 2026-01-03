/**
 * @spec T004-lark-project-management
 * Fix empty task ID field by parsing from title
 */

import { LarkClient } from '../src/lark/client.js';
import { loadConfig } from '../src/config/config-manager.js';
import chalk from 'chalk';

async function main() {
  console.log(chalk.cyan('📖 Loading configuration...'));
  const config = await loadConfig();

  if (!config.baseAppToken || !config.tableIds?.tasks) {
    console.error(chalk.red('❌ Missing configuration'));
    process.exit(1);
  }

  const client = new LarkClient();
  const appToken = config.baseAppToken;
  const tableId = config.tableIds.tasks;

  console.log(chalk.cyan('🔍 Searching for tasks with empty 任务标识 field...\n'));

  // Search for all O007 tasks
  const result = await client.searchRecords(appToken, tableId, {
    filter: {
      conjunction: 'and',
      conditions: [
        {
          field_name: '规格ID',
          operator: 'is',
          value: ['O007']
        }
      ]
    },
    automatic_fields: true
  });

  console.log(chalk.green(`✅ Found ${result.items.length} O007 tasks\n`));

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of result.items) {
    const recordId = record.record_id;
    const title = record.fields['标题'] as string;
    const currentTaskId = record.fields['任务标识'] as string | undefined;

    // Parse task ID from title (e.g., "T001: description")
    const match = title?.match(/^(T\d{3}):/);

    if (!match) {
      console.log(chalk.yellow(`⚠️  Skipping ${recordId}: No task ID found in title "${title?.substring(0, 50)}..."`));
      skipped++;
      continue;
    }

    const taskId = match[1];

    // Skip if task ID already exists
    if (currentTaskId && currentTaskId === taskId) {
      console.log(chalk.gray(`➖ Skipping ${recordId}: 任务标识 already set to ${taskId}`));
      skipped++;
      continue;
    }

    // Update the record
    try {
      await client.updateRecord(appToken, tableId, recordId, {
        '任务标识': taskId
      });

      console.log(chalk.green(`✅ Updated ${recordId}: 任务标识 = ${taskId} (from "${title.substring(0, 60)}...")`));
      fixed++;

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to update ${recordId}: ${error.message}`));
      errors++;
    }
  }

  console.log(chalk.cyan('\n📊 Summary:'));
  console.log(chalk.green(`  ✅ Fixed: ${fixed}`));
  console.log(chalk.yellow(`  ⚠️  Skipped: ${skipped}`));
  console.log(chalk.red(`  ❌ Errors: ${errors}`));
  console.log(chalk.green(`\n✨ Done!`));
}

main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
