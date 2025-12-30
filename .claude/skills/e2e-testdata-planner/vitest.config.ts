/**
 * @spec T004-e2e-testdata-planner
 * Vitest configuration for E2E testdata planner
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['scripts/**/*.ts'],
      exclude: [
        'scripts/**/*.d.ts',
        'scripts/**/*.test.ts',
        'scripts/**/types.ts',
        'dist/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './scripts'),
      '@tests': path.resolve(__dirname, './tests'),
    },
  },
});
