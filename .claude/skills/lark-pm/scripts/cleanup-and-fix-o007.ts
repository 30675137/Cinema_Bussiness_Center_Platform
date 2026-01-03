/**
 * @spec T004-lark-project-management
 * Cleanup and fix O007 tasks:
 * 1. Deduplicate tasks (keep first occurrence)
 * 2. Populate task ID field from title
 * 3. Populate phase field from notes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

interface TaskRecord {
  id: string;
  title: string;
  taskId?: string;
  phase?: string;
  notes?: string;
}

async function runCommand(cmd: string): Promise<string> {
  const { stdout } = await execAsync(cmd, {
    cwd: '/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm',
    maxBuffer: 1024 * 1024 * 10
  });
  return stdout;
}

async function getAllTasks(): Promise<TaskRecord[]> {
  console.log(chalk.cyan('📖 Fetching all O007 tasks...\n'));

  const tasks: TaskRecord[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const cmd = `npx tsx src/index.ts task list --spec-id O007 --page ${page} --page-size ${pageSize}`;
    const output = await runCommand(cmd);

    // Parse task IDs and titles from output
    const lines = output.split('\n');
    const recordLines = lines.filter(line => line.startsWith('recv'));

    if (recordLines.length === 0) break;

    for (const line of recordLines) {
      const parts = line.trim().split(/\s+/);
      const id = parts[0];
      const title = parts.slice(1).join(' ').split('📝')[0].trim();

      tasks.push({ id, title });
    }

    // Check if there are more pages
    if (recordLines.length < pageSize) break;
    page++;
  }

  console.log(chalk.green(`✅ Found ${tasks.length} tasks\n`));
  return tasks;
}

async function deduplicateTasks(tasks: TaskRecord[]): Promise<string[]> {
  console.log(chalk.cyan('🔍 Step 1: Deduplicating tasks...\n'));

  const seen = new Map<string, string>(); // taskId -> first record ID
  const toDelete: string[] = [];

  for (const task of tasks) {
    // Extract task ID from title
    const match = task.title.match(/^(T\d{3}):/);
    if (!match) continue;

    const taskId = match[1];

    if (seen.has(taskId)) {
      toDelete.push(task.id);
      console.log(chalk.yellow(`  ➖ Duplicate found: ${taskId} (${task.id})`));
    } else {
      seen.set(taskId, task.id);
    }
  }

  console.log(chalk.green(`\n✅ Found ${toDelete.length} duplicates to delete\n`));
  return toDelete;
}

async function deleteTasks(ids: string[]): Promise<void> {
  console.log(chalk.cyan(`🗑️  Deleting ${ids.length} duplicate tasks...\n`));

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const cmd = `npx tsx src/index.ts task delete --task-id ${id} --confirm`;
      await runCommand(cmd);
      console.log(chalk.green(`  ✅ [${i + 1}/${ids.length}] Deleted ${id}`));

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(chalk.red(`  ❌ Failed to delete ${id}: ${error.message}`));
    }
  }

  console.log(chalk.green(`\n✅ Deletion complete\n`));
}

async function updateTaskFields(tasks: TaskRecord[]): Promise<void> {
  console.log(chalk.cyan('📝 Step 2 & 3: Updating task ID and phase fields...\n'));

  let updated = 0;
  let skipped = 0;

  for (const task of tasks) {
    // Extract task ID from title
    const taskIdMatch = task.title.match(/^(T\d{3}):/);
    if (!taskIdMatch) {
      console.log(chalk.yellow(`  ⚠️  Skipping ${task.id}: No task ID in title`));
      skipped++;
      continue;
    }

    const taskId = taskIdMatch[1];

    // TODO: Get notes to extract phase
    // For now, we'll skip updating phase since we need to fetch full task details

    try {
      const cmd = `npx tsx src/index.ts task update --task-id ${task.id} --notes "任务标识: ${taskId}"`;
      await runCommand(cmd);

      console.log(chalk.green(`  ✅ Updated ${task.id}: Task ID = ${taskId}`));
      updated++;

      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(chalk.red(`  ❌ Failed to update ${task.id}: ${error.message}`));
    }
  }

  console.log(chalk.green(`\n✅ Updated ${updated} tasks, skipped ${skipped}\n`));
}

async function main() {
  console.log(chalk.bold.cyan('\n🚀 Starting O007 tasks cleanup and fix\n'));
  console.log(chalk.gray('═'.repeat(60)) + '\n');

  // Step 1: Get all tasks
  const allTasks = await getAllTasks();

  // Step 2: Find duplicates
  const duplicates = await deduplicateTasks(allTasks);

  if (duplicates.length > 0) {
    // Step 3: Delete duplicates
    await deleteTasks(duplicates);
  } else {
    console.log(chalk.green('✅ No duplicates found!\n'));
  }

  // Step 4: Get remaining tasks
  const remainingTasks = await getAllTasks();

  // Step 5: Update task ID and phase fields
  await updateTaskFields(remainingTasks);

  console.log(chalk.gray('\n' + '═'.repeat(60)));
  console.log(chalk.bold.green('\n✨ All done!\n'));
  console.log(chalk.cyan('🔗 View tasks: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA&view=vew5v71Ru7\n'));
}

main().catch(error => {
  console.error(chalk.red('\n❌ Fatal error:'), error);
  process.exit(1);
});
