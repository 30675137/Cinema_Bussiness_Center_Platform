/**
 * @spec T003-e2e-runner
 * Example Playwright test for integration testing
 */

import { test, expect } from '@playwright/test';

test('example test - should pass', async ({ page }) => {
  // This is a minimal test that always passes
  // Used for integration testing the e2e-runner skill
  expect(1 + 1).toBe(2);
});

test('example test - check page title', async ({ page, baseURL }) => {
  // Skip if no baseURL configured
  test.skip(!baseURL, 'baseURL not configured');

  await page.goto(baseURL!);
  // Just verify page loads without checking specific title
  expect(page).toBeTruthy();
});
