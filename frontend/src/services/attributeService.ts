import type {
  AttributeTemplate,
  AttributeTemplateItem,
  AttributeTemplateQueryParams,
  AttributeTemplateListResponse,
  AttributeTemplateOperationResponse,
  AttributeTemplateForm,
} from '@/types/spu';
import type {
  AttributeTemplate as CategoryAttributeTemplate,
  CategoryAttribute,
} from '@/types/category';

// API 响应类型定义
interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  code: number;
  timestamp?: number;
}

// 模拟数据
const generateMockTemplates = (): AttributeTemplate[] => {
  return [
    {
      id: 'template_001',
      name: '服装基础属性模板',
      code: 'clothing_basic',
      description: '适用于服装类商品的基础属性模板，包含尺码、颜色、材质等常用属性',
      categoryId: 'cat_001',
      categoryName: '服装',
      status: 'active',
      isSystem: false,
      attributes: [
        {
          id: 'attr_001',
          name: '尺码',
          code: 'size',
          type: 'select',
          required: true,
          defaultValue: 'M',
          description: '商品尺码',
          options: [
            { id: 'opt_001', label: 'XS', value: 'xs', sort: 1, status: 'active' },
            { id: 'opt_002', label: 'S', value: 's', sort: 2, status: 'active' },
            { id: 'opt_003', label: 'M', value: 'm', sort: 3, status: 'active' },
            { id: 'opt_004', label: 'L', value: 'l', sort: 4, status: 'active' },
            { id: 'opt_005', label: 'XL', value: 'xl', sort: 5, status: 'active' },
            { id: 'opt_006', label: 'XXL', value: 'xxl', sort: 6, status: 'active' },
          ],
          group: '基础属性',
          sort: 1,
          status: 'active',
        },
        {
          id: 'attr_002',
          name: '颜色',
          code: 'color',
          type: 'multiselect',
          required: true,
          description: '商品颜色',
          options: [
            { id: 'opt_007', label: '红色', value: 'red', sort: 1, status: 'active' },
            { id: 'opt_008', label: '蓝色', value: 'blue', sort: 2, status: 'active' },
            { id: 'opt_009', label: '黑色', value: 'black', sort: 3, status: 'active' },
            { id: 'opt_010', label: '白色', value: 'white', sort: 4, status: 'active' },
            { id: 'opt_011', label: '灰色', value: 'gray', sort: 5, status: 'active' },
          ],
          group: '基础属性',
          sort: 2,
          status: 'active',
        },
        {
          id: 'attr_003',
          name: '材质',
          code: 'material',
          type: 'select',
          required: false,
          description: '主要材质成分',
          options: [
            { id: 'opt_012', label: '纯棉', value: 'cotton', sort: 1, status: 'active' },
            { id: 'opt_013', label: '涤纶', value: 'polyester', sort: 2, status: 'active' },
            { id: 'opt_014', label: '混纺', value: 'blend', sort: 3, status: 'active' },
            { id: 'opt_015', label: '羊毛', value: 'wool', sort: 4, status: 'active' },
            { id: 'opt_016', label: '丝绸', value: 'silk', sort: 5, status: 'active' },
          ],
          group: '材质属性',
          sort: 3,
          status: 'active',
        },
      ],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T15:45:00Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'template_002',
      name: '电子产品属性模板',
      code: 'electronics_basic',
      description: '适用于电子产品的基础属性模板，包含型号、规格、保修等',
      categoryId: 'cat_002',
      categoryName: '电子产品',
      status: 'active',
      isSystem: false,
      attributes: [
        {
          id: 'attr_004',
          name: '型号',
          code: 'model',
          type: 'text',
          required: true,
          description: '产品型号',
          validation: { minLength: 1, maxLength: 50 },
          group: '基础属性',
          sort: 1,
          status: 'active',
        },
        {
          id: 'attr_005',
          name: '保修期',
          code: 'warranty',
          type: 'number',
          required: true,
          defaultValue: 12,
          description: '保修期（月）',
          validation: { min: 1, max: 60 },
          group: '服务属性',
          sort: 2,
          status: 'active',
        },
        {
          id: 'attr_006',
          name: '是否防水',
          code: 'waterproof',
          type: 'boolean',
          required: false,
          defaultValue: false,
          description: '是否支持防水',
          group: '特性属性',
          sort: 3,
          status: 'active',
        },
        {
          id: 'attr_007',
          name: '电压',
          code: 'voltage',
          type: 'select',
          required: false,
          description: '工作电压',
          options: [
            { id: 'opt_017', label: '220V', value: '220v', sort: 1, status: 'active' },
            { id: 'opt_018', label: '110V', value: '110v', sort: 2, status: 'active' },
            { id: 'opt_019', label: '12V', value: '12v', sort: 3, status: 'active' },
            { id: 'opt_020', label: '5V', value: '5v', sort: 4, status: 'active' },
          ],
          group: '技术参数',
          sort: 4,
          status: 'active',
        },
      ],
      createdAt: '2024-01-16T09:20:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'template_003',
      name: '食品基础属性模板',
      code: 'food_basic',
      description: '适用于食品类商品的基础属性模板，包含保质期、成分、产地等',
      categoryId: 'cat_003',
      categoryName: '食品',
      status: 'inactive',
      isSystem: true,
      attributes: [
        {
          id: 'attr_008',
          name: '保质期',
          code: 'shelf_life',
          type: 'number',
          required: true,
          description: '保质期（天）',
          validation: { min: 1 },
          group: '基础属性',
          sort: 1,
          status: 'active',
        },
        {
          id: 'attr_009',
          name: '产地',
          code: 'origin',
          type: 'text',
          required: true,
          description: '商品产地',
          validation: { minLength: 2, maxLength: 50 },
          group: '基础属性',
          sort: 2,
          status: 'active',
        },
        {
          id: 'attr_010',
          name: '净含量',
          code: 'net_weight',
          type: 'number',
          required: true,
          description: '净含量（克）',
          validation: { min: 1 },
          group: '规格属性',
          sort: 3,
          status: 'active',
        },
      ],
      createdAt: '2024-01-10T08:15:00Z',
      updatedAt: '2024-01-10T08:15:00Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ];
};

class AttributeTemplateService {
  private templates: AttributeTemplate[] = generateMockTemplates();

  /**
   * 获取属性模板列表
   */
  async getTemplateList(
    params?: AttributeTemplateQueryParams
  ): Promise<AttributeTemplateListResponse> {
    try {
      // 模拟API延迟
      await new Promise((resolve) => setTimeout(resolve, 500));

      let filteredTemplates = [...this.templates];

      // 关键词搜索
      if (params?.keyword) {
        const keyword = params.keyword.toLowerCase();
        filteredTemplates = filteredTemplates.filter(
          (template) =>
            template.name.toLowerCase().includes(keyword) ||
            template.code.toLowerCase().includes(keyword) ||
            template.description?.toLowerCase().includes(keyword)
        );
      }

      // 分类筛选
      if (params?.categoryId) {
        filteredTemplates = filteredTemplates.filter(
          (template) => template.categoryId === params.categoryId
        );
      }

      // 状态筛选
      if (params?.status) {
        filteredTemplates = filteredTemplates.filter(
          (template) => template.status === params.status
        );
      }

      // 系统模板筛选
      if (params?.isSystem !== undefined) {
        filteredTemplates = filteredTemplates.filter(
          (template) => template.isSystem === params.isSystem
        );
      }

      // 排序
      filteredTemplates.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      // 分页处理
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const total = filteredTemplates.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const list = filteredTemplates.slice(startIndex, startIndex + pageSize);

      return {
        list,
        pagination: {
          current: page,
          pageSize,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error('Get template list error:', error);
      throw new Error('获取属性模板列表失败');
    }
  }

  /**
   * 根据ID获取属性模板详情
   */
  async getTemplateById(id: string): Promise<AttributeTemplate> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const template = this.templates.find((t) => t.id === id);
      if (!template) {
        throw new Error('属性模板不存在');
      }

      return template;
    } catch (error) {
      console.error('Get template by ID error:', error);
      throw new Error('获取属性模板详情失败');
    }
  }

  /**
   * 根据编码获取属性模板
   */
  async getTemplateByCode(code: string): Promise<AttributeTemplate | null> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const template = this.templates.find((t) => t.code === code);
      return template || null;
    } catch (error) {
      console.error('Get template by code error:', error);
      throw new Error('根据编码获取属性模板失败');
    }
  }

  /**
   * 根据分类ID获取属性模板
   */
  async getTemplatesByCategory(categoryId: string): Promise<AttributeTemplate[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return this.templates.filter(
        (template) => template.categoryId === categoryId && template.status === 'active'
      );
    } catch (error) {
      console.error('Get templates by category error:', error);
      throw new Error('根据分类获取属性模板失败');
    }
  }

  /**
   * 创建属性模板
   */
  async createTemplate(data: AttributeTemplateForm): Promise<AttributeTemplateOperationResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 检查编码唯一性
      const existingTemplate = this.templates.find((t) => t.code === data.code);
      if (existingTemplate) {
        return {
          success: false,
          message: '模板编码已存在',
        };
      }

      const newTemplate: AttributeTemplate = {
        id: `template_${Date.now()}`,
        ...data,
        attributes: data.attributes.map((attr, index) => ({
          ...attr,
          id: `attr_${Date.now()}_${index}`,
          sort: index + 1,
        })),
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user',
        updatedBy: 'current_user',
      };

      this.templates.push(newTemplate);

      return {
        success: true,
        data: newTemplate,
        message: '创建属性模板成功',
      };
    } catch (error) {
      console.error('Create template error:', error);
      return {
        success: false,
        message: '创建属性模板失败',
      };
    }
  }

  /**
   * 更新属性模板
   */
  async updateTemplate(
    id: string,
    data: Partial<AttributeTemplateForm>
  ): Promise<AttributeTemplateOperationResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const templateIndex = this.templates.findIndex((t) => t.id === id);
      if (templateIndex === -1) {
        return {
          success: false,
          message: '属性模板不存在',
        };
      }

      const template = this.templates[templateIndex];

      // 检查系统模板是否可编辑
      if (template.isSystem) {
        return {
          success: false,
          message: '系统模板不能编辑',
        };
      }

      // 检查编码唯一性（如果编码有变化）
      if (data.code && data.code !== template.code) {
        const existingTemplate = this.templates.find((t) => t.code === data.code);
        if (existingTemplate) {
          return {
            success: false,
            message: '模板编码已存在',
          };
        }
      }

      const updatedTemplate: AttributeTemplate = {
        ...template,
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current_user',
      };

      this.templates[templateIndex] = updatedTemplate;

      return {
        success: true,
        data: updatedTemplate,
        message: '更新属性模板成功',
      };
    } catch (error) {
      console.error('Update template error:', error);
      return {
        success: false,
        message: '更新属性模板失败',
      };
    }
  }

  /**
   * 删除属性模板
   */
  async deleteTemplate(id: string): Promise<AttributeTemplateOperationResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const templateIndex = this.templates.findIndex((t) => t.id === id);
      if (templateIndex === -1) {
        return {
          success: false,
          message: '属性模板不存在',
        };
      }

      const template = this.templates[templateIndex];

      // 检查系统模板是否可删除
      if (template.isSystem) {
        return {
          success: false,
          message: '系统模板不能删除',
        };
      }

      this.templates.splice(templateIndex, 1);

      return {
        success: true,
        message: '删除属性模板成功',
      };
    } catch (error) {
      console.error('Delete template error:', error);
      return {
        success: false,
        message: '删除属性模板失败',
      };
    }
  }

  /**
   * 复制属性模板
   */
  async copyTemplate(id: string, newName?: string): Promise<AttributeTemplateOperationResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const originalTemplate = this.templates.find((t) => t.id === id);
      if (!originalTemplate) {
        return {
          success: false,
          message: '源属性模板不存在',
        };
      }

      const newTemplate: AttributeTemplate = {
        ...originalTemplate,
        id: `template_${Date.now()}`,
        name: newName || `${originalTemplate.name}_副本`,
        code: `${originalTemplate.code}_copy_${Date.now()}`,
        isSystem: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user',
        updatedBy: 'current_user',
      };

      this.templates.push(newTemplate);

      return {
        success: true,
        data: newTemplate,
        message: '复制属性模板成功',
      };
    } catch (error) {
      console.error('Copy template error:', error);
      return {
        success: false,
        message: '复制属性模板失败',
      };
    }
  }

  /**
   * 切换属性模板状态
   */
  async toggleTemplateStatus(id: string): Promise<AttributeTemplateOperationResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const templateIndex = this.templates.findIndex((t) => t.id === id);
      if (templateIndex === -1) {
        return {
          success: false,
          message: '属性模板不存在',
        };
      }

      const template = this.templates[templateIndex];

      // 系统模板不能停用
      if (template.isSystem && template.status === 'active') {
        return {
          success: false,
          message: '系统模板不能停用',
        };
      }

      this.templates[templateIndex] = {
        ...template,
        status: template.status === 'active' ? 'inactive' : 'active',
        updatedAt: new Date().toISOString(),
        updatedBy: 'current_user',
      };

      return {
        success: true,
        message: `${template.status === 'active' ? '停用' : '启用'}属性模板成功`,
      };
    } catch (error) {
      console.error('Toggle template status error:', error);
      return {
        success: false,
        message: '切换属性模板状态失败',
      };
    }
  }

  /**
   * 批量删除属性模板
   */
  async batchDeleteTemplates(ids: string[]): Promise<AttributeTemplateOperationResponse> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const results: string[] = [];
      const errors: string[] = [];

      for (const id of ids) {
        const template = this.templates.find((t) => t.id === id);
        if (!template) {
          errors.push(`模板 ${id} 不存在`);
          continue;
        }

        if (template.isSystem) {
          errors.push(`系统模板 "${template.name}" 不能删除`);
          continue;
        }

        const templateIndex = this.templates.findIndex((t) => t.id === id);
        this.templates.splice(templateIndex, 1);
        results.push(template.name);
      }

      if (errors.length > 0) {
        return {
          success: false,
          message: `部分删除失败：${errors.join(', ')}`,
        };
      }

      return {
        success: true,
        message: `成功删除 ${results.length} 个属性模板`,
      };
    } catch (error) {
      console.error('Batch delete templates error:', error);
      return {
        success: false,
        message: '批量删除属性模板失败',
      };
    }
  }

  /**
   * 获取所有活跃的属性模板（用于下拉选择）
   */
  async getActiveTemplates(): Promise<AttributeTemplate[]> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return this.templates.filter((template) => template.status === 'active');
    } catch (error) {
      console.error('Get active templates error:', error);
      throw new Error('获取活跃属性模板失败');
    }
  }

  /**
   * 检查模板编码是否可用
   */
  async checkCodeAvailable(code: string, excludeId?: string): Promise<boolean> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const existingTemplate = this.templates.find((t) => t.code === code && t.id !== excludeId);
      return !existingTemplate;
    } catch (error) {
      console.error('Check code available error:', error);
      return false;
    }
  }

  /**
   * 获取模板统计信息
   */
  async getTemplateStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    system: number;
    custom: number;
  }> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const total = this.templates.length;
      const active = this.templates.filter((t) => t.status === 'active').length;
      const inactive = total - active;
      const system = this.templates.filter((t) => t.isSystem).length;
      const custom = total - system;

      return {
        total,
        active,
        inactive,
        system,
        custom,
      };
    } catch (error) {
      console.error('Get template stats error:', error);
      throw new Error('获取模板统计信息失败');
    }
  }
}

// 创建服务实例
export const attributeService = new AttributeTemplateService();

// 类型已在 @/types/spu 中导出，无需重复导出

/**
 * 类目属性模板服务方法
 * 基于 CategoryAttribute 和 AttributeTemplate 类型（data-model.md 规范）
 */
class CategoryAttributeTemplateService {
  private baseUrl = '/api/attribute-templates';
  private templates: Map<string, CategoryAttributeTemplate> = new Map();

  /**
   * 获取类目的属性模板
   * @param categoryId 类目ID
   * @returns 属性模板
   */
  async getAttributeTemplate(
    categoryId: string
  ): Promise<ApiResponse<CategoryAttributeTemplate | null>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 从 Mock 数据中获取
      const template = this.templates.get(categoryId) || null;

      return {
        success: true,
        data: template,
        message: template ? '获取成功' : '属性模板不存在',
        code: template ? 200 : 404,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : '获取失败',
        code: 500,
      };
    }
  }

  /**
   * 创建或更新属性模板
   * @param categoryId 类目ID
   * @param attributes 属性列表
   * @returns 保存后的属性模板
   */
  async saveAttributeTemplate(
    categoryId: string,
    attributes: CategoryAttribute[]
  ): Promise<ApiResponse<CategoryAttributeTemplate>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 验证属性
      for (const attr of attributes) {
        if (!attr.name || attr.name.trim() === '') {
          throw new Error('属性名称不能为空');
        }
        if (!attr.displayName || attr.displayName.trim() === '') {
          throw new Error('显示名称不能为空');
        }
        if (
          (attr.type === 'single-select' || attr.type === 'multi-select') &&
          (!attr.optionalValues || attr.optionalValues.length === 0)
        ) {
          throw new Error(`${attr.type} 类型必须提供可选值`);
        }
      }

      const now = new Date().toISOString();
      const existingTemplate = this.templates.get(categoryId);

      const template: CategoryAttributeTemplate = {
        id: existingTemplate?.id || `template-${Date.now()}`,
        categoryId,
        attributes: attributes.map((attr) => ({
          ...attr,
          createdAt: attr.createdAt || now,
          updatedAt: now,
        })),
        createdAt: existingTemplate?.createdAt || now,
        updatedAt: now,
      };

      this.templates.set(categoryId, template);

      return {
        success: true,
        data: template,
        message: '保存成功',
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '保存失败',
        code: 500,
      };
    }
  }

  /**
   * 添加属性到模板
   * @param categoryId 类目ID
   * @param attribute 属性定义
   * @returns 更新后的属性模板
   */
  async addAttribute(
    categoryId: string,
    attribute: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<CategoryAttributeTemplate>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 验证属性
      if (!attribute.name || attribute.name.trim() === '') {
        return {
          success: false,
          data: null as any,
          message: '属性名称不能为空',
          code: 400,
        };
      }

      if (
        (attribute.type === 'single-select' || attribute.type === 'multi-select') &&
        (!attribute.optionalValues || attribute.optionalValues.length === 0)
      ) {
        return {
          success: false,
          data: null as any,
          message: `${attribute.type} 类型必须提供可选值`,
          code: 400,
        };
      }

      const template = this.templates.get(categoryId);
      if (!template) {
        return {
          success: false,
          data: null as any,
          message: '属性模板不存在，请先创建模板',
          code: 404,
        };
      }

      // 检查属性名称是否重复
      if (template.attributes.some((attr) => attr.name === attribute.name)) {
        return {
          success: false,
          data: null as any,
          message: '属性名称已存在',
          code: 400,
        };
      }

      const now = new Date().toISOString();
      const newAttribute: CategoryAttribute = {
        ...attribute,
        id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
      };

      const updatedTemplate: CategoryAttributeTemplate = {
        ...template,
        attributes: [...template.attributes, newAttribute],
        updatedAt: now,
      };

      this.templates.set(categoryId, updatedTemplate);

      return {
        success: true,
        data: updatedTemplate,
        message: '添加成功',
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '添加失败',
        code: 500,
      };
    }
  }

  /**
   * 更新模板中的属性
   * @param categoryId 类目ID
   * @param attributeId 属性ID
   * @param attribute 更新的属性数据
   * @returns 更新后的属性模板
   */
  async updateAttribute(
    categoryId: string,
    attributeId: string,
    attribute: Partial<Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<CategoryAttributeTemplate>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const template = this.templates.get(categoryId);
      if (!template) {
        return {
          success: false,
          data: null as any,
          message: '属性模板不存在',
          code: 404,
        };
      }

      const attributeIndex = template.attributes.findIndex((attr) => attr.id === attributeId);
      if (attributeIndex === -1) {
        return {
          success: false,
          data: null as any,
          message: '属性不存在',
          code: 404,
        };
      }

      // 验证更新后的属性
      const updatedAttribute = { ...template.attributes[attributeIndex], ...attribute };
      if (updatedAttribute.name && updatedAttribute.name.trim() === '') {
        return {
          success: false,
          data: null as any,
          message: '属性名称不能为空',
          code: 400,
        };
      }

      const now = new Date().toISOString();
      const updatedAttributes = [...template.attributes];
      updatedAttributes[attributeIndex] = {
        ...updatedAttribute,
        id: attributeId,
        updatedAt: now,
      };

      const updatedTemplate: CategoryAttributeTemplate = {
        ...template,
        attributes: updatedAttributes,
        updatedAt: now,
      };

      this.templates.set(categoryId, updatedTemplate);

      return {
        success: true,
        data: updatedTemplate,
        message: '更新成功',
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '更新失败',
        code: 500,
      };
    }
  }

  /**
   * 从模板中删除属性
   * @param categoryId 类目ID
   * @param attributeId 属性ID
   * @returns 更新后的属性模板
   */
  async deleteAttribute(
    categoryId: string,
    attributeId: string
  ): Promise<ApiResponse<CategoryAttributeTemplate>> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const template = this.templates.get(categoryId);
      if (!template) {
        return {
          success: false,
          data: null as any,
          message: '属性模板不存在',
          code: 404,
        };
      }

      const attribute = template.attributes.find((attr) => attr.id === attributeId);
      if (!attribute) {
        return {
          success: false,
          data: null as any,
          message: '属性不存在',
          code: 404,
        };
      }

      // 检查属性是否被SPU使用（Mock数据中暂时跳过此检查）
      // 在实际实现中，需要检查 SPU 是否使用了该属性

      const now = new Date().toISOString();
      const updatedTemplate: CategoryAttributeTemplate = {
        ...template,
        attributes: template.attributes.filter((attr) => attr.id !== attributeId),
        updatedAt: now,
      };

      this.templates.set(categoryId, updatedTemplate);

      return {
        success: true,
        data: updatedTemplate,
        message: '删除成功',
        code: 200,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error instanceof Error ? error.message : '删除失败',
        code: 500,
      };
    }
  }
}

// 创建类目属性模板服务实例
export const categoryAttributeTemplateService = new CategoryAttributeTemplateService();
