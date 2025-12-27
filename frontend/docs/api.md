# API 文档

本文档描述了影院商务中心平台前端应用的 API 接口设计、数据结构和调用规范。

## 📋 目录

- [基础规范](#基础规范)
- [错误处理](#错误处理)
- [库存管理 API](#库存管理-api)
- [价格管理 API](#价格管理-api)
- [审核管理 API](#审核管理-api)
- [通用接口](#通用接口)

## 基础规范

### 请求格式

```typescript
// HTTP 请求头
headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>',
  'X-Requested-With': 'XMLHttpRequest'
}

// GET 请求参数
interface QueryParams {
  page?: number;        // 页码，从 1 开始
  pageSize?: number;    // 每页数量，默认 20
  sort?: string;        // 排序字段
  order?: 'asc' | 'desc'; // 排序方向
  search?: string;      // 搜索关键词
  filters?: Record<string, any>; // 筛选条件
}

// POST/PUT 请求体
interface RequestBody<T = any> {
  data?: T;
  [key: string]: any;
}
```

### 响应格式

```typescript
// 成功响应
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

// 分页响应
interface PaginatedResponse<T> {
  success: true;
  data: {
    list: T[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
  timestamp: string;
}

// 错误响应
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## 错误处理

### 错误代码

| 代码 | 说明 | HTTP状态码 |
|------|------|------------|
| `NETWORK_ERROR` | 网络连接失败 | 0 |
| `UNAUTHORIZED` | 未授权访问 | 401 |
| `FORBIDDEN` | 权限不足 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `VALIDATION_ERROR` | 数据验证失败 | 400 |
| `SERVER_ERROR` | 服务器内部错误 | 500 |
| `TIMEOUT` | 请求超时 | 408 |

### 错误处理示例

```typescript
try {
  const response = await api.get('/inventory/products');
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // 处理未授权
    redirectToLogin();
  } else if (error.response?.status === 403) {
    // 处理权限不足
    showPermissionError();
  } else {
    // 处理其他错误
    showGenericError(error.message);
  }
}
```

## 库存管理 API

### 商品列表

```typescript
// GET /api/inventory/products
interface GetProductsParams extends QueryParams {
  category?: string;
  brand?: string;
  status?: 'active' | 'inactive' | 'draft';
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface Product {
  id: string;
  code: string;
  name: string;
  category: {
    id: string;
    name: string;
    level: number;
  };
  brand: {
    id: string;
    name: string;
  };
  spec: string;
  unit: string;
  currentStock: number;
  availableStock: number;
  safetyStock: number;
  maxStock: number;
  averageCost: number;
  stockValue: number;
  status: 'active' | 'inactive' | 'draft';
  lastUpdated: string;
  supplier?: {
    id: string;
    name: string;
  };
  location?: {
    warehouse: string;
    area: string;
    shelf: string;
  };
}

// 响应
type GetProductsResponse = PaginatedResponse<Product>;
```

### 商品详情

```typescript
// GET /api/inventory/products/:id
interface ProductDetail extends Product {
  description: string;
  images: string[];
  attributes: Record<string, any>;
  batchInfo: {
    batchNumber: string;
    productionDate: string;
    expirationDate: string;
  }[];
  stockHistory: {
    id: string;
    type: 'in' | 'out' | 'transfer' | 'adjustment';
    quantity: number;
    reason: string;
    operator: string;
    timestamp: string;
  }[];
}
```

### 入库管理

```typescript
// GET /api/inventory/stock-in
interface StockInRecord {
  id: string;
  orderNumber: string;
  supplier: {
    id: string;
    name: string;
  };
  products: {
    product: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    batchNumber: string;
    productionDate: string;
    expirationDate: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  applicant: string;
  approver?: string;
  appliedAt: string;
  approvedAt?: string;
  completedAt?: string;
  remarks?: string;
}

// POST /api/inventory/stock-in
interface CreateStockInRequest {
  supplierId: string;
  products: {
    productId: string;
    quantity: number;
    unitPrice: number;
    batchNumber: string;
    productionDate: string;
    expirationDate: string;
  }[];
  expectedDate: string;
  remarks?: string;
}
```

### 出库管理

```typescript
// GET /api/inventory/stock-out
interface StockOutRecord {
  id: string;
  orderNumber: string;
  type: 'sale' | 'transfer' | 'adjustment' | 'damage';
  targetLocation?: string;
  products: {
    product: Product;
    quantity: number;
    reason: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  applicant: string;
  approver?: string;
  appliedAt: string;
  approvedAt?: string;
  completedAt?: string;
  remarks?: string;
}

// POST /api/inventory/stock-out
interface CreateStockOutRequest {
  type: 'sale' | 'transfer' | 'adjustment' | 'damage';
  targetLocation?: string;
  products: {
    productId: string;
    quantity: number;
    reason: string;
  }[];
  expectedDate: string;
  remarks?: string;
}
```

### 库存盘点

```typescript
// GET /api/inventory/checks
interface StockCheck {
  id: string;
  checkNumber: string;
  warehouse: string;
  area?: string;
  products: {
    product: Product;
    systemStock: number;
    actualStock: number;
    difference: number;
    reason?: string;
  }[];
  status: 'pending' | 'in_progress' | 'completed';
  checker: string;
  startedAt?: string;
  completedAt?: string;
  totalDifference: number;
  summary: {
    normal: number;
    surplus: number;
    shortage: number;
  };
}

// POST /api/inventory/checks
interface CreateStockCheckRequest {
  warehouse: string;
  area?: string;
  productIds?: string[];
  plannedDate: string;
}
```

## 价格管理 API

### 价格列表

```typescript
// GET /api/price/prices
interface GetPricesParams extends QueryParams {
  productIds?: string[];
  priceType?: 'sale' | 'purchase' | 'wholesale' | 'retail' | 'member';
  status?: 'active' | 'inactive' | 'pending';
}

interface PriceConfig {
  id: string;
  product: Product;
  priceType: 'sale' | 'purchase' | 'wholesale' | 'retail' | 'member';
  unitPrice: number;
  salePrice?: number;
  purchasePrice?: number;
  wholesalePrice?: number;
  retailPrice?: number;
  memberPrice?: number;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'pending';
  priority: number;
  conditions?: {
    minQuantity?: number;
    maxQuantity?: number;
    customerLevel?: string[];
    channel?: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}
```

### 价格规则

```typescript
// GET /api/price/rules
interface PriceRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'discount' | 'markup' | 'promotion';
  conditions: {
    productCategories?: string[];
    brands?: string[];
    customerLevels?: string[];
    orderAmount?: {
      min?: number;
      max?: number;
    };
    quantity?: {
      min?: number;
      max?: number;
    };
    timeRange?: {
      start: string;
      end: string;
    };
  };
  actions: {
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    priceAdjustment?: number;
  };
  status: 'active' | 'inactive';
  priority: number;
  usageCount: number;
  createdBy: string;
  createdAt: string;
}
```

### 价格历史

```typescript
// GET /api/price/history/:priceConfigId
interface PriceHistory {
  id: string;
  priceConfigId: string;
  oldPrice: number;
  newPrice: number;
  changeType: 'create' | 'update' | 'delete';
  changeReason: string;
  operator: string;
  timestamp: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvedAt?: string;
}
```

### 价格变更审批

```typescript
// GET /api/price/changes
interface PriceChangeRequest {
  id: string;
  priceConfig: PriceConfig;
  changeType: 'create' | 'update' | 'delete';
  oldData?: Partial<PriceConfig>;
  newData: Partial<PriceConfig>;
  changeReason: string;
  applicant: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approver?: string;
  approvedAt?: string;
  comments?: string;
}

// POST /api/price/changes/:id/approve
interface ApprovePriceChangeRequest {
  comments?: string;
}
```

## 审核管理 API

### 审核列表

```typescript
// GET /api/audit/records
interface GetAuditParams extends QueryParams {
  auditType?: 'stock_in' | 'stock_out' | 'price_change' | 'product_create';
  status?: 'pending' | 'approved' | 'rejected';
  applicant?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface AuditRecord {
  id: string;
  auditType: 'stock_in' | 'stock_out' | 'price_change' | 'product_create';
  title: string;
  content: {
    entityType: string;
    entityId: string;
    changes?: Record<string, { old: any; new: any }>;
    newData?: any;
  };
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  applicant: {
    id: string;
    name: string;
    department: string;
  };
  approver?: {
    id: string;
    name: string;
    department: string;
  };
  appliedAt: string;
  approvedAt?: string;
  comments?: string;
  attachments?: string[];
}
```

### 批量审核

```typescript
// POST /api/audit/batch-approve
interface BatchAuditRequest {
  recordIds: string[];
  action: 'approve' | 'reject';
  comments?: string;
}
```

### 审核历史

```typescript
// GET /api/audit/history/:entityType/:entityId
interface AuditHistory {
  id: string;
  recordId: string;
  action: 'submitted' | 'approved' | 'rejected' | 'withdrawn';
  operator: {
    id: string;
    name: string;
  };
  timestamp: string;
  comments?: string;
}
```

## 通用接口

### 文件上传

```typescript
// POST /api/common/upload
interface UploadResponse {
  success: true;
  data: {
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  };
}

// 上传配置
const uploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
};
```

### 用户信息

```typescript
// GET /api/user/profile
interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  position: string;
  roles: string[];
  permissions: string[];
  preferences: {
    language: string;
    theme: string;
    timezone: string;
  };
  lastLoginAt: string;
}
```

### 系统配置

```typescript
// GET /api/system/config
interface SystemConfig {
  businessInfo: {
    name: string;
    logo: string;
    description: string;
    contact: {
      phone: string;
      email: string;
      address: string;
    };
  };
  features: {
    enableMultiLanguage: boolean;
    enableThemeSwitch: boolean;
    enableNotification: boolean;
  };
  limits: {
    maxUploadSize: number;
    maxExportRecords: number;
    sessionTimeout: number;
  };
}
```

## 数据类型定义

### 通用状态枚举

```typescript
enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DRAFT = 'draft'
}

enum AuditStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

### 时间格式

所有时间字段均使用 ISO 8601 格式：
```
2025-12-12T10:30:00.000Z
```

### 分页参数

```typescript
interface PaginationParams {
  current: number;    // 当前页码，从 1 开始
  pageSize: number;   // 每页数量，默认 20
}

interface PaginationResult {
  current: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

## 开发指南

### API 调用示例

```typescript
import { api } from '@/services/api';

// 获取商品列表
const getProducts = async (params: GetProductsParams) => {
  const response = await api.get<GetProductsResponse>('/inventory/products', {
    params
  });
  return response.data;
};

// 创建入库记录
const createStockIn = async (data: CreateStockInRequest) => {
  const response = await api.post<StockInRecord>('/inventory/stock-in', {
    data
  });
  return response.data;
};
```

### 错误处理最佳实践

```typescript
import { handleNetworkError, handleBusinessError } from '@/utils/errorHandling';

const apiCall = async () => {
  try {
    const response = await api.get('/api/data');
    return response.data;
  } catch (error) {
    if (error.response) {
      // 服务器响应错误
      handleNetworkError(error);
    } else if (error.request) {
      // 网络错误
      handleNetworkError(error);
    } else {
      // 其他错误
      handleBusinessError('API调用失败', error.message);
    }
  }
};
```

---

*文档最后更新：2025年12月12日*