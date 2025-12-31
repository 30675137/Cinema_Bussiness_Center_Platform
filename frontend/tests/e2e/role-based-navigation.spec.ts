/**
 * 基于角色的菜单可见性E2E测试
 * 测试不同权限用户只能看到被授权的菜单项
 */

import { test, expect } from '@playwright/test';

// 测试数据
const ADMIN_USER = {
  username: 'admin',
  password: 'admin',
  expectedMenuCount: 5, // 5个一级菜单
  expectedMenus: [
    '基础设置与主数据',
    '商品管理',
    '库存 & 仓店库存管理',
    '价格体系管理',
    '运营 & 报表 / 指标看板',
  ],
};

const OPERATOR_USER = {
  username: 'operator',
  password: 'operator',
  expectedMenuCount: 2, // 2个一级菜单
  expectedMenus: ['商品管理', '库存 & 仓店库存管理'],
};

const LIMITED_USER = {
  username: 'viewer',
  password: 'viewer',
  expectedMenuCount: 0, // 无权限
  expectedMenus: [],
};

test.describe('基于角色的菜单可见性', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页
    await page.goto('/');

    // 检查是否在登录页
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('h1')).toContainText('登录');
  });

  test('管理员用户应该能看到所有菜单', async ({ page }) => {
    // 登录为管理员
    await page.fill('input[data-testid="username-input"]', ADMIN_USER.username);
    await page.fill('input[data-testid="password-input"]', ADMIN_USER.password);
    await page.click('button[data-testid="login-button"]');

    // 等待登录完成和导航菜单加载
    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });
    await page.waitForSelector('[data-testid="sidebar-menu"]', { timeout: 3000 });

    // 验证菜单数量
    const menuItems = await page.locator('[data-testid="sidebar-menu-item"]');
    await expect(menuItems).toHaveCount(ADMIN_USER.expectedMenuCount);

    // 验证具体的菜单项
    for (const menuName of ADMIN_USER.expectedMenus) {
      await expect(page.locator(`[data-testid="menu-item-${menuName}"]`)).toBeVisible();
    }

    // 验证管理员特有的菜单
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).toBeVisible();

    // 验证用户信息显示
    await expect(page.locator('[data-testid="user-info"]')).toContainText('系统管理员');
  });

  test('业务操作员用户应该只看到被授权的菜单', async ({ page }) => {
    // 登录为业务操作员
    await page.fill('input[data-testid="username-input"]', OPERATOR_USER.username);
    await page.fill('input[data-testid="password-input"]', OPERATOR_USER.password);
    await page.click('button[data-testid="login-button"]');

    // 等待登录完成
    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证菜单数量
    const menuItems = await page.locator('[data-testid="sidebar-menu-item"]');
    await expect(menuItems).toHaveCount(OPERATOR_USER.expectedMenuCount);

    // 验证可访问的菜单
    for (const menuName of OPERATOR_USER.expectedMenus) {
      await expect(page.locator(`[data-testid="menu-item-${menuName}"]`)).toBeVisible();
    }

    // 验证不应该看到的菜单
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).not.toBeVisible();

    // 验证用户信息显示
    await expect(page.locator('[data-testid="user-info"]')).toContainText('业务操作员');
  });

  test('无权限用户应该看不到任何菜单', async ({ page }) => {
    // 登录为受限用户
    await page.fill('input[data-testid="username-input"]', LIMITED_USER.username);
    await page.fill('input[data-testid="password-input"]', LIMITED_USER.password);
    await page.click('button[data-testid="login-button"]');

    // 等待登录完成
    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证菜单数量为0
    const menuItems = await page.locator('[data-testid="sidebar-menu-item"]');
    await expect(menuItems).toHaveCount(0);

    // 验证权限不足提示
    await expect(page.locator('[data-testid="permission-denied-message"]')).toBeVisible();
  });

  test('二级菜单权限控制', async ({ page }) => {
    // 登录为管理员
    await page.fill('input[data-testid="username-input"]', ADMIN_USER.username);
    await page.fill('input[data-testid="password-input"]', ADMIN_USER.password);
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 点击商品管理菜单
    await page.click('[data-testid="menu-item-商品管理"]');

    // 验证二级菜单显示
    await expect(page.locator('[data-testid="submenu-商品管理"]')).toBeVisible();

    // 验证所有二级菜单项
    const subMenuItems = await page.locator('[data-testid="submenu-item"]');
    await expect(subMenuItems).toHaveCountGreaterThan(0);

    // 验证具体的二级菜单项
    await expect(page.locator('[data-testid="submenu-item-SPU 管理"]')).toBeVisible();
    await expect(page.locator('[data-testid="submenu-item-SKU 管理"]')).toBeVisible();
    await expect(page.locator('[data-testid="submenu-item-素材库管理"]')).toBeVisible();
  });

  test('菜单展开和收起功能', async ({ page }) => {
    // 登录为管理员
    await page.fill('input[data-testid="username-input"]', ADMIN_USER.username);
    await page.fill('input[data-testid="password-input"]', ADMIN_USER.password);
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证侧边栏默认是展开状态
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).not.toHaveClass(/collapsed/);

    // 点击收起按钮
    await page.click('[data-testid="sidebar-toggle"]');

    // 验证侧边栏收起
    await expect(sidebar).toHaveClass(/collapsed/);

    // 验证菜单项显示为图标模式
    const menuItems = page.locator('[data-testid="sidebar-menu-item"]');
    const firstMenuItem = menuItems.first();

    // 验证菜单名称不显示，只显示图标
    await expect(firstMenuItem.locator('[data-testid="menu-text"]')).not.toBeVisible();
    await expect(firstMenuItem.locator('[data-testid="menu-icon"]')).toBeVisible();

    // 再次点击展开
    await page.click('[data-testid="sidebar-toggle"]');

    // 验证侧边栏展开
    await expect(sidebar).not.toHaveClass(/collapsed/);

    // 验证菜单名称重新显示
    await expect(firstMenuItem.locator('[data-testid="menu-text"]')).toBeVisible();
  });

  test('响应式菜单适配', async ({ page }) => {
    // 登录为管理员
    await page.fill('input[data-testid="username-input"]', ADMIN_USER.username);
    await page.fill('input[data-testid="password-input"]', ADMIN_USER.password);
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 模拟移动设备视图
    await page.setViewportSize({ width: 375, height: 667 });

    // 验证侧边栏自动隐藏
    const sidebar = page.locator('[data-testid="sidebar"]');
    await expect(sidebar).toHaveCSS('transform', 'translateX(-256px)');

    // 点击移动端菜单按钮
    await page.click('[data-testid="mobile-menu-toggle"]');

    // 验证侧边栏显示
    await expect(sidebar).toHaveCSS('transform', 'translateX(0px)');

    // 验证遮罩层显示
    await expect(page.locator('[data-testid="sidebar-overlay"]')).toBeVisible();

    // 点击遮罩层关闭菜单
    await page.click('[data-testid="sidebar-overlay"]');

    // 验证侧边栏隐藏
    await expect(sidebar).toHaveCSS('transform', 'translateX(-256px)');
  });

  test('菜单高亮和激活状态', async ({ page }) => {
    // 登录为管理员
    await page.fill('input[data-testid="username-input"]', ADMIN_USER.username);
    await page.fill('input[data-testid="password-input"]', ADMIN_USER.password);
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 点击商品管理菜单
    await page.click('[data-testid="menu-item-商品管理"]');

    // 验证商品管理菜单处于激活状态
    await expect(page.locator('[data-testid="menu-item-商品管理"]')).toHaveClass(/active/);

    // 验证其他菜单不处于激活状态
    await expect(page.locator('[data-testid="menu-item-库存 & 仓店库存管理"]')).not.toHaveClass(
      /active/
    );

    // 导航到SPU管理页面
    await page.click('[data-testid="submenu-item-SPU 管理"]');

    // 验证商品管理菜单和SPU管理菜单都处于激活状态
    await expect(page.locator('[data-testid="menu-item-商品管理"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="submenu-item-SPU 管理"]')).toHaveClass(/active/);
  });
});
