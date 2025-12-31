/**
 * @spec T004-lark-project-management
 * Unit tests for retry utility
 */

import { describe, it, expect, vi } from 'vitest'
import { withRetry } from './retry.js'

describe('withRetry', () => {
  it('should return result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('success')
    const result = await withRetry(fn)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success')

    const result = await withRetry(fn, { maxRetries: 3, baseDelay: 10 })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('should throw last error after max retries', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent failure'))

    await expect(
      withRetry(fn, { maxRetries: 2, baseDelay: 10 })
    ).rejects.toThrow('persistent failure')

    expect(fn).toHaveBeenCalledTimes(3) // initial + 2 retries
  })

  it('should call onRetry callback', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success')

    const onRetry = vi.fn()

    await withRetry(fn, { maxRetries: 2, baseDelay: 10, onRetry })

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1)
  })

  it('should use exponential backoff', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success')

    const start = Date.now()
    await withRetry(fn, { maxRetries: 3, baseDelay: 100, maxDelay: 1000 })
    const elapsed = Date.now() - start

    // Should have delays: 100ms (2^0) + 200ms (2^1) = 300ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(300)
  })

  it('should respect maxDelay cap', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockRejectedValueOnce(new Error('fail 2'))
      .mockResolvedValue('success')

    const start = Date.now()
    await withRetry(fn, { maxRetries: 3, baseDelay: 1000, maxDelay: 150 })
    const elapsed = Date.now() - start

    // Should cap at maxDelay (150ms) for both retries = 300ms
    expect(elapsed).toBeLessThan(500)
  })
})
