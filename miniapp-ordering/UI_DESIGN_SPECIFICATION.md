# CineLounge H5 点餐小程序 - UI 前端设计方案

**项目名称**: CineLounge Multi-Entertainment Ordering
**设计版本**: v1.0.0
**最后更新**: 2026-01-03
**设计平台**: H5 移动端 (响应式设计)

---

## 📋 目录

1. [项目概述](#1-项目概述)
2. [设计原则](#2-设计原则)
3. [色彩系统](#3-色彩系统)
4. [字体排版](#4-字体排版)
5. [组件设计规范](#5-组件设计规范)
6. [页面架构](#6-页面架构)
7. [交互设计](#7-交互设计)
8. [动画与过渡](#8-动画与过渡)
9. [响应式设计](#9-响应式设计)
10. [技术实现](#10-技术实现)

---

## 1. 项目概述

### 1.1 产品定位
CineLounge 是一款面向影院娱乐综合体的高端 H5 点餐小程序,融合了影院观影、电竞竞技、爵士现场、体育赛事等多种娱乐场景的即时餐饮服务。

### 1.2 设计目标
- **沉浸式体验**: 深色主题匹配影院环境,减少光污染,提升观影/观赛体验
- **高效点餐**: 3步完成点餐(选品→加购→支付),操作流畅无阻碍
- **会员粘性**: 积分系统、优惠券、AI推荐三大策略提升用户复购率
- **品质感**: 通过精致的视觉设计传达高端定位

### 1.3 用户画像
- **年龄段**: 18-35岁都市白领、年轻家庭
- **消费习惯**: 追求品质生活,愿意为优质体验付费
- **场景需求**: 观影中/观赛中的即时餐饮需求,追求便捷与品质

---

## 2. 设计原则

### 2.1 核心设计理念

#### Dark Mode First (深色优先)
- **主背景**: `#09090b` (Zinc-950) - 接近纯黑,营造影院氛围
- **卡片背景**: `#18181b` (Zinc-900) - 层次分明
- **边框分隔**: `#27272a` (Zinc-800) - 微妙的视觉分隔

#### Minimalist Luxury (极简奢华)
- 减少视觉噪音,突出核心内容
- 使用大量留白(黑)空间
- 精致的圆角、阴影、渐变提升质感

#### Instant Feedback (即时反馈)
- 所有交互必须有视觉反馈(缩放、颜色变化、微动效)
- 加载状态明确(骨架屏、进度指示)
- 错误提示友好清晰

### 2.2 可访问性原则
- **色彩对比度**: 符合 WCAG 2.1 AA 级别(至少 4.5:1)
- **触控目标**: 最小点击区域 44×44px
- **文字可读性**: 最小字号 12px,关键信息 14px+

---

## 3. 色彩系统

### 3.1 主色调 (Primary Colors)

#### 品牌色 - 琥珀金 (Amber)
用于强调、CTA按钮、品牌识别
```css
--amber-50:  #fffbeb;  /* 极浅背景 */
--amber-100: #fef3c7;  /* 浅背景 */
--amber-200: #fde68a;  /* 次要高亮 */
--amber-400: #fbbf24;  /* 悬停态 */
--amber-500: #f59e0b;  /* 主色 ★ */
--amber-600: #d97706;  /* 深色强调 */
```

**使用场景**:
- 主要操作按钮背景 (`bg-amber-500`)
- 价格文字 (`text-amber-500`)
- 积分徽章 (`bg-amber-500`)
- 品牌 Logo (`text-amber-500`)

#### 中性色 - 锌灰 (Zinc)
用于背景、文字、边框
```css
--zinc-50:  #fafafa;  /* 纯白文字 */
--zinc-100: #f4f4f5;  /* 次级白文字 */
--zinc-400: #a1a1aa;  /* 次要信息 */
--zinc-500: #71717a;  /* 禁用态 */
--zinc-700: #3f3f46;  /* 次级背景 */
--zinc-800: #27272a;  /* 边框/分隔 */
--zinc-900: #18181b;  /* 卡片背景 ★ */
--zinc-950: #09090b;  /* 主背景 ★ */
```

**使用场景**:
- 主背景 (`bg-zinc-950`)
- 卡片/模态框背景 (`bg-zinc-900`)
- 边框 (`border-zinc-800`)
- 主文字 (`text-zinc-50`)
- 次级文字 (`text-zinc-400`)

### 3.2 功能色 (Functional Colors)

#### 成功 (Success)
```css
--green-500: #22c55e;
```
- 支付成功提示
- 兑换成功徽章

#### 信息 (Info)
```css
--blue-500: #3b82f6;
```
- 订单历史入口
- 通知横幅

#### 警告 (Warning)
```css
--yellow-500: #eab308;
```
- 库存不足提示

#### 错误 (Error)
```css
--red-500: #ef4444;
```
- 积分不足提示
- 购物车角标
- 表单验证错误

### 3.3 渐变系统

#### 卡片装饰渐变
```css
background: linear-gradient(135deg, #18181b 0%, #09090b 100%);
```

#### 会员卡渐变
```css
background: linear-gradient(to bottom right, #3f3f46, #18181b);
```

#### 扫描框光晕
```css
box-shadow: 0 0 15px rgba(245, 158, 11, 0.8);
```

---

## 4. 字体排版

### 4.1 字体家族
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

**Inter 字体特性**:
- 极佳的数字可读性(等宽数字)
- 支持多种字重(300-700)
- 中英文混排表现优秀

### 4.2 字号系统

| 类型 | 字号 | 行高 | 字重 | 应用场景 |
|------|------|------|------|---------|
| **Display** | 32px | 40px | 900 | 会员积分余额 |
| **Heading 1** | 24px | 32px | 900 | 页面主标题 |
| **Heading 2** | 20px | 28px | 700 | 模态框标题 |
| **Heading 3** | 18px | 24px | 700 | 品牌名称 |
| **Body Large** | 16px | 24px | 600 | 商品名称 |
| **Body** | 14px | 20px | 400 | 商品描述 |
| **Body Small** | 12px | 16px | 500 | 次要信息 |
| **Caption** | 10px | 14px | 700 | 标签/徽章 |

### 4.3 字重规范
```css
--font-light:   300;  /* 极少使用,装饰性文字 */
--font-regular: 400;  /* 正文内容 */
--font-medium:  500;  /* 次级标题 */
--font-semibold:600;  /* 卡片标题 */
--font-bold:    700;  /* 强调信息 */
--font-black:   900;  /* 价格/CTA按钮 */
```

### 4.4 文字颜色语义

| 颜色 | 类名 | 用途 |
|------|------|------|
| `#fafafa` | `text-zinc-50` | 主要文字 |
| `#f4f4f5` | `text-zinc-100` | 次级文字 |
| `#a1a1aa` | `text-zinc-400` | 辅助信息 |
| `#71717a` | `text-zinc-500` | 禁用/占位符 |
| `#f59e0b` | `text-amber-500` | 价格/强调 |

---

## 5. 组件设计规范

### 5.1 按钮系统

#### 主要按钮 (Primary Button)
**样式**:
```css
.btn-primary {
  background-color: #f59e0b; /* amber-500 */
  color: #09090b; /* zinc-950 */
  font-weight: 900;
  border-radius: 16px; /* 2xl */
  padding: 16px 32px;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.1);
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: #fbbf24; /* amber-400 */
  transform: scale(1.02);
}

.btn-primary:active {
  transform: scale(0.95);
}
```

**应用场景**: 立即支付、加入购物车、立即兑换

#### 次要按钮 (Secondary Button)
```css
.btn-secondary {
  background-color: #27272a; /* zinc-800 */
  color: #fafafa;
  font-weight: 600;
  border-radius: 12px;
  padding: 12px 24px;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #3f3f46; /* zinc-700 */
}
```

#### 图标按钮 (Icon Button)
```css
.btn-icon {
  background-color: #27272a;
  padding: 8px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**应用场景**: 搜索、扫码、关闭

### 5.2 输入组件

#### 数量调节器 (Quantity Stepper)
```css
.quantity-stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #27272a; /* zinc-800 */
  padding: 4px;
  border-radius: 12px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: transparent;
  transition: all 0.2s;
}

.quantity-btn:hover {
  color: #f59e0b; /* amber-500 */
}
```

**行为**:
- 减号按钮: 数量 > 0 时显示
- 加号按钮: 永久显示,琥珀金背景
- 数字: 14px,字重 900,琥珀金色

### 5.3 卡片组件

#### 商品卡片 (Product Card)
```css
.product-card {
  background: rgba(24, 24, 27, 0.5); /* zinc-900/50 */
  border: 1px solid #27272a; /* zinc-800 */
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:active {
  transform: scale(0.98);
}
```

**内部结构**:
- **商品图片**: 80×80px,圆角 12px
- **商品名称**: 14px,字重 600
- **价格**: 14px,字重 700,琥珀金色
- **积分提示**: 10px,灰色,带星标图标

#### 会员卡 (Membership Card)
```css
.membership-card {
  background: linear-gradient(to bottom right, #3f3f46, #18181b);
  border: 1px solid #3f3f46;
  border-radius: 24px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

/* 装饰光晕 */
.membership-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 128px;
  height: 128px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  filter: blur(60px);
  margin-top: -64px;
  margin-right: -64px;
}
```

### 5.4 徽章与标签

#### 积分徽章
```css
.badge-points {
  background: #f59e0b;
  color: #09090b;
  font-size: 10px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

#### 兑换标签
```css
.tag-redemption {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f59e0b;
  color: #09090b;
  font-size: 8px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 9999px;
}
```

### 5.5 模态框 (Modal)

#### 底部弹出模态框
```css
.modal-bottom-sheet {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
}

.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;
  width: 100%;
  max-height: 90vh;
  background: #18181b; /* zinc-900 */
  border-top-left-radius: 40px;
  border-top-right-radius: 40px;
  border-top: 1px solid #27272a;
  animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-handle {
  width: 48px;
  height: 4px;
  background: #27272a;
  border-radius: 9999px;
  margin: 0 auto 24px;
}
```

---

## 6. 页面架构

### 6.1 整体布局

```
┌─────────────────────────────────┐
│  Header (Sticky)                │  64px
├─────────────────────────────────┤
│  AI Recommendation Banner       │  32px
├─────────────────────────────────┤
│                                 │
│  Main Content Area              │  flex-1
│  (Tab切换: 点餐 / 会员中心)    │
│                                 │
├─────────────────────────────────┤
│  Bottom Navigation              │  80px
└─────────────────────────────────┘
```

### 6.2 页面层级结构

#### Level 1: 主页面
- **点餐页** (Order Tab)
- **会员中心页** (Member Tab)

#### Level 2: 模态层
- **商品详情** (Product Detail Modal) - z-index: 60
- **购物车** (Cart Modal) - z-index: 70

#### Level 3: 覆盖层
- **扫码界面** (QR Scanner Overlay) - z-index: 100

### 6.3 点餐页布局

```
┌────┬──────────────────────────┐
│    │  Product List            │
│ N  │  ┌────────────────────┐  │
│ a  │  │ Product Card 1     │  │
│ v  │  └────────────────────┘  │
│    │  ┌────────────────────┐  │
│ i  │  │ Product Card 2     │  │
│ c  │  └────────────────────┘  │
│ o  │  ...                     │
│ n  │                          │
└────┴──────────────────────────┘
```

**左侧导航栏**:
- 宽度: 80px
- 背景: `#18181b`
- 图标尺寸: 24×24px
- 激活态: 琥珀金色 + 放大 110%

**商品列表区**:
- 背景: `#09090b`
- 内边距: 16px
- 底部留白: 96px (为悬浮购物车按钮预留空间)

### 6.4 会员中心页布局

```
┌─────────────────────────────┐
│  Membership Card            │  180px
├─────────────────────────────┤
│  Quick Actions Grid (2×2)   │  200px
├─────────────────────────────┤
│  Points Redemption Mall     │  flex-1
│  ┌────────────────────┐     │
│  │ Redemption Item 1  │     │
│  ├────────────────────┤     │
│  │ Redemption Item 2  │     │
│  └────────────────────┘     │
└─────────────────────────────┘
```

---

## 7. 交互设计

### 7.1 核心交互流程

#### 快速点餐流程
```
选择分类 → 浏览商品 → 点击商品卡片 → 商品详情模态框 → 加入购物车 → 悬浮购物车按钮 → 购物车模态框 → 选择优惠 → 立即支付
```

**时间目标**: 从选品到支付完成 < 60秒

#### 积分兑换流程
```
会员中心 → 积分商城 → 点击"立即兑换" → 确认弹窗 → 扣除积分 → 加入购物车
```

#### 扫码点餐流程
```
点击扫码按钮 → 扫码界面全屏覆盖 → 识别二维码 → 自动切换场景/影厅 → 返回点餐页
```

### 7.2 手势交互

| 手势 | 触发区域 | 行为 |
|------|---------|------|
| **点击** | 商品卡片 | 打开商品详情 |
| **点击** | 加号按钮 | 加入购物车 +1 |
| **点击** | 减号按钮 | 购物车数量 -1 |
| **向下滑动** | 模态框句柄 | 关闭模态框 |
| **点击** | 模态框遮罩 | 关闭模态框 |
| **长按** | 商品卡片 | 快速查看详情(可选) |

### 7.3 状态反馈

#### 加载状态
```typescript
// AI推荐加载
{isAISuggestionLoading && (
  <span className="text-xs text-zinc-500 animate-pulse">
    AI 正在根据氛围为您配餐...
  </span>
)}
```

#### 空状态
```typescript
// 购物车为空
{totalItems === 0 && (
  <div className="text-center py-20">
    <ShoppingBag className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
    <p className="text-zinc-500">购物车空空如也</p>
  </div>
)}
```

#### 错误状态
```typescript
// 积分不足
if (member.points < pointsPrice) {
  alert("积分余额不足");
  return;
}
```

### 7.4 微交互设计

#### 按钮点击反馈
```css
.btn-feedback:active {
  transform: scale(0.95);
  transition: transform 0.1s;
}
```

#### 购物车角标动画
```css
.cart-badge {
  animation: bounce 0.5s;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

#### 卡片悬停效果
```css
.card:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}
```

---

## 8. 动画与过渡

### 8.1 动画系统

#### Slide-Up (底部弹出)
```css
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
```

**应用**: 商品详情、购物车模态框

#### Scan (扫描线动画)
```css
@keyframes scan {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% {
    transform: translateY(256px);
    opacity: 0;
  }
}

.animate-scan {
  animation: scan 2s linear infinite;
}
```

**应用**: 二维码扫描框

#### Fade-In (淡入)
```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

**应用**: 扫码界面、模态框遮罩

#### Pulse (脉冲)
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**应用**: 星标图标、加载提示

### 8.2 过渡时长标准

| 交互类型 | 时长 | 缓动函数 |
|---------|------|---------|
| **按钮点击** | 0.1s | ease-out |
| **悬停效果** | 0.2s | ease |
| **模态框出现** | 0.35s | cubic-bezier(0.16, 1, 0.3, 1) |
| **页面切换** | 0.3s | ease-in-out |
| **数量变化** | 0.15s | ease |

---

## 9. 响应式设计

### 9.1 断点系统

虽然主要为移动端设计,但需支持平板和小尺寸桌面设备:

```css
/* 手机竖屏 (默认) */
@media (min-width: 320px) { ... }

/* 手机横屏/小平板 */
@media (min-width: 640px) {
  .container {
    max-width: 480px;
    margin: 0 auto;
  }
}

/* 平板 */
@media (min-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 9.2 容器尺寸约束

```css
.app-container {
  max-width: 448px; /* md */
  margin: 0 auto;
  height: 100vh;
  border-left: 1px solid #27272a;
  border-right: 1px solid #27272a;
}
```

### 9.3 图片适配

```css
.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 12px;
}

/* 商品详情大图 */
.product-detail-image {
  width: 128px;
  height: 128px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
}
```

---

## 10. 技术实现

### 10.1 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | 19.2.3 | UI 框架 |
| **TypeScript** | ~5.8.2 | 类型系统 |
| **Vite** | 6.2.0 | 构建工具 |
| **Tailwind CSS** | 3.x (CDN) | CSS 框架 |
| **Lucide React** | 0.562.0 | 图标库 |
| **@google/genai** | 1.34.0 | AI 推荐引擎 |

### 10.2 状态管理架构

```typescript
// 核心状态
const [activeTab, setActiveTab] = useState<'order' | 'member'>('order');
const [activeCategory, setActiveCategory] = useState<CategoryType>(CategoryType.ALCOHOL);
const [cart, setCart] = useState<CartItem[]>([]);
const [selectedZone, setSelectedZone] = useState<EntertainmentZone>(ZONES[0]);
const [member, setMember] = useState<Member>(MOCK_MEMBER);
const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
```

**状态设计原则**:
- **单一数据源**: 购物车数组为唯一真相来源
- **派生状态**: 通过 `useMemo` 计算总价、折扣、积分
- **最小化状态**: 避免冗余状态

### 10.3 类型系统

```typescript
// types.ts
export enum CategoryType {
  ALCOHOL = '经典特调',
  COFFEE = '精品咖啡',
  BEVERAGE = '清爽饮品',
  SNACK = '主厨小食',
  REWARDS = '积分兑换'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: CategoryType;
  pointsPrice?: number;
  options?: {
    name: string;
    choices: string[];
  }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
  isRedemption?: boolean; // 是否为积分兑换
}

export interface Member {
  name: string;
  level: '大众会员' | '白银会员' | '黄金会员';
  points: number;
  coupons: Coupon[];
  totalSpent: number;
}
```

### 10.4 样式实现方式

#### 内联 Tailwind 类名
```tsx
<div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
  {/* ... */}
</div>
```

#### 自定义 CSS 动画
```tsx
<style>{`
  @keyframes slide-up {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up {
    animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
`}</style>
```

### 10.5 性能优化策略

#### 图片优化
```tsx
// 使用 Unsplash CDN 动态裁剪
image: 'https://images.unsplash.com/photo-xxx?w=400&h=400&fit=crop'
```

#### 虚拟滚动 (可选)
对于长商品列表,可引入 `react-window`:
```tsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={filteredProducts.length}
  itemSize={100}
>
  {ProductCard}
</FixedSizeList>
```

#### useMemo 缓存计算
```typescript
const subtotal = useMemo(() =>
  cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  [cart]
);

const discount = useMemo(() => {
  // 复杂折扣计算逻辑
}, [appliedCoupon, subtotal, usePoints]);
```

### 10.6 AI 推荐集成

```typescript
// geminiService.ts
import { GoogleGenerativeAI } from '@google/genai';

export const getAIRecommendation = async (
  mood: string,
  products: Product[]
): Promise<{name: string, reason: string}[]> => {
  const genai = new GoogleGenerativeAI(API_KEY);
  const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `根据场景"${mood}",从以下商品中推荐最合适的3款...`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
```

**调用时机**: 每次切换场景(影厅)时自动触发

---

## 📐 设计检查清单

### 视觉设计
- [ ] 色彩对比度符合 WCAG AA 标准
- [ ] 所有图标尺寸一致(24px 或 20px)
- [ ] 圆角使用统一系统(8px/12px/16px/24px)
- [ ] 阴影层次清晰(3级: sm/md/lg)

### 交互设计
- [ ] 所有按钮有明确的点击反馈(缩放/颜色)
- [ ] 模态框可通过遮罩/按钮/滑动关闭
- [ ] 加载状态有明确提示
- [ ] 错误状态有友好提示

### 性能优化
- [ ] 图片使用 CDN 加载
- [ ] 长列表使用虚拟滚动
- [ ] 复杂计算使用 useMemo
- [ ] 避免不必要的重渲染

### 可访问性
- [ ] 最小触控区域 44×44px
- [ ] 关键操作可通过键盘完成
- [ ] 图片有 alt 属性
- [ ] 最小字号 12px

---

## 📝 更新日志

### v1.0.0 (2026-01-03)
- ✅ 完成深色主题设计系统
- ✅ 定义琥珀金+锌灰双色系统
- ✅ 完成8个核心组件规范
- ✅ 完成3个核心页面布局
- ✅ 定义4个关键动画效果
- ✅ 完成AI推荐集成方案

---

## 📚 参考资源

### 设计灵感
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [Inter Font Family](https://rsms.me/inter/)
- [Lucide Icons](https://lucide.dev/)

### 技术文档
- [React 19 Documentation](https://react.dev/)
- [Vite Build Tool](https://vitejs.dev/)
- [Google Gemini AI](https://ai.google.dev/gemini-api/docs)

---

**设计团队**: CineLounge UX Team
**设计负责人**: [Your Name]
**最后审核**: 2026-01-03
