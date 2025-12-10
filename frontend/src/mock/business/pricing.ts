/**
 * 定价中心Mock数据
 */

import type { PricingItem } from '@/types/mock';

/** 定价Mock数据 */
export const pricingData: PricingItem[] = [
  {
    id: '1',
    name: '成人票标准价格',
    sku: 'TICKET-ADULT-001',
    priceType: 'regular',
    amount: 45.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '2',
    name: '学生票优惠价格',
    sku: 'TICKET-STUDENT-001',
    priceType: 'promotion',
    amount: 25.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '3',
    name: '会员专享价格',
    sku: 'TICKET-MEMBER-001',
    priceType: 'member',
    amount: 35.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'pending',
  },
  {
    id: '4',
    name: '老人票优惠价格',
    sku: 'TICKET-SENIOR-001',
    priceType: 'promotion',
    amount: 35.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '5',
    name: '儿童票标准价格',
    sku: 'TICKET-CHILD-001',
    priceType: 'regular',
    amount: 30.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '6',
    name: '爆米花小份标准价格',
    sku: 'SNACK-POP-SMALL-001',
    priceType: 'regular',
    amount: 12.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '7',
    name: '爆米花大份标准价格',
    sku: 'SNACK-POP-LARGE-001',
    priceType: 'regular',
    amount: 18.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '8',
    name: '节日特惠爆米花',
    sku: 'SNACK-POP-HOLIDAY-001',
    priceType: 'promotion',
    amount: 15.00,
    effectiveDate: '2025-12-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '9',
    name: 'VIP会员专享可乐',
    sku: 'DRINK-COKE-VIP-001',
    priceType: 'member',
    amount: 8.00,
    effectiveDate: '2025-01-01',
    expiryDate: '2025-12-31',
    status: 'active',
  },
  {
    id: '10',
    name: '周末特价果汁',
    sku: 'DRINK-JUICE-WEEKEND-001',
    priceType: 'promotion',
    amount: 10.00,
    effectiveDate: '2025-12-14',
    expiryDate: '2025-12-15',
    status: 'pending',
  },
];

/**
 * 模拟获取定价列表API
 */
export const fetchPricingList = async (params?: {
  page?: number;
  pageSize?: number;
  priceType?: string;
  status?: string;
}) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredData = pricingData;

  // 按价格类型筛选
  if (params?.priceType) {
    filteredData = filteredData.filter(item => item.priceType === params.priceType);
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