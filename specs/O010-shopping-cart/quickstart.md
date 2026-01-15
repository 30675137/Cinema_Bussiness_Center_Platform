# Quickstart Guide: 小程序购物车功能

**Feature**: O010-shopping-cart
**Created**: 2026-01-06
**Branch**: `O010-shopping-cart`

---

## 快速开始

本指南帮助开发者快速上手 O010-shopping-cart 功能的开发和调试。

---

## 📋 前置要求

### 环境要求

| 工具 | 版本要求 |
|------|---------|
| Node.js | ≥ 16.x |
| npm | ≥ 8.x |
| Taro CLI | 4.1.9 |
| 微信开发者工具 | 最新稳定版 |

### 技术栈

- **框架**: Taro 4.1.9 + React 18.3.1 + TypeScript 5.4.0
- **状态管理**: Zustand 4.5.5
- **UI 组件**: @tarojs/components
- **样式**: SCSS + TailwindCSS
- **测试**: Vitest 4.0.15

---

## 🚀 快速启动

### 1. 克隆项目并切换分支

```bash
# 克隆仓库
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform

# 切换到功能分支
git checkout O010-shopping-cart

# 或者从 main 分支创建新分支
git checkout -b O010-shopping-cart
```

### 2. 安装依赖

```bash
cd hall-reserve-taro
npm install
```

### 3. 启动开发服务器

#### H5 模式（推荐用于快速调试）

```bash
npm run dev:h5

# 服务启动在 http://localhost:10086
# 浏览器打开查看效果
```

#### 微信小程序模式

```bash
# 1. 编译小程序
npm run dev:weapp

# 2. 打开微信开发者工具
# 导入项目目录: hall-reserve-taro/dist
# AppID: 使用测试号或真实 AppID
```

### 4. 验证安装

打开浏览器/微信开发者工具，检查：
- [ ] 商品列表页正常显示（O009 功能）
- [ ] 点击商品卡片右下角"+"按钮，显示数量控制器
- [ ] 页面底部显示浮动购物车按钮
- [ ] 点击浮动购物车按钮，打开购物车抽屉

---

## 📁 项目结构

```
hall-reserve-taro/
├── src/
│   ├── components/           # 组件目录
│   │   ├── ProductCard/      # 商品卡片（O009，需修改）
│   │   ├── QuantityController/  # 🆕 数量控制器
│   │   ├── FloatingCartButton/  # 🆕 浮动购物车按钮
│   │   └── CartDrawer/       # 🆕 购物车抽屉
│   │
│   ├── stores/               # Zustand 状态管理
│   │   └── cartStore.ts      # 🆕 购物车 Store
│   │
│   ├── types/                # TypeScript 类型定义
│   │   └── cart.ts           # 🆕 购物车类型
│   │
│   ├── utils/                # 工具函数
│   │   ├── storage.ts        # 🔄 本地存储工具（新增购物车相关）
│   │   └── priceFormatter.ts # ✅ 价格格式化（O009 复用）
│   │
│   ├── pages/                # 页面组件
│   │   ├── menu/             # 🔄 菜单页面（集成购物车）
│   │   └── member/           # 🔄 会员中心（新增购物车入口）
│   │
│   └── assets/               # 静态资源
│       └── animations/
│           └── cart.scss     # 🆕 购物车动画
│
├── config/
│   └── index.ts              # 🔄 Taro 配置（新增存储常量）
│
└── package.json
```

**图例**:
- 🆕 新增文件
- 🔄 修改文件
- ✅ 复用文件

---

## 🛠️ 开发工作流

### Phase 1: 创建购物车 Store

**文件**: `src/stores/cartStore.ts`

**步骤**:

1. 定义 CartState 接口
2. 实现 Zustand store
3. 集成 Taro.setStorageSync 持久化
4. 编写单元测试

**示例代码**:

```typescript
import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { CartItem, CartProduct } from '@/types/cart'
import { loadCart, saveCart } from '@/utils/storage'

interface CartState {
  cart: CartItem[]
  isCartOpen: boolean

  addToCart: (product: CartProduct, quantity?: number) => void
  updateQuantity: (productId: string, delta: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  toggleCartDrawer: () => void

  totalItems: () => number
  cartTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: loadCart(), // 从本地存储恢复
  isCartOpen: false,

  addToCart: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.cart.find(item => item.product.id === product.id)

      let newCart: CartItem[]
      if (existingItem) {
        // 累加数量
        newCart = state.cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // 新增商品
        newCart = [...state.cart, { product, quantity }]
      }

      saveCart(newCart) // 持久化
      return { cart: newCart }
    })
  },

  updateQuantity: (productId, delta) => {
    set((state) => {
      const newCart = state.cart
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter(item => item.quantity > 0) // 数量为 0 自动移除

      saveCart(newCart)
      return { cart: newCart }
    })
  },

  removeFromCart: (productId) => {
    set((state) => {
      const newCart = state.cart.filter(item => item.product.id !== productId)
      saveCart(newCart)
      return { cart: newCart }
    })
  },

  clearCart: () => {
    set({ cart: [] })
    saveCart([])
  },

  toggleCartDrawer: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  totalItems: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
  cartTotal: () => get().cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}))
```

**测试命令**:

```bash
npm run test src/stores/__tests__/cartStore.test.ts
```

---

### Phase 2: 实现 QuantityController 组件

**文件**: `src/components/QuantityController/index.tsx`

**步骤**:

1. 创建组件文件和样式
2. 实现 +/- 按钮交互
3. 使用 stopPropagation 阻止事件冒泡
4. 编写组件测试

**Props 接口**:

```typescript
interface QuantityControllerProps {
  /** 当前数量 */
  quantity: number

  /** 增加数量回调 */
  onIncrease: () => void

  /** 减少数量回调 */
  onDecrease: () => void

  /** 自定义样式类名 */
  className?: string
}
```

**使用示例**:

```tsx
<QuantityController
  quantity={qty}
  onIncrease={() => updateQuantity(productId, 1)}
  onDecrease={() => updateQuantity(productId, -1)}
/>
```

---

### Phase 3: 集成到 ProductCard

**文件**: `src/components/ProductCard/index.tsx`

**修改要点**:

1. 从 cartStore 获取商品数量
2. 根据数量显示"+"按钮或 QuantityController
3. 所有点击事件添加 `e.stopPropagation()`

**示例代码**:

```tsx
const ProductCard = ({ id, name, price, imageUrl, onClick }: Props) => {
  const addToCart = useCartStore(state => state.addToCart)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const getProductQuantity = useCartStore(state => state.getProductQuantity)

  const qty = getProductQuantity(id)

  return (
    <View className={styles.card} onClick={onClick}>
      {/* 商品信息 */}
      <Image src={imageUrl} />
      <Text>{name}</Text>
      <Text>{formatPrice(price)}</Text>

      {/* 数量控制器或添加按钮 */}
      {qty > 0 ? (
        <QuantityController
          quantity={qty}
          onIncrease={(e) => {
            e.stopPropagation()
            updateQuantity(id, 1)
          }}
          onDecrease={(e) => {
            e.stopPropagation()
            updateQuantity(id, -1)
          }}
        />
      ) : (
        <View
          className={styles.addButton}
          onClick={(e) => {
            e.stopPropagation()
            addToCart({ id, name, price, image: imageUrl }, 1)
          }}
        >
          <Plus />
        </View>
      )}
    </View>
  )
}
```

---

### Phase 4: 实现 FloatingCartButton

**文件**: `src/components/FloatingCartButton/index.tsx`

**步骤**:

1. 创建浮动按钮组件
2. 显示角标（商品总件数）和总金额
3. 点击打开购物车抽屉
4. 购物车为空时隐藏按钮

**样式要点**:

- 固定定位：`position: fixed; bottom: 96px; left: 16px; right: 16px;`
- z-index: 50
- 背景色：`bg-amber-500`
- 高度：`h-14` (56px)
- 圆角：`rounded-2xl`

---

### Phase 5: 实现 CartDrawer

**文件**: `src/components/CartDrawer/index.tsx`

**步骤**:

1. 创建抽屉组件（高度 90vh，圆角顶部）
2. 实现滑入动画（350ms，cubic-bezier(0.16, 1, 0.3, 1)）
3. 显示商品列表（可滚动）
4. 底部固定结算区域
5. 点击遮罩层关闭

**关键实现**:

```tsx
const CartDrawer = () => {
  const { cart, isCartOpen, setCartOpen, updateQuantity, subtotal, cartTotal } = useCartStore()

  if (!isCartOpen) return null

  return (
    <View className={styles.overlay}>
      {/* 遮罩层 */}
      <View className={styles.mask} onClick={() => setCartOpen(false)} />

      {/* 抽屉 */}
      <View className={styles.drawer}>
        {/* 标题栏 */}
        <View className={styles.header}>
          <Text>订单汇总</Text>
          <View onClick={() => setCartOpen(false)}>
            <X />
          </View>
        </View>

        {/* 商品列表（可滚动） */}
        <ScrollView className={styles.list}>
          {cart.map(item => (
            <View key={item.product.id} className={styles.item}>
              <Image src={item.product.image} />
              <Text>{item.product.name}</Text>
              <Text>{formatPrice(item.product.price)}</Text>
              <QuantityController
                quantity={item.quantity}
                onIncrease={() => updateQuantity(item.product.id, 1)}
                onDecrease={() => updateQuantity(item.product.id, -1)}
              />
            </View>
          ))}
        </ScrollView>

        {/* 底部结算区域 */}
        <View className={styles.footer}>
          <Text>小计: {formatPrice(subtotal())}</Text>
          <Text className={styles.total}>实付金额: {formatPrice(cartTotal())}</Text>
          <View className={styles.payButton}>立即支付</View>
        </View>
      </View>
    </View>
  )
}
```

---

## 🧪 测试指南

### 单元测试

**运行所有测试**:

```bash
npm run test
```

**运行特定测试文件**:

```bash
npm run test src/stores/__tests__/cartStore.test.ts
npm run test src/components/QuantityController/__tests__/QuantityController.test.tsx
```

**覆盖率报告**:

```bash
npm run test:coverage
```

### 手动测试清单

#### US1: 添加商品到购物车并显示数量控制器

- [ ] 点击商品卡片"+"按钮，商品加入购物车
- [ ] 数量控制器显示（灰色"-" + 橙色数字"1" + 橙色"+"）
- [ ] 浮动购物车按钮显示（角标"1"，总金额正确）
- [ ] 点击"+"按钮，数量增加到 2，角标和总金额更新
- [ ] 点击"-"按钮，数量减少到 1
- [ ] 数量减至 0 时，数量控制器隐藏，恢复显示"+"按钮
- [ ] 点击数量控制器按钮不触发商品卡片点击事件

#### US2: 页面底部浮动购物车按钮

- [ ] 购物车有商品时，浮动按钮显示
- [ ] 按钮显示角标（商品总件数）、"去结账"文字、总金额
- [ ] 点击按钮打开购物车抽屉
- [ ] 购物车为空时，按钮隐藏

#### US3: 查看和管理购物车抽屉

- [ ] 抽屉从底部滑入（350ms 动画）
- [ ] 显示黑色半透明模糊遮罩
- [ ] 顶部显示"订单汇总"标题和关闭按钮
- [ ] 商品列表可滚动
- [ ] 调整商品数量，小计和实付金额实时更新
- [ ] 数量减至 0，商品从列表移除
- [ ] 点击遮罩层或关闭按钮，抽屉关闭

#### US4: 购物车状态持久化

- [ ] 添加商品到购物车
- [ ] 关闭小程序/浏览器
- [ ] 重新打开，购物车数据保留
- [ ] 切换到其他页面后返回，购物车状态保持

#### US5: 购物车商品数量角标实时同步

- [ ] 添加商品，角标更新
- [ ] 删除商品，角标更新
- [ ] 购物车为空时，浮动按钮隐藏

#### US6: 会员中心购物车入口

- [ ] 会员中心显示购物车卡片
- [ ] 卡片显示商品件数或"空空如也"
- [ ] 点击卡片打开购物车抽屉

---

## 🐛 常见问题

### 问题 1: 数量控制器点击触发了商品详情跳转

**原因**: 缺少 `e.stopPropagation()`

**解决**:

```tsx
onClick={(e) => {
  e.stopPropagation()  // ✅ 添加这一行
  handleClick()
}}
```

### 问题 2: 购物车数据丢失

**原因**: 本地存储写入失败或读取逻辑错误

**调试**:

```bash
# H5 模式：打开浏览器 DevTools > Application > Local Storage
# 小程序模式：打开微信开发者工具 > Storage > Storage Data

# 检查是否存在 "cart" 键
# 查看数据结构是否正确
```

### 问题 3: 购物车抽屉动画不流畅

**原因**: CSS 动画性能问题

**优化**:

```css
/* 使用 transform 代替 top/bottom 属性 */
.drawer {
  animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

### 问题 4: 价格显示错误（如 ¥28.0000000001）

**原因**: 使用浮点数计算

**解决**: 确保所有价格以"分"为单位存储，仅在显示时转换为"元"

```typescript
// ❌ 错误
const price = 28.00 * quantity

// ✅ 正确
const priceInCents = 2800 * quantity  // 以"分"为单位计算
const displayPrice = formatPrice(priceInCents)  // 转换为"元"显示
```

---

## 📚 参考资源

### 内部文档

- **功能规格**: `specs/O010-shopping-cart/spec.md`
- **实现计划**: `specs/O010-shopping-cart/plan.md`
- **数据模型**: `specs/O010-shopping-cart/data-model.md`
- **UI 原型**: `/Users/lining/qoder/ui_demo/Cinema_Bussiness_Cente_UI_DEMO/wechat-multi-entertainment-ordering`

### 外部文档

- [Taro 官方文档](https://taro-docs.jd.com/docs/)
- [Zustand 官方文档](https://zustand-demo.pmnd.rs/)
- [Taro Storage API](https://taro-docs.jd.com/docs/apis/storage/setStorageSync)
- [@tarojs/components](https://taro-docs.jd.com/docs/components/viewContainer/view)

---

## ✅ 验收标准

完成以下检查项后，功能即可提交代码审查：

- [ ] 所有组件文件包含 `@spec O010-shopping-cart` 标识
- [ ] 单元测试覆盖率 ≥ 70%
- [ ] 所有用户故事（US1-US6）手动测试通过
- [ ] 代码通过 ESLint 检查（`npm run lint`）
- [ ] TypeScript 无类型错误（`npm run type-check`）
- [ ] H5 和微信小程序两端功能正常
- [ ] 购物车数据持久化测试通过
- [ ] 性能测试：添加商品响应 < 500ms，抽屉动画 60 FPS

---

**Created by**: Claude Code
**Branch**: O010-shopping-cart
**Phase**: Phase 1 - Design & Contracts
**Last Updated**: 2026-01-06
