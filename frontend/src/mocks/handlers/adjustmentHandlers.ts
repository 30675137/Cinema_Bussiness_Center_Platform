/**
 * P004-inventory-adjustment: 库存调整 MSW 处理器
 * 
 * 提供库存调整、审批、流水、原因字典的 Mock 数据。
 */

import { http, HttpResponse, delay } from 'msw';
import type {
  InventoryAdjustment,
  AdjustmentReason,
  ApprovalRecord,
  AdjustmentListResponse,
  AdjustmentDetailResponse,
  ReasonListResponse,
  AdjustmentStatus,
  AdjustmentType,
} from '@/features/inventory/types/adjustment';

// ==================== 配置常量 ====================

const APPROVAL_THRESHOLD = 1000; // 审批阈值（元）

// ==================== Mock 数据 ====================

/**
 * 调整原因字典
 */
const mockReasons: AdjustmentReason[] = [
  { id: 'r-001', code: 'STOCK_DIFF', name: '盘点差异', category: 'surplus', isActive: true, sortOrder: 1 },
  { id: 'r-002', code: 'STOCK_DIFF_SHORTAGE', name: '盘点差异', category: 'shortage', isActive: true, sortOrder: 2 },
  { id: 'r-003', code: 'GOODS_DAMAGE', name: '货物损坏', category: 'damage', isActive: true, sortOrder: 3 },
  { id: 'r-004', code: 'EXPIRED_WRITE_OFF', name: '过期报废', category: 'damage', isActive: true, sortOrder: 4 },
  { id: 'r-005', code: 'INBOUND_ERROR', name: '入库错误', category: 'shortage', isActive: true, sortOrder: 5 },
  { id: 'r-006', code: 'OTHER_SURPLUS', name: '其他(盘盈)', category: 'surplus', isActive: true, sortOrder: 6 },
  { id: 'r-007', code: 'OTHER_SHORTAGE', name: '其他(盘亏)', category: 'shortage', isActive: true, sortOrder: 7 },
  { id: 'r-008', code: 'OTHER_DAMAGE', name: '其他(报损)', category: 'damage', isActive: true, sortOrder: 8 },
];

/**
 * 库存调整记录
 */
let mockAdjustments: InventoryAdjustment[] = [];

/**
 * 审批记录
 */
let mockApprovalRecords: ApprovalRecord[] = [];

/**
 * 调整单号序列
 */
let adjustmentSequence = 1;

/**
 * 生成调整单号
 */
function generateAdjustmentNumber(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(adjustmentSequence++).padStart(4, '0');
  return `ADJ${today}${seq}`;
}

// ==================== Handler 实现 ====================

export const adjustmentHandlers = [
  // ==================== 调整原因 ====================

  /**
   * GET /api/adjustment-reasons - 获取调整原因字典
   */
  http.get('/api/adjustment-reasons', async () => {
    await delay(200);

    const response: ReasonListResponse = {
      success: true,
      data: mockReasons.filter(r => r.isActive),
    };

    return HttpResponse.json(response);
  }),

  // ==================== 调整管理 ====================

  /**
   * POST /api/adjustments - 创建库存调整
   */
  http.post('/api/adjustments', async ({ request }) => {
    await delay(300);

    const body = await request.json() as {
      skuId: string;
      storeId: string;
      adjustmentType: AdjustmentType;
      quantity: number;
      reasonCode: string;
      reasonText?: string;
      remarks?: string;
    };

    // 验证必填字段
    if (!body.skuId || !body.storeId || !body.adjustmentType || !body.quantity || !body.reasonCode) {
      return HttpResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: '请填写必填字段' },
        { status: 400 }
      );
    }

    // Mock 获取当前库存和单价
    const mockUnitPrice = Math.random() * 100 + 10; // 10-110 元
    const stockBefore = Math.floor(Math.random() * 100) + 50;
    const availableBefore = stockBefore - Math.floor(Math.random() * 10);

    // 计算调整后库存
    const isIncrease = body.adjustmentType === 'surplus';
    const stockAfter = isIncrease ? stockBefore + body.quantity : stockBefore - body.quantity;
    const availableAfter = isIncrease ? availableBefore + body.quantity : availableBefore - body.quantity;

    // 计算调整金额并判断是否需要审批
    const adjustmentAmount = body.quantity * mockUnitPrice;
    const needsApproval = adjustmentAmount >= APPROVAL_THRESHOLD;

    const newAdjustment: InventoryAdjustment = {
      id: `adj-${Date.now()}`,
      adjustmentNumber: generateAdjustmentNumber(),
      skuId: body.skuId,
      sku: {
        id: body.skuId,
        code: `SKU${body.skuId.slice(-4)}`,
        name: `测试商品-${body.skuId.slice(-4)}`,
        unit: '个',
        unitPrice: mockUnitPrice,
      },
      storeId: body.storeId,
      store: {
        id: body.storeId,
        code: `ST${body.storeId.slice(-3)}`,
        name: `测试门店-${body.storeId.slice(-3)}`,
      },
      adjustmentType: body.adjustmentType,
      quantity: body.quantity,
      unitPrice: mockUnitPrice,
      adjustmentAmount,
      reasonCode: body.reasonCode,
      reasonText: body.reasonText,
      remarks: body.remarks,
      status: needsApproval ? 'pending_approval' : 'approved',
      stockBefore,
      stockAfter,
      availableBefore,
      availableAfter,
      requiresApproval: needsApproval,
      operatorId: 'user-001',
      operatorName: '库存管理员',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
    };

    mockAdjustments.unshift(newAdjustment);

    return HttpResponse.json(
      { success: true, data: newAdjustment },
      { status: 201 }
    );
  }),

  /**
   * GET /api/adjustments - 查询调整列表
   */
  http.get('/api/adjustments', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const status = url.searchParams.get('status');
    const storeId = url.searchParams.get('storeId');
    const skuId = url.searchParams.get('skuId');

    let filtered = [...mockAdjustments];

    // 筛选
    if (status) {
      const statuses = status.split(',') as AdjustmentStatus[];
      filtered = filtered.filter(item => statuses.includes(item.status));
    }
    if (storeId) {
      filtered = filtered.filter(item => item.storeId === storeId);
    }
    if (skuId) {
      filtered = filtered.filter(item => item.skuId === skuId);
    }

    // 分页
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    const response: AdjustmentListResponse = {
      success: true,
      data,
      total,
      page,
      pageSize,
    };

    return HttpResponse.json(response);
  }),

  /**
   * GET /api/adjustments/:id - 获取调整详情
   */
  http.get('/api/adjustments/:id', async ({ params }) => {
    await delay(200);

    const { id } = params;
    const adjustment = mockAdjustments.find(a => a.id === id);

    if (!adjustment) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '调整记录不存在' },
        { status: 404 }
      );
    }

    // 查找关联的审批记录
    const approvalHistory = mockApprovalRecords.filter(r => r.adjustmentId === id);

    const response: AdjustmentDetailResponse = {
      success: true,
      data: { ...adjustment, approvalHistory },
    };

    return HttpResponse.json(response);
  }),

  /**
   * POST /api/adjustments/:id/withdraw - 撤回调整申请
   */
  http.post('/api/adjustments/:id/withdraw', async ({ params }) => {
    await delay(300);

    const { id } = params;
    const adjustmentIndex = mockAdjustments.findIndex(a => a.id === id);

    if (adjustmentIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '调整记录不存在' },
        { status: 404 }
      );
    }

    const adjustment = mockAdjustments[adjustmentIndex];

    if (adjustment.status !== 'pending_approval') {
      return HttpResponse.json(
        { success: false, error: 'INVALID_STATUS', message: '当前状态不允许撤回' },
        { status: 400 }
      );
    }

    // 更新状态
    adjustment.status = 'withdrawn';
    adjustment.updatedAt = new Date().toISOString();

    // 添加审批记录
    const record: ApprovalRecord = {
      id: `apr-${Date.now()}`,
      adjustmentId: id as string,
      approverId: 'user-001',
      approverName: '库存管理员',
      action: 'withdraw',
      statusBefore: 'pending_approval',
      statusAfter: 'withdrawn',
      actionTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockApprovalRecords.push(record);

    return HttpResponse.json({ success: true, data: adjustment });
  }),

  /**
   * POST /api/adjustments/:id/approve - 审批通过
   * T050 审批端点
   */
  http.post('/api/adjustments/:id/approve', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = await request.json() as { comments?: string };

    const adjustmentIndex = mockAdjustments.findIndex(a => a.id === id);

    if (adjustmentIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '调整记录不存在' },
        { status: 404 }
      );
    }

    const adjustment = mockAdjustments[adjustmentIndex];

    if (adjustment.status !== 'pending_approval') {
      return HttpResponse.json(
        { success: false, error: 'INVALID_STATUS', message: '当前状态不允许审批' },
        { status: 400 }
      );
    }

    // 更新状态
    adjustment.status = 'approved';
    adjustment.updatedAt = new Date().toISOString();
    adjustment.approvedAt = new Date().toISOString();
    adjustment.approvedBy = 'director-001';

    // 添加审批记录
    const record: ApprovalRecord = {
      id: `apr-${Date.now()}`,
      adjustmentId: id as string,
      approverId: 'director-001',
      approverName: '运营总监',
      action: 'approve',
      statusBefore: 'pending_approval',
      statusAfter: 'approved',
      comments: body?.comments,
      actionTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockApprovalRecords.push(record);

    return HttpResponse.json({ success: true, data: adjustment, message: '审批通过，库存已更新' });
  }),

  /**
   * POST /api/adjustments/:id/reject - 审批拒绝
   * T050 审批端点
   */
  http.post('/api/adjustments/:id/reject', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = await request.json() as { comments?: string };

    const adjustmentIndex = mockAdjustments.findIndex(a => a.id === id);

    if (adjustmentIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '调整记录不存在' },
        { status: 404 }
      );
    }

    const adjustment = mockAdjustments[adjustmentIndex];

    if (adjustment.status !== 'pending_approval') {
      return HttpResponse.json(
        { success: false, error: 'INVALID_STATUS', message: '当前状态不允许审批' },
        { status: 400 }
      );
    }

    // 更新状态
    adjustment.status = 'rejected';
    adjustment.updatedAt = new Date().toISOString();

    // 添加审批记录
    const record: ApprovalRecord = {
      id: `apr-${Date.now()}`,
      adjustmentId: id as string,
      approverId: 'director-001',
      approverName: '运营总监',
      action: 'reject',
      statusBefore: 'pending_approval',
      statusAfter: 'rejected',
      comments: body?.comments,
      actionTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockApprovalRecords.push(record);

    return HttpResponse.json({ success: true, data: adjustment, message: '审批已拒绝' });
  }),

  // ==================== 审批管理 ====================

  /**
   * GET /api/approvals/pending - 获取待审批列表
   */
  http.get('/api/approvals/pending', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    const pending = mockAdjustments.filter(a => a.status === 'pending_approval');
    const total = pending.length;
    const startIndex = (page - 1) * pageSize;
    const data = pending.slice(startIndex, startIndex + pageSize);

    const response: AdjustmentListResponse = {
      success: true,
      data,
      total,
      page,
      pageSize,
    };

    return HttpResponse.json(response);
  }),

  /**
   * POST /api/approvals/:adjustmentId - 执行审批操作
   */
  http.post('/api/approvals/:adjustmentId', async ({ params, request }) => {
    await delay(300);

    const { adjustmentId } = params;
    const body = await request.json() as { action: 'approve' | 'reject'; comments?: string };

    const adjustmentIndex = mockAdjustments.findIndex(a => a.id === adjustmentId);

    if (adjustmentIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '调整记录不存在' },
        { status: 404 }
      );
    }

    const adjustment = mockAdjustments[adjustmentIndex];

    if (adjustment.status !== 'pending_approval') {
      return HttpResponse.json(
        { success: false, error: 'INVALID_STATUS', message: '当前状态不允许审批' },
        { status: 400 }
      );
    }

    // 更新状态
    const newStatus: AdjustmentStatus = body.action === 'approve' ? 'approved' : 'rejected';
    adjustment.status = newStatus;
    adjustment.updatedAt = new Date().toISOString();

    if (body.action === 'approve') {
      adjustment.approvedAt = new Date().toISOString();
      adjustment.approvedBy = 'director-001';
    }

    // 添加审批记录
    const record: ApprovalRecord = {
      id: `apr-${Date.now()}`,
      adjustmentId: adjustmentId as string,
      approverId: 'director-001',
      approverName: '运营总监',
      action: body.action,
      statusBefore: 'pending_approval',
      statusAfter: newStatus,
      comments: body.comments,
      actionTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    mockApprovalRecords.push(record);

    const message = body.action === 'approve' ? '审批通过，库存已更新' : '审批已拒绝';

    return HttpResponse.json({ success: true, data: adjustment, message });
  }),

  // ==================== 安全库存 ====================

  /**
   * PUT /api/inventory/:id/safety-stock - 更新安全库存阈值
   */
  http.put('/api/inventory/:id/safety-stock', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = await request.json() as { safetyStock: number; version: number };

    // Mock 乐观锁检查 - 假设 50% 概率会有冲突
    const hasConflict = Math.random() < 0.1;

    if (hasConflict) {
      return HttpResponse.json(
        {
          success: false,
          error: 'CONCURRENT_MODIFICATION',
          message: '该记录已被他人修改，请刷新后重试',
        },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        id,
        safetyStock: body.safetyStock,
        version: body.version + 1,
        updatedAt: new Date().toISOString(),
      },
    });
  }),

  // ==================== 库存流水 ====================

  /**
   * GET /api/transactions - 查询库存流水
   * 注意：复用 P003 已有的流水查询，此处仅作为补充
   */
  http.get('/api/transactions', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const skuId = url.searchParams.get('skuId');
    const storeId = url.searchParams.get('storeId');

    // Mock 流水数据
    const transactionTypes = [
      'purchase_in', 'sale_out', 'adjustment_in', 'adjustment_out', 'damage_out',
    ];

    const mockTransactions = Array.from({ length: 50 }, (_, i) => {
      const type = transactionTypes[i % transactionTypes.length];
      const isIn = type.includes('_in');
      const quantity = Math.floor(Math.random() * 20) + 1;

      return {
        id: `txn-${i + 1}`,
        skuId: skuId || `sku-${(i % 5) + 1}`,
        storeId: storeId || `store-${(i % 3) + 1}`,
        transactionType: type,
        quantity: isIn ? quantity : -quantity,
        stockBefore: 100 - i,
        stockAfter: 100 - i + (isIn ? quantity : -quantity),
        operatorId: 'user-001',
        operatorName: '操作员',
        transactionTime: new Date(Date.now() - i * 3600000).toISOString(),
        createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      };
    });

    let filtered = mockTransactions;
    if (skuId) {
      filtered = filtered.filter(t => t.skuId === skuId);
    }
    if (storeId) {
      filtered = filtered.filter(t => t.storeId === storeId);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const data = filtered.slice(startIndex, startIndex + pageSize);

    return HttpResponse.json({
      success: true,
      data,
      total,
      page,
      pageSize,
    });
  }),
];

export default adjustmentHandlers;
