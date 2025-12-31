/**
 * @spec O003-beverage-order
 * 订单统计相关类型定义 (B端)
 */

/**
 * 时间范围
 */
export interface DateRangeDTO {
  startDate: string;
  endDate: string;
  rangeType: 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';
}

/**
 * 订单指标
 */
export interface OrderMetrics {
  /** 订单总数 */
  totalOrders: number;

  /** 已完成订单数 */
  completedOrders: number;

  /** 已取消订单数 */
  cancelledOrders: number;

  /** 完成率（百分比） */
  completionRate: number;

  /** 平均制作时长（分钟） */
  averagePreparationTime: number;
}

/**
 * 销售指标
 */
export interface SalesMetrics {
  /** 销售总额（元） */
  totalRevenue: number;

  /** 平均客单价（元） */
  averageOrderValue: number;

  /** 总销量（杯数） */
  totalQuantity: number;

  /** 最畅销饮品名称 */
  topSellingBeverage: string | null;

  /** 最畅销饮品销量 */
  topSellingQuantity: number | null;
}

/**
 * 热销商品项
 */
export interface BestSellingItem {
  /** 排名 */
  rank: number;

  /** 饮品ID */
  beverageId: string;

  /** 饮品名称 */
  beverageName: string;

  /** 销售数量 */
  quantity: number;

  /** 销售额（元） */
  revenue: number;

  /** 占比（百分比） */
  percentage: number;
}

/**
 * 订单统计数据
 */
export interface OrderStatisticsDTO {
  /** 时间范围 */
  dateRange: DateRangeDTO;

  /** 订单指标 */
  orderMetrics: OrderMetrics;

  /** 销售指标 */
  salesMetrics: SalesMetrics;

  /** 热销饮品排行 */
  bestSellingBeverages: BestSellingItem[];

  /** 门店ID（如果按门店筛选） */
  storeId?: string;
}
