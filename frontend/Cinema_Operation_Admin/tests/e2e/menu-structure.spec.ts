import { test, expect } from '@playwright/test';

test.describe('菜单结构展示测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('应该显示完整的10个一级菜单', async ({ page }) => {
    // 等待侧边栏加载完成
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 获取所有一级菜单项
    const mainMenus = await page.locator('.ant-menu-item[data-level="1"]');

    // 验证10个一级菜单
    await expect(mainMenus).toHaveCount(10);

    // 验证具体的菜单名称
    const expectedMenus = [
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

    for (const menuName of expectedMenus) {
      const menuItem = page.locator('.ant-menu-item', { hasText: menuName });
      await expect(menuItem).toBeVisible();
    }
  });

  test('应该显示所有二级子功能页面', async ({ page }) => {
    // 等待侧边栏加载完成
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 点击展开基础设置与主数据菜单
    const basicSettingsMenu = page.locator('.ant-menu-item', { hasText: '基础设置与主数据' });
    await basicSettingsMenu.click();

    // 等待子菜单展开
    await page.waitForTimeout(500);

    // 验证基础设置的二级菜单
    const expectedSubMenus = [
      '组织/门店/仓库管理',
      '单位 & 换算规则管理',
      '字典与规则配置（损耗原因、报损原因、服务项类型等）',
      '角色与权限管理',
      '审批流配置（商品/价格/场景包/排期/报损等）'
    ];

    for (const subMenuName of expectedSubMenus) {
      const subMenuItem = page.locator('.ant-menu-submenu-title', { hasText: subMenuName });
      await expect(subMenuItem).toBeVisible();
    }
  });

  test('应该正确显示菜单图标', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 检查菜单项是否包含图标
    const menuItems = await page.locator('.ant-menu-item[data-level="1"]');
    const count = await menuItems.count();

    for (let i = 0; i < count; i++) {
      const menuItem = menuItems.nth(i);
      const hasIcon = await menuItem.locator('.anticon, .ant-menu-item-icon').isVisible();
      expect(hasIcon).toBeTruthy();
    }
  });

  test('菜单应该具有正确的层级结构', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 验证一级菜单的层级属性
    const mainMenus = page.locator('.ant-menu-item[data-level="1"]');
    const mainMenuCount = await mainMenus.count();
    expect(mainMenuCount).toBe(11); // 包括可能的"首页"菜单

    // 展开一个一级菜单查看子菜单
    const productMenu = page.locator('.ant-menu-item', { hasText: '商品管理 (MDM / PIM)' });
    await productMenu.click();
    await page.waitForTimeout(500);

    // 验证子菜单的层级属性
    const subMenus = page.locator('.ant-menu-item[data-level="2"]');
    const subMenuCount = await subMenus.count();
    expect(subMenuCount).toBeGreaterThan(0);
  });

  test('应该支持菜单的展开和收起', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 找到一个有子菜单的菜单项
    const menuWithChildren = page.locator('.ant-menu-item', { hasText: '商品管理 (MDM / PIM)' });

    // 初始状态下子菜单应该是收起的
    const submenuBefore = page.locator('.ant-menu-submenu', { hasText: 'SPU 管理' });
    const isVisibleBefore = await submenuBefore.isVisible();
    expect(isVisibleBefore).toBeFalsy();

    // 点击展开菜单
    await menuWithChildren.click();
    await page.waitForTimeout(500);

    // 验证子菜单现在可见
    const isVisibleAfter = await submenuBefore.isVisible();
    expect(isVisibleAfter).toBeTruthy();
  });

  test('菜单应该按照正确的顺序显示', async ({ page }) => {
    await page.waitForSelector('.ant-layout-sider', { timeout: 10000 });

    // 获取所有一级菜单项
    const mainMenus = page.locator('.ant-menu-item[data-level="1"]');
    const menuNames = [];

    const count = await mainMenus.count();
    for (let i = 0; i < count; i++) {
      const menuText = await mainMenus.nth(i).textContent();
      if (menuText && menuText.trim()) {
        menuNames.push(menuText.trim());
      }
    }

    // 验证菜单顺序（部分关键菜单的顺序）
    const expectedOrder = [
      '基础设置与主数据',
      '商品管理 (MDM / PIM)',
      '价格体系管理',
      '库存 & 仓店库存管理',
      '系统管理 / 设置 /权限'
    ];

    for (let i = 0; i < expectedOrder.length - 1; i++) {
      const currentIndex = menuNames.indexOf(expectedOrder[i]);
      const nextIndex = menuNames.indexOf(expectedOrder[i + 1]);
      expect(currentIndex).toBeLessThan(nextIndex);
    }
  });
});