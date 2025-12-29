/**
 * @spec P005-bom-inventory-deduction
 * Test Data Fixtures - 测试数据固件
 *
 * 提供测试所需的SKU、订单、库存等数据
 */

/**
 * 测试用SKU ID（从 setup-test-data-direct.sql）
 */
export const TEST_SKUS = {
  // 成品SKU
  WHISKEY_COLA_COCKTAIL: '22222222-0000-0000-0000-000000000001', // 威士忌可乐鸡尾酒
  COMBO_SET: '22222222-0000-0000-0000-000000000002',             // 套餐组合

  // 原料SKU
  WHISKEY: '11111111-0000-0000-0000-000000000001',  // 威士忌（45ml per cocktail）
  COLA: '11111111-0000-0000-0000-000000000002',     // 可乐（150ml per cocktail）
  ICE_CUBE: '11111111-0000-0000-0000-000000000003', // 冰块（1个 per cocktail）
  LEMON_SLICE: '11111111-0000-0000-0000-000000000004' // 柠檬片（1个 per cocktail）
};

/**
 * 测试用门店ID
 */
export const TEST_STORE_ID = '00000000-0000-0000-0000-000000000099';

/**
 * 生成测试订单ID
 */
export const generateTestOrderId = (suffix: string): string => {
  const paddedSuffix = String(suffix).padStart(2, '0');
  return `33333333-0000-0000-0000-0000000000${paddedSuffix}`;
};

/**
 * SKU名称映射（用于UI验证）
 */
export const SKU_NAMES = {
  [TEST_SKUS.WHISKEY_COLA_COCKTAIL]: '威士忌可乐鸡尾酒',
  [TEST_SKUS.COMBO_SET]: '套餐组合',
  [TEST_SKUS.WHISKEY]: '威士忌',
  [TEST_SKUS.COLA]: '可乐',
  [TEST_SKUS.ICE_CUBE]: '冰块',
  [TEST_SKUS.LEMON_SLICE]: '柠檬片'
};

/**
 * BOM配方定义
 */
export const BOM_RECIPES = {
  WHISKEY_COLA_COCKTAIL: [
    { skuId: TEST_SKUS.WHISKEY, quantity: 45, unit: 'ml', name: '威士忌' },
    { skuId: TEST_SKUS.COLA, quantity: 150, unit: 'ml', name: '可乐' },
    { skuId: TEST_SKUS.ICE_CUBE, quantity: 1, unit: '个', name: '冰块' },
    { skuId: TEST_SKUS.LEMON_SLICE, quantity: 1, unit: '个', name: '柠檬片' }
  ]
};

/**
 * 订单创建请求体模板
 */
export const createOrderRequest = (orderId: string, items: Array<{
  skuId: string;
  quantity: number;
  unit: string;
}>) => ({
  orderId,
  storeId: TEST_STORE_ID,
  items
});

/**
 * 单杯鸡尾酒订单
 */
export const SINGLE_COCKTAIL_ORDER = (orderId: string) => createOrderRequest(orderId, [
  {
    skuId: TEST_SKUS.WHISKEY_COLA_COCKTAIL,
    quantity: 1,
    unit: '杯'
  }
]);

/**
 * 多杯鸡尾酒订单
 */
export const MULTIPLE_COCKTAIL_ORDER = (orderId: string, quantity: number) => createOrderRequest(orderId, [
  {
    skuId: TEST_SKUS.WHISKEY_COLA_COCKTAIL,
    quantity,
    unit: '杯'
  }
]);

/**
 * 预期的库存预占结果（1杯鸡尾酒）
 */
export const EXPECTED_RESERVATION_COMPONENTS = [
  { skuId: TEST_SKUS.WHISKEY, quantity: 45, unit: 'ml' },
  { skuId: TEST_SKUS.COLA, quantity: 150, unit: 'ml' },
  { skuId: TEST_SKUS.ICE_CUBE, quantity: 1, unit: '个' },
  { skuId: TEST_SKUS.LEMON_SLICE, quantity: 1, unit: '个' }
];

/**
 * 事务类型枚举
 */
export enum TransactionType {
  BOM_DEDUCTION = 'BOM_DEDUCTION',           // BOM扣减
  RESERVATION_RELEASE = 'RESERVATION_RELEASE', // 预占释放
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT'      // 手动调整
}

/**
 * 订单状态枚举
 */
export enum OrderStatus {
  PENDING = 'PENDING',       // 待处理
  CONFIRMED = 'CONFIRMED',   // 已确认
  FULFILLED = 'FULFILLED',   // 已履约
  CANCELLED = 'CANCELLED'    // 已取消
}
