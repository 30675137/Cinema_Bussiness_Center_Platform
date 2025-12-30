---
name: e2e-admin
description: E2E 测试编排管理器 - 按标签选择场景、配置测试参数、自动启动跨系统服务、执行 Playwright 测试并生成报告。触发关键词 e2e admin, test orchestration, playwright orchestrator, 测试编排, 场景管理, E2E管理。
version: 1.0.0
---

# e2e-admin

**@spec T001-e2e-orchestrator**

E2E 测试编排管理器 - 通过 Claude Code 命令调用的 skill，用于编排和执行 Playwright 端到端测试。

## Description

e2e-admin 是一个 Claude Code Skill，通过编排多个专业 skill（test-scenario-author、e2e-testdata-planner、e2e-test-generator 等）来协调端到端测试工作流。它支持按标签选择场景、配置测试参数（workers、retries、timeout）、自动启动跨系统开发服务器（C端/B端）、执行 Playwright 测试，并生成包含执行摘要的独立 HTML 报告包。

**核心功能**:
- 🎯 **场景选择**: 按标签（module、channel、deploy、priority）或显式 ID 过滤场景
- ⚙️ **配置组装**: 设置 workers、retries、timeout、环境等测试参数
- 🚀 **服务管理**: 自动检测并启动 C端/B端开发服务器
- 🧪 **测试执行**: 调用 Playwright CLI 执行测试（仅 Chromium）
- 📊 **报告生成**: 生成唯一 run_id 的隔离 HTML 报告 + summary.json

## Usage

### 基本用法

```bash
# 运行所有场景（使用默认配置）
/e2e-admin

# 按标签过滤场景
/e2e-admin --tags "module:inventory"

# 按优先级过滤
/e2e-admin --tags "priority:p1"

# 组合条件（AND 逻辑）
/e2e-admin --tags "module:inventory AND priority:p1"

# 多模块（OR 逻辑）
/e2e-admin --tags "module:inventory OR module:order"
```

### 配置并行和重试

```bash
# 4 个 worker 并行执行
/e2e-admin --workers 4

# 失败重试 2 次
/e2e-admin --retries 2

# 组合配置
/e2e-admin --workers 4 --retries 2 --timeout 60000
```

### 指定环境

```bash
# 使用 staging 环境
/e2e-admin --env staging

# 使用 production 环境（谨慎！）
/e2e-admin --env prod
```

### 跳过特定步骤

```bash
# 跳过场景验证（加快启动）
/e2e-admin --skip-scenario-validation

# 跳过数据验证
/e2e-admin --skip-data-validation

# 跳过测试生成（假设脚本已存在）
/e2e-admin --skip-generation

# 组合跳过
/e2e-admin --skip-scenario-validation --skip-data-validation
```

## Command Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--tags` | string | - | 标签过滤表达式（支持 AND/OR 逻辑） |
| `--env` | string | dev | 环境 (dev/staging/prod) |
| `--workers` | integer | 1 | 并行 worker 数量 (1-10) |
| `--retries` | integer | 0 | 失败重试次数 (0-3) |
| `--timeout` | integer | 30000 | 测试超时时间（毫秒） |
| `--skip-scenario-validation` | flag | false | 跳过场景验证 |
| `--skip-data-validation` | flag | false | 跳过数据验证 |
| `--skip-generation` | flag | false | 跳过测试生成 |
| `--skip-report-config` | flag | false | 跳过报告配置 |
| `--skip-artifacts-config` | flag | false | 跳过工件配置 |

## Workflow

编排器按以下固定顺序执行（允许跳过部分步骤）：

```
1. 加载场景 YAML (scenarios/) → 按标签过滤
   ↓
2. 场景验证 (test-scenario-author) → 可跳过
   ↓
3. 数据验证 (e2e-testdata-planner) → 可跳过，若 skill 不可用则提示用户
   ↓
4. 测试生成 (e2e-test-generator) → 可跳过
   ↓
5. 报告配置 (e2e-report-configurator) → 可跳过，缺失时使用 Playwright 默认
   ↓
6. 工件配置 (e2e-artifacts-policy) → 可跳过，缺失时使用 on-failure 策略
   ↓
7. 检测需要的系统 (c-end/b-end) → 自动启动开发服务器
   ↓
8. 执行 Playwright 测试 (npx playwright test --project=chromium)
   ↓
9. 生成报告包 (HTML 报告 + summary.json + artifacts/)
   ↓
10. 停止开发服务器 → 输出报告路径
```

## Output

每次运行生成唯一的报告目录：

```
test-results/run-{run_id}/
├── index.html              # Playwright HTML 报告
├── summary.json            # 执行摘要
├── config.json             # 运行配置快照
└── artifacts/              # 测试工件
    ├── E2E-INVENTORY-001/
    │   ├── trace.zip       # Playwright trace
    │   ├── video.webm      # 测试视频
    │   └── screenshot.png  # 截图
    └── E2E-INVENTORY-002/
```

### summary.json 格式

```json
{
  "run_id": "20251230-143052-a3f8b921",
  "execution_timestamp": "2025-12-30T14:30:52Z",
  "duration_seconds": 125.3,
  "summary": {
    "total": 15,
    "passed": 13,
    "failed": 2,
    "skipped": 0,
    "retries": {
      "total_retry_attempts": 3,
      "scenarios_retried": 2
    }
  }
}
```

## Examples

### 示例 1: 开发阶段快速测试

```bash
# 运行 inventory 模块的 P1 测试
/e2e-admin --tags "module:inventory AND priority:p1" --workers 2

# 查看报告
open test-results/latest/index.html
```

### 示例 2: 完整回归测试

```bash
# 运行所有场景，4 个 worker，失败重试 2 次
/e2e-admin --workers 4 --retries 2

# 检查摘要
cat test-results/latest/summary.json | jq '.summary'
```

### 示例 3: 跨系统集成测试

```bash
# 运行跨系统场景（自动启动 C端/B端 服务）
/e2e-admin --tags "module:inventory"

# 编排器会自动：
#  - 检测场景需要的系统（c-end/b-end）
#  - 启动对应的 dev servers
#  - 执行测试
#  - 停止服务
```

### 示例 4: CI/CD 集成

```bash
# 使用 staging 环境
/e2e-admin --env staging --workers 4 --retries 1

# 检查退出码
if [ $? -eq 0 ]; then
  echo "✅ All tests passed"
else
  echo "❌ Tests failed"
  exit 1
fi
```

## Troubleshooting

### Issue 1: 端口冲突

**错误信息**:
```
RuntimeError: Port 10086 is already in use.
```

**解决方案**:
```bash
# 停止已运行的 C端 dev server
lsof -ti:10086 | xargs kill -9

# 或者修改端口配置（如果支持）
```

### Issue 2: 场景文件未找到

**错误信息**:
```
⚠️  Failed to load scenarios/inventory/E2E-INVENTORY-999.yaml
```

**解决方案**:
```bash
# 1. 检查文件是否存在
ls scenarios/inventory/

# 2. 创建场景（如果缺失）
/test-scenario-author create --spec P005
```

### Issue 3: 测试数据缺失

**警告信息**:
```
⚠️  Test data file not found: testdata/bomTestData.json
```

**解决方案**:
```bash
# 1. 生成测试数据
/testdata-manager generate --from E2E-INVENTORY-002

# 2. 或者跳过数据验证（临时）
/e2e-admin --skip-data-validation
```

## Dependencies

### 内部依赖
- **test-scenario-author** (T005-e2e-scenario-author): 场景 YAML 验证
- **e2e-testdata-planner** (计划中): 测试数据验证（若不可用则提示用户手动运行）
- **e2e-test-generator** (T002-e2e-test-generator): Playwright 测试脚本生成
- **e2e-report-configurator** (可选): HTML 报告配置
- **e2e-artifacts-policy** (可选): 工件策略配置

### 外部依赖
- **Playwright CLI**: 测试执行和报告生成（仅 Chromium 项目）
- **Node.js**: v18+ (运行 Playwright)
- **Python**: 3.8+ (skill 实现)
- **PyYAML**: 6.0+ (YAML 解析)

## Technical Details

**实现语言**: Python 3.8+

**核心模块**:
- `orchestrate.py`: 主编排脚本（CLI 入口）
- `scenario_filter.py`: 场景 YAML 加载和标签过滤
- `config_assembler.py`: RunConfig 组装和验证
- `service_manager.py`: 开发服务器管理（启动/停止/端口检查）
- `skill_executor.py`: Skill 编排调用框架
- `report_generator.py`: 报告摘要生成
- `utils.py`: 工具函数（run_id 生成等）

**目录结构**:
```
.claude/skills/e2e-admin/
├── skill.md                    # 本文档
├── scripts/
│   ├── orchestrate.py          # 主编排脚本
│   ├── scenario_filter.py      # 场景过滤逻辑
│   ├── config_assembler.py     # 配置组装
│   ├── service_manager.py      # 服务管理
│   ├── skill_executor.py       # Skill 调用
│   ├── report_generator.py     # 报告生成
│   └── utils.py                # 工具函数
├── assets/
│   ├── default-config.yaml     # 默认配置模板
│   └── run-config-template.json
├── tests/
│   ├── test_scenario_filter.py
│   ├── test_config_assembler.py
│   ├── test_service_manager.py
│   └── fixtures/               # 测试夹具
└── README.md                   # 开发者文档
```

## Version History

**1.0.0** (2025-12-30):
- Initial MVP release
- Tag-based scenario filtering
- Cross-system service management (C-end + B-end)
- Isolated report generation with unique run_id
- Chromium-only support
- Python 3.8+ implementation

## References

- Specification: `specs/T001-e2e-orchestrator/spec.md`
- Data Model: `specs/T001-e2e-orchestrator/data-model.md`
- Quick Start: `specs/T001-e2e-orchestrator/quickstart.md`
- Contracts: `specs/T001-e2e-orchestrator/contracts/`
- Playwright Docs: https://playwright.dev/
