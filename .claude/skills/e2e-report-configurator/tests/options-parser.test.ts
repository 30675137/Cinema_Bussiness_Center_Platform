/**
 * @spec T006-e2e-report-configurator
 * Unit tests for command-line options parser
 */

import { describe, it, expect } from 'vitest'
import { parseSkillOptions } from '@/options-parser'
import type { SkillCommandOptions } from '@/types'

describe('options-parser', () => {
  describe('parseSkillOptions', () => {
    describe('format option', () => {
      it('should use default format "html" when not provided', () => {
        const result = parseSkillOptions({})
        expect(result.format).toBe('html')
      })

      it('should accept single format "html"', () => {
        const result = parseSkillOptions({ format: 'html' })
        expect(result.format).toBe('html')
      })

      it('should accept multiple formats "html,json"', () => {
        const result = parseSkillOptions({ format: 'html,json' })
        expect(result.format).toBe('html,json')
      })

      it('should accept all formats "html,json,junit"', () => {
        const result = parseSkillOptions({ format: 'html,json,junit' })
        expect(result.format).toBe('html,json,junit')
      })

      it('should throw error if format does not include html', () => {
        expect(() => parseSkillOptions({ format: 'json' })).toThrow(
          'HTML reporter is mandatory'
        )
      })

      it('should throw error for invalid format', () => {
        expect(() => parseSkillOptions({ format: 'invalid' })).toThrow(
          'Invalid reporter format'
        )
      })

      it('should throw error for invalid multi-format', () => {
        expect(() => parseSkillOptions({ format: 'html,invalid' })).toThrow(
          'Invalid reporter format'
        )
      })

      it('should handle formats with spaces (trimmed)', () => {
        const result = parseSkillOptions({ format: 'html, json, junit' })
        expect(result.format).toBe('html,json,junit')
      })

      it('should remove duplicate formats', () => {
        const result = parseSkillOptions({ format: 'html,html,json' })
        expect(result.format).toBe('html,json')
      })
    })

    describe('output option', () => {
      it('should use default output "reports/e2e" when not provided', () => {
        const result = parseSkillOptions({})
        expect(result.output).toBe('reports/e2e')
      })

      it('should accept custom output directory', () => {
        const result = parseSkillOptions({ output: 'test-reports' })
        expect(result.output).toBe('test-reports')
      })

      it('should accept nested output directory', () => {
        const result = parseSkillOptions({ output: 'custom/reports/path' })
        expect(result.output).toBe('custom/reports/path')
      })

      it('should remove trailing slash from output', () => {
        const result = parseSkillOptions({ output: 'test-reports/' })
        expect(result.output).toBe('test-reports')
      })

      it('should throw error for empty output', () => {
        expect(() => parseSkillOptions({ output: '' })).toThrow(
          'Output directory cannot be empty'
        )
      })

      it('should throw error for absolute path', () => {
        expect(() => parseSkillOptions({ output: '/absolute/path' })).toThrow(
          'Output directory must be relative'
        )
      })

      it('should throw error for output with special characters', () => {
        expect(() => parseSkillOptions({ output: 'test@reports' })).toThrow(
          'Output directory contains invalid characters'
        )
      })
    })

    describe('artifacts option', () => {
      it('should use default artifacts "on-failure" when not provided', () => {
        const result = parseSkillOptions({})
        expect(result.artifacts).toBe('on-failure')
      })

      it('should accept "on-failure"', () => {
        const result = parseSkillOptions({ artifacts: 'on-failure' })
        expect(result.artifacts).toBe('on-failure')
      })

      it('should accept "always"', () => {
        const result = parseSkillOptions({ artifacts: 'always' })
        expect(result.artifacts).toBe('always')
      })

      it('should accept "never"', () => {
        const result = parseSkillOptions({ artifacts: 'never' })
        expect(result.artifacts).toBe('never')
      })

      it('should throw error for invalid artifacts value', () => {
        expect(() =>
          parseSkillOptions({ artifacts: 'invalid' as any })
        ).toThrow('Invalid artifacts policy')
      })
    })

    describe('combined options', () => {
      it('should parse all options together', () => {
        const result = parseSkillOptions({
          format: 'html,json,junit',
          output: 'test-reports',
          artifacts: 'always'
        })

        expect(result).toEqual({
          format: 'html,json,junit',
          output: 'test-reports',
          artifacts: 'always'
        })
      })

      it('should handle partial options with defaults', () => {
        const result = parseSkillOptions({
          format: 'html,json'
        })

        expect(result).toEqual({
          format: 'html,json',
          output: 'reports/e2e',
          artifacts: 'on-failure'
        })
      })
    })

    describe('format array parsing', () => {
      it('should return array of formats from comma-separated string', () => {
        const result = parseSkillOptions({ format: 'html,json,junit' })
        const formats = result.format.split(',')
        expect(formats).toEqual(['html', 'json', 'junit'])
      })

      it('should return single-element array for single format', () => {
        const result = parseSkillOptions({ format: 'html' })
        const formats = result.format.split(',')
        expect(formats).toEqual(['html'])
      })
    })

    describe('edge cases', () => {
      it('should handle undefined options object', () => {
        const result = parseSkillOptions(undefined as any)
        expect(result).toEqual({
          format: 'html',
          output: 'reports/e2e',
          artifacts: 'on-failure'
        })
      })

      it('should handle null options object', () => {
        const result = parseSkillOptions(null as any)
        expect(result).toEqual({
          format: 'html',
          output: 'reports/e2e',
          artifacts: 'on-failure'
        })
      })

      it('should throw error for non-object input', () => {
        expect(() => parseSkillOptions('invalid' as any)).toThrow()
      })
    })
  })
})
