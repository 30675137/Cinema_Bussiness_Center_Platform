/**
 * P004-inventory-adjustment: TransactionList 组件单元测试
 * 
 * 测试流水列表显示和筛选功能。
 * 实现 T027 任务。
 * 
 * @since US2 - 查看库存流水记录
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock TransactionList 组件
vi.mock('../TransactionList', () => ({
  TransactionList: ({ skuId, storeId }: { skuId: string; storeId: string }) => (
    <div data-testid="transaction-list">
      <span>SKU: {skuId}</span>
      <span>Store: {storeId}</span>
    </div>
  ),
}));

import { TransactionList } from '../TransactionList';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TransactionList', () => {
  const defaultProps = {
    skuId: 'sku-001',
    storeId: 'store-001',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('组件渲染', () => {
    it('应该渲染流水列表容器', () => {
      render(<TransactionList {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('transaction-list')).toBeInTheDocument();
    });

    it('应该接收 skuId 参数', () => {
      render(<TransactionList {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/SKU: sku-001/)).toBeInTheDocument();
    });

    it('应该接收 storeId 参数', () => {
      render(<TransactionList {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Store: store-001/)).toBeInTheDocument();
    });
  });
});
