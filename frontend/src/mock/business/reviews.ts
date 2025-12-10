/**
 * 审核管理Mock数据
 */

import type { ReviewItem } from '@/types/mock';

/** 审核Mock数据 */
export const reviewData: ReviewItem[] = [
  {
    id: '1',
    type: 'product',
    targetId: 'PROD-001',
    title: '新增商品审核',
    applicant: '张三',
    applyTime: '2025-12-10 10:30:00',
    status: 'pending',
  },
  {
    id: '2',
    type: 'pricing',
    targetId: 'PRICE-001',
    title: '价格调整审核',
    applicant: '李四',
    applyTime: '2025-12-10 09:15:00',
    status: 'approved',
    reviewer: '管理员',
    reviewTime: '2025-12-10 11:00:00',
    comment: '价格调整合理，已批准',
  },
  {
    id: '3',
    type: 'inventory',
    targetId: 'INV-001',
    title: '库存变动审核',
    applicant: '王五',
    applyTime: '2025-12-10 08:45:00',
    status: 'rejected',
    reviewer: '管理员',
    reviewTime: '2025-12-10 09:30:00',
    comment: '库存数量异常，需要重新确认',
  },
  {
    id: '4',
    type: 'product',
    targetId: 'PROD-002',
    title: '商品信息修改审核',
    applicant: '赵六',
    applyTime: '2025-12-10 07:20:00',
    status: 'approved',
    reviewer: '管理员',
    reviewTime: '2025-12-10 08:00:00',
    comment: '修改内容符合规范，已通过',
  },
  {
    id: '5',
    type: 'pricing',
    targetId: 'PRICE-002',
    title: '促销价格审核',
    applicant: '钱七',
    applyTime: '2025-12-09 16:30:00',
    status: 'approved',
    reviewer: '管理员',
    reviewTime: '2025-12-09 17:00:00',
    comment: '促销力度适中，已批准',
  },
  {
    id: '6',
    type: 'inventory',
    targetId: 'INV-002',
    title: '库存调整审核',
    applicant: '孙八',
    applyTime: '2025-12-09 15:10:00',
    status: 'pending',
  },
  {
    id: '7',
    type: 'product',
    targetId: 'PROD-003',
    title: '商品下架审核',
    applicant: '周九',
    applyTime: '2025-12-09 14:25:00',
    status: 'rejected',
    reviewer: '管理员',
    reviewTime: '2025-12-09 15:00:00',
    comment: '下架理由不充分，请补充说明',
  },
  {
    id: '8',
    type: 'pricing',
    targetId: 'PRICE-003',
    title: '会员价格申请审核',
    applicant: '吴十',
    applyTime: '2025-12-09 13:40:00',
    status: 'pending',
  },
  {
    id: '9',
    type: 'inventory',
    targetId: 'INV-003',
    title: '批量入库审核',
    applicant: '郑十一',
    applyTime: '2025-12-09 12:15:00',
    status: 'approved',
    reviewer: '管理员',
    reviewTime: '2025-12-09 13:00:00',
    comment: '入库记录准确，已通过',
  },
  {
    id: '10',
    type: 'product',
    targetId: 'PROD-004',
    title: '新产品上架审核',
    applicant: '陈十二',
    applyTime: '2025-12-09 11:00:00',
    status: 'approved',
    reviewer: '管理员',
    reviewTime: '2025-12-09 11:30:00',
    comment: '产品信息完整，已批准上架',
  },
];

/**
 * 模拟获取审核列表API
 */
export const fetchReviewList = async (params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  status?: string;
}) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredData = reviewData;

  // 按审核类型筛选
  if (params?.type) {
    filteredData = filteredData.filter(item => item.type === params.type);
  }

  // 按状态筛选
  if (params?.status) {
    filteredData = filteredData.filter(item => item.status === params.status);
  }

  // 分页处理
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    code: 200,
    message: 'success',
    data: paginatedData,
  };
};