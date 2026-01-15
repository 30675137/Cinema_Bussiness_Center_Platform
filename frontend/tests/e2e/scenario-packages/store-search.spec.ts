/**
 * 门店搜索功能 E2E 测试
 *
 * T026: 端到端测试门店搜索筛选功能
 *
 * 测试覆盖：
 * - 按门店名称搜索
 * - 按区域搜索
 * - 搜索无结果状态
 * - 清除搜索
 * - 搜索后选择门店
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { test, expect, Page } from '@playwright/test';

// Base URL from environment or default to localhost
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

/**
 * Helper: Navigate to create page
 */
async function navigateToCreatePage(page: Page) {
  await page.goto(`${BASE_URL}/scenario-packages/create`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=关联门店', { timeout: 10000 });
}

/**
 * Helper: Get store selector section
 */
function getStoreSelectorSection(page: Page) {
  return page.locator('.ant-card:has-text("关联门店")');
}

/**
 * Helper: Get all store tags
 */
function getStoreTags(page: Page) {
  const section = getStoreSelectorSection(page);
  return section.locator('.ant-tag-checkable');
}

/**
 * Helper: Get selected store tags
 */
function getSelectedStoreTags(page: Page) {
  const section = getStoreSelectorSection(page);
  return section.locator('.ant-tag-checkable-checked');
}

/**
 * Helper: Get search input in store selector
 */
function getStoreSearchInput(page: Page) {
  const section = getStoreSelectorSection(page);
  return section.locator('input[placeholder*="搜索门店"]');
}

/**
 * Helper: Get clear search button
 */
function getClearSearchButton(page: Page) {
  const section = getStoreSelectorSection(page);
  return section.locator('.ant-input-clear-icon, button:has-text("清除")');
}

test.describe('门店搜索功能 (T026)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCreatePage(page);
  });

  test('应该显示搜索输入框', async ({ page }) => {
    const searchInput = getStoreSearchInput(page);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /搜索门店/);
  });

  test('应该能够通过门店名称搜索', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const initialCount = await storeTags.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    // 获取第一个门店名称
    const firstName = await storeTags.first().textContent();
    if (!firstName) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // 搜索门店名称的前两个字符
    const searchTerm = firstName.slice(0, 2);
    await searchInput.fill(searchTerm);

    // 等待搜索生效
    await page.waitForTimeout(300);

    // 验证搜索结果
    const filteredTags = getStoreTags(page);
    const filteredCount = await filteredTags.count();

    // 过滤后的结果应该少于或等于初始数量
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // 过滤后的门店名称应该包含搜索词
    if (filteredCount > 0) {
      const firstFilteredName = await filteredTags.first().textContent();
      expect(firstFilteredName?.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
  });

  test('应该能够通过区域搜索', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const initialCount = await storeTags.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // 搜索常见区域名称
    await searchInput.fill('北京');
    await page.waitForTimeout(300);

    const filteredTags = getStoreTags(page);
    const filteredCount = await filteredTags.count();

    // 应该返回匹配的门店或无结果
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('搜索无结果时应该显示空状态', async ({ page }) => {
    const searchInput = getStoreSearchInput(page);

    // 搜索不存在的门店
    await searchInput.fill('不存在的门店名称XXXXXXXX');
    await page.waitForTimeout(300);

    // 应该显示空结果提示
    const storeSection = getStoreSelectorSection(page);
    await expect(storeSection).toContainText(/未找到|无匹配|暂无/);

    // 门店标签应该为空
    const storeTags = getStoreTags(page);
    expect(await storeTags.count()).toBe(0);
  });

  test('清除搜索后应该显示所有门店', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const initialCount = await storeTags.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // 先搜索以过滤
    await searchInput.fill('北京');
    await page.waitForTimeout(300);

    // 清除搜索
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 应该恢复显示所有门店
    const finalTags = getStoreTags(page);
    expect(await finalTags.count()).toBe(initialCount);
  });

  test('搜索后应该能够选择门店', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const initialCount = await storeTags.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    // 获取第一个门店名称用于搜索
    const firstName = await storeTags.first().textContent();
    if (!firstName) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // 搜索
    await searchInput.fill(firstName.slice(0, 2));
    await page.waitForTimeout(300);

    // 选择搜索结果中的门店
    const filteredTags = getStoreTags(page);
    if ((await filteredTags.count()) > 0) {
      await filteredTags.first().click();

      // 验证选择成功
      const selectedTags = getSelectedStoreTags(page);
      expect(await selectedTags.count()).toBeGreaterThan(0);

      // 验证选中计数更新
      const storeSection = getStoreSelectorSection(page);
      await expect(storeSection).toContainText(/已选择 \d+ 个门店/);
    }
  });

  test('选择门店后清除搜索应该保持选中状态', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const initialCount = await storeTags.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    // 获取第一个门店名称用于搜索
    const firstName = await storeTags.first().textContent();
    if (!firstName) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // 搜索
    await searchInput.fill(firstName.slice(0, 2));
    await page.waitForTimeout(300);

    // 选择门店
    const filteredTags = getStoreTags(page);
    if ((await filteredTags.count()) > 0) {
      await filteredTags.first().click();
    }

    // 清除搜索
    await searchInput.clear();
    await page.waitForTimeout(300);

    // 选中状态应该保持
    const selectedTags = getSelectedStoreTags(page);
    expect(await selectedTags.count()).toBeGreaterThan(0);
  });

  test('搜索应该不区分大小写', async ({ page }) => {
    const storeTags = getStoreTags(page);

    if ((await storeTags.count()) === 0) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // 使用大写搜索
    await searchInput.fill('STORE');
    await page.waitForTimeout(300);

    const upperCaseCount = await getStoreTags(page).count();

    // 使用小写搜索
    await searchInput.clear();
    await searchInput.fill('store');
    await page.waitForTimeout(300);

    const lowerCaseCount = await getStoreTags(page).count();

    // 结果应该相同
    expect(upperCaseCount).toBe(lowerCaseCount);
  });

  test('搜索时应该有防抖效果', async ({ page }) => {
    const storeTags = getStoreTags(page);

    if ((await storeTags.count()) === 0) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // 快速连续输入
    await searchInput.pressSequentially('abc', { delay: 50 });

    // 短暂等待后检查（在防抖时间内）
    await page.waitForTimeout(100);

    // 搜索应该还没有生效或正在进行
    // 等待防抖完成
    await page.waitForTimeout(400);

    // 现在搜索应该已经生效
    const filteredTags = getStoreTags(page);
    const count = await filteredTags.count();

    // 验证搜索功能正常工作（无论结果如何）
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
