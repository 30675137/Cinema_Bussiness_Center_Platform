/**
 * 定价表格E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('定价表格功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 导航到定价中心页面
    const pricingMenu = page.locator('.ant-menu-item:has-text("定价中心")');
    await pricingMenu.click();
    await page.waitForLoadState('networkidle');
  });

  test('应该显示定价规则表格', async ({ page }) => {
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    const tableRows = page.locator('.ant-table-tbody tr');
    await expect(tableRows).toHaveCount(3);
  });

  test('应该显示价格金额格式化', async ({ page }) => {
    const amountCells = page.locator('.ant-table-tbody tr td:nth-child(5)');
    await expect(amountCells.first()).toContainText('¥45.00');
  });

  test('应该显示价格类型', async ({ page }) => {
    const typeCells = page.locator('.ant-table-tbody tr td:nth-child(4)');
    await expect(typeCells.first()).toBeVisible();
  });
});