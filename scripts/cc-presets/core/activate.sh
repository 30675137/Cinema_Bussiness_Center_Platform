#!/usr/bin/env bash
# scripts/cc-presets/core/activate.sh
# 预设激活核心逻辑

set -euo pipefail

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 加载依赖
# shellcheck source=./utils.sh
source "$SCRIPT_DIR/utils.sh"
# shellcheck source=./config.sh
source "$SCRIPT_DIR/config.sh"

# ============================================================================
# 环境变量清理
# ============================================================================

# 清理之前激活的预设的环境变量
# 说明: 读取 _CC_ACTIVE_VARS 跟踪变量，清理之前设置的所有环境变量
_cc_cleanup_env() {
    if [[ -n "${_CC_ACTIVE_VARS:-}" ]]; then
        # 读取之前设置的变量列表（逗号分隔）
        IFS=',' read -ra vars <<< "$_CC_ACTIVE_VARS"

        for var in "${vars[@]}"; do
            unset "$var"
        done

        unset _CC_ACTIVE_VARS
        unset _CC_ACTIVE_PRESET
    fi
}

# ============================================================================
# 预设激活
# ============================================================================

# 激活指定的预设
# 参数: $1 = 预设名称
# 说明: 此函数必须在当前 shell 中执行（source 或 eval），才能修改环境变量
_cc_activate() {
    local preset_name="$1"

    # 验证预设存在
    if ! preset_exists "$preset_name"; then
        error "预设不存在: '$preset_name'
  可用预设: $(read_preset_names | tr '\n' ' ')
  使用 'cc-preset add <name>' 创建新预设"
    fi

    # 清理之前的环境变量
    _cc_cleanup_env

    # 读取预设的环境变量（JSON 格式）
    local env_vars_json
    env_vars_json=$(read_preset_env_vars "$preset_name")

    # 解析并设置环境变量
    local var_names=()

    while IFS='=' read -r key value; do
        # 去除引号
        value="${value//\"/}"

        # 导出环境变量
        export "$key=$value"

        # 记录变量名
        var_names+=("$key")
    done < <(echo "$env_vars_json" | python3 -c "
import json
import sys

data = json.load(sys.stdin)
for key, value in data.items():
    print(f'{key}={value}')
")

    # 设置跟踪变量
    export _CC_ACTIVE_PRESET="$preset_name"
    export _CC_ACTIVE_VARS="$(IFS=','; echo "${var_names[*]}")"

    # 更新配置文件中的活动预设
    set_active_preset "$preset_name"

    # 显示激活信息
    success "Activated preset '$preset_name'"

    # 显示设置的环境变量（掩码敏感值）
    for var_name in "${var_names[@]}"; do
        local value="${!var_name}"

        if is_sensitive_var "$var_name"; then
            local masked_value
            masked_value=$(mask_sensitive_value "$value")
            echo "  $var_name=$masked_value"
        else
            echo "  $var_name=$value"
        fi
    done
}

# ============================================================================
# 导出函数（供 functions.sh 使用）
# ============================================================================

# 将激活函数设置为可被调用
# 注意: 此文件通常由 functions.sh 或主命令 source，不直接执行
