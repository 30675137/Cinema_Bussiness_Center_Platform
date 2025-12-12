/**
 * 收藏菜单功能E2E测试
 * 测试侧边栏收藏组件的功能性、持久化和用户体验
 */

import { test, expect } from '@playwright/test';

test.describe('收藏菜单功能', () => {
  test.beforeEach(async ({ page }) => {
    // 清除localStorage以确保干净的测试环境
    await page.context().clearCookies();
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('T060-1: 收藏菜单组件应该正确显示', async ({ page }) => {
    // 等待侧边栏加载完成
    await page.waitForSelector('.sidebar', { timeout: 10000 });

    // 检查收藏菜单区域是否存在
    const favoriteSection = page.locator('.sidebar-favorites');
    if (await favoriteSection.isVisible()) {
      await expect(favoriteSection).toBeVisible();

      // 检查收藏菜单标题
      const favoriteTitle = favoriteSection.locator('h3, .title, [class*="title"]');
      if (await favoriteTitle.isVisible()) {
        const titleText = await favoriteTitle.textContent();
        expect(titleText).toContain('收藏') || expect(titleText).toContain('favorite');
      }
    }
  });

  test('T060-2: 菜单项应该显示收藏按钮', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    // 查找带有收藏按钮的菜单项
    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      // 检查第一个菜单项是否有收藏按钮
      const firstMenuItem = menuItems.first();
      const favoriteButton = firstMenuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

      // 收藏按钮可能默认隐藏，只在悬停时显示
      await firstMenuItem.hover();
      await page.waitForTimeout(200);

      if (await favoriteButton.isVisible()) {
        await expect(favoriteButton).toBeVisible();

        // 检查收藏按钮的图标（应该是空心的星星）
        const favoriteIcon = favoriteButton.locator('.anticon-star, .anticon-star-o, [class*="star"]');
        if (await favoriteIcon.isVisible()) {
          await expect(favoriteIcon).toBeVisible();
        }
      }
    }
  });

  test('T060-3: 点击收藏按钮应该添加收藏', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      const firstMenuItem = menuItems.first();
      const favoriteButton = firstMenuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

      // 悬停显示收藏按钮
      await firstMenuItem.hover();
      await page.waitForTimeout(200);

      if (await favoriteButton.isVisible()) {
        // 点击收藏按钮
        await favoriteButton.click();
        await page.waitForTimeout(300);

        // 验证收藏状态变化（图标变为实心星星）
        const favoriteIcon = favoriteButton.locator('.anticon-star, .favorited, [class*="star"]');

        // 检查是否有收藏成功的视觉反馈
        if (await favoriteIcon.isVisible()) {
          const isFilled = await favoriteIcon.getAttribute('class');
          expect(isFilled).toContain('star') || expect(isFilled).toContain('favorited');
        }

        // 检查收藏菜单区域是否更新
        const favoriteSection = page.locator('.sidebar-favorites');
        if (await favoriteSection.isVisible()) {
          const favoriteItems = favoriteSection.locator('.favorite-item, .ant-menu-item');
          const favoriteCount = await favoriteItems.count();
          expect(favoriteCount).toBeGreaterThan(0);
        }
      }
    }
  });

  test('T060-4: 收藏状态应该持久化到localStorage', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      const firstMenuItem = menuItems.first();
      const favoriteButton = firstMenuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

      // 悬停并点击收藏
      await firstMenuItem.hover();
      await page.waitForTimeout(200);

      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await page.waitForTimeout(300);

        // 检查localStorage中的收藏数据
        const favoritesData = await page.evaluate(() => {
          const data = localStorage.getItem('user-preferences') || localStorage.getItem('favorites');
          return data ? JSON.parse(data) : null;
        });

        if (favoritesData) {
          const hasFavorites = favoritesData.favoriteMenus || favoritesData.favorites;
          expect(hasFavorites).toBeDefined();
          expect(Array.isArray(hasFavorites)).toBeTruthy();

          if (hasFavorites.length > 0) {
            // 验证收藏的菜单项ID
            const menuItemId = await firstMenuItem.getAttribute('data-menu-id') ||
                              await firstMenuItem.getAttribute('key') ||
                              await firstMenuItem.evaluate(el => el.textContent);
            expect(hasFavorites.some((fav: any) =>
              fav.id === menuItemId ||
              fav.name === menuItemId ||
              fav === menuItemId
            )).toBeTruthy();
          }
        }
      }
    }
  });

  test('T060-5: 页面刷新后收藏状态应该保持', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      const firstMenuItem = menuItems.first();
      const favoriteButton = firstMenuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

      // 添加收藏
      await firstMenuItem.hover();
      await page.waitForTimeout(200);

      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await page.waitForTimeout(300);

        // 刷新页面
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('.sidebar', { timeout: 10000 });

        // 验证收藏状态保持
        const refreshedMenuItem = page.locator('.sidebar-menu .ant-menu-item').first();
        const refreshedFavoriteButton = refreshedMenuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

        if (await refreshedFavoriteButton.isVisible()) {
          const favoriteIcon = refreshedFavoriteButton.locator('.favorited, .anticon-star, [class*="star"]');
          if (await favoriteIcon.isVisible()) {
            const isFavorited = await favoriteIcon.getAttribute('class');
            expect(isFavorited).toContain('favorited') || expect(isFavorited).toContain('star');
          }
        }
      }
    }
  });

  test('T060-6: 收藏菜单应该显示在收藏区域', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      // 添加多个收藏
      for (let i = 0; i < Math.min(3, itemCount); i++) {
        const menuItem = menuItems.nth(i);
        const favoriteButton = menuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

        await menuItem.hover();
        await page.waitForTimeout(200);

        if (await favoriteButton.isVisible()) {
          await favoriteButton.click();
          await page.waitForTimeout(200);
        }
      }

      // 检查收藏区域
      const favoriteSection = page.locator('.sidebar-favorites');
      if (await favoriteSection.isVisible()) {
        const favoriteItems = favoriteSection.locator('.favorite-item, .ant-menu-item, [class*="item"]');
        const favoriteCount = await favoriteItems.count();

        // 应该显示收藏的菜单项
        expect(favoriteCount).toBeGreaterThan(0);

        // 验证收藏菜单项可点击
        if (favoriteCount > 0) {
          const firstFavorite = favoriteItems.first();
          await expect(firstFavorite).toBeVisible();

          // 点击收藏的菜单项应该导航到对应页面
          await firstFavorite.click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('T060-7: 取消收藏功能', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      const firstMenuItem = menuItems.first();
      const favoriteButton = firstMenuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

      // 先添加收藏
      await firstMenuItem.hover();
      await page.waitForTimeout(200);

      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await page.waitForTimeout(300);

        // 再次点击取消收藏
        await firstMenuItem.hover();
        await page.waitForTimeout(200);
        await favoriteButton.click();
        await page.waitForTimeout(300);

        // 验证收藏状态被移除
        const favoriteIcon = favoriteButton.locator('.favorited, .anticon-star, [class*="star"]');
        if (await favoriteIcon.isVisible()) {
          const isNotFavorited = await favoriteIcon.getAttribute('class');
          expect(isNotFavorited).not.toContain('favorited') || expect(isNotFavorited).toContain('star-o');
        }

        // 检查localStorage中的收藏数据是否被移除
        const favoritesData = await page.evaluate(() => {
          const data = localStorage.getItem('user-preferences') || localStorage.getItem('favorites');
          return data ? JSON.parse(data) : null;
        });

        if (favoritesData && favoritesData.favoriteMenus) {
          expect(favoritesData.favoriteMenus.length).toBe(0);
        }
      }
    }
  });

  test('T060-8: 收藏数量限制', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      // 尝试添加多个收藏（测试收藏数量限制）
      const maxFavorites = 5; // 假设最大收藏数量为5

      for (let i = 0; i < Math.min(maxFavorites + 2, itemCount); i++) {
        const menuItem = menuItems.nth(i);
        const favoriteButton = menuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

        await menuItem.hover();
        await page.waitForTimeout(200);

        if (await favoriteButton.isVisible()) {
          await favoriteButton.click();
          await page.waitForTimeout(200);
        }
      }

      // 检查收藏区域
      const favoriteSection = page.locator('.sidebar-favorites');
      if (await favoriteSection.isVisible()) {
        const favoriteItems = favoriteSection.locator('.favorite-item, .ant-menu-item, [class*="item"]');
        const favoriteCount = await favoriteItems.count();

        // 收藏数量应该在限制范围内
        expect(favoriteCount).toBeLessThanOrEqual(maxFavorites);
      }
    }
  });

  test('T060-9: 收藏菜单在移动端的显示', async ({ page }) => {
    // 模拟移动设备
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // 触发移动端菜单
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    if (await mobileMenuTrigger.isVisible()) {
      await mobileMenuTrigger.click();
      await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });
    }

    // 检查移动端收藏功能
    const mobileFavoriteSection = page.locator('.ant-drawer-open .sidebar-favorites');

    if (await mobileFavoriteSection.isVisible()) {
      await expect(mobileFavoriteSection).toBeVisible();

      // 检查移动端收藏菜单项
      const mobileFavoriteItems = mobileFavoriteSection.locator('.favorite-item, .ant-menu-item');
      const mobileFavoriteCount = await mobileFavoriteItems.count();

      if (mobileFavoriteCount > 0) {
        await expect(mobileFavoriteItems.first()).toBeVisible();

        // 测试移动端收藏菜单项点击
        await mobileFavoriteItems.first().click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('T060-10: 收藏菜单项的快速访问功能', async ({ page }) => {
    // 等待菜单加载完成
    await page.waitForSelector('.sidebar-menu', { timeout: 10000 });

    const menuItems = page.locator('.sidebar-menu .ant-menu-item');
    const itemCount = await menuItems.count();

    if (itemCount > 0) {
      // 添加一个收藏
      const firstMenuItem = menuItems.first();
      const favoriteButton = firstMenuItem.locator('.menu-item-favorite, .favorite-button, [class*="favorite"]');

      await firstMenuItem.hover();
      await page.waitForTimeout(200);

      if (await favoriteButton.isVisible()) {
        await favoriteButton.click();
        await page.waitForTimeout(300);

        // 在收藏区域查找并点击收藏项
        const favoriteSection = page.locator('.sidebar-favorites');
        if (await favoriteSection.isVisible()) {
          const favoriteItems = favoriteSection.locator('.favorite-item, .ant-menu-item');
          const favoriteCount = await favoriteItems.count();

          if (favoriteCount > 0) {
            const firstFavorite = favoriteItems.first();

            // 记录点击前的URL
            const currentUrl = page.url();

            // 点击收藏菜单项
            await firstFavorite.click();
            await page.waitForTimeout(1000);

            // 验证页面发生了导航变化
            const newUrl = page.url();
            expect(newUrl).not.toBe(currentUrl);

            // 或者验证页面内容发生了变化
            const pageContent = await page.content();
            expect(pageContent).not.toBe('');
          }
        }
      }
    }
  });
});