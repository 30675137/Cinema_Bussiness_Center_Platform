// @spec T002-e2e-test-generator
// Auto-generated Page Object template
// TODO: Implement methods according to your application

import { Page, Locator } from '@playwright/test';

/**
 * OrderPage - Handles order management operations
 *
 * This is an auto-generated template. Please implement the methods
 * according to your application's actual UI structure.
 */
export class OrderPage {
  readonly page: Page;
  readonly orderList: Locator;
  readonly orderDetail: Locator;
  readonly createOrderButton: Locator;
  readonly cancelOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // TODO: Update selectors to match your application
    this.orderList = page.locator('.order-list');
    this.orderDetail = page.locator('.order-detail');
    this.createOrderButton = page.locator('.btn-create-order');
    this.cancelOrderButton = page.locator('.btn-cancel-order');
  }

  /**
   * Create a new order
   * @param orderParams - Order parameters containing order details
   * @returns Order ID if successful
   */
  async createOrder(orderParams: any): Promise<string> {
    const currentUrl = this.page.url();

    if (currentUrl.includes('localhost:10086')) {
      // C-end Taro H5 - Create order from order confirm page
      // Ensure we're on the order confirm page
      if (!currentUrl.includes('/pages/order/confirm')) {
        throw new Error('Not on order confirm page. Call CheckoutPage.proceed() first.');
      }

      // Optional: Fill in order note if provided
      if (orderParams.remark || orderParams.customerNote) {
        const noteInput = this.page.locator('input[placeholder*="备注"], textarea[placeholder*="备注"]').first();
        if (await noteInput.isVisible()) {
          await noteInput.fill(orderParams.remark || orderParams.customerNote);
        }
      }

      // Click "提交订单" / "Submit Order" button
      const submitBtn = this.page.locator('button:has-text("提交订单"), .order-confirm__submit-btn').first();
      await submitBtn.waitFor({ state: 'visible', timeout: 5000 });

      // Listen for API response to capture order ID
      const responsePromise = this.page.waitForResponse(
        response => response.url().includes('/api/beverage-orders') && response.status() === 201,
        { timeout: 15000 }
      );

      await submitBtn.click();

      // Wait for order creation API response
      const response = await responsePromise;
      const responseData = await response.json();

      // Extract order ID from response
      const orderId = responseData.data?.id || responseData.id;

      // Wait for success toast
      await this.page.waitForSelector('text="下单成功"', { timeout: 5000 });

      // Wait for navigation to payment page
      await this.page.waitForURL(/.*\/pages\/order\/payment/, { timeout: 10000 });

      return orderId;

    } else {
      // B-end or generic flow
      await this.createOrderButton.click();
      const response = await this.page.waitForResponse(
        resp => resp.url().includes('/api/orders') && (resp.status() === 200 || resp.status() === 201),
        { timeout: 10000 }
      );

      const responseData = await response.json();
      const orderId = responseData.data?.id || responseData.id || 'unknown';

      await this.page.waitForSelector('.toast:has-text("订单创建成功"), .ant-message-success', { timeout: 5000 });

      return orderId;
    }
  }

  /**
   * Cancel an existing order
   * @param orderId - Order identifier
   */
  async cancelOrder(orderId: string): Promise<void> {
    // TODO: Implement order cancellation logic
    throw new Error('OrderPage.cancelOrder() method not implemented');
  }

  /**
   * View order details
   * @param orderId - Order identifier
   */
  async viewOrderDetail(orderId: string): Promise<void> {
    // TODO: Implement order detail viewing logic
    throw new Error('OrderPage.viewOrderDetail() method not implemented');
  }
}
