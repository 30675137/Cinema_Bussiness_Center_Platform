---
name: e2e-testdata-planner
description: E2E测试数据规划器 - 定义测试数据蓝图、配置供给策略、生成Playwright fixtures
version: 1.0.0
author: Cinema Business Center Platform
spec: T004-e2e-testdata-planner
---

# E2E 测试数据规划器

**E2E 测试数据规划器**是一个 Claude Code Skill，作为测试数据契约与供给策略的单一真实来源，负责定义测试数据蓝图（testdata blueprints）、配置数据供给策略（seed/api/db-script）、生成生命周期计划（setup/teardown），并为 Playwright 测试生成类型安全的 fixtures。

## 功能概述

### 核心功能
1. **定义测试数据蓝图** - 使用 YAML 定义标准化的数据契约（testdata_ref: TD-ORDER-001）
2. **选择数据供给策略** - 支持 3 种策略：
   - **seed**: 静态 JSON/YAML 文件
   - **api**: REST API 调用
   - **db-script**: Supabase SQL 脚本
3. **生成生命周期计划** - 自动生成 setup/teardown 序列，处理依赖顺序
4. **验证数据契约** - 检测循环依赖、缺失引用、环境不匹配
5. **生成 Playwright Fixtures** - 生成类型安全的 TypeScript fixture 代码
6. **诊断供给问题** - 检测 API 端点可达性、文件存在性、数据库权限

### 工作流链集成

```
test-scenario-author (T001) → e2e-testdata-planner (T004) → e2e-test-generator (T002) → e2e-runner (T003)
       ↓                               ↓                              ↓                        ↓
  定义场景YAML                    定义testdata蓝图              生成测试代码               执行测试
  引用testdata_ref               生成fixtures                 导入fixtures              加载测试数据
```

## 使用方法

### 命令格式

```bash
/testdata-planner <subcommand> [options]
```

### 可用子命令

#### 1. `create` - 交互式创建蓝图

通过对话式引导创建新的测试数据蓝图。

```bash
/testdata-planner create
```

**交互流程**:
1. 输入 testdata_ref ID（格式：TD-<ENTITY>-<ID>，如 TD-ORDER-001）
2. 输入描述（如"带3个商品的饮品订单"）
3. 选择数据供给策略（seed / api / db-script）
4. 根据策略配置参数：
   - seed: 种子文件路径（testdata/seeds/orders.json）
   - api: API 端点（/api/test/orders）、方法（POST）、认证
   - db-script: SQL 脚本路径（testdata/scripts/seed-orders.sql）
5. 配置依赖（可选，如依赖 TD-USER-001 和 TD-STORE-001）
6. 配置 fixture 作用域（test / worker / global）
7. 配置环境（可选，如仅适用于 staging 和 production）

**示例输出**:
```yaml
# testdata/blueprints/order.blueprint.yaml
id: TD-ORDER-001
description: "带3个商品的饮品订单"
version: "1.0.0"
strategy:
  type: api
  apiEndpoint: /api/test/orders
  method: POST
  requestBody:
    storeId: "{{TD-STORE-001.storeId}}"
    userId: "{{TD-USER-001.userId}}"
    items:
      - productId: "P001"
        quantity: 2
      - productId: "P002"
        quantity: 1
  responseMapping:
    orderId: "data.id"
    orderNumber: "data.orderNumber"
dependencies:
  - TD-USER-001
  - TD-STORE-001
scope: test
teardown: true
timeout: 30000
```

---

#### 2. `validate` - 验证所有蓝图

验证 `testdata/blueprints/` 目录下的所有蓝图文件，检测：
- YAML 格式错误
- 模式验证失败（缺少必填字段）
- 循环依赖（A → B → C → A）
- 缺失依赖引用（引用了不存在的 testdata_ref）
- 环境配置不匹配（staging 环境引用了 production-only 蓝图）

```bash
/testdata-planner validate [options]
```

**选项**:
- `--env <profile>` - 指定环境（ci / staging / production / local），默认：all
- `--fix` - 自动修复部分错误（如格式化 YAML、移除重复依赖）

**示例输出**:
```
✅ 验证通过：50 个蓝图

循环依赖检测：
  ❌ 检测到循环：TD-ORDER-001 → TD-STORE-001 → TD-ORDER-001

缺失依赖：
  ❌ TD-ORDER-002 引用了不存在的 TD-USER-999

环境不匹配：
  ⚠️  TD-PAYMENT-001（仅 production）不可用于 staging 环境

建议：
  - 修复循环依赖：移除 TD-STORE-001 对 TD-ORDER-001 的依赖
  - 创建缺失蓝图：TD-USER-999
```

---

#### 3. `generate` - 生成 Playwright Fixtures

根据测试数据蓝图生成 TypeScript fixture 代码。

```bash
/testdata-planner generate <testdata-ref> [options]
```

**参数**:
- `<testdata-ref>` - 蓝图 ID（如 TD-ORDER-001）

**选项**:
- `--output <dir>` - 输出目录，默认：`tests/fixtures/testdata/`
- `--dry-run` - 仅预览生成代码，不写入文件
- `--env <profile>` - 指定环境（ci / staging / production / local）

**示例**:
```bash
/testdata-planner generate TD-ORDER-001 --env staging
```

**生成的文件**:
```typescript
// tests/fixtures/testdata/testdata-TD-ORDER-001.fixture.ts
/**
 * @spec T004-e2e-testdata-planner
 * Auto-generated fixture for TD-ORDER-001
 * ⚠️  DO NOT EDIT MANUALLY - This file is auto-generated
 * Generated at: 2025-12-30T10:00:00Z
 */
import { test as base } from '@playwright/test';

export interface TD_ORDER_001_Data {
  orderId: string;
  orderNumber: string;
  storeId: string;
  userId: string;
}

export const test = base.extend<{ TD_ORDER_001: TD_ORDER_001_Data }>({
  TD_ORDER_001: async ({ page }, use) => {
    // Setup: Call API to create order
    const response = await fetch(`${process.env.API_BASE_URL}/api/test/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.E2E_API_TOKEN}`,
      },
      body: JSON.stringify({
        storeId: "STORE-001",
        userId: "USER-001",
        items: [
          { productId: "P001", quantity: 2 },
          { productId: "P002", quantity: 1 }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    const data = await response.json();
    const orderData: TD_ORDER_001_Data = {
      orderId: data.data.id,
      orderNumber: data.data.orderNumber,
      storeId: "STORE-001",
      userId: "USER-001",
    };

    await use(orderData);

    // Teardown: Delete order
    await fetch(`${process.env.API_BASE_URL}/api/test/orders/${orderData.orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${process.env.E2E_API_TOKEN}`,
      },
    });
  },
});
```

**在测试中使用**:
```typescript
import { test } from './fixtures/testdata/testdata-TD-ORDER-001.fixture';

test('应该显示订单详情', async ({ page, TD_ORDER_001 }) => {
  // TD_ORDER_001 已自动创建并包含 orderId、orderNumber 等字段
  await page.goto(`/orders/${TD_ORDER_001.orderId}`);
  await expect(page.locator('.order-number')).toHaveText(TD_ORDER_001.orderNumber);
  // 测试结束后，订单会自动删除（teardown）
});
```

---

#### 4. `diagnose` - 诊断供给问题

检测测试数据供给配置的问题，包括：
- API 端点可达性（网络连接、认证、响应格式）
- 种子文件存在性和有效性（文件路径、JSON/YAML 格式、大小限制）
- 数据库脚本有效性（脚本路径、SQL 语法、权限）
- 环境变量配置（API_BASE_URL、E2E_API_TOKEN、SUPABASE_URL）

```bash
/testdata-planner diagnose <testdata-ref> [options]
```

**参数**:
- `<testdata-ref>` - 蓝图 ID（如 TD-ORDER-001）

**选项**:
- `--env <profile>` - 指定环境（ci / staging / production / local）
- `--verbose` - 显示详细诊断信息

**示例**:
```bash
/testdata-planner diagnose TD-ORDER-001 --env staging
```

**示例输出**:
```
🔍 诊断 TD-ORDER-001（staging 环境）

✅ 蓝图文件：testdata/blueprints/order.blueprint.yaml
✅ 策略类型：api
❌ API 端点：/api/test/orders
   ❌ 网络错误：ECONNREFUSED（连接被拒绝）
   建议：
     - 检查 .env 文件中的 API_BASE_URL 配置
     - 确认后端服务已启动（http://localhost:8080）
     - 检查防火墙和网络连接

✅ 依赖检查：
   ✅ TD-USER-001 存在
   ✅ TD-STORE-001 存在

⚠️  环境变量：
   ✅ API_BASE_URL 已设置
   ❌ E2E_API_TOKEN 未设置
   建议：在 .env 文件中添加 E2E_API_TOKEN=<your-token>

❌ 总体状态：失败（2 个错误，1 个警告）
```

---

## 快速开始

### 1. 安装依赖

```bash
cd .claude/skills/e2e-testdata-planner
npm install
```

### 2. 创建第一个蓝图

使用交互式向导：

```bash
/testdata-planner create
```

或手动创建 YAML 文件：

```yaml
# testdata/blueprints/user-admin.blueprint.yaml
id: TD-USER-ADMIN
description: "管理员用户（seed 策略示例）"
version: "1.0.0"
strategy:
  type: seed
  seedFilePath: testdata/seeds/users.json
  seedKey: "admin"  # 从数组中选择 key 为 "admin" 的对象
scope: worker  # worker 作用域：每个 worker 进程只执行一次 setup
teardown: false  # seed 策略通常不需要 teardown
```

创建种子文件：

```json
// testdata/seeds/users.json
[
  {
    "key": "admin",
    "userId": "USER-ADMIN-001",
    "username": "admin@cinema.com",
    "role": "admin",
    "token": "test-admin-token"
  },
  {
    "key": "customer",
    "userId": "USER-CUSTOMER-001",
    "username": "customer@cinema.com",
    "role": "customer",
    "token": "test-customer-token"
  }
]
```

### 3. 验证蓝图

```bash
/testdata-planner validate
```

### 4. 生成 Fixture

```bash
/testdata-planner generate TD-USER-ADMIN
```

生成的 fixture 文件：

```typescript
// tests/fixtures/testdata/testdata-TD-USER-ADMIN.fixture.ts
import { test as base } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

export interface TD_USER_ADMIN_Data {
  userId: string;
  username: string;
  role: string;
  token: string;
}

export const test = base.extend<{ TD_USER_ADMIN: TD_USER_ADMIN_Data }>({
  TD_USER_ADMIN: [async ({}, use) => {
    // Setup: Load seed data
    const seedPath = path.join(process.cwd(), 'testdata/seeds/users.json');
    const seedContent = await fs.readFile(seedPath, 'utf-8');
    const seedData = JSON.parse(seedContent);
    const userData = seedData.find((item: any) => item.key === 'admin');

    if (!userData) {
      throw new Error('Seed key "admin" not found in testdata/seeds/users.json');
    }

    await use({
      userId: userData.userId,
      username: userData.username,
      role: userData.role,
      token: userData.token,
    });

    // No teardown for seed strategy
  }, { scope: 'worker' }],
});
```

### 5. 在测试中使用

```typescript
// tests/admin-login.spec.ts
import { test } from './fixtures/testdata/testdata-TD-USER-ADMIN.fixture';
import { expect } from '@playwright/test';

test('管理员应该能够登录', async ({ page, TD_USER_ADMIN }) => {
  // 使用 seed 数据中的管理员用户
  await page.goto('/login');
  await page.fill('input[name="username"]', TD_USER_ADMIN.username);
  await page.fill('input[name="password"]', 'password');  // 密码不存储在 seed 中
  await page.click('button[type="submit"]');

  await expect(page.locator('.user-role')).toHaveText('admin');
});
```

---

## 最佳实践

### 1. 蓝图命名约定

- **格式**: `TD-<ENTITY>-<ID>`
- **ENTITY**: 大写实体名（ORDER、USER、STORE、PRODUCT）
- **ID**: 三位数字或描述性后缀（001、ADMIN、VIP）
- **示例**: `TD-ORDER-001`、`TD-USER-ADMIN`、`TD-STORE-MAIN`

### 2. 依赖管理

- **避免循环依赖**: 使用 `/testdata-planner validate` 检测
- **限制依赖深度**: 最多 10 层依赖链
- **明确依赖顺序**: 依赖关系应反映真实数据创建顺序

### 3. 策略选择指南

| 策略 | 适用场景 | 优点 | 缺点 |
|------|---------|------|------|
| **seed** | 静态、固定的测试数据（用户角色、配置） | 快速、无需网络 | 无法测试动态生成 |
| **api** | 需要真实 API 调用的数据（订单、预约） | 真实性高、测试 API | 依赖后端服务 |
| **db-script** | 大量数据或复杂关系（批量商品、库存） | 高效、灵活 | 需要数据库权限 |

### 4. Fixture 作用域

| 作用域 | 执行时机 | 适用场景 |
|--------|---------|---------|
| **test** | 每个测试前 setup，后 teardown | 测试间隔离的数据（订单、预约） |
| **worker** | 每个 worker 进程一次 | 共享数据（用户、门店） |
| **global** | 整个测试套件一次 | 全局配置（系统设置） |

### 5. 环境配置

使用 `environments` 字段限制蓝图适用环境：

```yaml
# 仅用于 staging 和 production 的支付测试
id: TD-PAYMENT-REAL
environments: [staging, production]
strategy:
  type: api
  apiEndpoint: /api/test/payments
```

在 CI/CD 中设置环境变量：

```bash
export E2E_ENV_PROFILE=staging  # ci / staging / production / local
export API_BASE_URL=https://staging.cinema-platform.com
export E2E_API_TOKEN=<staging-token>
```

---

## 故障排查

### 问题 1: 蓝图验证失败 - 循环依赖

**错误信息**:
```
❌ 检测到循环：TD-ORDER-001 → TD-STORE-001 → TD-ORDER-001
```

**解决方案**:
1. 检查依赖链：`TD-ORDER-001` 依赖 `TD-STORE-001`，但 `TD-STORE-001` 又依赖 `TD-ORDER-001`
2. 移除不必要的依赖：通常门店不应依赖订单
3. 重新验证：`/testdata-planner validate`

---

### 问题 2: Fixture 生成失败 - 缺失环境变量

**错误信息**:
```
❌ 环境变量未设置：API_BASE_URL
```

**解决方案**:
1. 创建 `.env` 文件：
   ```bash
   API_BASE_URL=http://localhost:8080
   E2E_API_TOKEN=test-token
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-key
   ```
2. 加载环境变量：使用 `dotenv` 或在 Playwright 配置中加载
3. 重新生成：`/testdata-planner generate TD-ORDER-001`

---

### 问题 3: API 策略失败 - 端点不可达

**错误信息**:
```
❌ 网络错误：ECONNREFUSED
```

**解决方案**:
1. 检查后端服务状态：`curl http://localhost:8080/health`
2. 验证 API 基础 URL：确保 `API_BASE_URL` 正确
3. 运行诊断：`/testdata-planner diagnose TD-ORDER-001 --verbose`
4. 检查认证：确认 `E2E_API_TOKEN` 有效

---

### 问题 4: 种子文件过大警告

**警告信息**:
```
⚠️  Seed file testdata/seeds/products.json is 15.2MB (>10MB)
   建议使用 db-script 策略以提高性能
```

**解决方案**:
1. 如果文件 <50MB：忽略警告（可继续使用 seed 策略）
2. 如果文件 ≥50MB：必须切换到 `db-script` 策略
3. 转换为 SQL 脚本：
   ```sql
   -- testdata/scripts/seed-products.sql
   INSERT INTO products (id, name, price, category_id)
   VALUES
     ('P001', '可乐', 500, 'BEVERAGE'),
     ('P002', '爆米花', 1200, 'SNACK');
   ```
4. 更新蓝图：
   ```yaml
   strategy:
     type: db-script
     dbScriptPath: testdata/scripts/seed-products.sql
     transactional: true
   ```

---

## 技术实现

### 技术栈
- **TypeScript 5.x** - 严格模式
- **Node.js 18+** - 运行时
- **Zod** - 运行时类型验证
- **js-yaml** - YAML 解析
- **inquirer.js** - CLI 交互
- **@supabase/supabase-js** - 数据库访问
- **Playwright 1.40+** - Fixture 系统（目标框架）

### 核心模块
- **BlueprintLoader** - 加载和注册蓝图
- **StrategySelector** - 选择数据供给策略
- **DependencyResolver** - 拓扑排序和循环检测
- **LifecycleGenerator** - 生成 setup/teardown 序列
- **FixtureCodeGenerator** - 生成 TypeScript 代码
- **DiagnosticsTool** - 诊断供给问题

### 测试覆盖率
- **目标**: 80%+ 覆盖率（Branches、Functions、Lines、Statements）
- **测试框架**: Vitest
- **测试类型**: 单元测试 + 集成测试

---

## 版本历史

### v1.0.0 (2025-12-30)
- ✅ 初始版本
- ✅ 支持 3 种数据供给策略（seed / api / db-script）
- ✅ 生命周期计划生成（setup / teardown）
- ✅ Playwright fixture 代码生成
- ✅ 依赖图分析（拓扑排序、循环检测）
- ✅ CLI 命令（create、validate、generate、diagnose）
- ✅ 环境配置支持（ci / staging / production / local）

---

## 相关文档

- **功能规格**: `specs/T004-e2e-testdata-planner/spec.md`
- **实现计划**: `specs/T004-e2e-testdata-planner/plan.md`
- **数据模型**: `specs/T004-e2e-testdata-planner/data-model.md`
- **快速开始**: `specs/T004-e2e-testdata-planner/quickstart.md`
- **任务分解**: `specs/T004-e2e-testdata-planner/tasks.md`

---

**Created**: 2025-12-30
**Author**: Cinema Business Center Platform
**Spec**: T004-e2e-testdata-planner
