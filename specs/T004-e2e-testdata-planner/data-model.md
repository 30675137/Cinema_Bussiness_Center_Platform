# 数据模型：E2E 测试数据规划器

**Feature**: T004-e2e-testdata-planner
**Created**: 2025-12-30
**Status**: Draft

本文档定义了 E2E 测试数据规划器的 4 个核心实体：TestdataBlueprint、DataSupplyStrategy、LifecyclePlan 和 DataProvenance。

---

## 1. TestdataBlueprint（测试数据蓝图）

### 定义

测试数据蓝图表示一个带有唯一 testdata_ref 标识符的数据契约，定义了测试数据的模式、依赖关系和供给策略配置。蓝图是测试场景和数据供给实现之间的桥梁。

### 核心属性

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| id | string | ✅ | 唯一标识符，格式：`TD-<ENTITY>-<ID>` | 正则：`^TD-[A-Z]+-\d{3,}$`，示例：TD-ORDER-001 |
| version | string | ✅ | 语义化版本号 | 正则：`^\d+\.\d+\.\d+$`，示例：1.0.0 |
| description | string | ✅ | 蓝图用途说明 | 最小长度：10，最大长度：500 |
| schema | object | ✅ | Zod-compatible 数据模式定义 | 必须是有效的 JSON Schema Draft 7 对象 |
| dependencies | string[] | ❌ | 依赖的其他 testdata_ref 列表 | 每个元素必须匹配 `^TD-[A-Z]+-\d{3,}$` |
| strategy | enum | ✅ | 数据供给策略类型 | 枚举值：`seed`、`api`、`db-script` |
| strategyConfig | object | ✅ | 策略特定配置（见 DataSupplyStrategy） | 根据 strategy 类型验证 |
| environments | string[] | ❌ | 适用环境列表，为空表示所有环境 | 枚举值：`ci`、`staging`、`production`、`local` |
| scope | enum | ✅ | Playwright fixture 作用域 | 枚举值：`test`、`worker`、`global` |
| teardown | boolean | ✅ | 是否在测试后清理数据 | 默认值：true |
| createdAt | string | ✅ | 蓝图创建时间（ISO 8601） | 格式：`YYYY-MM-DDTHH:mm:ssZ` |
| updatedAt | string | ✅ | 蓝图最后更新时间（ISO 8601） | 格式：`YYYY-MM-DDTHH:mm:ssZ` |
| metadata | object | ❌ | 扩展元数据（标签、作者等） | 自由键值对 |

### 关系

- **依赖关系**：`TestdataBlueprint` → `TestdataBlueprint[]`（一对多，通过 `dependencies` 字段）
- **包含关系**：`TestdataBlueprint` → `DataSupplyStrategy`（一对一，通过 `strategyConfig` 字段）

### 状态转换

```
[草稿] --验证通过--> [已验证] --生成计划--> [可用] --版本过期--> [已弃用]
   ↓                      ↓                    ↓
[验证失败]          [生成失败]          [运行时失败]
```

### 验证规则

1. **依赖完整性**：所有 `dependencies` 中引用的 testdata_ref 必须在蓝图目录中存在
2. **循环依赖检测**：依赖图中不得存在循环引用
3. **依赖深度限制**：依赖链深度不超过 10 层
4. **环境一致性**：依赖的蓝图必须支持当前环境
5. **模式有效性**：`schema` 字段必须是合法的 JSON Schema 对象
6. **策略配置匹配**：`strategyConfig` 必须包含 `strategy` 类型要求的所有必填字段

### 示例

```yaml
id: TD-ORDER-001
version: 1.0.0
description: 标准饮品订单，包含用户、门店和商品信息
schema:
  type: object
  properties:
    orderId:
      type: string
      description: 订单唯一标识符
    userId:
      type: string
      description: 下单用户 ID
    storeId:
      type: string
      description: 门店 ID
    items:
      type: array
      items:
        type: object
        properties:
          skuId: { type: string }
          quantity: { type: number }
    totalAmount:
      type: number
      description: 订单总金额（分）
  required: [orderId, userId, storeId, items, totalAmount]
dependencies:
  - TD-USER-001
  - TD-STORE-001
  - TD-SKU-BEVERAGE
strategy: api
strategyConfig:
  apiEndpoint: /api/test/orders
  method: POST
  authRequired: true
  headers:
    Content-Type: application/json
environments: [staging, production]
scope: test
teardown: true
createdAt: 2025-12-30T10:00:00Z
updatedAt: 2025-12-30T10:00:00Z
metadata:
  tags: [order, beverage]
  author: test-team
```

---

## 2. DataSupplyStrategy（数据供给策略）

### 定义

数据供给策略定义了如何为蓝图提供测试数据，包括策略类型、配置参数、认证信息和错误处理策略。

### 核心属性

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| type | enum | ✅ | 策略类型 | 枚举值：`seed`、`api`、`db-script` |
| config | object | ✅ | 策略特定配置（见下方子类型） | 根据 type 验证 |
| timeout | number | ❌ | 超时时间（毫秒） | 最小值：1000，最大值：60000，默认值：30000 |
| retryPolicy | object | ❌ | 重试策略配置 | 见 RetryPolicy 子类型 |
| errorHandling | enum | ✅ | 错误处理策略 | 枚举值：`fail-fast`、`log-continue`、`fallback` |

### 策略子类型

#### 2.1 Seed Strategy

从静态 JSON/YAML 文件加载数据。

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| seedFilePath | string | ✅ | 种子文件路径（相对于项目根目录） | 文件必须存在，扩展名：`.json`、`.yaml`、`.yml` |
| format | enum | ✅ | 文件格式 | 枚举值：`json`、`yaml` |
| encoding | string | ❌ | 文件编码 | 默认值：`utf-8` |

**示例**：
```yaml
type: seed
config:
  seedFilePath: testdata/seeds/users.json
  format: json
  encoding: utf-8
timeout: 5000
errorHandling: fail-fast
```

#### 2.2 API Strategy

通过 REST API 动态创建数据。

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| apiEndpoint | string | ✅ | API 端点路径 | 必须以 `/` 开头 |
| method | enum | ✅ | HTTP 方法 | 枚举值：`GET`、`POST`、`PUT`、`PATCH` |
| baseUrl | string | ❌ | API 基础 URL（默认使用环境配置） | 合法 URL 格式 |
| authRequired | boolean | ✅ | 是否需要认证 | 默认值：true |
| authType | enum | ❌ | 认证类型 | 枚举值：`bearer`、`api-key`、`basic`，默认值：`bearer` |
| headers | object | ❌ | 额外请求头 | 键值对对象 |
| body | object | ❌ | 请求体模板（支持变量替换） | 有效 JSON 对象 |
| responseMapping | object | ❌ | 响应字段映射配置 | 键值对对象，格式：`{ "目标字段": "响应路径" }` |

**示例**：
```yaml
type: api
config:
  apiEndpoint: /api/test/users
  method: POST
  authRequired: true
  authType: bearer
  headers:
    Content-Type: application/json
  body:
    username: admin@test.com
    password: Test123456!
    role: admin
  responseMapping:
    userId: data.id
    token: data.accessToken
timeout: 15000
retryPolicy:
  maxRetries: 3
  retryDelay: 1000
  backoffMultiplier: 2
errorHandling: fail-fast
```

#### 2.3 DB-Script Strategy

通过 SQL 脚本直接操作数据库。

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| dbScriptPath | string | ✅ | SQL 脚本文件路径 | 文件必须存在，扩展名：`.sql` |
| database | string | ❌ | 目标数据库名称（默认使用主数据库） | 非空字符串 |
| transactional | boolean | ✅ | 是否使用事务执行 | 默认值：true |
| outputMapping | object | ❌ | 脚本输出映射（用于提取插入的 ID） | 键值对对象 |

**示例**：
```yaml
type: db-script
config:
  dbScriptPath: testdata/scripts/seed-stores.sql
  database: main
  transactional: true
  outputMapping:
    storeId: inserted_store_id
timeout: 20000
errorHandling: fail-fast
```

### RetryPolicy 子类型

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| maxRetries | number | ✅ | 最大重试次数 | 最小值：0，最大值：5，默认值：3 |
| retryDelay | number | ✅ | 初始重试延迟（毫秒） | 最小值：100，最大值：10000，默认值：1000 |
| backoffMultiplier | number | ❌ | 指数退避倍数 | 最小值：1，最大值：5，默认值：2 |
| retryableErrors | string[] | ❌ | 可重试的错误代码列表 | 数组元素为 HTTP 状态码或错误代码 |

---

## 3. LifecyclePlan（生命周期计划）

### 定义

生命周期计划表示测试数据的 setup 和 teardown 执行序列，从 TestdataBlueprint 和 DataSupplyStrategy 生成，用于指导 Playwright fixtures 的创建。

### 核心属性

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| blueprintId | string | ✅ | 关联的蓝图 ID | 匹配 `^TD-[A-Z]+-\d{3,}$` |
| setupSteps | Step[] | ✅ | Setup 步骤序列（按依赖顺序） | 最小长度：1 |
| teardownSteps | Step[] | ✅ | Teardown 步骤序列（反向顺序） | 可为空数组 |
| scope | enum | ✅ | Fixture 作用域 | 枚举值：`test`、`worker`、`global` |
| executionOrder | number | ✅ | 执行顺序（用于多蓝图排序） | 非负整数，基于依赖深度计算 |
| estimatedDuration | number | ❌ | 预估执行时间（毫秒） | 基于历史数据或策略超时总和 |
| generatedAt | string | ✅ | 计划生成时间（ISO 8601） | 格式：`YYYY-MM-DDTHH:mm:ssZ` |
| status | enum | ✅ | 计划状态 | 枚举值：`draft`、`validated`、`ready`、`failed` |

### Step 子类型

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| stepId | string | ✅ | 步骤唯一标识符 | 格式：`step-{uuid}` |
| action | enum | ✅ | 操作类型 | 枚举值：`load-seed`、`call-api`、`execute-sql`、`validate-data`、`cleanup-data` |
| testdataRef | string | ✅ | 关联的测试数据引用 | 匹配 `^TD-[A-Z]+-\d{3,}$` |
| strategy | enum | ✅ | 使用的供给策略 | 枚举值：`seed`、`api`、`db-script` |
| parameters | object | ✅ | 步骤参数（根据 action 类型不同） | 有效 JSON 对象 |
| dependsOn | string[] | ❌ | 依赖的前序步骤 ID | 每个元素匹配 `step-{uuid}` 格式 |
| timeout | number | ❌ | 步骤超时（毫秒） | 继承自策略配置 |
| optional | boolean | ✅ | 是否为可选步骤（失败不中断） | 默认值：false |

### 关系

- **归属关系**：`LifecyclePlan` → `TestdataBlueprint`（多对一）
- **引用关系**：`LifecyclePlan.setupSteps` → `DataSupplyStrategy`（一对多）
- **执行依赖**：`Step` → `Step[]`（一对多，通过 `dependsOn` 字段）

### 状态转换

```
[草稿] --验证通过--> [已验证] --代码生成--> [就绪] --执行失败--> [失败]
   ↓                      ↓                    ↓
[验证失败]          [生成失败]          [重新生成]
```

### 验证规则

1. **步骤依赖有效性**：所有 `dependsOn` 引用的步骤 ID 必须在 `setupSteps` 中存在
2. **无循环步骤依赖**：步骤依赖图中不得存在循环
3. **Teardown 顺序正确性**：`teardownSteps` 必须是 `setupSteps` 的反向拓扑排序
4. **执行顺序一致性**：`executionOrder` 必须反映依赖深度（依赖少的先执行）
5. **作用域一致性**：计划的 `scope` 必须与关联蓝图的 `scope` 一致
6. **超时合理性**：所有步骤超时总和不得超过 Playwright 默认测试超时（30秒）

### 示例

```yaml
blueprintId: TD-ORDER-001
setupSteps:
  - stepId: step-001-user
    action: call-api
    testdataRef: TD-USER-001
    strategy: api
    parameters:
      endpoint: /api/test/users
      method: POST
      body:
        username: testuser@example.com
        role: customer
    dependsOn: []
    timeout: 15000
    optional: false

  - stepId: step-002-store
    action: load-seed
    testdataRef: TD-STORE-001
    strategy: seed
    parameters:
      filePath: testdata/seeds/stores.json
      format: json
    dependsOn: []
    timeout: 5000
    optional: false

  - stepId: step-003-order
    action: call-api
    testdataRef: TD-ORDER-001
    strategy: api
    parameters:
      endpoint: /api/test/orders
      method: POST
      body:
        userId: "{{step-001-user.userId}}"
        storeId: "{{step-002-store.storeId}}"
        items:
          - skuId: SKU-001
            quantity: 2
    dependsOn: [step-001-user, step-002-store]
    timeout: 15000
    optional: false

teardownSteps:
  - stepId: teardown-001-order
    action: cleanup-data
    testdataRef: TD-ORDER-001
    strategy: api
    parameters:
      endpoint: /api/test/orders/{{step-003-order.orderId}}
      method: DELETE
    dependsOn: []
    timeout: 10000
    optional: true

  - stepId: teardown-002-user
    action: cleanup-data
    testdataRef: TD-USER-001
    strategy: api
    parameters:
      endpoint: /api/test/users/{{step-001-user.userId}}
      method: DELETE
    dependsOn: [teardown-001-order]
    timeout: 10000
    optional: true

scope: test
executionOrder: 2
estimatedDuration: 55000
generatedAt: 2025-12-30T10:05:00Z
status: ready
```

---

## 4. DataProvenance（数据来源）

### 定义

数据来源跟踪测试数据实例的完整生命周期，包括创建、使用和清理状态，用于调试、审计和确保适当的 teardown。

### 核心属性

| 字段名 | 类型 | 必填 | 描述 | 验证规则 |
|--------|------|------|------|----------|
| id | string | ✅ | 唯一标识符（UUID） | UUID v4 格式 |
| testdataRef | string | ✅ | 关联的测试数据引用 | 匹配 `^TD-[A-Z]+-\d{3,}$` |
| testRunId | string | ✅ | 测试运行批次 ID | 格式：`run-{YYYYMMDD}-{HHmmss}` |
| testId | string | ✅ | 具体测试用例标识 | 格式：`{文件名}:{行号}`，示例：`order-spec.ts:42` |
| environment | enum | ✅ | 测试环境 | 枚举值：`ci`、`staging`、`production`、`local` |
| strategy | enum | ✅ | 使用的供给策略 | 枚举值：`seed`、`api`、`db-script` |
| dataId | string | ❌ | 创建的数据实例 ID（如 orderId、userId） | 根据实体类型不同 |
| createdAt | string | ✅ | 数据创建时间（ISO 8601） | 格式：`YYYY-MM-DDTHH:mm:ss.sssZ` |
| createdBy | string | ❌ | 创建者（用户或系统） | 默认值：`e2e-testdata-planner` |
| cleanedAt | string | ❌ | 数据清理时间（ISO 8601） | 格式：`YYYY-MM-DDTHH:mm:ss.sssZ` |
| cleanupStatus | enum | ✅ | 清理状态 | 枚举值：`pending`、`success`、`failed`、`skipped` |
| cleanupError | string | ❌ | 清理失败原因 | 当 cleanupStatus 为 `failed` 时必填 |
| metadata | object | ❌ | 扩展元数据（原始响应、执行日志等） | 自由键值对 |

### 关系

- **追溯关系**：`DataProvenance` → `TestdataBlueprint`（多对一，通过 `testdataRef`）
- **批次关系**：`DataProvenance` → `TestRun`（多对一，通过 `testRunId`）

### 状态转换

```
[创建中] --创建成功--> [活跃] --清理成功--> [已清理]
   ↓                      ↓                    ↓
[创建失败]          [清理失败]          [清理跳过]
```

### 验证规则

1. **时间一致性**：`cleanedAt` 必须晚于 `createdAt`
2. **状态一致性**：`cleanupStatus` 为 `failed` 时，`cleanupError` 必填
3. **引用有效性**：`testdataRef` 必须对应有效的蓝图
4. **环境匹配**：`environment` 必须与蓝图的 `environments` 兼容
5. **数据 ID 唯一性**：同一 `testRunId` 内，`dataId` 不得重复（针对相同实体类型）

### 示例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "testdataRef": "TD-ORDER-001",
  "testRunId": "run-20251230-140532",
  "testId": "order-creation.spec.ts:42",
  "environment": "staging",
  "strategy": "api",
  "dataId": "ORD-20251230-001234",
  "createdAt": "2025-12-30T14:05:35.123Z",
  "createdBy": "e2e-testdata-planner",
  "cleanedAt": "2025-12-30T14:06:10.456Z",
  "cleanupStatus": "success",
  "cleanupError": null,
  "metadata": {
    "apiResponse": {
      "orderId": "ORD-20251230-001234",
      "status": "created",
      "totalAmount": 3500
    },
    "executionTime": 1234
  }
}
```

### 持久化策略

**MVP 阶段**：JSON 文件存储
- 文件路径：`testdata/logs/provenance-{testRunId}.json`
- 格式：每个测试运行一个 JSON 文件，包含所有相关的 DataProvenance 记录
- 保留策略：保留最近 30 天的日志文件

**未来增强**：Supabase 表存储
```sql
CREATE TABLE testdata_provenance (
  id UUID PRIMARY KEY,
  testdata_ref VARCHAR(50) NOT NULL,
  test_run_id VARCHAR(100) NOT NULL,
  test_id VARCHAR(200) NOT NULL,
  environment VARCHAR(20) NOT NULL,
  strategy VARCHAR(20) NOT NULL,
  data_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL,
  created_by VARCHAR(100),
  cleaned_at TIMESTAMPTZ,
  cleanup_status VARCHAR(20) NOT NULL,
  cleanup_error TEXT,
  metadata JSONB,
  INDEX idx_testdata_ref (testdata_ref),
  INDEX idx_test_run_id (test_run_id),
  INDEX idx_environment (environment)
);
```

---

## 实体关系图

```
TestdataBlueprint
    |
    | 1:1 (内嵌)
    |
    v
DataSupplyStrategy
    |
    | 1:N (生成)
    |
    v
LifecyclePlan
    |
    | 1:N (执行)
    |
    v
DataProvenance

依赖关系：
TestdataBlueprint --depends on--> TestdataBlueprint[]
LifecyclePlan.Step --depends on--> LifecyclePlan.Step[]
DataProvenance --traces--> TestdataBlueprint
```

---

## 数据流转

```
1. 蓝图定义
   YAML 文件 → TestdataBlueprint → Zod 验证

2. 策略解析
   TestdataBlueprint.strategyConfig → DataSupplyStrategy → 配置验证

3. 计划生成
   TestdataBlueprint + DataSupplyStrategy → 依赖分析 → LifecyclePlan

4. 代码生成
   LifecyclePlan → 模板渲染 → Playwright Fixture (.ts 文件)

5. 执行追踪
   Fixture 执行 → DataProvenance 记录 → JSON 日志/Supabase 表
```

---

## 约束汇总

| 实体 | 约束项 | 限制值 |
|------|--------|--------|
| TestdataBlueprint | 依赖深度 | ≤ 10 层 |
| TestdataBlueprint | 蓝图文件大小 | ≤ 1 MB |
| DataSupplyStrategy (seed) | 种子文件大小 | ≤ 10 MB（警告），≤ 50 MB（硬限制） |
| DataSupplyStrategy (api) | API 超时 | ≤ 60 秒 |
| LifecyclePlan | 总步骤超时 | ≤ Playwright 测试超时（30秒） |
| LifecyclePlan | 全局 fixtures | ≤ 5 个 |
| DataProvenance | 日志保留期 | 30 天 |

---

**文档版本**: 1.0.0
**最后更新**: 2025-12-30
**下一步**: 创建 YAML Schema 定义
