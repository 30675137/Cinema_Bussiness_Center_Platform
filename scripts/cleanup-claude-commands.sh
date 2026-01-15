#!/bin/bash
# 清理残留的 claude 和 ccr 命令
# 用于解决卸载后验证失败的问题

set -e

echo "开始清理残留的 Claude 命令..."

# 1. 删除 Homebrew 安装的 claude
if [ -L /opt/homebrew/bin/claude ] || [ -f /opt/homebrew/bin/claude ]; then
    echo "发现 Homebrew 安装的 claude: /opt/homebrew/bin/claude"
    if [ -d /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code ]; then
        echo "删除 Homebrew node_modules..."
        rm -rf /opt/homebrew/lib/node_modules/@anthropic-ai/claude-code
        echo "✓ 已删除 Homebrew node_modules"
    fi
    if [ -L /opt/homebrew/bin/claude ] || [ -f /opt/homebrew/bin/claude ]; then
        rm -f /opt/homebrew/bin/claude
        echo "✓ 已删除 /opt/homebrew/bin/claude"
    fi
fi

# 2. 删除 npm-global 安装的 claude (需要 sudo)
if [ -L /Users/lining/.npm-global/bin/claude ] || [ -f /Users/lining/.npm-global/bin/claude ]; then
    echo "发现 npm-global 安装的 claude: /Users/lining/.npm-global/bin/claude"
    echo "需要 sudo 权限删除..."
    
    if [ -d /Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code ]; then
        echo "删除 npm-global node_modules (需要 sudo)..."
        sudo rm -rf /Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code
        echo "✓ 已删除 npm-global node_modules"
    fi
    
    if [ -L /Users/lining/.npm-global/bin/claude ] || [ -f /Users/lining/.npm-global/bin/claude ]; then
        sudo rm -f /Users/lining/.npm-global/bin/claude
        echo "✓ 已删除 /Users/lining/.npm-global/bin/claude"
    fi
fi

# 3. 删除 npm-global 安装的 ccr (需要 sudo)
if [ -L /Users/lining/.npm-global/bin/ccr ] || [ -f /Users/lining/.npm-global/bin/ccr ]; then
    echo "发现 npm-global 安装的 ccr: /Users/lining/.npm-global/bin/ccr"
    echo "需要 sudo 权限删除..."
    
    if [ -d /Users/lining/.npm-global/lib/node_modules/@musistudio/claude-code-router ]; then
        echo "删除 npm-global router node_modules (需要 sudo)..."
        sudo rm -rf /Users/lining/.npm-global/lib/node_modules/@musistudio/claude-code-router
        echo "✓ 已删除 npm-global router node_modules"
    fi
    
    if [ -L /Users/lining/.npm-global/bin/ccr ] || [ -f /Users/lining/.npm-global/bin/ccr ]; then
        sudo rm -f /Users/lining/.npm-global/bin/ccr
        echo "✓ 已删除 /Users/lining/.npm-global/bin/ccr"
    fi
fi

# 4. 删除 NVM 版本目录下的安装 (需要 sudo)
NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -n "$NVM_DIR" ] && [ -d "$NVM_DIR/versions/node" ]; then
    echo "检查 NVM 版本目录..."
    for node_version_dir in "$NVM_DIR/versions/node"/*/; do
        if [ -d "$node_version_dir" ]; then
            version=$(basename "$node_version_dir")
            echo "检查 Node.js 版本: $version"
            
            # 检查 claude
            if [ -L "$node_version_dir/bin/claude" ] || [ -f "$node_version_dir/bin/claude" ]; then
                echo "发现 NVM 安装的 claude: $node_version_dir/bin/claude"
                if [ -d "$node_version_dir/lib/node_modules/@anthropic-ai/claude-code" ]; then
                    echo "删除 NVM node_modules (需要 sudo)..."
                    sudo rm -rf "$node_version_dir/lib/node_modules/@anthropic-ai/claude-code"
                    echo "✓ 已删除 NVM node_modules for $version"
                fi
                if [ -L "$node_version_dir/bin/claude" ] || [ -f "$node_version_dir/bin/claude" ]; then
                    sudo rm -f "$node_version_dir/bin/claude"
                    echo "✓ 已删除 $node_version_dir/bin/claude"
                fi
            fi
            
            # 检查 ccr
            if [ -L "$node_version_dir/bin/ccr" ] || [ -f "$node_version_dir/bin/ccr" ]; then
                echo "发现 NVM 安装的 ccr: $node_version_dir/bin/ccr"
                if [ -d "$node_version_dir/lib/node_modules/@musistudio/claude-code-router" ]; then
                    echo "删除 NVM router node_modules (需要 sudo)..."
                    sudo rm -rf "$node_version_dir/lib/node_modules/@musistudio/claude-code-router"
                    echo "✓ 已删除 NVM router node_modules for $version"
                fi
                if [ -L "$node_version_dir/bin/ccr" ] || [ -f "$node_version_dir/bin/ccr" ]; then
                    sudo rm -f "$node_version_dir/bin/ccr"
                    echo "✓ 已删除 $node_version_dir/bin/ccr"
                fi
            fi
        fi
    done
fi

# 5. 验证清理结果
echo ""
echo "验证清理结果..."
if command -v claude >/dev/null 2>&1; then
    echo "✗ claude 命令仍然可用: $(which claude)"
else
    echo "✓ claude 命令已删除"
fi

if command -v ccr >/dev/null 2>&1; then
    echo "✗ ccr 命令仍然可用: $(which ccr)"
else
    echo "✓ ccr 命令已删除"
fi

echo ""
echo "✅ 清理完成！"

