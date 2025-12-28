# 实施计划：环境预设命令

**分支**: `008-env-preset-commands` | **日期**: 2025-12-13 | **规格**: [spec.md](./spec.md)
**输入**: 功能规格来自 `/specs/008-env-preset-commands/spec.md`

**注意**: 此模板由 `/speckit.plan` 命令填充。查看 `.specify/templates/commands/plan.md` 了解执行工作流程。

## 摘要

实现一个基于 shell 函数的环境预设管理工具，允许 macOS 用户使用简单命令（如 `cc-claude`）快速切换不同 AI 服务提供商的 API 配置。工具通过从 JSON 配置文件读取预设并设置环境变量来工作，同时提供 `cc-preset` 命令及其子命令（add/edit/delete/list）进行配置管理。所有敏感凭证通过文件权限和 .gitignore 保护。

## 技术上下文

**语言/版本**: Shell Script (bash/zsh) - macOS 自带
**主要依赖项**:
- JSON 解析：macOS 自带 python3 或 jq（可选）
- Shell 函数：bash 3.2+ 或 zsh 5.8+（macOS 默认版本）

**存储**: JSON 配置文件（~/.config/cc-presets/config.json）
**测试**: Bash 单元测试（使用 bats-core 或手动测试脚本）
**目标平台**: macOS（仅支持 bash 和 zsh）
**项目类型**: 单一项目（命令行工具）
**性能目标**:
- 预设激活时间 < 5 秒
- 配置列表显示 < 3 秒
- 预设创建时间 < 60 秒

**约束条件**:
- 仅使用 macOS 自带工具（无需额外安装依赖）
- 文件权限必须为 600（仅用户可读写）
- 不干扰现有环境变量
- Shell 函数必须能修改当前 shell 环境（非子进程）

**规模/范围**:
- 支持 3-10 个预设配置
- 每个预设 3-10 个环境变量
- 单用户使用场景

## 宪法检查

*门禁：必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。*

**状态**: ✅ 通过

**说明**: 项目宪法文件为模板状态，尚未为此项目定制。基于一般最佳实践评估：

- ✅ **简洁性原则**: 工具设计简单，仅做环境变量管理一件事
- ✅ **可测试性**: Shell 函数可独立测试，配置管理命令输出可验证
- ✅ **可观察性**: 所有操作输出清晰错误消息，易于调试
- ✅ **无过度工程**: 使用简单的 JSON + shell 函数，避免复杂框架
- ✅ **平台特定优化**: 专注 macOS，利用系统自带工具

**无需复杂度豁免**: 此工具属于简单脚本工具类别，不引入复杂架构模式。

## 项目结构

### 文档（此功能）

```text
specs/008-env-preset-commands/
├── spec.md              # 功能规格说明
├── plan.md              # 此文件（/speckit.plan 命令输出）
├── research.md          # Phase 0 输出（/speckit.plan 命令）
├── data-model.md        # Phase 1 输出（/speckit.plan 命令）
├── quickstart.md        # Phase 1 输出（/speckit.plan 命令）
├── contracts/           # Phase 1 输出（/speckit.plan 命令）
│   └── config-schema.json   # JSON 配置文件 schema
└── tasks.md             # Phase 2 输出（/speckit.tasks 命令 - 不由 /speckit.plan 创建）
```

### 源代码（仓库根目录）

```text
scripts/cc-presets/
├── core/
│   ├── activate.sh       # 预设激活逻辑（cc-<name> 命令）
│   ├── config.sh         # 配置文件读写操作
│   └── utils.sh          # 通用工具函数（JSON 解析、验证等）
├── commands/
│   ├── add.sh            # cc-preset add 子命令
│   ├── edit.sh           # cc-preset edit 子命令
│   ├── delete.sh         # cc-preset delete 子命令
│   ├── list.sh           # cc-preset list 子命令
│   └── status.sh         # cc-preset status 子命令
├── install.sh            # 安装脚本（修改 ~/.zshrc 或 ~/.bash_profile）
├── cc-preset.sh          # 主命令入口（解析子命令）
└── README.md             # 工具文档

tests/
├── unit/
│   ├── test_config.sh    # 配置读写测试
│   ├── test_activate.sh  # 激活逻辑测试
│   └── test_commands.sh  # 子命令测试
└── integration/
    └── test_workflow.sh  # 完整工作流测试

.config-templates/
└── cc-presets/
    └── config.example.json   # 示例配置文件
```

**结构决策**: 采用单一项目结构（Option 1），因为这是一个独立的命令行工具。所有 shell 脚本组织在 `scripts/cc-presets/` 目录下，按功能模块划分：

- `core/`: 核心功能模块（激活、配置管理、工具函数）
- `commands/`: 各个子命令的实现
- `install.sh`: 安装脚本，负责修改用户的 shell 配置文件
- `cc-preset.sh`: 主入口，作为子命令调度器

测试分为单元测试和集成测试，使用 bash 测试框架或自定义测试脚本。

## 复杂度跟踪

> **仅在宪法检查有必须豁免的违规时填写**

*无需填写* - 无宪法违规需要豁免。

## Phase 0: 大纲与研究

### 待研究的技术决策

基于技术上下文，需要研究以下领域：

1. **JSON 解析方案**
   - 研究 macOS 上最佳 JSON 解析方法（python3 vs jq vs 原生 bash）
   - 评估性能、可靠性和安装要求

2. **Shell 函数加载机制**
   - 研究如何在 bash 和 zsh 中可靠地加载 shell 函数
   - 评估 source vs eval 的安全性和性能

3. **配置文件管理最佳实践**
   - 研究 JSON 配置文件的结构设计
   - 评估文件锁定机制（防止并发写入）

4. **Shell 环境变量管理**
   - 研究如何清理旧的环境变量（切换预设时）
   - 评估环境变量命名冲突的处理策略

5. **错误处理和用户反馈**
   - 研究 shell 脚本的错误处理最佳实践
   - 评估用户友好的错误消息格式

### 研究任务分配

将在 Phase 0 中生成详细的 `research.md` 文档，包含上述每个决策点的研究结果、选择的方案及其理由。

## Phase 1: 设计与合约

### 待生成的设计文档

1. **data-model.md**: JSON 配置文件结构和预设数据模型
2. **contracts/config-schema.json**: JSON Schema 定义配置文件格式
3. **quickstart.md**: 快速入门指南和使用示例

### 待设计的 API 合约

虽然这是命令行工具而非 Web API，但我们需要定义：

1. **命令行接口合约**:
   - `cc-<name>`: 激活预设
   - `cc-preset add <name> [options]`: 添加预设
   - `cc-preset edit <name> [options]`: 编辑预设
   - `cc-preset delete <name>`: 删除预设
   - `cc-preset list`: 列出所有预设
   - `cc-preset status`: 显示当前状态

2. **配置文件合约**:
   - JSON 结构定义
   - 必需字段和可选字段
   - 验证规则

## 下一步

Phase 0 和 Phase 1 将通过此命令自动完成。完成后将生成：
- research.md（研究结果）
- data-model.md（数据模型设计）
- contracts/（命令行和配置合约）
- quickstart.md（快速入门指南）
