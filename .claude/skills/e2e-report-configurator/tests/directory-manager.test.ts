/**
 * @spec T006-e2e-report-configurator
 * Unit tests for directory manager
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createDirectories, verifyDirectoriesExist } from '@/directory-manager'
import * as fileUtils from '@/file-utils'

// Mock file-utils module
vi.mock('@/file-utils', () => ({
  ensureDirectory: vi.fn(),
  ensureDirectories: vi.fn(),
  fileExists: vi.fn()
}))

describe('directory-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createDirectories', () => {
    it('should create all directories in the list', async () => {
      const dirs = [
        'reports/e2e/html',
        'reports/e2e/json',
        'reports/e2e/artifacts'
      ]

      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([true, true, true])

      const result = await createDirectories(dirs)

      expect(fileUtils.ensureDirectories).toHaveBeenCalledWith(dirs)
      expect(result.created).toEqual(dirs)
      expect(result.failed).toEqual([])
    })

    it('should handle single directory', async () => {
      const dirs = ['reports/e2e/html']

      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([true])

      const result = await createDirectories(dirs)

      expect(result.created).toEqual(['reports/e2e/html'])
      expect(result.failed).toEqual([])
    })

    it('should return empty arrays for empty input', async () => {
      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([])

      const result = await createDirectories([])

      expect(result.created).toEqual([])
      expect(result.failed).toEqual([])
    })

    it('should track already-existing directories separately', async () => {
      const dirs = [
        'reports/e2e/html',
        'reports/e2e/json',
        'reports/e2e/artifacts'
      ]

      // false means directory already existed
      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([true, false, true])

      const result = await createDirectories(dirs)

      expect(result.created).toEqual([
        'reports/e2e/html',
        'reports/e2e/artifacts'
      ])
      expect(result.alreadyExisted).toEqual(['reports/e2e/json'])
    })

    it('should handle all directories already existing', async () => {
      const dirs = ['reports/e2e/html', 'reports/e2e/json']

      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([false, false])

      const result = await createDirectories(dirs)

      expect(result.created).toEqual([])
      expect(result.alreadyExisted).toEqual(dirs)
    })

    it('should handle errors during creation', async () => {
      const dirs = ['reports/e2e/html', 'reports/e2e/json']

      vi.mocked(fileUtils.ensureDirectories).mockRejectedValue(
        new Error('Permission denied')
      )

      await expect(createDirectories(dirs)).rejects.toThrow('Permission denied')
    })

    it('should create directories in order', async () => {
      const dirs = [
        'reports/e2e',
        'reports/e2e/html',
        'reports/e2e/artifacts',
        'reports/e2e/artifacts/screenshots'
      ]

      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([true, true, true, true])

      await createDirectories(dirs)

      expect(fileUtils.ensureDirectories).toHaveBeenCalledWith(dirs)
    })
  })

  describe('verifyDirectoriesExist', () => {
    it('should verify all directories exist', async () => {
      const dirs = [
        'reports/e2e/html',
        'reports/e2e/json',
        'reports/e2e/artifacts'
      ]

      vi.mocked(fileUtils.fileExists).mockResolvedValue(true)

      const result = await verifyDirectoriesExist(dirs)

      expect(result.allExist).toBe(true)
      expect(result.existing).toEqual(dirs)
      expect(result.missing).toEqual([])
    })

    it('should detect missing directories', async () => {
      const dirs = [
        'reports/e2e/html',
        'reports/e2e/json',
        'reports/e2e/artifacts'
      ]

      vi.mocked(fileUtils.fileExists)
        .mockResolvedValueOnce(true)  // html exists
        .mockResolvedValueOnce(false) // json missing
        .mockResolvedValueOnce(true)  // artifacts exists

      const result = await verifyDirectoriesExist(dirs)

      expect(result.allExist).toBe(false)
      expect(result.existing).toEqual(['reports/e2e/html', 'reports/e2e/artifacts'])
      expect(result.missing).toEqual(['reports/e2e/json'])
    })

    it('should handle all directories missing', async () => {
      const dirs = ['reports/e2e/html', 'reports/e2e/json']

      vi.mocked(fileUtils.fileExists).mockResolvedValue(false)

      const result = await verifyDirectoriesExist(dirs)

      expect(result.allExist).toBe(false)
      expect(result.existing).toEqual([])
      expect(result.missing).toEqual(dirs)
    })

    it('should handle empty directory list', async () => {
      const result = await verifyDirectoriesExist([])

      expect(result.allExist).toBe(true)
      expect(result.existing).toEqual([])
      expect(result.missing).toEqual([])
    })

    it('should handle single directory', async () => {
      vi.mocked(fileUtils.fileExists).mockResolvedValue(true)

      const result = await verifyDirectoriesExist(['reports/e2e/html'])

      expect(result.allExist).toBe(true)
      expect(result.existing).toEqual(['reports/e2e/html'])
    })

    it('should call fileExists for each directory', async () => {
      const dirs = ['reports/e2e/html', 'reports/e2e/json']

      vi.mocked(fileUtils.fileExists).mockResolvedValue(true)

      await verifyDirectoriesExist(dirs)

      expect(fileUtils.fileExists).toHaveBeenCalledTimes(2)
      expect(fileUtils.fileExists).toHaveBeenCalledWith('reports/e2e/html')
      expect(fileUtils.fileExists).toHaveBeenCalledWith('reports/e2e/json')
    })
  })

  describe('integration scenarios', () => {
    it('should create and verify directories in sequence', async () => {
      const dirs = ['reports/e2e/html', 'reports/e2e/json']

      // Mock creation
      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([true, true])

      const createResult = await createDirectories(dirs)
      expect(createResult.created).toEqual(dirs)

      // Mock verification
      vi.mocked(fileUtils.fileExists).mockResolvedValue(true)

      const verifyResult = await verifyDirectoriesExist(dirs)
      expect(verifyResult.allExist).toBe(true)
    })

    it('should handle partial creation success', async () => {
      const dirs = ['reports/e2e/html', 'reports/e2e/json']

      // First directory created, second already existed
      vi.mocked(fileUtils.ensureDirectories).mockResolvedValue([true, false])

      const result = await createDirectories(dirs)

      expect(result.created).toEqual(['reports/e2e/html'])
      expect(result.alreadyExisted).toEqual(['reports/e2e/json'])
    })
  })

  describe('error handling', () => {
    it('should propagate errors from ensureDirectories', async () => {
      vi.mocked(fileUtils.ensureDirectories).mockRejectedValue(
        new Error('Disk full')
      )

      await expect(createDirectories(['reports/e2e/html'])).rejects.toThrow('Disk full')
    })

    it('should handle fileExists errors gracefully', async () => {
      vi.mocked(fileUtils.fileExists).mockRejectedValue(
        new Error('Permission denied')
      )

      await expect(
        verifyDirectoriesExist(['reports/e2e/html'])
      ).rejects.toThrow('Permission denied')
    })
  })
})
