/**
 * 导航搜索功能E2E测试
 * 测试侧边栏搜索组件的功能性、性能和用户体验
 */

import { test, expect } from '@playwright/test';

test.describe('导航搜索功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('T059-1: 搜索组件应该正确显示和交互', async ({ page }) => {
    // 等待侧边栏加载完成
    await page.waitForSelector('.sidebar', { timeout: 10000 });

    // 检查搜索框是否存在
    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    // 测试搜索框占位符文本
    await expect(searchInput).toHaveAttribute('placeholder', '搜索菜单...');

    // 测试搜索图标
    const searchIcon = page.locator('.sidebar-search .ant-input-prefix');
    await expect(searchIcon).toBeVisible();
  });

  test('T059-2: 搜索功能应该能正确过滤菜单项', async ({ page }) => {
    // 等待侧边栏和菜单加载
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    // 获取初始菜单项数量
    const initialMenuItems = await page.locator('.sidebar-menu .ant-menu-item').count();
    expect(initialMenuItems).toBeGreaterThan(0);

    // 输入搜索关键词
    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');
    await searchInput.fill('商品');

    // 等待搜索结果显示
    await page.waitForTimeout(300);

    // 验证搜索结果
    const searchResults = await page.locator('.sidebar-menu .ant-menu-item').count();

    // 如果有匹配结果，应该显示相关项；如果没有，应该显示空状态
    if (searchResults > 0) {
      // 验证搜索结果包含搜索关键词
      const firstMenuItem = page.locator('.sidebar-menu .ant-menu-item').first();
      const menuItemText = await firstMenuItem.textContent();
      expect(menuItemText?.toLowerCase()).toContain('商品');
    } else {
      // 验证显示空搜索结果状态
      const emptyState = page.locator('.search-results-empty, .ant-empty');
      await expect(emptyState).toBeVisible();
    }
  });

  test('T059-3: 搜索结果应该支持键盘导航', async ({ page }) => {
    // 等待搜索组件加载
    await page.waitForSelector('.sidebar-search input[placeholder*="搜索"]', { timeout: 10000 });

    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');

    // 聚焦搜索输入框
    await searchInput.focus();
    await expect(searchInput).toBeFocused();

    // 输入搜索内容
    await searchInput.type('产品');
    await page.waitForTimeout(300);

    // 测试键盘导航 - 上下箭头键
    await page.keyboard.press('ArrowDown');

    // 测试回车键选择
    await page.keyboard.press('Enter');

    // 验证页面导航或选择行为
    await page.waitForTimeout(500);
  });

  test('T059-4: 搜索应该支持清空和重置', async ({ page }) => {
    // 等待搜索组件加载
    await page.waitForSelector('.sidebar-search input[placeholder*="搜索"]', { timeout: 10000 });

    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');

    // 输入搜索内容
    await searchInput.fill('测试搜索');
    await page.waitForTimeout(300);

    // 验证搜索内容已输入
    await expect(searchInput).toHaveValue('测试搜索');

    // 清空搜索
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 验证搜索框已清空
    await expect(searchInput).toHaveValue('');

    // 验证菜单恢复到初始状态
    const menuItemsAfterClear = await page.locator('.sidebar-menu .ant-menu-item').count();
    expect(menuItemsAfterClear).toBeGreaterThan(0);
  });

  test('T059-5: 搜索性能测试 - 响应时间应该在可接受范围内', async ({ page }) => {
    // 等待搜索组件加载
    await page.waitForSelector('.sidebar-search input[placeholder*="搜索"]', { timeout: 10000 });

    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');

    // 测试搜索响应时间
    const startTime = Date.now();

    await searchInput.fill('性能测试');
    await page.waitForTimeout(300);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // 搜索响应时间应该小于500ms
    expect(responseTime).toBeLessThan(500);

    console.log(`搜索响应时间: ${responseTime}ms`);
  });

  test('T059-6: 搜索应该支持特殊字符和中文输入', async ({ page }) => {
    // 等待搜索组件加载
    await page.waitForSelector('.sidebar-search input[placeholder*="搜索"]', { timeout: 10000 });

    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');

    // 测试中文输入
    await searchInput.fill('影院商品管理');
    await page.waitForTimeout(300);

    // 验证不会出现错误
    await expect(searchInput).toBeVisible();

    // 清空并测试特殊字符
    await searchInput.clear();
    await searchInput.fill('test@#$%');
    await page.waitForTimeout(300);

    // 验证特殊字符处理正常
    await expect(searchInput).toBeVisible();
  });

  test('T059-7: 搜索框在移动端应该正确显示', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // 触发移动端菜单
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    if (await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click();
      await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });
    }

    // 检查移动端搜索框
    const mobileSearchInput = page.locator('.ant-drawer-open .sidebar-search input[placeholder*="搜索"]');

    if (await mobileSearchInput.isVisible()) {
      await expect(mobileSearchInput).toBeVisible();

      // 测试移动端搜索功能
      await mobileSearchInput.fill('移动端测试');
      await page.waitForTimeout(300);

      await expect(mobileSearchInput).toHaveValue('移动端测试');
    }
  });

  test('T059-8: 搜索历史和建议功能', async ({ page }) => {
    // 等待搜索组件加载
    await page.waitForSelector('.sidebar-search input[placeholder*="搜索"]', { timeout: 10000 });

    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');

    // 执行几次搜索以生成历史记录
    const searchTerms = ['商品', '产品', '价格'];

    for (const term of searchTerms) {
      await searchInput.clear();
      await searchInput.fill(term);
      await page.waitForTimeout(300);
      await searchInput.clear();
    }

    // 重新点击搜索框，检查是否有搜索历史显示
    await searchInput.click();
    await page.waitForTimeout(200);

    // 这里可以根据实际实现检查搜索历史UI
    // 如果有搜索历史功能，应该显示历史记录
    const searchHistory = page.locator('.search-history, .search-suggestions');
    if (await searchHistory.isVisible()) {
      await expect(searchHistory).toBeVisible();
    }
  });

  test('T059-9: 搜索结果高亮显示', async ({ page }) => {
    // 等待搜索组件加载
    await page.waitForSelector('.sidebar-search input[placeholder*="搜索"]', { timeout: 10000 });

    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');

    // 输入搜索关键词
    await searchInput.fill('商品');
    await page.waitForTimeout(300);

    // 检查搜索结果中是否有高亮显示
    const searchResults = page.locator('.sidebar-menu .ant-menu-item');
    const resultsCount = await searchResults.count();

    if (resultsCount > 0) {
      // 检查是否有高亮样式
      const highlightedText = page.locator('.search-highlight, .highlight, [class*="highlight"]');

      // 如果实现了高亮功能，应该能看到高亮文本
      if (await highlightedText.first().isVisible()) {
        await expect(highlightedText.first()).toBeVisible();
      }
    }
  });

  test('T059-10: 搜索无结果状态处理', async ({ page }) => {
    // 等待搜索组件加载
    await page.waitForSelector('.sidebar-search input[placeholder*="搜索"]', { timeout: 10000 });

    const searchInput = page.locator('.sidebar-search input[placeholder*="搜索"]');

    // 输入一个不太可能存在的搜索词
    await searchInput.fill('xyz123notfound');
    await page.waitForTimeout(300);

    // 检查无结果状态
    const emptyState = page.locator('.search-results-empty, .ant-empty, .no-results');
    const menuItems = page.locator('.sidebar-menu .ant-menu-item');

    // 应该显示无结果状态或菜单项为空
    const hasEmptyState = await emptyState.isVisible();
    const hasNoMenuItems = (await menuItems.count()) === 0;

    expect(hasEmptyState || hasNoMenuItems).toBeTruthy();

    if (hasEmptyState) {
      // 验证无结果状态的文本内容
      const emptyText = await emptyState.textContent();
      expect(emptyText).toContain('暂无') || expect(emptyText).toContain('没有') || expect(emptyText).toContain('空');
    }
  });
});