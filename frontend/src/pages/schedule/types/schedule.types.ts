/**
 * 排期管理类型定义
 */

/**
 * 影厅类型
 */
export type HallType = 'VIP' | 'Public' | 'CP' | 'Party';

/**
 * 影厅状态
 */
export type HallStatus = 'active' | 'inactive' | 'maintenance';

/**
 * 影厅资源
 */
export interface Hall {
  id: string;
  name: string;
  capacity: number;
  type: HallType;
  tags: string[];
  operatingHours?: {
    startHour: number;
    endHour: number;
  };
  status: HallStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * 事件类型
 */
export type EventType = 'public' | 'private' | 'maintenance' | 'cleaning';

/**
 * 事件状态（仅包场类型使用）
 */
export type EventStatus = 'confirmed' | 'pending' | 'locked';

/**
 * 排期事件
 */
export interface ScheduleEvent {
  id: string;
  hallId: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 支持小数，如 10.5 = 10:30
  duration: number; // 支持小数，如 2.5 = 2小时30分钟
  title: string;
  type: EventType;
  status?: EventStatus; // 仅包场类型
  customer?: string; // 包场类型
  serviceManager?: string; // 包场类型
  occupancy?: string; // 公映类型，格式：'85/120'
  details?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * 时间轴配置
 */
export interface TimelineConfig {
  startHour: number;
  endHour: number;
  interval: number; // 时间间隔（小时），如 0.5（30分钟）或 1（1小时）
  timeFormat: '12h' | '24h';
}

/**
 * 排期查询参数
 */
export interface ScheduleQueryParams {
  date: string; // YYYY-MM-DD
  hallId?: string;
  type?: EventType;
  status?: EventStatus;
}

/**
 * 影厅查询参数
 */
export interface HallQueryParams {
  status?: HallStatus;
  type?: HallType;
}

/**
 * 创建排期事件请求
 */
export interface CreateScheduleEventRequest {
  hallId: string;
  date: string;
  startHour: number;
  duration: number;
  title: string;
  type: EventType;
  status?: EventStatus;
  customer?: string;
  serviceManager?: string;
  occupancy?: string;
  details?: string;
}

/**
 * 更新排期事件请求
 */
export interface UpdateScheduleEventRequest extends Partial<CreateScheduleEventRequest> {
  id: string;
}

/**
 * 冲突检查请求
 */
export interface ConflictCheckRequest {
  hallId: string;
  date: string;
  startHour: number;
  duration: number;
  excludeEventId?: string; // 更新时排除当前事件
}

/**
 * 冲突检查响应
 */
export interface ConflictCheckResponse {
  hasConflict: boolean;
  conflictingEvents: ScheduleEvent[];
}

