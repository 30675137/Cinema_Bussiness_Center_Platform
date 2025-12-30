---
name: e2e-test-generator
description: Generate and run Playwright E2E tests from YAML scenarios. Automatically converts scenario YAML files into executable Playwright TypeScript test scripts with test data loading, page object imports, and can execute them with various options (UI mode, debug, cross-system). Trigger keywords e2e test generator, playwright generator, test generation, run tests, execute tests, 测试生成, E2E脚本生成, 运行测试, 执行测试.
version: 1.1.0
---

# e2e-test-generator

**@spec T002-e2e-test-generator**

E2E测试脚本生成器 - 将场景YAML文件自动转换为可执行的测试脚本

## Description

e2e-test-generator 是一个 Claude Code Skill,用于将 T001-e2e-scenario-author 生成的场景 YAML 文件自动转换为可执行的测试脚本。

**核心功能**:
- 🎯 **单场景生成**: 将单个场景YAML转换为Playwright TypeScript测试脚本
- 📦 **批量生成**: 批量生成整个模块的所有测试脚本
- 🔄 **智能更新**: 检测文件修改,保留手动代码区域
- 🧩 **页面对象生成**: 自动生成缺失的页面对象模板
- ✅ **脚本验证**: TypeScript语法检查和Playwright dry-run验证
- 🚀 **脚本执行**: 直接运行生成的测试脚本（支持UI模式、调试模式、跨系统测试）

**支持的测试框架**:
- ✅ Playwright (UI + API测试) - P1优先级
- 🔜 Postman Collection - P2
- 🔜 REST Client .http - P2

## Usage

### 生成单个场景的测试脚本

```bash
/e2e-test-generator generate <scenario-id>
```

**示例**:
```bash
# 生成 E2E-INVENTORY-001 的 Playwright 测试脚本
/e2e-test-generator generate E2E-INVENTORY-001
```

**输出**:
```
✅ Generated: scenarios/inventory/E2E-INVENTORY-001.spec.ts
📋 Summary:
   - Framework: Playwright
   - Steps: 5
   - Assertions: 8
   - Page Objects: LoginPage, InventoryPage, OrderPage

⚠️  TODO Items:
   - Implement LoginPage.login() method
   - Implement InventoryPage.createAdjustment() method
```

### 批量生成模块测试脚本

```bash
/e2e-test-generator batch --module <module-name>
```

**示例**:
```bash
# 批量生成 inventory 模块的所有场景
/e2e-test-generator batch --module inventory
```

**输出**:
```
🚀 Batch Generation Report

✅ Success: 8/10 scenarios
   - E2E-INVENTORY-001.spec.ts
   - E2E-INVENTORY-002.spec.ts
   - ...

❌ Failed: 2/10 scenarios
   - E2E-INVENTORY-009.yaml (Invalid YAML format)
   - E2E-INVENTORY-010.yaml (Missing required field: steps)

📁 Output Directory: scenarios/inventory/
```

### 更新已存在的测试脚本

```bash
/e2e-test-generator update <scenario-id>
```

**智能更新策略**:
- **小幅修改 (<30%)**: 保留 CUSTOM CODE 区域,更新自动生成部分
- **大幅修改 (≥30%)**: 生成 .spec.new.ts 文件供手动合并

**示例**:
```bash
# 智能更新测试脚本
/e2e-test-generator update E2E-INVENTORY-001
```

### 验证生成的测试脚本

```bash
/e2e-test-generator validate <scenario-id>
```

**验证检查项**:
- TypeScript 语法检查
- Playwright dry-run 检查
- Import 路径验证
- 页面对象方法存在性检查

**示例**:
```bash
# 验证测试脚本
/e2e-test-generator validate E2E-INVENTORY-001
```

**输出**:
```
🔍 Validating E2E-INVENTORY-001.spec.ts

✅ TypeScript Syntax: PASS
✅ Playwright Dry-run: PASS
✅ Imports Resolved: PASS
⚠️  Page Object Method: LoginPage.login() - Method not implemented

Validation Score: 75% (3/4 checks passed)
```

### 执行生成的测试脚本

```bash
/e2e-test-generator run <scenario-id> [options]
```

**执行选项**:
- `--ui`: 使用 Playwright UI 模式运行
- `--headed`: 显示浏览器窗口
- `--debug`: 调试模式（逐步执行）
- `--project <name>`: 指定浏览器（chromium, firefox, webkit）
- `--cross-system`: 启用跨系统测试模式（自动启动多个服务器）

**示例**:
```bash
# 基本运行（无头模式）
/e2e-test-generator run E2E-INVENTORY-002

# UI 模式运行（推荐）
/e2e-test-generator run E2E-INVENTORY-002 --ui

# 跨系统测试（自动启动 C端 + B端服务器）
/e2e-test-generator run E2E-INVENTORY-002 --cross-system

# 调试模式
/e2e-test-generator run E2E-INVENTORY-002 --debug

# 指定浏览器
/e2e-test-generator run E2E-INVENTORY-002 --project chromium
```

**执行输出**:
```
🚀 Running E2E-INVENTORY-002.spec.ts

✓ Checking prerequisites...
  ✓ Playwright installed
  ✓ Test file exists

✓ Starting services...
  ✓ C端 (http://localhost:10086) - Ready
  ✓ B端 (http://localhost:3000) - Ready

Running 1 test using 1 worker

✓ [chromium] › E2E-INVENTORY-002.spec.ts:32:3 › 成品下单BOM库存预占与实扣流程验证 (12.5s)

  1 passed (12.5s)

📊 Test Results:
   Passed: 1/1
   Duration: 12.5s
   Browser: chromium

📁 Artifacts:
   Screenshots: 2
   Videos: 0
   Traces: 1

✅ All tests passed!
```

**失败时的输出**:
```
❌ Test Failed: E2E-INVENTORY-002

Error: LoginPage.login() method not implemented
  at LoginPage.login (pages/LoginPage.ts:28:11)

💡 Suggestions:
   1. Implement LoginPage.login() method
   2. Check test data configuration
   3. Verify services are running

📸 Screenshots saved to: test-results/
📹 Video saved to: test-results/video.webm
🔍 Trace saved to: test-results/trace.zip

Run 'npx playwright show-trace test-results/trace.zip' to debug
```

### 指定测试框架 (P2功能)

```bash
/e2e-test-generator generate <scenario-id> --framework <framework-name>
```

**支持的框架**:
- `playwright` (默认)
- `postman` (P2 - 未实现)
- `restclient` (P2 - 未实现)

**示例**:
```bash
# 生成 Postman Collection (P2功能)
/e2e-test-generator generate E2E-API-AUTH-001 --framework postman

# 生成 REST Client .http 文件 (P2功能)
/e2e-test-generator generate E2E-API-AUTH-001 --framework restclient
```

## Configuration

### Action Mappings

**配置文件**: `.claude/skills/e2e-test-generator/assets/templates/action-mappings.yaml`

定义 action → 代码模板的映射规则。

**示例**:
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
```

### Assertion Mappings

**配置文件**: `.claude/skills/e2e-test-generator/assets/templates/assertion-mappings.yaml`

定义 assertion → 代码模板的映射规则。

**示例**:
```yaml
element_visible:
  playwright:
    code: "await expect(page.locator('{{selector}}')).toBeVisible()"

response_status_is:
  playwright:
    code: "expect(response.status).toBe({{expected}})"
```

### 自定义 Action

1. 编辑 `action-mappings.yaml` 文件

2. 添加自定义 action 映射:
```yaml
approve_adjustment:
  playwright:
    code: "await inventoryPage.approveAdjustment({{adjustmentId}})"
    imports: ["InventoryPage"]
    params: ["adjustmentId"]
```

3. 在场景 YAML 中使用:
```yaml
steps:
  - action: approve_adjustment
    params:
      adjustmentId: "{{testdata_ref}}"
    description: 审批库存调整
```

4. 重新生成测试脚本

## Code Markers

生成的测试脚本包含以下标记,用于智能更新:

```typescript
// AUTO-GENERATED: Do not modify above this line
// 此行以上的代码由工具生成,更新时会被覆盖

import { test, expect } from '@playwright/test';
// ... auto-generated imports ...

test.describe('场景标题', () => {
  test.beforeEach(async ({ page }) => {
    // ... auto-generated setup ...
  });

  test('scenario', async ({ page }) => {
    // ... auto-generated steps ...

    // CUSTOM CODE START
    // 在此区域添加自定义代码
    // 更新时此区域的代码会被保留
    await page.screenshot({ path: 'debug.png' });
    console.log('Custom logic here');
    // CUSTOM CODE END
  });
});
```

**最佳实践**:
- ✅ 在 `CUSTOM CODE START/END` 区域内添加自定义断言和调试代码
- ✅ 不修改 `AUTO-GENERATED` 区域的代码
- ❌ 避免删除代码标记注释

## Cross-System Testing (跨系统测试)

**New in v1.1.0**: 支持在单个场景中跨越多个系统（C端/B端）。

### 系统标识符

在场景 YAML 的 `steps` 中使用 `system` 字段标识操作所属系统：

- **`c-end`**: C端（用户端）- Taro H5/小程序 (http://localhost:10086)
- **`b-end`**: B端（运营中台）- React Admin (http://localhost:3000)
- **`api`**: 纯 API 调用（无 UI 交互）

### 场景 YAML 示例

```yaml
scenario_id: E2E-INVENTORY-002
title: BOM库存预占与实扣流程
steps:
  # C端步骤（用户下单）
  - action: login
    system: c-end
    description: 用户登录 H5
  - action: browse_product
    system: c-end
  - action: create_order
    system: c-end
    description: 创建订单（触发预占）

  # B端步骤（吧台确认出品）
  - action: click
    system: b-end
    params:
      testdata_ref: bomTestData.confirm_production_btn
    description: 吧台确认出品（触发实扣）
```

### 生成的测试代码

生成器会自动：
1. 检测 `system` 字段变化
2. 在首次遇到 `b-end` 时创建新页面 `adminPage = await context.newPage()`
3. 插入系统切换注释
4. 使用正确的页面对象执行操作

**生成示例**:
```typescript
test('E2E-INVENTORY-002', async ({ page, context }) => {
  // ====== 第一部分：C端（H5/小程序） - 用户下单流程 ======
  await page.goto('http://localhost:10086');
  await loginPage.login(testData);
  await productPage.browseProduct(testData.product);
  const orderId = await orderPage.createOrder(testData);

  // ====== 第二部分：B端（运营中台） - 吧台确认出品流程 ======
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3000');
  await adminPage.click(testData.confirm_production_btn);

  // 断言可以在两个页面上执行
  await expect(page.locator('.order-status')).toHaveText('已出品');
  await expect(adminPage.locator('.toast')).toContainText('出品成功');
});
```

### 运行跨系统测试

使用专用的 npm 脚本运行跨系统测试：

```bash
cd frontend

# 运行所有跨系统测试（自动启动两个开发服务器）
npm run test:e2e:cross-system

# UI 模式运行
npm run test:e2e:cross-system:ui

# 运行特定场景
CROSS_SYSTEM_TEST=1 npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

### Playwright 配置

跨系统测试需要启动两个开发服务器。配置已在 `playwright.config.ts` 中完成：

```typescript
webServer: process.env.CROSS_SYSTEM_TEST ? [
  {
    command: 'cd ../hall-reserve-taro && npm run dev:h5',
    url: 'http://localhost:10086',  // C端
  },
  {
    command: 'npm run dev',
    url: 'http://localhost:3000',  // B端
  }
] : undefined
```

### 测试数据结构

跨系统测试数据应包含两个系统的配置：

```typescript
{
  // C端配置
  h5BaseUrl: 'http://localhost:10086',
  userCredentials: { phone: '13800138000', verifyCode: '123456' },

  // B端配置
  adminBaseUrl: 'http://localhost:3000',
  adminCredentials: { username: 'admin', password: 'admin123' },

  // 共享数据
  product: { id: 'whiskey-cola', name: '威士忌可乐鸡尾酒' }
}
```

### 参考文档

详细的跨系统测试指南请参考：`scenarios/CROSS_SYSTEM_TESTING.md`

## Input/Output

### Input

**场景 YAML 文件** (由 T001-e2e-scenario-author 生成)

**路径**: `scenarios/<module>/<scenario_id>.yaml`

**格式示例**:
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

### Output

**Playwright TypeScript 测试脚本**

**路径**: `scenarios/<module>/<scenario_id>.spec.ts`

**格式示例**:
```typescript
// @spec T002-e2e-test-generator
// AUTO-GENERATED: Do not modify above this line
// Generated from: scenarios/inventory/E2E-INVENTORY-001.yaml

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { InventoryPage } from './pages/InventoryPage';
import { loadTestData } from '@/testdata/loader';

test.describe('库存调整审批流程', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    testData = await loadTestData('inventoryTestData.scenario_001');
    await page.goto(testData.baseUrl);
  });

  test('E2E-INVENTORY-001', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Step: 管理员登录
    await loginPage.login(testData);

    // Step: 导航到库存调整页面
    await page.goto(testData.adjustment_page);

    // Step: 创建库存调整
    await inventoryPage.createAdjustment(testData.adjustment_data);

    // Assertions
    await expect(page.locator('.success-message')).toBeVisible();
    expect(response.status).toBe(200);

    // CUSTOM CODE START
    // Add your custom test logic here
    // CUSTOM CODE END
  });
});
```

**页面对象模板** (自动生成)

**路径**: `scenarios/<module>/pages/<PageName>Page.ts`

**格式示例**:
```typescript
// @spec T002-e2e-test-generator
// Auto-generated Page Object template
// TODO: Implement methods according to your application

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
}
```

## Examples

### 示例 1: 基本场景生成

**场景 YAML**:
```yaml
scenario_id: E2E-ORDER-001
spec_ref: O003
title: 创建饮品订单

steps:
  - action: login
  - action: browse_product
    params:
      testdata_ref: orderTestData.product
  - action: add_to_cart
    params:
      quantity: 2
  - action: checkout

assertions:
  - type: ui
    check: toast_message_shown
    params:
      message: 订单创建成功
```

**生成命令**:
```bash
/e2e-test-generator generate E2E-ORDER-001
```

**生成的测试脚本**:
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

test.describe('创建饮品订单', () => {
  test('E2E-ORDER-001', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Steps
    await loginPage.login(testData);
    await productPage.browseProduct(testData.product);
    await cartPage.addToCart(testData.product, 2);
    await checkoutPage.proceed();

    // Assertions
    await expect(page.locator('.toast')).toContainText('订单创建成功');
  });
});
```

### 示例 2: 批量生成

**场景结构**:
```
scenarios/inventory/
├── E2E-INVENTORY-001.yaml
├── E2E-INVENTORY-002.yaml
├── E2E-INVENTORY-003.yaml
└── ...
```

**生成命令**:
```bash
/e2e-test-generator batch --module inventory
```

**生成的文件**:
```
scenarios/inventory/
├── E2E-INVENTORY-001.spec.ts
├── E2E-INVENTORY-002.spec.ts
├── E2E-INVENTORY-003.spec.ts
└── ...
```

### 示例 3: 智能更新

**原始测试脚本** (手动添加了自定义代码):
```typescript
test('E2E-INVENTORY-001', async ({ page }) => {
  // ... auto-generated steps ...

  // CUSTOM CODE START
  await page.screenshot({ path: 'debug.png' });
  console.log('Custom assertion here');
  // CUSTOM CODE END
});
```

**更新场景 YAML** (添加新步骤):
```yaml
steps:
  - action: login
  - action: navigate
  - action: create_adjustment
  - action: approve_adjustment  # 新增步骤
```

**更新命令**:
```bash
/e2e-test-generator update E2E-INVENTORY-001
```

**更新后的测试脚本**:
```typescript
test('E2E-INVENTORY-001', async ({ page }) => {
  // ... auto-generated steps (updated) ...
  await inventoryPage.approveAdjustment(testData);  // 新增步骤

  // CUSTOM CODE START
  await page.screenshot({ path: 'debug.png' });
  console.log('Custom assertion here');  // 保留的自定义代码
  // CUSTOM CODE END
});
```

## Troubleshooting

### 场景 YAML 文件未找到

**错误信息**:
```
❌ Error: Scenario file not found: scenarios/inventory/E2E-INVENTORY-999.yaml
```

**解决方案**:
1. 检查场景 ID 是否正确
2. 确认场景文件存在于正确的模块目录下
3. 使用 `/test-scenario-author list --module inventory` 查看所有场景

### Page Object 方法未实现

**警告信息**:
```
⚠️  Page Object Missing: LoginPage.login()
Generated TODO marker in test script
```

**解决方案**:
1. 实现对应的页面对象方法
2. 或者保留 TODO 注释,后续手动实现

### TypeScript 编译错误

**错误信息**:
```
❌ TypeScript Error: Cannot find module '@/testdata/loader'
```

**解决方案**:
1. 确认项目配置了 TypeScript 路径别名 (`@/`)
2. 创建测试数据加载器模块

### 更新时自定义代码被覆盖

**症状**: 手动添加的断言在更新后丢失

**解决方案**:
1. 始终在 `CUSTOM CODE START/END` 区域内添加自定义代码
2. 如果已经覆盖,使用 Git 恢复并重新添加

## Dependencies

- **T001-e2e-scenario-author**: 场景 YAML 文件生成器
- **Playwright**: 测试运行框架
- **TypeScript**: 测试脚本语言
- **Python 3.8+**: Skill 实现语言
- **PyYAML 6.0+**: YAML 解析
- **Jinja2 3.0+**: 代码模板引擎
- **jsonschema**: 配置文件验证

## Technical Details

**实现语言**: Python 3.8+

**核心依赖**:
- PyYAML 6.0+ (YAML 解析)
- Jinja2 3.0+ (代码模板引擎)
- jsonschema (配置文件验证)
- hashlib (文件变更检测)
- pathlib (文件路径处理)

**测试框架**: pytest

**目录结构**:
```
.claude/skills/e2e-test-generator/
├── skill.md                    # 本文档
├── scripts/                    # Python 脚本
│   ├── cli.py                  # CLI 命令处理器
│   ├── yaml_parser.py          # YAML 解析器
│   ├── generate_playwright.py  # Playwright 生成器
│   ├── generate_postman.py     # Postman 生成器 (P2)
│   ├── generate_restclient.py  # REST Client 生成器 (P2)
│   ├── template_renderer.py    # Jinja2 模板渲染器
│   ├── config_loader.py        # 配置加载器
│   ├── file_utils.py           # 文件工具
│   └── validator.py            # 验证器
├── assets/templates/           # 模板文件
│   ├── playwright-test-template.ts.j2
│   ├── playwright-page-object-template.ts.j2
│   ├── action-mappings.yaml
│   ├── assertion-mappings.yaml
│   ├── postman-collection-template.json.j2
│   └── restclient-template.http.j2
├── tests/                      # 测试文件
│   ├── test_yaml_parser.py
│   ├── test_playwright_generator.py
│   └── ...
└── metadata/                   # 元数据存储
    └── <scenario_id>.json
```

## Version

**Current Version**: 1.0.0 (MVP - Playwright only)

**Roadmap**:
- ✅ P1: Playwright 测试脚本生成
- 🔜 P2: Postman Collection 生成
- 🔜 P2: REST Client .http 生成
- 🔜 P3: 智能更新和代码合并

## References

- Specification: `specs/T002-e2e-test-generator/spec.md`
- Data Model: `specs/T002-e2e-test-generator/data-model.md`
- Quick Start: `specs/T002-e2e-test-generator/quickstart.md`
- Contracts: `specs/T002-e2e-test-generator/contracts/`
- Playwright Docs: https://playwright.dev/
- Postman Collection Schema: https://schema.getpostman.com/
- Jinja2 Docs: https://jinja.palletsprojects.com/
