/**
 * 场景包 Mock 数据
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import type {
  ScenarioPackageDetail,
  ScenarioPackageSummary,
} from '@/features/scenario-package-management/types';

// Mock 场景包列表数据
export const mockScenarioPackages: ScenarioPackageSummary[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'VIP生日派对专场',
    description: '适合10-20人的生日派对，包含私人影厅和定制服务',
    status: 'DRAFT',
    version: 1,
    durationHours: 3,
    peopleRange: '10-20人',
    hallCount: 2,
    createdAt: '2025-12-19T10:00:00Z',
    updatedAt: '2025-12-19T10:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: '浪漫情侣专场',
    description: '双人私密观影，含鲜花、香槟和定制餐饮',
    status: 'PUBLISHED',
    version: 2,
    durationHours: 2.5,
    peopleRange: '2人',
    hallCount: 1,
    createdAt: '2025-12-18T15:30:00Z',
    updatedAt: '2025-12-19T09:00:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: '企业团建包场',
    description: '30-50人大型团建活动，含团队游戏和餐饮',
    status: 'PUBLISHED',
    version: 1,
    durationHours: 4,
    peopleRange: '30-50人',
    hallCount: 3,
    createdAt: '2025-12-17T14:00:00Z',
    updatedAt: '2025-12-18T16:30:00Z',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: '家庭亲子套餐',
    description: '适合3-5口之家，儿童友好，含爆米花和饮料',
    status: 'DRAFT',
    version: 1,
    durationHours: 2,
    peopleRange: '3-5人',
    hallCount: 1,
    createdAt: '2025-12-19T08:00:00Z',
    updatedAt: '2025-12-19T08:00:00Z',
  },
];

// Mock 场景包详情数据
export const mockPackageDetails: Record<string, ScenarioPackageDetail> = {
  '550e8400-e29b-41d4-a716-446655440001': {
    id: '550e8400-e29b-41d4-a716-446655440001',
    basePackageId: null,
    version: 1,
    versionLock: 0,
    name: 'VIP生日派对专场',
    description: '适合10-20人的生日派对，包含私人影厅和定制服务',
    backgroundImageUrl: 'https://picsum.photos/seed/vip-birthday/800/600',
    status: 'DRAFT',
    isLatest: true,
    rule: {
      durationHours: 3,
      minPeople: 10,
      maxPeople: 20,
    },
    hallTypes: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'VIP豪华厅',
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: '多功能厅',
      },
    ],
    content: {
      benefits: [],
      items: [],
      services: [],
    },
    createdAt: '2025-12-19T10:00:00Z',
    updatedAt: '2025-12-19T10:00:00Z',
    createdBy: 'admin',
  },
  '550e8400-e29b-41d4-a716-446655440002': {
    id: '550e8400-e29b-41d4-a716-446655440002',
    basePackageId: null,
    version: 2,
    versionLock: 1,
    name: '浪漫情侣专场',
    description: '双人私密观影，含鲜花、香槟和定制餐饮',
    backgroundImageUrl: 'https://picsum.photos/seed/romantic/800/600',
    status: 'PUBLISHED',
    isLatest: true,
    rule: {
      durationHours: 2.5,
      minPeople: 2,
      maxPeople: 2,
    },
    hallTypes: [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: '情侣专座厅',
      },
    ],
    content: {
      benefits: [],
      items: [],
      services: [],
    },
    createdAt: '2025-12-18T15:30:00Z',
    updatedAt: '2025-12-19T09:00:00Z',
    createdBy: 'admin',
  },
  '550e8400-e29b-41d4-a716-446655440003': {
    id: '550e8400-e29b-41d4-a716-446655440003',
    basePackageId: null,
    version: 1,
    versionLock: 0,
    name: '企业团建包场',
    description: '30-50人大型团建活动，含团队游戏和餐饮',
    backgroundImageUrl: 'https://picsum.photos/seed/team-building/800/600',
    status: 'PUBLISHED',
    isLatest: true,
    rule: {
      durationHours: 4,
      minPeople: 30,
      maxPeople: 50,
    },
    hallTypes: [
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: '大型会议厅',
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174004',
        name: '多功能活动厅',
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174005',
        name: '户外露天影院',
      },
    ],
    content: {
      benefits: [],
      items: [],
      services: [],
    },
    createdAt: '2025-12-17T14:00:00Z',
    updatedAt: '2025-12-18T16:30:00Z',
    createdBy: 'admin',
  },
  '550e8400-e29b-41d4-a716-446655440004': {
    id: '550e8400-e29b-41d4-a716-446655440004',
    basePackageId: null,
    version: 1,
    versionLock: 0,
    name: '家庭亲子套餐',
    description: '适合3-5口之家，儿童友好，含爆米花和饮料',
    backgroundImageUrl: 'https://picsum.photos/seed/family/800/600',
    status: 'DRAFT',
    isLatest: true,
    rule: {
      durationHours: 2,
      minPeople: 3,
      maxPeople: 5,
    },
    hallTypes: [
      {
        id: '123e4567-e89b-12d3-a456-426614174006',
        name: '家庭影厅',
      },
    ],
    content: {
      benefits: [],
      items: [],
      services: [],
    },
    createdAt: '2025-12-19T08:00:00Z',
    updatedAt: '2025-12-19T08:00:00Z',
    createdBy: 'admin',
  },
};

// 用于生成新场景包ID
export const generatePackageId = (): string => {
  return `550e8400-e29b-41d4-a716-${Math.random().toString(36).substring(2, 15)}`;
};
