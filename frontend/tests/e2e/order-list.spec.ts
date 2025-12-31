/**
 * @spec O001-product-order-list
 * E2E Test: 订单列表页面 - User Story 1
 *
 * 测试目标:
 * - 访问 /orders/list 页面
 * - 验证表格渲染和数据展示
 * - 验证分页功能
 * - 验证订单按创建时间倒序排列
 */

import { test, expect } from '@playwright/test';

test.describe('订单列表页 - User Story 1', () => {
  test.beforeEach(async ({ page }) => {
    // 访问订单列表页
    await page.goto('/orders/list');
  });

  test('应该成功渲染订单列表页面', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('h1, h2, .ant-page-header-heading-title')).toContainText('订单列表');

    // 验证表格存在
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('应该显示订单列表表格的所有列', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('.ant-table-thead');

    // 验证表头列存在
    const expectedColumns = ['订单号', '用户', '商品', '订单金额', '状态', '创建时间'];

    for (const columnName of expectedColumns) {
      await expect(page.locator('.ant-table-thead th')).toContainText(columnName);
    }
  });

  test('应该显示订单数据并包含所有必需字段', async ({ page }) => {
    // 等待表格数据加载
    await page.waitForSelector('.ant-table-tbody tr');

    // 获取第一行数据
    const firstRow = page.locator('.ant-table-tbody tr').first();
    await expect(firstRow).toBeVisible();

    // 验证第一行包含订单号（以 ORD 开头）
    await expect(firstRow.locator('td').nth(0)).toContainText(/ORD\d{8}/);

    // 验证用户信息列存在
    await expect(firstRow.locator('td').nth(1)).not.toBeEmpty();

    // 验证商品信息列存在
    await expect(firstRow.locator('td').nth(2)).not.toBeEmpty();

    // 验证金额列存在（应该是数字格式）
    await expect(firstRow.locator('td').nth(3)).toContainText(/¥/);

    // 验证状态列存在（应该是 Tag 组件）
    await expect(firstRow.locator('td').nth(4).locator('.ant-tag')).toBeVisible();

    // 验证创建时间列存在
    await expect(firstRow.locator('td').nth(5)).not.toBeEmpty();
  });

  test('应该显示订单状态标签并使用正确的颜色', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('.ant-table-tbody tr');

    // 查找状态列（第5列）中的 Tag 组件
    const statusTags = page.locator('.ant-table-tbody tr td:nth-child(5) .ant-tag');
    await expect(statusTags.first()).toBeVisible();

    // 验证状态文本是中文
    const statusText = await statusTags.first().textContent();
    const validStatuses = ['待支付', '已支付', '已发货', '已完成', '已取消'];
    expect(validStatuses.some((status) => statusText?.includes(status))).toBeTruthy();
  });

  test('应该按创建时间倒序排列订单', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('.ant-table-tbody tr');

    // 获取所有订单的创建时间
    const timeElements = page.locator('.ant-table-tbody tr td:nth-child(6)');
    const count = await timeElements.count();

    if (count >= 2) {
      // 获取前两个时间文本
      const firstTime = await timeElements.nth(0).textContent();
      const secondTime = await timeElements.nth(1).textContent();

      // 转换为 Date 对象比较（假设时间格式为 YYYY-MM-DD HH:mm:ss）
      const firstDate = new Date(firstTime || '');
      const secondDate = new Date(secondTime || '');

      // 验证第一个时间 >= 第二个时间（倒序）
      expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
    }
  });

  test('应该显示分页控件', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('.ant-table');

    // 验证分页器存在
    await expect(page.locator('.ant-pagination')).toBeVisible();

    // 验证分页器包含必要元素
    await expect(page.locator('.ant-pagination-total-text')).toBeVisible(); // 总数显示
    await expect(page.locator('.ant-pagination-item')).toHaveCount.greaterThan(0); // 页码按钮
  });

  test('应该支持分页切换功能', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('.ant-table-tbody tr');

    // 获取第一页第一条订单号
    const firstPageFirstOrderNumber = await page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td')
      .nth(0)
      .textContent();

    // 检查是否有第2页
    const page2Button = page.locator('.ant-pagination-item[title="2"]');

    if (await page2Button.isVisible()) {
      // 点击第2页
      await page2Button.click();

      // 等待表格重新加载
      await page.waitForTimeout(500);

      // 获取第二页第一条订单号
      const secondPageFirstOrderNumber = await page
        .locator('.ant-table-tbody tr')
        .first()
        .locator('td')
        .nth(0)
        .textContent();

      // 验证第二页的订单号与第一页不同
      expect(secondPageFirstOrderNumber).not.toBe(firstPageFirstOrderNumber);
    }
  });

  test('应该显示每页20条记录', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('.ant-table-tbody tr');

    // 获取表格行数
    const rowCount = await page.locator('.ant-table-tbody tr').count();

    // 验证行数 <= 20（如果总数少于20，则显示实际数量）
    expect(rowCount).toBeLessThanOrEqual(20);
    expect(rowCount).toBeGreaterThan(0);
  });

  test('应该支持点击订单号跳转到详情页', async ({ page }) => {
    // 等待表格加载
    await page.waitForSelector('.ant-table-tbody tr');

    // 获取第一行订单号
    const firstOrderLink = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td')
      .nth(0)
      .locator('a');

    if (await firstOrderLink.isVisible()) {
      const orderNumber = await firstOrderLink.textContent();

      // 点击订单号
      await firstOrderLink.click();

      // 验证 URL 变化为 /orders/:id
      await expect(page).toHaveURL(/\/orders\/[a-zA-Z0-9-]+/);

      // 验证详情页包含相同的订单号
      await expect(page.locator('body')).toContainText(orderNumber || '');
    }
  });

  test('应该在加载时显示 Loading 状态', async ({ page }) => {
    // 拦截 API 请求，延迟响应以观察加载状态
    await page.route('**/api/orders*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    // 重新加载页面
    await page.goto('/orders/list');

    // 验证加载中状态（Ant Design Table 的 Spin 组件）
    await expect(page.locator('.ant-spin')).toBeVisible();

    // 等待加载完成
    await page.waitForSelector('.ant-table-tbody tr', { timeout: 3000 });
  });

  test('应该在无数据时显示空状态', async ({ page }) => {
    // 拦截 API 请求，返回空数据
    await page.route('**/api/orders*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          total: 0,
          page: 1,
          pageSize: 20,
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 重新加载页面
    await page.goto('/orders/list');

    // 验证空状态显示
    await expect(page.locator('.ant-empty')).toBeVisible();
    await expect(page.locator('.ant-empty-description')).toContainText(/暂无|没有/);
  });

  test('应该在API错误时显示错误提示', async ({ page }) => {
    // 拦截 API 请求，返回错误
    await page.route('**/api/orders*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'INTERNAL_ERROR',
          message: '服务器内部错误',
          timestamp: new Date().toISOString(),
        }),
      });
    });

    // 重新加载页面
    await page.goto('/orders/list');

    // 验证错误提示（Ant Design message 或 alert）
    await expect(page.locator('.ant-message-error, .ant-alert-error')).toBeVisible();
  });
});
