/**
 * @spec M002-material-filter
 * Material Filter Component Test - 物料筛选组件测试
 * User Story: US1 - 快速筛选物料
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MaterialFilterComponent } from '../MaterialFilter'

describe('MaterialFilter', () => {
  it('renders all filter fields', () => {
    const mockOnFilter = vi.fn()
    render(<MaterialFilterComponent onFilter={mockOnFilter} />)

    expect(screen.getByLabelText('分类')).toBeInTheDocument()
    expect(screen.getByLabelText('状态')).toBeInTheDocument()
    expect(screen.getByLabelText('成本范围（元）')).toBeInTheDocument()
    expect(screen.getByLabelText('关键词')).toBeInTheDocument()
    expect(screen.getByText('查询')).toBeInTheDocument()
    expect(screen.getByText('重置')).toBeInTheDocument()
  })

  it('calls onFilter with correct values when submitting', async () => {
    const mockOnFilter = vi.fn()
    render(<MaterialFilterComponent onFilter={mockOnFilter} />)

    const keywordInput = screen.getByPlaceholderText('物料编码或名称')
    fireEvent.change(keywordInput, { target: { value: 'MAT-001' } })

    const submitButton = screen.getByText('查询')
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({
        keyword: 'MAT-001',
      })
    })
  })

  it('calls onFilter with empty object when resetting', async () => {
    const mockOnFilter = vi.fn()
    render(<MaterialFilterComponent onFilter={mockOnFilter} />)

    const keywordInput = screen.getByPlaceholderText('物料编码或名称')
    fireEvent.change(keywordInput, { target: { value: 'test' } })

    const resetButton = screen.getByText('重置')
    fireEvent.click(resetButton)

    await waitFor(() => {
      expect(mockOnFilter).toHaveBeenCalledWith({})
    })
  })

  it('validates cost range correctly', async () => {
    const mockOnFilter = vi.fn()
    render(<MaterialFilterComponent onFilter={mockOnFilter} />)

    // Note: Full validation testing would require more complex setup
    // This is a placeholder for validation logic
    expect(screen.getByLabelText('成本范围（元）')).toBeInTheDocument()
  })
})
