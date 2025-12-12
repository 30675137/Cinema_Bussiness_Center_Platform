/**
 * 主要菜单可见性测试
 * 验证所有10个主要功能菜单在页面上正确显示
 */

import { test, expect } from '@playwright/test';

test.describe('主要菜单可见性', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待菜单完全加载
    await page.waitForSelector('[data-testid*="main-menu-"]', { timeout: 3000 });
  });

  test('应该显示完整的应用标题', async ({ page }) => {
    const appTitle = page.locator('h1, [data-testid="app-title"]');
    await expect(appTitle).toBeVisible();
    await expect(appTitle).toContainText('影院商品管理中台');
  });

  test('应该显示导航栏容器', async ({ page }) => {
    const navigation = page.locator('[data-testid="navigation"]');
    await expect(navigation).toBeVisible();
  });

  test('应该显示基础设置与主数据菜单', async ({ page }) => {
    const basicSettingsMenu = page.locator('[data-testid="menu-basic-settings"]');
    await expect(basicSettingsMenu).toBeVisible();
    await expect(basicSettingsMenu).toContainText('基础设置与主数据');
  });

  test('应该显示商品管理菜单', async ({ page }) => {
    const productMenu = page.locator('[data-testid="menu-product-management"]');
    await expect(productMenu).toBeVisible();
    await expect(productMenu).toContainText('商品管理');
  });

  test('应该显示BOM/配方管理菜单', async ({ page }) => {
    const bomMenu = page.locator('[data-testid="menu-bom-management"]');
    await expect(bomMenu).toBeVisible();
    await expect(bomMenu).toContainText('BOM');
  });

  test('应该显示场景包/套餐管理菜单', async ({ page }) => {
    const scenarioMenu = page.locator('[data-testid="menu-scenario-package"]');
    await expect(scenarioMenu).toBeVisible();
    await expect(scenarioMenu).toContainText('场景包');
  });

  test('应该显示价格体系管理菜单', async ({ page }) => {
    const pricingMenu = page.locator('[data-testid="menu-pricing-system"]');
    await expect(pricingMenu).toBeVisible();
    await expect(pricingMenu).toContainText('价格体系');
  });

  test('应该显示采购与入库管理菜单', async ({ page }) => {
    const procurementMenu = page.locator('[data-testid="menu-procurement"]');
    await expect(procurementMenu).toBeVisible();
    await expect(procurementMenu).toContainText('采购');
  });

  test('应该显示库存管理菜单', async ({ page }) => {
    const inventoryMenu = page.locator('[data-testid="menu-inventory"]');
    await expect(inventoryMenu).toBeVisible();
    await expect(inventoryMenu).toContainText('库存');
  });

  test('应该显示档期/排期管理菜单', async ({ page }) => {
    const schedulingMenu = page.locator('[data-testid="menu-scheduling"]');
    await expect(schedulingMenu).toBeVisible();
    await expect(schedulingMenu).toContainText('排期');
  });

  test('应该显示订单管理菜单', async ({ page }) => {
    const orderMenu = page.locator('[data-testid="menu-order-management"]');
    await orderMenu.toBeVisible();
    await orderMenu.containsText('订单');
  });

  test('应该显示运营报表菜单', async ({ page }) => {
    const operationsMenu = page.locator('[data-testid="menu-operations"]');
    await operationsMenu.toBeVisible();
    await operationsMenu.containsText('运营');
  });

  test('应该显示系统管理菜单', async ({ page }) => {
    const systemMenu = page.locator('[data-testid="menu-system-management"]');
    await systemMenu.toBeVisible();
    await systemMenu.containsText('系统管理');
  });

  test('所有菜单项都应该有唯一的数据测试ID', async ({ page }) => {
    // 检查是否每个菜单项都有正确的data-testid
    const menuItems = page.locator('[data-testid*="menu-"]');
    const menuCount = await menuItems.count();

    // 应该有10个主要菜单
    expect(menuCount).toBeGreaterThanOrEqual(10);

    // 检查每个菜单项都有唯一的data-testid
    const testIds = new Set();
    for (let i = 0; i < menuCount; i++) {
      const menuItem = menuItems.nth(i);
      const testId = await menuItem.getAttribute('data-testid');
      expect(testId).toBeTruthy();
      expect(testIds.has(testId)).toBe(false);
      testIds.add(testId);
    }
  });

  test('菜单项应该按正确的顺序排列', async ({ page }) => {
    const menuContainer = page.locator('[data-testid="main-menu-container"]');
    await menuContainer.toBeVisible();

    // 获取所有菜单项并验证顺序
    const menuItems = menuContainer.locator('[data-testid*="menu-"]');
    const menuCount = await menuItems.count();

    // 验证菜单顺序（可能通过DOM位置或排序属性）
    const expectedOrder = [
      'menu-basic-settings',
      'menu-product-management',
      'menu-bom-management',
      'menu-scenario-package',
      'menu-pricing-system',
      'menu-procurement',
      'menu-inventory',
      'menu-scheduling',
      'menu-order-management',
      'menu-operations',
      'menu-system-management'
    ];

    // 验证前10个菜单项的顺序
    for (let i = 0; i < Math.min(menuCount, expectedOrder.length); i++) {
      const menuItem = menuItems.nth(i);
      const testId = await menuItem.getAttribute('data-testid');
      expect(testId).toBe(expectedOrder[i]);
    }
  });

  test('菜单项应该都有对应的图标', async ({ page }) => {
    const menuItems = page.locator('[data-testid*="menu-"]');
    const menuCount = await menuItems.count();

    for (let i = 0; i < Math.min(menuCount, 10); i++) {
      const menuItem = menuItems.nth(i);
      const icon = menuItem.locator('[data-testid*="menu-icon-"]');
      await expect(icon).toBeVisible();
    }
  });

  test('菜单项应该有合适的间距和对齐', async ({ page }) => {
    const menuContainer = page.locator('[data-testid="main-menu-container"]');
    await menuContainer.toBeVisible();

    // 获取所有菜单项
    const menuItems = menuContainer.locator('[data-testid*="menu-"]');
    const menuCount = await menuItems.count();

    // 验证菜单项之间有一致的间距
    if (menuCount > 1) {
      const firstMenu = menuItems.first();
      const secondMenu = menuItems.nth(1);

      const firstRect = await firstMenu.boundingBox();
      const secondRect = await secondMenu.boundingBox();

      expect(firstRect).toBeTruthy();
      expect(secondRect).toBeTruthy();

      // 验证垂直对齐
      expect(firstRect.y).toBeCloseTo(secondRect.y, 5);
    }
  });

  test('菜单应该响应式布局', async ({ page }) => {
    const menuContainer = page.locator('[data-testid="main-menu-container"]');

    // 桌面端测试
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(menuContainer).toBeVisible();

    // 平板端测试
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(menuContainer).toBeVisible();

    // 移动端测试
    await page.setViewportSize({ width: 375, height: 667 });

    // 在移动端，菜单可能是隐藏的，或者有移动端适配
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.waitForTimeout(300);
      // 验证移动端菜单出现
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('菜单项应该有hover和active状态样式', async ({ page }) => {
    const firstMenuItem = page.locator('[data-testid*="menu-"]').first();

    // 测试hover状态
    await firstMenuItem.hover();

    const hoverStyles = await firstMenuItem.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        cursor: styles.cursor
      };
    });

    expect(hoverStyles.cursor).toBe('pointer');

    // 测试点击激活状态
    await firstMenuItem.click();

    // 如果菜单有子菜单，等待展开
    await page.waitForTimeout(300);

    // 验证active状态
    const isActive = await firstMenuItem.evaluate(el => {
      return el.classList.contains('active') || el.getAttribute('aria-expanded') === 'true';
    });

    expect(isActive).toBeTruthy();
  });
});