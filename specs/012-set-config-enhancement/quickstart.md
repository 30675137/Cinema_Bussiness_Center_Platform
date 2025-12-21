# Quickstart: 改进 set-config 命令

**Feature**: `012-set-config-enhancement`  
**Date**: 2025-12-14

## 概述

本功能为 `claude_manager.py` 的 `set-config` 命令添加了 `--json-file` 和 `--to-shell` 参数支持，允许从 JSON 文件批量读取配置，并同步环境变量到 shell 配置文件。

## 快速开始

### 1. 准备 JSON 配置文件

创建或使用现有的 JSON 配置文件，格式如下：

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.example.com",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "API_TIMEOUT_MS": "600000"
  },
  "permissions": {
    "allow": ["read", "write"],
    "deny": []
  }
}
```

**示例文件位置**: `scripts/config/claude/settings.json`

---

### 2. 从 JSON 文件读取配置

```bash
# 从 JSON 文件读取配置并保存到 ~/.claude/settings.json
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json
```

**行为**:
- 读取 JSON 文件
- 合并到现有配置（只更新 JSON 中存在的字段）
- 保存到 `~/.claude/settings.json`

---

### 3. 同步环境变量到 Shell 配置文件

```bash
# 从 JSON 文件读取配置，并同步环境变量到 ~/.zshrc
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell
```

**行为**:
- 读取 JSON 文件
- 合并到现有配置
- 保存到 `~/.claude/settings.json`
- 写入环境变量到 `~/.zshrc` 或 `~/.zshenv`（自动检测）

**重要**: 执行后需要运行以下命令使环境变量生效：

```bash
source ~/.zshrc
# 或重新打开终端
```

---

### 4. 命令行参数覆盖 JSON 文件

```bash
# JSON 文件中的 ANTHROPIC_AUTH_TOKEN 将被命令行参数覆盖
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --env ANTHROPIC_AUTH_TOKEN=sk-new-token \
  --to-shell
```

**优先级**: 命令行参数 > JSON 文件 > 现有配置

---

### 5. 指定自定义 Shell 配置文件

```bash
# 使用自定义 shell 配置文件路径
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell \
  --shell-config ~/.custom-zshrc
```

**注意**: 如果指定的文件不存在，命令会报错退出。

---

## 常见使用场景

### 场景 1: 项目配置管理

在项目中维护配置文件，团队成员可以快速应用相同的配置：

```bash
# 应用项目配置
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell
```

---

### 场景 2: 环境切换

为不同环境准备不同的配置文件：

```bash
# 开发环境
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/dev.json \
  --to-shell

# 生产环境
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/prod.json \
  --to-shell
```

---

### 场景 3: 部分配置更新

只更新部分配置，保留其他配置不变：

```json
// partial-config.json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://new-api.example.com"
  }
}
```

```bash
python scripts/claude_manager.py set-config \
  --json-file partial-config.json
```

**结果**: 只更新 `ANTHROPIC_BASE_URL`，其他环境变量保持不变。

---

## 向后兼容

现有的使用方式继续工作：

```bash
# 只使用命令行参数（原有方式）
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_AUTH_TOKEN=sk-xxx \
  --env ANTHROPIC_BASE_URL=https://api.example.com
```

---

## 错误处理

### JSON 文件不存在

```bash
$ python scripts/claude_manager.py set-config --json-file non-existent.json
ERROR: JSON 文件不存在: /path/to/non-existent.json
```

**解决方案**: 检查文件路径是否正确。

---

### Shell 配置文件不存在

```bash
$ python scripts/claude_manager.py set-config --json-file config.json --to-shell
ERROR: 未找到 shell 配置文件（~/.zshrc 或 ~/.zshenv）
ERROR: 请先创建配置文件或使用 --shell-config 指定路径
```

**解决方案**: 
1. 创建 `~/.zshrc` 文件
2. 或使用 `--shell-config` 指定现有配置文件路径

---

### JSON 格式错误

```bash
$ python scripts/claude_manager.py set-config --json-file invalid.json
ERROR: JSON 文件格式错误: invalid.json, 错误: Expecting value: line 1 column 1 (char 0)
```

**解决方案**: 检查 JSON 文件格式是否正确。

---

## 最佳实践

1. **使用项目配置文件**: 在项目中维护配置文件，便于版本控制和团队协作
2. **部分配置更新**: 只包含需要更新的字段，保留其他配置不变
3. **环境变量同步**: 使用 `--to-shell` 确保环境变量在终端中可用
4. **命令行覆盖**: 使用命令行参数覆盖敏感信息（如 API key），避免写入配置文件

---

## 相关文档

- [规格说明](./spec.md)
- [实施计划](./plan.md)
- [研究文档](./research.md)
- [数据模型](./data-model.md)
- [CLI 接口合约](./contracts/cli-interface.md)

