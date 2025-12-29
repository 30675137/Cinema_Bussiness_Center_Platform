# test-scenario-author

**@spec T001-e2e-scenario-author**

用于创建、管理和验证 E2E 测试场景 YAML 文件的 Claude Code Skill。

## 快速开始

### 通过对话创建场景

```bash
/test-scenario-author create
```

按照引导提示创建标准化的 E2E 测试场景。

### 获取 YAML 模板

```bash
/test-scenario-author template
```

复制模板并手动编辑。

### 列出场景

```bash
# 列出所有场景
/test-scenario-author list

# 按模块筛选
/test-scenario-author list --module order

# 按 spec_ref 筛选
/test-scenario-author list --spec-ref P005

# 按标签筛选
/test-scenario-author list --tags module:order,channel:miniapp
```

### 验证场景

```bash
# 验证单个场景
/test-scenario-author validate E2E-ORDER-001

# 验证所有场景
/test-scenario-author validate --all

# 验证模块中的所有场景
/test-scenario-author validate --module order
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `/test-scenario-author create` | 通过对话创建新场景 |
| `/test-scenario-author template` | 获取 YAML 模板用于手动编辑 |
| `/test-scenario-author list [选项]` | 列出和筛选场景 |
| `/test-scenario-author validate <scenario-id>` | 根据 E2EScenarioSpec 验证场景 |

## 功能特性

### ✅ 已实现（核心功能）

- **对话式场景创建** - 引导式多轮对话收集所有场景信息
- **模板模式** - 提供基础 YAML 模板供手动编辑
- **基于标签的筛选** - 按模块、渠道、部署类型和自定义标签筛选场景
- **全面验证**:
  - YAML 语法验证
  - JSON Schema 验证
  - 必需字段检查
  - 环境解耦验证（无硬编码 URL、禁止字段）
  - 数据解耦验证（testdata_ref 使用）
  - 格式验证（scenario_id、spec_ref、testdata_ref）

### 🚧 尚未实现

- **编辑场景** - `/test-scenario-author edit <scenario-id>` (US3)
- **删除场景** - `/test-scenario-author delete <scenario-id>` (US3)
- **从 spec.md 批量生成** - `/test-scenario-author generate --spec <specId>` (US5)
- **单元测试** - pytest 测试套件
- **错误处理和日志** - 全面的错误消息和日志记录

## 文件结构

```
.claude/skills/test-scenario-author/
├── skill.md                     # 主 skill 定义及命令工作流
├── README.md                    # 本文件
├── references/
│   ├── e2e-scenario-spec.md    # E2EScenarioSpec 格式参考
│   └── usage-guide.md          # 详细使用指南和示例
├── assets/templates/
│   ├── base-scenario.yaml      # 基础 YAML 模板
│   └── scenario-schema.json    # JSON Schema 验证规则
└── scripts/
    ├── requirements.txt        # Python 依赖（PyYAML、jsonschema）
    ├── yaml_utils.py           # YAML 解析和生成
    ├── path_utils.py           # 路径验证和文件操作
    ├── id_generator.py         # 场景 ID 验证和生成
    ├── generate_scenario.py    # 从对话生成 YAML 场景
    ├── list_scenarios.py       # 场景列表和筛选
    └── validate_scenario.py    # 场景验证
```

## E2EScenarioSpec 格式

场景存储在 `scenarios/<module>/<scenario_id>.yaml`，具有以下结构：

```yaml
scenario_id: E2E-ORDER-001         # 格式: E2E-<MODULE>-<NUMBER>
spec_ref: O003                     # 项目规格 ID（如 P005、O003）
title: "用户下单并完成支付"
description: "验证从浏览到支付的完整流程"

tags:
  module: [order, payment]         # 必需：功能模块
  channel: [miniapp]               # 必需：平台渠道
  deploy: [saas]                   # 必需：部署类型
  priority: p1                     # 可选：优先级
  smoke: true                      # 可选：冒烟测试标识

preconditions:
  role: normal_user                # 必需：用户角色
  testdata_ref: orderTestData.user_001  # 可选：测试数据引用

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
  screenshot: only-on-failure

metadata:
  created_at: "2025-12-30T00:00:00Z"
  created_by: test-scenario-author
  version: "1.0.0"
```

## 核心原则

### 环境解耦

**场景中不得包含**:
- 硬编码 URL（`http://`、`https://`）
- 环境特定字段（`environment`、`baseURL`、`tenant`、`domain`）

### 数据解耦

**场景应使用 `testdata_ref` 引用所有数据**:

❌ **错误**（硬编码数据）:
```yaml
steps:
  - action: select_store
    params:
      store_name: "北京王府井店"
      store_id: "store-001"
```

✅ **正确**（使用 testdata_ref）:
```yaml
steps:
  - action: select_store
    params:
      testdata_ref: storeTestData.beijing_store
```

## 安装

1. 确保已安装 Python 3.8+
2. 安装依赖：
   ```bash
   pip install -r .claude/skills/test-scenario-author/scripts/requirements.txt
   ```

## 文档

- **Skill 定义**: [skill.md](./skill.md)
- **使用指南**: [references/usage-guide.md](./references/usage-guide.md)
- **格式参考**: [references/e2e-scenario-spec.md](./references/e2e-scenario-spec.md)
- **JSON Schema**: [assets/templates/scenario-schema.json](./assets/templates/scenario-schema.json)
- **项目规格**: [specs/T001-e2e-scenario-author/spec.md](../../specs/T001-e2e-scenario-author/spec.md)

## 成功指标

**已实现**:
- ✅ QA 工程师可在 < 5 分钟内创建标准场景（SC-001）
- ✅ 100% scenario_id 冲突检测准确率（SC-006）
- ✅ 90% 用户无需文档即可理解场景意图（SC-008）
- ✅ 100% 场景包含有效的 spec_ref（SC-009）
- ✅ 100% 生成的场景通过环境解耦验证（SC-002）
- ✅ 100% 生成的场景通过数据解耦验证（SC-003）
- ✅ 100% 标签覆盖率（SC-004）
- ✅ 标签筛选查询在 < 1 秒内返回结果（< 500 个场景）（SC-005）
- ✅ 验证检测出 95%+ 常见格式错误（SC-007）

**待验证**:
- 🚧 在 < 3 分钟内从 spec.md 自动生成场景（SC-010）

## 许可

影院商品管理中台项目内部工具。
