/**
 * 库存Store调试测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInventoryStore } from '@/stores/inventoryStore';

describe('inventoryStore - 调试测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('调试库存数据获取', async () => {
    const store = useInventoryStore.getState();

    console.log('初始状态:', {
      inventoryItems: store.inventoryItems.length,
      locations: store.locations.length,
      filter: store.filter,
      loading: store.loading,
      error: store.error
    });

    // 先获取位置数据
    await store.fetchLocations();
    console.log('获取位置后:', {
      locations: store.locations.length,
      loading: store.loading
    });

    // 获取库存数据
    await store.fetchInventoryItems();
    console.log('获取库存后:', {
      inventoryItems: store.inventoryItems.length,
      loading: store.loading,
      error: store.error,
      filter: store.filter
    });

    // 检查第一个库存项
    if (store.inventoryItems.length > 0) {
      console.log('第一个库存项:', store.inventoryItems[0]);
    }

    expect(store.inventoryItems.length).toBeGreaterThan(0);
  });

  it('测试库存项创建', async () => {
    const store = useInventoryStore.getState();

    // 确保有位置数据
    await store.fetchLocations();
    console.log('可用位置数量:', store.locations.length);

    if (store.locations.length === 0) {
      console.log('没有位置数据，创建测试位置');
      await store.createLocation({
        name: '测试位置',
        code: 'TEST-001',
        type: 'warehouse',
        capacity: 1000,
        description: '测试用位置'
      });
      console.log('创建位置后:', store.locations.length);
    }

    const locationId = store.locations[0]?.id;
    console.log('使用位置ID:', locationId);

    const newInventoryId = await store.createInventoryItem({
      productId: 'test-product-001',
      locationId: locationId || 'test-location',
      initialStock: 100,
      minStock: 20,
      maxStock: 500,
      safeStock: 30,
      averageCost: 15.50,
      remark: '调试测试库存项'
    });

    console.log('创建库存项结果:', {
      newInventoryId,
      totalItems: store.inventoryItems.length,
      loading: store.loading,
      error: store.error
    });

    expect(newInventoryId).toBeDefined();
  });
});