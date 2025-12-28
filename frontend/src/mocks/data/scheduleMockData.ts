/**
 * Mock data for Schedule Management
 * 
 * Provides initial mock data for halls and schedule events
 */

import type { Hall, ScheduleEvent } from '@/pages/schedule/types/schedule.types';

// ============================================================================
// Helper functions
// ============================================================================

const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const now = () => new Date().toISOString();

// ============================================================================
// Mock Halls
// ============================================================================

export const mockHalls: Hall[] = [
  {
    id: 'h1',
    name: '1号厅 (VIP)',
    capacity: 12,
    type: 'VIP',
    tags: ['真皮沙发', '管家服务'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'h2',
    name: '2号厅 (情侣)',
    capacity: 6,
    type: 'CP',
    tags: ['双人座', '私密'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'h3',
    name: '3号厅 (聚会)',
    capacity: 30,
    type: 'Party',
    tags: ['KTV设备', '自助餐台'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'h4',
    name: '4号厅 (IMAX)',
    capacity: 120,
    type: 'Public',
    tags: ['激光IMAX', '杜比全景声'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
];

// ============================================================================
// Mock Schedule Events
// ============================================================================

/**
 * Generate mock schedule events for a specific date
 * @param date Date string in YYYY-MM-DD format
 * @returns Array of schedule events
 */
export function generateMockEvents(date: string): ScheduleEvent[] {
  const baseDate = date;
  
  return [
    // --- 1号厅 (VIP) ---
    {
      id: 'e1',
      hallId: 'h1',
      date: baseDate,
      startHour: 10.5,
      duration: 3,
      title: '刘总生日派对',
      type: 'private',
      status: 'confirmed',
      customer: '刘先生 138****0000',
      serviceManager: '王经理',
      details: '含豪华果盘 x2',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e2',
      hallId: 'h1',
      date: baseDate,
      startHour: 13.5,
      duration: 0.5,
      title: '保洁',
      type: 'cleaning',
      details: '日常保洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e3',
      hallId: 'h1',
      date: baseDate,
      startHour: 14.5,
      duration: 4,
      title: '企业团建：王者荣耀',
      type: 'private',
      status: 'pending',
      customer: '科技无限公司',
      serviceManager: '李主管',
      details: '需接游戏主机',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e3_clean',
      hallId: 'h1',
      date: baseDate,
      startHour: 18.5,
      duration: 0.5,
      title: '保洁',
      type: 'cleaning',
      details: '日常保洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e3_night',
      hallId: 'h1',
      date: baseDate,
      startHour: 19.5,
      duration: 3,
      title: '私人观影：教父',
      type: 'private',
      status: 'confirmed',
      customer: '陈女士',
      serviceManager: 'Amy',
      details: '红酒服务',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },

    // --- 2号厅 (情侣) ---
    {
      id: 'e4',
      hallId: 'h2',
      date: baseDate,
      startHour: 10,
      duration: 1,
      title: '设备调试',
      type: 'maintenance',
      details: '投影校准',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e4_setup',
      hallId: 'h2',
      date: baseDate,
      startHour: 11,
      duration: 1,
      title: '求婚布置',
      type: 'maintenance',
      details: '气球/鲜花',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e5',
      hallId: 'h2',
      date: baseDate,
      startHour: 12,
      duration: 3,
      title: '求婚：泰坦尼克号',
      type: 'private',
      status: 'locked',
      customer: '张先生',
      serviceManager: 'Rose',
      details: '定金已付',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e5_clean',
      hallId: 'h2',
      date: baseDate,
      startHour: 15,
      duration: 0.5,
      title: '保洁',
      type: 'cleaning',
      details: '日常保洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e5_movie1',
      hallId: 'h2',
      date: baseDate,
      startHour: 16,
      duration: 2.5,
      title: '情侣包场：爱乐之城',
      type: 'private',
      status: 'confirmed',
      customer: '周先生',
      serviceManager: 'Rose',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e5_movie2',
      hallId: 'h2',
      date: baseDate,
      startHour: 19,
      duration: 2.5,
      title: '情侣包场：你的名字',
      type: 'private',
      status: 'confirmed',
      customer: '吴女士',
      serviceManager: 'Jack',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },

    // --- 3号厅 (聚会) ---
    {
      id: 'e3_ktv',
      hallId: 'h3',
      date: baseDate,
      startHour: 13,
      duration: 4,
      title: '校友聚会 KTV',
      type: 'private',
      status: 'confirmed',
      customer: '复旦校友会',
      serviceManager: '张经理',
      details: '自助餐台开启',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e3_clean2',
      hallId: 'h3',
      date: baseDate,
      startHour: 17,
      duration: 1,
      title: '深度保洁',
      type: 'cleaning',
      details: '深度保洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e3_sport',
      hallId: 'h3',
      date: baseDate,
      startHour: 18.5,
      duration: 4,
      title: '欧冠决赛直播',
      type: 'private',
      status: 'pending',
      customer: '球迷协会',
      serviceManager: '王经理',
      details: '啤酒畅饮',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },

    // --- 4号厅 (公映) ---
    {
      id: 'e6',
      hallId: 'h4',
      date: baseDate,
      startHour: 10,
      duration: 2.5,
      title: '流浪地球2',
      type: 'public',
      occupancy: '85/120',
      details: '热映中',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e7',
      hallId: 'h4',
      date: baseDate,
      startHour: 12.5,
      duration: 0.5,
      title: '散场清洁',
      type: 'cleaning',
      details: '散场清洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e8',
      hallId: 'h4',
      date: baseDate,
      startHour: 13,
      duration: 2.5,
      title: '满江红',
      type: 'public',
      occupancy: '110/120',
      details: '即将满座',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e9',
      hallId: 'h4',
      date: baseDate,
      startHour: 15.5,
      duration: 0.5,
      title: '散场清洁',
      type: 'cleaning',
      details: '散场清洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e10',
      hallId: 'h4',
      date: baseDate,
      startHour: 16,
      duration: 2.5,
      title: '深海',
      type: 'public',
      occupancy: '60/120',
      details: '特效厅',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e11',
      hallId: 'h4',
      date: baseDate,
      startHour: 18.5,
      duration: 0.5,
      title: '散场清洁',
      type: 'cleaning',
      details: '散场清洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e12',
      hallId: 'h4',
      date: baseDate,
      startHour: 19,
      duration: 2.5,
      title: '流浪地球2',
      type: 'public',
      occupancy: '120/120',
      details: '满座',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e13',
      hallId: 'h4',
      date: baseDate,
      startHour: 21.5,
      duration: 0.5,
      title: '散场清洁',
      type: 'cleaning',
      details: '散场清洁',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
    {
      id: 'e14',
      hallId: 'h4',
      date: baseDate,
      startHour: 22,
      duration: 2,
      title: '无名',
      type: 'public',
      occupancy: '45/120',
      details: '深夜场',
      createdAt: '2025-01-20T10:00:00.000Z',
      updatedAt: '2025-01-20T10:00:00.000Z',
    },
  ];
}

// In-memory storage for schedule events (simulating database)
let scheduleEventsStore: ScheduleEvent[] = [];

/**
 * Initialize mock data for a specific date
 * @param date Date string in YYYY-MM-DD format
 */
export function initializeMockData(date: string): void {
  scheduleEventsStore = generateMockEvents(date);
}

/**
 * Get all schedule events (for MSW handlers)
 */
export function getScheduleEventsStore(): ScheduleEvent[] {
  return scheduleEventsStore;
}

/**
 * Set schedule events store (for MSW handlers)
 */
export function setScheduleEventsStore(events: ScheduleEvent[]): void {
  scheduleEventsStore = events;
}

