# 实施任务：环境预设命令

**功能**: 008-env-preset-commands
**分支**: `008-env-preset-commands`
**日期**: 2025-12-13
**规格**: [spec.md](./spec.md) | **计划**: [plan.md](./plan.md)

## 概述

本文档包含按用户故事组织的详细实施任务列表。每个用户故事都是一个独立可测试的功能增量，可以独立实施和验证。

### 用户故事优先级

1. **US1 (P1)**: 快速环境切换 - 核心功能
2. **US2 (P2)**: 配置管理 - 管理预设
3. **US3 (P3)**: 安全凭证存储 - 文件权限保护

### MVP 范围

**建议**: 仅实施 User Story 1 (US1) 作为 MVP，提供核心的预设激活功能。

## 任务统计

- **总任务数**: 31
- **Setup 任务**: 3
- **Foundational 任务**: 5
- **US1 任务**: 7
- **US2 任务**: 11
- **US3 任务**: 3
- **Polish 任务**: 2
- **可并行任务**: 15

## Phase 1: Setup（项目初始化）

**目标**: 创建项目结构和基础配置

### 任务

- [ ] T001 创建项目目录结构 scripts/cc-presets/ 及子目录（core/, commands/）
- [ ] T002 创建测试目录结构 tests/（unit/, integration/）
- [ ] T003 创建配置模板目录 .config-templates/cc-presets/ 和示例文件 config.example.json

**完成标准**: 所有目录和模板文件已创建，符合 plan.md 中定义的结构。

---

## Phase 2: Foundational（基础组件）

**目标**: 实现所有用户故事依赖的核心功能

**依赖**: Phase 1 Setup

### 任务

- [ ] T004 [P] 实现 JSON 解析工具函数 scripts/cc-presets/core/utils.sh（get_json_value, set_json_value, validate_json）
- [ ] T005 [P] 实现配置文件读写核心函数 scripts/cc-presets/core/config.sh（read_config, write_config_atomic, init_config_if_missing）
- [ ] T006 [P] 实现错误处理辅助函数 scripts/cc-presets/core/utils.sh（error, warn, info, success）
- [ ] T007 [P] 实现配置文件权限管理函数 scripts/cc-presets/core/utils.sh（ensure_file_permissions, check_config_security）
- [ ] T008 创建主命令入口 scripts/cc-presets/cc-preset.sh（子命令路由和帮助消息）

**独立测试标准**:
- JSON 解析正确处理有效和无效 JSON
- 配置文件原子写入无文件损坏风险
- 错误消息清晰且格式一致
- 文件权限自动设置为 600

**并行执行**: T004-T007 可并行执行（不同功能模块）

---

## Phase 3: User Story 1 - 快速环境切换 (P1)

**目标**: 实现核心的预设激活功能

**依赖**: Phase 2 Foundational

**独立测试标准**:
- 用户可以运行 `cc-claude` 激活预设
- 环境变量正确设置在当前 shell
- 切换预设时旧变量被清理
- `cc-preset status` 显示当前激活的预设

### 任务

- [ ] T009 [P] [US1] 实现预设激活核心逻辑 scripts/cc-presets/core/activate.sh（_cc_activate, _cc_cleanup_env）
- [ ] T010 [P] [US1] 实现 status 子命令 scripts/cc-presets/commands/status.sh（显示当前活动预设和环境变量）
- [ ] T011 [P] [US1] 实现环境变量掩码函数 scripts/cc-presets/core/utils.sh（mask_sensitive_value, is_sensitive_var）
- [ ] T012 [US1] 创建 shell 函数库 scripts/cc-presets/functions.sh（动态生成 cc-<name> 函数）
- [ ] T013 [US1] 实现安装脚本 scripts/cc-presets/install.sh（修改 ~/.zshrc 或 ~/.bash_profile）
- [ ] T014 [US1] 编写单元测试 tests/unit/test_activate.sh（测试激活和清理逻辑）
- [ ] T015 [US1] 编写集成测试 tests/integration/test_workflow.sh（测试完整激活流程）

**验收测试**:
```bash
# 1. 安装工具
./scripts/cc-presets/install.sh

# 2. 手动创建测试配置
mkdir -p ~/.config/cc-presets/
cat > ~/.config/cc-presets/config.json <<EOF
{
  "version": "1.0",
  "presets": {
    "test": {
      "env_vars": {
        "TEST_API_KEY": "test-key-123",
        "TEST_MODEL": "test-model",
        "TEST_BASE_URL": "https://test.example.com"
      }
    }
  }
}
EOF

# 3. 激活预设
source ~/.zshrc  # 或 ~/.bash_profile
cc-test

# 4. 验证环境变量
echo $TEST_API_KEY  # 应输出: test-key-123
echo $TEST_MODEL    # 应输出: test-model

# 5. 检查状态
cc-preset status
# 应显示: Current preset: test
#         TEST_API_KEY=test****
```

**并行执行**: T009-T011 可并行执行（不同文件）

---

## Phase 4: User Story 2 - 配置管理 (P2)

**目标**: 实现预设的增删改查管理功能

**依赖**: Phase 2 Foundational（不依赖 US1，但建议在 US1 后实施以便测试）

**独立测试标准**:
- 用户可以使用 `cc-preset add` 创建新预设
- 用户可以使用 `cc-preset edit` 修改现有预设
- 用户可以使用 `cc-preset delete` 删除预设
- 用户可以使用 `cc-preset list` 查看所有预设
- 所有操作正确更新 JSON 配置文件

### 任务

- [ ] T016 [P] [US2] 实现参数解析函数 scripts/cc-presets/core/utils.sh（parse_args, validate_preset_name, validate_env_var_name）
- [ ] T017 [P] [US2] 实现 add 子命令 scripts/cc-presets/commands/add.sh（创建新预设，验证参数，写入配置）
- [ ] T018 [P] [US2] 实现 edit 子命令 scripts/cc-presets/commands/edit.sh（更新现有预设，合并更改）
- [ ] T019 [P] [US2] 实现 delete 子命令 scripts/cc-presets/commands/delete.sh（删除预设，确认提示）
- [ ] T020 [P] [US2] 实现 list 子命令 scripts/cc-presets/commands/list.sh（列出所有预设，支持 --json 和 --verbose）
- [ ] T021 [US2] 更新主命令入口 scripts/cc-presets/cc-preset.sh（集成所有子命令）
- [ ] T022 [US2] 实现预设冲突处理逻辑 scripts/cc-presets/commands/add.sh（检测重名，提示用户确认）
- [ ] T023 [US2] 实现 metadata 自动生成 scripts/cc-presets/commands/add.sh 和 edit.sh（created, modified 时间戳）
- [ ] T024 [US2] 编写单元测试 tests/unit/test_commands.sh（测试所有子命令）
- [ ] T025 [US2] 编写集成测试 tests/integration/test_workflow.sh（测试创建-编辑-删除流程）
- [ ] T026 [US2] 更新 functions.sh 生成逻辑（add 命令后自动生成新的 cc-<name> 函数）

**验收测试**:
```bash
# 1. 添加新预设
cc-preset add claude \
  --api-key sk-ant-test-key \
  --model claude-3-sonnet-20240229 \
  --base-url https://api.anthropic.com \
  --description "Test Claude config"

# 2. 验证预设已创建
cc-preset list
# 应显示: claude 预设及其配置

# 3. 编辑预设
cc-preset edit claude --model claude-3-opus-20240229

# 4. 验证修改
cc-preset list --json | jq '.presets[] | select(.name=="claude") | .env_vars.ANTHROPIC_MODEL'
# 应输出: "claude-3-opus-20240229"

# 5. 激活并测试
cc-claude
echo $ANTHROPIC_MODEL  # 应输出: claude-3-opus-20240229

# 6. 删除预设
cc-preset delete claude
# 应提示确认并成功删除

# 7. 验证删除
cc-preset list
# claude 不应在列表中
```

**并行执行**: T016-T020 可并行执行（不同子命令文件）

---

## Phase 5: User Story 3 - 安全凭证存储 (P3)

**目标**: 确保配置文件权限安全，提供 .gitignore 模板

**依赖**: Phase 2 Foundational（可与 US1/US2 并行，但建议最后实施）

**独立测试标准**:
- 配置文件自动设置为 chmod 600
- 配置目录权限为 chmod 700
- 提供 .gitignore 模板示例
- 安装脚本检查并修复权限问题

### 任务

- [ ] T027 [P] [US3] 增强配置文件写入 scripts/cc-presets/core/config.sh（每次写入后自动 chmod 600）
- [ ] T028 [P] [US3] 创建 .gitignore 模板 .config-templates/cc-presets/.gitignore.template（包含配置文件路径）
- [ ] T029 [US3] 更新安装脚本 scripts/cc-presets/install.sh（检查并修复文件权限，复制 .gitignore 模板）

**验收测试**:
```bash
# 1. 创建预设
cc-preset add test --api-key secret --model test --base-url http://test.com

# 2. 检查配置文件权限
ls -la ~/.config/cc-presets/config.json
# 应显示: -rw------- (600)

# 3. 检查目录权限
ls -ld ~/.config/cc-presets/
# 应显示: drwx------ (700)

# 4. 验证 .gitignore 模板存在
cat .config-templates/cc-presets/.gitignore.template
# 应包含: .config/cc-presets/config.json

# 5. 测试权限修复
chmod 644 ~/.config/cc-presets/config.json  # 故意破坏权限
cc-preset add another --api-key test --model test --base-url test
ls -la ~/.config/cc-presets/config.json
# 应恢复为: -rw------- (600)
```

**并行执行**: T027-T028 可并行执行

---

## Phase 6: Polish & Cross-Cutting Concerns

**目标**: 完善文档、帮助信息和用户体验

**依赖**: US1, US2, US3 全部完成

### 任务

- [ ] T030 [P] 实现 help 子命令和 --help 选项 scripts/cc-presets/cc-preset.sh（显示使用说明和示例）
- [ ] T031 [P] 创建项目 README scripts/cc-presets/README.md（安装说明、使用示例、故障排除）

**验收测试**:
```bash
# 1. 测试帮助命令
cc-preset --help
cc-preset help
cc-preset help add

# 2. 阅读 README
cat scripts/cc-presets/README.md
# 应包含完整的文档
```

**并行执行**: T030-T031 可并行执行

---

## 任务依赖关系图

```
Phase 1: Setup
  T001, T002, T003
    ↓
Phase 2: Foundational
  T004 [P], T005 [P], T006 [P], T007 [P] ← 可并行
    ↓
  T008
    ↓
    ├──→ Phase 3: US1
    │     T009 [P], T010 [P], T011 [P] ← 可并行
    │       ↓
    │     T012
    │       ↓
    │     T013
    │       ↓
    │     T014 [P], T015 [P] ← 可并行
    │
    ├──→ Phase 4: US2 （可与 US1 并行开始，但建议 US1 后）
    │     T016 [P], T017 [P], T018 [P], T019 [P], T020 [P] ← 可并行
    │       ↓
    │     T021, T022, T023
    │       ↓
    │     T024 [P], T025 [P], T026 [P] ← 可并行
    │
    └──→ Phase 5: US3 （可与 US1/US2 并行）
          T027 [P], T028 [P] ← 可并行
            ↓
          T029

    所有用户故事完成后
    ↓
Phase 6: Polish
  T030 [P], T031 [P] ← 可并行
```

## 用户故事完成顺序

### 推荐顺序（顺序实施）
1. **US1 (快速环境切换)** - MVP，核心功能
2. **US2 (配置管理)** - 依赖 US1 进行完整测试
3. **US3 (安全凭证存储)** - 增强安全性

### 并行机会

如果有多个开发者，可以并行：
- **Developer 1**: US1（T009-T015）
- **Developer 2**: US2（T016-T026）同时开发，使用手动配置文件测试
- **Developer 3**: US3（T027-T029）同时开发

**注意**: 并行开发时，US2 和 US3 需要使用手动创建的测试配置文件，因为它们在 US1 的安装脚本完成前无法完全测试。

## 实施策略

### MVP 优先（推荐）

**阶段 1 - MVP (1-2 天)**:
- Phase 1: Setup (T001-T003)
- Phase 2: Foundational (T004-T008)
- Phase 3: US1 (T009-T015)

**交付成果**: 用户可以安装工具，手动创建配置文件，激活预设并切换环境变量。

**阶段 2 - 完整功能 (2-3 天)**:
- Phase 4: US2 (T016-T026)
- Phase 5: US3 (T027-T029)
- Phase 6: Polish (T030-T031)

**交付成果**: 完整的配置管理工具，包含所有子命令和安全功能。

### 快速迭代

**Sprint 1**: T001-T015 (Setup + Foundational + US1)
**Sprint 2**: T016-T026 (US2)
**Sprint 3**: T027-T031 (US3 + Polish)

## 测试策略

### 单元测试
- **tests/unit/test_config.sh**: 测试配置文件读写（T005 相关）
- **tests/unit/test_activate.sh**: 测试激活逻辑（T009 相关，T014）
- **tests/unit/test_commands.sh**: 测试所有子命令（T024）

### 集成测试
- **tests/integration/test_workflow.sh**: 测试完整工作流（T015, T025）
  - 安装 → 创建预设 → 激活 → 切换 → 编辑 → 删除

### 手动测试检查清单
1. 安装脚本在 bash 和 zsh 中都能工作
2. 敏感值在 list 和 status 中被正确掩码
3. 配置文件权限在所有操作后保持 600
4. 错误消息清晰且有帮助
5. 帮助文档完整且准确

## 性能验收标准

| 操作 | 目标 | 测试方法 |
|------|------|---------|
| 预设激活 | < 5s | `time cc-claude` |
| 列表显示 | < 3s | `time cc-preset list` |
| 创建预设 | < 60s | `time cc-preset add test ...` |

## 文件清单

执行所有任务后，应创建以下文件：

### 源代码
- scripts/cc-presets/core/utils.sh
- scripts/cc-presets/core/config.sh
- scripts/cc-presets/core/activate.sh
- scripts/cc-presets/commands/add.sh
- scripts/cc-presets/commands/edit.sh
- scripts/cc-presets/commands/delete.sh
- scripts/cc-presets/commands/list.sh
- scripts/cc-presets/commands/status.sh
- scripts/cc-presets/cc-preset.sh
- scripts/cc-presets/functions.sh
- scripts/cc-presets/install.sh
- scripts/cc-presets/README.md

### 测试
- tests/unit/test_config.sh
- tests/unit/test_activate.sh
- tests/unit/test_commands.sh
- tests/integration/test_workflow.sh

### 模板
- .config-templates/cc-presets/config.example.json
- .config-templates/cc-presets/.gitignore.template

**总计**: 18 个文件

## 下一步

1. **审查任务列表**: 确认所有任务清晰且可执行
2. **选择实施策略**: MVP 优先 vs 完整功能 vs 快速迭代
3. **开始实施**: 从 Phase 1 Setup (T001) 开始
4. **持续验证**: 每个 Phase 完成后运行对应的验收测试

---

**提示**: 此任务列表设计为可立即执行。每个任务都包含具体的文件路径和实施指导。建议按顺序执行，或根据依赖关系图选择并行路径。
