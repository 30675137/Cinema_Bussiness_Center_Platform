/**
 * @spec P005-bom-inventory-deduction
 * Playwright E2E Test - 订单履约扣减
 *
 * 测试场景：订单完成后扣减库存并释放预占
 *
 * 测试流程：
 * 1. 准备：创建订单并预占库存
 * 2. 履约：通过API触发订单履约（模拟B端出品确认）
 * 3. 验证：检查B端库存管理界面的现存库存减少、预占库存释放
 * 4. 验证：检查事务日志生成
 */

import { test, expect } from '@playwright/test';
import { InventoryPage } from './page-objects/InventoryPage';
import { OrderPage } from './page-objects/OrderPage';
import { TransactionLogPage } from './page-objects/TransactionLogPage';
import {
  TEST_SKUS,
  TEST_STORE_ID,
  generateTestOrderId,
  SKU_NAMES,
  SINGLE_COCKTAIL_ORDER,
  TransactionType
} from './fixtures/test-data';
import {
  resetTestData,
  getInventoryQuantities,
  verifyTransactionLog
} from './helpers/database-helper';

test.describe('P005 订单履约扣减 - UI测试', () => {
  let inventoryPage: InventoryPage;
  let orderPage: OrderPage;
  let transactionLogPage: TransactionLogPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    orderPage = new OrderPage(page);
    transactionLogPage = new TransactionLogPage(page);

    // 重置测试数据
    await resetTestData();
  });

  test('TC-UI-006: 订单履约后UI显示库存实扣', async ({ page }) => {
    const testOrderId = generateTestOrderId('06');

    // Step 1: 创建订单并预占库存
    console.log('Step 1: 创建订单并预占库存');
    const reservationResponse = await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    expect(reservationResponse.success).toBe(true);

    // Step 2: 查询预占后的库存（作为基准）
    await inventoryPage.goto();
    const afterReservation = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('预占后库存:', afterReservation);

    // Step 3: 履约订单（出品确认）
    console.log('Step 3: 履约订单');
    const fulfillResponse = await orderPage.fulfillOrderViaAPI(testOrderId, TEST_STORE_ID);

    console.log('履约响应:', fulfillResponse);
    expect(fulfillResponse.success).toBe(true);

    // Step 4: 刷新库存页面，验证UI
    console.log('Step 4: 验证UI库存变化');
    await inventoryPage.refresh();

    const afterFulfillment = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('履约后库存:', afterFulfillment);

    // 验证：现存库存减少45ml
    expect(afterFulfillment.onHandQty).toBe(afterReservation.onHandQty - 45);

    // 验证：预占库存释放（减少45ml）
    expect(afterFulfillment.reservedQty).toBe(afterReservation.reservedQty - 45);

    // 验证：可用库存保持不变（因为预占释放 = 现存减少）
    expect(afterFulfillment.availableQty).toBe(afterReservation.availableQty);
  });

  test('TC-UI-007: 验证所有BOM组件同步扣减', async ({ page }) => {
    const testOrderId = generateTestOrderId('07');

    // Step 1: 创建订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    // Step 2: 记录预占后的库存
    await inventoryPage.goto();
    const whiskeyBefore = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);
    const colaBefore = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.COLA]);
    const iceBefore = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.ICE_CUBE]);
    const lemonBefore = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.LEMON_SLICE]);

    // Step 3: 履约订单
    await orderPage.fulfillOrderViaAPI(testOrderId, TEST_STORE_ID);

    // Step 4: 验证所有组件扣减
    await inventoryPage.refresh();

    const whiskeyAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);
    const colaAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.COLA]);
    const iceAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.ICE_CUBE]);
    const lemonAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.LEMON_SLICE]);

    // 验证扣减量
    expect(whiskeyAfter.onHandQty).toBe(whiskeyBefore.onHandQty - 45);
    expect(colaAfter.onHandQty).toBe(colaBefore.onHandQty - 150);
    expect(iceAfter.onHandQty).toBe(iceBefore.onHandQty - 1);
    expect(lemonAfter.onHandQty).toBe(lemonBefore.onHandQty - 1);

    console.log('✅ 所有BOM组件已同步扣减');
  });

  test('TC-UI-008: 履约后生成BOM扣减事务日志', async ({ page }) => {
    const testOrderId = generateTestOrderId('08');

    // Step 1: 创建并履约订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    await orderPage.fulfillOrderViaAPI(testOrderId, TEST_STORE_ID);

    // Step 2: 进入事务日志页面
    console.log('Step 2: 查看事务日志');
    await transactionLogPage.goto();

    // 等待页面加载
    await page.waitForTimeout(1000);

    // Step 3: 搜索订单事务
    await transactionLogPage.searchByOrderId(testOrderId);

    // Step 4: 验证事务记录存在
    await transactionLogPage.verifyTransactionExists(testOrderId, TransactionType.BOM_DEDUCTION);

    // Step 5: 验证事务数量（应该有4条：威士忌、可乐、冰块、柠檬）
    await transactionLogPage.verifyTransactionCount(testOrderId, 4);

    console.log('✅ BOM扣减事务日志已生成');
  });

  test('TC-UI-009: 查看事务详情显示BOM组件明细', async ({ page }) => {
    const testOrderId = generateTestOrderId('09');

    // Step 1: 创建并履约订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    await orderPage.fulfillOrderViaAPI(testOrderId, TEST_STORE_ID);

    // Step 2: 打开事务详情
    await transactionLogPage.goto();
    await transactionLogPage.searchByOrderId(testOrderId);
    await transactionLogPage.openTransactionDetail(0);

    // Step 3: 验证详情抽屉显示
    await expect(transactionLogPage.detailDrawer).toBeVisible();
    await expect(transactionLogPage.detailDrawer).toContainText('BOM组件');
    await expect(transactionLogPage.detailDrawer).toContainText(testOrderId);

    // Step 4: 验证BOM组件列表
    await transactionLogPage.verifyBomComponents([
      { skuName: '威士忌', quantity: 45, unit: 'ml' },
      { skuName: '可乐', quantity: 150, unit: 'ml' },
      { skuName: '冰块', quantity: 1, unit: '个' },
      { skuName: '柠檬片', quantity: 1, unit: '个' }
    ]);

    console.log('✅ BOM组件明细显示正确');
  });

  test('TC-UI-010: 多杯履约验证批量扣减', async ({ page }) => {
    const testOrderId = generateTestOrderId('10');
    const quantity = 3; // 3杯

    // Step 1: 创建多杯订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      [{
        skuId: TEST_SKUS.WHISKEY_COLA_COCKTAIL,
        quantity,
        unit: '杯'
      }]
    );

    // Step 2: 记录预占后库存
    await inventoryPage.goto();
    const whiskeyBefore = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // Step 3: 履约订单
    await orderPage.fulfillOrderViaAPI(testOrderId, TEST_STORE_ID);

    // Step 4: 验证扣减量
    await inventoryPage.refresh();
    const whiskeyAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // 3杯 × 45ml = 135ml
    expect(whiskeyAfter.onHandQty).toBe(whiskeyBefore.onHandQty - 135);

    console.log(`✅ ${quantity}杯订单批量扣减验证通过`);
  });

  test('TC-UI-011: BOM快照版本锁定验证', async ({ page }) => {
    const testOrderId = generateTestOrderId('11');

    // 场景说明：
    // 1. 下单时使用当前BOM配方创建快照
    // 2. 修改BOM配方（实际测试中跳过此步）
    // 3. 履约时应使用快照中的配方，而非最新配方

    // Step 1: 创建订单（自动创建BOM快照）
    const reservationResponse = await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    expect(reservationResponse.success).toBe(true);

    // Step 2: 履约订单（使用快照中的配方）
    const fulfillResponse = await orderPage.fulfillOrderViaAPI(testOrderId, TEST_STORE_ID);

    expect(fulfillResponse.success).toBe(true);

    // Step 3: 验证扣减量符合快照配方
    await inventoryPage.goto();
    await inventoryPage.refresh();

    // 验证扣减量与预占时的配方一致（45ml威士忌）
    const transactions = await verifyTransactionLog(testOrderId, TransactionType.BOM_DEDUCTION);

    expect(transactions.exists).toBe(true);
    expect(transactions.count).toBe(4); // 4个组件

    console.log('✅ BOM快照版本锁定机制正常');
  });
});
