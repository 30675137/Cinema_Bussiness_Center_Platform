/**
 * 菜单层次和展开测试
 * 验证菜单的层级关系、展开收起功能
 */

import { test, expect } from '@playwright/test';

test.describe('菜单层次和展开功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 等待菜单加载完成
    await page.waitForSelector('[data-testid*="main-menu-"]', { timeout: 2000 });
  });

  test('应该能够展开一级菜单显示二级菜单', async ({ page }) => {
    // 选择一个有子菜单的一级菜单
    const mainMenu = page.locator('text="基础设置与主数据"');
    await expect(mainMenu).toBeVisible();

    // 展开前二级菜单不应该可见
    const subMenuItem = page.locator('text="组织/门店/仓库管理"');
    await expect(subMenuItem).not.toBeVisible();

    // 点击展开菜单
    await mainMenu.click();

    // 等待动画完成
    await page.waitForTimeout(300);

    // 展开后二级菜单应该可见
    await expect(subMenuItem).toBeVisible();
  });

  test('应该能够收起展开的菜单', async ({ page }) => {
    const mainMenu = page.locator('text="基础设置与主数据"');
    const subMenuItem = page.locator('text="组织/门店/仓库管理"');

    // 先展开菜单
    await mainMenu.click();
    await page.waitForTimeout(300);
    await expect(subMenuItem).toBeVisible();

    // 再次点击收起菜单
    await mainMenu.click();
    await page.waitForTimeout(300);

    // 收起后二级菜单不应该可见
    await expect(subMenuItem).not.toBeVisible();
  });

  test('应该同时展开多个一级菜单', async ({ page }) => {
    const basicSettingsMenu = page.locator('text="基础设置与主数据"');
    const productMenu = page.locator('text="商品管理 (MDM/PIM)"');

    // 展开第一个菜单
    await basicSettingsMenu.click();
    await page.waitForTimeout(300);

    // 展开第二个菜单
    await productMenu.click();
    await page.waitForTimeout(300);

    // 验证两个菜单的二级菜单都可见
    await expect(page.locator('text="组织/门店/仓库管理"')).toBeVisible();
    await expect(page.locator('text="SPU 管理"')).toBeVisible();
  });

  test('应该显示正确的菜单展开指示器', async ({ page }) => {
    const mainMenu = page.locator('text="基础设置与主数据"');

    // 检查展开指示器（可能是箭头、加号等）
    const expandIcon = mainMenu.locator('[data-testid="expand-icon"]');
    await expect(expandIcon).toBeVisible();

    // 展开前的状态
    const beforeExpandIconClass = (await expandIcon.getAttribute('class')) || '';

    // 点击展开
    await mainMenu.click();
    await page.waitForTimeout(300);

    // 验证指示器状态变化
    const afterExpandIconClass = (await expandIcon.getAttribute('class')) || '';
    expect(afterExpandIconClass).not.toBe(beforeExpandIconClass);
  });

  test('应该保持已展开菜单的状态', async ({ page }) => {
    const mainMenu = page.locator('text="基础设置与主数据"');
    const subMenuItem = page.locator('text="组织/门店/仓库管理"');

    // 展开菜单
    await mainMenu.click();
    await page.waitForTimeout(300);
    await expect(subMenuItem).toBeVisible();

    // 刷新页面
    await page.reload();
    await page.waitForTimeout(500);

    // 验证菜单状态被保持
    await expect(subMenuItem).toBeVisible();
  });

  test('应该有清晰的菜单层级视觉区分', async ({ page }) => {
    const mainMenu = page.locator('text="基础设置与主数据"');
    await mainMenu.click();
    await page.waitForTimeout(300);

    const subMenuItem = page.locator('text="组织/门店/仓库管理"');

    // 获取一级菜单和二级菜单的样式属性
    const mainMenuStyles = await mainMenu.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      };
    });

    const subMenuStyles = await subMenuItem.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        paddingLeft: styles.paddingLeft,
      };
    });

    // 验证二级菜单有缩进或不同的样式
    expect(parseInt(subMenuStyles.paddingLeft)).toBeGreaterThan(
      parseInt(mainMenuStyles.paddingLeft) || 0
    );
  });

  test('应该在移动端有适配的菜单行为', async ({ page }) => {
    // 设置移动端视口大小
    await page.setViewportSize({ width: 375, height: 667 });

    // 检查移动端菜单容器
    const mobileMenuContainer = page.locator('[data-testid="mobile-menu"]');

    // 在移动端可能需要点击菜单按钮来打开侧边栏
    const menuButton = page.locator('[data-testid="menu-button"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(300);
    }

    // 验证菜单在移动端仍然可以展开
    const mobileMenuItem = page.locator('text="基础设置与主数据"');
    await expect(mobileMenuItem).toBeVisible();

    // 展开菜单
    await mobileMenuItem.click();
    await page.waitForTimeout(300);

    // 验证二级菜单在移动端可见
    const mobileSubMenuItem = page.locator('text="组织/门店/仓库管理"');
    await expect(mobileSubMenuItem).toBeVisible();
  });

  test('应该支持键盘导航', async ({ page }) => {
    // 焦点到导航区域
    const navigationArea = page.locator('[data-testid="navigation"]');
    await navigationArea.focus();

    // 尝试使用Tab键导航
    await page.keyboard.press('Tab');

    // 验证第一个菜单项获得焦点
    const focusedElement = page.locator(':focus').first();
    expect(focusedElement).toBeVisible();

    // 使用Enter键展开菜单
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // 验证菜单已展开
    const subMenuItem = page.locator('text="组织/门店/仓库管理"');
    await expect(subMenuItem).toBeVisible();
  });

  test('应该有正确的ARIA标签支持无障碍访问', async ({ page }) => {
    const mainMenu = page.locator('text="基础设置与主数据"');

    // 验证菜单项有正确的ARIA属性
    await expect(mainMenu).toHaveAttribute('role', 'menuitem');
    await expect(mainMenu).toHaveAttribute('aria-label');
    await expect(mainMenu).toHaveAttribute('aria-expanded');

    // 展开菜单后验证aria-expanded状态
    await mainMenu.click();
    await page.waitForTimeout(300);

    await expect(mainMenu).toHaveAttribute('aria-expanded', 'true');

    // 验证子菜单有正确的aria属性
    const subMenuItem = page.locator('text="组织/门店/仓库管理"');
    await expect(subMenuItem).toHaveAttribute('role', 'menuitem');
  });
});
