/**
 * @spec O003-beverage-order
 * @spec O012-order-inventory-reservation
 * 饮品订单类型定义（B端管理）
 */

/**
 * 订单状态枚举
 */
export type BeverageOrderStatus =
  | 'PENDING_PAYMENT'    // 待支付
  | 'PAID'               // 已支付
  | 'PENDING_PRODUCTION' // 待制作
  | 'IN_PRODUCTION'      // 制作中
  | 'COMPLETED'          // 已完成
  | 'DELIVERED'          // 已交付
  | 'CANCELLED';         // 已取消

/**
 * 库存预占状态枚举 (O012)
 */
export type OrderReservationStatus =
  | 'RESERVED'           // 已预占
  | 'PARTIAL_RESERVED'   // 部分预占
  | 'FAILED'             // 预占失败
  | 'RELEASED'           // 已释放
  | 'EXPIRED';           // 已过期

/**
 * 订单商品项
 */
export interface BeverageOrderItem {
  id: string;
  beverageId: string;
  beverageName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedSpecs: Record<string, string>;
}

/**
 * 预占商品项 (O012)
 */
export interface ReservedItem {
  skuId: string;
  skuName: string;
  reservedQty: number;
  unit: string;
}

/**
 * 库存不足商品项 (O012)
 */
export interface ShortageItem {
  skuId: string;
  skuName: string;
  requiredQty: number;
  availableQty: number;
  unit: string;
}

/**
 * 饮品订单DTO (B端)
 */
export interface BeverageOrderDTO {
  id: string;
  orderNumber: string;
  userId: string;
  storeId: string;
  storeName?: string;
  totalPrice: number;
  status: BeverageOrderStatus;
  customerNote?: string;
  items: BeverageOrderItem[];
  
  // O012: 库存预占相关字段
  reservationStatus?: OrderReservationStatus;
  reservedItems?: ReservedItem[];
  reservationExpiry?: string; // ISO 8601 datetime
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  completedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  
  // 支付信息
  paymentMethod?: string;
  transactionId?: string;
  queueNumber?: string;
}

/**
 * 分页响应
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/**
 * 创建订单请求 (C端)
 */
export interface CreateBeverageOrderRequest {
  storeId: string;
  items: {
    beverageId: string;
    quantity: number;
    selectedSpecs: Record<string, string>;
  }[];
  customerNote?: string;
}

/**
 * 订单创建响应 (O012)
 */
export interface OrderCreationResponse {
  code: string;
  message: string;
  data: BeverageOrderDTO;
}

/**
 * 订单取消响应 (O012)
 */
export interface OrderCancellationResponse {
  code: string;
  message: string;
  data: {
    orderId: string;
    status: 'CANCELLED';
    cancelledAt: string;
    releasedItems: {
      skuId: string;
      releasedQty: number;
      unit: string;
    }[];
  };
}

/**
 * 库存不足错误响应 (O012)
 */
export interface InsufficientInventoryError {
  code: 'ORD_BIZ_002';
  message: string;
  details: {
    shortageItems: ShortageItem[];
  };
}

/**
 * 订单错误响应
 */
export interface OrderApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
