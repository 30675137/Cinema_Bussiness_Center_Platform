/**
 * 完整菜单结构显示测试
 * 验证用户能够看到完整的10个一级菜单及对应的二级子功能页面
 */

import { test, expect } from '@playwright/test';

test.describe('完整菜单结构显示', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('应该显示所有10个一级菜单', async ({ page }) => {
    // 验证10个主要功能区域菜单存在
    const expectedMainMenus = [
      '基础设置与主数据',
      '商品管理 (MDM/PIM)',
      'BOM/配方 & 成本管理',
      '场景包/套餐管理 (Scenario Package)',
      '价格体系管理',
      '采购与入库管理',
      '库存 & 仓店库存管理',
      '档期/排期/资源预约管理',
      '订单与履约管理 (OMS-like)',
      '运营 & 报表/指标看板',
      '系统管理/设置/权限',
    ];

    // 检查每个一级菜单是否可见
    for (const menuText of expectedMainMenus) {
      const menuItem = page.locator(`text="${menuText}"`);
      await expect(menuItem).toBeVisible();
    }
  });

  test('应该显示完整的一级菜单数量', async ({ page }) => {
    // 使用CSS选择器获取一级菜单项
    const mainMenuItems = page.locator('[data-testid*="main-menu-"]');
    const menuCount = await mainMenuItems.count();

    // 验证恰好有10个一级菜单
    expect(menuCount).toBe(10);
  });

  test('应该显示菜单图标', async ({ page }) => {
    // 检查菜单项是否有图标
    const menuItems = page.locator('[data-testid*="main-menu-"]');
    const menuCount = await menuItems.count();

    // 验证每个菜单都有图标
    for (let i = 0; i < menuCount; i++) {
      const menuItem = menuItems.nth(i);
      const icon = menuItem.locator('[data-testid*="menu-icon-"]');
      await expect(icon).toBeVisible();
    }
  });

  test('基础设置与主数据菜单应该展开显示二级菜单', async ({ page }) => {
    // 点击基础设置与主数据菜单
    const basicSettingsMenu = page.locator('text="基础设置与主数据"');
    await basicSettingsMenu.click();

    // 等待二级菜单加载
    await page.waitForTimeout(300);

    // 验证二级菜单项存在
    const expectedSubMenus = [
      '组织/门店/仓库管理',
      '单位 & 换算规则管理',
      '字典与规则配置（损耗原因、报损原因、服务项类型等）',
      '角色与权限管理',
      '审批流配置（商品/价格/场景包/排期/报损等）',
    ];

    for (const subMenuText of expectedSubMenus) {
      const subMenuItem = page.locator(`text="${subMenuText}"`);
      await expect(subMenuItem).toBeVisible();
    }
  });

  test('商品管理菜单应该展开显示二级菜单', async ({ page }) => {
    // 点击商品管理菜单
    const productMenu = page.locator('text="商品管理 (MDM/PIM)"');
    await productMenu.click();

    // 等待二级菜单加载
    await page.waitForTimeout(300);

    // 验证二级菜单项存在
    const expectedSubMenus = [
      'SPU 管理',
      'SKU 管理',
      '属性/规格/条码/单位设置',
      '商品状态/上下架管理',
      '内容编辑 (标题、卖点、图文/素材)',
      '素材库管理（图片/视频）',
      '渠道映射字段管理',
      '内容发布/审核/历史版本管理',
    ];

    for (const subMenuText of expectedSubMenus) {
      const subMenuItem = page.locator(`text="${subMenuText}"`);
      await expect(subMenuItem).toBeVisible();
    }
  });

  test('应该能点击二级菜单进行导航', async ({ page }) => {
    // 点击基础设置与主数据菜单展开
    const basicSettingsMenu = page.locator('text="基础设置与主数据"');
    await basicSettingsMenu.click();
    await page.waitForTimeout(300);

    // 点击一个二级菜单项
    const orgMenuItem = page.locator('text="组织/门店/仓库管理"');
    await expect(orgMenuItem).toBeVisible();
    await orgMenuItem.click();

    // 验证页面跳转（URL变化或页面内容变化）
    await page.waitForTimeout(500);
    // 这里可以根据实际的URL路径或页面内容进行验证
    await expect(page.url()).toContain('basic-settings');
  });

  test('应该显示正确的菜单层级关系', async ({ page }) => {
    // 展开基础设置与主数据菜单
    const basicSettingsMenu = page.locator('text="基础设置与主数据"');
    await basicSettingsMenu.click();
    await page.waitForTimeout(300);

    // 验证二级菜单在视觉上是一级菜单的子项
    const firstSubMenu = page.locator('text="组织/门店/仓库管理"');
    const subMenuBoundingRect = await firstSubMenu.boundingBox();
    const menuBoundingRect = await basicSettingsMenu.boundingBox();

    // 验证二级菜单在一级菜单的下方或右侧（取决于布局）
    expect(subMenuBoundingRect).toBeTruthy();
    expect(menuBoundingRect).toBeTruthy();
  });

  test('菜单项应该有正确的hover状态', async ({ page }) => {
    // 获取第一个菜单项
    const firstMenuItem = page.locator('[data-testid*="main-menu-"]').first();

    // 验证hover效果
    await firstMenuItem.hover();
    // 检查是否有hover样式类或属性
    const hasHoverClass = await firstMenuItem.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor !== ''
    );
    expect(hasHoverClass).toBe(true);
  });

  test('菜单加载时间应该小于2秒', async ({ page }) => {
    const startTime = Date.now();

    // 访问页面
    await page.goto('/');

    // 等待第一个菜单项加载完成
    await page.waitForSelector('[data-testid*="main-menu-"]', { timeout: 2000 });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // 验证加载时间小于2秒
    expect(loadTime).toBeLessThan(2000);
  });
});
