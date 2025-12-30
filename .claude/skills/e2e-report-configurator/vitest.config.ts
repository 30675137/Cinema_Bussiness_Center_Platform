/**
 * @spec T006-e2e-report-configurator
 * Vitest configuration for E2E Report Configurator skill
 */

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: ['scripts/**/*.ts'],
      exclude: [
        'scripts/**/*.test.ts',
        'scripts/**/*.spec.ts',
        'scripts/types.ts' // Type definitions only
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
    alias: {
      '@': path.resolve(__dirname, './scripts')
    }
  }
})
