#!/usr/bin/env bash
# scripts/cc-presets/core/config.sh
# 配置文件读写核心函数

set -euo pipefail

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 加载工具函数
# shellcheck source=./utils.sh
source "$SCRIPT_DIR/utils.sh"

# 配置文件路径
readonly CONFIG_DIR="$HOME/.config/cc-presets"
readonly CONFIG_FILE="$CONFIG_DIR/config.json"

# ============================================================================
# 配置文件初始化
# ============================================================================

# 如果配置文件不存在，初始化最小配置
init_config_if_missing() {
    # 创建配置目录
    if [[ ! -d "$CONFIG_DIR" ]]; then
        mkdir -p "$CONFIG_DIR" || error "无法创建配置目录: $CONFIG_DIR"
        chmod 700 "$CONFIG_DIR"
    fi

    # 创建最小配置文件
    if [[ ! -f "$CONFIG_FILE" ]]; then
        info "初始化配置文件: $CONFIG_FILE"

        cat > "$CONFIG_FILE" <<'EOF'
{
  "version": "1.0",
  "presets": {},
  "settings": {
    "active_preset": null,
    "mask_sensitive": true
  }
}
EOF

        chmod 600 "$CONFIG_FILE"
        success "配置文件已创建: $CONFIG_FILE"
    fi

    # 检查文件权限
    check_config_security "$CONFIG_FILE"
}

# ============================================================================
# 配置文件读取
# ============================================================================

# 读取整个配置文件
# 输出: JSON 字符串
read_config() {
    init_config_if_missing

    if ! validate_json "$CONFIG_FILE"; then
        error "配置文件格式无效: $CONFIG_FILE
  建议: 从备份恢复或删除后重新创建"
    fi

    cat "$CONFIG_FILE"
}

# 读取所有预设名称
# 输出: 预设名称列表（每行一个）
read_preset_names() {
    init_config_if_missing

    python3 -c "
import json
import sys

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    presets = data.get('presets', {})
    for name in presets.keys():
        print(name)

except Exception as e:
    sys.stderr.write(f'读取预设名称失败: {e}\n')
    sys.exit(1)
"
}

# 检查预设是否存在
# 参数: $1 = 预设名称
# 返回: 0 存在, 1 不存在
preset_exists() {
    local preset_name="$1"

    init_config_if_missing

    python3 -c "
import json
import sys

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    if '$preset_name' in data.get('presets', {}):
        sys.exit(0)
    else:
        sys.exit(1)

except Exception:
    sys.exit(1)
"
}

# 读取预设的环境变量
# 参数: $1 = 预设名称
# 输出: JSON 对象（环境变量键值对）
read_preset_env_vars() {
    local preset_name="$1"

    if ! preset_exists "$preset_name"; then
        error "预设不存在: '$preset_name'
  可用预设: $(read_preset_names | tr '\n' ' ')
  使用 'cc-preset add <name>' 创建新预设"
    fi

    get_json_value "$CONFIG_FILE" ".presets.$preset_name.env_vars"
}

# 获取当前活动的预设名称
# 输出: 预设名称，如果无活动预设则输出空
get_active_preset() {
    init_config_if_missing

    local active
    active=$(get_json_value "$CONFIG_FILE" ".settings.active_preset" 2>/dev/null || echo "null")

    if [[ "$active" == "null" ]] || [[ -z "$active" ]]; then
        echo ""
    else
        echo "$active"
    fi
}

# ============================================================================
# 配置文件写入（原子操作）
# ============================================================================

# 原子写入配置文件
# 参数: $1 = JSON 内容（字符串或文件路径）
# 说明: 使用临时文件和 mv 确保原子性，避免写入过程中文件损坏
write_config_atomic() {
    local content="$1"

    init_config_if_missing

    # 创建临时文件
    local temp_file="${CONFIG_FILE}.tmp.$$"

    # 写入临时文件
    if [[ -f "$content" ]]; then
        cp "$content" "$temp_file" || error "无法复制到临时文件: $temp_file"
    else
        echo "$content" > "$temp_file" || error "无法写入临时文件: $temp_file"
    fi

    # 验证 JSON 格式
    if ! validate_json "$temp_file"; then
        rm -f "$temp_file"
        error "写入的配置文件格式无效"
    fi

    # 设置权限
    chmod 600 "$temp_file"

    # 原子替换
    mv "$temp_file" "$CONFIG_FILE" || error "无法更新配置文件: $CONFIG_FILE"

    # 再次确保权限正确
    chmod 600 "$CONFIG_FILE"
}

# ============================================================================
# 预设管理（增删改）
# ============================================================================

# 添加或更新预设
# 参数: $1 = 预设名称, $2 = 环境变量 JSON 对象, $3 = 描述（可选）
add_or_update_preset() {
    local preset_name="$1"
    local env_vars_json="$2"
    local description="${3:-}"

    validate_preset_name "$preset_name"
    init_config_if_missing

    local timestamp
    timestamp=$(generate_timestamp)

    # 检查是否已存在
    local is_update=false
    if preset_exists "$preset_name"; then
        is_update=true
    fi

    # 使用 Python 更新配置
    python3 <<EOF
import json
import sys

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    # 准备预设数据
    preset_data = {
        'env_vars': json.loads('$env_vars_json'),
        'metadata': {}
    }

    # 设置元数据
    if '$preset_name' in data.get('presets', {}):
        # 更新现有预设 - 保留创建时间
        old_created = data['presets']['$preset_name'].get('metadata', {}).get('created', '$timestamp')
        preset_data['metadata']['created'] = old_created
    else:
        # 新预设
        preset_data['metadata']['created'] = '$timestamp'

    preset_data['metadata']['modified'] = '$timestamp'

    if '$description':
        preset_data['metadata']['description'] = '$description'

    # 更新配置
    if 'presets' not in data:
        data['presets'] = {}

    data['presets']['$preset_name'] = preset_data

    # 写入临时文件
    temp_file = '${CONFIG_FILE}.tmp.$$'
    with open(temp_file, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(temp_file)

except Exception as e:
    sys.stderr.write(f'添加预设失败: {e}\n')
    sys.exit(1)
EOF

    local temp_file="${CONFIG_FILE}.tmp.$$"
    write_config_atomic "$temp_file"

    if [[ "$is_update" == "true" ]]; then
        success "预设 '$preset_name' 已更新"
    else
        success "预设 '$preset_name' 已创建
  激活命令: cc-$preset_name"
    fi
}

# 删除预设
# 参数: $1 = 预设名称
delete_preset() {
    local preset_name="$1"

    if ! preset_exists "$preset_name"; then
        error "预设不存在: '$preset_name'"
    fi

    # 使用 Python 删除预设
    python3 <<EOF
import json
import sys

try:
    with open('$CONFIG_FILE', 'r') as f:
        data = json.load(f)

    # 删除预设
    if '$preset_name' in data.get('presets', {}):
        del data['presets']['$preset_name']

    # 如果是活动预设，清除活动状态
    if data.get('settings', {}).get('active_preset') == '$preset_name':
        data['settings']['active_preset'] = None

    # 写入临时文件
    temp_file = '${CONFIG_FILE}.tmp.$$'
    with open(temp_file, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(temp_file)

except Exception as e:
    sys.stderr.write(f'删除预设失败: {e}\n')
    sys.exit(1)
EOF

    local temp_file="${CONFIG_FILE}.tmp.$$"
    write_config_atomic "$temp_file"

    success "预设 '$preset_name' 已删除"
}

# 设置活动预设
# 参数: $1 = 预设名称
set_active_preset() {
    local preset_name="$1"

    if ! preset_exists "$preset_name"; then
        error "预设不存在: '$preset_name'"
    fi

    set_json_value "$CONFIG_FILE" ".settings.active_preset" "\"$preset_name\""
}

# 清除活动预设
clear_active_preset() {
    set_json_value "$CONFIG_FILE" ".settings.active_preset" "null"
}
