# Quickstart: 改进 uninstall 命令的环境变量清理功能

**Feature**: 011-uninstall-env-cleanup  
**Date**: 2025-12-14

## 概述

此功能改进 `python scripts/claude_manager.py uninstall` 命令，增强其清理 ~/.zshrc 中 ANTHROPIC 相关环境变量的能力。

## 主要改进

1. **扩展清理范围**: 不仅删除 `export` 语句，还删除函数内部和 alias 中的 ANTHROPIC 变量
2. **默认自动备份**: 清理前自动创建备份（可通过 `--no-backup` 跳过）
3. **详细日志输出**: 显示删除的变量详情和位置
4. **多行定义支持**: 正确处理使用反斜杠续行的多行变量定义

## 快速开始

### 基本使用

```bash
# 使用 Shell 入口（推荐）
scripts/claude-uninstall.sh

# 或使用 Python（向后兼容）
python scripts/claude_manager.py uninstall
```

### 跳过备份（高级用户）

```bash
# 使用 Shell 入口
scripts/claude-uninstall.sh --no-backup

# 或使用 Python
python scripts/claude_manager.py uninstall --no-backup
```

### 查看帮助

```bash
# Shell 入口
scripts/claude-uninstall.sh --help

# 或 Python
python scripts/claude_manager.py uninstall --help
```

## 使用示例

### 示例 1: 基本卸载（自动备份）

```bash
# 运行卸载命令
scripts/claude-uninstall.sh

# 输出示例:
# ✓ 备份已创建: ~/claude-backup-20251214-143022
# 从配置文件 ~/.zshrc 中移除 ANTHROPIC 变量:
#   - 删除变量: ANTHROPIC_API_KEY (行 15, 类型: export)
#   - 删除变量: ANTHROPIC_BASE_URL (行 16, 类型: export)
# 共删除 2 个 ANTHROPIC 变量
# ✓ 成功更新配置文件: ~/.zshrc
```

### 示例 2: 清理函数内部的变量

假设 ~/.zshrc 包含：

```bash
cc_glm() {
  ANTHROPIC_AUTH_TOKEN=sk-xxx
  export ANTHROPIC_BASE_URL=https://api.example.com
  echo "Using GLM API"
}
```

运行卸载后，函数中的 ANTHROPIC 变量会被删除：

```bash
cc_glm() {
  echo "Using GLM API"
}
```

如果函数只包含 ANTHROPIC 变量，整个函数会被删除。

### 示例 3: 清理 alias 中的变量

假设 ~/.zshrc 包含：

```bash
alias cc-glm="ANTHROPIC_AUTH_TOKEN=sk-xxx ANTHROPIC_BASE_URL=https://api.example.com claude"
```

运行卸载后，alias 中的 ANTHROPIC 变量会被删除：

```bash
alias cc-glm="claude"
```

如果 alias 值只包含 ANTHROPIC 变量，整个 alias 会被删除。

### 示例 4: 跳过备份

```bash
# 跳过备份步骤（不推荐，除非确定不需要恢复）
scripts/claude-uninstall.sh --no-backup
```

### 示例 5: 恢复备份

如果清理后需要恢复：

```bash
# 查看备份位置（在卸载日志中）
# 备份位置: ~/claude-backup-20251214-143022

# 恢复 ~/.zshrc
cp ~/claude-backup-20251214-143022/.zshrc ~/.zshrc

# 重新加载配置
source ~/.zshrc
```

## 功能说明

### 清理范围

命令会删除以下格式的 ANTHROPIC 变量：

1. **Export 语句**:
   ```bash
   export ANTHROPIC_API_KEY=xxx
   export ANTHROPIC_BASE_URL=xxx
   ```

2. **函数内部变量**:
   ```bash
   cc_glm() {
     ANTHROPIC_AUTH_TOKEN=xxx
     export ANTHROPIC_BASE_URL=xxx
   }
   ```

3. **Alias 中的变量**:
   ```bash
   alias cc-glm="ANTHROPIC_AUTH_TOKEN=xxx claude"
   ```

4. **多行定义**:
   ```bash
   export ANTHROPIC_API_KEY=xxx \
     ANTHROPIC_BASE_URL=xxx
   ```

### 备份机制

- **默认行为**: 自动在 `~/claude-backup-{timestamp}/` 创建备份
- **备份内容**: 完整的 ~/.zshrc 文件副本
- **备份位置**: 日志中会显示备份路径
- **跳过备份**: 使用 `--no-backup` 参数

### 恢复备份

如果清理后需要恢复：

```bash
# 从日志中找到备份位置，例如：
cp ~/claude-backup-20251214-143022/.zshrc ~/.zshrc

# 重新加载配置
source ~/.zshrc
```

## 输出示例

### 成功执行

```
检测 Claude 安装...
✓ 检测到 npm 全局包: @anthropic-ai/claude-code

开始卸载...
✓ Uninstalled @anthropic-ai/claude-code

清理配置...
✓ 备份已创建: ~/claude-backup-20251214-143022
✓ 清理环境变量:
  - 删除变量: ANTHROPIC_API_KEY (行 42)
  - 删除变量: ANTHROPIC_BASE_URL (行 43)
  - 删除变量: ANTHROPIC_MODEL (行 45)
✓ 共删除 3 个 ANTHROPIC 变量
✓ Cleaned environment variables from ~/.zshrc

验证...
✓ 命令 claude 可用性: not found

总耗时: 2.3秒
备份位置: ~/claude-backup-20251214-143022

✅ 卸载完成！
```

## 注意事项

1. **备份重要性**: 默认自动备份是安全最佳实践，除非在自动化场景，否则不建议跳过
2. **备份失败**: 如果备份失败，命令会中止清理操作（除非使用 `--force`）
3. **配置文件位置**: 命令会自动检测 ~/.zshrc、~/.zshenv 等配置文件
4. **只删除 ANTHROPIC 变量**: 不会删除其他环境变量或配置

## 故障排除

### 备份失败

如果备份失败（如磁盘空间不足）：

```bash
# 选项1: 清理磁盘空间后重试
python scripts/claude_manager.py uninstall

# 选项2: 强制继续（不推荐，可能导致数据丢失）
python scripts/claude_manager.py uninstall --force
```

### 配置文件未找到

如果未找到配置文件，命令会跳过清理步骤：

```
Shell config not found, skipping env var cleanup
```

### 权限问题

如果配置文件不可写，命令会报错并中止：

```
✗ Failed to clean environment variables: Permission denied
```

## 开发说明

### 代码位置

- Shell 入口: `scripts/claude-uninstall.sh`（新增）
- Python 模块: `scripts/commands/uninstall.py`（现有，需要增强）
- 环境变量清理: `scripts/core/env_manager.py::cleanup_env_vars_from_files()`（现有，需要增强）
- 备份管理: `scripts/core/backup_manager.py`（现有，复用）

### 测试建议

1. 创建测试用的 ~/.zshrc 文件
2. 添加各种格式的 ANTHROPIC 变量
3. 运行 uninstall 命令
4. 验证变量是否被正确删除
5. 验证备份文件是否正确创建

## 相关文档

- [规格说明](./spec.md)
- [实施计划](./plan.md)
- [数据模型](./data-model.md)
- [CLI 接口](./contracts/cli-interface.md)

