/**
 * 场景包编辑器 API Client
 * Feature: 001-scenario-package-tabs
 */

import axios from 'axios';
import type {
  ScenarioPackage,
  ScenarioPackageFullData,
  PackageTier,
  AddOnItem,
  ScenarioPackageAddOn,
  TimeSlotTemplate,
  TimeSlotOverride,
  UpdateBasicInfoRequest,
  CreatePackageTierRequest,
  UpdatePackageTierRequest,
  UpdateAddOnsRequest,
  CreateTimeSlotTemplateRequest,
  CreateTimeSlotOverrideRequest,
  UpdatePublishSettingsRequest,
  PublishValidationResult,
  ApiResponse,
  ListResponse,
} from '../types';

// ========== Axios 实例 ==========

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一处理错误
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 未授权，跳转登录
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== API 路径 ==========

const API_PATHS = {
  packages: '/scenario-packages',
  package: (id: string) => `/scenario-packages/${id}`,
  basicInfo: (id: string) => `/scenario-packages/${id}/basic-info`,
  tiers: (id: string) => `/scenario-packages/${id}/tiers`,
  tier: (packageId: string, tierId: string) => `/scenario-packages/${packageId}/tiers/${tierId}`,
  tiersReorder: (id: string) => `/scenario-packages/${id}/tiers/reorder`,
  addOnItems: '/addon-items',
  packageAddons: (id: string) => `/scenario-packages/${id}/addons`,
  timeSlotTemplates: (id: string) => `/scenario-packages/${id}/time-slot-templates`,
  timeSlotTemplate: (packageId: string, templateId: string) => `/scenario-packages/${packageId}/time-slot-templates/${templateId}`,
  timeSlotOverrides: (id: string) => `/scenario-packages/${id}/time-slot-overrides`,
  timeSlotOverride: (packageId: string, overrideId: string) => `/scenario-packages/${packageId}/time-slot-overrides/${overrideId}`,
  publishSettings: (id: string) => `/scenario-packages/${id}/publish-settings`,
  publish: (id: string) => `/scenario-packages/${id}/publish`,
  archive: (id: string) => `/scenario-packages/${id}/archive`,
  publishValidation: (id: string) => `/scenario-packages/${id}/publish-validation`,
};

// ========== API 方法 ==========

/**
 * 后端场景包响应类型（实际后端返回的格式）
 */
interface BackendScenarioPackageData {
  id: string;
  basePackageId: string;
  version: number;
  versionLock: number;
  name: string;
  description?: string | null;
  image: string; // 后端用 image，前端用 mainImage
  status: string;
  isLatest: boolean;
  rule?: {
    durationHours: number;
    minPeople: number;
    maxPeople: number;
  };
  hallTypes?: string[];
  benefits?: unknown[];
  items?: unknown[];
  services?: unknown[];
  stores?: unknown;
  storeIds?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  // 原始字段 - 实际后端可能没有这些
  category?: string;
  mainImage?: string;
}

/**
 * 转换后端数据为前端 ScenarioPackage 格式
 */
function transformBackendToFrontend(backendData: BackendScenarioPackageData): ScenarioPackage {
  return {
    id: backendData.id,
    name: backendData.name,
    description: backendData.description || null,
    category: backendData.category || 'TEAM', // 默认分类
    mainImage: backendData.mainImage || backendData.image, // 兼容两种字段名
    status: backendData.status as ScenarioPackage['status'],
    effectiveStartDate: null,
    effectiveEndDate: null,
    advanceBookingDays: null,
    createdAt: backendData.createdAt,
    updatedAt: backendData.updatedAt,
    createdBy: backendData.createdBy,
    updatedBy: backendData.createdBy,
  };
}

export const scenarioPackageApi = {
  // ========== 场景包 ==========

  /**
   * 获取场景包完整数据
   * 适配后端实际返回的数据格式
   */
  async getPackageDetail(packageId: string): Promise<ScenarioPackageFullData> {
    const response = await apiClient.get<ApiResponse<BackendScenarioPackageData | ScenarioPackageFullData>>(
      API_PATHS.package(packageId)
    );
    
    const responseData = response.data.data;
    
    // 检查是否是后端新格式（直接返回场景包数据，而不是包裹在 package 字段中）
    if ('package' in responseData) {
      // MSW mock 格式或匹配的后端格式
      return responseData as ScenarioPackageFullData;
    }
    
    // 后端实际格式：直接返回场景包数据
    const backendData = responseData as BackendScenarioPackageData;
    return {
      package: transformBackendToFrontend(backendData),
      packages: [], // 套餐数据需要单独请求
      addons: [],
      timeSlotTemplates: [],
      timeSlotOverrides: [],
    };
  },

  /**
   * 更新基础信息
   */
  async updateBasicInfo(packageId: string, data: UpdateBasicInfoRequest): Promise<ScenarioPackage> {
    const response = await apiClient.put<ApiResponse<ScenarioPackage>>(
      API_PATHS.basicInfo(packageId),
      data
    );
    return response.data.data;
  },

  // ========== 套餐 ==========

  /**
   * 获取套餐列表
   */
  async getPackageTiers(packageId: string): Promise<PackageTier[]> {
    const response = await apiClient.get<ListResponse<PackageTier>>(
      API_PATHS.tiers(packageId)
    );
    return response.data.data;
  },

  /**
   * 创建套餐
   */
  async createPackageTier(packageId: string, data: CreatePackageTierRequest): Promise<PackageTier> {
    const response = await apiClient.post<ApiResponse<PackageTier>>(
      API_PATHS.tiers(packageId),
      data
    );
    return response.data.data;
  },

  /**
   * 更新套餐
   */
  async updatePackageTier(packageId: string, data: UpdatePackageTierRequest): Promise<PackageTier> {
    const response = await apiClient.put<ApiResponse<PackageTier>>(
      API_PATHS.tier(packageId, data.id),
      data
    );
    return response.data.data;
  },

  /**
   * 删除套餐
   */
  async deletePackageTier(packageId: string, tierId: string): Promise<void> {
    await apiClient.delete(API_PATHS.tier(packageId, tierId));
  },

  /**
   * 更新套餐排序
   */
  async reorderPackageTiers(packageId: string, tierIds: string[]): Promise<void> {
    await apiClient.post(API_PATHS.tiersReorder(packageId), { tierIds });
  },

  // ========== 加购项 ==========

  /**
   * 获取所有可用加购项
   */
  async getAllAddOnItems(): Promise<AddOnItem[]> {
    const response = await apiClient.get<ListResponse<AddOnItem>>(API_PATHS.addOnItems);
    return response.data.data;
  },

  /**
   * 获取场景包关联的加购项
   */
  async getPackageAddOns(packageId: string): Promise<ScenarioPackageAddOn[]> {
    const response = await apiClient.get<ListResponse<ScenarioPackageAddOn>>(
      API_PATHS.packageAddons(packageId)
    );
    return response.data.data;
  },

  /**
   * 更新加购项关联
   */
  async updatePackageAddOns(packageId: string, data: UpdateAddOnsRequest): Promise<void> {
    await apiClient.put(API_PATHS.packageAddons(packageId), data);
  },

  // ========== 时段模板 ==========

  /**
   * 获取时段模板列表
   */
  async getTimeSlotTemplates(packageId: string): Promise<TimeSlotTemplate[]> {
    const response = await apiClient.get<ListResponse<TimeSlotTemplate>>(
      API_PATHS.timeSlotTemplates(packageId)
    );
    return response.data.data;
  },

  /**
   * 创建时段模板
   */
  async createTimeSlotTemplate(packageId: string, data: CreateTimeSlotTemplateRequest): Promise<TimeSlotTemplate> {
    const response = await apiClient.post<ApiResponse<TimeSlotTemplate>>(
      API_PATHS.timeSlotTemplates(packageId),
      data
    );
    return response.data.data;
  },

  /**
   * 更新时段模板
   */
  async updateTimeSlotTemplate(
    packageId: string,
    templateId: string,
    data: Partial<CreateTimeSlotTemplateRequest>
  ): Promise<TimeSlotTemplate> {
    const response = await apiClient.put<ApiResponse<TimeSlotTemplate>>(
      API_PATHS.timeSlotTemplate(packageId, templateId),
      data
    );
    return response.data.data;
  },

  /**
   * 删除时段模板
   */
  async deleteTimeSlotTemplate(packageId: string, templateId: string): Promise<void> {
    await apiClient.delete(API_PATHS.timeSlotTemplate(packageId, templateId));
  },

  // ========== 时段覆盖 ==========

  /**
   * 获取时段覆盖列表
   * @param packageId 场景包ID
   * @param startDate 可选开始日期 (YYYY-MM-DD)
   * @param endDate 可选结束日期 (YYYY-MM-DD)
   */
  async getTimeSlotOverrides(
    packageId: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeSlotOverride[]> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get<ApiResponse<TimeSlotOverride[]>>(
      API_PATHS.timeSlotOverrides(packageId),
      { params }
    );
    return response.data.data;
  },

  /**
   * 创建时段覆盖
   */
  async createTimeSlotOverride(packageId: string, data: CreateTimeSlotOverrideRequest): Promise<TimeSlotOverride> {
    const response = await apiClient.post<ApiResponse<TimeSlotOverride>>(
      API_PATHS.timeSlotOverrides(packageId),
      data
    );
    return response.data.data;
  },

  /**
   * 更新时段覆盖
   */
  async updateTimeSlotOverride(
    packageId: string,
    overrideId: string,
    data: Partial<CreateTimeSlotOverrideRequest>
  ): Promise<TimeSlotOverride> {
    const response = await apiClient.put<ApiResponse<TimeSlotOverride>>(
      API_PATHS.timeSlotOverride(packageId, overrideId),
      data
    );
    return response.data.data;
  },

  /**
   * 删除时段覆盖
   */
  async deleteTimeSlotOverride(packageId: string, overrideId: string): Promise<void> {
    await apiClient.delete(API_PATHS.timeSlotOverride(packageId, overrideId));
  },

  // ========== 发布管理 ==========

  /**
   * 更新发布设置
   */
  async updatePublishSettings(packageId: string, data: UpdatePublishSettingsRequest): Promise<ScenarioPackage> {
    const response = await apiClient.put<ApiResponse<ScenarioPackage>>(
      API_PATHS.publishSettings(packageId),
      data
    );
    return response.data.data;
  },

  /**
   * 验证发布条件
   */
  async validateForPublish(packageId: string): Promise<PublishValidationResult> {
    const response = await apiClient.get<ApiResponse<PublishValidationResult>>(
      API_PATHS.publishValidation(packageId)
    );
    return response.data.data;
  },

  /**
   * 发布场景包
   */
  async publishPackage(packageId: string): Promise<ScenarioPackage> {
    const response = await apiClient.post<ApiResponse<ScenarioPackage>>(
      API_PATHS.publish(packageId)
    );
    return response.data.data;
  },

  /**
   * 下架场景包
   */
  async archivePackage(packageId: string): Promise<ScenarioPackage> {
    const response = await apiClient.post<ApiResponse<ScenarioPackage>>(
      API_PATHS.archive(packageId)
    );
    return response.data.data;
  },
};

export default apiClient;
