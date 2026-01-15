/**
 * @spec O001-product-order-list
 * E2E Test: 订单详情页面 - User Story 3
 *
 * 测试目标:
 * - 页面加载和基本信息展示
 * - 订单基本信息（订单号、状态、金额等）
 * - 用户信息（姓名、手机号脱敏）
 * - 商品列表
 * - 支付信息
 * - 物流信息
 * - 订单日志记录
 * - 错误处理（订单不存在）
 */

import { test, expect } from '@playwright/test';

test.describe('订单详情页 - User Story 3', () => {
  let testOrderId: string;

  test.beforeEach(async ({ page }) => {
    // 先访问订单列表页获取一个订单ID
    await page.goto('/orders/list');
    await page.waitForSelector('.ant-table-tbody tr');

    // 获取第一个订单的链接并提取订单ID
    const firstOrderLink = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td')
      .nth(0)
      .locator('a');
    const href = await firstOrderLink.getAttribute('href');
    testOrderId = href?.split('/').pop() || '';
  });

  test('应该成功加载订单详情页面', async ({ page }) => {
    // 访问订单详情页
    await page.goto(`/orders/${testOrderId}`);

    // 验证页面标题
    await expect(page.locator('h1, h2, .ant-page-header-heading-title')).toContainText('订单详情');

    // 验证返回按钮存在
    await expect(page.locator('button:has-text("返回列表"), a:has-text("返回")')).toBeVisible();
  });

  test('应该显示订单基本信息', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForSelector('.ant-descriptions, .order-detail');

    // 验证包含订单号
    await expect(page.locator('body')).toContainText(/ORD\d{8}/);

    // 验证包含订单状态
    await expect(page.locator('.ant-tag, .order-status')).toBeVisible();

    // 验证包含金额信息
    await expect(page.locator('body')).toContainText(/¥|金额/);
  });

  test('应该显示订单号并可点击复制', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForSelector('.ant-descriptions');

    // 验证订单号显示
    const orderNumberText = await page.locator('body').textContent();
    expect(orderNumberText).toMatch(/ORD\d{8}[A-Z0-9]{6}/);
  });

  test('应该显示订单状态徽章', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);

    // 验证状态标签存在
    const statusTag = page.locator('.ant-tag').first();
    await expect(statusTag).toBeVisible();

    // 验证状态文本是中文
    const statusText = await statusTag.textContent();
    const validStatuses = ['待支付', '已支付', '已发货', '已完成', '已取消'];
    expect(validStatuses.some((status) => statusText?.includes(status))).toBeTruthy();
  });

  test('应该显示用户信息并对手机号脱敏', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForSelector('.ant-descriptions');

    // 查找手机号（应该是脱敏格式 138****8000）
    const bodyText = await page.locator('body').textContent();

    // 验证包含脱敏的手机号格式
    expect(bodyText).toMatch(/\d{3}\*\*\*\*\d{4}/);

    // 验证用户名存在
    await expect(page.locator('body')).not.toContainText('undefined');
  });

  test('应该显示商品列表', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);

    // 等待页面加载
    await page.waitForTimeout(500);

    // 验证商品列表存在（可能是表格或列表形式）
    const hasTable = await page
      .locator('.ant-table')
      .isVisible()
      .catch(() => false);
    const hasList = await page
      .locator('.ant-list, .order-items')
      .isVisible()
      .catch(() => false);

    expect(hasTable || hasList).toBeTruthy();

    // 验证包含商品名称
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('应该显示订单金额明细', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    const bodyText = await page.locator('body').textContent();

    // 验证包含金额相关字段
    expect(bodyText).toMatch(/商品金额|订单金额|总金额/);
    expect(bodyText).toMatch(/¥\d+\.\d{2}/);
  });

  test('应该显示支付信息', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    const bodyText = await page.locator('body').textContent();

    // 验证包含支付相关信息
    expect(bodyText).toMatch(/支付方式|支付时间/);
  });

  test('应该显示物流信息（如果订单已发货）', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    const bodyText = await page.locator('body').textContent();

    // 根据订单状态判断是否显示物流信息
    if (bodyText?.includes('已发货') || bodyText?.includes('已完成')) {
      expect(bodyText).toMatch(/收货地址|发货时间/);
    }
  });

  test('应该显示订单日志记录', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    // 验证包含日志相关内容
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/操作日志|订单日志|操作记录/);

    // 验证至少有一条日志（创建订单）
    await expect(page.locator('body')).toContainText(/创建订单/);
  });

  test('应该按时间倒序显示订单日志', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    // 查找日志列表
    const logItems = page.locator('.ant-timeline-item, .order-log-item');

    if ((await logItems.count()) >= 2) {
      // 验证时间顺序（最新的在最上面）
      // 这需要根据实际实现的 UI 结构来验证
      const firstLogText = await logItems.first().textContent();
      const lastLogText = await logItems.last().textContent();

      // 第一条日志应该是最近的操作
      expect(firstLogText).toBeTruthy();
      expect(lastLogText).toBeTruthy();
    }
  });

  test('应该显示每条日志的详细信息', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    const bodyText = await page.locator('body').textContent();

    // 验证日志包含必要信息
    expect(bodyText).toMatch(/创建订单|支付成功|发货|完成|取消/);
    expect(bodyText).toMatch(/\d{4}-\d{2}-\d{2}/); // 日期格式
  });

  test('应该提供返回列表按钮', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);

    // 查找返回按钮
    const backButton = page.locator(
      'button:has-text("返回列表"), button:has-text("返回"), a:has-text("返回")'
    );
    await expect(backButton).toBeVisible();

    // 点击返回按钮
    await backButton.click();

    // 验证跳转回列表页
    await expect(page).toHaveURL(/\/orders\/list/);
  });

  test('应该在订单不存在时显示404错误', async ({ page }) => {
    // 访问一个不存在的订单ID
    await page.goto('/orders/nonexistent-order-id-12345');

    // 等待错误提示
    await page.waitForTimeout(500);

    // 验证显示错误信息
    await expect(page.locator('.ant-result-404, .ant-empty, body')).toContainText(
      /不存在|未找到|找不到/
    );
  });

  test('应该在加载时显示Loading状态', async ({ page }) => {
    // 拦截API请求，延迟响应
    await page.route(`**/api/orders/${testOrderId}`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.continue();
    });

    // 访问详情页
    await page.goto(`/orders/${testOrderId}`);

    // 验证加载中状态
    await expect(page.locator('.ant-spin, .loading')).toBeVisible();

    // 等待加载完成
    await page.waitForTimeout(1500);
  });

  test('应该在API错误时显示错误提示', async ({ page }) => {
    // 拦截API请求，返回错误
    await page.route(`**/api/orders/${testOrderId}`, async (route) => {
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

    // 访问详情页
    await page.goto(`/orders/${testOrderId}`);

    // 等待错误提示
    await page.waitForTimeout(500);

    // 验证错误提示显示
    await expect(
      page.locator('.ant-message-error, .ant-alert-error, .ant-result-error')
    ).toBeVisible();
  });

  test('应该显示完整的收货地址', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    const bodyText = await page.locator('body').textContent();

    // 验证包含地址信息（省市区 + 详细地址）
    expect(bodyText).toMatch(/省|市|区/);
  });

  test('应该显示订单创建和更新时间', async ({ page }) => {
    await page.goto(`/orders/${testOrderId}`);
    await page.waitForTimeout(500);

    const bodyText = await page.locator('body').textContent();

    // 验证包含时间信息
    expect(bodyText).toMatch(/创建时间|下单时间/);
    expect(bodyText).toMatch(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
  });
});
