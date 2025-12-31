/**
 * MSW Handlers for Schedule Management API
 *
 * Mock API handlers for schedule and hall endpoints
 */

import { http, HttpResponse } from 'msw';
import type {
  ScheduleEvent,
  Hall,
  CreateScheduleEventRequest,
  UpdateScheduleEventRequest,
  ConflictCheckRequest,
} from '@/pages/schedule/types/schedule.types';
import {
  mockHalls,
  generateMockEvents,
  getScheduleEventsStore,
  setScheduleEventsStore,
  initializeMockData,
} from '../data/scheduleMockData';
import { checkTimeConflict } from '@/features/schedule-management/utils/conflictDetection';

// API延迟模拟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 初始化默认日期的数据
const today = new Date().toISOString().split('T')[0];
initializeMockData(today);

// ============================================================================
// Schedule Event Handlers
// ============================================================================

/**
 * GET /api/schedules - 获取排期事件列表
 */
export const getSchedulesHandler = http.get('/api/schedules', async ({ request }) => {
  await delay(300);

  const url = new URL(request.url);
  const date = url.searchParams.get('date') || today;
  const hallId = url.searchParams.get('hallId');
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');

  // 如果日期改变，重新初始化数据
  let events = getScheduleEventsStore();
  if (events.length === 0 || events[0]?.date !== date) {
    initializeMockData(date);
    events = getScheduleEventsStore();
  }

  // 应用筛选
  let filteredEvents = events.filter((event) => {
    if (hallId && event.hallId !== hallId) return false;
    if (type && event.type !== type) return false;
    if (status && event.status !== status) return false;
    return true;
  });

  return HttpResponse.json({
    success: true,
    data: filteredEvents,
    total: filteredEvents.length,
    code: 200,
    timestamp: Date.now(),
  });
});

/**
 * GET /api/schedules/:id - 获取排期事件详情
 */
export const getScheduleDetailHandler = http.get('/api/schedules/:id', async ({ params }) => {
  await delay(200);

  const { id } = params;
  const events = getScheduleEventsStore();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return HttpResponse.json(
      {
        success: false,
        message: '排期事件不存在',
        code: 404,
        timestamp: Date.now(),
      },
      { status: 404 }
    );
  }

  return HttpResponse.json({
    success: true,
    data: event,
    code: 200,
    timestamp: Date.now(),
  });
});

/**
 * POST /api/schedules - 创建排期事件
 */
export const createScheduleHandler = http.post('/api/schedules', async ({ request }) => {
  await delay(500);

  try {
    const requestData = (await request.json()) as CreateScheduleEventRequest;

    // 验证必填字段
    if (!requestData.hallId || !requestData.date || !requestData.title || !requestData.type) {
      return HttpResponse.json(
        {
          success: false,
          message: '缺少必填字段',
          code: 400,
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    // 包场必须有客户信息
    if (requestData.type === 'private' && !requestData.customer) {
      return HttpResponse.json(
        {
          success: false,
          message: '包场必须填写客户信息',
          code: 400,
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }

    // 检查冲突
    const events = getScheduleEventsStore();
    const conflicts = checkTimeConflict(
      {
        hallId: requestData.hallId,
        date: requestData.date,
        startHour: requestData.startHour,
        duration: requestData.duration,
        type: requestData.type,
      },
      events
    );

    if (conflicts.length > 0) {
      return HttpResponse.json(
        {
          success: false,
          message: '该时间段已被占用，请选择其他时间',
          code: 409,
          timestamp: Date.now(),
        },
        { status: 409 }
      );
    }

    // 创建新事件
    const newEvent: ScheduleEvent = {
      id: `e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...requestData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 更新存储
    const updatedEvents = [...events, newEvent];
    setScheduleEventsStore(updatedEvents);

    return HttpResponse.json(
      {
        success: true,
        data: newEvent,
        message: '创建成功',
        code: 201,
        timestamp: Date.now(),
      },
      { status: 201 }
    );
  } catch (error) {
    return HttpResponse.json(
      {
        success: false,
        message: '创建失败：无效的请求数据',
        code: 400,
        timestamp: Date.now(),
      },
      { status: 400 }
    );
  }
});

/**
 * PUT /api/schedules/:id - 更新排期事件
 */
export const updateScheduleHandler = http.put('/api/schedules/:id', async ({ params, request }) => {
  await delay(500);

  try {
    const { id } = params;
    const updateData = (await request.json()) as Partial<UpdateScheduleEventRequest>;

    const events = getScheduleEventsStore();
    const eventIndex = events.findIndex((e) => e.id === id);

    if (eventIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: '排期事件不存在',
          code: 404,
          timestamp: Date.now(),
        },
        { status: 404 }
      );
    }

    const existingEvent = events[eventIndex];
    const updatedEvent = { ...existingEvent, ...updateData };

    // 如果时间改变，检查冲突
    if (
      updateData.startHour !== undefined ||
      updateData.duration !== undefined ||
      updateData.hallId !== undefined
    ) {
      const conflicts = checkTimeConflict(
        {
          hallId: updatedEvent.hallId,
          date: updatedEvent.date,
          startHour: updatedEvent.startHour,
          duration: updatedEvent.duration,
          type: updatedEvent.type,
        },
        events,
        id as string
      );

      if (conflicts.length > 0) {
        return HttpResponse.json(
          {
            success: false,
            message: '该时间段已被占用，请选择其他时间',
            code: 409,
            timestamp: Date.now(),
          },
          { status: 409 }
        );
      }
    }

    // 更新事件
    updatedEvent.updatedAt = new Date().toISOString();
    const updatedEvents = [...events];
    updatedEvents[eventIndex] = updatedEvent;
    setScheduleEventsStore(updatedEvents);

    return HttpResponse.json({
      success: true,
      data: updatedEvent,
      message: '更新成功',
      code: 200,
      timestamp: Date.now(),
    });
  } catch (error) {
    return HttpResponse.json(
      {
        success: false,
        message: '更新失败：无效的请求数据',
        code: 400,
        timestamp: Date.now(),
      },
      { status: 400 }
    );
  }
});

/**
 * DELETE /api/schedules/:id - 删除排期事件
 */
export const deleteScheduleHandler = http.delete('/api/schedules/:id', async ({ params }) => {
  await delay(300);

  const { id } = params;
  const events = getScheduleEventsStore();
  const filteredEvents = events.filter((e) => e.id !== id);

  if (filteredEvents.length === events.length) {
    return HttpResponse.json(
      {
        success: false,
        message: '排期事件不存在',
        code: 404,
        timestamp: Date.now(),
      },
      { status: 404 }
    );
  }

  setScheduleEventsStore(filteredEvents);

  return HttpResponse.json({
    success: true,
    message: '删除成功',
    code: 200,
    timestamp: Date.now(),
  });
});

/**
 * POST /api/schedules/conflict-check - 检查时间冲突
 */
export const checkConflictHandler = http.post(
  '/api/schedules/conflict-check',
  async ({ request }) => {
    await delay(200);

    try {
      const requestData = (await request.json()) as ConflictCheckRequest;
      const events = getScheduleEventsStore();

      const conflicts = checkTimeConflict(requestData, events, requestData.excludeEventId);

      return HttpResponse.json({
        success: true,
        data: {
          hasConflict: conflicts.length > 0,
          conflictingEvents: conflicts,
        },
        code: 200,
        timestamp: Date.now(),
      });
    } catch (error) {
      return HttpResponse.json(
        {
          success: false,
          message: '冲突检查失败',
          code: 400,
          timestamp: Date.now(),
        },
        { status: 400 }
      );
    }
  }
);

// ============================================================================
// Hall Handlers
// ============================================================================

/**
 * GET /api/halls - 获取影厅列表
 */
export const getHallsHandler = http.get('/api/halls', async ({ request }) => {
  await delay(200);

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const type = url.searchParams.get('type');

  let filteredHalls = [...mockHalls];

  if (status) {
    filteredHalls = filteredHalls.filter((h) => h.status === status);
  }
  if (type) {
    filteredHalls = filteredHalls.filter((h) => h.type === type);
  }

  return HttpResponse.json({
    success: true,
    data: filteredHalls,
    total: filteredHalls.length,
    code: 200,
    timestamp: Date.now(),
  });
});

/**
 * GET /api/halls/:id - 获取影厅详情
 */
export const getHallDetailHandler = http.get('/api/halls/:id', async ({ params }) => {
  await delay(200);

  const { id } = params;
  const hall = mockHalls.find((h) => h.id === id);

  if (!hall) {
    return HttpResponse.json(
      {
        success: false,
        message: '影厅不存在',
        code: 404,
        timestamp: Date.now(),
      },
      { status: 404 }
    );
  }

  return HttpResponse.json({
    success: true,
    data: hall,
    code: 200,
    timestamp: Date.now(),
  });
});

// ============================================================================
// Export all handlers
// ============================================================================

export const scheduleHandlers = [
  getSchedulesHandler,
  getScheduleDetailHandler,
  createScheduleHandler,
  updateScheduleHandler,
  deleteScheduleHandler,
  checkConflictHandler,
  getHallsHandler,
  getHallDetailHandler,
];
