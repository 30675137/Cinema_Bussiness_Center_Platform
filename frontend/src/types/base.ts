/**
 * @spec P005-bom-inventory-deduction
 * 基础类型定义 - 用于打破循环依赖
 *
 * 此文件包含所有基础类型和枚举，供其他类型文件导入使用
 */

// 状态枚举
export enum MaterialType {
  RAW_MATERIAL = 'raw_material', // 原材料
  SEMI_FINISHED = 'semi_finished', // 半成品
  FINISHED_GOOD = 'finished_good', // 成品
}

export enum ProductStatus {
  DRAFT = 'draft', // 草稿
  PENDING_REVIEW = 'pending_review', // 待审核
  APPROVED = 'approved', // 已审核
  PUBLISHED = 'published', // 已发布
  DISABLED = 'disabled', // 已禁用
  ARCHIVED = 'archived', // 已归档
}

export enum StoreType {
  CINEMA = 'cinema', // 影院
  THEATER = 'theater', // 剧院
  CONCERT_HALL = 'concert_hall', // 音乐厅
  MIXED = 'mixed', // 综合体
}

export enum ChannelType {
  MINI_PROGRAM = 'mini_program', // 小程序
  APP = 'app', // APP
  WEBSITE = 'website', // 官网
  OFFLINE = 'offline', // 线下
}

// 基础实体类型
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}
