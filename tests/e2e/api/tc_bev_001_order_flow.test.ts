/**
 * @spec O003-beverage-order
 * TC-BEV-001: 小程序下单美式咖啡 - API集成测试
 *
 * 测试流程:
 * 1. 创建订单 (POST /api/beverage-orders)
 * 2. Mock支付成功 (PATCH /api/beverage-orders/{id}/status)
 * 3. 开始制作 + BOM扣料 (PATCH /api/beverage-orders/{id}/status)
 * 4. 完成制作 (PATCH /api/beverage-orders/{id}/status)
 * 5. 交付订单 (PATCH /api/beverage-orders/{id}/status)
 * 6. 验证BOM库存扣减
 * 7. 验证订单数据完整性
 */

const request = require('supertest');
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fxhgyxceqrmnpezluaht.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Test data
const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const TEST_STORE_ID = '550e8400-e29b-41d4-a716-446655440001';
const AMERICANO_BEVERAGE_ID = '550e8400-e29b-41d4-a716-446655440002';

// BOM material SKU IDs (需要根据实际数据库配置)
const COFFEE_BEAN_SKU_ID = '550e8400-e29b-41d4-a716-446655440010';
const WATER_SKU_ID = '550e8400-e29b-41d4-a716-446655440011';
const PAPER_CUP_SKU_ID = '550e8400-e29b-41d4-a716-446655440012';

let createdOrderId: string;
let orderNumber: string;
let initialInventory: {
  coffeeBeans: number;
  water: number;
  paperCup: number;
};

describe('TC-BEV-001: 小程序下单美式咖啡 - 正向完整流程', () => {

  beforeAll(async () => {
    console.log('🔧 Setting up test data...');

    // 查询初始库存
    const coffeeBeansResp = await request(API_BASE_URL)
      .get(`/api/inventory/query?skuId=${COFFEE_BEAN_SKU_ID}&storeId=${TEST_STORE_ID}`);
    const waterResp = await request(API_BASE_URL)
      .get(`/api/inventory/query?skuId=${WATER_SKU_ID}&storeId=${TEST_STORE_ID}`);
    const paperCupResp = await request(API_BASE_URL)
      .get(`/api/inventory/query?skuId=${PAPER_CUP_SKU_ID}&storeId=${TEST_STORE_ID}`);

    initialInventory = {
      coffeeBeans: coffeeBeansResp.body.data?.availableQty || 1000,
      water: waterResp.body.data?.availableQty || 5000,
      paperCup: paperCupResp.body.data?.availableQty || 100
    };

    console.log('📦 Initial inventory:', initialInventory);
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...');
    // 清理测试订单数据
    if (createdOrderId) {
      // 可选: 删除测试订单或标记为测试数据
      console.log(`✅ Test order ${orderNumber} can be cleaned up manually if needed`);
    }
  });

  // ============================================================
  // 步骤 10-11: 创建订单 + Mock支付
  // ============================================================

  it('Step 10-11: 创建订单并Mock支付成功', async () => {
    // 步骤 10: 提交订单
    const createOrderPayload = {
      userId: TEST_USER_ID,
      storeId: TEST_STORE_ID,
      items: [
        {
          beverageId: AMERICANO_BEVERAGE_ID,
          quantity: 1,
          specs: {
            size: 'LARGE',      // 大杯
            temperature: 'HOT', // 热
            sweetness: 'STANDARD' // 标准糖
          },
          unitPrice: 18.00
        }
      ],
      totalPrice: 18.00,
      customerNote: 'E2E测试订单'
    };

    const createResponse = await request(API_BASE_URL)
      .post('/api/beverage-orders')
      .send(createOrderPayload)
      .expect(201);

    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data).toHaveProperty('id');
    expect(createResponse.body.data).toHaveProperty('orderNumber');
    expect(createResponse.body.data.status).toBe('PENDING_PAYMENT');

    createdOrderId = createResponse.body.data.id;
    orderNumber = createResponse.body.data.orderNumber;

    console.log(`✅ 订单创建成功: ${orderNumber}`);

    // 步骤 11: Mock支付成功
    const paymentResponse = await request(API_BASE_URL)
      .patch(`/api/beverage-orders/${createdOrderId}/status`)
      .send({
        status: 'PENDING_PRODUCTION',
        paymentMethod: 'MOCK_WECHAT_PAY',
        transactionId: `MOCK_TXN_${Date.now()}`
      })
      .expect(200);

    expect(paymentResponse.body.success).toBe(true);
    expect(paymentResponse.body.data.status).toBe('PENDING_PRODUCTION');
    expect(paymentResponse.body.data.paidAt).toBeTruthy();

    console.log('✅ Mock支付成功，订单状态: 待制作');
  });

  // ============================================================
  // 步骤 14-15: 开始制作 + BOM扣料
  // ============================================================

  it('Step 14-15: 开始制作并验证BOM库存扣减', async () => {
    // 步骤 14: 开始制作
    const startProductionResponse = await request(API_BASE_URL)
      .patch(`/api/beverage-orders/${createdOrderId}/status`)
      .send({ status: 'PRODUCING' })
      .expect(200);

    expect(startProductionResponse.body.success).toBe(true);
    expect(startProductionResponse.body.data.status).toBe('PRODUCING');
    expect(startProductionResponse.body.data.productionStartTime).toBeTruthy();

    console.log('✅ 订单状态更新为: 制作中');

    // 步骤 15: 验证BOM库存扣减
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待BOM扣料异步完成

    // 验证咖啡豆库存扣减 25g
    const coffeeBeansAfter = await request(API_BASE_URL)
      .get(`/api/inventory/query?skuId=${COFFEE_BEAN_SKU_ID}&storeId=${TEST_STORE_ID}`)
      .expect(200);

    const coffeeBeansQty = coffeeBeansAfter.body.data?.availableQty;
    expect(coffeeBeansQty).toBe(initialInventory.coffeeBeans - 25);
    console.log(`✅ 咖啡豆库存扣减: ${initialInventory.coffeeBeans}g → ${coffeeBeansQty}g (-25g)`);

    // 验证水库存扣减 250ml
    const waterAfter = await request(API_BASE_URL)
      .get(`/api/inventory/query?skuId=${WATER_SKU_ID}&storeId=${TEST_STORE_ID}`)
      .expect(200);

    const waterQty = waterAfter.body.data?.availableQty;
    expect(waterQty).toBe(initialInventory.water - 250);
    console.log(`✅ 水库存扣减: ${initialInventory.water}ml → ${waterQty}ml (-250ml)`);

    // 验证纸杯库存扣减 1个
    const paperCupAfter = await request(API_BASE_URL)
      .get(`/api/inventory/query?skuId=${PAPER_CUP_SKU_ID}&storeId=${TEST_STORE_ID}`)
      .expect(200);

    const paperCupQty = paperCupAfter.body.data?.availableQty;
    expect(paperCupQty).toBe(initialInventory.paperCup - 1);
    console.log(`✅ 纸杯库存扣减: ${initialInventory.paperCup}个 → ${paperCupQty}个 (-1个)`);

    // 验证库存调整日志
    const adjustmentLogsResponse = await request(API_BASE_URL)
      .get(`/api/adjustments?orderNumber=${orderNumber}&reasonCode=BOM_DEDUCTION`)
      .expect(200);

    expect(adjustmentLogsResponse.body.data.length).toBeGreaterThanOrEqual(3);
    console.log(`✅ 库存调整日志记录: ${adjustmentLogsResponse.body.data.length} 条`);
  });

  // ============================================================
  // 步骤 16-17: 完成制作 + 验证叫号
  // ============================================================

  it('Step 16-17: 完成制作并验证订单状态', async () => {
    // 步骤 16: 完成制作
    const completeResponse = await request(API_BASE_URL)
      .patch(`/api/beverage-orders/${createdOrderId}/status`)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(completeResponse.body.success).toBe(true);
    expect(completeResponse.body.data.status).toBe('COMPLETED');
    expect(completeResponse.body.data.completedAt).toBeTruthy();

    console.log('✅ 订单状态更新为: 已完成 (待取餐)');

    // 验证取餐号生成
    expect(completeResponse.body.data).toHaveProperty('queueNumber');
    console.log(`✅ 取餐号: ${completeResponse.body.data.queueNumber}`);
  });

  // ============================================================
  // 步骤 18: 交付订单
  // ============================================================

  it('Step 18: 顾客取餐并交付订单', async () => {
    // 步骤 18: 交付
    const deliverResponse = await request(API_BASE_URL)
      .patch(`/api/beverage-orders/${createdOrderId}/status`)
      .send({ status: 'DELIVERED' })
      .expect(200);

    expect(deliverResponse.body.success).toBe(true);
    expect(deliverResponse.body.data.status).toBe('DELIVERED');
    expect(deliverResponse.body.data.deliveredAt).toBeTruthy();

    console.log('✅ 订单状态更新为: 已交付');
  });

  // ============================================================
  // 后置检查: 订单数据完整性验证
  // ============================================================

  it('后置检查: 验证订单时间戳逻辑', async () => {
    const orderResponse = await request(API_BASE_URL)
      .get(`/api/beverage-orders/${createdOrderId}`)
      .expect(200);

    const order = orderResponse.body.data;

    // 验证时间戳顺序
    const createdAt = new Date(order.createdAt);
    const paidAt = new Date(order.paidAt);
    const productionStartTime = new Date(order.productionStartTime);
    const completedAt = new Date(order.completedAt);
    const deliveredAt = new Date(order.deliveredAt);

    expect(paidAt.getTime()).toBeGreaterThan(createdAt.getTime());
    expect(productionStartTime.getTime()).toBeGreaterThan(paidAt.getTime());
    expect(completedAt.getTime()).toBeGreaterThan(productionStartTime.getTime());
    expect(deliveredAt.getTime()).toBeGreaterThan(completedAt.getTime());

    console.log('✅ 订单时间戳逻辑验证通过');
    console.log(`   created_at < paid_at < production_start_time < completed_at < delivered_at`);
  });
});

describe('TC-BEV-002: 库存不足异常测试', () => {
  // TODO: 实现库存不足场景测试
  it.skip('开始制作时库存不足应阻止扣料', async () => {
    // 实现逻辑...
  });
});

describe('TC-BEV-004: 并发订单BOM扣料一致性', () => {
  // TODO: 实现并发测试
  it.skip('并发扣料时不应出现超扣', async () => {
    // 实现逻辑...
  });
});
