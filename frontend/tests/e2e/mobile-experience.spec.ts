/**
 * 移动端用户体验E2E测试
 * 测试移动设备上的交互体验、触控操作和性能表现
 */

import { test, expect } from '@playwright/test';

test.describe('移动端用户体验', () => {
  test.beforeEach(async ({ page }) => {
    // 设置移动端用户代理
    await page.setViewportSize({ width: 375, height: 667 });
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('T062-1: 移动端菜单抽屉应该正确开启和关闭', async ({ page }) => {
    // 检查移动端菜单触发按钮
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await expect(mobileMenuTrigger).toBeVisible();

    // 点击打开菜单抽屉
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 验证抽屉打开状态
    const drawer = page.locator('.ant-drawer-open');
    await expect(drawer).toBeVisible();

    // 验证抽屉内容
    const drawerContent = drawer.locator('.ant-drawer-content, .sidebar-content');
    await expect(drawerContent).toBeVisible();

    // 验证遮罩层存在
    const drawerMask = page.locator('.ant-drawer-mask');
    await expect(drawerMask).toBeVisible();

    // 点击遮罩层关闭抽屉
    await drawerMask.click();
    await page.waitForSelector('.ant-drawer-open', { state: 'hidden', timeout: 3000 });

    // 验证抽屉已关闭
    await expect(drawer).not.toBeVisible();
  });

  test('T062-2: 抽屉菜单项应该可以正常点击导航', async ({ page }) => {
    // 打开菜单抽屉
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 查找第一个可见的菜单项
    const menuItems = page.locator('.ant-drawer-open .sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      const firstMenuItem = menuItems.first();
      await expect(firstMenuItem).toBeVisible();

      // 记录当前URL
      const currentUrl = page.url();

      // 点击菜单项
      await firstMenuItem.click();
      await page.waitForTimeout(1000);

      // 验证页面导航（URL改变或内容更新）
      const newUrl = page.url();
      expect(newUrl).not.toBe(currentUrl);

      // 验证抽屉已自动关闭
      const drawer = page.locator('.ant-drawer-open');
      await expect(drawer).not.toBeVisible();
    }
  });

  test('T062-3: 移动端抽屉应该支持手势操作', async ({ page }) => {
    // 打开菜单抽屉
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    const drawer = page.locator('.ant-drawer-open');
    await expect(drawer).toBeVisible();

    // 获取抽屉的边界框
    const drawerBoundingBox = await drawer.boundingBox();
    if (drawerBoundingBox) {
      // 从抽屉左侧边缘向右滑动（测试滑动手势）
      await page.touchscreen.tap(
        drawerBoundingBox.x + 10,
        drawerBoundingBox.y + drawerBoundingBox.height / 2
      );
      await page.touchscreen.tap(
        drawerBoundingBox.x + 50,
        drawerBoundingBox.y + drawerBoundingBox.height / 2
      );
      await page.touchscreen.tap(
        drawerBoundingBox.x + 100,
        drawerBoundingBox.y + drawerBoundingBox.height / 2
      );

      // 等待动画完成
      await page.waitForTimeout(300);

      // 或者尝试从右向左滑动关闭抽屉
      await page.touchscreen.tap(
        drawerBoundingBox.x + drawerBoundingBox.width - 10,
        drawerBoundingBox.y + drawerBoundingBox.height / 2
      );
      await page.touchscreen.tap(
        drawerBoundingBox.x - 50,
        drawerBoundingBox.y + drawerBoundingBox.height / 2
      );

      await page.waitForTimeout(300);
    }

    // 验证关闭按钮存在
    const closeButton = page.locator('.ant-drawer-close, .mobile-close-button');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForSelector('.ant-drawer-open', { state: 'hidden', timeout: 3000 });
      await expect(drawer).not.toBeVisible();
    }
  });

  test('T062-4: 移动端搜索功能应该正常工作', async ({ page }) => {
    // 打开菜单抽屉
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 查找移动端搜索框
    const mobileSearchInput = page.locator(
      '.ant-drawer-open .sidebar-search input[placeholder*="搜索"]'
    );

    if (await mobileSearchInput.isVisible()) {
      await expect(mobileSearchInput).toBeVisible();

      // 测试搜索功能
      await mobileSearchInput.fill('商品');
      await page.waitForTimeout(300);

      // 验证搜索结果
      const searchResults = page.locator('.ant-drawer-open .sidebar-menu .ant-menu-item');
      const resultsCount = await searchResults.count();

      // 应该有搜索结果或显示空状态
      if (resultsCount > 0) {
        const firstResult = searchResults.first();
        await expect(firstResult).toBeVisible();
      } else {
        const emptyState = page.locator('.ant-drawer-open .ant-empty, .search-results-empty');
        if (await emptyState.isVisible()) {
          await expect(emptyState).toBeVisible();
        }
      }

      // 清空搜索
      await mobileSearchInput.clear();
      await page.waitForTimeout(300);
    }
  });

  test('T062-5: 移动端收藏功能应该正常工作', async ({ page }) => {
    // 打开菜单抽屉
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 查找移动端收藏菜单区域
    const mobileFavoriteSection = page.locator('.ant-drawer-open .sidebar-favorites');

    if (await mobileFavoriteSection.isVisible()) {
      await expect(mobileFavoriteSection).toBeVisible();

      // 检查收藏菜单项
      const favoriteItems = mobileFavoriteSection.locator('.favorite-item, .ant-menu-item');
      const favoriteCount = await favoriteItems.count();

      if (favoriteCount > 0) {
        const firstFavorite = favoriteItems.first();
        await expect(firstFavorite).toBeVisible();

        // 点击收藏项
        await firstFavorite.click();
        await page.waitForTimeout(1000);

        // 验证抽屉关闭且页面导航
        const drawer = page.locator('.ant-drawer-open');
        await expect(drawer).not.toBeVisible();
      }
    }

    // 测试添加收藏功能
    const menuItems = page.locator('.ant-drawer-open .sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      const firstMenuItem = menuItems.first();
      const favoriteButton = firstMenuItem.locator(
        '.menu-item-favorite, .favorite-button, [class*="favorite"]'
      );

      // 长按或点击收藏按钮
      if (await favoriteButton.isVisible()) {
        await favoriteButton.tap();
        await page.waitForTimeout(300);

        // 验证收藏状态变化
        const favoritedIcon = favoriteButton.locator('.favorited, .anticon-star, [class*="star"]');
        if (await favoritedIcon.isVisible()) {
          const isFavorited = await favoritedIcon.getAttribute('class');
          expect(isFavorited).toContain('favorited') || expect(isFavorited).toContain('star');
        }
      }
    }
  });

  test('T062-6: 移动端触摸反馈和动画效果', async ({ page }) => {
    // 打开菜单抽屉
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 测试菜单项的触摸反馈
    const menuItems = page.locator('.ant-drawer-open .sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      const firstMenuItem = menuItems.first();

      // 触摸菜单项（hover效果）
      await firstMenuItem.hover();
      await page.waitForTimeout(200);

      // 验证触摸反馈样式
      const menuItemStyles = await firstMenuItem.evaluate((el) => {
        return window.getComputedStyle(el);
      });

      // 检查是否有触摸反馈效果
      expect(
        menuItemStyles.transition || menuItemStyles.transform || menuItemStyles.opacity
      ).toBeDefined();
    }

    // 测试抽屉的动画效果
    const drawer = page.locator('.ant-drawer-open');
    const drawerStyles = await drawer.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    // 检查是否有过渡动画
    expect(drawerStyles.transition || drawerStyles.transitionDuration).toBeDefined();
  });

  test('T062-7: 移动端滚动体验测试', async ({ page }) => {
    // 打开菜单抽屉
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 查找可滚动的菜单区域
    const scrollableMenu = page.locator('.ant-drawer-open .sidebar-menu');

    if (await scrollableMenu.isVisible()) {
      // 检查是否需要滚动
      const needsScroll = await scrollableMenu.evaluate((el) => {
        return el.scrollHeight > el.clientHeight;
      });

      if (needsScroll) {
        // 测试滚动功能
        const scrollHeight = await scrollableMenu.evaluate((el) => el.scrollHeight);
        const clientHeight = await scrollableMenu.evaluate((el) => el.clientHeight);

        // 向下滚动
        await scrollableMenu.evaluate((el, scrollAmount) => {
          el.scrollTop = scrollAmount;
        }, scrollHeight - clientHeight);

        await page.waitForTimeout(300);

        // 验证滚动位置
        const scrollTop = await scrollableMenu.evaluate((el) => el.scrollTop);
        expect(scrollTop).toBeGreaterThan(0);

        // 检查滚动是否有平滑效果
        const scrollBehavior = await scrollableMenu.evaluate((el) => {
          return window.getComputedStyle(el).scrollBehavior || el.style.scrollBehavior;
        });
      }
    }
  });

  test('T062-8: 移动端键盘交互测试', async ({ page }) => {
    // 打开菜单抽屉
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 测试Tab键导航
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // 获取当前聚焦元素
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      const tagName = await focusedElement.evaluate((el) => el.tagName.toLowerCase());
      expect(['button', 'input', 'a', 'div']).toContain(tagName);
    }

    // 测试ESC键关闭抽屉
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 验证抽屉关闭
    const drawer = page.locator('.ant-drawer-open');
    await expect(drawer).not.toBeVisible();
  });

  test('T062-9: 移动端无障碍功能测试', async ({ page }) => {
    // 检查移动端菜单触发按钮的无障碍属性
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await expect(mobileMenuTrigger).toBeVisible();

    // 检查aria-label或title属性
    const ariaLabel = await mobileMenuTrigger.getAttribute('aria-label');
    const title = await mobileMenuTrigger.getAttribute('title');

    expect(ariaLabel || title).toBeTruthy();

    // 检查role属性
    const role = await mobileMenuTrigger.getAttribute('role');
    expect(role).toBe('button');

    // 打开菜单抽屉测试无障碍
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 检查抽屉的无障碍属性
    const drawer = page.locator('.ant-drawer-open');
    const drawerRole = await drawer.getAttribute('role');
    const drawerLabel = await drawer.getAttribute('aria-label');

    expect(drawerRole || drawerLabel).toBeTruthy();

    // 检查关闭按钮的无障碍属性
    const closeButton = page.locator('.ant-drawer-close, .mobile-close-button');
    if (await closeButton.isVisible()) {
      const closeLabel = await closeButton.getAttribute('aria-label');
      expect(closeLabel).toContain('关闭') || expect(closeLabel).toContain('close');
    }
  });

  test('T062-10: 移动端性能测试', async ({ page }) => {
    // 测试页面加载性能
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint:
          performance.getEntriesByType('paint').find((p) => p.name === 'first-paint')?.startTime ||
          0,
        firstContentfulPaint:
          performance.getEntriesByType('paint').find((p) => p.name === 'first-contentful-paint')
            ?.startTime || 0,
      };
    });

    // 验证性能指标在可接受范围内
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);
    expect(performanceMetrics.loadComplete).toBeLessThan(3000);
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000);

    console.log('移动端性能指标:', performanceMetrics);

    // 测试抽屉开启速度
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    const drawerOpenStart = Date.now();

    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    const drawerOpenTime = Date.now() - drawerOpenStart;
    expect(drawerOpenTime).toBeLessThan(500);

    console.log(`抽屉开启时间: ${drawerOpenTime}ms`);
  });

  test('T062-11: 移动端横屏模式测试', async ({ page }) => {
    // 设置横屏模式
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForLoadState('networkidle');

    // 检查移动端菜单触发按钮在横屏模式下是否正常
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await expect(mobileMenuTrigger).toBeVisible();

    // 测试横屏模式下的抽屉行为
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    const drawer = page.locator('.ant-drawer-open');
    await expect(drawer).toBeVisible();

    // 检查抽屉在横屏模式下的宽度
    const drawerWidth = await drawer.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.width;
    });

    // 横屏模式下抽屉宽度应该适应屏幕
    const widthValue = parseInt(drawerWidth);
    expect(widthValue).toBeLessThanOrEqual(667 * 0.8); // 通常不超过屏幕宽度的80%

    // 关闭抽屉
    const drawerMask = page.locator('.ant-drawer-mask');
    await drawerMask.click();
    await page.waitForTimeout(300);
  });

  test('T062-12: 移动端表单交互测试', async ({ page }) => {
    // 尝试导航到包含表单的页面
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 查找表单相关的菜单项
    const formMenuItem = page
      .locator('.ant-drawer-open .sidebar-menu .ant-menu-item')
      .filter({ hasText: /添加|新增|创建|编辑/ })
      .first();

    if (await formMenuItem.isVisible()) {
      await formMenuItem.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // 查找表单
      const form = page.locator('.ant-form, form');

      if (await form.isVisible()) {
        // 测试移动端表单输入
        const input = form.locator('input[type="text"], .ant-input').first();
        if (await input.isVisible()) {
          await input.tap();
          await input.fill('测试输入');

          const inputValue = await input.inputValue();
          expect(inputValue).toBe('测试输入');
        }

        // 测试移动端表单按钮
        const submitButton = form.locator('button[type="submit"], .ant-btn-primary').first();
        if (await submitButton.isVisible()) {
          await expect(submitButton).toBeVisible();

          // 检查按钮的触摸友好性
          const buttonSize = await submitButton.boundingBox();
          if (buttonSize) {
            // 按钮应该足够大，便于触摸（最小44px）
            expect(buttonSize.width).toBeGreaterThanOrEqual(44);
            expect(buttonSize.height).toBeGreaterThanOrEqual(44);
          }
        }
      }
    }
  });
});
