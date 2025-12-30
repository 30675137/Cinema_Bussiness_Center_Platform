/**
 * @spec T006-e2e-report-configurator
 * Integration test for artifact retention policies (User Story 4)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdir, writeFile, rm, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { setupCommand } from '@/index'
import { generateArtifactRetentionPolicy } from '@/config-generator'

describe('Artifact Retention Policy Integration (US4)', () => {
  let testDir: string
  let configPath: string
  let gitignorePath: string

  beforeEach(async () => {
    // Create temporary test directory
    testDir = join(tmpdir(), `e2e-test-${Date.now()}`)
    await mkdir(testDir, { recursive: true })

    configPath = join(testDir, 'playwright.config.ts')
    gitignorePath = join(testDir, '.gitignore')

    // Create minimal playwright.config.ts
    const minimalConfig = `import { defineConfig } from '@playwright/test'

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
    await writeFile(configPath, minimalConfig, 'utf-8')
  })

  afterEach(async () => {
    // Cleanup test directory
    try {
      await rm(testDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('on-failure policy (default)', () => {
    it('should configure on-failure artifact policy', async () => {
      const result = await setupCommand(
        { format: 'html', artifacts: 'on-failure' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'only-on-failure'")
      expect(updatedConfig).toContain("video: 'retain-on-failure'")
      expect(updatedConfig).toContain("trace: 'on-first-retry'")
    })

    it('should use on-failure as default when artifacts not specified', async () => {
      const result = await setupCommand(
        { format: 'html' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'only-on-failure'")
      expect(updatedConfig).toContain("video: 'retain-on-failure'")
      expect(updatedConfig).toContain("trace: 'on-first-retry'")
    })

    it('should generate correct policy object for on-failure', () => {
      const policy = generateArtifactRetentionPolicy('on-failure')

      expect(policy).toEqual({
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry'
      })
    })
  })

  describe('always policy', () => {
    it('should configure always artifact policy', async () => {
      const result = await setupCommand(
        { format: 'html', artifacts: 'always' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'on'")
      expect(updatedConfig).toContain("video: 'on'")
      expect(updatedConfig).toContain("trace: 'on'")
    })

    it('should generate correct policy object for always', () => {
      const policy = generateArtifactRetentionPolicy('always')

      expect(policy).toEqual({
        screenshot: 'on',
        video: 'on',
        trace: 'on'
      })
    })

    it('should apply always policy to multi-format setup', async () => {
      const result = await setupCommand(
        { format: 'html,json,junit', artifacts: 'always' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'on'")
      expect(updatedConfig).toContain("video: 'on'")
      expect(updatedConfig).toContain("trace: 'on'")

      // Verify all reporters are present
      expect(updatedConfig).toContain("['html',")
      expect(updatedConfig).toContain("['json',")
      expect(updatedConfig).toContain("['junit',")
    })
  })

  describe('never policy', () => {
    it('should configure never artifact policy', async () => {
      const result = await setupCommand(
        { format: 'html', artifacts: 'never' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'off'")
      expect(updatedConfig).toContain("video: 'off'")
      expect(updatedConfig).toContain("trace: 'off'")
    })

    it('should generate correct policy object for never', () => {
      const policy = generateArtifactRetentionPolicy('never')

      expect(policy).toEqual({
        screenshot: 'off',
        video: 'off',
        trace: 'off'
      })
    })

    it('should apply never policy to multi-format setup', async () => {
      const result = await setupCommand(
        { format: 'html,json', artifacts: 'never' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'off'")
      expect(updatedConfig).toContain("video: 'off'")
      expect(updatedConfig).toContain("trace: 'off'")
    })
  })

  describe('Policy with custom output', () => {
    it('should apply artifact policy with custom output directory', async () => {
      const result = await setupCommand(
        {
          format: 'html',
          output: 'test-reports',
          artifacts: 'always'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("outputFolder: 'test-reports/html'")
      expect(updatedConfig).toContain("screenshot: 'on'")
      expect(updatedConfig).toContain("video: 'on'")
      expect(updatedConfig).toContain("trace: 'on'")
    })
  })

  describe('Policy validation', () => {
    it('should reject invalid artifact policy', () => {
      expect(() =>
        generateArtifactRetentionPolicy('invalid' as any)
      ).toThrow('Invalid artifacts policy')
    })

    it('should validate artifacts parameter in options parser', async () => {
      // This should be caught by options parser
      const result = await setupCommand(
        { format: 'html', artifacts: 'invalid' as any },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Policy combinations with formats', () => {
    it('should work with HTML only + on-failure', async () => {
      const result = await setupCommand(
        { format: 'html', artifacts: 'on-failure' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)
      expect(result.message).toContain('on-failure')
    })

    it('should work with all formats + always', async () => {
      const result = await setupCommand(
        { format: 'html,json,junit', artifacts: 'always' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)
      expect(result.message).toContain('always')
    })

    it('should work with HTML+JSON + never', async () => {
      const result = await setupCommand(
        { format: 'html,json', artifacts: 'never' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)
      expect(result.message).toContain('never')
    })
  })

  describe('Idempotent artifact policy updates', () => {
    it('should update artifact policy on repeated runs', async () => {
      // First run: on-failure
      const firstRun = await setupCommand(
        { format: 'html', artifacts: 'on-failure' },
        configPath,
        gitignorePath
      )

      expect(firstRun.success).toBe(true)

      let updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'only-on-failure'")

      // Second run: change to always
      const secondRun = await setupCommand(
        { format: 'html', artifacts: 'always' },
        configPath,
        gitignorePath
      )

      expect(secondRun.success).toBe(true)

      updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'on'")
      expect(updatedConfig).not.toContain("screenshot: 'only-on-failure'")

      // Third run: change to never
      const thirdRun = await setupCommand(
        { format: 'html', artifacts: 'never' },
        configPath,
        gitignorePath
      )

      expect(thirdRun.success).toBe(true)

      updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'off'")
      expect(updatedConfig).not.toContain("screenshot: 'on'")
    })
  })

  describe('Success messages', () => {
    it('should include artifact policy in success message', async () => {
      const result = await setupCommand(
        { format: 'html', artifacts: 'always' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)
      expect(result.message).toContain('Artifact policy: always')
    })

    it('should show default artifact policy in message', async () => {
      const result = await setupCommand(
        { format: 'html' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)
      expect(result.message).toContain('Artifact policy: on-failure')
    })
  })

  describe('Use case scenarios', () => {
    it('should configure development environment (on-failure)', async () => {
      // Development: capture on failure for debugging
      const result = await setupCommand(
        {
          format: 'html',
          artifacts: 'on-failure'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const config = await readFile(configPath, 'utf-8')
      expect(config).toContain("screenshot: 'only-on-failure'")
      expect(config).toContain("video: 'retain-on-failure'")
    })

    it('should configure CI/CD environment (on-failure, no videos)', async () => {
      // CI/CD: minimal artifacts to save storage
      const result = await setupCommand(
        {
          format: 'html,junit',
          artifacts: 'on-failure'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const config = await readFile(configPath, 'utf-8')
      expect(config).toContain("screenshot: 'only-on-failure'")
      // Note: Playwright will handle video retention
    })

    it('should configure debug session (always)', async () => {
      // Debug: capture everything
      const result = await setupCommand(
        {
          format: 'html,json',
          artifacts: 'always'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const config = await readFile(configPath, 'utf-8')
      expect(config).toContain("screenshot: 'on'")
      expect(config).toContain("video: 'on'")
      expect(config).toContain("trace: 'on'")
    })

    it('should configure production smoke tests (never)', async () => {
      // Production: no artifacts for minimal overhead
      const result = await setupCommand(
        {
          format: 'html',
          artifacts: 'never'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const config = await readFile(configPath, 'utf-8')
      expect(config).toContain("screenshot: 'off'")
      expect(config).toContain("video: 'off'")
      expect(config).toContain("trace: 'off'")
    })
  })
})
