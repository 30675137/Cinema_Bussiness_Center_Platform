/**
 * 响应式布局E2E测试
 * 测试不同屏幕尺寸下的布局适应性和用户体验
 */

import { test, expect } from '@playwright/test';

test.describe('响应式布局', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('T061-1: 桌面端布局应该正确显示', async ({ page }) => {
    // 设置桌面端视口
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    // 检查主要布局组件
    await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.main-content, .ant-layout-content')).toBeVisible();
    await expect(page.locator('.app-header')).toBeVisible();

    // 验证侧边栏是展开状态
    const sidebar = page.locator('.sidebar');
    const sidebarWidth = await sidebar.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });
    expect(parseInt(sidebarWidth)).toBeGreaterThan(200);

    // 验证主内容区域的位置
    const mainContent = page.locator('.main-content, .ant-layout-content');
    const mainContentLeft = await mainContent.evaluate((el) => {
      return window.getComputedStyle(el).marginLeft;
    });
    expect(parseInt(mainContentLeft)).toBeGreaterThan(200);
  });

  test('T061-2: 平板端布局应该正确适应', async ({ page }) => {
    // 设置平板端视口
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    // 检查布局组件
    await expect(page.locator('.sidebar')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.main-content, .ant-layout-content')).toBeVisible();

    // 验证侧边栏可能是紧凑模式
    const sidebar = page.locator('.sidebar');
    const sidebarWidth = await sidebar.evaluate((el) => {
      return window.getComputedStyle(el).width;
    });

    // 平板端侧边栏可能变窄或保持展开状态
    const sidebarClasses = await sidebar.getAttribute('class');
    expect(sidebarClasses).toContain('compact') || parseInt(sidebarWidth) <= 256;
  });

  test('T061-3: 移动端布局应该转换为抽屉模式', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // 检查移动端菜单触发按钮
    const mobileMenuTrigger = page.locator('.mobile-menu-trigger');
    await expect(mobileMenuTrigger).toBeVisible();

    // 侧边栏应该隐藏或转换为抽屉
    const sidebar = page.locator('.sidebar');
    const isSidebarHidden = await sidebar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display === 'none' || style.transform === 'translateX(-100%)';
    });
    expect(isSidebarHidden).toBeTruthy();

    // 点击触发按钮打开抽屉
    await mobileMenuTrigger.click();
    await page.waitForSelector('.ant-drawer-open', { timeout: 3000 });

    // 验证抽屉打开状态
    const drawer = page.locator('.ant-drawer-open');
    await expect(drawer).toBeVisible();

    // 验证抽屉中的内容
    const drawerContent = drawer.locator('.ant-drawer-content, .sidebar-content');
    await expect(drawerContent).toBeVisible();
  });

  test('T061-4: 响应式断点测试', async ({ page }) => {
    // 测试不同断点尺寸
    const breakpoints = [
      { width: 1200, name: 'Desktop Large' },
      { width: 992, name: 'Desktop Medium' },
      { width: 768, name: 'Tablet' },
      { width: 576, name: 'Mobile Large' },
      { width: 375, name: 'Mobile Small' },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: 800 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      // 检查页面是否正常渲染
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // 检查关键组件的存在
      const appLayout = page.locator('.app-layout, .ant-layout');
      await expect(appLayout).toBeVisible();

      console.log(`✅ ${breakpoint.name} (${breakpoint.width}px) - 布局正常`);
    }
  });

  test('T061-5: 侧边栏折叠功能在不同屏幕尺寸下的表现', async ({ page }) => {
    // 桌面端测试
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    // 查找折叠按钮
    const collapseButton = page.locator('.collapse-button, .ant-layout-sider-trigger');

    if (await collapseButton.isVisible()) {
      // 检查展开状态
      const sidebar = page.locator('.sidebar');
      const initialWidth = await sidebar.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });

      // 点击折叠
      await collapseButton.click();
      await page.waitForTimeout(300);

      // 验证折叠状态
      const collapsedWidth = await sidebar.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });
      expect(parseInt(collapsedWidth)).toBeLessThan(parseInt(initialWidth));

      // 点击展开
      await collapseButton.click();
      await page.waitForTimeout(300);

      // 验证展开状态
      const expandedWidth = await sidebar.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });
      expect(parseInt(expandedWidth)).toBe(parseInt(initialWidth));
    }
  });

  test('T061-6: 头部导航栏响应式测试', async ({ page }) => {
    const breakpoints = [
      { width: 1920, expected: 'full' },
      { width: 768, expected: 'compact' },
      { width: 375, expected: 'minimal' },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: 800 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      const header = page.locator('.app-header');
      await expect(header).toBeVisible();

      // 检查头部内容的可见性
      const headerContent = header.locator('.header-content, .ant-layout-header-content');
      if (await headerContent.isVisible()) {
        const headerClasses = await headerContent.getAttribute('class');

        // 根据屏幕尺寸检查头部样式类
        if (breakpoint.width < 768) {
          expect(headerClasses).toMatch(/compact|mobile|small/i);
        }
      }
    }
  });

  test('T061-7: 内容区域的响应式适应', async ({ page }) => {
    const breakpoints = [{ width: 1920 }, { width: 768 }, { width: 375 }];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: 800 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      const mainContent = page.locator('.main-content, .ant-layout-content');
      await expect(mainContent).toBeVisible();

      // 检查内容区域的宽度
      const contentWidth = await mainContent.evaluate((el) => {
        return window.getComputedStyle(el).width;
      });
      expect(parseInt(contentWidth)).toBeGreaterThan(0);

      // 检查内容区域的内边距
      const contentPadding = await mainContent.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          left: parseInt(style.paddingLeft),
          right: parseInt(style.paddingRight),
        };
      });

      // 移动端通常有较小的内边距
      if (breakpoint.width < 768) {
        expect(contentPadding.left + contentPadding.right).toBeLessThan(32);
      }
    }
  });

  test('T061-8: 表格组件响应式测试', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    // 导航到包含表格的页面
    const productMenuItem = page
      .locator('.sidebar-menu .ant-menu-item')
      .filter({ hasText: '商品' })
      .first();
    if (await productMenuItem.isVisible()) {
      await productMenuItem.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // 检查表格在不同屏幕尺寸下的表现
    const breakpoints = [1920, 768, 375];

    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);

      const table = page.locator('.ant-table, .data-table');

      if (await table.isVisible()) {
        // 检查表格是否有横向滚动
        const tableWrapper = table.locator('.ant-table-container, .table-container');
        if (await tableWrapper.isVisible()) {
          const hasHorizontalScroll = await tableWrapper.evaluate((el) => {
            return el.scrollWidth > el.clientWidth;
          });

          // 小屏幕设备上的表格应该有横向滚动
          if (width < 768) {
            expect(hasHorizontalScroll).toBeTruthy();
          }
        }
      }
    }
  });

  test('T061-9: 表单组件响应式测试', async ({ page }) => {
    // 导航到包含表单的页面
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    // 尝试找到表单相关的菜单项
    const formMenuItem = page
      .locator('.sidebar-menu .ant-menu-item')
      .filter({ hasText: /添加|新增|创建|编辑/ })
      .first();
    if (await formMenuItem.isVisible()) {
      await formMenuItem.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }

    // 测试表单在不同屏幕尺寸下的布局
    const breakpoints = [1920, 768, 375];

    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);

      const form = page.locator('.ant-form, form');

      if (await form.isVisible()) {
        // 检查表单项的布局
        const formItems = form.locator('.ant-form-item');
        const itemCount = await formItems.count();

        if (itemCount > 0) {
          const firstFormItem = formItems.first();
          const formItemLayout = await firstFormItem.evaluate((el) => {
            const style = window.getComputedStyle(el);
            return {
              display: style.display,
              flexDirection: style.flexDirection,
              flexWrap: style.flexWrap,
            };
          });

          // 移动端表单项通常是垂直布局
          if (width < 768) {
            expect(
              formItemLayout.flexDirection === 'column' || formItemLayout.display.includes('block')
            ).toBeTruthy();
          }
        }
      }
    }
  });

  test('T061-10: 图片和媒体内容响应式测试', async ({ page }) => {
    const breakpoints = [
      { width: 1920, maxWidth: 1200 },
      { width: 768, maxWidth: 728 },
      { width: 375, maxWidth: 345 },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: 800 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      // 查找页面中的图片
      const images = page.locator('img');
      const imageCount = await images.count();

      if (imageCount > 0) {
        for (let i = 0; i < Math.min(3, imageCount); i++) {
          const image = images.nth(i);
          if (await image.isVisible()) {
            // 检查图片的响应式属性
            const imageStyles = await image.evaluate((el) => {
              const style = window.getComputedStyle(el);
              return {
                maxWidth: style.maxWidth,
                height: style.height,
                width: style.width,
              };
            });

            // 图片应该有maxWidth: 100%或其他响应式样式
            expect(
              imageStyles.maxWidth === '100%' ||
                imageStyles.maxWidth === breakpoint.maxWidth + 'px' ||
                imageStyles.width === '100%' ||
                parseInt(imageStyles.width) <= breakpoint.maxWidth
            ).toBeTruthy();
          }
        }
      }
    }
  });

  test('T061-11: 字体大小响应式测试', async ({ page }) => {
    const breakpoints = [
      { width: 1920, minFontSize: 14 },
      { width: 768, minFontSize: 14 },
      { width: 375, minFontSize: 12 },
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ width: breakpoint.width, height: 800 });
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(300);

      // 检查主要文本元素的字体大小
      const textElements = page.locator('h1, h2, h3, p, .ant-typography');
      const textCount = await textElements.count();

      if (textCount > 0) {
        const sampleText = textElements.first();
        if (await sampleText.isVisible()) {
          const fontSize = await sampleText.evaluate((el) => {
            return parseInt(window.getComputedStyle(el).fontSize);
          });

          // 字体大小应该适合当前屏幕尺寸
          expect(fontSize).toBeGreaterThanOrEqual(breakpoint.minFontSize);
        }
      }
    }
  });

  test('T061-12: 横竖屏切换测试', async ({ page }) => {
    // 竖屏模式
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    const portraitSidebar = page.locator('.sidebar');
    const portraitIsHidden = await portraitSidebar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display === 'none' || style.transform.includes('translateX');
    });

    // 横屏模式
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    const landscapeSidebar = page.locator('.sidebar');
    const landscapeIsHidden = await landscapeSidebar.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display === 'none' || style.transform.includes('translateX');
    });

    // 验证布局适应横竖屏切换
    expect(portraitIsHidden).toBeTruthy();
    expect(landscapeIsHidden).toBeTruthy();

    // 检查移动端菜单触发按钮在两种模式下都存在
    const mobileTrigger = page.locator('.mobile-menu-trigger');
    await expect(mobileTrigger).toBeVisible();
  });
});
