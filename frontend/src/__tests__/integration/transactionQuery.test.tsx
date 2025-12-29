/**
 * @spec P004-inventory-adjustment
 * T029 [US2] Integration test for transaction query with date filter
 *
 * Tests the complete transaction query workflow:
 * 1. User opens inventory detail drawer
 * 2. User switches to transaction history tab
 * 3. User sees transaction list with color-coded quantities
 * 4. User applies date range filter
 * 5. Transaction list updates with filtered results
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { server } from '@/test/setup'
import { http, HttpResponse } from 'msw'
import { InventoryDetailDrawer } from '@/features/inventory/components/InventoryDetailDrawer'
import type { StoreInventoryItem, InventoryTransaction } from '@/features/inventory/types'
import dayjs from 'dayjs'

// Test data
const mockInventoryItem: StoreInventoryItem = {
  id: 'inv-001',
  skuId: 'sku-001',
  sku: {
    id: 'sku-001',
    code: 'SKU001',
    name: '威士忌',
    unit: '瓶',
    price: 150.0,
    category: '酒水',
  },
  storeId: 'store-001',
  store: {
    id: 'store-001',
    name: '中山路门店',
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

const mockTransactions: InventoryTransaction[] = [
  {
    id: 'tx-001',
    skuId: 'sku-001',
    storeId: 'store-001',
    transactionType: 'adjustment_in',
    quantity: 10,
    stockBefore: 90,
    stockAfter: 100,
    sourceType: 'adjustment_order',
    sourceId: 'adj-001',
    operatorId: 'user-001',
    operatorName: '张三',
    remarks: '盘点发现多余',
    createdAt: dayjs().subtract(1, 'hour').toISOString(),
  },
  {
    id: 'tx-002',
    skuId: 'sku-001',
    storeId: 'store-001',
    transactionType: 'purchase_in',
    quantity: 50,
    stockBefore: 40,
    stockAfter: 90,
    sourceType: 'purchase_order',
    sourceId: 'po-001',
    operatorId: 'user-002',
    operatorName: '李四',
    remarks: '采购入库',
    createdAt: dayjs().subtract(2, 'days').toISOString(),
  },
  {
    id: 'tx-003',
    skuId: 'sku-001',
    storeId: 'store-001',
    transactionType: 'damage_out',
    quantity: -5,
    stockBefore: 45,
    stockAfter: 40,
    sourceType: 'adjustment_order',
    sourceId: 'adj-002',
    operatorId: 'user-001',
    operatorName: '张三',
    remarks: '货物损坏',
    createdAt: dayjs().subtract(3, 'days').toISOString(),
  },
  {
    id: 'tx-004',
    skuId: 'sku-001',
    storeId: 'store-001',
    transactionType: 'reservation_out',
    quantity: -3,
    stockBefore: 48,
    stockAfter: 45,
    sourceType: 'reservation_order',
    sourceId: 'res-001',
    operatorId: 'user-003',
    operatorName: '王五',
    remarks: '预订出库',
    createdAt: dayjs().subtract(5, 'days').toISOString(),
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

describe('Transaction Query Integration Test', () => {
  beforeEach(() => {
    // Setup MSW handlers for this test suite
    server.use(
      http.get('/api/transactions', ({ request }) => {
        const url = new URL(request.url)
        const startDate = url.searchParams.get('startDate')
        const endDate = url.searchParams.get('endDate')

        let filteredTransactions = [...mockTransactions]

        // Apply date filter if provided
        if (startDate && endDate) {
          filteredTransactions = mockTransactions.filter(tx => {
            const txDate = dayjs(tx.createdAt)
            return txDate.isAfter(startDate) && txDate.isBefore(endDate)
          })
        }

        return HttpResponse.json({
          success: true,
          data: filteredTransactions,
          total: filteredTransactions.length,
          page: 1,
          pageSize: 20,
        })
      })
    )
  })

  it('should display transaction list with color-coded quantities', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <TestWrapper>
        <InventoryDetailDrawer
          open={true}
          inventory={mockInventoryItem}
          onClose={onClose}
        />
      </TestWrapper>
    )

    // Step 1: Verify detail drawer is displayed
    expect(screen.getByText('库存详情')).toBeInTheDocument()
    expect(screen.getByText('威士忌')).toBeInTheDocument()

    // Step 2: Switch to transaction history tab
    const transactionTab = screen.getByText('流水记录')
    await user.click(transactionTab)

    // Step 3: Wait for transactions to load and verify display
    await waitFor(() => {
      expect(screen.getByText('tx-001')).toBeInTheDocument()
    })

    // Verify inbound transaction (green +)
    const inboundRow = screen.getByText('盘点发现多余').closest('tr')
    expect(inboundRow).toBeInTheDocument()
    const inboundQuantity = within(inboundRow!).getByText('+10')
    expect(inboundQuantity).toHaveStyle('color: #52c41a') // Green for inbound

    // Verify outbound transaction (red -)
    const outboundRow = screen.getByText('货物损坏').closest('tr')
    expect(outboundRow).toBeInTheDocument()
    const outboundQuantity = within(outboundRow!).getByText('-5')
    expect(outboundQuantity).toHaveStyle('color: #ff4d4f') // Red for outbound

    // Verify all 4 transactions are displayed
    expect(screen.getByText('盘点发现多余')).toBeInTheDocument()
    expect(screen.getByText('采购入库')).toBeInTheDocument()
    expect(screen.getByText('货物损坏')).toBeInTheDocument()
    expect(screen.getByText('预订出库')).toBeInTheDocument()
  })

  it('should filter transactions by date range', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <TestWrapper>
        <InventoryDetailDrawer
          open={true}
          inventory={mockInventoryItem}
          onClose={onClose}
        />
      </TestWrapper>
    )

    // Switch to transaction tab
    const transactionTab = screen.getByText('流水记录')
    await user.click(transactionTab)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    })

    // Step 4: Apply date range filter (last 2 days)
    const dateRangePicker = screen.getByPlaceholderText('选择日期范围')
    await user.click(dateRangePicker)

    // Select start date (2 days ago)
    const startDate = dayjs().subtract(2, 'days').format('YYYY-MM-DD')
    const startDateCell = screen.getByText(dayjs().subtract(2, 'days').date())
    await user.click(startDateCell)

    // Select end date (today)
    const endDateCell = screen.getByText(dayjs().date())
    await user.click(endDateCell)

    // Apply filter
    const applyButton = screen.getByText('确定')
    await user.click(applyButton)

    // Step 5: Verify filtered results
    await waitFor(() => {
      // Should only show transactions from last 2 days
      expect(screen.getByText('盘点发现多余')).toBeInTheDocument()
      expect(screen.getByText('采购入库')).toBeInTheDocument()
      // Should not show older transactions
      expect(screen.queryByText('预订出库')).not.toBeInTheDocument()
    })
  })

  it('should show transaction details when clicking on a row', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    // Add handler for transaction detail
    server.use(
      http.get('/api/transactions/:id', ({ params }) => {
        const transaction = mockTransactions.find(tx => tx.id === params.id)
        return HttpResponse.json({
          success: true,
          data: transaction,
        })
      })
    )

    render(
      <TestWrapper>
        <InventoryDetailDrawer
          open={true}
          inventory={mockInventoryItem}
          onClose={onClose}
        />
      </TestWrapper>
    )

    // Switch to transaction tab
    const transactionTab = screen.getByText('流水记录')
    await user.click(transactionTab)

    // Wait for transactions to load
    await waitFor(() => {
      expect(screen.getByText('盘点发现多余')).toBeInTheDocument()
    })

    // Click on a transaction row
    const transactionRow = screen.getByText('盘点发现多余').closest('tr')
    await user.click(transactionRow!)

    // Verify detail drawer appears
    await waitFor(() => {
      expect(screen.getByText('流水详情')).toBeInTheDocument()
    })

    // Verify detail information
    expect(screen.getByText('类型：盘点入库')).toBeInTheDocument()
    expect(screen.getByText('数量：+10')).toBeInTheDocument()
    expect(screen.getByText('操作人：张三')).toBeInTheDocument()
  })

  it('should handle empty transaction list', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    // Override handler to return empty list
    server.use(
      http.get('/api/transactions', () => {
        return HttpResponse.json({
          success: true,
          data: [],
          total: 0,
          page: 1,
          pageSize: 20,
        })
      })
    )

    render(
      <TestWrapper>
        <InventoryDetailDrawer
          open={true}
          inventory={mockInventoryItem}
          onClose={onClose}
        />
      </TestWrapper>
    )

    // Switch to transaction tab
    const transactionTab = screen.getByText('流水记录')
    await user.click(transactionTab)

    // Should show empty state
    await waitFor(() => {
      expect(screen.getByText('暂无流水记录')).toBeInTheDocument()
    })
  })

  it('should handle API errors when loading transactions', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    // Override handler to return error
    server.use(
      http.get('/api/transactions', () => {
        return HttpResponse.json(
          {
            success: false,
            error: 'INV_SYS_001',
            message: '系统错误',
          },
          { status: 500 }
        )
      })
    )

    render(
      <TestWrapper>
        <InventoryDetailDrawer
          open={true}
          inventory={mockInventoryItem}
          onClose={onClose}
        />
      </TestWrapper>
    )

    // Switch to transaction tab
    const transactionTab = screen.getByText('流水记录')
    await user.click(transactionTab)

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/加载失败/)).toBeInTheDocument()
    })
  })

  it('should support pagination for large transaction lists', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    // Generate large transaction list
    const largeTransactionList = Array.from({ length: 50 }, (_, i) => ({
      id: `tx-${i + 1}`,
      skuId: 'sku-001',
      storeId: 'store-001',
      transactionType: i % 2 === 0 ? 'adjustment_in' : 'adjustment_out',
      quantity: i % 2 === 0 ? 10 : -5,
      stockBefore: 100 + i,
      stockAfter: i % 2 === 0 ? 110 + i : 95 + i,
      sourceType: 'adjustment_order',
      sourceId: `adj-${i + 1}`,
      operatorId: 'user-001',
      operatorName: '测试用户',
      remarks: `测试流水 ${i + 1}`,
      createdAt: dayjs().subtract(i, 'hours').toISOString(),
    }))

    server.use(
      http.get('/api/transactions', ({ request }) => {
        const url = new URL(request.url)
        const page = parseInt(url.searchParams.get('page') || '1')
        const pageSize = parseInt(url.searchParams.get('pageSize') || '20')
        const start = (page - 1) * pageSize
        const end = start + pageSize

        return HttpResponse.json({
          success: true,
          data: largeTransactionList.slice(start, end),
          total: largeTransactionList.length,
          page,
          pageSize,
        })
      })
    )

    render(
      <TestWrapper>
        <InventoryDetailDrawer
          open={true}
          inventory={mockInventoryItem}
          onClose={onClose}
        />
      </TestWrapper>
    )

    // Switch to transaction tab
    const transactionTab = screen.getByText('流水记录')
    await user.click(transactionTab)

    // Wait for first page to load
    await waitFor(() => {
      expect(screen.getByText('测试流水 1')).toBeInTheDocument()
    })

    // Verify pagination controls are displayed
    expect(screen.getByText('共 50 条')).toBeInTheDocument()

    // Click next page
    const nextButton = screen.getByLabelText('下一页')
    await user.click(nextButton)

    // Verify page 2 content
    await waitFor(() => {
      expect(screen.getByText('测试流水 21')).toBeInTheDocument()
    })
  })
})
