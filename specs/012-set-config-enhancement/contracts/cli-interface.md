# CLI Interface Contract: set-config 命令

**Feature**: `012-set-config-enhancement`  
**Date**: 2025-12-14

## Command Signature

```bash
python scripts/claude_manager.py set-config [OPTIONS]
```

## Options

### `--json-file <path>`

**Type**: `Path` (file path)  
**Required**: No  
**Description**: 从 JSON 文件读取配置。文件格式与 `~/.claude/settings.json` 相同。

**Examples**:
```bash
--json-file scripts/config/claude/settings.json
--json-file /absolute/path/to/config.json
```

**Behavior**:
- 相对路径相对于当前工作目录（用户执行命令时的目录）
- 文件必须存在，否则报错退出
- JSON 格式必须有效，否则报错退出
- 支持部分配置（只包含 `env` 或只包含 `permissions`）
- 配置与现有配置合并（`merge=True`）

**Error Cases**:
- 文件不存在 → 错误信息: `"JSON 文件不存在: {path}"`, 退出码: 1
- JSON 格式错误 → 错误信息: `"JSON 文件格式错误: {path}, 错误: {error}"`, 退出码: 1

---

### `--to-shell`

**Type**: `bool` (flag)  
**Required**: No  
**Description**: 同时将环境变量写入 shell 配置文件（`~/.zshrc` 或 `~/.zshenv`）。

**Examples**:
```bash
--to-shell
```

**Behavior**:
- 自动检测 shell 配置文件（优先 `~/.zshenv`，其次 `~/.zshrc`）
- 如果文件不存在，报错退出（不自动创建）
- 更新现有环境变量值，避免重复
- 追加新环境变量到文件末尾

**Error Cases**:
- Shell 配置文件不存在 → 错误信息: `"未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）"`, 退出码: 1
- 写入失败 → 错误信息: `"设置 shell 环境变量失败"`, 退出码: 1

---

### `--shell-config <path>`

**Type**: `Path` (file path)  
**Required**: No  
**Description**: 指定 shell 配置文件路径（覆盖自动检测）。

**Examples**:
```bash
--shell-config ~/.zshrc
--shell-config /custom/path/to/config.sh
```

**Behavior**:
- 仅在 `--to-shell` 时有效
- 如果文件不存在，报错退出
- 必须与 `--to-shell` 一起使用

**Error Cases**:
- 文件不存在 → 错误信息: `"Shell 配置文件不存在: {path}"`, 退出码: 1

---

### `--env KEY=VALUE`

**Type**: `List[str]` (可多次使用)  
**Required**: No  
**Description**: 设置环境变量。可以多次使用以设置多个环境变量。

**Examples**:
```bash
--env ANTHROPIC_AUTH_TOKEN=sk-xxx
--env ANTHROPIC_BASE_URL=https://api.example.com --env API_TIMEOUT_MS=600000
```

**Behavior**:
- 格式必须为 `KEY=VALUE`
- 如果同时使用 `--json-file`，命令行参数覆盖 JSON 中的对应值
- 与现有配置合并（`merge=True`）

**Error Cases**:
- 格式错误（缺少 `=`）→ 错误信息: `"环境变量格式错误: {pair}"`, 退出码: 1

---

### `--permission KEY=VALUE`

**Type**: `List[str]` (可多次使用)  
**Required**: No  
**Description**: 设置权限。可以多次使用以设置多个权限。

**Examples**:
```bash
--permission allow_read=true
--permission deny_write=false
```

**Behavior**:
- 格式必须为 `KEY=VALUE`
- 值转换为布尔值（`true`/`false` 不区分大小写）
- 如果同时使用 `--json-file`，命令行参数覆盖 JSON 中的对应值

**Error Cases**:
- 格式错误（缺少 `=`）→ 错误信息: `"权限格式错误: {pair}"`, 退出码: 1

---

### `--alias NAME=COMMAND`

**Type**: `List[str]` (可多次使用)  
**Required**: No  
**Description**: 设置别名。可以多次使用以设置多个别名。

**Examples**:
```bash
--alias claude-dev=claude --dev
--alias ccr-local=ccr --local
```

**Behavior**:
- 格式必须为 `NAME=COMMAND`
- 如果同时使用 `--json-file`，命令行参数覆盖 JSON 中的对应值

**Error Cases**:
- 格式错误（缺少 `=`）→ 错误信息: `"别名格式错误: {pair}"`, 退出码: 1

---

## Parameter Priority

配置优先级（从高到低）：
1. **命令行参数** (`--env`, `--permission`, `--alias`)
2. **JSON 文件** (`--json-file`)
3. **现有配置文件** (`~/.claude/settings.json`)
4. **默认值**

**Example**:
```bash
# 现有配置: {env: {A: "1", B: "2"}}
# JSON 文件: {env: {B: "3", C: "4"}}
# 命令行: --env A=5

# 结果: {env: {A: "5", B: "3", C: "4"}}
# A=5 (命令行) > B=3 (JSON) > C=4 (JSON)
```

---

## Usage Examples

### 示例 1: 从 JSON 文件读取配置

```bash
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json
```

**Behavior**:
- 读取 JSON 文件
- 合并到现有配置
- 保存到 `~/.claude/settings.json`

---

### 示例 2: 从 JSON 文件读取并同步到 Shell

```bash
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell
```

**Behavior**:
- 读取 JSON 文件
- 合并到现有配置
- 保存到 `~/.claude/settings.json`
- 写入环境变量到 `~/.zshrc` 或 `~/.zshenv`

---

### 示例 3: 命令行参数覆盖 JSON 文件

```bash
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --env ANTHROPIC_AUTH_TOKEN=sk-new-token
```

**Behavior**:
- 读取 JSON 文件
- 命令行参数 `ANTHROPIC_AUTH_TOKEN=sk-new-token` 覆盖 JSON 中的值
- 保存到 `~/.claude/settings.json`

---

### 示例 4: 只使用命令行参数（向后兼容）

```bash
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_AUTH_TOKEN=sk-xxx \
  --env ANTHROPIC_BASE_URL=https://api.example.com
```

**Behavior**:
- 不读取 JSON 文件
- 命令行参数合并到现有配置
- 保存到 `~/.claude/settings.json`

---

## Exit Codes

- `0`: 成功
- `1`: 错误（文件不存在、格式错误、写入失败等）
- `2`: 参数错误（格式错误、缺少必需参数等）

---

## Output Format

### Success Output

```
INFO: 从文件加载配置: scripts/config/claude/settings.json
INFO: ✓ 更新环境变量配置: ['ANTHROPIC_AUTH_TOKEN', 'ANTHROPIC_BASE_URL']
INFO: ✓ 配置已保存到: ~/.claude/settings.json
INFO: ✓ 环境变量已设置到: ~/.zshrc
INFO: 请运行 'source ~/.zshrc' 或重新打开终端使环境变量生效
```

### Error Output

```
ERROR: JSON 文件不存在: /path/to/config.json
ERROR: 未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）
ERROR: JSON 文件格式错误: /path/to/config.json, 错误: Expecting value: line 1 column 1 (char 0)
```

---

## Backward Compatibility

以下现有参数继续工作，行为不变：
- `--env KEY=VALUE`
- `--permission KEY=VALUE`
- `--alias NAME=COMMAND`

新参数（`--json-file`, `--to-shell`, `--shell-config`）是可选的，不影响现有使用方式。

