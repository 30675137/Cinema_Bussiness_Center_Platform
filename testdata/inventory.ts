/**
 * @spec P005-inventory-management
 * Test data for inventory E2E scenarios
 */

export const inventoryTestData = {
  // Admin user credentials for B-end system
  admin_user: {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },

  // Inventory adjustment data (surplus +50)
  adjustment_data: {
    product: 'whiskey',
    productName: '威士忌',
    quantity: 50,
    type: 'surplus', // 'surplus' (盘盈) | 'shortage' (盘亏)
    reason: '盘点发现库存增加',
    store_id: 'STORE-001',
    hall_id: 'HALL-001'
  },

  // Approver user credentials
  approver_user: {
    username: 'approver',
    password: 'approve123',
    role: 'approver'
  },

  // API endpoints
  endpoints: {
    adjustment: '/api/inventory/adjustment',
    adjustmentList: '/api/inventory/adjustments',
    approve: '/api/inventory/adjustment/approve'
  },

  // UI paths
  paths: {
    adjustmentPage: '/inventory/adjustment',
    adjustmentList: '/inventory/adjustments',
    approvalQueue: '/inventory/approvals'
  }
};
