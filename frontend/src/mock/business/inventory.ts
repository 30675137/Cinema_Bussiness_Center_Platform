/**
 * 库存追溯Mock数据
 */

import type { InventoryItem } from '@/types/mock';

/** 库存Mock数据 */
export const inventoryData: InventoryItem[] = [
  {
    id: '1',
    sku: 'TICKET-ADULT-001',
    productName: '电影票-成人票',
    location: 'A-01-01',
    quantity: 100,
    operation: 'in',
    operationQty: 50,
    operationTime: '2025-12-10 14:30:00',
    operator: '库管员A',
    remark: '新商品入库',
  },
  {
    id: '2',
    sku: 'TICKET-STUDENT-001',
    productName: '电影票-学生票',
    location: 'A-01-02',
    quantity: 80,
    operation: 'out',
    operationQty: 20,
    operationTime: '2025-12-10 13:15:00',
    operator: '销售员B',
    remark: '销售出库',
  },
  {
    id: '3',
    sku: 'TICKET-CHILD-001',
    productName: '电影票-儿童票',
    location: 'A-01-03',
    quantity: 60,
    operation: 'adjust',
    operationQty: -5,
    operationTime: '2025-12-10 12:00:00',
    operator: '库管员A',
    remark: '库存调整',
  },
  {
    id: '4',
    sku: 'SNACK-POP-SMALL-001',
    productName: '爆米花-小份',
    location: 'B-02-01',
    quantity: 45,
    operation: 'in',
    operationQty: 25,
    operationTime: '2025-12-10 11:30:00',
    operator: '库管员C',
    remark: '补货入库',
  },
  {
    id: '5',
    sku: 'SNACK-POP-LARGE-001',
    productName: '爆米花-大份',
    location: 'B-02-02',
    quantity: 30,
    operation: 'out',
    operationQty: 10,
    operationTime: '2025-12-10 10:45:00',
    operator: '销售员D',
    remark: '销售出库',
  },
  {
    id: '6',
    sku: 'DRINK-COKE-MEDIUM-001',
    productName: '可乐-中杯',
    location: 'B-03-01',
    quantity: 85,
    operation: 'in',
    operationQty: 40,
    operationTime: '2025-12-10 09:30:00',
    operator: '库管员E',
    remark: '饮料入库',
  },
  {
    id: '7',
    sku: 'DRINK-COKE-LARGE-001',
    productName: '可乐-大杯',
    location: 'B-03-02',
    quantity: 60,
    operation: 'out',
    operationQty: 15,
    operationTime: '2025-12-10 08:15:00',
    operator: '销售员F',
    remark: '销售出库',
  },
  {
    id: '8',
    sku: 'DRINK-JUICE-ORANGE-001',
    productName: '果汁-橙汁',
    location: 'B-03-03',
    quantity: 40,
    operation: 'in',
    operationQty: 20,
    operationTime: '2025-12-10 07:00:00',
    operator: '库管员G',
    remark: '果汁入库',
  },
  {
    id: '9',
    sku: 'TICKET-SENIOR-001',
    productName: '电影票-老人票',
    location: 'A-01-04',
    quantity: 25,
    operation: 'adjust',
    operationQty: -3,
    operationTime: '2025-12-10 06:00:00',
    operator: '库管员A',
    remark: '库存盘点调整',
  },
  {
    id: '10',
    sku: 'SNACK-POP-HOLIDAY-001',
    productName: '爆米花-节日特供',
    location: 'B-02-03',
    quantity: 50,
    operation: 'in',
    operationQty: 30,
    operationTime: '2025-12-09 18:00:00',
    operator: '库管员H',
    remark: '节日特供入库',
  },
];

/**
 * 模拟获取库存列表API
 */
export const fetchInventoryList = async (params?: {
  page?: number;
  pageSize?: number;
  location?: string;
  operation?: string;
}) => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredData = inventoryData;

  // 按仓库位置筛选
  if (params?.location) {
    filteredData = filteredData.filter(item => item.location.includes(params.location));
  }

  // 按操作类型筛选
  if (params?.operation) {
    filteredData = filteredData.filter(item => item.operation === params.operation);
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