/**
 * 菜单高亮功能E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('菜单高亮功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('当前页面菜单项应该高亮显示', async ({ page }) => {
    // 在首页时，仪表盘菜单应该高亮
    const dashboardMenu = page.locator('.ant-menu-item:has-text("仪表盘")');
    await expect(dashboardMenu).toHaveClass(/.*ant-menu-item-selected.*/);
  });

  test('点击菜单项后应该高亮显示', async ({ page }) => {
    // 点击商品管理菜单
    const productMenu = page.locator('.ant-menu-item:has-text("商品管理")');
    await productMenu.click();

    // 等待导航完成
    await page.waitForLoadState('networkidle');

    // 商品管理菜单应该高亮
    await expect(productMenu).toHaveClass(/.*ant-menu-item-selected.*/);

    // 仪表盘菜单不应该高亮
    const dashboardMenu = page.locator('.ant-menu-item:has-text("仪表盘")');
    await expect(dashboardMenu).not.toHaveClass(/.*ant-menu-item-selected.*/);
  });

  test('应该显示菜单图标', async ({ page }) => {
    // 检查菜单图标是否显示
    const menuIcons = page.locator('.ant-menu-item .anticon');
    await expect(menuIcons).toHaveCount(5); // 5个主要菜单项都有图标
  });
});