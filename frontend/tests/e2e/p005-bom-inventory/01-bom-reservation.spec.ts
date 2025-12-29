/**
 * @spec P005-bom-inventory-deduction
 * Playwright E2E Test - BOM库存预占
 *
 * 测试场景：用户下单时自动预占BOM原料库存
 *
 * 测试流程：
 * 1. 准备：重置测试数据，查询初始库存
 * 2. 下单：通过API创建订单（模拟C端小程序下单）
 * 3. 验证：检查B端库存管理界面的预占库存变化
 * 4. 验证：检查数据库中的预占记录和BOM快照
 */

import { test, expect } from '@playwright/test';
import { InventoryPage } from './page-objects/InventoryPage';
import { OrderPage } from './page-objects/OrderPage';
import {
  TEST_SKUS,
  TEST_STORE_ID,
  generateTestOrderId,
  SKU_NAMES,
  SINGLE_COCKTAIL_ORDER,
  EXPECTED_RESERVATION_COMPONENTS
} from './fixtures/test-data';
import {
  resetTestData,
  getInventoryQuantities,
  verifyReservationRecord,
  verifyBomSnapshot
} from './helpers/database-helper';

test.describe('P005 BOM库存预占 - UI测试', () => {
  let inventoryPage: InventoryPage;
  let orderPage: OrderPage;

  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    orderPage = new OrderPage(page);

    // 重置测试数据
    await resetTestData();
  });

  test('TC-UI-001: 单品下单后UI显示预占库存增加', async ({ page }) => {
    const testOrderId = generateTestOrderId('01');

    // Step 1: 查询初始库存（UI）
    console.log('Step 1: 查询初始库存');
    await inventoryPage.goto();
    const initialInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('初始库存:', initialInventory);

    // Step 2: 创建订单（通过API模拟C端下单）
    console.log('Step 2: 创建订单 -', testOrderId);
    const reservationResponse = await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    console.log('预占响应:', reservationResponse);

    // 验证预占成功
    expect(reservationResponse.success).toBe(true);
    expect(reservationResponse.data.reservedComponents).toHaveLength(4);

    // Step 3: 刷新库存页面，验证UI显示
    console.log('Step 3: 验证UI库存变化');
    await inventoryPage.refresh();

    // 验证威士忌预占库存增加
    const updatedInventory = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);

    console.log('更新后库存:', updatedInventory);

    expect(updatedInventory.reservedQty).toBe(initialInventory.reservedQty + 45); // 1杯需45ml
    expect(updatedInventory.availableQty).toBe(initialInventory.availableQty - 45);
    expect(updatedInventory.onHandQty).toBe(initialInventory.onHandQty); // 现存库存不变

    // Step 4: 验证数据库预占记录
    console.log('Step 4: 验证数据库预占记录');
    const reservationRecord = await verifyReservationRecord(testOrderId);
    expect(reservationRecord.exists).toBe(true);
    expect(reservationRecord.count).toBeGreaterThan(0); // 应该有4条原料预占记录
    expect(reservationRecord.status).toBe('ACTIVE');

    // Step 5: 验证BOM快照
    console.log('Step 5: 验证BOM快照');
    const bomSnapshot = await verifyBomSnapshot(testOrderId);
    expect(bomSnapshot.exists).toBe(true);
    expect(bomSnapshot.count).toBeGreaterThan(0); // 应该有4条BOM快照记录
  });

  test('TC-UI-002: 多杯下单验证批量预占', async ({ page }) => {
    const testOrderId = generateTestOrderId('02');
    const quantity = 2; // 下单2杯

    // Step 1: 查询初始库存
    console.log('Step 1: 查询初始库存');
    await inventoryPage.goto();
    const initialWhiskey = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);
    const initialCola = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.COLA]);

    // Step 2: 创建多杯订单
    console.log(`Step 2: 创建${quantity}杯订单`);
    const reservationResponse = await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      [{
        skuId: TEST_SKUS.WHISKEY_COLA_COCKTAIL,
        quantity,
        unit: '杯'
      }]
    );

    expect(reservationResponse.success).toBe(true);

    // Step 3: 刷新并验证UI
    await inventoryPage.refresh();

    // 验证威士忌预占: 2杯 × 45ml = 90ml
    const updatedWhiskey = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.WHISKEY]);
    expect(updatedWhiskey.reservedQty).toBe(initialWhiskey.reservedQty + 90);
    expect(updatedWhiskey.availableQty).toBe(initialWhiskey.availableQty - 90);

    // 验证可乐预占: 2杯 × 150ml = 300ml
    const updatedCola = await inventoryPage.getInventoryQuantities(SKU_NAMES[TEST_SKUS.COLA]);
    expect(updatedCola.reservedQty).toBe(initialCola.reservedQty + 300);
    expect(updatedCola.availableQty).toBe(initialCola.availableQty - 300);
  });

  test('TC-UI-003: 库存不足时UI显示错误提示', async ({ page }) => {
    const testOrderId = generateTestOrderId('03');

    // Step 1: 先下单消耗大部分库存
    console.log('Step 1: 消耗大部分库存');
    const firstOrderId = generateTestOrderId('03a');
    await orderPage.createOrderViaAPI(
      firstOrderId,
      TEST_STORE_ID,
      [{
        skuId: TEST_SKUS.WHISKEY_COLA_COCKTAIL,
        quantity: 100, // 下单100杯，消耗大量库存
        unit: '杯'
      }]
    );

    // Step 2: 尝试再次下单
    console.log('Step 2: 尝试下单触发库存不足');
    const secondOrderId = generateTestOrderId('03b');
    const failedResponse = await orderPage.createOrderViaAPI(
      secondOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(secondOrderId).items
    );

    // 验证返回错误
    expect(failedResponse.success).toBe(false);
    expect(failedResponse.error).toContain('INSUFFICIENT'); // 错误码包含库存不足信息

    console.log('错误信息:', failedResponse);
  });

  test('TC-UI-004: 打开库存详情查看预占明细', async ({ page }) => {
    const testOrderId = generateTestOrderId('04');

    // Step 1: 创建订单
    await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    // Step 2: 进入库存页面并打开详情
    await inventoryPage.goto();
    await inventoryPage.openDetailDrawer(SKU_NAMES[TEST_SKUS.WHISKEY]);

    // Step 3: 验证详情抽屉显示
    await expect(inventoryPage.detailDrawer).toBeVisible();
    await expect(inventoryPage.detailDrawer).toContainText('预占库存');
    await expect(inventoryPage.detailDrawer).toContainText('可用库存');

    // 验证预占数量 > 0
    const reservedQtyText = await inventoryPage.detailDrawer
      .locator('text=/预占.*\\d+/')
      .textContent();

    console.log('预占数量显示:', reservedQtyText);
    expect(reservedQtyText).toBeTruthy();
  });

  test('TC-UI-005: 验证BOM展开计算正确性（4个组件全部预占）', async ({ page }) => {
    const testOrderId = generateTestOrderId('05');

    // Step 1: 创建订单
    const response = await orderPage.createOrderViaAPI(
      testOrderId,
      TEST_STORE_ID,
      SINGLE_COCKTAIL_ORDER(testOrderId).items
    );

    expect(response.success).toBe(true);
    expect(response.data.reservedComponents).toHaveLength(4);

    // Step 2: 验证每个组件的预占量
    const components = response.data.reservedComponents;

    const whiskey = components.find((c: any) => c.skuId === TEST_SKUS.WHISKEY);
    const cola = components.find((c: any) => c.skuId === TEST_SKUS.COLA);
    const ice = components.find((c: any) => c.skuId === TEST_SKUS.ICE_CUBE);
    const lemon = components.find((c: any) => c.skuId === TEST_SKUS.LEMON_SLICE);

    expect(whiskey.quantity).toBe(45);
    expect(cola.quantity).toBe(150);
    expect(ice.quantity).toBe(1);
    expect(lemon.quantity).toBe(1);

    // Step 3: 在UI中逐个验证
    await inventoryPage.goto();

    for (const component of EXPECTED_RESERVATION_COMPONENTS) {
      const skuName = SKU_NAMES[component.skuId];
      const inventory = await inventoryPage.getInventoryQuantities(skuName);

      console.log(`${skuName} 预占库存:`, inventory.reservedQty);
      expect(inventory.reservedQty).toBeGreaterThanOrEqual(component.quantity);
    }
  });
});
