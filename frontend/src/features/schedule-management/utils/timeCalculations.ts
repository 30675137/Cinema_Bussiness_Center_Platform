/**
 * Time Calculation Utilities
 *
 * Utilities for calculating event block positions and formatting time
 */

/**
 * 计算事件块的左边距百分比
 * @param startHour 开始时间（小时），支持小数，如 10.5 = 10:30
 * @param timelineStartHour 时间轴开始时间（小时）
 * @param totalHours 时间轴总时长（小时）
 * @returns 左边距百分比字符串，如 "25%"
 */
export function getLeftStyle(
  startHour: number,
  timelineStartHour: number,
  totalHours: number
): string {
  const leftPercent = ((startHour - timelineStartHour) / totalHours) * 100;
  return `${Math.max(0, Math.min(100, leftPercent))}%`;
}

/**
 * 计算事件块的宽度百分比
 * @param duration 持续时间（小时），支持小数
 * @param totalHours 时间轴总时长（小时）
 * @returns 宽度百分比字符串，如 "12.5%"
 */
export function getWidthStyle(duration: number, totalHours: number): string {
  const widthPercent = (duration / totalHours) * 100;
  return `${Math.max(0, Math.min(100, widthPercent))}%`;
}

/**
 * 格式化时间显示
 * @param hour 小时数，支持小数，如 10.5 = 10:30
 * @param format 时间格式，'12h' 或 '24h'
 * @returns 格式化后的时间字符串，如 "10:30" 或 "10:30 AM"
 */
export function formatTime(hour: number, format: '12h' | '24h' = '24h'): string {
  const hours = Math.floor(hour);
  const minutes = hour % 1 === 0.5 ? 30 : 0;

  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 格式化时间范围显示
 * @param startHour 开始时间（小时）
 * @param duration 持续时间（小时）
 * @param format 时间格式
 * @returns 格式化后的时间范围字符串，如 "10:30 - 13:30"
 */
export function formatTimeRange(
  startHour: number,
  duration: number,
  format: '12h' | '24h' = '24h'
): string {
  const start = formatTime(startHour, format);
  const end = formatTime(startHour + duration, format);
  return `${start} - ${end}`;
}

/**
 * 生成时间槽数组
 * @param startHour 开始时间（小时）
 * @param endHour 结束时间（小时）
 * @param interval 时间间隔（小时），如 0.5（30分钟）或 1（1小时）
 * @returns 时间槽数组，如 [10, 10.5, 11, 11.5, ...]
 */
export function generateTimeSlots(
  startHour: number,
  endHour: number,
  interval: number = 1
): number[] {
  const slots: number[] = [];
  let current = startHour;

  while (current < endHour) {
    slots.push(current);
    current += interval;
  }

  return slots;
}
