# E2E Scenario Specification (E2EScenarioSpec)

**@spec T001-e2e-scenario-author**

## 概述

E2EScenarioSpec 定义了 E2E 测试场景的标准化 YAML 格式,用于描述测试步骤、断言和执行配置,同时确保场景与环境配置和具体测试数据解耦。

## 核心字段

### scenario_id (必需)

- **类型**: string
- **格式**: `E2E-<MODULE>-<NUMBER>`
- **示例**: `E2E-ORDER-001`, `E2E-INVENTORY-002`
- **说明**: 场景唯一标识符,必须在所有场景中唯一

### spec_ref (必需)

- **类型**: string
- **格式**: `X###` (模块字母 + 三位数字)
- **示例**: `P005`, `O003`, `S017`
- **说明**: 关联的项目规格 ID

### title (必需)

- **类型**: string
- **长度**: 1-100 字符
- **示例**: "用户下单并支付流程"
- **说明**: 场景标题,应清晰描述测试目的

### description (可选)

- **类型**: string
- **说明**: 场景详细描述,补充说明

### tags (必需)

- **类型**: object
- **必需维度**: module, channel, deploy
- **示例**:
  ```yaml
  tags:
    module: [order, payment]
    channel: [miniapp]
    deploy: [saas]
    priority: p1
    smoke: true
  ```

**标准标签维度**:

| 维度 | 类型 | 必需 | 有效值 |
|------|------|------|--------|
| module | array[string] | ✅ | order, inventory, store, hall, payment, user, etc. |
| channel | array[string] | ✅ | miniapp, h5, web, app |
| deploy | array[string] | ✅ | saas, onprem |
| priority | string | ❌ | p1, p2, p3 |
| smoke | boolean | ❌ | true/false |

### preconditions (必需)

- **类型**: object
- **必需字段**: role
- **示例**:
  ```yaml
  preconditions:
    role: admin
    testdata_ref: storeTestData.store_001
  ```

**字段说明**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| role | string | ✅ | 用户角色: admin, normal_user, guest, manager |
| testdata_ref | string | ❌ | 测试数据引用,格式: `<dataset>.<key>` |

### steps (必需)

- **类型**: array
- **最小项数**: 1
- **示例**:
  ```yaml
  steps:
    - action: login
      params:
        testdata_ref: userTestData.admin_user
      description: 使用管理员账号登录
      wait: 1000

    - action: navigate
      params:
        page: inventory_management

    - action: adjust_inventory
      params:
        testdata_ref: inventoryTestData.adjustment_001
        reason: surplus
  ```

**Step 字段**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| action | string | ✅ | 操作名称 (login, navigate, click, input, etc.) |
| params | object | ❌ | 操作参数,必须使用 testdata_ref |
| description | string | ❌ | 步骤说明 |
| wait | integer | ❌ | 等待时间(毫秒) |

**常用 Actions**:
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

### assertions (必需)

- **类型**: array
- **最小项数**: 1
- **示例**:
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
  ```

**Assertion 字段**:

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| type | string | ✅ | 断言类型: `ui` 或 `api` |
| check | string | ✅ | 断言条件 |
| params | object | ❌ | 断言参数 |
| timeout | integer | ❌ | 超时时间(毫秒),默认 5000 |

**UI Assertions**:
- `element_visible` - 元素可见
- `element_contains_text` - 元素包含文本
- `page_url_matches` - 页面 URL 匹配
- `toast_message_shown` - 提示信息显示

**API Assertions**:
- `response_status_is` - 响应状态码
- `response_body_contains` - 响应体包含
- `database_record_exists` - 数据库记录存在
- `database_field_equals` - 数据库字段值匹配

### artifacts (可选)

- **类型**: object
- **默认值**: trace: on-failure, video: on-failure, screenshot: only-on-failure
- **示例**:
  ```yaml
  artifacts:
    trace: retain-on-failure
    video: on
    screenshot: on
  ```

**字段说明**:

| 字段 | 类型 | 有效值 |
|------|------|--------|
| trace | string | on, off, on-failure, retain-on-failure |
| video | string | on, off, on-failure, retain-on-failure |
| screenshot | string | on, off, only-on-failure |

### metadata (可选)

- **类型**: object
- **示例**:
  ```yaml
  metadata:
    created_at: "2025-12-30T00:00:00Z"
    created_by: qa_engineer@example.com
    updated_at: "2025-12-30T15:30:00Z"
    updated_by: qa_lead@example.com
    version: "1.1.0"
  ```

## 解耦原则

### 环境解耦

**❌ 禁止字段**:
- `environment`
- `baseURL`
- `tenant`
- `domain`
- 任何包含 `http://` 或 `https://` 的值

### 数据解耦

**❌ 禁止硬编码数据**:
- 门店 ID (如 `store-001`)
- SKU ID (如 `sku-12345`)
- 用户 ID (如 `user-001`)
- 价格 (如 `19.99`)
- 促销码 (如 `SUMMER2025`)

**✅ 正确做法**:
使用 `testdata_ref` 引用外部数据定义:

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

## 文件存储

**位置**: `scenarios/<module>/<scenario_id>.yaml`

**命名约定**:
- 文件名 = `scenario_id` + `.yaml`
- 示例: `scenarios/order/E2E-ORDER-001.yaml`

**目录结构**:
```
scenarios/
├── order/
│   ├── E2E-ORDER-001.yaml
│   ├── E2E-ORDER-002.yaml
│   └── E2E-ORDER-003.yaml
├── inventory/
│   ├── E2E-INVENTORY-001.yaml
│   └── E2E-INVENTORY-002.yaml
└── store/
    └── E2E-STORE-001.yaml
```

## 完整示例

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
  smoke: true

preconditions:
  role: normal_user
  testdata_ref: orderTestData.user_001

steps:
  - action: login
    params:
      testdata_ref: orderTestData.user_001
    description: 用户登录

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
    check: element_visible
    params:
      element: order_success_page

  - type: api
    check: database_field_equals
    params:
      table: orders
      field: status
      expected: "paid"

artifacts:
  trace: on-failure
  video: on-failure

metadata:
  created_at: "2025-12-30T00:00:00Z"
  created_by: qa_engineer
  version: "1.0.0"
```

## 验证规则

1. **必需字段**: scenario_id, spec_ref, title, tags, preconditions, steps, assertions
2. **格式验证**:
   - `scenario_id` 正则: `^E2E-[A-Z]+-\d{3}$`
   - `spec_ref` 正则: `^[A-Z]\d{3}$`
3. **标签验证**: tags.module, tags.channel, tags.deploy 必须为非空数组
4. **解耦验证**: 禁止包含环境字段和硬编码数据
5. **数组约束**: steps 和 assertions 至少各有 1 项

## 参考

- 完整 JSON Schema: `.claude/skills/test-scenario-author/assets/templates/scenario-schema.json`
- 基础模板: `.claude/skills/test-scenario-author/assets/templates/base-scenario.yaml`
- 详细数据模型: `specs/T001-e2e-scenario-author/data-model.md`
