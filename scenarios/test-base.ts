/**
 * @spec T002-e2e-test-generator
 * Shared test base - re-exports Playwright test for scenarios directory
 * This file allows test files in scenarios/ to import Playwright from frontend/node_modules
 */

// Re-export from @playwright/test package
// When this file is loaded, Node will resolve @playwright/test from the closest node_modules
// which is frontend/node_modules when running from frontend directory
export { test, expect } from '@playwright/test';
