/**
 * @spec P005-bom-inventory-deduction
 * Inventory Page Object - 库存查询页面对象
 *
 * 用于操作库存查询和查看库存详情
 */

import { Page, Locator, expect } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly inventoryTable: Locator;
  readonly reservedQtyColumn: Locator;
  readonly availableQtyColumn: Locator;
  readonly onHandQtyColumn: Locator;
  readonly refreshButton: Locator;
  readonly filterButton: Locator;
  readonly detailDrawer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('[placeholder*="搜索SKU"], [placeholder*="商品名称"]');
    this.searchButton = page.locator('button:has-text("搜索"), button:has-text("查询")');
    this.inventoryTable = page.locator('.ant-table');
    this.reservedQtyColumn = page.locator(
      'td[data-testid="reserved-qty"], th:has-text("预占库存")'
    );
    this.availableQtyColumn = page.locator(
      'td[data-testid="available-qty"], th:has-text("可用库存")'
    );
    this.onHandQtyColumn = page.locator('td[data-testid="on-hand-qty"], th:has-text("现存库存")');
    this.refreshButton = page.locator('button:has-text("刷新"), button[aria-label="reload"]');
    this.filterButton = page.locator('button:has-text("筛选")');
    this.detailDrawer = page.locator('.ant-drawer:visible');
  }

  /**
   * 导航到库存查询页面
   */
  async goto() {
    await this.page.goto('/inventory/query');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500); // 等待数据加载
  }

  /**
   * 搜索指定SKU
   */
  async searchSku(skuName: string) {
    await this.searchInput.fill(skuName);
    await this.searchButton.click();
    await this.page.waitForTimeout(500); // 等待搜索结果
  }

  /**
   * 获取指定SKU的库存信息
   * @returns {onHandQty, reservedQty, availableQty}
   */
  async getInventoryQuantities(skuName: string): Promise<{
    onHandQty: number;
    reservedQty: number;
    availableQty: number;
  }> {
    await this.searchSku(skuName);

    // 等待表格加载
    await this.inventoryTable.waitFor({ state: 'visible' });

    // 获取第一行数据
    const firstRow = this.page.locator('.ant-table-tbody tr').first();

    // 提取数量（假设列顺序：SKU名称、现存、预占、可用）
    const cells = firstRow.locator('td');
    const onHandText = (await cells.nth(1).textContent()) || '0';
    const reservedText = (await cells.nth(2).textContent()) || '0';
    const availableText = (await cells.nth(3).textContent()) || '0';

    return {
      onHandQty: parseFloat(onHandText.replace(/[^\d.]/g, '')),
      reservedQty: parseFloat(reservedText.replace(/[^\d.]/g, '')),
      availableQty: parseFloat(availableText.replace(/[^\d.]/g, '')),
    };
  }

  /**
   * 点击SKU行打开详情抽屉
   */
  async openDetailDrawer(skuName: string) {
    await this.searchSku(skuName);
    const firstRow = this.page.locator('.ant-table-tbody tr').first();
    await firstRow.click();
    await this.detailDrawer.waitFor({ state: 'visible' });
  }

  /**
   * 验证库存数量变化
   */
  async verifyInventoryChange(
    skuName: string,
    expectedChanges: {
      onHandQty?: number;
      reservedQty?: number;
      availableQty?: number;
    }
  ) {
    const quantities = await this.getInventoryQuantities(skuName);

    if (expectedChanges.onHandQty !== undefined) {
      expect(quantities.onHandQty).toBe(expectedChanges.onHandQty);
    }
    if (expectedChanges.reservedQty !== undefined) {
      expect(quantities.reservedQty).toBe(expectedChanges.reservedQty);
    }
    if (expectedChanges.availableQty !== undefined) {
      expect(quantities.availableQty).toBe(expectedChanges.availableQty);
    }
  }

  /**
   * 刷新库存数据
   */
  async refresh() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(500);
  }
}
