# Data Model: 排期管理甘特图视图

**Feature**: 013-schedule-management  
**Date**: 2025-01-27  
**Status**: Design Complete

## Overview

本文档定义了排期管理功能的数据模型，包括影厅资源、排期事件、时间轴配置等核心实体及其关系。

## Core Entities

### 1. 影厅资源 (Hall)

代表一个可被预约的影厅资源。

```typescript
interface Hall {
  id: string;                    // 唯一标识
  name: string;                  // 影厅名称，如 "1号厅 (VIP)"
  capacity: number;               // 容量（座位数）
  type: HallType;                // 影厅类型：'VIP' | 'Public' | 'CP' | 'Party'
  tags: string[];                // 标签列表，如 ['真皮沙发', '管家服务']
  operatingHours?: {              // 营业时间配置（可选，默认使用全局配置）
    startHour: number;            // 开始小时，如 10
    endHour: number;              // 结束小时，如 24
  };
  status: 'active' | 'inactive' | 'maintenance'; // 状态
  createdAt: string;              // 创建时间
  updatedAt: string;              // 更新时间
}

type HallType = 'VIP' | 'Public' | 'CP' | 'Party';
```

**Validation Rules**:
- `id`: 必填，唯一，格式：字母数字下划线
- `name`: 必填，长度 1-50 字符
- `capacity`: 必填，正整数，范围 1-1000
- `type`: 必填，枚举值
- `tags`: 可选，数组，每个标签长度 1-20 字符

---

### 2. 排期事件 (ScheduleEvent)

代表一个排期安排，可以是公映排片、包场预约、维护时段或保洁时段。

```typescript
interface ScheduleEvent {
  id: string;                     // 唯一标识
  hallId: string;                 // 所属影厅ID
  date: string;                    // 日期，格式：YYYY-MM-DD
  startHour: number;               // 开始时间（小时），支持小数，如 10.5 = 10:30
  duration: number;                // 持续时间（小时），支持小数，如 2.5 = 2小时30分钟
  title: string;                   // 事件标题
  type: EventType;                // 事件类型
  status?: EventStatus;           // 事件状态（仅包场类型）
  customer?: string;              // 客户信息（包场类型）
  serviceManager?: string;        // 服务经理（包场类型）
  occupancy?: string;             // 上座率（公映类型），格式：'85/120'
  details?: string;               // 备注详情
  createdAt: string;              // 创建时间
  updatedAt: string;              // 更新时间
  createdBy?: string;             // 创建人
  updatedBy?: string;             // 更新人
}

type EventType = 'public' | 'private' | 'maintenance' | 'cleaning';
type EventStatus = 'confirmed' | 'pending' | 'locked'; // 仅包场类型使用
```

**Validation Rules**:
- `id`: 必填，唯一
- `hallId`: 必填，必须存在于 Hall 表中
- `date`: 必填，格式：YYYY-MM-DD
- `startHour`: 必填，范围 0-24，支持 0.5 间隔（30分钟）
- `duration`: 必填，正数，范围 0.5-24
- `title`: 必填，长度 1-100 字符
- `type`: 必填，枚举值
- `status`: 可选，仅当 `type === 'private'` 时有效
- `customer`: 可选，当 `type === 'private'` 时建议填写
- `serviceManager`: 可选，当 `type === 'private'` 时建议填写
- `occupancy`: 可选，当 `type === 'public'` 时使用，格式：'当前人数/总容量'

**Business Rules**:
- 同一影厅在同一时间段不能有重叠的事件（维护/保洁除外，可以与业务事件重叠）
- 事件结束时间不能超过营业时间结束时间
- 包场类型必须包含客户信息
- 公映类型可以包含上座率信息

---

### 3. 时间轴配置 (TimelineConfig)

代表营业时间的全局配置。

```typescript
interface TimelineConfig {
  startHour: number;              // 开始小时，如 10
  endHour: number;                // 结束小时，如 24
  interval: number;               // 时间间隔（小时），如 0.5（30分钟）或 1（1小时）
  timeFormat: '12h' | '24h';      // 时间显示格式
}

// 默认配置
const defaultTimelineConfig: TimelineConfig = {
  startHour: 10,
  endHour: 24,
  interval: 1,                     // 1小时间隔
  timeFormat: '24h',
};
```

**Validation Rules**:
- `startHour`: 必填，范围 0-23
- `endHour`: 必填，范围 1-24，必须 > startHour
- `interval`: 必填，范围 0.25-2，常见值：0.5（30分钟）、1（1小时）
- `timeFormat`: 必填，枚举值

---

## Relationships

### Hall ↔ ScheduleEvent

- **One-to-Many**: 一个影厅可以有多个排期事件
- **Foreign Key**: `ScheduleEvent.hallId` → `Hall.id`
- **Cascade**: 删除影厅时，需要处理关联的排期事件（标记为已删除或迁移到其他影厅）

### TimelineConfig (Global)

- **Singleton**: 全局单例配置，所有影厅共享（除非影厅有自定义营业时间）

---

## State Management

### Zustand Store Structure

```typescript
interface ScheduleStore {
  // UI State
  selectedDate: string;           // 当前选中的日期
  selectedEvent: ScheduleEvent | null; // 当前选中的事件
  viewportScroll: {               // 视口滚动位置
    scrollTop: number;
    scrollLeft: number;
  };
  filters: {                      // 筛选条件
    hallIds?: string[];
    eventTypes?: EventType[];
    statuses?: EventStatus[];
  };
  
  // Actions
  setSelectedDate: (date: string) => void;
  setSelectedEvent: (event: ScheduleEvent | null) => void;
  setViewportScroll: (scroll: { scrollTop: number; scrollLeft: number }) => void;
  setFilters: (filters: Partial<ScheduleStore['filters']>) => void;
  resetFilters: () => void;
}
```

### TanStack Query Keys

```typescript
const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (date: string) => [...scheduleKeys.lists(), date] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  halls: () => [...scheduleKeys.all, 'halls'] as const,
  hall: (id: string) => [...scheduleKeys.halls(), id] as const,
};
```

---

## Data Validation

### Zod Schemas

```typescript
import { z } from 'zod';

const hallSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(50),
  capacity: z.number().int().positive().max(1000),
  type: z.enum(['VIP', 'Public', 'CP', 'Party']),
  tags: z.array(z.string().min(1).max(20)).optional(),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
});

const scheduleEventSchema = z.object({
  id: z.string().min(1),
  hallId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startHour: z.number().min(0).max(24),
  duration: z.number().positive().max(24),
  title: z.string().min(1).max(100),
  type: z.enum(['public', 'private', 'maintenance', 'cleaning']),
  status: z.enum(['confirmed', 'pending', 'locked']).optional(),
  customer: z.string().max(100).optional(),
  serviceManager: z.string().max(50).optional(),
  occupancy: z.string().regex(/^\d+\/\d+$/).optional(),
  details: z.string().max(500).optional(),
}).refine((data) => {
  // 包场类型必须包含客户信息
  if (data.type === 'private' && !data.customer) {
    return false;
  }
  return true;
}, {
  message: '包场类型必须填写客户信息',
  path: ['customer'],
});
```

---

## Mock Data Structure

### Initial Mock Data

```typescript
const mockHalls: Hall[] = [
  {
    id: 'h1',
    name: '1号厅 (VIP)',
    capacity: 12,
    type: 'VIP',
    tags: ['真皮沙发', '管家服务'],
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  // ... more halls
];

const mockEvents: ScheduleEvent[] = [
  {
    id: 'e1',
    hallId: 'h1',
    date: '2025-01-27',
    startHour: 10.5,
    duration: 3,
    title: '刘总生日派对',
    type: 'private',
    status: 'confirmed',
    customer: '刘先生 138****0000',
    serviceManager: '王经理',
    details: '含豪华果盘 x2',
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
  },
  // ... more events
];
```

---

## Persistence Strategy

### LocalStorage Keys

```typescript
const STORAGE_KEYS = {
  SELECTED_DATE: 'schedule_selected_date',
  TIMELINE_CONFIG: 'schedule_timeline_config',
  FILTERS: 'schedule_filters',
  VIEWPORT_SCROLL: 'schedule_viewport_scroll',
} as const;
```

### MSW Handlers

- `GET /api/schedules?date=YYYY-MM-DD` - 获取指定日期的所有排期事件
- `GET /api/schedules/:id` - 获取单个排期事件详情
- `POST /api/schedules` - 创建新排期事件
- `PUT /api/schedules/:id` - 更新排期事件
- `DELETE /api/schedules/:id` - 删除排期事件
- `GET /api/halls` - 获取所有影厅资源
- `GET /api/halls/:id` - 获取单个影厅详情

---

## Summary

数据模型设计遵循以下原则：
1. **类型安全**: 使用 TypeScript 严格类型定义
2. **验证完整**: Zod schemas 确保数据完整性
3. **关系清晰**: 明确实体间的关系和约束
4. **状态分离**: UI 状态（Zustand）与服务器状态（TanStack Query）分离
5. **可扩展性**: 支持未来功能扩展（如多日期视图、冲突自动解决等）

