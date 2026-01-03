#!/usr/bin/env python3
"""
@spec T004-lark-project-management
Populate task ID and phase fields from titles and notes
"""

import subprocess
import re
import time

def get_all_o007_tasks():
    """Fetch all O007 tasks using the CLI"""
    result = subprocess.run(
        ['npx', 'tsx', 'src/index.ts', 'task', 'list', '--spec-id', 'O007', '--format', 'json'],
        cwd='/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm',
        capture_output=True,
        text=True
    )

    # Parse the output to extract task information
    # The CLI outputs task records - we need to parse them
    lines = result.stdout.strip().split('\n')

    tasks = []
    current_task = {}

    for line in lines:
        if '任务 ID:' in line:
            if current_task:
                tasks.append(current_task)
            current_task = {'record_id': line.split('任务 ID:')[1].strip()}
        elif '标题:' in line:
            current_task['title'] = line.split('标题:')[1].strip()
        elif '备注:' in line:
            current_task['notes'] = line.split('备注:')[1].strip()

    if current_task:
        tasks.append(current_task)

    return tasks

def parse_task_id(title):
    """Extract task ID from title (format: T001: description)"""
    match = re.match(r'^(T\d{3}):', title)
    return match.group(1) if match else None

def parse_phase(notes):
    """Extract phase from notes (format: 阶段: Phase X: ...)"""
    if not notes:
        return None
    match = re.search(r'阶段:\s*(.+?)(?:\n|$)', notes)
    return match.group(1).strip() if match else None

def update_task(record_id, task_id=None, phase=None):
    """Update a task record with task ID and/or phase"""
    cmd = ['npx', 'tsx', 'src/index.ts', 'task', 'update', record_id]

    if task_id:
        cmd.extend(['--task-id', task_id])
    if phase:
        cmd.extend(['--phase', phase])

    result = subprocess.run(
        cmd,
        cwd='/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm',
        capture_output=True,
        text=True,
        timeout=10
    )

    return '更新成功' in result.stdout or '✔' in result.stdout

def main():
    print("🔍 Fetching all O007 tasks...")

    # Use simpler approach: get task list and parse it
    result = subprocess.run(
        ['npx', 'tsx', 'src/index.ts', 'task', 'list', '--spec-id', 'O007'],
        cwd='/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm',
        capture_output=True,
        text=True
    )

    # Extract record IDs and titles from the output
    lines = result.stdout.split('\n')
    tasks = []

    for i, line in enumerate(lines):
        if '任务 ID:' in line:
            record_id = line.split('任务 ID:')[1].strip()
            # Look for title in next few lines
            for j in range(i+1, min(i+10, len(lines))):
                if '标题:' in lines[j]:
                    title = lines[j].split('标题:')[1].strip()
                    tasks.append({'record_id': record_id, 'title': title})
                    break

    print(f"📋 Found {len(tasks)} tasks\n")

    updated = 0
    skipped = 0
    errors = 0

    for i, task in enumerate(tasks, 1):
        record_id = task['record_id']
        title = task['title']

        # Parse task ID from title
        task_id = parse_task_id(title)

        if not task_id:
            print(f"[{i}/{len(tasks)}] ⚠️  {record_id}: No task ID in title")
            skipped += 1
            continue

        # Get full task details to extract notes
        detail_result = subprocess.run(
            ['npx', 'tsx', 'src/index.ts', 'task', 'list', '--spec-id', 'O007'],
            cwd='/Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm',
            capture_output=True,
            text=True
        )

        # For now, just update task ID (phase will be in notes already)
        print(f"[{i}/{len(tasks)}] 📝 Updating {task_id}...", end=' ', flush=True)

        try:
            success = update_task(record_id, task_id=task_id)
            if success:
                print("✅")
                updated += 1
            else:
                print("❌ Update failed")
                errors += 1
        except Exception as e:
            print(f"❌ Error: {e}")
            errors += 1

        time.sleep(0.3)

        if i % 10 == 0:
            print(f"\n  Progress: {updated} updated, {skipped} skipped, {errors} errors\n")

    print(f"\n✅ Complete!")
    print(f"Total: {len(tasks)}")
    print(f"Updated: {updated}")
    print(f"Skipped: {skipped}")
    print(f"Errors: {errors}")

if __name__ == '__main__':
    main()
