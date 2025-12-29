/**
 * 场景包编辑器 MSW Mock Handlers
 * Feature: 001-scenario-package-tabs
 */

import { http, HttpResponse } from 'msw';
import type {
  ScenarioPackage,
  PackageTier,
  AddOnItem,
  ScenarioPackageAddOn,
  TimeSlotTemplate,
  TimeSlotOverride,
  PublishStatus,
  DayOfWeek,
  AddOnCategory,
  OverrideType,
} from '../types';

const BASE_URL = '/api';

// ========== Mock 数据 ==========

const mockPackage: ScenarioPackage = {
  id: 'pkg-001',
  name: '商务团建经典套餐',
  description: '适合10-30人的商务团建活动，包含影厅包场、茶歇服务和专属布置',
  category: 'TEAM',
  mainImage: 'https://picsum.photos/800/600',
  status: 'DRAFT' as PublishStatus,
  effectiveStartDate: null,
  effectiveEndDate: null,
  advanceBookingDays: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'user-001',
  updatedBy: 'user-001',
};

const mockTiers: PackageTier[] = [
  {
    id: 'tier-001',
    scenarioPackageId: 'pkg-001',
    name: '标准套餐',
    price: 199900, // ¥1999
    originalPrice: 259900,
    tags: ['人气推荐'],
    serviceDescription: '包含：\n- 4小时影厅包场\n- 基础茶歇服务\n- 投影设备使用',
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tier-002',
    scenarioPackageId: 'pkg-001',
    name: '豪华套餐',
    price: 399900, // ¥3999
    originalPrice: 499900,
    tags: ['VIP专享', '含接送'],
    serviceDescription: '包含：\n- 6小时影厅包场\n- 精品茶歇服务\n- 专属布置\n- 接送服务',
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAddOnItems: AddOnItem[] = [
  {
    id: 'addon-001',
    name: '精美茶歇',
    price: 29900, // ¥299
    category: 'CATERING' as AddOnCategory,
    imageUrl: 'https://picsum.photos/200/200?random=1',
    inventory: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'addon-002',
    name: '红酒拼盘',
    price: 59900, // ¥599
    category: 'BEVERAGE' as AddOnCategory,
    imageUrl: 'https://picsum.photos/200/200?random=2',
    inventory: 20,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'addon-003',
    name: '气球布置',
    price: 19900, // ¥199
    category: 'DECORATION' as AddOnCategory,
    imageUrl: 'https://picsum.photos/200/200?random=3',
    inventory: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'addon-004',
    name: '专属摄影',
    price: 99900, // ¥999
    category: 'SERVICE' as AddOnCategory,
    imageUrl: 'https://picsum.photos/200/200?random=4',
    inventory: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockPackageAddOns: ScenarioPackageAddOn[] = [
  {
    id: 'pa-001',
    scenarioPackageId: 'pkg-001',
    addOnItemId: 'addon-001',
    sortOrder: 0,
    isRequired: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pa-002',
    scenarioPackageId: 'pkg-001',
    addOnItemId: 'addon-003',
    sortOrder: 1,
    isRequired: false,
    createdAt: new Date().toISOString(),
  },
];

const mockTimeSlotTemplates: TimeSlotTemplate[] = [
  {
    id: 'tst-001',
    scenarioPackageId: 'pkg-001',
    dayOfWeek: 1 as DayOfWeek,
    startTime: '09:00',
    endTime: '13:00',
    capacity: 2,
    priceAdjustment: null,
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tst-002',
    scenarioPackageId: 'pkg-001',
    dayOfWeek: 1 as DayOfWeek,
    startTime: '14:00',
    endTime: '18:00',
    capacity: 2,
    priceAdjustment: null,
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'tst-003',
    scenarioPackageId: 'pkg-001',
    dayOfWeek: 6 as DayOfWeek, // 周六
    startTime: '10:00',
    endTime: '14:00',
    capacity: 3,
    priceAdjustment: { type: 'PERCENTAGE', value: 20 },
    isEnabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockTimeSlotOverrides: TimeSlotOverride[] = [
  {
    id: 'tso-001',
    scenarioPackageId: 'pkg-001',
    date: '2024-02-10', // 春节假期
    overrideType: 'CANCEL' as OverrideType,
    startTime: null,
    endTime: null,
    capacity: null,
    reason: '春节假期休息',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ========== Mock Handlers ==========

export const scenarioPackageEditorHandlers = [
  // ========== 场景包详情 ==========

  // GET /scenario-packages/:id
  http.get(`${BASE_URL}/scenario-packages/:id`, ({ params }) => {
    const { id } = params;
    if (id !== 'pkg-001') {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '场景包不存在' },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: {
        package: mockPackage,
        packages: mockTiers,
        addons: mockPackageAddOns,
        timeSlotTemplates: mockTimeSlotTemplates,
        timeSlotOverrides: mockTimeSlotOverrides,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // PUT /scenario-packages/:id/basic-info
  http.put(`${BASE_URL}/scenario-packages/:id/basic-info`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: {
        ...mockPackage,
        ...body,
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // ========== 套餐管理 ==========

  // GET /scenario-packages/:id/tiers
  http.get(`${BASE_URL}/scenario-packages/:id/tiers`, () => {
    return HttpResponse.json({
      success: true,
      data: mockTiers,
      total: mockTiers.length,
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /scenario-packages/:id/tiers
  http.post(`${BASE_URL}/scenario-packages/:id/tiers`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;
    const newTier: PackageTier = {
      id: `tier-${Date.now()}`,
      scenarioPackageId: id as string,
      name: body.name as string,
      price: body.price as number,
      originalPrice: (body.originalPrice as number) || null,
      tags: (body.tags as string[]) || null,
      serviceDescription: (body.serviceDescription as string) || null,
      sortOrder: mockTiers.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTiers.push(newTier);
    return HttpResponse.json({
      success: true,
      data: newTier,
      timestamp: new Date().toISOString(),
    });
  }),

  // PUT /scenario-packages/:id/tiers/:tierId
  http.put(`${BASE_URL}/scenario-packages/:id/tiers/:tierId`, async ({ params, request }) => {
    const { tierId } = params;
    const body = await request.json() as Record<string, unknown>;
    const tierIndex = mockTiers.findIndex((t) => t.id === tierId);
    if (tierIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '套餐不存在' },
        { status: 404 }
      );
    }
    mockTiers[tierIndex] = {
      ...mockTiers[tierIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({
      success: true,
      data: mockTiers[tierIndex],
      timestamp: new Date().toISOString(),
    });
  }),

  // DELETE /scenario-packages/:id/tiers/:tierId
  http.delete(`${BASE_URL}/scenario-packages/:id/tiers/:tierId`, ({ params }) => {
    const { tierId } = params;
    const tierIndex = mockTiers.findIndex((t) => t.id === tierId);
    if (tierIndex !== -1) {
      mockTiers.splice(tierIndex, 1);
    }
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /scenario-packages/:id/tiers/reorder
  http.post(`${BASE_URL}/scenario-packages/:id/tiers/reorder`, async ({ request }) => {
    const body = await request.json() as { tierIds: string[] };
    body.tierIds.forEach((id, index) => {
      const tier = mockTiers.find((t) => t.id === id);
      if (tier) {
        tier.sortOrder = index;
      }
    });
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  // ========== 加购项管理 ==========

  // GET /addon-items
  http.get(`${BASE_URL}/addon-items`, () => {
    return HttpResponse.json({
      success: true,
      data: mockAddOnItems,
      total: mockAddOnItems.length,
      timestamp: new Date().toISOString(),
    });
  }),

  // GET /scenario-packages/:id/addons
  http.get(`${BASE_URL}/scenario-packages/:id/addons`, () => {
    return HttpResponse.json({
      success: true,
      data: mockPackageAddOns,
      total: mockPackageAddOns.length,
      timestamp: new Date().toISOString(),
    });
  }),

  // PUT /scenario-packages/:id/addons
  http.put(`${BASE_URL}/scenario-packages/:id/addons`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as { addons: Array<{ addOnItemId: string; sortOrder: number; isRequired: boolean }> };
    // 清空并重建关联
    mockPackageAddOns.length = 0;
    body.addons.forEach((addon, index) => {
      mockPackageAddOns.push({
        id: `pa-${Date.now()}-${index}`,
        scenarioPackageId: id as string,
        addOnItemId: addon.addOnItemId,
        sortOrder: addon.sortOrder,
        isRequired: addon.isRequired,
        createdAt: new Date().toISOString(),
      });
    });
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  // ========== 时段模板管理 ==========

  // GET /scenario-packages/:id/time-slot-templates
  http.get(`${BASE_URL}/scenario-packages/:id/time-slot-templates`, () => {
    return HttpResponse.json({
      success: true,
      data: mockTimeSlotTemplates,
      total: mockTimeSlotTemplates.length,
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /scenario-packages/:id/time-slot-templates
  http.post(`${BASE_URL}/scenario-packages/:id/time-slot-templates`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;
    const newTemplate: TimeSlotTemplate = {
      id: `tst-${Date.now()}`,
      scenarioPackageId: id as string,
      dayOfWeek: body.dayOfWeek as DayOfWeek,
      startTime: body.startTime as string,
      endTime: body.endTime as string,
      capacity: (body.capacity as number) || null,
      priceAdjustment: body.priceAdjustment as TimeSlotTemplate['priceAdjustment'],
      isEnabled: body.isEnabled !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTimeSlotTemplates.push(newTemplate);
    return HttpResponse.json({
      success: true,
      data: newTemplate,
      timestamp: new Date().toISOString(),
    });
  }),

  // PUT /scenario-packages/:id/time-slot-templates/:templateId
  http.put(`${BASE_URL}/scenario-packages/:id/time-slot-templates/:templateId`, async ({ params, request }) => {
    const { templateId } = params;
    const body = await request.json() as Record<string, unknown>;
    const templateIndex = mockTimeSlotTemplates.findIndex((t) => t.id === templateId);
    if (templateIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'NOT_FOUND', message: '时段模板不存在' },
        { status: 404 }
      );
    }
    mockTimeSlotTemplates[templateIndex] = {
      ...mockTimeSlotTemplates[templateIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({
      success: true,
      data: mockTimeSlotTemplates[templateIndex],
      timestamp: new Date().toISOString(),
    });
  }),

  // DELETE /scenario-packages/:id/time-slot-templates/:templateId
  http.delete(`${BASE_URL}/scenario-packages/:id/time-slot-templates/:templateId`, ({ params }) => {
    const { templateId } = params;
    const templateIndex = mockTimeSlotTemplates.findIndex((t) => t.id === templateId);
    if (templateIndex !== -1) {
      mockTimeSlotTemplates.splice(templateIndex, 1);
    }
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  // ========== 时段覆盖管理 ==========

  // GET /scenario-packages/:id/time-slot-overrides
  http.get(`${BASE_URL}/scenario-packages/:id/time-slot-overrides`, () => {
    return HttpResponse.json({
      success: true,
      data: mockTimeSlotOverrides,
      total: mockTimeSlotOverrides.length,
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /scenario-packages/:id/time-slot-overrides
  http.post(`${BASE_URL}/scenario-packages/:id/time-slot-overrides`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Record<string, unknown>;
    const newOverride: TimeSlotOverride = {
      id: `tso-${Date.now()}`,
      scenarioPackageId: id as string,
      date: body.date as string,
      overrideType: body.overrideType as OverrideType,
      startTime: (body.startTime as string) || null,
      endTime: (body.endTime as string) || null,
      capacity: (body.capacity as number) || null,
      reason: (body.reason as string) || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTimeSlotOverrides.push(newOverride);
    return HttpResponse.json({
      success: true,
      data: newOverride,
      timestamp: new Date().toISOString(),
    });
  }),

  // DELETE /scenario-packages/:id/time-slot-overrides/:overrideId
  http.delete(`${BASE_URL}/scenario-packages/:id/time-slot-overrides/:overrideId`, ({ params }) => {
    const { overrideId } = params;
    const overrideIndex = mockTimeSlotOverrides.findIndex((o) => o.id === overrideId);
    if (overrideIndex !== -1) {
      mockTimeSlotOverrides.splice(overrideIndex, 1);
    }
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  // ========== 发布管理 ==========

  // PUT /scenario-packages/:id/publish-settings
  http.put(`${BASE_URL}/scenario-packages/:id/publish-settings`, async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: {
        ...mockPackage,
        effectiveStartDate: body.effectiveStartDate || null,
        effectiveEndDate: body.effectiveEndDate || null,
        advanceBookingDays: body.advanceBookingDays || null,
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // GET /scenario-packages/:id/publish-validation
  http.get(`${BASE_URL}/scenario-packages/:id/publish-validation`, () => {
    const hasTiers = mockTiers.length > 0;
    const hasTimeSlots = mockTimeSlotTemplates.filter((t) => t.isEnabled).length > 0;

    return HttpResponse.json({
      success: true,
      data: {
        canPublish: hasTiers && hasTimeSlots,
        checks: [
          {
            item: '基础信息',
            passed: true,
            message: '已填写完整',
          },
          {
            item: '套餐配置',
            passed: hasTiers,
            message: hasTiers ? '已配置套餐' : '至少需要配置1个套餐',
          },
          {
            item: '时段配置',
            passed: hasTimeSlots,
            message: hasTimeSlots ? '已配置时段' : '至少需要启用1个时段',
          },
        ],
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /scenario-packages/:id/publish
  http.post(`${BASE_URL}/scenario-packages/:id/publish`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        ...mockPackage,
        status: 'PUBLISHED' as PublishStatus,
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // POST /scenario-packages/:id/archive
  http.post(`${BASE_URL}/scenario-packages/:id/archive`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        ...mockPackage,
        status: 'ARCHIVED' as PublishStatus,
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });
  }),
];

export default scenarioPackageEditorHandlers;
