/**
 * @spec N001-purchase-inbound
 * 采购模块 Hooks 导出
 */

export {
  purchaseOrderKeys,
  usePurchaseOrders,
  usePurchaseOrder,
  useCreatePurchaseOrder,
  useDeletePurchaseOrder,
  useSubmitPurchaseOrder,
  useApprovePurchaseOrder,
  useRejectPurchaseOrder,
  useSuppliers,
  usePurchaseOrderHistory,
  usePurchaseOrderSummary,
  usePendingApprovalOrders,
} from './usePurchaseOrders';

export {
  goodsReceiptKeys,
  useGoodsReceipts,
  useGoodsReceipt,
  useCreateGoodsReceipt,
  useConfirmGoodsReceipt,
  useCancelGoodsReceipt,
} from './useGoodsReceipts';
