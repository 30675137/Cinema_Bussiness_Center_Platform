/**
 * Mock data generator for Attribute Dictionary Management
 *
 * Provides initial mock data for:
 * - Dictionary Types (容量单位, 口味, 包装形式, etc.)
 * - Dictionary Items
 * - Attribute Templates
 * - Attributes
 */

import type {
  DictionaryType,
  DictionaryItem,
  AttributeTemplate,
  Attribute,
} from '@/features/attribute-dictionary/types';

// ============================================================================
// Helper functions
// ============================================================================

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const now = () => new Date().toISOString();

// ============================================================================
// Initial Dictionary Types
// ============================================================================

export const initialDictionaryTypes: DictionaryType[] = [
  {
    id: 'dt-001',
    code: 'CAPACITY_UNIT',
    name: '容量单位',
    description: '商品容量相关的计量单位',
    isSystem: true,
    category: 'basic',
    sort: 1,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    itemCount: 6,
  },
  {
    id: 'dt-002',
    code: 'FLAVOR',
    name: '口味',
    description: '商品口味分类',
    isSystem: true,
    category: 'basic',
    sort: 2,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    itemCount: 8,
  },
  {
    id: 'dt-003',
    code: 'PACKAGE_TYPE',
    name: '包装形式',
    description: '商品包装类型',
    isSystem: true,
    category: 'basic',
    sort: 3,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    itemCount: 5,
  },
  {
    id: 'dt-004',
    code: 'SERIES_TAG',
    name: '系列标签',
    description: '商品系列分类标签',
    isSystem: false,
    category: 'business',
    sort: 4,
    status: 'active',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    createdBy: 'admin',
    updatedBy: 'admin',
    itemCount: 4,
  },
  {
    id: 'dt-005',
    code: 'STORAGE_CONDITION',
    name: '存储条件',
    description: '商品存储温度和环境要求',
    isSystem: true,
    category: 'basic',
    sort: 5,
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'system',
    updatedBy: 'system',
    itemCount: 3,
  },
];

// ============================================================================
// Initial Dictionary Items
// ============================================================================

export const initialDictionaryItems: Record<string, DictionaryItem[]> = {
  'dt-001': [
    // 容量单位
    {
      id: 'di-001-01',
      typeId: 'dt-001',
      code: '250ML',
      name: '250毫升',
      value: '250ml',
      sort: 1,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-001-02',
      typeId: 'dt-001',
      code: '330ML',
      name: '330毫升',
      value: '330ml',
      sort: 2,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-001-03',
      typeId: 'dt-001',
      code: '500ML',
      name: '500毫升',
      value: '500ml',
      sort: 3,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-001-04',
      typeId: 'dt-001',
      code: '1L',
      name: '1升',
      value: '1000ml',
      sort: 4,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-001-05',
      typeId: 'dt-001',
      code: '1_5L',
      name: '1.5升',
      value: '1500ml',
      sort: 5,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-001-06',
      typeId: 'dt-001',
      code: '2L',
      name: '2升',
      value: '2000ml',
      sort: 6,
      level: 0,
      status: 'inactive',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ],
  'dt-002': [
    // 口味
    {
      id: 'di-002-01',
      typeId: 'dt-002',
      code: 'ORIGINAL',
      name: '原味',
      sort: 1,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-002-02',
      typeId: 'dt-002',
      code: 'STRAWBERRY',
      name: '草莓味',
      sort: 2,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-002-03',
      typeId: 'dt-002',
      code: 'CHOCOLATE',
      name: '巧克力味',
      sort: 3,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-002-04',
      typeId: 'dt-002',
      code: 'VANILLA',
      name: '香草味',
      sort: 4,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-002-05',
      typeId: 'dt-002',
      code: 'MANGO',
      name: '芒果味',
      sort: 5,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-002-06',
      typeId: 'dt-002',
      code: 'LEMON',
      name: '柠檬味',
      sort: 6,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-002-07',
      typeId: 'dt-002',
      code: 'PEACH',
      name: '蜜桃味',
      sort: 7,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-002-08',
      typeId: 'dt-002',
      code: 'GRAPE',
      name: '葡萄味',
      sort: 8,
      level: 0,
      status: 'inactive',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ],
  'dt-003': [
    // 包装形式
    {
      id: 'di-003-01',
      typeId: 'dt-003',
      code: 'BOTTLE',
      name: '瓶装',
      sort: 1,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-003-02',
      typeId: 'dt-003',
      code: 'CAN',
      name: '罐装',
      sort: 2,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-003-03',
      typeId: 'dt-003',
      code: 'BOX',
      name: '盒装',
      sort: 3,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-003-04',
      typeId: 'dt-003',
      code: 'BAG',
      name: '袋装',
      sort: 4,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-003-05',
      typeId: 'dt-003',
      code: 'BULK',
      name: '散装',
      sort: 5,
      level: 0,
      status: 'inactive',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ],
  'dt-004': [
    // 系列标签
    {
      id: 'di-004-01',
      typeId: 'dt-004',
      code: 'CLASSIC',
      name: '经典系列',
      sort: 1,
      level: 0,
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'di-004-02',
      typeId: 'dt-004',
      code: 'PREMIUM',
      name: '高端系列',
      sort: 2,
      level: 0,
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'di-004-03',
      typeId: 'dt-004',
      code: 'LIMITED',
      name: '限定系列',
      sort: 3,
      level: 0,
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'di-004-04',
      typeId: 'dt-004',
      code: 'SEASONAL',
      name: '季节系列',
      sort: 4,
      level: 0,
      status: 'active',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
  ],
  'dt-005': [
    // 存储条件
    {
      id: 'di-005-01',
      typeId: 'dt-005',
      code: 'NORMAL',
      name: '常温',
      value: '15-25°C',
      sort: 1,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-005-02',
      typeId: 'dt-005',
      code: 'CHILLED',
      name: '冷藏',
      value: '2-8°C',
      sort: 2,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
    {
      id: 'di-005-03',
      typeId: 'dt-005',
      code: 'FROZEN',
      name: '冷冻',
      value: '-18°C以下',
      sort: 3,
      level: 0,
      status: 'active',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      createdBy: 'system',
      updatedBy: 'system',
    },
  ],
};

// ============================================================================
// Initial Attribute Templates (for testing)
// ============================================================================

export const initialAttributeTemplates: AttributeTemplate[] = [
  {
    id: 'at-001',
    categoryId: 'cat-3-001', // 假设这是一个三级类目ID（饮料-碳酸饮料-可乐）
    name: '碳酸饮料属性模板',
    version: 1,
    isActive: true,
    appliedAt: '2024-02-01T00:00:00.000Z',
    createdAt: '2024-01-20T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
    createdBy: 'admin',
    updatedBy: 'admin',
  },
];

// ============================================================================
// Initial Attributes (for testing)
// ============================================================================

export const initialAttributes: Record<string, Attribute[]> = {
  'at-001': [
    {
      id: 'attr-001-01',
      templateId: 'at-001',
      name: '容量',
      code: 'capacity',
      type: 'single-select',
      required: true,
      description: '选择商品容量',
      dictionaryTypeId: 'dt-001',
      sort: 1,
      level: 'SKU',
      createdAt: '2024-01-20T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'attr-001-02',
      templateId: 'at-001',
      name: '口味',
      code: 'flavor',
      type: 'single-select',
      required: true,
      description: '选择商品口味',
      dictionaryTypeId: 'dt-002',
      sort: 2,
      level: 'SPU',
      createdAt: '2024-01-20T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'attr-001-03',
      templateId: 'at-001',
      name: '包装形式',
      code: 'package_type',
      type: 'single-select',
      required: true,
      description: '选择包装形式',
      dictionaryTypeId: 'dt-003',
      sort: 3,
      level: 'SKU',
      createdAt: '2024-01-20T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'attr-001-04',
      templateId: 'at-001',
      name: '是否含糖',
      code: 'has_sugar',
      type: 'boolean',
      required: true,
      description: '标记是否为含糖饮料',
      defaultValue: true,
      sort: 4,
      level: 'SPU',
      createdAt: '2024-01-20T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
    {
      id: 'attr-001-05',
      templateId: 'at-001',
      name: '保质期(天)',
      code: 'shelf_life',
      type: 'number',
      required: false,
      description: '商品保质期天数',
      sort: 5,
      level: 'SPU',
      createdAt: '2024-01-20T00:00:00.000Z',
      updatedAt: '2024-01-20T00:00:00.000Z',
      createdBy: 'admin',
      updatedBy: 'admin',
    },
  ],
};

// ============================================================================
// Generator functions for creating new mock data
// ============================================================================

export const generateDictionaryType = (overrides: Partial<DictionaryType> = {}): DictionaryType => {
  const id = generateUUID();
  return {
    id,
    code: `TYPE_${Date.now()}`,
    name: `字典类型_${id.substring(0, 4)}`,
    description: '',
    isSystem: false,
    category: 'custom',
    sort: 99,
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'user',
    updatedBy: 'user',
    itemCount: 0,
    ...overrides,
  };
};

export const generateDictionaryItem = (
  typeId: string,
  overrides: Partial<DictionaryItem> = {}
): DictionaryItem => {
  const id = generateUUID();
  return {
    id,
    typeId,
    code: `ITEM_${Date.now()}`,
    name: `字典项_${id.substring(0, 4)}`,
    value: undefined,
    level: 0,
    sort: 99,
    status: 'active',
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'user',
    updatedBy: 'user',
    ...overrides,
  };
};

export const generateAttributeTemplate = (
  overrides: Partial<AttributeTemplate> = {}
): AttributeTemplate => {
  const id = generateUUID();
  return {
    id,
    categoryId: '',
    name: `属性模板_${id.substring(0, 4)}`,
    version: 1,
    isActive: false,
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'user',
    updatedBy: 'user',
    ...overrides,
  };
};

export const generateAttribute = (
  templateId: string,
  overrides: Partial<Attribute> = {}
): Attribute => {
  const id = generateUUID();
  return {
    id,
    templateId,
    name: `属性_${id.substring(0, 4)}`,
    code: `attr_${Date.now()}`,
    type: 'text',
    required: false,
    sort: 99,
    level: 'SPU',
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'user',
    updatedBy: 'user',
    ...overrides,
  };
};
