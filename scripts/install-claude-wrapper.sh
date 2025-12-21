#!/bin/bash
# Claude 包装脚本安装工具
# 用于替换 claude 命令，自动追加 --dangerously-skip-permissions 参数

set -e

CLAUDE_BIN="/Users/lining/.npm-global/bin/claude"
ORIGINAL_CLI="/Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code/cli.js"
BACKUP_DIR="$HOME/claude-wrapper-backup-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "Claude 包装脚本安装工具"
echo "=========================================="
echo ""

# 检查原始文件是否存在
if [ ! -f "$ORIGINAL_CLI" ]; then
    echo "错误: 找不到原始 claude CLI 文件: $ORIGINAL_CLI" >&2
    exit 1
fi

# 创建备份目录
mkdir -p "$BACKUP_DIR"
echo "✓ 创建备份目录: $BACKUP_DIR"

# 备份当前 claude 命令
if [ -L "$CLAUDE_BIN" ]; then
    echo "检测到符号链接，备份链接目标..."
    readlink "$CLAUDE_BIN" > "$BACKUP_DIR/claude-link-target.txt"
elif [ -f "$CLAUDE_BIN" ]; then
    echo "检测到文件，备份内容..."
    cp "$CLAUDE_BIN" "$BACKUP_DIR/claude-backup"
fi

# 创建包装脚本
echo "创建包装脚本..."
sudo tee "$CLAUDE_BIN" > /dev/null << 'EOF'
#!/bin/bash
# Claude 包装脚本 - 自动追加 --dangerously-skip-permissions
# 原始文件: ../lib/node_modules/@anthropic-ai/claude-code/cli.js

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORIGINAL_CLI="${SCRIPT_DIR}/../lib/node_modules/@anthropic-ai/claude-code/cli.js"

# 检查原始文件是否存在
if [ ! -f "$ORIGINAL_CLI" ]; then
    echo "错误: 找不到原始 claude CLI 文件: $ORIGINAL_CLI" >&2
    exit 1
fi

# 调用原始 CLI，自动追加 --dangerously-skip-permissions
# 如果参数中已经包含该选项，则不再追加（避免重复）
if [[ " $* " =~ " --dangerously-skip-permissions " ]]; then
    exec node "$ORIGINAL_CLI" "$@"
else
    exec node "$ORIGINAL_CLI" "$@" --dangerously-skip-permissions
fi
EOF

# 设置执行权限
echo "设置执行权限..."
sudo chmod +x "$CLAUDE_BIN"

echo ""
echo "=========================================="
echo "✅ 安装完成！"
echo "=========================================="
echo ""
echo "备份位置: $BACKUP_DIR"
echo ""
echo "验证安装:"
echo "  claude --version"
echo ""
echo "如需恢复原始符号链接，请运行:"
echo "  sudo rm $CLAUDE_BIN"
echo "  sudo ln -s ../lib/node_modules/@anthropic-ai/claude-code/cli.js $CLAUDE_BIN"
echo ""

