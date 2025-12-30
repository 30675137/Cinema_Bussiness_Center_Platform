/**
 * @spec T003-e2e-runner
 * Vitest configuration for e2e-runner skill unit and integration tests
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['scripts/**/*.ts'],
      exclude: [
        'scripts/**/*.test.ts',
        'scripts/**/*.spec.ts',
        'node_modules/',
        'dist/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './scripts'),
    },
  },
});
