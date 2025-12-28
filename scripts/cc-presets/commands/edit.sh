#!/usr/bin/env bash
# scripts/cc-presets/commands/edit.sh
# cc-preset edit 子命令：编辑现有预设

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

cmd_edit_help() {
    cat <<'EOF'
用法: cc-preset edit <name> [options]

编辑现有预设配置

必需参数:
  <name>                预设名称

可选选项:
  --api-key <key>       更新 API 密钥
  --model <model>       更新模型名称
  --base-url <url>      更新 API 基础 URL
  --env KEY=VALUE       更新或添加自定义环境变量
  --unset-env KEY       删除指定的环境变量
  --description <text>  更新描述
  --help, -h            显示此帮助消息

说明:
  只更新指定的选项，未指定的保持不变

示例:
  # 更新模型版本
  cc-preset edit claude --model claude-3-opus-20240229

  # 添加额外环境变量
  cc-preset edit claude --env ANTHROPIC_TIMEOUT=300

  # 更新 API 密钥
  cc-preset edit claude --api-key sk-ant-new-key
EOF
}

# ============================================================================
# edit 命令实现
# ============================================================================

cmd_edit() {
    local preset_name=""
    local api_key=""
    local model=""
    local base_url=""
    local description=""
    declare -A custom_env_vars
    declare -a unset_vars

    # 解析参数
    if [[ $# -eq 0 ]]; then
        cmd_edit_help
        exit 1
    fi

    # 第一个参数是预设名称
    preset_name="$1"
    shift

    # 验证预设存在
    if ! preset_exists "$preset_name"; then
        error "预设不存在: '$preset_name'
  可用预设: $(read_preset_names | tr '\n' ' ')
  使用 'cc-preset add <name>' 创建新预设"
    fi

    # 解析选项
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --api-key)
                api_key="$2"
                shift 2
                ;;
            --model)
                model="$2"
                shift 2
                ;;
            --base-url)
                base_url="$2"
                shift 2
                ;;
            --description)
                description="$2"
                shift 2
                ;;
            --env)
                if [[ "$2" =~ ^([A-Z_][A-Z0-9_]*)=(.+)$ ]]; then
                    custom_env_vars["${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
                else
                    error "无效的环境变量格式: $2"
                fi
                shift 2
                ;;
            --unset-env)
                unset_vars+=("$2")
                shift 2
                ;;
            --help|-h)
                cmd_edit_help
                exit 0
                ;;
            *)
                error "未知选项: $1"
                ;;
        esac
    done

    # 使用 Python 更新配置
    python3 <<EOF
import json
import sys
from datetime import datetime

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    preset = data['presets']['$preset_name']
    modified = []

    # 更新 API 密钥
    if '$api_key':
        preset['env_vars']['ANTHROPIC_API_KEY'] = '$api_key'
        modified.append('ANTHROPIC_API_KEY')

    # 更新模型
    if '$model':
        preset['env_vars']['ANTHROPIC_MODEL'] = '$model'
        modified.append('ANTHROPIC_MODEL')

    # 更新 base URL
    if '$base_url':
        preset['env_vars']['ANTHROPIC_BASE_URL'] = '$base_url'
        modified.append('ANTHROPIC_BASE_URL')

    # 更新自定义环境变量
$(for key in "${!custom_env_vars[@]}"; do
    echo "    preset['env_vars']['$key'] = '${custom_env_vars[$key]}'"
    echo "    modified.append('$key')"
done)

    # 删除环境变量
$(for var in "${unset_vars[@]:-}"; do
    echo "    if '$var' in preset['env_vars']:"
    echo "        del preset['env_vars']['$var']"
    echo "        modified.append('$var (deleted)')"
done)

    # 更新描述
    if '$description':
        if 'metadata' not in preset:
            preset['metadata'] = {}
        preset['metadata']['description'] = '$description'
        modified.append('description')

    # 更新修改时间
    if 'metadata' not in preset:
        preset['metadata'] = {}
    preset['metadata']['modified'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    # 写入临时文件
    temp_file = '${CONFIG_FILE}.tmp.$$'
    with open(temp_file, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(temp_file)
    print('MODIFIED:' + ','.join(modified))

except Exception as e:
    sys.stderr.write(f'编辑预设失败: {e}\n')
    sys.exit(1)
EOF

    local output
    output=$(python3 <<EOF
import json
import sys
from datetime import datetime

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    preset = data['presets']['$preset_name']
    modified = []

    # 更新 API 密钥
    if '$api_key':
        preset['env_vars']['ANTHROPIC_API_KEY'] = '$api_key'
        modified.append('ANTHROPIC_API_KEY')

    # 更新模型
    if '$model':
        preset['env_vars']['ANTHROPIC_MODEL'] = '$model'
        modified.append('ANTHROPIC_MODEL')

    # 更新 base URL
    if '$base_url':
        preset['env_vars']['ANTHROPIC_BASE_URL'] = '$base_url'
        modified.append('ANTHROPIC_BASE_URL')

    # 更新修改时间
    if 'metadata' not in preset:
        preset['metadata'] = {}
    preset['metadata']['modified'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')

    # 写入临时文件
    temp_file = '${CONFIG_FILE}.tmp.$$'
    with open(temp_file, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(temp_file)
    if modified:
        print('MODIFIED:' + ','.join(modified))

except Exception as e:
    sys.stderr.write(f'编辑预设失败: {e}\n')
    sys.exit(1)
EOF
)

    local temp_file
    temp_file=$(echo "$output" | head -n1)
    local modified_fields
    modified_fields=$(echo "$output" | grep "^MODIFIED:" | cut -d: -f2)

    write_config_atomic "$temp_file"

    success "预设 '$preset_name' 已更新"
    if [[ -n "$modified_fields" ]]; then
        echo "  Modified: $modified_fields"
    fi
}

# 如果直接执行此脚本，运行命令
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_edit "$@"
fi
