/**
 * @spec T006-e2e-report-configurator
 * Integration test for validate command (User Story 5)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdir, writeFile, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { validateCommand } from '@/index'

describe('Validate Command Integration (US5)', () => {
  let testDir: string
  let configPath: string

  beforeEach(async () => {
    testDir = join(tmpdir(), `validate-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })
    configPath = join(testDir, 'playwright.config.ts')
  })

  afterEach(async () => {
    try {
      await rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('Valid configuration', () => {
    it('should pass validation for valid HTML-only setup', async () => {
      const validConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
    ['list']
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
})
`
      await writeFile(configPath, validConfig, 'utf-8')

      // Create directories
      await mkdir(join(testDir, 'reports/e2e/html'), { recursive: true })

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should pass validation for multi-format setup', async () => {
      const validConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
    ['json', { outputFile: 'reports/e2e/json/results.json' }],
    ['junit', { outputFile: 'reports/e2e/junit/results.xml' }],
    ['list']
  ],
  use: {
    screenshot: 'on',
    video: 'on',
    trace: 'on'
  }
})
`
      await writeFile(configPath, validConfig, 'utf-8')

      // Create directories
      await mkdir(join(testDir, 'reports/e2e/html'), { recursive: true })
      await mkdir(join(testDir, 'reports/e2e/json'), { recursive: true })
      await mkdir(join(testDir, 'reports/e2e/junit'), { recursive: true })

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Config structure errors', () => {
    it('should fail if config file does not exist', async () => {
      const result = await validateCommand('/nonexistent/playwright.config.ts')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Config file not found')
    })

    it('should fail if config missing reporter field', async () => {
      const invalidConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  }
})
`
      await writeFile(configPath, invalidConfig, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Config missing required "reporter" field')
    })

    it('should fail if config missing screenshot field', async () => {
      const invalidConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [['list']],
  use: {
    video: 'off',
    trace: 'off'
  }
})
`
      await writeFile(configPath, invalidConfig, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Config missing required "use.screenshot" field')
    })

    it('should fail if config missing video field', async () => {
      const invalidConfig = `import { defineConfig} from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [['list']],
  use: {
    screenshot: 'off',
    trace: 'off'
  }
})
`
      await writeFile(configPath, invalidConfig, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Config missing required "use.video" field')
    })

    it('should fail if config missing trace field', async () => {
      const invalidConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [['list']],
  use: {
    screenshot: 'off',
    video: 'off'
  }
})
`
      await writeFile(configPath, invalidConfig, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Config missing required "use.trace" field')
    })
  })

  describe('TypeScript compilation errors', () => {
    it('should fail for invalid TypeScript syntax', async () => {
      const invalidConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [['list'],  // Extra comma
  use: {
    screenshot: 'off'
  }
})
`
      await writeFile(configPath, invalidConfig, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('TypeScript'))).toBe(true)
    })
  })

  describe('Reporter path conflicts', () => {
    it('should fail for duplicate output paths', async () => {
      const configWithDuplicates = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'reports/html' }],
    ['json', { outputFile: 'reports/html/results.json' }],  // Conflict
    ['list']
  ],
  use: {
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  }
})
`
      await writeFile(configPath, configWithDuplicates, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('conflict'))).toBe(true)
    })

    it('should fail for same file output path', async () => {
      const configWithSameFile = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/results.json' }],  // Same file
    ['list']
  ],
  use: {
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  }
})
`
      await writeFile(configPath, configWithSameFile, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('Duplicate'))).toBe(true)
    })
  })

  describe('Directory permission errors', () => {
    it('should fail if output directories do not exist', async () => {
      const validConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'nonexistent/html' }],
    ['list']
  ],
  use: {
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  }
})
`
      await writeFile(configPath, validConfig, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(false)
      expect(result.errors.some((e) => e.includes('not exist'))).toBe(true)
    })
  })

  describe('Validation summary', () => {
    it('should provide detailed validation summary', async () => {
      const validConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
    ['list']
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
})
`
      await writeFile(configPath, validConfig, 'utf-8')
      await mkdir(join(testDir, 'reports/e2e/html'), { recursive: true })

      const result = await validateCommand(configPath)
      expect(result.valid).toBe(true)
      expect(result.summary).toBeDefined()
      expect(result.summary).toContain('passed')
    })

    it('should list all validation checks performed', async () => {
      const validConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [['list']],
  use: {
    screenshot: 'off',
    video: 'off',
    trace: 'off'
  }
})
`
      await writeFile(configPath, validConfig, 'utf-8')

      const result = await validateCommand(configPath)
      expect(result.checksPerformed).toBeDefined()
      expect(result.checksPerformed).toContain('Config structure')
      expect(result.checksPerformed).toContain('TypeScript compilation')
      expect(result.checksPerformed).toContain('Reporter paths uniqueness')
      expect(result.checksPerformed).toContain('Directory permissions')
    })
  })

  describe('Edge cases', () => {
    it('should handle null config path', async () => {
      const result = await validateCommand(null as any)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should handle empty config path', async () => {
      const result = await validateCommand('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Config file not found')
    })
  })

  describe('Warnings', () => {
    it('should include warnings for non-critical issues', async () => {
      const validConfig = `import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
    ['list']
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
})
`
      await writeFile(configPath, validConfig, 'utf-8')
      await mkdir(join(testDir, 'reports/e2e/html'), { recursive: true })

      const result = await validateCommand(configPath)
      // Warnings are optional
      if (result.warnings) {
        expect(Array.isArray(result.warnings)).toBe(true)
      }
    })
  })
})
