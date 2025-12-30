# Data Model: E2E测试脚本生成器

**Feature**: T002-e2e-test-generator
**Date**: 2025-12-30
**Phase**: Phase 1 - Design

## Overview

本文档定义 e2e-test-generator skill 处理的所有数据结构，包括输入（场景 YAML）、配置（action mappings）、输出（测试脚本）的完整 Schema。

---

## Input Data Models

### E2EScenarioSpec (输入 YAML)

**Source**: 由 T001-e2e-scenario-author 生成
**Format**: YAML
**Location**: `scenarios/<module>/<scenario_id>.yaml`

**Schema** (引用 T001 规范):

```yaml
scenario_id: string  # Format: E2E-<MODULE>-<NUMBER>
spec_ref: string     # Format: X### (e.g., P005)
title: string        # 场景标题
description: string  # 场景描述 (optional)

tags:
  module: string[]   # 模块标签
  channel: string[]  # 渠道标签
  deploy: string[]   # 部署标签
  priority: string   # p1, p2, p3
  smoke: boolean     # 是否为冒烟测试

preconditions:
  role: string       # 用户角色
  testdata_ref: string  # 测试数据引用 (optional)

steps:
  - action: string   # 操作名称
    system: string   # 系统标识 (optional): c-end | b-end | api
    params: object   # 参数（可包含 testdata_ref）
    description: string  # 步骤描述 (optional)
    wait: number     # 等待时间（毫秒）(optional)

assertions:
  - type: string     # ui | api
    check: string    # 检查类型
    params: object   # 参数
    timeout: number  # 超时时间（毫秒）(optional)

artifacts:
  trace: string      # on-failure | always | off
  video: string
  screenshot: string

metadata:
  created_at: string
  created_by: string
  version: string
```

**Example**:
```yaml
scenario_id: E2E-INVENTORY-001
spec_ref: P005
title: 库存调整审批流程
tags:
  module: [inventory]
  channel: [web]
  deploy: [saas]
  priority: p1
  smoke: true

preconditions:
  role: admin
  testdata_ref: inventoryTestData.scenario_001

steps:
  - action: login
    description: 管理员登录
  - action: navigate
    params:
      testdata_ref: inventoryTestData.adjustment_page
  - action: create_adjustment
    params:
      testdata_ref: inventoryTestData.adjustment_data

assertions:
  - type: ui
    check: element_visible
    params:
      selector: .success-message
  - type: api
    check: response_status_is
    params:
      expected: 200
```

### Cross-System Testing (跨系统测试)

**New in v1.1.0**: 支持在单个场景中跨越多个系统（C端/B端）。

**系统标识符**:
- `c-end`: C端（用户端）- Taro H5/小程序 (http://localhost:10086)
- `b-end`: B端（运营中台）- React Admin (http://localhost:3000)
- `api`: 纯 API 调用（无 UI 交互）

**生成规则**:
1. 默认所有步骤在同一个 `page` 对象上执行
2. 当首次遇到 `system: b-end` 时，生成 `const adminPage = await context.newPage()`
3. 后续 `system: b-end` 步骤复用 `adminPage`
4. 生成的代码自动插入系统切换注释（如 `// ====== B端操作 ======`）

**Example** (跨系统场景):
```yaml
scenario_id: E2E-INVENTORY-002
title: BOM库存预占与实扣流程
steps:
  # C端步骤
  - action: login
    system: c-end
    description: 用户登录 H5
  - action: create_order
    system: c-end
    description: 创建订单（触发预占）

  # B端步骤
  - action: click
    system: b-end
    params:
      testdata_ref: bomTestData.confirm_production_btn
    description: 吧台确认出品（触发实扣）
```

**生成的测试代码**:
```typescript
test('...', async ({ page, context }) => {
  // ====== C端操作 ======
  await page.goto('http://localhost:10086');
  await loginPage.login(testData);
  const orderId = await orderPage.createOrder(testData);

  // ====== B端操作 ======
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3000');
  await adminPage.click(testData.confirm_production_btn);
});
```

---

## Configuration Data Models

### ActionMappings (配置文件)

**Location**: `.claude/skills/e2e-test-generator/assets/templates/action-mappings.yaml`
**Purpose**: 定义 action → 代码模板的映射规则

**Schema**:

```yaml
<action_name>:
  playwright:
    code: string          # 代码模板（支持 {{}} 占位符）
    imports: string[]     # 需要导入的页面对象/模块
    params: string[]      # 参数列表
  postman:
    method: string        # HTTP 方法
    url: string          # 请求 URL
    body: string         # 请求体模板
    tests: string        # 测试脚本
  restclient:
    method: string
    url: string
    body: string
    expect: string       # 期望响应
```

**Example**:

```yaml
login:
  playwright:
    code: "await loginPage.login({{testdata_ref}})"
    imports: ["LoginPage"]
    params: ["testdata_ref"]

create_order:
  playwright:
    code: "await orderPage.createOrder({{testdata_ref}})"
    imports: ["OrderPage"]
    params: ["testdata_ref"]
  postman:
    method: POST
    url: "/api/orders"
    body: "{{testdata_ref}}"
    tests: "pm.test('Order created', () => { pm.response.to.have.status(201); });"

browse_product:
  playwright:
    code: "await productPage.browseProduct({{testdata_ref}})"
    imports: ["ProductPage"]
    params: ["testdata_ref"]
```

---

### AssertionMappings (断言映射)

**Purpose**: 定义 assertion → 代码模板的映射规则

**Schema**:

```yaml
<check_type>:
  playwright:
    code: string          # 断言代码模板
    imports: string[]     # 需要的导入
  postman:
    code: string          # pm.test() 代码
  restclient:
    expect: string        # 期望响应格式
```

**Example**:

```yaml
element_visible:
  playwright:
    code: "await expect(page.locator('{{selector}}')).toBeVisible()"

toast_message_shown:
  playwright:
    code: "await expect(page.locator('.toast')).toContainText('{{message}}')"

response_status_is:
  playwright:
    code: "expect(response.status).toBe({{expected}})"
  postman:
    code: "pm.test('Status code is {{expected}}', () => { pm.response.to.have.status({{expected}}); });"
  restclient:
    expect: "HTTP/1.1 {{expected}} OK"

database_field_equals:
  playwright:
    code: "// TODO: Implement database check for {{table}}.{{field}} == {{expected}}"
  postman:
    code: "// TODO: Add database assertion via pre-request script"
```

---

## Output Data Models

### PlaywrightTestScript (输出 TypeScript)

**Location**: `scenarios/<module>/<scenario_id>.spec.ts`
**Purpose**: 可执行的 Playwright 测试脚本

**Structure**:

```typescript
// AUTO-GENERATED: Do not modify above this line
// @spec T002-e2e-test-generator
// Generated from: scenarios/<module>/<scenario_id>.yaml

import { test, expect } from '@playwright/test';
import { <PageObject> } from './pages/<PageObject>';
import { loadTestData } from '@/testdata/loader';

test.describe('<scenario.title>', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    testData = await loadTestData('<testdata_ref>');
    await page.goto(testData.baseUrl);
  });

  test('<scenario.scenario_id>', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);

    // Steps
    <generated_step_code>

    // Assertions
    <generated_assertion_code>

    // CUSTOM CODE START
    // Add your custom test logic here
    // CUSTOM CODE END
  });
});
```

**Code Markers**:
- `// AUTO-GENERATED: Do not modify above this line` - 自动生成区域开始标记
- `// CUSTOM CODE START ... // CUSTOM CODE END` - 手动代码保护区域

---

### PostmanCollection (输出 JSON)

**Location**: `scenarios/<module>/<scenario_id>.postman_collection.json`
**Purpose**: Postman Collection v2.1 格式的 API 测试集合

**Schema** (Postman Collection v2.1):

```json
{
  "info": {
    "name": "string",
    "description": "string",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "string",
      "event": [
        {
          "listen": "test",
          "script": {
            "type": "text/javascript",
            "exec": ["array", "of", "strings"]
          }
        }
      ],
      "request": {
        "method": "GET|POST|PUT|DELETE|PATCH",
        "header": [],
        "url": {
          "raw": "string",
          "host": ["array"],
          "path": ["array"]
        },
        "body": {
          "mode": "raw",
          "raw": "string"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "string",
      "value": "string",
      "type": "string"
    }
  ]
}
```

**Example**:

```json
{
  "info": {
    "name": "库存调整审批流程",
    "description": "Generated from E2E-INVENTORY-001",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Login",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Status code is 200', function () {",
              "  pm.response.to.have.status(200);",
              "});",
              "pm.environment.set('authToken', pm.response.json().token);"
            ]
          }
        }
      ],
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/auth/login",
        "body": {
          "mode": "raw",
          "raw": "{\"username\": \"{{testData.username}}\", \"password\": \"{{testData.password}}\"}"
        }
      }
    }
  ],
  "variable": [
    { "key": "baseUrl", "value": "http://localhost:8080" }
  ]
}
```

---

### RESTClientScript (输出 .http)

**Location**: `scenarios/<module>/<scenario_id>.http`
**Purpose**: VS Code REST Client 格式的 HTTP 请求文件

**Structure**:

```http
### <scenario.title>
# Generated from: <scenario_id>
# @spec T002-e2e-test-generator

@baseUrl = http://localhost:8080
@token = <from testdata>

### Step 1: <step.description>
<HTTP_METHOD> {{baseUrl}}<endpoint>
Content-Type: application/json
Authorization: Bearer {{token}}

<request_body>

### Expected: <expected_status>
### Verify: <assertion_description>

### Step 2: ...
```

**Example**:

```http
### 库存调整审批流程
# Generated from: E2E-INVENTORY-001
# @spec T002-e2e-test-generator

@baseUrl = http://localhost:8080
@token = {{testData.authToken}}

### Step 1: Login
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "username": "{{testData.username}}",
  "password": "{{testData.password}}"
}

### Expected: 200 OK
### Verify: response.body.success == true

### Step 2: Create Adjustment
POST {{baseUrl}}/api/inventory/adjustments
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "skuId": "{{testData.skuId}}",
  "quantity": {{testData.quantity}},
  "reason": "{{testData.reason}}"
}

### Expected: 201 Created
### Verify: response.body.data.adjustmentId exists
```

---

### PageObjectTemplate (输出 TypeScript)

**Location**: `scenarios/<module>/pages/<PageName>Page.ts`
**Purpose**: 自动生成的页面对象模板骨架

**Structure**:

```typescript
// @spec T002-e2e-test-generator
// Auto-generated Page Object template
// TODO: Implement methods according to your application

import { Page, Locator } from '@playwright/test';

export class <PageName>Page {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // TODO: Implement method
  async <method_name>(params: any) {
    // TODO: Add page interaction logic
    throw new Error('Method not implemented');
  }
}
```

**Example**:

```typescript
// @spec T002-e2e-test-generator
import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // TODO: Implement method
  async createAdjustment(data: any) {
    // TODO: Fill adjustment form and submit
    throw new Error('Method not implemented');
  }

  // TODO: Implement method
  async approveAdjustment(adjustmentId: string) {
    // TODO: Click approve button for adjustment
    throw new Error('Method not implemented');
  }
}
```

---

## Internal Data Models

### GenerationContext (内部使用)

**Purpose**: 代码生成过程中传递的上下文对象

```python
@dataclass
class GenerationContext:
    scenario: dict              # 解析后的场景 YAML
    framework: str              # playwright | postman | restclient
    action_mappings: dict       # 加载的 action 映射配置
    assertion_mappings: dict    # 加载的 assertion 映射配置
    output_path: Path           # 输出文件路径
    page_objects: Set[str]      # 需要导入的页面对象集合
    test_data_refs: Set[str]    # 需要加载的测试数据引用
```

### FileMetadata (元数据)

**Purpose**: 跟踪生成文件的元数据（用于更新检测）

```python
@dataclass
class FileMetadata:
    scenario_id: str
    file_path: str
    original_hash: str   # 首次生成时的文件哈希
    generated_at: datetime
    framework: str
```

**Storage**: `scenarios/<module>/.metadata/<scenario_id>.json`

---

## Validation Rules

### E2EScenarioSpec Validation

1. **scenario_id** 格式: `E2E-<MODULE>-\d{3}`
2. **spec_ref** 格式: `[A-Z]\d{3}`
3. **steps** 至少包含 1 个
4. **assertions** 至少包含 1 个
5. **testdata_ref** 格式: `<dataset>.<key>`

### ActionMappings Validation

1. 每个 action 至少定义一个框架映射（playwright | postman | restclient）
2. `code` 字段必填
3. 占位符格式: `{{param_name}}`
4. `imports` 必须为字符串数组

---

## Data Flow Diagram

```
[场景YAML文件]
      ↓
  YAML Parser (PyYAML)
      ↓
[E2EScenarioSpec dict]
      ↓
Framework Detector → [选择框架: playwright/postman/restclient]
      ↓
Load ActionMappings → [加载配置文件]
      ↓
Code Generator (Jinja2)
      ↓
[生成的测试脚本]
      ↓
File Update Detector → [检测是否需要更新]
      ↓
[写入文件 or 生成 .new 文件]
```

---

## References

- Postman Collection v2.1 Schema: https://schema.getpostman.com/json/collection/v2.1.0/
- Playwright Test API: https://playwright.dev/docs/api/class-test
- REST Client Syntax: https://github.com/Huachao/vscode-restclient
- Jinja2 Template Syntax: https://jinja.palletsprojects.com/templates/
