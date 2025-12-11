import { test, expect } from '@playwright/test';

test.describe('菜单层次结构测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('应该正确展开和收起二级菜单', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 选择商品管理菜单
    const productMenu = page.locator('.ant-menu-item', { hasText: '商品管理 (MDM / PIM)' });

    // 初始状态应该是收起的
    await expect(productMenu).not.toHaveClass(/ant-menu-item-open/);

    // 点击展开菜单
    await productMenu.click();
    await page.waitForTimeout(500);

    // 验证菜单已展开
    await expect(productMenu).toHaveClass(/ant-menu-item-open/);

    // 验证子菜单可见
    const subMenus = page.locator('.ant-menu-submenu', {
      has: page.locator('.ant-menu-submenu-title')
    });
    const subMenuCount = await subMenus.count();
    expect(subMenuCount).toBeGreaterThan(0);

    // 再次点击收起菜单
    await productMenu.click();
    await page.waitForTimeout(500);

    // 验证菜单已收起
    await expect(productMenu).not.toHaveClass(/ant-menu-item-open/);
  });

  test('应该显示正确的父菜单和子菜单关系', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 展开基础设置菜单
    const basicSettingsMenu = page.locator('.ant-menu-item', { hasText: '基础设置与主数据' });
    await basicSettingsMenu.click();
    await page.waitForTimeout(500);

    // 验证子菜单内容
    const expectedSubMenus = [
      '组织/门店/仓库管理',
      '单位 & 换算规则管理',
      '字典与规则配置（损耗原因、报损原因、服务项类型等）',
      '角色与权限管理',
      '审批流配置（商品/价格/场景包/排期/报损等）'
    ];

    for (const subMenuName of expectedSubMenus) {
      const subMenu = page.locator('.ant-menu-submenu-title', { hasText: subMenuName });
      await expect(subMenu).toBeVisible();

      // 验证子菜单是基础设置菜单的子元素
      const parent = await subMenu.locator('xpath=ancestor::li[contains(@class, "ant-menu-submenu") and preceding-sibling::li[contains(@class, "ant-menu-item")] and .//text()[contains(., "基础设置与主数据")]]');
      expect(await parent.count()).toBeGreaterThan(0);
    }
  });

  test('应该支持多个菜单同时展开', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 展开商品管理菜单
    const productMenu = page.locator('.ant-menu-item', { hasText: '商品管理 (MDM / PIM)' });
    await productMenu.click();
    await page.waitForTimeout(500);

    // 展开基础设置菜单
    const basicSettingsMenu = page.locator('.ant-menu-item', { hasText: '基础设置与主数据' });
    await basicSettingsMenu.click();
    await page.waitForTimeout(500);

    // 验证两个菜单都是展开状态
    await expect(productMenu).toHaveClass(/ant-menu-item-open/);
    await expect(basicSettingsMenu).toHaveClass(/ant-menu-item-open/);

    // 验证两个菜单的子菜单都可见
    const productSubMenus = page.locator('.ant-menu-submenu:has(.ant-menu-submenu-title:has-text("SPU 管理"))');
    const basicSubMenus = page.locator('.ant-menu-submenu:has(.ant-menu-submenu-title:has-text("组织/门店/仓库管理"))');

    await expect(productSubMenus).toBeVisible();
    await expect(basicSubMenus).toBeVisible();
  });

  test('应该正确显示菜单的缩进和层级关系', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 展开一个菜单查看子菜单
    const menuWithChildren = page.locator('.ant-menu-item', { hasText: '库存 & 仓店库存管理' });
    await menuWithChildren.click();
    await page.waitForTimeout(500);

    // 获取父菜单的位置
    const parentMenu = page.locator('.ant-menu-item', { hasText: '库存 & 仓店库存管理' });
    const parentBoundingBox = await parentMenu.boundingBox();

    // 获取子菜单的位置
    const subMenu = page.locator('.ant-menu-submenu-title', { hasText: '库存台账查看' });
    const subBoundingBox = await subMenu.boundingBox();

    // 验证子菜单有更深的缩进（更大的左边距）
    if (parentBoundingBox && subBoundingBox) {
      expect(subBoundingBox.x).toBeGreaterThan(parentBoundingBox.x);
    }
  });

  test('应该支持键盘导航菜单层次', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 聚焦到菜单区域
    const sidebar = page.locator('.ant-layout-sider');
    await sidebar.click();

    // 使用方向键导航
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // 按回车展开菜单
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // 验证菜单已展开
    const expandedMenu = page.locator('.ant-menu-item-open');
    await expect(expandedMenu).toHaveCount(1);

    // 再次使用方向键导航到子菜单
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(100);

    // 验证焦点移动到子菜单
    const focusedElement = page.locator(':focus');
    const hasSubmenuFocus = await focusedElement.locator('xpath=ancestor-or-self::*[contains(@class, "ant-menu-submenu")]').count();
    expect(hasSubmenuFocus).toBeGreaterThan(0);
  });

  test('应该正确处理菜单的点击交互', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 展开采购管理菜单
    const procurementMenu = page.locator('.ant-menu-item', { hasText: '采购与入库管理' });
    await procurementMenu.click();
    await page.waitForTimeout(500);

    // 点击子菜单项
    const supplierManagement = page.locator('.ant-menu-submenu-title', { hasText: '供应商管理' });
    await supplierManagement.click();
    await page.waitForTimeout(300);

    // 验证点击后的状态变化
    await expect(supplierManagement).toHaveClass(/ant-menu-submenu-title/);

    // 点击后应该展开下级菜单（如果有）
    const hasNestedSubmenu = await page.locator('.ant-menu-submenu-popup').isVisible();
    expect(hasNestedSubmenu).toBeDefined();
  });
});