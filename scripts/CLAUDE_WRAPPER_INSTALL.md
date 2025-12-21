# Claude 包装脚本安装指南

## 概述

此脚本用于创建 `claude` 命令的包装脚本，使得所有调用（包括 VS Code 插件）自动带上 `--dangerously-skip-permissions` 参数。

## 安装方法

### 方法 1: 使用安装脚本（推荐）

```bash
cd /Users/lining/Documents/javaPrject/Cinema_Bussiness_Center_Platform
./scripts/install-claude-wrapper.sh
```

安装脚本会：
1. 自动备份原始的 `claude` 符号链接
2. 创建包装脚本替换原符号链接
3. 设置正确的执行权限

**注意**: 此操作需要 sudo 权限，会提示输入密码。

### 方法 2: 手动安装

如果无法使用安装脚本，可以手动执行以下命令：

```bash
# 1. 备份原始符号链接
sudo cp /Users/lining/.npm-global/bin/claude /Users/lining/.npm-global/bin/claude.backup

# 2. 删除原始符号链接
sudo rm /Users/lining/.npm-global/bin/claude

# 3. 创建包装脚本
sudo tee /Users/lining/.npm-global/bin/claude > /dev/null << 'EOF'
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

# 4. 设置执行权限
sudo chmod +x /Users/lining/.npm-global/bin/claude
```

## 验证安装

安装完成后，验证脚本是否正常工作：

```bash
# 检查版本（应该自动带上 --dangerously-skip-permissions）
claude --version

# 检查帮助信息
claude --help
```

## 工作原理

1. **包装脚本**: 替换了原始的符号链接，成为一个 bash 脚本
2. **自动追加参数**: 每次调用 `claude` 时，如果参数中没有 `--dangerously-skip-permissions`，则自动追加
3. **避免重复**: 如果参数中已经包含该选项，则不再追加
4. **透明传递**: 所有其他参数和选项都会原样传递给原始的 CLI

## 恢复原始配置

如果需要恢复原始的符号链接：

```bash
# 删除包装脚本
sudo rm /Users/lining/.npm-global/bin/claude

# 恢复符号链接
sudo ln -s ../lib/node_modules/@anthropic-ai/claude-code/cli.js /Users/lining/.npm-global/bin/claude
```

或者使用备份文件（如果使用安装脚本创建了备份）：

```bash
# 查看备份位置（安装脚本会显示）
# 然后从备份恢复
```

## 注意事项

1. **权限要求**: 需要 sudo 权限来修改 `/Users/lining/.npm-global/bin/claude`
2. **风险提示**: `--dangerously-skip-permissions` 会跳过权限确认，仅在信任的仓库使用
3. **影响范围**: 此更改会影响所有 `claude` 调用（终端、VS Code 插件等）
4. **VS Code 插件**: VS Code 的 Claude Code 插件会直接调用 PATH 中的 `claude` 命令，因此会自动使用包装脚本

## 故障排除

### 问题: 命令找不到

```bash
# 检查文件是否存在
ls -la /Users/lining/.npm-global/bin/claude

# 检查执行权限
file /Users/lining/.npm-global/bin/claude

# 检查 PATH
echo $PATH | grep npm-global
```

### 问题: 权限错误

确保使用 sudo 执行安装命令。

### 问题: 脚本不工作

检查原始 CLI 文件是否存在：

```bash
ls -la /Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code/cli.js
```

## 技术细节

- **原始位置**: `/Users/lining/.npm-global/bin/claude` (符号链接)
- **原始目标**: `../lib/node_modules/@anthropic-ai/claude-code/cli.js`
- **包装脚本**: 替换符号链接为 bash 脚本
- **PATH 优先级**: `/Users/lining/.npm-global/bin` 在 PATH 中优先级较高

