/**
 * SKU服务层
 * 提供SKU相关的业务逻辑封装
 */

import type {
  SKU,
  SkuQueryParams,
  SkuListResponse,
  SkuFormData,
  SPU,
  Unit,
} from '@/types/sku';
import { SkuStatus } from '@/types/sku';
import {
  getSkus as mockGetSkus,
  getSkuById as mockGetSkuById,
  createSku as mockCreateSku,
  updateSku as mockUpdateSku,
  toggleSkuStatus as mockToggleSkuStatus,
  checkBarcodeDuplicate as mockCheckBarcodeDuplicate,
  checkSkuNameDuplicate as mockCheckSkuNameDuplicate,
  getSpus as mockGetSpus,
  getUnits as mockGetUnits,
} from './mockSkuApi';

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
  getSkuById(id: string): Promise<SKU>;
  
  /**
   * 创建新SKU
   */
  createSku(formData: SkuFormData): Promise<SKU>;
  
  /**
   * 更新SKU
   */
  updateSku(id: string, formData: SkuFormData): Promise<SKU>;
  
  /**
   * 切换SKU状态
   */
  toggleSkuStatus(id: string, status: SkuStatus): Promise<SKU>;
  
  /**
   * 检查条码是否重复
   */
  checkBarcodeDuplicate(barcode: string, excludeSkuId?: string): Promise<{ available: boolean; message: string }>;
  
  /**
   * 检查SKU名称是否重复
   */
  checkSkuNameDuplicate(name: string, excludeSkuId?: string): Promise<{ available: boolean; message: string }>;
  
  /**
   * 获取SPU列表
   */
  getSpus(): Promise<SPU[]>;
  
  /**
   * 获取单位列表
   */
  getUnits(): Promise<Unit[]>;
}

/**
 * SKU服务实现类（Mock版本）
 */
class SkuServiceImpl implements ISkuService {
  async getSkus(params: SkuQueryParams): Promise<SkuListResponse> {
    return mockGetSkus(params);
  }
  
  async getSkuById(id: string): Promise<SKU> {
    return mockGetSkuById(id);
  }
  
  async createSku(formData: SkuFormData): Promise<SKU> {
    return mockCreateSku(formData);
  }
  
  async updateSku(id: string, formData: SkuFormData): Promise<SKU> {
    return mockUpdateSku(id, formData);
  }
  
  async toggleSkuStatus(id: string, status: SkuStatus): Promise<SKU> {
    return mockToggleSkuStatus(id, status);
  }
  
  async checkBarcodeDuplicate(barcode: string, excludeSkuId?: string): Promise<{ available: boolean; message: string }> {
    return mockCheckBarcodeDuplicate(barcode, excludeSkuId);
  }
  
  async checkSkuNameDuplicate(name: string, excludeSkuId?: string): Promise<{ available: boolean; message: string }> {
    return mockCheckSkuNameDuplicate(name, excludeSkuId);
  }
  
  async getSpus(): Promise<SPU[]> {
    return mockGetSpus();
  }
  
  async getUnits(): Promise<Unit[]> {
    return mockGetUnits();
  }
}

// 导出服务实例
export const skuService: ISkuService = new SkuServiceImpl();

