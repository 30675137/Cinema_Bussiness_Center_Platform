#!/bin/bash
# Claude Code 卸载脚本 - Shell 入口
# 优先使用 Python 模块实现功能，Shell 脚本负责参数解析和调用

set -euo pipefail

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 默认参数
NO_BACKUP=false
SKIP_VERIFY=false
HELP=false

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            NO_BACKUP=true
            shift
            ;;
        --skip-verification|--skip-verify)
            SKIP_VERIFY=true
            shift
            ;;
        --help|-h)
            HELP=true
            shift
            ;;
        *)
            echo "错误: 未知参数: $1" >&2
            echo "使用 --help 查看帮助信息" >&2
            exit 1
            ;;
    esac
done

# 显示帮助信息
if [ "$HELP" = true ]; then
    cat <<EOF
用法: $0 [选项]

选项:
    --no-backup              跳过备份步骤，直接执行清理操作
    --skip-verification      跳过验证步骤
    --skip-verify            同 --skip-verification
    --help, -h               显示此帮助信息

说明:
    此脚本是 Claude Code 卸载命令的 Shell 入口，优先调用 Python 模块完成实际功能。
    
    默认行为:
    - 自动创建备份（在 ~/claude-backup-{timestamp}/ 目录）
    - 清理 ~/.zshrc 中的 ANTHROPIC_* 环境变量
    - 执行验证步骤
    
示例:
    $0                      # 默认行为：自动备份并清理
    $0 --no-backup          # 跳过备份，直接清理
    $0 --skip-verify        # 跳过验证步骤

向后兼容:
    也可以使用 Python 入口：
    python scripts/claude_manager.py uninstall [选项]
EOF
    exit 0
fi

# 检查 Python 是否可用
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 python3 命令" >&2
    exit 1
fi

# 检查 Python 模块是否存在
PYTHON_MODULE="$SCRIPT_DIR/commands/uninstall.py"
if [ ! -f "$PYTHON_MODULE" ]; then
    echo "错误: 未找到 Python 模块: $PYTHON_MODULE" >&2
    exit 1
fi

# 构建 Python 命令参数
PYTHON_ARGS=()
if [ "$NO_BACKUP" = true ]; then
    PYTHON_ARGS+=(--no-backup)
fi
if [ "$SKIP_VERIFY" = true ]; then
    PYTHON_ARGS+=(--skip-verify)
fi

# 调用 Python 模块
# 优先使用 claude_manager.py（保持向后兼容），后续可以切换到 commands/uninstall.py
cd "$REPO_ROOT"

# 构建 Python 调用命令
PYTHON_CMD="python3 $SCRIPT_DIR/claude_manager.py uninstall"

# 默认启用备份（新行为），除非明确指定 --no-backup
if [ "$NO_BACKUP" = false ]; then
    PYTHON_CMD="$PYTHON_CMD --backup"
fi

if [ "$SKIP_VERIFY" = true ]; then
    PYTHON_CMD="$PYTHON_CMD --skip-verification"
fi

exec $PYTHON_CMD

