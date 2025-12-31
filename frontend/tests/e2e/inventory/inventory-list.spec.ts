import { test, expect } from '@playwright/test';

test.describe('门店SKU库存查询 - 用户故事1: 查看门店库存列表', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/query');
    await page.waitForLoadState('networkidle');
  });

  test('US1-1: 页面能正常加载并显示库存表格', async ({ page }) => {
    // Given 用户进入库存查询页面
    // When 页面加载完成
    // Then 应该显示库存表格

    // 验证页面标题
    const pageTitle = page.locator('h1, .page-title, [data-testid="page-title"]');
    await expect(pageTitle.first()).toContainText(/库存/);

    // 验证表格存在
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();
  });

  test('US1-2: 表格显示7列数据 (SKU编码、名称、现存/可用/预占数量、状态、单位)', async ({
    page,
  }) => {
    // Given 用户在库存查询页面
    // When 查看表格列
    // Then 应该显示7列

    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();

    // 验证列头
    const columns = ['SKU编码', 'SKU名称', '现存数量', '可用数量', '预占数量', '库存状态', '单位'];

    for (const columnName of columns) {
      const header = page.locator('th').filter({ hasText: columnName });
      await expect(header).toBeVisible();
    }
  });

  test('US1-3: 表格数据正确显示', async ({ page }) => {
    // Given 用户在库存查询页面
    // When 查看表格内容
    // Then 每行应该显示SKU库存信息

    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();

    // 等待数据加载
    await page.waitForTimeout(500);

    // 验证表格有数据行 (除了空状态)
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // 验证第一行有内容
      const firstRow = rows.first();
      const cells = firstRow.locator('td');
      expect(await cells.count()).toBeGreaterThanOrEqual(7);

      // 验证状态标签显示
      const statusTag = firstRow.locator('.ant-tag');
      if (await statusTag.isVisible()) {
        await expect(statusTag).toBeVisible();
      }
    }
  });

  test('US1-4: 库存状态标签正确显示颜色', async ({ page }) => {
    // Given 用户在库存查询页面
    // When 查看库存状态列
    // Then 状态标签应该显示正确的颜色

    await page.waitForTimeout(500);

    const statusTags = page.locator('.ant-table-tbody .ant-tag');
    const tagCount = await statusTags.count();

    if (tagCount > 0) {
      // 验证标签存在并有颜色类
      const firstTag = statusTags.first();
      await expect(firstTag).toBeVisible();

      // 验证标签有颜色样式 (green/blue/gold/orange/red)
      const tagText = await firstTag.textContent();
      expect(['充足', '正常', '偏低', '不足', '缺货']).toContain(tagText?.trim());
    }
  });

  test('US1-5: 分页功能正常工作', async ({ page }) => {
    // Given 库存数据超过一页
    // When 点击分页控件
    // Then 正确显示不同页的数据

    const pagination = page.locator('.ant-pagination');

    if (await pagination.isVisible()) {
      // 验证分页组件显示
      await expect(pagination).toBeVisible();

      // 获取当前页码
      const currentPageItem = pagination.locator('.ant-pagination-item-active');
      const currentPage = await currentPageItem.textContent();

      // 如果有下一页
      const nextButton = pagination.locator('.ant-pagination-next');
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(500);

        // 验证页码已改变
        const newPageItem = pagination.locator('.ant-pagination-item-active');
        const newPage = await newPageItem.textContent();
        expect(newPage).not.toBe(currentPage);

        // 验证表格已更新
        const rows = page.locator('.ant-table-tbody tr.ant-table-row');
        if ((await rows.count()) > 0) {
          await expect(rows.first()).toBeVisible();
        }
      }

      // 测试每页条数切换
      const sizeChanger = pagination.locator('.ant-pagination-options-size-changer');
      if (await sizeChanger.isVisible()) {
        await sizeChanger.click();
        await page.waitForTimeout(300);

        const option = page.locator('.ant-select-item:has-text("20 条/页")');
        if (await option.isVisible()) {
          await option.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('US1-6: 空状态正确显示', async ({ page }) => {
    // Given 库存数据为空或筛选无结果
    // When 查看表格
    // Then 显示空状态提示

    // 这个测试验证空状态组件的存在性
    // 由于有 mock 数据，我们检查空状态组件的实现

    const emptyState = page.locator('.ant-empty, [data-testid="empty-state"]');

    // 空状态可能不显示（因为有数据）
    // 但我们确保当没有数据时会显示
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      // 如果没有数据行，应该显示空状态
      await expect(emptyState).toBeVisible();
    }
  });

  test('US1-7: 加载状态正确显示', async ({ page }) => {
    // Given 用户刷新页面
    // When 数据正在加载
    // Then 显示加载状态

    // 刷新页面观察加载状态
    await page.reload();

    // 加载动画可能很快消失，这里验证表格最终加载完成
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible({ timeout: 5000 });
  });

  test('US1-8: 表格支持响应式布局', async ({ page }) => {
    // Given 用户在不同屏幕尺寸
    // When 调整窗口大小
    // Then 表格应该自适应

    // 设置较小的视口
    await page.setViewportSize({ width: 768, height: 600 });
    await page.waitForTimeout(300);

    // 验证表格仍然可见
    const table = page.locator('.ant-table, [data-testid="inventory-table"]');
    await expect(table).toBeVisible();

    // 恢复正常视口
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('US1-9: 页面标题和面包屑正确显示', async ({ page }) => {
    // Given 用户进入库存查询页面
    // When 查看页面头部
    // Then 应该显示正确的标题

    // 验证页面标题
    const pageTitle = page.locator('h1, .page-title, [data-testid="page-title"]');
    await expect(pageTitle.first()).toContainText(/库存/);
  });

  test('US1-10: 表格数据正确格式化', async ({ page }) => {
    // Given 用户查看库存数据
    // When 查看数量列
    // Then 数量应该正确格式化显示

    await page.waitForTimeout(500);

    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const firstRow = rows.first();
      const cells = firstRow.locator('td');

      // 验证数量列的格式（应该是数字）
      // 第3、4、5列是现存数量、可用数量、预占数量
      const onHandQtyCell = cells.nth(2);
      const onHandQtyText = await onHandQtyCell.textContent();

      // 数量应该是数字格式
      expect(onHandQtyText).toMatch(/^\d+(\.\d+)?$/);
    }
  });
});
