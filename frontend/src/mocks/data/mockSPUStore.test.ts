/**
 * @spec P007-fix-spu-batch-delete
 * MockSPUStore 单元测试 - 验证 Mock 数据持久化和 CRUD 操作
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mockSPUStore } from './mockSPUStore'
import type { SPUItem } from '@/types/spu'

// 创建一个真实的 localStorage 实现用于测试
const createTestLocalStorage = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
  }
}

describe('MockSPUStore', () => {
  let testLocalStorage: ReturnType<typeof createTestLocalStorage>

  beforeEach(() => {
    // 创建测试用的 localStorage 实现
    testLocalStorage = createTestLocalStorage()

    // 替换全局 localStorage
    Object.defineProperty(global, 'localStorage', {
      value: testLocalStorage,
      writable: true,
      configurable: true,
    })

    // 每个测试前重置数据,确保测试隔离
    mockSPUStore.reset()
    // 禁用持久化,避免污染 localStorage
    mockSPUStore.enablePersistence(false)
  })

  afterEach(() => {
    // 清理 localStorage
    testLocalStorage.clear()
  })

  describe('getAll()', () => {
    it('should return all SPU items', () => {
      const allSPU = mockSPUStore.getAll()

      expect(allSPU).toBeInstanceOf(Array)
      expect(allSPU.length).toBeGreaterThan(0)
      expect(allSPU[0]).toHaveProperty('id')
      expect(allSPU[0]).toHaveProperty('name')
      expect(allSPU[0]).toHaveProperty('status')
    })

    it('should return a copy, not the original array', () => {
      const allSPU1 = mockSPUStore.getAll()
      const allSPU2 = mockSPUStore.getAll()

      expect(allSPU1).not.toBe(allSPU2) // Different array instances
      expect(allSPU1).toEqual(allSPU2) // Same content
    })
  })

  describe('deleteMany()', () => {
    it('should delete SPUs by ids and return correct counts', () => {
      const allSPU = mockSPUStore.getAll()
      const idsToDelete = [allSPU[0].id, allSPU[1].id, allSPU[2].id]

      const result = mockSPUStore.deleteMany(idsToDelete)

      expect(result.success).toBe(3)
      expect(result.failed).toBe(0)

      const remainingSPU = mockSPUStore.getAll()
      expect(remainingSPU.length).toBe(allSPU.length - 3)

      // Verify deleted SPUs are not in the list
      const remainingIds = remainingSPU.map((spu) => spu.id)
      expect(remainingIds).not.toContain(idsToDelete[0])
      expect(remainingIds).not.toContain(idsToDelete[1])
      expect(remainingIds).not.toContain(idsToDelete[2])
    })

    it('should handle non-existent ids correctly', () => {
      const initialCount = mockSPUStore.getAll().length
      const nonExistentIds = ['INVALID_ID_1', 'INVALID_ID_2']

      const result = mockSPUStore.deleteMany(nonExistentIds)

      expect(result.success).toBe(0)
      expect(result.failed).toBe(2)

      const remainingSPU = mockSPUStore.getAll()
      expect(remainingSPU.length).toBe(initialCount)
    })

    it('should handle partial success scenario', () => {
      const allSPU = mockSPUStore.getAll()
      const validId = allSPU[0].id
      const invalidIds = ['INVALID_1', 'INVALID_2']
      const mixedIds = [validId, ...invalidIds]

      const result = mockSPUStore.deleteMany(mixedIds)

      expect(result.success).toBe(1)
      expect(result.failed).toBe(2)

      const remainingSPU = mockSPUStore.getAll()
      expect(remainingSPU.length).toBe(allSPU.length - 1)

      const remainingIds = remainingSPU.map((spu) => spu.id)
      expect(remainingIds).not.toContain(validId)
    })

    it('should handle empty ids array', () => {
      const initialCount = mockSPUStore.getAll().length

      const result = mockSPUStore.deleteMany([])

      expect(result.success).toBe(0)
      expect(result.failed).toBe(0)

      const remainingSPU = mockSPUStore.getAll()
      expect(remainingSPU.length).toBe(initialCount)
    })
  })

  describe('persistence', () => {
    it('should save to localStorage when persistence is enabled', () => {
      mockSPUStore.enablePersistence(true)

      const allSPU = mockSPUStore.getAll()
      const idsToDelete = [allSPU[0].id]

      mockSPUStore.deleteMany(idsToDelete)

      const stored = localStorage.getItem('mockSPUData')
      expect(stored).toBeTruthy()

      const parsedData = JSON.parse(stored!) as SPUItem[]
      expect(parsedData.length).toBe(allSPU.length - 1)

      const storedIds = parsedData.map((spu) => spu.id)
      expect(storedIds).not.toContain(idsToDelete[0])
    })

    it('should not save to localStorage when persistence is disabled', () => {
      mockSPUStore.enablePersistence(false)

      const allSPU = mockSPUStore.getAll()
      const idsToDelete = [allSPU[0].id]

      mockSPUStore.deleteMany(idsToDelete)

      const stored = localStorage.getItem('mockSPUData')
      expect(stored).toBeNull()
    })

    it('should restore data from localStorage on reset', () => {
      mockSPUStore.enablePersistence(true)

      const allSPU = mockSPUStore.getAll()
      const idsToDelete = [allSPU[0].id, allSPU[1].id]

      mockSPUStore.deleteMany(idsToDelete)

      const countAfterDelete = mockSPUStore.getAll().length

      // Reset and restore from localStorage
      mockSPUStore.reset()

      const restoredSPU = mockSPUStore.getAll()
      expect(restoredSPU.length).toBe(countAfterDelete)

      const restoredIds = restoredSPU.map((spu) => spu.id)
      expect(restoredIds).not.toContain(idsToDelete[0])
      expect(restoredIds).not.toContain(idsToDelete[1])
    })
  })

  describe('reset()', () => {
    it('should restore initial state when no localStorage data exists', () => {
      const initialCount = mockSPUStore.getAll().length

      // Delete some SPUs
      const allSPU = mockSPUStore.getAll()
      mockSPUStore.deleteMany([allSPU[0].id, allSPU[1].id])

      // Verify deletion
      expect(mockSPUStore.getAll().length).toBe(initialCount - 2)

      // Reset without persistence
      mockSPUStore.reset()

      // Should restore to initial count (regenerated)
      const restoredSPU = mockSPUStore.getAll()
      expect(restoredSPU.length).toBe(initialCount)
    })
  })
})
