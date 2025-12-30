// @spec T002-e2e-test-generator
// Auto-generated Page Object template
// TODO: Implement methods according to your application

import { Page, Locator } from '@playwright/test';

/**
 * LoginPage - Handles user authentication flows
 *
 * This is an auto-generated template. Please implement the methods
 * according to your application's actual UI structure.
 */
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Selectors based on Ant Design Form structure in src/pages/auth/Login/index.tsx
    this.usernameInput = page.locator('input[id="login_username"]');
    this.passwordInput = page.locator('input[id="login_password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.logoutButton = page.locator('.logout-btn');
  }

  /**
   * Perform login action
   * @param testData - Test data object containing login credentials
   * Expected format: { username: string, password: string } or { phone: string, verifyCode: string }
   */
  async login(testData: any): Promise<void> {
    // Check if this is B-end (React Admin) or C-end (Taro) login
    const currentUrl = this.page.url();

    if (currentUrl.includes('localhost:3000') || currentUrl.includes('admin')) {
      // B-end login flow (React Admin with Ant Design Form)
      await this.usernameInput.fill(testData.username || testData.email || 'admin');
      await this.passwordInput.fill(testData.password || 'password');
      await this.loginButton.click();

      // Wait for navigation to dashboard or successful login
      await this.page.waitForURL(/.*dashboard|.*\/(?!login)/, { timeout: 10000 });

      // Wait for the page to be fully loaded
      await this.page.waitForLoadState('networkidle');

    } else if (currentUrl.includes('localhost:10086')) {
      // C-end login flow (Taro H5) - typically uses phone + verify code
      // Note: Taro login may have different UI structure
      const phoneInput = this.page.locator('input[type="tel"], input[placeholder*="手机"], input[placeholder*="phone"]').first();
      const codeInput = this.page.locator('input[placeholder*="验证码"], input[placeholder*="code"]').first();
      const submitBtn = this.page.locator('button[type="submit"], button:has-text("登录"), button:has-text("确定")').first();

      if (await phoneInput.isVisible()) {
        await phoneInput.fill(testData.phone || testData.username || '13800138000');
      }

      if (await codeInput.isVisible()) {
        await codeInput.fill(testData.verifyCode || testData.code || '123456');
      }

      await submitBtn.click();

      // Wait for Taro navigation
      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState('networkidle');

    } else {
      // Fallback: generic login
      await this.usernameInput.fill(testData.username || testData.email || testData.phone);
      await this.passwordInput.fill(testData.password || testData.verifyCode || '123456');
      await this.loginButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Perform logout action
   */
  async logout(): Promise<void> {
    // TODO: Implement logout logic
    throw new Error('LoginPage.logout() method not implemented');
  }
}
