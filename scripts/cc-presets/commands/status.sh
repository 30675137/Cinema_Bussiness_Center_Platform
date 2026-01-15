#!/usr/bin/env bash
# scripts/cc-presets/commands/status.sh
# cc-preset status 子命令：显示当前活动预设和环境变量

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

cmd_status_help() {
    cat <<'EOF'
用法: cc-preset status [options]

显示当前活动的预设和环境变量状态

选项:
  --verbose     显示所有环境变量的当前值
  --no-mask     显示完整的敏感值（不掩码）
  --help, -h    显示此帮助消息

示例:
  cc-preset status
  cc-preset status --verbose
  cc-preset status --no-mask
EOF
}

# ============================================================================
# status 命令实现
# ============================================================================

cmd_status() {
    local verbose=false
    local no_mask=false

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --verbose)
                verbose=true
                shift
                ;;
            --no-mask)
                no_mask=true
                shift
                ;;
            --help|-h)
                cmd_status_help
                exit 0
                ;;
            *)
                error "未知选项: $1
  使用 'cc-preset help status' 查看用法"
                ;;
        esac
    done

    # 检查是否有活动预设（从环境变量）
    local active_preset="${_CC_ACTIVE_PRESET:-}"

    # 如果环境变量没有，尝试从配置文件读取
    if [[ -z "$active_preset" ]]; then
        active_preset=$(get_active_preset)
    fi

    if [[ -z "$active_preset" ]]; then
        info "当前没有激活的预设
  使用 'cc-<name>' 激活一个预设
  使用 'cc-preset list' 查看可用预设"
        exit 0
    fi

    # 显示当前预设
    echo "当前预设: $active_preset"
    echo "激活来源: ${_CC_ACTIVE_VARS:+当前 shell 会话}"
    echo ""

    # 显示环境变量
    echo "环境变量:"

    if [[ -n "${_CC_ACTIVE_VARS:-}" ]]; then
        # 从当前 shell 环境读取
        IFS=',' read -ra vars <<< "$_CC_ACTIVE_VARS"

        for var_name in "${vars[@]}"; do
            local value="${!var_name:-}"

            if [[ "$no_mask" == "true" ]]; then
                echo "  $var_name=$value"
            elif is_sensitive_var "$var_name"; then
                local masked_value
                masked_value=$(mask_sensitive_value "$value")
                echo "  $var_name=$masked_value"
            else
                echo "  $var_name=$value"
            fi
        done
    else
        # 从配置文件读取
        local env_vars_json
        env_vars_json=$(read_preset_env_vars "$active_preset")

        echo "$env_vars_json" | python3 -c "
import json
import sys

data = json.load(sys.stdin)
for key, value in data.items():
    print(f'{key}={value}')
" | while IFS='=' read -r key value; do
            if [[ "$no_mask" == "true" ]]; then
                echo "  $key=$value"
            elif is_sensitive_var "$key"; then
                local masked_value
                masked_value=$(mask_sensitive_value "$value")
                echo "  $key=$masked_value"
            else
                echo "  $key=$value"
            fi
        done
    fi
}

# 如果直接执行此脚本，运行命令
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_status "$@"
fi
