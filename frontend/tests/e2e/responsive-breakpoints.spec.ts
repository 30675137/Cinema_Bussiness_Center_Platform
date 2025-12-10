/**
 * 响应式断点E2E测试
 */

import { test, expect } from '@playwright/test';

const breakpoints = [
  { name: 'mobile', width: 375 },
  { name: 'tablet', width: 768 },
  { name: 'desktop', width: 1024 },
  { name: 'large', width: 1280 },
];

test.describe('响应式断点测试', () => {
  breakpoints.forEach(({ name, width }) => {
    test(`应该在${name} (${width}px)设备上正确显示`, async ({ page }) => {
      // 设置视口大小
      await page.setViewportSize({ width, height: 800 });
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');

      // 检查基本布局元素是否可见
      const layoutContainer = page.locator('.layout-container');
      await expect(layoutContainer).toBeVisible();

      // 检查侧边栏是否存在
      const sidebar = page.locator('.layout-sidebar');
      await expect(sidebar).toBeVisible();
    });
  });

  test('移动设备上侧边栏应该自动折叠', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 移动设备上侧边栏应该折叠
    const sidebar = page.locator('.layout-sidebar');
    await expect(sidebar).toHaveClass(/.*collapsed.*/);
  });

  test('桌面设备上侧边栏应该展开', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // 桌面设备上侧边栏应该展开
    const sidebar = page.locator('.layout-sidebar');
    await expect(sidebar).not.toHaveClass(/.*collapsed.*/);
  });
});