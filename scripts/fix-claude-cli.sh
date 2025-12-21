#!/bin/bash
# 修复被错误覆盖的 claude cli.js 文件

echo "=========================================="
echo "修复 Claude CLI 文件"
echo "=========================================="
echo ""

CLAUDE_CLI="/Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code/cli.js"

# 检查文件是否被错误覆盖
if head -1 "$CLAUDE_CLI" | grep -q "#!/bin/bash"; then
    echo "检测到 cli.js 文件被错误覆盖为 bash 脚本"
    echo "需要重新安装 @anthropic-ai/claude-code 包来恢复"
    echo ""
    echo "请运行以下命令（需要 sudo 权限）："
    echo ""
    echo "  sudo npm uninstall -g @anthropic-ai/claude-code"
    echo "  sudo npm install -g @anthropic-ai/claude-code"
    echo ""
    echo "或者运行："
    echo "  sudo npm install -g --force @anthropic-ai/claude-code"
    echo ""
    exit 1
else
    echo "✓ cli.js 文件正常"
    exit 0
fi

