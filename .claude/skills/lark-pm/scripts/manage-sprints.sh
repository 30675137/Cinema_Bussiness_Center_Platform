#!/bin/bash
# @spec O006-miniapp-channel-order
# Sprint 管理脚本 - 快捷命令集合

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

echo ""
echo "🏃 Sprint 管理工具 - O006 小程序渠道商品订单适配"
echo ""

# 显示帮助信息
show_help() {
    echo "使用方法: ./scripts/manage-sprints.sh <command> [sprint-number]"
    echo ""
    echo "命令:"
    echo "  import              批量导入所有任务到飞书"
    echo "  list <sprint>       查看指定 Sprint 的任务列表"
    echo "  stats               查看所有 Sprint 的统计信息"
    echo "  progress <sprint>   查看指定 Sprint 的进度"
    echo "  start <sprint>      启动指定 Sprint (标记所有任务为进行中)"
    echo "  complete <sprint>   完成指定 Sprint (标记所有任务为已完成)"
    echo "  export <sprint>     导出指定 Sprint 的任务到 Excel"
    echo ""
    echo "示例:"
    echo "  ./scripts/manage-sprints.sh import"
    echo "  ./scripts/manage-sprints.sh list 1"
    echo "  ./scripts/manage-sprints.sh stats"
    echo "  ./scripts/manage-sprints.sh progress 2"
    echo ""
}

# 导入所有任务
import_tasks() {
    echo "📥 开始批量导入任务..."
    npx tsx scripts/import-o006-tasks.ts
}

# 查看指定 Sprint 的任务列表
list_sprint() {
    local sprint_num=$1
    if [ -z "$sprint_num" ]; then
        echo "❌ 请指定 Sprint 编号 (1-7)"
        exit 1
    fi

    echo "📋 Sprint $sprint_num 任务列表:"
    echo ""
    npx tsx src/index.ts task list --tags "Sprint-$sprint_num"
}

# 查看所有 Sprint 统计
show_stats() {
    echo "📊 Sprint 统计信息:"
    echo ""

    for i in {1..7}; do
        echo "Sprint $i:"
        npx tsx src/index.ts task list --tags "Sprint-$i" | grep -E "总计|已完成|进行中|待办" || echo "  暂无任务"
        echo ""
    done
}

# 查看指定 Sprint 进度
show_progress() {
    local sprint_num=$1
    if [ -z "$sprint_num" ]; then
        echo "❌ 请指定 Sprint 编号 (1-7)"
        exit 1
    fi

    echo "📈 Sprint $sprint_num 进度:"
    echo ""

    # 统计各状态任务数
    local total=$(npx tsx src/index.ts task list --tags "Sprint-$sprint_num" --format json | jq '. | length')
    local completed=$(npx tsx src/index.ts task list --tags "Sprint-$sprint_num" --status "✅ 已完成" --format json | jq '. | length')
    local inProgress=$(npx tsx src/index.ts task list --tags "Sprint-$sprint_num" --status "🚀 进行中" --format json | jq '. | length')
    local todo=$(npx tsx src/index.ts task list --tags "Sprint-$sprint_num" --status "📝 待办" --format json | jq '. | length')

    echo "  总任务数: $total"
    echo "  已完成: $completed"
    echo "  进行中: $inProgress"
    echo "  待办: $todo"
    echo ""

    if [ "$total" -gt 0 ]; then
        local percent=$((completed * 100 / total))
        echo "  完成率: $percent%"
    fi
}

# 启动 Sprint (标记任务为进行中)
start_sprint() {
    local sprint_num=$1
    if [ -z "$sprint_num" ]; then
        echo "❌ 请指定 Sprint 编号 (1-7)"
        exit 1
    fi

    echo "🚀 启动 Sprint $sprint_num (将所有待办任务标记为进行中)..."
    echo ""

    # 获取所有待办任务的 ID
    local task_ids=$(npx tsx src/index.ts task list --tags "Sprint-$sprint_num" --status "📝 待办" --format json | jq -r '.[].id')

    if [ -z "$task_ids" ]; then
        echo "✅ Sprint $sprint_num 没有待办任务"
        return
    fi

    # 更新每个任务状态
    for task_id in $task_ids; do
        echo "  更新任务: $task_id"
        npx tsx src/index.ts task update --task-id "$task_id" --status "🚀 进行中"
    done

    echo ""
    echo "✅ Sprint $sprint_num 已启动"
}

# 完成 Sprint (标记任务为已完成)
complete_sprint() {
    local sprint_num=$1
    if [ -z "$sprint_num" ]; then
        echo "❌ 请指定 Sprint 编号 (1-7)"
        exit 1
    fi

    echo "✅ 完成 Sprint $sprint_num (将所有任务标记为已完成)..."
    echo ""

    # 获取所有未完成任务的 ID
    local task_ids=$(npx tsx src/index.ts task list --tags "Sprint-$sprint_num" --format json | jq -r '.[] | select(.status != "✅ 已完成") | .id')

    if [ -z "$task_ids" ]; then
        echo "✅ Sprint $sprint_num 所有任务已完成"
        return
    fi

    # 更新每个任务状态
    for task_id in $task_ids; do
        echo "  完成任务: $task_id"
        npx tsx src/index.ts task update --task-id "$task_id" --status "✅ 已完成" --progress 100
    done

    echo ""
    echo "✅ Sprint $sprint_num 已完成"
}

# 导出 Sprint 任务
export_sprint() {
    local sprint_num=$1
    if [ -z "$sprint_num" ]; then
        echo "❌ 请指定 Sprint 编号 (1-7)"
        exit 1
    fi

    local output_file="sprint-$sprint_num-tasks.xlsx"

    echo "📤 导出 Sprint $sprint_num 任务到 $output_file..."
    echo ""

    npx tsx src/index.ts task export \
        --format excel \
        --output "$output_file" \
        --tags "Sprint-$sprint_num"

    echo ""
    echo "✅ 已导出到: $output_file"
}

# 主逻辑
case "$1" in
    import)
        import_tasks
        ;;
    list)
        list_sprint "$2"
        ;;
    stats)
        show_stats
        ;;
    progress)
        show_progress "$2"
        ;;
    start)
        start_sprint "$2"
        ;;
    complete)
        complete_sprint "$2"
        ;;
    export)
        export_sprint "$2"
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo "❌ 未知命令: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
