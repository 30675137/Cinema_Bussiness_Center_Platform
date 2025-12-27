# 采购与入库管理数据模型

## 概述

本文档定义了采购与入库管理模块的核心数据模型，包括采购订单、收货入库单、供应商等主要业务实体的数据结构设计。所有数据模型专为前端界面设计，使用TypeScript接口定义，支持前端mock数据实现。

## 核心数据实体

### 1. 采购订单 (PurchaseOrder)

采购订单是采购流程的核心实体，记录了向供应商采购商品的详细信息。

```typescript
interface PurchaseOrder {
  /** 唯一标识符 */
  id: string;
  /** 采购订单编号 */
  orderNumber: string;
  /** 供应商信息 */
  supplier: Supplier;
  /** 收货仓库信息 */
  warehouse: Warehouse;
  /** 订单状态 */
  status: PurchaseOrderStatus;
  /** 下单日期 */
  orderDate: string;
  /** 计划到货日期 */
  expectedDate: string;
  /** 实际到货日期 */
  actualDate?: string;
  /** 订单商品明细 */
  items: PurchaseOrderItem[];
  /** 订单总金额（含税） */
  totalAmount: number;
  /** 税额合计 */
  taxAmount: number;
  /** 不含税金额 */
  netAmount: number;
  /** 已收货金额 */
  receivedAmount: number;
  /** 收货进度百分比 */
  receiptProgress: number;
  /** 订单创建人 */
  createdBy: User;
  /** 最后修改人 */
  lastModifiedBy?: User;
  /** 创建时间 */
  createdAt: string;
  /** 最后修改时间 */
  updatedAt: string;
  /** 备注信息 */
  remarks?: string;
  /** 附件信息 */
  attachments: Attachment[];
  /** 审批记录 */
  approvalHistory: ApprovalRecord[];
}
```

#### 1.1 采购订单状态枚举
```typescript
enum PurchaseOrderStatus {
  /** 草稿 - 可编辑状态 */
  DRAFT = 'draft',
  /** 审批中 - 等待审批 */
  PENDING = 'pending',
  /** 已审批 - 可以执行收货 */
  APPROVED = 'approved',
  /** 部分收货 - 部分商品已入库 */
  PARTIAL_RECEIVED = 'partial_received',
  /** 已收货 - 全部商品已入库 */
  RECEIVED = 'received',
  /** 已关闭 - 订单完成或取消 */
  CLOSED = 'closed',
  /** 已作废 - 订单作废 */
  CANCELLED = 'cancelled'
}
```

#### 1.2 采购订单商品明细
```typescript
interface PurchaseOrderItem {
  /** 唯一标识符 */
  id: string;
  /** 关联的采购订单ID */
  orderId: string;
  /** 商品信息 */
  product: Product;
  /** 采购数量 */
  quantity: number;
  /** 采购单价 */
  unitPrice: number;
  /** 税率 (0-1之间的小数) */
  taxRate: number;
  /** 税额 */
  taxAmount: number;
  /** 小计金额（含税） */
  subtotal: number;
  /** 已收货数量 */
  receivedQuantity: number;
  /** 未收货数量 */
  remainingQuantity: number;
  /** 收货状态 */
  receiptStatus: ItemReceiptStatus;
  /** 备注信息 */
  remarks?: string;
}
```

#### 1.3 商品明细收货状态
```typescript
enum ItemReceiptStatus {
  /** 未收货 */
  NOT_RECEIVED = 'not_received',
  /** 部分收货 */
  PARTIAL_RECEIVED = 'partial_received',
  /** 全部收货 */
  FULLY_RECEIVED = 'fully_received',
  /** 超量收货 */
  OVER_RECEIVED = 'over_received'
}
```

### 2. 收货入库单 (GoodsReceipt)

收货入库单记录了实际收货的详细信息，基于采购订单创建。

```typescript
interface GoodsReceipt {
  /** 唯一标识符 */
  id: string;
  /** 收货单编号 */
  receiptNumber: string;
  /** 关联的采购订单 */
  purchaseOrder: PurchaseOrder;
  /** 供应商信息 */
  supplier: Supplier;
  /** 收货仓库 */
  warehouse: Warehouse;
  /** 收货状态 */
  status: GoodsReceiptStatus;
  /** 收货日期 */
  receiptDate: string;
  /** 收货类型 */
  receiptType: ReceiptType;
  /** 收货商品明细 */
  items: GoodsReceiptItem[];
  /** 收货总数量 */
  totalQuantity: number;
  /** 收货总金额 */
  totalAmount: number;
  /** 税额合计 */
  taxAmount: number;
  /** 质检结果 */
  qualityResults: QualityResult[];
  /** 收货经办人 */
  receiver: User;
  /** 质检员 */
  inspector?: User;
  /** 创建时间 */
  createdAt: string;
  /** 最后修改时间 */
  updatedAt: string;
  /** 收货备注 */
  remarks?: string;
  /** 附件信息 */
  attachments: Attachment[];
}
```

#### 2.1 收货单状态枚举
```typescript
enum GoodsReceiptStatus {
  /** 草稿 */
  DRAFT = 'draft',
  /** 已入库 */
  COMPLETED = 'completed',
  /** 已作废 */
  CANCELLED = 'cancelled'
}
```

#### 2.2 收货类型枚举
```typescript
enum ReceiptType {
  /** 正常收货 */
  NORMAL = 'normal',
  /** 退货收货 */
  RETURN = 'return',
  /** 盘点收货 */
  INVENTORY = 'inventory'
}
```

#### 2.3 收货商品明细
```typescript
interface GoodsReceiptItem {
  /** 唯一标识符 */
  id: string;
  /** 收货单ID */
  receiptId: string;
  /** 关联的采购订单明细 */
  orderItem: PurchaseOrderItem;
  /** 商品信息 */
  product: Product;
  /** 本次收货数量 */
  quantity: number;
  /** 收货单价 */
  unitPrice: number;
  /** 税率 */
  taxRate: number;
  /** 税额 */
  taxAmount: number;
  /** 小计金额 */
  subtotal: number;
  /** 质检状态 */
  qualityStatus: QualityStatus;
  /** 质检备注 */
  qualityRemarks?: string;
  /** 库位信息 */
  location?: string;
  /** 批次号 */
  batchNumber?: string;
  /** 生产日期 */
  productionDate?: string;
  /** 有效期 */
  expiryDate?: string;
}
```

### 3. 供应商 (Supplier)

供应商信息实体，记录供应商的基本资料和合作信息。

```typescript
interface Supplier {
  /** 唯一标识符 */
  id: string;
  /** 供应商编码 */
  code: string;
  /** 供应商名称 */
  name: string;
  /** 供应商类型 */
  category: SupplierCategory;
  /** 状态 */
  status: SupplierStatus;
  /** 联系人信息 */
  contact: ContactInfo;
  /** 付款信息 */
  payment: PaymentInfo;
  /** 地址信息 */
  address: Address;
  /** 银行账户信息 */
  bankAccounts: BankAccount[];
  /** 供应商等级 */
  rating: SupplierRating;
  /** 合作开始日期 */
  partnershipStartDate: string;
  /** 最后合作日期 */
  lastCooperationDate?: string;
  /** 备注信息 */
  remarks?: string;
  /** 创建时间 */
  createdAt: string;
  /** 最后修改时间 */
  updatedAt: string;
  /** 创建人 */
  createdBy: User;
}
```

#### 3.1 供应商相关枚举
```typescript
enum SupplierCategory {
  /** 商品供应商 */
  PRODUCT = 'product',
  /** 设备供应商 */
  EQUIPMENT = 'equipment',
  /** 服务供应商 */
  SERVICE = 'service',
  /** 原材料供应商 */
  RAW_MATERIAL = 'raw_material'
}

enum SupplierStatus {
  /** 启用 */
  ACTIVE = 'active',
  /** 禁用 */
  INACTIVE = 'inactive',
  /** 暂停合作 */
  SUSPENDED = 'suspended'
}

enum SupplierRating {
  /** A级 - 优秀 */
  A = 'A',
  /** B级 - 良好 */
  B = 'B',
  /** C级 - 一般 */
  C = 'C',
  /** D级 - 较差 */
  D = 'D'
}
```

### 4. 商品 (Product)

商品信息实体，记录商品的基本属性和规格信息。

```typescript
interface Product {
  /** 唯一标识符 */
  id: string;
  /** 商品SKU编码 */
  sku: string;
  /** 商品名称 */
  name: string;
  /** 商品规格型号 */
  specification?: string;
  /** 商品品牌 */
  brand?: string;
  /** 商品分类 */
  category: ProductCategory;
  /** 计量单位 */
  unit: string;
  /** 商品状态 */
  status: ProductStatus;
  /** 成本价 */
  costPrice: number;
  /** 建议售价 */
  retailPrice: number;
  /** 最低库存量 */
  minStock: number;
  /** 最高库存量 */
  maxStock: number;
  /** 安全库存量 */
  safetyStock: number;
  /** 供应商信息 */
  suppliers: ProductSupplier[];
  /** 商品图片 */
  images: ProductImage[];
  /** 商品描述 */
  description?: string;
  /** 创建时间 */
  createdAt: string;
  /** 最后修改时间 */
  updatedAt: string;
}
```

#### 4.1 商品相关枚举和关联实体
```typescript
enum ProductStatus {
  /** 启用 */
  ACTIVE = 'active',
  /** 禁用 */
  INACTIVE = 'inactive',
  /** 停产 */
  DISCONTINUED = 'discontinued'
}

interface ProductCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  level: number;
}

interface ProductSupplier {
  supplierId: string;
  supplierName: string;
  supplierSku?: string;
  purchasePrice: number;
  leadTime: number; // 供货周期（天）
  minOrderQuantity: number; // 最小订购量
  isPreferred: boolean; // 是否首选供应商
}
```

### 5. 仓库 (Warehouse)

仓库信息实体，记录仓库的基本信息和管理区域。

```typescript
interface Warehouse {
  /** 唯一标识符 */
  id: string;
  /** 仓库编码 */
  code: string;
  /** 仓库名称 */
  name: string;
  /** 仓库类型 */
  type: WarehouseType;
  /** 状态 */
  status: WarehouseStatus;
  /** 地址信息 */
  address: Address;
  /** 联系人信息 */
  contact: ContactInfo;
  /** 仓库管理员 */
  manager: User;
  /** 仓库容量 */
  capacity?: number;
  /** 当前库存量 */
  currentStock?: number;
  /** 库位信息 */
  locations: StorageLocation[];
  /** 营业时间 */
  businessHours: string;
  /** 备注 */
  remarks?: string;
  /** 创建时间 */
  createdAt: string;
  /** 最后修改时间 */
  updatedAt: string;
}
```

#### 5.1 仓库相关枚举
```typescript
enum WarehouseType {
  /** 主仓库 */
  MAIN = 'main',
  /** 分仓库 */
  BRANCH = 'branch',
  /** 临时仓库 */
  TEMPORARY = 'temporary'
}

enum WarehouseStatus {
  /** 启用 */
  ACTIVE = 'active',
  /** 禁用 */
  INACTIVE = 'inactive',
  /** 维护中 */
  MAINTENANCE = 'maintenance'
}
```

## 通用实体定义

### 1. 用户信息
```typescript
interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  status: UserStatus;
  lastLoginAt?: string;
}

enum UserRole {
  /** 系统管理员 */
  ADMIN = 'admin',
  /** 采购管理员 */
  PURCHASE_MANAGER = 'purchase_manager',
  /** 仓库管理员 */
  WAREHOUSE_MANAGER = 'warehouse_manager',
  /** 财务人员 */
  FINANCE = 'finance',
  /** 门店经理 */
  STORE_MANAGER = 'store_manager',
  /** 普通运营 */
  OPERATOR = 'operator'
}

enum UserStatus {
  /** 启用 */
  ACTIVE = 'active',
  /** 禁用 */
  INACTIVE = 'inactive',
  /** 锁定 */
  LOCKED = 'locked'
}
```

### 2. 联系信息
```typescript
interface ContactInfo {
  /** 联系人姓名 */
  person: string;
  /** 联系电话 */
  phone: string;
  /** 邮箱地址 */
  email?: string;
  /** 传真号码 */
  fax?: string;
}
```

### 3. 地址信息
```typescript
interface Address {
  /** 国家 */
  country: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 区域 */
  district?: string;
  /** 详细地址 */
  detail: string;
  /** 邮政编码 */
  zipCode?: string;
}
```

### 4. 银行账户
```typescript
interface BankAccount {
  /** 银行名称 */
  bankName: string;
  /** 账户名称 */
  accountName: string;
  /** 银行账号 */
  accountNumber: string;
  /** 开户行地址 */
  bankAddress?: string;
  /** 是否默认账户 */
  isDefault: boolean;
}
```

### 5. 附件信息
```typescript
interface Attachment {
  id: string;
  /** 文件名 */
  fileName: string;
  /** 文件大小（字节） */
  fileSize: number;
  /** 文件类型 */
  fileType: string;
  /** 文件URL */
  url: string;
  /** 上传时间 */
  uploadedAt: string;
  /** 上传人 */
  uploadedBy: User;
}
```

### 6. 审批记录
```typescript
interface ApprovalRecord {
  id: string;
  /** 审批步骤 */
  step: number;
  /** 审批人 */
  approver: User;
  /** 审批状态 */
  status: ApprovalStatus;
  /** 审批意见 */
  comments?: string;
  /** 审批时间 */
  approvedAt: string;
}

enum ApprovalStatus {
  /** 待审批 */
  PENDING = 'pending',
  /** 通过 */
  APPROVED = 'approved',
  /** 拒绝 */
  REJECTED = 'rejected'
}
```

### 7. 质检相关
```typescript
interface QualityResult {
  itemId: string;
  /** 质检状态 */
  status: QualityStatus;
  /** 质检数量 */
  quantity: number;
  /** 不合格数量 */
  defectiveQuantity: number;
  /** 质检备注 */
  remarks?: string;
  /** 质检时间 */
  inspectedAt: string;
  /** 质检员 */
  inspector: User;
}

enum QualityStatus {
  /** 合格 */
  QUALIFIED = 'qualified',
  /** 不合格 */
  UNQUALIFIED = 'unqualified',
  /** 待检 */
  PENDING = 'pending',
  /** 免检 */
  EXEMPTED = 'exempted'
}
```

### 8. 存储位置
```typescript
interface StorageLocation {
  id: string;
  /** 库位编码 */
  code: string;
  /** 库位名称 */
  name: string;
  /** 库位类型 */
  type: LocationType;
  /** 库位状态 */
  status: LocationStatus;
  /** 容量 */
  capacity?: number;
  /** 当前库存量 */
  currentStock?: number;
  /** 所在区域 */
  area: string;
  /** 排 */
  row: string;
  /** 列 */
  column: string;
  /** 层 */
  level: string;
}

enum LocationType {
  /** 货架 */
  SHELF = 'shelf',
  /** 地面堆放区 */
  FLOOR = 'floor',
  /** 冷库区 */
  COLD_STORAGE = 'cold_storage',
  /** 危险品区 */
  HAZARDOUS = 'hazardous'
}

enum LocationStatus {
  /** 空闲 */
  AVAILABLE = 'available',
  /** 占用 */
  OCCUPIED = 'occupied',
  /** 维护中 */
  MAINTENANCE = 'maintenance'
}
```

## 数据关系说明

### 主要实体关系
1. **采购订单 → 供应商**: 多对一关系
2. **采购订单 → 仓库**: 多对一关系
3. **采购订单 → 采购订单明细**: 一对多关系
4. **采购订单明细 → 商品**: 多对一关系
5. **收货入库单 → 采购订单**: 多对一关系
6. **收货入库单 → 收货明细**: 一对多关系
7. **供应商 → 商品**: 多对多关系
8. **仓库 → 存储位置**: 一对多关系

### 业务约束
1. **采购订单**: 只能有一个供应商和一个目标仓库
2. **收货入库单**: 必须基于已审批的采购订单创建
3. **收货数量**: 不能超过采购订单的剩余未收数量
4. **商品状态**: 只有启用状态的商品才能参与采购
5. **供应商状态**: 只有启用状态的供应商才能选择

## Mock数据生成策略

### 数据量规划
- **采购订单**: 100-500条记录
- **收货入库单**: 200-1000条记录
- **供应商**: 20-50条记录
- **商品**: 100-300条记录
- **仓库**: 3-10条记录

### 数据生成规则
1. **订单编号**: PO + 年份 + 6位序列号 (PO202512000001)
2. **收货单编号**: GR + 年份 + 6位序列号 (GR202512000001)
3. **供应商编码**: SUP + 4位序列号 (SUP0001)
4. **商品SKU**: 自动生成唯一编码
5. **仓库编码**: WH + 地区代码 + 2位序列号

### 状态分布
- **采购订单状态**: 草稿(10%), 审批中(15%), 已审批(25%), 部分收货(20%), 已收货(25%), 已关闭(5%)
- **收货单状态**: 草稿(5%), 已入库(90%), 已作废(5%)
- **供应商状态**: 启用(90%), 禁用(8%), 暂停合作(2%)

---

**创建日期**: 2025-12-11
**创建人**: 系统
**文档版本**: v1.0
**分支**: claude-1-purchase-management