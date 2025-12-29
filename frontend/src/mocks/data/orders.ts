/**
 * @spec O001-product-order-list
 * Mock 订单测试数据
 */

import type { ProductOrder } from '../../features/order-management/types/order'

// Use string literals for enum values in mock data
const OrderStatusValues = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

const LogActionValues = {
  CREATE_ORDER: 'CREATE_ORDER',
  PAYMENT: 'PAYMENT',
  SHIP: 'SHIP',
  COMPLETE: 'COMPLETE',
  CANCEL: 'CANCEL',
  SYSTEM_AUTO: 'SYSTEM_AUTO'
} as const

export const mockOrders = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    orderNumber: 'ORD20251227AB12CD',
    userId: 'user-001',
    status: OrderStatusValues.PAID,
    productTotal: 150.00,
    shippingFee: 10.00,
    discountAmount: 5.00,
    totalAmount: 155.00,
    shippingAddress: {
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区18号楼'
    },
    paymentMethod: 'WECHAT_PAY',
    paymentTime: '2025-12-27T10:30:00Z',
    shippedTime: null,
    completedTime: null,
    cancelledTime: null,
    cancelReason: null,
    createdAt: '2025-12-27T10:00:00Z',
    updatedAt: '2025-12-27T10:30:00Z',
    version: 2,
    user: {
      id: 'user-001',
      username: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      address: '科技园南区18号楼'
    },
    productSummary: '可口可乐 等2件商品',
    items: [
      {
        id: 'item-001',
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        productId: 'prod-001',
        productName: '可口可乐',
        productSpec: '500ml',
        productImage: null,
        quantity: 2,
        unitPrice: 5.00,
        subtotal: 10.00,
        createdAt: '2025-12-27T10:00:00Z'
      },
      {
        id: 'item-002',
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        productId: 'prod-002',
        productName: '薯片',
        productSpec: '大包装',
        productImage: null,
        quantity: 3,
        unitPrice: 12.00,
        subtotal: 36.00,
        createdAt: '2025-12-27T10:00:00Z'
      }
    ],
    logs: [
      {
        id: 'log-001',
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        action: LogActionValues.CREATE_ORDER,
        statusBefore: null,
        statusAfter: OrderStatusValues.PENDING_PAYMENT,
        operatorId: 'user-001',
        operatorName: '张三',
        comments: '创建订单',
        createdAt: '2025-12-27T10:00:00Z'
      },
      {
        id: 'log-002',
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        action: LogActionValues.PAYMENT,
        statusBefore: OrderStatusValues.PENDING_PAYMENT,
        statusAfter: OrderStatusValues.PAID,
        operatorId: 'user-001',
        operatorName: '张三',
        comments: '微信支付成功',
        createdAt: '2025-12-27T10:30:00Z'
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    orderNumber: 'ORD20251227EF34GH',
    userId: 'user-002',
    status: OrderStatusValues.SHIPPED,
    productTotal: 200.00,
    shippingFee: 0.00,
    discountAmount: 20.00,
    totalAmount: 180.00,
    shippingAddress: {
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '三里屯SOHO 5号楼'
    },
    paymentMethod: 'ALIPAY',
    paymentTime: '2025-12-26T14:20:00Z',
    shippedTime: '2025-12-27T09:00:00Z',
    completedTime: null,
    cancelledTime: null,
    cancelReason: null,
    createdAt: '2025-12-26T14:00:00Z',
    updatedAt: '2025-12-27T09:00:00Z',
    version: 3,
    user: {
      id: 'user-002',
      username: '李四',
      phone: '13900139000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      address: '三里屯SOHO 5号楼'
    },
    productSummary: '矿泉水 等3件商品',
    items: [
      {
        id: 'item-003',
        orderId: '550e8400-e29b-41d4-a716-446655440002',
        productId: 'prod-003',
        productName: '矿泉水',
        productSpec: '550ml',
        productImage: null,
        quantity: 6,
        unitPrice: 3.00,
        subtotal: 18.00,
        createdAt: '2025-12-26T14:00:00Z'
      }
    ],
    logs: [
      {
        id: 'log-003',
        orderId: '550e8400-e29b-41d4-a716-446655440002',
        action: LogActionValues.CREATE_ORDER,
        statusBefore: null,
        statusAfter: OrderStatusValues.PENDING_PAYMENT,
        operatorId: 'user-002',
        operatorName: '李四',
        comments: '创建订单',
        createdAt: '2025-12-26T14:00:00Z'
      },
      {
        id: 'log-004',
        orderId: '550e8400-e29b-41d4-a716-446655440002',
        action: LogActionValues.PAYMENT,
        statusBefore: OrderStatusValues.PENDING_PAYMENT,
        statusAfter: OrderStatusValues.PAID,
        operatorId: 'user-002',
        operatorName: '李四',
        comments: '支付宝支付成功',
        createdAt: '2025-12-26T14:20:00Z'
      },
      {
        id: 'log-005',
        orderId: '550e8400-e29b-41d4-a716-446655440002',
        action: LogActionValues.SHIP,
        statusBefore: OrderStatusValues.PAID,
        statusAfter: OrderStatusValues.SHIPPED,
        operatorId: 'admin-001',
        operatorName: '运营管理员',
        comments: '订单已发货，快递单号: SF1234567890',
        createdAt: '2025-12-27T09:00:00Z'
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    orderNumber: 'ORD20251226IJ56KL',
    userId: 'user-003',
    status: OrderStatusValues.COMPLETED,
    productTotal: 80.00,
    shippingFee: 10.00,
    discountAmount: 0.00,
    totalAmount: 90.00,
    shippingAddress: {
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '陆家嘴环路1000号'
    },
    paymentMethod: 'WECHAT_PAY',
    paymentTime: '2025-12-25T11:00:00Z',
    shippedTime: '2025-12-26T08:30:00Z',
    completedTime: '2025-12-27T15:00:00Z',
    cancelledTime: null,
    cancelReason: null,
    createdAt: '2025-12-25T10:45:00Z',
    updatedAt: '2025-12-27T15:00:00Z',
    version: 4,
    user: {
      id: 'user-003',
      username: '王五',
      phone: '13700137000',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      address: '陆家嘴环路1000号'
    },
    productSummary: '爆米花',
    items: [
      {
        id: 'item-004',
        orderId: '550e8400-e29b-41d4-a716-446655440003',
        productId: 'prod-004',
        productName: '爆米花',
        productSpec: '大桶',
        productImage: null,
        quantity: 1,
        unitPrice: 80.00,
        subtotal: 80.00,
        createdAt: '2025-12-25T10:45:00Z'
      }
    ],
    logs: [
      {
        id: 'log-006',
        orderId: '550e8400-e29b-41d4-a716-446655440003',
        action: LogActionValues.CREATE_ORDER,
        statusBefore: null,
        statusAfter: OrderStatusValues.PENDING_PAYMENT,
        operatorId: 'user-003',
        operatorName: '王五',
        comments: '创建订单',
        createdAt: '2025-12-25T10:45:00Z'
      },
      {
        id: 'log-007',
        orderId: '550e8400-e29b-41d4-a716-446655440003',
        action: LogActionValues.PAYMENT,
        statusBefore: OrderStatusValues.PENDING_PAYMENT,
        statusAfter: OrderStatusValues.PAID,
        operatorId: 'user-003',
        operatorName: '王五',
        comments: '微信支付成功',
        createdAt: '2025-12-25T11:00:00Z'
      },
      {
        id: 'log-008',
        orderId: '550e8400-e29b-41d4-a716-446655440003',
        action: LogActionValues.SHIP,
        statusBefore: OrderStatusValues.PAID,
        statusAfter: OrderStatusValues.SHIPPED,
        operatorId: 'admin-001',
        operatorName: '运营管理员',
        comments: '订单已发货',
        createdAt: '2025-12-26T08:30:00Z'
      },
      {
        id: 'log-009',
        orderId: '550e8400-e29b-41d4-a716-446655440003',
        action: LogActionValues.COMPLETE,
        statusBefore: OrderStatusValues.SHIPPED,
        statusAfter: OrderStatusValues.COMPLETED,
        operatorId: 'user-003',
        operatorName: '王五',
        comments: '用户确认收货',
        createdAt: '2025-12-27T15:00:00Z'
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    orderNumber: 'ORD20251227MN78OP',
    userId: 'user-004',
    status: OrderStatusValues.PENDING_PAYMENT,
    productTotal: 120.00,
    shippingFee: 10.00,
    discountAmount: 10.00,
    totalAmount: 120.00,
    shippingAddress: {
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      detail: '文三路588号'
    },
    paymentMethod: null,
    paymentTime: null,
    shippedTime: null,
    completedTime: null,
    cancelledTime: null,
    cancelReason: null,
    createdAt: '2025-12-27T16:00:00Z',
    updatedAt: '2025-12-27T16:00:00Z',
    version: 1,
    user: {
      id: 'user-004',
      username: '赵六',
      phone: '13600136000',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      address: '文三路588号'
    },
    productSummary: '可乐 等2件商品',
    items: [
      {
        id: 'item-005',
        orderId: '550e8400-e29b-41d4-a716-446655440004',
        productId: 'prod-001',
        productName: '可乐',
        productSpec: '500ml',
        productImage: null,
        quantity: 3,
        unitPrice: 5.00,
        subtotal: 15.00,
        createdAt: '2025-12-27T16:00:00Z'
      },
      {
        id: 'item-006',
        orderId: '550e8400-e29b-41d4-a716-446655440004',
        productId: 'prod-005',
        productName: '热狗',
        productSpec: '经典款',
        productImage: null,
        quantity: 2,
        unitPrice: 15.00,
        subtotal: 30.00,
        createdAt: '2025-12-27T16:00:00Z'
      }
    ],
    logs: [
      {
        id: 'log-010',
        orderId: '550e8400-e29b-41d4-a716-446655440004',
        action: LogActionValues.CREATE_ORDER,
        statusBefore: null,
        statusAfter: OrderStatusValues.PENDING_PAYMENT,
        operatorId: 'user-004',
        operatorName: '赵六',
        comments: '创建订单',
        createdAt: '2025-12-27T16:00:00Z'
      }
    ]
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    orderNumber: 'ORD20251226QR90ST',
    userId: 'user-005',
    status: OrderStatusValues.CANCELLED,
    productTotal: 50.00,
    shippingFee: 10.00,
    discountAmount: 0.00,
    totalAmount: 60.00,
    shippingAddress: {
      province: '江苏省',
      city: '南京市',
      district: '鼓楼区',
      detail: '中山路200号'
    },
    paymentMethod: null,
    paymentTime: null,
    shippedTime: null,
    completedTime: null,
    cancelledTime: '2025-12-26T12:30:00Z',
    cancelReason: '用户主动取消 - 不需要了',
    createdAt: '2025-12-26T12:00:00Z',
    updatedAt: '2025-12-26T12:30:00Z',
    version: 2,
    user: {
      id: 'user-005',
      username: '孙七',
      phone: '13500135000',
      province: '江苏省',
      city: '南京市',
      district: '鼓楼区',
      address: '中山路200号'
    },
    productSummary: '矿泉水',
    items: [
      {
        id: 'item-007',
        orderId: '550e8400-e29b-41d4-a716-446655440005',
        productId: 'prod-003',
        productName: '矿泉水',
        productSpec: '550ml',
        productImage: null,
        quantity: 10,
        unitPrice: 3.00,
        subtotal: 30.00,
        createdAt: '2025-12-26T12:00:00Z'
      }
    ],
    logs: [
      {
        id: 'log-011',
        orderId: '550e8400-e29b-41d4-a716-446655440005',
        action: LogActionValues.CREATE_ORDER,
        statusBefore: null,
        statusAfter: OrderStatusValues.PENDING_PAYMENT,
        operatorId: 'user-005',
        operatorName: '孙七',
        comments: '创建订单',
        createdAt: '2025-12-26T12:00:00Z'
      },
      {
        id: 'log-012',
        orderId: '550e8400-e29b-41d4-a716-446655440005',
        action: LogActionValues.CANCEL,
        statusBefore: OrderStatusValues.PENDING_PAYMENT,
        statusAfter: OrderStatusValues.CANCELLED,
        operatorId: 'user-005',
        operatorName: '孙七',
        comments: '用户主动取消 - 不需要了',
        createdAt: '2025-12-26T12:30:00Z'
      }
    ]
  }
]
