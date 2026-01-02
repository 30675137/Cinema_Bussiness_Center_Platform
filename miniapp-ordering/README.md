# miniapp-ordering

**@spec O006-miniapp-channel-order**

Cinema Lounge 小程序渠道商品订单管理系统

## 项目概述

基于 Taro 4.1.9 框架的多端小程序应用，支持微信小程序、支付宝小程序和 H5 平台。实现渠道商品浏览、规格选择、购物车管理和订单提交功能。

## 技术栈

- **框架**: Taro 4.1.9
- **UI 库**: React 18.3.1
- **语言**: TypeScript 5.9.3 (严格模式)
- **状态管理**: Zustand 4.5.5 (客户端状态) + TanStack Query 5.90.12 (服务器状态)
- **样式**: SCSS
- **构建工具**: Vite 6.0.0

## 目录结构

```
miniapp-ordering/
├── _prototype/              # 原型代码参考（React web app）
│   ├── src/                # 原型源代码
│   ├── README.md           # 原型说明文档
│   └── SCREENSHOTS.md      # UI 截图参考
├── src/                    # Taro 应用源代码
│   ├── components/         # 组件（原子设计）
│   │   ├── atoms/         # 原子组件
│   │   ├── molecules/     # 分子组件
│   │   └── organisms/     # 有机体组件
│   ├── pages/             # 页面组件
│   ├── services/          # API 服务层
│   ├── stores/            # Zustand 状态管理
│   ├── hooks/             # 自定义 Hooks
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   ├── constants/         # 常量定义
│   ├── assets/            # 静态资源
│   ├── styles/            # 全局样式
│   ├── app.tsx            # 应用入口
│   ├── app.config.ts      # 应用配置
│   └── app.scss           # 全局样式
├── config/                # Taro 构建配置
│   ├── index.ts          # 主配置
│   ├── dev.ts            # 开发环境配置
│   └── prod.ts           # 生产环境配置
├── package.json
├── tsconfig.json         # TypeScript 配置（严格模式）
├── project.config.json   # 微信小程序配置
├── project.alipay.json   # 支付宝小程序配置
└── README.md             # 本文件
```

## 开发命令

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
# 微信小程序
npm run dev:weapp

# 支付宝小程序
npm run dev:alipay

# H5
npm run dev:h5
```

### 生产构建

```bash
# 微信小程序
npm run build:weapp

# 支付宝小程序
npm run build:alipay

# H5
npm run build:h5
```

### 代码质量

```bash
# 运行测试
npm run test

# 测试覆盖率
npm run test:coverage

# ESLint 检查
npm run lint

# ESLint 自动修复
npm run lint:fix
```

## 环境要求

- Node.js >= 18.0.0
- npm >= 8.0.0

## 开发指南

### 代码规范

1. **@spec 注释**: 所有业务逻辑文件必须包含 `@spec O006-miniapp-channel-order` 注释
2. **TypeScript 严格模式**: 启用所有严格类型检查
3. **组件架构**: 遵循原子设计原则（atoms/molecules/organisms）
4. **样式规范**: 使用 SCSS 变量，px → rpx 转换（rpx = px * 2）

### UI 设计保真度

- **视觉一致性要求**: ≥95% 与原型一致
- **参考原型**: `_prototype/SCREENSHOTS.md`
- **样式变量**: `src/styles/variables.scss`（从原型提取）

### API 集成

- **后端 API**: 依赖 O005-channel-product-config 提供的端点
- **API 代理**: 开发环境自动代理 `/api` 到 `http://localhost:8080`
- **认证**: 使用 JWT Token（静默登录）

### 状态管理

- **客户端状态**: Zustand（购物车、UI 状态）
- **服务器状态**: TanStack Query（商品、订单数据）
- **持久化**: Taro.setStorageSync()

## 相关文档

- **功能规格**: `specs/O006-miniapp-channel-order/spec.md`
- **实施计划**: `specs/O006-miniapp-channel-order/plan.md`
- **任务清单**: `specs/O006-miniapp-channel-order/tasks.md`
- **数据模型**: `specs/O006-miniapp-channel-order/data-model.md`
- **API 契约**: `specs/O006-miniapp-channel-order/contracts/api.yaml`
- **原型参考**: `_prototype/README.md` + `_prototype/SCREENSHOTS.md`

## License

MIT

---

**创建日期**: 2026-01-02  
**维护者**: Cinema Business Center Platform Team
