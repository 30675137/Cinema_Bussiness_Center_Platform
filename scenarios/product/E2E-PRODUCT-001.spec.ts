// @spec T002-e2e-test-generator
// AUTO-GENERATED: Do not modify above this line
// Generated from: scenarios/product/E2E-PRODUCT-001.yaml

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { SKUListPage } from './pages/SKUListPage';
import { SKUEditPage } from './pages/SKUEditPage';
import { scenario_001 } from '../../frontend/src/testdata/sku';

test.describe('SKU编辑页面应正确加载并显示关联的SPU完整信息', () => {
  // Test data loaded from frontend/src/testdata/sku.ts
  const testData = scenario_001;


  test('E2E-PRODUCT-001 - SKU编辑页面显示SPU信息', async ({ page }) => {
    // Initialize page objects
    const loginPage = new LoginPage(page);
    const skuListPage = new SKUListPage(page);
    const skuEditPage = new SKUEditPage(page);

    // Capture console messages for debugging
    page.on('console', msg => {
      console.log(`[BROWSER CONSOLE ${msg.type()}]:`, msg.text());
    });

    // Capture page errors
    page.on('pageerror', err => {
      console.log('[PAGE ERROR]:', err.message);
    });

    // Setup API response interception before navigation
    let apiResponseReceived = false;
    page.on('response', async (response) => {
      console.log(`[API] ${response.status()} ${response.url()}`);
      if (response.url().includes('/api/skus/') && response.url().includes('/details')) {
        apiResponseReceived = true;
        expect(response.status()).toBe(200);
      }
    });

    // Step 1: 模拟登录 - 绕过后端登录功能（当前未实现）
    // 直接设置 localStorage token 并跳转到首页
    await page.goto(testData.adminBaseUrl);
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'mock_token');
    });

    // Step 2: 导航到商品管理 > SKU管理列表页面
    await skuListPage.goto(testData.adminBaseUrl);

    // Step 3: 在搜索框中输入SKU编码 "FIN-COCKTAIL"
    await skuListPage.searchSKU(testData.targetSku.code);

    // Step 4: 点击搜索结果中的"编辑"按钮
    await skuListPage.clickEditButton(testData.targetSku.code);

    // Step 5: 等待SKU编辑页面数据加载完成（≤2秒）
    await skuEditPage.waitForLoad(testData.loadTimeout);

    // Assertions
    // Assertion 1: SPU信息区域可见
    await expect(skuEditPage.spuInfoSection).toBeVisible();

    // Assertion 2: SPU产品名称正确显示
    await expect(skuEditPage.spuNameField).toHaveText(testData.expectedSpu.name);

    // Assertion 3: SPU分类正确显示
    await expect(skuEditPage.spuCategoryField).toBeVisible();
    const categoryText = await skuEditPage.getSPUCategory();
    expect(categoryText).toContain(testData.expectedSpu.categoryName);

    // Assertion 4: SPU品牌正确显示
    await expect(skuEditPage.spuBrandField).toBeVisible();
    const brandText = await skuEditPage.getSPUBrand();
    expect(brandText).toContain(testData.expectedSpu.brandName);

    // Assertion 5: SPU描述正确显示
    await expect(skuEditPage.spuDescriptionField).toBeVisible();
    const descriptionText = await skuEditPage.getSPUDescription();
    expect(descriptionText).toContain(testData.expectedSpu.description);

    // Assertion 6: SPU字段为只读状态
    const isReadonly = await skuEditPage.isSPUReadonly();
    expect(isReadonly).toBe(true);

    // Assertion 7: API响应成功
    expect(apiResponseReceived).toBe(true);

    // CUSTOM CODE START
    // Add your custom test logic here
    // CUSTOM CODE END
  });
});
