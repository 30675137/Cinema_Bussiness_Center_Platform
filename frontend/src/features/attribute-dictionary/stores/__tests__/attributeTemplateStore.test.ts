/**
 * Unit tests for attributeTemplateStore
 * 
 * Tests attribute template and attribute CRUD operations
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAttributeTemplateStore } from '../attributeTemplateStore';
import type {
  AttributeTemplate,
  Attribute,
  CreateAttributeTemplateRequest,
  CreateAttributeRequest,
} from '../../types';

describe('attributeTemplateStore', () => {
  beforeEach(() => {
    // Clear store before each test
    const store = useAttributeTemplateStore.getState();
    store.clearAll();
  });

  describe('Attribute Template Actions', () => {
    it('should add an attribute template', () => {
      const store = useAttributeTemplateStore.getState();
      const newTemplate: AttributeTemplate = {
        id: 'template-1',
        categoryId: 'category-1',
        name: '测试模板',
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addAttributeTemplate(newTemplate);

      const template = store.getAttributeTemplateByCategoryId('category-1');
      expect(template).toEqual(newTemplate);
    });

    it('should update an attribute template', () => {
      const store = useAttributeTemplateStore.getState();
      const template: AttributeTemplate = {
        id: 'template-1',
        categoryId: 'category-1',
        name: '测试模板',
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addAttributeTemplate(template);
      store.updateAttributeTemplate('template-1', { name: '更新后的模板' });

      const updated = store.getAttributeTemplate('template-1');
      expect(updated?.name).toBe('更新后的模板');
      expect(updated?.updatedAt).not.toBe(template.updatedAt);
    });

    it('should delete an attribute template', () => {
      const store = useAttributeTemplateStore.getState();
      const template: AttributeTemplate = {
        id: 'template-1',
        categoryId: 'category-1',
        name: '测试模板',
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addAttributeTemplate(template);
      store.deleteAttributeTemplate('template-1');

      const found = store.getAttributeTemplate('template-1');
      expect(found).toBeUndefined();
    });

    it('should get attribute template by category ID', () => {
      const store = useAttributeTemplateStore.getState();
      const template: AttributeTemplate = {
        id: 'template-1',
        categoryId: 'category-1',
        name: '测试模板',
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addAttributeTemplate(template);
      const found = store.getAttributeTemplateByCategoryId('category-1');
      expect(found).toEqual(template);
    });
  });

  describe('Attribute Actions', () => {
    const templateId = 'template-1';

    beforeEach(() => {
      const store = useAttributeTemplateStore.getState();
      const template: AttributeTemplate = {
        id: templateId,
        categoryId: 'category-1',
        name: '测试模板',
        version: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };
      store.addAttributeTemplate(template);
    });

    it('should add an attribute', () => {
      const store = useAttributeTemplateStore.getState();
      const attribute: Attribute = {
        id: 'attr-1',
        templateId,
        name: '容量',
        code: 'capacity',
        type: 'text',
        required: true,
        sort: 1,
        level: 'SPU',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addAttribute(attribute);

      const attributes = store.getAttributes(templateId);
      expect(attributes).toHaveLength(1);
      expect(attributes[0]).toEqual(attribute);
    });

    it('should update an attribute', () => {
      const store = useAttributeTemplateStore.getState();
      const attribute: Attribute = {
        id: 'attr-1',
        templateId,
        name: '容量',
        code: 'capacity',
        type: 'text',
        required: true,
        sort: 1,
        level: 'SPU',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addAttribute(attribute);
      store.updateAttribute('attr-1', { name: '容量（更新）' });

      const updated = store.getAttribute('attr-1');
      expect(updated?.name).toBe('容量（更新）');
    });

    it('should delete an attribute', () => {
      const store = useAttributeTemplateStore.getState();
      const attribute: Attribute = {
        id: 'attr-1',
        templateId,
        name: '容量',
        code: 'capacity',
        type: 'text',
        required: true,
        sort: 1,
        level: 'SPU',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'user-1',
        updatedBy: 'user-1',
      };

      store.addAttribute(attribute);
      store.deleteAttribute('attr-1');

      const attributes = store.getAttributes(templateId);
      expect(attributes).toHaveLength(0);
      expect(store.getAttribute('attr-1')).toBeUndefined();
    });
  });
});


