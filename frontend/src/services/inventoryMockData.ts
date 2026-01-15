/**
 * 库存管理系统Mock数据服务
 * 用于模拟后端API调用，生成测试数据
 */

import type {
  InventoryLedger,
  InventoryMovement,
  InventoryAdjustment,
  Location,
  ProductSKU,
  Category,
  Brand,
  InventoryLedgerFilters,
  InventoryMovementFilters,
  InventoryAdjustmentFilters,
  PaginationParams,
  SortParams,
  PaginatedResponse,
  InventoryStatistics,
  Pagination,
} from '@types/inventory';

// Mock数据生成器
class MockDataGenerator {
  private static instance: MockDataGenerator;

  // 仓库门店数据
  private locations: Location[] = [
    {
      id: 'wh_001',
      code: 'WH001',
      name: '东区仓库',
      type: 'warehouse',
      address: '上海市浦东新区张江高科技园区',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      contactPerson: '张经理',
      contactPhone: '13800138000',
      email: 'zhang@cinema.com',
      status: 'active',
      createdTime: '2024-01-01T00:00:00Z',
      updatedTime: '2024-12-01T00:00:00Z',
    },
    {
      id: 'wh_002',
      code: 'WH002',
      name: '西区仓库',
      type: 'warehouse',
      address: '上海市闵行区莘庄工业区',
      province: '上海市',
      city: '上海市',
      district: '闵行区',
      contactPerson: '李经理',
      contactPhone: '13800138001',
      email: 'li@cinema.com',
      status: 'active',
      createdTime: '2024-01-01T00:00:00Z',
      updatedTime: '2024-12-01T00:00:00Z',
    },
    {
      id: 'store_001',
      code: 'ST001',
      name: '中山路门店',
      type: 'store',
      address: '上海市黄浦区中山路1号',
      province: '上海市',
      city: '上海市',
      district: '黄浦区',
      contactPerson: '王店长',
      contactPhone: '13800138002',
      email: 'wang@cinema.com',
      status: 'active',
      createdTime: '2024-01-01T00:00:00Z',
      updatedTime: '2024-12-01T00:00:00Z',
    },
    {
      id: 'store_002',
      code: 'ST002',
      name: '解放路门店',
      type: 'store',
      address: '上海市徐汇区解放路100号',
      province: '上海市',
      city: '上海市',
      district: '徐汇区',
      contactPerson: '赵店长',
      contactPhone: '13800138003',
      email: 'zhao@cinema.com',
      status: 'active',
      createdTime: '2024-01-01T00:00:00Z',
      updatedTime: '2024-12-01T00:00:00Z',
    },
  ];

  // 商品类目数据
  private categories: Category[] = [
    { id: 'cat_001', name: '食品', level: 1, path: '/食品' },
    { id: 'cat_002', name: '饮料', level: 1, path: '/饮料' },
    { id: 'cat_003', name: '零食', level: 1, path: '/零食' },
    { id: 'cat_004', name: '日用品', level: 1, path: '/日用品' },
    { id: 'cat_005', name: '电子产品', level: 1, path: '/电子产品' },
    { id: 'cat_006', name: '服装', level: 1, path: '/服装' },
    { id: 'cat_007', name: '饮料', parentId: 'cat_002', level: 2, path: '/饮料/饮料' },
    { id: 'cat_008', name: '碳酸饮料', parentId: 'cat_007', level: 3, path: '/饮料/饮料/碳酸饮料' },
    { id: 'cat_009', name: '果汁', parentId: 'cat_007', level: 3, path: '/饮料/饮料/果汁' },
  ];

  // 品牌数据
  private brands: Brand[] = [
    { id: 'brand_001', name: '可口可乐', code: 'COKE' },
    { id: 'brand_002', name: '百事', code: 'PEPSI' },
    { id: 'brand_003', name: '统一', code: 'UNI' },
    { id: 'brand_004', name: '康师傅', code: 'MASTER' },
    { id: 'brand_005', name: '宝洁', code: 'P&G' },
    { id: 'brand_006', name: '联合利华', code: 'UL' },
    { id: 'brand_007', name: '三只松鼠', code: 'THREE_SQUIRRELS' },
    { id: 'brand_008', name: '良品铺子', code: 'LPPZ' },
  ];

  // 商品SKU数据
  private products: ProductSKU[] = this.generateProducts(1000);

  // 生成商品SKU数据
  private generateProducts(count: number): ProductSKU[] {
    const products: ProductSKU[] = [];
    const categoryNames = this.categories.map((c) => c.name);
    const brandNames = this.brands.map((b) => b.name);
    const specifications = ['小包装', '中包装', '大包装', '标准装', '礼盒装'];
    const units = ['个', '瓶', '罐', '袋', '盒', '箱', '套', '双'];

    for (let i = 1; i <= count; i++) {
      const category = this.categories[Math.floor(Math.random() * this.categories.length)];
      const brand = this.brands[Math.floor(Math.random() * this.brands.length)];
      const specification = specifications[Math.floor(Math.random() * specifications.length)];
      const unit = units[Math.floor(Math.random() * units.length)];

      products.push({
        id: `product_${String(i).padStart(6, '0')}`,
        sku: `SKU${String(i).padStart(6, '0')}`,
        name: `${brand.name}${category.name}${i}`,
        shortName: `${category.name}${i}`,
        categoryId: category.id,
        categoryName: category.name,
        subcategoryId: category.parentId,
        subcategoryName: category.parentId
          ? this.categories.find((c) => c.id === category.parentId)?.name
          : undefined,
        brandId: brand.id,
        brandName: brand.name,
        specification,
        unitId: `unit_${unit}`,
        unit,
        costPrice: Math.round((Math.random() * 50 + 5) * 100) / 100,
        sellingPrice: Math.round((Math.random() * 100 + 10) * 100) / 100,
        retailPrice: Math.round((Math.random() * 120 + 15) * 100) / 100,
        safetyStock: Math.floor(Math.random() * 50) + 10,
        maxStock: Math.floor(Math.random() * 500) + 100,
        minStock: Math.floor(Math.random() * 20) + 5,
        status: Math.random() > 0.1 ? 'active' : 'inactive',
        isSellable: Math.random() > 0.1,
        createdTime: this.getRandomDate(-365, -30),
        updatedTime: this.getRandomDate(-30, -1),
      });
    }

    return products;
  }

  // 生成库存台账数据
  generateInventoryLedger(count: number = 200): InventoryLedger[] {
    const ledger: InventoryLedger[] = [];

    for (let i = 1; i <= count; i++) {
      const location = this.locations[Math.floor(Math.random() * this.locations.length)];
      const product = this.products[Math.floor(Math.random() * this.products.length)];

      const physicalQuantity = Math.floor(Math.random() * 1000) + 1;
      const reservedQuantity = Math.floor(Math.random() * Math.min(physicalQuantity, 200));
      const inTransitQuantity = Math.floor(Math.random() * 100);
      const safetyStock = Math.floor(Math.random() * 50) + 10;
      const availableQuantity = physicalQuantity - reservedQuantity;

      let stockStatus: 'low' | 'normal' | 'high' | 'out_of_stock';
      if (availableQuantity <= 0) {
        stockStatus = 'out_of_stock';
      } else if (availableQuantity <= safetyStock) {
        stockStatus = 'low';
      } else if (availableQuantity > safetyStock * 3) {
        stockStatus = 'high';
      } else {
        stockStatus = 'normal';
      }

      ledger.push({
        id: `ledger_${location.id}_${product.sku}`,
        sku: product.sku,
        productCode: product.sku,
        productName: product.name,
        locationId: location.id,
        locationName: location.name,
        locationType: location.type,
        physicalQuantity,
        reservedQuantity,
        availableQuantity,
        inTransitQuantity,
        safetyStock,
        category: product.categoryName,
        subcategory: product.subcategoryName,
        brand: product.brandName,
        specification: product.specification,
        unit: product.unit,
        stockStatus,
        isSellable: product.isSellable,
        lastUpdated: this.getRandomDate(-7, -1),
        createdTime: this.getRandomDate(-90, -7),
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        supplier: this.brands[Math.floor(Math.random() * this.brands.length)].name,
        totalValue: physicalQuantity * (product.costPrice || 0),
      });
    }

    return ledger;
  }

  // 生成库存流水数据
  generateInventoryMovements(count: number = 500): InventoryMovement[] {
    const movements: InventoryMovement[] = [];
    const movementTypes = [
      'in',
      'out',
      'transfer_in',
      'transfer_out',
      'adjust_positive',
      'adjust_negative',
    ] as const;
    const movementSubtypes = {
      in: ['采购入库', '退货入库', '调拨入库', '盘盈'],
      out: ['销售出库', '报损出库', '调拨出库', '盘亏'],
      transfer_in: ['调拨入库'],
      transfer_out: ['调拨出库'],
      adjust_positive: ['盘盈'],
      adjust_negative: ['盘亏', '报损'],
    };

    const referenceTypes = ['purchase_order', 'sale_order', 'transfer_order', 'adjustment_order'];
    const referenceNos = ['PO', 'SO', 'TO', 'ADJ'];
    const operators = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十'];
    const sourceSystems = ['wms', 'pos', 'manual', 'erp'];

    for (let i = 1; i <= count; i++) {
      const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      const subtypes = movementSubtypes[movementType];
      const movementSubtype = subtypes[Math.floor(Math.random() * subtypes.length)];
      const referenceType = referenceTypes[Math.floor(Math.random() * referenceTypes.length)];
      const referenceNoPrefix = referenceNos[referenceTypes.indexOf(referenceType)];
      const operator = operators[Math.floor(Math.random() * operators.length)];
      const sourceSystem = sourceSystems[Math.floor(Math.random() * sourceSystems.length)];

      const location = this.locations[Math.floor(Math.random() * this.locations.length)];
      const product = this.products[Math.floor(Math.random() * this.products.length)];

      const quantity =
        movementType.includes('in') || movementType.includes('positive')
          ? Math.floor(Math.random() * 100) + 1
          : -(Math.floor(Math.random() * 100) + 1);

      movements.push({
        id: `movement_${Date.now()}_${String(i).padStart(6, '0')}`,
        transactionId: `txn_${Date.now()}_${i}`,
        sku: product.sku,
        productName: product.name,
        locationId: location.id,
        locationName: location.name,
        movementType,
        movementSubtype,
        quantity,
        balanceAfter: Math.floor(Math.random() * 1000) + quantity,
        referenceType,
        referenceId: `ref_${i}`,
        referenceNo: `${referenceNoPrefix}${String(i).padStart(8, '0')}`,
        operatorId: `user_${Math.floor(Math.random() * 8) + 1}`,
        operatorName: operator,
        operationTime: this.getRandomDate(-30, -1),
        reason: '系统自动生成',
        remark: '备注信息',
        fromLocation: movementType === 'transfer_out' ? location.id : undefined,
        toLocation: movementType === 'transfer_in' ? location.id : undefined,
        sourceSystem,
        createdAt: this.getRandomDate(-30, -1),
      });
    }

    return movements.sort(
      (a, b) => new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime()
    );
  }

  // 生成库存调整记录
  generateInventoryAdjustments(count: number = 100): InventoryAdjustment[] {
    const adjustments: InventoryAdjustment[] = [];
    const adjustmentTypes = [
      'stocktaking_profit',
      'stocktaking_loss',
      'damage',
      'expired',
      'other',
    ] as const;
    const reasons = {
      stocktaking_profit: '盘盈发现',
      stocktaking_loss: '盘亏损失',
      damage: '商品损坏',
      expired: '商品过期',
      other: '其他原因',
    };

    const statuses = ['pending', 'approved', 'rejected', 'completed'] as const;
    const operators = ['张三', '李四', '王五', '赵六'];

    for (let i = 1; i <= count; i++) {
      const adjustmentType = adjustmentTypes[Math.floor(Math.random() * adjustmentTypes.length)];
      const location = this.locations[Math.floor(Math.random() * this.locations.length)];
      const product = this.products[Math.floor(Math.random() * this.products.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const operator = operators[Math.floor(Math.random() * operators.length)];

      const originalQuantity = Math.floor(Math.random() * 500) + 100;
      const adjustmentQuantity = Math.floor(Math.random() * 50) + 1;

      adjustments.push({
        id: `adjustment_${Date.now()}_${String(i).padStart(6, '0')}`,
        adjustmentNo: `ADJ${String(i).padStart(8, '0')}`,
        sku: product.sku,
        productName: product.name,
        locationId: location.id,
        locationName: location.name,
        adjustmentType,
        originalQuantity,
        adjustedQuantity: adjustmentType.includes('profit')
          ? originalQuantity + adjustmentQuantity
          : originalQuantity - adjustmentQuantity,
        adjustmentQuantity: adjustmentType.includes('profit')
          ? adjustmentQuantity
          : -adjustmentQuantity,
        requestUserId: `user_${Math.floor(Math.random() * 4) + 1}`,
        requestUserName: operator,
        approveUserId:
          status !== 'pending' ? `user_${Math.floor(Math.random() * 4) + 5}` : undefined,
        approveUserName:
          status !== 'pending'
            ? operators[Math.floor(Math.random() * operators.length)]
            : undefined,
        approveTime: status !== 'pending' ? this.getRandomDate(-7, -1) : undefined,
        status,
        reason: reasons[adjustmentType],
        remark: '备注信息',
        requestTime: this.getRandomDate(-30, -1),
        completedTime: status === 'completed' ? this.getRandomDate(-7, -1) : undefined,
        createdTime: this.getRandomDate(-30, -1),
      });
    }

    return adjustments.sort(
      (a, b) => new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime()
    );
  }

  // 生成统计数据
  generateStatistics(): InventoryStatistics {
    const ledger = this.generateInventoryLedger(200);

    const totalItems = ledger.length;
    const lowStockItems = ledger.filter((item) => item.stockStatus === 'low').length;
    const outOfStockItems = ledger.filter((item) => item.stockStatus === 'out_of_stock').length;
    const totalQuantity = ledger.reduce((sum, item) => sum + item.physicalQuantity, 0);
    const reservedQuantity = ledger.reduce((sum, item) => sum + item.reservedQuantity, 0);
    const availableQuantity = ledger.reduce((sum, item) => sum + item.availableQuantity, 0);
    const inTransitQuantity = ledger.reduce((sum, item) => sum + item.inTransitQuantity, 0);
    const totalValue = ledger.reduce(
      (sum, item) => sum + item.physicalQuantity * (item.sellingPrice || 10),
      0
    );

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      totalValue,
      totalQuantity,
      reservedQuantity,
      availableQuantity,
      inTransitQuantity,
    };
  }

  // 获取随机日期
  // 生成库存调整数据
  generateInventoryAdjustments(count: number = 50): InventoryAdjustment[] {
    const adjustments: InventoryAdjustment[] = [];
    const statuses: InventoryAdjustment['status'][] = [
      'pending',
      'approved',
      'rejected',
      'completed',
    ];
    const adjustmentTypes = [
      'stocktaking_profit',
      'stocktaking_loss',
      'damage',
      'expired',
      'other',
    ];

    const requesters = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十'];

    const approvers = ['管理员A', '管理员B', '主管C', '经理D'];

    const reasons = {
      stocktaking_profit: [
        '盘点错误导致数量不符',
        '收货时漏记入库',
        '系统数据异常',
        '其他盘盈原因',
      ],
      stocktaking_loss: ['盘点错误导致数量不符', '发货时多发货物', '货物被盗', '其他盘亏原因'],
      damage: ['运输过程中损坏', '存储环境不当', '包装破损导致', '商品质量问题'],
      expired: ['食品超过保质期', '药品超过有效期', '化妆品超过保质期', '其他类型商品过期'],
      other: ['系统数据调账', '基础数据修正', '业务需求调整', '其他库存调整'],
    };

    for (let i = 1; i <= count; i++) {
      const location = this.locations[Math.floor(Math.random() * this.locations.length)];
      const product = this.products[Math.floor(Math.random() * this.products.length)];
      const adjustmentType = adjustmentTypes[Math.floor(Math.random() * adjustmentTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const requester = requesters[Math.floor(Math.random() * requesters.length)];
      const reasonOptions = reasons[adjustmentType as keyof typeof reasons];
      const reason = reasonOptions[Math.floor(Math.random() * reasonOptions.length)];

      // 计算调整数量
      const adjustmentQuantity = adjustmentType.includes('profit')
        ? Math.floor(Math.random() * 50) + 1
        : -(Math.floor(Math.random() * 50) + 1);

      const originalQuantity = Math.floor(Math.random() * 500) + 100;
      const adjustedQuantity = originalQuantity + adjustmentQuantity;

      const requestedAt = this.getRandomDate(-30, -1);

      let approvedAt: string | undefined;
      let approvedBy: string | undefined;
      let completedAt: string | undefined;
      let executedBy: string | undefined;

      if (status !== 'pending') {
        approvedAt = this.getRandomDate(-20, -2);
        approvedBy = approvers[Math.floor(Math.random() * approvers.length)];
      }

      if (status === 'completed') {
        completedAt = this.getRandomDate(-10, -1);
        executedBy = requesters[Math.floor(Math.random() * requesters.length)];
      }

      adjustments.push({
        id: `ADJ${String(i).padStart(6, '0')}`,
        adjustmentNo: `ADJ${String(i).padStart(6, '0')}`,
        sku: product.sku,
        productName: product.name,
        locationId: location.id,
        locationName: location.name,
        adjustmentType,
        reason,
        originalQuantity,
        adjustedQuantity,
        adjustmentQuantity,
        requestedBy: requester,
        requestedAt,
        status,
        approvedAt,
        approvedBy,
        completedAt,
        executedBy,
        remark: Math.random() > 0.5 ? `调整备注信息${i}` : undefined,
        approvalRemark: Math.random() > 0.6 ? `审批意见${i}` : undefined,
      });
    }

    // 按申请时间倒序排列
    return adjustments.sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  }

  private getRandomDate(daysAgo: number, daysMax: number = 0): string {
    const date = new Date();
    const pastDate = new Date(
      date.getTime() - Math.random() * (Math.abs(daysAgo) - daysMax) * 24 * 60 * 60 * 1000
    );
    return pastDate.toISOString();
  }

  // 获取单例实例
  public static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  // 获取所有位置数据
  getLocations(): Location[] {
    return [...this.locations];
  }

  // 获取所有类目数据
  getCategories(): Category[] {
    return [...this.categories];
  }

  // 获取所有品牌数据
  getBrands(): Brand[] {
    return [...this.brands];
  }

  // 获取所有商品数据
  getProducts(): ProductSKU[] {
    return [...this.products];
  }
}

// Mock API服务
export class InventoryMockService {
  private generator: MockDataGenerator;

  // 缓存生成的数据，避免重复生成
  private mockInventory: InventoryLedger[] = [];
  private mockMovements: InventoryMovement[] = [];
  private mockAdjustments: InventoryAdjustment[] = [];

  constructor() {
    this.generator = MockDataGenerator.getInstance();
    // 初始化数据
    this.initializeData();
  }

  // 初始化数据
  private initializeData(): void {
    this.mockInventory = this.generator.generateInventoryLedger(200);
    this.mockMovements = this.mockMovements(2000);
    this.mockAdjustments = this.generator.generateInventoryAdjustments(50);
  }

  // 模拟延迟
  private async delay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 库存台账相关API
  async getInventoryLedger(
    params: PaginationParams & {
      filters?: InventoryLedgerFilters;
      sort?: SortParams;
    }
  ): Promise<PaginatedResponse<InventoryLedger>> {
    await this.delay();

    const { current = 1, pageSize = 20, filters = {}, sort } = params;
    const allData = this.mockInventory;

    // 应用筛选
    const filteredData = allData.filter((item) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        return (
          item.sku.toLowerCase().includes(keyword) ||
          item.productName.toLowerCase().includes(keyword) ||
          item.brand?.toLowerCase().includes(keyword)
        );
      }

      if (filters.categoryId && item.category !== filters.categoryId) {
        return false;
      }

      if (filters.brandId && item.brand !== filters.brandId) {
        return false;
      }

      if (filters.locationId && item.locationId !== filters.locationId) {
        return false;
      }

      if (filters.stockStatus && item.stockStatus !== filters.stockStatus) {
        return false;
      }

      if (filters.isSellable !== undefined && item.isSellable !== filters.isSellable) {
        return false;
      }

      if (filters.hasInTransit !== undefined && filters.hasInTransit) {
        return item.inTransitQuantity > 0;
      }

      return true;
    });

    // 应用排序
    if (sort && sort.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = this.getNestedValue(a, sort.sortBy);
        const bValue = this.getNestedValue(b, sort.sortBy);

        if (sort.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    // 分页
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = filteredData.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        current,
        pageSize,
        total,
        totalPages,
      },
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getInventoryStatistics(): Promise<ApiResponse<InventoryStatistics>> {
    await this.delay();

    const statistics = this.generator.generateStatistics();

    return {
      data: statistics,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getInventoryLedgerDetail(id: string): Promise<ApiResponse<InventoryLedger>> {
    await this.delay();

    const allData = this.mockInventory;
    const item = allData.find((item) => item.id === id);

    if (!item) {
      throw new Error(`库存台账记录不存在: ${id}`);
    }

    return {
      data: item,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 库存流水相关API
  async getInventoryMovements(
    params: PaginationParams & {
      filters?: InventoryMovementFilters;
      sort?: SortParams;
    }
  ): Promise<PaginatedResponse<InventoryMovement>> {
    await this.delay();

    const { current = 1, pageSize = 20, filters = {}, sort } = params;
    const allData = this.mockMovements();

    // 应用筛选
    const filteredData = allData.filter((item) => {
      // 关键字搜索
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        if (
          !item.sku.toLowerCase().includes(keyword) &&
          !item.productName.toLowerCase().includes(keyword) &&
          !item.locationName.toLowerCase().includes(keyword) &&
          !item.operatorName.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }

      // SKU筛选
      if (filters.sku && !item.sku.includes(filters.sku)) {
        return false;
      }

      // 位置筛选
      if (filters.locationId && item.locationId !== filters.locationId) {
        return false;
      }

      // 变动类型筛选
      if (filters.movementType && item.movementType !== filters.movementType) {
        return false;
      }

      // 变动子类型筛选
      if (filters.movementSubtype && item.movementSubtype !== filters.movementSubtype) {
        return false;
      }

      // 操作员筛选
      if (filters.operatorName && !item.operatorName.includes(filters.operatorName)) {
        return false;
      }

      // 时间范围筛选
      if (filters.dateRange && filters.dateRange.length === 2) {
        const [startDate, endDate] = filters.dateRange;
        const itemDate = new Date(item.operationTime);
        if (itemDate < new Date(startDate) || itemDate > new Date(endDate)) {
          return false;
        }
      }

      // 单据类型筛选
      if (filters.referenceType && item.referenceType !== filters.referenceType) {
        return false;
      }

      // 单据号筛选
      if (filters.referenceNo && !item.referenceNo?.includes(filters.referenceNo)) {
        return false;
      }

      // 状态筛选
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // 数量范围筛选
      if (filters.minQuantity !== undefined && Math.abs(item.quantity) < filters.minQuantity) {
        return false;
      }

      if (filters.maxQuantity !== undefined && Math.abs(item.quantity) > filters.maxQuantity) {
        return false;
      }

      // 只显示负数量（出库）
      if (filters.onlyNegativeQuantity && item.quantity >= 0) {
        return false;
      }

      // 只显示正数量（入库）
      if (filters.onlyPositiveQuantity && item.quantity <= 0) {
        return false;
      }

      // 供应商筛选
      if (filters.supplierId && item.supplierId !== filters.supplierId) {
        return false;
      }

      // 客户筛选
      if (filters.customerId && item.customerId !== filters.customerId) {
        return false;
      }

      // 仓库筛选
      if (filters.warehouseId && item.warehouseId !== filters.warehouseId) {
        return false;
      }

      // 批次号筛选
      if (filters.batchNo && !item.batchId?.includes(filters.batchNo)) {
        return false;
      }

      return true;
    });

    // 默认按操作时间降序排序
    if (sort && sort.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = this.getNestedValue(a, sort.sortBy);
        const bValue = this.getNestedValue(b, sort.sortBy);

        if (sort.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    // 分页
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = filteredData.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        current,
        pageSize,
        total,
        totalPages,
      },
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 库存调整相关API
  async getInventoryAdjustments(
    params: PaginationParams & {
      filters?: InventoryAdjustmentFilters;
      sort?: SortParams;
    }
  ): Promise<PaginatedResponse<InventoryAdjustment>> {
    await this.delay();

    const { current = 1, pageSize = 20, filters = {}, sort } = params;
    const allData = this.generator.generateInventoryAdjustments();

    // 应用筛选
    const filteredData = allData.filter((item) => {
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      if (filters.adjustmentType && item.adjustmentType !== filters.adjustmentType) {
        return false;
      }

      if (filters.sku && item.sku !== filters.sku) {
        return false;
      }

      if (filters.locationId && item.locationId !== filters.locationId) {
        return false;
      }

      if (filters.startTime && new Date(item.requestTime) < new Date(filters.startTime)) {
        return false;
      }

      if (filters.endTime && new Date(item.requestTime) > new Date(filters.endTime)) {
        return false;
      }

      return true;
    });

    // 默认按申请时间降序排序
    if (sort && sort.sortBy) {
      filteredData.sort((a, b) => {
        const aValue = this.getNestedValue(a, sort.sortBy);
        const bValue = this.getNestedValue(b, sort.sortBy);

        if (sort.sortOrder === 'desc') {
          return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    // 分页
    const total = filteredData.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const data = filteredData.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        current,
        pageSize,
        total,
        totalPages,
      },
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async createAdjustment(
    adjustment: Omit<InventoryAdjustment, 'id' | 'adjustmentNo' | 'createdTime'>
  ): Promise<ApiResponse<InventoryAdjustment>> {
    await this.delay();

    const newAdjustment: InventoryAdjustment = {
      ...adjustment,
      id: `adjustment_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      adjustmentNo: `ADJ${Date.now()}`,
      createdTime: new Date().toISOString(),
    };

    return {
      data: newAdjustment,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async approveAdjustment(
    id: string,
    approved: boolean,
    remark?: string
  ): Promise<ApiResponse<void>> {
    await this.delay();

    // 模拟审批逻辑
    return {
      data: undefined,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async adjustStock(itemId: string, quantity: number, reason: string): Promise<ApiResponse<void>> {
    await this.delay(500); // 模拟API调用延迟

    // 模拟库存调整逻辑
    return {
      data: undefined,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async transferStock(
    itemId: string,
    fromLocation: string,
    toLocation: string,
    quantity: number
  ): Promise<ApiResponse<void>> {
    await this.delay(500);

    // 模拟库存调拨逻辑
    return {
      data: undefined,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 基础数据API
  async getLocations(type?: 'warehouse' | 'store'): Promise<ApiResponse<Location[]>> {
    await this.delay();

    const allLocations = this.generator.getLocations();
    const filteredLocations = type
      ? allLocations.filter((location) => location.type === type)
      : allLocations;

    return {
      data: filteredLocations,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    await this.delay();

    return {
      data: this.generator.getCategories(),
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getBrands(): Promise<ApiResponse<Brand[]>> {
    await this.delay();

    return {
      data: this.generator.getBrands(),
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  // 导出功能
  async exportInventoryLedger(filters?: InventoryLedgerFilters, columns?: string[]): Promise<Blob> {
    await this.delay(1000);

    // 模拟生成Excel文件
    const csvContent = this.generateCSV(
      ['ID', 'SKU', '商品名称', '仓库', '现存库存', '可用库存', '库存状态'],
      this.mockInventory
        .slice(0, 50)
        .map((item) => [
          item.id,
          item.sku,
          item.productName,
          item.locationName,
          item.physicalQuantity.toString(),
          item.availableQuantity.toString(),
          item.stockStatus,
        ])
    );

    return new Blob([csvContent], { type: 'text/csv' });
  }

  async exportInventoryMovements(
    filters?: InventoryMovementFilters,
    startTime?: string,
    endTime?: string
  ): Promise<Blob> {
    await this.delay(1000);

    // 获取要导出的数据
    const params = {
      current: 1,
      pageSize: 10000, // 导出大量数据
      filters,
      sort: { sortBy: 'operationTime', sortOrder: 'desc' } as SortParams,
    };

    const response = await this.getInventoryMovements(params);
    const movements = response.data;

    // 生成CSV内容
    const headers = [
      'ID',
      'SKU',
      '商品名称',
      '商品类别',
      '仓库',
      '变动类型',
      '变动子类型',
      '变动数量',
      '变动前余额',
      '变动后余额',
      '成本价',
      '总价值',
      '单据类型',
      '单据号',
      '操作员',
      '操作时间',
      '状态',
      '备注',
    ];

    const rows = movements.map((item) => [
      item.id,
      item.sku,
      item.productName,
      item.categoryName || '',
      item.locationName,
      item.movementType,
      item.movementSubtype,
      item.quantity.toString(),
      item.balanceBefore.toString(),
      item.balanceAfter.toString(),
      item.costPrice?.toString() || '',
      item.totalValue?.toString() || '',
      item.referenceType,
      item.referenceNo || '',
      item.operatorName,
      item.operationTime,
      item.status,
      item.remark || '',
    ]);

    return new Blob(['\ufeff' + this.generateCSV(headers, rows)], {
      type: 'text/csv;charset=utf-8',
    });
  }

  // 生成流水数据统计
  async getMovementsStatistics(filters?: InventoryMovementFilters): Promise<{
    totalMovements: number;
    inboundMovements: number;
    outboundMovements: number;
    transferMovements: number;
    adjustmentMovements: number;
    totalQuantity: number;
    inboundQuantity: number;
    outboundQuantity: number;
    recentMovements: InventoryMovement[];
  }> {
    await this.delay(300);

    const params = {
      current: 1,
      pageSize: 10000,
      filters,
    };

    const response = await this.getInventoryMovements(params);
    const movements = response.data;

    const inboundMovements = movements.filter((m) =>
      ['in', 'transfer_in', 'adjust_positive'].includes(m.movementType)
    ).length;

    const outboundMovements = movements.filter((m) =>
      ['out', 'transfer_out', 'adjust_negative'].includes(m.movementType)
    ).length;

    const transferMovements = movements.filter((m) =>
      ['transfer_in', 'transfer_out'].includes(m.movementType)
    ).length;

    const adjustmentMovements = movements.filter((m) =>
      ['adjust_positive', 'adjust_negative'].includes(m.movementType)
    ).length;

    const totalQuantity = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const inboundQuantity = movements
      .filter((m) => m.quantity > 0)
      .reduce((sum, m) => sum + m.quantity, 0);
    const outboundQuantity = Math.abs(
      movements.filter((m) => m.quantity < 0).reduce((sum, m) => sum + m.quantity, 0)
    );

    const recentMovements = movements
      .sort((a, b) => new Date(b.operationTime).getTime() - new Date(a.operationTime).getTime())
      .slice(0, 10);

    return {
      totalMovements: movements.length,
      inboundMovements,
      outboundMovements,
      transferMovements,
      adjustmentMovements,
      totalQuantity,
      inboundQuantity,
      outboundQuantity,
      recentMovements,
    };
  }

  // ==================== 库存调整相关API ====================

  // 获取库存调整记录
  async getInventoryAdjustments(queryParams: QueryParams): Promise<{
    data: InventoryAdjustment[];
    total: number;
    current: number;
    pageSize: number;
  }> {
    await this.delay(500);

    let adjustments = [...this.mockAdjustments];

    // 应用筛选条件
    if (queryParams.filters) {
      adjustments = this.filterAdjustments(adjustments, queryParams.filters);
    }

    // 计算总数
    const total = adjustments.length;

    // 应用排序
    if (queryParams.sort) {
      adjustments = this.sortAdjustments(adjustments, queryParams.sort);
    }

    // 应用分页
    const { current = 1, pageSize = 20 } = queryParams.pagination || {};
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = adjustments.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      current,
      pageSize,
    };
  }

  // 创建库存调整申请
  async createAdjustment(
    adjustmentData: Omit<
      InventoryAdjustment,
      'id' | 'adjustmentNo' | 'approvedAt' | 'completedAt' | 'approvedBy'
    >
  ): Promise<InventoryAdjustment> {
    await this.delay(800);

    const adjustment: InventoryAdjustment = {
      ...adjustmentData,
      id: `ADJ${Date.now()}`,
      adjustmentNo: `ADJ${Date.now()}`,
      approvedAt: undefined,
      completedAt: undefined,
      approvedBy: undefined,
    };

    // 添加到模拟数据
    this.mockAdjustments.unshift(adjustment);

    // 模拟创建库存调整流水
    await this.createAdjustmentMovement(adjustment);

    return adjustment;
  }

  // 审批库存调整
  async approveAdjustment(
    id: string,
    approved: boolean,
    remark?: string
  ): Promise<InventoryAdjustment> {
    await this.delay(600);

    const adjustment = this.mockAdjustments.find((adj) => adj.id === id);
    if (!adjustment) {
      throw new Error('调整记录不存在');
    }

    if (adjustment.status !== 'pending') {
      throw new Error('只能审批待审批状态的调整申请');
    }

    // 更新状态
    adjustment.status = approved ? 'approved' : 'rejected';
    adjustment.approvedAt = new Date().toISOString();
    adjustment.approvedBy = '当前管理员'; // 这里应该从用户上下文获取
    adjustment.approvalRemark = remark;

    // 如果拒绝了，创建对应的流水记录
    if (!approved) {
      await this.createRejectionMovement(adjustment, remark);
    }

    return adjustment;
  }

  // 执行库存调整
  async executeAdjustment(id: string): Promise<InventoryAdjustment> {
    await this.delay(1000);

    const adjustment = this.mockAdjustments.find((adj) => adj.id === id);
    if (!adjustment) {
      throw new Error('调整记录不存在');
    }

    if (adjustment.status !== 'approved') {
      throw new Error('只能执行已批准的调整申请');
    }

    // 更新库存台账
    const ledgerItem = this.mockInventory.find(
      (item) => item.sku === adjustment.sku && item.locationId === adjustment.locationId
    );

    if (!ledgerItem) {
      throw new Error('库存台账记录不存在');
    }

    // 更新库存数量
    const oldQuantity = ledgerItem.physicalQuantity;
    ledgerItem.physicalQuantity = adjustment.adjustedQuantity;
    ledgerItem.availableQuantity = adjustment.adjustedQuantity; // 简化处理，实际应该考虑预占等
    ledgerItem.lastUpdated = new Date().toISOString();

    // 更新库存状态
    if (ledgerItem.physicalQuantity <= 0) {
      ledgerItem.stockStatus = 'out_of_stock';
    } else if (ledgerItem.physicalQuantity <= ledgerItem.safetyStock) {
      ledgerItem.stockStatus = 'low';
    } else if (ledgerItem.physicalQuantity > ledgerItem.safetyStock * 2) {
      ledgerItem.stockStatus = 'high';
    } else {
      ledgerItem.stockStatus = 'normal';
    }

    // 更新库存总值
    ledgerItem.totalValue = ledgerItem.physicalQuantity * (ledgerItem.costPrice || 0);

    // 更新调整状态
    adjustment.status = 'completed';
    adjustment.completedAt = new Date().toISOString();
    adjustment.executedBy = '当前操作员'; // 这里应该从用户上下文获取

    // 创建执行流水
    await this.createExecutionMovement(adjustment, oldQuantity);

    return adjustment;
  }

  // 获取调整统计信息
  async getAdjustmentStatistics(filters?: InventoryAdjustmentFilters): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    completedApplications: number;
    totalAdjustmentQuantity: number;
    positiveAdjustments: number;
    negativeAdjustments: number;
    pendingRate: string;
    approvedRate: string;
  }> {
    await this.delay(300);

    const response = await this.getInventoryAdjustments({
      filters,
      sort: { sortBy: 'requestedAt', sortOrder: 'desc' },
      pagination: { current: 1, pageSize: 10000 },
    });

    const applications = response.data;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter((item) => item.status === 'pending').length;
    const approvedApplications = applications.filter((item) => item.status === 'approved').length;
    const rejectedApplications = applications.filter((item) => item.status === 'rejected').length;
    const completedApplications = applications.filter((item) => item.status === 'completed').length;

    const totalAdjustmentQuantity = applications.reduce(
      (sum, item) => sum + Math.abs(item.adjustmentQuantity),
      0
    );
    const positiveAdjustments = applications.filter((item) => item.adjustmentQuantity > 0).length;
    const negativeAdjustments = applications.filter((item) => item.adjustmentQuantity < 0).length;

    return {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      completedApplications,
      totalAdjustmentQuantity,
      positiveAdjustments,
      negativeAdjustments,
      pendingRate:
        totalApplications > 0 ? ((pendingApplications / totalApplications) * 100).toFixed(1) : '0',
      approvedRate:
        totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : '0',
    };
  }

  // ==================== 私有辅助方法 ====================

  // 筛选调整记录
  private filterAdjustments(
    adjustments: InventoryAdjustment[],
    filters: InventoryAdjustmentFilters
  ): InventoryAdjustment[] {
    return adjustments.filter((adjustment) => {
      // SKU筛选
      if (filters.sku && !adjustment.sku.toLowerCase().includes(filters.sku.toLowerCase())) {
        return false;
      }

      // 商品名称筛选
      if (
        filters.productName &&
        !adjustment.productName.toLowerCase().includes(filters.productName.toLowerCase())
      ) {
        return false;
      }

      // 仓库筛选
      if (filters.locationId && adjustment.locationId !== filters.locationId) {
        return false;
      }

      // 调整类型筛选
      if (filters.adjustmentType && adjustment.adjustmentType !== filters.adjustmentType) {
        return false;
      }

      // 状态筛选
      if (filters.status && adjustment.status !== filters.status) {
        return false;
      }

      // 申请人筛选
      if (
        filters.requestedBy &&
        !adjustment.requestedBy.toLowerCase().includes(filters.requestedBy.toLowerCase())
      ) {
        return false;
      }

      // 时间范围筛选
      if (filters.dateRange && filters.dateRange.length === 2) {
        const requestDate = new Date(adjustment.requestedAt);
        const startDate = new Date(filters.dateRange[0]);
        const endDate = new Date(filters.dateRange[1]);
        endDate.setHours(23, 59, 59, 999);

        if (requestDate < startDate || requestDate > endDate) {
          return false;
        }
      }

      // 调整数量范围筛选
      if (filters.quantityRange && filters.quantityRange.length === 2) {
        const [minQty, maxQty] = filters.quantityRange;
        const absQuantity = Math.abs(adjustment.adjustmentQuantity);
        if (absQuantity < minQty || absQuantity > maxQty) {
          return false;
        }
      }

      return true;
    });
  }

  // 排序调整记录
  private sortAdjustments(
    adjustments: InventoryAdjustment[],
    sort: SortParams
  ): InventoryAdjustment[] {
    const { sortBy, sortOrder } = sort;

    return adjustments.sort((a, b) => {
      let aValue: any = a[sortBy as keyof InventoryAdjustment];
      let bValue: any = b[sortBy as keyof InventoryAdjustment];

      // 处理日期字符串
      if (typeof aValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(aValue)) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  // 创建调整申请流水
  private async createAdjustmentMovement(adjustment: InventoryAdjustment): Promise<void> {
    const now = new Date().toISOString();
    const movement: InventoryMovement = {
      id: `MOV${Date.now()}`,
      transactionId: `TXN${Date.now()}`,
      sku: adjustment.sku,
      productName: adjustment.productName,
      categoryName: '', // 调整时可能不需要分类
      locationId: adjustment.locationId,
      locationName: adjustment.locationName,
      movementType: adjustment.adjustmentQuantity > 0 ? 'adjust_positive' : 'adjust_negative',
      movementSubtype: adjustment.adjustmentType,
      quantity: adjustment.adjustmentQuantity,
      balanceBefore: adjustment.originalQuantity,
      balanceAfter: adjustment.adjustedQuantity,
      costPrice: undefined,
      totalValue: undefined,
      referenceType: 'adjustment',
      referenceId: adjustment.id,
      referenceNo: adjustment.adjustmentNo,
      operatorId: adjustment.requestedBy,
      operatorName: adjustment.requestedBy,
      operationTime: adjustment.requestedAt,
      status: adjustment.status === 'completed' ? 'completed' : 'pending',
      remark: `库存调整申请: ${adjustment.reason}`,
      sourceSystem: 'Inventory Management System',
      createdAt: now,
      updatedAt: now,
      isReversed: false,
    };

    this.mockMovements.unshift(movement);
  }

  // 创建拒绝流水
  private async createRejectionMovement(
    adjustment: InventoryAdjustment,
    remark?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    const movement: InventoryMovement = {
      id: `MOV${Date.now()}`,
      transactionId: `TXN${Date.now()}`,
      sku: adjustment.sku,
      productName: adjustment.productName,
      categoryName: '',
      locationId: adjustment.locationId,
      locationName: adjustment.locationName,
      movementType: 'adjust_negative', // 拒绝不改变库存，但使用调整类型
      movementSubtype: 'rejection',
      quantity: 0,
      balanceBefore: adjustment.originalQuantity,
      balanceAfter: adjustment.originalQuantity,
      costPrice: undefined,
      totalValue: undefined,
      referenceType: 'adjustment',
      referenceId: adjustment.id,
      referenceNo: adjustment.adjustmentNo,
      operatorId: adjustment.approvedBy || 'system',
      operatorName: adjustment.approvedBy || '系统',
      operationTime: adjustment.approvedAt || new Date().toISOString(),
      status: 'completed',
      remark: `调整申请被拒绝: ${remark || '无备注'}`,
      sourceSystem: 'Inventory Management System',
      createdAt: now,
      updatedAt: now,
      isReversed: false,
    };

    this.mockMovements.unshift(movement);
  }

  // 创建执行流水
  private async createExecutionMovement(
    adjustment: InventoryAdjustment,
    oldQuantity: number
  ): Promise<void> {
    const now = new Date().toISOString();
    const movement: InventoryMovement = {
      id: `MOV${Date.now()}`,
      transactionId: `TXN${Date.now()}`,
      sku: adjustment.sku,
      productName: adjustment.productName,
      categoryName: '',
      locationId: adjustment.locationId,
      locationName: adjustment.locationName,
      movementType: adjustment.adjustmentQuantity > 0 ? 'adjust_positive' : 'adjust_negative',
      movementSubtype: adjustment.adjustmentType,
      quantity: adjustment.adjustmentQuantity,
      balanceBefore: oldQuantity,
      balanceAfter: adjustment.adjustedQuantity,
      costPrice: undefined,
      totalValue: undefined,
      referenceType: 'adjustment',
      referenceId: adjustment.id,
      referenceNo: adjustment.adjustmentNo,
      operatorId: adjustment.executedBy || 'system',
      operatorName: adjustment.executedBy || '系统',
      operationTime: adjustment.completedAt || new Date().toISOString(),
      status: 'completed',
      remark: `库存调整执行: ${adjustment.reason}`,
      sourceSystem: 'Inventory Management System',
      createdAt: now,
      updatedAt: now,
      isReversed: false,
    };

    this.mockMovements.unshift(movement);
  }

  // 工具方法
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private generateCSV(headers: string[], rows: string[][]): string {
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return '\ufeff' + csvContent; // 添加BOM以支持中文
  }
}

// 导出单例服务实例
export const inventoryMockService = new InventoryMockService();

// 导出Mock数据生成器实例（用于直接访问）
export const mockDataGenerator = MockDataGenerator.getInstance();
