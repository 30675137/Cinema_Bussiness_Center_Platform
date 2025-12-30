# 快速开始：E2E 测试数据规划器

**@spec T004-e2e-testdata-planner**

5 分钟快速上手 e2e-testdata-planner。本指南将带您完成基础使用、常见工作流程和问题排查。

---

## 目录

- [前置条件](#前置条件)
- [安装与配置](#安装与配置)
- [创建第一个蓝图](#创建第一个蓝图)
- [生成 Playwright Fixture](#生成-playwright-fixture)
- [在测试中使用 Fixture](#在测试中使用-fixture)
- [常见工作流](#常见工作流)
- [常见问题排查](#常见问题排查)
- [下一步](#下一步)

---

## 前置条件

在使用 e2e-testdata-planner 之前，请确保：

- ✅ **Node.js** 18+ 已安装
- ✅ **Playwright** 已安装 (`npm install -D @playwright/test`)
- ✅ **TypeScript** 5.x 已配置（启用严格模式）
- ✅ **测试场景** 已创建（通过 `/test-scenario-author`）
- ✅ **Supabase Client** 已配置（如使用 db-script 策略）

验证您的环境：

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 检查 Playwright 版本
npx playwright --version  # 应该 >= 1.40.0

# 检查 TypeScript 版本
npx tsc --version  # 应该 >= 5.0.0

# 验证项目结构
ls testdata/  # 应该看到 blueprints/ seeds/ scripts/ 目录
```

---

## 安装与配置

### 1. 创建测试数据目录结构

在项目根目录创建标准目录：

```bash
# 创建蓝图、种子文件和脚本目录
mkdir -p testdata/blueprints
mkdir -p testdata/seeds
mkdir -p testdata/scripts
mkdir -p testdata/logs

# 创建 fixtures 输出目录
mkdir -p tests/fixtures/testdata
```

### 2. 安装依赖

在项目 `package.json` 中添加依赖：

```bash
npm install -D zod js-yaml @types/js-yaml
npm install -D @supabase/supabase-js  # 如使用 db-script 策略
```

### 3. 配置环境变量

创建 `.env` 文件（用于 db-script 策略）：

```bash
# Supabase 配置（用于 db-script 策略）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# 测试环境配置
E2E_ENV_PROFILE=staging
E2E_BASE_URL=https://staging.cinema.com
```

**安全提示**：
```bash
# 将敏感文件添加到 .gitignore
echo ".env" >> .gitignore
echo "testdata/logs/" >> .gitignore
echo "tests/fixtures/testdata/*.fixture.ts" >> .gitignore
```

---

## 创建第一个蓝图

### 方法 1：使用 CLI 引导创建（推荐）

运行交互式蓝图创建工具：

```bash
/testdata-planner create
```

**交互流程**：

```
🎯 E2E 测试数据规划器 - 创建新蓝图

📝 步骤 1/5：基础信息
  蓝图标识符 (testdata_ref): TD-ORDER-001
  描述: 标准饮料订单测试数据

📦 步骤 2/5：选择数据供给策略
  1. seed    - 从 JSON/YAML 文件加载静态数据
  2. api     - 通过 REST API 动态创建数据
  3. db-script - 直接执行 SQL 脚本

  选择策略 (1-3): 1

📁 步骤 3/5：配置种子文件
  种子文件路径: testdata/seeds/orders.json

🔗 步骤 4/5：配置依赖
  是否依赖其他数据? (y/n): y
  依赖的 testdata_ref (逗号分隔): TD-USER-001,TD-STORE-001

🌍 步骤 5/5：环境配置
  目标环境 (staging/production/all): staging
  Fixture 作用域 (test/worker/global): test
  是否启用 teardown? (y/n): y

✅ 蓝图创建成功！
   文件位置: testdata/blueprints/order.blueprint.yaml

📋 下一步建议:
   1. 创建种子文件: testdata/seeds/orders.json
   2. 验证蓝图: /testdata-planner validate TD-ORDER-001
   3. 生成 fixture: /testdata-planner generate TD-ORDER-001
```

### 方法 2：手动创建蓝图文件

创建 `testdata/blueprints/order.blueprint.yaml`：

```yaml
# @spec T004-e2e-testdata-planner
testdata_ref: TD-ORDER-001
description: 标准饮料订单测试数据
version: 1.0.0

# 数据模式定义
schema:
  type: object
  properties:
    id:
      type: string
      format: uuid
    orderNumber:
      type: string
      pattern: "^ORD-\\d{8}$"
    userId:
      type: string
      format: uuid
    storeId:
      type: string
      format: uuid
    items:
      type: array
      items:
        type: object
        properties:
          skuId:
            type: string
          quantity:
            type: integer
            minimum: 1
          price:
            type: number
            minimum: 0
        required: [skuId, quantity, price]
    totalAmount:
      type: number
      minimum: 0
    status:
      type: string
      enum: [pending, confirmed, completed, cancelled]
    createdAt:
      type: string
      format: date-time
  required: [id, orderNumber, userId, storeId, items, totalAmount, status]

# 数据供给策略
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders.json

# 依赖关系
dependencies:
  - testdata_ref: TD-USER-001
    required: true
  - testdata_ref: TD-STORE-001
    required: true

# 环境配置
metadata:
  env_profile: staging
  scope: test  # test | worker | global
  teardown: true

# 生命周期配置
lifecycle:
  setup:
    - validate_dependencies
    - load_seed_file
    - create_test_data
  teardown:
    - delete_test_data
    - cleanup_dependencies
```

### 创建对应的种子文件

创建 `testdata/seeds/orders.json`：

```json
{
  "testdata_ref": "TD-ORDER-001",
  "version": "1.0.0",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "orderNumber": "ORD-20251230",
      "userId": "{{TD-USER-001.id}}",
      "storeId": "{{TD-STORE-001.id}}",
      "items": [
        {
          "skuId": "SKU-COKE-500ML",
          "quantity": 2,
          "price": 15.00
        },
        {
          "skuId": "SKU-POPCORN-LARGE",
          "quantity": 1,
          "price": 25.00
        }
      ],
      "totalAmount": 55.00,
      "status": "pending",
      "createdAt": "2025-12-30T10:00:00Z"
    }
  ]
}
```

**变量替换说明**：
- `{{TD-USER-001.id}}` 会自动替换为依赖蓝图生成的用户 ID
- 支持嵌套字段引用：`{{TD-STORE-001.location.city}}`

---

## 生成 Playwright Fixture

### 1. 验证蓝图

在生成 fixture 前先验证蓝图：

```bash
/testdata-planner validate TD-ORDER-001
```

**预期输出**：

```
🔍 验证蓝图：TD-ORDER-001

✅ 蓝图结构验证通过
✅ Schema 定义有效
✅ 依赖解析成功：
   - TD-USER-001 ✓
   - TD-STORE-001 ✓
✅ 种子文件存在：testdata/seeds/orders.json
✅ 种子数据与 schema 匹配
✅ 无循环依赖

📊 依赖链：
   TD-ORDER-001
     ├─ TD-USER-001
     └─ TD-STORE-001

🎉 验证通过！可以生成 fixture。
```

### 2. 生成 Fixture 代码

```bash
/testdata-planner generate TD-ORDER-001
```

**预期输出**：

```
⚙️  生成 Fixture：TD-ORDER-001

📋 生成生命周期计划...
   - Setup 步骤: 4
   - Teardown 步骤: 2

🔨 生成 TypeScript fixture 代码...
   - 类型定义 ✓
   - Setup 函数 ✓
   - Teardown 函数 ✓
   - Playwright fixture 包装 ✓

✅ Fixture 生成成功！
   文件位置: tests/fixtures/testdata/testdata-TD-ORDER-001.fixture.ts
   类型定义: tests/fixtures/testdata/testdata-TD-ORDER-001.types.ts

📋 下一步：
   1. 在测试中导入 fixture：
      import { testOrder } from '@fixtures/testdata/testdata-TD-ORDER-001.fixture';

   2. 使用 fixture：
      test('订单创建', async ({ page, testOrder }) => {
        // testOrder 已自动供给和清理
        await page.goto(`/orders/${testOrder.id}`);
      });
```

### 生成的 Fixture 代码示例

查看生成的 `tests/fixtures/testdata/testdata-TD-ORDER-001.fixture.ts`：

```typescript
/** @spec T004-e2e-testdata-planner */
import { test as base } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TDOrder001Schema, type TDOrder001Data } from './testdata-TD-ORDER-001.types';
import { testUser } from './testdata-TD-USER-001.fixture';
import { testStore } from './testdata-TD-STORE-001.fixture';

/**
 * Playwright fixture for TD-ORDER-001
 * 自动生成 - 请勿手动编辑
 * 生成时间: 2025-12-30T10:00:00Z
 */
export const test = base.extend<{ testOrder: TDOrder001Data }>({
  testOrder: async ({ testUser, testStore }, use) => {
    // Setup: 加载种子文件
    const seedPath = resolve('testdata/seeds/orders.json');
    const seedData = JSON.parse(readFileSync(seedPath, 'utf-8'));

    // 替换依赖变量
    const orderData = {
      ...seedData.data[0],
      userId: testUser.id,
      storeId: testStore.id,
    };

    // 验证数据
    const validatedData = TDOrder001Schema.parse(orderData);

    // 供给测试数据
    await use(validatedData);

    // Teardown: 清理数据
    // 注意：依赖数据会在依赖 fixture 的 teardown 中自动清理
  },
});

export { expect } from '@playwright/test';
```

---

## 在测试中使用 Fixture

### 完整测试示例

创建 `tests/order-creation.spec.ts`：

```typescript
/** @spec O003-beverage-order */
import { test, expect } from '@fixtures/testdata/testdata-TD-ORDER-001.fixture';

test.describe('饮料订单创建', () => {
  test('应该成功创建订单并显示订单详情', async ({ page, testOrder }) => {
    // testOrder 已自动供给，包含依赖的 user 和 store 数据

    // 访问订单详情页
    await page.goto(`/orders/${testOrder.id}`);

    // 验证订单信息
    await expect(page.locator('h1')).toContainText(testOrder.orderNumber);
    await expect(page.locator('[data-testid="order-status"]'))
      .toHaveText(testOrder.status);

    // 验证订单项
    const items = page.locator('[data-testid="order-item"]');
    await expect(items).toHaveCount(testOrder.items.length);

    // 验证总金额
    await expect(page.locator('[data-testid="total-amount"]'))
      .toContainText(`¥${testOrder.totalAmount.toFixed(2)}`);
  });

  test('应该支持订单状态更新', async ({ page, testOrder }) => {
    await page.goto(`/orders/${testOrder.id}/edit`);

    // 更新订单状态
    await page.selectOption('[data-testid="order-status-select"]', 'confirmed');
    await page.click('[data-testid="save-button"]');

    // 验证更新成功
    await expect(page.locator('[data-testid="order-status"]'))
      .toHaveText('confirmed');
  });
});

// 测试完成后，testOrder 及其依赖数据会自动清理
```

### 使用多个 Fixture

在同一测试中使用多个 testdata_ref：

```typescript
import { test as base } from '@playwright/test';
import { test as orderTest } from '@fixtures/testdata/testdata-TD-ORDER-001.fixture';
import { test as inventoryTest } from '@fixtures/testdata/testdata-TD-INVENTORY-001.fixture';

// 合并 fixtures
const test = base.extend({
  ...orderTest,
  ...inventoryTest,
});

test('订单创建应减少库存', async ({ page, testOrder, testInventory }) => {
  // 记录初始库存
  const initialStock = testInventory.stock;

  // 创建订单
  await page.goto('/orders/create');
  // ... 订单创建逻辑

  // 验证库存减少
  const newStock = await getInventoryStock(testInventory.id);
  expect(newStock).toBe(initialStock - testOrder.items[0].quantity);
});
```

---

## 常见工作流

### 工作流 1：API 策略数据供给

使用 REST API 动态创建测试数据：

**蓝图配置** (`testdata/blueprints/user-api.blueprint.yaml`):

```yaml
testdata_ref: TD-USER-API-001
description: 通过 API 创建的用户数据

schema:
  type: object
  properties:
    id: { type: string }
    username: { type: string }
    email: { type: string, format: email }
    role: { type: string, enum: [admin, operator, viewer] }
  required: [id, username, email, role]

strategy:
  type: api
  apiEndpoint: /api/test/users
  method: POST
  authType: bearer
  authToken: ${E2E_API_TOKEN}
  requestBody:
    username: "test-user-{{timestamp}}"
    email: "test-{{timestamp}}@cinema.com"
    role: "admin"
    password: "Test123456!"

metadata:
  env_profile: staging
  scope: test
  teardown: true
  teardownEndpoint: /api/test/users/{{id}}
  teardownMethod: DELETE
```

**生成并使用**：

```bash
# 生成 fixture
/testdata-planner generate TD-USER-API-001

# 在测试中使用
```

```typescript
import { test } from '@fixtures/testdata/testdata-TD-USER-API-001.fixture';

test('API 创建的用户可以登录', async ({ page, testUser }) => {
  // testUser 由 API 动态创建
  await page.goto('/login');
  await page.fill('[name="username"]', testUser.username);
  await page.fill('[name="password"]', 'Test123456!');
  await page.click('[type="submit"]');

  await expect(page).toHaveURL('/dashboard');
});

// 测试完成后，testUser 通过 DELETE /api/test/users/{id} 清理
```

---

### 工作流 2：DB Script 策略批量数据

直接执行 SQL 脚本供给大批量数据：

**蓝图配置** (`testdata/blueprints/inventory-db.blueprint.yaml`):

```yaml
testdata_ref: TD-INVENTORY-BULK-001
description: 批量库存数据（100+ SKU）

schema:
  type: array
  items:
    type: object
    properties:
      sku_id: { type: string }
      store_id: { type: string }
      stock: { type: integer }
      updated_at: { type: string, format: date-time }

strategy:
  type: db-script
  dbScriptPath: testdata/scripts/seed-inventory.sql
  dbConnection: ${SUPABASE_URL}
  dbAuth: ${SUPABASE_SERVICE_KEY}

metadata:
  env_profile: staging
  scope: worker  # Worker 级别 fixture，多个测试共享
  teardown: true
  teardownScriptPath: testdata/scripts/cleanup-inventory.sql
```

**SQL 脚本** (`testdata/scripts/seed-inventory.sql`):

```sql
-- @spec T004-e2e-testdata-planner
-- 批量插入库存数据

INSERT INTO inventory (id, sku_id, store_id, stock, updated_at)
SELECT
  gen_random_uuid(),
  'SKU-' || lpad(generate_series::text, 3, '0'),
  '{{TD-STORE-001.id}}',
  floor(random() * 100 + 50)::int,
  now()
FROM generate_series(1, 100);

-- 返回插入的数据供 fixture 使用
SELECT * FROM inventory WHERE store_id = '{{TD-STORE-001.id}}';
```

**使用 Worker 级别 Fixture**：

```typescript
import { test } from '@fixtures/testdata/testdata-TD-INVENTORY-BULK-001.fixture';

// worker 内的所有测试共享同一份 testInventory 数据
test.describe('库存查询功能', () => {
  test('应支持按 SKU 搜索', async ({ page, testInventory }) => {
    await page.goto('/inventory');
    await page.fill('[data-testid="sku-search"]', testInventory[0].sku_id);

    await expect(page.locator('[data-testid="inventory-row"]')).toHaveCount(1);
  });

  test('应支持分页显示', async ({ page, testInventory }) => {
    await page.goto('/inventory');

    // 验证总数
    await expect(page.locator('[data-testid="total-count"]'))
      .toContainText(testInventory.length.toString());
  });
});
```

---

### 工作流 3：多环境数据策略

为不同环境配置不同的数据供给策略：

**Staging 蓝图** (`testdata/blueprints/order-staging.blueprint.yaml`):

```yaml
testdata_ref: TD-ORDER-STAGING-001
strategy:
  type: seed
  seedFilePath: testdata/seeds/orders-staging.json
metadata:
  env_profile: staging
```

**Production 蓝图** (`testdata/blueprints/order-production.blueprint.yaml`):

```yaml
testdata_ref: TD-ORDER-PRODUCTION-001
strategy:
  type: api
  apiEndpoint: /api/test/orders
  # 生产环境使用 API 动态创建，避免种子文件污染
metadata:
  env_profile: production
```

**环境感知生成**：

```bash
# Staging 环境
E2E_ENV_PROFILE=staging /testdata-planner generate TD-ORDER-STAGING-001

# Production 环境
E2E_ENV_PROFILE=production /testdata-planner generate TD-ORDER-PRODUCTION-001
```

---

### 工作流 4：条件数据供给

仅在数据不存在时供给（幂等性）：

**蓝图配置**：

```yaml
testdata_ref: TD-USER-ADMIN-001

strategy:
  type: api
  apiEndpoint: /api/test/users
  method: POST
  conditionalSupply:
    enabled: true
    checkEndpoint: /api/test/users/by-username/{{username}}
    checkMethod: GET
    existsCondition: "response.status === 200"
    skipSupplyIfExists: true

metadata:
  scope: global  # 全局 fixture，整个测试套件共享
  teardown: false  # 不清理，保留供后续测试使用
```

**使用场景**：

```typescript
// 多个测试文件共享同一个 admin 用户
import { test } from '@fixtures/testdata/testdata-TD-USER-ADMIN-001.fixture';

test('管理员登录', async ({ page, testUserAdmin }) => {
  // testUserAdmin 在首次测试时创建，后续测试复用
  await page.goto('/login');
  // ...
});
```

---

## 常见问题排查

### 问题 1：循环依赖错误

**错误信息**：

```
❌ 验证失败：循环依赖检测

检测到循环依赖链：
  TD-ORDER-001 → TD-USER-001 → TD-ORDER-001

请移除循环引用或重新设计数据依赖关系。
```

**解决方案**：

```bash
# 查看依赖图
/testdata-planner diagnose dependencies TD-ORDER-001

# 输出示例：
# TD-ORDER-001
#   ├─ TD-USER-001
#   │  └─ TD-ORDER-001  ⚠️ 循环依赖!
#   └─ TD-STORE-001

# 修改蓝图，移除循环依赖
# 方案 1：将 TD-USER-001 的订单依赖改为可选
# 方案 2：重新设计数据模型，避免双向依赖
```

**最佳实践**：
- 保持依赖单向流动：`订单 → 用户 → 角色`
- 避免相互引用：使用弱引用或可选依赖

---

### 问题 2：种子文件未找到

**错误信息**：

```
❌ Fixture 生成失败

错误: 种子文件不存在
  路径: testdata/seeds/missing-file.json
  蓝图: TD-ORDER-001
```

**解决方案**：

```bash
# 检查种子文件路径
ls testdata/seeds/orders.json

# 验证蓝图配置
cat testdata/blueprints/order.blueprint.yaml | grep seedFilePath

# 创建缺失的种子文件
cat > testdata/seeds/orders.json <<EOF
{
  "testdata_ref": "TD-ORDER-001",
  "version": "1.0.0",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "orderNumber": "ORD-20251230",
      "status": "pending"
    }
  ]
}
EOF

# 重新生成 fixture
/testdata-planner generate TD-ORDER-001
```

---

### 问题 3：环境不匹配

**错误信息**：

```
❌ 验证失败：环境不匹配

蓝图要求环境: production
当前运行环境: staging

请设置正确的环境变量或使用匹配的蓝图。
```

**解决方案**：

```bash
# 方案 1：设置正确的环境变量
export E2E_ENV_PROFILE=production
/testdata-planner generate TD-ORDER-001

# 方案 2：修改蓝图支持多环境
# 在蓝图中配置:
metadata:
  env_profile: [staging, production]  # 支持多个环境

# 方案 3：创建环境特定的蓝图
# order-staging.blueprint.yaml (env_profile: staging)
# order-production.blueprint.yaml (env_profile: production)
```

---

### 问题 4：Schema 验证失败

**错误信息**：

```
❌ 种子数据验证失败

错误详情:
  字段: orderNumber
  期望类型: string (pattern: ^ORD-\d{8}$)
  实际值: "ORDER-123"
  错误: 不匹配正则表达式模式
```

**解决方案**：

```bash
# 查看 schema 定义
cat testdata/blueprints/order.blueprint.yaml | grep -A 10 "orderNumber"

# 修正种子文件数据
cat testdata/seeds/orders.json
# 将 "orderNumber": "ORDER-123" 改为 "ORD-20251230"

# 使用诊断工具验证
/testdata-planner diagnose validate-seed TD-ORDER-001

# 输出示例：
# ✅ 种子文件结构有效
# ✅ 所有字段类型正确
# ✅ 必填字段完整
```

---

### 问题 5：API 认证失败

**错误信息**：

```
❌ Fixture Setup 失败

策略: api
端点: /api/test/users
错误: 401 Unauthorized - 认证令牌无效或已过期
```

**解决方案**：

```bash
# 检查环境变量
echo $E2E_API_TOKEN

# 获取新令牌
export E2E_API_TOKEN=$(curl -X POST https://staging.cinema.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}' \
  | jq -r '.data.token')

# 或在蓝图中配置动态令牌刷新
strategy:
  type: api
  authType: bearer
  authToken: ${E2E_API_TOKEN}
  tokenRefresh:
    enabled: true
    refreshEndpoint: /api/auth/refresh
    refreshInterval: 3600  # 秒
```

---

### 问题 6：Teardown 失败

**错误信息**：

```
⚠️ Teardown 警告

无法删除测试数据: TD-ORDER-001
原因: 外键约束违规 - order_items 表仍引用此订单

建议: 检查依赖顺序或使用级联删除
```

**解决方案**：

```yaml
# 方案 1：配置级联删除
lifecycle:
  teardown:
    - delete_test_data:
        cascade: true

# 方案 2：调整 teardown 顺序（先删除子项）
lifecycle:
  teardown:
    - delete_order_items
    - delete_order
    - cleanup_dependencies

# 方案 3：在 SQL 脚本中使用 CASCADE
-- testdata/scripts/cleanup-orders.sql
DELETE FROM orders WHERE id = '{{order.id}}' CASCADE;
```

---

### 问题 7：生成的 Fixture 类型错误

**错误信息**：

```
TypeScript 编译错误:

tests/fixtures/testdata/testdata-TD-ORDER-001.fixture.ts:15:10
  类型 'TDOrder001Data' 缺少属性 'createdAt'
```

**解决方案**：

```bash
# 重新生成 fixtures（清理旧文件）
rm tests/fixtures/testdata/testdata-TD-ORDER-001.fixture.ts
/testdata-planner generate TD-ORDER-001

# 检查生成的类型定义
cat tests/fixtures/testdata/testdata-TD-ORDER-001.types.ts

# 如果类型仍然不匹配，验证蓝图 schema
/testdata-planner validate TD-ORDER-001 --verbose

# 确保种子数据包含所有必填字段
cat testdata/seeds/orders.json | jq '.data[0]'
```

---

### 问题 8：并发测试数据冲突

**错误信息**：

```
❌ 测试失败: 唯一约束违规

错误: 订单号 'ORD-20251230' 已存在
场景: 2 个并行测试使用了相同的 testdata_ref
```

**解决方案**：

```yaml
# 方案 1：使用 test 作用域（每个测试独立数据）
metadata:
  scope: test  # 而非 worker 或 global

# 方案 2：在种子数据中使用动态值
# testdata/seeds/orders.json
{
  "data": [
    {
      "orderNumber": "ORD-{{timestamp}}-{{random}}",
      "userId": "{{uuid}}"
    }
  ]
}

# 方案 3：使用 API 策略（自动生成唯一值）
strategy:
  type: api
  apiEndpoint: /api/test/orders
  # API 端点负责生成唯一 orderNumber
```

---

## 最佳实践

### ✅ 推荐做法

1. **保持依赖链简洁**
   ```
   最大深度: 3-5 层
   示例: 订单 → 用户 → 角色 → 权限 (4 层)
   ```

2. **使用语义化的 testdata_ref**
   ```
   ✅ TD-ORDER-PENDING-001
   ✅ TD-USER-ADMIN-FULL-PERMISSION
   ❌ TD-001
   ❌ TD-TEST-DATA
   ```

3. **为不同作用域选择合适的策略**
   ```
   - test 作用域: seed（快速）
   - worker 作用域: api 或 db-script（共享）
   - global 作用域: api（稳定性）
   ```

4. **版本化蓝图和种子文件**
   ```yaml
   testdata_ref: TD-ORDER-001
   version: 1.2.0  # 使用语义化版本
   ```

5. **安全处理敏感数据**
   ```bash
   # 不提交敏感种子文件
   echo "testdata/seeds/production-*" >> .gitignore

   # 使用环境变量替换敏感字段
   "password": "${TEST_USER_PASSWORD}"
   ```

### ❌ 避免做法

1. **不要创建深层依赖链**
   ```
   ❌ 订单 → 用户 → 会员 → 等级 → 权限 → 组 → 角色 (7 层)
   ```

2. **不要在种子文件中硬编码时间戳**
   ```json
   ❌ "createdAt": "2025-12-30T10:00:00Z"
   ✅ "createdAt": "{{now}}"
   ```

3. **不要共享可变数据**
   ```yaml
   # 如果测试会修改订单状态，使用 test 作用域
   metadata:
     scope: test  # ✅ 每个测试独立数据
   # 而非:
     scope: worker  # ❌ 测试间会相互影响
   ```

4. **不要跳过验证直接生成**
   ```bash
   ❌ /testdata-planner generate TD-ORDER-001
   ✅ /testdata-planner validate TD-ORDER-001 && \
      /testdata-planner generate TD-ORDER-001
   ```

---

## 下一步

掌握基础后，继续探索高级功能：

1. **阅读完整规格**
   - `specs/T004-e2e-testdata-planner/spec.md`

2. **探索数据模型**
   - `specs/T004-e2e-testdata-planner/data-model.md`

3. **集成到 CI/CD**
   ```yaml
   # .github/workflows/validate-testdata.yml
   - name: 验证测试数据蓝图
     run: /testdata-planner validate --all
   ```

4. **与其他 Skills 集成**
   - 使用 `/test-scenario-author` 创建场景（引用 testdata_ref）
   - 使用 `/e2e-test-generator` 生成测试（自动导入 fixtures）
   - 使用 `/e2e-runner` 执行测试（数据自动供给和清理）

5. **监控数据来源**
   ```bash
   # 查看数据来源日志
   cat testdata/logs/provenance.json | jq
   ```

6. **诊断供给问题**
   ```bash
   # 检查 API 可达性
   /testdata-planner diagnose health-check TD-ORDER-API-001

   # 验证数据库连接
   /testdata-planner diagnose db-connection
   ```

---

## 附加资源

- **Spec 文档**: `specs/T004-e2e-testdata-planner/spec.md`
- **数据模型**: `specs/T004-e2e-testdata-planner/data-model.md`
- **Skill 文档**: `.claude/skills/e2e-testdata-planner/skill.md`
- **Playwright Fixtures 文档**: https://playwright.dev/docs/test-fixtures
- **Zod 验证文档**: https://zod.dev/
- **相关 Skills**:
  - Test Scenario Author: `specs/T001-e2e-scenario-author/quickstart.md`
  - E2E Test Generator: `specs/T002-e2e-test-generator/quickstart.md`
  - E2E Runner: `specs/T003-e2e-runner/quickstart.md`

---

**版本**: 1.0.0
**最后更新**: 2025-12-30
