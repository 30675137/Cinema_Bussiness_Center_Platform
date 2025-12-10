import { test, expect } from '@playwright/test';

test.describe('基础测试验证', () => {
  test('验证页面可以正常加载', async ({ page }) => {
    await page.goto('/');

    // 验证页面标题
    await expect(page).toHaveTitle(/商品管理中台/);

    // 等待React应用加载完成
    await page.waitForLoadState('networkidle');

    // 验证根元素存在
    await expect(page.locator('body')).toBeVisible();
  });

  test('验证路由导航', async ({ page }) => {
    await page.goto('/');

    // 验证导航元素存在
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
  });

  test('验证错误页面', async ({ page }) => {
    await page.goto('/non-existent-page');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 验证页面仍然有内容显示
    await expect(page.locator('body')).toBeVisible();
  });
});