/**
 * @spec P005-bom-inventory-deduction
 * Inventory types for Taro frontend
 */

/**
 * Reservation Request
 */
export interface ReservationRequest {
  orderId: string
  storeId: string
  items: ReservationItem[]
}

/**
 * Reservation Item
 */
export interface ReservationItem {
  skuId: string
  quantity: number
  unit: string
}

/**
 * Reservation Response
 */
export interface ReservationResponse {
  orderId: string
  reservationIds: string[]
  reservedComponents: ReservedComponent[]
}

/**
 * Reserved Component
 */
export interface ReservedComponent {
  skuId: string
  skuName: string
  quantity: number
  unit: string
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  details?: Record<string, any>
  timestamp: string
}
