/**
 * @spec P004-inventory-adjustment
 * T016 [US1] Integration test for adjustment creation flow
 *
 * Tests the complete adjustment creation workflow:
 * 1. User selects SKU and opens adjustment modal
 * 2. User fills adjustment form
 * 3. User sees confirmation modal with before/after comparison
 * 4. User confirms adjustment
 * 5. Adjustment is created and inventory is updated
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { server } from '@/test/setup'
import { http, HttpResponse } from 'msw'
import { AdjustmentModal } from '@/features/inventory/components/AdjustmentModal'
import type { StoreInventoryItem, AdjustmentReason } from '@/features/inventory/types'

// Test data
const mockInventoryItem: StoreInventoryItem = {
  id: 'inv-001',
  skuId: 'sku-001',
  sku: {
    id: 'sku-001',
    code: 'SKU001',
    name: '测试商品',
    unit: '瓶',
    price: 50.0,
    category: '饮料',
  },
  storeId: 'store-001',
  store: {
    id: 'store-001',
    name: '测试门店',
    code: 'ST001',
  },
  onHandQty: 100,
  availableQty: 80,
  reservedQty: 20,
  safetyStock: 50,
  minStock: 30,
  maxStock: 200,
  status: 'normal',
  version: 1,
  updatedAt: new Date().toISOString(),
}

const mockReasons: AdjustmentReason[] = [
  {
    id: 'reason-001',
    code: 'STOCK_DIFF',
    name: '盘点差异',
    category: 'surplus',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'reason-002',
    code: 'GOODS_DAMAGE',
    name: '货物损坏',
    category: 'damage',
    isActive: true,
    sortOrder: 2,
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

describe('Adjustment Creation Integration Test', () => {
  beforeEach(() => {
    // Setup MSW handlers for this test suite
    server.use(
      http.get('/api/adjustment-reasons', () => {
        return HttpResponse.json({
          success: true,
          data: mockReasons,
        })
      }),
      http.post('/api/adjustments', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({
          success: true,
          data: {
            id: 'adj-001',
            adjustmentNumber: 'ADJ20251227001',
            ...body,
            status: 'approved',
            stockBefore: mockInventoryItem.onHandQty,
            stockAfter: mockInventoryItem.onHandQty + (body.adjustmentType === 'surplus' ? body.quantity : -body.quantity),
            availableBefore: mockInventoryItem.availableQty,
            availableAfter: mockInventoryItem.availableQty + (body.adjustmentType === 'surplus' ? body.quantity : -body.quantity),
            requiresApproval: false,
            operatorId: 'user-001',
            operatorName: '测试用户',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          },
        })
      })
    )
  })

  it('should complete the full adjustment creation workflow', async () => {
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

    // Step 1: Verify adjustment form is displayed
    expect(screen.getByText('库存调整')).toBeInTheDocument()
    expect(screen.getByText('测试商品')).toBeInTheDocument()

    // Step 2: Fill in adjustment form
    // Select adjustment type
    const typeSelect = screen.getByLabelText('调整类型')
    await user.click(typeSelect)
    await waitFor(() => {
      expect(screen.getByText('盘盈')).toBeInTheDocument()
    })
    await user.click(screen.getByText('盘盈'))

    // Enter quantity
    const quantityInput = screen.getByLabelText('调整数量')
    await user.clear(quantityInput)
    await user.type(quantityInput, '10')

    // Select reason (wait for reasons to load)
    await waitFor(() => {
      const reasonSelect = screen.getByLabelText('调整原因')
      expect(reasonSelect).toBeInTheDocument()
    })
    const reasonSelect = screen.getByLabelText('调整原因')
    await user.click(reasonSelect)
    await waitFor(() => {
      expect(screen.getByText('盘点差异')).toBeInTheDocument()
    })
    await user.click(screen.getByText('盘点差异'))

    // Enter remarks (optional)
    const remarksInput = screen.getByLabelText('备注')
    await user.type(remarksInput, '测试调整')

    // Step 3: Submit form to show confirmation modal
    const submitButton = screen.getByText('提交')
    await user.click(submitButton)

    // Step 4: Verify confirmation modal appears with before/after comparison
    await waitFor(() => {
      expect(screen.getByText('确认库存调整')).toBeInTheDocument()
    })
    expect(screen.getByText('调整前')).toBeInTheDocument()
    expect(screen.getByText('调整后')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument() // before quantity
    expect(screen.getByText('110')).toBeInTheDocument() // after quantity

    // Step 5: Confirm adjustment
    const confirmButton = screen.getByText('确认调整')
    await user.click(confirmButton)

    // Step 6: Verify success callback is called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('should handle large adjustment requiring approval', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSuccess = vi.fn()

    // Override handler for large adjustment
    server.use(
      http.post('/api/adjustments', async ({ request }) => {
        const body = await request.json()
        const adjustmentAmount = body.quantity * mockInventoryItem.sku.price
        const requiresApproval = adjustmentAmount >= 1000

        return HttpResponse.json({
          success: true,
          data: {
            id: 'adj-002',
            adjustmentNumber: 'ADJ20251227002',
            ...body,
            status: requiresApproval ? 'pending_approval' : 'approved',
            stockBefore: mockInventoryItem.onHandQty,
            stockAfter: mockInventoryItem.onHandQty,
            availableBefore: mockInventoryItem.availableQty,
            availableAfter: mockInventoryItem.availableQty,
            requiresApproval,
            operatorId: 'user-001',
            operatorName: '测试用户',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          },
        })
      })
    )

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

    // Fill form with large quantity (total >= 1000 yuan)
    const typeSelect = screen.getByLabelText('调整类型')
    await user.click(typeSelect)
    await user.click(screen.getByText('盘盈'))

    // 50 yuan * 20 = 1000 yuan (threshold)
    const quantityInput = screen.getByLabelText('调整数量')
    await user.clear(quantityInput)
    await user.type(quantityInput, '20')

    const reasonSelect = screen.getByLabelText('调整原因')
    await user.click(reasonSelect)
    await waitFor(() => {
      expect(screen.getByText('盘点差异')).toBeInTheDocument()
    })
    await user.click(screen.getByText('盘点差异'))

    // Submit
    await user.click(screen.getByText('提交'))

    // Confirm
    await waitFor(() => {
      expect(screen.getByText('确认调整')).toBeInTheDocument()
    })
    await user.click(screen.getByText('确认调整'))

    // Should show pending approval message
    await waitFor(() => {
      expect(screen.getByText(/待审批/)).toBeInTheDocument()
    })
  })

  it('should show validation errors for invalid input', async () => {
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

    // Try to submit without filling required fields
    const submitButton = screen.getByText('提交')
    await user.click(submitButton)

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/请选择调整类型/)).toBeInTheDocument()
      expect(screen.getByText(/请输入调整数量/)).toBeInTheDocument()
      expect(screen.getByText(/请选择调整原因/)).toBeInTheDocument()
    })

    // onSuccess should not be called
    expect(onSuccess).not.toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSuccess = vi.fn()

    // Override handler to return error
    server.use(
      http.post('/api/adjustments', () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'INV_VAL_001',
            message: '库存数量不足',
          },
          { status: 400 }
        )
      })
    )

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

    // Fill and submit form
    const typeSelect = screen.getByLabelText('调整类型')
    await user.click(typeSelect)
    await user.click(screen.getByText('盘亏'))

    const quantityInput = screen.getByLabelText('调整数量')
    await user.clear(quantityInput)
    await user.type(quantityInput, '200')

    await waitFor(() => {
      const reasonSelect = screen.getByLabelText('调整原因')
      expect(reasonSelect).toBeInTheDocument()
    })
    const reasonSelect = screen.getByLabelText('调整原因')
    await user.click(reasonSelect)
    await user.click(screen.getByText('盘点差异'))

    await user.click(screen.getByText('提交'))

    // Confirm
    await waitFor(() => {
      expect(screen.getByText('确认调整')).toBeInTheDocument()
    })
    await user.click(screen.getByText('确认调整'))

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('库存数量不足')).toBeInTheDocument()
    })

    // Should not call onSuccess
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
