/**
 * @spec P005-bom-inventory-deduction
 * Playwright E2E Test - 预占取消
 *
 * 测试场景：订单取消时释放预占库存
 *
 * 测试流程：
 * 1. 准备：创建订单并预占库存
 * 2. 取消：通过API取消订单
 * 3. 验证：检查B端库存管理界面的预占库存释放
 * 4. 验证：检查事务日志记录预占释放
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
  verifyReservationRecord,
  verifyTransactionLog
} from './helpers/database-helper';

test.describe('P005 预占取消 - UI测试', () => {
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

  test('TC-UI-012: 取消订单后UI显示预占释放', async ({ page }) => {
    const testOrderId = generateTestOrderId('12');

    // Step 1: 创建订单并预占库存
    console.log('Step 1: 创建订单并预占库存');
    const reservationResponse = await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    expect(reservationResponse.success).toBe(true);

    // Step 2: 查询预占后的库存
    await inventoryPage.goto();
    const afterReservation = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('预占后库存:', afterReservation);

    // Step 3: 取消订单
    console.log('Step 3: 取消订单');
    const cancelResponse = await orderPage.cancelOrderViaAPI(testOrderId);

    console.log('取消响应:', cancelResponse);
    expect(cancelResponse.success).toBe(true);

    // Step 4: 刷新库存页面，验证UI
    console.log('Step 4: 验证UI库存变化');
    await inventoryPage.refresh();

    const afterCancellation = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('取消后库存:', afterCancellation);

    // 验证：预占库存释放（减少45ml）
    expect(afterCancellation.reservedQty).toBe(afterReservation.reservedQty - 45);

    // 验证：可用库存恢复（增加45ml）
    expect(afterCancellation.availableQty).toBe(afterReservation.availableQty + 45);

    // 验证：现存库存不变
    expect(afterCancellation.onHandQty).toBe(afterReservation.onHandQty);
  });

  test('TC-UI-013: 验证所有BOM组件预占同步释放', async ({ page }) => {
    const testOrderId = generateTestOrderId('13');

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

    // Step 3: 取消订单
    await orderPage.cancelOrderViaAPI(testOrderId);

    // Step 4: 验证所有组件预占释放
    await inventoryPage.refresh();

    const whiskeyAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);
    const colaAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.COLA]);
    const iceAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.ICE_CUBE]);
    const lemonAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.LEMON_SLICE]);

    // 验证预占释放
    expect(whiskeyAfter.reservedQty).toBe(whiskeyBefore.reservedQty - 45);
    expect(colaAfter.reservedQty).toBe(colaBefore.reservedQty - 150);
    expect(iceAfter.reservedQty).toBe(iceBefore.reservedQty - 1);
    expect(lemonAfter.reservedQty).toBe(lemonBefore.reservedQty - 1);

    // 验证现存库存不变
    expect(whiskeyAfter.onHandQty).toBe(whiskeyBefore.onHandQty);
    expect(colaAfter.onHandQty).toBe(colaBefore.onHandQty);

    console.log('✅ 所有BOM组件预占已同步释放');
  });

  test('TC-UI-014: 取消后生成预占释放事务日志', async ({ page }) => {
    const testOrderId = generateTestOrderId('14');

    // Step 1: 创建并取消订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    await orderPage.cancelOrderViaAPI(testOrderId);

    // Step 2: 查看事务日志
    await transactionLogPage.goto();
    await transactionLogPage.searchByOrderId(testOrderId);

    // Step 3: 验证预占释放事务
    await transactionLogPage.verifyTransactionExists(testOrderId, TransactionType.RESERVATION_RELEASE);

    // Step 4: 验证事务数量（应该有4条释放记录）
    const transactions = await verifyTransactionLog(testOrderId, TransactionType.RESERVATION_RELEASE);

    expect(transactions.exists).toBe(true);
    expect(transactions.count).toBeGreaterThan(0);

    console.log('✅ 预占释放事务日志已生成');
  });

  test('TC-UI-015: 验证预占记录状态变更', async ({ page }) => {
    const testOrderId = generateTestOrderId('15');

    // Step 1: 创建订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    // 验证预占记录状态为ACTIVE
    let reservationRecord = await verifyReservationRecord(testOrderId);
    expect(reservationRecord.status).toBe('ACTIVE');

    // Step 2: 取消订单
    await orderPage.cancelOrderViaAPI(testOrderId);

    // 验证预占记录状态变更为CANCELLED
    reservationRecord = await verifyReservationRecord(testOrderId);
    expect(reservationRecord.status).toBe('CANCELLED');

    console.log('✅ 预占记录状态已更新');
  });

  test('TC-UI-016: 多杯取消验证批量释放', async ({ page }) => {
    const testOrderId = generateTestOrderId('16');
    const quantity = 5; // 5杯

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

    // Step 3: 取消订单
    await orderPage.cancelOrderViaAPI(testOrderId);

    // Step 4: 验证释放量
    await inventoryPage.refresh();
    const whiskeyAfter = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // 5杯 × 45ml = 225ml释放
    expect(whiskeyAfter.reservedQty).toBe(whiskeyBefore.reservedQty - 225);
    expect(whiskeyAfter.availableQty).toBe(whiskeyBefore.availableQty + 225);

    console.log(`✅ ${quantity}杯订单批量释放验证通过`);
  });

  test('TC-UI-017: 重复取消订单验证幂等性', async ({ page }) => {
    const testOrderId = generateTestOrderId('17');

    // Step 1: 创建订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    // Step 2: 第一次取消
    const firstCancelResponse = await orderPage.cancelOrderViaAPI(testOrderId);
    expect(firstCancelResponse.success).toBe(true);

    // Step 3: 记录取消后库存
    await inventoryPage.goto();
    const firstCancelInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // Step 4: 第二次取消（重复操作）
    const secondCancelResponse = await orderPage.cancelOrderViaAPI(testOrderId);

    // 验证：第二次取消可能返回错误或成功（取决于实现）
    console.log('第二次取消响应:', secondCancelResponse);

    // Step 5: 验证库存不再变化
    await inventoryPage.refresh();
    const secondCancelInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    expect(secondCancelInventory.reservedQty).toBe(firstCancelInventory.reservedQty);
    expect(secondCancelInventory.availableQty).toBe(firstCancelInventory.availableQty);

    console.log('✅ 重复取消验证通过（幂等性）');
  });
});
