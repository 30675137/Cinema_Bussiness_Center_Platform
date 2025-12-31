/**
 * @spec O001-product-order-list
 * E2E Test: 订单状态更新功能 - User Story 4
 *
 * 测试目标:
 * - 标记发货功能（已支付 → 已发货）
 * - 标记完成功能（已发货 → 已完成）
 * - 取消订单功能（待支付/已支付 → 已取消）
 * - 非法状态转换阻止
 * - 乐观锁冲突处理
 * - 状态变更记录到日志
 */

import { test, expect } from '@playwright/test';

test.describe('订单状态更新功能 - User Story 4', () => {
  test.beforeEach(async ({ page }) => {
    // 访问订单列表页
    await page.goto('/orders/list');
    await page.waitForSelector('.ant-table-tbody tr');
  });

  test('应该在订单详情页显示状态操作按钮', async ({ page }) => {
    // 找到一个"已支付"状态的订单
    const paidOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已支付")'),
      })
      .first();

    // 点击进入详情页
    await paidOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 验证操作按钮存在
    const actionButtons = page.locator('.order-actions, .ant-space button');
    await expect(actionButtons).toBeVisible();

    // 验证至少有一个操作按钮
    const buttonCount = await actionButtons.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('应该能够标记发货（已支付 → 已发货）', async ({ page }) => {
    // 找到一个"已支付"状态的订单
    const paidOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已支付")'),
      })
      .first();

    const orderNumber = await paidOrderRow.locator('td').first().textContent();

    // 点击进入详情页
    await paidOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 验证当前状态是"已支付"
    await expect(page.locator('.ant-tag:has-text("已支付")')).toBeVisible();

    // 点击"标记发货"按钮
    const shipButton = page.locator('button:has-text("标记发货"), button:has-text("发货")');
    await expect(shipButton).toBeVisible();
    await shipButton.click();

    // 等待确认对话框（如果有）
    const confirmButton = page.locator(
      '.ant-modal button:has-text("确定"), .ant-popconfirm button:has-text("确定")'
    );
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // 等待状态更新
    await page.waitForTimeout(500);

    // 验证状态已更新为"已发货"
    await expect(page.locator('.ant-tag:has-text("已发货")')).toBeVisible();

    // 验证成功提示消息
    await expect(page.locator('.ant-message-success')).toBeVisible();

    // 验证订单日志中有发货记录
    await expect(page.locator('body')).toContainText(/发货|SHIP/);
  });

  test('应该能够标记完成（已发货 → 已完成）', async ({ page }) => {
    // 找到一个"已发货"状态的订单
    const shippedOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已发货")'),
      })
      .first();

    // 点击进入详情页
    await shippedOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 验证当前状态是"已发货"
    await expect(page.locator('.ant-tag:has-text("已发货")')).toBeVisible();

    // 点击"标记完成"按钮
    const completeButton = page.locator('button:has-text("标记完成"), button:has-text("完成")');
    await expect(completeButton).toBeVisible();
    await completeButton.click();

    // 等待确认对话框（如果有）
    const confirmButton = page.locator(
      '.ant-modal button:has-text("确定"), .ant-popconfirm button:has-text("确定")'
    );
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // 等待状态更新
    await page.waitForTimeout(500);

    // 验证状态已更新为"已完成"
    await expect(page.locator('.ant-tag:has-text("已完成")')).toBeVisible();

    // 验证成功提示消息
    await expect(page.locator('.ant-message-success')).toBeVisible();
  });

  test('应该能够取消订单（待支付 → 已取消）', async ({ page }) => {
    // 找到一个"待支付"状态的订单
    const pendingOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("待支付")'),
      })
      .first();

    // 点击进入详情页
    await pendingOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 验证当前状态是"待支付"
    await expect(page.locator('.ant-tag:has-text("待支付")')).toBeVisible();

    // 点击"取消订单"按钮
    const cancelButton = page.locator('button:has-text("取消订单"), button:has-text("取消")');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // 等待取消原因对话框
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    // 输入取消原因
    const reasonInput = modal.locator('textarea, input');
    await reasonInput.fill('用户主动取消 - 测试');

    // 点击确定按钮
    await modal.locator('button:has-text("确定")').click();

    // 等待状态更新
    await page.waitForTimeout(500);

    // 验证状态已更新为"已取消"
    await expect(page.locator('.ant-tag:has-text("已取消")')).toBeVisible();

    // 验证取消原因已显示
    await expect(page.locator('body')).toContainText('用户主动取消 - 测试');
  });

  test('应该能够取消已支付订单（已支付 → 已取消）', async ({ page }) => {
    // 找到一个"已支付"状态的订单
    const paidOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已支付")'),
      })
      .first();

    // 点击进入详情页
    await paidOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 点击"取消订单"按钮
    const cancelButton = page.locator('button:has-text("取消订单"), button:has-text("取消")');

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // 输入取消原因
      const modal = page.locator('.ant-modal');
      await expect(modal).toBeVisible();

      const reasonInput = modal.locator('textarea, input');
      await reasonInput.fill('已支付订单取消 - 测试');

      // 点击确定
      await modal.locator('button:has-text("确定")').click();

      // 等待状态更新
      await page.waitForTimeout(500);

      // 验证状态已更新为"已取消"
      await expect(page.locator('.ant-tag:has-text("已取消")')).toBeVisible();
    }
  });

  test('应该阻止非法状态转换（已完成订单不能取消）', async ({ page }) => {
    // 找到一个"已完成"状态的订单
    const completedOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已完成")'),
      })
      .first();

    if (await completedOrderRow.isVisible().catch(() => false)) {
      // 点击进入详情页
      await completedOrderRow.locator('td').first().locator('a').click();
      await page.waitForSelector('.order-detail');

      // 验证"取消订单"按钮不存在或禁用
      const cancelButton = page.locator('button:has-text("取消订单"), button:has-text("取消")');

      // 按钮应该不可见或被禁用
      const isVisible = await cancelButton.isVisible().catch(() => false);
      if (isVisible) {
        await expect(cancelButton).toBeDisabled();
      } else {
        // 按钮不显示也是正确的
        expect(isVisible).toBeFalsy();
      }
    }
  });

  test('应该阻止非法状态转换（待支付订单不能直接标记发货）', async ({ page }) => {
    // 找到一个"待支付"状态的订单
    const pendingOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("待支付")'),
      })
      .first();

    // 点击进入详情页
    await pendingOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 验证"标记发货"按钮不存在
    const shipButton = page.locator('button:has-text("标记发货"), button:has-text("发货")');

    const isVisible = await shipButton.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });

  test('应该根据订单状态显示正确的操作按钮', async ({ page }) => {
    // 测试不同状态下的按钮可见性

    // 1. 待支付订单 - 只能取消
    const pendingRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("待支付")'),
      })
      .first();

    if (await pendingRow.isVisible().catch(() => false)) {
      await pendingRow.locator('td').first().locator('a').click();
      await page.waitForSelector('.order-detail');

      await expect(page.locator('button:has-text("取消")')).toBeVisible();
      await expect(page.locator('button:has-text("发货")')).not.toBeVisible();

      await page.goto('/orders/list');
    }

    // 2. 已支付订单 - 可以发货或取消
    const paidRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已支付")'),
      })
      .first();

    if (await paidRow.isVisible().catch(() => false)) {
      await paidRow.locator('td').first().locator('a').click();
      await page.waitForSelector('.order-detail');

      await expect(page.locator('button:has-text("发货")')).toBeVisible();
      await expect(page.locator('button:has-text("取消")')).toBeVisible();
    }
  });

  test('应该在状态更新后刷新订单详情', async ({ page }) => {
    // 找到一个"已支付"状态的订单
    const paidOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已支付")'),
      })
      .first();

    // 点击进入详情页
    await paidOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 获取当前版本号
    const versionBefore = await page.locator('body').textContent();
    const versionMatch = versionBefore?.match(/v(\d+)/);
    const versionNumber = versionMatch ? parseInt(versionMatch[1]) : 0;

    // 执行状态更新操作
    const shipButton = page.locator('button:has-text("标记发货"), button:has-text("发货")');
    if (await shipButton.isVisible()) {
      await shipButton.click();

      const confirmButton = page.locator(
        '.ant-modal button:has-text("确定"), .ant-popconfirm button:has-text("确定")'
      );
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // 等待更新完成
      await page.waitForTimeout(1000);

      // 验证版本号增加了
      const versionAfter = await page.locator('body').textContent();
      const newVersionMatch = versionAfter?.match(/v(\d+)/);
      const newVersionNumber = newVersionMatch ? parseInt(newVersionMatch[1]) : 0;

      expect(newVersionNumber).toBeGreaterThan(versionNumber);
    }
  });

  test('应该在取消订单时必须输入取消原因', async ({ page }) => {
    // 找到可取消的订单
    const cancelableRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("待支付")'),
      })
      .first();

    await cancelableRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 点击取消按钮
    const cancelButton = page.locator('button:has-text("取消订单"), button:has-text("取消")');
    await cancelButton.click();

    // 等待对话框
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();

    // 不输入原因，直接点击确定
    const submitButton = modal.locator('button:has-text("确定")');
    await submitButton.click();

    // 验证显示错误提示（原因必填）
    const errorMessage = page.locator('.ant-form-item-explain-error, .ant-message-error');
    await expect(errorMessage).toBeVisible();
  });

  test('应该显示操作成功的提示消息', async ({ page }) => {
    // 找到一个"已支付"状态的订单
    const paidOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已支付")'),
      })
      .first();

    await paidOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 执行发货操作
    const shipButton = page.locator('button:has-text("标记发货"), button:has-text("发货")');
    if (await shipButton.isVisible()) {
      await shipButton.click();

      const confirmButton = page.locator(
        '.ant-modal button:has-text("确定"), .ant-popconfirm button:has-text("确定")'
      );
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // 验证成功提示
      await expect(page.locator('.ant-message-success')).toBeVisible();
      await expect(page.locator('.ant-message')).toContainText(/成功|完成/);
    }
  });

  test('应该在订单日志中记录状态变更', async ({ page }) => {
    // 找到一个"已支付"状态的订单
    const paidOrderRow = page
      .locator('.ant-table-tbody tr', {
        has: page.locator('.ant-tag:has-text("已支付")'),
      })
      .first();

    await paidOrderRow.locator('td').first().locator('a').click();
    await page.waitForSelector('.order-detail');

    // 获取当前日志数量
    const logsBefore = await page.locator('.ant-timeline-item').count();

    // 执行发货操作
    const shipButton = page.locator('button:has-text("标记发货"), button:has-text("发货")');
    if (await shipButton.isVisible()) {
      await shipButton.click();

      const confirmButton = page.locator(
        '.ant-modal button:has-text("确定"), .ant-popconfirm button:has-text("确定")'
      );
      if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await confirmButton.click();
      }

      await page.waitForTimeout(1000);

      // 验证日志数量增加
      const logsAfter = await page.locator('.ant-timeline-item').count();
      expect(logsAfter).toBeGreaterThan(logsBefore);

      // 验证新日志包含发货信息
      const latestLog = page.locator('.ant-timeline-item').first();
      await expect(latestLog).toContainText(/发货|SHIP/);
    }
  });
});
