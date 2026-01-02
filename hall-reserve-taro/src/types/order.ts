/**
 * @spec O003-beverage-order
 * 订单相关类型定义
 */

// 从 beverage.ts 重新导出订单相关类型
export type {
  OrderItemDTO,
  CreateOrderRequest,
  OrderStatus,
  BeverageOrderDTO,
  SelectedSpec,
} from './beverage'

// 别名，与 hook 中的命名保持一致
export type CreateBeverageOrderRequest = import('./beverage').CreateOrderRequest
