#!/bin/bash
# 快速更新 Claude API Token 脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Claude API Token 更新工具 ===${NC}\n"

# 检查是否提供了 token
if [ -z "$1" ]; then
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  $0 <new-token>"
    echo ""
    echo "或者交互式输入:"
    echo "  $0"
    echo ""
    read -sp "请输入新的 API Token: " NEW_TOKEN
    echo ""
else
    NEW_TOKEN="$1"
fi

if [ -z "$NEW_TOKEN" ]; then
    echo "错误: Token 不能为空"
    exit 1
fi

# 切换到脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 使用 Python 脚本更新
echo "正在更新 Token..."
python claude_manager.py set-api-key "$NEW_TOKEN"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Token 更新成功！${NC}"
    echo -e "${YELLOW}请执行以下命令使配置生效:${NC}"
    echo "  source ~/.zshrc"
    echo "  或重新打开终端"
else
    echo -e "\n错误: Token 更新失败"
    exit 1
fi

