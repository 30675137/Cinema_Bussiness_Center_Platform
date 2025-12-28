# Data Model: 改进 set-config 命令

**Feature**: `012-set-config-enhancement`  
**Date**: 2025-12-14

## Overview

本功能涉及的数据模型主要是配置文件格式和 CLI 参数结构。不涉及数据库或复杂的状态管理。

## Entities

### 1. Claude 配置文件 (`~/.claude/settings.json`)

**Description**: Claude Code 的主配置文件，存储环境变量、权限设置和别名。

**Schema**:
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "string",
    "ANTHROPIC_BASE_URL": "string",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "0" | "1",
    "API_TIMEOUT_MS": "string (数字)"
  },
  "permissions": {
    "allow": ["string[]"],
    "deny": ["string[]"]
  },
  "aliases": {
    "alias_name": "command_string"
  }
}
```

**Fields**:
- `env` (object, optional): 环境变量字典
  - Key: 环境变量名（字符串）
  - Value: 环境变量值（字符串）
- `permissions` (object, optional): 权限设置
  - `allow` (array<string>, optional): 允许的权限列表
  - `deny` (array<string>, optional): 拒绝的权限列表
- `aliases` (object, optional): 别名定义
  - Key: 别名名称（字符串）
  - Value: 命令字符串（字符串）

**Validation Rules**:
- JSON 格式必须有效
- `env` 中的值必须是字符串类型
- `permissions.allow` 和 `permissions.deny` 必须是字符串数组
- `aliases` 中的值必须是字符串类型

**State Transitions**:
- **初始状态**: 文件不存在或为空
- **更新状态**: 通过 `set_claude_config(merge=True)` 合并新配置
- **完全替换**: 通过 `set_claude_config(merge=False)` 替换所有配置

---

### 2. JSON 配置文件（用户提供的文件）

**Description**: 用户通过 `--json-file` 参数提供的 JSON 配置文件，格式与 `~/.claude/settings.json` 相同。

**Schema**: 与 `~/.claude/settings.json` 相同

**Fields**: 与 `~/.claude/settings.json` 相同

**Validation Rules**:
- 文件必须存在
- JSON 格式必须有效
- 支持部分配置（只包含 `env` 或只包含 `permissions`）
- 相对路径相对于当前工作目录

**State Transitions**:
- **读取**: 从文件系统读取 JSON 内容
- **解析**: 使用 `json.load()` 解析为字典
- **合并**: 与现有配置合并（`merge=True`）

---

### 3. Shell 配置文件 (`~/.zshrc` 或 `~/.zshenv`)

**Description**: Shell 配置文件，包含 `export` 语句定义环境变量。

**Format**: 纯文本文件，每行一个 `export` 语句

**Schema**:
```bash
export ANTHROPIC_AUTH_TOKEN="value"
export ANTHROPIC_BASE_URL="value"
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"
export API_TIMEOUT_MS="600000"
```

**Fields**:
- 每行格式: `export KEY="VALUE"`
- `KEY`: 环境变量名（字符串，不包含空格）
- `VALUE`: 环境变量值（字符串，需要转义特殊字符）

**Validation Rules**:
- 文件必须存在（如果不存在，报错退出）
- 环境变量值中的双引号需要转义为 `\"`
- 如果环境变量已存在，更新现有值；否则追加新行

**State Transitions**:
- **检测**: 使用 `detect_config_file()` 检测配置文件路径
- **读取**: 读取现有内容
- **更新**: 使用正则表达式更新现有环境变量
- **追加**: 如果环境变量不存在，追加到文件末尾

---

### 4. CLI 参数结构

**Description**: `claude_manager.py set-config` 命令的参数结构。

**Schema**:
```python
class SetConfigArgs:
    json_file: Optional[Path] = None      # --json-file 参数
    to_shell: bool = False                # --to-shell 标志
    shell_config: Optional[Path] = None   # --shell-config 参数
    env: Optional[List[str]] = None       # --env 参数（可多次）
    permission: Optional[List[str]] = None # --permission 参数（可多次）
    alias: Optional[List[str]] = None     # --alias 参数（可多次）
```

**Fields**:
- `json_file` (Path, optional): JSON 配置文件路径（相对或绝对路径）
- `to_shell` (bool): 是否同时写入 shell 配置文件
- `shell_config` (Path, optional): Shell 配置文件路径（默认: 自动检测）
- `env` (List[str], optional): 环境变量列表，格式 `KEY=VALUE`
- `permission` (List[str], optional): 权限列表，格式 `KEY=VALUE`
- `alias` (List[str], optional): 别名列表，格式 `NAME=COMMAND`

**Validation Rules**:
- `json_file` 路径必须存在（如果提供）
- `shell_config` 路径必须存在（如果提供且 `to_shell=True`）
- `env`, `permission`, `alias` 格式必须为 `KEY=VALUE`

**State Transitions**:
- **解析**: argparse 解析命令行参数
- **验证**: 验证文件路径和参数格式
- **处理**: 按优先级处理配置（命令行参数 > JSON 文件 > 现有配置）

---

## Relationships

```
CLI Arguments
    │
    ├─→ JSON File (--json-file)
    │       │
    │       └─→ Claude Config (~/.claude/settings.json)
    │
    ├─→ Command Line Args (--env, --permission, --alias)
    │       │
    │       └─→ Claude Config (~/.claude/settings.json)
    │
    └─→ Shell Config (--to-shell)
            │
            └─→ ~/.zshrc or ~/.zshenv
```

**Priority Flow**:
1. 读取现有配置（`~/.claude/settings.json`）
2. 读取 JSON 文件（如果提供 `--json-file`），合并到现有配置
3. 处理命令行参数（`--env`, `--permission`, `--alias`），覆盖 JSON 中的值
4. 保存到 Claude 配置文件
5. 写入 Shell 配置文件（如果提供 `--to-shell`）

---

## Data Flow

### 配置读取流程

```
User Input (CLI Args)
    ↓
Parse Arguments (argparse)
    ↓
Read JSON File (if --json-file)
    ↓
Load Existing Config (~/.claude/settings.json)
    ↓
Merge Configurations (JSON → Existing)
    ↓
Apply CLI Args (CLI Args → Merged Config)
    ↓
Save to Claude Config
    ↓
Write to Shell Config (if --to-shell)
```

### 配置合并策略

```
Existing Config: {env: {A: "1", B: "2"}, permissions: {allow: ["read"]}}
JSON File:       {env: {B: "3", C: "4"}}
CLI Args:        --env A=5

Result:
  env: {A: "5", B: "3", C: "4"}  # CLI > JSON > Existing
  permissions: {allow: ["read"]}  # 保留现有值（JSON 中没有）
```

---

## Constraints

1. **文件路径约束**:
   - JSON 文件路径必须存在（如果提供）
   - Shell 配置文件路径必须存在（如果 `--to-shell` 且未指定 `--shell-config`）

2. **配置格式约束**:
   - JSON 文件必须是有效的 JSON 格式
   - Shell 配置文件必须是有效的 shell 脚本格式

3. **参数格式约束**:
   - `--env`, `--permission`, `--alias` 必须遵循 `KEY=VALUE` 格式

4. **优先级约束**:
   - 命令行参数 > JSON 文件 > 现有配置文件 > 默认值

---

## Edge Cases

1. **JSON 文件只包含部分配置**:
   - 只包含 `env`，不包含 `permissions` → 只更新 `env`，保留现有 `permissions`
   - 只包含 `permissions`，不包含 `env` → 只更新 `permissions`，保留现有 `env`

2. **Shell 配置文件不存在**:
   - 报错退出，不自动创建文件

3. **环境变量值包含特殊字符**:
   - 双引号转义为 `\"`
   - 换行符转义为 `\n`

4. **并发执行**:
   - 多个 `set-config` 命令同时执行可能导致配置文件冲突
   - 建议：使用文件锁或原子写入（由 `core/config_manager.py` 处理）

