#!/bin/bash

# 分支切换脚本 - Ant Design 6 现代化改造
# 用法: ./scripts/branch-switch.sh [start|rollback]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Ant Design 6 现代化改造 - 分支管理脚本"
echo "项目根目录: $PROJECT_ROOT"
echo "当前分支: $(git branch --show-current)"
echo ""

case "$1" in
  "start")
    echo "📝 开始现代化改造任务..."
    echo "✅ 已创建备份stash"
    echo "✅ 已切换到 002-upgrade-ant6 分支"
    echo ""
    echo "📋 下一步:"
    echo "1. 执行 Phase 1: Setup 任务"
    echo "2. 执行 Phase 2: Foundational 任务"
    echo "3. 开始 User Story 1: TypeScript 严格模式"
    ;;

  "rollback")
    echo "🔄 回滚到开始状态..."
    echo "正在切换回 001-menu-navigation 分支..."
    git checkout 001-menu-navigation

    echo "正在恢复工作目录..."
    if git stash list | grep -q "WIP before Ant Design 6 modernization"; then
      git stash pop
    fi

    echo "✅ 已回滚到之前的状态"
    ;;

  "status")
    echo "📊 当前状态:"
    echo "分支: $(git branch --show-current)"
    echo "Stash 列表:"
    git stash list
    echo ""
    echo "📝 最近的提交:"
    git log --oneline -5
    ;;

  *)
    echo "用法: $0 [start|rollback|status]"
    echo ""
    echo "命令说明:"
    echo "  start   - 开始现代化改造 (已切换到 002-upgrade-ant6 分支)"
    echo "  rollback - 回滚到之前状态 (回到 001-menu-navigation 分支)"
    echo "  status  - 显示当前状态"
    exit 1
    ;;
esac

echo ""
echo "✅ 脚本执行完成"