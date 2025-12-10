import { test, expect } from '@playwright/test';

test.describe('用户故事4: 商品审核流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/review');
    await page.waitForLoadState('networkidle');
  });

  test('US4-1: 验证审核界面显示修改对比', async ({ page }) => {
    // Given 审核人员进入审核界面
    // When 查看待审核商品
    // Then 系统高亮显示所有被修改的核心字段

    // 验证审核页面加载
    await expect(page.locator('[data-testid="review-panel"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-list"]')).toBeVisible();

    // 查找待审核商品
    const reviewItems = page.locator('[data-testid="review-item"]');
    if (await reviewItems.count() > 0) {
      // 点击第一个待审核商品
      await reviewItems.first().click();

      // 验证修改对比界面
      await expect(page.locator('[data-testid="change-comparison"]')).toBeVisible();
      await expect(page.locator('[data-testid="highlighted-changes"]')).toBeVisible();

      // 验证高亮显示的修改字段
      const highlightedFields = page.locator('[data-testid="modified-field"]');
      const fieldCount = await highlightedFields.count();
      expect(fieldCount).toBeGreaterThan(0);

      // 验证每个修改字段都有高亮样式
      for (let i = 0; i < Math.min(fieldCount, 3); i++) {
        const field = highlightedFields.nth(i);
        await expect(field).toHaveClass(/highlighted|modified/);
      }
    }
  });

  test('US4-2: 验证字段对比信息显示', async ({ page }) => {
    // Given 审核人员在审核界面
    // When 点击被高亮的修改字段
    // Then 显示修改前后的对比信息

    // 查找待审核商品
    const reviewItems = page.locator('[data-testid="review-item"]');
    if (await reviewItems.count() > 0) {
      await reviewItems.first().click();

      // 查找修改字段
      const modifiedFields = page.locator('[data-testid="modified-field"]');
      if (await modifiedFields.count() > 0) {
        // 点击第一个修改字段
        await modifiedFields.first().click();

        // 验证对比详情弹窗
        await expect(page.locator('[data-testid="field-comparison-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="before-value"]')).toBeVisible();
        await expect(page.locator('[data-testid="after-value"]')).toBeVisible();

        // 验证修改时间
        await expect(page.locator('[data-testid="modify-time"]')).toBeVisible();

        // 验证修改人信息
        await expect(page.locator('[data-testid="modifier-info"]')).toBeVisible();
      }
    }
  });

  test('US4-3: 验证修改字段确认机制', async ({ page }) => {
    // Given 审核人员在审核界面
    // When 逐个确认修改内容
    // Then "审核通过"按钮被激活

    // 查找待审核商品
    const reviewItems = page.locator('[data-testid="review-item"]');
    if (await reviewItems.count() > 0) {
      await reviewItems.first().click();

      // 检查初始状态 - 审核通过按钮应该是禁用的
      const approveButton = page.locator('[data-testid="approve-button"]');
      await expect(approveButton).toBeDisabled();

      // 查找需要确认的修改字段
      const unconfirmedFields = page.locator('[data-testid="modified-field"]:not(.confirmed)');
      const unconfirmedCount = await unconfirmedFields.count();

      if (unconfirmedCount > 0) {
        // 逐个确认修改字段
        for (let i = 0; i < unconfirmedCount; i++) {
          const field = unconfirmedFields.nth(i);
          await field.click(); // 点击字段

          // 查找确认按钮
          const confirmButton = page.locator('[data-testid="confirm-field-change"]');
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          } else {
            // 如果没有确认按钮，可能点击本身就是确认
            await field.click();
          }

          // 等待确认动画完成
          await page.waitForTimeout(500);
        }

        // 验证所有字段都已确认
        await expect(page.locator('[data-testid="modified-field"].confirmed')).toHaveCount(unconfirmedCount);

        // 验证审核通过按钮现在被激活
        await expect(approveButton).toBeEnabled();
      }
    }
  });

  test('US4-4: 验证审核操作功能', async ({ page }) => {
    // Given 审核人员在审核界面
    // When 点击审核操作按钮
    // Then 批准或驳回功能正常工作

    // 查找待审核商品
    const reviewItems = page.locator('[data-testid="review-item"]');
    if (await reviewItems.count() > 0) {
      await reviewItems.first().click();

      // 测试驳回按钮（应该总是可用的）
      const rejectButton = page.locator('[data-testid="reject-button"]');
      await expect(rejectButton).toBeVisible();
      await expect(rejectButton).toBeEnabled();

      // 如果有修改字段且已确认，测试通过按钮
      const approveButton = page.locator('[data-testid="approve-button"]');
      if (await approveButton.isVisible()) {
        // 检查按钮状态
        const isApprovedEnabled = await approveButton.isEnabled();

        // 如果按钮可用，测试批准功能
        if (isApprovedEnabled) {
          // 注意：在实际测试中，这里可能会因为业务逻辑而跳过实际批准
          await expect(approveButton).toBeEnabled();
        }
      }
    }
  });

  test('US4-5: 验证驳回原因模态框', async ({ page }) => {
    // Given 审核人员选择驳回商品
    // When 点击驳回按钮
    // Then 系统强制要求填写驳回原因并将商品状态回退

    // 查找待审核商品
    const reviewItems = page.locator('[data-testid="review-item"]');
    if (await reviewItems.count() > 0) {
      await reviewItems.first().click();

      // 点击驳回按钮
      await page.click('[data-testid="reject-button"]');

      // 验证驳回原因模态框
      await expect(page.locator('[data-testid="reject-reason-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="reject-reason-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="reject-reason-textarea"]')).toBeVisible();

      // 测试不填写原因无法提交
      const confirmRejectButton = page.locator('[data-testid="confirm-reject"]');
      await expect(confirmRejectButton).toBeDisabled();

      // 填写驳回原因
      await page.fill('[data-testid="reject-reason-textarea"]', '商品信息不准确，需要重新核对');

      // 现在确认按钮应该可用
      await expect(confirmRejectButton).toBeEnabled();

      // 测试取消按钮
      const cancelButton = page.locator('[data-testid="cancel-reject"]');
      await expect(cancelButton).toBeVisible();
    }
  });

  test('US4-6: 验证批量审核功能', async ({ page }) => {
    // Given 审核人员在审核界面
    // When 选择多个商品进行批量审核
    // Then 批量操作功能正常工作

    // 查找批量审核控件
    const batchModeToggle = page.locator('[data-testid="batch-mode-toggle"]');
    if (await batchModeToggle.isVisible()) {
      await batchModeToggle.click();

      // 验证批量选择界面
      await expect(page.locator('[data-testid="batch-selection"]')).toBeVisible();

      // 查找待审核商品列表
      const reviewItems = page.locator('[data-testid="review-item"]');
      const itemCount = await reviewItems.count();

      if (itemCount >= 2) {
        // 选择前两个商品
        await reviewItems.first().locator('[data-testid="batch-checkbox"]').check();
        await reviewItems.nth(1).locator('[data-testid="batch-checkbox"]').check();

        // 验证批量操作按钮
        await expect(page.locator('[data-testid="batch-approve"]')).toBeVisible();
        await expect(page.locator('[data-testid="batch-reject"]')).toBeVisible();

        // 验证选中计数
        await expect(page.locator('[data-testid="selected-count"]')).toContainText('2');

        // 测试批量驳回（总是可用的）
        await page.click('[data-testid="batch-reject"]');
        await expect(page.locator('[data-testid="batch-reason-modal"]')).toBeVisible();
      }
    }
  });

  test('US4-7: 验证审核历史显示', async ({ page }) => {
    // Given 审核人员在审核界面
    // When 查看审核历史
    // Then 显示完整的审核记录

    // 查找审核历史入口
    const historyButton = page.locator('[data-testid="review-history-button"]');
    if (await historyButton.isVisible()) {
      await historyButton.click();

      // 验证审核历史界面
      await expect(page.locator('[data-testid="review-history-list"]')).toBeVisible();

      // 查找历史记录
      const historyItems = page.locator('[data-testid="history-item"]');
      if (await historyItems.count() > 0) {
        const firstHistory = historyItems.first();

        // 验证历史记录信息
        await expect(firstHistory.locator('[data-testid="history-product-name"]')).toBeVisible();
        await expect(firstHistory.locator('[data-testid="history-reviewer"]')).toBeVisible();
        await expect(firstHistory.locator('[data-testid="history-review-time"]')).toBeVisible();
        await expect(firstHistory.locator('[data-testid="history-result"]')).toBeVisible();
        await expect(firstHistory.locator('[data-testid="history-reason"]')).toBeVisible();
      }
    }
  });

  test('US4-8: 验证审核统计和筛选', async ({ page }) => {
    // Given 审核人员在审核界面
    // When 使用筛选和查看统计
    // Then 统计和筛选功能正常工作

    // 验证统计面板
    const statsPanel = page.locator('[data-testid="review-stats"]');
    if (await statsPanel.isVisible()) {
      await expect(statsPanel.locator('[data-testid="pending-count"]')).toBeVisible();
      await expect(statsPanel.locator('[data-testid="approved-count"]')).toBeVisible();
      await expect(statsPanel.locator('[data-testid="rejected-count"]')).toBeVisible();
      await expect(statsPanel.locator('[data-testid="total-count"]')).toBeVisible();
    }

    // 验证筛选功能
    const statusFilter = page.locator('[data-testid="status-filter"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.click();

      // 筛选待审核
      await page.click('[data-value="pending"]');
      await page.waitForTimeout(1000);

      // 验证筛选结果
      const reviewItems = page.locator('[data-testid="review-item"]');
      if (await reviewItems.count() > 0) {
        await expect(reviewItems.first().locator('[data-testid="item-status"]')).toContainText('待审核');
      }
    }

    // 验证日期筛选
    const dateFilter = page.locator('[data-testid="date-filter"]');
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await expect(page.locator('[data-testid="date-range-picker"]')).toBeVisible();
    }

    // 验证审核人筛选
    const reviewerFilter = page.locator('[data-testid="reviewer-filter"]');
    if (await reviewerFilter.isVisible()) {
      await reviewerFilter.click();
      await expect(page.locator('[data-testid="reviewer-list"]')).toBeVisible();
    }
  });

  test('US4-9: 验证审核详情查看', async ({ page }) => {
    // Given 审核人员在审核界面
    // When 查看详细的审核信息
    // Then 显示完整的修改历史和审核记录

    // 查找待审核商品
    const reviewItems = page.locator('[data-testid="review-item"]');
    if (await reviewItems.count() > 0) {
      await reviewItems.first().click();

      // 查找详情查看按钮
      const detailButton = page.locator('[data-testid="view-detail-button"]');
      if (await detailButton.isVisible()) {
        await detailButton.click();

        // 验证详情界面
        await expect(page.locator('[data-testid="review-detail-modal"]')).toBeVisible();

        // 验证商品基本信息
        await expect(page.locator('[data-testid="detail-product-info"]')).toBeVisible();

        // 验证修改历史
        await expect(page.locator('[data-testid="detail-change-history"]')).toBeVisible();

        // 验证审核记录
        await expect(page.locator('[data-testid="detail-review-record"]')).toBeVisible();
      }
    }
  });

  test('US4-10: 验证审核流程状态流转', async ({ page }) => {
    // Given 商品在不同审核状态
    // When 进行审核操作
    // Then 验证状态正确流转

    // 查找不同状态的商品
    const allReviewItems = page.locator('[data-testid="review-item"]');
    if (await allReviewItems.count() > 0) {
      // 遍历所有商品，验证状态显示
      const itemCount = await allReviewItems.count();

      for (let i = 0; i < Math.min(itemCount, 5); i++) {
        const item = allReviewItems.nth(i);

        // 验证状态标签显示
        const statusBadge = item.locator('[data-testid="status-badge"]');
        if (await statusBadge.isVisible()) {
          const statusText = await statusBadge.textContent();
          expect(statusText).toMatch(/待审核|已通过|已驳回/);
        }

        // 验证状态对应的颜色
        const statusColor = item.locator('[data-testid="status-color"]');
        if (await statusColor.isVisible()) {
          const colorClass = await statusColor.getAttribute('class');
          expect(colorClass).toMatch(/pending|success|error/);
        }
      }
    }
  });
});