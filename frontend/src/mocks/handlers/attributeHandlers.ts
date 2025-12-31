/**
 * MSW handlers for Attribute Dictionary Management
 *
 * Provides mock API endpoints for:
 * - Dictionary Types (T012)
 * - Dictionary Items (T013)
 * - Attribute Templates (T014)
 * - Attributes (T015)
 */

import { http, HttpResponse } from 'msw';
import type {
  DictionaryType,
  DictionaryItem,
  AttributeTemplate,
  Attribute,
  CreateDictionaryTypeRequest,
  UpdateDictionaryTypeRequest,
  CreateDictionaryItemRequest,
  UpdateDictionaryItemRequest,
  CreateAttributeTemplateRequest,
  UpdateAttributeTemplateRequest,
  CreateAttributeRequest,
  UpdateAttributeRequest,
  BatchUpdateSortRequest,
} from '@/features/attribute-dictionary/types';
import {
  initialDictionaryTypes,
  initialDictionaryItems,
  initialAttributeTemplates,
  initialAttributes,
  generateDictionaryType,
  generateDictionaryItem,
  generateAttributeTemplate,
  generateAttribute,
} from '../data/attributeMockData';

// ============================================================================
// In-memory state (simulates database)
// ============================================================================

let mockDictionaryTypes: DictionaryType[] = [...initialDictionaryTypes];
let mockDictionaryItems: Record<string, DictionaryItem[]> = JSON.parse(
  JSON.stringify(initialDictionaryItems)
);
let mockAttributeTemplates: AttributeTemplate[] = [...initialAttributeTemplates];
let mockAttributes: Record<string, Attribute[]> = JSON.parse(JSON.stringify(initialAttributes));

// ============================================================================
// Helper functions
// ============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const now = () => new Date().toISOString();

// ============================================================================
// Dictionary Type Handlers (T012)
// ============================================================================

const dictionaryTypeHandlers = [
  // GET /api/dictionary-types - List dictionary types
  http.get('/api/dictionary-types', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'active' | 'inactive' | null;
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    let filtered = [...mockDictionaryTypes];

    // Apply status filter
    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) || t.code.toLowerCase().includes(searchLower)
      );
    }

    // Sort by sort field
    filtered.sort((a, b) => a.sort - b.sort);

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedData,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  }),

  // GET /api/dictionary-types/:id - Get single dictionary type
  http.get('/api/dictionary-types/:id', async ({ params }) => {
    await delay(200);

    const { id } = params;
    const type = mockDictionaryTypes.find((t) => t.id === id);

    if (!type) {
      return HttpResponse.json({ success: false, message: '字典类型不存在' }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      data: type,
    });
  }),

  // POST /api/dictionary-types - Create dictionary type
  http.post('/api/dictionary-types', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as CreateDictionaryTypeRequest;

    // Check for duplicate code
    if (mockDictionaryTypes.some((t) => t.code === body.code)) {
      return HttpResponse.json({ success: false, message: '字典类型编码已存在' }, { status: 400 });
    }

    // Check for duplicate name
    if (mockDictionaryTypes.some((t) => t.name === body.name)) {
      return HttpResponse.json({ success: false, message: '字典类型名称已存在' }, { status: 400 });
    }

    const newType = generateDictionaryType({
      ...body,
      id: generateUUID(),
      sort: body.sort ?? mockDictionaryTypes.length + 1,
    });

    mockDictionaryTypes.push(newType);
    mockDictionaryItems[newType.id] = [];

    return HttpResponse.json({
      success: true,
      data: newType,
      message: '字典类型创建成功',
    });
  }),

  // PUT /api/dictionary-types/:id - Update dictionary type
  http.put('/api/dictionary-types/:id', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as UpdateDictionaryTypeRequest;

    const index = mockDictionaryTypes.findIndex((t) => t.id === id);
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '字典类型不存在' }, { status: 404 });
    }

    // Check for duplicate name (excluding self)
    if (body.name && mockDictionaryTypes.some((t) => t.name === body.name && t.id !== id)) {
      return HttpResponse.json({ success: false, message: '字典类型名称已存在' }, { status: 400 });
    }

    mockDictionaryTypes[index] = {
      ...mockDictionaryTypes[index],
      ...body,
      updatedAt: now(),
    };

    return HttpResponse.json({
      success: true,
      data: mockDictionaryTypes[index],
      message: '字典类型更新成功',
    });
  }),

  // DELETE /api/dictionary-types/:id - Delete dictionary type
  http.delete('/api/dictionary-types/:id', async ({ params }) => {
    await delay(300);

    const { id } = params;
    const type = mockDictionaryTypes.find((t) => t.id === id);

    if (!type) {
      return HttpResponse.json({ success: false, message: '字典类型不存在' }, { status: 404 });
    }

    // Check if type is system type
    if (type.isSystem) {
      return HttpResponse.json(
        { success: false, message: '系统字典类型不允许删除' },
        { status: 400 }
      );
    }

    // Check if type has items
    const items = mockDictionaryItems[type.id] || [];
    if (items.length > 0) {
      return HttpResponse.json(
        { success: false, message: '该字典类型下存在字典项，请先删除所有字典项' },
        { status: 400 }
      );
    }

    // Check if type is referenced by attributes
    const isReferenced = Object.values(mockAttributes).some((attrs) =>
      attrs.some((attr) => attr.dictionaryTypeId === id)
    );
    if (isReferenced) {
      return HttpResponse.json(
        { success: false, message: '该字典类型已被属性引用，无法删除' },
        { status: 400 }
      );
    }

    mockDictionaryTypes = mockDictionaryTypes.filter((t) => t.id !== id);
    delete mockDictionaryItems[id as string];

    return HttpResponse.json({
      success: true,
      message: '字典类型删除成功',
    });
  }),
];

// ============================================================================
// Dictionary Item Handlers (T013)
// ============================================================================

const dictionaryItemHandlers = [
  // GET /api/dictionary-types/:typeId/items - List items for a type
  http.get('/api/dictionary-types/:typeId/items', async ({ params, request }) => {
    await delay(300);

    const { typeId } = params;
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as 'active' | 'inactive' | null;
    const search = url.searchParams.get('search');

    const items = mockDictionaryItems[typeId as string] || [];
    let filtered = [...items];

    // Apply status filter
    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(searchLower) || i.code.toLowerCase().includes(searchLower)
      );
    }

    // Sort by sort field
    filtered.sort((a, b) => a.sort - b.sort);

    return HttpResponse.json({
      success: true,
      data: filtered,
    });
  }),

  // POST /api/dictionary-types/:typeId/items - Create item
  http.post('/api/dictionary-types/:typeId/items', async ({ params, request }) => {
    await delay(400);

    const { typeId } = params;
    const body = (await request.json()) as CreateDictionaryItemRequest;

    // Check type exists
    const type = mockDictionaryTypes.find((t) => t.id === typeId);
    if (!type) {
      return HttpResponse.json({ success: false, message: '字典类型不存在' }, { status: 404 });
    }

    const items = mockDictionaryItems[typeId as string] || [];

    // Check for duplicate name within type
    if (items.some((i) => i.name === body.name)) {
      return HttpResponse.json(
        { success: false, message: '该字典类型下名称已存在' },
        { status: 400 }
      );
    }

    // Check for duplicate code within type
    if (items.some((i) => i.code === body.code)) {
      return HttpResponse.json(
        { success: false, message: '该字典类型下编码已存在' },
        { status: 400 }
      );
    }

    const newItem = generateDictionaryItem(typeId as string, {
      ...body,
      id: generateUUID(),
      sort: body.sort ?? items.length + 1,
    });

    if (!mockDictionaryItems[typeId as string]) {
      mockDictionaryItems[typeId as string] = [];
    }
    mockDictionaryItems[typeId as string].push(newItem);

    // Update type itemCount
    const typeIndex = mockDictionaryTypes.findIndex((t) => t.id === typeId);
    if (typeIndex !== -1) {
      mockDictionaryTypes[typeIndex].itemCount = mockDictionaryItems[typeId as string].length;
    }

    return HttpResponse.json({
      success: true,
      data: newItem,
      message: '字典项创建成功',
    });
  }),

  // PUT /api/dictionary-items/:id - Update item
  http.put('/api/dictionary-items/:id', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as UpdateDictionaryItemRequest;

    // Find item across all types
    let foundTypeId: string | null = null;
    let foundIndex: number = -1;

    for (const [typeId, items] of Object.entries(mockDictionaryItems)) {
      const index = items.findIndex((i) => i.id === id);
      if (index !== -1) {
        foundTypeId = typeId;
        foundIndex = index;
        break;
      }
    }

    if (!foundTypeId || foundIndex === -1) {
      return HttpResponse.json({ success: false, message: '字典项不存在' }, { status: 404 });
    }

    const items = mockDictionaryItems[foundTypeId];

    // Check for duplicate name (excluding self)
    if (body.name && items.some((i) => i.name === body.name && i.id !== id)) {
      return HttpResponse.json(
        { success: false, message: '该字典类型下名称已存在' },
        { status: 400 }
      );
    }

    mockDictionaryItems[foundTypeId][foundIndex] = {
      ...mockDictionaryItems[foundTypeId][foundIndex],
      ...body,
      updatedAt: now(),
    };

    return HttpResponse.json({
      success: true,
      data: mockDictionaryItems[foundTypeId][foundIndex],
      message: '字典项更新成功',
    });
  }),

  // DELETE /api/dictionary-items/:id - Delete item
  http.delete('/api/dictionary-items/:id', async ({ params }) => {
    await delay(300);

    const { id } = params;

    // Find item across all types
    let foundTypeId: string | null = null;

    for (const [typeId, items] of Object.entries(mockDictionaryItems)) {
      const index = items.findIndex((i) => i.id === id);
      if (index !== -1) {
        foundTypeId = typeId;
        mockDictionaryItems[typeId] = items.filter((i) => i.id !== id);
        break;
      }
    }

    if (!foundTypeId) {
      return HttpResponse.json({ success: false, message: '字典项不存在' }, { status: 404 });
    }

    // Update type itemCount
    const typeIndex = mockDictionaryTypes.findIndex((t) => t.id === foundTypeId);
    if (typeIndex !== -1) {
      mockDictionaryTypes[typeIndex].itemCount = mockDictionaryItems[foundTypeId].length;
    }

    return HttpResponse.json({
      success: true,
      message: '字典项删除成功',
    });
  }),

  // POST /api/dictionary-items/batch-update-sort - Batch update sort order
  http.post('/api/dictionary-items/batch-update-sort', async ({ request }) => {
    await delay(300);

    const body = (await request.json()) as BatchUpdateSortRequest;

    for (const update of body.updates) {
      // Find and update item across all types
      for (const items of Object.values(mockDictionaryItems)) {
        const item = items.find((i) => i.id === update.id);
        if (item) {
          item.sort = update.sort;
          item.updatedAt = now();
          break;
        }
      }
    }

    return HttpResponse.json({
      success: true,
      message: '排序更新成功',
    });
  }),
];

// ============================================================================
// Attribute Template Handlers (T014)
// ============================================================================

const attributeTemplateHandlers = [
  // GET /api/attribute-templates - List templates
  http.get('/api/attribute-templates', async ({ request }) => {
    await delay(300);

    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const isActive = url.searchParams.get('isActive');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let filtered = [...mockAttributeTemplates];

    if (categoryId) {
      filtered = filtered.filter((t) => t.categoryId === categoryId);
    }

    if (isActive !== null) {
      filtered = filtered.filter((t) => t.isActive === (isActive === 'true'));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        data: paginatedData,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  }),

  // GET /api/attribute-templates/:id - Get single template
  http.get('/api/attribute-templates/:id', async ({ params }) => {
    await delay(200);

    const { id } = params;
    const template = mockAttributeTemplates.find((t) => t.id === id);

    if (!template) {
      return HttpResponse.json({ success: false, message: '属性模板不存在' }, { status: 404 });
    }

    // Include attributes
    const attributes = mockAttributes[template.id] || [];

    return HttpResponse.json({
      success: true,
      data: {
        ...template,
        attributes,
      },
    });
  }),

  // GET /api/attribute-templates/by-category/:categoryId - Get template by category
  http.get('/api/attribute-templates/by-category/:categoryId', async ({ params }) => {
    await delay(200);

    const { categoryId } = params;
    const template = mockAttributeTemplates.find((t) => t.categoryId === categoryId && t.isActive);

    if (!template) {
      return HttpResponse.json({
        success: true,
        data: null,
      });
    }

    const attributes = mockAttributes[template.id] || [];

    return HttpResponse.json({
      success: true,
      data: {
        ...template,
        attributes,
      },
    });
  }),

  // POST /api/attribute-templates - Create template
  http.post('/api/attribute-templates', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as CreateAttributeTemplateRequest;

    // Check if category already has a template
    if (mockAttributeTemplates.some((t) => t.categoryId === body.categoryId)) {
      return HttpResponse.json(
        { success: false, message: '该类目已存在属性模板' },
        { status: 400 }
      );
    }

    const newTemplate = generateAttributeTemplate({
      ...body,
      id: generateUUID(),
    });

    mockAttributeTemplates.push(newTemplate);
    mockAttributes[newTemplate.id] = [];

    return HttpResponse.json({
      success: true,
      data: newTemplate,
      message: '属性模板创建成功',
    });
  }),

  // PUT /api/attribute-templates/:id - Update template
  http.put('/api/attribute-templates/:id', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as UpdateAttributeTemplateRequest;

    const index = mockAttributeTemplates.findIndex((t) => t.id === id);
    if (index === -1) {
      return HttpResponse.json({ success: false, message: '属性模板不存在' }, { status: 404 });
    }

    mockAttributeTemplates[index] = {
      ...mockAttributeTemplates[index],
      ...body,
      updatedAt: now(),
      version: mockAttributeTemplates[index].version + 1,
    };

    return HttpResponse.json({
      success: true,
      data: mockAttributeTemplates[index],
      message: '属性模板更新成功',
    });
  }),

  // DELETE /api/attribute-templates/:id - Delete template
  http.delete('/api/attribute-templates/:id', async ({ params }) => {
    await delay(300);

    const { id } = params;
    const template = mockAttributeTemplates.find((t) => t.id === id);

    if (!template) {
      return HttpResponse.json({ success: false, message: '属性模板不存在' }, { status: 404 });
    }

    mockAttributeTemplates = mockAttributeTemplates.filter((t) => t.id !== id);
    delete mockAttributes[id as string];

    return HttpResponse.json({
      success: true,
      message: '属性模板删除成功',
    });
  }),

  // POST /api/attribute-templates/:id/copy - Copy template to another category
  http.post('/api/attribute-templates/:id/copy', async ({ params, request }) => {
    await delay(500);

    const { id } = params;
    const body = (await request.json()) as { targetCategoryId: string; newName: string };

    const sourceTemplate = mockAttributeTemplates.find((t) => t.id === id);
    if (!sourceTemplate) {
      return HttpResponse.json({ success: false, message: '源属性模板不存在' }, { status: 404 });
    }

    // Check if target category already has a template
    if (mockAttributeTemplates.some((t) => t.categoryId === body.targetCategoryId)) {
      return HttpResponse.json(
        { success: false, message: '目标类目已存在属性模板' },
        { status: 400 }
      );
    }

    // Create new template
    const newTemplate = generateAttributeTemplate({
      categoryId: body.targetCategoryId,
      name: body.newName,
      id: generateUUID(),
    });

    mockAttributeTemplates.push(newTemplate);

    // Copy attributes with conflict resolution
    const sourceAttributes = mockAttributes[sourceTemplate.id] || [];
    const newAttributes: Attribute[] = sourceAttributes.map((attr) => ({
      ...attr,
      id: generateUUID(),
      templateId: newTemplate.id,
      createdAt: now(),
      updatedAt: now(),
    }));

    mockAttributes[newTemplate.id] = newAttributes;

    return HttpResponse.json({
      success: true,
      data: {
        ...newTemplate,
        attributes: newAttributes,
      },
      message: '属性模板复制成功',
    });
  }),
];

// ============================================================================
// Attribute Handlers (T015)
// ============================================================================

const attributeHandlers = [
  // GET /api/attribute-templates/:templateId/attributes - List attributes
  http.get('/api/attribute-templates/:templateId/attributes', async ({ params }) => {
    await delay(200);

    const { templateId } = params;
    const attributes = mockAttributes[templateId as string] || [];

    // Sort by sort field
    const sorted = [...attributes].sort((a, b) => a.sort - b.sort);

    return HttpResponse.json({
      success: true,
      data: sorted,
    });
  }),

  // POST /api/attributes - Create attribute
  http.post('/api/attributes', async ({ request }) => {
    await delay(400);

    const body = (await request.json()) as CreateAttributeRequest;

    // Check template exists
    const template = mockAttributeTemplates.find((t) => t.id === body.templateId);
    if (!template) {
      return HttpResponse.json({ success: false, message: '属性模板不存在' }, { status: 404 });
    }

    const attributes = mockAttributes[body.templateId] || [];

    // Check for duplicate name within template
    if (attributes.some((a) => a.name === body.name)) {
      return HttpResponse.json(
        { success: false, message: '该模板下属性名称已存在' },
        { status: 400 }
      );
    }

    // Check for duplicate code within template
    if (attributes.some((a) => a.code === body.code)) {
      return HttpResponse.json(
        { success: false, message: '该模板下属性编码已存在' },
        { status: 400 }
      );
    }

    // Validate select type has dictionary or custom values
    if (
      (body.type === 'single-select' || body.type === 'multi-select') &&
      !body.dictionaryTypeId &&
      (!body.customValues || body.customValues.length === 0)
    ) {
      return HttpResponse.json(
        { success: false, message: '单选/多选类型必须配置来源字典或自定义值' },
        { status: 400 }
      );
    }

    const newAttribute = generateAttribute(body.templateId, {
      ...body,
      id: generateUUID(),
      sort: body.sort ?? attributes.length + 1,
    });

    if (!mockAttributes[body.templateId]) {
      mockAttributes[body.templateId] = [];
    }
    mockAttributes[body.templateId].push(newAttribute);

    return HttpResponse.json({
      success: true,
      data: newAttribute,
      message: '属性创建成功',
    });
  }),

  // PUT /api/attributes/:id - Update attribute
  http.put('/api/attributes/:id', async ({ params, request }) => {
    await delay(300);

    const { id } = params;
    const body = (await request.json()) as UpdateAttributeRequest;

    // Find attribute across all templates
    let foundTemplateId: string | null = null;
    let foundIndex: number = -1;
    let existingAttribute: Attribute | null = null;

    for (const [templateId, attrs] of Object.entries(mockAttributes)) {
      const index = attrs.findIndex((a) => a.id === id);
      if (index !== -1) {
        foundTemplateId = templateId;
        foundIndex = index;
        existingAttribute = attrs[index];
        break;
      }
    }

    if (!foundTemplateId || foundIndex === -1 || !existingAttribute) {
      return HttpResponse.json({ success: false, message: '属性不存在' }, { status: 404 });
    }

    // Note: Type change prevention would be checked here in real implementation
    // For mock, we'll just allow updates

    mockAttributes[foundTemplateId][foundIndex] = {
      ...existingAttribute,
      ...body,
      updatedAt: now(),
    };

    return HttpResponse.json({
      success: true,
      data: mockAttributes[foundTemplateId][foundIndex],
      message: '属性更新成功',
    });
  }),

  // DELETE /api/attributes/:id - Delete attribute
  http.delete('/api/attributes/:id', async ({ params }) => {
    await delay(300);

    const { id } = params;

    // Find attribute across all templates
    let foundTemplateId: string | null = null;

    for (const [templateId, attrs] of Object.entries(mockAttributes)) {
      const index = attrs.findIndex((a) => a.id === id);
      if (index !== -1) {
        foundTemplateId = templateId;
        mockAttributes[templateId] = attrs.filter((a) => a.id !== id);
        break;
      }
    }

    if (!foundTemplateId) {
      return HttpResponse.json({ success: false, message: '属性不存在' }, { status: 404 });
    }

    return HttpResponse.json({
      success: true,
      message: '属性删除成功',
    });
  }),
];

// ============================================================================
// Export all handlers
// ============================================================================

export const attributeHandlers_ = [
  ...dictionaryTypeHandlers,
  ...dictionaryItemHandlers,
  ...attributeTemplateHandlers,
  ...attributeHandlers,
];

export default attributeHandlers_;
