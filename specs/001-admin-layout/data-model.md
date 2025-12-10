# Data Model: 管理后台基础框架

**Date**: 2025-12-10
**Feature**: 管理后台基础框架
**Status**: Final

## 数据实体模型

### 1. 导航菜单项 (MenuItem)

```typescript
interface MenuItem {
  /** 菜单项唯一标识 */
  id: string;
  /** 菜单显示标题 */
  title: string;
  /** 菜单图标（Ant Design图标名称） */
  icon: string;
  /** 路由路径 */
  path: string;
  /** 子菜单项 */
  children?: MenuItem[];
  /** 权限标识（为未来扩展保留的数据结构） */
  permissions?: string[];
  /** 是否在菜单中显示 */
  visible: boolean;
  /** 菜单排序 */
  order: number;
  /** 菜单分组 */
  group?: string;
}
```

### 2. 面包屑节点 (BreadcrumbItem)

```typescript
interface BreadcrumbItem {
  /** 面包屑节点标题 */
  title: string;
  /** 导航路径 */
  path: string;
  /** 是否为当前页面 */
  current: boolean;
}
```

### 3. 页面路由配置 (RouteConfig)

```typescript
interface RouteConfig {
  /** 路由唯一标识 */
  id: string;
  /** 路由路径 */
  path: string;
  /** 页面组件标识 */
  component: string;
  /** 页面标题 */
  title: string;
  /** 父级路由ID */
  parentId?: string;
  /** 路由元数据 */
  meta: {
    /** 是否在菜单中显示 */
    hideInMenu?: boolean;
    /** 页面图标 */
    icon?: string;
    /** 权限要求 */
    permissions?: string[];
    /** 面包屑标题 */
    breadcrumbTitle?: string;
  };
}
```

### 4. 布局状态 (LayoutState)

```typescript
interface LayoutState {
  /** 侧边栏折叠状态 */
  sidebarCollapsed: boolean;
  /** 当前选中的菜单项 */
  selectedMenuKeys: string[];
  /** 当前展开的菜单项 */
  openMenuKeys: string[];
  /** 当前面包屑路径 */
  breadcrumbs: BreadcrumbItem[];
  /** 主题模式 */
  theme: 'light' | 'dark';
  /** 屏幕尺寸断点 */
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
}
```

### 5. Mock数据结构 (MockData)

```typescript
interface MockData {
  /** 菜单配置数据 */
  menus: MenuItem[];
  /** 路由配置数据 */
  routes: RouteConfig[];
  /** 页面表格数据 */
  pageData: {
    /** 商品管理页面数据 */
    products: ProductItem[];
    /** 定价中心页面数据 */
    pricing: PricingItem[];
    /** 审核管理页面数据 */
    reviews: ReviewItem[];
    /** 库存追溯页面数据 */
    inventory: InventoryItem[];
  };
}
```

### 6. 业务数据实体

#### 商品管理数据 (ProductItem)
```typescript
interface ProductItem {
  /** 商品ID */
  id: string;
  /** 商品名称 */
  name: string;
  /** 商品编码 */
  sku: string;
  /** 商品分类 */
  category: string;
  /** 商品状态 */
  status: 'active' | 'inactive' | 'pending';
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}
```

#### 定价中心数据 (PricingItem)
```typescript
interface PricingItem {
  /** 定价规则ID */
  id: string;
  /** 规则名称 */
  name: string;
  /** 商品SKU */
  sku: string;
  /** 价格类型 */
  priceType: 'regular' | 'promotion' | 'member';
  /** 价格金额 */
  amount: number;
  /** 生效时间 */
  effectiveDate: string;
  /** 过期时间 */
  expiryDate: string;
  /** 状态 */
  status: 'active' | 'inactive' | 'pending';
}
```

#### 审核管理数据 (ReviewItem)
```typescript
interface ReviewItem {
  /** 审核记录ID */
  id: string;
  /** 审核类型 */
  type: 'product' | 'pricing' | 'inventory';
  /** 审核对象ID */
  targetId: string;
  /** 审核标题 */
  title: string;
  /** 申请人 */
  applicant: string;
  /** 申请时间 */
  applyTime: string;
  /** 审核状态 */
  status: 'pending' | 'approved' | 'rejected';
  /** 审核人 */
  reviewer?: string;
  /** 审核时间 */
  reviewTime?: string;
  /** 审核意见 */
  comment?: string;
}
```

#### 库存追溯数据 (InventoryItem)
```typescript
interface InventoryItem {
  /** 库存记录ID */
  id: string;
  /** 商品SKU */
  sku: string;
  /** 商品名称 */
  productName: string;
  /** 仓库位置 */
  location: string;
  /** 当前库存数量 */
  quantity: number;
  /** 操作类型 */
  operation: 'in' | 'out' | 'adjust';
  /** 操作数量 */
  operationQty: number;
  /** 操作时间 */
  operationTime: string;
  /** 操作人 */
  operator: string;
  /** 备注说明 */
  remark?: string;
}
```

## 数据关系图

```
MenuItem (菜单项)
    ├── children: MenuItem[] (子菜单)
    ├── permissions: string[] (权限标识)
    └── path (路由路径)

RouteConfig (路由配置)
    ├── parentId (父路由)
    ├── component (页面组件)
    └── meta.permissions (权限要求)

LayoutState (布局状态)
    ├── selectedMenuKeys (当前菜单)
    ├── openMenuKeys (展开菜单)
    └── breadcrumbs (面包屑)

MockData (Mock数据)
    ├── menus: MenuItem[] (菜单数据)
    ├── routes: RouteConfig[] (路由数据)
    └── pageData (页面数据)
        ├── products: ProductItem[]
        ├── pricing: PricingItem[]
        ├── reviews: ReviewItem[]
        └── inventory: InventoryItem[]
```

## 验证规则

### MenuItem 验证规则
- `id`: 必填，唯一标识
- `title`: 必填，最大长度50字符
- `path`: 必填，必须以'/'开头
- `order`: 必填，非负整数
- `visible`: 必填，布尔值

### RouteConfig 验证规则
- `id`: 必填，唯一标识
- `path`: 必填，有效的路由路径格式
- `component`: 必填，有效的组件标识符
- `title`: 必填，最大长度100字符

### LayoutState 验证规则
- `selectedMenuKeys`: 字符串数组，默认为空数组
- `openMenuKeys`: 字符串数组，默认为空数组
- `sidebarCollapsed`: 布尔值，默认false

### 业务数据验证规则
- 所有实体的`id`: 必填，唯一标识
- 所有时间字段: 必填，ISO 8601格式
- 所有状态字段: 必填，在预定义枚举值范围内

## 状态转换

### 布局状态转换
```typescript
// 侧边栏折叠状态切换
type SidebarToggle = {
  type: 'TOGGLE_SIDEBAR';
  payload: boolean;
};

// 菜单选择变更
type MenuSelect = {
  type: 'SELECT_MENU';
  payload: string[];
};

// 面包屑更新
type BreadcrumbUpdate = {
  type: 'UPDATE_BREADCRUMB';
  payload: BreadcrumbItem[];
};
```

### 业务数据状态转换
```typescript
// 商品状态转换
type ProductStatusTransition =
  | 'pending' -> 'active'
  | 'active' -> 'inactive'
  | 'inactive' -> 'active';

// 审核状态转换
type ReviewStatusTransition =
  | 'pending' -> 'approved'
  | 'pending' -> 'rejected';
```

## Mock数据示例

```typescript
const mockMenuData: MenuItem[] = [
  {
    id: 'dashboard',
    title: '仪表盘',
    icon: 'DashboardOutlined',
    path: '/dashboard',
    visible: true,
    order: 1
  },
  {
    id: 'product',
    title: '商品管理',
    icon: 'ShopOutlined',
    path: '/product',
    visible: true,
    order: 2,
    children: [
      {
        id: 'product-list',
        title: '商品列表',
        icon: 'UnorderedListOutlined',
        path: '/product/list',
        visible: true,
        order: 1
      }
    ]
  }
];

const mockProducts: ProductItem[] = [
  {
    id: '1',
    name: '电影票-成人票',
    sku: 'TICKET-ADULT-001',
    category: '电影票',
    status: 'active',
    createdAt: '2025-12-10T10:00:00Z',
    updatedAt: '2025-12-10T10:00:00Z'
  }
];
```

## 数据持久化策略

### 本地存储 (LocalStorage)
- `layout-state`: 布局状态持久化
- `user-preferences`: 用户偏好设置

### 内存状态 (State Management)
- `menu-config`: 菜单配置（从mock加载）
- `route-config`: 路由配置（从mock加载）
- `page-data`: 页面数据（从mock加载）

### 数据加载策略
1. 应用启动时从mock文件加载基础配置
2. 布局状态变更时实时保存到localStorage
3. 页面数据在组件挂载时从mock加载
4. 错误处理：mock数据加载失败时显示降级内容

## 扩展性设计

### 权限扩展
- MenuItem和RouteConfig中的`permissions`字段为权限控制预留
- 当前仅作为数据结构，不实现实际权限验证

### 国际化扩展
- 所有`title`字段支持未来多语言扩展
- 当前使用中文硬编码值

### 主题扩展
- LayoutState支持light/dark主题切换
- 可扩展更多主题配置选项