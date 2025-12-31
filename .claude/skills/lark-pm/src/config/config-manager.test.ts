/**
 * @spec T004-lark-project-management
 * Unit tests for config-manager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fs from 'fs/promises'
import { loadConfig, saveConfig, updateConfig } from './config-manager.js'

// Mock fs module
vi.mock('fs/promises')

describe('config-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadConfig', () => {
    it('should load existing config.json', async () => {
      const mockConfig = {
        baseAppToken: 'test_token',
        tableIds: {
          tasks: 'table1',
        },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockConfig))

      const config = await loadConfig()
      expect(config).toEqual(mockConfig)
    })

    it('should return empty config if file not found', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT')
      error.code = 'ENOENT'
      vi.mocked(fs.readFile).mockRejectedValue(error)

      const config = await loadConfig()
      expect(config).toEqual({})
    })

    it('should throw on other file read errors', async () => {
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Permission denied'))

      await expect(loadConfig()).rejects.toThrow('Permission denied')
    })
  })

  describe('saveConfig', () => {
    it('should save config to file', async () => {
      const config = {
        baseAppToken: 'test_token',
        tableIds: {
          tasks: 'table1',
        },
      }

      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      await saveConfig(config)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('config.json'),
        JSON.stringify(config, null, 2),
        'utf-8'
      )
    })

    it('should throw on write error', async () => {
      vi.mocked(fs.writeFile).mockRejectedValue(new Error('Write error'))

      await expect(
        saveConfig({ baseAppToken: 'test' })
      ).rejects.toThrow('Write error')
    })
  })

  describe('updateConfig', () => {
    it('should merge updates with existing config', async () => {
      const existingConfig = {
        baseAppToken: 'old_token',
        tableIds: {
          tasks: 'table1',
        },
      }

      vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(existingConfig))
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      const updates = {
        tableIds: {
          bugs: 'table2',
        },
      }

      const result = await updateConfig(updates)

      expect(result.baseAppToken).toBe('old_token')
      expect(result.tableIds).toEqual({
        tasks: 'table1',
        bugs: 'table2',
      })
    })

    it('should handle empty existing config', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT')
      error.code = 'ENOENT'
      vi.mocked(fs.readFile).mockRejectedValue(error)
      vi.mocked(fs.writeFile).mockResolvedValue(undefined)

      const updates = {
        baseAppToken: 'new_token',
      }

      const result = await updateConfig(updates)

      expect(result.baseAppToken).toBe('new_token')
    })
  })
})
