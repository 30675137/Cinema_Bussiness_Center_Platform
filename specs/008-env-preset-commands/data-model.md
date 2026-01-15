# 数据模型：环境预设命令

**功能**: 008-env-preset-commands
**日期**: 2025-12-13
**版本**: 1.0

## 概述

本文档定义 cc-presets 工具的数据模型，包括配置文件结构、实体关系和验证规则。

## 核心实体

### 1. Configuration（配置根对象）

配置文件的根对象，包含所有预设和全局设置。

**存储位置**: `~/.config/cc-presets/config.json`

**结构**:
```json
{
  "version": "1.0",
  "presets": { ... },
  "settings": { ... }
}
```

**字段**:

| 字段 | 类型 | 必需 | 描述 | 验证规则 |
|------|------|------|------|----------|
| version | string | 是 | 配置文件格式版本 | 格式: "主版本.次版本" |
| presets | object | 是 | 预设集合（键为预设名） | 至少0个预设 |
| settings | object | 否 | 全局设置 | - |

**示例**:
```json
{
  "version": "1.0",
  "presets": {
    "claude": { ... },
    "glm": { ... }
  },
  "settings": {
    "active_preset": "claude",
    "mask_sensitive": true
  }
}
```

---

### 2. Preset（预设）

单个环境配置预设，包含环境变量和元数据。

**唯一标识**: 预设名称（presets 对象的键）

**结构**:
```json
{
  "env_vars": { ... },
  "metadata": { ... }
}
```

**字段**:

| 字段 | 类型 | 必需 | 描述 | 验证规则 |
|------|------|------|------|----------|
| env_vars | object | 是 | 环境变量键值对 | 至少1个变量 |
| metadata | object | 否 | 预设元数据 | - |

**名称规则**:
- 格式: `^[a-z][a-z0-9-]*$`
- 必须以小写字母开头
- 只能包含小写字母、数字、连字符
- 示例: `claude`, `glm`, `openai-gpt4`, `my-preset`

**示例**:
```json
"claude": {
  "env_vars": {
    "ANTHROPIC_API_KEY": "sk-ant-xxxxx",
    "ANTHROPIC_MODEL": "claude-3-sonnet-20240229",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
  },
  "metadata": {
    "created": "2025-12-13T10:30:00Z",
    "modified": "2025-12-13T10:30:00Z",
    "description": "Claude API configuration"
  }
}
```

---

### 3. EnvironmentVariables（环境变量集合）

预设中定义的环境变量集合。

**结构**: 键值对对象

**字段**:

| 键 | 类型 | 描述 | 验证规则 |
|----|------|------|----------|
| 变量名 | string | 环境变量名 | 格式: `^[A-Z_][A-Z0-9_]*$` |
| 变量值 | string | 环境变量值 | 非空字符串 |

**变量名规则**:
- 必须以大写字母或下划线开头
- 只能包含大写字母、数字、下划线
- 示例: `API_KEY`, `ANTHROPIC_MODEL`, `BASE_URL`

**敏感变量识别**:
变量名包含以下关键词时被视为敏感（需掩码显示）:
- `KEY`
- `TOKEN`
- `SECRET`
- `PASSWORD`
- `AUTH`

**示例**:
```json
{
  "ANTHROPIC_API_KEY": "sk-ant-xxxxx",
  "ANTHROPIC_MODEL": "claude-3-sonnet-20240229",
  "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
  "ANTHROPIC_TIMEOUT": "300"
}
```

---

### 4. Metadata（元数据）

预设的元数据信息，用于跟踪和描述。

**结构**:
```json
{
  "created": "2025-12-13T10:30:00Z",
  "modified": "2025-12-13T10:30:00Z",
  "description": "Optional description"
}
```

**字段**:

| 字段 | 类型 | 必需 | 描述 | 验证规则 |
|------|------|------|------|----------|
| created | string | 否 | 创建时间戳 | ISO 8601 格式 |
| modified | string | 否 | 最后修改时间戳 | ISO 8601 格式 |
| description | string | 否 | 预设描述 | 最多200字符 |

**时间戳格式**: ISO 8601 (UTC)
- 示例: `2025-12-13T10:30:00Z`
- 生成: `date -u +"%Y-%m-%dT%H:%M:%SZ"`

**示例**:
```json
{
  "created": "2025-12-13T10:30:00Z",
  "modified": "2025-12-13T14:20:15Z",
  "description": "Claude API configuration for production"
}
```

---

### 5. Settings（全局设置）

工具的全局配置选项。

**结构**:
```json
{
  "active_preset": "claude",
  "mask_sensitive": true
}
```

**字段**:

| 字段 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| active_preset | string or null | 否 | null | 当前激活的预设名 |
| mask_sensitive | boolean | 否 | true | 是否掩码敏感值 |

**active_preset 行为**:
- `null`: 无激活预设
- 字符串: 必须是 presets 中存在的预设名
- 激活预设时自动更新

**示例**:
```json
{
  "active_preset": "claude",
  "mask_sensitive": true
}
```

---

## 实体关系

```
Configuration (配置根对象)
├── version: string
├── presets: map<PresetName, Preset>
│   └── [preset-name]: Preset
│       ├── env_vars: map<VarName, VarValue>
│       │   └── [VAR_NAME]: string
│       └── metadata: Metadata
│           ├── created: ISO8601
│           ├── modified: ISO8601
│           └── description: string
└── settings: Settings
    ├── active_preset: PresetName | null
    └── mask_sensitive: boolean
```

**关系说明**:
1. Configuration 包含 0-N 个 Preset
2. 每个 Preset 包含 1-N 个 EnvironmentVariable
3. 每个 Preset 可选包含 Metadata
4. Settings.active_preset 引用 Preset 名称

---

## 验证规则

### 配置文件级别

1. **必需字段验证**:
   - `version` 字段必须存在且格式正确
   - `presets` 字段必须存在（可为空对象）

2. **版本兼容性**:
   - 当前工具版本: 1.0
   - 支持读取: 1.x
   - 不支持: 2.x 及以上（需迁移）

3. **文件完整性**:
   - 必须是有效的 JSON
   - 必须符合 JSON Schema
   - 文件权限必须为 600

### 预设级别

1. **名称验证**:
   ```python
   import re
   pattern = r'^[a-z][a-z0-9-]*$'
   valid_names = ['claude', 'glm', 'my-preset-1']
   invalid_names = ['Claude', '1-preset', 'my_preset', 'preset--name']
   ```

2. **环境变量验证**:
   - 至少包含1个环境变量
   - 变量名符合 `^[A-Z_][A-Z0-9_]*$`
   - 变量值非空

3. **元数据验证**:
   - `created` 和 `modified` 如果存在，必须是有效 ISO 8601 时间戳
   - `description` 不超过 200 字符

### 设置级别

1. **active_preset 验证**:
   - 如果不为 null，必须引用存在的预设
   - 删除预设时，如果是活动预设，将 active_preset 设为 null

2. **mask_sensitive 验证**:
   - 必须是布尔值（true 或 false）

---

## 数据操作

### 创建预设

**输入**:
```bash
cc-preset add <name> --api-key <key> --model <model> --base-url <url>
```

**数据转换**:
1. 验证预设名称格式
2. 检查名称是否已存在（可选覆盖）
3. 构建 Preset 对象:
   ```json
   {
     "env_vars": {
       "ANTHROPIC_API_KEY": "<key>",
       "ANTHROPIC_MODEL": "<model>",
       "ANTHROPIC_BASE_URL": "<url>"
     },
     "metadata": {
       "created": "<current-timestamp>",
       "modified": "<current-timestamp>"
     }
   }
   ```
4. 插入到 `presets` 对象
5. 原子写入配置文件

### 编辑预设

**输入**:
```bash
cc-preset edit <name> --model <new-model>
```

**数据转换**:
1. 验证预设存在
2. 读取现有 Preset 对象
3. 更新指定字段:
   ```json
   {
     "env_vars": {
       "ANTHROPIC_API_KEY": "<保持不变>",
       "ANTHROPIC_MODEL": "<new-model>",  // 更新
       "ANTHROPIC_BASE_URL": "<保持不变>"
     },
     "metadata": {
       "created": "<保持不变>",
       "modified": "<new-timestamp>"  // 更新
     }
   }
   ```
4. 原子写入配置文件

### 删除预设

**输入**:
```bash
cc-preset delete <name>
```

**数据转换**:
1. 验证预设存在
2. 如果是活动预设，设置 `settings.active_preset = null`
3. 从 `presets` 对象中删除键
4. 原子写入配置文件

### 激活预设

**输入**:
```bash
cc-<name>
```

**数据转换**:
1. 验证预设存在
2. 读取 `env_vars` 对象
3. 在 shell 中设置环境变量:
   ```bash
   export ANTHROPIC_API_KEY="<value>"
   export ANTHROPIC_MODEL="<value>"
   export ANTHROPIC_BASE_URL="<value>"
   ```
4. 设置跟踪变量:
   ```bash
   export _CC_ACTIVE_PRESET="<name>"
   export _CC_ACTIVE_VARS="ANTHROPIC_API_KEY,ANTHROPIC_MODEL,ANTHROPIC_BASE_URL"
   ```
5. 更新 `settings.active_preset = "<name>"`
6. 原子写入配置文件

---

## 存储实现

### 文件路径
- 配置目录: `~/.config/cc-presets/`
- 配置文件: `~/.config/cc-presets/config.json`
- 权限: `700`（目录）, `600`（文件）

### 原子写入模式
```bash
CONFIG_FILE="$HOME/.config/cc-presets/config.json"
TEMP_FILE="${CONFIG_FILE}.tmp.$$"

# 1. 写入临时文件
python3 -c "..." > "$TEMP_FILE"

# 2. 原子替换
mv "$TEMP_FILE" "$CONFIG_FILE"

# 3. 设置权限
chmod 600 "$CONFIG_FILE"
```

### 备份策略
不自动备份。建议用户：
1. 将配置目录加入到个人备份方案
2. 定期手动备份重要配置
3. 使用版本控制（排除敏感值）

---

## 数据迁移

### 版本 1.0 → 2.0（示例）

如果未来需要重大格式更改：

**检测**:
```bash
version=$(python3 -c "import json; print(json.load(open('config.json'))['version'])")
if [[ "$version" == "1."* ]]; then
    echo "需要迁移"
fi
```

**迁移脚本**:
```bash
cc-preset migrate --from 1.0 --to 2.0 --backup config.json.bak
```

**向后兼容**:
- 1.x 工具可读取 1.0 配置
- 2.x 工具可读取并自动迁移 1.x 配置

---

## 示例配置文件

### 最小配置
```json
{
  "version": "1.0",
  "presets": {}
}
```

### 单个预设
```json
{
  "version": "1.0",
  "presets": {
    "claude": {
      "env_vars": {
        "ANTHROPIC_API_KEY": "sk-ant-xxxxx",
        "ANTHROPIC_MODEL": "claude-3-sonnet-20240229",
        "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
      }
    }
  }
}
```

### 完整配置
```json
{
  "version": "1.0",
  "presets": {
    "claude": {
      "env_vars": {
        "ANTHROPIC_API_KEY": "sk-ant-xxxxx",
        "ANTHROPIC_MODEL": "claude-3-sonnet-20240229",
        "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
      },
      "metadata": {
        "created": "2025-12-13T10:30:00Z",
        "modified": "2025-12-13T10:30:00Z",
        "description": "Claude API production config"
      }
    },
    "glm": {
      "env_vars": {
        "ANTHROPIC_AUTH_TOKEN": "f40832ea44204eb9a91ae1751f70eac6.mPvF5krl5N7wsEqq",
        "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
        "ANTHROPIC_SMALL_FAST_MODEL": "GLM-4.6",
        "ANTHROPIC_MODEL": "GLM-4.6"
      },
      "metadata": {
        "created": "2025-12-13T11:00:00Z",
        "modified": "2025-12-13T11:00:00Z",
        "description": "GLM-4.6 via BigModel API"
      }
    }
  },
  "settings": {
    "active_preset": "claude",
    "mask_sensitive": true
  }
}
```

---

## 错误处理

### 配置文件不存在
- 行为: 自动创建最小配置
- 位置: `~/.config/cc-presets/config.json`
- 内容: `{"version": "1.0", "presets": {}}`

### JSON 解析错误
- 检测: 使用 python3 json.load()
- 错误消息: 显示文件路径和错误行号
- 恢复: 建议从备份恢复或删除重建

### Schema 验证失败
- 检测: 检查必需字段和格式
- 错误消息: 具体说明哪个字段违反规则
- 恢复: 提示手动编辑或使用命令重建

### 权限错误
- 检测: 文件权限不是 600
- 行为: 警告并自动修复（chmod 600）
- 安全: 拒绝读取权限过于开放的配置文件

---

## 性能考虑

### 读取性能
- 小文件（< 10KB）: 解析时间 < 50ms
- 中文件（10-100KB）: 解析时间 < 100ms
- 大文件（> 100KB）: 不预期（最多10个预设 ≈ 5KB）

### 写入性能
- 原子写入开销: < 10ms
- 完整配置更新: < 100ms
- 瓶颈: 磁盘 I/O（SSD 可忽略）

### 缓存策略
不实现缓存，因为：
1. 文件很小，读取快
2. 单用户使用，无并发
3. 简化实现，避免缓存一致性问题

---

## 安全考虑

### 文件权限
- 配置目录: `drwx------` (700)
- 配置文件: `-rw-------` (600)
- 验证: 每次读写时检查

### 敏感数据处理
- 存储: 明文（依赖文件权限保护）
- 显示: 默认掩码（前4字符 + `****`）
- 传输: 不涉及网络传输

### 注入防护
- JSON 解析: 使用 python json 模块（安全）
- Shell 变量: 使用引号和转义防止注入
- 命令执行: 不使用 eval

---

## 测试数据

### 单元测试 fixtures
位于: `tests/fixtures/configs/`

**valid-minimal.json**:
```json
{"version": "1.0", "presets": {}}
```

**valid-full.json**:
```json
{
  "version": "1.0",
  "presets": {
    "test": {
      "env_vars": {"TEST_VAR": "value"}
    }
  }
}
```

**invalid-version.json**:
```json
{"version": "2.0", "presets": {}}
```

**invalid-schema.json**:
```json
{"presets": {}}
```

---

## 参考

- JSON Schema: [config-schema.json](./contracts/config-schema.json)
- CLI 接口: [cli-interface.md](./contracts/cli-interface.md)
- 快速入门: [quickstart.md](./quickstart.md)
