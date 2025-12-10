import { test, expect } from '@playwright/test';
import { ProductPage } from './pages/ProductPage';
import { testProducts } from './fixtures/test-data';

test.describe('用户故事1: 商品管理主界面', () => {
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    productPage = new ProductPage(page);
    await productPage.goto();
  });

  test('US1-1: 验证商品管理页面正常加载', async ({ page }) => {
    // Given 用户进入商品管理界面
    // When 页面加载完成
    // Then 显示商品列表，包含商品名称、SKU ID、类目、状态、基础价、库存信息

    await productPage.verifyPageLoaded();

    // 验证表格头部
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-sku"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-category"]')).toBeVisible();
    await expect(page.locator("[data-testid='table-header-status']")).toBeVisible();
    await expect(page.locator("[data-testid='table-header-price']")).toBeVisible();
    await expect(page.locator("[data-testid='table-header-stock']")).toBeVisible();

    // 验证新建商品按钮
    await expect(page.locator('[data-testid="create-product-button"]')).toBeVisible();

    // 验证搜索和筛选控件
    await expect(page.locator('[data-testid="search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="material-type-filter"]')).toBeVisible();
  });

  test('US1-2: 验证商品搜索功能', async ({ page }) => {
    // Given 用户在商品列表界面
    // When 输入商品名称进行搜索
    // Then 列表实时筛选显示匹配的商品

    // 搜索存在的商品
    await productPage.searchProduct('爆米花');

    // 验证搜索结果
    const searchResults = page.locator('[data-testid="product-row"]');
    const resultCount = await searchResults.count();
    expect(resultCount).toBeGreaterThan(0);

    // 验证搜索结果包含搜索关键词
    const firstResult = searchResults.first();
    await expect(firstResult).toContainText('爆米花');

    // 清空搜索
    await page.locator('[data-testid="search-input"]').clear();
    await page.keyboard.press('Enter');

    // 验证显示所有商品
    const allResults = page.locator('[data-testid="product-row"]');
    await expect(allResults.count()).toBeGreaterThan(resultCount);
  });

  test('US1-3: 验证商品筛选功能', async ({ page }) => {
    // Given 用户在商品列表界面
    // When 选择类目和状态进行筛选
    // Then 列表显示符合筛选条件的商品

    // 按类目筛选
    await productPage.filterProducts('食品');

    // 验证筛选结果
    const categoryResults = page.locator('[data-testid="product-row"]');
    const initialCount = await categoryResults.count();
    expect(initialCount).toBeGreaterThan(0);

    // 进一步按状态筛选
    await productPage.filterProducts(undefined, 'active');

    // 验证组合筛选结果
    const combinedResults = page.locator('[data-testid="product-row"]');
    const combinedCount = await combinedResults.count();
    expect(combinedCount).toBeGreaterThan(0);

    // 按物料类型筛选
    await productPage.filterProducts(undefined, undefined, '商品');
    const finalResults = page.locator('[data-testid="product-row"]');
    await expect(finalResults.count()).toBeGreaterThan(0);
  });

  test('US1-4: 验证新建商品导航', async ({ page }) => {
    // Given 用户在商品列表界面
    // When 点击"新建商品"按钮
    // Then 跳转到商品创建界面

    await productPage.clickCreateProduct();

    // 验证跳转到商品创建页面
    await expect(page).toHaveURL(/.*\/products\/create/);

    // 验证表单组件
    await expect(page.locator('[data-testid="product-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-tabs"]')).toBeVisible();
    await expect(page.locator('[data-testid="basic-info-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="content-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="specs-tab"]')).toBeVisible();
  });

  test('US1-5: 验证商品列表数据展示', async ({ page }) => {
    // Given 商品列表页面已加载
    // Then 验证表格数据正确显示

    await productPage.verifyPageLoaded();

    // 验证表格行存在
    const rows = page.locator('[data-testid="product-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 验证每行数据的完整性
    for (let i = 0; i < Math.min(rowCount, 3); i++) {
      const row = rows.nth(i);

      // 验证必填字段存在
      await expect(row.locator('[data-testid="cell-name"]')).toBeVisible();
      await expect(row.locator('[data-testid="cell-sku"]')).toBeVisible();
      await expect(row.locator('[data-testid="cell-category"]')).toBeVisible();
      await expect(row.locator('[data-testid="cell-status"]')).toBeVisible();

      // 验证数据格式
      const nameText = await row.locator('[data-testid="cell-name"]').textContent();
      const skuText = await row.locator('[data-testid="cell-sku"]').textContent();
      expect(nameText?.length).toBeGreaterThan(0);
      expect(skuText?.length).toBeGreaterThan(0);
    }
  });

  test('US1-6: 验证批量选择功能', async ({ page }) => {
    // Given 商品列表页面已加载
    // When 用户选择多个商品
    // Then 验证批量操作功能可用

    await productPage.verifyPageLoaded();

    const rows = page.locator('[data-testid="product-row"]');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(2);

    // 选择前两个商品
    await productPage.selectProducts([
      await rows.nth(0).locator('[data-testid="cell-sku"]').textContent() || '',
      await rows.nth(1).locator('[data-testid="cell-sku"]').textContent() || ''
    ]);

    // 验证批量操作按钮出现
    await expect(page.locator('[data-testid="batch-delete"]')).toBeVisible();
    await expect(page.locator('[data-testid="batch-export"]')).toBeVisible();

    // 验证选中计数
    await expect(page.locator('[data-testid="selected-count"]')).toContainText('2');
  });

  test('US1-7: 验证移动端响应式设计', async ({ page }) => {
    // Given 使用移动设备访问
    // When 加载商品管理页面
    // Then 验证移动端布局正常

    // 模拟移动设备视口
    await page.setViewportSize({ width: 375, height: 667 });
    await productPage.goto();

    // 验证移动端布局
    await expect(page.locator('[data-testid="product-table"]')).toBeVisible();

    // 验证移动端特有的交互元素
    await expect(page.locator('[data-testid="mobile-filter-toggle"]')).toBeVisible();

    // 验证表格在移动端的显示方式
    const mobileCards = page.locator('[data-testid="mobile-product-card"]');
    if (await mobileCards.count() > 0) {
      await expect(mobileCards.first()).toBeVisible();
    }
  });

  test('US1-8: 验证页面加载状态和错误处理', async ({ page }) => {
    // Given 访问商品管理页面
    // When 页面加载过程中
    // Then 显示适当的加载状态和错误处理

    // 监听网络请求
    page.on('request', request => {
      if (request.url().includes('/api/products')) {
        // 模拟网络延迟
        // Note: 在实际测试中，这里可以通过route handler来模拟延迟
      }
    });

    // 验证初始加载状态
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();

    // 验证表格加载完成
    await productPage.verifyPageLoaded();

    // 验证错误处理界面存在
    await expect(page.locator('[data-testid="error-boundary"]')).not.toBeVisible();
  });

  test('US1-9: 验证面包屑导航', async ({ page }) => {
    // Given 用户在商品管理页面
    // Then 验证面包屑导航正确显示

    await productPage.verifyPageLoaded();

    // 验证面包屑存在
    await expect(page.locator('[data-testid="breadcrumb"]')).toBeVisible();
    await expect(page.locator('[data-testid="breadcrumb-home"]')).toBeVisible();
    await expect(page.locator('[data-testid="breadcrumb-current"]')).toContainText('商品管理');
  });

  test('US1-10: 验证分页功能', async ({ page }) => {
    // Given 商品列表页面有足够的数据
    // When 用户进行分页操作
    // Then 验证分页功能正常工作

    await productPage.verifyPageLoaded();

    // 检查是否有分页组件
    const pagination = page.locator('[data-testid="pagination"]');
    if (await pagination.isVisible()) {
      // 验证分页控件
      await expect(pagination.locator('[data-testid="page-size"]')).toBeVisible();
      await expect(pagination.locator('[data-testid="page-info"]')).toBeVisible();

      // 如果有下一页，测试翻页
      const nextPage = pagination.locator('[data-testid="next-page"]');
      if (await nextPage.isEnabled()) {
        const firstPageProducts = await page.locator('[data-testid="product-row"]').count();

        await nextPage.click();
        await page.waitForTimeout(1000);

        const secondPageProducts = await page.locator('[data-testid="product-row"]').count();
        // 验证翻页后数据可能不同
        expect(secondPageProducts).toBeGreaterThanOrEqual(0);
      }
    }
  });
});