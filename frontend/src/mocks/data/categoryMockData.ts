/**
 * 类目管理功能Mock数据生成器
 * 生成真实的测试数据，支持不同场景和配置
 * 提供数据持久化和localStorage同步功能
 */

import {
  Category,
  CategoryTreeNode,
  CategoryAttribute,
  AttributeTemplate,
  CategoryLevel,
  CategoryStatus,
  CreateCategoryRequest,
  SaveAttributeTemplateRequest
} from '../../types/category';

// 本地定义 AttributeType 以避免导入问题
type AttributeType = 'text' | 'number' | 'single-select' | 'multi-select';

/**
 * Mock数据生成配置接口
 */
export interface MockDataConfig {
  /** 一级类目数量 */
  level1Count: number;
  /** 每个一级类目的二级类目数量范围 */
  level2Range: [number, number];
  /** 每个二级类目的三级类目数量范围 */
  level3Range: [number, number];
  /** 属性模板配置概率（0-1） */
  attributeTemplateProb: number;
  /** 每个模板的属性数量范围 */
  attributeCountRange: [number, number];
  /** 是否启用随机状态 */
  randomStatus: boolean;
  /** 类目名称前缀 */
  namePrefix: string;
}

/**
 * 默认Mock数据配置
 */
export const DEFAULT_MOCK_CONFIG: MockDataConfig = {
  level1Count: 5,
  level2Range: [2, 4],
  level3Range: [1, 3],
  attributeTemplateProb: 0.7, // 70%的类目有属性模板
  attributeCountRange: [1, 5],
  randomStatus: true,
  namePrefix: '影院'
};

/**
 * 预定义的类目名称数据
 */
const CATEGORY_NAMES = {
  level1: ['食品饮料', '日用百货', '娱乐用品', '文创产品', '数码产品', '服装鞋帽', '家居用品', '个护美妆'],
  level2: {
    '食品饮料': ['爆米花', '饮料', '零食', '冰淇淋', '糖果', '矿泉水'],
    '日用百货': ['洗漱用品', '纸制品', '清洁用品', '收纳用品', '雨具'],
    '娱乐用品': ['桌游', '扑克', '玩具', '纪念品', '周边产品'],
    '文创产品': ['文具', '图书', '音像制品', '艺术品', '手办'],
    '数码产品': ['耳机', '充电器', '数据线', '手机配件', '音响设备'],
    '服装鞋帽': ['T恤', '帽子', '袜子', '围巾', '包包'],
    '家居用品': ['抱枕', '毯子', '装饰品', '香薰', '台灯'],
    '个护美妆': ['面膜', '护肤品', '化妆品', '洗护用品', '口腔护理']
  },
  level3: {
    '爆米花': ['甜味爆米花', '咸味爆米花', '焦糖爆米花', '巧克力爆米花', '芝士爆米花'],
    '饮料': ['碳酸饮料', '果汁饮料', '茶饮料', '咖啡饮料', '功能饮料', '矿泉水'],
    '洗漱用品': ['牙刷', '牙膏', '洗发水', '沐浴露', '洗手液', '毛巾'],
    '桌游': ['益智类桌游', '策略类桌游', '家庭类桌游', '儿童桌游', '卡牌游戏'],
    '文具': ['笔记本', '签字笔', '便签纸', '文件夹', '计算器', '尺子']
  }
};

/**
 * 属性模板预定义数据
 */
const ATTRIBUTE_TEMPLATES = {
  '爆米花': [
    {
      name: '口味',
      type: 'single-select' as AttributeType,
      required: true,
      optionalValues: ['甜味', '咸味', '焦糖味', '巧克力味', '芝士味'],
      placeholder: '请选择口味',
      description: '爆米花的主要口味分类'
    },
    {
      name: '容量',
      type: 'single-select' as AttributeType,
      required: true,
      optionalValues: ['小份', '中份', '大份', '超大份', '家庭装'],
      placeholder: '请选择容量规格',
      description: '爆米花的包装容量规格'
    }
  ],
  '饮料': [
    {
      name: '品牌',
      type: 'single-select' as AttributeType,
      required: true,
      optionalValues: ['可口可乐', '百事可乐', '农夫山泉', '康师傅', '统一', '脉动'],
      placeholder: '请选择品牌',
      description: '饮料品牌'
    },
    {
      name: '容量(ml)',
      type: 'number' as AttributeType,
      required: true,
      placeholder: '请输入容量',
      description: '饮料容量，单位为毫升'
    },
    {
      name: '口味',
      type: 'multi-select' as AttributeType,
      required: false,
      optionalValues: ['原味', '柠檬味', '青柠味', '橙味', '苹果味', '葡萄味'],
      placeholder: '请选择口味（可多选）',
      description: '饮料口味类型'
    }
  ],
  '洗漱用品': [
    {
      name: '品牌',
      type: 'single-select' as AttributeType,
      required: false,
      optionalValues: ['高露洁', '佳洁士', '黑人', '云南白药', '舒客'],
      placeholder: '请选择品牌',
      description: '洗漱用品品牌'
    },
    {
      name: '规格',
      type: 'single-select' as AttributeType,
      required: true,
      optionalValues: ['旅行装', '标准装', '家庭装', '经济装'],
      placeholder: '请选择规格',
      description: '产品规格'
    }
  ]
};

/**
 * Mock数据生成器类
 */
export class CategoryMockDataGenerator {
  private config: MockDataConfig;
  private nextCategoryId = 1;
  private nextAttributeId = 1;

  constructor(config: MockDataConfig = DEFAULT_MOCK_CONFIG) {
    this.config = config;
  }

  /**
   * 生成完整的Mock数据集
   * @returns 包含类目列表和属性模板的数据集
   */
  generateCompleteDataSet(): {
    categories: Category[];
    attributeTemplates: Record<string, AttributeTemplate>;
  } {
    const categories = this.generateCategories();
    const attributeTemplates = this.generateAttributeTemplates(categories);

    return { categories, attributeTemplates };
  }

  /**
   * 生成类目数据
   * @returns 类目列表
   */
  generateCategories(): Category[] {
    const categories: Category[] = [];
    const level1Names = this.getRandomItems(CATEGORY_NAMES.level1, this.config.level1Count);

    level1Names.forEach((level1Name, level1Index) => {
      const level1Category = this.createCategory({
        name: `${this.config.namePrefix}${level1Name}`,
        level: 1,
        parentId: undefined,
        sortOrder: level1Index + 1
      });
      categories.push(level1Category);

      // 生成二级类目
      const level2Count = this.getRandomNumber(this.config.level2Range[0], this.config.level2Range[1]);
      const level2Names = CATEGORY_NAMES.level2[level1Name] || this.generateRandomNames('二级类目', level2Count);

      level2Names.slice(0, level2Count).forEach((level2Name, level2Index) => {
        const level2Category = this.createCategory({
          name: level2Name,
          level: 2,
          parentId: level1Category.id,
          sortOrder: level2Index + 1
        });
        categories.push(level2Category);

        // 生成三级类目
        const level3Count = this.getRandomNumber(this.config.level3Range[0], this.config.level3Range[1]);
        const level3Names = CATEGORY_NAMES.level3[level2Name] || this.generateRandomNames('三级类目', level3Count);

        level3Names.slice(0, level3Count).forEach((level3Name, level3Index) => {
          const level3Category = this.createCategory({
            name: level3Name,
            level: 3,
            parentId: level2Category.id,
            sortOrder: level3Index + 1
          });
          categories.push(level3Category);
        });
      });
    });

    return categories;
  }

  /**
   * 生成属性模板数据
   * @param categories 类目列表
   * @returns 属性模板映射表
   */
  generateAttributeTemplates(categories: Category[]): Record<string, AttributeTemplate> {
    const attributeTemplates: Record<string, AttributeTemplate> = {};

    // 只为三级类目生成属性模板
    const level3Categories = categories.filter(cat => cat.level === 3);

    level3Categories.forEach(category => {
      // 根据概率决定是否生成属性模板
      if (Math.random() > this.config.attributeTemplateProb) {
        return;
      }

      // 尝试使用预定义的属性模板
      const predefinedTemplate = this.findPredefinedAttributeTemplate(category.name);
      const attributes = predefinedTemplate || this.generateRandomAttributes();

      attributeTemplates[category.id] = {
        id: `template-${category.id}`,
        categoryId: category.id,
        attributes: attributes.map((attr, index) => ({
          ...attr,
          id: `attr-${String(this.nextAttributeId++).padStart(3, '0')}`,
          sortOrder: index + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    return attributeTemplates;
  }

  /**
   * 创建单个类目对象
   * @param data 类目数据
   * @returns 类目对象
   */
  private createCategory(data: {
    name: string;
    level: CategoryLevel;
    parentId?: string;
    sortOrder: number;
  }): Category {
    const now = new Date().toISOString();
    const status = this.config.randomStatus && Math.random() > 0.8 ? 'disabled' : 'enabled';

    return {
      id: `cat-${String(this.nextCategoryId++).padStart(3, '0')}`,
      name: data.name,
      code: this.generateCategoryCode(data.level, data.sortOrder),
      level: data.level,
      parentId: data.parentId,
      sortOrder: data.sortOrder,
      status: status as CategoryStatus,
      createdAt: now,
      updatedAt: now,
      createdBy: 'mock-generator',
      updatedBy: 'mock-generator'
    };
  }

  /**
   * 生成类目编码
   * @param level 类目层级
   * @param sortOrder 排序序号
   * @returns 类目编码
   */
  private generateCategoryCode(level: CategoryLevel, sortOrder: number): string {
    const levelCode = `L${level}`;
    const sortCode = String(sortOrder).padStart(3, '0');
    return `${levelCode}${sortCode}`;
  }

  /**
   * 生成随机属性列表
   * @returns 属性列表
   */
  private generateRandomAttributes(): CreateAttributeRequest[] {
    const attributeCount = this.getRandomNumber(
      this.config.attributeCountRange[0],
      this.config.attributeCountRange[1]
    );

    const attributeTypes: AttributeType[] = ['text', 'number', 'single-select', 'multi-select'];
    const attributes: CreateAttributeRequest[] = [];

    const attributeNames = ['品牌', '规格', '颜色', '尺寸', '材质', '重量', '容量', '型号', '产地', '保质期'];

    for (let i = 0; i < attributeCount; i++) {
      const type = attributeTypes[Math.floor(Math.random() * attributeTypes.length)];
      const name = attributeNames[i % attributeNames.length];

      const attribute: CreateAttributeRequest = {
        name: name,
        type: type,
        required: Math.random() > 0.5,
        sortOrder: i + 1
      };

      // 为选择类型添加可选值
      if (type === 'single-select' || type === 'multi-select') {
        attribute.optionalValues = this.generateRandomOptionalValues(name);
      }

      attributes.push(attribute);
    }

    return attributes;
  }

  /**
   * 根据属性名称生成随机可选值
   * @param attributeName 属性名称
   * @returns 可选值列表
   */
  private generateRandomOptionalValues(attributeName: string): string[] {
    const valueMap: Record<string, string[]> = {
      '品牌': ['品牌A', '品牌B', '品牌C', '品牌D', '品牌E'],
      '规格': ['标准装', '大包装', '小包装', '经济装', '豪华装'],
      '颜色': ['红色', '蓝色', '绿色', '黄色', '黑色', '白色', '彩色'],
      '尺寸': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      '材质': ['塑料', '金属', '木质', '纸质', '布料', '陶瓷'],
      '重量': ['轻量', '标准', '加重', '超轻'],
      '容量': ['250ml', '500ml', '750ml', '1L', '2L'],
      '型号': ['基础版', '标准版', '高级版', '专业版'],
      '产地': ['国产', '进口', '合资', '代工'],
      '保质期': ['3个月', '6个月', '1年', '2年', '3年']
    };

    const values = valueMap[attributeName] || ['选项1', '选项2', '选项3', '选项4'];
    return this.getRandomItems(values, this.getRandomNumber(2, Math.min(5, values.length)));
  }

  /**
   * 查找预定义的属性模板
   * @param categoryName 类目名称
   * @returns 属性列表或null
   */
  private findPredefinedAttributeTemplate(categoryName: string): CreateAttributeRequest[] | null {
    for (const [key, template] of Object.entries(ATTRIBUTE_TEMPLATES)) {
      if (categoryName.includes(key)) {
        return template.map(attr => ({
          name: attr.name,
          type: attr.type,
          required: attr.required,
          optionalValues: attr.optionalValues,
          placeholder: attr.placeholder,
          description: attr.description,
          sortOrder: 1
        }));
      }
    }
    return null;
  }

  /**
   * 生成随机名称列表
   * @param prefix 名称前缀
   * @param count 数量
   * @returns 名称列表
   */
  private generateRandomNames(prefix: string, count: number): string[] {
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      names.push(`${prefix}${i + 1}`);
    }
    return names;
  }

  /**
   * 从数组中随机获取指定数量的元素
   * @param array 源数组
   * @param count 数量
   * @returns 随机元素数组
   */
  private getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }

  /**
   * 生成指定范围内的随机数
   * @param min 最小值
   * @param max 最大值
   * @returns 随机数
   */
  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

/**
 * localStorage数据管理器
 */
export class CategoryDataPersistence {
  private static readonly STORAGE_KEY = 'category-mock-data';

  /**
   * 保存数据到localStorage
   * @param categories 类目列表
   * @param attributeTemplates 属性模板
   */
  static saveToStorage(categories: Category[], attributeTemplates: Record<string, AttributeTemplate>): void {
    try {
      const data = {
        categories,
        attributeTemplates,
        version: '1.0.0',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('保存Mock数据到localStorage失败:', error);
    }
  }

  /**
   * 从localStorage加载数据
   * @returns 数据对象或null
   */
  static loadFromStorage(): {
    categories: Category[];
    attributeTemplates: Record<string, AttributeTemplate>;
  } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // 验证数据结构
      if (!data.categories || !Array.isArray(data.categories)) {
        return null;
      }

      return {
        categories: data.categories,
        attributeTemplates: data.attributeTemplates || {}
      };
    } catch (error) {
      console.warn('从localStorage加载Mock数据失败:', error);
      return null;
    }
  }

  /**
   * 清除localStorage中的数据
   */
  static clearStorage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('清除localStorage数据失败:', error);
    }
  }

  /**
   * 检查localStorage中是否有数据
   * @returns 是否有数据
   */
  static hasData(): boolean {
    return this.loadFromStorage() !== null;
  }
}

/**
 * 便捷函数：获取Mock数据
 * @param config 配置选项
 * @param useStorage 是否使用localStorage缓存
 * @returns Mock数据集
 */
export function getCategoryMockData(
  config: MockDataConfig = DEFAULT_MOCK_CONFIG,
  useStorage: boolean = true
): { categories: Category[]; attributeTemplates: Record<string, AttributeTemplate> } {
  // 如果启用存储且存在缓存数据，直接返回
  if (useStorage && CategoryDataPersistence.hasData()) {
    const storedData = CategoryDataPersistence.loadFromStorage();
    if (storedData) {
      return storedData;
    }
  }

  // 生成新的Mock数据
  const generator = new CategoryMockDataGenerator(config);
  const mockData = generator.generateCompleteDataSet();

  // 如果启用存储，保存到localStorage
  if (useStorage) {
    CategoryDataPersistence.saveToStorage(mockData.categories, mockData.attributeTemplates);
  }

  return mockData;
}

/**
 * 便捷函数：生成指定数量的类目
 * @param count 类目数量
 * @param level 类目层级
 * @param parentId 父类目ID
 * @returns 类目列表
 */
export function generateCategoryList(
  count: number,
  level: CategoryLevel,
  parentId?: string
): Category[] {
  const generator = new CategoryMockDataGenerator();
  const categories: Category[] = [];

  for (let i = 0; i < count; i++) {
    const category = generator.createCategory({
      name: `类目${i + 1}`,
      level,
      parentId,
      sortOrder: i + 1
    });
    categories.push(category);
  }

  return categories;
}

/**
 * 便捷函数：生成示例属性模板
 * @param categoryId 类目ID
 * @param categoryName 类目名称
 * @returns 属性模板
 */
export function generateSampleAttributeTemplate(
  categoryId: string,
  categoryName: string
): AttributeTemplate {
  const generator = new CategoryMockDataGenerator();
  const mockDataSet = generator.generateCompleteDataSet();

  // 查找匹配的属性模板
  for (const [catId, template] of Object.entries(mockDataSet.attributeTemplates)) {
    if (catId === categoryId) {
      return { ...template, categoryId };
    }
  }

  // 如果没有找到匹配的，生成一个简单的模板
  return {
    id: `template-${categoryId}`,
    categoryId,
    attributes: [
      {
        id: 'attr-001',
        name: '名称',
        type: 'text',
        required: true,
        placeholder: '请输入名称',
        description: '示例属性',
        sortOrder: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// 导出默认实例
export default {
  Generator: CategoryMockDataGenerator,
  Persistence: CategoryDataPersistence,
  getMockData: getCategoryMockData,
  generateCategoryList,
  generateSampleAttributeTemplate
};
