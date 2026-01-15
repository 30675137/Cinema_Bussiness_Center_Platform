# Research: 改进 uninstall 命令的环境变量清理功能

**Feature**: 011-uninstall-env-cleanup  
**Date**: 2025-12-14  
**Status**: Complete

## Research Questions

### 1. 如何识别和删除函数内部的 ANTHROPIC 变量？

**Decision**: 使用正则表达式匹配函数内部的环境变量定义模式

**Rationale**: 
- Shell 函数中的变量定义通常遵循 `VARIABLE_NAME=value` 或 `export VARIABLE_NAME=value` 格式
- 需要识别函数体（`function_name() { ... }` 或 `function_name() { ... }` 格式）
- 在函数体内匹配 `ANTHROPIC_*` 变量定义

**Alternatives considered**:
- 使用 AST 解析器：过于复杂，shell 脚本语法解析器不成熟
- 逐行解析：简单但需要处理多行和嵌套结构
- 正则表达式：平衡了复杂度和准确性，适合当前需求

**Implementation approach**:
```python
# 匹配函数定义：function_name() { ... } 或 function_name() { ... }
function_pattern = r'^(\w+)\s*\(\)\s*\{'
# 在函数体内匹配 ANTHROPIC_* 变量
var_pattern = r'^\s*(export\s+)?ANTHROPIC_[A-Z_]+=.*$'
```

### 2. 如何识别和删除 alias 中的 ANTHROPIC 变量？

**Decision**: 使用正则表达式匹配 alias 定义中的环境变量

**Rationale**:
- alias 定义格式：`alias name="command"` 或 `alias name='command'`
- 多行 alias 使用反斜杠续行
- 需要在 alias 值中识别 `ANTHROPIC_*` 变量定义

**Alternatives considered**:
- 解析整个 alias 值：需要处理引号嵌套和转义
- 简单字符串匹配：可能误匹配
- 正则表达式匹配 alias 值中的变量：平衡准确性和复杂度

**Implementation approach**:
```python
# 匹配 alias 定义
alias_pattern = r'^alias\s+\w+="([^"]*)"'
# 在 alias 值中查找 ANTHROPIC_* 变量
# 需要处理单引号、双引号、反斜杠续行等情况
```

### 3. 如何处理多行变量定义（反斜杠续行）？

**Decision**: 识别续行模式，删除所有相关行

**Rationale**:
- Shell 使用反斜杠 `\` 作为行继续符
- 需要识别以反斜杠结尾的行，并找到下一行
- 如果续行中包含 ANTHROPIC 变量，需要删除整个多行定义

**Alternatives considered**:
- 预处理合并续行：需要处理各种边界情况
- 逐行检查并标记续行：实现简单但需要状态跟踪
- 使用正则表达式匹配多行模式：适合当前场景

**Implementation approach**:
```python
# 识别续行模式
continuation_pattern = r'\\\s*$'
# 合并续行后匹配 ANTHROPIC 变量
# 或逐行检查，标记续行状态
```

### 4. 如何避免误删注释中的 "ANTHROPIC" 文本？

**Decision**: 只匹配实际的变量定义模式，不匹配注释行

**Rationale**:
- Shell 注释以 `#` 开头
- 需要排除以 `#` 开头的行
- 确保只匹配实际的变量赋值语句

**Alternatives considered**:
- 解析整个文件为 AST：过于复杂
- 简单检查行首是否为 `#`：简单有效
- 使用更精确的正则表达式：平衡准确性和复杂度

**Implementation approach**:
```python
# 排除注释行
pattern = r'^(?!#)(.*ANTHROPIC_[A-Z_]+=.*)$'
# 或先过滤注释行，再匹配变量
```

### 5. 如何确保只匹配变量名，不匹配变量值中的 "ANTHROPIC"？

**Decision**: 使用精确的正则表达式，只匹配变量名以 `ANTHROPIC_` 开头的模式

**Rationale**:
- 变量定义格式：`VARIABLE_NAME=value`
- 需要确保 `VARIABLE_NAME` 部分以 `ANTHROPIC_` 开头
- 不匹配 `value` 部分中的 "ANTHROPIC" 字符串

**Alternatives considered**:
- 使用命名捕获组：更清晰但复杂度略高
- 简单前缀匹配：可能误匹配
- 精确正则表达式：平衡准确性和可读性

**Implementation approach**:
```python
# 只匹配变量名以 ANTHROPIC_ 开头
pattern = r'^(export\s+)?ANTHROPIC_[A-Z_]+='
# 不匹配 VALUE 中的 ANTHROPIC
```

### 6. 备份策略：默认启用但可跳过

**Decision**: 修改 `cmd_uninstall()` 函数，默认调用 `create_backup()`，添加 `--no-backup` 参数

**Rationale**:
- 当前实现需要 `--backup` 参数才备份，不符合安全最佳实践
- 默认备份可以防止意外数据丢失
- 提供 `--no-backup` 选项满足自动化场景需求

**Alternatives considered**:
- 完全自动备份（无跳过选项）：不够灵活
- 保持当前可选备份：不符合用户需求
- 默认启用但可跳过：平衡安全性和灵活性

**Implementation approach**:
```python
# 修改参数解析，添加 --no-backup
parser.add_argument('--no-backup', action='store_true', help='跳过备份步骤')
# 修改备份逻辑
if not args.no_backup:
    backup_location = create_backup()
```

### 7. 备份失败时的处理策略

**Decision**: 中止清理操作或显示严重警告

**Rationale**:
- 备份失败可能表示磁盘空间不足、权限问题等严重问题
- 在没有备份的情况下删除配置是危险操作
- 应该给用户明确的警告或选择

**Alternatives considered**:
- 静默失败继续执行：不安全
- 强制中止：可能过于严格
- 警告但允许继续：平衡安全性和可用性

**Implementation approach**:
```python
try:
    backup_location = create_backup()
except Exception as e:
    logging.error(f"✗ 备份失败: {e}")
    if not args.force:
        logging.error("✗ 无法创建备份，清理操作已中止。使用 --force 强制继续（不推荐）")
        return 1
```

### 8. 如何改进日志输出，显示删除的变量详情？

**Decision**: 在清理过程中记录每个匹配的变量，并在日志中输出

**Rationale**:
- 用户需要知道删除了哪些变量
- 详细的日志有助于调试和验证
- 可以统计删除的变量数量

**Alternatives considered**:
- 只输出成功/失败状态：信息不足
- 输出所有匹配的行：可能过于详细
- 输出变量名和位置：平衡信息量和可读性

**Implementation approach**:
```python
removed_vars = []
for match in re.finditer(pattern, content):
    var_name = extract_var_name(match)
    removed_vars.append(var_name)
    logging.info(f"  - 删除变量: {var_name} (行 {match.start()})")
logging.info(f"✓ 共删除 {len(removed_vars)} 个 ANTHROPIC 变量")
```

## Technology Choices

### Python 正则表达式 (re module)

**Decision**: 使用 Python 标准库 `re` 模块进行模式匹配

**Rationale**:
- 标准库，无需额外依赖
- 功能强大，支持多行匹配、命名组等
- 性能足够（文件大小 < 1000 行）

**Alternatives considered**:
- 第三方解析库（如 pyparsing）：过度设计
- 简单字符串操作：不够灵活
- 正则表达式：平衡功能和复杂度

### 文件操作 (pathlib)

**Decision**: 继续使用 `pathlib.Path` 进行文件操作

**Rationale**:
- 与现有代码保持一致
- 跨平台兼容性好
- 代码可读性强

## Implementation Notes

1. **向后兼容性**: 必须确保修改不影响现有功能，特别是 `--backup` 参数的处理
2. **错误处理**: 所有文件操作必须有完善的错误处理和日志记录
3. **测试策略**: 需要测试各种边界情况（多行定义、函数内部、alias 中等）
4. **性能考虑**: 正则表达式匹配应该足够快，但需要处理大文件的情况

### 9. Shell 入口 + Python 实现的架构模式

**Decision**: 使用 Shell 脚本作为入口，但优先使用 Python 模块实现功能

**Rationale**: 
- Shell 脚本适合作为 CLI 入口，参数解析简单直接
- Python 模块已经存在且功能完善（`commands/uninstall.py`, `core/env_manager.py`, `core/backup_manager.py`）
- 优先复用现有 Python 代码，减少重复开发
- 只有在 Python 很难实现的情况下（如系统级操作、进程管理）才使用 Shell

**Alternatives considered**:
- 完全 Shell 实现：需要重写所有逻辑，无法复用现有 Python 代码
- 完全 Python 实现：保持现状，但不符合用户要求（Shell 入口）
- Shell 包装器（薄层）：Shell 仅做参数解析，所有逻辑调用 Python，符合要求

**Implementation approach**:
```bash
#!/bin/bash
# scripts/claude-uninstall.sh
# Shell 入口脚本，优先调用 Python 模块

# 参数解析
NO_BACKUP=false
SKIP_VERIFY=false
# ... 其他参数

# 调用 Python 模块完成实际工作
python3 -m commands.uninstall \
  --no-backup="$NO_BACKUP" \
  --skip-verify="$SKIP_VERIFY"
```

**Python 模块调用方式**:
- 直接调用 `commands/uninstall.py` 模块
- 或通过 `python -m` 方式调用
- 或导入 Python 模块的函数直接调用

**Shell 直接实现的情况**:
- 系统级操作（如 `sudo` 权限处理）
- 进程管理（如 `kill` 命令）
- 文件权限检查（如 `test -w`）
- 简单的文件操作（如 `cp`, `mkdir`）

## Open Questions

无。所有研究问题已解决。

## References

- Python `re` module documentation: https://docs.python.org/3/library/re.html
- Shell script syntax: POSIX shell specification
- 现有代码: `scripts/claude_manager.py`, `scripts/commands/uninstall.py`, `scripts/core/env_manager.py`
- Shell 脚本最佳实践: ShellCheck guidelines

