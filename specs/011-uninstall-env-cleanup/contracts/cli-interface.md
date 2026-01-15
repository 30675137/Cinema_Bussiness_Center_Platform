# CLI Interface Contract: uninstall 命令

**Feature**: 011-uninstall-env-cleanup  
**Date**: 2025-12-14

## Command Signature

```bash
# 新的 Shell 入口（推荐）
scripts/claude-uninstall.sh [OPTIONS]

# 或直接调用 Python（向后兼容）
python scripts/claude_manager.py uninstall [OPTIONS]
```

## Options

### --no-backup

**类型**: Flag (boolean)  
**默认值**: False  
**描述**: 跳过备份步骤，直接执行清理操作  
**适用场景**: 自动化脚本、高级用户  
**风险**: 在没有备份的情况下删除配置，可能导致数据丢失

**示例**:
```bash
# 使用 Shell 入口
scripts/claude-uninstall.sh --no-backup

# 或使用 Python（向后兼容）
python scripts/claude_manager.py uninstall --no-backup
```

### --backup (已存在，保持向后兼容)

**类型**: Flag (boolean)  
**默认值**: False  
**描述**: 创建备份（此选项在新版本中已默认启用，保留仅为向后兼容）  
**注意**: 新版本中备份默认启用，此选项可能在未来版本中移除

### --skip-verification (已存在)

**类型**: Flag (boolean)  
**默认值**: False  
**描述**: 跳过验证步骤

### --force (建议添加，用于备份失败时强制继续)

**类型**: Flag (boolean)  
**默认值**: False  
**描述**: 即使备份失败也强制继续清理操作（不推荐）  
**风险**: 可能导致数据丢失

## Behavior

### 默认行为（无选项）

1. **自动备份**: 在清理 ~/.zshrc 前自动创建备份
2. **清理变量**: 删除所有 ANTHROPIC_* 格式的变量
3. **详细日志**: 输出删除的变量详情
4. **验证**: 执行验证步骤（除非使用 `--skip-verification`）

### 使用 --no-backup

1. **跳过备份**: 不创建备份文件
2. **清理变量**: 删除所有 ANTHROPIC_* 格式的变量
3. **详细日志**: 输出删除的变量详情
4. **验证**: 执行验证步骤（除非使用 `--skip-verification`）

### 备份失败时的行为

1. **默认**: 中止清理操作，显示错误信息
2. **使用 --force**: 继续执行清理操作，显示警告

## Output Format

### 成功输出示例

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
✓ 命令 ccr 可用性: not found

总耗时: 2.3秒
备份位置: ~/claude-backup-20251214-143022

✅ 卸载完成！
```

### 备份失败输出示例

```
检测 Claude 安装...
✓ 检测到 npm 全局包: @anthropic-ai/claude-code

开始卸载...
✓ Uninstalled @anthropic-ai/claude-code

清理配置...
✗ 备份失败: [Errno 28] No space left on device
✗ 无法创建备份，清理操作已中止。使用 --force 强制继续（不推荐）
```

### 使用 --no-backup 输出示例

```
检测 Claude 安装...
✓ 检测到 npm 全局包: @anthropic-ai/claude-code

开始卸载...
✓ Uninstalled @anthropic-ai/claude-code

清理配置...
⚠ 跳过备份步骤（使用 --no-backup）
✓ 清理环境变量:
  - 删除变量: ANTHROPIC_API_KEY (行 42)
  - 删除变量: ANTHROPIC_BASE_URL (行 43)
✓ 共删除 2 个 ANTHROPIC 变量
✓ Cleaned environment variables from ~/.zshrc

✅ 卸载完成！
```

## Exit Codes

- `0`: 成功完成
- `1`: 错误（备份失败且未使用 --force，或其他致命错误）
- `2`: 参数错误

## Error Messages

### 备份相关错误

- `✗ 备份失败: {error_message}`: 备份创建失败
- `✗ 无法创建备份，清理操作已中止。使用 --force 强制继续（不推荐）`: 备份失败且未使用 --force
- `⚠ 跳过备份步骤（使用 --no-backup）`: 用户明确跳过备份

### 清理相关错误

- `✗ Failed to clean environment variables: {error_message}`: 清理环境变量失败
- `Shell config not found, skipping env var cleanup`: 未找到 shell 配置文件

## Compatibility

### 向后兼容性

- 保留 `--backup` 选项（虽然现在默认启用）
- 现有脚本和自动化工具继续工作
- 不破坏现有的命令行接口

### 未来变更

- `--backup` 选项可能在后续版本中标记为废弃
- 建议新脚本使用默认行为（自动备份）或 `--no-backup`

