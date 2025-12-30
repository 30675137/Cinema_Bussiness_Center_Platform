/**
 * @spec T006-e2e-report-configurator
 * Unit tests for directory structure builder
 */

import { describe, it, expect } from 'vitest'
import { buildDirectoryStructure, getRequiredDirectories } from '@/directory-builder'
import type { DirectoryStructure } from '@/types'

describe('directory-builder', () => {
  describe('buildDirectoryStructure', () => {
    it('should build structure with default base path', () => {
      const structure = buildDirectoryStructure('reports/e2e')

      expect(structure).toEqual<DirectoryStructure>({
        basePath: 'reports/e2e',
        htmlDir: 'reports/e2e/html',
        jsonDir: 'reports/e2e/json',
        junitDir: 'reports/e2e/junit',
        artifactsDir: 'reports/e2e/artifacts',
        screenshotsDir: 'reports/e2e/artifacts/screenshots',
        videosDir: 'reports/e2e/artifacts/videos',
        tracesDir: 'reports/e2e/artifacts/traces'
      })
    })

    it('should build structure with custom base path', () => {
      const structure = buildDirectoryStructure('test-reports')

      expect(structure.basePath).toBe('test-reports')
      expect(structure.htmlDir).toBe('test-reports/html')
      expect(structure.jsonDir).toBe('test-reports/json')
      expect(structure.junitDir).toBe('test-reports/junit')
      expect(structure.artifactsDir).toBe('test-reports/artifacts')
      expect(structure.screenshotsDir).toBe('test-reports/artifacts/screenshots')
      expect(structure.videosDir).toBe('test-reports/artifacts/videos')
      expect(structure.tracesDir).toBe('test-reports/artifacts/traces')
    })

    it('should build structure with nested base path', () => {
      const structure = buildDirectoryStructure('custom/reports/path')

      expect(structure.basePath).toBe('custom/reports/path')
      expect(structure.htmlDir).toBe('custom/reports/path/html')
      expect(structure.jsonDir).toBe('custom/reports/path/json')
    })

    it('should remove trailing slash from base path', () => {
      const structure = buildDirectoryStructure('test-reports/')

      expect(structure.basePath).toBe('test-reports')
      expect(structure.htmlDir).toBe('test-reports/html')
    })

    it('should handle single-level directory', () => {
      const structure = buildDirectoryStructure('reports')

      expect(structure.basePath).toBe('reports')
      expect(structure.htmlDir).toBe('reports/html')
    })

    it('should throw error for empty base path', () => {
      expect(() => buildDirectoryStructure('')).toThrow(
        'Base path cannot be empty'
      )
    })

    it('should throw error for absolute path', () => {
      expect(() => buildDirectoryStructure('/absolute/path')).toThrow(
        'Base path must be relative'
      )
    })
  })

  describe('getRequiredDirectories', () => {
    it('should return all directories for html,json,junit formats', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html,json,junit')

      expect(dirs).toEqual([
        'reports/e2e/html',
        'reports/e2e/json',
        'reports/e2e/junit',
        'reports/e2e/artifacts',
        'reports/e2e/artifacts/screenshots',
        'reports/e2e/artifacts/videos',
        'reports/e2e/artifacts/traces'
      ])
    })

    it('should return only HTML directories for single format', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html')

      expect(dirs).toEqual([
        'reports/e2e/html',
        'reports/e2e/artifacts',
        'reports/e2e/artifacts/screenshots',
        'reports/e2e/artifacts/videos',
        'reports/e2e/artifacts/traces'
      ])
    })

    it('should include JSON directory when format includes json', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html,json')

      expect(dirs).toContain('reports/e2e/json')
      expect(dirs).not.toContain('reports/e2e/junit')
    })

    it('should include JUnit directory when format includes junit', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html,junit')

      expect(dirs).toContain('reports/e2e/junit')
      expect(dirs).not.toContain('reports/e2e/json')
    })

    it('should always include artifacts subdirectories', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html')

      expect(dirs).toContain('reports/e2e/artifacts/screenshots')
      expect(dirs).toContain('reports/e2e/artifacts/videos')
      expect(dirs).toContain('reports/e2e/artifacts/traces')
    })

    it('should maintain correct order (parent before children)', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html,json,junit')

      const artifactsIndex = dirs.indexOf('reports/e2e/artifacts')
      const screenshotsIndex = dirs.indexOf('reports/e2e/artifacts/screenshots')

      expect(artifactsIndex).toBeLessThan(screenshotsIndex)
    })

    it('should handle format with spaces (trimmed)', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html, json, junit')

      expect(dirs).toContain('reports/e2e/json')
      expect(dirs).toContain('reports/e2e/junit')
    })

    it('should return unique directories (no duplicates)', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html,json,junit')

      const uniqueDirs = [...new Set(dirs)]
      expect(dirs).toEqual(uniqueDirs)
    })
  })

  describe('integration', () => {
    it('should build structure and get directories for typical use case', () => {
      const structure = buildDirectoryStructure('test-reports')
      const dirs = getRequiredDirectories(structure, 'html,json')

      expect(dirs).toHaveLength(6) // html, json, artifacts, screenshots, videos, traces
      expect(dirs[0]).toBe('test-reports/html')
      expect(dirs[1]).toBe('test-reports/json')
      expect(dirs[2]).toBe('test-reports/artifacts')
    })

    it('should work with minimal format (HTML only)', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html')

      expect(dirs).toHaveLength(5) // html, artifacts, screenshots, videos, traces
      expect(dirs).toContain('reports/e2e/html')
      expect(dirs).not.toContain('reports/e2e/json')
      expect(dirs).not.toContain('reports/e2e/junit')
    })

    it('should work with all formats', () => {
      const structure = buildDirectoryStructure('reports/e2e')
      const dirs = getRequiredDirectories(structure, 'html,json,junit')

      expect(dirs).toHaveLength(7) // html, json, junit, artifacts, screenshots, videos, traces
    })
  })
})
