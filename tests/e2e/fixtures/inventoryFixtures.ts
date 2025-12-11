/**
 * E2E测试数据夹具
 * 提供完整的E2E测试场景数据
 */

import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { InventoryLedger, InventoryMovement, InventoryAdjustment } from '@types/inventory';

// 测试数据类型定义
export interface InventoryTestData {
  inventoryItems: InventoryLedger[];
  movements: InventoryMovement[];
  adjustments: InventoryAdjustment[];
  users: Array<{
    id: string;
    name: string;
    role: string;
    permissions: string[];
  }>;
}

// 测试夹具类型
type InventoryFixtures = {
  inventoryData: InventoryTestData;
  mockApiEndpoints: {
    inventory: string;
    movements: string;
    adjustments: string;
  };
};

// 创建测试数据
const createTestData = (): InventoryTestData => {
  const inventoryItems: InventoryLedger[] = [
    {
      id: 'inv_001',
      sku: 'SKU00001',
      productName: '大份爆米花',
      categoryId: 'cat_popcorn',
      categoryName: '爆米花',
      locationId: 'loc_main',
      locationName: '主仓库',
      physicalQuantity: 150,
      reservedQuantity: 20,
      availableQuantity: 130,
      inTransitQuantity: 10,
      safetyStock: 50,
      stockStatus: 'normal',
      costPrice: 8.50,
      sellingPrice: 25.00,
      totalValue: 3750.00,
      lastUpdated: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'inv_002',
      sku: 'SKU00002',
      productName: '可口可乐500ml',
      categoryId: 'cat_beverage',
      categoryName: '饮料',
      locationId: 'loc_main',
      locationName: '主仓库',
      physicalQuantity: 200,
      reservedQuantity: 30,
      availableQuantity: 170,
      inTransitQuantity: 0,
      safetyStock: 100,
      stockStatus: 'normal',
      costPrice: 2.00,
      sellingPrice: 8.00,
      totalValue: 1600.00,
      lastUpdated: '2024-01-15T11:00:00Z',
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'inv_003',
      sku: 'SKU00003',
      productName: '3D眼镜',
      categoryId: 'cat_glasses',
      categoryName: '3D眼镜',
      locationId: 'loc_branch_a',
      locationName: '分仓A',
      physicalQuantity: 45,
      reservedQuantity: 5,
      availableQuantity: 40,
      inTransitQuantity: 5,
      safetyStock: 30,
      stockStatus: 'low',
      costPrice: 15.00,
      sellingPrice: 30.00,
      totalValue: 1350.00,
      lastUpdated: '2024-01-15T09:45:00Z',
      createdAt: '2024-01-03T00:00:00Z',
    },
    {
      id: 'inv_004',
      sku: 'SKU00004',
      productName: '电影周边T恤',
      categoryId: 'cat_merchandise',
      categoryName: '电影周边',
      locationId: 'loc_branch_b',
      locationName: '分仓B',
      physicalQuantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      inTransitQuantity: 20,
      safetyStock: 10,
      stockStatus: 'out_of_stock',
      costPrice: 25.00,
      sellingPrice: 89.00,
      totalValue: 0.00,
      lastUpdated: '2024-01-15T12:00:00Z',
      createdAt: '2024-01-04T00:00:00Z',
    },
  ];

  const movements: InventoryMovement[] = [
    {
      id: 'mov_001',
      sku: 'SKU00001',
      productName: '大份爆米花',
      locationId: 'loc_main',
      locationName: '主仓库',
      movementType: 'in',
      movementSubtype: '采购入库',
      quantity: 50,
      balanceAfter: 150,
      referenceNo: 'PO20240115001',
      operatorName: '张三',
      operationTime: '2024-01-15T10:30:00Z',
      batchNo: 'BATCH001',
      remarks: '本月第一批爆米花原料',
    },
    {
      id: 'mov_002',
      sku: 'SKU00002',
      productName: '可口可乐500ml',
      locationId: 'loc_main',
      locationName: '主仓库',
      movementType: 'out',
      movementSubtype: '销售出库',
      quantity: -15,
      balanceAfter: 200,
      referenceNo: 'SO20240115002',
      operatorName: '李四',
      operationTime: '2024-01-15T11:00:00Z',
      remarks: '影院销售',
    },
    {
      id: 'mov_003',
      sku: 'SKU00003',
      productName: '3D眼镜',
      locationId: 'loc_branch_a',
      locationName: '分仓A',
      movementType: 'transfer_in',
      movementSubtype: '调拨入库',
      quantity: 5,
      balanceAfter: 45,
      referenceNo: 'TR20240115003',
      operatorName: '王五',
      operationTime: '2024-01-15T09:45:00Z',
    },
  ];

  const adjustments: InventoryAdjustment[] = [
    {
      id: 'adj_001',
      sku: 'SKU00004',
      productName: '电影周边T恤',
      locationId: 'loc_branch_b',
      locationName: '分仓B',
      adjustmentType: 'stocktaking_loss',
      reason: '月度盘点发现缺失',
      originalQuantity: 25,
      adjustedQuantity: 0,
      adjustmentQuantity: -25,
      status: 'approved',
      requestedBy: '赵六',
      requestedAt: '2024-01-15T08:00:00Z',
      approvedBy: '张三',
      approvedAt: '2024-01-15T08:30:00Z',
      completedAt: '2024-01-15T09:00:00Z',
      remarks: '商品丢失，按报损处理',
    },
  ];

  const users = [
    {
      id: 'user_viewer',
      name: '查看员',
      role: 'viewer',
      permissions: ['read'],
    },
    {
      id: 'user_operator',
      name: '操作员',
      role: 'operator',
      permissions: ['read', 'write', 'adjust'],
    },
    {
      id: 'user_admin',
      name: '管理员',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'adjust', 'transfer', 'admin', 'export'],
    },
  ];

  return {
    inventoryItems,
    movements,
    adjustments,
    users,
  };
};

// 扩展测试夹具
export const test = base.extend<InventoryFixtures>({
  inventoryData: async ({}, use) => {
    const testData = createTestData();
    await use(testData);
  },

  mockApiEndpoints: async ({ page }, use) => {
    const endpoints = {
      inventory: '/api/inventory/ledger',
      movements: '/api/inventory/movements',
      adjustments: '/api/inventory/adjustments',
    };

    // 设置API拦截和mock响应
    await page.route(endpoints.inventory, async (route) => {
      const testData = createTestData();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: testData.inventoryItems,
          total: testData.inventoryItems.length,
        }),
      });
    });

    await page.route(endpoints.movements, async (route) => {
      const testData = createTestData();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: testData.movements,
          total: testData.movements.length,
        }),
      });
    });

    await page.route(endpoints.adjustments, async (route) => {
      const testData = createTestData();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: testData.adjustments,
          total: testData.adjustments.length,
        }),
      });
    });

    await use(endpoints);
  },
});

// 导出expect以便使用
export { expect };

// 常用测试页面对象
export class InventoryPage {
  constructor(public page: Page) {}

  // 页面元素定位器
  get inventoryTable() {
    return this.page.locator('[data-testid="inventory-table"]');
  }

  get filterForm() {
    return this.page.locator('[data-testid="inventory-filters"]');
  }

  get searchInput() {
    return this.page.locator('[data-testid="search-input"]');
  }

  get categoryFilter() {
    return this.page.locator('[data-testid="category-filter"]');
  }

  get locationFilter() {
    return this.page.locator('[data-testid="location-filter"]');
  }

  get statusFilter() {
    return this.page.locator('[data-testid="status-filter"]');
  }

  get exportButton() {
    return this.page.locator('[data-testid="export-button"]');
  }

  get viewDetailsButton() {
    return this.page.locator('[data-testid="view-details-button"]');
  }

  get adjustmentsButton() {
    return this.page.locator('[data-testid="adjustments-button"]');
  }

  get detailsDrawer() {
    return this.page.locator('[data-testid="inventory-details-drawer"]');
  }

  get adjustmentsModal() {
    return this.page.locator('[data-testid="adjustment-modal"]');
  }

  // 页面操作方法
  async navigateToInventory() {
    await this.page.goto('/inventory/ledger');
    await this.page.waitForLoadState('networkidle');
  }

  async searchByKeyword(keyword: string) {
    await this.searchInput.fill(keyword);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(500); // 等待搜索结果
  }

  async filterByCategory(category: string) {
    await this.categoryFilter.click();
    await this.page.locator(`text="${category}"`).click();
    await this.page.waitForTimeout(500);
  }

  async filterByLocation(location: string) {
    await this.locationFilter.click();
    await this.page.locator(`text="${location}"`).click();
    await this.page.waitForTimeout(500);
  }

  async filterByStatus(status: string) {
    await this.statusFilter.click();
    await this.page.locator(`text="${status}"`).click();
    await this.page.waitForTimeout(500);
  }

  async clickFirstRowDetails() {
    const firstRow = this.inventoryTable.locator('tbody tr').first();
    await firstRow.locator('[data-testid="view-details-button"]').click();
    await this.page.waitForTimeout(300);
  }

  async clickFirstRowAdjustments() {
    const firstRow = this.inventoryTable.locator('tbody tr').first();
    await firstRow.locator('[data-testid="adjustments-button"]').click();
    await this.page.waitForTimeout(300);
  }

  async exportData() {
    await this.exportButton.click();
    await this.page.waitForTimeout(1000); // 等待导出完成
  }

  // 断言方法
  async expectTableToContainRows(count: number) {
    const rows = this.inventoryTable.locator('tbody tr');
    await expect(rows).toHaveCount(count);
  }

  async expectDetailsDrawerToBeVisible() {
    await expect(this.detailsDrawer).toBeVisible();
  }

  async expectAdjustmentModalToBeVisible() {
    await expect(this.adjustmentsModal).toBeVisible();
  }

  async expectCellToContainText(rowIndex: number, columnIndex: number, text: string) {
    const cell = this.inventoryTable.locator(`tbody tr:nth-child(${rowIndex}) td:nth-child(${columnIndex})`);
    await expect(cell).toContainText(text);
  }
}

// 导出页面对象
export { InventoryPage };