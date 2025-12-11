# 数据模型：UI框架统一升级

**创建日期**: 2025-12-10
**范围**: 前端UI框架数据结构定义

## 数据实体概述

本文档定义了UI框架统一升级功能中涉及的所有数据实体，包括Mock数据结构、组件数据模型和状态管理模型。

## 核心数据实体

### 1. Mock数据实体

#### 1.1 产品数据 (Product)
```typescript
interface Product {
  id: string;                    // 产品唯一标识
  name: string;                  // 产品名称
  description: string;           // 产品描述
  category: string;             // 产品分类
  price: number;                // 产品价格
  status: 'active' | 'inactive' | 'pending'; // 产品状态
  imageUrl?: string;            // 产品图片URL
  createdAt: string;            // 创建时间
  updatedAt: string;            // 更新时间
  inventory: number;            // 库存数量
  tags: string[];               // 产品标签
}
```

#### 1.2 产品分类 (ProductCategory)
```typescript
interface ProductCategory {
  id: string;                    // 分类唯一标识
  name: string;                  // 分类名称
  parentId?: string;            // 父分类ID（支持层级结构）
  level: number;                // 分类层级
  sortOrder: number;            // 排序顺序
  icon?: string;                // 分类图标
  isActive: boolean;            // 是否激活
}
```

#### 1.3 用户数据 (User)
```typescript
interface User {
  id: string;                    // 用户唯一标识
  username: string;             // 用户名
  email: string;                // 邮箱
  avatar?: string;              // 头像URL
  role: UserRole;                // 用户角色
  status: 'active' | 'inactive'; // 用户状态
  lastLoginAt?: string;         // 最后登录时间
  createdAt: string;            // 创建时间
}
```

#### 1.4 用户角色 (UserRole)
```typescript
interface UserRole {
  id: string;                    // 角色唯一标识
  name: string;                  // 角色名称
  permissions: string[];         // 权限列表
  description?: string;         // 角色描述
  level: number;                // 角色级别
}
```

#### 1.5 导航菜单 (NavigationMenu)
```typescript
interface NavigationMenu {
  id: string;                    // 菜单唯一标识
  key: string;                   // 菜单键值
  title: string;                 // 菜单标题
  path?: string;                // 菜单路径
  icon?: string;                // 菜单图标
  children?: NavigationMenu[];  // 子菜单
  sortOrder: number;            // 排序顺序
  isVisible: boolean;           // 是否可见
  permissions?: string[];       // 访问权限
}
```

#### 1.6 仪表板统计数据 (DashboardStats)
```typescript
interface DashboardStats {
  totalProducts: number;         // 产品总数
  activeProducts: number;        // 激活产品数
  totalUsers: number;           // 用户总数
  activeUsers: number;          // 激活用户数
  totalOrders: number;          // 订单总数
  pendingOrders: number;        // 待处理订单数
  revenue: number;              // 总收入
  monthlyGrowth: number;        // 月增长率
}
```

### 2. 组件数据模型

#### 2.1 表格列配置 (TableColumn)
```typescript
interface TableColumn<T = any> {
  key: string;                   // 列键值
  title: string;                 // 列标题
  dataIndex: keyof T;           // 数据字段
  width?: number;               // 列宽度
  fixed?: 'left' | 'right';     // 固定列位置
  sorter?: boolean;             // 是否可排序
  filterable?: boolean;         // 是否可过滤
  render?: (value: any, record: T) => React.ReactNode; // 自定义渲染
}
```

#### 2.2 表单字段配置 (FormField)
```typescript
interface FormField {
  name: string;                  // 字段名称
  label: string;                 // 字段标签
  type: 'input' | 'select' | 'textarea' | 'date' | 'number' | 'switch'; // 字段类型
  required?: boolean;           // 是否必填
  placeholder?: string;         // 占位符
  options?: { label: string; value: any }[]; // 选择器选项
  rules?: FormRule[];           // 验证规则
  disabled?: boolean;           // 是否禁用
  span?: number;                // 栅格占位格数
}
```

#### 2.3 表单验证规则 (FormRule)
```typescript
interface FormRule {
  required?: boolean;           // 必填验证
  min?: number;                 // 最小长度/值
  max?: number;                 // 最大长度/值
  pattern?: RegExp;             // 正则表达式验证
  validator?: (value: any) => string | undefined; // 自定义验证器
  message?: string;             // 错误消息
}
```

### 3. 状态管理模型

#### 3.1 应用状态 (AppState)
```typescript
interface AppState {
  // UI状态
  sidebarCollapsed: boolean;     // 侧边栏折叠状态
  theme: 'light' | 'dark';      // 主题模式
  language: 'zh-CN';            // 语言设置

  // 导航状态
  currentPath: string;          // 当前路径
  breadcrumb: BreadcrumbItem[];  // 面包屑导航

  // 加载状态
  globalLoading: boolean;       // 全局加载状态

  // 用户偏好
  tablePageSize: number;        // 表格分页大小
}
```

#### 3.2 面包屑项目 (BreadcrumbItem)
```typescript
interface BreadcrumbItem {
  title: string;                 // 面包屑标题
  path?: string;                // 路径（可选）
  icon?: string;                // 图标（可选）
}
```

#### 3.3 产品管理状态 (ProductState)
```typescript
interface ProductState {
  // 产品数据
  products: Product[];          // 产品列表
  categories: ProductCategory[]; // 产品分类
  selectedProduct?: Product;    // 当前选中的产品

  // 筛选和搜索
  searchKeyword: string;        // 搜索关键词
  selectedCategory: string;     // 选中的分类
  statusFilter?: string;        // 状态筛选

  // 表格状态
  selectedRows: string[];       // 选中的行ID
  pagination: {
    current: number;            // 当前页
    pageSize: number;           // 每页大小
    total: number;              // 总数
  };

  // 模态框状态
  createModalVisible: boolean;  // 创建模态框可见性
  editModalVisible: boolean;    // 编辑模态框可见性
}
```

## 数据关系

### 实体关系图

```
User (1) ─────── (N) UserRole
  │
  │ (管理)
  ▼
Product (N) ─── (1) ProductCategory
  │
  │ (包含)
  ▼
ProductInventory (1:1)

NavigationMenu (N) ── (1) UserRole (权限控制)
```

### 数据流转

1. **用户登录流程**: User → UserRole → NavigationMenu (权限过滤)
2. **产品管理流程**: ProductCategory → Product → ProductInventory
3. **界面状态流程**: AppState → Component State → UI Render

## Mock数据文件结构

### 目录结构
```
mock/
├── data/
│   ├── products/
│   │   ├── product-list.json      # 产品列表数据
│   │   ├── product-categories.json # 产品分类数据
│   │   └── product-inventory.json # 产品库存数据
│   ├── users/
│   │   ├── user-list.json        # 用户列表数据
│   │   └── user-roles.json       # 用户角色数据
│   ├── navigation/
│   │   └── navigation-menu.json   # 导航菜单数据
│   └── dashboard/
│       └── dashboard-stats.json   # 仪表板统计数据
└── types/
    ├── index.ts                   # 类型定义导出
    └── mock-data-types.ts         # Mock数据类型
```

### 数据示例

#### product-list.json
```json
[
  {
    "id": "prod-001",
    "name": "3D眼镜标准版",
    "description": "影院专用3D眼镜，舒适佩戴，高清体验",
    "category": "equipments",
    "price": 15.00,
    "status": "active",
    "imageUrl": "/images/products/3d-glasses.jpg",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-12-10T08:20:00Z",
    "inventory": 500,
    "tags": ["3D", "眼镜", "标准"]
  },
  {
    "id": "prod-002",
    "name": "爆米花大份",
    "description": "香甜可口的影院爆米花，大份包装",
    "category": "food",
    "price": 25.00,
    "status": "active",
    "imageUrl": "/images/products/popcorn-large.jpg",
    "createdAt": "2024-01-20T14:15:00Z",
    "updatedAt": "2024-12-09T16:45:00Z",
    "inventory": 1000,
    "tags": ["爆米花", "食品", "大份"]
  }
]
```

#### navigation-menu.json
```json
[
  {
    "id": "nav-dashboard",
    "key": "dashboard",
    "title": "仪表板",
    "path": "/dashboard",
    "icon": "DashboardOutlined",
    "sortOrder": 1,
    "isVisible": true,
    "permissions": ["dashboard:read"]
  },
  {
    "id": "nav-products",
    "key": "products",
    "title": "商品管理",
    "icon": "ShoppingOutlined",
    "sortOrder": 2,
    "isVisible": true,
    "permissions": ["products:read"],
    "children": [
      {
        "id": "nav-products-list",
        "key": "products/list",
        "title": "商品列表",
        "path": "/products/list",
        "sortOrder": 1,
        "isVisible": true,
        "permissions": ["products:read"]
      },
      {
        "id": "nav-products-categories",
        "key": "products/categories",
        "title": "商品分类",
        "path": "/products/categories",
        "sortOrder": 2,
        "isVisible": true,
        "permissions": ["categories:read"]
      }
    ]
  }
]
```

## 数据验证规则

### 产品数据验证
```typescript
export const productValidationRules: FormRule[] = [
  { required: true, message: '产品名称不能为空' },
  { min: 2, max: 100, message: '产品名称长度在2-100字符之间' }
];

export const priceValidationRules: FormRule[] = [
  { required: true, message: '价格不能为空' },
  { min: 0, message: '价格不能为负数' }
];
```

### 用户数据验证
```typescript
export const emailValidationRules: FormRule[] = [
  { required: true, message: '邮箱不能为空' },
  {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  }
];
```

## 状态管理策略

### Zustand Store设计
```typescript
interface AppStore extends AppState {
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentPath: (path: string) => void;
  setBreadcrumb: (breadcrumb: BreadcrumbItem[]) => void;
  setGlobalLoading: (loading: boolean) => void;
  setTablePageSize: (size: number) => void;
}

interface ProductStore extends ProductState {
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setSearchKeyword: (keyword: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedRows: (rows: string[]) => void;
  setPagination: (pagination: Partial<{ current: number; pageSize: number; total: number }>) => void;
  setCreateModalVisible: (visible: boolean) => void;
  setEditModalVisible: (visible: boolean) => void;
}
```

## 结论

本文档定义了UI框架统一升级功能的完整数据模型，包括Mock数据结构、组件数据模型和状态管理模型。这些数据结构遵循TypeScript类型安全原则，为后续的组件开发和状态管理实现提供了清晰的规范基础。