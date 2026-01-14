/**
 * @spec D002-process-flow-map
 * 流程阶段配置
 */
import type { ProcessStage } from '@/types/view';

export const PROCESS_STAGES: ProcessStage[] = [
  {
    id: 'foundation',
    order: 1,
    title: '基础建设',
    subtitle: '数据初始化',
    moduleIds: ['basic-settings', 'system'],
    color: '#1890ff',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'supply',
    order: 2,
    title: '供应生产',
    subtitle: '物料与成本',
    moduleIds: ['products', 'bom', 'procurement', 'inventory'],
    color: '#52c41a',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'marketing',
    order: 3,
    title: '营销发布',
    subtitle: '定价与档期',
    moduleIds: ['pricing', 'packages', 'scheduling', 'channels'],
    color: '#faad14',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'transaction',
    order: 4,
    title: '交易履约',
    subtitle: '订单处理',
    moduleIds: ['orders'],
    color: '#f5222d',
    collapsible: true,
    defaultCollapsed: false,
  },
  {
    id: 'insight',
    order: 5,
    title: '经营洞察',
    subtitle: '分析与结算',
    moduleIds: ['reports'],
    color: '#722ed1',
    collapsible: true,
    defaultCollapsed: false,
  },
];
