import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: '../scenarios', // Changed to support scenario-based tests
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: '../reports/e2e/html', open: 'never' }],
    ['json', { outputFile: '../reports/e2e/json/results.json' }],
    ['junit', { outputFile: '../reports/e2e/junit/results.xml' }],
    ['list'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // Note: Set to undefined for cross-system tests (C-end + B-end)
    // Each test should specify full URLs (http://localhost:3000 or http://localhost:10086)
    baseURL: process.env.CROSS_SYSTEM_TEST ? undefined : 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run dev servers for cross-system tests */
  // Enable webServer for cross-system E2E tests (C-end + B-end)
  webServer: process.env.CROSS_SYSTEM_TEST
    ? [
        // C端 Taro H5 开发服务器
        {
          command: 'cd ../hall-reserve-taro && npm run dev:h5',
          url: 'http://localhost:10086',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000, // 2 minutes
          stdout: 'pipe',
          stderr: 'pipe',
        },
        // B端 React Admin 开发服务器
        {
          command: 'npm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
      ]
    : undefined,
});
