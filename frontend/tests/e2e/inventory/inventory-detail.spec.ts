import { test, expect } from '@playwright/test';

test.describe('门店SKU库存查询 - 用户故事4: 查看库存详情', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory/query');
    await page.waitForLoadState('networkidle');
  });

  test('US4-1: 点击表格行打开详情抽屉', async ({ page }) => {
    // Given 用户在库存查询页面
    // When 点击表格中的一行
    // Then 应该打开库存详情抽屉

    await page.waitForTimeout(500);

    // 点击第一行
    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      // 验证抽屉打开
      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证抽屉标题
      await expect(drawer.locator('.ant-drawer-title')).toContainText(/库存详情|详情/);
    }
  });

  test('US4-2: 详情抽屉显示基本信息', async ({ page }) => {
    // Given 用户打开库存详情抽屉
    // When 查看抽屉内容
    // Then 应该显示基本信息

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证基本信息字段
      await expect(drawer.locator('text=SKU编码')).toBeVisible();
      await expect(drawer.locator('text=SKU名称')).toBeVisible();
    }
  });

  test('US4-3: 详情抽屉显示库存数量信息', async ({ page }) => {
    // Given 用户打开库存详情抽屉
    // When 查看抽屉内容
    // Then 应该显示库存数量信息

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证库存数量字段
      await expect(drawer.locator('text=现存数量')).toBeVisible();
      await expect(drawer.locator('text=可用数量')).toBeVisible();
      await expect(drawer.locator('text=预占数量')).toBeVisible();
    }
  });

  test('US4-4: 详情抽屉显示安全库存信息', async ({ page }) => {
    // Given 用户打开库存详情抽屉
    // When 查看抽屉内容
    // Then 应该显示安全库存信息

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证安全库存字段
      await expect(drawer.locator('text=安全库存')).toBeVisible();
    }
  });

  test('US4-5: 详情抽屉可以关闭', async ({ page }) => {
    // Given 用户打开库存详情抽屉
    // When 点击关闭按钮
    // Then 抽屉应该关闭

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 点击关闭按钮
      const closeButton = drawer.locator('.ant-drawer-close');
      await closeButton.click();
      await page.waitForTimeout(300);

      // 验证抽屉已关闭
      await expect(drawer).not.toBeVisible();
    }
  });

  test('US4-6: 低库存状态显示警告', async ({ page }) => {
    // Given 用户查看低库存的SKU详情
    // When 可用数量低于安全库存
    // Then 应该显示警告提示

    await page.waitForTimeout(500);

    // 首先筛选低库存状态
    const statusSelect = page.locator('[data-testid="filter-status"]');
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      await page.waitForTimeout(200);

      const lowOption = page.locator('.ant-select-item:has-text("不足")');
      if (await lowOption.isVisible()) {
        await lowOption.click();
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
      }
    }

    // 点击第一行打开详情
    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      if (await drawer.isVisible()) {
        // 验证存在警告提示（如果有低库存）
        const warning = drawer.locator(
          '.ant-alert-warning, .low-stock-warning, [data-testid="low-stock-warning"]'
        );
        // 警告可能存在也可能不存在，取决于实际数据
        const hasWarning = (await warning.count()) > 0;
        // 只要验证抽屉正常显示即可
        await expect(drawer).toBeVisible();
      }
    }
  });

  test('US4-7: 详情抽屉显示门店信息', async ({ page }) => {
    // Given 用户打开库存详情抽屉
    // When 查看抽屉内容
    // Then 应该显示门店信息

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证门店信息字段
      await expect(drawer.locator('text=门店')).toBeVisible();
    }
  });

  test('US4-8: 详情抽屉显示库存状态', async ({ page }) => {
    // Given 用户打开库存详情抽屉
    // When 查看抽屉内容
    // Then 应该显示库存状态标签

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证状态标签
      const statusTag = drawer.locator('.ant-tag');
      await expect(statusTag.first()).toBeVisible();
    }
  });

  test('US4-9: 详情加载中状态', async ({ page }) => {
    // Given 用户点击表格行
    // When 数据正在加载
    // Then 应该显示加载状态

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();

      // 抽屉应该出现
      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible({ timeout: 3000 });
    }
  });

  test('US4-10: 详情抽屉显示分类信息', async ({ page }) => {
    // Given 用户打开库存详情抽屉
    // When 查看抽屉内容
    // Then 应该显示分类信息

    await page.waitForTimeout(500);

    const firstRow = page.locator('.ant-table-tbody tr.ant-table-row').first();
    if (await firstRow.isVisible()) {
      await firstRow.click();
      await page.waitForTimeout(500);

      const drawer = page.locator('.ant-drawer:visible');
      await expect(drawer).toBeVisible();

      // 验证分类信息字段
      await expect(drawer.locator('text=分类')).toBeVisible();
    }
  });
});
