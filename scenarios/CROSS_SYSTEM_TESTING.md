# 跨系统 E2E 测试指南

**@spec T002-e2e-test-generator**

## 概述

本项目包含两个独立的前端系统：
- **C端（用户端）**: Taro H5/小程序 - `hall-reserve-taro` (port 10086)
- **B端（运营中台）**: React Admin - `frontend` (port 3000)

部分 E2E 场景需要跨越两个系统，例如：**用户在 C端下单 → 吧台在 B端确认出品**

## Playwright 跨系统测试方案

### 方案1: 多页面测试（推荐）⭐

使用 Playwright 的 `BrowserContext.newPage()` 在同一个测试中打开多个页面标签。

**优点**:
- ✅ 共享浏览器会话（Cookies、LocalStorage）
- ✅ 性能好，无需启动多个浏览器实例
- ✅ 可以在两个系统间自由切换

**示例代码**:
```typescript
test('跨系统测试', async ({ page, context }) => {
  // ====== 第一部分：C端操作 ======
  await page.goto('http://localhost:10086'); // Taro H5
  await page.fill('#username', 'user');
  await page.click('button:has-text("下单")');
  const orderId = await page.locator('.order-id').textContent();

  // ====== 第二部分：B端操作 ======
  const adminPage = await context.newPage(); // 新建标签页
  await adminPage.goto('http://localhost:3000'); // React Admin
  await adminPage.fill('#username', 'admin');
  await adminPage.click(`button[data-order-id="${orderId}"]`);

  // 两个页面都可以断言
  await expect(page.locator('.order-status')).toHaveText('已出品');
  await expect(adminPage.locator('.toast')).toContainText('出品成功');
});
```

### 方案2: 多浏览器上下文

为每个系统创建独立的 BrowserContext，适用于需要不同身份认证的场景。

**优点**:
- ✅ 完全隔离的会话（不同用户、不同权限）
- ✅ 可以模拟多个用户同时操作

**示例代码**:
```typescript
test('多上下文测试', async ({ browser }) => {
  // 用户上下文（C端）
  const userContext = await browser.newContext();
  const userPage = await userContext.newPage();
  await userPage.goto('http://localhost:10086');
  // ... 用户操作 ...

  // 管理员上下文（B端）
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto('http://localhost:3000');
  // ... 管理员操作 ...

  // 清理
  await userContext.close();
  await adminContext.close();
});
```

### 方案3: API + UI 混合测试

C端操作通过 API 完成，B端使用 UI 测试。

**优点**:
- ✅ 速度快（API 调用比 UI 操作快）
- ✅ 减少测试的脆弱性

**示例代码**:
```typescript
test('API + UI 混合', async ({ page, request }) => {
  // C端：通过 API 创建订单
  const response = await request.post('http://localhost:8080/api/orders', {
    data: { storeId: 1, items: [...] }
  });
  const { orderId } = await response.json();

  // B端：UI 操作确认出品
  await page.goto(`http://localhost:3000/orders/${orderId}`);
  await page.click('button:has-text("确认出品")');
  await expect(page.locator('.toast')).toContainText('出品成功');
});
```

## 测试数据结构

跨系统测试需要在测试数据中明确区分不同系统的配置：

```typescript
// testdata/bomTestData.json
{
  "scenario_001": {
    // C端配置
    "h5BaseUrl": "http://localhost:10086",
    "userCredentials": {
      "phone": "13800138000",
      "verifyCode": "123456"
    },

    // B端配置
    "adminBaseUrl": "http://localhost:3000",
    "adminCredentials": {
      "username": "admin",
      "password": "admin123",
      "role": "bartender"
    },

    // 共享数据
    "storeId": 1,
    "hallId": 1,
    "product": { ... }
  }
}
```

## 运行配置

### Playwright 配置

确保 `playwright.config.ts` 允许访问多个域名：

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: undefined, // 不设置全局 baseURL
    // 允许跨域请求
    extraHTTPHeaders: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  // 配置多个 webServer
  webServer: [
    {
      command: 'cd hall-reserve-taro && npm run dev:h5',
      url: 'http://localhost:10086',
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'cd frontend && npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI
    }
  ]
});
```

### 启动脚本

创建 `package.json` 脚本同时启动两个开发服务器：

```json
{
  "scripts": {
    "dev:all": "concurrently \"cd hall-reserve-taro && npm run dev:h5\" \"cd frontend && npm run dev\"",
    "test:e2e:cross-system": "npm run dev:all & sleep 5 && npx playwright test scenarios/inventory/E2E-INVENTORY-002.spec.ts"
  }
}
```

## 实际示例：E2E-INVENTORY-002

该场景完整演示了跨系统测试：

```typescript
test('E2E-INVENTORY-002', async ({ page, context }) => {
  // ====== C端：用户下单 ======
  await page.goto('http://localhost:10086');
  // ... 登录、浏览商品、加购、下单 ...
  const orderId = await orderPage.createOrder(testData);

  // ====== B端：吧台确认出品 ======
  const adminPage = await context.newPage();
  await adminPage.goto('http://localhost:3000');
  await adminLoginPage.login(testData.adminCredentials);
  await adminPage.goto(`http://localhost:3000/orders/${orderId}`);
  await adminPage.click('button:has-text("确认出品")');

  // ====== 数据库验证 ======
  // 验证库存预占 → 实扣流程
  // ...
});
```

## 最佳实践

### 1. 明确系统边界

在测试代码中使用注释明确区分不同系统的操作：

```typescript
// ====== 第一部分：C端（H5/小程序） - 用户下单流程 ======
// ...

// ====== 第二部分：B端（运营中台） - 吧台确认出品流程 ======
// ...
```

### 2. 数据传递

使用变量在不同系统间传递数据（如 orderId）：

```typescript
const orderId = await orderPage.createOrder(testData); // C端创建
await adminPage.goto(`/orders/${orderId}`); // B端使用
```

### 3. 页面对象复用

相同功能的 Page Object（如 LoginPage）可以在不同系统复用：

```typescript
const userLoginPage = new LoginPage(page); // C端登录
const adminLoginPage = new LoginPage(adminPage); // B端登录
```

### 4. 断言分离

分别对两个系统进行断言：

```typescript
// C端断言
await expect(page.locator('.order-status')).toHaveText('待出品');

// B端断言
await expect(adminPage.locator('.toast')).toContainText('出品成功');
```

### 5. 错误处理

跨系统测试更容易出错，需要更详细的日志：

```typescript
try {
  await adminPage.click('button:has-text("确认出品")');
  console.log(`✅ 订单 ${orderId} 出品成功`);
} catch (error) {
  await adminPage.screenshot({ path: `error-${orderId}.png` });
  throw new Error(`出品失败: ${error.message}`);
}
```

## 调试技巧

### 1. 并行查看两个系统

使用 Playwright UI 模式可以同时查看两个页面：

```bash
npx playwright test --ui scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

### 2. 分步调试

使用 `page.pause()` 暂停测试：

```typescript
await orderPage.createOrder(testData);
await page.pause(); // 暂停，检查 C端状态

const adminPage = await context.newPage();
await adminPage.pause(); // 暂停，检查 B端状态
```

### 3. 截图记录

在关键步骤截图：

```typescript
await page.screenshot({ path: 'step-6-order-created.png' });
await adminPage.screenshot({ path: 'step-7-production-confirmed.png' });
```

## 常见问题

### Q1: 两个系统的认证 Token 冲突怎么办？

**A**: 使用不同的 BrowserContext：

```typescript
const userContext = await browser.newContext();
const adminContext = await browser.newContext(); // 完全隔离的 session
```

### Q2: 如何确保数据一致性？

**A**: 在测试前后清理数据，或使用唯一标识符：

```typescript
const uniqueId = `test-${Date.now()}`;
// 使用 uniqueId 创建订单，避免数据污染
```

### Q3: 测试运行很慢怎么办？

**A**: C端操作改用 API 调用：

```typescript
// 慢：UI 操作
await page.click('button:has-text("下单")');

// 快：API 调用
const { orderId } = await request.post('/api/orders', { data: {...} });
```

## 参考资料

- [Playwright Multiple Pages](https://playwright.dev/docs/pages)
- [Playwright Browser Contexts](https://playwright.dev/docs/browser-contexts)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
