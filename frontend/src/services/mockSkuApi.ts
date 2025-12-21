/**
 * SKU Mock API服务
 * 用于开发阶段的模拟数据和API响应
 */

import type {
  SKU,
  SkuQueryParams,
  SkuListResponse,
  SkuFormData,
  SalesUnit,
  Barcode,
  SPU,
  Unit,
} from '@/types/sku';
import { SkuStatus } from '@/types/sku';
import {
  generateId,
  generateRandomNumber,
  generateRandomChoice,
  generateRandomDate,
  generateRandomDateTime,
} from '@/data/mockData';

// 预定义品牌列表
const BRANDS = [
  '可口可乐', '百事可乐', '康师傅', '统一', '农夫山泉',
  '娃哈哈', '蒙牛', '伊利', '光明', '雀巢',
  '星巴克', '三只松鼠', '良品铺子', '来伊份', '洽洽',
  '德芙', '费列罗', '好时', '士力架', '奥利奥',
];

// 预定义类目列表
const CATEGORIES = [
  { id: 'cat_001', name: '饮料 > 碳酸饮料', path: '饮料 > 碳酸饮料' },
  { id: 'cat_002', name: '饮料 > 果汁饮料', path: '饮料 > 果汁饮料' },
  { id: 'cat_003', name: '饮料 > 茶饮料', path: '饮料 > 茶饮料' },
  { id: 'cat_004', name: '饮料 > 功能饮料', path: '饮料 > 功能饮料' },
  { id: 'cat_005', name: '零食 > 膨化食品', path: '零食 > 膨化食品' },
  { id: 'cat_006', name: '零食 > 坚果炒货', path: '零食 > 坚果炒货' },
  { id: 'cat_007', name: '零食 > 糖果巧克力', path: '零食 > 糖果巧克力' },
  { id: 'cat_008', name: '零食 > 饼干糕点', path: '零食 > 饼干糕点' },
  { id: 'cat_009', name: '乳制品 > 纯牛奶', path: '乳制品 > 纯牛奶' },
  { id: 'cat_010', name: '乳制品 > 酸奶', path: '乳制品 > 酸奶' },
];

// 预定义单位列表
const UNITS: Unit[] = [
  { id: 'unit_001', code: 'BOTTLE', name: '瓶', type: 'inventory' },
  { id: 'unit_002', code: 'CAN', name: '听', type: 'inventory' },
  { id: 'unit_003', code: 'BAG', name: '袋', type: 'inventory' },
  { id: 'unit_004', code: 'BOX', name: '箱', type: 'sales' },
  { id: 'unit_005', code: 'DOZEN', name: '打', type: 'sales' },
  { id: 'unit_006', code: 'PACK', name: '包', type: 'inventory' },
  { id: 'unit_007', code: 'CARTON', name: '盒', type: 'inventory' },
  { id: 'unit_008', code: 'PIECE', name: '个', type: 'inventory' },
];

// 预定义SPU列表（生成50-100个）
const generateMockSpus = (): SPU[] => {
  const spus: SPU[] = [];
  const spuCount = generateRandomNumber(50, 100);
  
  for (let i = 1; i <= spuCount; i++) {
    const brand = generateRandomChoice(BRANDS);
    const category = generateRandomChoice(CATEGORIES);
    spus.push({
      id: `spu_${String(i).padStart(6, '0')}`,
      code: `SPU${String(i).padStart(6, '0')}`,
      name: `${brand}${generateRandomChoice(['经典', '原味', '特制', '精选', '优选'])}`,
      brand,
      category: category.path,
      categoryId: category.id,
    });
  }
  
  return spus;
};

const MOCK_SPUS = generateMockSpus();

// 生成EAN13格式条码
const generateEAN13Barcode = (): string => {
  let barcode = '690';
  for (let i = 0; i < 10; i++) {
    barcode += Math.floor(Math.random() * 10).toString();
  }
  return barcode;
};

// 生成销售单位配置
const generateSalesUnits = (mainUnitId: string): SalesUnit[] => {
  const salesUnits: SalesUnit[] = [];
  const salesUnitCount = generateRandomNumber(0, 3);
  const salesUnitOptions = UNITS.filter(u => u.type === 'sales');
  
  for (let i = 0; i < salesUnitCount; i++) {
    const unit = generateRandomChoice(salesUnitOptions);
    salesUnits.push({
      id: generateId('su'),
      unit: unit.name,
      unitId: unit.id,
      conversionRate: generateRandomChoice([2, 3, 4, 6, 12, 24]),
      enabled: true,
      sortOrder: i,
    });
  }
  
  return salesUnits;
};

// 生成其他条码列表
const generateOtherBarcodes = (): Barcode[] => {
  const barcodes: Barcode[] = [];
  const barcodeCount = generateRandomNumber(0, 2);
  
  for (let i = 0; i < barcodeCount; i++) {
    barcodes.push({
      id: generateId('barcode'),
      code: generateEAN13Barcode(),
      type: 'EAN13',
      remark: `备用条码${i + 1}`,
    });
  }
  
  return barcodes;
};

// 生成单个SKU
const generateSingleSku = (index: number): SKU => {
  const spu = generateRandomChoice(MOCK_SPUS);
  const mainUnit = generateRandomChoice(UNITS.filter(u => u.type === 'inventory'));
  const statusOptions: SkuStatus[] = [SkuStatus.DRAFT, SkuStatus.ENABLED, SkuStatus.DISABLED];
  const statusWeights = [0.2, 0.6, 0.2]; // 草稿20%，启用60%，停用20%
  const random = Math.random();
  let status: SkuStatus;
  if (random < statusWeights[0]) {
    status = SkuStatus.DRAFT;
  } else if (random < statusWeights[0] + statusWeights[1]) {
    status = SkuStatus.ENABLED;
  } else {
    status = SkuStatus.DISABLED;
  }
  
  const specOptions = ['330ml', '500ml', '1L', '250ml', '1.5L', '2L', '大份', '中份', '小份'];
  const flavorOptions = ['原味', '柠檬味', '草莓味', '葡萄味', '橙子味', '苹果味', undefined];
  const packagingOptions = ['瓶装', '听装', '袋装', '盒装', '罐装'];
  
  const createdAt = generateRandomDateTime(new Date('2024-01-01'), new Date());
  const updatedAt = generateRandomDateTime(new Date(createdAt), new Date());
  
  return {
    id: generateId('sku'),
    code: `SKU${String(index).padStart(6, '0')}`,
    name: `${spu.name}${generateRandomChoice(specOptions)}${generateRandomChoice(['', '瓶装', '听装', '袋装'])}`,
    spuId: spu.id,
    spuName: spu.name,
    brand: spu.brand,
    category: spu.category,
    categoryId: spu.categoryId,
    spec: generateRandomChoice(specOptions),
    flavor: generateRandomChoice(flavorOptions),
    packaging: generateRandomChoice(packagingOptions),
    mainUnit: mainUnit.name,
    mainUnitId: mainUnit.id,
    salesUnits: generateSalesUnits(mainUnit.id),
    mainBarcode: generateEAN13Barcode(),
    otherBarcodes: generateOtherBarcodes(),
    manageInventory: generateRandomChoice([true, true, true, false]), // 75%管理库存
    allowNegativeStock: false,
    minOrderQty: generateRandomChoice([undefined, 10, 20, 50, 100]),
    minSaleQty: generateRandomChoice([undefined, 1, 2, 5]),
    status,
    createdAt,
    updatedAt,
    createdBy: generateId('user'),
    createdByName: generateRandomChoice(['张三', '李四', '王五', '赵六', '钱七']),
    updatedBy: generateId('user'),
    updatedByName: generateRandomChoice(['张三', '李四', '王五', '赵六', '钱七']),
    bomCount: generateRandomNumber(0, 5),
    priceRuleCount: generateRandomNumber(0, 10),
    stockTotal: generateRandomNumber(0, 10000),
    scenePackageCount: generateRandomNumber(0, 3),
  };
};

// 生成Mock SKU数据
let mockSkus: SKU[] = [];

export const generateMockSkus = (): SKU[] => {
  if (mockSkus.length === 0) {
    mockSkus = [];
    for (let i = 1; i <= 1000; i++) {
      mockSkus.push(generateSingleSku(i));
    }
  }
  return mockSkus;
};

// 初始化Mock数据
generateMockSkus();

/**
 * 获取SKU列表（支持筛选、排序、分页）
 */
export const getSkus = async (params: SkuQueryParams): Promise<SkuListResponse> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  
  let filtered = [...mockSkus];
  
  // 关键字搜索
  if (params.keyword) {
    const keyword = params.keyword.toLowerCase();
    filtered = filtered.filter(sku =>
      sku.code.toLowerCase().includes(keyword) ||
      sku.name.toLowerCase().includes(keyword) ||
      sku.mainBarcode.includes(keyword) ||
      sku.otherBarcodes.some(b => b.code.includes(keyword))
    );
  }
  
  // SPU筛选
  if (params.spuId) {
    filtered = filtered.filter(sku => sku.spuId === params.spuId);
  }
  
  // 品牌筛选
  if (params.brand) {
    filtered = filtered.filter(sku => sku.brand === params.brand);
  }
  
  // 类目筛选
  if (params.categoryId) {
    filtered = filtered.filter(sku => sku.categoryId === params.categoryId);
  }
  
  // 状态筛选
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter(sku => sku.status === params.status);
  }
  
  // 是否管理库存筛选
  if (params.manageInventory !== undefined) {
    filtered = filtered.filter(sku => sku.manageInventory === params.manageInventory);
  }
  
  // 排序
  const sortField = params.sortField || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';
  
  filtered.sort((a, b) => {
    let aValue: any = a[sortField as keyof SKU];
    let bValue: any = b[sortField as keyof SKU];
    
    if (sortField === 'createdAt' || sortField === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = filtered.slice(start, end);
  
  return {
    items: paginatedItems,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  };
};

/**
 * 根据ID获取SKU详情
 */
export const getSkuById = async (id: string): Promise<SKU> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const sku = mockSkus.find(s => s.id === id);
  if (!sku) {
    throw new Error(`SKU with id ${id} not found`);
  }
  return sku;
};

/**
 * 创建新SKU
 */
export const createSku = async (formData: SkuFormData): Promise<SKU> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // 检查条码重复
  if (formData.mainBarcode) {
    const existing = mockSkus.find(s => s.mainBarcode === formData.mainBarcode);
    if (existing) {
      throw new Error('主条码已存在');
    }
  }
  
  // 检查其他条码重复
  if (formData.otherBarcodes) {
    for (const barcode of formData.otherBarcodes) {
      const existing = mockSkus.find(s =>
        s.mainBarcode === barcode.code ||
        s.otherBarcodes.some(b => b.code === barcode.code)
      );
      if (existing) {
        throw new Error(`条码 ${barcode.code} 已存在`);
      }
    }
  }
  
  const spu = MOCK_SPUS.find(s => s.id === formData.spuId);
  if (!spu) {
    throw new Error('SPU不存在');
  }
  
  const mainUnit = UNITS.find(u => u.id === formData.mainUnitId);
  if (!mainUnit) {
    throw new Error('单位不存在');
  }
  
  const now = new Date().toISOString();
  const nextCode = `SKU${String(mockSkus.length + 1).padStart(6, '0')}`;
  
  const newSku: SKU = {
    id: generateId('sku'),
    code: nextCode,
    name: formData.name,
    spuId: formData.spuId,
    spuName: spu.name,
    brand: spu.brand,
    category: spu.category,
    categoryId: spu.categoryId,
    spec: formData.spec || '',
    flavor: formData.flavor,
    packaging: formData.packaging,
    mainUnit: mainUnit.name,
    mainUnitId: formData.mainUnitId,
    salesUnits: formData.salesUnits.map((su, index) => ({
      id: generateId('su'),
      unit: UNITS.find(u => u.id === su.unitId)?.name || '',
      unitId: su.unitId,
      conversionRate: su.conversionRate,
      enabled: su.enabled,
      sortOrder: index,
    })),
    mainBarcode: formData.mainBarcode || '',
    otherBarcodes: formData.otherBarcodes.map(b => ({
      id: generateId('barcode'),
      code: b.code,
      type: 'EAN13',
      remark: b.remark,
    })),
    manageInventory: formData.manageInventory,
    allowNegativeStock: formData.allowNegativeStock,
    minOrderQty: formData.minOrderQty,
    minSaleQty: formData.minSaleQty,
    status: formData.status,
    createdAt: now,
    updatedAt: now,
    createdBy: generateId('user'),
    createdByName: '当前用户',
    updatedBy: generateId('user'),
    updatedByName: '当前用户',
  };
  
  mockSkus.unshift(newSku); // 添加到开头
  return newSku;
};

/**
 * 更新SKU
 */
export const updateSku = async (id: string, formData: SkuFormData): Promise<SKU> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = mockSkus.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error(`SKU with id ${id} not found`);
  }
  
  const existingSku = mockSkus[index];
  
  // 检查条码重复（排除当前SKU）
  if (formData.mainBarcode && formData.mainBarcode !== existingSku.mainBarcode) {
    const duplicate = mockSkus.find(s => s.id !== id && s.mainBarcode === formData.mainBarcode);
    if (duplicate) {
      throw new Error('主条码已存在');
    }
  }
  
  // 检查其他条码重复
  if (formData.otherBarcodes) {
    for (const barcode of formData.otherBarcodes) {
      const duplicate = mockSkus.find(s =>
        s.id !== id &&
        (s.mainBarcode === barcode.code ||
          s.otherBarcodes.some(b => b.code === barcode.code))
      );
      if (duplicate) {
        throw new Error(`条码 ${barcode.code} 已存在`);
      }
    }
  }
  
  const spu = MOCK_SPUS.find(s => s.id === formData.spuId);
  if (!spu) {
    throw new Error('SPU不存在');
  }
  
  const mainUnit = UNITS.find(u => u.id === formData.mainUnitId);
  if (!mainUnit) {
    throw new Error('单位不存在');
  }
  
  const updatedSku: SKU = {
    ...existingSku,
    name: formData.name,
    spuId: formData.spuId,
    spuName: spu.name,
    brand: spu.brand,
    category: spu.category,
    categoryId: spu.categoryId,
    spec: formData.spec || '',
    flavor: formData.flavor,
    packaging: formData.packaging,
    mainUnit: mainUnit.name,
    mainUnitId: formData.mainUnitId,
    salesUnits: formData.salesUnits.map((su, idx) => ({
      id: generateId('su'),
      unit: UNITS.find(u => u.id === su.unitId)?.name || '',
      unitId: su.unitId,
      conversionRate: su.conversionRate,
      enabled: su.enabled,
      sortOrder: idx,
    })),
    mainBarcode: formData.mainBarcode || '',
    otherBarcodes: formData.otherBarcodes.map(b => ({
      id: generateId('barcode'),
      code: b.code,
      type: 'EAN13',
      remark: b.remark,
    })),
    manageInventory: formData.manageInventory,
    allowNegativeStock: formData.allowNegativeStock,
    minOrderQty: formData.minOrderQty,
    minSaleQty: formData.minSaleQty,
    status: formData.status,
    updatedAt: new Date().toISOString(),
    updatedBy: generateId('user'),
    updatedByName: '当前用户',
  };
  
  mockSkus[index] = updatedSku;
  return updatedSku;
};

/**
 * 切换SKU状态
 */
export const toggleSkuStatus = async (id: string, status: SkuStatus): Promise<SKU> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const index = mockSkus.findIndex(s => s.id === id);
  if (index === -1) {
    throw new Error(`SKU with id ${id} not found`);
  }
  
  const sku = mockSkus[index];
  
  // 状态转换验证
  if (sku.status === SkuStatus.DRAFT && status === SkuStatus.DISABLED) {
    throw new Error('草稿状态不能直接停用，请先启用');
  }
  
  const updatedSku: SKU = {
    ...sku,
    status,
    updatedAt: new Date().toISOString(),
    updatedBy: generateId('user'),
    updatedByName: '当前用户',
  };
  
  mockSkus[index] = updatedSku;
  return updatedSku;
};

/**
 * 检查条码是否重复
 */
export const checkBarcodeDuplicate = async (
  barcode: string,
  excludeSkuId?: string
): Promise<{ available: boolean; message: string }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const duplicate = mockSkus.find(s =>
    s.id !== excludeSkuId &&
    (s.mainBarcode === barcode || s.otherBarcodes.some(b => b.code === barcode))
  );
  
  if (duplicate) {
    return {
      available: false,
      message: `条码 ${barcode} 已被SKU ${duplicate.code} 使用`,
    };
  }
  
  return {
    available: true,
    message: '条码可用',
  };
};

/**
 * 检查SKU名称是否重复
 */
export const checkSkuNameDuplicate = async (
  name: string,
  excludeSkuId?: string
): Promise<{ available: boolean; message: string }> => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const duplicate = mockSkus.find(s => s.id !== excludeSkuId && s.name === name);
  
  if (duplicate) {
    return {
      available: false,
      message: `SKU名称 "${name}" 已存在`,
    };
  }
  
  return {
    available: true,
    message: '名称可用',
  };
};

/**
 * 获取SPU列表（供选择器使用）
 */
export const getSpus = async (): Promise<SPU[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_SPUS;
};

/**
 * 获取单位列表（供选择器使用）
 */
export const getUnits = async (): Promise<Unit[]> => {
  await new Promise(resolve => setTimeout(resolve, 50));
  return UNITS;
};

