# Quickstart Guide: scenario-author Skill

**Feature**: T001-e2e-scenario-author
**Date**: 2025-12-29
**Purpose**: 快速上手使用 `/scenario-author` skill 创建和管理 E2E 测试场景

## Prerequisites

在使用 skill 前,确保:

1. **Claude Code CLI** 已安装并配置
2. **Python 3.8+** 已安装(用于辅助脚本)
3. **Git** 仓库已初始化(场景文件需版本控制)
4. **项目根目录**: 位于影院商品管理中台项目根目录

## Installation

Skill 文件位于项目仓库的 `.claude/skills/scenario-author/` 目录下,无需额外安装。

## Basic Usage

### 1. 创建新场景(对话式)

```bash
# 在 Claude Code CLI 中输入
/scenario-author create
```

**对话流程**:
1. Skill 询问场景需求(功能描述、关联的 spec)
2. 引导选择模块(order, inventory, store 等)
3. 收集标签(channel, deploy, priority)
4. 定义测试步骤(actions)
5. 定义断言(assertions)
6. 生成并保存 YAML 文件到 `scenarios/<module>/`

**示例对话**:
```
Skill: 请描述要创建的测试场景
User: 测试用户在小程序下单并支付的流程,关联规格 O003

Skill: 场景属于哪个模块?(order, inventory, store, payment)
User: order, payment

Skill: 场景面向哪些渠道?(miniapp, h5, web)
User: miniapp

Skill: 部署类型?(saas, onprem)
User: saas

Skill: 请描述测试步骤(用自然语言,我会转换为 YAML actions)
User:
1. 用户登录小程序
2. 浏览爆米花商品
3. 添加 2 件到购物车
4. 进入结账页面
5. 使用微信支付

Skill: 请描述预期结果(我会转换为 assertions)
User:
- UI 显示订单成功页面
- 订单状态为已支付
- 库存减少 2 件

Skill: 正在生成场景 YAML 文件...
✅ 场景已创建: scenarios/order/E2E-ORDER-001.yaml
```

---

### 2. 使用模板填充

```bash
/scenario-author template
```

**工作流**:
1. Skill 提供 `base-scenario.yaml` 模板
2. 用户手动编辑 YAML 文件
3. Skill 验证格式并保存

**模板示例** (已包含注释说明):
```yaml
scenario_id: E2E-<MODULE>-<NUMBER>  # 修改为实际值
spec_ref: X###  # 如 P005, O003
title: 场景标题
tags:
  module: [module_name]  # 如 order, inventory
  channel: [channel_name]  # 如 miniapp, web
  deploy: [deploy_type]  # 如 saas, onprem
preconditions:
  role: normal_user
  testdata_ref: testDataset.key  # 可选
steps:
  - action: login
    params:
      testdata_ref: userTestData.user_001
  - action: # 添加更多步骤
assertions:
  - type: ui
    check: element_visible
  - type: api
    check: # 添加更多断言
```

---

### 3. 从 spec.md 自动生成场景

```bash
# 批量生成指定规格的所有场景
/scenario-author generate --spec P005

# 或指定spec.md 文件路径
/scenario-author generate --spec-file specs/P005-bom-inventory-deduction/spec.md
```

**工作流**:
1. 解析 spec.md 提取用户故事和验收场景
2. 识别 "假设-当-那么" 格式
3. 自动转换为 YAML steps 和 assertions
4. 为每个验收场景生成独立 YAML 文件
5. 输出生成摘要报告

**示例输出**:
```
正在解析规格文档: specs/P005-bom-inventory-deduction/spec.md
发现 4 个用户故事,12 个验收场景

生成进度:
✅ E2E-INVENTORY-001.yaml - BOM 库存扣减 - 单商品扣减
✅ E2E-INVENTORY-002.yaml - BOM 库存扣减 - 多商品组合扣减
✅ E2E-INVENTORY-003.yaml - 库存不足处理 - 部分库存不足
... (省略)

生成完成:
- 总计生成: 12 个场景
- 存储位置: scenarios/inventory/
- 需人工补充: 3 个场景(包含 TODO 标记)

待补充场景:
1. E2E-INVENTORY-005.yaml - 步骤 3 待补充具体参数
2. E2E-INVENTORY-008.yaml - 断言条件需明确
3. E2E-INVENTORY-011.yaml - 复杂业务规则需细化
```

---

### 4. 验证场景

```bash
# 验证单个场景
/scenario-author validate E2E-ORDER-001

# 验证某个模块的所有场景
/scenario-author validate --module order
```

**验证项**:
- ✅ YAML 语法正确性
- ✅ 必需字段完整性(scenario_id, spec_ref, title, steps, assertions)
- ✅ scenario_id 格式和唯一性
- ✅ 环境解耦原则(禁止硬编码 URL/环境标识)
- ✅ 数据解耦原则(禁止硬编码具体数据,必须使用 testdata_ref)
- ✅ Tags 完整性(必须包含 module, channel, deploy)
- ✅ JSON Schema 结构验证

**示例输出**:
```
验证场景: scenarios/order/E2E-ORDER-001.yaml

✅ YAML 语法正确
✅ 必需字段完整
✅ scenario_id 格式正确: E2E-ORDER-001
✅ scenario_id 无冲突
✅ 环境解耦验证通过
❌ 数据解耦验证失败

错误详情:
- 步骤 2 (browse_product): params.store_id = "store-001" - 违反数据解耦原则
  建议: 使用 testdata_ref: storeTestData.store_001

修复建议:
将以下内容:
  - action: browse_product
    params:
      store_id: "store-001"

修改为:
  - action: browse_product
    params:
      testdata_ref: storeTestData.beijing_store
```

---

### 5. 列出和筛选场景

```bash
# 列出所有场景
/scenario-author list

# 按模块筛选
/scenario-author list --module order

# 按规格筛选
/scenario-author list --spec-ref P005

# 按标签筛选(多个条件 AND)
/scenario-author list --tags module:order,channel:miniapp

# 组合筛选
/scenario-author list --module inventory --tags deploy:saas
```

**示例输出**:
```
场景列表 (共 15 个):

| scenario_id        | spec_ref | title                  | tags                              | 文件路径                            |
|--------------------|----------|------------------------|-----------------------------------|-------------------------------------|
| E2E-ORDER-001      | O003     | 用户下单并支付流程     | order,payment / miniapp / saas    | scenarios/order/E2E-ORDER-001.yaml  |
| E2E-ORDER-002      | O003     | 订单取消流程           | order / miniapp / saas            | scenarios/order/E2E-ORDER-002.yaml  |
| E2E-INVENTORY-001  | P005     | BOM 库存扣减           | inventory / web / saas,onprem     | scenarios/inventory/E2E-INVENTORY-001.yaml |
... (省略)

筛选条件: module=order, tags=channel:miniapp
```

---

### 6. 编辑现有场景

```bash
/scenario-author edit E2E-ORDER-001
```

**工作流**:
1. Skill 读取场景 YAML 文件并显示内容
2. 用户描述要修改的内容
3. Skill 更新 YAML 并保存
4. Git 记录变更历史

**示例对话**:
```
Skill: 已加载场景: scenarios/order/E2E-ORDER-001.yaml

当前场景:
- scenario_id: E2E-ORDER-001
- title: 用户下单并支付流程
- 步骤数: 5
- 断言数: 3

请描述要修改的内容

User: 在步骤 3 (add_to_cart) 后添加新步骤: 应用优惠券

Skill: 正在添加新步骤...
  - action: apply_coupon
    params:
      testdata_ref: couponTestData.summer_discount

是否保存?(yes/no)

User: yes

Skill: ✅ 场景已更新并保存
提示: 使用 `git diff scenarios/order/E2E-ORDER-001.yaml` 查看变更
```

---

### 7. 删除场景

```bash
/scenario-author delete E2E-ORDER-003
```

**安全检查**:
- 检查场景是否被测试套件引用(未来功能)
- 确认删除操作

---

## Advanced Usage

### 批量操作

```bash
# 验证所有场景
/scenario-author validate --all

# 生成多个规格的场景
/scenario-author generate --spec P005,O003,U001
```

### 自定义标签

在 tags 中添加自定义维度:

```yaml
tags:
  module: [order]
  channel: [miniapp]
  deploy: [saas]
  priority: p1
  smoke: true
  custom_suite: regression  # 自定义标签
```

### 使用 TODO 标记

自动生成的场景可能包含 TODO 标记,需人工补充:

```yaml
steps:
  - action: adjust_inventory
    params:
      # TODO: 补充调整原因和数量
      testdata_ref: inventoryTestData.adjustment_001
```

---

## Best Practices

### 1. 场景命名规范

- **scenario_id**: 使用模块缩写 + 递增编号
  - 订单: `E2E-ORDER-001`
  - 库存: `E2E-INVENTORY-001`
  - 门店: `E2E-STORE-001`

- **title**: 清晰描述场景业务含义
  - ✅ "用户下单并支付流程"
  - ❌ "测试用例1"

### 2. 步骤粒度

- 每个步骤代表一个用户操作或系统动作
- 避免过细(如分解为 "点击按钮" + "输入文本" + "提交表单")
- 避免过粗(如 "完成整个订单流程" 包含 10+ 个子操作)

**推荐粒度**:
```yaml
steps:
  - action: login  # 合适
  - action: browse_product  # 合适
  - action: add_to_cart  # 合适
  - action: checkout  # 合适
  - action: pay  # 合适
```

### 3. 数据解耦

**禁止**:
```yaml
params:
  store_name: "北京王府井店"
  sku_id: "sku-12345"
  price: 19.99
```

**推荐**:
```yaml
params:
  testdata_ref: storeTestData.beijing_store
  # testdata_ref 引用外部测试数据定义
```

### 4. 断言设计

- 至少包含 1 个 UI 断言和 1 个 API/数据库断言
- UI 断言验证用户可见结果
- API 断言验证系统状态正确性

```yaml
assertions:
  - type: ui
    check: toast_message_shown
    params:
      message: "订单创建成功"
  - type: api
    check: database_record_exists
    params:
      table: orders
      testdata_ref: orderTestData.order_001
```

### 5. 标签策略

- `module`: 功能模块,支持多值(如订单支付场景同时标记 order 和 payment)
- `channel`: 目标平台,通常单值(miniapp 或 web)
- `deploy`: 部署类型,可多值(saas 和 onprem 共用场景)
- `priority`: 优先级,P1 为核心流程
- `smoke`: 标记为冒烟测试的场景

---

## Troubleshooting

### 问题: scenario_id 冲突

**错误信息**:
```
❌ scenario_id E2E-ORDER-001 已存在于 scenarios/order/E2E-ORDER-001.yaml
```

**解决方案**:
1. 使用 `/scenario-author list --module order` 查看现有编号
2. 手动指定下一个可用编号(如 `E2E-ORDER-002`)
3. 或使用 `/scenario-author create` 自动生成唯一 ID

---

### 问题: YAML 语法错误

**错误信息**:
```
❌ YAML 语法错误: line 15, column 3
```

**解决方案**:
1. 使用在线 YAML 验证器检查语法
2. 检查缩进(必须使用空格,不能使用 Tab)
3. 检查字符串是否需要引号(包含特殊字符时)

---

### 问题: 验证失败 - 环境解耦

**错误信息**:
```
❌ 环境解耦验证失败
- 步骤 1: params.url = "https://example.com" - 禁止硬编码 URL
```

**解决方案**:
删除硬编码 URL,使用 testdata_ref 或让 RunConfig 提供环境配置。

---

### 问题: 从 spec.md 生成失败

**错误信息**:
```
❌ 无法解析 spec.md: 未找到用户故事章节
```

**解决方案**:
1. 确认 spec.md 包含 "用户场景与测试" 章节
2. 确认用户故事使用标准格式: `### 用户故事 \d+ - <title> (优先级: P\d+)`
3. 确认验收场景使用 "假设-当-那么" 格式

---

## Next Steps

1. **创建第一个场景**: `/scenario-author create`
2. **验证场景**: `/scenario-author validate <scenario-id>`
3. **批量生成**: `/scenario-author generate --spec <specId>`
4. **集成到 CI/CD**: 在测试流水线中调用场景文件

## Resources

- **详细文档**: `.claude/skills/scenario-author/references/usage-guide.md`
- **Schema 定义**: `specs/T001-e2e-scenario-author/contracts/scenario-schema.json`
- **示例场景**: `.claude/skills/scenario-author/references/examples/`
- **规格文档**: `specs/T001-e2e-scenario-author/spec.md`

---

**Happy Testing! 🎉**
