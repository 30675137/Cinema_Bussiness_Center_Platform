// @spec T002-e2e-test-generator
/**
 * Database Assertion Helpers for E2E Tests
 *
 * Provides functions to query Supabase database and assert inventory states,
 * transaction records, and other database-level validations.
 */

import { expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create Supabase client with service role key (bypass RLS for testing)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Query inventory record by SKU ID
 * @param skuId - SKU identifier
 * @param storeId - Store identifier (optional)
 * @returns Inventory record
 */
export async function queryInventory(skuId: string, storeId?: string) {
  const query = supabase
    .from('inventory')
    .select('*')
    .eq('sku_id', skuId);

  if (storeId) {
    query.eq('store_id', storeId);
  }

  const { data, error } = await query.single();

  if (error) {
    throw new Error(`Failed to query inventory for SKU ${skuId}: ${error.message}`);
  }

  return data;
}

/**
 * Assert inventory state matches expected values
 * @param skuId - SKU identifier
 * @param expectedOnHand - Expected on_hand quantity
 * @param expectedReserved - Expected reserved quantity
 * @param storeId - Store identifier (optional)
 */
export async function assertInventoryState(
  skuId: string,
  expectedOnHand: number,
  expectedReserved: number,
  storeId?: string
) {
  const inventory = await queryInventory(skuId, storeId);

  expect(inventory.on_hand, `SKU ${skuId} on_hand should be ${expectedOnHand}`).toBe(expectedOnHand);
  expect(inventory.reserved, `SKU ${skuId} reserved should be ${expectedReserved}`).toBe(expectedReserved);

  // Also verify available quantity calculation
  const expectedAvailable = expectedOnHand - expectedReserved;
  const actualAvailable = inventory.on_hand - inventory.reserved;
  expect(actualAvailable, `SKU ${skuId} available should be ${expectedAvailable}`).toBe(expectedAvailable);

  console.log(`✅ Inventory state verified for SKU ${skuId}:`, {
    on_hand: inventory.on_hand,
    reserved: inventory.reserved,
    available: actualAvailable
  });
}

/**
 * Query inventory transactions by SKU ID and type
 * @param skuId - SKU identifier
 * @param type - Transaction type (e.g., 'DEDUCT', 'RESERVE', 'RELEASE')
 * @param orderId - Order identifier (optional)
 * @returns Array of transaction records
 */
export async function queryInventoryTransactions(
  skuId: string,
  type?: string,
  orderId?: string
) {
  let query = supabase
    .from('inventory_transactions')
    .select('*')
    .eq('sku_id', skuId)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  if (orderId) {
    query = query.eq('order_id', orderId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to query transactions for SKU ${skuId}: ${error.message}`);
  }

  return data || [];
}

/**
 * Assert transaction record exists with expected values
 * @param skuId - SKU identifier
 * @param type - Transaction type (e.g., 'DEDUCT', 'RESERVE')
 * @param expectedQuantity - Expected transaction quantity
 * @param orderId - Order identifier (optional)
 */
export async function assertTransactionExists(
  skuId: string,
  type: string,
  expectedQuantity: number,
  orderId?: string
) {
  const transactions = await queryInventoryTransactions(skuId, type, orderId);

  expect(transactions.length, `Should have at least one ${type} transaction for SKU ${skuId}`).toBeGreaterThan(0);

  // Find transaction matching the expected quantity
  const matchingTransaction = transactions.find(t => t.quantity === expectedQuantity);

  expect(matchingTransaction, `Should have ${type} transaction with quantity ${expectedQuantity} for SKU ${skuId}`).toBeDefined();

  console.log(`✅ Transaction verified for SKU ${skuId}:`, {
    type: matchingTransaction.type,
    quantity: matchingTransaction.quantity,
    created_at: matchingTransaction.created_at
  });

  return matchingTransaction;
}

/**
 * Assert multiple inventory states (batch verification)
 * @param inventoryStates - Array of inventory state expectations
 */
export async function assertInventoryStates(
  inventoryStates: Array<{
    skuId: string;
    skuName?: string;
    on_hand: number;
    reserved: number;
    storeId?: string;
  }>
) {
  console.log(`\n🔍 Verifying ${inventoryStates.length} inventory states...`);

  for (const state of inventoryStates) {
    console.log(`\nChecking ${state.skuName || state.skuId}...`);
    await assertInventoryState(state.skuId, state.on_hand, state.reserved, state.storeId);
  }

  console.log(`\n✅ All ${inventoryStates.length} inventory states verified!\n`);
}

/**
 * Assert multiple transaction records (batch verification)
 * @param transactionExpectations - Array of transaction expectations
 */
export async function assertTransactionsExist(
  transactionExpectations: Array<{
    skuId: string;
    skuName?: string;
    type: string;
    quantity: number;
    orderId?: string;
  }>
) {
  console.log(`\n🔍 Verifying ${transactionExpectations.length} transaction records...`);

  for (const expectation of transactionExpectations) {
    console.log(`\nChecking ${expectation.type} transaction for ${expectation.skuName || expectation.skuId}...`);
    await assertTransactionExists(
      expectation.skuId,
      expectation.type,
      expectation.quantity,
      expectation.orderId
    );
  }

  console.log(`\n✅ All ${transactionExpectations.length} transaction records verified!\n`);
}

/**
 * Reset inventory to initial state (for test cleanup)
 * @param skuId - SKU identifier
 * @param onHand - Initial on_hand value
 * @param reserved - Initial reserved value (default 0)
 * @param storeId - Store identifier (optional)
 */
export async function resetInventory(
  skuId: string,
  onHand: number,
  reserved: number = 0,
  storeId?: string
) {
  const updateData: any = {
    on_hand: onHand,
    reserved: reserved,
    updated_at: new Date().toISOString()
  };

  let query = supabase
    .from('inventory')
    .update(updateData)
    .eq('sku_id', skuId);

  if (storeId) {
    query = query.eq('store_id', storeId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to reset inventory for SKU ${skuId}: ${error.message}`);
  }

  console.log(`✅ Reset inventory for SKU ${skuId}: on_hand=${onHand}, reserved=${reserved}`);
}
