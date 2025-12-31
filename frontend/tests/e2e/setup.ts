import { test as base } from '@playwright/test';
import { ProductPage } from '../pages/ProductPage';

// 扩展test对象，添加全局设置
export const test = base.extend<{
  productPage: ProductPage;
}>({
  // 为每个测试创建一个新的productPage实例
  productPage: async ({ page }, use) => {
    const productPage = new ProductPage(page);
    await use(productPage);
  },
});

// 全局测试设置
test.beforeEach(async ({ page }) => {
  // 设置测试环境 - 添加认证token以绕过登录
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'test-token');
  });

  await page.goto('/');

  // 等待应用加载
  await page.waitForLoadState('networkidle');

  // 验证应用正常加载
  await expect(page.locator('body')).toBeVisible();
});

// 全局测试后清理
test.afterEach(async ({ page }) => {
  // 清理可能的弹窗或通知
  const notifications = page.locator('.ant-notification');
  if ((await notifications.count()) > 0) {
    await page.evaluate(() => {
      const notifications = document.querySelectorAll('.ant-notification');
      notifications.forEach((n) => n.remove());
    });
  }

  const messages = page.locator('.ant-message');
  if ((await messages.count()) > 0) {
    await page.evaluate(() => {
      const messages = document.querySelectorAll('.ant-message');
      messages.forEach((m) => m.remove());
    });
  }
});

// 导出测试配置
export { expect };
