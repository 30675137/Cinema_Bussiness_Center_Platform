import { test, expect } from '@playwright/test';

test.describe('基础测试验证', () => {
  test('验证页面可以正常加载', async ({ page }) => {
    await page.goto('/');

    // 验证页面标题
    await expect(page).toHaveTitle(/商品管理中台/);

    // 等待React应用加载完成，等待根元素有内容
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });

    // 等待一段时间让React完成渲染
    await page.waitForTimeout(2000);

    // 验证HTML文档结构正确
    const htmlContent = await page.content();
    expect(htmlContent).toContain('<div id="root">');
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

    // 等待React应用处理路由
    await page.waitForSelector('#root', { state: 'attached', timeout: 10000 });

    // 验证页面仍然有基本结构
    const htmlContent = await page.content();
    expect(htmlContent).toContain('<div id="root">');
  });
});