/**
 * 场景包管理 MSW Handlers
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */

import { http, HttpResponse } from 'msw';
import {
  mockScenarioPackages,
  mockPackageDetails,
  generatePackageId,
} from '../data/scenarioPackageMockData';
import type {
  CreatePackageRequest,
  UpdatePackageRequest,
  ScenarioPackageDetail,
} from '@/features/scenario-package-management/types';

const BASE_URL = 'http://localhost:8080/api';

// 内存中的数据存储（模拟数据库）
let packages = [...mockScenarioPackages];
let packageDetails = { ...mockPackageDetails };

export const scenarioPackageHandlers = [
  // 查询场景包列表
  http.get(`${BASE_URL}/scenario-packages`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '20');
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword');

    // 过滤
    let filteredPackages = packages.filter((pkg) => !pkg.deletedAt);

    if (status) {
      filteredPackages = filteredPackages.filter((pkg) => pkg.status === status);
    }

    if (keyword) {
      filteredPackages = filteredPackages.filter(
        (pkg) =>
          pkg.name.includes(keyword) || (pkg.description && pkg.description.includes(keyword))
      );
    }

    // 分页
    const start = page * size;
    const end = start + size;
    const paginatedData = filteredPackages.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: paginatedData,
      total: filteredPackages.length,
      timestamp: new Date().toISOString(),
    });
  }),

  // 查询单个场景包详情
  http.get(`${BASE_URL}/scenario-packages/:id`, ({ params }) => {
    const { id } = params;
    const pkg = packageDetails[id as string];

    if (!pkg) {
      return HttpResponse.json(
        {
          error: 'PACKAGE_NOT_FOUND',
          message: `场景包不存在: ${id}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: pkg,
      timestamp: new Date().toISOString(),
    });
  }),

  // 创建场景包
  http.post(`${BASE_URL}/scenario-packages`, async ({ request }) => {
    const body = (await request.json()) as CreatePackageRequest;

    const newId = generatePackageId();
    const now = new Date().toISOString();

    const newPackage: ScenarioPackageDetail = {
      id: newId,
      basePackageId: null,
      version: 1,
      versionLock: 0,
      name: body.name,
      description: body.description,
      backgroundImageUrl: body.backgroundImageUrl,
      status: 'DRAFT',
      isLatest: true,
      rule: {
        durationHours: body.rule.durationHours,
        minPeople: body.rule.minPeople,
        maxPeople: body.rule.maxPeople,
      },
      hallTypes:
        body.hallTypeIds?.map((id) => ({
          id,
          name: `影厅-${id.substring(0, 8)}`,
        })) || [],
      content: {
        benefits: [],
        items: [],
        services: [],
      },
      createdAt: now,
      updatedAt: now,
      createdBy: 'mock-user',
    };

    // 添加到内存存储
    packageDetails[newId] = newPackage;
    packages.push({
      id: newId,
      name: newPackage.name,
      description: newPackage.description,
      status: newPackage.status,
      version: newPackage.version,
      durationHours: newPackage.rule?.durationHours || 0,
      peopleRange: `${newPackage.rule?.minPeople || 0}-${newPackage.rule?.maxPeople || 0}人`,
      hallCount: newPackage.hallTypes?.length || 0,
      createdAt: newPackage.createdAt,
      updatedAt: newPackage.updatedAt,
    });

    return HttpResponse.json(
      {
        data: newPackage,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // 更新场景包
  http.put(`${BASE_URL}/scenario-packages/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = (await request.json()) as UpdatePackageRequest;

    const pkg = packageDetails[id as string];

    if (!pkg) {
      return HttpResponse.json(
        {
          error: 'PACKAGE_NOT_FOUND',
          message: `场景包不存在: ${id}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 乐观锁检查
    if (pkg.versionLock !== body.versionLock) {
      return HttpResponse.json(
        {
          error: 'CONCURRENT_MODIFICATION',
          message: '该场景包已被他人修改，请刷新后重试',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      );
    }

    // 更新数据
    const updatedPackage: ScenarioPackageDetail = {
      ...pkg,
      name: body.name ?? pkg.name,
      description: body.description ?? pkg.description,
      backgroundImageUrl: body.backgroundImageUrl ?? pkg.backgroundImageUrl,
      versionLock: pkg.versionLock + 1,
      rule: body.rule
        ? {
            durationHours: body.rule.durationHours,
            minPeople: body.rule.minPeople,
            maxPeople: body.rule.maxPeople,
          }
        : pkg.rule,
      hallTypes:
        body.hallTypeIds?.map((hallId) => ({
          id: hallId,
          name: `影厅-${hallId.substring(0, 8)}`,
        })) || pkg.hallTypes,
      updatedAt: new Date().toISOString(),
    };

    packageDetails[id as string] = updatedPackage;

    // 同步更新列表数据
    const index = packages.findIndex((p) => p.id === id);
    if (index !== -1) {
      packages[index] = {
        ...packages[index],
        name: updatedPackage.name,
        description: updatedPackage.description,
        durationHours: updatedPackage.rule?.durationHours || 0,
        peopleRange: `${updatedPackage.rule?.minPeople || 0}-${updatedPackage.rule?.maxPeople || 0}人`,
        hallCount: updatedPackage.hallTypes?.length || 0,
        updatedAt: updatedPackage.updatedAt,
      };
    }

    return HttpResponse.json({
      data: updatedPackage,
      timestamp: new Date().toISOString(),
    });
  }),

  // 删除场景包（软删除）
  http.delete(`${BASE_URL}/scenario-packages/:id`, ({ params }) => {
    const { id } = params;

    const index = packages.findIndex((p) => p.id === id);
    if (index === -1) {
      return HttpResponse.json(
        {
          error: 'PACKAGE_NOT_FOUND',
          message: `场景包不存在: ${id}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // 软删除：设置 deletedAt
    packages[index] = {
      ...packages[index],
      deletedAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        message: '删除成功',
        timestamp: new Date().toISOString(),
      },
      { status: 204 }
    );
  }),
];
