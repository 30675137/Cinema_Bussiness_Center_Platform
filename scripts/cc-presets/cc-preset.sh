#!/usr/bin/env bash
# scripts/cc-presets/cc-preset.sh
# 主命令入口：cc-preset 子命令路由和帮助消息

set -euo pipefail

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 加载核心功能
# shellcheck source=./core/utils.sh
source "$SCRIPT_DIR/core/utils.sh"
# shellcheck source=./core/config.sh
source "$SCRIPT_DIR/core/config.sh"

# 版本号
readonly VERSION="1.0.0"

# ============================================================================
# 帮助信息
# ============================================================================

show_help() {
    cat <<'EOF'
cc-preset - macOS 环境预设管理工具

用法:
  cc-preset <subcommand> [options]

子命令:
  add       创建新预设
  edit      编辑现有预设
  delete    删除预设
  list      列出所有预设
  status    显示当前活动预设
  help      显示此帮助消息

激活预设:
  cc-<name>  激活名为 <name> 的预设

示例:
  # 创建 Claude 预设
  cc-preset add claude \
    --api-key sk-ant-xxxxx \
    --model claude-3-sonnet-20240229 \
    --base-url https://api.anthropic.com

  # 激活 Claude 预设
  cc-claude

  # 查看所有预设
  cc-preset list

  # 查看当前状态
  cc-preset status

更多帮助: cc-preset help <subcommand>
EOF
}

# ============================================================================
# 子命令路由
# ============================================================================

main() {
    # 如果没有参数，显示帮助
    if [[ $# -eq 0 ]]; then
        show_help
        exit 0
    fi

    local subcommand="$1"
    shift

    case "$subcommand" in
        add)
            # shellcheck source=./commands/add.sh
            source "$SCRIPT_DIR/commands/add.sh"
            cmd_add "$@"
            ;;
        edit)
            # shellcheck source=./commands/edit.sh
            source "$SCRIPT_DIR/commands/edit.sh"
            cmd_edit "$@"
            ;;
        delete)
            # shellcheck source=./commands/delete.sh
            source "$SCRIPT_DIR/commands/delete.sh"
            cmd_delete "$@"
            ;;
        list)
            # shellcheck source=./commands/list.sh
            source "$SCRIPT_DIR/commands/list.sh"
            cmd_list "$@"
            ;;
        status)
            # shellcheck source=./commands/status.sh
            source "$SCRIPT_DIR/commands/status.sh"
            cmd_status "$@"
            ;;
        help|--help|-h)
            if [[ $# -eq 0 ]]; then
                show_help
            else
                # 显示特定子命令的帮助
                local help_cmd="$1"
                case "$help_cmd" in
                    add|edit|delete|list|status)
                        # shellcheck source=./commands/add.sh
                        source "$SCRIPT_DIR/commands/$help_cmd.sh"
                        "cmd_${help_cmd}_help"
                        ;;
                    *)
                        error "未知子命令: $help_cmd
  使用 'cc-preset help' 查看可用命令"
                        ;;
                esac
            fi
            ;;
        --version|-v)
            echo "cc-preset version $VERSION"
            ;;
        *)
            error "未知子命令: $subcommand
  使用 'cc-preset help' 查看可用命令"
            ;;
    esac
}

# 执行主函数
main "$@"
