# Claude Code 定制模型设置指南

> 基于 Context7 官方文档和项目代码，梳理 Claude Code 如何设置定制模型（非官方模型）的完整方案

**创建日期**: 2025-12-14  
**参考来源**: Context7 Claude Code 文档、项目代码分析

---

## 概述

Claude Code 支持通过多种方式配置模型，包括官方 Anthropic 模型和第三方定制模型（如 `moonshotai/Kimi-K2-Thinking`、`GLM-4.6` 等）。本文档详细说明如何设置定制模型。

## 核心环境变量

### 必需变量

#### 1. `ANTHROPIC_MODEL` - 模型标识符

**用途**: 指定 Claude Code 使用的模型名称

**格式**: 
- 官方模型：`anthropic/claude-sonnet-4.5`、`claude-3-opus-20240229`
- 定制模型：`moonshotai/Kimi-K2-Thinking`、`GLM-4.6`
- 模型别名：`opus`、`sonnet`、`haiku`

**示例**:
```bash
export ANTHROPIC_MODEL=moonshotai/Kimi-K2-Thinking
export ANTHROPIC_MODEL=anthropic/claude-sonnet-4.5
export ANTHROPIC_MODEL=opus  # 使用别名
```

#### 2. `ANTHROPIC_BASE_URL` - API 基础 URL

**用途**: 指向自定义 API 服务端点（非官方 Anthropic API）

**格式**: 完整的 API 端点 URL

**示例**:
```bash
export ANTHROPIC_BASE_URL=https://cc.zhihuiapi.top
export ANTHROPIC_BASE_URL=https://openrouter.ai/api/v1
export ANTHROPIC_BASE_URL=https://api.anthropic.com  # 官方 API
```

#### 3. `ANTHROPIC_AUTH_TOKEN` 或 `ANTHROPIC_API_KEY` - API 密钥

**用途**: 认证到 API 服务

**格式**: API 密钥字符串

**示例**:
```bash
export ANTHROPIC_AUTH_TOKEN=sk-xxx
export ANTHROPIC_API_KEY=sk-ant-xxx
```

**注意**: 
- `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_API_KEY` 功能相同，使用其中一个即可
- 某些服务可能只支持其中一种

### 可选变量

#### `ANTHROPIC_SMALL_FAST_MODEL` - 小型快速模型

**用途**: 指定用于快速任务的小型模型（某些场景下使用）

**示例**:
```bash
export ANTHROPIC_SMALL_FAST_MODEL=claude-3-haiku-20240307
```

#### `API_TIMEOUT_MS` - API 超时时间

**用途**: 设置 API 请求超时时间（毫秒）

**示例**:
```bash
export API_TIMEOUT_MS=600000  # 10 分钟
```

#### `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` - 禁用非必要流量

**用途**: 禁用非必要的网络流量（0/1）

**示例**:
```bash
export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
```

---

## 设置方式（优先级从高到低）

### 1. 会话中动态切换（最高优先级）

在 Claude Code 交互式会话中使用 `/model` 命令：

```
/model moonshotai/Kimi-K2-Thinking
```

**特点**:
- 仅对当前会话有效
- 优先级最高，会覆盖其他配置
- 适合临时测试不同模型

### 2. 命令行参数

启动 Claude Code 时指定模型：

```bash
claude --model moonshotai/Kimi-K2-Thinking
```

**特点**:
- 仅对本次启动有效
- 优先级高于环境变量和配置文件
- 适合单次使用特定模型

### 3. 环境变量（当前会话）

在当前 shell 会话中设置：

```bash
export ANTHROPIC_MODEL=moonshotai/Kimi-K2-Thinking
export ANTHROPIC_BASE_URL=https://cc.zhihuiapi.top
export ANTHROPIC_AUTH_TOKEN=sk-xxx
```

**特点**:
- 仅对当前终端会话有效
- 关闭终端后失效
- 适合临时配置

### 4. Shell 配置文件（持久化到终端）

**位置**: `~/.zshrc` 或 `~/.zshenv`

**内容**:
```bash
export ANTHROPIC_MODEL=moonshotai/Kimi-K2-Thinking
export ANTHROPIC_BASE_URL=https://cc.zhihuiapi.top
export ANTHROPIC_AUTH_TOKEN=sk-xxx
```

**使用项目脚本设置**:
```bash
# 从 JSON 文件读取并同步到 shell 配置
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell

# 重新加载配置
source ~/.zshrc
```

**特点**:
- 所有新打开的终端都会自动加载
- 需要 `source ~/.zshrc` 或重启终端使当前会话生效
- 适合需要环境变量的场景

### 5. Claude 配置文件（持久化到 Claude Code）

**位置**: `~/.claude/settings.json`

**格式**:
```json
{
  "env": {
    "ANTHROPIC_MODEL": "moonshotai/Kimi-K2-Thinking",
    "ANTHROPIC_BASE_URL": "https://cc.zhihuiapi.top",
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "API_TIMEOUT_MS": "600000"
  },
  "model": "moonshotai/Kimi-K2-Thinking",
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

**使用项目脚本设置**:
```bash
# 仅保存到 Claude 配置文件
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json

# 或使用命令行参数
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_MODEL=moonshotai/Kimi-K2-Thinking \
  --env ANTHROPIC_BASE_URL=https://cc.zhihuiapi.top
```

**特点**:
- Claude Code 自动读取
- 优先级低于命令行参数和环境变量
- 适合作为默认配置

---

## 项目中的实现

### 配置文件位置

- **项目配置模板**: `scripts/config/claude/settings.json`
- **实际配置文件**: `~/.claude/settings.json`（由脚本自动创建/更新）

### 相关脚本命令

#### 1. `set-config` - 设置完整配置

```bash
# 从 JSON 文件读取配置
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json

# 从 JSON 文件读取并同步到 shell 配置
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell

# 使用命令行参数（覆盖 JSON 文件中的值）
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --env ANTHROPIC_MODEL=anthropic/claude-sonnet-4.5
```

#### 2. `set-api-key` - 仅设置 API key

```bash
# 交互式设置
python scripts/claude_manager.py set-api-key

# 直接提供 API key
python scripts/claude_manager.py set-api-key sk-xxx

# 指定配置文件路径
python scripts/claude_manager.py set-api-key sk-xxx --config-file ~/.zshrc
```

### 配置优先级

当同时使用多种配置方式时，优先级如下（从高到低）：

1. **会话中 `/model` 命令** - 最高优先级
2. **命令行 `--model` 参数**
3. **环境变量 `ANTHROPIC_MODEL`**（当前会话）
4. **`~/.claude/settings.json` 中的 `model` 字段**
5. **`~/.claude/settings.json` 中的 `env.ANTHROPIC_MODEL`**
6. **Shell 配置文件中的环境变量**（`~/.zshrc` 等）

---

## 定制模型配置示例

### 示例 1：使用 OpenRouter 兼容 API

```json
{
  "env": {
    "ANTHROPIC_MODEL": "moonshotai/Kimi-K2-Thinking",
    "ANTHROPIC_BASE_URL": "https://openrouter.ai/api/v1",
    "ANTHROPIC_AUTH_TOKEN": "sk-or-v1-xxx"
  }
}
```

**设置命令**:
```bash
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_MODEL=moonshotai/Kimi-K2-Thinking \
  --env ANTHROPIC_BASE_URL=https://openrouter.ai/api/v1 \
  --env ANTHROPIC_AUTH_TOKEN=sk-or-v1-xxx \
  --to-shell
```

### 示例 2：使用自定义 API 网关

```json
{
  "env": {
    "ANTHROPIC_MODEL": "anthropic/claude-sonnet-4.5",
    "ANTHROPIC_BASE_URL": "https://cc.zhihuiapi.top",
    "ANTHROPIC_AUTH_TOKEN": "sk-xxx",
    "API_TIMEOUT_MS": "600000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  }
}
```

**设置命令**:
```bash
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell
```

### 示例 3：使用 LiteLLM 网关

```bash
export ANTHROPIC_BASE_URL=https://litellm-server:4000
export ANTHROPIC_MODEL=custom-model-name
export ANTHROPIC_AUTH_TOKEN=sk-xxx
```

### 示例 4：使用 AWS Bedrock

```bash
export ANTHROPIC_MODEL='global.anthropic.claude-sonnet-4-5-20250929-v1:0'
export ANTHROPIC_SMALL_FAST_MODEL='us.anthropic.claude-haiku-4-5-20251001-v1:0'
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=us-east-1
```

### 示例 5：使用 Google Vertex AI

```bash
export CLAUDE_CODE_USE_VERTEX=1
export CLOUD_ML_REGION=global
export ANTHROPIC_VERTEX_PROJECT_ID=YOUR-PROJECT-ID
export ANTHROPIC_MODEL=claude-3-5-sonnet@20241022
```

---

## 验证配置

### 方法 1：在 Claude Code 会话中检查

```
/status
```

**输出示例**:
```
Model: moonshotai/Kimi-K2-Thinking
Base URL: https://cc.zhihuiapi.top
...
```

### 方法 2：检查环境变量

```bash
# 检查所有 ANTHROPIC 相关环境变量
env | grep ANTHROPIC

# 检查特定变量
echo $ANTHROPIC_MODEL
echo $ANTHROPIC_BASE_URL
```

### 方法 3：检查配置文件

```bash
# 查看 Claude 配置文件
cat ~/.claude/settings.json | jq '.env.ANTHROPIC_MODEL'
cat ~/.claude/settings.json | jq '.model'

# 查看 shell 配置文件
grep ANTHROPIC_MODEL ~/.zshrc
```

### 方法 4：使用项目脚本验证

```bash
# 查看当前配置
python scripts/claude_manager.py set-config --json-file scripts/config/claude/settings.json --dry-run
```

---

## 常见问题排查

### 问题 1：模型未找到（model_not_found）

**错误信息**:
```
model_not_found: 分组 Vip月卡 下模型 moonshotai/Kimi-K2-Thinking 无可用渠道（distributor）
```

**可能原因**:
1. `ANTHROPIC_MODEL` 设置的模型名称与 API 服务不匹配
2. `ANTHROPIC_BASE_URL` 指向的服务不支持该模型
3. API 服务配置错误或模型不可用

**排查步骤**:
1. 确认 API 服务支持的模型列表
2. 验证模型标识符是否正确（注意大小写和格式）
3. 检查 `ANTHROPIC_BASE_URL` 是否正确
4. 测试 API 连接：`curl -H "Authorization: Bearer $ANTHROPIC_AUTH_TOKEN" $ANTHROPIC_BASE_URL/v1/models`

**解决方案**:
```bash
# 1. 清除错误的模型设置
unset ANTHROPIC_MODEL

# 2. 设置正确的模型
export ANTHROPIC_MODEL=anthropic/claude-sonnet-4.5

# 3. 或使用配置文件
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_MODEL=anthropic/claude-sonnet-4.5 \
  --to-shell

# 4. 重新加载配置
source ~/.zshrc
```

### 问题 2：配置不生效

**可能原因**:
1. 环境变量优先级冲突
2. 配置文件格式错误
3. Shell 配置未重新加载
4. 多个配置源设置了不同的值

**排查步骤**:
1. 检查所有配置源：
   ```bash
   # 检查环境变量
   env | grep ANTHROPIC_MODEL
   
   # 检查配置文件
   cat ~/.claude/settings.json | jq '.env.ANTHROPIC_MODEL, .model'
   
   # 检查 shell 配置
   grep ANTHROPIC_MODEL ~/.zshrc
   ```

2. 清除冲突的配置：
   ```bash
   # 清除会话环境变量
   unset ANTHROPIC_MODEL
   
   # 重新加载 shell 配置
   source ~/.zshrc
   ```

3. 验证配置优先级：
   - 会话中 `/model` 命令 > 命令行参数 > 环境变量 > 配置文件

### 问题 3：API 认证失败

**错误信息**:
```
Unauthorized
TokenStatusExhausted
```

**可能原因**:
1. API key 已过期或无效
2. 使用了错误的 API key
3. API key 格式不正确

**解决方案**:
```bash
# 1. 更新 API key
python scripts/claude_manager.py set-api-key sk-new-token

# 2. 或使用 set-config
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_AUTH_TOKEN=sk-new-token \
  --to-shell

# 3. 清除旧的环境变量
unset ANTHROPIC_AUTH_TOKEN
unset ANTHROPIC_API_KEY

# 4. 重新加载
source ~/.zshrc
```

### 问题 4：Base URL 配置错误

**错误信息**:
```
Unable to connect to Anthropic services
Connection refused
```

**排查步骤**:
1. 验证 URL 是否可访问：
   ```bash
   curl -I https://cc.zhihuiapi.top
   ```

2. 检查 URL 格式是否正确（应包含协议 `https://`）

3. 确认是否需要路径后缀（如 `/api/v1`）

**解决方案**:
```bash
# 更新 Base URL
python scripts/claude_manager.py set-config \
  --env ANTHROPIC_BASE_URL=https://correct-api-url.com \
  --to-shell
```

---

## 最佳实践

### 1. 使用配置文件管理

**推荐**: 优先使用 `~/.claude/settings.json` 进行持久化配置

**优势**:
- Claude Code 自动读取
- 不污染 shell 环境
- 易于版本控制和备份

**示例**:
```bash
# 创建项目配置模板
cp scripts/config/claude/settings.json ~/.claude/settings.json

# 使用脚本更新
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json
```

### 2. 项目级配置模板

**推荐**: 在项目根目录创建 `scripts/config/claude/settings.json` 作为模板

**优势**:
- 团队成员可以共享配置
- 版本控制配置模板（不包含真实 API key）
- 快速设置新环境

**示例**:
```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.example.com",
    "API_TIMEOUT_MS": "600000"
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

### 3. 环境隔离

**推荐**: 不同项目使用不同的配置

**方法**:
- 项目级：`.claude/settings.json`（项目根目录）
- 用户级：`~/.claude/settings.json`
- 本地级：`.claude/settings.local.json`（不提交到 Git）

**优先级**: 本地 > 项目 > 用户

### 4. 安全实践

**重要**: 
- ❌ **不要**将包含真实 API key 的配置文件提交到 Git
- ✅ **使用** `.gitignore` 排除敏感配置文件
- ✅ **使用** `.claude/settings.local.json` 存储本地配置
- ✅ **定期**轮换 API key

**`.gitignore` 配置**:
```
.claude/settings.local.json
.claude/settings.json
*.env
```

### 5. 验证配置

**推荐**: 设置后立即验证

```bash
# 1. 检查配置文件
cat ~/.claude/settings.json | jq '.'

# 2. 检查环境变量
env | grep ANTHROPIC

# 3. 在 Claude Code 中验证
claude
# 然后输入: /status
```

### 6. 使用脚本自动化

**推荐**: 使用项目提供的脚本管理配置

```bash
# 快速设置完整配置
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell

# 仅更新 API key
python scripts/claude_manager.py set-api-key sk-xxx

# 预览配置（不实际修改）
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --dry-run
```

---

## 配置优先级总结

```
会话中 /model 命令
    ↓ (最高优先级)
命令行 --model 参数
    ↓
环境变量 ANTHROPIC_MODEL (当前会话)
    ↓
~/.claude/settings.json 中的 model 字段
    ↓
~/.claude/settings.json 中的 env.ANTHROPIC_MODEL
    ↓
Shell 配置文件 (~/.zshrc) 中的环境变量
    ↓ (最低优先级)
默认模型
```

---

## 相关文件

### 项目文件

- `scripts/config/claude/settings.json` - 项目配置模板
- `scripts/claude_manager.py` - 配置管理脚本
- `scripts/commands/set_config.py` - 配置设置命令实现
- `scripts/core/config_manager.py` - 配置管理核心模块
- `scripts/core/env_manager.py` - 环境变量管理模块
- `scripts/README.md` - 脚本使用文档

### 系统文件

- `~/.claude/settings.json` - Claude Code 用户配置文件
- `~/.claude/settings.local.json` - Claude Code 本地配置文件（不提交 Git）
- `~/.zshrc` - zsh shell 配置文件
- `~/.zshenv` - zsh 环境变量配置文件

---

## 参考资源

### 官方文档

- [Claude Code 模型配置](https://code.claude.com/docs/en/model-config)
- [Claude Code 设置文档](https://code.claude.com/docs/en/settings)
- [Claude Code CLI 参考](https://code.claude.com/docs/en/cli-reference)

### 项目文档

- `docs/运维文档/Claude安装脚本使用指南.md` - 安装和配置指南
- `scripts/CLAUDE_FULL_WORKFLOW.md` - 完整工作流程
- `scripts/README.md` - 脚本使用说明

---

## 更新日志

- **2025-12-14**: 初始版本，基于 Context7 文档和项目代码分析

---

## 附录：快速参考

### 常用命令

```bash
# 设置完整配置（从 JSON 文件）
python scripts/claude_manager.py set-config \
  --json-file scripts/config/claude/settings.json \
  --to-shell

# 仅设置 API key
python scripts/claude_manager.py set-api-key sk-xxx

# 检查当前配置
cat ~/.claude/settings.json | jq '.env'

# 清除会话环境变量
unset ANTHROPIC_MODEL ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN

# 重新加载 shell 配置
source ~/.zshrc
```

### 常用模型标识符

- `anthropic/claude-sonnet-4.5` - Claude Sonnet 4.5
- `anthropic/claude-opus-4.1` - Claude Opus 4.1
- `anthropic/claude-haiku-4.5` - Claude Haiku 4.5
- `moonshotai/Kimi-K2-Thinking` - Moonshot Kimi K2
- `GLM-4.6` - GLM 4.6
- `opus` - Opus 别名
- `sonnet` - Sonnet 别名
- `haiku` - Haiku 别名

