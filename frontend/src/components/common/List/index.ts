/**
 * 优化List组件库
 *
 * 提供性能优化的List组件，支持虚拟滚动和智能分页
 */

// 主要组件
export { OptimizedList, default as List } from './OptimizedList';

// 预设组件
export { StandardList, LargeList, CardList, ListPresets } from './OptimizedList';

// 类型定义
export type {
  OptimizedListProps,
  VirtualScrollConfig,
  PaginationConfig,
  PerformanceConfig,
} from './OptimizedList';

/**
 * 使用指南：
 *
 * 1. 标准列表（适用于一般场景）：
 * ```tsx
 * import { StandardList } from '@/components/common/List';
 *
 * <StandardList
 *   dataSource={products}
 *   renderItem={(item, index) => (
 *     <List.Item key={item.id}>
 *       <Card title={item.name}>
 *         {item.description}
 *       </Card>
 *     </List.Item>
 *   )}
 * />
 * ```
 *
 * 2. 大数据列表（启用虚拟滚动）：
 * ```tsx
 * import { LargeList } from '@/components/common/List';
 *
 * <LargeList
 *   dataSource={largeData}
 *   renderItem={(item, index) => (
 *     <List.Item key={item.id}>
 *       <HeavyComponent data={item} />
 *     </List.Item>
 *   )}
 *   pagination={{
 *     enabled: true,
 *     pageSize: 50,
 *     showQuickJumper: true,
 *   }}
 * />
 * ```
 *
 * 3. 卡片列表（适用于网格布局）：
 * ```tsx
 * import { CardList } from '@/components/common/List';
 *
 * <CardList
 *   dataSource={cards}
 *   renderItem={(item, index) => (
 *     <Card
 *       key={item.id}
 *       hoverable
 *       cover={<img src={item.image} alt={item.title} />}
 *     >
 *       <Card.Meta title={item.title} description={item.description} />
 *     </Card>
 *   )}
 * />
 * ```
 *
 * 4. 自定义配置：
 * ```tsx
 * import { OptimizedList } from '@/components/common/List';
 *
 * <OptimizedList
 *   dataSource={data}
 *   renderItem={(item, index) => <CustomItem item={item} />}
 *   pagination={{
 *     enabled: true,
 *     pageSize: 20,
 *     showSizeChanger: true,
 *     onChange: (page, size) => console.log('分页变化:', { page, size })
 *   }}
 *   performance={{
 *     enabled: true,
 *     virtualScroll: {
 *       enabled: data.length > 100,
 *       itemHeight: 80,
 *       bufferSize: 5,
 *       overscan: 3,
 *     },
 *     renderThreshold: 16,
 *     logRerenders: true,
 *   }}
 *   itemKey={(item) => item.id}
 *   header={<div>列表头部操作</div>}
 *   footer={<div>列表底部信息</div>}
 * />
 * ```
 *
 * 性能优化特性：
 * - 虚拟滚动：支持大数据集高效渲染，只渲染可见区域
 * - 智能分页：内存友好，支持动态页大小和快速跳转
 * - React.memo：自动优化子组件重渲染
 * - 性能监控：实时跟踪渲染性能和内存使用
 * - 懒加载：按需加载和预加载策略
 * - 键值优化：智能键值生成策略
 * - 滚动优化：节流和位置缓存
 *
 * 最佳实践：
 * - 数据量 > 50 时启用虚拟滚动
 * - 复杂列表项使用React.memo
 * - 合理设置页大小（10-100）
 * - 为列表项提供唯一稳定的key
 * - 在开发环境启用性能监控
 * - 根据内容类型选择合适的项目高度
 */
