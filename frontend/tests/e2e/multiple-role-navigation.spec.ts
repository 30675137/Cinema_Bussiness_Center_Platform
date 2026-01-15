/**
 * 多重角色权限并集E2E测试
 * 测试具有多个角色的用户可以看到所有角色权限的并集
 */

import { test, expect } from '@playwright/test';

// 多重角色测试数据
const MULTI_ROLE_USERS = [
  {
    username: 'multi-role-admin',
    password: 'multi-role-admin',
    roles: ['超级管理员', '部门管理员', '业务操作员'],
    expectedMenuCount: 5,
    expectedMenus: [
      '基础设置与主数据', // 超级管理员权限
      '商品管理', // 超级管理员 + 部门管理员 + 业务操作员权限
      '库存 & 仓店库存管理', // 超级管理员 + 部门管理员 + 业务操作员权限
      '价格体系管理', // 超级管理员 + 部门管理员权限
      '运营 & 报表 / 指标看板', // 超级管理员权限
    ],
  },
  {
    username: 'multi-role-operator',
    password: 'multi-role-operator',
    roles: ['业务操作员', '审核员'],
    expectedMenuCount: 3,
    expectedMenus: [
      '商品管理', // 业务操作员权限
      '库存 & 仓店库存管理', // 业务操作员权限
      '运营 & 报表 / 指标看板', // 审核员权限
    ],
  },
  {
    username: 'multi-role-manager',
    password: 'multi-role-manager',
    roles: ['部门管理员', '审核员'],
    expectedMenuCount: 4,
    expectedMenus: [
      '商品管理', // 部门管理员权限
      '库存 & 仓店库存管理', // 部门管理员权限
      '价格体系管理', // 部门管理员权限
      '运营 & 报表 / 指标看板', // 审核员权限
    ],
  },
];

// 权限组合测试数据
const PERMISSION_COMBINATIONS = [
  {
    combination: '超级管理员 + 业务操作员',
    user: 'admin-operator-combo',
    password: 'admin-operator-combo',
    uniquePermissions: [
      'admin.access', // 超级管理员特有
      'product.write', // 两者都有，但应只显示一次
      'inventory.read', // 两者都有
      'product.read', // 两者都有
      'pricing.write', // 超级管理员特有
    ],
    accessibleFeatures: [
      '基础设置', // 超级管理员权限
      '商品编辑', // 超级管理员权限
      '库存查看', // 两者权限
      '价格设置', // 超级管理员权限
      '业务操作', // 业务操作员权限
    ],
  },
  {
    combination: '部门管理员 + 审核员',
    user: 'manager-auditor-combo',
    password: 'manager-auditor-combo',
    uniquePermissions: [
      'product.write', // 部门管理员权限
      'inventory.write', // 部门管理员权限
      'pricing.read', // 部门管理员权限
      'audit.review', // 审核员特有
      'report.analyze', // 审核员权限
    ],
    accessibleFeatures: [
      '商品管理', // 部门管理员权限
      '库存管理', // 部门管理员权限
      '价格管理', // 部门管理员权限
      '报表审核', // 审核员权限
      '数据分析', // 审核员权限
    ],
  },
];

test.describe('多重角色权限并集测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页
    await page.goto('/');
    await expect(page.locator('form')).toBeVisible();
  });

  test('多重角色用户应该看到权限并集的所有菜单', async ({ page }) => {
    for (const userConfig of MULTI_ROLE_USERS) {
      // 登录多重角色用户
      await page.fill('input[data-testid="username-input"]', userConfig.username);
      await page.fill('input[data-testid="password-input"]', userConfig.password);
      await page.click('button[data-testid="login-button"]');

      // 等待登录完成
      await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

      // 验证菜单数量等于所有角色权限的并集
      const menuItems = await page.locator('[data-testid="sidebar-menu-item"]');
      await expect(menuItems).toHaveCount(userConfig.expectedMenuCount);

      // 验证具体的菜单项
      for (const menuName of userConfig.expectedMenus) {
        await expect(page.locator(`[data-testid="menu-item-${menuName}"]`)).toBeVisible();
      }

      // 验证用户角色信息显示
      const userInfo = page.locator('[data-testid="user-info"]');
      for (const role of userConfig.roles) {
        await expect(userInfo).toContainText(role);
      }

      // 重新开始下一个测试用例
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      await page.waitForSelector('form');
    }
  });

  test('权限组合应该正确合并', async ({ page }) => {
    for (const testConfig of PERMISSION_COMBINATIONS) {
      // 登录组合角色用户
      await page.fill('input[data-testid="username-input"]', testConfig.user);
      await page.fill('input[data-testid="password-input"]', testConfig.password);
      await page.click('button[data-testid="login-button"]');

      await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

      // 监控权限检查API调用
      const permissionChecks: any[] = [];
      page.on('response', (response) => {
        if (response.url().includes('/permissions/check')) {
          permissionChecks.push({
            status: response.status(),
            url: response.url(),
            body: response.body(),
          });
        }
      });

      // 测试所有可访问的功能
      for (const feature of testConfig.accessibleFeatures) {
        // 导航到相关页面
        const menuName = getFeatureMenuName(feature);
        if (menuName) {
          await page.click(`[data-testid="menu-item-${menuName}"]`);
        }

        // 等待页面加载
        await page.waitForSelector('[data-testid="page-content"]', { timeout: 3000 });

        // 验证页面成功访问
        await expect(page.locator('[data-testid="page-content"]')).toBeVisible();

        // 返回主页
        await page.click('[data-testid="breadcrumb-home"]');
      }

      // 验证权限检查API调用
      expect(permissionChecks.length).toBeGreaterThan(0);

      // 验证权限检查结果
      const lastPermissionCheck = permissionChecks[permissionChecks.length - 1];
      const responseBody = JSON.parse(lastPermissionCheck.body);
      expect(responseBody.hasAllPermissions).toBe(true);

      // 重新开始下一个测试用例
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      await page.waitForSelector('form');
    }
  });

  test('角色权限变更实时更新', async ({ page }) => {
    // 登录为单一角色用户
    await page.fill('input[data-testid="username-input"]', 'operator');
    await page.fill('input-testid="password-input"]', 'operator');
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证初始权限
    const initialMenuCount = await page.locator('[data-testid="sidebar-menu-item"]').count();
    expect(initialMenuCount).toBe(2); // 业务操作员只能看到2个菜单

    // 验证没有高级管理菜单
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).not.toBeVisible();

    // 模拟角色更新（添加管理员权限）
    await page.evaluate(() => {
      // 模拟添加管理员角色
      window.dispatchEvent(
        new CustomEvent('roles-updated', {
          detail: {
            addedRoles: ['超级管理员'],
            removedRoles: [],
          },
        })
      );
    });

    // 等待UI更新
    await page.waitForTimeout(1000);

    // 验证菜单数量增加
    const updatedMenuCount = await page.locator('[data-testid="sidebar-menu-item"]').count();
    expect(updatedMenuCount).toBeGreaterThan(initialMenuCount);

    // 验证新权限的菜单可见
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).toBeVisible();

    // 验证原有菜单仍然可见
    await expect(page.locator('[data-testid="menu-item-商品管理"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-库存 & 仓店库存管理"]')).toBeVisible();
  });

  test('角色权限移除实时更新', async ({ page }) => {
    // 登录为管理员用户
    await page.fill('input[data-testid="username-input"]', 'admin');
    await page.fill('input[data-testid="password-input"]', 'admin');
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证管理员初始权限
    const adminMenuCount = await page.locator('[data-testid="sidebar-menu-item"]').count();
    expect(adminMenuCount).toBe(5); // 管理员可以看到所有5个菜单

    // 验证所有菜单都可见
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).toBeVisible();

    // 模拟角色移除（移除管理员权限，保留基础权限）
    await page.evaluate(() => {
      // 模拟移除管理员角色
      window.dispatchEvent(
        new CustomEvent('roles-updated', {
          detail: {
            addedRoles: [],
            removedRoles: ['超级管理员'],
          },
        })
      );
    });

    // 等待UI更新
    await page.waitForTimeout(1000);

    // 验证菜单数量减少
    const reducedMenuCount = await page.locator('[data-testid="sidebar-menu-item"]').count();
    expect(reducedMenuCount).toBeLessThan(adminMenuCount);

    // 验证管理员专属菜单不可见
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).not.toBeVisible();

    // 验证基础权限菜单仍然可见
    await expect(page.locator('[data-testid="menu-item-商品管理"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-库存 & 仓店库存管理"]')).toBeVisible();
  });

  test('角色冲突和优先级处理', async ({ page }) => {
    // 登录具有冲突角色的用户
    await page.fill('input[data-testid="username-input"]', 'conflict-role');
    await page.fill('input[data-testid="password-input"]', 'conflict-role');
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证角色冲突提示
    await expect(page.locator('[data-testid="role-conflict-warning"]')).toBeVisible();
    await expect(page.locator('text=检测到角色冲突')).toBeVisible();

    // 验证使用优先级更高的角色权限
    // 这里假设管理员优先级高于业务操作员
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).toBeVisible();
    await expect(page.locator('[data-testid="menu-item-商品管理"]')).toBeVisible();

    // 验证用户信息显示优先级最高的角色
    const userInfo = page.locator('[data-testid="user-info"]');
    await expect(userInfo).toContainText('管理员'); // 应该显示优先级最高的角色
  });

  test('临时权限授予和撤销', async ({ page }) => {
    // 登录为操作员用户
    await page.fill('input-testid="username-input"]', 'operator');
    await page.fill('input[data-testid="password-input"]', 'operator');
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证操作员初始权限
    await expect(page.locator('[data-testid="menu-item-基础设置与主数据"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).not.toBeVisible();

    // 模拟临时权限授予
    await page.evaluate(() => {
      // 模拟临时授予价格管理权限
      window.dispatchEvent(
        new CustomEvent('temporary-permission-granted', {
          detail: {
            permissions: ['pricing.read', 'pricing.write'],
            duration: 3600000, // 1小时
          },
        })
      );
    });

    // 等待UI更新
    await page.waitForTimeout(1000);

    // 验证临时权限生效
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).toBeVisible();

    // 点击价格管理菜单
    await page.click('[data-testid="menu-item-价格体系管理"]');

    // 验证可以访问价格管理页面
    await expect(page.locator('[data-testid="page-content"]')).toBeVisible();

    // 验证临时权限提示
    await expect(page.locator('[data-testid="temporary-permission-indicator"]')).toBeVisible();
    await expect(page.locator('text=临时权限')).toBeVisible();

    // 返回主页
    await page.click('[data-testid="breadcrumb-home"]');

    // 模拟临时权限撤销
    await page.evaluate(() => {
      // 模拟撤销临时权限
      window.dispatchEvent(
        new CustomEvent('temporary-permission-revoked', {
          detail: {
            permissions: ['pricing.read', 'pricing.write'],
          },
        })
      );
    });

    // 等待UI更新
    await page.waitForTimeout(1000);

    // 验证临时权限撤销
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="temporary-permission-indicator"]')).not.toBeVisible();

    // 验证尝试访问被拒绝
    await page.goto('/pricing/rules');

    // 应该被重定向到权限不足页面
    await expect(page.url()).toContain('/unauthorized');
  });
});

// 辅助函数：根据功能名称获取菜单名称
function getFeatureMenuName(feature: string): string | null {
  const featureToMenu: Record<string, string> = {
    基础设置: '基础设置与主数据',
    商品编辑: '商品管理',
    库存查看: '库存 & 仓店库存管理',
    价格设置: '价格体系管理',
    业务操作: '商品管理',
    报表审核: '运营 & 报表 / 指标看板',
    数据分析: '运营 & 报表 / 指标看板',
  };

  return featureToMenu[feature] || null;
}
