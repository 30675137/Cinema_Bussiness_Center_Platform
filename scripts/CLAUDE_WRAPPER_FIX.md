# 修复 Claude CLI 文件错误

## 问题描述

`/Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code/cli.js` 文件被错误地覆盖为 bash 脚本，导致 Node.js 无法执行。

## 错误信息

```
SyntaxError: Invalid or unexpected token
file:///Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code/cli.js:2
```

## 修复方法

由于文件需要 root 权限才能修改，请手动运行以下命令：

### 方法 1: 重新安装包（推荐）

```bash
sudo npm uninstall -g @anthropic-ai/claude-code
sudo npm install -g @anthropic-ai/claude-code
```

### 方法 2: 强制重新安装

```bash
sudo npm install -g --force @anthropic-ai/claude-code
```

### 方法 3: 使用修复脚本检查

```bash
./scripts/fix-claude-cli.sh
```

## 验证修复

修复后，运行以下命令验证：

```bash
# 检查文件类型
file /Users/lining/.npm-global/lib/node_modules/@anthropic-ai/claude-code/cli.js

# 应该显示为 Node.js 脚本，而不是 bash 脚本
# 正确输出示例: "a /usr/bin/env node script text executable"

# 测试命令
claude --version
```

## 原因

在创建包装脚本时，`write` 工具错误地将 bash 脚本内容写入了 `cli.js` 文件，而不是只创建 `~/.local/bin/claude` 包装脚本。

## 预防措施

包装脚本应该只创建在 `~/.local/bin/claude`，不应该修改 npm 包中的任何文件。

