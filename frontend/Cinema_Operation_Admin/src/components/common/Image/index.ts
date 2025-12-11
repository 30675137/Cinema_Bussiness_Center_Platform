/**
 * 优化图片组件库
 *
 * 提供性能优化的图片组件，支持自动格式转换和CDN优化
 */

// 主要组件
export { OptimizedImage, default as Image } from './OptimizedImage';

// 预设组件
export {
  ProductImage,
  ThumbnailImage,
  AvatarImage,
  BannerImage,
  ImagePresets,
} from './OptimizedImage';

// 类型定义
export type {
  OptimizedImageProps,
  ImageLoadingState,
} from './OptimizedImage';

/**
 * 使用指南：
 *
 * 1. 产品图片（高质量展示）：
 * ```tsx
 * import { ProductImage } from '@/components/common/Image';
 *
 * <ProductImage
 *   src="/images/products/popcorn.jpg"
 *   alt="爆米花套餐"
 *   width={400}
 *   height={300}
 *   onLoad={() => console.log('图片加载完成')}
 * />
 * ```
 *
 * 2. 缩略图（列表中的小图）：
 * ```tsx
 * import { ThumbnailImage } from '@/components/common/Image';
 *
 * <ThumbnailImage
 *   src="/images/thumbnails/drink.jpg"
 *   alt="饮料"
 *   width={80}
 *   height={80}
 *   placeholder="📦"
 * />
 * ```
 *
 * 3. 用户头像：
 * ```tsx
 * import { AvatarImage } from '@/components/common/Image';
 *
 * <AvatarImage
 *   src="/avatars/user123.jpg"
 *   alt="用户头像"
 *   width={48}
 *   height={48}
 *   style={{ borderRadius: '50%' }}
 * />
 * ```
 *
 * 4. 横幅大图：
 * ```tsx
 * import { BannerImage } from '@/components/common/Image';
 *
 * <BannerImage
 *   src="/banners/cinema-hero.jpg"
 *   alt="影院横幅"
 *   width={1200}
 *   height={400}
 *   lazy={true}
 *   breakpoints={{
 *     sm: '768w',
 *     md: '992w',
 *     lg: '1200w'
 *   }}
 * />
 * ```
 *
 * 5. 自定义配置：
 * ```tsx
 * import { OptimizedImage } from '@/components/common/Image';
 *
 * <OptimizedImage
 *   src="/images/promotion.jpg"
 *   alt="促销活动"
 *   width={300}
 *   height={200}
 *   lazy={true}
 *   formatPriority={['webp', 'avif', 'jpeg']}
 *   quality={90}
 *   cdn={{
 *     enabled: true,
 *     baseUrl: 'https://cdn.example.com',
 *     params: {
 *       auto: 'compress,format',
 *       fit: 'cover'
 *     }
 *   }}
 *   performanceMonitoring={process.env.NODE_ENV === 'development'}
 *   onError={(error) => console.error('图片加载失败:', error)}
 *   onLoad={(event) => console.log('图片加载成功:', event)}
 * />
 * ```
 *
 * 性能优化特性：
 * - **自动格式转换**：优先使用WebP/AVIF等现代格式，减少文件大小
 * - **懒加载**：使用Intersection Observer实现视口懒加载
 * - **CDN集成**：支持主流CDN服务，自动优化图片尺寸和质量
 * - **渐进式加载**：优雅的骨架屏和占位符，提升用户体验
 * - **响应式支持**：自动生成不同断点的图片源
 * - **性能监控**：实时跟踪图片加载性能和错误率
 * - **错误降级**：WebP加载失败时自动回退到原格式
 * - **缓存优化**：检测结果的智能缓存，避免重复检测
 *
 * CDN配置示例：
 * ```tsx
 * // Cloudinary配置
 * cdn={{
 *   enabled: true,
 *   baseUrl: 'https://res.cloudinary.com/demo',
 *   params: { auto: 'compress,format' }
 * }}
 *
 * // 阿里云OSS配置
 * cdn={{
 *   enabled: true,
 *   baseUrl: 'https://bucket.oss-cn-hangzhou.aliyuncs.com',
 *   params: { x-oss-process: 'image/format,webp' }
 * }}
 *
 * // 腾讯云COS配置
 * cdn={{
 *   enabled: true,
 *   baseUrl: 'https://bucket-1250000000.cos.ap-guangzhou.myqcloud.com',
 *   params: { 'imageMogr2/format/webp' }
 * }}
 * ```
 *
 * 最佳实践：
 * - 为产品图片使用90%以上的高质量
 * - 缩略图使用75-85%的压缩质量以平衡性能
 * - 头像图片使用PNG格式以保持透明度
 * - 启用懒加载减少初始页面加载时间
 * - 为大尺寸图片设置合适的breakpoints
 * - 在生产环境启用CDN优化
 * - 使用performanceMonitoring监控加载性能
 */