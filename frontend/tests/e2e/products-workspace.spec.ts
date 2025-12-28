import { test, expect } from '@playwright/test';

test.describe('商品工作台页面测试', () => {
  test.beforeEach(async ({ page }) => {
    // 设置认证token
    await page.addInitScript(() => {
      localStorage.setItem('access_token', 'test-token');
    });

    // 访问商品工作台页面
    await page.goto('/product/workspace');
    await page.waitForLoadState('networkidle');
  });

  test('页面基础元素可见性', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/商品管理中台/);

    // 验证商品工作台主容器
    const workspace = page.locator('[data-testid="products-workspace"]');
    await expect(workspace).toBeVisible();

    // 验证顶部工具栏
    const header = page.locator('[data-testid="workspace-header"]');
    await expect(header).toBeVisible();

    // 验证页面标题文本
    const title = page.locator('[data-testid="workspace-title"]');
    await expect(title).toBeVisible();
    await expect(title).toContainText('商品工作台');

    // 验证商品数量统计
    const productCount = page.locator('[data-testid="product-count"]');
    await expect(productCount).toBeVisible();
  });

  test('工具栏按钮可见性和功能', async ({ page }) => {
    // 验证新建商品按钮
    const createBtn = page.locator('[data-testid="create-product-btn"]');
    await expect(createBtn).toBeVisible();
    await expect(createBtn).toContainText('新建商品');
    await expect(createBtn).toBeEnabled();

    // 验证刷新按钮
    const refreshBtn = page.locator('[data-testid="refresh-btn"]');
    await expect(refreshBtn).toBeVisible();
    await expect(refreshBtn).toContainText('刷新');

    // 验证导出按钮
    const exportBtn = page.locator('[data-testid="export-btn"]');
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toContainText('导出');
  });

  test('主内容区域可见性', async ({ page }) => {
    // 验证主内容区域
    const content = page.locator('[data-testid="workspace-content"]');
    await expect(content).toBeVisible();

    // 验证筛选区域
    const filterSection = page.locator('[data-testid="filter-section"]');
    await expect(filterSection).toBeVisible();
  });

  test('编辑面板默认隐藏', async ({ page }) => {
    // 验证 Drawer 面板默认是隐藏的
    const drawer = page.locator('.ant-drawer');
    
    // Drawer 应该不存在或不可见
    const drawerCount = await drawer.count();
    if (drawerCount > 0) {
      await expect(drawer).not.toBeVisible();
    }
  });

  test('点击新建商品按钮显示编辑面板', async ({ page }) => {
    // 点击新建商品按钮
    const createBtn = page.locator('[data-testid="create-product-btn"]');
    await createBtn.click();

    // 等待 Drawer 出现
    await page.waitForTimeout(500);

    // 验证 Drawer 显示
    const drawer = page.locator('.ant-drawer.ant-drawer-open');
    await expect(drawer).toBeVisible();

    // 验证 Drawer 标题
    const drawerTitle = page.locator('.ant-drawer-header');
    await expect(drawerTitle).toBeVisible();
    await expect(drawerTitle).toContainText('新建商品');
  });

  test('刷新按钮功能', async ({ page }) => {
    const refreshBtn = page.locator('[data-testid="refresh-btn"]');
    
    // 点击刷新按钮
    await refreshBtn.click();

    // 等待加载状态结束
    await page.waitForTimeout(1000);

    // 验证刷新成功的消息（如果有的话）
    const successMessage = page.locator('.ant-message-success');
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText('数据已刷新');
    }
  });

  test('导出按钮功能', async ({ page }) => {
    const exportBtn = page.locator('[data-testid="export-btn"]');
    
    // 点击导出按钮
    await exportBtn.click();

    // 验证提示消息
    await page.waitForTimeout(500);
    const infoMessage = page.locator('.ant-message-info');
    if (await infoMessage.isVisible()) {
      await expect(infoMessage).toContainText('导出功能开发中');
    }
  });

  test('页面响应式布局', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    let workspace = page.locator('[data-testid="products-workspace"]');
    await expect(workspace).toBeVisible();

    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    workspace = page.locator('[data-testid="products-workspace"]');
    await expect(workspace).toBeVisible();

    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    workspace = page.locator('[data-testid="products-workspace"]');
    await expect(workspace).toBeVisible();
  });

  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/product/workspace');
    await page.waitForLoadState('networkidle');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // 验证页面加载时间小于3秒
    expect(loadTime).toBeLessThan(3000);
  });

  test('页面无控制台错误', async ({ page }) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 监听控制台错误和警告
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
      if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });

    // 重新加载页面
    await page.goto('/product/workspace');
    await page.waitForLoadState('networkidle');

    // 等待一段时间确保所有组件都已渲染
    await page.waitForTimeout(2000);

    // 输出错误和警告（如果有）
    if (errors.length > 0) {
      console.log('控制台错误:', errors);
    }
    if (warnings.length > 0) {
      console.log('控制台警告:', warnings);
    }

    // 验证没有控制台错误
    expect(errors.length).toBe(0);
  });

  test('测试商品列表加载', async ({ page }) => {
    // 等待表格加载
    await page.waitForTimeout(1000);

    // 验证表格存在
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    // 验证表格有数据或显示空状态
    const tableBody = page.locator('.ant-table-tbody');
    await expect(tableBody).toBeVisible();
  });

  test('测试点击表格行打开详情', async ({ page }) => {
    // 等待表格加载
    await page.waitForTimeout(1000);

    // 查找表格行
    const firstRow = page.locator('.ant-table-tbody tr').first();
    const rowCount = await page.locator('.ant-table-tbody tr').count();

    if (rowCount > 0) {
      // 点击第一行
      await firstRow.click();

      // 等待 Drawer 显示
      await page.waitForTimeout(500);

      // 验证 Drawer 打开
      const drawer = page.locator('.ant-drawer.ant-drawer-open');
      await expect(drawer).toBeVisible();

      // 验证显示商品详情
      const drawerContent = page.locator('.ant-drawer-body');
      await expect(drawerContent).toBeVisible();
    }
  });

  test('URL路径正确', async ({ page }) => {
    // 验证当前URL
    expect(page.url()).toContain('/product/workspace');
  });
});
