import { type Page, type Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 通用等待方法
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector);
  }

  async clickElement(selector: string) {
    await this.waitForElement(selector);
    await this.page.click(selector);
  }

  async fillInput(selector: string, value: string) {
    await this.waitForElement(selector);
    await this.page.fill(selector, value);
  }

  async selectOption(selector: string, value: string) {
    await this.waitForElement(selector);
    await this.page.selectOption(selector, value);
  }

  async getText(selector: string): Promise<string> {
    await this.waitForElement(selector);
    return (await this.page.textContent(selector)) || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  async waitForToast(message: string) {
    await this.page.waitForSelector(`.ant-message:has-text("${message}")`, { timeout: 5000 });
  }

  // 通用导航方法
  async navigateToProducts() {
    await this.clickElement('[data-testid="nav-products"]');
    await this.waitForPageLoad();
  }

  async navigateToPricing() {
    await this.clickElement('[data-testid="nav-pricing"]');
    await this.waitForPageLoad();
  }

  async navigateToReview() {
    await this.clickElement('[data-testid="nav-review"]');
    await this.waitForPageLoad();
  }

  async navigateToInventory() {
    await this.clickElement('[data-testid="nav-inventory"]');
    await this.waitForPageLoad();
  }

  // 通用表单方法
  async fillForm(formData: Record<string, string | number>) {
    for (const [field, value] of Object.entries(formData)) {
      const selector = `[data-testid="${field}"]`;
      if (typeof value === 'string') {
        await this.fillInput(selector, value);
      } else if (typeof value === 'number') {
        await this.fillInput(selector, value.toString());
      }
    }
  }

  async submitForm() {
    await this.clickElement('[data-testid="submit-button"]');
  }

  async search(searchTerm: string) {
    await this.fillInput('[data-testid="search-input"]', searchTerm);
    await this.page.keyboard.press('Enter');
  }
}
