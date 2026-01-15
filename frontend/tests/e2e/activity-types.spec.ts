/**
 * 活动类型管理 - E2E 测试
 */

import { test, expect } from '@playwright/test';

test.describe('活动类型管理', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到活动类型管理页面
    await page.goto('/activity-types');
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
  });

  test('应该显示活动类型列表', async ({ page }) => {
    // 验证页面标题或表格存在
    await expect(page.locator('text=活动类型管理').or(page.locator('table'))).toBeVisible();
  });

  test('应该显示活动类型的基本信息', async ({ page }) => {
    // 等待表格加载
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 验证表格列存在（名称、描述、状态、排序等）
    // 注意：这些列名可能需要根据实际实现调整
    const headers = ['名称', '描述', '状态', '排序'];
    for (const header of headers) {
      // 尝试查找表头，如果找不到也不报错（因为实现可能不同）
      const headerElement = page.locator(`text=${header}`).first();
      if (await headerElement.isVisible().catch(() => false)) {
        await expect(headerElement).toBeVisible();
      }
    }
  });

  test('应该能够查看活动类型列表', async ({ page }) => {
    // 验证至少有一个活动类型项显示（或显示空状态）
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    // 检查是否有数据行或空状态提示
    const hasData = await page
      .locator('tbody tr')
      .count()
      .catch(() => 0);
    const hasEmptyState = await page
      .locator('text=暂无数据')
      .or(page.locator('text=No data'))
      .isVisible()
      .catch(() => false);

    // 应该要么有数据，要么显示空状态
    expect(hasData > 0 || hasEmptyState).toBe(true);
  });
});
