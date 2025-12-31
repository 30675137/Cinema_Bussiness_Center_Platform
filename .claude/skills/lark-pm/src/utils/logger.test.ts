/**
 * @spec T004-lark-project-management
 * Unit tests for logger
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import logger from './logger.js'

describe('logger', () => {
  let logSpy: any

  beforeEach(() => {
    // Spy on logger methods
    logSpy = vi.spyOn(logger, 'info')
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  it('should log info messages', () => {
    logger.info('Test message')
    expect(logSpy).toHaveBeenCalledWith('Test message')
  })

  it('should log with metadata', () => {
    logger.info({ user: 'test' }, 'User action')
    expect(logSpy).toHaveBeenCalledWith({ user: 'test' }, 'User action')
  })

  it('should have error method', () => {
    expect(typeof logger.error).toBe('function')
  })

  it('should have warn method', () => {
    expect(typeof logger.warn).toBe('function')
  })

  it('should have debug method', () => {
    expect(typeof logger.debug).toBe('function')
  })
})
