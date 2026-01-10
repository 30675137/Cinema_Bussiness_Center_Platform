/**
 * SKU服务层
 * 提供SKU相关的业务逻辑封装
 * 调用后端真实API，关联SPU服务获取完整信息
 */

import type {
  SKU,
  SKUDetail,
  SkuQueryParams,
  SkuListResponse,
  SkuFormData,
  SPU,
  Unit,
  SkuType,
} from '@/types/sku';
import { SkuStatus } from '@/types/sku';
import { apiService } from './api';

/**
 * SKU服务接口
 */
export interface ISkuService {
  /**
   * 获取SKU列表
   */
  getSkus(params: SkuQueryParams): Promise<SkuListResponse>;

  /**
   * 根据ID获取SKU详情
   */
  getSkuById(id: string): Promise<SKUDetail>;

  /**
   * 创建新SKU
   */
  createSku(formData: SkuFormData): Promise<SKUDetail>;

  /**
   * 更新SKU
   */
  updateSku(id: string, formData: SkuFormData): Promise<SKUDetail>;

  /**
   * 切换SKU状态
   */
  toggleSkuStatus(id: string, status: SkuStatus): Promise<SKU>;

  /**
   * 检查条码是否重复
   */
  checkBarcodeDuplicate(
    barcode: string,
    excludeSkuId?: string
  ): Promise<{ available: boolean; message: string }>;

  /**
   * 检查SKU名称是否重复
   */
  checkSkuNameDuplicate(
    name: string,
    excludeSkuId?: string
  ): Promise<{ available: boolean; message: string }>;

  /**
   * 获取SPU列表
   */
  getSpus(): Promise<SPU[]>;

  /**
   * 获取单位列表
   */
  getUnits(): Promise<Unit[]>;

  /**
   * 更新BOM配方
   */
  updateBom(
    skuId: string,
    components: Array<{
      componentId: string;
      quantity: number;
      unit: string;
      isOptional?: boolean;
      sortOrder?: number;
    }>,
    wasteRate?: number
  ): Promise<{ calculatedCost: number }>;

  /**
   * 更新套餐子项
   */
  updateComboItems(
    skuId: string,
    items: Array<{
      subItemId: string;
      quantity: number;
      unit: string;
      sortOrder?: number;
    }>
  ): Promise<{ calculatedCost: number }>;

  /**
   * 批量删除SKU
   * @spec B001-fix-brand-creation
   */
  batchDeleteSkus(ids: string[]): Promise<{ success: number; failed: number }>;
}

/**
 * 后端BOM组件数据结构
 */
interface BackendBomComponent {
  id: string;
  finishedProductId?: string;
  finished_product_id?: string;
  componentId?: string;
  component_id?: string;
  quantity: number;
  unit: string;
  unitCost?: number;
  unit_cost?: number;
  isOptional?: boolean;
  is_optional?: boolean;
  sortOrder?: number;
  sort_order?: number;
  component?: {
    id: string;
    name: string;
    code: string;
  };
}

/**
 * 后端SKU数据结构（API返回格式 - 兼容 camelCase 和 snake_case）
 * 注意：列表API返回 snake_case，详情API返回 camelCase
 */
interface BackendSkuData {
  id: string;
  code: string;
  name: string;
  // camelCase from detail API
  spuId?: string;
  skuType?: string;
  mainUnit?: string;
  storeScope?: string[];
  standardCost?: number | null;
  wasteRate?: number | null;
  price?: number | null; // 零售价
  createdAt?: string;
  updatedAt?: string;
  // snake_case from list API
  spu_id?: string;
  sku_type?: string;
  main_unit?: string;
  store_scope?: string[];
  standard_cost?: number | null;
  waste_rate?: number | null;
  price_?: number | null; // 零售价 (snake_case 备用)
  created_at?: string;
  updated_at?: string;
  // BOM配方（仅成品类型）
  bom?: BackendBomComponent[] | null;
  // 套餐子项（仅套餐类型）
  comboItems?: any[] | null;
  combo_items?: any[] | null;
  // common
  status: string;
}

// SPU缓存，避免重复查询
let spuCache: Map<string, BackendSpu> = new Map();
let spuCacheTime: number = 0;
const SPU_CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 后端SPU数据结构（API返回格式 - snake_case）
 */
interface BackendSpu {
  id: string;
  code: string;
  name: string;
  short_name?: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  product_type?: string; // 产品类型: raw_material, packaging, finished_product, combo
  status: string;
  unit?: string;
  tags?: string[];
  specifications?: Array<{ name: string; value: string }>; // 规格列表
  created_at?: string;
  updated_at?: string;
}

/**
 * 根据后端SPU ID获取SPU信息（从后端API缓存）
 */
function getSpuInfoById(
  spuId: string,
  spuMap?: Map<string, BackendSpu>
): { name: string; brand: string; category: string; spec: string } | null {
  // 从缓存中查找
  const cachedSpu = spuMap?.get(spuId);
  if (cachedSpu) {
    // 将规格列表拼接为字符串
    const specStr = cachedSpu.specifications?.map((s) => `${s.name}:${s.value}`).join(', ') || '';
    return {
      name: cachedSpu.name,
      brand: cachedSpu.brand_name || '',
      category: cachedSpu.category_name || '',
      spec: specStr,
    };
  }

  return null;
}

/**
 * 获取SPU缓存（从后端/api/spus获取）
 */
async function getSpuCache(): Promise<Map<string, BackendSpu>> {
  const now = Date.now();
  if (spuCache.size === 0 || now - spuCacheTime > SPU_CACHE_TTL) {
    try {
      // 从后端API获取SPU列表
      const response = await apiService.get<{
        success: boolean;
        data: BackendSpu[];
        total: number;
      }>('/spus?pageSize=1000');

      const backendResponse = response as unknown as {
        success: boolean;
        data: BackendSpu[];
      };

      if (backendResponse.success && backendResponse.data) {
        spuCache = new Map();
        backendResponse.data.forEach((spu) => {
          spuCache.set(spu.id, spu);
        });
        spuCacheTime = now;
      }
    } catch (error) {
      console.error('Failed to fetch SPU cache from backend:', error);
    }
  }
  return spuCache;
}

/**
 * 将后端SKU数据转换为前端格式
 */
function transformBackendSku(
  backendSku: BackendSkuData,
  spuMap?: Map<string, BackendSpu>
): SKUDetail {
  // 兼容 camelCase 和 snake_case（列表API返回snake_case，详情API返回camelCase）
  const spuId = backendSku.spuId || backendSku.spu_id || '';
  const skuType = backendSku.skuType || backendSku.sku_type || '';
  const mainUnit = backendSku.mainUnit || backendSku.main_unit || '';
  const storeScope = backendSku.storeScope || backendSku.store_scope || [];
  const standardCost = backendSku.standardCost ?? backendSku.standard_cost ?? undefined;
  const wasteRate = backendSku.wasteRate ?? backendSku.waste_rate ?? undefined;
  const price = backendSku.price ?? undefined;
  const createdAt = backendSku.createdAt || backendSku.created_at || '';
  const updatedAt = backendSku.updatedAt || backendSku.updated_at || '';

  // 获取SPU关联信息
  const spuInfo = getSpuInfoById(spuId, spuMap);

  // 处理BOM配方数据
  let bomComponents: any[] | undefined;
  if (backendSku.bom && Array.isArray(backendSku.bom)) {
    bomComponents = backendSku.bom.map((bom: BackendBomComponent) => ({
      id: bom.id,
      componentId: bom.componentId || bom.component_id || '',
      componentName: bom.component?.name || '',
      quantity: bom.quantity,
      unit: bom.unit,
      unitCost: bom.unitCost ?? bom.unit_cost ?? 0,
      totalCost: (bom.quantity || 0) * (bom.unitCost ?? bom.unit_cost ?? 0),
      isOptional: bom.isOptional ?? bom.is_optional ?? false,
      sortOrder: bom.sortOrder ?? bom.sort_order ?? 0,
    }));
  }

  // 处理套餐子项数据
  let comboItems: any[] | undefined;
  const rawComboItems = backendSku.comboItems || backendSku.combo_items;
  if (rawComboItems && Array.isArray(rawComboItems)) {
    comboItems = rawComboItems.map((item: any) => ({
      id: item.id,
      subItemId: item.subItemId || item.sub_item_id || '',
      subItemName: item.subItem?.name || item.sub_item?.name || '',
      quantity: item.quantity,
      unit: item.unit,
      unitCost: item.unitCost ?? item.unit_cost ?? 0,
      sortOrder: item.sortOrder ?? item.sort_order ?? 0,
    }));
  }

  return {
    id: backendSku.id,
    code: backendSku.code,
    name: backendSku.name,
    skuType: skuType as SkuType,
    storeScope: storeScope,
    standardCost: standardCost,
    wasteRate: wasteRate,
    price: price,
    spuId: spuId,
    spuName: spuInfo?.name || '', // 从SPU获取名称
    brand: spuInfo?.brand || '', // 从SPU获取品牌
    category: spuInfo?.category || '', // 从SPU获取类目
    categoryId: '', // 从SPU获取类目ID
    spec: spuInfo?.spec || '', // 从SPU获取规格
    mainUnit: mainUnit,
    mainUnitId: '',
    salesUnits: [],
    mainBarcode: backendSku.code, // 使用code作为条码
    otherBarcodes: [],
    manageInventory: true,
    allowNegativeStock: false,
    status: backendSku.status as SkuStatus,
    createdAt: createdAt,
    updatedAt: updatedAt,
    createdBy: '',
    createdByName: '',
    updatedBy: '',
    updatedByName: '',
    bomComponents: bomComponents,
    comboItems: comboItems,
  };
}

/**
 * SKU服务实现类（调用后端真实API）
 */
class SkuServiceImpl implements ISkuService {
  async getSkus(params: SkuQueryParams): Promise<SkuListResponse> {
    // 先获取SPU缓存，用于填充SPU关联信息
    const spuMap = await getSpuCache();

    // 构建查询参数
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.status && params.status !== 'all')
      queryParams.append('status', params.status.toUpperCase());
    queryParams.append('page', String(params.page || 1));
    queryParams.append('pageSize', String(params.pageSize || 20));

    const queryString = queryParams.toString();
    const url = `/skus${queryString ? `?${queryString}` : ''}`;

    // apiService.get 返回的就是后端响应体: {success, data: [...], total, page, pageSize}
    const response = await apiService.get<{
      success: boolean;
      data: BackendSkuData[];
      total: number;
      page: number;
      pageSize: number;
    }>(url);

    // response 已经是后端返回的完整对象
    const backendResponse = response as unknown as {
      success: boolean;
      data: BackendSkuData[];
      total: number;
      page: number;
      pageSize: number;
    };

    // 使用SPU缓存转换SKU数据
    const items = (backendResponse.data || []).map((sku) => transformBackendSku(sku, spuMap));
    const total = backendResponse.total || items.length;
    const page = backendResponse.page || params.page || 1;
    const pageSize = backendResponse.pageSize || params.pageSize || 20;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getSkuById(id: string): Promise<SKUDetail> {
    // 先获取SPU缓存
    const spuMap = await getSpuCache();

    const response = await apiService.get<{ success: boolean; data: BackendSkuData }>(
      `/skus/${id}`
    );
    const backendResponse = response as unknown as { success: boolean; data: BackendSkuData };
    return transformBackendSku(backendResponse.data, spuMap);
  }

  async createSku(formData: SkuFormData): Promise<SKUDetail> {
    // 后端枚举使用小写值: draft, enabled, disabled, raw_material, finished_product, combo, packaging
    const statusValue = formData.status?.toLowerCase() || 'draft';
    // SKU类型从SPU继承，默认为 raw_material
    const skuTypeValue = formData.skuType || 'raw_material';

    // 构建请求体
    const requestBody: Record<string, any> = {
      code: formData.mainBarcode || `SKU${Date.now()}`,
      name: formData.name,
      spuId: formData.spuId,
      skuType: skuTypeValue,
      mainUnit: formData.mainUnitId,
      status: statusValue,
      standardCost: formData.standardCost ?? 0, // 原料/包材类型需要标准成本
    };

    // 成品类型需要BOM组件
    if (formData.bomComponents && formData.bomComponents.length > 0) {
      requestBody.bomComponents = formData.bomComponents;
    }

    // 套餐类型需要子项
    if (formData.comboItems && formData.comboItems.length > 0) {
      requestBody.comboItems = formData.comboItems;
    }

    const response = await apiService.post<{ success: boolean; data: BackendSkuData }>(
      '/skus',
      requestBody
    );
    const backendResponse = response as unknown as { success: boolean; data: BackendSkuData };
    return transformBackendSku(backendResponse.data);
  }

  async updateSku(id: string, formData: SkuFormData): Promise<SKUDetail> {
    // 后端枚举使用小写值
    const statusValue = formData.status?.toLowerCase();

    const response = await apiService.put<{ success: boolean; data: BackendSkuData }>(
      `/skus/${id}`,
      {
        name: formData.name,
        spuId: formData.spuId, // 添加spuId字段
        mainUnit: formData.mainUnitId,
        status: statusValue,
        standardCost: formData.standardCost, // 标准成本（原料/包材类型）
        price: formData.price, // 零售价（成品/套餐类型）
        storeScope: formData.storeScope, // 门店范围 (US-001 用户故事5)
      }
    );
    const backendResponse = response as unknown as { success: boolean; data: BackendSkuData };
    return transformBackendSku(backendResponse.data);
  }

  async toggleSkuStatus(id: string, status: SkuStatus): Promise<SKUDetail> {
    // 后端枚举使用小写值
    const statusValue = status.toLowerCase();

    const response = await apiService.put<{ success: boolean; data: BackendSkuData }>(
      `/skus/${id}`,
      {
        status: statusValue,
      }
    );
    const backendResponse = response as unknown as { success: boolean; data: BackendSkuData };
    return transformBackendSku(backendResponse.data);
  }

  /**
   * 更新BOM配方
   * @param skuId 成品SKU ID
   * @param components BOM组件列表
   * @param wasteRate 损耗率
   */
  async updateBom(
    skuId: string,
    components: Array<{
      componentId: string;
      quantity: number;
      unit: string;
      isOptional?: boolean;
      sortOrder?: number;
    }>,
    wasteRate?: number
  ): Promise<{ calculatedCost: number }> {
    const response = await apiService.put<{ success: boolean; data: { calculatedCost: number } }>(
      `/skus/${skuId}/bom`,
      {
        components,
        wasteRate: wasteRate || 0,
      }
    );
    const backendResponse = response as unknown as {
      success: boolean;
      data: { calculatedCost: number };
    };
    return backendResponse.data;
  }

  /**
   * 更新套餐子项
   * @param skuId 套餐SKU ID
   * @param items 套餐子项列表
   */
  async updateComboItems(
    skuId: string,
    items: Array<{
      subItemId: string;
      quantity: number;
      unit: string;
      sortOrder?: number;
    }>
  ): Promise<{ calculatedCost: number }> {
    const response = await apiService.put<{ success: boolean; data: { calculatedCost: number } }>(
      `/skus/${skuId}/combo-items`,
      {
        items,
      }
    );
    const backendResponse = response as unknown as {
      success: boolean;
      data: { calculatedCost: number };
    };
    return backendResponse.data;
  }

  async checkBarcodeDuplicate(
    barcode: string,
    excludeSkuId?: string
  ): Promise<{ available: boolean; message: string }> {
    // 暂时返回可用，后端暂无此接口
    return { available: true, message: '条码可用' };
  }

  async checkSkuNameDuplicate(
    name: string,
    excludeSkuId?: string
  ): Promise<{ available: boolean; message: string }> {
    // 暂时返回可用，后端暂无此接口
    return { available: true, message: '名称可用' };
  }

  async getSpus(): Promise<SPU[]> {
    // 从后端API获取SPU列表
    try {
      const response = await apiService.get<{
        success: boolean;
        data: BackendSpu[];
      }>('/spus?pageSize=1000');

      const backendResponse = response as unknown as {
        success: boolean;
        data: BackendSpu[];
      };

      if (backendResponse.success && backendResponse.data) {
        return backendResponse.data.map((item) => ({
          id: item.id,
          code: item.code,
          name: item.name,
          brand: item.brand_name || '',
          category: item.category_name || '',
          categoryId: item.category_id || '',
          productType: item.product_type as
            | 'raw_material'
            | 'packaging'
            | 'finished_product'
            | 'combo'
            | undefined, // 产品类型，SKU继承用
        }));
      }
    } catch (error) {
      console.error('Failed to fetch SPU list from backend:', error);
    }
    return [];
  }

  async getUnits(): Promise<Unit[]> {
    // 后端暂无单位接口，返回基础单位列表
    return [
      { id: 'ml', code: 'ML', name: 'ml', type: 'inventory' },
      { id: '个', code: 'PIECE', name: '个', type: 'inventory' },
      { id: '片', code: 'SLICE', name: '片', type: 'inventory' },
      { id: 'g', code: 'GRAM', name: 'g', type: 'inventory' },
      { id: '杯', code: 'CUP', name: '杯', type: 'inventory' },
      { id: '瓶', code: 'BOTTLE', name: '瓶', type: 'inventory' },
      { id: '听', code: 'CAN', name: '听', type: 'inventory' },
      { id: '桶', code: 'BUCKET', name: '桶', type: 'inventory' },
      { id: '袋', code: 'BAG', name: '袋', type: 'inventory' },
      { id: '份', code: 'PORTION', name: '份', type: 'inventory' },
    ];
  }

  /**
   * 批量删除SKU
   * @spec B001-fix-brand-creation
   */
  async batchDeleteSkus(ids: string[]): Promise<{ success: number; failed: number }> {
    const response = await fetch('/api/skus/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'delete',
        ids,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || '批量删除失败');
    }

    return {
      success: result.data.processedCount,
      failed: result.data.failedCount,
    };
  }
}

// 导出服务实例
export const skuService: ISkuService = new SkuServiceImpl();
