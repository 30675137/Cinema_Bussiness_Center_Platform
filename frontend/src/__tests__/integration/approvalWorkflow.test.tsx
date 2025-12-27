/**
 * @spec P004-inventory-adjustment
 * T043 [US4] Integration test for approval workflow
 *
 * Tests the complete approval workflow:
 * 1. Create large adjustment (>= threshold)
 * 2. Adjustment enters pending_approval status
 * 3. Operations director can view pending approvals
 * 4. Operations director can approve or reject
 * 5. Applicant can withdraw pending approval
 * 6. Inventory updates only after approval
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { server } from '@/test/setup'
import { http, HttpResponse } from 'msw'
import { ApprovalPage } from '@/pages/inventory/ApprovalPage'
import { AdjustmentModal } from '@/features/inventory/components/AdjustmentModal'
import type { StoreInventoryItem, InventoryAdjustment, ApprovalRecord } from '@/features/inventory/types'

// Test data
const mockInventoryItem: StoreInventoryItem = {
  id: 'inv-001',
  skuId: 'sku-001',
  sku: {
    id: 'sku-001',
    code: 'SKU001',
    name: '高端威士忌',
    unit: '瓶',
    price: 200.0, // High price to easily trigger approval
    category: '酒水',
  },
  storeId: 'store-001',
  store: {
    id: 'store-001',
    name: '中山路门店',
    code: 'ST001',
  },
  onHandQty: 50,
  availableQty: 40,
  reservedQty: 10,
  safetyStock: 20,
  minStock: 15,
  maxStock: 100,
  status: 'normal',
  version: 1,
  updatedAt: new Date().toISOString(),
}

const mockPendingAdjustments: InventoryAdjustment[] = [
  {
    id: 'adj-001',
    adjustmentNumber: 'ADJ20251227001',
    skuId: 'sku-001',
    sku: mockInventoryItem.sku,
    storeId: 'store-001',
    store: mockInventoryItem.store,
    adjustmentType: 'surplus',
    quantity: 10,
    unitPrice: 200.0,
    adjustmentAmount: 2000.0,
    reasonCode: 'STOCK_DIFF',
    reasonText: '盘点差异',
    remarks: '年终盘点发现多余',
    status: 'pending_approval',
    stockBefore: 50,
    stockAfter: 60,
    availableBefore: 40,
    availableAfter: 50,
    requiresApproval: true,
    operatorId: 'user-001',
    operatorName: '张三',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  },
  {
    id: 'adj-002',
    adjustmentNumber: 'ADJ20251227002',
    skuId: 'sku-002',
    sku: {
      id: 'sku-002',
      code: 'SKU002',
      name: '红酒',
      unit: '瓶',
      price: 150.0,
      category: '酒水',
    },
    storeId: 'store-001',
    adjustmentType: 'shortage',
    quantity: 8,
    unitPrice: 150.0,
    adjustmentAmount: 1200.0,
    reasonCode: 'GOODS_DAMAGE',
    reasonText: '货物损坏',
    remarks: '发现破损',
    status: 'pending_approval',
    stockBefore: 30,
    stockAfter: 22,
    availableBefore: 25,
    availableAfter: 17,
    requiresApproval: true,
    operatorId: 'user-002',
    operatorName: '李四',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  },
]

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Approval Workflow Integration Test', () => {
  beforeEach(() => {
    // Setup MSW handlers
    server.use(
      // Get pending approvals
      http.get('/api/approvals/pending', () => {
        return HttpResponse.json({
          success: true,
          data: mockPendingAdjustments,
          total: mockPendingAdjustments.length,
        })
      }),
      // Get adjustment reasons
      http.get('/api/adjustment-reasons', () => {
        return HttpResponse.json({
          success: true,
          data: [
            {
              id: 'reason-001',
              code: 'STOCK_DIFF',
              name: '盘点差异',
              category: 'surplus',
              isActive: true,
              sortOrder: 1,
            },
          ],
        })
      }),
      // Create adjustment
      http.post('/api/adjustments', async ({ request }) => {
        const body = await request.json()
        const adjustmentAmount = body.quantity * mockInventoryItem.sku.price
        const requiresApproval = adjustmentAmount >= 1000

        return HttpResponse.json({
          success: true,
          data: {
            id: 'adj-new',
            adjustmentNumber: 'ADJ20251227003',
            ...body,
            status: requiresApproval ? 'pending_approval' : 'approved',
            stockBefore: mockInventoryItem.onHandQty,
            stockAfter: mockInventoryItem.onHandQty + body.quantity,
            availableBefore: mockInventoryItem.availableQty,
            availableAfter: mockInventoryItem.availableQty + body.quantity,
            requiresApproval,
            operatorId: 'user-001',
            operatorName: '测试用户',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          },
        })
      }),
      // Approve adjustment
      http.post('/api/approvals/:id/approve', ({ params }) => {
        const adjustment = mockPendingAdjustments.find(a => a.id === params.id)
        if (!adjustment) {
          return HttpResponse.json(
            {
              success: false,
              error: 'INV_NTF_001',
              message: '调整记录不存在',
            },
            { status: 404 }
          )
        }

        return HttpResponse.json({
          success: true,
          data: {
            ...adjustment,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: 'director-001',
          },
        })
      }),
      // Reject adjustment
      http.post('/api/approvals/:id/reject', ({ params }) => {
        const adjustment = mockPendingAdjustments.find(a => a.id === params.id)
        if (!adjustment) {
          return HttpResponse.json(
            {
              success: false,
              error: 'INV_NTF_001',
              message: '调整记录不存在',
            },
            { status: 404 }
          )
        }

        return HttpResponse.json({
          success: true,
          data: {
            ...adjustment,
            status: 'rejected',
          },
        })
      }),
      // Withdraw adjustment
      http.post('/api/adjustments/:id/withdraw', ({ params }) => {
        const adjustment = mockPendingAdjustments.find(a => a.id === params.id)
        if (!adjustment) {
          return HttpResponse.json(
            {
              success: false,
              error: 'INV_NTF_001',
              message: '调整记录不存在',
            },
            { status: 404 }
          )
        }

        return HttpResponse.json({
          success: true,
          data: {
            ...adjustment,
            status: 'withdrawn',
          },
        })
      })
    )
  })

  it('should create large adjustment and enter pending approval status', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSuccess = vi.fn()

    render(
      <TestWrapper>
        <AdjustmentModal
          open={true}
          inventory={mockInventoryItem}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </TestWrapper>
    )

    // Fill form with large quantity (triggers approval)
    const typeSelect = screen.getByLabelText('调整类型')
    await user.click(typeSelect)
    await user.click(screen.getByText('盘盈'))

    // 200 yuan * 10 = 2000 yuan (> 1000 threshold)
    const quantityInput = screen.getByLabelText('调整数量')
    await user.clear(quantityInput)
    await user.type(quantityInput, '10')

    await waitFor(() => {
      const reasonSelect = screen.getByLabelText('调整原因')
      expect(reasonSelect).toBeInTheDocument()
    })
    const reasonSelect = screen.getByLabelText('调整原因')
    await user.click(reasonSelect)
    await user.click(screen.getByText('盘点差异'))

    // Submit
    await user.click(screen.getByText('提交'))

    // Confirm
    await waitFor(() => {
      expect(screen.getByText('确认调整')).toBeInTheDocument()
    })
    await user.click(screen.getByText('确认调整'))

    // Should show pending approval notification
    await waitFor(() => {
      expect(screen.getByText(/需要审批/)).toBeInTheDocument()
    })
    expect(onSuccess).toHaveBeenCalled()
  })

  it('should display pending approvals list for operations director', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ApprovalPage />
      </TestWrapper>
    )

    // Wait for pending approvals to load
    await waitFor(() => {
      expect(screen.getByText('库存调整审批')).toBeInTheDocument()
    })

    // Verify both pending adjustments are displayed
    expect(screen.getByText('ADJ20251227001')).toBeInTheDocument()
    expect(screen.getByText('ADJ20251227002')).toBeInTheDocument()
    expect(screen.getByText('高端威士忌')).toBeInTheDocument()
    expect(screen.getByText('红酒')).toBeInTheDocument()

    // Verify adjustment details
    expect(screen.getByText('张三')).toBeInTheDocument()
    expect(screen.getByText('李四')).toBeInTheDocument()
    expect(screen.getByText('¥2,000.00')).toBeInTheDocument()
    expect(screen.getByText('¥1,200.00')).toBeInTheDocument()
  })

  it('should allow operations director to approve adjustment', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ApprovalPage />
      </TestWrapper>
    )

    // Wait for list to load
    await waitFor(() => {
      expect(screen.getByText('ADJ20251227001')).toBeInTheDocument()
    })

    // Find the first adjustment row
    const firstRow = screen.getByText('ADJ20251227001').closest('tr')
    expect(firstRow).toBeInTheDocument()

    // Click approve button
    const approveButton = within(firstRow!).getByText('通过')
    await user.click(approveButton)

    // Verify approval confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('确认审批')).toBeInTheDocument()
    })

    // Enter approval comments
    const commentsInput = screen.getByPlaceholderText('请输入审批意见')
    await user.type(commentsInput, '盘点数据准确，同意调整')

    // Confirm approval
    const confirmButton = screen.getByText('确认')
    await user.click(confirmButton)

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/审批成功/)).toBeInTheDocument()
    })

    // Adjustment should be removed from pending list
    await waitFor(() => {
      expect(screen.queryByText('ADJ20251227001')).not.toBeInTheDocument()
    })
  })

  it('should allow operations director to reject adjustment', async () => {
    const user = userEvent.setup()

    render(
      <TestWrapper>
        <ApprovalPage />
      </TestWrapper>
    )

    // Wait for list to load
    await waitFor(() => {
      expect(screen.getByText('ADJ20251227002')).toBeInTheDocument()
    })

    // Find the second adjustment row
    const secondRow = screen.getByText('ADJ20251227002').closest('tr')
    expect(secondRow).toBeInTheDocument()

    // Click reject button
    const rejectButton = within(secondRow!).getByText('拒绝')
    await user.click(rejectButton)

    // Verify rejection confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText('确认拒绝')).toBeInTheDocument()
    })

    // Enter rejection reason (required)
    const reasonInput = screen.getByPlaceholderText('请输入拒绝原因')
    await user.type(reasonInput, '盘点数据存疑，需重新核对')

    // Confirm rejection
    const confirmButton = screen.getByText('确认')
    await user.click(confirmButton)

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/拒绝成功/)).toBeInTheDocument()
    })

    // Adjustment should be removed from pending list
    await waitFor(() => {
      expect(screen.queryByText('ADJ20251227002')).not.toBeInTheDocument()
    })
  })

  it('should allow applicant to withdraw pending adjustment', async () => {
    const user = userEvent.setup()

    // Add handler for getting user's adjustments
    server.use(
      http.get('/api/adjustments/my', () => {
        return HttpResponse.json({
          success: true,
          data: [mockPendingAdjustments[0]], // Only first one belongs to user
        })
      })
    )

    render(
      <TestWrapper>
        <ApprovalPage userRole="applicant" />
      </TestWrapper>
    )

    // Wait for user's adjustments to load
    await waitFor(() => {
      expect(screen.getByText('我的调整申请')).toBeInTheDocument()
    })

    expect(screen.getByText('ADJ20251227001')).toBeInTheDocument()

    // Click withdraw button
    const withdrawButton = screen.getByText('撤回')
    await user.click(withdrawButton)

    // Verify withdrawal confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('确认撤回')).toBeInTheDocument()
    })

    // Confirm withdrawal
    const confirmButton = screen.getByText('确认')
    await user.click(confirmButton)

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/撤回成功/)).toBeInTheDocument()
    })

    // Adjustment should be removed from list
    await waitFor(() => {
      expect(screen.queryByText('ADJ20251227001')).not.toBeInTheDocument()
    })
  })

  it('should verify inventory is NOT updated until approval', async () => {
    const user = userEvent.setup()

    // Track inventory updates
    const inventoryUpdates: any[] = []
    server.use(
      http.get('/api/inventory/:id', ({ params }) => {
        return HttpResponse.json({
          success: true,
          data: mockInventoryItem, // Inventory unchanged
        })
      }),
      http.patch('/api/inventory/:id', async ({ request }) => {
        const body = await request.json()
        inventoryUpdates.push(body)
        return HttpResponse.json({
          success: true,
          data: {
            ...mockInventoryItem,
            ...body,
          },
        })
      })
    )

    render(
      <TestWrapper>
        <AdjustmentModal
          open={true}
          inventory={mockInventoryItem}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </TestWrapper>
    )

    // Create large adjustment
    const typeSelect = screen.getByLabelText('调整类型')
    await user.click(typeSelect)
    await user.click(screen.getByText('盘盈'))

    const quantityInput = screen.getByLabelText('调整数量')
    await user.clear(quantityInput)
    await user.type(quantityInput, '10')

    await waitFor(() => {
      const reasonSelect = screen.getByLabelText('调整原因')
      expect(reasonSelect).toBeInTheDocument()
    })
    const reasonSelect = screen.getByLabelText('调整原因')
    await user.click(reasonSelect)
    await user.click(screen.getByText('盘点差异'))

    await user.click(screen.getByText('提交'))
    await waitFor(() => {
      expect(screen.getByText('确认调整')).toBeInTheDocument()
    })
    await user.click(screen.getByText('确认调整'))

    // Wait for creation to complete
    await waitFor(() => {
      expect(screen.getByText(/需要审批/)).toBeInTheDocument()
    })

    // Verify inventory was NOT updated (should be empty array)
    expect(inventoryUpdates).toHaveLength(0)
  })

  it('should handle approval errors gracefully', async () => {
    const user = userEvent.setup()

    // Override handler to return error
    server.use(
      http.post('/api/approvals/:id/approve', () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'INV_BIZ_001',
            message: '审批失败：调整单已被其他人处理',
          },
          { status: 409 }
        )
      })
    )

    render(
      <TestWrapper>
        <ApprovalPage />
      </TestWrapper>
    )

    // Wait for list to load
    await waitFor(() => {
      expect(screen.getByText('ADJ20251227001')).toBeInTheDocument()
    })

    // Try to approve
    const approveButton = screen.getByText('通过')
    await user.click(approveButton)

    await waitFor(() => {
      expect(screen.getByText('确认审批')).toBeInTheDocument()
    })

    const confirmButton = screen.getByText('确认')
    await user.click(confirmButton)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/调整单已被其他人处理/)).toBeInTheDocument()
    })
  })
})
