#!/usr/bin/env bash
# scripts/cc-presets/commands/delete.sh
# cc-preset delete 子命令：删除预设

set -euo pipefail

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# 加载依赖
# shellcheck source=../core/utils.sh
source "$SCRIPT_DIR/core/utils.sh"
# shellcheck source=../core/config.sh
source "$SCRIPT_DIR/core/config.sh"

# ============================================================================
# 帮助信息
# ============================================================================

cmd_delete_help() {
    cat <<'EOF'
用法: cc-preset delete <name> [options]

删除预设配置

必需参数:
  <name>          预设名称

可选选项:
  --force         跳过确认提示
  --help, -h      显示此帮助消息

示例:
  cc-preset delete old-preset
  cc-preset delete test --force
EOF
}

# ============================================================================
# delete 命令实现
# ============================================================================

cmd_delete() {
    local preset_name=""
    local force=false

    # 解析参数
    if [[ $# -eq 0 ]]; then
        cmd_delete_help
        exit 1
    fi

    # 第一个参数是预设名称
    preset_name="$1"
    shift

    # 解析选项
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --force)
                force=true
                shift
                ;;
            --help|-h)
                cmd_delete_help
                exit 0
                ;;
            *)
                error "未知选项: $1
  使用 'cc-preset help delete' 查看用法"
                ;;
        esac
    done

    # 验证预设存在
    if ! preset_exists "$preset_name"; then
        error "预设不存在: '$preset_name'
  可用预设: $(read_preset_names | tr '\n' ' ')"
    fi

    # 确认删除（除非使用 --force）
    if [[ "$force" != "true" ]]; then
        warn "这将永久删除预设 '$preset_name'"
        read -rp "删除预设 '$preset_name'? (y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            info "操作已取消"
            exit 0
        fi
    fi

    # 删除预设
    delete_preset "$preset_name"
}

# 如果直接执行此脚本，运行命令
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_delete "$@"
fi
