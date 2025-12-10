/**
 * 面包屑导航E2E测试
 */

import { test, expect } from '@playwright/test';

test.describe('面包屑导航功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('应该显示基础面包屑导航', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 检查面包屑容器是否存在
    const breadcrumb = page.locator('.breadcrumb-container');
    await expect(breadcrumb).toBeVisible();

    // 检查面包屑项目
    const breadcrumbItems = page.locator('.ant-breadcrumb-item');
    await expect(breadcrumbItems.first()).toBeVisible();
  });

  test('应该显示正确的面包屑路径', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 检查首页面包屑
    const breadcrumbText = await page.locator('.breadcrumb-container').textContent();
    expect(breadcrumbText).toContain('首页');
  });

  test('面包屑应该可以点击导航', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 点击面包屑中的首页
    const homeBreadcrumb = page.locator('.ant-breadcrumb-item:has-text("首页")');
    await homeBreadcrumb.click();

    // 验证导航到首页
    await expect(page).toHaveURL(/\/$/);
  });
});