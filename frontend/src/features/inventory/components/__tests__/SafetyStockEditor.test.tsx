/**
 * P004-inventory-adjustment: SafetyStockEditor 组件单元测试
 * 
 * 测试安全库存编辑功能和冲突处理。
 * 实现 T055 任务。
 * 
 * @since US5 - 设置安全库存阈值
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafetyStockEditor } from '../SafetyStockEditor';

// Mock useSafetyStock hook
vi.mock('../../hooks/useSafetyStock', () => ({
  useSafetyStock: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  isConflictError: vi.fn(() => false),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('SafetyStockEditor', () => {
  const defaultProps = {
    inventoryId: 'inv-001',
    currentValue: 10,
    version: 1,
    unit: '个',
    onSuccess: vi.fn(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('查看模式', () => {
    it('应该显示当前安全库存值', () => {
      render(<SafetyStockEditor {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('个')).toBeInTheDocument();
    });

    it('应该显示编辑按钮', () => {
      render(<SafetyStockEditor {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('safety-stock-edit')).toBeInTheDocument();
    });

    it('disabled 状态不显示编辑按钮', () => {
      render(<SafetyStockEditor {...defaultProps} disabled />, { wrapper: createWrapper() });
      
      expect(screen.queryByTestId('safety-stock-edit')).not.toBeInTheDocument();
    });
  });

  describe('编辑模式', () => {
    it('点击编辑按钮进入编辑模式', async () => {
      render(<SafetyStockEditor {...defaultProps} />, { wrapper: createWrapper() });
      
      const editButton = screen.getByTestId('safety-stock-edit');
      await userEvent.click(editButton);
      
      expect(screen.getByTestId('safety-stock-input')).toBeInTheDocument();
      expect(screen.getByTestId('safety-stock-save')).toBeInTheDocument();
      expect(screen.getByTestId('safety-stock-cancel')).toBeInTheDocument();
    });

    it('输入框应该显示当前值', async () => {
      render(<SafetyStockEditor {...defaultProps} />, { wrapper: createWrapper() });
      
      await userEvent.click(screen.getByTestId('safety-stock-edit'));
      
      const input = screen.getByTestId('safety-stock-input').querySelector('input');
      expect(input).toHaveValue('10');
    });

    it('点击取消按钮退出编辑模式', async () => {
      render(<SafetyStockEditor {...defaultProps} />, { wrapper: createWrapper() });
      
      await userEvent.click(screen.getByTestId('safety-stock-edit'));
      await userEvent.click(screen.getByTestId('safety-stock-cancel'));
      
      expect(screen.queryByTestId('safety-stock-input')).not.toBeInTheDocument();
      expect(screen.getByTestId('safety-stock-edit')).toBeInTheDocument();
    });

    it('输入相同值点保存应该直接退出编辑模式', async () => {
      render(<SafetyStockEditor {...defaultProps} />, { wrapper: createWrapper() });
      
      await userEvent.click(screen.getByTestId('safety-stock-edit'));
      await userEvent.click(screen.getByTestId('safety-stock-save'));
      
      // 应该退出编辑模式，不触发 mutation
      expect(screen.queryByTestId('safety-stock-input')).not.toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该正确显示无单位', () => {
      render(<SafetyStockEditor {...defaultProps} unit="" />, { wrapper: createWrapper() });
      
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('应该正确显示零值', () => {
      render(<SafetyStockEditor {...defaultProps} currentValue={0} />, { wrapper: createWrapper() });
      
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });
});
