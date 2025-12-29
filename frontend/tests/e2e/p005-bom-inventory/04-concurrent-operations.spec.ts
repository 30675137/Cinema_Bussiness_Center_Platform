/**
 * @spec P005-bom-inventory-deduction
 * Playwright E2E Test - 并发操作测试
 *
 * 测试场景：验证悲观锁机制在并发预占场景下的正确性
 *
 * 测试流程：
 * 1. 并发创建多个订单
 * 2. 验证库存预占的原子性
 * 3. 验证超卖防护机制
 */

import { test, expect } from '@playwright/test';
import { InventoryPage } from './page-objects/InventoryPage';
import { OrderPage } from './page-objects/OrderPage';
import {
  TEST_SKUS,
  TEST_STORE_ID,
  generateTestOrderId,
  SKU_NAMES,
  SINGLE_COCKTAIL_ORDER
} from './fixtures/test-data';
import { resetTestData } from './helpers/database-helper';

test.describe('P005 并发操作测试 - UI测试', () => {
  let inventoryPage: InventoryPage;
  let orderPage: OrderPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    orderPage = new OrderPage(page);

    // 重置测试数据
    await resetTestData();
  });

  test('TC-UI-018: 并发下单验证悲观锁机制', async ({ page }) => {
    const concurrentCount = 5; // 同时下单5个
    const orderIds: string[] = [];

    // 生成订单ID
    for (let i = 0; i < concurrentCount; i++) {
      orderIds.push(generateTestOrderId(`18${String.fromCharCode(97 + i)}`)); // 18a, 18b, 18c...
    }

    // Step 1: 记录初始库存
    await inventoryPage.goto();
    const initialInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('初始库存:', initialInventory);

    // Step 2: 并发创建订单
    console.log(`Step 2: 并发创建${concurrentCount}个订单`);

    const requests = orderIds.map(orderId =>
      orderPage.createOrderViaAPI(
        orderId,
        TEST_STORE_ID,
        SINGLE_COCKTAIL_ORDER(orderId).items
      )
    );

    const responses = await Promise.all(requests);

    // Step 3: 统计成功和失败的订单
    const successCount = responses.filter(r => r.success).length;
    const failureCount = responses.filter(r => !r.success).length;

    console.log(`成功订单: ${successCount}, 失败订单: ${failureCount}`);

    // Step 4: 验证库存预占量
    await inventoryPage.refresh();
    const finalInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('最终库存:', finalInventory);

    // 验证：预占量 = 成功订单数 × 每杯需求量
    const expectedReserved = successCount * 45;
    expect(finalInventory.reservedQty).toBe(initialInventory.reservedQty + expectedReserved);

    // 验证：可用库存减少量 = 预占量
    expect(finalInventory.availableQty).toBe(initialInventory.availableQty - expectedReserved);

    console.log('✅ 并发下单悲观锁验证通过');
  });

  test('TC-UI-019: 库存接近耗尽时的并发防护', async ({ page }) => {
    const concurrentCount = 10; // 尝试下单10个

    // Step 1: 先消耗大部分库存
    const setupOrderId = generateTestOrderId('19setup');
    await orderPage.createOrderViaAPI(
      setupOrderId,
      TEST_STORE_ID,
      [{
        skuId: TEST_SKUS.WHISKEY_COLA_COCKTAIL,
        quantity: 50, // 先预占50杯
        unit: '杯'
      }]
    );

    // Step 2: 查询剩余库存
    await inventoryPage.goto();
    const remainingInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('剩余可用库存:', remainingInventory.availableQty);

    // Step 3: 并发尝试下单
    const orderIds: string[] = [];
    for (let i = 0; i < concurrentCount; i++) {
      orderIds.push(generateTestOrderId(`19${String.fromCharCode(97 + i)}`));
    }

    const requests = orderIds.map(orderId =>
      orderPage.createOrderViaAPI(
        orderId,
        TEST_STORE_ID,
        SINGLE_COCKTAIL_ORDER(orderId).items
      )
    );

    const responses = await Promise.all(requests);

    // Step 4: 验证部分订单失败
    const successCount = responses.filter(r => r.success).length;
    const failureCount = responses.filter(r => !r.success).length;

    console.log(`成功: ${successCount}, 失败: ${failureCount}`);

    // 验证：失败订单数 > 0（因为库存不足）
    expect(failureCount).toBeGreaterThan(0);

    // Step 5: 验证库存未超卖
    await inventoryPage.refresh();
    const finalInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // 可用库存不应为负数
    expect(finalInventory.availableQty).toBeGreaterThanOrEqual(0);

    console.log('✅ 库存耗尽时的并发防护验证通过');
  });

  test('TC-UI-020: 并发履约验证原子性', async ({ page }) => {
    const concurrentCount = 3;
    const orderIds: string[] = [];

    // Step 1: 创建多个订单
    for (let i = 0; i < concurrentCount; i++) {
      const orderId = generateTestOrderId(`20${String.fromCharCode(97 + i)}`);
      orderIds.push(orderId);

      await orderPage.createOrderViaAPI(
        orderId,
        TEST_STORE_ID,
        SINGLE_COCKTAIL_ORDER(orderId).items
      );
    }

    // Step 2: 记录预占后库存
    await inventoryPage.goto();
    const beforeFulfillment = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // Step 3: 并发履约
    console.log('Step 3: 并发履约订单');

    const fulfillRequests = orderIds.map(orderId =>
      orderPage.fulfillOrderViaAPI(orderId, TEST_STORE_ID)
    );

    const fulfillResponses = await Promise.all(fulfillRequests);

    // Step 4: 验证所有履约成功
    const fulfillSuccess = fulfillResponses.filter(r => r.success).length;
    expect(fulfillSuccess).toBe(concurrentCount);

    // Step 5: 验证库存扣减正确
    await inventoryPage.refresh();
    const afterFulfillment = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // 现存库存减少 = 订单数 × 每杯需求量
    const expectedDeduction = concurrentCount * 45;
    expect(afterFulfillment.onHandQty).toBe(beforeFulfillment.onHandQty - expectedDeduction);

    // 预占库存全部释放
    expect(afterFulfillment.reservedQty).toBe(beforeFulfillment.reservedQty - expectedDeduction);

    console.log('✅ 并发履约原子性验证通过');
  });

  test('TC-UI-021: 并发取消验证原子性', async ({ page }) => {
    const concurrentCount = 3;
    const orderIds: string[] = [];

    // Step 1: 创建多个订单
    for (let i = 0; i < concurrentCount; i++) {
      const orderId = generateTestOrderId(`21${String.fromCharCode(97 + i)}`);
      orderIds.push(orderId);

      await orderPage.createOrderViaAPI(
        orderId,
        TEST_STORE_ID,
        SINGLE_COCKTAIL_ORDER(orderId).items
      );
    }

    // Step 2: 记录预占后库存
    await inventoryPage.goto();
    const beforeCancellation = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // Step 3: 并发取消
    console.log('Step 3: 并发取消订单');

    const cancelRequests = orderIds.map(orderId =>
      orderPage.cancelOrderViaAPI(orderId)
    );

    const cancelResponses = await Promise.all(cancelRequests);

    // Step 4: 验证所有取消成功
    const cancelSuccess = cancelResponses.filter(r => r.success).length;
    expect(cancelSuccess).toBe(concurrentCount);

    // Step 5: 验证库存预占释放正确
    await inventoryPage.refresh();
    const afterCancellation = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // 预占库存全部释放
    const expectedRelease = concurrentCount * 45;
    expect(afterCancellation.reservedQty).toBe(beforeCancellation.reservedQty - expectedRelease);

    // 可用库存恢复
    expect(afterCancellation.availableQty).toBe(beforeCancellation.availableQty + expectedRelease);

    console.log('✅ 并发取消原子性验证通过');
  });

  test('TC-UI-022: 混合并发操作（下单+履约+取消）', async ({ page }) => {
    // 场景：同时进行下单、履约、取消操作
    const orderIdReserve = generateTestOrderId('22a');
    const orderIdFulfill = generateTestOrderId('22b');
    const orderIdCancel = generateTestOrderId('22c');

    // Step 1: 先创建两个订单用于履约和取消
    await orderPage.createOrderViaAPI(
      orderIdFulfill,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(orderIdFulfill).items
    );

    await orderPage.createOrderViaAPI(
      orderIdCancel,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(orderIdCancel).items
    );

    // Step 2: 记录初始库存
    await inventoryPage.goto();
    const initialInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // Step 3: 并发执行3种操作
    console.log('Step 3: 并发执行混合操作');

    const [reserveResp, fulfillResp, cancelResp] = await Promise.all([
      orderPage.createOrderViaAPI(orderIdReserve, TEST_STORE_ID, SINGLE_COCKTAIL_ORDER(orderIdReserve).items),
      orderPage.fulfillOrderViaAPI(orderIdFulfill, TEST_STORE_ID),
      orderPage.cancelOrderViaAPI(orderIdCancel)
    ]);

    // Step 4: 验证所有操作成功
    expect(reserveResp.success).toBe(true);
    expect(fulfillResp.success).toBe(true);
    expect(cancelResp.success).toBe(true);

    // Step 5: 验证最终库存状态
    await inventoryPage.refresh();
    const finalInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('初始库存:', initialInventory);
    console.log('最终库存:', finalInventory);

    // 理论计算：
    // - 新预占: +45ml
    // - 履约扣减: -45ml (现存) -45ml (预占)
    // - 取消释放: -45ml (预占)
    // 最终预占变化: +45 -45 -45 = -45ml
    // 最终现存变化: -45ml

    expect(finalInventory.reservedQty).toBe(initialInventory.reservedQty - 45);
    expect(finalInventory.onHandQty).toBe(initialInventory.onHandQty - 45);

    console.log('✅ 混合并发操作验证通过');
  });
});
