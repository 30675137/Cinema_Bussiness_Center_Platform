/**
 * 门店预约设置 API 服务
 * Feature: 016-store-reservation-settings
 */
import { BaseApiService, HttpMethod } from './baseService';
import { ApiResponse } from '../types/common';
import {
  ReservationSettings,
  ReservationSettingsUpdateRequest,
  ReservationSettingsUpdateSchema,
} from '../types/reservationSettings';

class ReservationSettingsService extends BaseApiService {
  private readonly endpoint = '/stores';

  constructor() {
    super();
  }

  /**
   * 获取门店预约设置
   * @param storeId 门店ID
   * @returns 预约设置
   */
  async getSettings(storeId: string): Promise<ReservationSettings> {
    const response = await this.get<ReservationSettings>(
      `${this.endpoint}/${storeId}/reservation-settings`
    );

    if (!response.data) {
      throw new Error('获取预约设置失败');
    }

    return response.data;
  }

  /**
   * 更新门店预约设置
   * @param storeId 门店ID
   * @param data 更新数据
   * @returns 更新后的预约设置
   */
  async updateSettings(
    storeId: string,
    data: ReservationSettingsUpdateRequest
  ): Promise<ReservationSettings> {
    // 验证输入数据
    const validationResult = ReservationSettingsUpdateSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(`数据验证失败: ${validationResult.error.message}`);
    }

    const response = await this.put<ReservationSettings>(
      `${this.endpoint}/${storeId}/reservation-settings`,
      validationResult.data
    );

    if (!response.data) {
      throw new Error('更新预约设置失败');
    }

    return response.data;
  }

  /**
   * 重置门店预约设置为默认值
   * @param storeId 门店ID
   */
  async resetSettings(storeId: string): Promise<void> {
    await this.delete(
      `${this.endpoint}/${storeId}/reservation-settings`
    );
  }

  /**
   * 更新时间段配置
   * @param storeId 门店ID
   * @param timeSlots 时间段列表
   * @returns 更新后的预约设置
   */
  async updateTimeSlots(
    storeId: string,
    timeSlots: ReservationSettingsUpdateRequest['timeSlots']
  ): Promise<ReservationSettings> {
    return this.updateSettings(storeId, { timeSlots });
  }

  /**
   * 更新提前量配置
   * @param storeId 门店ID
   * @param minAdvanceHours 最小提前小时数
   * @param maxAdvanceDays 最大提前天数
   * @returns 更新后的预约设置
   */
  async updateAdvanceTime(
    storeId: string,
    minAdvanceHours: number,
    maxAdvanceDays: number
  ): Promise<ReservationSettings> {
    return this.updateSettings(storeId, { minAdvanceHours, maxAdvanceDays });
  }

  /**
   * 更新时长单位配置
   * @param storeId 门店ID
   * @param durationUnit 时长单位 (1/2/4 小时)
   * @returns 更新后的预约设置
   */
  async updateDurationUnit(
    storeId: string,
    durationUnit: ReservationSettingsUpdateRequest['durationUnit']
  ): Promise<ReservationSettings> {
    return this.updateSettings(storeId, { durationUnit });
  }

  /**
   * 更新押金规则配置
   * @param storeId 门店ID
   * @param depositRequired 是否需要押金
   * @param depositAmount 押金金额
   * @param depositPercentage 押金比例
   * @returns 更新后的预约设置
   */
  async updateDepositRule(
    storeId: string,
    depositRequired: boolean,
    depositAmount?: number,
    depositPercentage?: number
  ): Promise<ReservationSettings> {
    return this.updateSettings(storeId, {
      depositRequired,
      depositAmount,
      depositPercentage,
    });
  }

  /**
   * 启用/禁用预约设置
   * @param storeId 门店ID
   * @param isActive 是否启用
   * @returns 更新后的预约设置
   */
  async setActive(
    storeId: string,
    isActive: boolean
  ): Promise<ReservationSettings> {
    return this.updateSettings(storeId, { isActive });
  }
}

// 导出单例
export const reservationSettingsService = new ReservationSettingsService();
export default reservationSettingsService;
