/**
 * @spec T004-lark-project-management
 * Simplified script to import O007 tasks from tasks.md to Lark PM
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Task {
  taskId: string;
  title: string;
  phase: string;
  isParallel: boolean;
  storyLabel?: string;
}

// Parse tasks.md file
function parseTasks(filePath: string): Task[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const tasks: Task[] = [];
  let currentPhase = '';

  for (const line of lines) {
    // Extract phase headers: ## Phase 1: Setup & Infrastructure
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
        storyLabel: story?.replace(/[\[\]]/g, '')
      });
    }
  }

  return tasks;
}

// Generate shell commands to create tasks
function generateCommands(tasks: Task[]): string[] {
  const commands: string[] = [];

  for (const task of tasks) {
    // 标题包含任务标识和描述
    const title = `${task.taskId}: ${task.title.substring(0, 140)}${task.title.length > 140 ? '...' : ''}`;

    // 备注包含完整结构化信息
    const notes = [
      `任务标识: ${task.taskId}`,
      `阶段: ${task.phase}`,
      task.storyLabel ? `用户故事: ${task.storyLabel}` : '',
      task.isParallel ? '可并行: ✓' : '可并行: ✗',
      `完整描述: ${task.title}`
    ].filter(Boolean).join('\n');

    // Escape special characters for shell
    const escapedTitle = title.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/'/g, "\\'");
    const escapedNotes = notes.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/'/g, "\\'").replace(/\n/g, '\\n');

    // 构建命令，暂时将结构化信息放在备注中
    const cmd = `npx tsx src/index.ts task create --title "${escapedTitle}" --spec-id O007 --status "📝 待办" --priority "🟡 中" --tags Frontend --notes "${escapedNotes}"`;

    commands.push(cmd);
  }

  return commands;
}

// Main execution
async function main() {
  const tasksFilePath = path.join(
    __dirname,
    '../../../../specs/O007-miniapp-menu-api/tasks.md'
  );

  console.log('📖 Reading tasks from:', tasksFilePath);
  const tasks = parseTasks(tasksFilePath);

  console.log(`\n📊 Found ${tasks.length} tasks\n`);

  // Show summary by phase
  const phaseCount = tasks.reduce((acc, task) => {
    acc[task.phase] = (acc[task.phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📋 Tasks by phase:');
  Object.entries(phaseCount).forEach(([phase, count]) => {
    console.log(`  - ${phase}: ${count} tasks`);
  });

  // Generate commands
  const commands = generateCommands(tasks);

  // Write commands to a shell script
  const scriptPath = path.join(__dirname, 'import-o007-commands.sh');
  const scriptContent = [
    '#!/bin/bash',
    '# Auto-generated script to import O007 tasks',
    '# Generated at: ' + new Date().toISOString(),
    '',
    'cd "$(dirname "$0")/.."',
    '',
    'echo "🚀 Importing 93 tasks to Lark PM..."',
    'echo ""',
    '',
    ...commands.map((cmd, i) => `echo "[${i + 1}/93] Creating ${tasks[i].taskId}..."\n${cmd}\nsleep 0.5\n`)
  ].join('\n');

  fs.writeFileSync(scriptPath, scriptContent, 'utf-8');
  fs.chmodSync(scriptPath, '0755');

  console.log(`\n✅ Generated shell script: ${scriptPath}`);
  console.log('\n📝 To import tasks, run:');
  console.log(`   cd ${path.dirname(scriptPath)}`);
  console.log(`   ./import-o007-commands.sh`);
  console.log('\n⚠️  This will create 93 tasks in Lark PM (estimated time: ~50 seconds)');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
