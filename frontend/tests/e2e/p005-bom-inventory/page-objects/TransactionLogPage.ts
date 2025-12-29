/**
 * @spec P005-bom-inventory-deduction
 * Transaction Log Page Object - 库存事务日志页面对象
 *
 * 用于查看和验证BOM扣减的库存事务记录
 */

import { Page, Locator, expect } from '@playwright/test';

export class TransactionLogPage {
  readonly page: Page;
  readonly transactionTable: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly typeFilter: Locator;
  readonly dateRangePicker: Locator;
  readonly detailButton: Locator;
  readonly detailDrawer: Locator;
  readonly bomComponentsList: Locator;
  readonly refreshButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.transactionTable = page.locator('.ant-table');
    this.searchInput = page.locator('[placeholder*="订单号"], [placeholder*="SKU"]');
    this.searchButton = page.locator('button:has-text("搜索"), button:has-text("查询")');
    this.typeFilter = page.locator('[data-testid="transaction-type-filter"]');
    this.dateRangePicker = page.locator('.ant-picker-range');
    this.detailButton = page.locator('button:has-text("详情"), a:has-text("查看")');
    this.detailDrawer = page.locator('.ant-drawer:visible');
    this.bomComponentsList = page.locator('[data-testid="bom-components-list"]');
    this.refreshButton = page.locator('button:has-text("刷新")');
  }

  /**
   * 导航到库存事务日志页面
   */
  async goto() {
    await this.page.goto('/inventory/transactions');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  /**
   * 按订单号搜索事务记录
   */
  async searchByOrderId(orderId: string) {
    await this.searchInput.fill(orderId);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 筛选BOM扣减类型的事务
   */
  async filterByBomDeduction() {
    await this.typeFilter.click();
    await this.page.locator('text="BOM扣减", text="BOM_DEDUCTION"').click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 获取事务记录列表
   */
  async getTransactionList(): Promise<Array<{
    skuName: string;
    quantity: number;
    type: string;
    orderId: string;
  }>> {
    const rows = this.page.locator('.ant-table-tbody tr');
    const count = await rows.count();
    const transactions = [];

    for (let i = 0; i < count; i++) {
      const cells = rows.nth(i).locator('td');
      transactions.push({
        skuName: await cells.nth(0).textContent() || '',
        quantity: parseFloat(await cells.nth(1).textContent() || '0'),
        type: await cells.nth(2).textContent() || '',
        orderId: await cells.nth(3).textContent() || ''
      });
    }

    return transactions;
  }

  /**
   * 打开事务详情查看BOM组件
   */
  async openTransactionDetail(index: number = 0) {
    const detailButtons = this.detailButton;
    await detailButtons.nth(index).click();
    await this.detailDrawer.waitFor({ state: 'visible' });
  }

  /**
   * 验证BOM组件列表
   */
  async verifyBomComponents(expectedComponents: Array<{
    skuName: string;
    quantity: number;
    unit: string;
  }>) {
    await this.bomComponentsList.waitFor({ state: 'visible' });

    for (const component of expectedComponents) {
      const componentRow = this.page.locator(
        `.ant-list-item:has-text("${component.skuName}")`
      );
      await expect(componentRow).toBeVisible();
      await expect(componentRow).toContainText(`${component.quantity}`);
      await expect(componentRow).toContainText(component.unit);
    }
  }

  /**
   * 验证事务记录存在
   */
  async verifyTransactionExists(orderId: string, transactionType: string) {
    await this.searchByOrderId(orderId);

    const row = this.page.locator(`.ant-table-tbody tr:has-text("${orderId}")`);
    await expect(row).toBeVisible();

    const typeCell = row.locator('td:has-text("' + transactionType + '")');
    await expect(typeCell).toBeVisible();
  }

  /**
   * 验证事务数量
   */
  async verifyTransactionCount(orderId: string, expectedCount: number) {
    await this.searchByOrderId(orderId);

    const rows = this.page.locator(`.ant-table-tbody tr:has-text("${orderId}")`);
    const count = await rows.count();

    expect(count).toBe(expectedCount);
  }

  /**
   * 刷新事务日志
   */
  async refresh() {
    await this.refreshButton.click();
    await this.page.waitForTimeout(500);
  }
}
