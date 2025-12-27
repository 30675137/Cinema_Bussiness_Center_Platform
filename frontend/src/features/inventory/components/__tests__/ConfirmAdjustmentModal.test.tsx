/**
 * P004-inventory-adjustment: ConfirmAdjustmentModal 组件单元测试
 * 
 * 测试调整确认弹窗显示。
 * 实现 T015 任务。
 * 
 * @since US1 - 录入库存调整
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmAdjustmentModal } from '../ConfirmAdjustmentModal';

describe('ConfirmAdjustmentModal', () => {
  const defaultProps = {
    open: true,
    adjustment: {
      skuId: 'sku-001',
      skuName: '测试商品',
      storeId: 'store-001',
      storeName: '测试门店',
      type: 'surplus' as const,
      quantity: 10,
      reason: '盘点差异',
      remark: '备注信息',
      currentQty: 100,
      afterQty: 110,
      unit: '个',
    },
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('弹窗显示', () => {
    it('open为true时应该显示弹窗', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('open为false时不应该显示弹窗', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} open={false} />);
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('调整信息显示', () => {
    it('应该显示商品名称', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByText('测试商品')).toBeInTheDocument();
    });

    it('应该显示门店名称', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByText('测试门店')).toBeInTheDocument();
    });

    it('应该显示调整类型', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByText(/盘盈/i)).toBeInTheDocument();
    });

    it('应该显示调整数量', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });

    it('应该显示调整原因', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByText('盘点差异')).toBeInTheDocument();
    });
  });

  describe('库存变化对比', () => {
    it('应该显示调整前数量', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByText(/100/)).toBeInTheDocument();
    });

    it('应该显示调整后数量', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      expect(screen.getByText(/110/)).toBeInTheDocument();
    });
  });

  describe('按钮交互', () => {
    it('点击确认按钮应该调用onConfirm', async () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      const confirmButton = screen.getByRole('button', { name: /确认/i });
      await userEvent.click(confirmButton);
      
      expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('点击取消按钮应该调用onCancel', async () => {
      render(<ConfirmAdjustmentModal {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /取消/i });
      await userEvent.click(cancelButton);
      
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('loading状态时确认按钮应该禁用', () => {
      render(<ConfirmAdjustmentModal {...defaultProps} loading />);
      
      const confirmButton = screen.getByRole('button', { name: /确认/i });
      expect(confirmButton).toBeDisabled();
    });
  });
});
