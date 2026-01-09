/**
 * @spec P007-fix-spu-batch-delete
 * spuService 单元测试 - 验证批量删除 HTTP 请求调用
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { server } from '../test/setup'
import { http, HttpResponse } from 'msw'

// 注意: 由于 spuService 使用 class,我们需要测试其实例方法
// 这里我们通过 MSW mock HTTP 请求来验证 API 调用

describe('spuService.batchDeleteSPU', () => {
  const API_BASE_URL = 'http://localhost:3000'

  beforeEach(() => {
    // 重置 MSW handlers
    server.resetHandlers()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should call POST /api/spu/batch with correct payload', async () => {
    let capturedRequest: { operation: string; ids: string[] } | null = null

    // Mock the batch delete endpoint
    server.use(
      http.post(`${API_BASE_URL}/api/spu/batch`, async ({ request }) => {
        const body = (await request.json()) as { operation: string; ids: string[] }
        capturedRequest = body

        return HttpResponse.json({
          success: true,
          data: {
            processedCount: body.ids.length,
            failedCount: 0,
          },
          message: `成功删除 ${body.ids.length} 个 SPU`,
          code: 200,
          timestamp: Date.now(),
        })
      }),
    )

    // Import the service here to avoid module initialization issues
    const { spuService } = await import('./spuService')

    const testIds = ['SPU001', 'SPU002', 'SPU003']
    const result = await spuService.batchDeleteSPU(testIds)

    // Verify request payload
    expect(capturedRequest).not.toBeNull()
    expect(capturedRequest?.operation).toBe('delete')
    expect(capturedRequest?.ids).toEqual(testIds)

    // Verify response parsing
    expect(result.success).toBe(true)
    expect(result.data.success).toBe(3)
    expect(result.data.failed).toBe(0)
    expect(result.message).toContain('成功删除 3 个 SPU')
  })

  it('should handle HTTP 400 errors', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/spu/batch`, () => {
        return HttpResponse.json(
          {
            success: false,
            message: 'ids 参数不能为空数组',
            code: 400,
            timestamp: Date.now(),
          },
          { status: 400 },
        )
      }),
    )

    const { spuService } = await import('./spuService')

    const testIds = ['SPU001'] // Use non-empty array to trigger HTTP 400
    const result = await spuService.batchDeleteSPU(testIds)

    expect(result.success).toBe(false)
    expect(result.data.failed).toBe(testIds.length)
  })

  it('should handle HTTP 500 errors', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/spu/batch`, () => {
        return HttpResponse.json(
          {
            success: false,
            message: '服务器内部错误',
            code: 500,
            timestamp: Date.now(),
          },
          { status: 500 },
        )
      }),
    )

    const { spuService } = await import('./spuService')

    const testIds = ['SPU001']
    const result = await spuService.batchDeleteSPU(testIds)

    expect(result.success).toBe(false)
    expect(result.data.failed).toBe(testIds.length)
  })

  it('should handle network errors', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/spu/batch`, () => {
        return HttpResponse.error()
      }),
    )

    const { spuService } = await import('./spuService')

    const testIds = ['SPU001', 'SPU002']
    const result = await spuService.batchDeleteSPU(testIds)

    expect(result.success).toBe(false)
    expect(result.data.success).toBe(0)
    expect(result.data.failed).toBe(testIds.length)
    // Network error message can be "Failed to fetch" (native) or "批量删除失败" (fallback)
    expect(result.message).toBeTruthy()
  })

  it('should parse partial success responses correctly', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/spu/batch`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            processedCount: 2,
            failedCount: 1,
            results: [
              { id: 'SPU001', success: true },
              { id: 'SPU002', success: true },
              { id: 'INVALID_ID', success: false, error: 'SPU 不存在' },
            ],
          },
          message: '成功删除 2 个 SPU,失败 1 个',
          code: 200,
          timestamp: Date.now(),
        })
      }),
    )

    const { spuService } = await import('./spuService')

    const testIds = ['SPU001', 'SPU002', 'INVALID_ID']
    const result = await spuService.batchDeleteSPU(testIds)

    expect(result.success).toBe(true)
    expect(result.data.success).toBe(2)
    expect(result.data.failed).toBe(1)
    expect(result.message).toContain('成功删除 2 个 SPU,失败 1 个')
  })
})
