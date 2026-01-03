#!/bin/bash
# Simple cleanup script for O007 tasks

cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/.claude/skills/lark-pm

echo "🚀 Starting O007 tasks cleanup"
echo ""

# Step 1: Export all tasks to find duplicates
echo "📖 Step 1: Exporting all O007 tasks..."
npx tsx src/index.ts task list --spec-id O007 --page-size 100 > /tmp/o007-page1.txt 2>&1
npx tsx src/index.ts task list --spec-id O007 --page 2 --page-size 100 > /tmp/o007-page2.txt 2>&1

# Extract task IDs and titles
echo "🔍 Step 2: Finding duplicates..."
echo ""

# Parse records and find duplicates
grep "^recv" /tmp/o007-page*.txt | while read line; do
    record_id=$(echo "$line" | awk '{print $1}')
    title=$(echo "$line" | awk '{for(i=2;i<=NF;i++) printf "%s ", $i; print ""}' | sed 's/ 📝.*//')

    # Extract task ID from title (e.g., T001)
    task_id=$(echo "$title" | grep -oE "^T[0-9]{3}" || echo "")

    if [ -n "$task_id" ]; then
        echo "$task_id|$record_id|$title"
    fi
done | sort > /tmp/o007-parsed.txt

# Find duplicates (same task ID appears multiple times)
echo "📊 Duplicate analysis:"
echo ""
cut -d'|' -f1 /tmp/o007-parsed.txt | sort | uniq -c | sort -rn | head -20

echo ""
echo "✅ Analysis complete!"
echo ""
echo "📁 Output files:"
echo "  - /tmp/o007-page1.txt (first 100 tasks)"
echo "  - /tmp/o007-page2.txt (next 100 tasks)"
echo "  - /tmp/o007-parsed.txt (parsed task IDs)"
echo ""
echo "🔗 View in Lark: https://j13juzq4tyn.feishu.cn/base/Y05Mb7greapFiSseRpoc5XkXnrb?table=tblucYhJLq5TJ5xA&view=vew5v71Ru7"
echo ""
echo "Next steps:"
echo "1. Review duplicates above"
echo "2. Manually delete duplicates in Lark Base (keep first occurrence)"
echo "3. Run补充任务标识字段脚本"
