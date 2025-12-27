/**
 * P004-inventory-adjustment: 审批工具函数
 * 
 * 提供库存调整审批相关的工具函数。
 * 实现 T045 任务。
 * 
 * @since US4 - 大额库存调整审批
 */

import type { AdjustmentStatus } from '../types/adjustment';

/**
 * 审批阈值（元）
 * 调整金额达到或超过此值时需要审批
 */
export const APPROVAL_THRESHOLD = 1000;

/**
 * 判断是否需要审批
 * 
 * @param quantity 调整数量
 * @param unitPrice 单价
 * @returns 是否需要审批
 */
export function requiresApproval(quantity: number, unitPrice: number): boolean {
  const adjustmentAmount = Math.abs(quantity) * unitPrice;
  return adjustmentAmount >= APPROVAL_THRESHOLD;
}

/**
 * 计算调整金额
 * 
 * @param quantity 调整数量
 * @param unitPrice 单价
 * @returns 调整金额
 */
export function calculateAdjustmentAmount(quantity: number, unitPrice: number): number {
  return Math.abs(quantity) * unitPrice;
}

/**
 * 判断状态是否允许撤回
 * 只有待审批状态可以撤回
 */
export function canWithdraw(status: AdjustmentStatus): boolean {
  return status === 'pending_approval';
}

/**
 * 判断状态是否允许审批
 * 只有待审批状态可以审批
 */
export function canApprove(status: AdjustmentStatus): boolean {
  return status === 'pending_approval';
}

/**
 * 判断是否为最终状态（不可更改）
 */
export function isFinalStatus(status: AdjustmentStatus): boolean {
  return status === 'approved' || status === 'rejected' || status === 'withdrawn';
}

/**
 * 获取状态显示文本
 */
export function getStatusText(status: AdjustmentStatus): string {
  const statusTexts: Record<AdjustmentStatus, string> = {
    draft: '草稿',
    pending_approval: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
    withdrawn: '已撤回',
  };
  return statusTexts[status] || status;
}

/**
 * 获取状态显示颜色
 */
export function getStatusColor(status: AdjustmentStatus): string {
  const statusColors: Record<AdjustmentStatus, string> = {
    draft: 'default',
    pending_approval: 'processing',
    approved: 'success',
    rejected: 'error',
    withdrawn: 'warning',
  };
  return statusColors[status] || 'default';
}

export default {
  APPROVAL_THRESHOLD,
  requiresApproval,
  calculateAdjustmentAmount,
  canWithdraw,
  canApprove,
  isFinalStatus,
  getStatusText,
  getStatusColor,
};
