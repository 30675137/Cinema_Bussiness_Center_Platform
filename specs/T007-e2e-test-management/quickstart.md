# Quickstart: E2E 测试管理规范

**@spec T007-e2e-test-management**

**Date**: 2025-12-31
**Purpose**: Quick start guide for E2E test management skills

## Prerequisites

- Node.js 18+ installed
- npm installed
- Playwright installed (`npm install -D @playwright/test`)
- Claude Code CLI configured

## Command Reference

### Unified Entry Point (`/e2e`)

| Command | Description |
|---------|-------------|
| `/e2e help` | 显示所有可用子命令 |
| `/e2e generate E2E-ORDER-001` | 从场景 YAML 生成 Playwright 脚本 |
| `/e2e run E2E-ORDER-001` | 执行指定场景测试 |
| `/e2e orchestrate --tags "module:order"` | 完整工作流编排 |
| `/e2e testcase create --module order` | 创建人工测试用例 |
| `/e2e testcase list --module order` | 列出模块下所有人工用例 |
| `/e2e testcase execute TC-ORDER-001` | 执行人工测试用例 |
| `/e2e testcase generate-doc TC-ORDER-001` | 生成人工验证 Markdown 文档 |
| `/e2e scenario generate-doc E2E-ORDER-001` | 从场景生成人工验证文档 |
| `/e2e report serve` | 启动报告服务器 |

---

## Quick Start Examples

### 1. 创建人工测试用例

```bash
# 启动交互式创建流程
/e2e testcase create --module order
```

系统将引导你输入：
- 用例 ID (自动建议: TC-ORDER-001)
- 标题
- 优先级 (P0/P1/P2)
- 前置条件
- 测试数据引用
- 测试步骤
- 预期结果

生成文件: `testcases/order/TC-ORDER-001.yaml`

### 2. 生成人工验证文档

**从人工测试用例生成:**
```bash
/e2e testcase generate-doc TC-ORDER-001
```
输出: `testcases/order/docs/TC-ORDER-001.md`

**从自动化场景生成:**
```bash
/e2e scenario generate-doc E2E-ORDER-001
```
输出: `scenarios/order/docs/E2E-ORDER-001.md`

**批量生成模块下所有文档:**
```bash
/e2e testcase generate-doc --module order
```

### 3. 执行完整测试工作流

```bash
# 按标签执行指定模块的测试
/e2e orchestrate --tags "module:inventory"

# 执行流程:
# 1. 场景加载
# 2. 场景验证
# 3. 数据验证
# 4. 脚本生成
# 5. 报告配置
# 6. 服务启动 (自动检测并启动 C端/B端)
# 7. 测试执行
# 8. 报告生成
# 9. 服务清理
```

### 4. 服务自动管理

当执行跨系统测试时，系统会自动：

```bash
# 检测服务状态
Checking port 10086 (C端)... Not running
Checking port 3000 (B端)... Not running

# 启动服务
Starting C端 (npm run dev:h5)... ✓ Ready in 12s
Starting B端 (npm run dev)... ✓ Ready in 8s

# 执行测试
Running E2E-INVENTORY-002.spec.ts...

# 清理服务
Stopping C端... ✓
Stopping B端... ✓
```

### 5. 查看测试报告

```bash
# 启动报告服务器
/e2e report serve

# 访问
# http://localhost:9323
```

报告聚合页面功能：
- 查看历史测试报告列表
- 按时间、模块、状态筛选
- 对比两次测试结果

---

## File Structure

```
项目根目录/
├── scenarios/                    # 自动化测试场景
│   └── order/
│       ├── E2E-ORDER-001.yaml   # 场景定义
│       └── docs/
│           └── E2E-ORDER-001.md # 生成的人工验证文档
│
├── testcases/                    # 人工测试用例
│   └── order/
│       ├── TC-ORDER-001.yaml    # 用例定义
│       └── docs/
│           └── TC-ORDER-001.md  # 生成的人工验证文档
│
├── testdata/                     # 测试数据
│   └── blueprints/
│
├── reports/                      # 测试报告
│   └── e2e/
│       ├── e2e-portal/          # 报告聚合页面
│       │   ├── index.html
│       │   └── reports.json
│       └── run-YYYYMMDD-.../    # 单次运行报告
│
└── frontend/tests/e2e/           # Playwright 测试脚本
    └── order/
        └── E2E-ORDER-001.spec.ts
```

---

## Common Workflows

### Workflow A: 新功能的人工测试

```
1. /e2e testcase create --module <module>
   → 创建用例 YAML

2. /e2e testcase generate-doc TC-XXX-001
   → 生成 Markdown 操作指南

3. QA 按照 Markdown 文档执行测试

4. /e2e testcase execute TC-XXX-001
   → 记录执行结果到 YAML
```

### Workflow B: 自动化测试的人工复核

```
1. /e2e scenario generate-doc E2E-XXX-001
   → 从场景 YAML 生成人工验证文档

2. QA 按照文档进行人工验收

3. 记录验收结果
```

### Workflow C: 完整回归测试

```
1. /e2e orchestrate --tags "regression"
   → 自动执行所有回归测试

2. /e2e report serve
   → 查看测试报告

3. 对失败用例进行人工复核
```

---

## Troubleshooting

### 服务启动失败

**问题**: 端口被占用

**解决方案**:
```bash
# 系统会提示
Port 3000 is already in use by PID 12345
Options:
  [K] Kill process and restart
  [S] Skip this service
  [A] Abort

# 选择 K 自动 kill 并重启
```

### YAML 验证失败

**问题**: 用例格式不正确

**解决方案**:
```bash
# 使用验证命令
/e2e testcase validate TC-ORDER-001

# 输出
Validation failed:
- steps[3].expected: Required field missing
- priority: Must be P0, P1, or P2
```

### 测试数据引用失败

**问题**: `testdata_ref` 指向的数据不存在

**解决方案**:
```bash
# 检查数据蓝图
/e2e testdata list

# 创建缺失的数据
/e2e testdata create --blueprint order
```

---

## Configuration

### 服务配置

编辑 `.claude/skills/e2e-admin/assets/service-config.yaml`:

```yaml
services:
  c-end:
    port: 10086
    start_command: "npm run dev:h5"
    startup_timeout: 60000  # 可调整超时时间
```

### 端口冲突策略

```yaml
port_conflict_strategy:
  default: prompt  # prompt | auto-kill | fail
```

---

## Related Commands

| Skill | Command | Purpose |
|-------|---------|---------|
| test-scenario-author | `/test-scenario-author create` | 创建自动化场景 |
| e2e-test-generator | `/e2e-test-generator` | 生成 Playwright 脚本 |
| e2e-runner | `/e2e-runner` | 执行测试 |
| e2e-testdata-planner | `/e2e-testdata-planner` | 管理测试数据 |
| e2e-admin | `/e2e-admin` | 测试编排 |
| manual-testcase-generator | (via `/e2e testcase generate-doc`) | 生成人工验证文档 |

---

## Version

- **Spec**: T007-e2e-test-management
- **Quickstart Version**: 1.0.0
- **Last Updated**: 2025-12-31
