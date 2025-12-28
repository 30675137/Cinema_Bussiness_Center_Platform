/**
 * Vitest 测试环境设置
 */

import { vi } from 'vitest'

// 设置全局测试环境
global.console = {
  ...console,
  // 在测试中抑制不必要的日志
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}

// Mock setTimeout/setInterval (如果需要)
vi.stubGlobal('setTimeout', vi.fn((callback) => callback()))
vi.stubGlobal('setInterval', vi.fn())
