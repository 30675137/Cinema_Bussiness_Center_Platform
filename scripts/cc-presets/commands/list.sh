#!/usr/bin/env bash
# scripts/cc-presets/commands/list.sh
# cc-preset list 子命令：列出所有预设

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

cmd_list_help() {
    cat <<'EOF'
用法: cc-preset list [options]

列出所有可用的预设配置

选项:
  --verbose     显示详细信息（包括所有环境变量）
  --json        以 JSON 格式输出
  --no-mask     显示完整的敏感值（不掩码）
  --help, -h    显示此帮助消息

示例:
  cc-preset list
  cc-preset list --verbose
  cc-preset list --json
  cc-preset list --json | jq '.presets[0].name'
EOF
}

# ============================================================================
# list 命令实现
# ============================================================================

cmd_list() {
    local verbose=false
    local json_output=false
    local no_mask=false

    # 解析参数
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --verbose)
                verbose=true
                shift
                ;;
            --json)
                json_output=true
                shift
                ;;
            --no-mask)
                no_mask=true
                shift
                ;;
            --help|-h)
                cmd_list_help
                exit 0
                ;;
            *)
                error "未知选项: $1
  使用 'cc-preset help list' 查看用法"
                ;;
        esac
    done

    init_config_if_missing

    # 获取活动预设
    local active_preset
    active_preset=$(get_active_preset)

    # 获取所有预设名称
    local preset_names
    preset_names=$(read_preset_names)

    if [[ -z "$preset_names" ]]; then
        info "没有配置任何预设
  使用 'cc-preset add <name>' 创建新预设"
        exit 0
    fi

    if [[ "$json_output" == "true" ]]; then
        # JSON 格式输出
        python3 <<EOF
import json
import sys

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    presets = data.get('presets', {})
    active = data.get('settings', {}).get('active_preset')

    output = {
        'active_preset': active,
        'presets': []
    }

    for name, preset in presets.items():
        preset_info = {
            'name': name,
            'active': (name == active),
            'env_vars': preset.get('env_vars', {}),
            'metadata': preset.get('metadata', {})
        }

        # 掩码敏感值（除非指定 --no-mask）
        if not $no_mask:
            for key in list(preset_info['env_vars'].keys()):
                if any(keyword in key for keyword in ['KEY', 'TOKEN', 'SECRET', 'PASSWORD', 'AUTH']):
                    value = preset_info['env_vars'][key]
                    if len(value) > 4:
                        preset_info['env_vars'][key] = value[:4] + '****'
                    else:
                        preset_info['env_vars'][key] = '****'

        output['presets'].append(preset_info)

    print(json.dumps(output, indent=2, ensure_ascii=False))

except Exception as e:
    sys.stderr.write(f'输出 JSON 失败: {e}\n')
    sys.exit(1)
EOF
    else
        # 人类可读格式输出
        echo "可用预设:"
        echo ""

        for preset_name in $preset_names; do
            # 显示预设名称
            if [[ "$preset_name" == "$active_preset" ]]; then
                echo "  * $preset_name (active)"
            else
                echo "    $preset_name"
            fi

            # 读取环境变量
            local env_vars_json
            env_vars_json=$(read_preset_env_vars "$preset_name")

            # 显示环境变量
            echo "$env_vars_json" | python3 -c "
import json
import sys

data = json.load(sys.stdin)
for key, value in data.items():
    print(f'{key}={value}')
" | while IFS='=' read -r key value; do
                if [[ "$no_mask" == "true" ]]; then
                    echo "      $key=$value"
                elif is_sensitive_var "$key"; then
                    local masked_value
                    masked_value=$(mask_sensitive_value "$value")
                    echo "      $key=$masked_value"
                else
                    echo "      $key=$value"
                fi
            done

            # 读取元数据
            local metadata_json
            metadata_json=$(get_json_value "$CONFIG_FILE" ".presets.$preset_name.metadata" 2>/dev/null || echo "{}")

            if [[ "$metadata_json" != "{}" ]]; then
                local created
                created=$(echo "$metadata_json" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('created', ''))")

                if [[ -n "$created" ]]; then
                    echo "      Created: $created"
                fi

                if [[ "$verbose" == "true" ]]; then
                    local description
                    description=$(echo "$metadata_json" | python3 -c "import json, sys; data=json.load(sys.stdin); print(data.get('description', ''))")

                    if [[ -n "$description" ]]; then
                        echo "      Description: $description"
                    fi
                fi
            fi

            echo ""
        done

        echo "使用 'cc-<name>' 激活预设"
    fi
}

# 如果直接执行此脚本，运行命令
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_list "$@"
fi
