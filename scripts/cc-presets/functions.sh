#!/usr/bin/env bash
# scripts/cc-presets/functions.sh
# Shell 函数库：动态生成 cc-<name> 激活函数

# 加载核心功能
CC_PRESETS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=./core/utils.sh
source "$CC_PRESETS_DIR/core/utils.sh"
# shellcheck source=./core/config.sh
source "$CC_PRESETS_DIR/core/config.sh"
# shellcheck source=./core/activate.sh
source "$CC_PRESETS_DIR/core/activate.sh"

# ============================================================================
# 动态生成激活函数
# ============================================================================

# 为每个预设生成 cc-<name> 函数
# 说明: 读取配置文件中的所有预设，为每个预设创建对应的 shell 函数
_cc_generate_functions() {
    # 确保配置文件存在
    init_config_if_missing

    # 读取所有预设名称
    local preset_names
    preset_names=$(read_preset_names 2>/dev/null || echo "")

    # 为每个预设生成函数
    for preset_name in $preset_names; do
        # 动态创建函数 cc-<preset_name>
        eval "
cc-$preset_name() {
    _cc_activate '$preset_name'
}
"
    done
}

# 初始化：生成所有激活函数
_cc_generate_functions

# ============================================================================
# 导出 cc-preset 命令
# ============================================================================

# cc-preset 主命令别名
cc-preset() {
    "$CC_PRESETS_DIR/cc-preset.sh" "$@"

    # 命令执行后重新生成函数（以防添加了新预设）
    if [[ "$1" == "add" ]] || [[ "$1" == "delete" ]]; then
        _cc_generate_functions
    fi
}
