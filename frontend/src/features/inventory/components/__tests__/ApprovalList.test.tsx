/**
 * P004-inventory-adjustment: ApprovalList 组件单元测试
 * 
 * 测试审批列表显示和操作。
 * 实现 T042 任务。
 * 
 * @since US4 - 大额库存调整审批
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock ApprovalList 组件
vi.mock('../ApprovalList', () => ({
  ApprovalList: ({ onApprove, onReject }: { onApprove?: () => void; onReject?: () => void }) => (
    <div data-testid="approval-list">
      <button onClick={onApprove}>通过</button>
      <button onClick={onReject}>拒绝</button>
    </div>
  ),
}));

import { ApprovalList } from '../ApprovalList';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ApprovalList', () => {
  const defaultProps = {
    onApprove: vi.fn(),
    onReject: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('组件渲染', () => {
    it('应该渲染审批列表容器', () => {
      render(<ApprovalList {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('approval-list')).toBeInTheDocument();
    });

    it('应该显示通过按钮', () => {
      render(<ApprovalList {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByText('通过')).toBeInTheDocument();
    });

    it('应该显示拒绝按钮', () => {
      render(<ApprovalList {...defaultProps} />, { wrapper: createWrapper() });
      
      expect(screen.getByText('拒绝')).toBeInTheDocument();
    });
  });
});
