/**
 * 库存表格E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('库存表格功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 导航到库存追溯页面
    const inventoryMenu = page.locator('.ant-menu-item:has-text("库存追溯")');
    await inventoryMenu.click();
    await page.waitForLoadState('networkidle');
  });

  test('应该显示库存记录表格', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    const tableRows = page.locator('.ant-table-tbody tr');
    await expect(tableRows).toHaveCount(3);
  });

  test('应该显示操作类型标签', async ({ page }) => {
    const operationTags = page.locator('.ant-table-tbody tr td:nth-child(6) .ant-tag');
    await expect(operationTags.first()).toBeVisible();
  });

  test('应该显示当前库存数量', async ({ page }) => {
    const quantityTags = page.locator('.ant-table-tbody tr td:nth-child(5) .ant-tag');
    await expect(quantityTags.first()).toBeVisible();
  });
});