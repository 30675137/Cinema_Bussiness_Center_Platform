# Research: 小程序商品列表技术决策

**Feature**: O009-miniapp-product-list
**Date**: 2026-01-05
**Status**: Completed

本文档记录了小程序商品列表功能开发过程中的关键技术决策、选择理由和备选方案评估。

---

## 1. TanStack Query 配置策略

### Decision: 商品列表数据缓存策略

**选择的方案**:
```typescript
const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['channel-products', categoryId],
    queryFn: () => fetchProducts({ categoryId, channel: 'MINIAPP' }),
    staleTime: 5 * 60 * 1000, // 5分钟缓存
    cacheTime: 10 * 60 * 1000, // 10分钟内保留缓存
    refetchInterval: 60 * 1000, // 1分钟后台轮询
    retry: 2, // 失败重试2次
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

**Rationale**:
- **staleTime: 5分钟** - 商品数据变化频率中等,5分钟内的数据可视为新鲜,避免频繁请求
- **refetchInterval: 1分钟** - 后台轮询确保用户浏览时自动刷新数据,保持新鲜度
- **retry: 2次** - 网络波动时自动重试,提高用户体验
- **queryKey 包含 categoryId** - 不同分类的数据独立缓存,切换分类时可快速读取缓存

**Alternatives Considered**:
1. **不使用缓存(staleTime: 0)** - 拒绝理由:每次切换分类都重新请求,浪费流量且体验差
2. **永久缓存(staleTime: Infinity)** - 拒绝理由:无法及时获取商品价格/库存变化,数据过期风险高
3. **仅手动刷新(无 refetchInterval)** - 拒绝理由:用户需手动下拉刷新,体验不够智能

---

### Decision: 分类列表数据缓存策略

**选择的方案**:
```typescript
const useCategories = () => {
  return useQuery({
    queryKey: ['menu-categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30分钟缓存
    cacheTime: 60 * 60 * 1000, // 1小时保留
    retry: 3, // 失败重试3次
    refetchOnWindowFocus: false, // 不在窗口聚焦时刷新
  });
};
```

**Rationale**:
- **staleTime: 30分钟** - 分类数据变化频率极低(运营后台手动配置),可长时间缓存
- **refetchOnWindowFocus: false** - 避免切换回小程序时重新请求分类
- **retry: 3次** - 分类数据是核心导航,重试次数比商品数据更多,确保加载成功

**Alternatives Considered**:
1. **与商品数据相同缓存(5分钟)** - 拒绝理由:分类变化频率远低于商品,浪费请求
2. **不缓存(staleTime: 0)** - 拒绝理由:用户每次进入页面都重新请求,完全没必要

---

### Decision: 下拉刷新的乐观更新策略

**选择的方案**:
```typescript
const handleRefresh = useCallback(async () => {
  setRefreshing(true); // 显示刷新动画
  try {
    await queryClient.refetchQueries({ queryKey: ['channel-products', selectedCategory] });
    Taro.showToast({ title: '刷新成功', icon: 'success' });
  } catch (error) {
    Taro.showToast({ title: '刷新失败', icon: 'error' });
  } finally {
    setRefreshing(false);
    Taro.stopPullDownRefresh(); // 停止下拉刷新动画
  }
}, [selectedCategory]);
```

**Rationale**:
- 保持当前选中的分类,仅刷新商品数据(符合 Clarification Q3)
- 使用 `refetchQueries` 强制重新请求,忽略缓存
- 显示 Toast 反馈,提升用户体验

**Alternatives Considered**:
1. **同时刷新分类和商品** - 拒绝理由:分类数据变化频率低,且 Clarification 明确要求仅刷新商品
2. **使用 `invalidateQueries` 替代 `refetchQueries`** - 拒绝理由:invalidate 仅标记为 stale,不会立即请求

---

## 2. Taro 多端兼容性方案

### Decision: 图片懒加载实现

**选择的方案**:
```tsx
// 微信小程序和 H5 均支持 lazy-load 属性
<Image
  src={product.mainImage}
  mode="aspectFill"
  lazyLoad
  onError={() => setImageError(true)}
  className="product-image"
/>
```

**Rationale**:
- Taro `<Image>` 组件的 `lazyLoad` 属性在微信小程序和 H5 均可用
- 无需条件编译,代码简洁统一
- 微信小程序底层使用 `<image lazy-load="true">`,H5 使用 Intersection Observer API

**Alternatives Considered**:
1. **使用第三方库(react-lazyload)** - 拒绝理由:Taro 原生支持已足够,引入第三方库增加包体积
2. **手动实现 Intersection Observer** - 拒绝理由:重复造轮子,且需要条件编译处理小程序

---

### Decision: 下拉刷新组件选择

**选择的方案**:
```tsx
// 使用 Taro 页面配置启用下拉刷新
// pages/product-list/index.config.ts
export default {
  navigationBarTitleText: '商品列表',
  enablePullDownRefresh: true,
  backgroundTextStyle: 'dark',
};

// 页面组件中监听下拉刷新事件
useEffect(() => {
  const handlePullDownRefresh = async () => {
    await refetchProducts();
    Taro.stopPullDownRefresh();
  };
  Taro.usePullDownRefresh(handlePullDownRefresh);
}, [refetchProducts]);
```

**Rationale**:
- Taro 的 `enablePullDownRefresh` 配置在微信小程序和 H5 均生效
- 使用 `usePullDownRefresh` Hook 监听刷新事件,符合 React 规范
- 微信小程序底层使用原生下拉刷新,H5 使用模拟实现,体验一致

**Alternatives Considered**:
1. **使用 ScrollView 的 onScrollToUpper** - 拒绝理由:需手动实现刷新动画,体验不如原生
2. **第三方下拉刷新库** - 拒绝理由:Taro 原生支持已满足需求

---

### Decision: 虚拟列表实现方案

**选择的方案**:
```tsx
// 暂不使用虚拟列表,优先使用分页加载
// 仅在单页商品数量超过100时考虑虚拟列表
```

**Rationale**:
- 规格要求支持 200 条商品流畅滚动,但通过分页加载(每页20条)可有效控制 DOM 节点数量
- Taro 的虚拟列表(`<VirtualList>`)在微信小程序支持有限,且配置复杂
- 优先实现分页加载,如性能测试发现卡顿再引入虚拟列表

**Alternatives Considered**:
1. **直接使用 `<VirtualList>`** - 拒绝理由:当前数据量不大,过度优化
2. **第三方虚拟列表库(react-window)** - 拒绝理由:Taro 兼容性未知,风险高

---

## 3. 动态分类系统集成

### Decision: 分类数据获取与映射

**选择的方案**:
```typescript
// 1. 获取分类列表
const useCategories = () => {
  return useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const res = await request.get('/api/client/menu-categories');
      return res.data.filter((cat) => cat.isVisible); // 仅显示可见分类
    },
  });
};

// 2. 使用分类 ID(UUID) 筛选商品
const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['channel-products', categoryId],
    queryFn: () => fetchProducts({ categoryId, channel: 'MINIAPP' }),
  });
};
```

**Rationale**:
- 分类 API 返回包含 `id`(UUID)、`code`、`displayName` 的完整对象
- 前端仅显示 `isVisible=true` 的分类,符合业务规则
- 使用 `id` 字段(UUID)作为 `categoryId` 参数,符合 Clarification Q2 决策

**Alternatives Considered**:
1. **使用 `code` 字段筛选** - 拒绝理由:后端 API 使用 `categoryId`(UUID)参数,且 UUID 查询性能更好
2. **前端硬编码分类列表** - 拒绝理由:违反 O008 规格的动态分类系统架构

---

### Decision: 分类数据加载失败降级方案

**选择的方案**:
```tsx
const { data: categories, isError } = useCategories();

if (isError) {
  return (
    <View className="error-state">
      <Text>分类加载失败</Text>
      <Button onClick={() => refetchCategories()}>重试</Button>
    </View>
  );
}

// 如果分类为空,显示"全部"选项
const finalCategories = [
  { id: null, code: 'ALL', displayName: '全部' },
  ...(categories || []),
];
```

**Rationale**:
- 加载失败时显示错误提示和重试按钮,符合 US4 错误处理需求
- 始终显示"全部"选项(categoryId=null),即使分类加载失败用户也能浏览商品
- 降级方案确保核心功能(商品浏览)不受分类加载影响

**Alternatives Considered**:
1. **分类失败时阻塞商品加载** - 拒绝理由:过度依赖分类,用户体验差
2. **使用本地缓存的分类** - 拒绝理由:首次加载时无缓存,且缓存过期问题复杂

---

## 4. 商品数据映射与转换

### Decision: DTO 到 Component Props 的映射

**选择的方案**:
```typescript
// 后端 DTO
interface ChannelProductDTO {
  id: string;
  skuId: string;
  categoryId: string;
  displayName: string;
  basePrice: number; // 单位:分
  mainImage: string;
  isRecommended: boolean;
  sortOrder: number;
  status: string;
}

// 前端映射函数
const mapToProductCard = (dto: ChannelProductDTO): ProductCardProps => ({
  id: dto.id,
  name: dto.displayName,
  price: formatPrice(dto.basePrice), // "¥28.00"
  imageUrl: dto.mainImage || DEFAULT_PRODUCT_IMAGE,
  isRecommended: dto.isRecommended,
  badge: dto.isRecommended ? '推荐' : undefined,
});
```

**Rationale**:
- 明确分离后端 DTO 和前端组件 Props,避免紧耦合
- 映射函数集中处理数据转换逻辑(价格格式化、默认图片、标签)
- 便于单元测试和未来 DTO 结构变化的适配

**Alternatives Considered**:
1. **直接在组件中使用 DTO** - 拒绝理由:组件与后端耦合,且需在组件内重复格式化逻辑
2. **使用类(Class)进行映射** - 拒绝理由:函数式映射更轻量,符合 React 规范

---

### Decision: 价格格式化实现

**选择的方案**:
```typescript
export const formatPrice = (priceInCents: number | null): string => {
  if (priceInCents === null || priceInCents === undefined) {
    return '价格待定';
  }
  if (priceInCents === 0) {
    return '免费';
  }
  const yuan = priceInCents / 100;
  return `¥${yuan.toFixed(2)}`;
};

// 测试用例
formatPrice(2800); // "¥28.00"
formatPrice(0); // "免费"
formatPrice(null); // "价格待定"
```

**Rationale**:
- 处理所有边界情况:null(价格待定)、0(免费)、正常值(格式化)
- 使用 `toFixed(2)` 确保显示两位小数,符合电商惯例
- 函数纯净,易于单元测试

**Alternatives Considered**:
1. **显示整数(不带小数)** - 拒绝理由:不符合电商规范,且无法区分 28 元和 28.50 元
2. **使用 Intl.NumberFormat** - 拒绝理由:Taro 小程序兼容性未知,简单场景无需引入

---

### Decision: 图片 URL 处理与占位图

**选择的方案**:
```tsx
const [imageSrc, setImageSrc] = useState(product.mainImage || DEFAULT_PRODUCT_IMAGE);

const handleImageError = () => {
  setImageSrc(DEFAULT_PRODUCT_IMAGE); // 加载失败时使用占位图
};

<Image
  src={imageSrc}
  mode="aspectFill"
  lazyLoad
  onError={handleImageError}
/>
```

**Rationale**:
- 支持三种场景:正常加载、URL 为空、加载失败
- 使用 `onError` 回调自动切换到占位图,用户体验友好
- 占位图存储在 `assets/images/placeholder-product.png`,编译时打包

**Alternatives Considered**:
1. **不处理加载失败** - 拒绝理由:显示破损图标,体验极差
2. **在 Service 层添加图片验证** - 拒绝理由:增加请求延迟,且无法保证运行时加载成功

---

## 5. 性能优化策略

### Decision: 列表分页加载触发时机

**选择的方案**:
```tsx
const handleScrollToLower = useCallback(() => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage(); // TanStack Query 的无限滚动API
  }
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

<ScrollView
  scrollY
  onScrollToLower={handleScrollToLower}
  lowerThreshold={50} // 距底部50px触发
>
  {products.map(product => <ProductCard key={product.id} {...product} />)}
</ScrollView>
```

**Rationale**:
- `lowerThreshold: 50px` 提前触发加载,避免用户滚动到底部时等待
- 使用 TanStack Query 的 `useInfiniteQuery` 管理分页状态
- 检查 `hasNextPage` 和 `isFetchingNextPage` 避免重复请求

**Alternatives Considered**:
1. **触发阈值设为 100px** - 拒绝理由:过早触发可能浪费流量
2. **触发阈值设为 0px** - 拒绝理由:用户需滚动到底部才触发,体验不佳

---

### Decision: 分类切换防抖处理

**选择的方案**:
```typescript
import { useDebouncedCallback } from 'use-debounce';

const handleCategoryChange = useDebouncedCallback((categoryId: string) => {
  setSelectedCategory(categoryId);
}, 300); // 300ms 防抖
```

**Rationale**:
- 用户快速点击多个分类时,仅处理最后一次点击
- 300ms 延迟在用户体验和性能之间取得平衡
- 使用 `use-debounce` 库提供 React Hook 封装

**Alternatives Considered**:
1. **不使用防抖** - 拒绝理由:用户快速点击可能发送多个请求,浪费流量
2. **使用节流(throttle)** - 拒绝理由:节流会在间隔内执行多次,不如防抖精准

---

## 6. 错误处理与降级方案

### Decision: Token 过期自动刷新实现

**选择的方案**:
```typescript
// API 拦截器
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token 过期,触发静默登录
      try {
        const { code } = await Taro.login();
        const { token } = await refreshToken(code); // 后端换取新Token
        Taro.setStorageSync('token', token);
        // 重试原请求
        return request.request(error.config);
      } catch (refreshError) {
        // 静默登录失败,跳转登录页
        Taro.navigateTo({ url: '/pages/login/index' });
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

**Rationale**:
- 符合 O007 规格的 Token 过期处理机制(静默登录 + 失败后授权)
- 使用请求拦截器集中处理,避免每个 API 调用都写重试逻辑
- 静默登录成功后自动重试原请求,用户无感知

**Alternatives Considered**:
1. **不自动刷新,直接跳转登录** - 拒绝理由:用户体验差,且 O007 明确要求自动刷新
2. **在每个请求中手动处理** - 拒绝理由:代码重复,维护困难

---

### Decision: 网络异常检测与提示

**选择的方案**:
```typescript
const checkNetwork = async () => {
  const { networkType } = await Taro.getNetworkType();
  if (networkType === 'none') {
    Taro.showToast({ title: '网络已断开', icon: 'none' });
    return false;
  }
  return true;
};

// 在 API 调用前检查网络
const fetchProducts = async (params) => {
  const isOnline = await checkNetwork();
  if (!isOnline) {
    throw new Error('网络已断开');
  }
  return request.get('/api/client/channel-products', { params });
};
```

**Rationale**:
- 主动检测网络状态,避免发送注定失败的请求
- 显示清晰的错误提示,符合 US4 错误处理需求
- 用户可根据提示自行检查网络连接

**Alternatives Considered**:
1. **不检测,依赖请求失败** - 拒绝理由:请求失败的错误信息不明确,用户体验差
2. **实时监听网络变化** - 拒绝理由:增加复杂度,且频繁监听耗电

---

### Decision: API 调用失败重试策略

**选择的方案**:
```typescript
const useProducts = (categoryId?: string) => {
  return useQuery({
    queryKey: ['channel-products', categoryId],
    queryFn: () => fetchProducts({ categoryId }),
    retry: 2, // 失败重试2次
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
  });
};
```

**Rationale**:
- 重试 2 次可应对临时网络波动,但避免无限重试浪费流量
- 指数退避策略(1s, 2s, 4s...)避免请求风暴
- TanStack Query 内置重试机制,无需手动实现

**Alternatives Considered**:
1. **不重试** - 拒绝理由:临时网络波动会导致加载失败,用户需手动刷新
2. **固定间隔重试** - 拒绝理由:可能引发请求风暴,指数退避更优

---

## 总结

### 核心技术栈决策

| 技术领域 | 选择方案 | 关键理由 |
|---------|---------|---------|
| 数据管理 | TanStack Query | 成熟的缓存/重试/分页解决方案 |
| 状态管理 | Zustand (客户端) + TanStack Query (服务器) | 轻量且符合宪法规范 |
| 多端兼容 | Taro 原生组件 + 条件编译 | 官方支持,无需第三方库 |
| 性能优化 | 懒加载 + 分页 + 防抖 | 简单有效,无过度优化 |
| 错误处理 | 拦截器 + 重试 + 降级 | 覆盖所有异常场景 |

### 待验证假设

1. **性能假设**: 分页加载(每页20条)足以支持 200 条商品流畅滚动
   - **验证方式**: 在微信开发者工具的性能面板测试实际 FPS
   - **降级方案**: 如 FPS < 50,引入虚拟列表

2. **缓存假设**: 5分钟 staleTime + 1分钟轮询平衡新鲜度和性能
   - **验证方式**: 监控 API 请求频率和用户反馈
   - **降级方案**: 根据数据调整 staleTime 和 refetchInterval

3. **兼容性假设**: Taro 的图片懒加载在所有目标平台表现一致
   - **验证方式**: 在微信小程序、H5、支付宝小程序测试
   - **降级方案**: 使用条件编译为不同平台提供不同实现

---

**Research Completed**: 2026-01-05
**Next Phase**: Phase 1 - Data Model & Contracts
