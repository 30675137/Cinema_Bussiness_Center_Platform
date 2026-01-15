/**
 * @spec O001-product-order-list
 * MSW Mock 处理器 - 订单相关 API
 */

import { http, HttpResponse } from 'msw';
import { mockOrders } from '../data/orders';
import type {
  OrderQueryParams,
  OrderListResponse,
  OrderDetailResponse,
  UpdateStatusRequest,
  OrderStatus,
  LogAction,
} from '../../features/order-management/types/order';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// 辅助函数：验证状态转换是否合法
const isValidStatusTransition = (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING_PAYMENT: ['CANCELLED'],
    PAID: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// 辅助函数：生成日志动作
const getLogAction = (newStatus: OrderStatus): LogAction => {
  const actionMap: Record<OrderStatus, LogAction> = {
    PENDING_PAYMENT: 'CREATE_ORDER',
    PAID: 'PAYMENT',
    SHIPPED: 'SHIP',
    COMPLETED: 'COMPLETE',
    CANCELLED: 'CANCEL',
  };
  return actionMap[newStatus] || 'SYSTEM_AUTO';
};

export const orderHandlers = [
  // GET /api/orders - 订单列表查询
  http.get(`${API_BASE_URL}/orders`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('pageSize')) || 20;
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // 筛选逻辑
    let filtered = [...mockOrders];

    // 状态筛选
    if (status) {
      filtered = filtered.filter((order) => order.status === status);
    }

    // 搜索筛选（订单号、用户名、手机号）
    if (search) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.includes(search) ||
          order.user?.username.includes(search) ||
          order.user?.phone.includes(search)
      );
    }

    // 时间范围筛选
    if (startDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate <= endDate;
      });
    }

    // 按创建时间倒序排序
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 分页逻辑
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filtered.slice(start, end);

    const response: OrderListResponse = {
      success: true,
      data,
      total,
      page,
      pageSize,
      message: '查询成功',
      timestamp: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // GET /api/orders/:id - 订单详情查询
  http.get(`${API_BASE_URL}/orders/:id`, ({ params }) => {
    const { id } = params;
    const order = mockOrders.find((o) => o.id === id);

    if (!order) {
      return HttpResponse.json(
        {
          success: false,
          error: 'ORD_NTF_001',
          message: '订单不存在',
          details: { orderId: id },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const response: OrderDetailResponse = {
      success: true,
      data: order,
      message: '查询成功',
      timestamp: new Date().toISOString(),
    };

    return HttpResponse.json(response);
  }),

  // PUT /api/orders/:id/status - 更新订单状态 (User Story 4)
  http.put(`${API_BASE_URL}/orders/:id/status`, async ({ params, request }) => {
    const { id } = params;
    const updateRequest = (await request.json()) as UpdateStatusRequest;

    // 查找订单
    const orderIndex = mockOrders.findIndex((o) => o.id === id);

    if (orderIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'ORD_NTF_001',
          message: '订单不存在',
          details: { orderId: id },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const order = mockOrders[orderIndex];

    // 乐观锁检查：版本号必须匹配
    if (order.version !== updateRequest.version) {
      return HttpResponse.json(
        {
          success: false,
          error: 'ORD_BIZ_002',
          message: '订单已被其他操作修改，请刷新后重试',
          details: {
            orderId: id,
            expectedVersion: updateRequest.version,
            currentVersion: order.version,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 409 } // Conflict
      );
    }

    // 状态转换验证：检查是否为合法转换
    if (!isValidStatusTransition(order.status, updateRequest.status)) {
      return HttpResponse.json(
        {
          success: false,
          error: 'ORD_BIZ_001',
          message: `非法的状态转换：${order.status} → ${updateRequest.status}`,
          details: {
            orderId: id,
            currentStatus: order.status,
            targetStatus: updateRequest.status,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 422 } // Unprocessable Entity
      );
    }

    // 取消订单时必须提供原因
    if (updateRequest.status === 'CANCELLED' && !updateRequest.cancelReason) {
      return HttpResponse.json(
        {
          success: false,
          error: 'ORD_VAL_001',
          message: '取消订单必须提供取消原因',
          details: { orderId: id },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 更新订单状态
    const now = new Date().toISOString();
    const statusBefore = order.status;
    const statusAfter = updateRequest.status;

    // 更新订单对象
    mockOrders[orderIndex] = {
      ...order,
      status: statusAfter,
      version: order.version + 1,
      updatedAt: now,
      // 根据新状态更新相应的时间字段
      ...(statusAfter === 'SHIPPED' && { shippedTime: now }),
      ...(statusAfter === 'COMPLETED' && { completedTime: now }),
      ...(statusAfter === 'CANCELLED' && {
        cancelledTime: now,
        cancelReason: updateRequest.cancelReason,
      }),
      // 添加操作日志
      logs: [
        {
          id: `log-${Date.now()}`,
          orderId: order.id,
          action: getLogAction(statusAfter),
          statusBefore,
          statusAfter,
          operatorId: 'admin-001',
          operatorName: '运营管理员',
          comments: updateRequest.cancelReason || `订单状态更新: ${statusBefore} → ${statusAfter}`,
          createdAt: now,
        },
        ...(order.logs || []),
      ],
    };

    const response: OrderDetailResponse = {
      success: true,
      data: mockOrders[orderIndex],
      message: '订单状态更新成功',
      timestamp: now,
    };

    return HttpResponse.json(response);
  }),
];
