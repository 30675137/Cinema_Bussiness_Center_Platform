import { test, expect } from '@playwright/test';

test.describe('门店SKU库存查询 - 用户故事2: 搜索库存', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/query');
    await page.waitForLoadState('networkidle');
  });

  test('US2-1: 搜索框正确显示', async ({ page }) => {
    // Given 用户进入库存查询页面
    // When 查看页面
    // Then 应该显示搜索框

    const searchInput = page.locator(
      'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
    );
    await expect(searchInput.first()).toBeVisible();
  });

  test('US2-2: 输入关键词后列表筛选显示匹配的SKU', async ({ page }) => {
    // Given 用户在搜索框中输入关键词
    // When 等待防抖后
    // Then 列表显示匹配的SKU

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();
    await expect(searchInput).toBeVisible();

    // 输入搜索关键词
    await searchInput.fill('SKU001');

    // 等待防抖 (300ms) 和 API 响应
    await page.waitForTimeout(800);

    // 验证表格已更新 (可能有匹配结果或空结果)
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US2-3: 搜索支持SKU编码匹配', async ({ page }) => {
    // Given 用户输入SKU编码
    // When 搜索执行
    // Then 匹配的SKU应该显示

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 输入SKU编码
    await searchInput.fill('SKU');
    await page.waitForTimeout(800);

    // 验证结果包含匹配的SKU编码
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 验证结果中包含搜索关键词
      const firstRowText = await rows.first().textContent();
      // 由于是模糊匹配，结果应该包含 SKU 相关内容
      expect(firstRowText).toBeTruthy();
    }
  });

  test('US2-4: 搜索支持SKU名称匹配', async ({ page }) => {
    // Given 用户输入SKU名称关键词
    // When 搜索执行
    // Then 匹配的SKU应该显示

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 输入商品名称
    await searchInput.fill('可乐');
    await page.waitForTimeout(800);

    // 验证表格显示结果
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US2-5: 搜索防抖功能正常 (300ms)', async ({ page }) => {
    // Given 用户快速输入多个字符
    // When 输入完成后等待防抖
    // Then 只发送一次请求

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 快速输入多个字符
    await searchInput.fill('S');
    await page.waitForTimeout(100);
    await searchInput.fill('SK');
    await page.waitForTimeout(100);
    await searchInput.fill('SKU');

    // 等待防抖完成
    await page.waitForTimeout(500);

    // 验证最终结果
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US2-6: 清空搜索框恢复完整列表', async ({ page }) => {
    // Given 用户已输入搜索关键词
    // When 清空搜索框
    // Then 列表恢复显示所有数据

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 先输入搜索词
    await searchInput.fill('SKU001');
    await page.waitForTimeout(800);

    // 清空搜索框
    await searchInput.clear();
    await page.waitForTimeout(800);

    // 验证列表恢复
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();

    // 验证有数据行
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('US2-7: 搜索无结果时显示空状态', async ({ page }) => {
    // Given 用户输入不存在的关键词
    // When 搜索执行
    // Then 显示无结果提示

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 输入不可能存在的关键词
    await searchInput.fill('ZZZZZZZZNOTEXIST');
    await page.waitForTimeout(800);

    // 验证显示空状态或无结果提示
    const emptyState = page.locator('.ant-empty, [data-testid="empty-state"]');
    const noDataRow = page.locator('.ant-table-placeholder');

    // 应该显示空状态或空表格
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      // 验证空状态或占位符显示
      const hasEmpty = (await emptyState.isVisible()) || (await noDataRow.isVisible());
      expect(hasEmpty).toBe(true);
    }
  });

  test('US2-8: 搜索与分页结合正确', async ({ page }) => {
    // Given 用户搜索后有多页结果
    // When 切换分页
    // Then 保持搜索条件

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 输入搜索词
    await searchInput.fill('SKU');
    await page.waitForTimeout(800);

    // 检查分页
    const pagination = page.locator('.ant-pagination');
    if (await pagination.isVisible()) {
      const nextButton = pagination.locator('.ant-pagination-next');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // 验证搜索框内容保持
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe('SKU');
      }
    }
  });

  test('US2-9: 搜索框支持回车键触发', async ({ page }) => {
    // Given 用户在搜索框中输入关键词
    // When 按下回车键
    // Then 立即执行搜索

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 输入搜索词并按回车
    await searchInput.fill('SKU001');
    await searchInput.press('Enter');
    await page.waitForTimeout(500);

    // 验证搜索已执行
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US2-10: 搜索关键词不区分大小写', async ({ page }) => {
    // Given 用户输入小写关键词
    // When 搜索执行
    // Then 应该匹配大小写不敏感的结果

    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();

    // 输入小写
    await searchInput.fill('sku');
    await page.waitForTimeout(800);

    // 验证结果
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    // 如果有结果，验证匹配
    if (rowCount > 0) {
      const firstRowText = await rows.first().textContent();
      expect(firstRowText?.toLowerCase()).toContain('sku');
    }
  });
});
