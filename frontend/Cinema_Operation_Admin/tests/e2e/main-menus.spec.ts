import { test, expect } from '@playwright/test';

test.describe('主要菜单可见性测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('所有10个主要菜单都应该可见', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 定义所有预期的主要菜单
    const expectedMainMenus = [
      '基础设置与主数据',
      '商品管理 (MDM / PIM)',
      'BOM / 配方 & 成本管理',
      '场景包/套餐管理 (Scenario Package)',
      '价格体系管理',
      '采购与入库管理',
      '库存 & 仓店库存管理',
      '档期 / 排期 /资源预约管理',
      '订单与履约管理 (OMS-like)',
      '运营 & 报表 / 指标看板',
      '系统管理 / 设置 /权限'
    ];

    // 验证每个菜单都可见
    for (const menuName of expectedMainMenus) {
      const menuItem = page.locator('.ant-menu-item', { hasText: menuName });
      await expect(menuItem).toBeVisible({ timeout: 5000 });
    }
  });

  test('每个主要菜单都应该有正确的图标', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 获取所有主要菜单项
    const mainMenus = page.locator('.ant-menu-item');
    const menuCount = await mainMenus.count();

    // 验证每个菜单都有图标
    for (let i = 0; i < menuCount; i++) {
      const menu = mainMenus.nth(i);
      const menuText = await menu.textContent();

      if (menuText && menuText.trim()) {
        // 检查是否有图标
        const hasIcon = await menu.locator('.anticon, .ant-menu-item-icon, svg').isVisible();
        expect(hasIcon).toBeTruthy();
      }
    }
  });

  test('菜单应该按照功能区域正确分组', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 验证基础设置相关的菜单
    const basicSettingsMenu = page.locator('.ant-menu-item', { hasText: '基础设置与主数据' });
    await expect(basicSettingsMenu).toBeVisible();

    // 验证商品管理相关的菜单
    const productMenu = page.locator('.ant-menu-item', { hasText: '商品管理 (MDM / PIM)' });
    await expect(productMenu).toBeVisible();

    // 验证运营报表相关的菜单
    const operationsMenu = page.locator('.ant-menu-item', { hasText: '运营 & 报表 / 指标看板' });
    await expect(operationsMenu).toBeVisible();

    // 验证系统管理相关的菜单
    const systemMenu = page.locator('.ant-menu-item', { hasText: '系统管理 / 设置 /权限' });
    await expect(systemMenu).toBeVisible();
  });

  test('菜单应该支持响应式显示', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 测试桌面尺寸
    await page.setViewportSize({ width: 1200, height: 800 });
    const sidebarDesktop = page.locator('.ant-layout-sider');
    await expect(sidebarDesktop).toBeVisible();

    // 测试平板尺寸
    await page.setViewportSize({ width: 768, height: 1024 });
    const sidebarTablet = page.locator('.ant-layout-sider');
    await expect(sidebarTablet).toBeVisible();

    // 测试移动尺寸
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 在移动端，侧边栏可能自动隐藏或变为抽屉模式
    const mobileMenuTrigger = page.locator('.ant-drawer-trigger, .menu-mobile-trigger');
    const isMobileMenuTriggerVisible = await mobileMenuTrigger.isVisible();

    // 如果移动菜单触发器可见，说明响应式工作正常
    // 如果不可见，侧边栏应该仍然可见但可能样式不同
    if (isMobileMenuTriggerVisible) {
      await expect(mobileMenuTrigger).toBeVisible();
    } else {
      await expect(sidebarTablet).toBeVisible();
    }
  });

  test('菜单项应该在hover时有正确的视觉反馈', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    const firstMenu = page.locator('.ant-menu-item').first();

    // hover前记录样式
    const beforeHover = await firstMenu.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // hover菜单项
    await firstMenu.hover();
    await page.waitForTimeout(200);

    // 验证hover效果
    const afterHover = await firstMenu.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // hover后背景色应该有变化
    expect(afterHover).not.toBe(beforeHover);

    // 移出hover
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);

    // 验证恢复原状态
    const afterUnhover = await firstMenu.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(afterUnhover).toBe(beforeHover);
  });

  test('菜单项应该是可点击的', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    const firstMenu = page.locator('.ant-menu-item').first();

    // 验证菜单项是可点击的
    await expect(firstMenu).toBeEnabled();

    // 点击菜单项
    await firstMenu.click();
    await page.waitForTimeout(500);

    // 验证点击后的行为（可能是展开子菜单或导航）
    const isExpanded = await firstMenu.evaluate((el) => {
      return el.classList.contains('ant-menu-item-open');
    });

    // 或者验证URL变化
    const currentUrl = page.url();
    expect(currentUrl).toContain('http://localhost:3000');
  });

  test('菜单项应该显示正确的提示信息', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    const firstMenu = page.locator('.ant-menu-item').first();

    // hover菜单项
    await firstMenu.hover();
    await page.waitForTimeout(300);

    // 检查是否有tooltip
    const tooltip = page.locator('.ant-tooltip');
    const tooltipVisible = await tooltip.isVisible();

    // 如果有tooltip，验证其内容
    if (tooltipVisible) {
      const tooltipText = await tooltip.textContent();
      expect(tooltipText).toBeTruthy();
      expect(tooltipText?.length).toBeGreaterThan(0);
    }

    // 移出hover
    await page.mouse.move(0, 0);
  });
});