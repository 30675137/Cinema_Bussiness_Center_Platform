#!/usr/bin/env bash
# scripts/cc-presets/install.sh
# 安装脚本：修改 ~/.zshrc 或 ~/.bash_profile

set -euo pipefail

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 颜色定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# ============================================================================
# 辅助函数
# ============================================================================

info() {
    echo -e "${BLUE}INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warn() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

error() {
    echo -e "${RED}ERROR: $1${NC}" >&2
    exit 1
}

# ============================================================================
# 安装逻辑
# ============================================================================

install_cc_presets() {
    echo "================================"
    echo "CC-Presets 安装程序"
    echo "================================"
    echo ""

    # 检测 shell 类型
    local shell_name
    shell_name=$(basename "$SHELL")

    local rc_file=""

    case "$shell_name" in
        zsh)
            rc_file="$HOME/.zshrc"
            ;;
        bash)
            if [[ -f "$HOME/.bash_profile" ]]; then
                rc_file="$HOME/.bash_profile"
            elif [[ -f "$HOME/.bashrc" ]]; then
                rc_file="$HOME/.bashrc"
            else
                rc_file="$HOME/.bash_profile"
            fi
            ;;
        *)
            error "不支持的 shell: $shell_name
  仅支持 bash 和 zsh"
            ;;
    esac

    info "检测到 shell: $shell_name"
    info "配置文件: $rc_file"
    echo ""

    # 检查是否已安装
    local load_line="source \"$SCRIPT_DIR/functions.sh\""

    if [[ -f "$rc_file" ]] && grep -Fq "$load_line" "$rc_file"; then
        warn "CC-Presets 已经安装在 $rc_file"
        read -rp "是否重新安装？(y/N): " confirm
        if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
            info "安装已取消"
            exit 0
        fi

        # 移除旧的安装
        info "移除旧的安装..."
        local temp_file="${rc_file}.tmp.$$"
        grep -Fv "# CC-Presets" "$rc_file" | grep -Fv "$load_line" > "$temp_file" || true
        mv "$temp_file" "$rc_file"
    fi

    # 添加加载语句到配置文件
    info "正在更新 $rc_file..."

    cat >> "$rc_file" <<EOF

# CC-Presets - 环境预设管理工具
# 自动生成，请勿手动编辑此部分
source "$SCRIPT_DIR/functions.sh"
EOF

    success "已添加加载语句到 $rc_file"

    # 设置脚本可执行权限
    chmod +x "$SCRIPT_DIR/cc-preset.sh"
    chmod +x "$SCRIPT_DIR/core"/*.sh
    chmod +x "$SCRIPT_DIR/commands"/*.sh

    success "已设置脚本可执行权限"

    # 创建配置目录（如果不存在）
    local config_dir="$HOME/.config/cc-presets"
    if [[ ! -d "$config_dir" ]]; then
        mkdir -p "$config_dir"
        chmod 700 "$config_dir"
        success "已创建配置目录: $config_dir"
    fi

    # 初始化配置文件（如果不存在）
    local config_file="$config_dir/config.json"
    if [[ ! -f "$config_file" ]]; then
        cat > "$config_file" <<'CONFIG_EOF'
{
  "version": "1.0",
  "presets": {},
  "settings": {
    "active_preset": null,
    "mask_sensitive": true
  }
}
CONFIG_EOF
        chmod 600 "$config_file"
        success "已创建配置文件: $config_file"
    fi

    echo ""
    echo "================================"
    success "CC-Presets 安装成功！"
    echo "================================"
    echo ""
    echo "下一步操作："
    echo ""
    echo "1. 重新加载 shell 配置:"
    echo "   source $rc_file"
    echo ""
    echo "2. 创建您的第一个预设:"
    echo "   cc-preset add claude \\"
    echo "     --api-key sk-ant-xxxxx \\"
    echo "     --model claude-3-sonnet-20240229 \\"
    echo "     --base-url https://api.anthropic.com"
    echo ""
    echo "3. 激活预设:"
    echo "   cc-claude"
    echo ""
    echo "4. 查看帮助:"
    echo "   cc-preset --help"
    echo ""
}

# 执行安装
install_cc_presets
