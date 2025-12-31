// @spec P006-fix-sku-edit-data
// Page Object for SKU Management List View

import { Page, Locator } from '@playwright/test';

/**
 * SKUListPage - SKU管理列表页面
 */
export class SKUListPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly skuTable: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Ant Design Table & Search component selectors
    // Using test-id for more reliable selector (actual placeholder: "SKU编码/名称/条码")
    this.searchInput = page.locator('[data-testid="sku-filter-keyword"]');
    this.searchButton = page.locator('button:has-text("搜索"), button:has-text("查询")').first();
    // Use data-testid for more specific selector to avoid strict mode violation
    this.skuTable = page.locator('[data-testid="sku-table"]');
    this.addButton = page.locator('button:has-text("新增"), button:has-text("添加SKU")').first();
  }

  /**
   * 导航到SKU管理列表页面
   * @param baseUrl - 基础URL（默认 http://localhost:3000）
   */
  async goto(baseUrl: string = 'http://localhost:3000'): Promise<void> {
    await this.page.goto(`${baseUrl}/products/sku`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 搜索SKU
   * @param keyword - 搜索关键词（编码或名称）
   */
  async searchSKU(keyword: string): Promise<void> {
    // Wait for the SKU table to be visible first (ensures page loaded)
    await this.skuTable.waitFor({ state: 'visible', timeout: 10000 });

    // Wait a bit for the filters component to render
    await this.page.waitForTimeout(2000);

    // Now wait for search input to be visible
    await this.searchInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.searchInput.fill(keyword);
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 点击指定SKU的编辑按钮
   * @param skuCode - SKU编码
   */
  async clickEditButton(skuCode: string): Promise<void> {
    // 查找包含该SKU编码的行
    const row = this.page.locator(`tr:has-text("${skuCode}")`);

    // 点击该行的编辑按钮
    const editButton = row.locator('button:has-text("编辑"), a:has-text("编辑")').first();
    await editButton.click();

    // 等待页面跳转
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 获取表格中第一行的SKU编码
   */
  async getFirstSKUCode(): Promise<string | null> {
    // Wait for table to load data
    await this.page.waitForLoadState('networkidle');

    // Find first row in table body
    const firstCodeCell = this.skuTable.locator('tbody tr:first-child td:nth-child(1)');

    if (await firstCodeCell.isVisible()) {
      const text = await firstCodeCell.textContent();
      return text?.trim() || null;
    }

    return null;
  }

  /**
   * 检查SKU是否存在于列表中
   * @param skuCode - SKU编码
   */
  async hasSKU(skuCode: string): Promise<boolean> {
    const row = this.page.locator(`tr:has-text("${skuCode}")`);
    return await row.count() > 0;
  }
}
