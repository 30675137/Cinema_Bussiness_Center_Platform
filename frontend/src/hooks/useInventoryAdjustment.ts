import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '@/services/inventoryService';
import type { InventoryTransaction } from '@/types/inventory';
import { TransactionType, SourceType } from '@/types/inventory';
import { message } from 'antd';

/**
 * 库存调整类型
 */
export type AdjustmentType = '盘盈' | '盘亏' | '报损';

/**
 * 库存调整参数
 */
export interface AdjustmentParams {
  skuId: string;
  storeId: string;
  adjustmentType: AdjustmentType;
  quantity: number;
  reason: string;
  remarks?: string;
}

/**
 * 库存调整钩子
 * 用于创建库存调整记录（盘盈、盘亏、报损）
 */
export const useInventoryAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AdjustmentParams) => {
      // 将调整类型映射到交易类型
      const transactionType =
        params.adjustmentType === '盘盈'
          ? TransactionType.ADJUSTMENT_IN
          : TransactionType.ADJUSTMENT_OUT;

      // 构建交易记录数据
      const transactionData: Omit<InventoryTransaction, 'id' | 'createdAt' | 'updatedAt'> = {
        storeId: params.storeId,
        skuId: params.skuId,
        transactionType,
        quantity: Math.abs(params.quantity),
        sourceType: SourceType.ADJUSTMENT_ORDER,
        sourceDocument: `ADJ-${Date.now()}`, // 模拟单据号
        operatorId: 'current-user', // 模拟当前用户ID
        transactionTime: new Date().toISOString(),
        remarks: `${params.adjustmentType}: ${params.reason}${params.remarks ? ` - ${params.remarks}` : ''}`,
        // 这些字段在实际调用时会由后端计算
        stockBefore: 0,
        stockAfter: 0,
        availableBefore: 0,
        availableAfter: 0,
        // 类型断言以满足类型要求
        store: {} as any,
        sku: {} as any,
        operator: {} as any,
      };

      return inventoryService.createInventoryTransaction(transactionData);
    },
    onMutate: () => {
      message.loading({ content: '正在提交调整...', key: 'adjustment', duration: 0 });
    },
    onSuccess: (data, variables) => {
      message.success({
        content: `${variables.adjustmentType}调整成功`,
        key: 'adjustment',
      });

      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-sku'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-by-store'] });
    },
    onError: (error: Error, variables) => {
      message.error({
        content: `${variables.adjustmentType}调整失败: ${error.message}`,
        key: 'adjustment',
      });
    },
  });
};

/**
 * 批量库存调整钩子
 */
export const useBatchInventoryAdjustment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (adjustments: AdjustmentParams[]) => {
      const transactions = adjustments.map((params) => {
        const transactionType =
          params.adjustmentType === '盘盈'
            ? TransactionType.ADJUSTMENT_IN
            : TransactionType.ADJUSTMENT_OUT;

        return {
          storeId: params.storeId,
          skuId: params.skuId,
          transactionType,
          quantity: Math.abs(params.quantity),
          sourceType: SourceType.ADJUSTMENT_ORDER,
          sourceDocument: `BATCH-ADJ-${Date.now()}`,
          operatorId: 'current-user',
          transactionTime: new Date().toISOString(),
          remarks: `${params.adjustmentType}: ${params.reason}${params.remarks ? ` - ${params.remarks}` : ''}`,
          stockBefore: 0,
          stockAfter: 0,
          availableBefore: 0,
          availableAfter: 0,
          store: {} as any,
          sku: {} as any,
          operator: {} as any,
        };
      });

      return inventoryService.batchCreateInventoryTransactions(transactions);
    },
    onMutate: () => {
      message.loading({ content: '正在批量调整...', key: 'batch-adjustment', duration: 0 });
    },
    onSuccess: (data) => {
      message.success({
        content: `批量调整完成: 成功${data.success}条，失败${data.failed}条`,
        key: 'batch-adjustment',
      });

      queryClient.invalidateQueries({ queryKey: ['inventory-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
    },
    onError: (error: Error) => {
      message.error({
        content: `批量调整失败: ${error.message}`,
        key: 'batch-adjustment',
      });
    },
  });
};
