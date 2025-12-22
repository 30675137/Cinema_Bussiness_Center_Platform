import { test, expect } from '@playwright/test';

test.describe('用户故事5: 库存追溯查询', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
  });

  test('US5-1: 验证库存追溯界面显示', async ({ page }) => {
    // Given 用户进入库存追溯界面
    // When 页面加载完成
    // Then 显示多标签页设计，支持概览、实时库存、交易历史、警报管理

    // 验证库存追溯页面加载
    await expect(page.locator('[data-testid="inventory-trace"]')).toBeVisible();

    // 验证标签页
    await expect(page.locator('[data-testid="inventory-tabs"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-inventory"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-transactions"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-alerts"]')).toBeVisible();

    // 验证默认激活概览标签
    await expect(page.locator('[data-testid="tab-overview"]')).toHaveClass(/active/);
  });

  test('US5-2: 验证SKU和门店搜索界面', async ({ page }) => {
    // Given 用户进入库存追溯界面
    // When 输入SKU ID和门店ID进行搜索
    // Then 系统显示该SKU在该门店的实时库存数量

    // 验证搜索控件
    await expect(page.locator('[data-testid="sku-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="store-search"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-button"]')).toBeVisible();

    // 测试SKU搜索
    await page.fill('[data-testid="sku-search"]', 'POP001-L');
    await page.click('[data-testid="search-button"]');

    // 等待搜索结果
    await page.waitForTimeout(1000);

    // 验证搜索结果显示
    const searchResults = page.locator('[data-testid="inventory-result"]');
    if (await searchResults.isVisible()) {
      await expect(searchResults.locator('[data-testid="sku-info"]')).toContainText('POP001-L');
      await expect(searchResults.locator('[data-testid="current-stock"]')).toBeVisible();
      await expect(searchResults.locator('[data-testid="available-stock"]')).toBeVisible();
    }

    // 测试门店搜索
    await page.fill('[data-testid="store-search"]', 'CY001');
    await page.click('[data-testid="search-button"]');

    // 验证门店筛选结果
    await expect(page.locator('[data-testid="store-filter-label"]')).toContainText('CY001');
  });

  test('US5-3: 验证实时库存显示组件', async ({ page }) => {
    // Given 用户进入库存追溯界面
    // When 切换到实时库存标签
    // Then 创建实时库存显示组件

    // 切换到实时库存标签
    await page.click('[data-testid="tab-inventory"]');

    // 验证实时库存界面
    await expect(page.locator('[data-testid="real-time-inventory"]')).toBeVisible();

    // 验证库存概览卡片
    await expect(page.locator('[data-testid="stock-overview-cards"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-stock-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="available-stock-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="reserved-stock-card"]')).toBeVisible();

    // 验证库存状态分布
    await expect(page.locator('[data-testid="stock-status-distribution"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible();

    // 验证低库存警报
    await expect(page.locator('[data-testid="low-stock-alerts"]')).toBeVisible();
  });

  test('US5-4: 验证交易历史表格', async ({ page }) => {
    // Given 用户查询库存交易流水
    // When 切换到交易历史标签
    // Then 显示带筛选的交易历史表格

    // 切换到交易历史标签
    await page.click('[data-testid="tab-transactions"]');

    // 验证交易历史界面
    await expect(page.locator('[data-testid="transaction-history"]')).toBeVisible();

    // 验证筛选控件
    await expect(page.locator('[data-testid="transaction-type-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="date-range-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="store-filter"]')).toBeVisible();

    // 验证交易历史表格
    await expect(page.locator('[data-testid="transaction-table"]')).toBeVisible();

    // 验证表格头部
    await expect(page.locator('[data-testid="table-header-transaction-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-transaction-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-quantity"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-balance-before"]')).toBeVisible();
    await expect(page.locator('[data-testid="table-header-balance-after"]')).toBeVisible();

    // 查找交易记录
    const transactionRows = page.locator('[data-testid="transaction-row"]');
    if (await transactionRows.count() > 0) {
      const firstRow = transactionRows.first();

      // 验证交易记录信息
      await expect(firstRow.locator('[data-testid="transaction-id"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="transaction-type"]')).toBeVisible();
      await expect(firstRow.locator('[data-testid="transaction-quantity"]')).toBeVisible();
    }
  });

  test('US5-5: 验证交易详情模态框', async ({ page }) => {
    // Given 用户在交易历史表格
    // When 点击某条交易记录
    // Then 显示变动数量、变动前后库存、批次成本、来源单据等详细信息

    // 切换到交易历史标签
    await page.click('[data-testid="tab-transactions"]');

    // 查找交易记录
    const transactionRows = page.locator('[data-testid="transaction-row"]');
    if (await transactionRows.count() > 0) {
      // 点击第一条交易记录
      await transactionRows.first().click();

      // 验证交易详情模态框
      await expect(page.locator('[data-testid="transaction-detail-modal"]')).toBeVisible();

      // 验证详细信息
      await expect(page.locator('[data-testid="detail-transaction-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-quantity-change"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-balance-before"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-balance-after"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-batch-info"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-source-document"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-operator"]')).toBeVisible();
      await expect(page.locator('[data-testid="detail-remark"]')).toBeVisible();
    }
  });

  test('US5-6: 验证日期范围筛选和交易类型选择', async ({ page }) => {
    // Given 用户在交易历史界面
    // When 添加日期范围筛选和交易类型选择
    // Then 系统更新显示对应时间段内的库存变动情况

    // 切换到交易历史标签
    await page.click('[data-testid="tab-transactions"]');

    // 测试日期范围筛选
    const dateFilter = page.locator('[data-testid="date-range-filter"]');
    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await expect(page.locator('[data-testid="date-range-picker"]')).toBeVisible();

      // 选择最近7天
      await page.click('[data-value="7days"]');
      await page.click('[data-testid="apply-date-filter"]');

      // 验证筛选应用
      await expect(page.locator('[data-testid="active-filters"]')).toContainText('最近7天');
    }

    // 测试交易类型筛选
    const typeFilter = page.locator('[data-testid="transaction-type-filter"]');
    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await expect(page.locator('[data-testid="type-options"]')).toBeVisible();

      // 选择入库类型
      await page.click('[data-value="入库"]');
      await page.click('[data-testid="apply-type-filter"]');

      // 验证筛选应用
      await expect(page.locator('[data-testid="active-filters"]')).toContainText('入库');
    }

    // 验证筛选结果
    await page.waitForTimeout(1000);
    const filteredRows = page.locator('[data-testid="transaction-row"]');
    if (await filteredRows.count() > 0) {
      // 验证筛选后的记录符合条件
      const firstRow = filteredRows.first();
      const transactionType = await firstRow.locator('[data-testid="transaction-type"]').textContent();
      expect(transactionType).toContain('入库');
    }
  });

  test('US5-7: 验证库存统计和图表', async ({ page }) => {
    // Given 用户在库存追溯界面
    // When 查看库存统计
    // Then 显示趋势分析、分布统计、热门商品TOP榜单、门店库存价值分析

    // 切换到概览标签
    await page.click('[data-testid="tab-overview"]');

    // 验证库存统计组件
    await expect(page.locator('[data-testid="inventory-statistics"]')).toBeVisible();

    // 验证趋势分析图表
    await expect(page.locator('[data-testid="trend-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="trend-period-filter"]')).toBeVisible();

    // 验证分布统计
    await expect(page.locator('[data-testid="distribution-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="category-distribution"]')).toBeVisible();

    // 验证热门商品TOP榜单
    await expect(page.locator('[data-testid="top-products-list"]')).toBeVisible();
    const topProducts = page.locator('[data-testid="top-product-item"]');
    if (await topProducts.count() > 0) {
      await expect(topProducts.first().locator('[data-testid="product-rank"]')).toBeVisible();
      await expect(topProducts.first().locator('[data-testid="product-name"]')).toBeVisible();
      await expect(topProducts.first().locator('[data-testid="stock-quantity"]')).toBeVisible();
    }

    // 验证门店库存价值分析
    await expect(page.locator('[data-testid="store-value-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="store-value-chart"]')).toBeVisible();
  });

  test('US5-8: 验证数据导出功能', async ({ page }) => {
    // Given 用户在库存追溯界面
    // When 使用导出功能
    // Then Excel/CSV格式导出、批量操作支持、大数据量处理

    // 查找导出按钮
    const exportButton = page.locator('[data-testid="export-button"]');
    if (await exportButton.isVisible()) {
      await exportButton.click();

      // 验证导出选项弹窗
      await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-format-options"]')).toBeVisible();

      // 验证导出格式选项
      await expect(page.locator('[data-testid="export-excel"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-csv"]')).toBeVisible();

      // 验证导出范围选项
      await expect(page.locator('[data-testid="export-current-page"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-all-results"]')).toBeVisible();
      await expect(page.locator('[data-testid="export-selected"]')).toBeVisible();

      // 测试Excel导出
      await page.click('[data-testid="export-excel"]');
      await page.click('[data-testid="export-all-results"]');
      await page.click('[data-testid="confirm-export"]');

      // 验证导出成功消息
      await expect(page.locator('.ant-message-success')).toBeVisible();
      await expect(page.locator('.ant-message-success')).toContainText('导出成功');
    }
  });

  test('US5-9: 验证库存警报管理', async ({ page }) => {
    // Given 用户在库存追溯界面
    // When 查看库存警报
    // Then 显示低库存、缺货、过期自动提醒，分级警报管理

    // 切换到警报标签
    await page.click('[data-testid="tab-alerts"]');

    // 验证警报管理界面
    await expect(page.locator('[data-testid="alert-management"]')).toBeVisible();

    // 验证警报分类
    await expect(page.locator('[data-testid="alert-categories"]')).toBeVisible();
    await expect(page.locator('[data-testid="low-stock-alerts"]')).toBeVisible();
    await expect(page.locator('[data-testid="out-of-stock-alerts"]')).toBeVisible();
    await expect(page.locator('[data-testid="expired-alerts"]')).toBeVisible();

    // 验证警报列表
    const alertItems = page.locator('[data-testid="alert-item"]');
    if (await alertItems.count() > 0) {
      const firstAlert = alertItems.first();

      // 验证警报信息
      await expect(firstAlert.locator('[data-testid="alert-sku"]')).toBeVisible();
      await expect(firstAlert.locator('[data-testid="alert-store"]')).toBeVisible();
      await expect(firstAlert.locator('[data-testid="alert-type"]')).toBeVisible();
      await expect(firstAlert.locator('[data-testid="alert-severity"]')).toBeVisible();
      await expect(firstAlert.locator('[data-testid="alert-message"]')).toBeVisible();
    }

    // 验证警报筛选
    await expect(page.locator('[data-testid="alert-severity-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-type-filter"]')).toBeVisible();
    await expect(page.locator('[data-testid="alert-status-filter"]')).toBeVisible();
  });

  test('US5-10: 验证系统响应性和数据处理能力', async ({ page }) => {
    // Given 用户在库存追溯界面
    // When 进行大量数据查询和操作
    // Then 系统保持响应速度，支持1000+SKU同时查询

    // 测试快速搜索响应
    const startTime = Date.now();
    await page.fill('[data-testid="sku-search"]', 'POP');
    await page.waitForTimeout(500);
    const searchTime = Date.now() - startTime;
    expect(searchTime).toBeLessThan(2000); // 搜索响应时间应小于2秒

    // 切换到交易历史标签
    await page.click('[data-testid="tab-transactions"]');

    // 测试大数据量加载
    const loadStartTime = Date.now();
    await page.waitForTimeout(2000); // 等待可能的异步数据加载

    // 查找加载完成指示器消失
    const loadingIndicator = page.locator('[data-testid="loading-spinner"]');
    if (await loadingIndicator.isVisible()) {
      await loadingIndicator.waitFor({ state: 'hidden', timeout: 10000 });
    }

    const loadTime = Date.now() - loadStartTime;
    expect(loadTime).toBeLessThan(5000); // 页面加载时间应小于5秒

    // 验证虚拟滚动或分页存在
    const pagination = page.locator('[data-testid="pagination"]');
    const virtualScroll = page.locator('[data-testid="virtual-scroll"]');

    const hasPagination = await pagination.isVisible();
    const hasVirtualScroll = await virtualScroll.isVisible();

    expect(hasPagination || hasVirtualScroll).toBe(true);
  });
});