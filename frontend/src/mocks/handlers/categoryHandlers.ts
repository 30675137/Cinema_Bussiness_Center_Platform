import { http, HttpResponse } from 'msw';
import {
  generateCategoryTree,
  getAllCategories,
  getCategoryById,
  getCategoryChildren,
  searchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAttributeTemplateByCategoryId,
  saveAttributeTemplate,
  addAttributeToTemplate,
  updateAttributeInTemplate,
  deleteAttributeFromTemplate
} from '../data/categoryMockData';
import type { Category, CategoryTree, CreateCategoryRequest, UpdateCategoryRequest, CategoryAttribute } from '@/types/category';

// 基础API延迟模拟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 类目相关API处理器
 * 基于 OpenAPI 规范实现
 */
export const categoryHandlers = [
  // 获取类目树
  http.get('/api/categories/tree', async ({ request }) => {
    try {
      await delay(300);
      const url = new URL(request.url);
      const lazy = url.searchParams.get('lazy') !== 'false';
      
      console.log('[MSW] Getting category tree, lazy:', lazy);
      const tree = generateCategoryTree(lazy);
      console.log('[MSW] Generated tree:', tree);

      return HttpResponse.json({
        success: true,
        data: tree,
        message: '获取成功',
        code: 200,
      });
    } catch (error) {
      console.error('[MSW] Error generating category tree:', error);
      return HttpResponse.json(
        {
          success: false,
          data: [],
          message: error instanceof Error ? error.message : '获取类目树失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),

  // 获取类目列表
  http.get('/api/categories', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const params = {
      page: parseInt(url.searchParams.get('page') || '1'),
      pageSize: parseInt(url.searchParams.get('pageSize') || '20'),
      keyword: url.searchParams.get('keyword') || undefined,
      status: url.searchParams.get('status') as 'active' | 'inactive' | undefined,
      level: url.searchParams.get('level') ? parseInt(url.searchParams.get('level')!) : undefined,
      parentId: url.searchParams.get('parentId') || undefined,
    };

    const allCategories = getAllCategories();
    let filtered = allCategories;

    // 应用筛选条件
    if (params.keyword) {
      filtered = searchCategories(params.keyword);
    }
    if (params.status) {
      filtered = filtered.filter(cat => cat.status === params.status);
    }
    if (params.level) {
      filtered = filtered.filter(cat => cat.level === params.level);
    }
    if (params.parentId) {
      filtered = filtered.filter(cat => cat.parentId === params.parentId);
    }

    // 分页
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        list: paginatedData,
        total: filtered.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(filtered.length / params.pageSize),
      },
      message: '获取成功',
      code: 200,
    });
  }),

  // 获取类目详情
  http.get('/api/categories/:id', async ({ params }) => {
    await delay(300);
    const category = getCategoryById(params.id as string);

    if (!category) {
      return HttpResponse.json(
        {
          success: false,
          message: '类目不存在',
          code: 404,
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: category,
      message: '获取成功',
      code: 200,
    });
  }),

  // 创建类目
  http.post('/api/categories', async ({ request }) => {
    await delay(600);
    try {
      const data = await request.json() as CreateCategoryRequest;
      
      // 验证必填字段
      if (!data.name || data.name.trim() === '') {
        return HttpResponse.json(
          {
            success: false,
            message: '类目名称不能为空',
            code: 400,
          },
          { status: 400 }
        );
      }

      // 确定层级
      let level: 1 | 2 | 3 = 1;
      if (data.parentId) {
        const parent = getCategoryById(data.parentId);
        if (!parent) {
          return HttpResponse.json(
            {
              success: false,
              message: '父类目不存在',
              code: 400,
            },
            { status: 400 }
          );
        }
        level = (parent.level + 1) as 1 | 2 | 3;
        if (level > 3) {
          return HttpResponse.json(
            {
              success: false,
              message: '类目层级不能超过三级',
              code: 400,
            },
            { status: 400 }
          );
        }
      }

      const newCategory = createCategory({
        ...data,
        level,
        status: data.status || 'active',
        sortOrder: data.sortOrder || 0,
      });

      return HttpResponse.json({
        success: true,
        data: newCategory,
        message: '创建成功',
        code: 200,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : '创建失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),

  // 更新类目
  http.put('/api/categories/:id', async ({ params, request }) => {
    await delay(500);
    try {
      const data = await request.json() as UpdateCategoryRequest;
      const id = params.id as string;

      if (!getCategoryById(id)) {
        return HttpResponse.json(
          {
            success: false,
            message: '类目不存在',
            code: 404,
          },
          { status: 404 }
        );
      }

      // 验证名称
      if (data.name && data.name.trim() === '') {
        return HttpResponse.json(
          {
            success: false,
            message: '类目名称不能为空',
            code: 400,
          },
          { status: 400 }
        );
      }

      const updatedCategory = updateCategory(id, data);

      return HttpResponse.json({
        success: true,
        data: updatedCategory,
        message: '更新成功',
        code: 200,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : '更新失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),

  // 删除类目
  http.delete('/api/categories/:id', async ({ params }) => {
    await delay(400);
    const id = params.id as string;
    const category = getCategoryById(id);

    if (!category) {
      return HttpResponse.json(
        {
          success: false,
          message: '类目不存在',
          code: 404,
        },
        { status: 404 }
      );
    }

    // 检查是否被SPU使用
    if (category.spuCount > 0) {
      return HttpResponse.json(
        {
          success: false,
          message: '该类目已有 SPU 使用，不可删除',
          code: 400,
        },
        { status: 400 }
      );
    }

    // 检查是否有子类目
    const children = getCategoryChildren(id);
    if (children.length > 0) {
      return HttpResponse.json(
        {
          success: false,
          message: '无法删除包含子类目的类目',
          code: 400,
        },
        { status: 400 }
      );
    }

    const success = deleteCategory(id);
    if (!success) {
      return HttpResponse.json(
        {
          success: false,
          message: '删除失败',
          code: 500,
        },
        { status: 500 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: '删除成功',
      code: 200,
    });
  }),

  // 获取子类目列表（懒加载）
  http.get('/api/categories/:id/children', async ({ params }) => {
    await delay(300);
    const parentId = params.id as string;
    const children = getCategoryChildren(parentId);

    return HttpResponse.json({
      success: true,
      data: children,
      message: '获取成功',
      code: 200,
    });
  }),

  // 搜索类目
  http.get('/api/categories/search', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword');

    if (!keyword || keyword.trim() === '') {
      return HttpResponse.json(
        {
          success: false,
          message: '搜索关键词不能为空',
          code: 400,
        },
        { status: 400 }
      );
    }

    const results = searchCategories(keyword);

    return HttpResponse.json({
      success: true,
      data: results,
      message: '搜索成功',
      code: 200,
    });
  }),

  // 更新类目状态
  http.put('/api/categories/:id/status', async ({ params, request }) => {
    await delay(400);
    try {
      const id = params.id as string;
      const data = await request.json() as { status: 'active' | 'inactive' };

      if (!data.status) {
        return HttpResponse.json(
          {
            success: false,
            message: '状态参数不能为空',
            code: 400,
          },
          { status: 400 }
        );
      }

      const category = getCategoryById(id);
      if (!category) {
        return HttpResponse.json(
          {
            success: false,
            message: '类目不存在',
            code: 404,
          },
          { status: 404 }
        );
      }

      const updatedCategory = updateCategory(id, { status: data.status });

      return HttpResponse.json({
        success: true,
        data: updatedCategory,
        message: '状态更新成功',
        code: 200,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : '状态更新失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),

  // 获取类目的属性模板
  http.get('/api/attribute-templates/:categoryId', async ({ params }) => {
    await delay(300);
    const categoryId = params.categoryId as string;
    const template = getAttributeTemplateByCategoryId(categoryId);

    if (!template) {
      return HttpResponse.json({
        success: true,
        data: null,
        message: '属性模板不存在',
        code: 404,
      });
    }

    return HttpResponse.json({
      success: true,
      data: template,
      message: '获取成功',
      code: 200,
    });
  }),

  // 保存属性模板（创建或更新）
  http.post('/api/attribute-templates/:categoryId', async ({ params, request }) => {
    await delay(500);
    try {
      const categoryId = params.categoryId as string;
      const data = await request.json() as { attributes: CategoryAttribute[] };

      if (!data.attributes || !Array.isArray(data.attributes)) {
        return HttpResponse.json(
          {
            success: false,
            message: '属性列表不能为空',
            code: 400,
          },
          { status: 400 }
        );
      }

      // 验证属性
      for (const attr of data.attributes) {
        if (!attr.name || attr.name.trim() === '') {
          return HttpResponse.json(
            {
              success: false,
              message: '属性名称不能为空',
              code: 400,
            },
            { status: 400 }
          );
        }
        if ((attr.type === 'single-select' || attr.type === 'multi-select') && 
            (!attr.optionalValues || attr.optionalValues.length === 0)) {
          return HttpResponse.json(
            {
              success: false,
              message: `${attr.type} 类型必须提供可选值`,
              code: 400,
            },
            { status: 400 }
          );
        }
      }

      const template = saveAttributeTemplate(categoryId, data.attributes);

      return HttpResponse.json({
        success: true,
        data: template,
        message: '保存成功',
        code: 200,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : '保存失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),

  // 添加属性到模板
  http.post('/api/attribute-templates/:categoryId/attributes', async ({ params, request }) => {
    await delay(400);
    try {
      const categoryId = params.categoryId as string;
      const attribute = await request.json() as Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>;

      if (!attribute.name || attribute.name.trim() === '') {
        return HttpResponse.json(
          {
            success: false,
            message: '属性名称不能为空',
            code: 400,
          },
          { status: 400 }
        );
      }

      const template = addAttributeToTemplate(categoryId, attribute);

      return HttpResponse.json({
        success: true,
        data: template,
        message: '添加成功',
        code: 200,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : '添加失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),

  // 更新模板中的属性
  http.put('/api/attribute-templates/:categoryId/attributes/:attributeId', async ({ params, request }) => {
    await delay(400);
    try {
      const categoryId = params.categoryId as string;
      const attributeId = params.attributeId as string;
      const updates = await request.json() as Partial<CategoryAttribute>;

      const template = updateAttributeInTemplate(categoryId, attributeId, updates);

      return HttpResponse.json({
        success: true,
        data: template,
        message: '更新成功',
        code: 200,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : '更新失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),

  // 从模板中删除属性
  http.delete('/api/attribute-templates/:categoryId/attributes/:attributeId', async ({ params }) => {
    await delay(400);
    try {
      const categoryId = params.categoryId as string;
      const attributeId = params.attributeId as string;

      const template = deleteAttributeFromTemplate(categoryId, attributeId);

      return HttpResponse.json({
        success: true,
        data: template,
        message: '删除成功',
        code: 200,
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: error instanceof Error ? error.message : '删除失败',
          code: 500,
        },
        { status: 500 }
      );
    }
  }),
];

