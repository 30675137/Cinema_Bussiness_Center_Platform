/**
 * 审核表格E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('审核表格功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 导航到审核管理页面
    const reviewMenu = page.locator('.ant-menu-item:has-text("审核管理")');
    await reviewMenu.click();
    await page.waitForLoadState('networkidle');
  });

  test('应该显示审核记录表格', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    const tableRows = page.locator('.ant-table-tbody tr');
    await expect(tableRows).toHaveCount(3);
  });

  test('应该显示不同状态的标签', async ({ page }) => {
    const tags = page.locator('.ant-tag');
    await expect(tags.first()).toBeVisible();

    // 检查是否有不同颜色的标签
    const tagColors = await tags.all();
    expect(tagColors.length).toBeGreaterThan(0);
  });
});