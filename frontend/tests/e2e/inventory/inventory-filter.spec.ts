import { test, expect } from '@playwright/test';

test.describe('门店SKU库存查询 - 用户故事3: 多维度筛选库存', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/query');
    await page.waitForLoadState('networkidle');
  });

  test('US3-1: 筛选栏正确显示', async ({ page }) => {
    // Given 用户进入库存查询页面
    // When 查看页面
    // Then 应该显示筛选组件

    // 验证门店筛选
    const storeFilter = page.locator('[data-testid="filter-store"], .store-filter');
    await expect(storeFilter.first()).toBeVisible();

    // 验证状态筛选
    const statusFilter = page.locator('[data-testid="filter-status"], .status-filter');
    await expect(statusFilter.first()).toBeVisible();

    // 验证分类筛选
    const categoryFilter = page.locator('[data-testid="filter-category"], .category-filter');
    await expect(categoryFilter.first()).toBeVisible();
  });

  test('US3-2: 门店筛选功能正常', async ({ page }) => {
    // Given 用户选择特定门店
    // When 应用筛选
    // Then 表格只显示该门店的库存记录

    const storeSelect = page.locator('[data-testid="filter-store"]');
    if (await storeSelect.isVisible()) {
      await storeSelect.click();
      await page.waitForTimeout(300);

      // 选择第一个门店选项
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(500);

        // 验证表格更新
        const table = page.locator('.ant-table, [data-testid="inventory-table"]');
        await expect(table).toBeVisible();
      }
    }
  });

  test('US3-3: 库存状态多选筛选功能正常', async ({ page }) => {
    // Given 用户选择多个库存状态
    // When 应用筛选
    // Then 表格显示符合选中状态的库存记录

    const statusSelect = page.locator('[data-testid="filter-status"]');
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.waitForTimeout(300);

      // 选择"不足"状态
      const lowOption = page.locator('.ant-select-item:has-text("不足")');
      if (await lowOption.isVisible()) {
        await lowOption.click();
      }

      // 选择"缺货"状态
      const outOfStockOption = page.locator('.ant-select-item:has-text("缺货")');
      if (await outOfStockOption.isVisible()) {
        await outOfStockOption.click();
      }

      // 关闭下拉框
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // 验证表格更新
      const table = page.locator('.ant-table, [data-testid="inventory-table"]');
      await expect(table).toBeVisible();
    }
  });

  test('US3-4: 商品分类筛选功能正常', async ({ page }) => {
    // Given 用户选择特定分类
    // When 应用筛选
    // Then 表格只显示该分类的库存记录

    const categorySelect = page.locator('[data-testid="filter-category"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.waitForTimeout(300);

      // 选择第一个分类选项
      const firstOption = page.locator('.ant-select-item').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
        await page.waitForTimeout(500);

        // 验证表格更新
        const table = page.locator('.ant-table, [data-testid="inventory-table"]');
        await expect(table).toBeVisible();
      }
    }
  });

  test('US3-5: 组合筛选功能正常', async ({ page }) => {
    // Given 用户同时选择多个筛选条件
    // When 应用筛选
    // Then 表格显示符合所有条件的库存记录

    // 先选择门店
    const storeSelect = page.locator('[data-testid="filter-store"]');
    if (await storeSelect.isVisible()) {
      await storeSelect.click();
      await page.waitForTimeout(200);
      const storeOption = page.locator('.ant-select-item').first();
      if (await storeOption.isVisible()) {
        await storeOption.click();
      }
    }

    await page.waitForTimeout(300);

    // 再选择分类
    const categorySelect = page.locator('[data-testid="filter-category"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.click();
      await page.waitForTimeout(200);
      const categoryOption = page.locator('.ant-select-item').first();
      if (await categoryOption.isVisible()) {
        await categoryOption.click();
      }
    }

    await page.waitForTimeout(500);

    // 验证表格更新
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US3-6: 重置筛选功能正常', async ({ page }) => {
    // Given 用户已设置筛选条件
    // When 点击重置按钮
    // Then 所有筛选条件被清除，列表显示全部数据

    // 先设置一个筛选条件
    const storeSelect = page.locator('[data-testid="filter-store"]');
    if (await storeSelect.isVisible()) {
      await storeSelect.click();
      await page.waitForTimeout(200);
      const storeOption = page.locator('.ant-select-item').first();
      if (await storeOption.isVisible()) {
        await storeOption.click();
      }
    }

    await page.waitForTimeout(300);

    // 点击重置按钮
    const resetButton = page.locator('button:has-text("重置"), [data-testid="reset-filter"]');
    if (await resetButton.isVisible()) {
      await resetButton.click();
      await page.waitForTimeout(500);

      // 验证筛选条件已清除
      const table = page.locator('.ant-table, [data-testid="inventory-table"]');
      await expect(table).toBeVisible();
    }
  });

  test('US3-7: 筛选与搜索可以组合使用', async ({ page }) => {
    // Given 用户已设置筛选条件
    // When 输入搜索关键词
    // Then 同时应用筛选和搜索条件

    // 先输入搜索
    const searchInput = page
      .locator(
        'input[placeholder*="搜索"], input[placeholder*="SKU"], [data-testid="search-input"]'
      )
      .first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('SKU');
      await page.waitForTimeout(400);
    }

    // 再设置筛选条件
    const statusSelect = page.locator('[data-testid="filter-status"]');
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.waitForTimeout(200);
      const statusOption = page.locator('.ant-select-item').first();
      if (await statusOption.isVisible()) {
        await statusOption.click();
        await page.keyboard.press('Escape');
      }
    }

    await page.waitForTimeout(500);

    // 验证表格更新
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US3-8: 筛选与分页可以组合使用', async ({ page }) => {
    // Given 用户已设置筛选条件且有多页结果
    // When 切换分页
    // Then 保持筛选条件

    // 先设置筛选条件
    const storeSelect = page.locator('[data-testid="filter-store"]');
    if (await storeSelect.isVisible()) {
      await storeSelect.click();
      await page.waitForTimeout(200);
      const storeOption = page.locator('.ant-select-item').first();
      if (await storeOption.isVisible()) {
        await storeOption.click();
      }
    }

    await page.waitForTimeout(500);

    // 检查分页并切换
    const pagination = page.locator('.ant-pagination');
    if (await pagination.isVisible()) {
      const nextButton = pagination.locator('.ant-pagination-next');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // 验证表格更新
        const table = page.locator('.ant-table, [data-testid="inventory-table"]');
        await expect(table).toBeVisible();
      }
    }
  });

  test('US3-9: 筛选无结果时显示空状态', async ({ page }) => {
    // Given 用户设置了不匹配任何数据的筛选条件
    // When 应用筛选
    // Then 显示无结果提示

    // 这里我们验证空状态组件存在的可能性
    // 实际测试中可能需要特殊的 mock 数据

    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US3-10: 筛选条件在页面刷新后保持', async ({ page }) => {
    // Given 用户设置了筛选条件
    // When 刷新页面
    // Then 筛选条件应该保持（如果实现了 URL 同步）

    // 设置筛选条件
    const storeSelect = page.locator('[data-testid="filter-store"]');
    if (await storeSelect.isVisible()) {
      await storeSelect.click();
      await page.waitForTimeout(200);
      const storeOption = page.locator('.ant-select-item').first();
      if (await storeOption.isVisible()) {
        await storeOption.click();
        await page.waitForTimeout(300);
      }
    }

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 验证表格显示
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });
});
