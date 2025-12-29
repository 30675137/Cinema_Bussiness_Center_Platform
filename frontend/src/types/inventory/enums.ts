/**
 * @spec P005-bom-inventory-deduction
 * 库存相关枚举类型
 */

// 库存类型枚举
export enum TransactionType {
  PURCHASE_IN = 'purchase_in',         // 采购入库
  SALE_OUT = 'sale_out',             // 销售出库
  TRANSFER_IN = 'transfer_in',         // 调拨入库
  TRANSFER_OUT = 'transfer_out',       // 调拨出库
  ADJUSTMENT_IN = 'adjustment_in',     // 盘点入库
  ADJUSTMENT_OUT = 'adjustment_out',   // 盘点出库
  RETURN_IN = 'return_in',           // 退货入库
  RETURN_OUT = 'return_out',         // 退货出库
  DAMAGE_OUT = 'damage_out',          // 损耗出库
  PRODUCTION_IN = 'production_in',     // 生产入库
  EXPIRED_OUT = 'expired_out'         // 过期出库
}

// 来源类型枚举
export enum SourceType {
  PURCHASE_ORDER = 'purchase_order',   // 采购订单
  SALES_ORDER = 'sales_order',       // 销售订单
  TRANSFER_ORDER = 'transfer_order',  // 调拨订单
  ADJUSTMENT_ORDER = 'adjustment_order', // 盘点单
  RETURN_ORDER = 'return_order',     // 退货单
  MANUAL = 'manual',                 // 手工录入
  PRODUCTION_ORDER = 'production_order', // 生产单
  SYSTEM_ADJUST = 'system_adjust'    // 系统调整
}

// 库存状态枚举
export enum InventoryStatus {
  AVAILABLE = 'available',     // 可用库存
  RESERVED = 'reserved',       // 预留库存
  IN_TRANSIT = 'in_transit',   // 在途库存
  DAMAGED = 'damaged',         // 损坏库存
  EXPIRED = 'expired',         // 过期库存
  ON_ORDER = 'on_order'       // 在途库存
}
