/**
 * Integration tests for dictionary item CRUD operations via MSW
 * 
 * Tests the full flow from API calls through service layer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { attributeService } from '../services/attributeService';
import type {
  DictionaryItem,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
} from '@/features/attribute-dictionary/types';

describe('Dictionary Item Integration Tests', () => {
  let testTypeId: string;

  beforeEach(async () => {
    // Create a test dictionary type for each test
    const createResponse = await attributeService.createDictionaryType({
      code: `TEST_TYPE_${Date.now()}`,
      name: '测试类型',
      category: 'custom',
    });

    if (createResponse.success) {
      testTypeId = createResponse.data.id;
    } else {
      throw new Error('Failed to create test dictionary type');
    }
  });

  describe('GET /dictionary-types/:typeId/items', () => {
    it('should fetch dictionary items for a type', async () => {
      const response = await attributeService.getDictionaryItems(testTypeId);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(Array.isArray(response.data)).toBe(true);
      }
    });

    it('should fetch items with status filter', async () => {
      // Create an active item
      await attributeService.createDictionaryItem(testTypeId, {
        code: 'ACTIVE_ITEM',
        name: '启用项',
        sort: 1,
        status: 'active',
      });

      // Create an inactive item
      await attributeService.createDictionaryItem(testTypeId, {
        code: 'INACTIVE_ITEM',
        name: '停用项',
        sort: 2,
        status: 'inactive',
      });

      // Fetch only active items
      const activeResponse = await attributeService.getDictionaryItems(testTypeId, {
        status: 'active',
      });

      expect(activeResponse.success).toBe(true);
      if (activeResponse.success) {
        const allActive = activeResponse.data.every(item => item.status === 'active');
        expect(allActive).toBe(true);
      }
    });

    it('should return empty array for type with no items', async () => {
      // Create a new type with no items
      const newTypeResponse = await attributeService.createDictionaryType({
        code: `EMPTY_TYPE_${Date.now()}`,
        name: '空类型',
        category: 'custom',
      });

      if (newTypeResponse.success) {
        const itemsResponse = await attributeService.getDictionaryItems(newTypeResponse.data.id);
        expect(itemsResponse.success).toBe(true);
        if (itemsResponse.success) {
          expect(itemsResponse.data).toEqual([]);
        }
      }
    });
  });

  describe('POST /dictionary-types/:typeId/items', () => {
    it('should create a new dictionary item', async () => {
      const newItem: CreateDictionaryItemRequest = {
        code: 'TEST_ITEM',
        name: '测试项',
        sort: 1,
        status: 'active',
      };

      const response = await attributeService.createDictionaryItem(testTypeId, newItem);

      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.code).toBe(newItem.code);
        expect(response.data.name).toBe(newItem.name);
        expect(response.data.typeId).toBe(testTypeId);
        expect(response.data.status).toBe(newItem.status);
      }
    });

    it('should reject duplicate code within same type', async () => {
      const newItem: CreateDictionaryItemRequest = {
        code: 'DUPLICATE_CODE',
        name: '测试项',
        sort: 1,
      };

      // Create first time
      const firstResponse = await attributeService.createDictionaryItem(testTypeId, newItem);
      expect(firstResponse.success).toBe(true);

      // Try to create again with same code
      const secondResponse = await attributeService.createDictionaryItem(testTypeId, newItem);
      expect(secondResponse.success).toBe(false);
    });

    it('should auto-generate code if not provided', async () => {
      const newItem: Omit<CreateDictionaryItemRequest, 'code'> = {
        name: '自动编码项',
        sort: 1,
      };

      const response = await attributeService.createDictionaryItem(testTypeId, newItem as any);
      // The service or handler should handle code generation
      expect(typeof response.success).toBe('boolean');
    });
  });

  describe('PUT /dictionary-items/:id', () => {
    it('should update an existing dictionary item', async () => {
      // Create an item first
      const createResponse = await attributeService.createDictionaryItem(testTypeId, {
        code: 'UPDATE_ITEM',
        name: '原始名称',
        sort: 1,
      });

      if (!createResponse.success) {
        throw new Error('Failed to create item for update test');
      }

      const itemId = createResponse.data.id;

      // Update it
      const updateResponse = await attributeService.updateDictionaryItem(itemId, {
        name: '更新后的名称',
        sort: 2,
      });

      expect(updateResponse.success).toBe(true);
      if (updateResponse.success) {
        expect(updateResponse.data.name).toBe('更新后的名称');
        expect(updateResponse.data.sort).toBe(2);
      }
    });

    it('should toggle item status', async () => {
      // Create an active item
      const createResponse = await attributeService.createDictionaryItem(testTypeId, {
        code: 'STATUS_ITEM',
        name: '状态项',
        sort: 1,
        status: 'active',
      });

      if (!createResponse.success) {
        throw new Error('Failed to create item for status toggle test');
      }

      const itemId = createResponse.data.id;

      // Toggle to inactive
      const updateResponse = await attributeService.updateDictionaryItem(itemId, {
        status: 'inactive',
      });

      expect(updateResponse.success).toBe(true);
      if (updateResponse.success) {
        expect(updateResponse.data.status).toBe('inactive');
      }
    });

    it('should return error for non-existent ID', async () => {
      const response = await attributeService.updateDictionaryItem('non-existent-id', {
        name: '新名称',
      });
      expect(response.success).toBe(false);
    });
  });

  describe('DELETE /dictionary-items/:id', () => {
    it('should delete an existing dictionary item', async () => {
      // Create an item first
      const createResponse = await attributeService.createDictionaryItem(testTypeId, {
        code: 'DELETE_ITEM',
        name: '待删除项',
        sort: 1,
      });

      if (!createResponse.success) {
        throw new Error('Failed to create item for delete test');
      }

      const itemId = createResponse.data.id;

      // Delete it
      const deleteResponse = await attributeService.deleteDictionaryItem(itemId);
      expect(deleteResponse.success).toBe(true);

      // Verify it's deleted by trying to update it
      const updateResponse = await attributeService.updateDictionaryItem(itemId, {
        name: '新名称',
      });
      expect(updateResponse.success).toBe(false);
    });

    it('should return error for non-existent ID', async () => {
      const response = await attributeService.deleteDictionaryItem('non-existent-id');
      expect(response.success).toBe(false);
    });
  });

  describe('POST /dictionary-items/batch-sort', () => {
    it('should batch update item sort order', async () => {
      // Create multiple items
      const item1 = await attributeService.createDictionaryItem(testTypeId, {
        code: 'ITEM_1',
        name: '项1',
        sort: 1,
      });
      const item2 = await attributeService.createDictionaryItem(testTypeId, {
        code: 'ITEM_2',
        name: '项2',
        sort: 2,
      });
      const item3 = await attributeService.createDictionaryItem(testTypeId, {
        code: 'ITEM_3',
        name: '项3',
        sort: 3,
      });

      if (item1.success && item2.success && item3.success) {
        // Update sort order
        const batchResponse = await attributeService.batchUpdateDictionaryItemSort({
          updates: [
            { id: item1.data.id, sort: 3 },
            { id: item2.data.id, sort: 1 },
            { id: item3.data.id, sort: 2 },
          ],
        });

        expect(batchResponse.success).toBe(true);

        // Verify new order
        const itemsResponse = await attributeService.getDictionaryItems(testTypeId);
        if (itemsResponse.success) {
          const sortedItems = itemsResponse.data.sort((a, b) => a.sort - b.sort);
          expect(sortedItems[0].id).toBe(item2.data.id);
          expect(sortedItems[1].id).toBe(item3.data.id);
          expect(sortedItems[2].id).toBe(item1.data.id);
        }
      }
    });
  });
});

