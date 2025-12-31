/**
 * 活动类型管理 - MSW Mock Handlers
 */

import { http, HttpResponse } from 'msw';
import type { ActivityType } from '../../pages/activity-types/types/activity-type.types';
import { ActivityTypeStatus } from '../../pages/activity-types/types/activity-type.types';

// Mock 数据存储（使用 localStorage 持久化）
const STORAGE_KEY = 'mock_activity_types';

function getMockActivityTypes(): ActivityType[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // 默认数据
  return [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: '企业团建',
      description: '企业团队建设活动',
      status: ActivityTypeStatus.ENABLED,
      sort: 1,
      createdAt: '2025-12-18T10:00:00Z',
      updatedAt: '2025-12-18T10:00:00Z',
      createdBy: null,
      updatedBy: null,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: '订婚',
      description: '订婚仪式活动',
      status: ActivityTypeStatus.ENABLED,
      sort: 2,
      createdAt: '2025-12-18T10:00:00Z',
      updatedAt: '2025-12-18T10:00:00Z',
      createdBy: null,
      updatedBy: null,
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: '生日Party',
      description: '生日聚会活动',
      status: ActivityTypeStatus.ENABLED,
      sort: 3,
      createdAt: '2025-12-18T10:00:00Z',
      updatedAt: '2025-12-18T10:00:00Z',
      createdBy: null,
      updatedBy: null,
    },
  ];
}

function saveMockActivityTypes(types: ActivityType[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

export const activityTypeHandlers = [
  // GET /api/activity-types - 获取活动类型列表（运营后台）
  http.get('/api/activity-types', ({ request }) => {
    const url = new URL(request.url);
    const statusParam = url.searchParams.get('status');

    let types = getMockActivityTypes().filter((t) => t.status !== ActivityTypeStatus.DELETED);

    if (statusParam) {
      types = types.filter((t) => t.status === statusParam);
    }

    // 按 sort ASC, createdAt ASC 排序
    types.sort((a, b) => {
      if (a.sort !== b.sort) {
        return a.sort - b.sort;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return HttpResponse.json({
      success: true,
      data: types,
      total: types.length,
    });
  }),

  // GET /api/activity-types/enabled - 获取启用状态的活动类型列表（小程序端）
  http.get('/api/activity-types/enabled', () => {
    const types = getMockActivityTypes()
      .filter((t) => t.status === ActivityTypeStatus.ENABLED)
      .sort((a, b) => {
        if (a.sort !== b.sort) {
          return a.sort - b.sort;
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    return HttpResponse.json({
      success: true,
      data: types,
      total: types.length,
    });
  }),

  // GET /api/activity-types/:id - 获取单个活动类型
  http.get('/api/activity-types/:id', ({ params }) => {
    const { id } = params;
    const types = getMockActivityTypes();
    const activityType = types.find((t) => t.id === id && t.status !== ActivityTypeStatus.DELETED);

    if (!activityType) {
      return HttpResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: `活动类型不存在: ${id}`,
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: activityType,
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /api/activity-types - 创建活动类型
  http.post('/api/activity-types', async ({ request }) => {
    const payload = (await request.json()) as { name: string; description?: string; sort: number };
    const types = getMockActivityTypes();

    // 检查名称唯一性（排除已删除状态）
    const existing = types.find(
      (t) => t.name === payload.name && t.status !== ActivityTypeStatus.DELETED
    );
    if (existing) {
      return HttpResponse.json(
        {
          success: false,
          error: 'CONFLICT',
          message: '活动类型名称已存在: ' + payload.name,
        },
        { status: 409 }
      );
    }

    const newType: ActivityType = {
      id: crypto.randomUUID(),
      name: payload.name,
      description: payload.description || null,
      status: ActivityTypeStatus.ENABLED,
      sort: payload.sort,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: null,
      updatedBy: null,
    };

    types.push(newType);
    saveMockActivityTypes(types);

    return HttpResponse.json({
      data: newType,
      timestamp: new Date().toISOString(),
    });
  }),

  // PUT /api/activity-types/:id - 更新活动类型
  http.put('/api/activity-types/:id', async ({ params, request }) => {
    const { id } = params;
    const payload = (await request.json()) as { name: string; description?: string; sort: number };
    const types = getMockActivityTypes();
    const index = types.findIndex((t) => t.id === id && t.status !== ActivityTypeStatus.DELETED);

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: `活动类型不存在: ${id}`,
        },
        { status: 404 }
      );
    }

    // 检查名称唯一性（排除当前记录和已删除状态）
    const existing = types.find(
      (t) => t.id !== id && t.name === payload.name && t.status !== ActivityTypeStatus.DELETED
    );
    if (existing) {
      return HttpResponse.json(
        {
          success: false,
          error: 'CONFLICT',
          message: '活动类型名称已存在: ' + payload.name,
        },
        { status: 409 }
      );
    }

    types[index] = {
      ...types[index],
      name: payload.name,
      description: payload.description || null,
      sort: payload.sort,
      updatedAt: new Date().toISOString(),
    };

    saveMockActivityTypes(types);

    return HttpResponse.json({
      data: types[index],
      timestamp: new Date().toISOString(),
    });
  }),

  // DELETE /api/activity-types/:id - 删除活动类型（软删除）
  http.delete('/api/activity-types/:id', ({ params }) => {
    const { id } = params;
    const types = getMockActivityTypes();
    const index = types.findIndex((t) => t.id === id);

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: `活动类型不存在: ${id}`,
        },
        { status: 404 }
      );
    }

    types[index] = {
      ...types[index],
      status: ActivityTypeStatus.DELETED,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveMockActivityTypes(types);

    return HttpResponse.json({
      data: types[index],
      timestamp: new Date().toISOString(),
    });
  }),

  // PATCH /api/activity-types/:id/status - 切换活动类型状态
  http.patch('/api/activity-types/:id/status', async ({ params, request }) => {
    const { id } = params;
    const payload = (await request.json()) as { status: ActivityTypeStatus };
    const types = getMockActivityTypes();
    const index = types.findIndex((t) => t.id === id && t.status !== ActivityTypeStatus.DELETED);

    if (index === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: 'NOT_FOUND',
          message: `活动类型不存在: ${id}`,
        },
        { status: 404 }
      );
    }

    if (
      payload.status !== ActivityTypeStatus.ENABLED &&
      payload.status !== ActivityTypeStatus.DISABLED
    ) {
      return HttpResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: '状态只能是 ENABLED 或 DISABLED',
        },
        { status: 400 }
      );
    }

    types[index] = {
      ...types[index],
      status: payload.status,
      updatedAt: new Date().toISOString(),
    };

    saveMockActivityTypes(types);

    return HttpResponse.json({
      data: types[index],
      timestamp: new Date().toISOString(),
    });
  }),
];
