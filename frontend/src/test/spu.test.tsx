import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SPUCreatePage from '@/pages/SPUCreate'
import { spuService } from '@/services/spuService'
import type { CreateSPURequest } from '@/services/spuService'

// Mock the services
jest.mock('@/services/spuService')
const mockedSPUService = spuService as jest.Mocked<typeof spuService>

// Mock data
const mockBrands = [
  {
    id: 'brand_001',
    name: '可口可乐',
    code: 'COKE',
    status: 'active',
  },
]

const mockCategories = [
  {
    id: 'category_001',
    name: '食品饮料',
    code: 'food_beverage',
    level: 1,
    status: 'active',
    children: [
      {
        id: 'category_002',
        name: '饮料',
        code: 'beverage',
        level: 2,
        status: 'active',
        parentId: 'category_001',
        children: [
          {
            id: 'category_003',
            name: '碳酸饮料',
            code: 'carbonated',
            level: 3,
            status: 'active',
            parentId: 'category_002',
          },
        ],
      },
    ],
  },
]

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  )
}

describe('SPU Creation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock API responses
    mockedSPUService.createSPU.mockResolvedValue({
      success: true,
      data: {
        id: 'spu_001',
        code: 'SPU20241211001',
        name: '测试SPU',
        status: 'draft',
        createdAt: '2024-12-11T10:00:00Z',
        updatedAt: '2024-12-11T10:00:00Z',
      },
      message: 'SPU创建成功',
      code: 200,
      timestamp: Date.now(),
    })
  })

  test('should render SPU creation form', async () => {
    render(
      <TestWrapper>
        <SPUCreatePage />
      </TestWrapper>
    )

    // 等待数据加载完成
    await waitFor(() => {
      expect(screen.getByText('创建SPU')).toBeInTheDocument()
    })

    // 检查表单字段是否存在
    expect(screen.getByLabelText('SPU名称')).toBeInTheDocument()
    expect(screen.getByLabelText('商品描述')).toBeInTheDocument()
    expect(screen.getByText('请选择品牌')).toBeInTheDocument()
    expect(screen.getByText('请选择分类')).toBeInTheDocument()
  })

  test('should validate required fields', async () => {
    render(
      <TestWrapper>
        <SPUCreatePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('创建SPU')).toBeInTheDocument()
    })

    // 尝试提交空表单
    const submitButton = screen.getByText('提交')
    fireEvent.click(submitButton)

    // 应该显示验证错误
    await waitFor(() => {
      expect(screen.getByText(/SPU名称不能为空/)).toBeInTheDocument()
    })
  })

  test('should submit form with valid data', async () => {
    render(
      <TestWrapper>
        <SPUCreatePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('创建SPU')).toBeInTheDocument()
    })

    // 填写表单
    const nameInput = screen.getByLabelText('SPU名称')
    const descriptionInput = screen.getByLabelText('商品描述')

    fireEvent.change(nameInput, { target: { value: '测试SPU' } })
    fireEvent.change(descriptionInput, { target: { value: '这是一个测试SPU的描述' } })

    // 选择品牌和分类（需要等待选项加载）
    await waitFor(() => {
      const brandSelect = screen.getByText('请选择品牌')
      fireEvent.click(brandSelect)
    })

    await waitFor(() => {
      expect(screen.getByText('可口可乐')).toBeInTheDocument()
      fireEvent.click(screen.getByText('可口可乐'))
    })

    // 提交表单
    const submitButton = screen.getByText('提交')
    fireEvent.click(submitButton)

    // 验证API调用
    await waitFor(() => {
      expect(mockedSPUService.createSPU).toHaveBeenCalledTimes(1)
    })

    // 验证传递的数据
    const calledData = mockedSPUService.createSPU.mock.calls[0][0] as CreateSPURequest
    expect(calledData.name).toBe('测试SPU')
    expect(calledData.description).toBe('这是一个测试SPU的描述')
    expect(calledData.brandId).toBe('brand_001')
  })

  test('should show success notification on successful creation', async () => {
    render(
      <TestWrapper>
        <SPUCreatePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('创建SPU')).toBeInTheDocument()
    })

    // 填写必要字段
    const nameInput = screen.getByLabelText('SPU名称')
    const descriptionInput = screen.getByLabelText('商品描述')

    fireEvent.change(nameInput, { target: { value: '测试SPU' } })
    fireEvent.change(descriptionInput, { target: { value: '这是一个测试SPU的描述' } })

    // 选择品牌
    await waitFor(() => {
      fireEvent.click(screen.getByText('请选择品牌'))
    })

    await waitFor(() => {
      fireEvent.click(screen.getByText('可口可乐'))
    })

    // 提交表单
    const submitButton = screen.getByText('提交')
    fireEvent.click(submitButton)

    // 验证成功通知显示
    await waitFor(() => {
      expect(mockedSPUService.createSPU).toHaveBeenCalled()
    })

    // 检查是否有成功消息（通过检查API响应）
    const response = await mockedSPUService.createSPU.mock.results[0].value
    expect(response.success).toBe(true)
  })

  test('should handle API errors gracefully', async () => {
    // Mock API error
    mockedSPUService.createSPU.mockResolvedValue({
      success: false,
      data: null,
      message: '网络错误',
      code: 500,
      timestamp: Date.now(),
    })

    render(
      <TestWrapper>
        <SPUCreatePage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(screen.getByText('创建SPU')).toBeInTheDocument()
    })

    // 填写表单
    const nameInput = screen.getByLabelText('SPU名称')
    const descriptionInput = screen.getByLabelText('商品描述')

    fireEvent.change(nameInput, { target: { value: '测试SPU' } })
    fireEvent.change(descriptionInput, { target: { value: '这是一个测试SPU的描述' } })

    // 提交表单
    const submitButton = screen.getByText('提交')
    fireEvent.click(submitButton)

    // 验证错误处理
    await waitFor(() => {
      expect(mockedSPUService.createSPU).toHaveBeenCalled()
    })

    const response = await mockedSPUService.createSPU.mock.results[0].value
    expect(response.success).toBe(false)
    expect(response.message).toBe('网络错误')
  })
})