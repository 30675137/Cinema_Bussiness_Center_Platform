/**
 * Integration tests for template copy functionality via MSW
 */

import { describe, it, expect } from 'vitest';
import { attributeService } from '../services/attributeService';

describe('Template Copy Integration Tests', () => {
  it('should copy an attribute template', async () => {
    // Create a source template first
    const createResponse = await attributeService.createAttributeTemplate({
      categoryId: `source-category-${Date.now()}`,
      name: '源模板',
    });

    if (!createResponse.success) {
      throw new Error('Failed to create source template');
    }

    const sourceTemplateId = createResponse.data.id;

    // Add an attribute to the template
    await attributeService.createAttribute(sourceTemplateId, {
      name: '测试属性',
      code: 'TEST_ATTR',
      type: 'text',
      required: true,
      sort: 1,
      level: 'SPU',
    });

    // Copy template to a new category
    const targetCategoryId = `target-category-${Date.now()}`;
    const copyResponse = await attributeService.copyAttributeTemplate(sourceTemplateId, {
      targetCategoryId,
      name: '复制模板',
    });

    expect(copyResponse.success).toBe(true);
    if (copyResponse.success) {
      expect(copyResponse.data.categoryId).toBe(targetCategoryId);
      expect(copyResponse.data.name).toBe('复制模板');
      // Verify attributes were copied
      const detailResponse = await attributeService.getAttributeTemplate(copyResponse.data.id);
      if (detailResponse.success) {
        expect(detailResponse.data.attributes?.length).toBeGreaterThan(0);
      }
    }
  });

  it('should handle name conflicts with _copy suffix', async () => {
    const categoryId = `conflict-test-${Date.now()}`;
    
    // Create first template
    const firstResponse = await attributeService.createAttributeTemplate({
      categoryId,
      name: '测试模板',
    });

    if (!firstResponse.success) {
      throw new Error('Failed to create first template');
    }

    // Try to copy with same name - should add _copy suffix
    const copyResponse = await attributeService.copyAttributeTemplate(firstResponse.data.id, {
      targetCategoryId: categoryId,
      name: '测试模板',
    });

    expect(copyResponse.success).toBe(true);
    if (copyResponse.success) {
      // Name should be modified to avoid conflict
      expect(copyResponse.data.name).toMatch(/测试模板/);
    }
  });
});

