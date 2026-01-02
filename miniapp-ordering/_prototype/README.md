# 原型代码参考 (Prototype Reference)

**@spec O006-miniapp-channel-order**

## 概述

此目录包含从 `hall-reserve-taro` 项目提取的渠道商品订单功能原型代码，作为新 Taro 实现的视觉和功能参考。

**⚠️ 重要说明**：
- 此代码仅供**参考**，不应直接运行
- 新实现应在 `miniapp-ordering/src/` 目录中进行
- UI 设计保真度要求：≥95% 与原型视觉一致性

## 原型来源

- **Git 提交**：`2853fe3` (feat: 实现Taro小程序渠道商品和订单功能)
- **提取日期**：2026-01-02
- **原始位置**：`hall-reserve-taro/src/`

## 文件结构

```
_prototype/src/
├── app.config.ts                 # Taro 应用配置（页面路由）
├── pages/                        # 5个页面组件
│   ├── products/                 # 商品列表页（分类筛选、搜索）
│   ├── product-detail/           # 商品详情页（规格选择、价格计算）
│   ├── cart/                     # 购物车页面（商品管理、总价计算）
│   ├── order-list/               # 订单列表页（状态筛选）
│   └── order-detail/             # 订单详情页（订单状态跟踪）
├── hooks/                        # 自定义 Hooks
│   ├── useChannelProducts.ts     # 商品数据查询 Hook
│   └── useChannelOrders.ts       # 订单数据查询 Hook
├── services/                     # API 服务层
│   ├── channelProductService.ts  # 渠道商品 API 调用
│   └── orderService.ts           # 订单 API 调用
├── stores/                       # Zustand 状态管理
│   └── cartStore.ts              # 购物车状态（商品、数量、总价）
├── types/                        # TypeScript 类型定义
│   ├── channelProduct.ts         # 渠道商品、规格、分类类型
│   └── order.ts                  # 订单类型定义
├── utils/                        # 工具函数
│   ├── priceCalculator.ts        # 价格计算工具（基础价+规格加价）
│   └── request.ts                # Taro.request 封装
└── styles/                       # 样式文件
    └── variables.scss            # 全局样式变量（颜色、字体、间距）
```

## 核心功能实现

### 1. 商品浏览 (products/index.tsx)
- **分类筛选**：全部、酒水、咖啡、饮料、小食、餐品、其他
- **商品卡片**：图片、名称、价格、库存状态
- **空状态处理**：无商品时的提示

### 2. 商品详情 (product-detail/index.tsx)
- **规格选择**：多种规格类型（尺寸、温度、甜度、配料等）
- **价格计算**：基础价 + 规格加价
- **加入购物车**：数量选择、规格验证

### 3. 购物车 (cart/index.tsx)
- **商品列表**：展示已选商品、规格、价格
- **数量调整**：增加/减少/删除
- **总价计算**：实时更新
- **结算按钮**：跳转订单提交页面

### 4. 订单列表 (order-list/index.tsx)
- **状态筛选**：全部、待支付、已支付、制作中、待取餐、已完成、已取消
- **订单卡片**：订单号、商品摘要、总价、状态
- **下拉刷新**：重新加载订单数据

### 5. 订单详情 (order-detail/index.tsx)
- **订单信息**：订单号、状态、创建时间
- **商品清单**：商品名称、规格、数量、价格
- **总价显示**：订单总金额
- **状态跟踪**：订单流程进度展示

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Taro | 4.1.9 | 多端框架 |
| React | 18.3.1 | UI 组件库 |
| TypeScript | 5.9.3 | 类型安全 |
| Zustand | 4.5.5 | 客户端状态管理 |
| TanStack Query | 5.90.12 | 服务器状态管理 |
| SCSS | - | 样式系统 |

## 样式变量参考

从 `styles/variables.scss` 提取的关键样式变量：

```scss
// 颜色系统（需在新实现中保持一致）
$primary-color: #1989fa;
$success-color: #07c160;
$warning-color: #ff976a;
$danger-color: #ee0a24;
$text-color: #323233;
$text-light: #969799;
$border-color: #ebedf0;
$background: #f7f8fa;

// 字体大小
$font-size-xs: 20rpx;
$font-size-sm: 24rpx;
$font-size-md: 28rpx;
$font-size-lg: 32rpx;
$font-size-xl: 36rpx;

// 间距
$padding-xs: 16rpx;
$padding-sm: 24rpx;
$padding-md: 32rpx;
$padding-lg: 48rpx;
```

## UI 设计保真度要求

新实现必须达到 **≥95%** 视觉一致性：

1. **布局**：组件位置、大小、间距与原型一致
2. **配色**：颜色值使用 `variables.scss` 中的定义
3. **字体**：字号、字重与原型保持一致
4. **交互**：动画、过渡效果尽量保持（性能优先）

## 重构要点

新实现时需要注意的改进点：

### 1. 代码组织
- **原子设计**：拆分为 atoms/molecules/organisms 组件
- **代码复用**：提取共享组件（如 ProductCard, OrderCard）

### 2. 样式转换
- **CSS → SCSS**：保持样式文件结构
- **px → rpx**：使用公式 `rpx = px * 2`
- **变量提取**：统一使用 `variables.scss`

### 3. 性能优化
- **图片懒加载**：商品列表图片按需加载
- **列表虚拟化**：长列表性能优化
- **缓存策略**：TanStack Query 缓存配置

### 4. 类型安全
- **严格模式**：TypeScript `strict: true`
- **类型导出**：复用 `types/` 中的类型定义
- **API 响应类型**：与 `contracts/api.yaml` 对齐

## 如何使用此参考

1. **UI 参考**：对比页面布局、颜色、字体、间距
2. **功能参考**：理解业务逻辑和数据流
3. **样式提取**：复用 `variables.scss` 中的变量定义
4. **类型复用**：参考 `types/` 中的数据模型定义
5. **Hook 模式**：学习 TanStack Query 的使用方式

## 禁止行为

- ❌ **禁止直接复制粘贴** - 需按原子设计重构
- ❌ **禁止运行此原型** - 缺少完整的 Taro 项目配置
- ❌ **禁止修改原型** - 保持原始状态作为参考基准

## 相关文档

- **功能规格**：`specs/O006-miniapp-channel-order/spec.md`
- **实施计划**：`specs/O006-miniapp-channel-order/plan.md`
- **任务清单**：`specs/O006-miniapp-channel-order/tasks.md`
- **数据模型**：`specs/O006-miniapp-channel-order/data-model.md`
- **API 契约**：`specs/O006-miniapp-channel-order/contracts/api.yaml`

---

**保存日期**：2026-01-02
**状态**：已归档，仅供参考
**维护者**：O006 项目团队
