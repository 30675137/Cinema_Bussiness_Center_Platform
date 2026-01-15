/**
 * 权限验证E2E测试
 * 测试权限检查和访问控制功能
 */

import { test, expect } from '@playwright/test';

// 权限测试数据
const PERMISSION_TESTS = {
  // 无权限访问测试
  unauthorizedAccess: [
    {
      user: { username: 'viewer', password: 'viewer' },
      path: '/basic-settings/permission',
      expectedStatus: 403,
      expectedMessage: '权限不足',
    },
    {
      user: { username: 'operator', password: 'operator' },
      path: '/basic-settings/permission',
      expectedStatus: 403,
      expectedMessage: '权限不足',
    },
    {
      user: { username: 'viewer', password: 'viewer' },
      path: '/pricing/rules',
      expectedStatus: 403,
      expectedMessage: '权限不足',
    },
  ],
  // 有权限访问测试
  authorizedAccess: [
    {
      user: { username: 'admin', password: 'admin' },
      path: '/basic-settings/permission',
      expectedStatus: 200,
      expectedContent: '角色与权限管理',
    },
    {
      user: { username: 'admin', password: 'admin' },
      path: '/pricing/rules',
      expectedStatus: 200,
      expectedContent: '价格规则配置',
    },
    {
      user: { username: 'operator', password: 'operator' },
      path: '/product/spu',
      expectedStatus: 200,
      expectedContent: 'SPU 管理',
    },
    {
      user: { username: 'operator', password: 'operator' },
      path: '/inventory/overview',
      expectedStatus: 200,
      expectedContent: '库存台账查看',
    },
  ],
};

test.describe('权限验证测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到登录页
    await page.goto('/');
  });

  test('无权限访问应该被拒绝', async ({ page }) => {
    for (const testCase of PERMISSION_TESTS.unauthorizedAccess) {
      // 登录用户
      await page.fill('input[data-testid="username-input"]', testCase.user.username);
      await page.fill('input[data-testid="password-input"]', testCase.user.password);
      await page.click('button[data-testid="login-button"]');

      // 等待登录完成
      await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

      // 直接访问无权限的页面
      const response = await page.goto(testCase.path);

      // 验证被重定向到权限不足页面
      await expect(page.url()).toContain('/unauthorized');

      // 验证显示权限不足消息
      await expect(page.locator('h1')).toContainText('权限不足');
      await expect(page.locator('text=您没有访问此页面的权限')).toBeVisible();

      // 重新开始下一个测试用例
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      await page.waitForSelector('form');
    }
  });

  test('有权限访问应该成功', async ({ page }) => {
    for (const testCase of PERMISSION_TESTS.authorizedAccess) {
      // 登录用户
      await page.fill('input[data-testid="username-input"]', testCase.user.username);
      await page.fill('input[data-testid="password-input"]', testCase.user.password);
      await page.click('button[data-testid="login-button"]');

      // 等待登录完成
      await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

      // 通过菜单导航访问页面
      const menuName = getMenuNameFromPath(testCase.path);
      if (menuName) {
        await page.click(`[data-testid="menu-item-${menuName}"]`);

        // 如果有二级菜单，点击相应的二级菜单项
        const subMenuName = getSubMenuNameFromPath(testCase.path);
        if (subMenuName) {
          await page.click(`[data-testid="submenu-item-${subMenuName}"]`);
        }
      }

      // 验证页面成功加载
      await expect(page.locator('[data-testid="page-content"]')).toBeVisible();

      // 验证页面包含预期内容
      if (testCase.expectedContent) {
        await expect(page.locator('body')).toContainText(testCase.expectedContent);
      }

      // 验证URL正确
      await expect(page.url()).toContain(testCase.path);

      // 重新开始下一个测试用例
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');
      await page.waitForSelector('form');
    }
  });

  test('动态权限更新测试', async ({ page }) => {
    // 登录为操作员（有限权限）
    await page.fill('input[data-testid="username-input"]', 'operator');
    await page.fill('input[data-testid="password-input"]', 'operator');
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证操作员不能访问价格管理
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).not.toBeVisible();

    // 模拟权限更新（在实际应用中，这需要API调用）
    // 这里我们模拟一个权限更新后的状态
    await page.evaluate(() => {
      // 模拟更新用户权限
      window.dispatchEvent(
        new CustomEvent('permissions-updated', {
          detail: {
            addedPermissions: ['pricing.read', 'pricing.write'],
            removedPermissions: [],
          },
        })
      );
    });

    // 验证价格管理菜单现在可见
    await expect(page.locator('[data-testid="menu-item-价格体系管理"]')).toBeVisible();

    // 点击价格管理菜单
    await page.click('[data-testid="menu-item-价格体系管理"]');

    // 验证可以访问价格管理页面
    await expect(page.locator('[data-testid="page-content"]')).toBeVisible();
    await expect(page.url()).toContain('/pricing');
  });

  test('角色权限组合测试', async ({ page }) => {
    // 登录为具有多重角色的用户
    await page.fill('input[data-testid="username-input"]', 'multi-role');
    await page.fill('input[data-testid="password-input"]', 'multi-role');
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 验证用户信息显示多角色
    const userInfo = page.locator('[data-testid="user-info"]');
    await expect(userInfo).toContainText('多重角色');

    // 验证用户可以看到所有角色权限的并集
    const visibleMenus = await page.locator('[data-testid="sidebar-menu-item"]');
    await expect(visibleMenus).toHaveCountGreaterThan(2); // 应该多于操作员的权限

    // 验证可以看到来自不同角色的菜单
    await expect(page.locator('[data-testid="menu-item-商品管理"]')).toBeVisible(); // 操作员权限
    await expect(page.locator('[data-testid="menu-item-运营 & 报表"]')).toBeVisible(); // 可能的分析师权限
  });

  test('权限检查API调用验证', async ({ page }) => {
    // 启用请求拦截来监控API调用
    const apiCalls: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/permissions/check')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
        });
      }
    });

    // 登录用户
    await page.fill('input[data-testid="username-input"]', 'admin');
    await page.fill('input[data-testid="password-input"]', 'admin');
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 尝试访问需要权限的操作
    await page.click('[data-testid="menu-item-商品管理"]');

    // 验证权限检查API被调用
    expect(apiCalls.length).toBeGreaterThan(0);

    // 验证API调用格式正确
    const permissionCheck = apiCalls.find(
      (call) => call.url.includes('/permissions/check') && call.method === 'POST'
    );
    expect(permissionCheck).toBeDefined();

    if (permissionCheck) {
      const postData = JSON.parse(permissionCheck.postData);
      expect(postData).toHaveProperty('permissions');
      expect(Array.isArray(postData.permissions)).toBe(true);
    }
  });

  test('会话超时和权限重验证', async ({ page }) => {
    // 登录用户
    await page.fill('input[data-testid="username-input"]', 'admin');
    await page.fill('input[data-testid="password-input"]', 'admin');
    await page.click('[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 模拟token过期
    await page.evaluate(() => {
      localStorage.removeItem('auth_token');
    });

    // 尝试访问需要权限的页面
    await page.goto('/product/spu');

    // 应该被重定向到登录页
    await expect(page.url()).toContain('/login');

    // 验证显示登录过期提示
    await expect(page.locator('text=登录已过期')).toBeVisible();
  });

  test('权限缓存和性能优化', async ({ page }) => {
    // 登录用户
    await page.fill('input[data-testid="username-input"]', 'admin');
    await page.fill('input[data-testid="password-input"]', 'admin');
    await page.click('button[data-testid="login-button"]');

    await page.waitForSelector('[data-testid="app-layout"]', { timeout: 5000 });

    // 监控网络请求
    const requests: any[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        requests.push(request.url());
      }
    });

    // 多次访问同一页面
    for (let i = 0; i < 3; i++) {
      await page.goto('/product/spu');
      await page.waitForSelector('[data-testid="page-content"]');
    }

    // 验证权限检查API调用被缓存
    const permissionRequests = requests.filter((url) => url.includes('/permissions/check'));

    // 权限检查应该被缓存，避免重复调用
    expect(permissionRequests.length).toBeLessThan(3);
  });
});

// 辅助函数：从路径获取菜单名称
function getMenuNameFromPath(path: string): string | null {
  const pathToMenu: Record<string, string> = {
    '/basic-settings': '基础设置与主数据',
    '/product': '商品管理',
    '/inventory': '库存 & 仓店库存管理',
    '/pricing': '价格体系管理',
    '/operations': '运营 & 报表 / 指标看板',
  };

  const pathSegments = path.split('/').filter(Boolean);
  return pathToMenu[pathSegments[0]] || null;
}

// 辅助函数：从路径获取二级菜单名称
function getSubMenuNameFromPath(path: string): string | null {
  const pathToSubMenu: Record<string, string> = {
    '/product/spu': 'SPU 管理',
    '/product/sku': 'SKU 管理',
    '/product/material': '素材库管理',
    '/inventory/overview': '库存台账查看',
    '/inventory/operations': '出入库操作',
    '/inventory/transfer': '调拨管理',
    '/pricing/price-list': '价目表管理',
    '/pricing/rules': '价格规则配置',
    '/operations/data-quality': '商品数据质量报表',
    '/operations/inventory-accuracy': '库存准确性报表',
    '/operations/resource-utilization': '资源利用率报表',
  };

  return pathToSubMenu[path] || null;
}
