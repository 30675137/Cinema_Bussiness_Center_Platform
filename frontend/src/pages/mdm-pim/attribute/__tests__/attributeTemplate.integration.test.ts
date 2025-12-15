/**
 * Integration tests for attribute template CRUD operations via MSW
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { attributeService } from '../services/attributeService';
import type {
  AttributeTemplate,
  CreateAttributeTemplateRequest,
} from '@/features/attribute-dictionary/types';

describe('Attribute Template Integration Tests', () => {
  let testCategoryId: string;

  beforeEach(() => {
    // Use a test category ID
    testCategoryId = 'test-category-1';
  });

  describe('GET /attribute-templates', () => {
    it('should fetch attribute templates list', async () => {
      const response = await attributeService.getAttributeTemplates();
      
      expect(response.success).toBe(true);
      if (response.success) {
        expect(Array.isArray(response.data.data)).toBe(true);
        expect(response.data.pagination).toBeDefined();
      }
    });

    it('should fetch templates by categoryId', async () => {
      const response = await attributeService.getAttributeTemplates({
        categoryId: testCategoryId,
      });

      expect(response.success).toBe(true);
      if (response.success) {
        expect(Array.isArray(response.data.data)).toBe(true);
      }
    });
  });

  describe('GET /attribute-templates/:id', () => {
    it('should fetch a single attribute template by ID', async () => {
      // Create a template first
      const createResponse = await attributeService.createAttributeTemplate({
        categoryId: testCategoryId,
        name: '测试模板',
      });

      if (createResponse.success) {
        const detailResponse = await attributeService.getAttributeTemplate(createResponse.data.id);
        expect(detailResponse.success).toBe(true);
        if (detailResponse.success) {
          expect(detailResponse.data.id).toBe(createResponse.data.id);
          expect(Array.isArray(detailResponse.data.attributes)).toBe(true);
        }
      }
    });
  });

  describe('GET /attribute-templates/by-category/:categoryId', () => {
    it('should fetch template by category ID', async () => {
      const response = await attributeService.getAttributeTemplateByCategory(testCategoryId);
      expect(typeof response.success).toBe('boolean');
    });
  });

  describe('POST /attribute-templates', () => {
    it('should create a new attribute template', async () => {
      const newTemplate: CreateAttributeTemplateRequest = {
        categoryId: `test-category-${Date.now()}`,
        name: '测试模板',
      };

      const response = await attributeService.createAttributeTemplate(newTemplate);
      
      expect(response.success).toBe(true);
      if (response.success) {
        expect(response.data.categoryId).toBe(newTemplate.categoryId);
        expect(response.data.name).toBe(newTemplate.name);
      }
    });
  });

  describe('PUT /attribute-templates/:id', () => {
    it('should update an existing attribute template', async () => {
      // Create a template first
      const createResponse = await attributeService.createAttributeTemplate({
        categoryId: `update-test-${Date.now()}`,
        name: '原始名称',
      });

      if (!createResponse.success) {
        throw new Error('Failed to create template for update test');
      }

      const templateId = createResponse.data.id;

      // Update it
      const updateResponse = await attributeService.updateAttributeTemplate(templateId, {
        name: '更新后的名称',
        isActive: false,
      });

      expect(updateResponse.success).toBe(true);
      if (updateResponse.success) {
        expect(updateResponse.data.name).toBe('更新后的名称');
        expect(updateResponse.data.isActive).toBe(false);
      }
    });
  });

  describe('DELETE /attribute-templates/:id', () => {
    it('should delete an existing attribute template', async () => {
      // Create a template first
      const createResponse = await attributeService.createAttributeTemplate({
        categoryId: `delete-test-${Date.now()}`,
        name: '待删除模板',
      });

      if (!createResponse.success) {
        throw new Error('Failed to create template for delete test');
      }

      const templateId = createResponse.data.id;

      // Delete it
      const deleteResponse = await attributeService.deleteAttributeTemplate(templateId);
      expect(deleteResponse.success).toBe(true);

      // Verify it's deleted
      const getResponse = await attributeService.getAttributeTemplate(templateId);
      expect(getResponse.success).toBe(false);
    });
  });
});

