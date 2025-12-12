import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfigProvider } from 'antd'
import SPUForm from '../SPUForm'

// Mock the services and components
vi.mock('@/services/attributeService', () => ({
  attributeService: {
    getTemplateList: vi.fn().mockResolvedValue({
      list: [],
      total: 0,
      page: 1,
      pageSize: 100
    })
  }
}))

vi.mock('../BrandSelect', () => ({
  BrandSelect: ({ placeholder }: any) => <div data-testid="brand-select">{placeholder}</div>
}))

vi.mock('../CategorySelector', () => ({
  CategorySelector: ({ placeholder }: any) => <div data-testid="category-select">{placeholder}</div>
}))

vi.mock('@/components/Attribute/AttributeEditor', () => ({
  default: ({ attributes, onChange }: any) => (
    <div data-testid="attribute-editor" data-attributes-count={attributes.length} />
  )
}))

const mockBrands = [
  { id: '1', name: 'Test Brand', code: 'TB' }
]

const mockCategories = [
  { id: '1', name: 'Test Category', code: 'TC' }
]

describe('SPUForm Attribute Template Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderComponent = (props = {}) => {
    return render(
      <ConfigProvider>
        <SPUForm
          brands={mockBrands}
          categories={mockCategories}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
          {...props}
        />
      </ConfigProvider>
    )
  }

  it('应该渲染SPUForm组件', () => {
    renderComponent()

    // 验证基础组件是否存在
    expect(screen.getByTestId('brand-select')).toBeInTheDocument()
    expect(screen.getByTestId('category-select')).toBeInTheDocument()
  })

  it('应该包含属性模板选择字段', () => {
    renderComponent()

    // 验证属性模板相关UI是否存在
    expect(screen.getByText('属性模板')).toBeInTheDocument()
    expect(screen.getByText('模板属性')).toBeInTheDocument()
    expect(screen.getByText('暂无属性模板')).toBeInTheDocument()
  })

  it('应该在未选择模板时显示提示信息', () => {
    renderComponent()

    expect(screen.getByText('请在上方"属性模板"字段中选择一个模板以启用结构化属性管理')).toBeInTheDocument()
  })

  it('应该处理初始值中的属性模板', () => {
    const initialValues = {
      name: 'Test SPU',
      attributeTemplateId: '1',
      attributeValues: {
        testAttr: 'testValue'
      }
    }

    renderComponent({ initialValues })

    // 验证表单能够接收初始值
    expect(screen.getByDisplayValue('Test SPU')).toBeInTheDocument()
  })

  it('应该加载属性模板列表', async () => {
    const { attributeService } = await import('@/services/attributeService')

    renderComponent({
      initialValues: { categoryId: '1' }
    })

    // 验证模板加载逻辑被调用
    expect(attributeService.getTemplateList).toHaveBeenCalledWith({
      page: 1,
      pageSize: 100,
      status: 'active'
    })
  })
})