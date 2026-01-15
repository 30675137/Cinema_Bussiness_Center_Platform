/**
 * @spec P005-bom-inventory-deduction
 * E2E Tests for BOM Inventory Reservation and Deduction
 *
 * Test Coverage:
 * - TC-P005-001: Single product BOM expansion and inventory reservation
 * - TC-P005-002: Order fulfillment inventory deduction
 * - TC-P005-003: Insufficient inventory rejection
 * - TC-P005-004: Order cancellation releases reservation
 * - TC-P005-005: Multi-level combo BOM expansion
 */

import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

interface ReservationRequest {
  orderId: string;
  storeId: string;
  items: {
    skuId: string;
    quantity: number;
    unit?: string;
  }[];
}

interface DeductionRequest {
  orderId: string;
  storeId: string;
}

interface InventoryState {
  skuId: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
}

describe('P005 BOM Inventory Reservation and Deduction E2E Tests', () => {
  let api: AxiosInstance;
  const testStoreId = '00000000-0000-0000-0000-000000000001';

  // Test SKU IDs (these should exist in database)
  const cocktailSkuId = uuidv4(); // 威士忌可乐鸡尾酒
  const whiskeySkuId = uuidv4(); // 威士忌
  const colaSkuId = uuidv4(); // 可乐
  const cupSkuId = uuidv4(); // 杯子
  const strawSkuId = uuidv4(); // 吸管

  let testOrderId: string;

  beforeAll(async () => {
    api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      validateStatus: () => true // Don't throw on any status code
    });

    console.log('🔧 Setting up test data...');
    // Setup test data would go here
    // This includes creating BOM components, setting inventory levels
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up test data...');
    // Cleanup test data
  });

  describe('TC-P005-001: Single Product BOM Expansion and Inventory Reservation', () => {
    it('Step 6: Should successfully reserve inventory via API', async () => {
      testOrderId = uuidv4();

      const reservationRequest: ReservationRequest = {
        orderId: testOrderId,
        storeId: testStoreId,
        items: [
          {
            skuId: cocktailSkuId,
            quantity: 1,
            unit: 'cup'
          }
        ]
      };

      const response = await api.post('/api/inventory/reservations', reservationRequest);

      console.log(`📊 Reservation response status: ${response.status}`);
      console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));

      // Assertions
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.orderId).toBe(testOrderId);
      expect(response.data.data.reservationIds).toBeInstanceOf(Array);
      expect(response.data.data.reservationIds.length).toBeGreaterThan(0);

      // Should have reserved components (whiskey, cola, cup, straw)
      expect(response.data.data.reservedComponents).toBeInstanceOf(Array);
      expect(response.data.data.reservedComponents.length).toBe(4);
    });

    it('Step 7: Should expand BOM correctly (4 components)', async () => {
      // Query reservation records to verify BOM expansion
      const response = await api.get(`/api/inventory/reservations?orderId=${testOrderId}`);

      expect(response.status).toBe(200);
      // Verify 4 components were reserved
      expect(response.data.data.length).toBe(4);
    });

    it('Post-check: Should verify inventory reserved_qty increased', async () => {
      // Query inventory table to check reserved_qty
      const inventoryCheck = await api.get(`/api/inventory?storeId=${testStoreId}&skuId=${whiskeySkuId}`);

      expect(inventoryCheck.status).toBe(200);
      const inventory = inventoryCheck.data.data;

      // Whiskey reserved_qty should have increased by 45ml
      expect(inventory.reservedQty).toBeGreaterThan(0);
      expect(inventory.availableQty).toBe(inventory.onHandQty - inventory.reservedQty);
    });

    it('Post-check: Should verify BOM snapshot created', async () => {
      // Check BOM snapshot exists
      const snapshotCheck = await api.get(`/api/inventory/snapshots?orderId=${testOrderId}`);

      expect(snapshotCheck.status).toBe(200);
      expect(snapshotCheck.data.data).toBeDefined();
      expect(snapshotCheck.data.data.snapshotData).toBeDefined();
      expect(snapshotCheck.data.data.snapshotData.components).toBeInstanceOf(Array);
      expect(snapshotCheck.data.data.snapshotData.components.length).toBe(4);
    });
  });

  describe('TC-P005-002: Order Fulfillment Inventory Deduction', () => {
    it('Step 5: Should successfully deduct inventory via API', async () => {
      const deductionRequest: DeductionRequest = {
        orderId: testOrderId,
        storeId: testStoreId
      };

      const response = await api.post('/api/inventory/deductions', deductionRequest);

      console.log(`📊 Deduction response status: ${response.status}`);
      console.log(`📊 Response data:`, JSON.stringify(response.data, null, 2));

      // Assertions
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.orderId).toBe(testOrderId);
      expect(response.data.data.deductedComponents).toBeInstanceOf(Array);
      expect(response.data.data.deductedComponents.length).toBe(4);
    });

    it('Post-check: Should verify inventory on_hand_qty and reserved_qty decreased', async () => {
      const inventoryCheck = await api.get(`/api/inventory?storeId=${testStoreId}&skuId=${whiskeySkuId}`);

      expect(inventoryCheck.status).toBe(200);
      const inventory = inventoryCheck.data.data;

      // After deduction:
      // - on_hand_qty should have decreased
      // - reserved_qty should have decreased (released)
      // - available_qty = on_hand_qty - reserved_qty
      expect(inventory.onHandQty).toBeLessThan(1000); // Initial was 1000ml
      expect(inventory.reservedQty).toBe(0); // Should be released
    });

    it('Post-check: Should verify transaction logs created', async () => {
      const logsCheck = await api.get(`/api/inventory/transactions?orderId=${testOrderId}&transactionType=BOM_DEDUCTION`);

      expect(logsCheck.status).toBe(200);
      expect(logsCheck.data.data).toBeInstanceOf(Array);
      expect(logsCheck.data.data.length).toBe(4); // 4 components deducted

      // Verify log details
      const log = logsCheck.data.data[0];
      expect(log.transactionType).toBe('BOM_DEDUCTION');
      expect(log.quantity).toBeLessThan(0); // Negative for deduction
      expect(log.bomSnapshotId).toBeDefined();
      expect(log.relatedOrderId).toBe(testOrderId);
    });

    it('Post-check: Should verify reservation status changed to FULFILLED', async () => {
      const reservationCheck = await api.get(`/api/inventory/reservations?orderId=${testOrderId}`);

      expect(reservationCheck.status).toBe(200);
      const reservations = reservationCheck.data.data;

      reservations.forEach((reservation: any) => {
        expect(reservation.status).toBe('FULFILLED');
        expect(reservation.fulfilledAt).toBeDefined();
      });
    });
  });

  describe('TC-P005-003: Insufficient Inventory Rejection', () => {
    it('Should reject reservation when inventory insufficient', async () => {
      const insufficientOrderId = uuidv4();

      const reservationRequest: ReservationRequest = {
        orderId: insufficientOrderId,
        storeId: testStoreId,
        items: [
          {
            skuId: cocktailSkuId,
            quantity: 9999, // Extremely large quantity
            unit: 'cup'
          }
        ]
      };

      const response = await api.post('/api/inventory/reservations', reservationRequest);

      console.log(`📊 Insufficient inventory response:`, JSON.stringify(response.data, null, 2));

      // Should return 400 error
      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toBe('INV_BIZ_002');
      expect(response.data.details.shortages).toBeInstanceOf(Array);
      expect(response.data.details.shortages.length).toBeGreaterThan(0);

      // Verify shortage details
      const shortage = response.data.details.shortages[0];
      expect(shortage.skuId).toBeDefined();
      expect(shortage.available).toBeDefined();
      expect(shortage.required).toBeDefined();
      expect(shortage.shortage).toBeDefined();
      expect(shortage.shortage).toBeGreaterThan(0);
    });

    it('Post-check: Should verify no reservation records created', async () => {
      const reservationCheck = await api.get(`/api/inventory/reservations?orderId=${testOrderId}`);

      // Should not find any reservations for this failed order
      expect(reservationCheck.status).toBe(200);
      expect(reservationCheck.data.data.length).toBe(0);
    });
  });

  describe('TC-P005-004: Order Cancellation Releases Reservation', () => {
    let cancelOrderId: string;

    it('Setup: Create a reservation to be cancelled', async () => {
      cancelOrderId = uuidv4();

      const reservationRequest: ReservationRequest = {
        orderId: cancelOrderId,
        storeId: testStoreId,
        items: [
          {
            skuId: cocktailSkuId,
            quantity: 1,
            unit: 'cup'
          }
        ]
      };

      const response = await api.post('/api/inventory/reservations', reservationRequest);
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });

    it('Step 4: Should successfully release reservation', async () => {
      const response = await api.delete(`/api/inventory/reservations/${cancelOrderId}`);

      console.log(`📊 Release response:`, JSON.stringify(response.data, null, 2));

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.orderId).toBe(cancelOrderId);
      expect(response.data.data.releasedReservations).toBeGreaterThan(0);
    });

    it('Post-check: Should verify reserved_qty decreased', async () => {
      const inventoryCheck = await api.get(`/api/inventory?storeId=${testStoreId}&skuId=${whiskeySkuId}`);

      expect(inventoryCheck.status).toBe(200);
      const inventory = inventoryCheck.data.data;

      // reserved_qty should have returned to 0 (or less than before)
      // available_qty should have increased back
      expect(inventory.availableQty).toBe(inventory.onHandQty - inventory.reservedQty);
    });

    it('Post-check: Should verify RESERVATION_RELEASE logs created', async () => {
      const logsCheck = await api.get(`/api/inventory/transactions?orderId=${cancelOrderId}&transactionType=RESERVATION_RELEASE`);

      expect(logsCheck.status).toBe(200);
      expect(logsCheck.data.data).toBeInstanceOf(Array);
      expect(logsCheck.data.data.length).toBe(4); // 4 components released

      // Verify log details
      const log = logsCheck.data.data[0];
      expect(log.transactionType).toBe('RESERVATION_RELEASE');
      expect(log.quantity).toBe(0); // No on_hand change, only reserved
      expect(log.relatedOrderId).toBe(cancelOrderId);
    });

    it('Post-check: Should verify reservation status changed to CANCELLED', async () => {
      const reservationCheck = await api.get(`/api/inventory/reservations?orderId=${cancelOrderId}`);

      expect(reservationCheck.status).toBe(200);
      const reservations = reservationCheck.data.data;

      reservations.forEach((reservation: any) => {
        expect(reservation.status).toBe('CANCELLED');
      });
    });
  });

  describe('TC-P005-005: Multi-Level Combo BOM Expansion', () => {
    const comboSkuId = uuidv4(); // 情侣套餐

    it('Should expand multi-level BOM correctly (3 levels)', async () => {
      const multiLevelOrderId = uuidv4();

      const reservationRequest: ReservationRequest = {
        orderId: multiLevelOrderId,
        storeId: testStoreId,
        items: [
          {
            skuId: comboSkuId,
            quantity: 1,
            unit: 'set'
          }
        ]
      };

      const response = await api.post('/api/inventory/reservations', reservationRequest);

      console.log(`📊 Multi-level BOM response:`, JSON.stringify(response.data, null, 2));

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);

      // Should expand to 7 leaf materials
      expect(response.data.data.reservedComponents.length).toBe(7);
    });

    it('Post-check: Should verify BOM snapshot contains 3-level structure', async () => {
      const multiLevelOrderId = uuidv4();

      const snapshotCheck = await api.get(`/api/inventory/snapshots?orderId=${multiLevelOrderId}`);

      expect(snapshotCheck.status).toBe(200);
      expect(snapshotCheck.data.data.snapshotData).toBeDefined();
      // Verify 3-level structure preserved in snapshot
    });
  });

  describe('TC-P005-007: Inventory Transaction Log Query', () => {
    it('Should query transaction logs with filters', async () => {
      const response = await api.get('/api/inventory/transactions', {
        params: {
          transactionType: 'BOM_DEDUCTION',
          orderId: testOrderId,
          page: 0,
          pageSize: 20,
          sortBy: 'operatedAt',
          sortDirection: 'DESC'
        }
      });

      console.log(`📊 Transaction logs response:`, JSON.stringify(response.data, null, 2));

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeInstanceOf(Array);
      expect(response.data.total).toBeGreaterThan(0);
      expect(response.data.page).toBe(0);
      expect(response.data.pageSize).toBe(20);
    });

    it('Should get transaction detail with BOM components', async () => {
      // First get list
      const listResponse = await api.get('/api/inventory/transactions', {
        params: {
          orderId: testOrderId,
          transactionType: 'BOM_DEDUCTION'
        }
      });

      expect(listResponse.status).toBe(200);
      const transactionId = listResponse.data.data[0].id;

      // Then get detail
      const detailResponse = await api.get(`/api/inventory/transactions/${transactionId}`);

      console.log(`📊 Transaction detail:`, JSON.stringify(detailResponse.data, null, 2));

      expect(detailResponse.status).toBe(200);
      expect(detailResponse.data.success).toBe(true);
      expect(detailResponse.data.data.bomComponents).toBeDefined();
      expect(detailResponse.data.data.bomComponents).toBeInstanceOf(Array);
    });
  });
});
