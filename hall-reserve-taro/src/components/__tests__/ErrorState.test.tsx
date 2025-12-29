/**
 * T035-A: ErrorState 组件单元测试
 *
 * 测试覆盖：
 * 1. 组件渲染 - 验证基本 UI 结构
 * 2. 默认 props - 默认错误消息显示
 * 3. 自定义 props - 自定义错误消息
 * 4. 重试按钮 - 点击事件触发
 * 5. 条件渲染 - 重试按钮根据 onRetry prop 显示/隐藏
 *
 * 注意：此测试文件需要配置 Vitest + @testing-library/react 后才能运行
 * 当前作为测试规格文档存在
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorState from '../ErrorState'

describe('ErrorState 组件', () => {
  /**
   * 测试用例 1: 组件基本渲染
   */
  it('应该正确渲染错误状态组件', () => {
    // Arrange & Act: 渲染组件（使用默认 props）
    render(<ErrorState />)

    // Assert: 验证错误图标存在
    const errorIcon = screen.getByText('⚠️')
    expect(errorIcon).toBeInTheDocument()

    // 验证默认错误消息
    const errorMessage = screen.getByText('网络连接失败，请检查网络设置')
    expect(errorMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 2: 自定义错误消息
   */
  it('应该显示自定义错误消息', () => {
    // Arrange
    const customMessage = '服务暂时不可用，请稍后重试'

    // Act: 渲染组件并传入自定义消息
    render(<ErrorState message={customMessage} />)

    // Assert: 验证自定义消息显示
    const errorMessage = screen.getByText(customMessage)
    expect(errorMessage).toBeInTheDocument()

    // 验证默认消息不显示
    const defaultMessage = screen.queryByText('网络连接失败，请检查网络设置')
    expect(defaultMessage).not.toBeInTheDocument()
  })

  /**
   * 测试用例 3: 重试按钮显示（当 onRetry 传入时）
   */
  it('当传入 onRetry 回调时应该显示重试按钮', () => {
    // Arrange
    const mockOnRetry = vi.fn()

    // Act: 渲染组件并传入 onRetry 回调
    render(<ErrorState onRetry={mockOnRetry} />)

    // Assert: 验证重试按钮存在
    const retryButton = screen.getByRole('button', { name: /重试/i })
    expect(retryButton).toBeInTheDocument()
  })

  /**
   * 测试用例 4: 重试按钮隐藏（当 onRetry 未传入时）
   */
  it('当未传入 onRetry 回调时不应该显示重试按钮', () => {
    // Act: 渲染组件（不传入 onRetry）
    render(<ErrorState />)

    // Assert: 验证重试按钮不存在
    const retryButton = screen.queryByRole('button', { name: /重试/i })
    expect(retryButton).not.toBeInTheDocument()
  })

  /**
   * 测试用例 5: 重试按钮点击事件
   */
  it('点击重试按钮应该触发 onRetry 回调', () => {
    // Arrange: Mock onRetry 函数
    const mockOnRetry = vi.fn()

    // Act: 渲染组件
    render(<ErrorState onRetry={mockOnRetry} />)

    // 点击重试按钮
    const retryButton = screen.getByRole('button', { name: /重试/i })
    fireEvent.click(retryButton)

    // Assert: 验证 onRetry 被调用
    expect(mockOnRetry).toHaveBeenCalledTimes(1)
  })

  /**
   * 测试用例 6: 多次点击重试按钮
   */
  it('多次点击重试按钮应该多次触发 onRetry 回调', () => {
    // Arrange
    const mockOnRetry = vi.fn()

    // Act: 渲染组件
    render(<ErrorState onRetry={mockOnRetry} />)

    // 点击重试按钮 3 次
    const retryButton = screen.getByRole('button', { name: /重试/i })
    fireEvent.click(retryButton)
    fireEvent.click(retryButton)
    fireEvent.click(retryButton)

    // Assert: 验证 onRetry 被调用 3 次
    expect(mockOnRetry).toHaveBeenCalledTimes(3)
  })

  /**
   * 测试用例 7: 同时传入自定义消息和 onRetry 回调
   */
  it('应该同时显示自定义消息和重试按钮', () => {
    // Arrange
    const customMessage = 'API 请求超时，请检查网络连接'
    const mockOnRetry = vi.fn()

    // Act: 渲染组件
    render(<ErrorState message={customMessage} onRetry={mockOnRetry} />)

    // Assert: 验证自定义消息
    const errorMessage = screen.getByText(customMessage)
    expect(errorMessage).toBeInTheDocument()

    // 验证重试按钮
    const retryButton = screen.getByRole('button', { name: /重试/i })
    expect(retryButton).toBeInTheDocument()
  })

  /**
   * 测试用例 8: CSS 类名验证
   */
  it('应该应用正确的 CSS 类名', () => {
    // Arrange
    const mockOnRetry = vi.fn()

    // Act: 渲染组件
    const { container } = render(<ErrorState onRetry={mockOnRetry} />)

    // Assert: 验证容器类名
    const errorStateContainer = container.querySelector('.error-state')
    expect(errorStateContainer).toBeInTheDocument()

    // 验证错误图标类名
    const errorIcon = container.querySelector('.error-icon')
    expect(errorIcon).toBeInTheDocument()

    // 验证错误消息类名
    const errorMessage = container.querySelector('.error-message')
    expect(errorMessage).toBeInTheDocument()

    // 验证重试按钮类名
    const retryButton = container.querySelector('.retry-button')
    expect(retryButton).toBeInTheDocument()
  })

  /**
   * 测试用例 9: 无障碍性测试（Accessibility）
   */
  it('应该提供适当的无障碍性支持', () => {
    // Arrange
    const mockOnRetry = vi.fn()

    // Act: 渲染组件
    render(<ErrorState message="测试错误消息" onRetry={mockOnRetry} />)

    // Assert: 验证按钮可访问性
    const retryButton = screen.getByRole('button')
    expect(retryButton).toBeEnabled()
    expect(retryButton).toHaveTextContent('重试')
  })

  /**
   * 测试用例 10: 空字符串消息处理
   */
  it('当传入空字符串消息时应该显示默认消息', () => {
    // Act: 渲染组件（传入空字符串）
    render(<ErrorState message="" />)

    // Assert: 验证显示默认消息（因为空字符串是 falsy 值）
    // 根据组件实现逻辑：message || defaultMessage
    const defaultMessage = screen.getByText('网络连接失败，请检查网络设置')
    expect(defaultMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 11: 长错误消息处理
   */
  it('应该正确处理长错误消息', () => {
    // Arrange: 创建一个很长的错误消息
    const longMessage =
      '网络连接失败，请检查您的网络设置。如果问题持续存在，请联系客服或稍后重试。错误代码: ERR_NETWORK_TIMEOUT_12345'

    // Act: 渲染组件
    render(<ErrorState message={longMessage} />)

    // Assert: 验证长消息正确显示
    const errorMessage = screen.getByText(longMessage)
    expect(errorMessage).toBeInTheDocument()
  })
})
