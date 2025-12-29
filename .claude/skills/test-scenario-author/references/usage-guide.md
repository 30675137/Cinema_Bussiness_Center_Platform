# test-scenario-author 使用指南

**@spec T001-e2e-scenario-author**

## 快速开始

### 方式 1: 对话式创建场景

使用 `/test-scenario-author create` 命令通过多轮对话创建场景：

```bash
/test-scenario-author create
```

Claude 将引导你完成以下步骤：
1. 项目规格 ID (spec_ref)
2. 场景标题 (title)
3. 模块选择 (module) - 自动生成 scenario_id
4. 标签设置 (tags): module, channel, deploy, priority, smoke
5. 前置条件 (preconditions): role, testdata_ref
6. 测试步骤 (steps): action, params, description, wait
7. 断言验证 (assertions): type, check, params, timeout

### 方式 2: 模板填充

使用 `/test-scenario-author template` 命令获取 YAML 模板并手动编辑：

```bash
/test-scenario-author template
```

Claude 将显示完整的 YAML 模板，你可以：
1. 复制模板内容
2. 修改所有必需字段
3. 保存到 `scenarios/<module>/<scenario_id>.yaml`
4. 使用 `/test-scenario-author validate <scenario-id>` 验证

## 命令参考

### `/test-scenario-author create`

**用途**: 通过对话创建新场景

**交互流程**: 见 [skill.md](../skill.md) 详细工作流

**示例**:
```
/test-scenario-author create
```

**输出**:
```
✅ Scenario created: scenarios/order/E2E-ORDER-001.yaml
Generated scenario_id: E2E-ORDER-001
You can now validate this scenario with `/test-scenario-author validate E2E-ORDER-001`
```

---

### `/test-scenario-author template`

**用途**: 获取 YAML 模板用于手动编辑

**交互流程**:
1. 显示模板路径
2. 显示模板内容
3. 提供编辑指导
4. 提供验证指导

**示例**:
```
/test-scenario-author template
```

---

### `/test-scenario-author list`

**用途**: 列出和筛选场景

**命令变体**:
```bash
# 列出所有场景
/test-scenario-author list

# 按模块筛选
/test-scenario-author list --module order

# 按 spec_ref 筛选
/test-scenario-author list --spec-ref P005

# 按标签筛选
/test-scenario-author list --tags module:order
/test-scenario-author list --tags module:order,channel:miniapp

# 组合筛选
/test-scenario-author list --module order --tags channel:miniapp
```

**输出示例**:
```
| Scenario ID | Spec Ref | Title | Tags | File Path |
|-------------|----------|-------|------|-----------|
| E2E-ORDER-001 | O003 | 用户下单并支付流程 | module:[order, payment], channel:[miniapp], deploy:[saas] | scenarios/order/E2E-ORDER-001.yaml |
| E2E-ORDER-002 | O003 | 订单取消流程 | module:[order], channel:[web], deploy:[saas] | scenarios/order/E2E-ORDER-002.yaml |
```

---

## 常见用例

### 用例 1: 创建订单场景

**场景**: 用户下单并完成支付

**操作**:
```bash
/test-scenario-author create
```

**关键信息**:
- **spec_ref**: O003
- **title**: "用户下单并支付流程"
- **module**: order
- **tags**:
  - module: [order, payment]
  - channel: [miniapp]
  - deploy: [saas]
  - priority: p1
  - smoke: true
- **preconditions**:
  - role: normal_user
  - testdata_ref: orderTestData.user_001
- **steps**:
  1. login (testdata_ref: orderTestData.user_001)
  2. browse_product (testdata_ref: orderTestData.product_popcorn)
  3. add_to_cart (quantity: 2)
  4. checkout
  5. pay (testdata_ref: orderTestData.payment_wechat)
- **assertions**:
  1. ui: element_visible (element: order_success_page)
  2. api: database_field_equals (table: orders, field: status, expected: "paid")

**生成文件**: `scenarios/order/E2E-ORDER-001.yaml`

---

### 用例 2: 创建库存调整场景

**场景**: 管理员调整库存并审批

**操作**:
```bash
/test-scenario-author create
```

**关键信息**:
- **spec_ref**: P005
- **title**: "库存调整并审批"
- **module**: inventory
- **tags**:
  - module: [inventory]
  - channel: [web]
  - deploy: [saas, onprem]
  - priority: p1
- **preconditions**:
  - role: admin
  - testdata_ref: inventoryTestData.admin_user
- **steps**:
  1. login (testdata_ref: inventoryTestData.admin_user)
  2. navigate (page: inventory_management)
  3. adjust_inventory (testdata_ref: inventoryTestData.adjustment_001, reason: surplus)
  4. approve_adjustment (testdata_ref: inventoryTestData.approval_001)
- **assertions**:
  1. ui: toast_message_shown (message: "调整成功")
  2. api: database_field_equals (table: inventory_adjustments, field: status, expected: "approved")

**生成文件**: `scenarios/inventory/E2E-INVENTORY-001.yaml`

---

### 用例 3: 手动编辑模板

**场景**: 你更喜欢直接编辑 YAML 而非对话

**操作**:

1. 获取模板:
   ```bash
   /test-scenario-author template
   ```

2. 复制模板内容到新文件 `scenarios/store/E2E-STORE-001.yaml`

3. 编辑文件:
   ```yaml
   scenario_id: E2E-STORE-001
   spec_ref: S017
   title: 门店 CRUD 操作
   description: 验证门店创建、编辑、删除流程

   tags:
     module: [store]
     channel: [web]
     deploy: [saas]
     priority: p1

   preconditions:
     role: admin
     testdata_ref: storeTestData.admin_user

   steps:
     - action: login
       params:
         testdata_ref: storeTestData.admin_user

     - action: navigate
       params:
         page: store_management

     - action: create_store
       params:
         testdata_ref: storeTestData.new_store

     - action: edit_store
       params:
         testdata_ref: storeTestData.edit_store

     - action: delete_store
       params:
         testdata_ref: storeTestData.delete_store

   assertions:
     - type: ui
       check: toast_message_shown
       params:
         message: "门店删除成功"

     - type: api
       check: database_record_exists
       params:
         table: stores
         where:
           testdata_ref: storeTestData.delete_store
           status: deleted
   ```

4. 验证场景:
   ```bash
   /test-scenario-author validate E2E-STORE-001
   ```

---

## 最佳实践

### 1. 场景 ID 命名

- **格式**: `E2E-<MODULE>-<NUMBER>`
- **模块大写**: ORDER, INVENTORY, STORE, PAYMENT, USER
- **编号三位数**: 001, 002, ..., 999
- **唯一性**: 每个场景 ID 必须唯一

**正确示例**:
- `E2E-ORDER-001`
- `E2E-INVENTORY-042`
- `E2E-PAYMENT-999`

**错误示例**:
- `E2E-order-1` (模块应大写，编号应三位数)
- `E2E-ORDER-1234` (编号超过三位)
- `order-001` (缺少 E2E 前缀)

### 2. 使用 testdata_ref 而非硬编码

**❌ 错误做法**:
```yaml
steps:
  - action: select_store
    params:
      store_name: "北京王府井店"
      store_id: "store-001"
```

**✅ 正确做法**:
```yaml
steps:
  - action: select_store
    params:
      testdata_ref: storeTestData.beijing_store
```

### 3. 标签设置

**必需标签**:
- `module`: 至少一个模块 (如 [order], [inventory, payment])
- `channel`: 至少一个渠道 (如 [miniapp], [web, h5])
- `deploy`: 至少一个部署类型 (如 [saas], [saas, onprem])

**可选标签**:
- `priority`: p1 (高), p2 (中), p3 (低)
- `smoke`: true/false (冒烟测试标识)
- 自定义标签: 遵循命名规范 (小写字母 + 下划线)

**示例**:
```yaml
tags:
  module: [order, payment, inventory]
  channel: [miniapp]
  deploy: [saas, onprem]
  priority: p1
  smoke: true
  custom_promotion: true
```

### 4. 步骤和断言

**步骤至少 1 个，断言至少 1 个**:
```yaml
steps:
  - action: login
    params:
      testdata_ref: userTestData.user_001
  # ... 更多步骤

assertions:
  - type: ui
    check: element_visible
    params:
      element: success_message
  # ... 更多断言
```

### 5. 模块和文件组织

**目录结构**:
```
scenarios/
├── order/           # 订单模块
│   ├── E2E-ORDER-001.yaml
│   ├── E2E-ORDER-002.yaml
│   └── E2E-ORDER-003.yaml
├── inventory/       # 库存模块
│   ├── E2E-INVENTORY-001.yaml
│   └── E2E-INVENTORY-002.yaml
├── store/           # 门店模块
│   └── E2E-STORE-001.yaml
└── payment/         # 支付模块
    └── E2E-PAYMENT-001.yaml
```

**模块命名规范**:
- 小写字母
- 可包含数字、下划线、连字符
- 不能包含空格或特殊字符

**正确示例**: order, inventory, store_management, payment-processing

**错误示例**: Order, store management, payment&processing

---

## 常见问题

### Q1: 如何选择 action 名称？

**A**: 参考 E2EScenarioSpec 文档中的常用 actions：
- **用户操作**: login, logout, navigate, click, input, select, submit
- **业务操作**: browse_product, add_to_cart, checkout, pay, create_order, cancel_order, adjust_inventory, approve_adjustment

如果没有合适的，使用描述性动词 + 名词组合 (如 `create_reservation`, `update_profile`)。

### Q2: 如何知道使用哪些 assertion checks？

**A**: 根据验证类型选择：

**UI Assertions** (验证页面状态):
- `element_visible` - 验证元素可见
- `element_contains_text` - 验证元素包含文本
- `page_url_matches` - 验证 URL
- `toast_message_shown` - 验证提示消息

**API Assertions** (验证后端数据):
- `response_status_is` - 验证 HTTP 状态码
- `response_body_contains` - 验证响应体内容
- `database_record_exists` - 验证数据库记录存在
- `database_field_equals` - 验证数据库字段值

### Q3: scenario_id 冲突怎么办？

**A**: `/test-scenario-author create` 命令会自动检测冲突并生成下一个可用 ID。

如果手动创建场景 ID 冲突:
1. 检查 `scenarios/<module>/` 目录下现有文件
2. 使用下一个编号 (如已有 E2E-ORDER-001, 使用 E2E-ORDER-002)

### Q4: 如何处理多模块场景？

**A**: 在 tags.module 中列出所有相关模块：

```yaml
tags:
  module: [order, payment, inventory]  # 订单涉及支付和库存
  channel: [miniapp]
  deploy: [saas]
```

scenario_id 使用主要模块 (如 `E2E-ORDER-001`)。

### Q5: 前置条件中的 testdata_ref 是必需的吗？

**A**: 不是必需的。只有 `preconditions.role` 是必需的。

```yaml
# 最小配置
preconditions:
  role: normal_user

# 完整配置
preconditions:
  role: admin
  testdata_ref: storeTestData.admin_user
```

---

## 下一步

场景创建完成后，建议：

1. **验证场景**: `/test-scenario-author validate <scenario-id>`
2. **查看场景列表**: `/test-scenario-author list` (需要先实现用户故事 2)
3. **编辑场景**: `/test-scenario-author edit <scenario-id>` (需要先实现用户故事 3)

---

## 参考资料

- [E2EScenarioSpec 格式规范](./e2e-scenario-spec.md)
- [Skill 主文档](../skill.md)
- [JSON Schema 验证规则](../assets/templates/scenario-schema.json)
- [基础 YAML 模板](../assets/templates/base-scenario.yaml)
- [项目规格文档](../../../specs/T001-e2e-scenario-author/spec.md)
