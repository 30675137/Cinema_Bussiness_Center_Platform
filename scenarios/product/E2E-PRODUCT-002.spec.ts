// @spec O004-beverage-sku-reuse
// AUTO-GENERATED: Do not modify above this line
// Generated from: scenarios/product/E2E-PRODUCT-002.yaml
// Generated at: 2025-12-31T12:00:00Z

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { SKUListPage } from './pages/SKUListPage';

/**
 * E2E Test: 运营人员在SKU管理界面创建饮品成品SKU并验证小程序同步
 *
 * User Story 1 (P1): 运营人员通过SKU管理界面配置饮品成品
 *
 * Test Data: TD-SKU-BEVERAGE-001 (generated via e2e-testdata-planner)
 */
test.describe('运营人员在SKU管理界面创建饮品成品SKU并验证小程序同步', () => {
  let testData: any;

  test.beforeEach(async ({ page }) => {
    // TODO: Load test data from TD-SKU-BEVERAGE-001 fixture
    // For now, using hardcoded test data based on YAML specification
    testData = {
      adminCredentials: {
        username: 'admin',
        password: 'password'
      },
      skuCode: 'FIN-MOJITO-001',
      skuName: '薄荷威士忌鸡尾酒',
      skuType: 'finished_product',
      categoryPath: '饮品 > 鸡尾酒',
      price: '3500',
      unit: '份',
      baseUrl: 'http://localhost:3000'
    };
  });

  test('E2E-PRODUCT-002: 创建finished_product类型的饮品SKU', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const skuListPage = new SKUListPage(page);

    // Step 1: 管理员登录B端系统
    // TODO: 当前应用没有实现认证守卫，跳过登录步骤
    // await page.goto(`${testData.baseUrl}/login`);
    // await loginPage.login(testData.adminCredentials);

    // Step 2: 直接导航到SKU管理列表页面
    await page.goto(`${testData.baseUrl}/skus`);

    // Step 3: 点击新增SKU按钮 (使用文本选择器更可靠)
    await page.waitForSelector('button:has-text("创建 SKU")', { timeout: 10000 });
    await page.click('button:has-text("创建 SKU")');

    // Wait for form to load
    await page.waitForLoadState('networkidle');

    // Step 4: 填写SKU基本信息表单
    // SKU编码
    await page.fill('input[name="skuCode"]', testData.skuCode);

    // SKU名称
    await page.fill('input[name="skuName"]', testData.skuName);

    // SKU类型（finished_product）
    await page.locator('[data-testid="sku-type-select"]').click();
    await page.locator('text="成品"').click();  // 选择"成品"选项

    // 分类（饮品 > 鸡尾酒）
    // TODO: Implement category selection based on actual UI implementation
    // This is a placeholder - actual implementation may use cascader/tree-select
    await page.fill('input[name="category"]', testData.categoryPath);

    // 价格
    await page.fill('input[name="price"]', testData.price);

    // 主库存单位
    await page.fill('input[name="unit"]', testData.unit);

    // Step 5: 点击保存按钮提交表单
    await page.click('[data-testid="save-sku-button"]');

    // Step 6: 等待保存成功（≤2秒）
    await page.waitForLoadState('networkidle', { timeout: 2000 });

    // ========== Assertions ==========

    // Assertion 1: 保存成功提示
    await expect(page.locator('.ant-message, .toast')).toContainText('SKU创建成功');

    // Assertion 2: SKU出现在列表中
    const skuRow = page.locator(`tr:has-text("${testData.skuCode}")`);
    await expect(skuRow).toBeVisible();

    // Assertion 3: SKU类型显示为"成品"
    const skuTypeCell = skuRow.locator('td').nth(2);  // 假设第3列是SKU类型
    await expect(skuTypeCell).toContainText('成品');

    // Assertion 4: SKU分类显示正确
    const skuCategoryCell = skuRow.locator('td').nth(3);  // 假设第4列是分类
    await expect(skuCategoryCell).toContainText('鸡尾酒');

    // Assertion 5: API响应成功 (201 Created)
    // TODO: Intercept API call to verify status code
    // This requires setting up request interception before the save action

    // Assertion 6: 数据库验证（通过API查询）
    // TODO: Make API call to verify SKU was created
    // const response = await page.request.get(`${testData.baseUrl}/api/skus?skuCode=${testData.skuCode}`);
    // expect(response.status()).toBe(200);
    // const data = await response.json();
    // expect(data.data[0].skuCode).toBe(testData.skuCode);

    // CUSTOM CODE START
    // Add your custom test logic here
    // Example: Take screenshot for debugging
    // await page.screenshot({ path: `test-results/E2E-PRODUCT-002-${Date.now()}.png` });
    // CUSTOM CODE END
  });

  // Edge Case 1: 重复SKU编码
  test.skip('Edge Case: 尝试创建重复的SKU编码', async ({ page }) => {
    // TODO: Implement edge case test
    // 1. Create SKU with code FIN-MOJITO-001
    // 2. Try to create another SKU with same code
    // 3. Verify error message: "SKU编码已存在"
  });

  // Edge Case 2: 必填字段缺失
  test.skip('Edge Case: 必填字段为空', async ({ page }) => {
    // TODO: Implement edge case test
    // 1. Navigate to SKU creation form
    // 2. Leave SKU name field empty
    // 3. Verify validation error: "SKU名称不能为空"
    // 4. Verify save button is disabled
  });

  // Edge Case 3: 分类未选择
  test.skip('Edge Case: 未选择饮品分类', async ({ page }) => {
    // TODO: Implement edge case test
    // 1. Navigate to SKU creation form
    // 2. Fill all fields except category
    // 3. Verify validation error: "请选择分类"
  });
});
