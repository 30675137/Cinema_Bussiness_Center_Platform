/**
 * Conflict Detection Utilities
 * 
 * Utilities for detecting time conflicts between schedule events
 */

import type { ScheduleEvent } from '@/pages/schedule/types/schedule.types';
import type { ConflictCheckRequest } from '@/pages/schedule/types/schedule.types';

/**
 * 检查两个时间段是否重叠
 * @param start1 第一个时间段的开始时间
 * @param end1 第一个时间段的结束时间
 * @param start2 第二个时间段的开始时间
 * @param end2 第二个时间段的结束时间
 * @returns 是否重叠
 */
function isTimeOverlapping(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  // 时间段不重叠的条件：end1 <= start2 或 end2 <= start1
  // 取反得到重叠条件
  return !(end1 <= start2 || end2 <= start1);
}

/**
 * 检查排期事件是否存在时间冲突
 * @param event 要检查的事件
 * @param existingEvents 已存在的排期事件列表
 * @param excludeEventId 排除的事件ID（用于更新时排除当前事件）
 * @returns 冲突的事件列表
 */
export function checkTimeConflict(
  event: ConflictCheckRequest,
  existingEvents: ScheduleEvent[],
  excludeEventId?: string
): ScheduleEvent[] {
  const conflictingEvents: ScheduleEvent[] = [];
  
  const eventStart = event.startHour;
  const eventEnd = event.startHour + event.duration;
  
  for (const existingEvent of existingEvents) {
    // 跳过排除的事件
    if (excludeEventId && existingEvent.id === excludeEventId) {
      continue;
    }
    
    // 必须是同一个影厅和同一天
    if (existingEvent.hallId !== event.hallId || existingEvent.date !== event.date) {
      continue;
    }
    
    // 维护/保洁类型可以与业务事件重叠，但不能与维护/保洁重叠
    const isEventMaintenance = event.type === 'maintenance' || event.type === 'cleaning';
    const isExistingMaintenance = existingEvent.type === 'maintenance' || existingEvent.type === 'cleaning';
    
    // 如果都是维护/保洁类型，检查重叠
    if (isEventMaintenance && isExistingMaintenance) {
      const existingStart = existingEvent.startHour;
      const existingEnd = existingEvent.startHour + existingEvent.duration;
      
      if (isTimeOverlapping(eventStart, eventEnd, existingStart, existingEnd)) {
        conflictingEvents.push(existingEvent);
      }
    }
    // 如果至少有一个是业务事件，检查重叠
    else if (!isEventMaintenance || !isExistingMaintenance) {
      const existingStart = existingEvent.startHour;
      const existingEnd = existingEvent.startHour + existingEvent.duration;
      
      if (isTimeOverlapping(eventStart, eventEnd, existingStart, existingEnd)) {
        conflictingEvents.push(existingEvent);
      }
    }
  }
  
  return conflictingEvents;
}

/**
 * 验证事件时间范围是否有效
 * @param startHour 开始时间（小时）
 * @param duration 持续时间（小时）
 * @param timelineStartHour 时间轴开始时间（小时）
 * @param timelineEndHour 时间轴结束时间（小时）
 * @returns 验证结果对象
 */
export function validateEventTimeRange(
  startHour: number,
  duration: number,
  timelineStartHour: number,
  timelineEndHour: number
): { valid: boolean; message?: string } {
  // 检查开始时间是否在时间轴范围内
  if (startHour < timelineStartHour) {
    return {
      valid: false,
      message: `开始时间不能早于${timelineStartHour}:00`,
    };
  }
  
  // 检查结束时间是否在时间轴范围内
  const endHour = startHour + duration;
  if (endHour > timelineEndHour) {
    return {
      valid: false,
      message: `结束时间不能晚于${timelineEndHour}:00`,
    };
  }
  
  // 检查持续时间是否有效
  if (duration <= 0) {
    return {
      valid: false,
      message: '持续时间必须大于0',
    };
  }
  
  return { valid: true };
}

