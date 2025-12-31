/**
 * @spec P005-bom-inventory-deduction
 * Order Page Object - 订单管理页面对象
 *
 * 用于操作订单创建、查询、履约和取消
 */

import { Page, Locator, expect } from '@playwright/test';

export class OrderPage {
  readonly page: Page;
  readonly createOrderButton: Locator;
  readonly productSelect: Locator;
  readonly quantityInput: Locator;
  readonly submitOrderButton: Locator;
  readonly orderTable: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly statusFilter: Locator;
  readonly fulfillButton: Locator;
  readonly cancelButton: Locator;
  readonly orderDetailDrawer: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createOrderButton = page.locator(
      'button:has-text("创建订单"), button:has-text("新建订单")'
    );
    this.productSelect = page.locator('[data-testid="product-select"], [placeholder*="选择商品"]');
    this.quantityInput = page.locator('input[type="number"], [data-testid="quantity-input"]');
    this.submitOrderButton = page.locator(
      'button:has-text("提交订单"), button:has-text("确认下单")'
    );
    this.orderTable = page.locator('.ant-table');
    this.searchInput = page.locator('[placeholder*="订单号"], [placeholder*="搜索"]');
    this.searchButton = page.locator('button:has-text("搜索"), button:has-text("查询")');
    this.statusFilter = page.locator('[data-testid="status-filter"]');
    this.fulfillButton = page.locator('button:has-text("出品确认"), button:has-text("履约")');
    this.cancelButton = page.locator('button:has-text("取消订单"), button:has-text("作废")');
    this.orderDetailDrawer = page.locator('.ant-drawer:visible');
    this.successMessage = page.locator('.ant-message-success');
    this.errorMessage = page.locator('.ant-message-error, .ant-message-warning');
  }

  /**
   * 导航到订单管理页面
   */
  async goto() {
    await this.page.goto('/orders');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500);
  }

  /**
   * 创建订单（通过UI）
   * 注意：实际项目中可能是在C端小程序下单，这里模拟B端创建订单
   */
  async createOrder(productName: string, quantity: number = 1) {
    await this.createOrderButton.click();
    await this.page.waitForTimeout(500);

    // 选择商品
    await this.productSelect.click();
    await this.page.locator(`text="${productName}"`).click();

    // 输入数量
    await this.quantityInput.fill(quantity.toString());

    // 提交订单
    await this.submitOrderButton.click();

    // 等待提交结果
    await this.page.waitForTimeout(1000);
  }

  /**
   * 通过API创建订单（更可靠）
   */
  async createOrderViaAPI(
    orderId: string,
    storeId: string,
    items: Array<{
      skuId: string;
      quantity: number;
      unit: string;
    }>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.page.request.post(
      'http://localhost:8080/api/inventory/reservations',
      {
        data: {
          orderId,
          storeId,
          items,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return await response.json();
  }

  /**
   * 搜索订单
   */
  async searchOrder(orderNumber: string) {
    await this.searchInput.fill(orderNumber);
    await this.searchButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * 打开订单详情
   */
  async openOrderDetail(orderNumber: string) {
    await this.searchOrder(orderNumber);
    const firstRow = this.page.locator('.ant-table-tbody tr').first();
    await firstRow.click();
    await this.orderDetailDrawer.waitFor({ state: 'visible' });
  }

  /**
   * 履约订单（出品确认）
   */
  async fulfillOrder(orderNumber: string) {
    await this.openOrderDetail(orderNumber);
    await this.fulfillButton.click();

    // 确认对话框
    const confirmButton = this.page.locator('.ant-modal button:has-text("确认")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * 通过API履约订单
   */
  async fulfillOrderViaAPI(
    orderId: string,
    storeId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.page.request.post(
      'http://localhost:8080/api/inventory/deductions',
      {
        data: {
          orderId,
          storeId,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return await response.json();
  }

  /**
   * 取消订单
   */
  async cancelOrder(orderNumber: string) {
    await this.openOrderDetail(orderNumber);
    await this.cancelButton.click();

    // 确认对话框
    const confirmButton = this.page.locator('.ant-modal button:has-text("确认")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * 通过API取消订单
   */
  async cancelOrderViaAPI(
    orderId: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await this.page.request.delete(
      `http://localhost:8080/api/inventory/reservations/${orderId}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return await response.json();
  }

  /**
   * 验证成功消息
   */
  async verifySuccessMessage(expectedText: string) {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(expectedText);
  }

  /**
   * 验证错误消息
   */
  async verifyErrorMessage(expectedText: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  /**
   * 获取订单状态
   */
  async getOrderStatus(orderNumber: string): Promise<string> {
    await this.searchOrder(orderNumber);
    const firstRow = this.page.locator('.ant-table-tbody tr').first();
    const statusBadge = firstRow.locator('.ant-badge, .ant-tag');
    return (await statusBadge.textContent()) || '';
  }
}
