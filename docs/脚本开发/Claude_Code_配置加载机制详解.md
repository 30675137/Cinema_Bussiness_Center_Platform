# Claude Code 配置加载机制详解

> 基于 Context7 官方文档，详细说明 Claude Code 如何加载配置参数，以及 `settings.json` 和 `~/.zshrc` 之间的关系

**创建日期**: 2025-01-XX  
**参考来源**: Context7 Claude Code 官方文档

---

## 📋 目录

- [配置文件位置](#配置文件位置)
- [配置优先级](#配置优先级)
- [环境变量加载机制](#环境变量加载机制)
- [模型配置优先级](#模型配置优先级)
- [实际应用场景](#实际应用场景)
- [最佳实践](#最佳实践)

---

## 配置文件位置

Claude Code 使用分层配置文件系统，支持多个级别的配置：

### 1. 用户级配置（User Settings）

**位置**: `~/.claude/settings.json`

**作用范围**: 应用到所有项目

**用途**:
- 个人偏好设置
- 全局权限配置
- 全局环境变量
- 用户级 hooks

**示例**:
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

### 2. 项目级配置（Project Settings）

#### 共享配置（Shared Project Settings）

**位置**: `.claude/settings.json`（项目根目录）

**作用范围**: 当前项目，可提交到版本控制

**用途**:
- 团队共享的配置
- 项目特定的权限设置
- 项目级环境变量

#### 本地配置（Local Project Settings）

**位置**: `.claude/settings.local.json`（项目根目录）

**作用范围**: 当前项目，不提交到版本控制（自动被 git ignore）

**用途**:
- 个人实验性配置
- 本地开发环境特定设置
- 敏感信息（API keys）

### 3. 企业级配置（Enterprise Managed Settings）

**位置**（根据操作系统）:
- **macOS**: `/Library/Application Support/ClaudeCode/managed-settings.json`
- **Linux/WSL**: `/etc/claude-code/managed-settings.json`
- **Windows**: `C:\Program Files\ClaudeCode\managed-settings.json`

**作用范围**: 整个组织/企业

**用途**:
- 企业策略强制执行
- 统一的安全配置
- 组织级环境变量

### 4. 全局状态文件

**位置**: `~/.claude.json`

**内容**:
- 主题设置
- 通知设置
- OAuth 会话
- MCP 服务器配置
- 项目状态缓存

---

## 配置优先级

Claude Code 按照以下优先级顺序加载配置（**从高到低**）：

```
1. Enterprise policies（企业策略）
   ↓
2. Command line arguments（命令行参数）
   ↓
3. Local project settings（.claude/settings.local.json）
   ↓
4. Shared project settings（.claude/settings.json）
   ↓
5. User settings（~/.claude/settings.json）
```

**重要原则**:
- **高优先级覆盖低优先级**：企业策略 > 命令行 > 项目本地 > 项目共享 > 用户设置
- **合并机制**：低优先级的配置不会被完全覆盖，而是与高优先级配置合并
- **继承机制**：更具体的配置可以补充或覆盖更广泛的配置

---

## 环境变量加载机制

### 环境变量的来源

Claude Code 可以从以下来源读取环境变量：

1. **系统环境变量**（最高优先级）
   - 从当前 shell 会话读取（如 `~/.zshrc` 中设置的）
   - 从系统环境变量读取
   - 从父进程继承

2. **配置文件中的 `env` 字段**
   - `~/.claude/settings.json` 中的 `env` 字段
   - `.claude/settings.json` 中的 `env` 字段
   - `.claude/settings.local.json` 中的 `env` 字段
   - 企业配置中的 `env` 字段

### 环境变量优先级

```
系统环境变量（~/.zshrc 等）
  ↓
配置文件中的 env 字段（按配置优先级）
  ↓
默认值
```

**关键点**:
- **系统环境变量优先级最高**：如果 `~/.zshrc` 中设置了 `ANTHROPIC_BASE_URL`，它会覆盖 `settings.json` 中的值
- **配置文件中的 `env` 字段**：会在 Claude Code 启动时自动加载到进程环境变量中
- **合并机制**：如果系统环境变量未设置，则使用配置文件中的值

### 环境变量在 settings.json 中的格式

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "ANTHROPIC_MODEL": "anthropic/claude-sonnet-4.5",
    "API_TIMEOUT_MS": "600000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  }
}
```

**注意**:
- 所有值必须是字符串类型
- 布尔值应使用 `"1"` 或 `"0"` 表示
- 数值应使用字符串格式（如 `"600000"`）

---

## 模型配置优先级

模型配置有特殊的优先级顺序（**从高到低**）：

```
1. /model <alias|name>（会话中动态切换）
   ↓
2. claude --model <alias|name>（启动时命令行参数）
   ↓
3. ANTHROPIC_MODEL 环境变量（系统环境变量）
   ↓
4. settings.json 中的 model 字段
   ↓
5. settings.json 中的 env.ANTHROPIC_MODEL
   ↓
6. 默认模型
```

**示例**:

```bash
# 优先级 1: 会话中切换
claude
> /model anthropic/claude-opus-4.1

# 优先级 2: 启动时指定
claude --model anthropic/claude-opus-4.1

# 优先级 3: 环境变量
export ANTHROPIC_MODEL=anthropic/claude-opus-4.1
claude

# 优先级 4: settings.json 中的 model 字段
{
  "model": "anthropic/claude-opus-4.1"
}

# 优先级 5: settings.json 中的 env.ANTHROPIC_MODEL
{
  "env": {
    "ANTHROPIC_MODEL": "anthropic/claude-opus-4.1"
  }
}
```

---

## 实际应用场景

### 场景 1: 系统环境变量覆盖配置文件

**情况**:
- `~/.claude/settings.json` 中设置了 `ANTHROPIC_BASE_URL: "https://api.anthropic.com"`
- `~/.zshrc` 中设置了 `export ANTHROPIC_BASE_URL="https://cc.zhihuiapi.top"`

**结果**:
- **实际生效**: `https://cc.zhihuiapi.top`（系统环境变量优先级更高）

**验证**:
```bash
# 查看实际生效的配置
python scripts/claude_manager.py show-config
```

### 场景 2: 配置文件自动加载

**情况**:
- `~/.claude/settings.json` 中设置了环境变量
- 系统环境变量中未设置

**结果**:
- Claude Code 启动时自动从 `settings.json` 读取环境变量
- 这些变量会被加载到 Claude Code 进程的环境变量中

**工作流程**:
```
1. Claude Code 启动
2. 读取 ~/.claude/settings.json
3. 提取 env 字段中的环境变量
4. 将这些变量设置到进程环境变量中
5. 后续操作使用这些环境变量
```

### 场景 3: 项目级配置覆盖用户配置

**情况**:
- `~/.claude/settings.json` 中设置了 `ANTHROPIC_MODEL: "anthropic/claude-sonnet-4.5"`
- `.claude/settings.json`（项目级）中设置了 `ANTHROPIC_MODEL: "moonshotai/Kimi-K2-Thinking"`

**结果**:
- **实际生效**: `moonshotai/Kimi-K2-Thinking`（项目级配置优先级更高）

### 场景 4: 混合使用系统环境变量和配置文件

**推荐做法**:
- **敏感信息**（API keys）：存储在 `~/.claude/settings.json` 中，不提交到版本控制
- **非敏感配置**（Base URL、模型）：可以存储在配置文件中，也可以设置在 `~/.zshrc` 中
- **临时覆盖**：使用系统环境变量进行临时覆盖

**示例**:
```bash
# ~/.zshrc 中设置基础配置
export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"

# ~/.claude/settings.json 中设置 API key（敏感信息）
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx"
  }
}
```

---

## settings.json 和 ~/.zshrc 的关系

### 相同点

两者都可以设置环境变量：

**~/.zshrc**:
```bash
export ANTHROPIC_AUTH_TOKEN="sk-xxx"
export ANTHROPIC_BASE_URL="https://api.anthropic.com"
export ANTHROPIC_MODEL="anthropic/claude-sonnet-4.5"
```

**~/.claude/settings.json**:
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "ANTHROPIC_MODEL": "anthropic/claude-sonnet-4.5"
  }
}
```

### 不同点

| 特性 | ~/.zshrc | ~/.claude/settings.json |
|------|----------|------------------------|
| **作用范围** | 所有 shell 会话 | Claude Code 进程 |
| **加载时机** | Shell 启动时 | Claude Code 启动时 |
| **优先级** | 更高（系统环境变量） | 较低（配置文件） |
| **适用场景** | 需要所有程序都能访问 | 仅 Claude Code 使用 |
| **安全性** | 所有程序可见 | 仅 Claude Code 可见 |
| **版本控制** | 通常不提交 | 可以提交（不含敏感信息） |

### 优先级关系

```
系统环境变量（~/.zshrc）
  ↓ （优先级更高）
配置文件中的 env 字段（~/.claude/settings.json）
  ↓ （优先级较低）
默认值
```

**关键理解**:
- **如果 `~/.zshrc` 中设置了环境变量**，它会覆盖 `settings.json` 中的值
- **如果 `~/.zshrc` 中未设置**，Claude Code 会使用 `settings.json` 中的值
- **Claude Code 启动时会自动从 `settings.json` 加载环境变量**，但这些变量只对 Claude Code 进程有效

---

## 最佳实践

### 1. 配置管理策略

**推荐做法**:

```bash
# ~/.zshrc: 设置基础配置（可选）
export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"

# ~/.claude/settings.json: 存储完整配置（包括敏感信息）
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",  # 敏感信息，不放在 ~/.zshrc
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
    "ANTHROPIC_MODEL": "moonshotai/Kimi-K2-Thinking"
  }
}
```

**优势**:
- API key 等敏感信息只对 Claude Code 可见
- 配置集中管理，易于维护
- 可以版本控制（不含敏感信息）

### 2. 临时覆盖配置

如果需要临时使用不同的配置：

```bash
# 方法 1: 临时设置环境变量（仅当前会话）
export ANTHROPIC_MODEL="anthropic/claude-opus-4.1"
claude

# 方法 2: 在 Claude Code 会话中切换
claude
> /model anthropic/claude-opus-4.1
```

### 3. 项目级配置

对于团队项目，使用项目级配置：

```bash
# .claude/settings.json（提交到版本控制）
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
    "ANTHROPIC_MODEL": "moonshotai/Kimi-K2-Thinking"
  },
  "permissions": {
    "allow": ["Bash(npm:*)", "Read(**/*.ts)"]
  }
}

# .claude/settings.local.json（不提交，个人配置）
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-personal-key"
  }
}
```

### 4. 验证配置优先级

使用 `show-config` 命令查看实际生效的配置：

```bash
python scripts/claude_manager.py show-config
```

**输出示例**:
```
配置项详情
┏━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┳━━━━━━━━━━┓
┃ 配置项               ┃ 配置文件值   ┃ 环境变量值   ┃ 实际生效值   ┃ 优先级   ┃
┡━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━╇━━━━━━━━━━┩
│ ANTHROPIC_BASE_URL   │ https://ope… │ https://cc.… │ https://cc.… │ 环境变量 │
└──────────────────────┴──────────────┴──────────────┴──────────────┴──────────┘
```

---

## 配置加载流程图

```
Claude Code 启动
    ↓
读取配置文件（按优先级）
    ├─ Enterprise managed-settings.json（最高优先级）
    ├─ .claude/settings.local.json（项目本地）
    ├─ .claude/settings.json（项目共享）
    └─ ~/.claude/settings.json（用户设置）
    ↓
提取 env 字段中的环境变量
    ↓
合并到进程环境变量
    ├─ 系统环境变量（~/.zshrc 等）优先级最高
    ├─ 配置文件中的 env 字段作为补充
    └─ 如果系统环境变量未设置，使用配置文件中的值
    ↓
应用配置
    ├─ 环境变量生效
    ├─ 权限设置生效
    └─ 其他配置生效
```

---

## 常见问题

### Q1: 为什么修改了 settings.json 但配置没有生效？

**可能原因**:
1. 系统环境变量（`~/.zshrc`）中设置了相同的变量，优先级更高
2. 需要重新启动 Claude Code 才能加载新的配置
3. 配置文件格式错误或路径不正确

**解决方案**:
```bash
# 1. 检查系统环境变量
env | grep ANTHROPIC

# 2. 清除可能冲突的环境变量
unset ANTHROPIC_BASE_URL ANTHROPIC_MODEL

# 3. 重新启动 Claude Code
claude

# 4. 验证配置
python scripts/claude_manager.py show-config
```

### Q2: settings.json 和 ~/.zshrc 应该使用哪个？

**建议**:
- **敏感信息**（API keys）：使用 `settings.json`，不放在 `~/.zshrc`
- **基础配置**（Base URL、模型）：可以放在 `settings.json` 或 `~/.zshrc`
- **需要所有程序访问的配置**：使用 `~/.zshrc`
- **仅 Claude Code 使用的配置**：使用 `settings.json`

### Q3: 如何确保配置优先级正确？

**方法**:
1. 使用 `show-config` 命令查看实际生效的配置
2. 理解优先级顺序：系统环境变量 > 配置文件
3. 根据需要选择配置位置

---

## 总结

### 关键要点

1. **配置优先级**：系统环境变量（`~/.zshrc`）> 配置文件（`settings.json`）
2. **配置文件层次**：企业 > 项目本地 > 项目共享 > 用户
3. **环境变量加载**：Claude Code 启动时自动从 `settings.json` 的 `env` 字段加载
4. **合并机制**：配置会合并，高优先级覆盖低优先级
5. **模型配置**：有特殊的优先级顺序，会话中切换优先级最高

### 推荐配置方式

```bash
# ~/.zshrc: 可选的基础配置
export ANTHROPIC_BASE_URL="https://openrouter.ai/api/v1"

# ~/.claude/settings.json: 完整配置（包括敏感信息）
{
  "model": "moonshotai/Kimi-K2-Thinking",
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
    "ANTHROPIC_MODEL": "moonshotai/Kimi-K2-Thinking",
    "API_TIMEOUT_MS": "600000"
  }
}
```

---

## 参考文档

- [Claude Code Settings 官方文档](https://code.claude.com/docs/en/settings)
- [Claude Code Model Configuration](https://code.claude.com/docs/en/model-config)
- [Claude Code Troubleshooting](https://code.claude.com/docs/en/troubleshooting)



