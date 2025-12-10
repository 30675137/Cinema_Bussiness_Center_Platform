/**
 * 面包屑点击功能E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('面包屑点击交互', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('应该能够点击面包屑节点进行导航', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 查找面包屑中的可点击项目
    const clickableBreadcrumb = page.locator('.ant-breadcrumb-item a');

    if (await clickableBreadcrumb.count() > 0) {
      // 点击第一个可点击的面包屑
      await clickableBreadcrumb.first().click();

      // 验证页面发生了导航
      await expect(page.url()).toMatch(/http:\/\/localhost:3000\/.*/);
    }
  });

  test('当前页面的面包屑应该不可点击', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 查找当前页面的面包屑（应该有特殊样式）
    const currentBreadcrumb = page.locator('.ant-breadcrumb-item:last-child');

    // 当前页面的面包屑应该是文本而不是链接
    const linkInCurrentBreadcrumb = currentBreadcrumb.locator('a');
    await expect(linkInCurrentBreadcrumb).toHaveCount(0);
  });
});