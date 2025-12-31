/**
 * 优化Modal组件库
 *
 * 提供性能优化的Modal组件，支持destroyOnClose和内存管理
 */

// 主要组件
export { OptimizedModal, default as Modal } from './OptimizedModal';

// 预设组件
export {
  FormModal,
  ConfirmModal,
  LargeModal,
  FullScreenModal,
  ModalPresets,
} from './OptimizedModal';

// 类型定义
export type { OptimizedModalProps } from './OptimizedModal';

/**
 * 使用指南：
 *
 * 1. 基础使用（自动启用destroyOnClose）：
 * ```tsx
 * import { Modal } from '@/components/common/Modal';
 *
 * <Modal title="标题" open={visible} onOk={handleOk} onCancel={handleCancel}>
 *   内容
 * </Modal>
 * ```
 *
 * 2. 表单Modal（预设配置）：
 * ```tsx
 * import { FormModal } from '@/components/common/Modal';
 *
 * <FormModal title="表单" open={visible} onOk={handleSubmit}>
 *   <ComplexForm />
 * </FormModal>
 * ```
 *
 * 3. 大型内容Modal：
 * ```tsx
 * import { LargeModal } from '@/components/common/Modal';
 *
 * <LargeModal title="详情" open={visible}>
 *   {largeContent}
 * </LargeModal>
 * ```
 *
 * 4. 性能监控版本：
 * ```tsx
 * import { OptimizedModal } from '@/components/common/Modal';
 *
 * <OptimizedModal
 *   title="性能监控"
 *   open={visible}
 *   performanceMonitoring={true}
 *   memoryOptimization={true}
 *   onContentChange={(content) => console.log('内容变化:', content)}
 * >
 *   {dynamicContent}
 * </OptimizedModal>
 * ```
 *
 * 性能优化特性：
 * - 默认启用destroyOnClose，关闭时销毁子组件节省内存
 * - 性能监控，实时跟踪渲染性能
 * - 内存优化，延迟清理和垃圾回收提示
 * - 滚动位置重置，提供一致的用户体验
 * - 内容变化监控，支持动态内容更新
 * - 多种预设配置，满足不同使用场景
 */
