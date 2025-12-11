# 影院商品管理中台性能优化指南

本文档提供了影院商品管理中台性能优化的最佳实践、工具和策略。

## 📋 目录

- [性能监控工具](#性能监控工具)
- [组件优化策略](#组件优化策略)
- [图片优化指南](#图片优化指南)
- [代码分割与懒加载](#代码分割与懒加载)
- [内存管理](#内存管理)
- [构建优化](#构建优化)
- [CDN与静态资源](#cdn与静态资源)
- [性能测试与监控](#性能测试与监控)

## 🔧 性能监控工具

### 1. usePerformance Hook

用于实时监控组件渲染性能的Hook。

```tsx
import { usePerformance } from '@/hooks/usePerformance';

const MyComponent = () => {
  const { metrics, startMeasure, endMeasure } = usePerformance({
    enabled: true,                    // 启用性能监控
    componentName: 'MyComponent',     // 组件名称
    renderThreshold: 16,             // 渲染阈值（毫秒）
    logRerenders: true,              // 记录重渲染
    trackMemory: true,               // 跟踪内存使用
  });

  // 手动测量
  const handleExpensiveOperation = () => {
    startMeasure('operation');
    // 执行耗时操作
    endMeasure('operation');
  };

  return <div>{/* 组件内容 */}</div>;
};
```

**性能指标说明：**
- `renderCount`: 渲染次数
- `lastRenderTime`: 最后一次渲染时间（毫秒）
- `averageRenderTime`: 平均渲染时间
- `maxRenderTime`: 最长渲染时间
- `memoryUsage`: 内存使用情况

### 2. 包大小分析工具

使用 `npm run analyze:bundle` 分析打包文件大小：

```bash
cd frontend/Cinema_Operation_Admin
npm run analyze:bundle
```

**分析报告包含：**
- 总包大小和压缩后大小
- 各文件类型分布
- 最大文件列表
- 优化建议

## 🚀 组件优化策略

### 1. React.memo 优化

为纯组件添加React.memo避免不必要的重渲染：

```tsx
import React from 'react';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
}

const ProductCard = React.memo<ProductCardProps>(({ product, onEdit }) => {
  return (
    <Card>
      <h3>{product.name}</h3>
      <button onClick={() => onEdit(product)}>编辑</button>
    </Card>
  );
});

ProductCard.displayName = 'ProductCard';
```

### 2. useMemo 和 useCallback 优化

缓存计算结果和事件处理函数：

```tsx
import React, { useMemo, useCallback } from 'react';

const ProductList = ({ products, filters }) => {
  // 缓存过滤后的产品列表
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.includes(filters.search) &&
      product.category === filters.category
    );
  }, [products, filters]);

  // 缓存事件处理函数
  const handleEdit = useCallback((product) => {
    console.log('编辑产品:', product);
  }, []);

  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
};
```

### 3. 优化的Modal组件

使用OptimizedModal替代原生Modal：

```tsx
import { FormModal } from '@/components/common/Modal';

const ProductForm = ({ visible, onSave, onCancel }) => {
  return (
    <FormModal
      title="产品信息"
      open={visible}
      onOk={onSave}
      onCancel={onCancel}
      performanceMonitoring={process.env.NODE_ENV === 'development'}
      memoryOptimization={true}
      destroyOnClose={true}
    >
      <Form>{/* 表单内容 */}</Form>
    </FormModal>
  );
};
```

### 4. 虚拟滚动List组件

处理大数据集时使用OptimizedList：

```tsx
import { LargeList } from '@/components/common/List';

const ProductTable = ({ products }) => {
  return (
    <LargeList
      dataSource={products}
      renderItem={(product, index) => (
        <List.Item key={product.id}>
          <ProductCard product={product} />
        </List.Item>
      )}
      pagination={{
        enabled: true,
        pageSize: 50,
        showQuickJumper: true,
      }}
      performance={{
        virtualScroll: {
          enabled: true,
          itemHeight: 120,
          bufferSize: 5,
          overscan: 3,
        },
        enabled: true,
      }}
    />
  );
};
```

## 🖼️ 图片优化指南

### 1. 使用OptimizedImage组件

```tsx
import { ProductImage, ThumbnailImage, AvatarImage } from '@/components/common/Image';

// 产品图片
<ProductImage
  src="/images/products/popcorn.jpg"
  alt="爆米花套餐"
  width={400}
  height={300}
  cdn={{
    enabled: true,
    baseUrl: 'https://cdn.example.com',
    params: { auto: 'compress,format' }
  }}
/>

// 缩略图
<ThumbnailImage
  src="/images/thumbnails/drink.jpg"
  alt="饮料"
  width={80}
  height={80}
/>

// 用户头像
<AvatarImage
  src="/avatars/user123.jpg"
  alt="用户头像"
  width={48}
  height={48}
/>
```

### 2. 图片格式优化

- **WebP**: 比JPEG小25-35%，比PNG小80%
- **AVIF**: 比WebP还要小20%
- **渐进式JPEG**: 提供更好的加载体验

### 3. 响应式图片

```tsx
<BannerImage
  src="/banners/cinema-hero.jpg"
  alt="影院横幅"
  breakpoints={{
    sm: '768w',
    md: '992w',
    lg: '1200w',
    xl: '1600w'
  }}
/>
```

## 📦 代码分割与懒加载

### 1. 路由级代码分割

```tsx
import { lazy, Suspense } from 'react';

const ProductList = lazy(() => import('./pages/ProductList'));
const PricingList = lazy(() => import('./pages/PricingList'));

const App = () => (
  <Router>
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        <Route path="/products" element={<ProductList />} />
        <Route path="/pricing" element={<PricingList />} />
      </Routes>
    </Suspense>
  </Router>
);
```

### 2. 组件级懒加载

```tsx
import { LazyWrapper, createLazyComponent } from '@/components/lazy';

const LazyChart = createLazyComponent(
  () => import('./components/HeavyChart'),
  LazyConfigPresets.chart
);

const Dashboard = () => (
  <div>
    <LazyChart />
  </div>
);
```

### 3. 动态导入

```tsx
const loadModule = async () => {
  const module = await import('./utils/heavyUtils');
  module.heavyFunction();
};
```

## 🧠 内存管理

### 1. 组件卸载清理

```tsx
import { useEffect } from 'react';

const DataTable = ({ data }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      // 定时任务
    }, 1000);

    // 清理函数
    return () => {
      clearInterval(interval);
    };
  }, []);

  return <table>{/* 表格内容 */}</table>;
};
```

### 2. 避免内存泄漏

- 移除事件监听器
- 清理定时器和动画
- 取消未完成的网络请求
- 清理观察者（IntersectionObserver等）

### 3. Modal的destroyOnClose

```tsx
<Modal
  title="编辑产品"
  open={visible}
  onOk={handleOk}
  onCancel={handleCancel}
  destroyOnClose={true}  // 关闭时销毁子组件
>
  <HeavyForm />
</Modal>
```

## ⚙️ 构建优化

### 1. Vite配置优化

```tsx
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd'],
          charts: ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd'],
  },
});
```

### 2. Tree Shaking

```tsx
// 避免全量导入
import { Button, Table } from 'antd';  // ✅ 好
// import * as Antd from 'antd';       // ❌ 差

// 按需导入图标
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
```

### 3. 生产构建

```bash
# 生产构建
npm run build

# 分析构建结果
npm run analyze:bundle

# 构建分析报告会保存在 bundle-analysis-report.json
```

## 🌐 CDN与静态资源

### 1. CDN配置

```tsx
// 图片CDN
<ProductImage
  src="/images/product.jpg"
  cdn={{
    enabled: true,
    baseUrl: 'https://cdn.example.com',
    params: {
      auto: 'compress,format',
      quality: 85
    }
  }}
/>
```

### 2. 静态资源优化

- 压缩CSS和JavaScript
- 启用Gzip/Brotli压缩
- 设置合适的缓存策略
- 使用CDN加速

### 3. 字体优化

```css
/* 使用现代字体格式 */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2'),
       url('/fonts/custom.woff') format('woff');
  font-display: swap;  /* 字体交换策略 */
}
```

## 📊 性能测试与监控

### 1. 关键性能指标

- **FCP** (First Contentful Paint): 首次内容绘制时间
- **LCP** (Largest Contentful Paint): 最大内容绘制时间
- **FID** (First Input Delay): 首次输入延迟
- **CLS** (Cumulative Layout Shift): 累积布局偏移
- **TTI** (Time to Interactive): 可交互时间

### 2. 性能测试工具

```bash
# Lighthouse性能审计
npm install -g lighthouse
lighthouse http://localhost:5173 --view

# WebPageTest在线测试
# 访问 https://webpagetest.org/
```

### 3. 性能监控仪表板

```tsx
import { usePerformanceAnalysis } from '@/hooks/usePerformance';

const PerformanceDashboard = () => {
  const { metrics, analysis } = usePerformanceAnalysis({
    enabled: true,
    componentName: 'Dashboard'
  });

  return (
    <div>
      <h3>性能指标</h3>
      <p>渲染次数: {metrics.renderCount}</p>
      <p>平均渲染时间: {metrics.averageRenderTime.toFixed(2)}ms</p>
      <p>性能等级: {analysis.performanceGrade}</p>
      <div>
        {analysis.recommendations.map((rec, index) => (
          <div key={index}>{rec}</div>
        ))}
      </div>
    </div>
  );
};
```

## 🎯 性能优化检查清单

### 开发阶段

- [ ] 启用React严格模式
- [ ] 使用TypeScript严格模式
- [ ] 配置ESLint性能规则
- [ ] 组件添加displayName
- [ ] 使用usePerformance Hook监控

### 代码优化

- [ ] 纯组件使用React.memo
- [ ] 复杂计算使用useMemo
- [ ] 事件处理函数使用useCallback
- [ ] 避免内联对象和函数
- [ ] 合理使用useEffect

### 组件优化

- [ ] 大列表使用虚拟滚动
- [ ] Modal组件使用destroyOnClose
- [ ] 图片使用OptimizedImage组件
- [ ] 表格组件优化渲染性能

### 资源优化

- [ ] 图片压缩和格式转换
- [ ] 使用WebP格式
- [ ] 实现懒加载策略
- [ ] 配置CDN加速

### 构建优化

- [ ] 启用代码分割
- [ ] 配置Tree Shaking
- [ ] 优化打包配置
- [ ] 分析包大小

### 监控与测试

- [ ] 性能基准测试
- [ ] 包大小分析
- [ ] 内存泄漏检查
- [ ] 长期性能监控

## 🚨 常见性能问题

### 1. 过度重渲染

**问题**: 组件频繁重渲染导致性能下降
**解决**: 使用React.memo、useMemo、useCallback

```tsx
// ❌ 问题代码
const Parent = ({ data }) => {
  const handleClick = () => {
    console.log('clicked');
  };

  return <Child onClick={handleClick} />;  // 每次渲染都创建新函数
};

// ✅ 优化后
const Parent = ({ data }) => {
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);  // 使用useCallback缓存函数

  return <Child onClick={handleClick} />;
};
```

### 2. 大列表渲染

**问题**: 大量数据导致页面卡顿
**解决**: 使用虚拟滚动或分页

```tsx
// ❌ 问题代码
{allProducts.map(product => (
  <ProductCard key={product.id} product={product} />
))}

// ✅ 优化后
<LargeList
  dataSource={allProducts}
  renderItem={(product) => (
    <ProductCard product={product} />
  )}
  virtualScroll={{ enabled: true }}
/>
```

### 3. 图片加载慢

**问题**: 大图片影响页面加载速度
**解决**: 图片优化和懒加载

```tsx
// ❌ 问题代码
<img src="/images/large-image.jpg" alt="图片" />

// ✅ 优化后
<ProductImage
  src="/images/large-image.jpg"
  alt="图片"
  lazy={true}
  formatPriority={['webp', 'jpeg']}
/>
```

## 📚 参考资料

- [React性能优化官方文档](https://react.dev/learn/render-and-commit)
- [Web.dev性能指南](https://web.dev/performance/)
- [Vite构建优化](https://vitejs.dev/guide/build.html#build-optimizations)
- [Ant Design性能优化](https://ant.design/docs/react/faq#performance)

## 🔄 持续优化

性能优化是一个持续的过程：

1. **定期性能审计**: 每月进行一次全面性能检查
2. **监控关键指标**: 跟踪Core Web Vitals等指标
3. **用户反馈收集**: 关注用户反馈的性能问题
4. **技术更新**: 跟进最新的性能优化技术
5. **团队培训**: 定期分享性能优化最佳实践

---

本指南会持续更新，欢迎团队成员贡献经验和建议！