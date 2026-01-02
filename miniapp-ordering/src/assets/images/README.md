/**
 * @spec O006-miniapp-channel-order
 * 图片资源组织规范
 */

# 图片资源目录结构

## 目录说明

### `icons/`
存放通用图标资源（如导航图标、状态图标、功能图标）

**命名规范**: `{功能}-{名称}-{状态?}.{扩展名}`
- 示例: `nav-home.png`, `nav-cart.png`, `icon-search.png`

### `placeholders/`
存放占位图和默认图片

**文件清单**:
- `product-placeholder.png` - 商品默认占位图（340x340rpx）
- `avatar-placeholder.png` - 用户头像占位图（可选）
- `empty-cart.png` - 空购物车状态图（可选）
- `empty-order.png` - 空订单状态图（可选）

### `categories/`
存放商品分类图标

**命名规范**: `category-{分类名}.{扩展名}`
- 示例: `category-beverage.png`, `category-snack.png`

### `orders/`
存放订单相关图标和状态图

**命名规范**: `order-{状态}-{名称?}.{扩展名}`
- 示例: `order-pending.png`, `order-success.png`

## 图片规格要求

| 用途 | 尺寸（rpx） | 格式 | 备注 |
|-----|-----------|------|------|
| 商品主图 | 340x340 | PNG/WebP | 需压缩优化 |
| 商品缩略图 | 120x120 | PNG/WebP | 列表使用 |
| 分类图标 | 80x80 | PNG | 透明背景 |
| 导航图标 | 48x48 | PNG | 透明背景 |
| 状态图标 | 32x32 | PNG | 透明背景 |
| 占位图 | 按实际尺寸 | PNG | 灰色背景 |

## 图片优化建议

1. **使用 WebP 格式**（小程序支持）- 文件体积减少 30%
2. **压缩工具**: TinyPNG, ImageOptim
3. **懒加载**: 商品列表图片使用懒加载
4. **CDN 加载**: 生产环境优先使用 CDN URL

## 远程图片加载

**从后端 API 获取的图片**:
```typescript
// 商品主图
product.imageUrl // 从 ChannelProductDTO 获取
product.images   // 商品图片数组

// 加载示例
<Image
  src={product.imageUrl || require('@/assets/images/placeholders/product-placeholder.png')}
  mode="aspectFill"
  lazyLoad
/>
```

## 微信小程序图片域名白名单

**生产环境需要配置**:
- 在微信小程序后台配置 `downloadFile` 合法域名
- 支持 HTTPS 协议
- 示例: `https://cdn.example.com`

---

**最后更新**: 2026-01-02
**维护者**: Cinema Business Center Platform Team
