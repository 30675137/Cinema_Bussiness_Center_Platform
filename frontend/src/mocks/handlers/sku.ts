/**
 * SKU相关的MSW Mock Handlers
 * @since P001-sku-master-data
 */

import { http, HttpResponse } from 'msw';
import type { SKU, SKUDetail, BomComponent, ComboItem, SkuType, SkuStatus } from '@/types/sku';

// 内存存储
const skuStore = new Map<string, SKU>();
const bomStore = new Map<string, BomComponent[]>();
const comboStore = new Map<string, ComboItem[]>();

// 辅助函数：生成UUID
const generateId = () => crypto.randomUUID();

// 辅助函数：生成SKU编码
let skuCodeCounter = 1;
const generateSkuCode = (): string => {
  const code = `SKU${String(skuCodeCounter).padStart(6, '0')}`;
  skuCodeCounter++;
  return code;
};

// 辅助函数：计算成品成本
const calculateFinishedProductCost = (
  components: BomComponent[],
  wasteRate: number = 0
): number => {
  const componentCost = components.reduce(
    (sum, comp) => sum + (comp.totalCost || 0),
    0
  );
  return componentCost * (1 + wasteRate / 100);
};

// 辅助函数：计算套餐成本
const calculateComboCost = (items: ComboItem[]): number => {
  return items.reduce((sum, item) => sum + (item.totalCost || 0), 0);
};

/**
 * SKU API Mock Handlers
 */
export const skuHandlers = [
  // GET /api/skus - 获取SKU列表（支持筛选和分页）
  http.get('/api/skus', ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') || '';
    const skuType = url.searchParams.get('skuType') as SkuType | null;
    const status = url.searchParams.get('status') as SkuStatus | null;
    const storeId = url.searchParams.get('storeId') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);

    // 转换为数组
    let skus = Array.from(skuStore.values());

    // 筛选逻辑
    if (keyword) {
      skus = skus.filter(
        (sku) =>
          sku.name.toLowerCase().includes(keyword.toLowerCase()) ||
          sku.code.toLowerCase().includes(keyword.toLowerCase()) ||
          sku.mainBarcode?.includes(keyword)
      );
    }

    if (skuType) {
      skus = skus.filter((sku) => sku.skuType === skuType);
    }

    if (status) {
      skus = skus.filter((sku) => sku.status === status);
    }

    if (storeId) {
      skus = skus.filter(
        (sku) =>
          sku.storeScope.length === 0 || // 全门店
          sku.storeScope.includes(storeId) // 特定门店
      );
    }

    // 分页
    const total = skus.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSkus = skus.slice(start, end);

    return HttpResponse.json({
      success: true,
      data: paginatedSkus,
      total,
      page,
      pageSize,
      message: '查询成功'
    });
  }),

  // GET /api/skus/:id - 获取SKU详情（包含BOM/套餐数据）
  http.get('/api/skus/:id', ({ params }) => {
    const { id } = params;
    const sku = skuStore.get(id as string);

    if (!sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_NOT_FOUND',
          message: `未找到ID为 ${id} 的SKU`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    const detail: SKUDetail = {
      ...sku,
      bomComponents: bomStore.get(id as string),
      comboItems: comboStore.get(id as string)
    };

    return HttpResponse.json({
      success: true,
      data: detail,
      timestamp: new Date().toISOString()
    });
  }),

  // POST /api/skus - 创建SKU
  http.post('/api/skus', async ({ request }) => {
    const body = (await request.json()) as Partial<SKU> & {
      bomComponents?: BomComponent[];
      comboItems?: ComboItem[];
    };

    // 检查条码唯一性
    if (body.mainBarcode) {
      const exists = Array.from(skuStore.values()).some(
        (sku) => sku.mainBarcode === body.mainBarcode
      );
      if (exists) {
        return HttpResponse.json(
          {
            success: false,
            error: 'DUPLICATE_BARCODE',
            message: '主条码已存在',
            timestamp: new Date().toISOString()
          },
          { status: 409 }
        );
      }
    }

    const now = new Date().toISOString();
    const newSku: SKU = {
      id: generateId(),
      code: generateSkuCode(),
      name: body.name || '',
      skuType: body.skuType!,
      storeScope: body.storeScope || [],
      standardCost: body.standardCost,
      wasteRate: body.wasteRate || 0,
      spuId: body.spuId || '',
      spuName: body.spuName || '',
      brand: body.brand || '',
      category: body.category || '',
      categoryId: body.categoryId || '',
      spec: body.spec || '',
      flavor: body.flavor,
      packaging: body.packaging,
      mainUnit: body.mainUnit || '',
      mainUnitId: body.mainUnitId || '',
      salesUnits: body.salesUnits || [],
      mainBarcode: body.mainBarcode || '',
      otherBarcodes: body.otherBarcodes || [],
      manageInventory: body.manageInventory ?? true,
      allowNegativeStock: body.allowNegativeStock ?? false,
      minOrderQty: body.minOrderQty,
      minSaleQty: body.minSaleQty,
      status: body.status || 'draft',
      createdAt: now,
      updatedAt: now,
      createdBy: 'mock-user',
      createdByName: 'Mock User',
      updatedBy: 'mock-user',
      updatedByName: 'Mock User'
    };

    // 处理BOM组件（成品类型）
    if (body.bomComponents && body.bomComponents.length > 0) {
      const bom = body.bomComponents.map((comp, index) => ({
        ...comp,
        id: generateId(),
        finishedProductId: newSku.id,
        sortOrder: comp.sortOrder ?? index,
        createdAt: now
      }));
      bomStore.set(newSku.id, bom);

      // 自动计算成本
      newSku.standardCost = calculateFinishedProductCost(bom, newSku.wasteRate);
    }

    // 处理套餐子项（套餐类型）
    if (body.comboItems && body.comboItems.length > 0) {
      const items = body.comboItems.map((item, index) => ({
        ...item,
        id: generateId(),
        comboId: newSku.id,
        sortOrder: item.sortOrder ?? index,
        createdAt: now
      }));
      comboStore.set(newSku.id, items);

      // 自动计算成本
      newSku.standardCost = calculateComboCost(items);
    }

    skuStore.set(newSku.id, newSku);

    return HttpResponse.json(
      {
        success: true,
        data: newSku,
        message: 'SKU创建成功',
        timestamp: now
      },
      { status: 201 }
    );
  }),

  // PUT /api/skus/:id - 更新SKU
  http.put('/api/skus/:id', async ({ params, request }) => {
    const { id } = params;
    const sku = skuStore.get(id as string);

    if (!sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_NOT_FOUND',
          message: `未找到ID为 ${id} 的SKU`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    const updates = (await request.json()) as Partial<SKU>;
    const now = new Date().toISOString();

    const updatedSku: SKU = {
      ...sku,
      ...updates,
      id: sku.id, // ID不可修改
      code: sku.code, // 编码不可修改
      updatedAt: now,
      updatedBy: 'mock-user',
      updatedByName: 'Mock User'
    };

    skuStore.set(updatedSku.id, updatedSku);

    return HttpResponse.json({
      success: true,
      data: updatedSku,
      message: 'SKU更新成功',
      timestamp: now
    });
  }),

  // DELETE /api/skus/:id - 删除SKU（检查BOM引用）
  http.delete('/api/skus/:id', ({ params }) => {
    const { id } = params;
    const sku = skuStore.get(id as string);

    if (!sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_NOT_FOUND',
          message: `未找到ID为 ${id} 的SKU`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // 检查是否被BOM引用
    const isReferencedInBom = Array.from(bomStore.values()).some((bom) =>
      bom.some((comp) => comp.componentId === id)
    );

    if (isReferencedInBom) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_REFERENCED',
          message: '该SKU被其他成品的BOM引用，无法删除',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 检查是否被套餐引用
    const isReferencedInCombo = Array.from(comboStore.values()).some((combo) =>
      combo.some((item) => item.subItemId === id)
    );

    if (isReferencedInCombo) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_REFERENCED',
          message: '该SKU被套餐引用，无法删除',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // 删除SKU及其关联数据
    skuStore.delete(id as string);
    bomStore.delete(id as string);
    comboStore.delete(id as string);

    return HttpResponse.json({
      success: true,
      message: 'SKU删除成功',
      timestamp: new Date().toISOString()
    });
  }),

  // PUT /api/skus/:id/bom - 更新BOM配置
  http.put('/api/skus/:id/bom', async ({ params, request }) => {
    const { id } = params;
    const sku = skuStore.get(id as string);

    if (!sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_NOT_FOUND',
          message: `未找到ID为 ${id} 的SKU`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    if (sku.skuType !== 'finished_product') {
      return HttpResponse.json(
        {
          success: false,
          error: 'INVALID_SKU_TYPE',
          message: '仅成品类型可配置BOM',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as {
      components: BomComponent[];
      wasteRate?: number;
    };

    // 验证组件类型
    for (const comp of body.components) {
      const componentSku = skuStore.get(comp.componentId);
      if (!componentSku) {
        return HttpResponse.json(
          {
            success: false,
            error: 'COMPONENT_NOT_FOUND',
            message: `组件SKU ${comp.componentId} 不存在`,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      if (
        componentSku.skuType !== 'raw_material' &&
        componentSku.skuType !== 'packaging'
      ) {
        return HttpResponse.json(
          {
            success: false,
            error: 'INVALID_COMPONENT_TYPE',
            message: 'BOM组件必须是原料或包材类型',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    // 保存BOM配置
    const bom = body.components.map((comp, index) => ({
      ...comp,
      id: comp.id || generateId(),
      finishedProductId: id as string,
      sortOrder: comp.sortOrder ?? index,
      createdAt: now
    }));

    bomStore.set(id as string, bom);

    // 更新损耗率和成本
    if (body.wasteRate !== undefined) {
      sku.wasteRate = body.wasteRate;
    }
    sku.standardCost = calculateFinishedProductCost(bom, sku.wasteRate);
    sku.updatedAt = now;

    skuStore.set(sku.id, sku);

    return HttpResponse.json({
      success: true,
      data: {
        bom,
        standardCost: sku.standardCost,
        wasteRate: sku.wasteRate
      },
      message: 'BOM配置更新成功',
      timestamp: now
    });
  }),

  // PUT /api/skus/:id/combo-items - 更新套餐子项
  http.put('/api/skus/:id/combo-items', async ({ params, request }) => {
    const { id } = params;
    const sku = skuStore.get(id as string);

    if (!sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_NOT_FOUND',
          message: `未找到ID为 ${id} 的SKU`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    if (sku.skuType !== 'combo') {
      return HttpResponse.json(
        {
          success: false,
          error: 'INVALID_SKU_TYPE',
          message: '仅套餐类型可配置子项',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    const body = (await request.json()) as {
      items: ComboItem[];
    };

    // 验证子项类型（不能是套餐类型）
    for (const item of body.items) {
      const subItemSku = skuStore.get(item.subItemId);
      if (!subItemSku) {
        return HttpResponse.json(
          {
            success: false,
            error: 'SUB_ITEM_NOT_FOUND',
            message: `子项SKU ${item.subItemId} 不存在`,
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      if (subItemSku.skuType === 'combo') {
        return HttpResponse.json(
          {
            success: false,
            error: 'INVALID_SUB_ITEM_TYPE',
            message: '套餐子项不能是套餐类型',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      if (item.subItemId === id) {
        return HttpResponse.json(
          {
            success: false,
            error: 'SELF_REFERENCE',
            message: '套餐不能包含自己',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    // 保存套餐配置
    const items = body.items.map((item, index) => ({
      ...item,
      id: item.id || generateId(),
      comboId: id as string,
      sortOrder: item.sortOrder ?? index,
      createdAt: now
    }));

    comboStore.set(id as string, items);

    // 更新成本
    sku.standardCost = calculateComboCost(items);
    sku.updatedAt = now;

    skuStore.set(sku.id, sku);

    return HttpResponse.json({
      success: true,
      data: {
        items,
        standardCost: sku.standardCost
      },
      message: '套餐子项更新成功',
      timestamp: now
    });
  }),

  // POST /api/skus/:id/recalculate-cost - 手动重新计算成本
  http.post('/api/skus/:id/recalculate-cost', ({ params }) => {
    const { id } = params;
    const sku = skuStore.get(id as string);

    if (!sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_NOT_FOUND',
          message: `未找到ID为 ${id} 的SKU`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    const oldCost = sku.standardCost || 0;
    let newCost = oldCost;

    if (sku.skuType === 'finished_product') {
      const bom = bomStore.get(id as string) || [];
      newCost = calculateFinishedProductCost(bom, sku.wasteRate);
    } else if (sku.skuType === 'combo') {
      const items = comboStore.get(id as string) || [];
      newCost = calculateComboCost(items);
    }

    sku.standardCost = newCost;
    sku.updatedAt = new Date().toISOString();
    skuStore.set(sku.id, sku);

    return HttpResponse.json({
      success: true,
      data: {
        oldCost,
        newCost,
        changedAt: sku.updatedAt
      },
      message: '成本重新计算成功',
      timestamp: sku.updatedAt
    });
  }),

  // POST /api/skus/:id/validate-store-scope - 验证门店范围
  http.post('/api/skus/:id/validate-store-scope', async ({ params, request }) => {
    const { id } = params;
    const sku = skuStore.get(id as string);

    if (!sku) {
      return HttpResponse.json(
        {
          success: false,
          error: 'SKU_NOT_FOUND',
          message: `未找到ID为 ${id} 的SKU`,
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    const body = (await request.json()) as { storeScope: string[] };
    const targetStores = new Set(body.storeScope);
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证BOM组件门店范围
    if (sku.skuType === 'finished_product') {
      const bom = bomStore.get(id as string) || [];

      for (const comp of bom) {
        const componentSku = skuStore.get(comp.componentId);
        if (!componentSku) continue;

        // 全门店可用的组件无需检查
        if (componentSku.storeScope.length === 0) continue;

        // 检查目标门店是否在组件门店范围内
        const componentStores = new Set(componentSku.storeScope);
        const unavailableStores = Array.from(targetStores).filter(
          (store) => !componentStores.has(store)
        );

        if (unavailableStores.length > 0) {
          warnings.push(
            `组件 "${componentSku.name}" 在部分门店不可用: ${unavailableStores.join(', ')}`
          );
        }
      }
    }

    // 验证套餐子项门店范围
    if (sku.skuType === 'combo') {
      const items = comboStore.get(id as string) || [];

      for (const item of items) {
        const subItemSku = skuStore.get(item.subItemId);
        if (!subItemSku) continue;

        if (subItemSku.storeScope.length === 0) continue;

        const subItemStores = new Set(subItemSku.storeScope);
        const unavailableStores = Array.from(targetStores).filter(
          (store) => !subItemStores.has(store)
        );

        if (unavailableStores.length > 0) {
          warnings.push(
            `子项 "${subItemSku.name}" 在部分门店不可用: ${unavailableStores.join(', ')}`
          );
        }
      }
    }

    return HttpResponse.json({
      success: true,
      data: {
        valid: errors.length === 0,
        errors,
        warnings
      },
      timestamp: new Date().toISOString()
    });
  })
];

// 导出清空存储函数（用于测试）
export const clearSkuStore = () => {
  skuStore.clear();
  bomStore.clear();
  comboStore.clear();
  skuCodeCounter = 1;
};

// 导出获取存储函数（用于测试）
export const getSkuStore = () => ({
  skus: skuStore,
  bom: bomStore,
  combo: comboStore
});
