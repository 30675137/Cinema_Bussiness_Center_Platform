# Data Model: E2EScenarioSpec YAML Schema

**Feature**: T005-e2e-scenario-author
**Date**: 2025-12-29
**Purpose**: Define the structure and validation rules for E2E test scenario YAML files

## Overview

E2EScenarioSpec 定义了 E2E 测试场景的标准化 YAML 格式,用于描述测试步骤、断言和执行配置,同时确保场景与环境配置和具体测试数据解耦。

## Core Entities

### 1. E2EScenarioSpec (Root Entity)

**Purpose**: 描述单个 E2E 测试场景的完整信息

**Fields**:

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| `scenario_id` | string | ✅ | 场景唯一标识符 | 格式: `E2E-<MODULE>-<NUMBER>` (如 `E2E-ORDER-001`) |
| `spec_ref` | string | ✅ | 关联的项目规格 ID | 格式: `X###` (如 `P005`, `O003`) |
| `title` | string | ✅ | 场景标题 | 1-100 字符,描述性 |
| `description` | string | ❌ | 场景详细描述 | 可选,补充说明 |
| `tags` | object | ✅ | 多维度标签 | 必须包含 `module`, `channel`, `deploy` |
| `preconditions` | object | ✅ | 前置条件 | 包含 `role` 和可选 `testdata_ref` |
| `steps` | array | ✅ | 测试步骤序列 | 至少 1 个步骤 |
| `assertions` | array | ✅ | 断言验证点 | 至少 1 个断言 |
| `artifacts` | object | ❌ | 工件捕获配置 | 可选,默认值见下文 |
| `metadata` | object | ❌ | 元数据 | 可选,包含创建时间、作者等 |

**Example**:
```yaml
scenario_id: E2E-ORDER-001
spec_ref: O003
title: 用户下单并支付流程
description: 验证用户从浏览商品到完成支付的完整流程
tags:
  module: [order, payment]
  channel: [miniapp]
  deploy: [saas]
  priority: p1
preconditions:
  role: normal_user
  testdata_ref: orderTestData.user_001
steps:
  - action: login
    params:
      testdata_ref: orderTestData.user_001
  - action: browse_product
    params:
      testdata_ref: orderTestData.product_popcorn
  - action: add_to_cart
    params:
      quantity: 2
  - action: checkout
  - action: pay
    params:
      testdata_ref: orderTestData.payment_wechat
assertions:
  - type: ui
    check: order_success_page_visible
  - type: api
    check: order_status_is_paid
artifacts:
  trace: on-failure
  video: on-failure
metadata:
  created_at: "2025-12-29T10:00:00Z"
  created_by: qa_engineer
```

---

### 2. Tags (标签对象)

**Purpose**: 多维度分类和筛选场景

**Standard Dimensions**:

| Dimension | Type | Required | Valid Values | Description |
|-----------|------|----------|--------------|-------------|
| `module` | array[string] | ✅ | order, inventory, store, hall, payment, user, etc. | 功能模块 |
| `channel` | array[string] | ✅ | miniapp, h5, web, app | 渠道类型 |
| `deploy` | array[string] | ✅ | saas, onprem | 部署类型 |
| `priority` | string | ❌ | p1, p2, p3 | 优先级(从 spec.md 提取) |
| `smoke` | boolean | ❌ | true/false | 是否为冒烟测试 |

**Validation Rules**:
- 每个维度的值必须为数组(支持多值)
- 必须包含 `module`, `channel`, `deploy` 三个维度
- 自定义标签允许,但需遵循命名规范(小写字母+下划线)

**Example**:
```yaml
tags:
  module: [order, payment, inventory]
  channel: [miniapp]
  deploy: [saas, onprem]
  priority: p1
  smoke: true
  custom_tag: special_promotion
```

---

### 3. Preconditions (前置条件)

**Purpose**: 定义场景执行前的必要条件

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `role` | string | ✅ | 用户角色 | admin, normal_user, guest, manager 等 |
| `testdata_ref` | string | ❌ | 测试数据引用 | 格式: `<dataset>.<key>` |
| `environment` | string | ❌ | 环境要求 | 禁止使用(违反解耦原则) |

**Example**:
```yaml
preconditions:
  role: admin
  testdata_ref: storeTestData.store_001
```

---

### 4. Step (测试步骤)

**Purpose**: 定义场景中的单个操作

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `action` | string | ✅ | 操作名称 | login, browse_product, add_to_cart, checkout, pay 等 |
| `params` | object | ❌ | 操作参数 | 禁止硬编码具体数据,必须使用 testdata_ref |
| `description` | string | ❌ | 步骤说明 | 可选补充说明 |
| `wait` | integer | ❌ | 等待时间(毫秒) | 可选,用于异步操作 |

**Decoupling Rules**:
- ❌ 禁止: `params: { url: "https://example.com" }`
- ❌ 禁止: `params: { store_id: "store-001" }`
- ✅ 允许: `params: { testdata_ref: "storeTestData.store_001" }`
- ✅ 允许: `params: { quantity: 2 }` (业务逻辑参数)

**Common Actions**:
- `login` - 用户登录
- `logout` - 用户登出
- `navigate` - 页面导航
- `click` - 点击元素
- `input` - 输入文本
- `select` - 选择选项
- `submit` - 提交表单
- `browse_product` - 浏览商品
- `add_to_cart` - 添加到购物车
- `checkout` - 结账
- `pay` - 支付
- `create_order` - 创建订单
- `cancel_order` - 取消订单
- `adjust_inventory` - 调整库存
- `approve_adjustment` - 审批调整

**Example**:
```yaml
steps:
  - action: login
    params:
      testdata_ref: userTestData.admin_user
    description: 使用管理员账号登录
  - action: navigate
    params:
      page: inventory_management
  - action: adjust_inventory
    params:
      testdata_ref: inventoryTestData.adjustment_001
      reason: surplus
    wait: 1000
```

---

### 5. Assertion (断言)

**Purpose**: 定义验证点,判断测试通过或失败

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `type` | string | ✅ | 断言类型 | `ui` 或 `api` |
| `check` | string | ✅ | 断言条件 | 描述预期结果 |
| `params` | object | ❌ | 断言参数 | 可选,提供具体检查条件 |
| `timeout` | integer | ❌ | 超时时间(毫秒) | 默认 5000 |

**Assertion Types**:

#### UI Assertions
验证 UI 状态和元素:
- `element_visible` - 元素可见
- `element_contains_text` - 元素包含文本
- `page_url_matches` - 页面 URL 匹配
- `toast_message_shown` - 提示信息显示
- `modal_opened` - 模态框打开
- `list_item_count` - 列表项数量

#### API Assertions
验证 API 响应:
- `response_status_is` - 响应状态码
- `response_body_contains` - 响应体包含
- `database_record_exists` - 数据库记录存在
- `database_field_equals` - 数据库字段值匹配

**Example**:
```yaml
assertions:
  - type: ui
    check: toast_message_shown
    params:
      message: "订单创建成功"
    timeout: 3000
  - type: api
    check: response_status_is
    params:
      expected: 200
  - type: api
    check: database_record_exists
    params:
      table: orders
      where:
        testdata_ref: orderTestData.order_001
```

---

### 6. Artifacts (工件配置)

**Purpose**: 配置测试执行工件的捕获策略

**Fields**:

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `trace` | string | ❌ | Playwright trace 捕获策略 | `on`, `off`, `on-failure`, `retain-on-failure` |
| `video` | string | ❌ | 视频录制策略 | `on`, `off`, `on-failure`, `retain-on-failure` |
| `screenshot` | string | ❌ | 截图策略 | `on`, `off`, `only-on-failure` |

**Default Values**:
```yaml
artifacts:
  trace: on-failure
  video: on-failure
  screenshot: only-on-failure
```

**Example**:
```yaml
artifacts:
  trace: retain-on-failure
  video: on
  screenshot: on
```

---

### 7. Metadata (元数据)

**Purpose**: 记录场景的创建和修改信息

**Fields**:

| Field | Type | Required | Description | Format |
|-------|------|----------|-------------|--------|
| `created_at` | string | ❌ | 创建时间 | ISO 8601 (如 `2025-12-29T10:00:00Z`) |
| `created_by` | string | ❌ | 创建者 | 用户名或邮箱 |
| `updated_at` | string | ❌ | 最后更新时间 | ISO 8601 |
| `updated_by` | string | ❌ | 最后更新者 | 用户名或邮箱 |
| `version` | string | ❌ | 版本号 | 语义化版本(如 `1.0.0`) |

**Example**:
```yaml
metadata:
  created_at: "2025-12-29T10:00:00Z"
  created_by: qa_engineer@example.com
  updated_at: "2025-12-29T15:30:00Z"
  updated_by: qa_lead@example.com
  version: "1.1.0"
```

---

## JSON Schema Definition

完整的 JSON Schema 定义见 `.claude/skills/scenario-author/assets/templates/scenario-schema.json`

**Key Validation Rules**:

1. **Required Fields**:
   - scenario_id, spec_ref, title, tags, preconditions, steps, assertions

2. **Format Validation**:
   - `scenario_id`: 正则 `^E2E-[A-Z]+-\d{3}$`
   - `spec_ref`: 正则 `^[A-Z]\d{3}$`
   - `tags.module`, `tags.channel`, `tags.deploy`: 非空数组

3. **Decoupling Validation**:
   - 禁止字段: `environment`, `baseURL`, `tenant`
   - `steps[].params` 中禁止包含 URL、ID(除 testdata_ref)

4. **Array Constraints**:
   - `steps`: minItems = 1
   - `assertions`: minItems = 1
   - `tags.module`: minItems = 1

---

## Relationships

```
E2EScenarioSpec
│
├── spec_ref ──────> Project Spec (specs/X###-*/spec.md)
│
├── tags
│   ├── module ───> Business Module
│   ├── channel ──> Platform Channel
│   └── deploy ───> Deployment Type
│
├── preconditions
│   └── testdata_ref ──> Test Data Definition (external)
│
├── steps[]
│   ├── action
│   └── params
│       └── testdata_ref ──> Test Data Definition
│
├── assertions[]
│   ├── type (ui/api)
│   └── check
│
└── artifacts
    ├── trace
    └── video
```

---

## Storage & Access Patterns

### File Storage

**Location**: `scenarios/<module>/<scenario_id>.yaml`

**Naming Convention**:
- 文件名 = `scenario_id` + `.yaml`
- 示例: `scenarios/order/E2E-ORDER-001.yaml`

**Directory Structure**:
```
scenarios/
├── order/
│   ├── E2E-ORDER-001.yaml
│   ├── E2E-ORDER-002.yaml
│   └── E2E-ORDER-003.yaml
├── inventory/
│   ├── E2E-INVENTORY-001.yaml
│   └── E2E-INVENTORY-002.yaml
├── store/
│   └── E2E-STORE-001.yaml
└── payment/
    └── E2E-PAYMENT-001.yaml
```

### Query Patterns

1. **List All Scenarios**: `glob('scenarios/**/*.yaml')`
2. **Filter by Module**: `glob('scenarios/order/*.yaml')`
3. **Filter by spec_ref**: 遍历所有文件,解析 YAML 匹配 `spec_ref: "P005"`
4. **Filter by Tags**: 解析 YAML,检查 `tags.module` 包含指定值
5. **Check ID Conflict**: 检查 `scenarios/` 下是否存在同名文件

### Indexing Strategy (Future Optimization)

对于 > 500 个场景,可创建索引文件:

**Index File**: `scenarios/.index.json`
```json
{
  "E2E-ORDER-001": {
    "path": "order/E2E-ORDER-001.yaml",
    "spec_ref": "O003",
    "title": "用户下单并支付流程",
    "tags": {
      "module": ["order", "payment"],
      "channel": ["miniapp"],
      "deploy": ["saas"]
    }
  },
  "E2E-INVENTORY-001": {
    "path": "inventory/E2E-INVENTORY-001.yaml",
    "spec_ref": "P005",
    "title": "BOM 库存扣减",
    "tags": {
      "module": ["inventory"],
      "channel": ["web"],
      "deploy": ["saas", "onprem"]
    }
  }
}
```

---

## Validation Rules Summary

### Environment Decoupling

**禁止字段**:
- `environment`
- `baseURL`
- `tenant`
- `domain`
- 任何包含 `http://` 或 `https://` 的值

**禁止硬编码数据**:
- 门店 ID (如 `store-001`)
- SKU ID (如 `sku-12345`)
- 用户 ID (如 `user-001`)
- 价格 (如 `19.99`)
- 促销码 (如 `SUMMER2025`)

**正确做法**:
使用 `testdata_ref` 引用外部数据定义:
```yaml
params:
  testdata_ref: storeTestData.beijing_store
```

### Data Decoupling

**禁止在 steps 中内联数据**:
```yaml
# ❌ 错误
steps:
  - action: select_store
    params:
      store_name: "北京王府井店"
      store_id: "store-001"

# ✅ 正确
steps:
  - action: select_store
    params:
      testdata_ref: storeTestData.beijing_store
```

### ID Uniqueness

- `scenario_id` 必须在所有场景中唯一
- 创建前检查 `scenarios/` 目录下是否存在同名文件
- 冲突时自动递增编号(如 `E2E-ORDER-001` → `E2E-ORDER-002`)

---

## State Transitions

场景本身无状态转换,但可用于测试业务对象的状态转换:

**Example**: 订单状态转换场景
```yaml
scenario_id: E2E-ORDER-002
title: 订单状态从待支付到已支付转换
steps:
  - action: create_order
    params:
      testdata_ref: orderTestData.order_pending
  - action: pay
    params:
      testdata_ref: orderTestData.payment_wechat
assertions:
  - type: api
    check: database_field_equals
    params:
      table: orders
      field: status
      expected: "paid"
```

---

## Future Extensions

### Planned Features

1. **Scenario Composition**:
   - 引用其他场景作为步骤
   - 场景复用和模块化

2. **Conditional Steps**:
   - 基于条件执行不同步骤
   - 支持 if-else 逻辑

3. **Data-Driven Testing**:
   - 支持参数化场景
   - 同一场景多组测试数据

4. **Retry Configuration**:
   - 步骤级别的重试策略
   - 断言失败自动重试

### Not Planned

- 场景执行引擎(由独立工具负责)
- 测试数据生成(由测试数据工具负责)
- 环境配置管理(由 RunConfig 工具负责)

---

## Conclusion

E2EScenarioSpec 数据模型通过严格的 YAML schema 定义和解耦原则,确保测试场景的标准化、可复用性和可维护性。Schema 支持丰富的元数据、多维度标签和灵活的断言机制,为 E2E 测试提供强大的描述能力。
