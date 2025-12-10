/**
 * 商品表格E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('商品表格功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 导航到商品列表页面
    const productMenu = page.locator('.ant-menu-item:has-text("商品管理")');
    await productMenu.click();
    await page.waitForLoadState('networkidle');
  });

  test('应该显示商品表格', async ({ page }) => {
    // 检查表格是否存在
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    // 检查表格行数
    const tableRows = page.locator('.ant-table-tbody tr');
    await expect(tableRows).toHaveCount(3); // 应该有3条Mock数据
  });

  test('应该显示正确的表格列', async ({ page }) => {
    const tableHeaders = page.locator('.ant-table-thead th');
    const expectedHeaders = ['商品ID', '商品名称', '商品编码', '商品分类', '状态', '创建时间', '更新时间'];

    for (const header of expectedHeaders) {
      await expect(page.locator(`.ant-table-thead:has-text("${header}")`)).toBeVisible();
    }
  });

  test('表格应该支持分页', async ({ page }) => {
    // 检查分页组件是否存在
    const pagination = page.locator('.ant-pagination');
    await expect(pagination).toBeVisible();

    // 检查分页信息
    const paginationInfo = page.locator('.ant-pagination-total-text');
    await expect(paginationInfo).toContainText('共 3 条');
  });

  test('应该显示不同状态的商品', async ({ page }) => {
    // 检查状态列
    const statusCells = page.locator('.ant-table-tbody tr td:nth-child(5)');
    await expect(statusCells.first()).toBeVisible();

    // 检查是否有不同状态的颜色
    const statusColors = await statusCells.all();
    expect(statusColors.length).toBeGreaterThan(0);
  });
});