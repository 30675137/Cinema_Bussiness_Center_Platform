// @spec O004-beverage-sku-reuse
// AUTO-GENERATED: Do not modify above this line
// Generated from: scenarios/product/E2E-PRODUCT-003.yaml
// Updated at: 2025-12-31T14:30:00Z (T039 - Integrated TD-BOM-COCKTAIL-001 fixture)

import { test, expect } from '../../frontend/tests/fixtures/testdata/testdata-TD-BOM-COCKTAIL-001.fixture';
import { LoginPage } from './pages/LoginPage';

/**
 * E2E Test: 饮品配方配置时SKU选择器仅显示finished_product类型SKU
 *
 * User Story 2 (P2): 饮品配方只能关联成品SKU（SKU选择器过滤）
 *
 * Test Data: TD-BOM-COCKTAIL-001 (generated via e2e-testdata-planner)
 * Seed Data: testdata/seeds/bom-filter-skus.json
 *
 * T039 Changes:
 * - Migrated from hardcoded test data to TD-BOM-COCKTAIL-001 fixture
 * - Validates selector option count === seed data expected_sku_count (3)
 * - Iterates over all finished_product_skus from seed data (3 SKUs)
 * - Iterates over all packaging_skus to ensure exclusion (5 SKUs)
 * - Iterates over all raw_material_skus to ensure exclusion (2 SKUs)
 * - All assertions now dynamically validate against seed data
 */
test.describe('饮品配方配置时SKU选择器仅显示finished_product类型SKU', () => {
  const baseUrl = 'http://localhost:3000';

  test('E2E-PRODUCT-003: SKU选择器仅显示finished_product类型', async ({ page, TD_BOM_COCKTAIL_001 }) => {
    const loginPage = new LoginPage(page);
    const testData = TD_BOM_COCKTAIL_001;

    // Step 1: 管理员登录B端系统
    await page.goto(baseUrl);
    await loginPage.login(testData.adminCredentials);

    // Step 2: 导航到BOM配方管理页面
    await page.goto(`${baseUrl}/products/bom`);
    await page.waitForLoadState('networkidle');

    // Step 3: 点击新增配方按钮
    await page.click('[data-testid="add-bom-button"]');

    // Wait for form to load
    await page.waitForLoadState('networkidle');

    // Step 4: 点击"选择饮品SKU"按钮打开SKU选择器弹窗
    await page.click('[data-testid="select-beverage-sku-button"]');

    // Step 5: 等待SKU选择器加载完成（≤1秒）
    await page.waitForSelector('[data-testid="sku-selector-modal"]', { timeout: 1000 });

    // ========== Assertions ==========

    // Assertion 1: SKU选择器弹窗可见
    const selectorModal = page.locator('[data-testid="sku-selector-modal"]');
    await expect(selectorModal).toBeVisible();

    // Assertion 2: 只显示finished_product SKU，数量与种子数据匹配
    // T039: 验证选择器选项数量 === 种子数据中的 expected_sku_count
    const skuOptions = page.locator('[data-testid="sku-selector-option"]');
    await expect(skuOptions).toHaveCount(testData.expectedSkuCount);  // Expected: 3 from bom-filter-skus.json

    // Assertion 3: packaging类型SKU不显示（验证种子数据中的所有包材SKU）
    // T039: 遍历 testData.packagingSkus，确保所有包材SKU都不在选择器中
    for (const packagingSku of testData.packagingSkus) {
      const packagingOption = page.locator(`[data-testid="sku-selector-option"]:has-text("${packagingSku.name}")`);
      await expect(packagingOption).not.toBeVisible();
    }

    // Assertion 4: raw_material类型SKU不显示（验证种子数据中的所有原料SKU）
    // T039: 遍历 testData.rawMaterialSkus，确保所有原料SKU都不在选择器中
    for (const rawMaterialSku of testData.rawMaterialSkus) {
      const rawMaterialOption = page.locator(`[data-testid="sku-selector-option"]:has-text("${rawMaterialSku.name}")`);
      await expect(rawMaterialOption).not.toBeVisible();
    }

    // Assertion 5: finished_product SKU正确显示（验证种子数据中的所有成品SKU）
    // T039: 遍历 testData.finishedProductSkus，确保所有成品SKU都在选择器中
    for (const finishedProductSku of testData.finishedProductSkus) {
      const finishedProductOption = page.locator(`[data-testid="sku-selector-option"]:has-text("${finishedProductSku.name}")`);
      await expect(finishedProductOption).toBeVisible();
    }

    // Assertion 6: 搜索功能正常
    // 在搜索框输入"威士忌"
    const searchInput = page.locator('[data-testid="sku-search-input"]');
    await searchInput.fill('威士忌');

    // 等待搜索结果更新
    await page.waitForTimeout(500);

    // 验证只显示包含"威士忌"的finished_product SKU
    const filteredOptions = page.locator('[data-testid="sku-selector-option"]');
    await expect(filteredOptions).toHaveCount(2);  // 威士忌可乐鸡尾酒, 薄荷威士忌鸡尾酒

    // 验证搜索结果正确
    await expect(filteredOptions.first()).toContainText('威士忌');
    await expect(filteredOptions.last()).toContainText('威士忌');

    // 清除搜索
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Assertion 7: 手动输入packaging类型SKU编码被拒绝
    const skuCodeInput = page.locator('[data-testid="sku-code-input"]');
    if (await skuCodeInput.isVisible()) {
      // 输入packaging类型的SKU编码
      await skuCodeInput.fill('PKG-CUP-001');
      await page.keyboard.press('Enter');

      // 验证显示错误提示
      await expect(page.locator('.ant-message, .error-message')).toContainText('只能选择成品类型的SKU');
    }

    // CUSTOM CODE START
    // Add your custom test logic here
    // Example: Take screenshot for debugging
    // await page.screenshot({ path: `test-results/E2E-PRODUCT-003-${Date.now()}.png` });
    // CUSTOM CODE END
  });

  // Edge Case 1: SKU类型后期修改
  test.skip('Edge Case: 已关联的finished_product SKU后来被修改为packaging类型', async ({ page }) => {
    // TODO: Implement edge case test
    // 1. Create BOM with finished_product SKU association
    // 2. Change the SKU type to packaging
    // 3. Verify BOM shows "无效关联" warning
    // 4. Verify user is prompted to update the BOM
  });

  // Edge Case 2: 选择器中无可选SKU
  test.skip('Edge Case: 系统中不存在任何finished_product类型的饮品SKU', async ({ page }) => {
    // TODO: Implement edge case test
    // 1. Ensure no finished_product SKUs exist in the system
    // 2. Open SKU selector
    // 3. Verify empty state message: "暂无可选饮品SKU，请先创建成品饮品"
  });

  // Edge Case 3: 搜索结果为空
  test.skip('Edge Case: 搜索关键词无匹配结果', async ({ page }) => {
    // TODO: Implement edge case test
    // 1. Open SKU selector
    // 2. Search for non-existent keyword (e.g., "不存在的饮品")
    // 3. Verify empty state message: "未找到匹配的饮品SKU"
  });

  // Success Criteria Validation Test
  test('Success Criteria: SKU选择器性能和准确性', async ({ page, TD_BOM_COCKTAIL_001 }) => {
    const loginPage = new LoginPage(page);
    const testData = TD_BOM_COCKTAIL_001;

    await page.goto(baseUrl);
    await loginPage.login(testData.adminCredentials);

    await page.goto(`${baseUrl}/products/bom`);
    await page.click('[data-testid="add-bom-button"]');

    // Measure SKU selector load time
    const loadStartTime = Date.now();
    await page.click('[data-testid="select-beverage-sku-button"]');
    await page.waitForSelector('[data-testid="sku-selector-modal"]');
    const loadEndTime = Date.now();
    const loadDuration = loadEndTime - loadStartTime;

    // Success Criterion 1: SKU选择器在1秒内加载完成
    expect(loadDuration).toBeLessThanOrEqual(1000);

    // Success Criterion 2: SKU选择器过滤准确率达到100%
    // T039: 使用种子数据验证过滤准确性
    const allOptions = await page.locator('[data-testid="sku-selector-option"]').all();
    for (const option of allOptions) {
      const optionText = await option.textContent();
      // 验证不包含packaging或raw_material类型的SKU名称（从种子数据获取）
      for (const packagingSku of testData.packagingSkus) {
        expect(optionText).not.toContain(packagingSku.name);
      }
      for (const rawMaterialSku of testData.rawMaterialSkus) {
        expect(optionText).not.toContain(rawMaterialSku.name);
      }
    }

    // Success Criterion 3: 搜索功能正常工作
    const searchInput = page.locator('[data-testid="sku-search-input"]');
    await searchInput.fill('可乐');
    await page.waitForTimeout(300);

    const searchResults = page.locator('[data-testid="sku-selector-option"]');
    const searchResultsCount = await searchResults.count();
    expect(searchResultsCount).toBeGreaterThan(0);

    // 验证所有搜索结果都包含"可乐"
    const searchResultTexts = await searchResults.allTextContents();
    searchResultTexts.forEach(text => {
      expect(text).toContain('可乐');
    });
  });
});
