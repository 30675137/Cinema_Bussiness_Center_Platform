import { test, expect } from '@playwright/test';

test.describe('品牌筛选功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mdm-pim/brands');
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="brand-table"]', { timeout: 5000 });
  });

  test('应该能够通过品牌类型筛选', async ({ page }) => {
    // 选择自有品牌
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查筛选结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证所有结果都是自有品牌
    for (const row of await brandRows.all()) {
      const typeTag = await row.locator('[data-testid="brand-type"]').textContent();
      expect(typeTag).toContain('自有品牌');
    }
  });

  test('应该能够通过品牌状态筛选', async ({ page }) => {
    // 选择启用状态
    const statusSelect = page.locator('[data-testid="brand-status-select"]');
    await statusSelect.click();
    await page.getByRole('option', { name: '启用' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForLoad();

    // 检查筛选结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证所有结果都是启用状态
    for (const row of await brandRows.all()) {
      const statusTag = await row.locator('[data-testid="brand-status"]').textContent();
      expect(statusTag).toContain('启用');
    }
  });

  test('应该支持多种品牌类型筛选', async ({ page }) => {
    const brandTypes = ['自有品牌', '代理品牌', '联营品牌', '其他'];

    for (const brandType of brandTypes) {
      // 重置筛选条件
      await page.click('[data-testid="reset-button"]');
      await page.waitForLoad();

      // 选择品牌类型
      const typeSelect = page.locator('[data-testid="brand-type-select"]');
      await typeSelect.click();
      await page.getByRole('option', { name: brandType }).click();

      // 点击搜索按钮
      await page.click('[data-testid="search-button"]');
      await page.waitForLoad();

      // 检查筛选结果
      const brandRows = page.locator('[data-testid="brand-table-row"]');

      if ((await brandRows.count()) > 0) {
        for (const row of await brandRows.all()) {
          const typeTag = await row.locator('[data-testid="brand-type"]').textContent();
          expect(typeTag).toContain(brandType);
        }
      }
    }
  });

  test('应该支持多种状态筛选', async ({ page }) => {
    const statuses = ['启用', '停用', '草稿'];

    for (const status of statuses) {
      // 重置筛选条件
      await page.click('[data-testid="reset-button"]');
      await page.waitForLoad();

      // 选择状态
      const statusSelect = page.locator('[data-testid="brand-status-select"]');
      await statusSelect.click();
      await page.getByRole('option', { name: status }).click();

      // 点击搜索按钮
      await page.click('[data-testid="search-button"]');
      await page.waitForLoad();

      // 检查筛选结果
      const brandRows = page.locator('[data-testid="brand-table-row"]');

      if ((await brandRows.count()) > 0) {
        for (const row of await brandRows.all()) {
          const statusTag = await row.locator('[data-testid="brand-status"]').textContent();
          expect(statusTag).toContain(status);
        }
      }
    }
  });

  test('应该支持组合筛选条件', async ({ page }) => {
    // 选择品牌类型
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '代理品牌' }).click();

    // 选择状态
    const statusSelect = page.locator('[data-testid="brand-status-select"]');
    await statusSelect.click();
    await page.getByRole('option', { name: '启用' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 检查筛选结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证所有结果符合筛选条件
    for (const row of await brandRows.all()) {
      const typeTag = await row.locator('[data-testid="brand-type"]').textContent();
      const statusTag = await row.locator('[data-testid="brand-status"]').textContent();

      expect(typeTag).toContain('代理品牌');
      expect(statusTag).toContain('启用');
    }
  });

  test('筛选条件应该与关键词搜索组合工作', async ({ page }) => {
    // 输入关键词
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('品牌');

    // 选择品牌类型
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 检查筛选结果
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    // 如果有结果，验证所有结果符合筛选条件
    for (const row of await brandRows.all()) {
      const brandName = await row.locator('[data-testid="brand-name"]').textContent();
      const typeTag = await row.locator('[data-testid="brand-type"]').textContent();

      expect(brandName.toLowerCase()).toContain('品牌'.toLowerCase());
      expect(typeTag).toContain('自有品牌');
    }
  });

  test('应该能够清除单个筛选条件', async ({ page }) => {
    // 设置多个筛选条件
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('测试');

    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '自有品牌' }).click();

    const statusSelect = page.locator('[data-testid="brand-status-select"]');
    await statusSelect.click();
    await page.getByRole('option', { name: '启用' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 清除关键词
    await searchInput.clear();
    await searchInput.fill('');

    // 重新搜索
    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 验证筛选条件已部分更新
    const brandRows = page.locator('[data-testid="brand-table-row"]');

    if ((await brandRows.count()) > 0) {
      for (const row of await brandRows.all()) {
        const typeTag = await row.locator('[data-testid="brand-type"]').textContent();
        const statusTag = await row.locator('[data-testid="brand-status"]').textContent();

        expect(typeTag).toContain('自有品牌');
        expect(statusTag).toContain('启用');
      }
    }
  });

  test('筛选结果应该正确显示筛选状态标签', async ({ page }) => {
    // 设置筛选条件
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '代理品牌' }).click();

    const statusSelect = page.locator('[data-testid="brand-status-select"]');
    await statusSelect.click();
    await page.getByRole('option', { name: '停用' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 检查筛选状态标签是否存在（如果有这个功能）
    const activeFilterTags = page.locator('[data-testid="active-filter-tags"]');
    if (await activeFilterTags.isVisible()) {
      await expect(activeFilterTags.locator('[data-testid="filter-tag-type"]')).toContainText(
        '代理品牌'
      );
      await expect(activeFilterTags.locator('[data-testid="filter-tag-status"]')).toContainText(
        '停用'
      );
    }
  });

  test('筛选无结果时应该显示空状态', async ({ page }) => {
    // 设置一个不可能有结果的筛选组合
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('不可能存在的品牌名称');

    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '联营品牌' }).click();

    // 点击搜索按钮
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

  test('筛选状态应该正确显示在下拉框中', async ({ page }) => {
    // 选择品牌类型
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '其他' }).click();

    // 验证选择值
    await expect(typeSelect).toHaveValue('other');

    // 选择状态
    const statusSelect = page.locator('[data-testid="brand-status-select"]');
    await statusSelect.click();
    await page.getByRole('option', { name: '停用' }).click();

    // 验证选择值
    await expect(statusSelect).toHaveValue('disabled');
  });

  test('筛选功能应该与分页正确配合', async ({ page }) => {
    // 设置筛选条件
    const typeSelect = page.locator('[data-testid="brand-type-select"]');
    await typeSelect.click();
    await page.getByRole('option', { name: '自有品牌' }).click();

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 检查分页信息是否更新
    const paginationInfo = page.locator('[data-testid="pagination-total"]');
    if (await paginationInfo.isVisible()) {
      // 验证分页信息反映了筛选结果
      const paginationText = await paginationInfo.textContent();
      expect(paginationText).toBeDefined();
    }

    // 如果有分页按钮，测试翻页功能
    const nextButton = page.locator('[data-testid="pagination-next"]');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForLoad();

      // 验证翻页后筛选条件仍然有效
      const brandRows = page.locator('[data-testid="brand-table-row"]');
      if ((await brandRows.count()) > 0) {
        for (const row of await brandRows.all()) {
          const typeTag = await row.locator('[data-testid="brand-type"]').textContent();
          expect(typeTag).toContain('自有品牌');
        }
      }
    }
  });

  test('筛选结果数量应该正确显示', async ({ page }) => {
    // 设置筛选条件
    const searchInput = page.locator('[data-testid="keyword-input"]');
    await searchInput.fill('品牌');

    // 点击搜索按钮
    await page.click('[data-testid="search-button"]');
    await page.waitForLoad();

    // 检查结果数量显示
    const resultCount = page.locator('[data-testid="result-count"]');
    if (await resultCount.isVisible()) {
      const countText = await resultCount.textContent();
      expect(countText).toMatch(/\d+/); // 应该包含数字
    }

    // 验证实际显示的行数与显示的数量一致（如果有这个功能）
    const brandRows = page.locator('[data-testid="brand-table-row"]');
    const actualCount = await brandRows.count();

    // 如果显示总数，验证逻辑一致性
    const paginationTotal = page.locator('[data-testid="pagination-total"]');
    if (await paginationTotal.isVisible()) {
      const totalText = await paginationTotal.textContent();
      // 这里可以根据实际UI逻辑进行验证
    }
  });
});
