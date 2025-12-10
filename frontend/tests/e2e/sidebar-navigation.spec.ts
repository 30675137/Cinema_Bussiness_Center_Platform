/**
 * 侧边栏菜单导航E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('侧边栏菜单导航', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示侧边栏菜单', async ({ page }) => {
    // 检查侧边栏是否存在
    const sidebar = page.locator('.layout-sidebar');
    await expect(sidebar).toBeVisible();

    // 检查菜单项
    const menuItems = page.locator('.ant-menu-item');
    await expect(menuItems).toHaveCount(5); // 仪表盘 + 4个主要模块
  });

  test('应该显示正确的菜单项', async ({ page }) => {
    // 检查主要菜单项
    const expectedMenuItems = [
      '仪表盘',
      '商品管理',
      '定价中心',
      '审核管理',
      '库存追溯'
    ];

    for (const menuItemText of expectedMenuItems) {
      const menuItem = page.locator(`.ant-menu-item:has-text("${menuItemText}")`);
      await expect(menuItem).toBeVisible();
    }
  });

  test('可以点击菜单项进行导航', async ({ page }) => {
    // 点击商品管理菜单
    const productMenu = page.locator('.ant-menu-item:has-text("商品管理")');
    await productMenu.click();

    // 验证导航到商品页面
    await expect(page).toHaveURL(/.*\/product/);
  });
});