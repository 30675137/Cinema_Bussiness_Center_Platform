/**
 * 测试库存数据获取的简化版本
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInventoryStore } from '@/stores/inventoryStore';

describe('库存Store - 数据获取测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('应该能够获取位置数据', async () => {
    // 创建一个新的store实例
    const store = useInventoryStore.getState();

    console.log('调用fetchLocations前:', store.locations.length);

    // 直接调用fetchLocations
    await store.fetchLocations();

    console.log('调用fetchLocations后:', store.locations.length);
    console.log('位置数据:', store.locations);

    expect(store.locations.length).toBeGreaterThan(0);
  });

  it('应该能够获取库存数据', async () => {
    const store = useInventoryStore.getState();

    // 确保位置数据已加载
    await store.fetchLocations();

    console.log('调用fetchInventoryItems前:', store.inventoryItems.length);

    // 调用fetchInventoryItems
    await store.fetchInventoryItems();

    console.log('调用fetchInventoryItems后:', store.inventoryItems.length);

    expect(store.inventoryItems.length).toBeGreaterThan(0);
  });

  it('验证位置数据生成函数', () => {
    // 直接导入并测试生成函数
    const testStore = useInventoryStore.getState();

    // 通过调用一些方法来触发数据生成
    testStore.fetchLocations().then(() => {
      console.log('位置数据生成测试:', testStore.locations.length);
    });
  });
});
