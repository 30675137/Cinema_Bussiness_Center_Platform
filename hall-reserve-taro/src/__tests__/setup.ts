/**
 * Vitest 测试环境设置
 */

import { vi } from 'vitest'
import React from 'react'
import '@testing-library/jest-dom/vitest'

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

// Mock Taro runtime globals
vi.stubGlobal('ENABLE_INNER_HTML', true)
vi.stubGlobal('ENABLE_ADJACENT_HTML', true)
vi.stubGlobal('ENABLE_SIZE_APIS', true)
vi.stubGlobal('ENABLE_CLONE_NODE', true)
vi.stubGlobal('ENABLE_CONTAINS', true)
vi.stubGlobal('ENABLE_MUTATION_OBSERVER', true)
vi.stubGlobal('ENABLE_TEMPLATE_CONTENT', true)

// Mock @tarojs/components
vi.mock('@tarojs/components', () => ({
  View: ({ children, ...props }: any) => React.createElement('div', props, children),
  Text: ({ children, ...props }: any) => React.createElement('span', props, children),
  Image: (props: any) => React.createElement('img', props),
  ScrollView: ({ children, ...props }: any) =>
    React.createElement('div', props, children),
  Button: ({ children, ...props }: any) =>
    React.createElement('button', props, children),
}))
