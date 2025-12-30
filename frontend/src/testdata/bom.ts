/**
 * @spec T002-e2e-test-generator
 * BOM 库存扣减测试数据
 *
 * 用于 E2E-INVENTORY-002 测试场景:
 * - C端用户下单 → 库存预占 (reserved +45ml whiskey, +150ml cola)
 * - B端吧台确认出品 → 库存实扣 (on_hand -45ml, -150ml; reserved reset to 0)
 */

export const scenario_001 = {
  // ====== C端配置 (Taro H5 用户端) ======
  h5BaseUrl: 'http://localhost:10086',

  // C端用户登录凭证
  userCredentials: {
    phone: '13800138000',
    verifyCode: '123456',
    role: 'customer'
  },

  // 商品页面路径
  products_page: 'http://localhost:10086/pages/product/list',

  // 测试商品: 威士忌可乐鸡尾酒
  product_whiskey_cola: {
    id: '550e8400-e29b-41d4-a716-446655440021',
    name: '威士忌可乐鸡尾酒',
    price: 35.00,
    category: 'cocktail',
    // BOM 配方
    bomItems: [
      {
        skuId: '550e8400-e29b-41d4-a716-446655440001',
        skuName: '威士忌',
        quantity: 45,
        unit: 'ml'
      },
      {
        skuId: '550e8400-e29b-41d4-a716-446655440002',
        skuName: '可乐糖浆',
        quantity: 150,
        unit: 'ml'
      }
    ]
  },

  // 订单创建参数
  order_params: {
    storeId: 1,
    storeName: '万达影城旗舰店',
    hallId: 1,
    hallName: 'VIP影厅1号',
    deliveryTime: '2025-12-30T15:00:00Z',
    paymentMethod: 'wechat',
    remark: 'E2E测试订单 - BOM库存扣减验证'
  },

  // ====== B端配置 (React Admin 运营中台) ======
  adminBaseUrl: 'http://localhost:3000',

  // B端管理员登录凭证
  adminCredentials: {
    username: 'bartender',
    password: 'test123',
    email: 'bartender@cinema.com',
    role: 'bartender'
  },

  // B端操作元素选择器
  confirm_production_btn: 'button[data-testid="confirm-production"]',
  order_detail_page: '/orders/detail',

  // ====== 数据库验证数据 - 预占阶段 ======
  // 预占后: 威士忌库存状态
  whiskey_after_reserve: {
    skuId: '550e8400-e29b-41d4-a716-446655440001',
    skuName: '威士忌',
    on_hand: 100,      // 现存库存不变
    reserved: 45,      // 预占 45ml
    available: 55,     // 可用库存 = on_hand - reserved
    unit: 'ml'
  },

  // 预占后: 可乐糖浆库存状态
  cola_after_reserve: {
    skuId: '550e8400-e29b-41d4-a716-446655440002',
    skuName: '可乐糖浆',
    on_hand: 500,      // 现存库存不变
    reserved: 150,     // 预占 150ml
    available: 350,    // 可用库存 = on_hand - reserved
    unit: 'ml'
  },

  // ====== 数据库验证数据 - 实扣阶段 ======
  // 实扣后: 威士忌库存状态
  whiskey_after_deduct: {
    skuId: '550e8400-e29b-41d4-a716-446655440001',
    skuName: '威士忌',
    on_hand: 55,       // 扣减 45ml (100 - 45)
    reserved: 0,       // 释放预占
    available: 55,     // 可用库存 = on_hand - reserved
    unit: 'ml'
  },

  // 实扣后: 可乐糖浆库存状态
  cola_after_deduct: {
    skuId: '550e8400-e29b-41d4-a716-446655440002',
    skuName: '可乐糖浆',
    on_hand: 350,      // 扣减 150ml (500 - 150)
    reserved: 0,       // 释放预占
    available: 350,    // 可用库存 = on_hand - reserved
    unit: 'ml'
  },

  // ====== 事务记录验证数据 ======
  // 威士忌扣减事务记录
  whiskey_transaction: {
    skuId: '550e8400-e29b-41d4-a716-446655440001',
    skuName: '威士忌',
    type: 'DEDUCT',    // 扣减类型
    quantity: 45,      // 扣减数量
    unit: 'ml',
    reason: 'BOM出品扣减',
    operator: 'bartender'
  },

  // 可乐糖浆扣减事务记录
  cola_transaction: {
    skuId: '550e8400-e29b-41d4-a716-446655440002',
    skuName: '可乐糖浆',
    type: 'DEDUCT',    // 扣减类型
    quantity: 150,     // 扣减数量
    unit: 'ml',
    reason: 'BOM出品扣减',
    operator: 'bartender'
  },

  // ====== 库存初始状态 (测试前准备) ======
  initial_inventory: {
    whiskey: {
      skuId: '550e8400-e29b-41d4-a716-446655440001',
      on_hand: 100,
      reserved: 0,
      unit: 'ml'
    },
    cola: {
      skuId: '550e8400-e29b-41d4-a716-446655440002',
      on_hand: 500,
      reserved: 0,
      unit: 'ml'
    }
  }
};

/**
 * 导出 BOM 测试数据集合
 */
export const bomTestData = {
  scenario_001,
};

export default bomTestData;
