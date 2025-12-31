/**
 * @spec O003-beverage-order
 * 订单统计查询 Hook (B端)
 */
import { useQuery } from '@tanstack/react-query';
import { orderStatisticsApi } from '../services/orderStatisticsApi';
import type { OrderStatisticsDTO } from '../types/statistics';

/**
 * 订单统计查询参数
 */
interface UseOrderStatisticsParams {
  /**
   * 门店ID（可选，不传则查询所有门店）
   */
  storeId?: string;

  /**
   * 时间范围类型
   * - TODAY: 今日
   * - WEEK: 本周（最近7天）
   * - MONTH: 本月（最近30天）
   * - CUSTOM: 自定义时间范围
   */
  rangeType?: 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';

  /**
   * 自定义起始日期（rangeType=CUSTOM时必填）
   */
  startDate?: string;

  /**
   * 自定义截止日期（rangeType=CUSTOM时必填）
   */
  endDate?: string;

  /**
   * 是否启用查询
   */
  enabled?: boolean;
}

/**
 * 订单统计查询 Hook
 *
 * US3: FR-022
 * B端管理员查看营业统计（今日/本周/本月订单数量、销售额、热销饮品排行）
 *
 * @param params 查询参数
 * @returns TanStack Query result
 */
export const useOrderStatistics = (params: UseOrderStatisticsParams = {}) => {
  const { storeId, rangeType = 'TODAY', startDate, endDate, enabled = true } = params;

  return useQuery<OrderStatisticsDTO>({
    queryKey: ['orderStatistics', storeId, rangeType, startDate, endDate],
    queryFn: async () => {
      // 验证自定义时间范围参数
      if (rangeType === 'CUSTOM' && (!startDate || !endDate)) {
        throw new Error('自定义时间范围需要提供起始日期和截止日期');
      }

      const response = await orderStatisticsApi.getStatistics({
        storeId,
        rangeType,
        startDate,
        endDate,
      });

      return response;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2分钟内认为数据新鲜
    gcTime: 10 * 60 * 1000, // 10分钟后清理缓存
  });
};

/**
 * 导出报表下载 Hook
 *
 * US3: FR-023
 * B端管理员导出报表（Excel格式）
 *
 * @returns 下载报表的函数
 */
export const useExportReport = () => {
  const exportReport = async (params: { storeId?: string; startDate: string; endDate: string }) => {
    try {
      const blob = await orderStatisticsApi.exportReport(params);

      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `销售报表_${params.startDate}_${params.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('导出报表失败:', error);
      throw error;
    }
  };

  return { exportReport };
};
