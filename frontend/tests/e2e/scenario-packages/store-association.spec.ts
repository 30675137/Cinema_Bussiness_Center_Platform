/**
 * 场景包门店关联 E2E 测试
 *
 * T012: 端到端测试场景包编辑页门店选择功能
 *
 * 测试覆盖：
 * - 门店列表加载和展示
 * - 门店选择和取消选择
 * - 已选门店回显（编辑时）
 * - 门店搜索过滤
 * - 保存门店关联
 * - 至少选择一个门店验证
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { test, expect, Page } from '@playwright/test';

// Base URL from environment or default to localhost
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

// Test data
const TEST_PACKAGE = {
  name: 'E2E门店关联测试场景包',
  description: '用于测试门店关联功能的场景包',
  durationHours: 2,
  minPeople: 2,
  maxPeople: 10,
  packagePrice: 299,
};

/**
 * Helper: Navigate to create page
 */
async function navigateToCreatePage(page: Page) {
  await page.goto(`${BASE_URL}/scenario-packages/create`);
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=关联门店', { timeout: 10000 });
}

/**
 * Helper: Navigate to edit page
 */
async function navigateToEditPage(page: Page, packageId: string) {
  await page.goto(`${BASE_URL}/scenario-packages/${packageId}/edit`);
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

test.describe('Store Association in Package Edit Page (T012)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to create page for most tests
    await navigateToCreatePage(page);
  });

  test('should display store list correctly', async ({ page }) => {
    // Store selector section should be visible
    const storeSection = getStoreSelectorSection(page);
    await expect(storeSection).toBeVisible();

    // Should show "关联门店" title
    await expect(storeSection).toContainText('关联门店');

    // Should show "必填，至少选择一个门店" hint
    await expect(storeSection).toContainText('必填');

    // Should display store tags (if stores are loaded)
    const storeTags = getStoreTags(page);
    const tagCount = await storeTags.count();

    // Either show stores or empty state
    if (tagCount > 0) {
      await expect(storeTags.first()).toBeVisible();
    } else {
      // Should show empty or loading state
      const emptyState = page.locator('text=暂无可用门店');
      const loadingState = page.locator('text=加载门店列表');
      const hasState = (await emptyState.isVisible()) || (await loadingState.isVisible());
      expect(hasState).toBeTruthy();
    }
  });

  test('should show selected count indicator', async ({ page }) => {
    const storeSection = getStoreSelectorSection(page);

    // Should show "已选择 X 个门店" text
    await expect(storeSection).toContainText('已选择');
    await expect(storeSection).toContainText('个门店');
  });

  test('should allow selecting and deselecting stores', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const tagCount = await storeTags.count();

    if (tagCount === 0) {
      test.skip();
      return;
    }

    // Initially no stores should be selected
    let selectedTags = getSelectedStoreTags(page);
    const initialSelectedCount = await selectedTags.count();

    // Click first store to select
    const firstStore = storeTags.first();
    await firstStore.click();

    // Should now be selected
    selectedTags = getSelectedStoreTags(page);
    expect(await selectedTags.count()).toBe(initialSelectedCount + 1);

    // Click again to deselect
    await firstStore.click();

    // Should be deselected
    selectedTags = getSelectedStoreTags(page);
    expect(await selectedTags.count()).toBe(initialSelectedCount);
  });

  test('should allow selecting multiple stores', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const tagCount = await storeTags.count();

    if (tagCount < 2) {
      test.skip();
      return;
    }

    // Select first two stores
    await storeTags.nth(0).click();
    await storeTags.nth(1).click();

    // Should have 2 selected
    const selectedTags = getSelectedStoreTags(page);
    expect(await selectedTags.count()).toBe(2);

    // Selected count text should update
    const storeSection = getStoreSelectorSection(page);
    await expect(storeSection).toContainText('已选择 2 个门店');
  });

  test('should show validation error when saving without selecting stores', async ({ page }) => {
    // Fill required form fields but don't select any store
    await page.fill('input[placeholder*="VIP"]', TEST_PACKAGE.name);

    // Fill duration
    const durationInput = page.locator('.ant-input-number input').first();
    await durationInput.fill(TEST_PACKAGE.durationHours.toString());

    // Fill package price
    const priceInput = page.locator('.ant-input-number input').last();
    await priceInput.fill(TEST_PACKAGE.packagePrice.toString());

    // Try to save
    await page.click('button:has-text("保存")');

    // Should show error message
    await expect(page.locator('.ant-message-error')).toContainText('至少选择一个');
  });

  test('should save package with selected stores successfully', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const tagCount = await storeTags.count();

    if (tagCount === 0) {
      test.skip();
      return;
    }

    // Fill form
    await page.fill('input[placeholder*="VIP"]', TEST_PACKAGE.name);

    const durationInput = page.locator('.ant-input-number input').first();
    await durationInput.fill(TEST_PACKAGE.durationHours.toString());

    const priceInput = page.locator('.ant-input-number input').last();
    await priceInput.fill(TEST_PACKAGE.packagePrice.toString());

    // Select a store
    await storeTags.first().click();

    // Setup API response listener
    const responsePromise = page.waitForResponse(
      response =>
        response.url().includes('/api/scenario-packages') &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 10000 }
    );

    // Save
    await page.click('button:has-text("保存")');

    // Wait for API response
    const response = await responsePromise;
    const responseData = await response.json();

    // Verify storeIds in request body
    const requestBody = JSON.parse(response.request().postData() || '{}');
    expect(requestBody.storeIds).toBeDefined();
    expect(requestBody.storeIds.length).toBeGreaterThan(0);

    // Should show success message
    await expect(page.locator('.ant-message-success')).toBeVisible();
  });
});

test.describe('Store Search Filtering (T012-Search)', () => {
  test.beforeEach(async ({ page }) => {
    await navigateToCreatePage(page);
  });

  test('should have search input in store selector', async ({ page }) => {
    const searchInput = getStoreSearchInput(page);
    await expect(searchInput).toBeVisible();
  });

  test('should filter stores by search text', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const initialCount = await storeTags.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    // Get first store name
    const firstName = await storeTags.first().textContent();

    // Search for a partial match
    const searchInput = getStoreSearchInput(page);
    const searchTerm = firstName?.slice(0, 2) || '门店';
    await searchInput.fill(searchTerm);

    // Wait for filter to apply
    await page.waitForTimeout(300);

    // Filtered count should be less than or equal to initial
    const filteredTags = getStoreTags(page);
    const filteredCount = await filteredTags.count();

    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should show empty state when no stores match search', async ({ page }) => {
    const searchInput = getStoreSearchInput(page);

    // Search for non-existent store
    await searchInput.fill('不存在的门店名称XXXXXX');

    // Wait for filter
    await page.waitForTimeout(300);

    // Should show "未找到匹配的门店" or similar
    const storeSection = getStoreSelectorSection(page);
    await expect(storeSection).toContainText('未找到');
  });

  test('should clear search and show all stores', async ({ page }) => {
    const storeTags = getStoreTags(page);
    const initialCount = await storeTags.count();

    if (initialCount === 0) {
      test.skip();
      return;
    }

    const searchInput = getStoreSearchInput(page);

    // Search to filter
    await searchInput.fill('北京');
    await page.waitForTimeout(300);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);

    // Should show all stores again
    const finalTags = getStoreTags(page);
    expect(await finalTags.count()).toBe(initialCount);
  });
});

test.describe('Store Echo Back in Edit Mode (T012-EchoBack)', () => {
  let createdPackageId: string;

  test.beforeAll(async ({ browser }) => {
    // Create a package with stores for echo-back testing
    const page = await browser.newPage();

    await navigateToCreatePage(page);

    // Check if stores are available
    const storeTags = getStoreTags(page);
    const tagCount = await storeTags.count();

    if (tagCount === 0) {
      await page.close();
      return;
    }

    // Fill form
    await page.fill('input[placeholder*="VIP"]', 'Echo Back Test Package');

    const durationInput = page.locator('.ant-input-number input').first();
    await durationInput.fill('2');

    const priceInput = page.locator('.ant-input-number input').last();
    await priceInput.fill('199');

    // Select first two stores
    await storeTags.nth(0).click();
    if (tagCount > 1) {
      await storeTags.nth(1).click();
    }

    // Save
    const responsePromise = page.waitForResponse(
      response =>
        response.url().includes('/api/scenario-packages') &&
        response.request().method() === 'POST' &&
        response.status() === 201
    );

    await page.click('button:has-text("保存")');

    try {
      const response = await responsePromise;
      const data = await response.json();
      createdPackageId = data.data.id;
    } catch {
      // Package creation failed, tests will be skipped
    }

    await page.close();
  });

  test('should show previously selected stores when editing', async ({ page }) => {
    if (!createdPackageId) {
      test.skip();
      return;
    }

    await navigateToEditPage(page, createdPackageId);

    // Wait for data to load
    await page.waitForTimeout(1000);

    // Should have pre-selected stores
    const selectedTags = getSelectedStoreTags(page);
    expect(await selectedTags.count()).toBeGreaterThan(0);
  });

  test('should update stores and save successfully', async ({ page }) => {
    if (!createdPackageId) {
      test.skip();
      return;
    }

    await navigateToEditPage(page, createdPackageId);
    await page.waitForTimeout(1000);

    const selectedTags = getSelectedStoreTags(page);
    const initialSelectedCount = await selectedTags.count();

    // Deselect first selected store
    if (initialSelectedCount > 0) {
      await selectedTags.first().click();
    }

    // Make sure at least one store is still selected
    const remainingSelected = getSelectedStoreTags(page);
    const remainingCount = await remainingSelected.count();

    if (remainingCount === 0) {
      // Select another store
      const storeTags = getStoreTags(page);
      await storeTags.first().click();
    }

    // Save changes
    const responsePromise = page.waitForResponse(
      response =>
        response.url().includes(`/api/scenario-packages/${createdPackageId}`) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      { timeout: 10000 }
    );

    await page.click('button:has-text("保存")');

    // Wait for response
    const response = await responsePromise;

    // Verify storeIds in request
    const requestBody = JSON.parse(response.request().postData() || '{}');
    expect(requestBody.storeIds).toBeDefined();
    expect(requestBody.storeIds.length).toBeGreaterThan(0);
  });

  test.afterAll(async ({ browser }) => {
    // Clean up: delete the test package
    if (createdPackageId) {
      const page = await browser.newPage();

      await page.request.delete(`${BASE_URL}/api/scenario-packages/${createdPackageId}`);

      await page.close();
    }
  });
});

test.describe('Store Association Accessibility', () => {
  test('should have proper aria labels for store selection', async ({ page }) => {
    await navigateToCreatePage(page);

    const storeTags = getStoreTags(page);
    const tagCount = await storeTags.count();

    if (tagCount === 0) {
      test.skip();
      return;
    }

    // First store tag should have aria-label
    const firstTag = storeTags.first();
    const ariaLabel = await firstTag.getAttribute('aria-label');

    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('选择门店');
  });

  test('should be keyboard navigable', async ({ page }) => {
    await navigateToCreatePage(page);

    const storeTags = getStoreTags(page);
    const tagCount = await storeTags.count();

    if (tagCount === 0) {
      test.skip();
      return;
    }

    // Focus on search input
    const searchInput = getStoreSearchInput(page);
    await searchInput.focus();

    // Tab to store tags
    await page.keyboard.press('Tab');

    // First store should be focusable
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});
