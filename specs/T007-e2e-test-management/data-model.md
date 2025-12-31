# Data Model: E2E 测试管理规范

**@spec T007-e2e-test-management**

**Date**: 2025-12-31
**Purpose**: Define YAML schemas and data structures for E2E test management

## Entity Overview

| Entity | Location | Format | Description |
|--------|----------|--------|-------------|
| ManualTestCase | `testcases/<module>/TC-*.yaml` | YAML | 人工测试用例定义 |
| ExecutionRecord | Embedded in ManualTestCase | YAML | 执行记录 |
| ServiceConfig | `.claude/skills/e2e-admin/assets/service-config.yaml` | YAML | 服务配置 |
| ReportIndex | `reports/e2e/e2e-portal/reports.json` | JSON | 报告索引 |
| GeneratedDoc | `*/docs/*.md` | Markdown | 生成的人工验证文档 |

---

## 1. ManualTestCase Schema

**Location**: `testcases/<module>/TC-<MODULE>-<NUMBER>.yaml`

### YAML Schema

```yaml
# JSON Schema representation
$schema: "http://json-schema.org/draft-07/schema#"
title: ManualTestCase
type: object
required:
  - testcase_id
  - title
  - module
  - priority
  - steps
properties:
  testcase_id:
    type: string
    pattern: "^TC-[A-Z]+-\\d{3}$"
    description: "Unique identifier, format: TC-MODULE-NUMBER"
    examples: ["TC-ORDER-001", "TC-INVENTORY-005"]

  title:
    type: string
    minLength: 10
    maxLength: 100
    description: "Descriptive title of the test case"

  module:
    type: string
    enum: [order, inventory, store, hall, product, brand, category, user, reservation, scenario-package]
    description: "Business module this test case belongs to"

  feature:
    type: string
    description: "Specific feature being tested"

  priority:
    type: string
    enum: [P0, P1, P2]
    description: "Test priority (P0=Critical, P1=High, P2=Medium)"

  preconditions:
    type: object
    properties:
      account:
        type: string
        description: "Required account type"
      permissions:
        type: string
        description: "Required permissions"
      switches:
        type: array
        items:
          type: string
        description: "Feature switches that must be enabled"
      environment:
        type: string
        enum: [dev, staging, production]
      dependencies:
        type: array
        items:
          type: string
        description: "System state dependencies"

  test_data:
    type: object
    properties:
      testdata_ref:
        type: string
        pattern: "^[a-zA-Z]+\\.[a-zA-Z_]+$"
        description: "Reference to testdata-planner blueprint (e.g., orderTestData.beverage_order_001)"
    additionalProperties:
      type: string
      description: "Explicit test data values or variable references"

  steps:
    type: array
    minItems: 1
    items:
      type: object
      required:
        - step_no
        - action
        - expected
      properties:
        step_no:
          type: integer
          minimum: 1
        action:
          type: string
          description: "Human-readable action description"
        input:
          type: string
          description: "Specific input or interaction details"
        expected:
          type: string
          description: "Expected result after this step"

  assertions:
    type: array
    items:
      type: string
    description: "High-level verification points"

  executions:
    type: array
    items:
      $ref: "#/definitions/ExecutionRecord"

  metadata:
    type: object
    properties:
      created_at:
        type: string
        format: date-time
      created_by:
        type: string
      updated_at:
        type: string
        format: date-time
      version:
        type: string
        pattern: "^\\d+\\.\\d+\\.\\d+$"
      tags:
        type: array
        items:
          type: string
          enum: [smoke, regression, payment, critical, manual-only]

definitions:
  ExecutionRecord:
    type: object
    required:
      - executed_at
      - executed_by
      - actual_result
    properties:
      executed_at:
        type: string
        format: date-time
      executed_by:
        type: string
        description: "Tester identifier (e.g., QA-张三)"
      actual_result:
        type: string
        enum: [Pass, Fail, Blocked, Skipped]
      defect_id:
        type: string
        nullable: true
        description: "Related defect ID (e.g., FEISHU-BUG-12345)"
      notes:
        type: string
        nullable: true
```

### Example Instance

```yaml
testcase_id: TC-ORDER-001
title: 验证用户能够成功创建饮品订单并完成支付
module: order
feature: 饮品订单创建
priority: P0

preconditions:
  account: 已登录的普通用户账号
  permissions: 普通用户权限
  switches: []
  environment: staging
  dependencies:
    - 门店已开业
    - 商品已上架
    - 库存充足

test_data:
  testdata_ref: orderTestData.beverage_order_001

steps:
  - step_no: 1
    action: 打开门店页面
    input: 点击首页门店入口
    expected: 显示门店列表页

  - step_no: 2
    action: 选择门店
    input: 点击第一个门店
    expected: 进入门店商品页

  - step_no: 3
    action: 添加商品到购物车
    input: 选择可乐，数量2，点击添加
    expected: 购物车显示商品数量2

assertions:
  - 订单状态变为"已支付"
  - 库存扣减正确
  - 订单详情页显示正确商品和数量

executions:
  - executed_at: "2025-12-31T10:30:00Z"
    executed_by: QA-张三
    actual_result: Pass
    defect_id: null
    notes: null

metadata:
  created_at: "2025-12-29T09:00:00Z"
  created_by: QA-张三
  updated_at: "2025-12-31T10:30:00Z"
  version: "1.2.0"
  tags:
    - smoke
    - regression
    - payment
```

### Validation Rules

| Rule | Description |
|------|-------------|
| ID Format | Must match `TC-<MODULE>-<NUMBER>` pattern |
| Priority Required | Must be P0, P1, or P2 |
| Steps Non-Empty | At least one step required |
| Testdata Ref Format | Must match `namespace.key` pattern if provided |
| Execution Result | Must be Pass, Fail, Blocked, or Skipped |

---

## 2. ServiceConfig Schema

**Location**: `.claude/skills/e2e-admin/assets/service-config.yaml`

### YAML Schema

```yaml
$schema: "http://json-schema.org/draft-07/schema#"
title: ServiceConfig
type: object
required:
  - services
  - port_conflict_strategy
properties:
  services:
    type: object
    additionalProperties:
      type: object
      required:
        - name
        - port
        - directory
        - start_command
        - health_check_url
      properties:
        name:
          type: string
          description: "Human-readable service name"
        port:
          type: integer
          minimum: 1024
          maximum: 65535
        directory:
          type: string
          description: "Working directory relative to repo root"
        start_command:
          type: string
          description: "Command to start the service"
        health_check_url:
          type: string
          format: uri
        startup_timeout:
          type: integer
          default: 60000
          description: "Timeout in milliseconds"
        shutdown_signal:
          type: string
          enum: [SIGTERM, SIGKILL, SIGINT]
          default: SIGTERM

  port_conflict_strategy:
    type: object
    required:
      - default
    properties:
      default:
        type: string
        enum: [prompt, auto-kill, fail]
      options:
        type: object
        additionalProperties:
          type: string
```

### Example Instance

```yaml
services:
  c-end:
    name: "C端 (Taro H5)"
    port: 10086
    directory: "./hall-reserve-taro"
    start_command: "npm run dev:h5"
    health_check_url: "http://localhost:10086"
    startup_timeout: 60000
    shutdown_signal: SIGTERM

  b-end:
    name: "B端 (React Admin)"
    port: 3000
    directory: "./frontend"
    start_command: "npm run dev"
    health_check_url: "http://localhost:3000"
    startup_timeout: 60000
    shutdown_signal: SIGTERM

  backend:
    name: "后端 (Spring Boot)"
    port: 8080
    directory: "./backend"
    start_command: "./mvnw spring-boot:run"
    health_check_url: "http://localhost:8080/actuator/health"
    startup_timeout: 120000
    shutdown_signal: SIGTERM

port_conflict_strategy:
  default: prompt
  options:
    prompt: "询问用户是否 kill 进程"
    auto-kill: "自动 kill 占用进程"
    fail: "直接报错退出"
```

---

## 3. ReportIndex Schema

**Location**: `reports/e2e/e2e-portal/reports.json`

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ReportIndex",
  "type": "object",
  "required": ["portal_version", "generated_at", "reports"],
  "properties": {
    "portal_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "generated_at": {
      "type": "string",
      "format": "date-time"
    },
    "reports": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["run_id", "execution_timestamp", "summary", "report_path"],
        "properties": {
          "run_id": {
            "type": "string",
            "pattern": "^\\d{8}-\\d{6}-[a-f0-9]{8}$",
            "description": "Format: YYYYMMDD-HHMMSS-hash"
          },
          "execution_timestamp": {
            "type": "string",
            "format": "date-time"
          },
          "duration_seconds": {
            "type": "number",
            "minimum": 0
          },
          "summary": {
            "type": "object",
            "required": ["total", "passed", "failed", "skipped"],
            "properties": {
              "total": { "type": "integer", "minimum": 0 },
              "passed": { "type": "integer", "minimum": 0 },
              "failed": { "type": "integer", "minimum": 0 },
              "skipped": { "type": "integer", "minimum": 0 }
            }
          },
          "tags_filter": {
            "type": "string",
            "description": "Tag filter used for this run"
          },
          "environment": {
            "type": "string",
            "enum": ["dev", "staging", "production"]
          },
          "report_path": {
            "type": "string",
            "description": "Relative path to HTML report"
          },
          "artifacts_path": {
            "type": "string",
            "description": "Relative path to artifacts directory"
          }
        }
      }
    }
  }
}
```

---

## 4. Generated Markdown Document Structure

**Location**:
- `testcases/<module>/docs/TC-<MODULE>-<NUMBER>.md` (from TC YAML)
- `scenarios/<module>/docs/E2E-<MODULE>-<NUMBER>.md` (from E2E YAML)

### Template Fields (TC YAML Source)

| Field | Source | Required |
|-------|--------|----------|
| Title | `title` | Yes |
| Testcase ID | `testcase_id` | Yes |
| Module | `module` | Yes |
| Priority | `priority` | Yes |
| Preconditions | `preconditions` | Yes |
| Test Data | `test_data` | Optional |
| Steps Table | `steps[]` | Yes |
| Assertions | `assertions[]` | Optional |
| Footer | Auto-generated | Yes |

### Template Fields (E2E YAML Source)

| Field | Source | Required |
|-------|--------|----------|
| Title | `title` | Yes |
| Scenario ID | `scenario_id` | Yes |
| Module | `module` | Yes |
| Tags | `tags[]` | Optional |
| Preconditions | `preconditions[]` | Yes |
| Steps (descriptions only) | `steps[].description` | Yes |
| Footer | Auto-generated | Yes |

**Note**: Technical details (selectors, locators, assertion code) are NOT included in generated Markdown.

---

## Entity Relationships

```
┌─────────────────────┐
│   ManualTestCase    │
│   (TC-*.yaml)       │
├─────────────────────┤
│ testcase_id (PK)    │
│ test_data.testdata_ref ──────► TestDataBlueprint (T004)
│ executions[]        │
└─────────────────────┘
         │
         │ generates
         ▼
┌─────────────────────┐
│   GeneratedDoc      │
│   (TC-*.md)         │
└─────────────────────┘

┌─────────────────────┐
│   E2EScenario       │
│   (E2E-*.yaml)      │
│   (from T001/T005)  │
└─────────────────────┘
         │
         │ generates (metadata only)
         ▼
┌─────────────────────┐
│   GeneratedDoc      │
│   (E2E-*.md)        │
└─────────────────────┘

┌─────────────────────┐
│   ServiceConfig     │
├─────────────────────┤
│ services{}          │
│ port_conflict_      │
│ strategy            │
└─────────────────────┘

┌─────────────────────┐
│   ReportIndex       │
├─────────────────────┤
│ reports[]           │──────► Individual HTML Reports
└─────────────────────┘
```

---

## State Transitions

### ManualTestCase Execution State

```
┌──────────┐
│  Draft   │ (created, no executions)
└────┬─────┘
     │ first execution
     ▼
┌──────────┐     execution
│ Executed │◄────────────┐
└────┬─────┘             │
     │                   │
     └───────────────────┘
     (multiple executions allowed)

Execution Results:
- Pass: Test passed
- Fail: Test failed (may have defect_id)
- Blocked: Cannot execute due to blocker
- Skipped: Intentionally skipped
```

### Service Lifecycle State

```
┌──────────┐
│  Stopped │
└────┬─────┘
     │ start_command
     ▼
┌──────────┐
│ Starting │ (health_check polling)
└────┬─────┘
     │ health_check OK
     ▼
┌──────────┐
│ Running  │
└────┬─────┘
     │ shutdown_signal
     ▼
┌──────────┐
│  Stopped │
└──────────┘

Timeout: Starting → Error (startup_timeout exceeded)
```

---

## Indexing Strategy

| Entity | Index Fields | Purpose |
|--------|--------------|---------|
| ManualTestCase | module, priority, metadata.tags | Filtering and listing |
| ReportIndex | execution_timestamp, environment | History navigation |
| ServiceConfig | port | Port conflict detection |
