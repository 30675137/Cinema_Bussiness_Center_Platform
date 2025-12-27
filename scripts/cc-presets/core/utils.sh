#!/usr/bin/env bash
# scripts/cc-presets/core/utils.sh
# 通用工具函数：JSON 解析、验证、错误处理等

set -euo pipefail

# 颜色定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# ============================================================================
# 错误处理辅助函数
# ============================================================================

# 显示错误消息并退出
# 参数: $1 = 错误消息
# 退出码: 2 (系统错误)
error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 2
}

# 显示警告消息
# 参数: $1 = 警告消息
warn() {
    echo -e "${YELLOW}WARNING: $1${NC}" >&2
}

# 显示信息消息
# 参数: $1 = 信息消息
info() {
    echo -e "${BLUE}INFO: $1${NC}"
}

# 显示成功消息
# 参数: $1 = 成功消息
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# ============================================================================
# JSON 解析工具函数
# ============================================================================

# 从 JSON 文件中获取值
# 参数: $1 = JSON 文件路径, $2 = JSON 路径 (例如: .presets.claude.env_vars.ANTHROPIC_API_KEY)
# 输出: JSON 值（字符串）
# 退出码: 0 成功, 1 失败
get_json_value() {
    local file="$1"
    local path="$2"

    if [[ ! -f "$file" ]]; then
        error "配置文件不存在: $file"
    fi

    python3 -c "
import json
import sys

try:
    with open('$file', 'r') as f:
        data = json.load(f)

    # 解析路径 (例如: .presets.claude)
    path = '$path'.lstrip('.')
    keys = path.split('.')

    result = data
    for key in keys:
        if isinstance(result, dict):
            result = result.get(key)
        else:
            sys.exit(1)

    if result is None:
        sys.exit(1)

    # 输出结果
    if isinstance(result, (dict, list)):
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(result)

except (json.JSONDecodeError, KeyError, FileNotFoundError) as e:
    sys.stderr.write(f'JSON 解析错误: {e}\n')
    sys.exit(1)
" 2>/dev/null
}

# 设置 JSON 文件中的值
# 参数: $1 = JSON 文件路径, $2 = JSON 路径, $3 = 新值
# 退出码: 0 成功, 1 失败
set_json_value() {
    local file="$1"
    local path="$2"
    local value="$3"

    if [[ ! -f "$file" ]]; then
        error "配置文件不存在: $file"
    fi

    python3 -c "
import json
import sys

try:
    with open('$file', 'r') as f:
        data = json.load(f)

    # 解析路径
    path = '$path'.lstrip('.')
    keys = path.split('.')

    # 导航到目标位置
    current = data
    for key in keys[:-1]:
        if key not in current:
            current[key] = {}
        current = current[key]

    # 设置值（尝试解析为 JSON，否则作为字符串）
    try:
        current[keys[-1]] = json.loads('$value')
    except json.JSONDecodeError:
        current[keys[-1]] = '$value'

    # 写回文件
    with open('$file', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

except Exception as e:
    sys.stderr.write(f'设置 JSON 值失败: {e}\n')
    sys.exit(1)
"
}

# 验证 JSON 文件格式
# 参数: $1 = JSON 文件路径
# 退出码: 0 有效, 1 无效
validate_json() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    python3 -c "
import json
import sys

try:
    with open('$file', 'r') as f:
        json.load(f)
    sys.exit(0)
except json.JSONDecodeError as e:
    sys.stderr.write(f'JSON 格式错误: {e}\n')
    sys.exit(1)
" 2>/dev/null
}

# ============================================================================
# 验证函数
# ============================================================================

# 验证预设名称格式
# 参数: $1 = 预设名称
# 返回: 0 有效, 1 无效
validate_preset_name() {
    local name="$1"

    # 必须以小写字母开头，只包含小写字母、数字、连字符
    if [[ ! "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
        error "无效的预设名称: '$name'
  预设名称必须:
  - 以小写字母开头
  - 只包含小写字母、数字和连字符
  示例: claude, glm, my-preset-1"
    fi
}

# 验证环境变量名格式
# 参数: $1 = 环境变量名
# 返回: 0 有效, 1 无效
validate_env_var_name() {
    local var_name="$1"

    # 必须以大写字母或下划线开头，只包含大写字母、数字、下划线
    if [[ ! "$var_name" =~ ^[A-Z_][A-Z0-9_]*$ ]]; then
        error "无效的环境变量名: '$var_name'
  环境变量名必须:
  - 以大写字母或下划线开头
  - 只包含大写字母、数字和下划线
  示例: API_KEY, ANTHROPIC_MODEL, BASE_URL"
    fi
}

# ============================================================================
# 文件权限管理
# ============================================================================

# 确保文件权限为 600（仅用户可读写）
# 参数: $1 = 文件路径
ensure_file_permissions() {
    local file="$1"

    if [[ -f "$file" ]]; then
        chmod 600 "$file" || error "无法设置文件权限: $file"
    fi
}

# 检查配置文件安全性
# 参数: $1 = 文件路径
# 返回: 0 安全, 1 不安全
check_config_security() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        return 0
    fi

    # 获取文件权限（八进制格式）
    local perms
    perms=$(stat -f "%OLp" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)

    # 检查权限是否为 600 或更严格
    if [[ "$perms" != "600" ]] && [[ "$perms" != "400" ]]; then
        warn "配置文件权限过于开放: $file (当前: $perms)
  自动修复为 600（仅用户可读写）"
        chmod 600 "$file"
    fi
}

# ============================================================================
# 敏感值掩码
# ============================================================================

# 判断是否为敏感环境变量
# 参数: $1 = 变量名
# 返回: 0 是敏感变量, 1 不是
is_sensitive_var() {
    local var_name="$1"

    # 包含关键词的变量视为敏感
    if [[ "$var_name" =~ (KEY|TOKEN|SECRET|PASSWORD|AUTH) ]]; then
        return 0
    fi

    return 1
}

# 掩码敏感值（显示前4个字符 + ****）
# 参数: $1 = 原始值
# 输出: 掩码后的值
mask_sensitive_value() {
    local value="$1"

    if [[ ${#value} -le 4 ]]; then
        echo "****"
    else
        echo "${value:0:4}****"
    fi
}

# ============================================================================
# 时间戳生成
# ============================================================================

# 生成 ISO 8601 格式时间戳（UTC）
# 输出: 时间戳字符串
generate_timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}
