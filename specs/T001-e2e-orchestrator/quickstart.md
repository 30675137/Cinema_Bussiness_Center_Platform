# Quick Start: E2E 测试编排器

**Feature**: T001-e2e-orchestrator
**Date**: 2025-12-30

## Overview

E2E 测试编排器是一个 Claude Code skill，用于编排和执行 Playwright 端到端测试。本指南帮助你快速上手使用该 skill。

---

## Prerequisites

### 1. 环境要求

- **Python**: 3.8+ (用于 skill 脚本)
- **Node.js**: v18+ (用于 Playwright)
- **操作系统**: macOS / Linux
- **Claude Code CLI**: 已安装并配置

### 2. 依赖检查

```bash
# 检查 Python 版本
python3 --version  # 应显示 Python 3.8.x 或更高

# 检查 Node.js 版本
node --version     # 应显示 v18.x.x 或更高

# 检查 Playwright 安装
cd frontend
npx playwright --version  # 应显示 Playwright 版本号
```

### 3. 安装 Playwright

如果未安装 Playwright：

```bash
cd frontend
npm install -D @playwright/test
npx playwright install chromium
```

### 4. 安装 Python 依赖

```bash
# 安装 PyYAML（YAML 解析）
pip3 install pyyaml
```

---

## Installation

### 1. Skill 目录结构

确认以下目录结构存在：

```
.claude/skills/e2e-orchestrator/
├── skill.md                 # Skill 文档
├── scripts/
│   └── orchestrate.py       # 主脚本
└── assets/
    └── default-config.yaml  # 默认配置
```

### 2. 验证 Skill 可用

```bash
# 通过 Claude Code CLI 调用（如果已注册）
claude /e2e-orchestrator --help
```

---

## Basic Usage

### 1. 快速运行所有测试

```bash
# 运行所有场景（使用默认配置）
/e2e-orchestrator
```

**输出示例**:
```
🚀 E2E Orchestrator - Run ID: 20251230-143052-a3f8b921
📁 Loading scenarios from: scenarios/
✅ Found 15 scenarios

🔍 Validating scenarios (built-in)...
✅ All scenarios validated

🚀 Starting required services...
✅ C-end server is ready on port 10086
✅ B-end server is ready on port 3000

▶️  Running Playwright tests (chromium, workers=1)...
[Playwright output...]

✅ Test execution completed
📊 Results: 15 total, 13 passed, 2 failed, 0 skipped

📄 HTML Report: test-results/run-20251230-143052-a3f8b921/index.html
📦 Summary: test-results/run-20251230-143052-a3f8b921/summary.json

🛑 Stopping services...
✅ C-end server stopped gracefully
✅ B-end server stopped gracefully
```

### 2. 按标签过滤场景

```bash
# 运行 inventory 模块的测试
/e2e-orchestrator --tags "module:inventory"

# 运行 P1 优先级的测试
/e2e-orchestrator --tags "priority:p1"

# 组合条件（AND 逻辑）
/e2e-orchestrator --tags "module:inventory AND priority:p1"

# 多模块（OR 逻辑）
/e2e-orchestrator --tags "module:inventory OR module:order"
```

### 3. 配置并行和重试

```bash
# 4 个 worker 并行执行
/e2e-orchestrator --workers 4

# 失败重试 2 次
/e2e-orchestrator --retries 2

# 组合配置
/e2e-orchestrator --workers 4 --retries 2 --timeout 60000
```

### 4. 指定环境

```bash
# 使用 staging 环境
/e2e-orchestrator --env staging

# 使用 production 环境（谨慎！）
/e2e-orchestrator --env prod
```

### 5. 跳过特定步骤

```bash
# 跳过场景验证（加快启动）
/e2e-orchestrator --skip-scenario-validation

# 跳过数据验证
/e2e-orchestrator --skip-data-validation

# 跳过测试生成（假设脚本已存在）
/e2e-orchestrator --skip-generation

# 组合跳过
/e2e-orchestrator --skip-scenario-validation --skip-data-validation
```

---

## Common Workflows

### Workflow 1: 开发阶段快速测试

场景：开发新功能后，快速验证 inventory 模块

```bash
# 1. 运行 inventory 模块的 P1 测试
/e2e-orchestrator --tags "module:inventory AND priority:p1" --workers 2

# 2. 查看报告
open test-results/latest/index.html
```

### Workflow 2: 完整回归测试

场景：发布前运行所有测试

```bash
# 1. 运行所有场景，4 个 worker，失败重试 2 次
/e2e-orchestrator --workers 4 --retries 2

# 2. 检查摘要
cat test-results/latest/summary.json | jq '.summary'
```

### Workflow 3: 跨系统集成测试

场景：测试 C端 + B端 协作流程

```bash
# 1. 运行跨系统场景（自动启动 C端/B端 服务）
/e2e-orchestrator --tags "module:inventory"

# 2. 编排器会自动：
#    - 检测场景需要的服务（c-end/b-end）
#    - 启动对应的 dev servers
#    - 执行测试
#    - 停止服务
```

### Workflow 4: CI/CD 集成

场景：在 CI 流水线中运行测试

```bash
# 1. 使用 staging 环境
/e2e-orchestrator --env staging --workers 4 --retries 1

# 2. 检查退出码
if [ $? -eq 0 ]; then
  echo "✅ All tests passed"
else
  echo "❌ Tests failed"
  exit 1
fi

# 3. 上传报告到 artifacts
cp -r test-results/latest ./artifacts/
```

---

## Understanding Reports

### HTML Report

打开 HTML 报告：

```bash
# 方式 1: 直接打开
open test-results/latest/index.html

# 方式 2: 使用 Playwright CLI
npx playwright show-report test-results/latest
```

**报告内容**:
- 测试用例列表（通过/失败/跳过）
- 失败测试的错误堆栈
- 截图/视频/trace 链接
- 执行时间统计

### Summary JSON

```bash
# 查看摘要
cat test-results/latest/summary.json | jq .
```

**摘要结构**:
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

### Artifacts (工件)

失败测试的工件位于 `test-results/run-{run_id}/artifacts/`：

```bash
# 查看失败场景的 trace
open test-results/latest/artifacts/E2E-INVENTORY-002/trace.zip

# 查看视频
open test-results/latest/artifacts/E2E-INVENTORY-002/video.webm
```

---

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

### Issue 3: Playwright 未安装

**错误信息**:
```
Error: npx playwright command not found
```

**解决方案**:
```bash
cd frontend
npm install -D @playwright/test
npx playwright install chromium
```

### Issue 4: 所有测试失败

**症状**: HTML 报告显示 100% 失败率

**排查步骤**:
```bash
# 1. 检查开发服务器是否启动
curl http://localhost:10086  # C端
curl http://localhost:3000   # B端

# 2. 手动运行单个测试
cd frontend
npx playwright test scenarios/inventory/E2E-INVENTORY-001.spec.ts --debug

# 3. 查看详细日志
/e2e-orchestrator --tags "module:inventory" --workers 1 > test.log 2>&1
cat test.log
```

### Issue 5: 测试数据缺失

**警告信息**:
```
⚠️  Test data file not found: testdata/bomTestData.json
```

**解决方案**:
```bash
# 1. 生成测试数据
/testdata-manager generate --from E2E-INVENTORY-002

# 2. 或者跳过数据验证（临时）
/e2e-orchestrator --skip-data-validation
```

---

## Advanced Usage

### 自定义配置文件

创建 `run-config.json`:

```json
{
  "environment": "staging",
  "workers": 4,
  "retries": 2,
  "timeout": 45000,
  "tags": "module:inventory AND priority:p1"
}
```

使用配置文件：

```bash
/e2e-orchestrator --config run-config.json
```

### 仅生成报告（跳过执行）

```bash
# 如果已有 test-results，仅重新生成摘要
python3 .claude/skills/e2e-orchestrator/scripts/report_generator.py \
  --run-id 20251230-143052-a3f8b921
```

---

## Command Reference

### 完整参数列表

```
/e2e-orchestrator [OPTIONS]

Options:
  --tags TEXT                   标签过滤表达式
  --env TEXT                    环境 (dev/staging/prod) [default: dev]
  --workers INTEGER             并行 worker 数量 [default: 1]
  --retries INTEGER             失败重试次数 [default: 0]
  --timeout INTEGER             超时时间（毫秒） [default: 30000]
  --skip-scenario-validation    跳过场景验证
  --skip-data-validation        跳过数据验证
  --skip-generation             跳过测试生成
  --skip-report-config          跳过报告配置
  --skip-artifacts-config       跳过工件配置
  --config FILE                 配置文件路径
  --help                        显示帮助信息
```

---

## Next Steps

1. **创建场景**: 使用 `/test-scenario-author` 创建测试场景
2. **生成测试脚本**: 使用 `/e2e-test-generator` 生成 Playwright 脚本
3. **运行编排器**: 使用本 skill 执行完整测试流程
4. **查看报告**: 分析 HTML 报告和 summary.json
5. **CI/CD 集成**: 将 orchestrator 集成到流水线

---

## Additional Resources

- [Spec Document](./spec.md) - 完整功能规格
- [Data Model](./data-model.md) - 数据模型定义
- [Research](./research.md) - 技术研究报告
- [Playwright Docs](https://playwright.dev/) - Playwright 官方文档

---

**Generated by**: Phase 1 Design
**Date**: 2025-12-30
**Status**: ✅ Complete
