/**
 * @spec T006-e2e-report-configurator
 * Integration tests for multi-format reporter setup (HTML+JSON, HTML+JSON+JUnit)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdir, writeFile, rm, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { parseSkillOptions } from '@/options-parser'
import { buildDirectoryStructure, getRequiredDirectories } from '@/directory-builder'
import { createDirectories } from '@/directory-manager'
import { generateReporterArray, generateArtifactRetentionPolicy } from '@/config-generator'
import { updatePlaywrightConfig } from '@/config-updater'
import { updateGitignore } from '@/gitignore-updater'
import { setupCommand } from '@/index'

describe('Multi-Format Reporter Integration', () => {
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

  describe('HTML + JSON setup', () => {
    it('should setup HTML and JSON reporters', async () => {
      // Parse options
      const options = parseSkillOptions({
        format: 'html,json'
      })

      expect(options.format).toBe('html,json')

      // Build directory structure
      const structure = buildDirectoryStructure(options.output)

      // Get required directories
      const requiredDirs = getRequiredDirectories(structure, options.format)

      expect(requiredDirs).toEqual([
        'reports/e2e/html',
        'reports/e2e/json',
        'reports/e2e/artifacts',
        'reports/e2e/artifacts/screenshots',
        'reports/e2e/artifacts/videos',
        'reports/e2e/artifacts/traces'
      ])

      // Create directories
      const absoluteDirs = requiredDirs.map((dir) => join(testDir, dir))
      const createResult = await createDirectories(absoluteDirs)

      expect(createResult.created.length).toBe(6)

      // Generate reporter array
      const reporters = generateReporterArray({
        html: structure.htmlDir,
        json: `${structure.jsonDir}/results.json`
      })

      expect(reporters).toHaveLength(3) // HTML + JSON + list
      expect(reporters[0]).toEqual(['html', {
        outputFolder: 'reports/e2e/html',
        open: 'never'
      }])
      expect(reporters[1]).toEqual(['json', {
        outputFile: 'reports/e2e/json/results.json'
      }])
      expect(reporters[2]).toEqual(['list'])

      // Update config
      const artifactPolicy = generateArtifactRetentionPolicy(options.artifacts)
      const updateResult = await updatePlaywrightConfig(
        configPath,
        reporters,
        artifactPolicy
      )

      expect(updateResult.success).toBe(true)

      // Verify config
      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("['html', { outputFolder: 'reports/e2e/html'")
      expect(updatedConfig).toContain("['json', { outputFile: 'reports/e2e/json/results.json' }]")
      expect(updatedConfig).toContain("['list']")
    })

    it('should use setupCommand for HTML+JSON', async () => {
      const result = await setupCommand(
        { format: 'html,json' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)
      expect(result.details.directoriesCreated).toBe(6)
      expect(result.details.configUpdated).toBe(true)
      expect(result.details.gitignoreUpdated).toBe(true)

      // Verify message
      expect(result.message).toContain('html, json')
      expect(result.message).toContain('Created 6 directories')

      // Verify config
      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("['json',")
    })
  })

  describe('HTML + JSON + JUnit setup', () => {
    it('should setup all three reporter formats', async () => {
      // Parse options
      const options = parseSkillOptions({
        format: 'html,json,junit'
      })

      expect(options.format).toBe('html,json,junit')

      // Build directory structure
      const structure = buildDirectoryStructure(options.output)

      // Get required directories
      const requiredDirs = getRequiredDirectories(structure, options.format)

      expect(requiredDirs).toEqual([
        'reports/e2e/html',
        'reports/e2e/json',
        'reports/e2e/junit',
        'reports/e2e/artifacts',
        'reports/e2e/artifacts/screenshots',
        'reports/e2e/artifacts/videos',
        'reports/e2e/artifacts/traces'
      ])

      // Create directories
      const absoluteDirs = requiredDirs.map((dir) => join(testDir, dir))
      const createResult = await createDirectories(absoluteDirs)

      expect(createResult.created.length).toBe(7)

      // Generate reporter array
      const reporters = generateReporterArray({
        html: structure.htmlDir,
        json: `${structure.jsonDir}/results.json`,
        junit: `${structure.junitDir}/results.xml`
      })

      expect(reporters).toHaveLength(4) // HTML + JSON + JUnit + list
      expect(reporters[0][0]).toBe('html')
      expect(reporters[1][0]).toBe('json')
      expect(reporters[2][0]).toBe('junit')
      expect(reporters[3][0]).toBe('list')

      // Verify JUnit config
      expect(reporters[2]).toEqual(['junit', {
        outputFile: 'reports/e2e/junit/results.xml'
      }])

      // Update config
      const artifactPolicy = generateArtifactRetentionPolicy(options.artifacts)
      const updateResult = await updatePlaywrightConfig(
        configPath,
        reporters,
        artifactPolicy
      )

      expect(updateResult.success).toBe(true)

      // Verify config
      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("['html',")
      expect(updatedConfig).toContain("['json',")
      expect(updatedConfig).toContain("['junit',")
      expect(updatedConfig).toContain("outputFile: 'reports/e2e/junit/results.xml'")
    })

    it('should use setupCommand for all formats', async () => {
      const result = await setupCommand(
        { format: 'html,json,junit' },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)
      expect(result.details.directoriesCreated).toBe(7)
      expect(result.details.configUpdated).toBe(true)

      // Verify message
      expect(result.message).toContain('html, json, junit')
      expect(result.message).toContain('Created 7 directories')

      // Verify all reporters in config
      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("['html',")
      expect(updatedConfig).toContain("['json',")
      expect(updatedConfig).toContain("['junit',")
    })
  })

  describe('Custom output with multi-format', () => {
    it('should handle custom output directory with JSON', async () => {
      const result = await setupCommand(
        {
          format: 'html,json',
          output: 'test-reports'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("outputFolder: 'test-reports/html'")
      expect(updatedConfig).toContain("outputFile: 'test-reports/json/results.json'")

      const gitignoreContent = await readFile(gitignorePath, 'utf-8')
      expect(gitignoreContent).toContain('test-reports/')
    })

    it('should handle custom output directory with all formats', async () => {
      const result = await setupCommand(
        {
          format: 'html,json,junit',
          output: 'custom/reports'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("outputFolder: 'custom/reports/html'")
      expect(updatedConfig).toContain("outputFile: 'custom/reports/json/results.json'")
      expect(updatedConfig).toContain("outputFile: 'custom/reports/junit/results.xml'")
    })
  })

  describe('Format combinations', () => {
    it('should handle HTML+JUnit without JSON', async () => {
      const options = parseSkillOptions({
        format: 'html,junit'
      })

      const structure = buildDirectoryStructure(options.output)
      const requiredDirs = getRequiredDirectories(structure, options.format)

      expect(requiredDirs).toContain('reports/e2e/html')
      expect(requiredDirs).toContain('reports/e2e/junit')
      expect(requiredDirs).not.toContain('reports/e2e/json')

      const reporters = generateReporterArray({
        html: structure.htmlDir,
        junit: `${structure.junitDir}/results.xml`
      })

      expect(reporters).toHaveLength(3) // HTML + JUnit + list
      expect(reporters[0][0]).toBe('html')
      expect(reporters[1][0]).toBe('junit')
      expect(reporters[2][0]).toBe('list')
    })

    it('should reject format without HTML', async () => {
      expect(() => parseSkillOptions({ format: 'json' })).toThrow(
        'HTML reporter is mandatory'
      )

      expect(() => parseSkillOptions({ format: 'json,junit' })).toThrow(
        'HTML reporter is mandatory'
      )
    })

    it('should handle formats with spaces', async () => {
      const options = parseSkillOptions({
        format: 'html, json, junit'
      })

      expect(options.format).toBe('html,json,junit')

      const structure = buildDirectoryStructure(options.output)
      const reporters = generateReporterArray({
        html: structure.htmlDir,
        json: `${structure.jsonDir}/results.json`,
        junit: `${structure.junitDir}/results.xml`
      })

      expect(reporters).toHaveLength(4)
    })

    it('should handle duplicate formats', async () => {
      const options = parseSkillOptions({
        format: 'html,html,json'
      })

      // Should deduplicate
      expect(options.format).toBe('html,json')
    })
  })

  describe('Idempotent multi-format setup', () => {
    it('should be idempotent for HTML+JSON+JUnit', async () => {
      // First run
      const firstRun = await setupCommand(
        { format: 'html,json,junit' },
        configPath,
        gitignorePath
      )

      expect(firstRun.success).toBe(true)
      expect(firstRun.details.directoriesCreated).toBe(7)

      // Second run
      const secondRun = await setupCommand(
        { format: 'html,json,junit' },
        configPath,
        gitignorePath
      )

      expect(secondRun.success).toBe(true)
      expect(secondRun.details.directoriesCreated).toBe(0)
      expect(secondRun.details.directoriesExisted).toBe(7)
      expect(secondRun.details.configUpdated).toBe(true)
      expect(secondRun.details.gitignoreUpdated).toBe(false) // Already present
    })
  })

  describe('Artifact policies with multi-format', () => {
    it('should apply artifact policy to all formats', async () => {
      const result = await setupCommand(
        {
          format: 'html,json,junit',
          artifacts: 'always'
        },
        configPath,
        gitignorePath
      )

      expect(result.success).toBe(true)

      const updatedConfig = await readFile(configPath, 'utf-8')
      expect(updatedConfig).toContain("screenshot: 'on'")
      expect(updatedConfig).toContain("video: 'on'")
      expect(updatedConfig).toContain("trace: 'on'")

      // All reporters present
      expect(updatedConfig).toContain("['html',")
      expect(updatedConfig).toContain("['json',")
      expect(updatedConfig).toContain("['junit',")
    })

    it('should apply never policy to all formats', async () => {
      const result = await setupCommand(
        {
          format: 'html,json',
          artifacts: 'never'
        },
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
})
