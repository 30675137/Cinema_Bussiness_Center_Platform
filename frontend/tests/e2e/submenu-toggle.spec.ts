/**
 * 子菜单展开/收起功能E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('子菜单展开/收起', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('应该可以展开子菜单', async ({ page }) => {
    // 点击商品管理菜单（有子菜单）
    const productMenu = page.locator('.ant-menu-submenu-title:has-text("商品管理")');

    // 检查是否是子菜单
    const submenuArrow = page.locator('.ant-menu-submenu-title .ant-menu-submenu-arrow');
    if (await submenuArrow.count() > 0) {
      // 点击展开
      await productMenu.click();

      // 检查子菜单项是否显示
      const submenuItems = page.locator('.ant-menu-item:has-text("商品列表")');
      await expect(submenuItems).toBeVisible();
    }
  });

  test('应该可以折叠侧边栏', async ({ page }) => {
    // 获取侧边栏折叠按钮
    const collapseButton = page.locator('.sidebar-toggle');
    await expect(collapseButton).toBeVisible();

    // 点击折叠
    await collapseButton.click();

    // 检查侧边栏是否折叠（文字应该隐藏）
    const sidebar = page.locator('.layout-sidebar');
    await expect(sidebar).toHaveClass(/.*collapsed.*/);
  });

  test('侧边栏折叠后应该只显示图标', async ({ page }) => {
    // 先折叠侧边栏
    const collapseButton = page.locator('.sidebar-toggle');
    await collapseButton.click();

    // 检查菜单项文字是否隐藏
    const menuTexts = page.locator('.ant-menu-item span');
    await expect(menuTexts.first()).not.toBeVisible();

    // 图标应该仍然可见
    const menuIcons = page.locator('.ant-menu-item .anticon');
    await expect(menuIcons.first()).toBeVisible();
  });
});