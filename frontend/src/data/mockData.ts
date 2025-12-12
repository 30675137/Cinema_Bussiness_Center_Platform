/**
 * Mock数据基础框架
 */

import dayjs from 'dayjs';
import { faker } from '@faker-js/faker';

// 设置中文本地化
faker.locale = 'zh_CN';

/**
 * 生成随机ID
 */
export const generateId = (prefix = '', length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}_${result}` : result;
};

/**
 * 生成随机数字
 */
export const generateRandomNumber = (min = 0, max = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 生成随机布尔值
 */
export const generateRandomBoolean = (probability = 0.5): boolean => {
  return Math.random() < probability;
};

/**
 * 生成随机选择
 */
export const generateRandomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 生成随机日期
 */
export const generateRandomDate = (
  start: Date | string,
  end: Date | string = new Date()
): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  return dayjs(randomTime).format('YYYY-MM-DD');
};

/**
 * 生成随机时间
 */
export const generateRandomTime = (): string => {
  const hours = Math.floor(Math.random() * 24);
  const minutes = Math.floor(Math.random() * 60);
  const seconds = Math.floor(Math.random() * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * 生成随机日期时间
 */
export const generateRandomDateTime = (
  start?: Date | string,
  end?: Date | string
): string => {
  const date = generateRandomDate(start || dayjs().subtract(1, 'year'), end || new Date());
  const time = generateRandomTime();
  return `${date} ${time}`;
};

/**
 * 生成随机文本
 */
export const generateRandomText = (minLength = 1, maxLength = 100): string => {
  const length = generateRandomNumber(minLength, maxLength);
  const chars = '这是用于生成随机中文文本的测试字符串包含常用汉字';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * 生成随机公司名称
 */
export const generateCompanyName = (): string => {
  const prefixes = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆'];
  const mids = ['科技', '贸易', '实业', '电子', '网络', '信息', '文化', '传媒', '咨询', '管理'];
  const suffixes = ['有限公司', '有限责任公司', '股份有限公司', '集团', '控股公司'];

  return `${generateRandomChoice(prefixes)}${generateRandomChoice(mids)}${generateRandomChoice(suffixes)}`;
};

/**
 * 生成随机人名
 */
export const generateRandomName = (): string => {
  const surnames = ['张', '王', '李', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '何', '高', '林'];
  const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超'];

  return `${generateRandomChoice(surnames)}${generateRandomChoice(names)}`;
};

/**
 * 生成随机手机号
 */
export const generateRandomPhone = (): string => {
  const prefixes = ['138', '139', '150', '151', '152', '153', '155', '156', '157', '158', '159', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189'];
  const prefix = generateRandomChoice(prefixes);
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${prefix}${suffix}`;
};

/**
 * 生成随机邮箱
 */
export const generateRandomEmail = (name?: string): string => {
  const domains = ['qq.com', '163.com', 'gmail.com', 'outlook.com', '126.com', 'sina.com', 'sohu.com'];
  const username = name ? `${name.toLowerCase()}${generateRandomNumber(1, 99)}` : `user${generateRandomNumber(100, 999)}`;
  const domain = generateRandomChoice(domains);
  return `${username}@${domain}`;
};

/**
 * 生成随机地址
 */
export const generateRandomAddress = () => {
  const provinces = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '四川省', '湖北省', '湖南省', '河南省', '山东省'];
  const cities = ['北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '西安市', '南京市', '重庆市'];
  const districts = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '石景山区', '通州区', '昌平区', '大兴区', '顺义区'];

  return {
    country: '中国',
    province: generateRandomChoice(provinces),
    city: generateRandomChoice(cities),
    district: generateRandomChoice(districts),
    detail: `${generateRandomNumber(1, 200)}号${generateRandomChoice(1, 20)}单元${generateRandomNumber(1, 6)}号`,
    zipCode: generateRandomNumber(100000, 999999).toString()
  };
};

/**
 * Mock数据存储管理器
 */
export class MockDataManager {
  private storage: Map<string, any[]> = new Map();
  private maxItems: number = 1000;

  constructor(maxItems?: number) {
    this.maxItems = maxItems || 1000;
  }

  /**
   * 初始化数据存储
   */
  initializeStorage(key: string, initialData?: any[]): void {
    if (this.storage.has(key)) {
      return; // 已初始化
    }

    const data = initialData || [];
    this.storage.set(key, data);
    this.saveToLocalStorage(key);
  }

  /**
   * 获取数据
   */
  getData<T>(key: string): T[] {
    if (!this.storage.has(key)) {
      this.initializeStorage(key);
    }
    return this.storage.get(key) as T[];
  }

  /**
   * 添加数据
   */
  addItem<T>(key: string, item: T): T {
    const data = this.getData<T>(key);
    data.push(item);

    // 限制数据量
    if (data.length > this.maxItems) {
      data.shift();
    }

    this.storage.set(key, data);
    this.saveToLocalStorage(key);
    return item;
  }

  /**
   * 批量添加数据
   */
  addItems<T>(key: string, items: T[]): T[] {
    const data = this.getData<T>(key);
    items.forEach(item => this.addItem(key, item));
    return items;
  }

  /**
   * 更新数据
   */
  updateItem<T>(key: string, id: string, updates: Partial<T>): T | null {
    const data = this.getData<T>(key);
    const index = data.findIndex(item => (item as any).id === id);

    if (index === -1) {
      return null;
    }

    const updatedItem = { ...data[index], ...updates };
    data[index] = updatedItem;
    this.storage.set(key, data);
    this.saveToLocalStorage(key);
    return updatedItem;
  }

  /**
   * 删除数据
   */
  removeItem(key: string, id: string): boolean {
    const data = this.getData<T>(key);
    const index = data.findIndex(item => (item as any).id === id);

    if (index === -1) {
      return false;
    }

    data.splice(index, 1);
    this.storage.set(key, data);
    this.saveToLocalStorage(key);
    return true;
  }

  /**
   * 清空数据
   */
  clearData(key: string): void {
    this.storage.set(key, []);
    this.saveToLocalStorage(key);
  }

  /**
   * 保存到LocalStorage
   */
  private saveToLocalStorage(key: string): void {
    try {
      localStorage.setItem(`mock_${key}`, JSON.stringify(this.storage.get(key)));
    } catch (error) {
      console.warn(`Failed to save mock data for ${key}:`, error);
    }
  }

  /**
   * 从LocalStorage加载
   */
  private loadFromLocalStorage(key: string): any[] {
    try {
      const stored = localStorage.getItem(`mock_${key}`);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch (error) {
      console.warn(`Failed to load mock data for ${key}:`, error);
      return [];
    }
  }

  /**
   * 初始化存储（从LocalStorage加载）
   */
  initializeFromLocalStorage(): void {
    // 预定义的键列表
    const keys = [
      'purchaseOrders',
      'goodsReceipts',
      'suppliers',
      'products',
      'warehouses',
      'users'
    ];

    keys.forEach(key => {
      if (!this.storage.has(key)) {
        const data = this.loadFromLocalStorage(key);
        this.storage.set(key, data);
      }
    });
  }
}

/**
 * 创建全局Mock数据管理器实例
 */
export const mockDataManager = new MockDataManager(1000);

/**
 * 初始化Mock数据
 */
export const initializeMockData = (): void => {
  mockDataManager.initializeFromLocalStorage();

  // 如果没有数据，创建初始数据
  const keys = ['purchaseOrders', 'goodsReceipts', 'suppliers', 'products', 'warehouses', 'users'];
  const needsInitialization = keys.some(key => mockDataManager.getData(key).length === 0);

  if (needsInitialization) {
    console.log('Initializing mock data...');
    // 这里会在实际实现中创建初始数据
  }
};

/**
 * 获取分页数据
 */
export const getPaginatedData = <T>(
  key: string,
  page: number = 1,
  pageSize: number = 20,
  filters?: Record<string, any>
): {
  items: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
} => {
  let data = mockDataManager.getData<T>(key);

  // 应用过滤器
  if (filters) {
    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        data = data.filter((item: any) => {
          const itemValue = (item as any)[field];
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(String(value).toLowerCase());
          }
          return itemValue === value;
        });
      }
    });
  }

  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const items = data.slice(startIndex, endIndex);

  return {
    items,
    pagination: {
      current: page,
      pageSize,
      total,
      totalPages
    }
  };
};

/**
 * 创建Mock数据生成器
 */
export const createMockDataGenerator = <T>(
  generator: (index: number) => T
) => {
  return (count: number): T[] => {
    return Array.from({ length: count }, (_, index) => generator(index));
  };
};

export default {
  generateId,
  generateRandomNumber,
  generateRandomBoolean,
  generateRandomChoice,
  generateRandomDate,
  generateRandomTime,
  generateRandomDateTime,
  generateRandomText,
  generateCompanyName,
  generateRandomName,
  generateRandomPhone,
  generateRandomEmail,
  generateRandomAddress,
  MockDataManager,
  mockDataManager,
  initializeMockData,
  getPaginatedData,
  createMockDataGenerator,
};