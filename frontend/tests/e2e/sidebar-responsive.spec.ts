/**
 * 侧边栏响应式行为E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('侧边栏响应式行为', () => {
  test('应该支持手动折叠/展开', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.layout-sidebar');
    const collapseButton = page.locator('.sidebar-toggle');

    // 初始状态应该是展开的
    await expect(sidebar).not.toHaveClass(/.*collapsed.*/);

    // 点击折叠
    await collapseButton.click();
    await expect(sidebar).toHaveClass(/.*collapsed.*/);

    // 再次点击展开
    await collapseButton.click();
    await expect(sidebar).not.toHaveClass(/.*collapsed.*/);
  });

  test('移动端应该自动隐藏菜单文字', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.layout-sidebar');

    // 移动端应该自动折叠
    await expect(sidebar).toHaveClass(/.*collapsed.*/);

    // 菜单文字应该隐藏
    const menuTexts = page.locator('.sidebar-menu .ant-menu-item span:not(.anticon)');
    await expect(menuTexts.first()).not.toBeVisible();

    // 图标应该仍然可见
    const menuIcons = page.locator('.sidebar-menu .anticon');
    await expect(menuIcons.first()).toBeVisible();
  });

  test('平板设备上侧边栏应该可折叠', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.layout-sidebar');

    // 平板设备上应该可折叠
    await expect(sidebar).toBeVisible();

    // 检查折叠按钮是否存在
    const collapseButton = page.locator('.sidebar-toggle');
    await expect(collapseButton).toBeVisible();
  });

  test('小屏幕设备上内容区域应该调整布局', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    const layoutContent = page.locator('.layout-content');

    // 小屏幕设备上内容区域应该占满宽度
    const contentBox = await layoutContent.boundingBox();
    expect(contentBox?.width).toBe(480);
  });
});