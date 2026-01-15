# 如何执行生成的 E2E 测试脚本

**@spec T002-e2e-test-generator**

## 快速开始

### 方法 1: 直接运行单个测试文件（推荐）⭐

```bash
cd frontend

# 运行单个测试文件
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts

# 带 UI 界面运行
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --ui

# 调试模式
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --debug

# 查看执行过程（headed 模式）
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --headed
```

### 方法 2: 跨系统测试专用命令

如果测试涉及 C端 + B端（如 E2E-INVENTORY-002），使用：

```bash
cd frontend

# 自动启动两个开发服务器并运行
npm run test:e2e:cross-system

# UI 模式
npm run test:e2e:cross-system:ui

# 运行特定场景
CROSS_SYSTEM_TEST=1 npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --ui
```

### 方法 3: 批量运行某个模块的所有测试

```bash
cd frontend

# 运行 inventory 模块的所有测试
npx playwright test ../scenarios/inventory/

# 运行所有场景测试
npx playwright test ../scenarios/

# 只运行特定浏览器
npx playwright test ../scenarios/inventory/ --project=chromium
```

---

## 详细执行步骤

### Step 1: 确保依赖已安装

```bash
cd frontend

# 安装 Node 依赖
npm install

# 安装 Playwright 浏览器（首次运行需要）
npx playwright install

# 或者只安装 Chromium（推荐，更快）
npx playwright install chromium
```

### Step 2: 启动开发服务器

根据测试类型选择启动的服务器：

#### A. 纯 B端测试（React Admin）

```bash
# Terminal 1: 启动 B端开发服务器
cd frontend
npm run dev
# 服务运行在 http://localhost:3000
```

#### B. 纯 C端测试（Taro H5）

```bash
# Terminal 1: 启动 C端开发服务器
cd hall-reserve-taro
npm run dev:h5
# 服务运行在 http://localhost:10086
```

#### C. 跨系统测试（C端 + B端）

**方式 1: 使用 CROSS_SYSTEM_TEST 自动启动**
```bash
cd frontend
# Playwright 会自动启动两个服务器
CROSS_SYSTEM_TEST=1 npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

**方式 2: 手动启动两个服务器**
```bash
# Terminal 1: C端
cd hall-reserve-taro
npm run dev:h5

# Terminal 2: B端
cd frontend
npm run dev

# Terminal 3: 运行测试
cd frontend
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts
```

### Step 3: 运行测试

```bash
cd frontend

# 基本运行
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts

# 查看详细输出
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --reporter=line

# 生成 HTML 报告
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --reporter=html
```

---

## 常用命令参考

### 运行模式

| 命令 | 说明 |
|------|------|
| `npx playwright test <file>` | 无头模式运行（最快） |
| `npx playwright test <file> --headed` | 显示浏览器窗口 |
| `npx playwright test <file> --ui` | Playwright UI 模式（推荐调试） |
| `npx playwright test <file> --debug` | 调试模式（逐步执行） |

### 浏览器选择

| 命令 | 说明 |
|------|------|
| `--project=chromium` | 只在 Chrome 运行 |
| `--project=firefox` | 只在 Firefox 运行 |
| `--project=webkit` | 只在 Safari 运行 |
| `--project="Mobile Chrome"` | 移动端 Chrome |

### 测试筛选

| 命令 | 说明 |
|------|------|
| `npx playwright test E2E-INVENTORY-002` | 运行匹配文件名的测试 |
| `npx playwright test --grep "库存"` | 运行包含"库存"的测试 |
| `npx playwright test --grep-invert "skip"` | 排除包含"skip"的测试 |

### 调试选项

| 命令 | 说明 |
|------|------|
| `--trace on` | 开启 trace 记录 |
| `--video on` | 录制视频 |
| `--screenshot on` | 失败时截图 |
| `--pause` | 每个测试前暂停 |

---

## 实际示例

### 示例 1: 第一次运行 E2E-INVENTORY-002

```bash
# 1. 安装依赖（首次运行）
cd frontend
npm install
npx playwright install chromium

# 2. 启动服务器（跨系统测试需要两个）
# Terminal 1: C端
cd hall-reserve-taro && npm run dev:h5

# Terminal 2: B端
cd frontend && npm run dev

# Terminal 3: 运行测试
cd frontend
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --headed

# 如果测试失败，查看报告
npx playwright show-report
```

### 示例 2: 调试失败的测试

```bash
cd frontend

# 1. UI 模式运行（可以看到执行过程）
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --ui

# 2. 或者使用调试模式（逐步执行）
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --debug

# 3. 查看 trace 文件（详细时间线）
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --trace on
npx playwright show-trace trace.zip
```

### 示例 3: CI/CD 模式运行

```bash
cd frontend

# 无头模式 + 重试 + HTML 报告
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts \
  --reporter=html \
  --retries=2 \
  --workers=1

# 查看报告
npx playwright show-report
```

---

## 配置修改（可选）

### 修改 playwright.config.ts 支持 scenarios 目录

如果你想使用 `npm run test:e2e` 直接运行 scenarios 下的测试，可以修改配置：

```typescript
// frontend/playwright.config.ts
export default defineConfig({
  testDir: '../scenarios',  // 修改为 scenarios 目录
  testMatch: '**/*.spec.ts',
  // ... 其他配置
});
```

然后就可以使用：

```bash
cd frontend
npm run test:e2e  # 运行所有 scenarios 测试
```

### 添加自定义脚本到 package.json

```json
{
  "scripts": {
    "test:scenario": "playwright test ../scenarios",
    "test:scenario:ui": "playwright test ../scenarios --ui",
    "test:inventory": "playwright test ../scenarios/inventory",
    "test:inventory:002": "playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts"
  }
}
```

使用：
```bash
npm run test:inventory:002
npm run test:inventory:002 -- --ui  # 传递额外参数
```

---

## 常见问题排查

### ❌ 错误: `Cannot find module '@playwright/test'`

**原因**: Playwright 未安装

**解决**:
```bash
cd frontend
npm install
```

### ❌ 错误: `Executable doesn't exist at ...`

**原因**: Playwright 浏览器未安装

**解决**:
```bash
npx playwright install
```

### ❌ 错误: `page.goto: net::ERR_CONNECTION_REFUSED`

**原因**: 开发服务器未启动

**解决**:
```bash
# 检查服务是否运行
curl http://localhost:3000  # B端
curl http://localhost:10086  # C端

# 如果未运行，启动对应服务器
cd frontend && npm run dev
cd hall-reserve-taro && npm run dev:h5
```

### ❌ 错误: `LoginPage.login() method not implemented`

**原因**: Page Object 方法未实现（这是预期的 TODO）

**解决**: 实现对应的 Page Object 方法

```typescript
// scenarios/inventory/pages/LoginPage.ts
async login(testData: any): Promise<void> {
  await this.usernameInput.fill(testData.username);
  await this.passwordInput.fill(testData.password);
  await this.loginButton.click();
  await this.page.waitForURL(/.*dashboard/);
}
```

### ❌ 错误: `Test timeout of 30000ms exceeded`

**原因**: 测试执行超时

**解决**:
```typescript
// 在测试文件中增加超时时间
test('E2E-INVENTORY-002', async ({ page, context }) => {
  test.setTimeout(60000); // 60 秒
  // ... 测试代码
});
```

或者在配置文件中全局设置：
```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 60000,  // 60 秒
});
```

---

## 推荐工作流

### 开发测试脚本时

```bash
# 1. 使用 UI 模式开发和调试
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --ui

# 2. 可以随时暂停查看页面状态
# 3. 修改代码后自动重新运行
```

### 验证测试通过时

```bash
# 1. 无头模式快速验证
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts

# 2. 多浏览器验证
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --project=chromium --project=firefox
```

### 提交代码前

```bash
# 运行所有相关测试
npx playwright test ../scenarios/inventory/

# 查看覆盖率报告
npm run test:coverage
```

---

## 自动化执行（GitHub Actions）

创建 `.github/workflows/e2e-test.yml`:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../hall-reserve-taro && npm ci

      - name: Install Playwright
        run: cd frontend && npx playwright install --with-deps

      - name: Run E2E tests
        run: cd frontend && CROSS_SYSTEM_TEST=1 npx playwright test ../scenarios

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 性能优化建议

### 1. 只安装需要的浏览器

```bash
# 只安装 Chromium（最快）
npx playwright install chromium

# 配置只运行 Chromium
# playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
]
```

### 2. 并行运行测试

```bash
# 使用 4 个 worker 并行运行
npx playwright test ../scenarios --workers=4
```

### 3. 复用浏览器上下文

```typescript
// 在多个测试间共享认证状态
test.use({ storageState: 'auth.json' });
```

---

## 总结

**最简单的执行方式**:

```bash
cd frontend
npx playwright test ../scenarios/inventory/E2E-INVENTORY-002.spec.ts --ui
```

**生产环境推荐**:

```bash
cd frontend
CROSS_SYSTEM_TEST=1 npx playwright test ../scenarios --reporter=html --retries=2
```

更多详细信息请参考：
- [Playwright 官方文档](https://playwright.dev/docs/running-tests)
- [跨系统测试指南](./CROSS_SYSTEM_TESTING.md)
