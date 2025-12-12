import { Category, CategoryTree, CategoryStatus, CategoryLevel, AttributeTemplate, CategoryAttribute } from '@/types/category';

/**
 * 类目Mock数据生成器
 * 支持三级类目结构（一级/二级/三级类目）
 */

// 影院类目数据模板
const categoryTemplates = {
  level1: ['饮品', '小食', '套餐', '票务', '周边商品'],
  level2: {
    '饮品': ['碳酸饮料', '茶饮', '果汁', '咖啡', '水'],
    '小食': ['爆米花', '薯片', '糖果', '饼干', '坚果'],
    '套餐': ['单人套餐', '双人套餐', '家庭套餐', '豪华套餐'],
    '票务': ['标准票', '3D票', 'VIP票', '团体票', '优惠票'],
    '周边商品': ['电影周边', '纪念品', '玩具', '书籍']
  },
  level3: {
    '碳酸饮料': ['可乐类', '汽水类', '功能饮料'],
    '茶饮': ['绿茶', '红茶', '乌龙茶', '花茶'],
    '果汁': ['橙汁', '苹果汁', '葡萄汁', '混合果汁'],
    '咖啡': ['美式咖啡', '拿铁', '卡布奇诺', '摩卡'],
    '爆米花': ['甜味', '咸味', '焦糖味', '黄油味'],
    '薯片': ['原味', '烧烤味', '番茄味', '海苔味']
  }
};

// 生成类目编码
function generateCategoryCode(level: CategoryLevel, sequence: number): string {
  return `CAT-${level}-${String(sequence).padStart(3, '0')}`;
}

// 生成单个类目
function generateCategory(
  level: CategoryLevel,
  parentId?: string,
  parentName?: string,
  overrides?: Partial<Category>
): Category {
  const now = new Date().toISOString();
  const sequence = Math.floor(Math.random() * 1000);
  
  // 根据层级选择名称
  let name = '';
  if (level === 1) {
    const options = categoryTemplates.level1;
    name = options[Math.floor(Math.random() * options.length)];
  } else if (level === 2 && parentName) {
    const level2Options = categoryTemplates.level2[parentName as keyof typeof categoryTemplates.level2] || [];
    name = level2Options.length > 0 
      ? level2Options[Math.floor(Math.random() * level2Options.length)]
      : '子类目';
  } else if (level === 3 && parentName) {
    const level3Options = categoryTemplates.level3[parentName as keyof typeof categoryTemplates.level3] || [];
    name = level3Options.length > 0
      ? level3Options[Math.floor(Math.random() * level3Options.length)]
      : '三级类目';
  } else {
    name = '新类目';
  }

  // 构建路径
  const path: string[] = [];
  if (parentName) {
    path.push(parentName);
  }
  path.push(name);

  // 生成UUID
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  return {
    id: generateUUID(),
    code: generateCategoryCode(level, sequence),
    name,
    description: `这是${name}的描述信息`,
    level,
    parentId,
    parentName,
    path,
    status: Math.random() > 0.3 ? 'active' : 'inactive' as CategoryStatus,
    sortOrder: Math.floor(Math.random() * 100),
    spuCount: Math.floor(Math.random() * 50),
    attributeTemplateId: Math.random() > 0.7 ? generateUUID() : undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

// 生成类目树结构
export function generateCategoryTree(lazy: boolean = true): CategoryTree[] {
  const categories: Category[] = [];
  const treeMap = new Map<string, CategoryTree>();
  
  // 生成一级类目
  const level1Categories: Category[] = [];
  categoryTemplates.level1.forEach((name, index) => {
    const category = generateCategory(1, undefined, undefined, { name, sortOrder: index });
    level1Categories.push(category);
    categories.push(category);
    
    // 创建树节点
    const treeNode: CategoryTree = {
      ...category,
      children: [],
      hasChildren: true,
      isLeaf: false,
      key: category.id,
      title: category.name
    };
    treeMap.set(category.id, treeNode);
  });

  // 生成二级类目
  level1Categories.forEach(level1 => {
    const level2Names = categoryTemplates.level2[level1.name as keyof typeof categoryTemplates.level2] || [];
    level2Names.forEach((name, index) => {
      const category = generateCategory(2, level1.id, level1.name, { name, sortOrder: index });
      categories.push(category);
      
      const treeNode: CategoryTree = {
        ...category,
        children: [],
        hasChildren: true,
        isLeaf: false,
        key: category.id,
        title: category.name
      };
      treeMap.set(category.id, treeNode);
      
      // 添加到父节点的children
      const parentNode = treeMap.get(level1.id);
      if (parentNode) {
        parentNode.children!.push(treeNode);
      }
    });
  });

  // 生成三级类目
  categories.filter(c => c.level === 2).forEach(level2 => {
    const level3Names = categoryTemplates.level3[level2.name as keyof typeof categoryTemplates.level3] || [];
    level3Names.forEach((name, index) => {
      const category = generateCategory(3, level2.id, level2.name, { name, sortOrder: index });
      categories.push(category);
      
      const treeNode: CategoryTree = {
        ...category,
        children: [],
        hasChildren: false,
        isLeaf: true,
        key: category.id,
        title: category.name
      };
      treeMap.set(category.id, treeNode);
      
      // 添加到父节点的children
      const parentNode = treeMap.get(level2.id);
      if (parentNode) {
        parentNode.children!.push(treeNode);
        parentNode.isLeaf = false;
      }
    });
  });

  // 如果懒加载，只返回一级类目
  if (lazy) {
    return level1Categories.map(cat => treeMap.get(cat.id)!);
  }

  // 否则返回完整树结构
  return level1Categories.map(cat => treeMap.get(cat.id)!);
}

// 获取所有类目（扁平列表）
export function getAllCategories(): Category[] {
  const tree = generateCategoryTree(false);
  const categories: Category[] = [];
  
  function flattenTree(nodes: CategoryTree[]) {
    nodes.forEach(node => {
      const { children, hasChildren, isLeaf, key, title, ...category } = node;
      categories.push(category);
      if (children && children.length > 0) {
        flattenTree(children);
      }
    });
  }
  
  flattenTree(tree);
  return categories;
}

// 根据ID获取类目
export function getCategoryById(id: string): Category | undefined {
  const allCategories = getAllCategories();
  return allCategories.find(cat => cat.id === id);
}

// 获取子类目列表
export function getCategoryChildren(parentId: string): Category[] {
  const allCategories = getAllCategories();
  return allCategories.filter(cat => cat.parentId === parentId);
}

// 搜索类目
export function searchCategories(keyword: string): Category[] {
  const allCategories = getAllCategories();
  const lowerKeyword = keyword.toLowerCase();
  return allCategories.filter(cat => 
    cat.name.toLowerCase().includes(lowerKeyword) ||
    cat.code.toLowerCase().includes(lowerKeyword) ||
    (cat.description && cat.description.toLowerCase().includes(lowerKeyword))
  );
}

// 生成UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// 创建类目
export function createCategory(data: Partial<Category>): Category {
  const now = new Date().toISOString();
  const level = data.parentId ? (data.level || 2) : 1;
  const sequence = Math.floor(Math.random() * 1000);
  
  const category: Category = {
    id: generateUUID(),
    code: generateCategoryCode(level, sequence),
    name: data.name || '新类目',
    description: data.description,
    level: level as CategoryLevel,
    parentId: data.parentId,
    parentName: data.parentName,
    path: data.path || [data.name || ''],
    status: data.status || 'active',
    sortOrder: data.sortOrder || 0,
    spuCount: 0,
    attributeTemplateId: data.attributeTemplateId,
    createdAt: now,
    updatedAt: now,
    ...data
  };
  
  return category;
}

// 更新类目
export function updateCategory(id: string, data: Partial<Category>): Category {
  const existing = getCategoryById(id);
  if (!existing) {
    throw new Error('类目不存在');
  }
  
  return {
    ...existing,
    ...data,
    id, // 确保ID不变
    code: existing.code, // 编码不可修改
    level: existing.level, // 层级不可修改
    parentId: existing.parentId, // 父类目不可修改
    updatedAt: new Date().toISOString()
  };
}

// 更新类目状态
export function updateCategoryStatus(id: string, status: 'active' | 'inactive'): Category {
  return updateCategory(id, { status });
}

// 删除类目
export function deleteCategory(id: string): boolean {
  const category = getCategoryById(id);
  if (!category) {
    return false;
  }
  
  // 检查是否被SPU使用
  if (category.spuCount > 0) {
    return false;
  }
  
  // 检查是否有子类目
  const children = getCategoryChildren(id);
  if (children.length > 0) {
    return false;
  }
  
  // 从存储中删除（这里需要实际的数据存储逻辑）
  // 由于是 Mock 数据，我们通过标记为已删除或从列表中移除来实现
  // 实际实现取决于数据存储方式
  return true;
}

// ========== 属性模板相关函数 ==========

// 属性模板存储（内存存储）
const attributeTemplates: Map<string, AttributeTemplate> = new Map();

// 获取类目的属性模板
export function getAttributeTemplateByCategoryId(categoryId: string): AttributeTemplate | null {
  return attributeTemplates.get(categoryId) || null;
}

// 保存属性模板
export function saveAttributeTemplate(categoryId: string, attributes: CategoryAttribute[]): AttributeTemplate {
  const now = new Date().toISOString();
  const existing = attributeTemplates.get(categoryId);
  
  const template: AttributeTemplate = {
    id: existing?.id || `template-${Date.now()}`,
    categoryId,
    attributes: attributes.map(attr => ({
      ...attr,
      createdAt: attr.createdAt || now,
      updatedAt: now,
    })),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  
  attributeTemplates.set(categoryId, template);
  return template;
}

// 添加属性到模板
export function addAttributeToTemplate(categoryId: string, attribute: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>): AttributeTemplate {
  const template = attributeTemplates.get(categoryId);
  if (!template) {
    throw new Error('属性模板不存在');
  }
  
  const now = new Date().toISOString();
  const newAttribute: CategoryAttribute = {
    ...attribute,
    id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  const updatedTemplate: AttributeTemplate = {
    ...template,
    attributes: [...template.attributes, newAttribute],
    updatedAt: now,
  };
  
  attributeTemplates.set(categoryId, updatedTemplate);
  return updatedTemplate;
}

// 更新模板中的属性
export function updateAttributeInTemplate(categoryId: string, attributeId: string, updates: Partial<CategoryAttribute>): AttributeTemplate {
  const template = attributeTemplates.get(categoryId);
  if (!template) {
    throw new Error('属性模板不存在');
  }
  
  const attributeIndex = template.attributes.findIndex(attr => attr.id === attributeId);
  if (attributeIndex === -1) {
    throw new Error('属性不存在');
  }
  
  const updatedAttributes = [...template.attributes];
  updatedAttributes[attributeIndex] = {
    ...updatedAttributes[attributeIndex],
    ...updates,
    id: attributeId, // 确保ID不变
    updatedAt: new Date().toISOString(),
  };
  
  const updatedTemplate: AttributeTemplate = {
    ...template,
    attributes: updatedAttributes,
    updatedAt: new Date().toISOString(),
  };
  
  attributeTemplates.set(categoryId, updatedTemplate);
  return updatedTemplate;
}

// 从模板中删除属性
export function deleteAttributeFromTemplate(categoryId: string, attributeId: string): AttributeTemplate {
  const template = attributeTemplates.get(categoryId);
  if (!template) {
    throw new Error('属性模板不存在');
  }
  
  // 检查属性是否被SPU使用（Mock检查，实际应该查询SPU数据）
  // 这里简化为总是允许删除，实际应该检查SPU数据
  
  const updatedAttributes = template.attributes.filter(attr => attr.id !== attributeId);
  
  const updatedTemplate: AttributeTemplate = {
    ...template,
    attributes: updatedAttributes,
    updatedAt: new Date().toISOString(),
  };
  
  attributeTemplates.set(categoryId, updatedTemplate);
  return updatedTemplate;
}

