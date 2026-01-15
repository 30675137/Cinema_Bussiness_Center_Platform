# E2E 测试执行指南

**@spec P006-fix-sku-edit-data**

## 测试概述

本文档说明如何运行 E2E-PRODUCT-001 测试，验证 SKU 编辑页面显示关联的 SPU 完整信息。

## 前置条件

### 1. 测试数据准备

确保数据库中存在以下测试数据：

#### SKU 数据
```sql
-- 威士忌可乐鸡尾酒 SKU
INSERT INTO skus (id, code, name, price, spu_id, status, version, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440021',
  'FIN-COCKTAIL',
  '威士忌可乐鸡尾酒',
  3500,
  '550e8400-e29b-41d4-a716-446655440030',
  'ENABLED',
  1,
  NOW(),
  NOW()
);
```

#### SPU 数据
```sql
-- 威士忌可乐鸡尾酒 SPU
INSERT INTO spus (id, code, name, category_id, category_name, brand_id, brand_name, description, status, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440030',
  'SPU-COCKTAIL',
  '威士忌可乐鸡尾酒',
  '550e8400-e29b-41d4-a716-446655440100',
  '饮品 > 鸡尾酒',
  '550e8400-e29b-41d4-a716-446655440200',
  '自制',
  '经典威士忌可乐鸡尾酒，清爽解腻',
  'active',
  NOW(),
  NOW()
);
```

#### 用户数据（管理员账号）
```sql
-- 确保存在管理员账号: admin / password
-- (具体实现取决于认证系统)
```

### 2. 服务启动

#### 启动后端服务
```bash
# Terminal 1
cd backend
./mvnw spring-boot:run
# 或
mvn spring-boot:run

# 确认服务运行在 http://localhost:8080
curl http://localhost:8080/actuator/health
```

#### 启动前端服务
```bash
# Terminal 2
cd frontend
npm run dev

# 确认服务运行在 http://localhost:3000
```

## 运行测试

### 方式 1: 命令行运行（推荐）

```bash
# 在 frontend 目录下执行
cd frontend

# 运行单个测试（仅 Chromium）
npx playwright test ../scenarios/product/E2E-PRODUCT-001.spec.ts --project chromium

# 运行单个测试（所有浏览器）
npx playwright test ../scenarios/product/E2E-PRODUCT-001.spec.ts

# 运行测试并显示浏览器
npx playwright test ../scenarios/product/E2E-PRODUCT-001.spec.ts --headed

# 运行测试并生成报告
npx playwright test ../scenarios/product/E2E-PRODUCT-001.spec.ts --reporter=html

# 查看测试报告
npx playwright show-report
```

### 方式 2: UI 模式运行（调试推荐）

```bash
cd frontend

# 启动 Playwright UI 模式
npx playwright test --ui

# 在 UI 中选择 product/E2E-PRODUCT-001.spec.ts 运行
```

### 方式 3: Debug 模式

```bash
cd frontend

# 使用 Playwright Inspector 调试
npx playwright test ../scenarios/product/E2E-PRODUCT-001.spec.ts --debug
```

## 测试流程

测试将执行以下步骤：

1. ✅ **登录**: 访问 `http://localhost:3000/login`，使用管理员账号登录
2. ✅ **导航到 SKU 列表**: 访问 SKU 管理页面
3. ✅ **搜索 SKU**: 输入 SKU 编码 "FIN-COCKTAIL"
4. ✅ **点击编辑**: 点击搜索结果中的"编辑"按钮
5. ✅ **等待页面加载**: 等待 SKU 编辑页面加载完成（≤2秒）

## 验证点

测试将验证以下内容：

| # | 验证项 | 选择器 | 预期结果 |
|---|--------|--------|----------|
| 1 | SPU信息区域可见 | `[data-testid="spu-info-section"]` | 可见 |
| 2 | SPU名称正确 | `[data-testid="spu-name"]` | "威士忌可乐鸡尾酒" |
| 3 | SPU分类显示 | `[data-testid="spu-category"]` | 包含 "饮品 > 鸡尾酒" |
| 4 | SPU品牌显示 | `[data-testid="spu-brand"]` | 包含 "自制" |
| 5 | SPU描述显示 | `[data-testid="spu-description"]` | 包含 "清爽解腻" |
| 6 | SPU字段只读 | SPU区域内所有 input/textarea | readonly=true 或 disabled=true |
| 7 | API响应成功 | `/api/skus/{id}/details` | HTTP 200 |

## 测试结果示例

### 成功输出
```
Running 1 test using 1 worker

✓ [chromium] › product/E2E-PRODUCT-001.spec.ts:16:3 › SKU编辑页面应正确加载并显示关联的SPU完整信息 (5.2s)

1 passed (5.2s)
```

### 失败输出（示例）
```
✗ [chromium] › product/E2E-PRODUCT-001.spec.ts:16:3 › SKU编辑页面应正确加载并显示关联的SPU完整信息

Error: Timed out 2000ms waiting for expect(locator).toBeVisible()

Locator: locator('[data-testid="spu-info-section"]')
Expected: visible
Received: <element(s) not found>

Call log:
  - waiting for locator('[data-testid="spu-info-section"]')
```

## 故障排查

### 问题 1: 登录失败
**错误**: "Timed out waiting for URL"
**解决**:
- 检查管理员账号是否存在（admin / password）
- 检查后端认证服务是否正常
- 查看浏览器控制台错误

### 问题 2: SKU 搜索无结果
**错误**: "Element not found: button:has-text(编辑)"
**解决**:
- 检查数据库中是否存在 SKU 编码 "FIN-COCKTAIL"
- 检查 SKU 状态是否为 ENABLED
- 手动访问列表页验证数据

### 问题 3: SPU 信息未显示
**错误**: "SPU信息区域不可见"
**解决**:
- 检查 SKU 的 `spu_id` 是否正确关联
- 检查 SPU 数据是否存在于数据库
- 检查 API 响应: `GET /api/skus/{id}/details`
- 查看后端日志确认 SPU 查询是否成功

### 问题 4: API 响应失败
**错误**: "Expected response status 200, received 404"
**解决**:
- 确认后端服务运行在 http://localhost:8080
- 检查 SKUController 是否正确注册
- 查看后端日志: `tail -f backend/logs/spring-boot.log`
- 手动测试 API: `curl http://localhost:8080/api/skus/{id}/details`

## 性能基准

| 指标 | 目标 | 实际 |
|------|------|------|
| 页面加载时间 | ≤ 2秒 | - |
| API 响应时间 | ≤ 1秒 | - |
| 总测试时长 | ≤ 10秒 | - |

## 相关文件

- **测试脚本**: `scenarios/product/E2E-PRODUCT-001.spec.ts`
- **测试数据**: `frontend/src/testdata/sku.ts`
- **Page Objects**:
  - `scenarios/product/pages/LoginPage.ts`
  - `scenarios/product/pages/SKUListPage.ts`
  - `scenarios/product/pages/SKUEditPage.ts`
- **后端 API**: `backend/src/main/java/com/cinema/product/controller/SKUController.java`
- **Service 层**:
  - `backend/src/main/java/com/cinema/product/service/SKUService.java`
  - `backend/src/main/java/com/cinema/product/service/SPUService.java`
  - `backend/src/main/java/com/cinema/product/service/BOMService.java`

## CI/CD 集成

### GitHub Actions 示例
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Start Backend
        run: |
          cd backend
          ./mvnw spring-boot:run &
          sleep 30

      - name: Start Frontend
        run: |
          cd frontend
          npm ci
          npm run dev &
          sleep 10

      - name: Run E2E Tests
        run: |
          cd frontend
          npx playwright test ../scenarios/product/E2E-PRODUCT-001.spec.ts

      - name: Upload Test Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

**最后更新**: 2025-12-31
**维护者**: P006 团队
