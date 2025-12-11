# 影院商品管理中台

一个基于React 18 + TypeScript 5.0 + Ant Design 6.1.0的现代化影院商品管理中台系统。

## 🚀 技术栈

### 核心框架
- **React 18.2.0** - 使用最新的并发特性和Hooks
- **TypeScript 5.0.4** - 严格模式，完整类型安全
- **Ant Design 6.1.0** - 企业级UI组件库
- **Vite 6.0.7** - 现代化构建工具
- **Tailwind CSS 4.1.17** - 原子化CSS框架

### 状态管理
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 数据获取和缓存

### 路由导航
- **React Router 6** - 声明式路由
- **自定义导航系统** - 支持权限控制、收藏、搜索

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Playwright** - E2E测试
- **Vitest** - 单元测试

## 📁 项目结构

```
frontend/Cinema_Operation_Admin/
├── src/
│   ├── components/           # 组件库
│   │   ├── common/          # 通用组件
│   │   │   ├── Image/       # 优化图片组件
│   │   │   ├── List/        # 优化列表组件
│   │   │   ├── Modal/       # 优化模态框组件
│   │   │   └── ...
│   │   ├── layout/          # 布局组件
│   │   │   ├── Sidebar/     # 侧边栏导航
│   │   │   ├── Header/      # 头部导航
│   │   │   └── ...
│   │   └── ui/              # 基础UI组件
│   ├── hooks/               # 自定义Hooks
│   │   ├── useNavigation.ts    # 导航Hook
│   │   ├── usePerformance.ts   # 性能监控Hook
│   │   └── ...
│   ├── pages/               # 页面组件
│   ├── services/            # API服务
│   ├── stores/              # 状态管理
│   ├── types/               # TypeScript类型
│   ├── utils/               # 工具函数
│   └── styles/              # 全局样式
├── tests/                   # 测试文件
│   ├── e2e/                 # E2E测试
│   └── unit/                # 单元测试
├── docs/                    # 项目文档
├── scripts/                 # 构建脚本
└── dist/                    # 构建输出
```

## 🎯 核心功能

### 🧭 智能导航系统
- **响应式侧边栏** - 自适应桌面/平板/移动端
- **权限控制** - 基于角色的菜单访问控制
- **搜索功能** - 实时菜单搜索，支持中英文
- **收藏管理** - 常用菜单快速访问
- **面包屑导航** - 清晰的页面层级指示

### 🎨 现代化UI组件
- **OptimizedModal** - 支持性能监控和内存管理
- **OptimizedList** - 虚拟滚动，智能分页
- **OptimizedImage** - WebP支持，懒加载，CDN集成
- **响应式布局** - 完美适配各种设备

### ⚡ 性能优化
- **React.memo** - 智能组件记忆化
- **useMemo/useCallback** - 渲染性能优化
- **代码分割** - 按需加载
- **性能监控** - 实时性能指标追踪

## 🛠️ 开发指南

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd Cinema_Bussiness_Center_Platform/frontend/Cinema_Operation_Admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 启动开发服务器（自动打开浏览器）
npm run dev:open

# 构建生产版本
npm run build

# 运行测试
npm test

# 代码检查
npm run lint

# 代码格式化
npm run format
```

### 可用脚本

```bash
# 开发相关
npm run dev              # 启动开发服务器
npm run dev:open         # 启动并自动打开浏览器
npm run preview          # 预览生产构建

# 构建相关
npm run build            # 构建生产版本
npm run build:analyze    # 分析构建包大小
npm run build:report     # 生成构建报告

# 测试相关
npm run test             # 运行所有测试
npm run test:unit        # 运行单元测试
npm run test:e2e         # 运行E2E测试
npm run test:coverage    # 生成测试覆盖率报告

# 代码质量
npm run lint             # ESLint检查
npm run lint:fix         # 自动修复ESLint问题
npm run format           # Prettier格式化
npm run type-check       # TypeScript类型检查

# 工具脚本
npm run clean            # 清理构建文件
npm run analyze:bundle   # 分析包大小
```

## 📊 性能优化特性

### 1. 组件优化
- **智能记忆化** - React.memo自动避免不必要渲染
- **Hook优化** - useMemo/useCallback优化计算和函数
- **懒加载** - 按需加载大型组件

### 2. 图片优化
- **WebP支持** - 自动选择最优图片格式
- **懒加载** - 视口外图片延迟加载
- **响应式图片** - 根据设备尺寸选择合适图片
- **CDN集成** - 图片加速分发

### 3. 数据优化
- **虚拟滚动** - 大列表性能优化
- **智能分页** - 减少单次数据加载量
- **缓存策略** - 智能数据缓存和更新

### 4. 构建优化
- **Tree Shaking** - 自动移除无用代码
- **代码分割** - 按路由分割代码包
- **压缩优化** - 代码和资源压缩

## 🧪 测试策略

### E2E测试覆盖
- **导航功能** - 侧边栏、搜索、收藏
- **响应式布局** - 多设备适配测试
- **移动端体验** - 触控交互、抽屉导航
- **性能监控** - 加载时间、交互响应

### 单元测试覆盖
- **组件测试** - React组件渲染和交互
- **Hook测试** - 自定义Hook逻辑
- **工具函数** - 纯函数逻辑测试
- **API服务** - 数据获取和错误处理

## 📱 响应式设计

### 断点设计
- **Mobile**: < 768px - 抽屉式导航
- **Tablet**: 768px - 992px - 紧凑侧边栏
- **Desktop**: > 992px - 完整布局

### 移动端优化
- **触摸友好** - 按钮大小符合触摸标准
- **手势支持** - 滑动、长按等手势
- **离线支持** - PWA功能支持

## 🔧 配置说明

### TypeScript配置
- 启用严格模式
- 路径映射支持
- 声明文件合并

### Tailwind CSS配置
- 自定义主题
- 响应式工具类
- 组件级样式隔离

### Vite配置
- 开发服务器优化
- 构建性能优化
- 插件集成

## 📈 性能指标

### 目标指标
- **FCP** < 1.5s - 首次内容绘制
- **LCP** < 2.5s - 最大内容绘制
- **FID** < 100ms - 首次输入延迟
- **CLS** < 0.1 - 累积布局偏移

### 监控工具
- Chrome DevTools
- Lighthouse
- 自定义性能监控Hook

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建功能分支
3. 编写代码和测试
4. 提交Pull Request
5. 代码审查和合并

### 代码规范
- 遵循ESLint规则
- 使用TypeScript严格模式
- 编写单元测试
- 添加必要的注释

## 📝 更新日志

### v1.0.0 (2025-12-11)
- ✨ 初始版本发布
- 🚀 基于React 18 + TypeScript 5.0 + Ant Design 6.1.0
- 🧭 完整的导航系统
- 📱 响应式设计支持
- ⚡ 性能优化体系
- 🧪 完整的测试覆盖

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系我们

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 技术支持: [Support Email]

---

## 🎯 开发计划

### 即将推出
- [ ] 更多业务模块集成
- [ ] 国际化支持
- [ ] 主题定制功能
- [ ] 高级数据可视化

### 长期规划
- [ ] 微前端架构升级
- [ ] 云原生部署支持
- [ ] AI功能集成
- [ ] 实时协作功能

---

**构建时间**: 2025-12-11
**版本**: 1.0.0
**维护者**: 影院商品管理中台开发团队