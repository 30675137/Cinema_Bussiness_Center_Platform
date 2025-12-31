import { type Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly page: Page;

  // 页面元素定位器
  readonly productTable: Locator;
  readonly createProductButton: Locator;
  readonly searchInput: Locator;
  readonly categoryFilter: Locator;
  readonly statusFilter: Locator;
  readonly materialTypeFilter: Locator;
  readonly productTabs: Locator;
  readonly basicInfoTab: Locator;
  readonly contentTab: Locator;
  readonly specsTab: Locator;
  readonly bomTab: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;

    // 初始化定位器
    this.productTable = page.locator('[data-testid="product-table"]');
    this.createProductButton = page.locator('[data-testid="create-product-button"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.categoryFilter = page.locator('[data-testid="category-filter"]');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    this.materialTypeFilter = page.locator('[data-testid="material-type-filter"]');
    this.productTabs = page.locator('[data-testid="product-tabs"]');
    this.basicInfoTab = page.locator('[data-testid="basic-info-tab"]');
    this.contentTab = page.locator('[data-testid="content-tab"]');
    this.specsTab = page.locator('[data-testid="specs-tab"]');
    this.bomTab = page.locator('[data-testid="bom-tab"]');
    this.saveButton = page.locator('[data-testid="save-button"]');
    this.cancelButton = page.locator('[data-testid="cancel-button"]');
  }

  // 导航到商品管理页面
  async goto() {
    await this.page.goto('/products');
    await this.waitForPageLoad();
  }

  // 验证页面加载完成
  async verifyPageLoaded() {
    await expect(this.productTable).toBeVisible();
    await expect(this.createProductButton).toBeVisible();
    await expect(this.searchInput).toBeVisible();
  }

  // 搜索商品
  async searchProduct(searchTerm: string) {
    await this.searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(1000); // 等待搜索结果
  }

  // 筛选商品
  async filterProducts(category?: string, status?: string, materialType?: string) {
    if (category) {
      await this.categoryFilter.click();
      await this.page.click(`[data-value="${category}"]`);
    }
    if (status) {
      await this.statusFilter.click();
      await this.page.click(`[data-value="${status}"]`);
    }
    if (materialType) {
      await this.materialTypeFilter.click();
      await this.page.click(`[data-value="${materialType}"]`);
    }
    await this.page.waitForTimeout(1000);
  }

  // 点击创建商品按钮
  async clickCreateProduct() {
    await this.createProductButton.click();
    await this.waitForPageLoad();
  }

  // 填写商品基本信息
  async fillBasicInfo(data: {
    name: string;
    sku: string;
    category: string;
    materialType: string;
    description?: string;
    price?: number;
    cost?: number;
  }) {
    await this.basicInfoTab.click();

    if (data.name) {
      await this.page.fill('[data-testid="product-name"]', data.name);
    }
    if (data.sku) {
      await this.page.fill('[data-testid="product-sku"]', data.sku);
    }
    if (data.category) {
      await this.page.click('[data-testid="product-category"]');
      await this.page.click(`[data-value="${data.category}"]`);
    }
    if (data.materialType) {
      await this.page.click('[data-testid="material-type"]');
      await this.page.click(`[data-value="${data.materialType}"]`);
    }
    if (data.description) {
      await this.page.fill('[data-testid="product-description"]', data.description);
    }
    if (data.price) {
      await this.page.fill('[data-testid="product-price"]', data.price.toString());
    }
    if (data.cost) {
      await this.page.fill('[data-testid="product-cost"]', data.cost.toString());
    }
  }

  // 填写内容管理信息
  async fillContentTab(data: {
    title?: string;
    shortTitle?: string;
    description?: string;
    shortDescription?: string;
  }) {
    await this.contentTab.click();

    if (data.title) {
      await this.page.fill('[data-testid="content-title"]', data.title);
    }
    if (data.shortTitle) {
      await this.page.fill('[data-testid="content-short-title"]', data.shortTitle);
    }
    if (data.description) {
      await this.page.fill('[data-testid="content-description"]', data.description);
    }
    if (data.shortDescription) {
      await this.page.fill('[data-testid="content-short-description"]', data.shortDescription);
    }
  }

  // 保存商品
  async saveProduct() {
    await this.saveButton.click();
    await this.waitForToast('保存成功');
  }

  // 取消编辑
  async cancelEdit() {
    await this.cancelButton.click();
  }

  // 验证商品在表格中存在
  async verifyProductExists(sku: string, name?: string) {
    const row = this.page.locator(`[data-testid="product-row"]:has-text("${sku}")`);
    await expect(row).toBeVisible();
    if (name) {
      await expect(row.locator(`:has-text("${name}")`)).toBeVisible();
    }
  }

  // 批量选择商品
  async selectProducts(skus: string[]) {
    for (const sku of skus) {
      const checkbox = this.page.locator(
        `[data-testid="product-row"]:has-text("${sku}") [data-testid="select-checkbox"]`
      );
      await checkbox.check();
    }
  }

  // 获取表格中的商品数量
  async getTableRowCount(): Promise<number> {
    const rows = await this.page.locator('[data-testid="product-row"]').count();
    return rows;
  }
}
