/**
 * 场景包管理 API 服务
 *
 * 封装所有与场景包相关的 API 调用
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import { apiClient } from '@/services/api';
import type {
  ScenarioPackageDetail,
  ScenarioPackageSummary,
  CreatePackageRequest,
  UpdatePackageRequest,
  ListPackagesParams,
  ReferencePriceResponse,
  UploadUrlResponse,
  ApiResponse,
  ListResponse,
} from '../types';

const BASE_URL = '/scenario-packages';

/**
 * 场景包服务
 */
export const packageService = {
  /**
   * 查询场景包列表
   */
  list: async (params: ListPackagesParams = {}): Promise<ListResponse<ScenarioPackageSummary>> => {
    const { data } = await apiClient.get<ListResponse<ScenarioPackageSummary>>(BASE_URL, {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        status: params.status,
        hallTypeId: params.hallTypeId,
        keyword: params.keyword,
        sortBy: params.sortBy ?? 'createdAt',
        sortOrder: params.sortOrder ?? 'desc',
      },
    });
    return data;
  },

  /**
   * 根据 ID 查询场景包详情
   */
  getById: async (id: string): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.get<ApiResponse<ScenarioPackageDetail>>(`${BASE_URL}/${id}`);
    return data;
  },

  /**
   * 创建场景包
   */
  create: async (request: CreatePackageRequest): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.post<ApiResponse<ScenarioPackageDetail>>(BASE_URL, request);
    return data;
  },

  /**
   * 更新场景包
   */
  update: async (
    id: string,
    request: UpdatePackageRequest
  ): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.put<ApiResponse<ScenarioPackageDetail>>(
      `${BASE_URL}/${id}`,
      request
    );
    return data;
  },

  /**
   * 删除场景包（软删除）
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * 发布场景包
   */
  publish: async (id: string): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.post<ApiResponse<ScenarioPackageDetail>>(
      `${BASE_URL}/${id}/publish`
    );
    return data;
  },

  /**
   * 下架场景包
   */
  unpublish: async (id: string): Promise<ApiResponse<ScenarioPackageDetail>> => {
    const { data } = await apiClient.post<ApiResponse<ScenarioPackageDetail>>(
      `${BASE_URL}/${id}/unpublish`
    );
    return data;
  },

  /**
   * 计算参考总价
   */
  calculateReferencePrice: async (id: string): Promise<ApiResponse<ReferencePriceResponse>> => {
    const { data } = await apiClient.get<ApiResponse<ReferencePriceResponse>>(
      `${BASE_URL}/${id}/pricing/reference`
    );
    return data;
  },

  /**
   * 生成图片上传 URL
   */
  generateImageUploadUrl: async (
    id: string,
    fileName: string,
    fileSize: number,
    mimeType: string
  ): Promise<ApiResponse<UploadUrlResponse>> => {
    const { data } = await apiClient.post<ApiResponse<UploadUrlResponse>>(
      `${BASE_URL}/${id}/image`,
      {
        fileName,
        fileSize,
        mimeType,
      }
    );
    return data;
  },

  /**
   * 确认图片上传完成
   */
  confirmImageUpload: async (id: string, publicUrl: string): Promise<void> => {
    await apiClient.patch(`${BASE_URL}/${id}/image`, { publicUrl });
  },

  /**
   * 上传背景图片（完整流程）
   *
   * @param id 场景包 ID
   * @param file 图片文件
   * @returns 公开访问 URL
   */
  uploadBackgroundImage: async (id: string, file: File): Promise<string> => {
    // 步骤 1：生成预签名 URL
    const uploadUrlResponse = await packageService.generateImageUploadUrl(
      id,
      file.name,
      file.size,
      file.type
    );

    const { uploadUrl, publicUrl } = uploadUrlResponse.data;

    // 步骤 2：直接上传到 Supabase Storage
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('图片上传失败');
    }

    // 步骤 3：确认上传成功，更新数据库
    await packageService.confirmImageUpload(id, publicUrl);

    return publicUrl;
  },
};

export default packageService;
