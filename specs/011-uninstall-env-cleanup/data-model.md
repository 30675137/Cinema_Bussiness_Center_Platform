# Data Model: 改进 uninstall 命令的环境变量清理功能

**Feature**: 011-uninstall-env-cleanup  
**Date**: 2025-12-14

## Overview

此功能主要涉及文件系统操作和文本处理，不涉及复杂的数据模型。主要实体是配置文件和备份文件。

## Entities

### Shell 配置文件 (Shell Configuration File)

**类型**: 文件系统实体  
**位置**: `~/.zshrc`, `~/.zshenv`, `~/.zprofile`  
**格式**: 纯文本文件，Shell 脚本语法

**属性**:
- `path`: Path 对象，配置文件路径
- `content`: str，文件内容
- `exists`: bool，文件是否存在
- `writable`: bool，文件是否可写

**检测逻辑**:
- 优先检测 `~/.zshenv`
- 其次检测 `~/.zshrc`
- 如果都不存在，默认使用 `~/.zshenv`（将创建）

**相关函数**: `detect_zsh_config()`

### 环境变量定义 (Environment Variable Definition)

**类型**: 文本模式匹配  
**格式**: 多种格式的 ANTHROPIC_* 变量定义

**格式类型**:

1. **Export 语句**:
   ```bash
   export ANTHROPIC_API_KEY=xxx
   export ANTHROPIC_BASE_URL=xxx
   ```

2. **函数内部变量**:
   ```bash
   function_name() {
     ANTHROPIC_AUTH_TOKEN=xxx
     export ANTHROPIC_BASE_URL=xxx
   }
   ```

3. **Alias 中的变量**:
   ```bash
   alias cc-glm="ANTHROPIC_AUTH_TOKEN=xxx ANTHROPIC_BASE_URL=xxx claude"
   ```

4. **多行定义（续行）**:
   ```bash
   export ANTHROPIC_API_KEY=xxx \
     ANTHROPIC_BASE_URL=xxx
   ```

**匹配规则**:
- 变量名必须以 `ANTHROPIC_` 开头
- 变量名格式：`ANTHROPIC_[A-Z_]+`
- 不匹配注释行（以 `#` 开头）
- 不匹配变量值中的 "ANTHROPIC" 文本

**清理规则**:
- 删除包含 ANTHROPIC 变量的整行
- 如果行中还有其他内容，只删除变量定义部分
- 处理多行定义时，删除所有相关行

### 备份文件 (Backup File)

**类型**: 文件系统实体  
**位置**: `~/claude-backup-{timestamp}/.zshrc`  
**格式**: 纯文本文件，原始配置文件的完整副本

**属性**:
- `backup_dir`: Path 对象，备份目录路径
- `backup_file`: Path 对象，备份文件路径
- `timestamp`: str，时间戳（格式：`YYYYMMDD-HHMMSS`）
- `original_file`: Path 对象，原始文件路径

**命名规则**:
- 备份目录：`~/claude-backup-{timestamp}/`
- 备份文件：`.zshrc`（保持原始文件名）

**创建时机**:
- 默认：在清理 ~/.zshrc 前自动创建
- 可跳过：使用 `--no-backup` 参数

**相关函数**: `create_backup()`

## Data Flow

### 清理流程

```
1. 检测配置文件 (detect_zsh_config)
   ↓
2. 创建备份 (create_backup) [默认，可跳过]
   ↓
3. 读取文件内容 (read_text)
   ↓
4. 匹配 ANTHROPIC 变量 (正则表达式)
   ├─ Export 语句
   ├─ 函数内部变量
   ├─ Alias 中的变量
   └─ 多行定义
   ↓
5. 删除匹配的变量
   ↓
6. 清理格式（合并多余空行）
   ↓
7. 写入文件 (write_text)
   ↓
8. 记录日志（删除的变量详情）
```

### 备份流程

```
1. 生成时间戳
   ↓
2. 创建备份目录 (~/claude-backup-{timestamp}/)
   ↓
3. 检测配置文件 (detect_zsh_config)
   ↓
4. 复制配置文件到备份目录
   ↓
5. 返回备份目录路径
   ↓
6. 记录日志（备份位置）
```

## Validation Rules

### 配置文件验证

- 文件必须存在且可读
- 文件必须可写（如果不存在，将创建）
- 文件编码必须是 UTF-8 或兼容编码

### 变量匹配验证

- 只匹配变量名以 `ANTHROPIC_` 开头的模式
- 不匹配注释行
- 不匹配变量值中的 "ANTHROPIC" 文本
- 处理多行定义时，确保删除所有相关行

### 备份验证

- 备份目录必须成功创建
- 备份文件必须成功复制
- 备份文件内容必须与原始文件一致

## State Transitions

### 配置文件状态

```
不存在 → 检测到 → 读取 → 处理 → 写入 → 已清理
                ↓
            备份创建
```

### 备份状态

```
未创建 → 创建中 → 已创建 → 记录日志
   ↓
创建失败 → 错误处理（中止或警告）
```

## Error Handling

### 文件操作错误

- **文件不存在**: 跳过清理，记录日志
- **文件不可读**: 记录错误，跳过清理
- **文件不可写**: 记录错误，中止操作
- **读取失败**: 记录错误，中止操作
- **写入失败**: 记录错误，中止操作

### 备份错误

- **目录创建失败**: 记录错误，中止操作（或警告）
- **文件复制失败**: 记录错误，中止操作（或警告）
- **磁盘空间不足**: 记录错误，中止操作

### 正则表达式错误

- **模式匹配失败**: 记录警告，继续处理
- **替换失败**: 记录错误，中止操作

## Performance Considerations

- 文件大小限制：< 1000 行（符合假设）
- 处理时间目标：< 5 秒
- 正则表达式匹配：使用编译后的模式（`re.compile`）提高性能
- 文件 I/O：一次性读取整个文件，处理后再写入

## Security Considerations

- 文件操作前必须备份（默认）
- 所有文件操作必须有错误处理
- 不执行任何 shell 命令（避免代码注入风险）
- 只进行文本替换，不解析或执行配置内容

