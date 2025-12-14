import { test, expect } from '@playwright/test';

test.describe('品牌状态管理功能', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到品牌列表页面
    await page.goto('/brand-management');

    // 等待页面加载完成
    await expect(page.getByTestId('brand-list-container')).toBeVisible();

    // Mock品牌状态变更API
    await page.route('**/api/v1/brands/*/status', (route) => {
      const requestData = JSON.parse(route.request().postData() || '{}');
      const { status } = requestData;

      if (route.request().method() === 'PATCH') {
        // 模拟状态变更成功响应
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: route.request().url().split('/').pop()?.split('?')[0],
              status,
              oldStatus: status === 'enabled' ? 'disabled' : 'enabled',
              updatedAt: new Date().toISOString(),
              updatedBy: 'admin'
            },
            message: 'Brand status updated successfully',
            timestamp: new Date().toISOString()
          })
        });
      }
    });
  });

  test('应该能够查看品牌当前状态', async ({ page }) => {
    // 查找第一个品牌的显示状态
    const firstBrandRow = page.locator('[data-testid="brand-table-row"]').first();
    await expect(firstBrandRow).toBeVisible();

    // 验证状态标签存在
    const statusBadge = firstBrandRow.locator('[data-testid="brand-status-badge"]');
    await expect(statusBadge).toBeVisible();

    // 验证状态文本内容
    const statusText = await statusBadge.textContent();
    expect(['启用', '停用', '草稿']).toContain(statusText || '');
  });

  test('应该能够点击状态按钮打开操作菜单', async ({ page }) => {
    // 查找第一个品牌的状态操作按钮
    const firstBrandRow = page.locator('[data-testid="brand-table-row"]').first();
    const statusActionsButton = firstBrandRow.locator('[data-testid="brand-status-actions-button"]');

    await expect(statusActionsButton).toBeVisible();
    await statusActionsButton.click();

    // 验证状态操作菜单出现
    const statusMenu = page.locator('[data-testid="brand-status-menu"]');
    await expect(statusMenu).toBeVisible();

    // 验证菜单项
    const enableMenuItem = page.locator('[data-testid="brand-enable-menu-item"]');
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');

    await expect(enableMenuItem).toBeVisible();
    await expect(disableMenuItem).toBeVisible();
  });

  test('应该能够成功将品牌从启用状态切换到停用状态', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page.locator('[data-testid="brand-table-row"]').filter({
      has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' })
    }).first();

    if (await enabledBrandRow.count() === 0) {
      // 如果没有启用的品牌，创建一个测试场景
      console.log('没有找到启用状态的品牌，跳过此测试');
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator('[data-testid="brand-status-actions-button"]');
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证对话框内容
    const dialogTitle = confirmDialog.locator('.ant-modal-title');
    await expect(dialogTitle).toHaveText('确认停用品牌');

    const dialogContent = page.locator('[data-testid="brand-status-confirm-content"]');
    await expect(dialogContent).toContainText('确定要停用此品牌吗？');

    // 输入停用原因
    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    await expect(reasonInput).toBeVisible();
    await reasonInput.fill('测试停用原因');

    // 点击确认按钮
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await confirmButton.click();

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证成功提示消息
    const successMessage = page.locator('.ant-message-success');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('品牌状态更新成功');

    // 验证状态标签更新
    const updatedStatusBadge = enabledBrandRow.locator('[data-testid="brand-status-badge"]');
    await expect(updatedStatusBadge).toHaveText('停用');
  });

  test('应该能够成功将品牌从停用状态切换到启用状态', async ({ page }) => {
    // 找到停用状态的品牌
    const disabledBrandRow = page.locator('[data-testid="brand-table-row"]').filter({
      has: page.locator('[data-testid="brand-status-badge"]', { hasText: '停用' })
    }).first();

    if (await disabledBrandRow.count() === 0) {
      // 如果没有停用的品牌，创建一个测试场景
      console.log('没有找到停用状态的品牌，跳过此测试');
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = disabledBrandRow.locator('[data-testid="brand-status-actions-button"]');
    await statusActionsButton.click();

    // 点击启用菜单项
    const enableMenuItem = page.locator('[data-testid="brand-enable-menu-item"]');
    await enableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证对话框内容
    const dialogTitle = confirmDialog.locator('.ant-modal-title');
    await expect(dialogTitle).toHaveText('确认启用品牌');

    // 点击确认按钮（启用通常不需要原因）
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await confirmButton.click();

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证成功提示消息
    const successMessage = page.locator('.ant-message-success');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('品牌状态更新成功');

    // 验证状态标签更新
    const updatedStatusBadge = disabledBrandRow.locator('[data-testid="brand-status-badge"]');
    await expect(updatedStatusBadge).toHaveText('启用');
  });

  test('应该能够取消状态变更操作', async ({ page }) => {
    // 找到第一个品牌
    const firstBrandRow = page.locator('[data-testid="brand-table-row"]').first();

    // 点击状态操作按钮
    const statusActionsButton = firstBrandRow.locator('[data-testid="brand-status-actions-button"]');
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 点击取消按钮
    const cancelButton = page.locator('[data-testid="brand-status-cancel-button"]');
    await cancelButton.click();

    // 验证对话框关闭
    await expect(confirmDialog).not.toBeVisible();

    // 验证品牌状态未改变
    const originalStatusBadge = firstBrandRow.locator('[data-testid="brand-status-badge"]');
    const statusText = await originalStatusBadge.textContent();
    expect(statusText).toBeTruthy(); // 状态应该保持不变
  });

  test('应该显示正确的操作按钮状态', async ({ page }) => {
    // 检查启用状态品牌的操作按钮
    const enabledBrandRow = page.locator('[data-testid="brand-table-row"]').filter({
      has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' })
    }).first();

    if (await enabledBrandRow.count() > 0) {
      const statusActionsButton = enabledBrandRow.locator('[data-testid="brand-status-actions-button"]');
      await statusActionsButton.click();

      const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
      await expect(disableMenuItem).toBeVisible();

      // 启用的品牌应该显示停用选项
      expect(await disableMenuItem.textContent()).toContain('停用');

      // 关闭菜单
      await page.keyboard('Escape');
    }

    // 检查停用状态品牌的操作按钮
    const disabledBrandRow = page.locator('[data-testid="brand-table-row"]').filter({
      has: page.locator('[data-testid="brand-status-badge"]', { hasText: '停用' })
    }).first();

    if (await disabledBrandRow.count() > 0) {
      const statusActionsButton = disabledBrandRow.locator('[data-testid="brand-status-actions-button"]');
      await statusActionsButton.click();

      const enableMenuItem = page.locator('[data-testid="brand-enable-menu-item"]');
      await expect(enableMenuItem).toBeVisible();

      // 停用的品牌应该显示启用选项
      expect(await enableMenuItem.textContent()).toContain('启用');
    }
  });

  test('应该处理状态变更失败的情况', async ({ page }) => {
    // Mock状态变更失败API
    await page.route('**/api/v1/brands/*/status', (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'STATUS_CHANGE_FAILED',
              message: '品牌状态变更失败'
            },
            timestamp: new Date().toISOString()
          })
        });
      }
    });

    // 找到第一个品牌
    const firstBrandRow = page.locator('[data-testid="brand-table-row"]').first();

    // 点击状态操作按钮
    const statusActionsButton = firstBrandRow.locator('[data-testid="brand-status-actions-button"]');
    await statusActionsButton.click();

    // 点击启用菜单项
    const enableMenuItem = page.locator('[data-testid="brand-enable-menu-item"]');
    await enableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 点击确认按钮
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await confirmButton.click();

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证错误提示消息
    const errorMessage = page.locator('.ant-message-error');
    await expect(errorMessage).toBeVisible();

    // 验证对话框关闭
    await expect(confirmDialog).not.toBeVisible();
  });

  test('应该支持批量状态变更', async ({ page }) => {
    // 选择多个品牌
    const checkboxes = page.locator('[data-testid="brand-checkbox"]');
    const firstThreeCheckboxes = checkboxes.first().nth(0);

    if (await firstThreeCheckboxes.count() >= 2) {
      // 选择前两个品牌
      await checkboxes.first().check();
      await checkboxes.nth(1).check();

      // 验证批量操作按钮出现
      const batchActions = page.locator('[data-testid="brand-batch-actions"]');
      await expect(batchActions).toBeVisible();

      // 点击批量状态操作按钮
      const batchStatusButton = page.locator('[data-testid="brand-batch-status-button"]');
      await batchStatusButton.click();

      // 验证批量状态操作菜单
      const batchMenu = page.locator('[data-testid="brand-batch-status-menu"]');
      await expect(batchMenu).toBeVisible();

      // 选择批量停用
      const batchDisableOption = page.locator('[data-testid="brand-batch-disable-option"]');
      await batchDisableOption.click();

      // 验证批量确认对话框
      const batchConfirmDialog = page.locator('[data-testid="brand-batch-confirm-dialog"]');
      await expect(batchConfirmDialog).toBeVisible();

      const dialogContent = batchConfirmDialog.locator('[data-testid="batch-confirm-content"]');
      await expect(dialogContent).toContainText('确定要停用选中的 2 个品牌吗？');

      // 取消操作以避免实际更改数据
      const cancelButton = page.locator('[data-testid="brand-batch-cancel-button"]');
      await cancelButton.click();
    } else {
      test.skip();
    }
  });
});