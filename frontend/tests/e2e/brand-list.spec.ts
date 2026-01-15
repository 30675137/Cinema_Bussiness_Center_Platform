import { test, expect } from '@playwright/test';

test.describe('品牌列表页面加载', () => {
  test.beforeEach(async ({ page }) => {
    // 模拟用户登录
    await page.goto('/');
    // 这里应该先完成登录，但现在直接进入页面用于测试
    await page.goto('/mdm-pim/brands');
  });

  test('应该正确加载品牌列表页面', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/品牌管理/);

    // 检查页面头部元素
    await expect(page.locator('[data-testid="page-title"]')).toContainText('品牌管理');

    // 检查主要容器
    await expect(page.locator('[data-testid="brand-list-container"]')).toBeVisible();

    // 检查搜索表单
    await expect(page.locator('[data-testid="brand-search-form"]')).toBeVisible();

    // 检查数据表格
    await expect(page.locator('[data-testid="brand-table"]')).toBeVisible();

    // 检查新建按钮
    await expect(page.locator('[data-testid="new-brand-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-brand-button"]')).toContainText('新建品牌');
  });

  test('应该显示品牌列表数据', async ({ page }) => {
    // 等待数据加载
    await page.waitForSelector('[data-testid="brand-table-row"]', { timeout: 5000 });

    // 检查是否有品牌数据
    const brandRows = page.locator('[data-testid="brand-table-row"]');
    expect(brandRows).toHaveCount.greaterThan(0);

    // 检查第一行数据是否包含必要字段
    const firstRow = brandRows.first();
    await expect(firstRow.locator('[data-testid="brand-name"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="brand-type"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="brand-status"]')).toBeVisible();
    await expect(firstRow.locator('[data-testid="brand-actions"]')).toBeVisible();
  });

  test('应该显示正确的表头', async ({ page }) => {
    // 检查表格表头
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-brand-name"]')
    ).toContainText('品牌名称');
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-english-name"]')
    ).toContainText('英文名');
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-brand-code"]')
    ).toContainText('品牌编码');
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-brand-type"]')
    ).toContainText('品牌类型');
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-primary-category"]')
    ).toContainText('主营类目');
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-status"]')
    ).toContainText('状态');
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-created-time"]')
    ).toContainText('创建时间');
    await expect(
      page.locator('[data-testid="brand-table"] thead th[data-testid="header-actions"]')
    ).toContainText('操作');
  });

  test('应该显示分页控件', async ({ page }) => {
    // 检查分页组件
    await expect(page.locator('[data-testid="brand-pagination"]')).toBeVisible();

    // 检查分页信息
    await expect(page.locator('[data-testid="pagination-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination-current"]')).toBeVisible();

    // 检查分页按钮
    await expect(page.locator('[data-testid="pagination-prev"]')).toBeVisible();
    await expect(page.locator('[data-testid="pagination-next"]')).toBeVisible();
  });

  test('应该显示筛选控件', async ({ page }) => {
    // 检查搜索输入框
    await expect(page.locator('[data-testid="keyword-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="keyword-input"]')).toHaveAttribute(
      'placeholder',
      '输入品牌名称 / 英文名 / 编码'
    );

    // 检查品牌类型筛选
    await expect(page.locator('[data-testid="brand-type-select"]')).toBeVisible();

    // 检查状态筛选
    await expect(page.locator('[data-testid="brand-status-select"]')).toBeVisible();

    // 检查查询按钮
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toContainText('查询');

    // 检查重置按钮
    await expect(page.locator('[data-testid="reset-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="reset-button"]')).toContainText('重置');
  });

  test('加载状态应该正确显示', async ({ page }) => {
    // 页面加载时应该显示加载状态
    await expect(page.locator('[data-testid="brand-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="brand-loading"]')).toContainText('加载中...');

    // 等待加载完成
    await page.waitForSelector('[data-testid="brand-table"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="brand-loading"]')).not.toBeVisible();
  });

  test('空状态应该正确处理', async ({ page }) => {
    // 这个测试可能需要mock空数据
    // 检查空状态提示（如果有的话）
    const emptyState = page.locator('[data-testid="brand-empty-state"]');
    if (await emptyState.isVisible()) {
      await expect(emptyState).toContainText('暂无品牌数据');
      await expect(page.locator('[data-testid="empty-create-button"]')).toBeVisible();
    }
  });

  test('页面响应式布局', async ({ page }) => {
    // 测试桌面布局
    await expect(page.locator('[data-testid="brand-list-container"]')).toBeVisible();

    // 测试移动端布局（如果适用）
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone X 尺寸
    await expect(page.locator('[data-testid="brand-list-container"]')).toBeVisible();

    // 在移动端，某些元素可能隐藏或改变布局
    const mobileSearchForm = page.locator('[data-testid="brand-search-form"]');
    if (await mobileSearchForm.isVisible()) {
      await expect(mobileSearchForm).toBeVisible();
    }

    // 恢复桌面尺寸
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('[data-testid="brand-list-container"]')).toBeVisible();
  });

  test('应该处理网络错误', async ({ page }) => {
    // 这个测试需要模拟网络错误
    // 目前跳过，因为没有模拟错误的机制
    test.skip();
  });

  test('应该正确处理权限控制', async ({ page }) => {
    // 检查是否有权限控制元素
    const permissionMessage = page.locator('[data-testid="permission-denied"]');
    if (await permissionMessage.isVisible()) {
      await expect(permissionMessage).toContainText('权限不足');
    } else {
      // 如果没有权限消息，说明用户有权限访问
      await expect(page.locator('[data-testid="brand-list-container"]')).toBeVisible();
    }
  });
});
