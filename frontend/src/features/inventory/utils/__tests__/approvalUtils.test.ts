/**
 * P004-inventory-adjustment: approvalUtils 工具函数单元测试
 * 
 * 测试审批阈值计算和状态判断逻辑。
 * 实现 T041 任务。
 * 
 * @since US4 - 大额库存调整审批
 */

import { describe, it, expect } from 'vitest';
import {
  APPROVAL_THRESHOLD,
  requiresApproval,
  calculateAdjustmentAmount,
  canWithdraw,
  canApprove,
  isFinalStatus,
  getStatusText,
  getStatusColor,
} from '../approvalUtils';

describe('approvalUtils', () => {
  describe('APPROVAL_THRESHOLD', () => {
    it('应该等于1000', () => {
      expect(APPROVAL_THRESHOLD).toBe(1000);
    });
  });

  describe('calculateAdjustmentAmount', () => {
    it('正数数量应该正确计算金额', () => {
      expect(calculateAdjustmentAmount(10, 50)).toBe(500);
    });

    it('负数数量应该取绝对值计算', () => {
      expect(calculateAdjustmentAmount(-10, 50)).toBe(500);
    });

    it('零数量应该返回0', () => {
      expect(calculateAdjustmentAmount(0, 100)).toBe(0);
    });

    it('大数量应该正确计算', () => {
      expect(calculateAdjustmentAmount(1000, 100)).toBe(100000);
    });
  });

  describe('requiresApproval', () => {
    it('金额小于阈值不需要审批', () => {
      expect(requiresApproval(10, 50)).toBe(false); // 500 < 1000
    });

    it('金额等于阈值需要审批', () => {
      expect(requiresApproval(20, 50)).toBe(true); // 1000 = 1000
    });

    it('金额大于阈值需要审批', () => {
      expect(requiresApproval(100, 15)).toBe(true); // 1500 > 1000
    });

    it('负数数量也应该正确判断', () => {
      expect(requiresApproval(-100, 15)).toBe(true); // |-100| * 15 = 1500
    });

    it('边界值测试: 999元不需要审批', () => {
      expect(requiresApproval(999, 1)).toBe(false);
    });

    it('边界值测试: 1000元需要审批', () => {
      expect(requiresApproval(1000, 1)).toBe(true);
    });
  });

  describe('canWithdraw', () => {
    it('待审批状态可以撤回', () => {
      expect(canWithdraw('pending_approval')).toBe(true);
    });

    it('草稿状态不能撤回', () => {
      expect(canWithdraw('draft')).toBe(false);
    });

    it('已通过状态不能撤回', () => {
      expect(canWithdraw('approved')).toBe(false);
    });

    it('已拒绝状态不能撤回', () => {
      expect(canWithdraw('rejected')).toBe(false);
    });

    it('已撤回状态不能再撤回', () => {
      expect(canWithdraw('withdrawn')).toBe(false);
    });
  });

  describe('canApprove', () => {
    it('待审批状态可以审批', () => {
      expect(canApprove('pending_approval')).toBe(true);
    });

    it('其他状态不能审批', () => {
      expect(canApprove('draft')).toBe(false);
      expect(canApprove('approved')).toBe(false);
      expect(canApprove('rejected')).toBe(false);
      expect(canApprove('withdrawn')).toBe(false);
    });
  });

  describe('isFinalStatus', () => {
    it('已通过是最终状态', () => {
      expect(isFinalStatus('approved')).toBe(true);
    });

    it('已拒绝是最终状态', () => {
      expect(isFinalStatus('rejected')).toBe(true);
    });

    it('已撤回是最终状态', () => {
      expect(isFinalStatus('withdrawn')).toBe(true);
    });

    it('待审批不是最终状态', () => {
      expect(isFinalStatus('pending_approval')).toBe(false);
    });

    it('草稿不是最终状态', () => {
      expect(isFinalStatus('draft')).toBe(false);
    });
  });

  describe('getStatusText', () => {
    it('草稿状态显示正确', () => {
      expect(getStatusText('draft')).toBe('草稿');
    });

    it('待审批状态显示正确', () => {
      expect(getStatusText('pending_approval')).toBe('待审批');
    });

    it('已通过状态显示正确', () => {
      expect(getStatusText('approved')).toBe('已通过');
    });

    it('已拒绝状态显示正确', () => {
      expect(getStatusText('rejected')).toBe('已拒绝');
    });

    it('已撤回状态显示正确', () => {
      expect(getStatusText('withdrawn')).toBe('已撤回');
    });
  });

  describe('getStatusColor', () => {
    it('草稿状态颜色正确', () => {
      expect(getStatusColor('draft')).toBe('default');
    });

    it('待审批状态颜色正确', () => {
      expect(getStatusColor('pending_approval')).toBe('processing');
    });

    it('已通过状态颜色正确', () => {
      expect(getStatusColor('approved')).toBe('success');
    });

    it('已拒绝状态颜色正确', () => {
      expect(getStatusColor('rejected')).toBe('error');
    });

    it('已撤回状态颜色正确', () => {
      expect(getStatusColor('withdrawn')).toBe('warning');
    });
  });
});
