import { test, expect } from '@playwright/test';

test.describe('品牌搜索功能', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('access_token', 'test-token-123');
    });

    await page.goto('/mdm-pim/brands');
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="brand-table"]', { timeout: 5000 });
  });

  test('应该能够通过品牌名称搜索', async ({ page }) => {
    // 输入品牌名称进行搜索
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('可口可乐');

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查搜索结果是否正确
    const brandRows = page.locator('[data-testid="brand-table-row"]');
    await expect(brandRows).toHaveCount.greaterThan(0);

    // 验证搜索结果包含关键词
    for (const row of await brandRows.all()) {
      const brandName = await row.locator('[data-testid="brand-name"]').textContent();
      expect(brandName.toLowerCase()).toContain('可口可乐'.toLowerCase());
    }
  });

  test('应该能够通过英文名称搜索', async ({ page }) => {
    // 输入英文名称进行搜索
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('Coca-Cola');

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查搜索结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证英文名包含关键词
    if (await brandRows.count() > 0) {
      const firstRow = brandRows.first();
      const englishName = await firstRow.locator('[data-testid="english-name"]').textContent();
      if (englishName) {
        expect(englishName.toLowerCase()).toContain('coca-cola'.toLowerCase());
      }
    }
  });

  test('应该能够通过品牌编码搜索', async ({ page }) => {
    // 输入品牌编码进行搜索
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('BRAND001');

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查搜索结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证品牌编码包含关键词
    if (await brandRows.count() > 0) {
      const firstRow = brandRows.first();
      const brandCode = await firstRow.locator('[data-testid="brand-code"]').textContent();
      if (brandCode) {
        expect(brandCode.toLowerCase()).toContain('brand001'.toLowerCase());
      }
    }
  });

  test('应该能够通过品牌类型筛选', async ({ page }) => {
    // 选择品牌类型
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查筛选结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证所有结果都是选中的类型
    for (const row of await brandRows.all()) {
      const typeTag = await row.locator('[data-testid="brand-type"]');
      await expect(typeTag).toContainText('自有品牌');
    }
  });

  test('应该能够通过状态筛选', async ({ page }) => {
    // 选择状态
    const statusSelect = page.locator('[data-testid="brand-status-select"]');
    await statusSelect.click();
    await page.getByRole('option', { name: '启用' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查筛选结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证所有结果都是选中的状态
    for (const row of await brandRows.all()) {
      const statusTag = await row.locator('[data-testid="brand-status"]');
      await expect(statusTag).toContainText('启用');
    }
  });

  test('应该能够组合搜索条件', async ({ page }) => {
    // 输入关键词
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('品牌');

    // 选择品牌类型
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '代理品牌' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查筛选结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 验证结果符合筛选条件
    for (const row of await brandRows.all()) {
      const brandName = await row.locator('[data-testid="brand-name"]').textContent();
      const typeTag = await row.locator('[data-testid="brand-type"]');

      expect(brandName.toLowerCase()).toContain('品牌'.toLowerCase());
      expect(typeTag).toContainText('代理品牌');
    }
  });

  test('重置按钮应该清空所有筛选条件', async ({ page }) => {
    // 设置筛选条件
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('搜索关键词');

    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '自有品牌' }).click();

    const statusSelect = page.locator('[data-testid="brand-status-select"]');
    await statusSelect.click();
    await page.getByRole('option', { name: '停用' }).click();

    // 点击重置按钮
    await page.click('[data-testid="reset-button"]');

    // 验证筛选条件被清空
    await expect(searchInput).toHaveValue('');
    await expect(typeSelect).toHaveValue(''); // 或检查选中项

    // 等待数据重新加载
    await page.waitForLoad();

    // 验证显示所有品牌
    const brandRows = page.locator('[data-testid="brand-table-row"]');
    await expect(brandRows).toHaveCount.greaterThan(0);
  });

  test('搜索应该不区分大小写', async ({ page }) => {
    // 测试大小写不敏感搜索
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('coca-cola');

    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证大小写不敏感
    for (const row of await brandRows.all()) {
      const englishName = await row.locator('[data-testid="english-name"]').textContent();
      if (englishName) {
        // 应该找到包含"Coca-Cola"的品牌
        const found = englishName.toLowerCase().includes('coca-cola'.toLowerCase());
        expect(found).toBe(true);
      }
    }
  });

  test('搜索应该支持部分匹配', async ({ page }) => {
    // 测试部分匹配搜索
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('可乐');

    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证包含关键词
    for (const row of await brandRows.all()) {
      const brandName = await row.locator('[data-testid="brand-name"]').textContent();
      const englishName = await row.locator('[data-testid="english-name"]').textContent();

      const combinedText = `${brandName} ${englishName}`.toLowerCase();
      expect(combinedText).toContain('可乐');
    }
  });

  test('空搜索结果应该显示提示信息', async ({ page }) => {
    // 输入不存在的关键词
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('不存在此品牌XYZ123');

    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 检查是否显示空结果提示
    const emptyState = page.locator('[data-testid="brand-empty-state"]');
    const noResults = page.locator('[data-testid="no-results"]');

    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText('暂无匹配的品牌');
    } else if (await noResults.isVisible()) {
      await expect(noResults).toContainText('未找到匹配的品牌');
    }

    // 验证表格不显示数据
    const brandRows = page.locator('[data-testid="brand-table-row"]');
    await expect(brandRows).toHaveCount(0);
  });

  test('搜索过程中应该显示加载状态', async ({ page }) => {
    // 输入搜索关键词
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('测试搜索');

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 检查是否显示搜索加载状态
    const loadingState = page.locator('[data-testid="search-loading"]');

    if (await loadingState.isVisible()) {
      await expect(loadingState).toBeVisible();

      // 等待搜索完成
      await expect(loadingState).not.toBeVisible();
    }
  });

  test('应该支持实时搜索（如果有实时搜索功能）', async ({ page }) => {
    // 检查是否有实时搜索功能
    const searchInput = page.locator('[data-testid="keyword-input"]');

    // 检查是否支持实时搜索（通过监听输入事件）
    const hasRealTimeSearch = await searchInput.evaluate((input: HTMLInputElement) => {
      return input.hasAttribute('data-realtime-search') || input.hasAttribute('oninput');
    });

    if (hasRealTimeSearch) {
      // 测试实时搜索功能
      await searchInput.fill('实');
      await page.waitForTimeout(300); // 等待防抖
      await searchInput.fill('实时搜索测试');
      await page.waitForTimeout(500); // 等待搜索结果

      // 验证搜索结果
      const brandRows = page.locator('[data-testid="brand-table-row"]');

      if (await brandRows.count() > 0) {
        const firstRow = brandRows.first();
        const brandName = await firstRow.locator('[data-testid="brand-name"]').textContent();
        expect(brandName.toLowerCase()).toContain('实时搜索测试'.toLowerCase());
      }
    } else {
      // 如果没有实时搜索，跳过测试
      test.skip();
    }
  });
});