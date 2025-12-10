/**
 * Mock数据相关类型定义
 */

import { MenuItem, RouteConfig } from './layout';

/** 商品管理数据接口 */
export interface ProductItem {
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

/** 定价中心数据接口 */
export interface PricingItem {
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

/** 审核管理数据接口 */
export interface ReviewItem {
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

/** 库存追溯数据接口 */
export interface InventoryItem {
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

/** Mock数据结构接口 */
export interface MockData {
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

/** API响应通用接口 */
export interface ApiResponse<T = any> {
  /** 响应码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: T;
}

/** 分页响应接口 */
export interface PaginatedResponse<T> {
  /** 响应码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 响应数据 */
  data: {
    /** 数据列表 */
    list: T[];
    /** 总数量 */
    total: number;
    /** 当前页码 */
    page: number;
    /** 每页大小 */
    pageSize: number;
  };
}