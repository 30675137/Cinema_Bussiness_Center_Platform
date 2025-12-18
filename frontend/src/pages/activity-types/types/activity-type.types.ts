/**
 * 活动类型管理 - TypeScript 类型定义
 */

export enum ActivityTypeStatus {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  DELETED = 'DELETED'
}

export interface ActivityType {
  id: string;                    // UUID as string
  name: string;                  // 活动类型名称
  description: string | null;    // 描述，可选
  businessCategory?: string | null; // 业务分类（如：私人订制、商务团建、派对策划）
  backgroundImageUrl?: string | null; // 场景背景图 URL
  status: ActivityTypeStatus;    // 状态
  sort: number;                  // 排序号
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  deletedAt?: string | null;     // 删除时间，可选
  createdBy?: string | null;     // 创建人，可选
  updatedBy?: string | null;     // 更新人，可选
}

export interface CreateActivityTypePayload {
  name: string;
  description?: string | null;
  sort: number;
  businessCategory?: string | null;
  backgroundImageUrl?: string | null;
}

export interface UpdateActivityTypePayload {
  name: string;
  description?: string | null;
  sort: number;
  businessCategory?: string | null;
  backgroundImageUrl?: string | null;
}

export interface ActivityTypeListResponse {
  success: boolean;
  data: ActivityType[];
  total: number;
  message?: string;
}

export interface ActivityTypeQueryParams {
  status?: ActivityTypeStatus;   // 过滤状态（运营后台使用）
}

