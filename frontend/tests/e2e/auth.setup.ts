import { test as setup, expect } from '@playwright/test';

/**
 * Global setup for authentication
 * Sets up the access token in localStorage for all tests
 */
setup('authenticate', async ({ page }) => {
  // Navigate to a page in the app
  await page.goto('/');

  // Set the access token in localStorage
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'test-token-123');
  });

  // Optionally verify the token was set
  const token = await page.evaluate(() => localStorage.getItem('access_token'));
  expect(token).toBe('test-token-123');
});
