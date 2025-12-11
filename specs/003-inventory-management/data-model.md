# 数据模型设计

**功能**: 库存与仓店库存管理系统
**设计日期**: 2025-12-11
**数据类型**: Mock数据结构

## 核心实体模型

### 1. 库存台账 (InventoryLedger)

```typescript
interface InventoryLedger {
  // 基础标识
  id: string;                    // 唯一标识符，格式: "ledger_{location}_{sku}"
  sku: string;                   // 商品编码，格式: "SKU000001"
  productCode: string;           // 商品编码（同sku）
  productName: string;           // 商品名称，如："可口可乐330ml"

  // 位置信息
  locationId: string;            // 位置ID，格式: "wh_001" 或 "store_001"
  locationName: string;          // 位置名称，如："东区仓库" 或 "中山路门店"
  locationType: 'warehouse' | 'store';  // 位置类型

  // 库存数量
  physicalQuantity: number;      // 现存库存（物理库存）
  reservedQuantity: number;      // 预占库存
  availableQuantity: number;     // 可用库存 = 现存 - 预占
  inTransitQuantity: number;     // 在途库存
  safetyStock: number;           // 安全库存

  // 商品属性
  category: string;              // 商品类目，如："饮料"
  subcategory?: string;          // 子类目，如："碳酸饮料"
  brand?: string;                // 品牌，如："可口可乐"
  specification?: string;       // 规格，如："330ml/瓶"
  unit: string;                  // 单位，如："瓶"

  // 状态标识
  stockStatus: 'low' | 'normal' | 'high';  // 库存状态
  isSellable: boolean;           // 是否可售

  // 时间戳
  lastUpdated: string;           // 最后更新时间，ISO格式
  createdTime: string;           // 创建时间

  // 业务属性
  costPrice?: number;            // 成本价
  sellingPrice?: number;         // 销售价
  supplier?: string;             // 供应商
}
```

### 2. 库存流水 (InventoryMovement)

```typescript
interface InventoryMovement {
  // 基础标识
  id: string;                    // 流水ID，格式: "movement_{timestamp}_{sequence}"
  transactionId: string;         // 交易ID
  batchId?: string;              // 批次ID

  // 商品和位置信息
  sku: string;                   // 商品SKU
  productName: string;           // 商品名称
  locationId: string;            // 位置ID
  locationName: string;          // 位置名称

  // 变动信息
  movementType: 'in' | 'out' | 'transfer_in' | 'transfer_out' | 'adjust_positive' | 'adjust_negative';
  movementSubtype: string;       // 变动子类型，如："采购入库"、"销售出库"、"盘盈"等
  quantity: number;              // 变动数量（正数为入库，负数为出库）
  balanceAfter: number;          // 变动后结余

  // 关联信息
  referenceType: string;         // 关联单据类型，如："purchase_order"、"sale_order"
  referenceId: string;           // 关联单据ID
  referenceNo?: string;          // 单据编号

  // 操作信息
  operatorId: string;            // 操作员ID
  operatorName: string;          // 操作员姓名
  operationTime: string;         // 操作时间，ISO格式

  // 详细信息
  reason?: string;               // 变动原因
  remark?: string;               // 备注
  fromLocation?: string;         // 调出位置（调拨时使用）
  toLocation?: string;           // 调入位置（调拨时使用）

  // 审计信息
  sourceSystem: string;          // 来源系统，如："wms"、"pos"、"manual"
  createdAt: string;             // 创建时间
}
```

### 3. 库存调整记录 (InventoryAdjustment)

```typescript
interface InventoryAdjustment {
  // 基础标识
  id: string;                    // 调整ID，格式: "adjust_{timestamp}_{sequence}"
  adjustmentNo: string;          // 调整单号

  // 商品和位置信息
  sku: string;                   // 商品SKU
  productName: string;           // 商品名称
  locationId: string;            // 位置ID
  locationName: string;          // 位置名称

  // 调整信息
  adjustmentType: 'stocktaking_profit' | 'stocktaking_loss' | 'damage' | 'expired' | 'other';
  originalQuantity: number;      // 原始数量
  adjustedQuantity: number;      // 调整后数量
  adjustmentQuantity: number;    // 调整数量（正数=盘盈，负数=盘亏）

  // 审核信息
  requestUserId: string;         // 申请人ID
  requestUserName: string;       // 申请人姓名
  approveUserId?: string;        // 审批人ID
  approveUserName?: string;      // 审批人姓名
  approveTime?: string;          // 审批时间

  // 状态信息
  status: 'pending' | 'approved' | 'rejected' | 'completed';

  // 详细信息
  reason: string;                // 调整原因
  remark?: string;               // 备注
  attachments?: string[];        // 附件URL列表

  // 时间戳
  requestTime: string;           // 申请时间
  completedTime?: string;        // 完成时间
  createdTime: string;           // 创建时间
}
```

### 4. 商品SKU信息 (ProductSKU)

```typescript
interface ProductSKU {
  // 基础信息
  id: string;                    // SKU ID
  sku: string;                   // SKU编码
  barcode?: string;              // 条形码
  name: string;                  // 商品名称
  shortName?: string;            // 简称

  // 分类信息
  categoryId: string;            // 类目ID
  categoryName: string;          // 类目名称
  subcategoryId?: string;        // 子类目ID
  subcategoryName?: string;      // 子类目名称

  // 品牌信息
  brandId?: string;              // 品牌ID
  brandName?: string;            // 品牌名称

  // 规格信息
  specification?: string;        // 规格
  model?: string;                // 型号
  color?: string;                // 颜色
  size?: string;                 // 尺寸

  // 单位信息
  unitId: string;                // 单位ID
  unit: string;                  // 基本单位
  conversionRate?: number;       // 转换率

  // 价格信息
  costPrice?: number;            // 成本价
  sellingPrice?: number;         // 销售价
  retailPrice?: number;          // 零售价

  // 库存配置
  safetyStock: number;           // 默认安全库存
  maxStock: number;              // 最大库存
  minStock: number;              // 最小库存

  // 状态信息
  status: 'active' | 'inactive' | 'discontinued';  // 商品状态
  isSellable: boolean;           // 是否可售

  // 时间戳
  createdTime: string;           // 创建时间
  updatedTime: string;           // 更新时间
}
```

### 5. 仓库门店位置 (Location)

```typescript
interface Location {
  // 基础信息
  id: string;                    // 位置ID，格式: "wh_001" 或 "store_001"
  code: string;                  // 位置编码
  name: string;                  // 位置名称
  type: 'warehouse' | 'store';   // 位置类型

  // 层级信息
  parentId?: string;             // 父位置ID
  level: number;                 // 层级深度
  path: string;                  // 层级路径

  // 地理信息
  address?: string;              // 地址
  province?: string;             // 省份
  city?: string;                 // 城市
  district?: string;             // 区县

  // 联系信息
  contactPerson?: string;        // 联系人
  contactPhone?: string;         // 联系电话
  email?: string;                // 邮箱

  // 配置信息
  capacity?: number;             // 容量
  area?: number;                 // 面积
  temperature?: number;          // 温度要求
  humidity?: number;             // 湿度要求

  // 状态信息
  status: 'active' | 'inactive' | 'maintenance';

  // 时间戳
  createdTime: string;           // 创建时间
  updatedTime: string;           // 更新时间
}
```

## Mock数据生成规则

### 库存台账数据生成

```typescript
const generateInventoryLedger = (count: number = 200): InventoryLedger[] => {
  const warehouses = [
    { id: 'wh_001', name: '东区仓库', type: 'warehouse' },
    { id: 'wh_002', name: '西区仓库', type: 'warehouse' },
    { id: 'store_001', name: '中山路门店', type: 'store' },
    { id: 'store_002', name: '解放路门店', type: 'store' }
  ];

  const categories = ['饮料', '零食', '日用品', '电子产品', '服装'];
  const brands = ['可口可乐', '百事', '统一', '康师傅', '宝洁', '联合利华'];

  return Array.from({ length: count }, (_, index) => {
    const location = warehouses[Math.floor(Math.random() * warehouses.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];

    const physical = Math.floor(Math.random() * 1000) + 1;
    const reserved = Math.floor(Math.random() * Math.min(physical, 200));
    const inTransit = Math.floor(Math.random() * 100);
    const safety = Math.floor(Math.random() * 50) + 10;
    const available = physical - reserved;

    let stockStatus: 'low' | 'normal' | 'high';
    if (available <= safety) {
      stockStatus = 'low';
    } else if (available > safety * 3) {
      stockStatus = 'high';
    } else {
      stockStatus = 'normal';
    }

    return {
      id: `ledger_${location.id}_SKU${String(index + 1).padStart(6, '0')}`,
      sku: `SKU${String(index + 1).padStart(6, '0')}`,
      productCode: `SKU${String(index + 1).padStart(6, '0')}`,
      productName: `${brand}${category}${index + 1}`,
      locationId: location.id,
      locationName: location.name,
      locationType: location.type,
      physicalQuantity: physical,
      reservedQuantity: reserved,
      availableQuantity: available,
      inTransitQuantity: inTransit,
      safetyStock: safety,
      category,
      brand,
      specification: '标准规格',
      unit: '个',
      stockStatus,
      isSellable: Math.random() > 0.1,
      lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
};
```

### 库存流水数据生成

```typescript
const generateInventoryMovements = (count: number = 500): InventoryMovement[] => {
  const movementTypes = ['in', 'out', 'transfer_in', 'transfer_out', 'adjust_positive', 'adjust_negative'];
  const movementSubtypes = {
    in: ['采购入库', '退货入库', '调拨入库', '盘盈'],
    out: ['销售出库', '报损出库', '调拨出库', '盘亏'],
    transfer_in: ['调拨入库'],
    transfer_out: ['调拨出库'],
    adjust_positive: ['盘盈'],
    adjust_negative: ['盘亏', '报损']
  };

  const referenceTypes = ['purchase_order', 'sale_order', 'transfer_order', 'adjustment_order'];
  const operators = ['张三', '李四', '王五', '赵六', '陈七'];
  const sourceSystems = ['wms', 'pos', 'manual', 'erp'];

  return Array.from({ length: count }, (_, index) => {
    const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)] as any;
    const subtypes = movementSubtypes[movementType as keyof typeof movementSubtypes];
    const movementSubtype = subtypes[Math.floor(Math.random() * subtypes.length)];

    const quantity = movementType.includes('in') || movementType.includes('positive')
      ? Math.floor(Math.random() * 100) + 1
      : -(Math.floor(Math.random() * 100) + 1);

    return {
      id: `movement_${Date.now()}_${String(index + 1).padStart(4, '0')}`,
      transactionId: `txn_${Date.now()}_${index + 1}`,
      sku: `SKU${String(Math.floor(Math.random() * 200) + 1).padStart(6, '0')}`,
      productName: `商品${Math.floor(Math.random() * 200) + 1}`,
      locationId: Math.random() > 0.5 ? 'wh_001' : 'store_001',
      locationName: Math.random() > 0.5 ? '东区仓库' : '中山路门店',
      movementType,
      movementSubtype,
      quantity,
      balanceAfter: Math.floor(Math.random() * 1000) + quantity,
      referenceType: referenceTypes[Math.floor(Math.random() * referenceTypes.length)],
      referenceId: `ref_${index + 1}`,
      referenceNo: `REF${String(index + 1).padStart(8, '0')}`,
      operatorId: `user_${Math.floor(Math.random() * 5) + 1}`,
      operatorName: operators[Math.floor(Math.random() * operators.length)],
      operationTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason: '系统自动生成',
      sourceSystem: sourceSystems[Math.floor(Math.random() * sourceSystems.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  });
};
```

## 数据验证规则

### 库存台账验证

```typescript
const validateInventoryLedger = (data: InventoryLedger): string[] => {
  const errors: string[] = [];

  if (!data.sku) errors.push('SKU不能为空');
  if (!data.productName) errors.push('商品名称不能为空');
  if (data.physicalQuantity < 0) errors.push('现存库存不能为负数');
  if (data.reservedQuantity < 0) errors.push('预占库存不能为负数');
  if (data.availableQuantity !== data.physicalQuantity - data.reservedQuantity) {
    errors.push('可用库存计算错误');
  }
  if (data.safetyStock < 0) errors.push('安全库存不能为负数');

  return errors;
};
```

### 库存流水验证

```typescript
const validateInventoryMovement = (data: InventoryMovement): string[] => {
  const errors: string[] = [];

  if (!data.sku) errors.push('SKU不能为空');
  if (!data.movementType) errors.push('变动类型不能为空');
  if (!data.operatorName) errors.push('操作员不能为空');
  if (data.quantity === 0) errors.push('变动数量不能为0');

  return errors;
};
```

## 数据关系图

```
Location (仓库/门店)
    ├── 1:N → InventoryLedger (库存台账)
    ├── 1:N → InventoryMovement (库存流水)
    └── 1:N → InventoryAdjustment (库存调整)

ProductSKU (商品)
    ├── 1:N → InventoryLedger (库存台账)
    ├── 1:N → InventoryMovement (库存流水)
    └── 1:N → InventoryAdjustment (库存调整)

InventoryLedger (库存台账)
    ├── 1:N → InventoryMovement (关联流水)
    └── 1:N → InventoryAdjustment (调整记录)
```

## 性能优化设计

### 索引策略
- `InventoryLedger.sku` + `locationId` - 复合索引
- `InventoryMovement.operationTime` - 时间索引
- `InventoryMovement.sku` - SKU索引
- `InventoryMovement.locationId` - 位置索引

### 查询优化
- 分页查询：限制每次查询的最大记录数
- 筛选优化：常用筛选条件建立索引
- 缓存策略：热点数据缓存

### 内存管理
- 大数据集采用分块加载
- 虚拟滚动优化渲染性能
- 按需加载数据详情