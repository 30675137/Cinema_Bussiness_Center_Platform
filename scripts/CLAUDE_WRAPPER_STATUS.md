# Claude 包装脚本安装状态

## ✅ 安装完成

包装脚本已成功创建并配置！

## 安装位置

- **包装脚本**: `~/.local/bin/claude` ✅ 已创建
- **原始 CLI**: `/Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code/cli.js`
- **Shell 配置**: `~/.zshenv` (已添加 PATH 优先级)
- **备份文件**: `~/.local/bin/claude.binary.backup` (原二进制文件已备份)

## 验证

运行以下命令验证安装：

```bash
# 重新加载 shell 配置（或重新打开终端）
source ~/.zshenv

# 检查 claude 命令位置（应该指向 ~/.local/bin/claude）
which claude

# 测试命令是否正常工作
claude --version
```

## 工作原理

1. **PATH 优先级**: `~/.local/bin` 已添加到 PATH 的最前面，优先级高于 `~/.npm-global/bin`
2. **自动追加参数**: 每次调用 `claude` 时，如果没有 `--dangerously-skip-permissions`，则自动追加
3. **避免重复**: 如果参数中已经包含该选项，则不再追加

## 注意事项

1. **需要重新加载 shell**: 修改 PATH 后，需要重新加载 shell 配置或重新打开终端
2. **VS Code 插件**: VS Code 插件会使用系统 PATH，因此会自动使用包装脚本
3. **影响范围**: 所有 `claude` 调用都会自动带上 `--dangerously-skip-permissions`

## 恢复方法

如果需要恢复原始行为：

```bash
# 删除包装脚本
rm ~/.local/bin/claude

# 从 ~/.zshenv 中移除 PATH 修改（可选）
# 编辑 ~/.zshenv，删除或注释掉：
# export PATH="$HOME/.local/bin:$PATH"
```

## 替代方案（需要 sudo）

如果需要直接替换 `/Users/lining/.npm-global/bin/claude`（不需要修改 PATH），可以使用：

```bash
./scripts/install-claude-wrapper.sh
```

此方法需要 sudo 权限。

