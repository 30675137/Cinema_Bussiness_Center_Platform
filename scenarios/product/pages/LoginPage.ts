// @spec P006-fix-sku-edit-data
// Page Object for B-end Admin Login

import { Page, Locator } from '@playwright/test';

/**
 * LoginPage - B端管理后台登录页面
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Ant Design Form selectors (based on src/pages/auth/Login/index.tsx)
    // Using more robust selectors that target the actual input fields
    this.usernameInput = page.locator('input[placeholder="请输入用户名"]');
    this.passwordInput = page.locator('input[placeholder="请输入密码"]');
    this.loginButton = page.locator('button[type="submit"]:has-text("登录")');
  }

  /**
   * 执行登录操作
   * @param credentials - 包含 username 和 password 的对象
   */
  async login(credentials: { username: string; password: string }): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();

    // 等待跳转到仪表盘或其他页面
    await this.page.waitForURL(/.*(?!login)/, { timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }
}
