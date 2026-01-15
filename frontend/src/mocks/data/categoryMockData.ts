import type {
  Category,
  CategoryTree,
  CategoryStatus,
  CategoryLevel,
  AttributeTemplate,
  CategoryAttribute,
  AttributeType,
} from '@/types/category';

/**
 * 类目Mock数据生成器
 * 支持三级类目结构（一级/二级/三级类目）
 */

// 影院类目数据模板
const categoryTemplates = {
  level1: ['饮品', '小食', '套餐', '票务', '周边商品', '会员服务', '活动商品'],
  level2: {
    饮品: ['碳酸饮料', '茶饮', '果汁', '咖啡', '水', '奶茶', '酸奶', '运动饮料'],
    小食: ['爆米花', '薯片', '糖果', '饼干', '坚果', '巧克力', '口香糖', '果干'],
    套餐: ['单人套餐', '双人套餐', '家庭套餐', '豪华套餐', '情侣套餐', '学生套餐'],
    票务: ['标准票', '3D票', 'VIP票', '团体票', '优惠票', 'IMAX票', '4DX票'],
    周边商品: ['电影周边', '纪念品', '玩具', '书籍', '海报', '手办', '服装'],
    会员服务: ['会员卡', '积分兑换', '生日礼包', '专属优惠'],
    活动商品: ['限时特价', '节日礼盒', '促销商品', '新品首发'],
  },
  level3: {
    碳酸饮料: ['可乐类', '汽水类', '功能饮料', '苏打水'],
    茶饮: ['绿茶', '红茶', '乌龙茶', '花茶', '果茶', '奶茶'],
    果汁: ['橙汁', '苹果汁', '葡萄汁', '混合果汁', '柠檬汁', '西瓜汁'],
    咖啡: ['美式咖啡', '拿铁', '卡布奇诺', '摩卡', '浓缩咖啡', '冰咖啡'],
    水: ['矿泉水', '纯净水', '气泡水', '功能水'],
    奶茶: ['原味奶茶', '珍珠奶茶', '红豆奶茶', '椰果奶茶'],
    酸奶: ['原味酸奶', '果味酸奶', '希腊酸奶', '低脂酸奶'],
    运动饮料: ['电解质饮料', '能量饮料', '维生素饮料'],
    爆米花: ['甜味', '咸味', '焦糖味', '黄油味', '巧克力味', '芝士味'],
    薯片: ['原味', '烧烤味', '番茄味', '海苔味', '香辣味', '黄瓜味'],
    糖果: ['硬糖', '软糖', '棒棒糖', '口香糖', '巧克力糖'],
    饼干: ['苏打饼干', '曲奇饼干', '威化饼干', '夹心饼干'],
    坚果: ['花生', '瓜子', '开心果', '腰果', '杏仁', '核桃'],
    巧克力: ['黑巧克力', '牛奶巧克力', '白巧克力', '夹心巧克力'],
    口香糖: ['薄荷味', '水果味', '无糖型', '功能型'],
    果干: ['葡萄干', '芒果干', '草莓干', '混合果干'],
    标准票: ['普通场次', '早场', '晚场', '午夜场'],
    '3D票': ['3D普通场', '3D IMAX', '3D 4DX'],
    VIP票: ['VIP厅', '豪华厅', '情侣厅'],
    IMAX票: ['IMAX 2D', 'IMAX 3D', 'IMAX激光'],
    '4DX票': ['4DX 2D', '4DX 3D', '4DX IMAX'],
    电影周边: ['手办', '模型', '钥匙扣', '徽章'],
    纪念品: ['明信片', '书签', '冰箱贴', '马克杯'],
    玩具: ['毛绒玩具', '积木', '拼图', '益智玩具'],
    书籍: ['电影原著', '影评集', '画册', '杂志'],
    海报: ['官方海报', '限量海报', '签名海报'],
    手办: ['角色手办', '场景手办', '限量版'],
    服装: ['T恤', '卫衣', '帽子', '配饰'],
  },
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
    const level2Options =
      categoryTemplates.level2[parentName as keyof typeof categoryTemplates.level2] || [];
    name =
      level2Options.length > 0
        ? level2Options[Math.floor(Math.random() * level2Options.length)]
        : '子类目';
  } else if (level === 3 && parentName) {
    const level3Options =
      categoryTemplates.level3[parentName as keyof typeof categoryTemplates.level3] || [];
    name =
      level3Options.length > 0
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
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
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
    status: Math.random() > 0.3 ? 'active' : ('inactive' as CategoryStatus),
    sortOrder: Math.floor(Math.random() * 100),
    spuCount: Math.floor(Math.random() * 50),
    attributeTemplateId: Math.random() > 0.7 ? generateUUID() : undefined,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// 将扁平列表转换为树结构
function buildTreeFromFlatList(categories: Category[]): CategoryTree[] {
  if (!categories || categories.length === 0) {
    return [];
  }

  const treeMap = new Map<string, CategoryTree>();
  const rootNodes: CategoryTree[] = [];

  // 第一遍：创建所有节点
  categories.forEach((category) => {
    if (!category || !category.id) {
      console.warn('Invalid category found:', category);
      return;
    }

    const treeNode: CategoryTree = {
      ...category,
      children: [],
      hasChildren: false,
      isLeaf: true,
      key: category.id,
      title: category.name || '未命名类目',
    };
    treeMap.set(category.id, treeNode);
  });

  // 第二遍：建立父子关系
  categories.forEach((category) => {
    if (!category || !category.id) {
      return;
    }

    const node = treeMap.get(category.id);
    if (!node) {
      return;
    }

    if (category.parentId) {
      const parent = treeMap.get(category.parentId);
      if (parent) {
        parent.children!.push(node);
        parent.hasChildren = true;
        parent.isLeaf = false;
      }
    } else {
      rootNodes.push(node);
    }
  });

  // 更新 isLeaf 状态
  treeMap.forEach((node) => {
    if (node.children && node.children.length > 0) {
      node.isLeaf = false;
    }
  });

  return rootNodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

// 生成类目树结构
export function generateCategoryTree(lazy: boolean = true): CategoryTree[] {
  try {
    console.log('[generateCategoryTree] Starting, lazy:', lazy);

    // 获取所有类目（会从 localStorage 读取或生成新数据）
    const categories = getAllCategories();
    console.log('[generateCategoryTree] Got categories:', categories.length);

    if (categories.length === 0) {
      console.warn('[generateCategoryTree] No categories found, generating new data');
    }

    // 从扁平列表构建树结构
    const tree = buildTreeFromFlatList(categories);
    console.log('[generateCategoryTree] Built tree, root nodes:', tree.length);

    if (lazy) {
      // 懒加载模式：只返回一级类目，children 为空但 hasChildren 为 true
      const lazyTree = tree.map((node) => ({
        ...node,
        children: [],
        hasChildren: node.hasChildren,
      }));
      console.log('[generateCategoryTree] Returning lazy tree:', lazyTree.length, 'nodes');
      return lazyTree;
    }

    // 否则返回完整树结构
    console.log('[generateCategoryTree] Returning full tree:', tree.length, 'root nodes');
    return tree;
  } catch (error) {
    console.error('[generateCategoryTree] Error:', error);
    throw error;
  }
}

// 数据存储键名
const STORAGE_KEY = 'mock_category_data';

// 直接生成类目数据（不依赖树结构，避免循环调用）
function generateCategoriesDirectly(): Category[] {
  const categories: Category[] = [];

  // 生成一级类目
  const level1Categories: Category[] = [];
  categoryTemplates.level1.forEach((name, index) => {
    const category = generateCategory(1, undefined, undefined, { name, sortOrder: index });
    level1Categories.push(category);
    categories.push(category);
  });

  // 生成二级类目
  level1Categories.forEach((level1) => {
    const level2Names =
      categoryTemplates.level2[level1.name as keyof typeof categoryTemplates.level2] || [];
    level2Names.forEach((name, index) => {
      const category = generateCategory(2, level1.id, level1.name, { name, sortOrder: index });
      categories.push(category);
    });
  });

  // 生成三级类目
  categories
    .filter((c) => c.level === 2)
    .forEach((level2) => {
      const level3Names =
        categoryTemplates.level3[level2.name as keyof typeof categoryTemplates.level3] || [];
      level3Names.forEach((name, index) => {
        const category = generateCategory(3, level2.id, level2.name, { name, sortOrder: index });
        categories.push(category);
      });
    });

  return categories;
}

// 验证分类数据是否有效
function isValidCategory(cat: any): cat is Category {
  return (
    cat &&
    typeof cat.id === 'string' &&
    cat.id.trim() !== '' &&
    typeof cat.name === 'string' &&
    cat.name.trim() !== ''
  );
}

// 过滤并验证分类数据
function filterValidCategories(categories: any[]): Category[] {
  return categories.filter((cat) => {
    if (!isValidCategory(cat)) {
      console.warn('[categoryMockData] 过滤无效分类:', cat);
      return false;
    }
    return true;
  });
}

// 初始化并获取所有类目（扁平列表）
export function getAllCategories(): Category[] {
  try {
    console.log('[getAllCategories] Starting...');

    // 尝试从 localStorage 获取已保存的数据
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // 验证并过滤无效数据
            const validCategories = filterValidCategories(parsed);
            if (validCategories.length > 0) {
              console.log(
                '[getAllCategories] Loaded from localStorage:',
                validCategories.length,
                'valid categories (filtered from',
                parsed.length,
                ')'
              );
              // 如果有无效数据被过滤，重新保存
              if (validCategories.length !== parsed.length) {
                console.warn('[getAllCategories] Some invalid categories were filtered, re-saving...');
                localStorage.setItem(STORAGE_KEY, JSON.stringify(validCategories));
              }
              return validCategories;
            } else {
              // 所有数据都无效，清除并重新生成
              console.warn('[getAllCategories] All categories invalid, clearing and regenerating...');
              localStorage.removeItem(STORAGE_KEY);
            }
          }
        } catch (e) {
          console.warn('[getAllCategories] Failed to parse saved category data:', e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }

    console.log('[getAllCategories] No saved data, generating new categories...');

    // 如果没有保存的数据，直接生成新数据（避免循环调用）
    const categories = generateCategoriesDirectly();
    const validCategories = filterValidCategories(categories);
    console.log('[getAllCategories] Generated', validCategories.length, 'valid categories');

    // 保存到 localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validCategories));
        console.log('[getAllCategories] Saved to localStorage');
      } catch (e) {
        console.warn('[getAllCategories] Failed to save category data to localStorage:', e);
      }
    }

    return validCategories;
  } catch (error) {
    console.error('[getAllCategories] Error:', error);
    throw error;
  }
}

// 更新存储的数据
function saveCategoriesToStorage(categories: Category[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to save category data to localStorage:', e);
    }
  }
}

// 根据ID获取类目
export function getCategoryById(id: string): Category | undefined {
  const allCategories = getAllCategories();
  return allCategories.find((cat) => cat.id === id);
}

// 获取子类目列表
export function getCategoryChildren(parentId: string): Category[] {
  const allCategories = getAllCategories();
  return allCategories.filter((cat) => cat.parentId === parentId);
}

// 搜索类目
export function searchCategories(keyword: string): Category[] {
  const allCategories = getAllCategories();
  const lowerKeyword = keyword.toLowerCase();
  return allCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(lowerKeyword) ||
      cat.code.toLowerCase().includes(lowerKeyword) ||
      (cat.description && cat.description.toLowerCase().includes(lowerKeyword))
  );
}

// 生成UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 创建类目
export function createCategory(data: Partial<Category>): Category {
  const now = new Date().toISOString();
  const level = data.parentId ? data.level || 2 : 1;
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
    ...data,
  };

  // 更新存储
  const allCategories = getAllCategories();
  allCategories.push(category);
  saveCategoriesToStorage(allCategories);

  return category;
}

// 更新类目
export function updateCategory(id: string, data: Partial<Category>): Category {
  const existing = getCategoryById(id);
  if (!existing) {
    throw new Error('类目不存在');
  }

  const updated = {
    ...existing,
    ...data,
    id, // 确保ID不变
    code: existing.code, // 编码不可修改
    level: existing.level, // 层级不可修改
    parentId: existing.parentId, // 父类目不可修改
    updatedAt: new Date().toISOString(),
  };

  // 更新存储
  const allCategories = getAllCategories();
  const index = allCategories.findIndex((cat) => cat.id === id);
  if (index !== -1) {
    allCategories[index] = updated;
    saveCategoriesToStorage(allCategories);
  }

  return updated;
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

  // 从存储中删除
  const allCategories = getAllCategories();
  const filtered = allCategories.filter((cat) => cat.id !== id);
  saveCategoriesToStorage(filtered);

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
export function saveAttributeTemplate(
  categoryId: string,
  attributes: CategoryAttribute[]
): AttributeTemplate {
  const now = new Date().toISOString();
  const existing = attributeTemplates.get(categoryId);

  const template: AttributeTemplate = {
    id: existing?.id || `template-${Date.now()}`,
    categoryId,
    attributes: attributes.map((attr) => ({
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
export function addAttributeToTemplate(
  categoryId: string,
  attribute: Omit<CategoryAttribute, 'id' | 'createdAt' | 'updatedAt'>
): AttributeTemplate {
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
export function updateAttributeInTemplate(
  categoryId: string,
  attributeId: string,
  updates: Partial<CategoryAttribute>
): AttributeTemplate {
  const template = attributeTemplates.get(categoryId);
  if (!template) {
    throw new Error('属性模板不存在');
  }

  const attributeIndex = template.attributes.findIndex((attr) => attr.id === attributeId);
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
export function deleteAttributeFromTemplate(
  categoryId: string,
  attributeId: string
): AttributeTemplate {
  const template = attributeTemplates.get(categoryId);
  if (!template) {
    throw new Error('属性模板不存在');
  }

  // 检查属性是否被SPU使用（Mock检查，实际应该查询SPU数据）
  // 这里简化为总是允许删除，实际应该检查SPU数据

  const updatedAttributes = template.attributes.filter((attr) => attr.id !== attributeId);

  const updatedTemplate: AttributeTemplate = {
    ...template,
    attributes: updatedAttributes,
    updatedAt: new Date().toISOString(),
  };

  attributeTemplates.set(categoryId, updatedTemplate);
  return updatedTemplate;
}
