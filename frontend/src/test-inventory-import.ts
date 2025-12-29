import type { CurrentInventory } from './types/inventory';

const test: CurrentInventory = {
  id: '1',
  skuId: '1',
  storeId: '1',
  availableQty: 0,
  onHandQty: 0,
  reservedQty: 0,
  inTransitQty: 0,
  damagedQty: 0,
  expiredQty: 0,
  reorderPoint: 0,
  maxStock: 0,
  minStock: 0,
  safetyStock: 0,
  lastUpdated: '',
  sku: { id: '', name: '', skuCode: '', isActive: true },
  store: { id: '', name: '', code: '', isActive: true }
};

console.log('Test import successful:', test);
export default test;
