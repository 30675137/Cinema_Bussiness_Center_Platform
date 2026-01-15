/**
 * P004-inventory-adjustment: AdjustmentForm 组件单元测试
 *
 * 测试调整表单验证和交互。
 * 实现 T014 和 T036 任务。
 *
 * @since US1 - 录入库存调整
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdjustmentForm } from '../AdjustmentForm';

// Mock useAdjustmentReasons hook
vi.mock('../../hooks/useAdjustmentReasons', () => ({
  useAdjustmentReasons: vi.fn(() => ({
    data: [
      { id: '1', code: 'R001', name: '盘点差异', type: 'surplus' },
      { id: '2', code: 'R002', name: '商品破损', type: 'damage' },
    ],
    isLoading: false,
    isError: false,
  })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AdjustmentForm', () => {
  const defaultProps = {
    skuId: 'sku-001',
    skuName: '测试商品',
    storeId: 'store-001',
    currentQty: 100,
    unit: '个',
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('表单渲染', () => {
    it('应该显示SKU信息', () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText('测试商品')).toBeInTheDocument();
    });

    it('应该显示调整类型选择', () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/调整类型/i)).toBeInTheDocument();
    });

    it('应该显示调整数量输入', () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/调整数量/i)).toBeInTheDocument();
    });

    it('应该显示调整原因选择', () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/调整原因/i)).toBeInTheDocument();
    });
  });

  describe('表单验证', () => {
    it('调整数量为空时应该显示错误', async () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      const submitButton = screen.getByRole('button', { name: /确认/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请输入调整数量/i)).toBeInTheDocument();
      });
    });

    it('调整数量为0时应该显示错误', async () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      const quantityInput = screen.getByLabelText(/调整数量/i);
      await userEvent.clear(quantityInput);
      await userEvent.type(quantityInput, '0');

      const submitButton = screen.getByRole('button', { name: /确认/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/调整数量不能为0/i)).toBeInTheDocument();
      });
    });

    // T036: 原因必填验证
    it('未选择调整原因时应该显示错误', async () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      // 填写数量但不选择原因
      const quantityInput = screen.getByLabelText(/调整数量/i);
      await userEvent.type(quantityInput, '10');

      const submitButton = screen.getByRole('button', { name: /确认/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/请选择调整原因/i)).toBeInTheDocument();
      });
    });
  });

  describe('表单交互', () => {
    it('点击取消按钮应该调用onCancel', async () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      const cancelButton = screen.getByRole('button', { name: /取消/i });
      await userEvent.click(cancelButton);

      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('调整类型', () => {
    it('应该有盘盈选项', () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/盘盈/i)).toBeInTheDocument();
    });

    it('应该有盘亏选项', () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/盘亏/i)).toBeInTheDocument();
    });

    it('应该有报损选项', () => {
      render(<AdjustmentForm {...defaultProps} />, { wrapper: createWrapper() });

      expect(screen.getByText(/报损/i)).toBeInTheDocument();
    });
  });
});
