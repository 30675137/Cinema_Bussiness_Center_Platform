/**
 * P004-inventory-adjustment: 分页工具
 *
 * 提供大列表的分页功能和优化配置。
 * 实现 T066 任务。
 *
 * @since Phase 8 - Polish
 */

import type { TablePaginationConfig } from 'antd';

/**
 * 默认分页配置
 */
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = ['10', '20', '50', '100'];

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 创建 Ant Design Table 分页配置
 */
export function createTablePagination(options: {
  current: number;
  pageSize: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}): TablePaginationConfig {
  const {
    current,
    pageSize,
    total,
    onChange,
    showSizeChanger = true,
    showQuickJumper = true,
    showTotal = true,
  } = options;

  return {
    current,
    pageSize,
    total,
    showSizeChanger,
    showQuickJumper,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    showTotal: showTotal
      ? (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
      : undefined,
    onChange: (page, size) => {
      onChange?.(page, size);
    },
  };
}

/**
 * 计算分页偏移量
 */
export function calculateOffset(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

/**
 * 计算总页数
 */
export function calculateTotalPages(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize);
}

/**
 * 验证页码是否有效
 */
export function isValidPage(page: number, total: number, pageSize: number): boolean {
  if (page < 1) return false;
  const totalPages = calculateTotalPages(total, pageSize);
  return page <= totalPages || (totalPages === 0 && page === 1);
}

/**
 * 规范化页码
 */
export function normalizePage(page: number, total: number, pageSize: number): number {
  if (page < 1) return 1;
  const totalPages = calculateTotalPages(total, pageSize);
  if (totalPages === 0) return 1;
  return Math.min(page, totalPages);
}

/**
 * 分页 URL 参数工具
 */
export const paginationUrlParams = {
  /**
   * 从 URL 查询参数解析分页参数
   */
  parse(searchParams: URLSearchParams): PaginationParams {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10);

    return {
      page: isNaN(page) || page < 1 ? 1 : page,
      pageSize: PAGE_SIZE_OPTIONS.includes(String(pageSize)) ? pageSize : DEFAULT_PAGE_SIZE,
    };
  },

  /**
   * 生成分页 URL 参数
   */
  stringify(params: PaginationParams): string {
    const searchParams = new URLSearchParams();
    if (params.page > 1) {
      searchParams.set('page', String(params.page));
    }
    if (params.pageSize !== DEFAULT_PAGE_SIZE) {
      searchParams.set('pageSize', String(params.pageSize));
    }
    return searchParams.toString();
  },
};

/**
 * 列表虚拟化配置（用于超大列表）
 */
export const virtualListConfig = {
  /** 启用虚拟滚动的最小行数 */
  minRowsForVirtual: 100,

  /** 虚拟列表项高度 */
  itemHeight: 54,

  /** 预渲染的额外行数 */
  overscan: 5,

  /**
   * 判断是否应该启用虚拟滚动
   */
  shouldUseVirtual(totalRows: number): boolean {
    return totalRows >= this.minRowsForVirtual;
  },
};

export default {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  createTablePagination,
  calculateOffset,
  calculateTotalPages,
  isValidPage,
  normalizePage,
  paginationUrlParams,
  virtualListConfig,
};
