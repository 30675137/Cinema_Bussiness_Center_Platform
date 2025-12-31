/**
 * Unit tests for dictionaryStore
 *
 * Tests dictionary type and item CRUD operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDictionaryStore } from '../dictionaryStore';
import type {
  DictionaryType,
  DictionaryItem,
  CreateDictionaryTypeRequest,
  CreateDictionaryItemRequest,
} from '../../types';

describe('dictionaryStore', () => {
  beforeEach(() => {
    // Clear store before each test
    const store = useDictionaryStore.getState();
    store.clearAll();
  });

  describe('Dictionary Type Actions', () => {
    it('should add a dictionary type', () => {
      const store = useDictionaryStore.getState();
      const newType: DictionaryType = {
        id: 'type-1',
        code: 'CAPACITY_UNIT',
        name: '容量单位',
        description: '容量单位字典',
        isSystem: false,
        category: 'basic',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryType(newType);

      const types = useDictionaryStore.getState().dictionaryTypes;
      expect(types).toHaveLength(1);
      expect(types[0]).toEqual(newType);
    });

    it('should update a dictionary type', () => {
      const store = useDictionaryStore.getState();
      const type: DictionaryType = {
        id: 'type-1',
        code: 'CAPACITY_UNIT',
        name: '容量单位',
        isSystem: false,
        category: 'basic',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryType(type);
      store.updateDictionaryType('type-1', { name: '容量单位（更新）' });

      const updated = store.getDictionaryType('type-1');
      expect(updated?.name).toBe('容量单位（更新）');
      expect(updated?.updatedAt).not.toBe(type.updatedAt);
    });

    it('should delete a dictionary type', () => {
      const store = useDictionaryStore.getState();
      const type: DictionaryType = {
        id: 'type-1',
        code: 'CAPACITY_UNIT',
        name: '容量单位',
        isSystem: false,
        category: 'basic',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryType(type);
      store.deleteDictionaryType('type-1');

      const types = useDictionaryStore.getState().dictionaryTypes;
      expect(types).toHaveLength(0);
      expect(store.getDictionaryType('type-1')).toBeUndefined();
    });

    it('should get dictionary type by ID', () => {
      const store = useDictionaryStore.getState();
      const type: DictionaryType = {
        id: 'type-1',
        code: 'CAPACITY_UNIT',
        name: '容量单位',
        isSystem: false,
        category: 'basic',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryType(type);
      const found = store.getDictionaryType('type-1');
      expect(found).toEqual(type);
    });

    it('should get dictionary type by code', () => {
      const store = useDictionaryStore.getState();
      const type: DictionaryType = {
        id: 'type-1',
        code: 'CAPACITY_UNIT',
        name: '容量单位',
        isSystem: false,
        category: 'basic',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryType(type);
      const found = store.getDictionaryTypeByCode('CAPACITY_UNIT');
      expect(found).toEqual(type);
    });
  });

  describe('Dictionary Item Actions', () => {
    const typeId = 'type-1';

    beforeEach(() => {
      const store = useDictionaryStore.getState();
      const type: DictionaryType = {
        id: typeId,
        code: 'CAPACITY_UNIT',
        name: '容量单位',
        isSystem: false,
        category: 'basic',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };
      store.addDictionaryType(type);
    });

    it('should add a dictionary item', () => {
      const store = useDictionaryStore.getState();
      const item: DictionaryItem = {
        id: 'item-1',
        typeId,
        code: '500ML',
        name: '500毫升',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryItem(item);

      const items = store.getDictionaryItems(typeId);
      expect(items).toHaveLength(1);
      expect(items[0]).toEqual(item);
    });

    it('should update a dictionary item', () => {
      const store = useDictionaryStore.getState();
      const item: DictionaryItem = {
        id: 'item-1',
        typeId,
        code: '500ML',
        name: '500毫升',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryItem(item);
      store.updateDictionaryItem('item-1', { name: '500毫升（更新）' });

      const updated = store.getDictionaryItem('item-1');
      expect(updated?.name).toBe('500毫升（更新）');
    });

    it('should delete a dictionary item', () => {
      const store = useDictionaryStore.getState();
      const item: DictionaryItem = {
        id: 'item-1',
        typeId,
        code: '500ML',
        name: '500毫升',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryItem(item);
      store.deleteDictionaryItem('item-1');

      const items = store.getDictionaryItems(typeId);
      expect(items).toHaveLength(0);
      expect(store.getDictionaryItem('item-1')).toBeUndefined();
    });

    it('should get active dictionary items only', () => {
      const store = useDictionaryStore.getState();
      const activeItem: DictionaryItem = {
        id: 'item-1',
        typeId,
        code: '500ML',
        name: '500毫升',
        sort: 1,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };
      const inactiveItem: DictionaryItem = {
        id: 'item-2',
        typeId,
        code: '1000ML',
        name: '1000毫升',
        sort: 2,
        status: 'inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addDictionaryItem(activeItem);
      store.addDictionaryItem(inactiveItem);

      const activeItems = store.getActiveDictionaryItems(typeId);
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].id).toBe('item-1');
    });
  });
});
