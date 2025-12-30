/**
 * @spec T006-e2e-report-configurator
 * Unit tests for reporter configuration generator
 */

import { describe, it, expect } from 'vitest'
import {
  generateHTMLReporterConfig,
  generateJSONReporterConfig,
  generateJUnitReporterConfig,
  generateReporterArray,
  generateArtifactRetentionPolicy
} from '@/config-generator'
import type { HTMLReporterConfig, JSONReporterConfig, JUnitReporterConfig } from '@/types'

describe('config-generator', () => {
  describe('generateHTMLReporterConfig', () => {
    it('should generate HTML reporter config with default settings', () => {
      const config = generateHTMLReporterConfig('reports/e2e/html')

      expect(config).toEqual<HTMLReporterConfig>({
        type: 'html',
        outputFolder: 'reports/e2e/html',
        open: 'never'
      })
    })

    it('should generate HTML reporter config with custom output folder', () => {
      const config = generateHTMLReporterConfig('test-reports/html')

      expect(config.outputFolder).toBe('test-reports/html')
    })

    it('should generate HTML reporter config with custom open option', () => {
      const config = generateHTMLReporterConfig('reports/e2e/html', 'on-failure')

      expect(config.open).toBe('on-failure')
    })

    it('should set type to "html"', () => {
      const config = generateHTMLReporterConfig('reports/e2e/html')

      expect(config.type).toBe('html')
    })
  })

  describe('generateJSONReporterConfig', () => {
    it('should generate JSON reporter config with default settings', () => {
      const config = generateJSONReporterConfig('reports/e2e/json/results.json')

      expect(config).toEqual<JSONReporterConfig>({
        type: 'json',
        outputFile: 'reports/e2e/json/results.json'
      })
    })

    it('should generate JSON reporter config with custom output file', () => {
      const config = generateJSONReporterConfig('test-reports/json/output.json')

      expect(config.outputFile).toBe('test-reports/json/output.json')
    })

    it('should set type to "json"', () => {
      const config = generateJSONReporterConfig('reports/e2e/json/results.json')

      expect(config.type).toBe('json')
    })
  })

  describe('generateJUnitReporterConfig', () => {
    it('should generate JUnit reporter config with default settings', () => {
      const config = generateJUnitReporterConfig('reports/e2e/junit/results.xml')

      expect(config).toEqual<JUnitReporterConfig>({
        type: 'junit',
        outputFile: 'reports/e2e/junit/results.xml'
      })
    })

    it('should generate JUnit reporter config with custom output file', () => {
      const config = generateJUnitReporterConfig('test-reports/junit/report.xml')

      expect(config.outputFile).toBe('test-reports/junit/report.xml')
    })

    it('should set type to "junit"', () => {
      const config = generateJUnitReporterConfig('reports/e2e/junit/results.xml')

      expect(config.type).toBe('junit')
    })
  })

  describe('generateReporterArray', () => {
    it('should generate reporter array for HTML only', () => {
      const reporters = generateReporterArray({
        html: 'reports/e2e/html'
      })

      expect(reporters).toHaveLength(2) // HTML + list
      expect(reporters[0]).toEqual(['html', {
        outputFolder: 'reports/e2e/html',
        open: 'never'
      }])
      expect(reporters[1]).toEqual(['list'])
    })

    it('should generate reporter array for HTML + JSON', () => {
      const reporters = generateReporterArray({
        html: 'reports/e2e/html',
        json: 'reports/e2e/json/results.json'
      })

      expect(reporters).toHaveLength(3) // HTML + JSON + list
      expect(reporters[0]).toEqual(['html', { outputFolder: 'reports/e2e/html', open: 'never' }])
      expect(reporters[1]).toEqual(['json', { outputFile: 'reports/e2e/json/results.json' }])
      expect(reporters[2]).toEqual(['list'])
    })

    it('should generate reporter array for all formats', () => {
      const reporters = generateReporterArray({
        html: 'reports/e2e/html',
        json: 'reports/e2e/json/results.json',
        junit: 'reports/e2e/junit/results.xml'
      })

      expect(reporters).toHaveLength(4) // HTML + JSON + JUnit + list
      expect(reporters[0]).toEqual(['html', { outputFolder: 'reports/e2e/html', open: 'never' }])
      expect(reporters[1]).toEqual(['json', { outputFile: 'reports/e2e/json/results.json' }])
      expect(reporters[2]).toEqual(['junit', { outputFile: 'reports/e2e/junit/results.xml' }])
      expect(reporters[3]).toEqual(['list'])
    })

    it('should always include list reporter at the end', () => {
      const reporters = generateReporterArray({
        html: 'reports/e2e/html'
      })

      const lastReporter = reporters[reporters.length - 1]
      expect(lastReporter).toEqual(['list'])
    })

    it('should handle custom HTML open option', () => {
      const reporters = generateReporterArray({
        html: 'reports/e2e/html',
        htmlOpen: 'on-failure'
      })

      expect(reporters[0]).toEqual(['html', {
        outputFolder: 'reports/e2e/html',
        open: 'on-failure'
      }])
    })

    it('should throw error if HTML reporter is missing', () => {
      expect(() =>
        generateReporterArray({
          json: 'reports/e2e/json/results.json'
        })
      ).toThrow('HTML reporter is mandatory')
    })
  })

  describe('generateArtifactRetentionPolicy', () => {
    it('should generate "on-failure" policy', () => {
      const policy = generateArtifactRetentionPolicy('on-failure')

      expect(policy).toEqual({
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry'
      })
    })

    it('should generate "always" policy', () => {
      const policy = generateArtifactRetentionPolicy('always')

      expect(policy).toEqual({
        screenshot: 'on',
        video: 'on',
        trace: 'on'
      })
    })

    it('should generate "never" policy', () => {
      const policy = generateArtifactRetentionPolicy('never')

      expect(policy).toEqual({
        screenshot: 'off',
        video: 'off',
        trace: 'off'
      })
    })

    it('should use "on-failure" as default', () => {
      const policy = generateArtifactRetentionPolicy(undefined as any)

      expect(policy).toEqual({
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry'
      })
    })

    it('should throw error for invalid policy', () => {
      expect(() =>
        generateArtifactRetentionPolicy('invalid' as any)
      ).toThrow('Invalid artifacts policy')
    })
  })

  describe('reporter array formatting', () => {
    it('should format reporters as Playwright-compatible array', () => {
      const reporters = generateReporterArray({
        html: 'reports/e2e/html',
        json: 'reports/e2e/json/results.json'
      })

      // Check structure matches Playwright format
      expect(reporters[0]).toBeInstanceOf(Array)
      expect(reporters[0][0]).toBe('html')
      expect(reporters[0][1]).toBeTypeOf('object')
    })

    it('should generate valid TypeScript code representation', () => {
      const reporters = generateReporterArray({
        html: 'reports/e2e/html'
      })

      const codeString = JSON.stringify(reporters, null, 2)
      expect(codeString).toContain('"html"')
      expect(codeString).toContain('"outputFolder"')
    })
  })

  describe('edge cases', () => {
    it('should handle empty output paths gracefully', () => {
      expect(() =>
        generateHTMLReporterConfig('')
      ).toThrow('Output folder cannot be empty')
    })

    it('should handle absolute paths', () => {
      expect(() =>
        generateHTMLReporterConfig('/absolute/path/html')
      ).toThrow('Output folder must be relative')
    })

    it('should normalize trailing slashes in output folders', () => {
      const config = generateHTMLReporterConfig('reports/e2e/html/')

      expect(config.outputFolder).toBe('reports/e2e/html')
    })
  })
})
