/**
 * @spec T004-lark-project-management
 * Script to import O007 tasks from tasks.md to Lark PM
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

interface Task {
  taskId: string;
  title: string;
  phase: string;
  isParallel: boolean;
  storyLabel?: string;
  specId: string;
  status: '📝 待办' | '🚀 进行中' | '✅ 已完成' | '❌ 已取消';
}

// Parse tasks.md file
function parseTasks(filePath: string): Task[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const tasks: Task[] = [];
  let currentPhase = '';

  for (const line of lines) {
    // Extract phase headers
    const phaseMatch = line.match(/^## (Phase \d+): (.+)$/);
    if (phaseMatch) {
      currentPhase = phaseMatch[1] + ': ' + phaseMatch[2];
      continue;
    }

    // Extract task lines: - [ ] T001 [P] [US1] Description
    const taskMatch = line.match(/^- \[ \] (T\d+)\s*(\[P\])?\s*(\[US\d+\])?\s*(.+)$/);
    if (taskMatch) {
      const [, taskId, parallel, story, description] = taskMatch;

      tasks.push({
        taskId,
        title: description.trim(),
        phase: currentPhase,
        isParallel: !!parallel,
        storyLabel: story?.replace(/[\[\]]/g, ''),
        specId: 'O007',
        status: '📝 待办'
      });
    }
  }

  return tasks;
}

// Create task in Lark PM
async function createTask(task: Task): Promise<void> {
  const title = `${task.taskId}: ${task.title}`;
  const notes = [
    `阶段: ${task.phase}`,
    task.storyLabel ? `用户故事: ${task.storyLabel}` : '',
    task.isParallel ? '可并行执行' : '顺序执行'
  ].filter(Boolean).join('\n');

  const tags = [];
  if (task.storyLabel) {
    tags.push('Frontend');
  }
  if (task.isParallel) {
    tags.push('Frontend'); // Use existing tag
  }

  const cmd = [
    'npx tsx src/index.ts task create',
    `--title "${title}"`,
    `--spec-id ${task.specId}`,
    `--status "${task.status}"`,
    `--priority "🟡 中"`,
    tags.length > 0 ? `--tags ${tags[0]}` : '',
    `--notes "${notes}"`
  ].filter(Boolean).join(' ');

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      cwd: path.join(__dirname, '..'),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    if (stderr && !stderr.includes('[info]') && !stderr.includes('INFO')) {
      console.error(`Error creating task ${task.taskId}:`, stderr);
    } else {
      console.log(`✅ Created task ${task.taskId}: ${task.title.substring(0, 50)}...`);
    }
  } catch (error: any) {
    console.error(`❌ Failed to create task ${task.taskId}:`, error.message);
    throw error;
  }
}

// Main execution
async function main() {
  const tasksFilePath = path.join(
    __dirname,
    '../../../../specs/O007-miniapp-menu-api/tasks.md'
  );

  console.log('📖 Reading tasks from:', tasksFilePath);
  const tasks = parseTasks(tasksFilePath);

  console.log(`\n📊 Found ${tasks.length} tasks to import\n`);

  // Show summary by phase
  const phaseCount = tasks.reduce((acc, task) => {
    acc[task.phase] = (acc[task.phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📋 Tasks by phase:');
  Object.entries(phaseCount).forEach(([phase, count]) => {
    console.log(`  - ${phase}: ${count} tasks`);
  });

  console.log('\n🚀 Starting import...\n');

  // Import tasks sequentially to avoid rate limits
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`[${i + 1}/${tasks.length}] Creating ${task.taskId}...`);

    try {
      await createTask(task);

      // Add delay to avoid rate limiting (500ms between requests)
      if (i < tasks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`\n❌ Import failed at task ${task.taskId}`);
      console.log(`\n📊 Progress: ${i}/${tasks.length} tasks imported`);
      process.exit(1);
    }
  }

  console.log(`\n✅ Successfully imported all ${tasks.length} tasks!`);
  console.log('\n🔗 View tasks at: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA&view=vew5v71Ru7');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
