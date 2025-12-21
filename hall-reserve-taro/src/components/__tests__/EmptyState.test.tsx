/**
 * T035-B: EmptyState 组件单元测试
 *
 * 测试覆盖：
 * 1. 组件渲染 - 验证基本 UI 结构
 * 2. 默认 props - 默认空状态消息和图标
 * 3. 自定义 props - 自定义消息和图标
 * 4. Props 组合 - 仅自定义消息、仅自定义图标
 * 5. CSS 类名 - 样式类名正确应用
 *
 * 注意：此测试文件需要配置 Vitest + @testing-library/react 后才能运行
 * 当前作为测试规格文档存在
 *
 * @author Cinema Platform
 * @since 2025-12-21
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from '../EmptyState'

describe('EmptyState 组件', () => {
  /**
   * 测试用例 1: 组件基本渲染（使用默认 props）
   */
  it('应该正确渲染空状态组件', () => {
    // Arrange & Act: 渲染组件（使用默认 props）
    render(<EmptyState />)

    // Assert: 验证默认图标存在
    const emptyIcon = screen.getByText('📭')
    expect(emptyIcon).toBeInTheDocument()

    // 验证默认消息
    const emptyMessage = screen.getByText('暂无可用场景包，敬请期待')
    expect(emptyMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 2: 自定义空状态消息
   */
  it('应该显示自定义空状态消息', () => {
    // Arrange
    const customMessage = '暂无数据，请稍后再试'

    // Act: 渲染组件并传入自定义消息
    render(<EmptyState message={customMessage} />)

    // Assert: 验证自定义消息显示
    const emptyMessage = screen.getByText(customMessage)
    expect(emptyMessage).toBeInTheDocument()

    // 验证默认消息不显示
    const defaultMessage = screen.queryByText('暂无可用场景包，敬请期待')
    expect(defaultMessage).not.toBeInTheDocument()
  })

  /**
   * 测试用例 3: 自定义空状态图标
   */
  it('应该显示自定义空状态图标', () => {
    // Arrange
    const customIcon = '🎬'

    // Act: 渲染组件并传入自定义图标
    render(<EmptyState icon={customIcon} />)

    // Assert: 验证自定义图标显示
    const emptyIcon = screen.getByText(customIcon)
    expect(emptyIcon).toBeInTheDocument()

    // 验证默认图标不显示
    const defaultIcon = screen.queryByText('📭')
    expect(defaultIcon).not.toBeInTheDocument()
  })

  /**
   * 测试用例 4: 同时自定义消息和图标
   */
  it('应该同时显示自定义消息和图标', () => {
    // Arrange
    const customMessage = '没有找到相关场景包'
    const customIcon = '🔍'

    // Act: 渲染组件
    render(<EmptyState message={customMessage} icon={customIcon} />)

    // Assert: 验证自定义图标
    const emptyIcon = screen.getByText(customIcon)
    expect(emptyIcon).toBeInTheDocument()

    // 验证自定义消息
    const emptyMessage = screen.getByText(customMessage)
    expect(emptyMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 5: 仅传入自定义消息（图标使用默认值）
   */
  it('仅传入自定义消息时应该使用默认图标', () => {
    // Arrange
    const customMessage = '您还没有收藏的场景包'

    // Act: 渲染组件
    render(<EmptyState message={customMessage} />)

    // Assert: 验证默认图标
    const defaultIcon = screen.getByText('📭')
    expect(defaultIcon).toBeInTheDocument()

    // 验证自定义消息
    const emptyMessage = screen.getByText(customMessage)
    expect(emptyMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 6: 仅传入自定义图标（消息使用默认值）
   */
  it('仅传入自定义图标时应该使用默认消息', () => {
    // Arrange
    const customIcon = '🎭'

    // Act: 渲染组件
    render(<EmptyState icon={customIcon} />)

    // Assert: 验证自定义图标
    const emptyIcon = screen.getByText(customIcon)
    expect(emptyIcon).toBeInTheDocument()

    // 验证默认消息
    const defaultMessage = screen.getByText('暂无可用场景包，敬请期待')
    expect(defaultMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 7: CSS 类名验证
   */
  it('应该应用正确的 CSS 类名', () => {
    // Act: 渲染组件
    const { container } = render(<EmptyState />)

    // Assert: 验证容器类名
    const emptyStateContainer = container.querySelector('.empty-state')
    expect(emptyStateContainer).toBeInTheDocument()

    // 验证图标类名
    const emptyIcon = container.querySelector('.empty-icon')
    expect(emptyIcon).toBeInTheDocument()

    // 验证消息类名
    const emptyMessage = container.querySelector('.empty-message')
    expect(emptyMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 8: 空字符串消息处理
   */
  it('当传入空字符串消息时应该显示默认消息', () => {
    // Act: 渲染组件（传入空字符串）
    render(<EmptyState message="" />)

    // Assert: 验证显示默认消息（因为空字符串是 falsy 值）
    // 根据组件实现逻辑：message || defaultMessage
    const defaultMessage = screen.getByText('暂无可用场景包，敬请期待')
    expect(defaultMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 9: 空字符串图标处理
   */
  it('当传入空字符串图标时应该显示默认图标', () => {
    // Act: 渲染组件（传入空字符串）
    render(<EmptyState icon="" />)

    // Assert: 验证显示默认图标（因为空字符串是 falsy 值）
    // 根据组件实现逻辑：icon || defaultIcon
    const defaultIcon = screen.getByText('📭')
    expect(defaultIcon).toBeInTheDocument()
  })

  /**
   * 测试用例 10: 长消息文本处理
   */
  it('应该正确处理长消息文本', () => {
    // Arrange: 创建一个很长的消息
    const longMessage =
      '当前暂无可用的场景包。我们正在努力为您准备更多精彩的影院场景体验，包括生日派对、企业年会、求婚策划等多种主题，敬请期待！'

    // Act: 渲染组件
    render(<EmptyState message={longMessage} />)

    // Assert: 验证长消息正确显示
    const emptyMessage = screen.getByText(longMessage)
    expect(emptyMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 11: 特殊字符图标处理
   */
  it('应该正确处理各种 emoji 图标', () => {
    // Arrange: 测试多个不同的 emoji
    const emojiIcons = ['🎬', '🎭', '🎪', '🎨', '🎵', '🎉', '🎊', '🎈']

    emojiIcons.forEach((emoji) => {
      // Act: 渲染组件
      const { container } = render(<EmptyState icon={emoji} />)

      // Assert: 验证 emoji 正确显示
      const emptyIcon = screen.getByText(emoji)
      expect(emptyIcon).toBeInTheDocument()

      // 清理 DOM（为下一次循环做准备）
      container.remove()
    })
  })

  /**
   * 测试用例 12: 多行消息文本处理
   */
  it('应该正确显示包含换行符的消息', () => {
    // Arrange: 创建包含换行的消息
    const multilineMessage = '暂无可用场景包\n请稍后再试'

    // Act: 渲染组件
    render(<EmptyState message={multilineMessage} />)

    // Assert: 验证消息显示（Text 组件应该支持换行符）
    const emptyMessage = screen.getByText(multilineMessage)
    expect(emptyMessage).toBeInTheDocument()
  })

  /**
   * 测试用例 13: 组件不应该有交互元素
   */
  it('组件不应该包含按钮或其他交互元素', () => {
    // Act: 渲染组件
    render(<EmptyState />)

    // Assert: 验证没有按钮
    const buttons = screen.queryAllByRole('button')
    expect(buttons).toHaveLength(0)

    // 验证没有链接
    const links = screen.queryAllByRole('link')
    expect(links).toHaveLength(0)
  })

  /**
   * 测试用例 14: 无障碍性测试（Accessibility）
   */
  it('应该提供适当的语义化 HTML 结构', () => {
    // Act: 渲染组件
    const { container } = render(<EmptyState />)

    // Assert: 验证使用 Text 组件（Taro 的语义化组件）
    const textElement = container.querySelector('.empty-message')
    expect(textElement).toBeInTheDocument()

    // 验证容器结构
    const containerElement = container.querySelector('.empty-state')
    expect(containerElement).toBeInTheDocument()
  })
})
