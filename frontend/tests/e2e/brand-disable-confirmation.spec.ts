import { test, expect } from '@playwright/test';

test.describe('品牌停用确认功能', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到品牌列表页面
    await page.goto('/brand-management');

    // 等待页面加载完成
    await expect(page.getByTestId('brand-list-container')).toBeVisible();

    // Mock品牌状态变更API
    await page.route('**/api/v1/brands/*/status', (route) => {
      const requestData = JSON.parse(route.request().postData() || '{}');

      if (route.request().method() === 'PATCH') {
        // 模拟停用确认成功响应
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: route.request().url().split('/').pop()?.split('?')[0],
              status: 'disabled',
              oldStatus: 'enabled',
              reason: requestData.reason,
              updatedAt: new Date().toISOString(),
              updatedBy: 'admin',
            },
            message: '品牌停用成功',
            timestamp: new Date().toISOString(),
          }),
        });
      }
    });
  });

  test('应该显示停用确认对话框', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 获取品牌名称
    const brandName = await enabledBrandRow.locator('[data-testid="brand-name"]').textContent();

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证停用确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证对话框标题
    const dialogTitle = confirmDialog.locator('.ant-modal-title');
    await expect(dialogTitle).toHaveText('确认停用品牌');

    // 验证对话框内容包含品牌名称
    const dialogContent = page.locator('[data-testid="brand-status-confirm-content"]');
    await expect(dialogContent).toContainText(`确定要停用品牌"${brandName}"吗？`);
  });

  test('应该要求输入停用原因', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证原因输入框存在
    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    await expect(reasonInput).toBeVisible();

    // 验证原因输入框是必填的
    const reasonLabel = page.locator('[data-testid="brand-status-reason-label"]');
    await expect(reasonLabel).toContainText('*');

    // 验证输入框占位符文本
    const placeholder = await reasonInput.getAttribute('placeholder');
    expect(placeholder).toContain('请输入停用原因');
  });

  test('应该在未输入原因时禁用确认按钮', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证确认按钮初始状态
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await expect(confirmButton).toBeDisabled();

    // 验证原因输入框为空
    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    await expect(reasonInput).toHaveValue('');

    // 输入一个字符，确认按钮应该仍然禁用
    await reasonInput.fill('测');
    await expect(confirmButton).toBeDisabled();

    // 清空输入
    await reasonInput.clear();
    await expect(confirmButton).toBeDisabled();
  });

  test('应该在输入有效原因后启用确认按钮', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证确认按钮初始状态
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await expect(confirmButton).toBeDisabled();

    // 输入有效原因
    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    await reasonInput.fill('业务调整，暂时停用该品牌');

    // 验证确认按钮启用
    await expect(confirmButton).toBeEnabled();
  });

  test('应该显示停用影响范围说明', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证影响范围说明
    const impactWarning = page.locator('[data-testid="brand-disable-impact-warning"]');
    await expect(impactWarning).toBeVisible();

    // 验证警告内容
    const warningContent = await impactWarning.textContent();
    expect(warningContent).toContain('停用后');
    expect(warningContent).toContain('无法创建新的商品');
    expect(warningContent).toContain('现有商品不会受影响');
  });

  test('应该验证停用原因字符限制', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');

    // 输入超长原因（超过500字符）
    const longReason = 'a'.repeat(501);
    await reasonInput.fill(longReason);

    // 验证错误提示
    const errorHelp = page.locator('[data-testid="brand-status-reason-error"]');
    await expect(errorHelp).toBeVisible();
    await expect(errorHelp).toContainText('停用原因不能超过500个字符');

    // 验证确认按钮禁用
    await expect(confirmButton).toBeDisabled();

    // 输入有效长度的原因
    await reasonInput.clear();
    await reasonInput.fill('a'.repeat(100));

    // 验证错误提示消失
    await expect(errorHelp).not.toBeVisible();

    // 验证确认按钮启用
    await expect(confirmButton).toBeEnabled();
  });

  test('应该在成功停用后更新品牌状态', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 输入停用原因
    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    await reasonInput.fill('业务调整，暂时停用该品牌');

    // 点击确认按钮
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await confirmButton.click();

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证成功提示
    const successMessage = page.locator('.ant-message-success');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('品牌停用成功');

    // 验证对话框关闭
    await expect(confirmDialog).not.toBeVisible();

    // 验证品牌状态更新为停用
    const statusBadge = enabledBrandRow.locator('[data-testid="brand-status-badge"]');
    await expect(statusBadge).toHaveText('停用');
  });

  test('应该支持取消停用操作', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 记录原始状态
    const originalStatusBadge = enabledBrandRow.locator('[data-testid="brand-status-badge"]');
    const originalStatus = await originalStatusBadge.textContent();

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
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
    await expect(originalStatusBadge).toHaveText(originalStatus || '');
  });

  test('应该处理停用操作失败的情况', async ({ page }) => {
    // Mock停用失败API
    await page.route('**/api/v1/brands/*/status', (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: {
              code: 'BRAND_HAS_ACTIVE_PRODUCTS',
              message: '该品牌下还有活跃的商品，无法停用',
            },
            timestamp: new Date().toISOString(),
          }),
        });
      }
    });

    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 输入停用原因
    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    await reasonInput.fill('测试停用原因');

    // 点击确认按钮
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await confirmButton.click();

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证错误提示
    const errorMessage = page.locator('.ant-message-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('该品牌下还有活跃的商品，无法停用');

    // 验证对话框关闭
    await expect(confirmDialog).not.toBeVisible();

    // 验证品牌状态未改变
    const statusBadge = enabledBrandRow.locator('[data-testid="brand-status-badge"]');
    await expect(statusBadge).toHaveText('启用');
  });

  test('应该支持键盘操作', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 验证焦点在原因输入框
    const reasonInput = page.locator('[data-testid="brand-status-reason-input"]');
    await expect(reasonInput).toBeFocused();

    // 输入停用原因
    await reasonInput.fill('键盘操作测试停用原因');

    // 使用Tab键移动到确认按钮
    await page.keyboard('Tab');

    // 验证确认按钮获得焦点
    const confirmButton = page.locator('[data-testid="brand-status-confirm-button"]');
    await expect(confirmButton).toBeFocused();

    // 按Enter键确认
    await page.keyboard('Enter');

    // 等待操作完成
    await page.waitForTimeout(1000);

    // 验证对话框关闭
    await expect(confirmDialog).not.toBeVisible();
  });

  test('应该按ESC键关闭对话框', async ({ page }) => {
    // 找到启用状态的品牌
    const enabledBrandRow = page
      .locator('[data-testid="brand-table-row"]')
      .filter({
        has: page.locator('[data-testid="brand-status-badge"]', { hasText: '启用' }),
      })
      .first();

    if ((await enabledBrandRow.count()) === 0) {
      test.skip();
      return;
    }

    // 点击状态操作按钮
    const statusActionsButton = enabledBrandRow.locator(
      '[data-testid="brand-status-actions-button"]'
    );
    await statusActionsButton.click();

    // 点击停用菜单项
    const disableMenuItem = page.locator('[data-testid="brand-disable-menu-item"]');
    await disableMenuItem.click();

    // 验证确认对话框出现
    const confirmDialog = page.locator('[data-testid="brand-status-confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();

    // 按ESC键
    await page.keyboard('Escape');

    // 验证对话框关闭
    await expect(confirmDialog).not.toBeVisible();
  });
});
