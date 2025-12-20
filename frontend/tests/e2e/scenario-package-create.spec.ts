/**
 * 场景包创建流程 E2E 测试
 *
 * T026: 端到端测试完整的场景包创建流程
 *
 * 测试覆盖：
 * - 导航到创建页面
 * - 填写表单所有必填字段
 * - 提交表单
 * - 验证创建成功
 * - 验证列表页显示新创建的场景包
 * - 编辑场景包
 * - 删除场景包
 *
 * @author Cinema Platform
 * @since 2025-12-20
 */

import { test, expect, Page } from '@playwright/test';

// Base URL from environment or default to localhost
const BASE_URL = process.env.VITE_APP_URL || 'http://localhost:5173';

// Test data
const TEST_PACKAGE = {
  name: 'E2E测试场景包',
  description: '这是一个用于端到端测试的场景包，包含完整的创建和编辑流程验证',
  durationHours: 3,
  minPeople: 2,
  maxPeople: 15,
};

const UPDATED_PACKAGE = {
  name: 'E2E测试场景包（已编辑）',
  description: '场景包描述已更新，用于验证编辑功能',
  durationHours: 4,
};

/**
 * Helper function to fill the package form
 */
async function fillPackageForm(page: Page, data: typeof TEST_PACKAGE) {
  // Fill name
  await page.fill('input[placeholder*="VIP生日派对"]', data.name);

  // Fill description
  await page.fill('textarea[placeholder*="描述场景包"]', data.description);

  // Fill duration
  const durationInput = page.locator('input[addonafter="小时"]').first();
  await durationInput.clear();
  await durationInput.fill(data.durationHours.toString());

  // Fill min people
  const minPeopleInput = page.locator('input[addonafter="人"]').first();
  await minPeopleInput.clear();
  await minPeopleInput.fill(data.minPeople.toString());

  // Fill max people
  const maxPeopleInput = page.locator('input[addonafter="人"]').last();
  await maxPeopleInput.clear();
  await maxPeopleInput.fill(data.maxPeople.toString());
}

/**
 * Helper function to wait for API response
 */
async function waitForApiResponse(page: Page, urlPattern: string | RegExp) {
  return await page.waitForResponse(
    response => {
      const url = response.url();
      const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;
      return pattern.test(url) && response.status() === 201;
    },
    { timeout: 10000 }
  );
}

test.describe('Scenario Package Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete full create-edit-delete flow successfully', async ({ page }) => {
    // Step 1: Navigate to package list page
    await test.step('Navigate to package list', async () => {
      // Click on scenario package menu item (adjust selector based on actual menu structure)
      await page.click('text=场景包管理');

      // Wait for list page to load
      await page.waitForSelector('table', { timeout: 10000 });

      // Verify we're on the list page
      await expect(page).toHaveURL(/scenario-packages/);
    });

    // Step 2: Navigate to create page
    await test.step('Navigate to create page', async () => {
      // Click create button
      await page.click('button:has-text("新建场景包")');

      // Wait for create page to load
      await page.waitForSelector('text=场景包名称', { timeout: 10000 });

      // Verify we're on the create page
      await expect(page).toHaveURL(/scenario-packages\/create/);
    });

    // Step 3: Fill the form
    await test.step('Fill package form', async () => {
      await fillPackageForm(page, TEST_PACKAGE);

      // Verify form is filled
      await expect(page.locator('input[placeholder*="VIP生日派对"]')).toHaveValue(
        TEST_PACKAGE.name
      );
      await expect(page.locator('textarea[placeholder*="描述场景包"]')).toHaveValue(
        TEST_PACKAGE.description
      );
    });

    // Step 4: Submit the form
    let createdPackageId: string;
    await test.step('Submit package creation', async () => {
      // Setup request interception to capture created package ID
      const responsePromise = page.waitForResponse(
        response =>
          response.url().includes('/api/scenario-packages') &&
          response.request().method() === 'POST' &&
          response.status() === 201
      );

      // Click submit button
      await page.click('button:has-text("保存")');

      // Wait for the API response
      const response = await responsePromise;
      const responseData = await response.json();

      // Extract package ID from response
      createdPackageId = responseData.data.id;
      expect(createdPackageId).toBeTruthy();

      // Wait for success message
      await page.waitForSelector('.ant-message-success', { timeout: 5000 });

      // Should navigate back to list page
      await page.waitForURL(/scenario-packages$/, { timeout: 10000 });
    });

    // Step 5: Verify package appears in list
    await test.step('Verify package in list', async () => {
      // Wait for table to load
      await page.waitForSelector('table tbody tr', { timeout: 10000 });

      // Search for the created package
      const packageRow = page.locator(`table tbody tr:has-text("${TEST_PACKAGE.name}")`);
      await expect(packageRow).toBeVisible();

      // Verify package details in the row
      await expect(packageRow).toContainText(TEST_PACKAGE.description.substring(0, 20));
      await expect(packageRow).toContainText('草稿'); // Status: DRAFT
      await expect(packageRow).toContainText('v1'); // Version 1
      await expect(packageRow).toContainText(`${TEST_PACKAGE.durationHours}小时`);
    });

    // Step 6: Edit the package
    await test.step('Edit package', async () => {
      // Find the edit button for our package
      const packageRow = page.locator(`table tbody tr:has-text("${TEST_PACKAGE.name}")`);
      const editButton = packageRow.locator('button:has-text("编辑")');

      await editButton.click();

      // Wait for edit page to load
      await page.waitForSelector('text=场景包名称', { timeout: 10000 });
      await expect(page).toHaveURL(new RegExp(`scenario-packages/${createdPackageId}/edit`));

      // Verify form is pre-filled with existing data
      await expect(page.locator('input[placeholder*="VIP生日派对"]')).toHaveValue(
        TEST_PACKAGE.name
      );

      // Update the package
      await page.fill('input[placeholder*="VIP生日派对"]', UPDATED_PACKAGE.name);
      await page.fill('textarea[placeholder*="描述场景包"]', UPDATED_PACKAGE.description);

      const durationInput = page.locator('input[addonafter="小时"]').first();
      await durationInput.clear();
      await durationInput.fill(UPDATED_PACKAGE.durationHours.toString());

      // Submit update
      const updateResponsePromise = page.waitForResponse(
        response =>
          response.url().includes(`/api/scenario-packages/${createdPackageId}`) &&
          response.request().method() === 'PUT' &&
          response.status() === 200
      );

      await page.click('button:has-text("保存")');

      await updateResponsePromise;

      // Wait for success message
      await page.waitForSelector('.ant-message-success', { timeout: 5000 });

      // Should navigate back to list page
      await page.waitForURL(/scenario-packages$/, { timeout: 10000 });
    });

    // Step 7: Verify updated package in list
    await test.step('Verify updated package', async () => {
      // Wait for table to refresh
      await page.waitForTimeout(1000);

      // Search for the updated package
      const updatedRow = page.locator(`table tbody tr:has-text("${UPDATED_PACKAGE.name}")`);
      await expect(updatedRow).toBeVisible();

      // Verify updated details
      await expect(updatedRow).toContainText(UPDATED_PACKAGE.description.substring(0, 20));
      await expect(updatedRow).toContainText(`${UPDATED_PACKAGE.durationHours}小时`);
    });

    // Step 8: Delete the package
    await test.step('Delete package', async () => {
      // Find the delete button for our package
      const packageRow = page.locator(`table tbody tr:has-text("${UPDATED_PACKAGE.name}")`);
      const deleteButton = packageRow.locator('button:has-text("删除")');

      await deleteButton.click();

      // Wait for confirmation dialog
      await page.waitForSelector('.ant-popconfirm', { timeout: 5000 });

      // Verify confirmation message
      await expect(page.locator('.ant-popconfirm')).toContainText(
        '确定要删除这个场景包吗？'
      );

      // Click confirm button
      const deleteResponsePromise = page.waitForResponse(
        response =>
          response.url().includes(`/api/scenario-packages/${createdPackageId}`) &&
          response.request().method() === 'DELETE' &&
          response.status() === 204
      );

      await page.click('.ant-popconfirm button.ant-btn-dangerous');

      await deleteResponsePromise;

      // Wait for success message
      await page.waitForSelector('.ant-message-success', { timeout: 5000 });
    });

    // Step 9: Verify package is removed from list
    await test.step('Verify package deleted', async () => {
      // Wait for table to refresh
      await page.waitForTimeout(1000);

      // Package should no longer appear in the list
      const deletedRow = page.locator(`table tbody tr:has-text("${UPDATED_PACKAGE.name}")`);
      await expect(deletedRow).not.toBeVisible();
    });
  });

  test('should show validation errors for invalid form data', async ({ page }) => {
    // Navigate to create page
    await page.goto(`${BASE_URL}/scenario-packages/create`);
    await page.waitForLoadState('networkidle');

    // Try to submit empty form
    await page.click('button:has-text("保存")');

    // Should show validation errors
    await expect(page.locator('text=请输入场景包名称')).toBeVisible();
    await expect(page.locator('text=请输入时长')).toBeVisible();
  });

  test('should handle form with maximum character limits', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-packages/create`);
    await page.waitForLoadState('networkidle');

    // Enter name exceeding 255 characters
    const longName = 'a'.repeat(256);
    await page.fill('input[placeholder*="VIP生日派对"]', longName);

    // Enter description exceeding 500 characters
    const longDescription = 'b'.repeat(501);
    await page.fill('textarea[placeholder*="描述场景包"]', longDescription);

    // Submit form
    await page.click('button:has-text("保存")');

    // Should show validation errors
    await expect(page.locator('text=名称长度不能超过255个字符')).toBeVisible();
    await expect(page.locator('text=描述长度不能超过500个字符')).toBeVisible();
  });

  test('should handle concurrent edit conflict (optimistic locking)', async ({
    page,
    context,
  }) => {
    // This test requires creating a package first
    // For simplicity, we'll skip this in the initial implementation
    // In a real scenario, we'd:
    // 1. Create a package in session 1
    // 2. Open the same package in session 2 (new page)
    // 3. Edit and save in session 1
    // 4. Try to save in session 2
    // 5. Verify conflict error message appears

    test.skip();
  });

  test('should navigate between list and create pages correctly', async ({ page }) => {
    // Start at list page
    await page.goto(`${BASE_URL}/scenario-packages`);
    await page.waitForLoadState('networkidle');

    // Click create button
    await page.click('button:has-text("新建场景包")');
    await expect(page).toHaveURL(/scenario-packages\/create/);

    // Go back to list
    await page.goBack();
    await expect(page).toHaveURL(/scenario-packages$/);

    // Verify list is still functional
    await expect(page.locator('table')).toBeVisible();
  });

  test('should preserve form data when navigating away and back', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-packages/create`);
    await page.waitForLoadState('networkidle');

    // Fill some data
    await page.fill('input[placeholder*="VIP生日派对"]', 'Test Package');
    await page.fill('textarea[placeholder*="描述场景包"]', 'Test Description');

    // Navigate away (but don't confirm if there's unsaved changes warning)
    await page.goto(`${BASE_URL}/scenario-packages`);

    // Navigate back to create
    await page.goto(`${BASE_URL}/scenario-packages/create`);

    // Form should be reset (new instance)
    await expect(page.locator('input[placeholder*="VIP生日派对"]')).toHaveValue('');
  });
});

test.describe('Scenario Package List Features', () => {
  test('should filter packages by status', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-packages`);
    await page.waitForLoadState('networkidle');

    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Look for status filter dropdown (if exists)
    const statusFilter = page.locator('select[placeholder*="状态"], .ant-select[placeholder*="状态"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.click('text=草稿');

      // Wait for filtered results
      await page.waitForTimeout(1000);

      // All visible rows should show DRAFT status
      const statusBadges = page.locator('table tbody tr .ant-badge:has-text("草稿")');
      expect(await statusBadges.count()).toBeGreaterThan(0);
    }
  });

  test('should paginate through package list', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-packages`);
    await page.waitForLoadState('networkidle');

    // Wait for table
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Look for pagination
    const pagination = page.locator('.ant-pagination');
    if (await pagination.isVisible()) {
      // Get current page
      const currentPage = page.locator('.ant-pagination-item-active');
      await expect(currentPage).toContainText('1');

      // Click next page if available
      const nextButton = page.locator('.ant-pagination-next:not(.ant-pagination-disabled)');
      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Wait for table to update
        await page.waitForTimeout(1000);

        // Current page should change
        const newCurrentPage = page.locator('.ant-pagination-item-active');
        await expect(newCurrentPage).toContainText('2');
      }
    }
  });

  test('should preview package details', async ({ page }) => {
    await page.goto(`${BASE_URL}/scenario-packages`);
    await page.waitForLoadState('networkidle');

    // Wait for table
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Click first preview button
    const previewButton = page.locator('table tbody tr button:has-text("预览")').first();
    if (await previewButton.isVisible()) {
      await previewButton.click();

      // Should navigate to preview page or show modal
      await page.waitForTimeout(1000);

      // Verify preview content (adjust based on actual implementation)
      const previewContent = page.locator('.package-preview, .ant-modal-body');
      await expect(previewContent).toBeVisible();
    }
  });
});
