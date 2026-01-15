# 技术研究：环境预设命令

**功能**: 008-env-preset-commands
**日期**: 2025-12-13
**目的**: 解决实施计划中标记的技术决策点

## 研究决策

### 1. JSON 解析方案

**决策**: 使用 macOS 自带的 python3 进行 JSON 解析

**理由**:
- **可用性**: macOS 自带 python3（10.15+ 默认安装），无需用户额外安装
- **性能**: 对于我们的规模（3-10个预设，每个3-10个字段），python3 JSON 解析足够快（< 100ms）
- **可靠性**: Python json 模块成熟稳定，处理边界情况良好
- **可维护性**: 单行 python 命令易于在 shell 脚本中使用

**实现示例**:
```bash
# 读取 JSON 字段
get_json_value() {
    local file="$1"
    local key="$2"
    python3 -c "import json; print(json.load(open('$file'))['$key'])"
}

# 写入 JSON（完整更新）
write_json() {
    local file="$1"
    local content="$2"
    python3 -c "import json; json.dump($content, open('$file', 'w'), indent=2)"
}
```

**替代方案考虑**:
- **jq**: 更强大但需要额外安装（`brew install jq`），增加用户负担
- **原生 bash**: 解析不可靠，易出错，维护困难
- **选择标准**: 零依赖 > 性能（对于小规模数据）

---

### 2. Shell 函数加载机制

**决策**: 使用 `source` 命令加载 shell 函数库

**理由**:
- **安全性**: `source` 在当前 shell 上下文执行，可以修改环境变量
- **兼容性**: bash 和 zsh 都支持 `source`（zsh 也支持 `.` 别名）
- **性能**: source 加载时间 < 50ms，符合性能要求
- **可靠性**: 标准做法，成熟稳定

**安装机制**:
1. 将 shell 函数库放置在 `~/.config/cc-presets/functions.sh`
2. 在 `~/.zshrc` 或 `~/.bash_profile` 中添加：
   ```bash
   # CC-Presets Environment Manager
   if [ -f "$HOME/.config/cc-presets/functions.sh" ]; then
       source "$HOME/.config/cc-presets/functions.sh"
   fi
   ```

**激活命令实现**:
```bash
# 在 functions.sh 中定义
cc-claude() {
    _cc_activate "claude"
}

cc-openai() {
    _cc_activate "openai"
}

# 通用激活函数
_cc_activate() {
    local preset_name="$1"
    # 从 JSON 读取配置并设置环境变量
    # ...
}
```

**替代方案考虑**:
- **eval**: 不安全，容易导致代码注入
- **alias**: 无法执行复杂逻辑，仅适合简单命令
- **选择标准**: 安全性 > 功能性 > 简洁性

---

### 3. 配置文件管理最佳实践

**决策**: 使用简单的 JSON 结构 + 原子写入

**JSON 结构**:
```json
{
  "version": "1.0",
  "presets": {
    "claude": {
      "env_vars": {
        "ANTHROPIC_API_KEY": "sk-xxx",
        "ANTHROPIC_MODEL": "claude-3-sonnet",
        "ANTHROPIC_BASE_URL": "https://api.anthropic.com"
      },
      "metadata": {
        "created": "2025-12-13T10:30:00Z",
        "modified": "2025-12-13T10:30:00Z"
      }
    }
  },
  "settings": {
    "active_preset": "claude",
    "mask_sensitive": true
  }
}
```

**原子写入策略**:
```bash
# 写入新配置时使用临时文件 + mv
update_config() {
    local config_file="$HOME/.config/cc-presets/config.json"
    local temp_file="${config_file}.tmp.$$"

    # 写入临时文件
    python3 -c "..." > "$temp_file"

    # 原子替换
    mv "$temp_file" "$config_file"
    chmod 600 "$config_file"
}
```

**文件锁定**:
对于单用户场景，不实现复杂的文件锁。原子 mv 操作已足够防止文件损坏。

**理由**:
- **简洁性**: 扁平的两层结构（presets + settings）易于理解和维护
- **可扩展性**: version 字段支持未来格式升级
- **安全性**: 原子写入防止部分写入导致的文件损坏
- **权限**: chmod 600 确保仅用户可读写

**替代方案考虑**:
- **SQLite**: 过度工程，增加复杂度
- **YAML**: 需要额外解析器
- **INI**: 不支持嵌套结构
- **选择标准**: 简洁性 > 功能丰富度

---

### 4. Shell 环境变量管理

**决策**: 使用变量名前缀跟踪 + 显式清理

**跟踪机制**:
```bash
# 激活预设时记录设置的变量
_cc_activate() {
    local preset_name="$1"

    # 清理之前的变量（如果有）
    _cc_cleanup_env

    # 读取新预设并设置变量
    # ...设置 ANTHROPIC_API_KEY 等...

    # 记录当前激活的预设和变量列表
    export _CC_ACTIVE_PRESET="$preset_name"
    export _CC_ACTIVE_VARS="ANTHROPIC_API_KEY,ANTHROPIC_MODEL,ANTHROPIC_BASE_URL"
}

# 清理环境变量
_cc_cleanup_env() {
    if [ -n "$_CC_ACTIVE_VARS" ]; then
        IFS=',' read -ra vars <<< "$_CC_ACTIVE_VARS"
        for var in "${vars[@]}"; do
            unset "$var"
        done
    fi
    unset _CC_ACTIVE_PRESET
    unset _CC_ACTIVE_VARS
}
```

**变量名冲突策略**:
1. 使用预设中配置的确切变量名（用户负责）
2. 切换预设时，清理之前的变量
3. 在 `cc-preset status` 中显示当前活动的变量

**理由**:
- **清晰性**: 用户明确知道哪些变量被设置
- **灵活性**: 支持任意环境变量名称
- **可预测性**: 切换行为明确（清理旧的，设置新的）

**替代方案考虑**:
- **变量名前缀**: 限制灵活性（如强制 CC_*）
- **不清理旧变量**: 可能导致冲突和混乱
- **选择标准**: 用户控制 > 自动化假设

---

### 5. 错误处理和用户反馈

**决策**: 使用结构化错误消息 + 退出码

**错误处理模式**:
```bash
# 错误消息辅助函数
error() {
    echo "ERROR: $*" >&2
}

warn() {
    echo "WARNING: $*" >&2
}

info() {
    echo "INFO: $*"
}

success() {
    echo "✓ $*"
}

# 使用示例
cc_preset_add() {
    local name="$1"

    # 参数验证
    if [ -z "$name" ]; then
        error "Preset name is required"
        echo "Usage: cc-preset add <name> --api-key <key> --model <model> --base-url <url>"
        return 1
    fi

    # 冲突检查
    if preset_exists "$name"; then
        warn "Preset '$name' already exists"
        read -p "Overwrite? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Operation cancelled"
            return 0
        fi
    fi

    # 执行操作
    if create_preset "$name" "$@"; then
        success "Preset '$name' created successfully"
        info "Activate with: cc-$name"
        return 0
    else
        error "Failed to create preset '$name'"
        return 1
    fi
}
```

**退出码约定**:
- 0: 成功
- 1: 用户输入错误（参数缺失、格式错误）
- 2: 系统错误（文件权限、JSON 解析失败）
- 3: 逻辑错误（预设不存在、配置损坏）

**用户友好特性**:
1. **彩色输出**（可选）: 使用 ANSI 颜色码区分错误/警告/成功
2. **使用提示**: 错误消息后显示正确用法示例
3. **确认提示**: 危险操作（删除、覆盖）需要确认
4. **进度反馈**: 长时间操作显示进度

**理由**:
- **可调试性**: 清晰的错误消息帮助用户快速定位问题
- **专业性**: 结构化输出符合 CLI 工具最佳实践
- **用户体验**: 友好的提示和确认减少误操作

**替代方案考虑**:
- **静默失败**: 用户体验差，难以调试
- **详细调试日志**: 对普通用户过于复杂
- **选择标准**: 用户友好性 > 简洁性

---

## 技术栈总结

### 核心技术

| 组件 | 技术选择 | 版本要求 |
|------|---------|---------|
| Shell | bash/zsh | bash 3.2+, zsh 5.8+ |
| JSON 解析 | python3 | macOS 自带（3.8+） |
| 配置存储 | JSON 文件 | N/A |
| 安装方式 | shell RC 文件 | ~/.zshrc, ~/.bash_profile |

### 性能评估

| 操作 | 预期时间 | 要求 | 状态 |
|------|---------|------|------|
| 预设激活 | < 200ms | < 5s | ✅ |
| 列表显示 | < 100ms | < 3s | ✅ |
| 创建预设 | < 500ms | < 60s | ✅ |
| JSON 解析 | < 50ms | N/A | ✅ |

### 依赖项

**必需** (macOS 自带):
- bash 或 zsh
- python3
- 标准 Unix 工具（mv, chmod, mkdir）

**可选**:
- jq（如果用户偏好，但不强制）
- ANSI 颜色支持（终端）

### 风险与缓解

| 风险 | 影响 | 缓解策略 |
|------|------|---------|
| JSON 文件损坏 | 配置丢失 | 原子写入 + 备份建议 |
| 并发写入 | 数据不一致 | 单用户场景风险低 |
| shell 不兼容 | 功能失效 | 仅支持 bash/zsh，文档明确 |
| python3 缺失 | 无法运行 | macOS 10.15+ 默认包含 |

---

## 下一步

此研究文档解决了实施计划中的所有 "NEEDS CLARIFICATION" 决策点。下一步将进入 Phase 1，生成：

1. **data-model.md**: 详细的 JSON 配置结构和数据模型
2. **contracts/config-schema.json**: JSON Schema 验证规则
3. **quickstart.md**: 用户快速入门指南

所有技术选择基于：
- ✅ 零额外依赖（使用 macOS 自带工具）
- ✅ 简洁性优先（避免过度工程）
- ✅ 用户友好（清晰错误消息，确认提示）
- ✅ 性能达标（所有操作 < 5 秒）
