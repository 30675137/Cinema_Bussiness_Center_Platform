# Implementation Tasks: UI框架统一升级

**Branch**: `001-ui-framework-upgrade` | **Date**: 2025-12-10
**Spec**: [链接](./spec.md) | **Plan**: [链接](./plan.md)

**Implementation Strategy**: MVP优先 - 先完成用户故事1实现基础技术栈，然后增量交付

## Phase 1: Setup (Project Initialization)

*Goal: 建立项目基础结构和开发环境*

- [X] T001 更新frontend/Cinema_Operation_Admin/package.json添加宪章要求的技术栈依赖
- [X] T002 [P] 配置Vite构建工具在frontend/Cinema_Operation_Admin/vite.config.ts
- [X] T003 [P] 配置TypeScript编译选项在frontend/Cinema_Operation_Admin/tsconfig.json
- [X] T004 配置PostCSS和Tailwind CSS在frontend/Cinema_Operation_Admin/postcss.config.js
- [X] T005 创建Tailwind CSS配置文件在frontend/Cinema_Operation_Admin/tailwind.config.js
- [X] T006 [P] 创建全局样式文件在frontend/Cinema_Operation_Admin/src/styles/globals.css
- [X] T007 [P] 设置项目目录结构在frontend/Cinema_Operation_Admin/src/
- [X] T008 [P] 配置路径别名在vite.config.ts和tsconfig.json中

## Phase 2: Foundational (Blocking Prerequisites)

*Goal: 完成所有用户故事都需要的基础设施*

- [X] T009 创建TypeScript类型定义目录在frontend/Cinema_Operation_Admin/src/types/
- [X] T010 [P] 创建Mock数据目录结构在frontend/Cinema_Operation_Admin/src/mock/data/
- [X] T011 [P] 创建工具函数目录在frontend/Cinema_Operation_Admin/src/utils/
- [X] T012 [P] 创建服务层目录在frontend/Cinema_Operation_Admin/src/services/
- [X] T013 [P] 创建组件目录在frontend/Cinema_Operation_Admin/src/components/
- [X] T014 [P] 创建状态管理目录在frontend/Cinema_Operation_Admin/src/stores/
- [X] T015 [P] 创建自定义Hooks目录在frontend/Cinema_Operation_Admin/src/hooks/
- [X] T016 [P] 创建页面目录在frontend/Cinema_Operation_Admin/src/pages/

## Phase 3: User Story 1 - UI框架统一配置 (Priority: P1)

*Goal: 升级现有前端项目到统一的UI技术栈，确保所有组件都使用Ant Design 6.x + Tailwind CSS 4*

**Independent Test Criteria**: 验证package.json依赖版本、基础组件渲染和样式加载，项目能够正常启动

### Setup Tasks
- [X] T017 [US1] 安装React 18核心依赖在frontend/Cinema_Operation_Admin/package.json
- [X] T018 [US1] [P] 安装Ant Design 5.x（为6.x预留升级空间）在package.json
- [X] T019 [US1] [P] 安装Tailwind CSS 3.x（为4.x预留升级空间）在package.json
- [X] T020 [US1] 安装TypeScript 5.0相关依赖在package.json
- [X] T021 [US1] [P] 安装Zustand状态管理库在package.json
- [X] T022 [US1] [P] 安装TanStack Query数据管理库在package.json
- [X] T023 [US1] 安装React Router 6路由库在package.json

### Configuration Tasks
- [X] T024 [US1] 配置Tailwind CSS层级管理以解决与Ant Design样式冲突在src/styles/globals.css
- [X] T025 [US1] 配置Ant Design主题同步Tailwind颜色系统在src/App.tsx
- [X] T026 [US1] [P] 配置CSS导入顺序确保样式正确应用在src/main.tsx
- [X] T027 [US1] [P] 配置构建优化设置在vite.config.ts

### Basic Component Tests
- [X] T028 [US1] 创建基础组件测试页面在src/App.tsx
- [X] T029 [US1] [P] 渲染Ant Design Button组件验证依赖正确性在测试页面
- [X] T030 [US1] [P] 应用Tailwind utility classes验证样式系统在测试页面
- [X] T031 [US1] 验证响应式设计正常工作在测试页面

## Phase 4: User Story 2 - 组件库标准化 (Priority: P2)

*Goal: 创建标准化的业务组件库，包括通用布局组件、表单组件、表格组件等*

**Independent Test Criteria**: 各个标准化组件能够正确渲染并保持一致的样式，布局结构统一

### Core Utility Components
- [X] T032 [US2] 创建类名合并工具函数在src/utils/cn.ts
- [X] T033 [US2] [P] 创建格式化工具函数在src/utils/format.ts
- [X] T034 [US2] [P] 创建常量定义文件在src/utils/constants.ts

### Data Table Component
- [X] T035 [US2] 创建DataTable组件基础结构在src/components/ui/DataTable/index.tsx
- [X] T036 [US2] [P] 实现DataTable列配置类型定义在src/components/ui/DataTable/types.ts
- [X] T037 [US2] [P] 实现DataTable数据渲染逻辑在index.tsx
- [X] T038 [US2] [P] 添加DataTable分页功能在index.tsx
- [X] T039 [US2] [P] 添加DataTable排序功能在index.tsx
- [X] T040 [US2] [P] 添加DataTable选择功能在index.tsx
- [X] T041 [US2] 创建DataTable组件导出文件在src/components/ui/DataTable/index.ts

### Form Component
- [X] T042 [US2] 创建FormField组件基础结构在src/components/ui/FormField/index.tsx
- [X] T043 [US2] [P] 实现FormField输入类型支持在index.tsx
- [X] T044 [US2] [P] 实现FormField选择器类型支持在index.tsx
- [X] T045 [US2] [P] 实现FormField验证规则支持在index.tsx
- [X] T046 [US2] [P] 添加FormField禁用状态支持在index.tsx
- [X] T047 [US2] 创建FormField组件导出文件在src/components/ui/FormField/index.ts

### Card Component
- [X] T048 [US2] 创建Card组件基础结构在src/components/ui/Card/index.tsx
- [X] T049 [US2] [P] 实现Card标题和内容区域在index.tsx
- [X] T050 [US2] [P] 添加Card操作按钮区域支持在index.tsx
- [X] T051 [US2] [P] 实现Card不同尺寸和样式变体在index.tsx

### Layout Components
- [X] T052 [US2] 创建AppLayout主布局组件在src/components/layout/AppLayout/index.tsx
- [X] T053 [US2] [P] 实现Sidebar侧边栏组件在src/components/layout/Sidebar/index.tsx
- [X] T054 [US2] [P] 实现Header顶部导航组件在src/components/layout/Header/index.tsx
- [X] T055 [US2] [P] 实现Breadcrumb面包屑组件在src/components/layout/Breadcrumb/index.tsx
- [X] T056 [US2] [P] 集成响应式设计支持在所有布局组件中

### Component Library Integration
- [X] T057 [US2] 创建组件库统一导出文件在src/components/ui/index.ts
- [X] T058 [US2] [P] 创建布局组件统一导出文件在src/components/layout/index.ts
- [X] T059 [US2] 创建组件库使用示例页面在src/pages/ComponentShowcase/index.tsx
- [X] T060 [US2] [P] 验证所有组件样式一致性在示例页面

## Phase 5: User Story 3 - 状态管理系统集成 (Priority: P3)

*Goal: 集成Zustand状态管理和TanStack Query数据管理，统一管理应用状态和服务端数据*

**Independent Test Criteria**: 状态更新能够正确响应界面变化，数据能够正确加载并显示

### Zustand Store Setup
- [ ] T061 [US3] 创建应用全局状态Store在src/stores/appStore.ts
- [ ] T062 [US3] [P] 创建产品管理状态Store在src/stores/productStore.ts
- [ ] T063 [US3] [P] 实现Store类型安全和中间件配置在appStore.ts
- [ ] T064 [US3] [P] 添加状态持久化支持在appStore.ts
- [ ] T065 [US3] 创建Store统一导出文件在src/stores/index.ts

### TanStack Query Setup
- [ ] T066 [US3] 配置QueryClient客户端在src/services/api.ts
- [ ] T067 [US3] [P] 创建查询键工厂在src/services/queryKeys.ts
- [ ] T068 [US3] [P] 实现API错误处理机制在api.ts
- [ ] T069 [US3] [P] 配置查询默认选项在api.ts

### Custom Hooks Implementation
- [ ] T070 [US3] 创建产品数据查询Hook在src/hooks/api/useProducts.ts
- [ ] T071 [US3] [P] 创建产品创建Mutation Hook在src/hooks/mutations/useCreateProduct.ts
- [ ] T072 [US3] [P] 创建产品更新Mutation Hook在src/hooks/mutations/useUpdateProduct.ts
- [ ] T073 [US3] [P] 创建产品删除Mutation Hook在src/hooks/mutations/useDeleteProduct.ts
- [ ] T074 [US3] 创建Store Hooks封装在src/hooks/stores/useAppStore.ts
- [ ] T075 [US3] [P] 创建Store Hooks封装在src/hooks/stores/useProductStore.ts

### Mock API Integration
- [ ] T076 [US3] 创建Mock API服务在src/services/mockApi.ts
- [ ] T077 [US3] [P] 实现产品数据Mock接口在mockApi.ts
- [ ] T078 [US3] [P] 实现用户数据Mock接口在mockApi.ts
- [ ] T079 [US3] [P] 实现导航菜单Mock接口在mockApi.ts

### State Management Integration
- [ ] T080 [US3] 创建状态管理提供者组件在src/components/StateProvider/index.tsx
- [ ] T081 [US3] [P] 集成QueryClient到应用根组件在src/App.tsx
- [ ] T082 [US3] [P] 实现错误边界组件处理状态管理错误
- [ ] T083 [US3] 创建状态管理测试页面验证数据流在src/pages/StateManagementTest/index.tsx

## Phase 6: Mock Data Implementation

*Goal: 创建完整的Mock数据文件用于UI展示测试*

### Mock Data Files
- [ ] T084 创建产品列表Mock数据在src/mock/data/products/product-list.json
- [ ] T085 [P] 创建产品分类Mock数据在src/mock/data/products/product-categories.json
- [ ] T086 [P] 创建用户列表Mock数据在src/mock/data/users/user-list.json
- [ ] T087 [P] 创建用户角色Mock数据在src/mock/data/users/user-roles.json
- [ ] T088 [P] 创建导航菜单Mock数据在src/mock/data/navigation/navigation-menu.json
- [ ] T089 [P] 创建仪表板统计Mock数据在src/mock/data/dashboard/dashboard-stats.json

### Mock Data Types
- [ ] T090 创建Mock数据类型定义在src/types/mock-data-types.ts
- [ ] T091 [P] 创建Mock数据生成工具函数在src/utils/mockDataGenerator.ts

## Phase 7: Implementation Example Pages

*Goal: 创建完整的示例页面验证整个技术栈集成*

### Dashboard Page
- [ ] T092 创建仪表板页面结构在src/pages/Dashboard/index.tsx
- [ ] T093 [P] 实现仪表板统计数据展示在index.tsx
- [ ] T094 [P] 集成响应式图表组件在index.tsx

### Products Page
- [ ] T095 创建产品管理页面结构在src/pages/Products/index.tsx
- [ ] T096 [P] 集成DataTable组件展示产品列表在index.tsx
- [ ] T097 [P] 实现产品搜索和筛选功能在index.tsx
- [ ] T098 [P] 集成FormField组件实现产品创建表单在index.tsx

### Routing Setup
- [ ] T099 配置React Router路由在src/router/index.tsx
- [ ] T100 [P] 设置路由守卫和权限控制在index.tsx
- [ ] T101 [P] 实现动态面包屑导航在App.tsx

## Phase 8: Polish & Cross-Cutting Concerns

*Goal: 完善开发体验和代码质量*

### Documentation
- [ ] T102 创建组件使用文档在src/components/ui/README.md
- [ ] T103 [P] 创建状态管理使用文档在src/stores/README.md
- [ ] T104 [P] 创建API服务使用文档在src/services/README.md

### Performance Optimization
- [ ] T105 配置组件懒加载在路由层面
- [ ] T106 [P] 优化Bundle大小和代码分割在vite.config.ts
- [ ] T107 [P] 实现组件记忆化优化性能

### Error Handling
- [ ] T108 实现全局错误处理机制在src/utils/errorHandler.ts
- [ ] T109 [P] 创建用户友好的错误提示组件
- [ ] T110 [P] 实现网络请求重试机制

### Development Tools
- [ ] T111 配置ESLint和Prettier代码规范
- [ ] T112 [P] 创建开发环境调试工具配置
- [ ] T113 [P] 设置代码检查和自动化测试脚本

## Dependencies

### Story Completion Order
1. **Phase 1-2** (Setup & Foundational) - Must complete first
2. **User Story 1** (Phase 3) - Foundation for all other stories
3. **User Story 2** (Phase 4) - Depends on Story 1 completion
4. **User Story 3** (Phase 5) - Depends on Story 1 completion
5. **Phase 6-8** - Can be parallel after core stories

### Parallel Execution Opportunities

**Within User Story 1**:
- T018, T019, T020 can be parallel (installing different dependencies)
- T026, T027 can be parallel (configuration tasks)
- T029, T030, T031 can be parallel (different component tests)

**Within User Story 2**:
- T032, T033, T034 can be parallel (utility functions)
- T035, T042, T048 can be parallel (different component creation)
- T053, T054, T055 can be parallel (different layout components)

**Within User Story 3**:
- T061, T062 can be parallel (different stores)
- T066, T067, T068 can be parallel (API configuration)
- T070, T074, T075 can be parallel (different hooks)

**Within Phase 6**:
- T084, T085, T086, T087, T088, T089 can be parallel (different mock data files)

**Within Phase 7**:
- T092, T095 can be parallel (different pages)
- T099, T100 can be parallel (routing tasks)

## Independent Test Criteria Per Story

**User Story 1**:
- ✅ 项目启动成功，无依赖错误
- ✅ Ant Design组件正常渲染
- ✅ Tailwind CSS样式正确应用
- ✅ 响应式设计正常工作

**User Story 2**:
- ✅ 所有标准化组件渲染一致
- ✅ 布局组件正确显示导航和面包屑
- ✅ 表格和表单组件功能完整
- ✅ 组件样式符合设计规范

**User Story 3**:
- ✅ Zustand状态更新正确响应
- ✅ TanStack Query数据正确加载
- ✅ 错误处理机制正常工作
- ✅ 状态管理架构清晰

## MVP Scope (First Deliverable)

**Minimum Viable Product** = Phase 1-3 + T084-T086 (Basic mock data)

This delivers:
- ✅ Working React 18 + TypeScript 5.0 + Ant Design + Tailwind CSS setup
- ✅ Basic project structure and configuration
- ✅ Technology stack compliance with constitution
- ✅ Simple mock data for testing
- ✅ Basic component rendering verification

**Estimated effort**: ~30-40 tasks (Phase 1-3 + basic mock data)

## Total Tasks

**Summary**:
- **Total Tasks**: 113
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 8 tasks
- **Phase 3 (User Story 1)**: 15 tasks
- **Phase 4 (User Story 2)**: 29 tasks
- **Phase 5 (User Story 3)**: 24 tasks
- **Phase 6 (Mock Data)**: 7 tasks
- **Phase 7 (Example Pages)**: 10 tasks
- **Phase 8 (Polish)**: 12 tasks

**Parallel Opportunities**: ~60% of tasks can be executed in parallel within their phases
**Critical Path**: ~45 tasks must be executed sequentially
**MVP Tasks**: ~35 tasks for minimum viable delivery