#!/usr/bin/env bash
# scripts/cc-presets/commands/add.sh
# cc-preset add 子命令：创建新预设

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

cmd_add_help() {
    cat <<'EOF'
用法: cc-preset add <name> --api-key <key> --model <model> --base-url <url> [options]

创建新的环境预设配置

必需参数:
  <name>                预设名称（小写字母开头，只包含小写字母、数字、连字符）

必需选项:
  --api-key <key>       API 密钥
  --model <model>       模型名称
  --base-url <url>      API 基础 URL

可选选项:
  --env KEY=VALUE       添加自定义环境变量（可多次使用）
  --description <text>  预设描述（最多200字符）
  --force               强制覆盖已存在的预设

示例:
  # 创建 Claude 预设
  cc-preset add claude \
    --api-key sk-ant-xxxxx \
    --model claude-3-sonnet-20240229 \
    --base-url https://api.anthropic.com \
    --description "Claude API production config"

  # 创建 GLM 预设并添加自定义变量
  cc-preset add glm \
    --api-key xxxxx \
    --model GLM-4.6 \
    --base-url https://open.bigmodel.cn/api/anthropic \
    --env ANTHROPIC_SMALL_FAST_MODEL=GLM-4.6
EOF
}

# ============================================================================
# add 命令实现
# ============================================================================

cmd_add() {
    local preset_name=""
    local api_key=""
    local model=""
    local base_url=""
    local description=""
    local force=false
    declare -A custom_env_vars

    # 解析参数
    if [[ $# -eq 0 ]]; then
        cmd_add_help
        exit 1
    fi

    # 第一个参数是预设名称
    preset_name="$1"
    shift

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
                # 解析 KEY=VALUE 格式
                if [[ "$2" =~ ^([A-Z_][A-Z0-9_]*)=(.+)$ ]]; then
                    custom_env_vars["${BASH_REMATCH[1]}"]="${BASH_REMATCH[2]}"
                else
                    error "无效的环境变量格式: $2
  期望格式: KEY=VALUE
  示例: --env TIMEOUT=300"
                fi
                shift 2
                ;;
            --force)
                force=true
                shift
                ;;
            --help|-h)
                cmd_add_help
                exit 0
                ;;
            *)
                error "未知选项: $1
  使用 'cc-preset help add' 查看用法"
                ;;
        esac
    done

    # 验证必需参数
    if [[ -z "$preset_name" ]]; then
        error "缺少预设名称
  使用 'cc-preset help add' 查看用法"
    fi

    validate_preset_name "$preset_name"

    if [[ -z "$api_key" ]]; then
        error "缺少必需选项: --api-key
  使用 'cc-preset help add' 查看用法"
    fi

    if [[ -z "$model" ]]; then
        error "缺少必需选项: --model
  使用 'cc-preset help add' 查看用法"
    fi

    if [[ -z "$base_url" ]]; then
        error "缺少必需选项: --base-url
  使用 'cc-preset help add' 查看用法"
    fi

    # 检查预设是否已存在
    if preset_exists "$preset_name" && [[ "$force" != "true" ]]; then
        warn "预设 '$preset_name' 已存在"
        read -rp "是否覆盖？(y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            info "操作已取消"
            exit 0
        fi
    fi

    # 构建环境变量 JSON
    local env_vars_json="{"

    # 添加标准环境变量
    env_vars_json+="\"ANTHROPIC_API_KEY\":\"$api_key\","
    env_vars_json+="\"ANTHROPIC_MODEL\":\"$model\","
    env_vars_json+="\"ANTHROPIC_BASE_URL\":\"$base_url\""

    # 添加自定义环境变量
    for key in "${!custom_env_vars[@]}"; do
        validate_env_var_name "$key"
        env_vars_json+=",\"$key\":\"${custom_env_vars[$key]}\""
    done

    env_vars_json+="}"

    # 添加或更新预设
    add_or_update_preset "$preset_name" "$env_vars_json" "$description"
}

# 如果直接执行此脚本，运行命令
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    cmd_add "$@"
fi
