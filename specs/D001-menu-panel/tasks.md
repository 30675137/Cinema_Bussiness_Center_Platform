# Tasks: 菜单面板替换Dashboard页面

**Feature**: D001-menu-panel  
**Branch**: `D001-menu-panel`  
**Generated**: 2026-01-14  
**Status**: Ready for Implementation

---

## 任务概览

| 阶段 | 任务数 | 说明 |
|------|--------|------|
| Phase 1: 项目准备 | 2 | 环境检查、分支切换 |
| Phase 2: 基础设施 | 4 | 类型定义、数据配置、工具函数 |
| Phase 3: User Story 1 | 5 | 查看所有业务模块菜单 (P1) |
| Phase 4: User Story 2 | 3 | 快速访问具体功能 (P1) |
| Phase 5: User Story 3 | 2 | 按业务流程排序的模块展示 (P2) |
| Phase 6: User Story 4 | 3 | 模块状态和统计信息 (P3) |
| Phase 7: 边缘场景处理 | 4 | 权限控制、响应式、错误处理 |
| Phase 8: 测试与优化 | 6 | 单元测试、集成测试、性能优化 |
| **合计** | **29** | **完整实施路径** |

---

## MVP 范围建议

**推荐 MVP 范围**: Phase 1-4 (User Story 1 + User Story 2)

**理由**:
- User Story 1 (P1): 展示所有模块卡片 - 核心价值
- User Story 2 (P1): 点击跳转功能 - 基本可用性
- 可独立测试和交付，满足替换 Dashboard 的最小需求

**后续迭代**:
- Phase 5: User Story 3 (P2) - 优化模块排序
- Phase 6: User Story 4 (P3) - 增强统计信息
- Phase 7-8: 边缘场景 + 完整测试

---

## Phase 1: 项目准备

**目标**: 确保开发环境就绪，切换到正确的功能分支

### 任务清单

- [ ] T001 确认当前在 `D001-menu-panel` 分支，如未切换则执行 `git checkout D001-menu-panel`
- [ ] T002 [P] 安装项目依赖，确认 Ant Design 6.1.0、React Router 7.10.1、Zustand 5.0.9 已安装 (执行 `cd frontend && npm install`)

**验收标准**:
- ✅ 成功切换到 `D001-menu-panel` 分支
- ✅ `frontend/package.json` 中包含所需依赖
- ✅ 运行 `npm run dev` 能正常启动开发服务器

---

## Phase 2: 基础设施 (Foundational Tasks)

**目标**: 创建所有用户故事共享的基础代码和配置

**独立测试标准**: 
- 类型定义可以被 TypeScript 正确编译
- 模块配置数据可以正确导入和读取
- 无 TypeScript 编译错误

### 任务清单

- [ ] T003 [P] 创建 TypeScript 类型定义文件 `frontend/src/types/module.ts`，定义 ModuleCard、FunctionLink、UserPermissions 接口
- [ ] T004 [P] 创建模块静态配置文件 `frontend/src/constants/modules.ts`，配置 12 个业务模块数据（参考 data-model.md 示例）
- [ ] T005 [P] 创建工具函数文件 `frontend/src/utils/permission.ts`，实现 `filterModulesByPermission()` 函数（当前返回所有模块）
- [ ] T006 运行 TypeScript 编译检查，确保所有类型定义正确 (`npm run type-check` 或 `tsc --noEmit`)

**验收标准**:
- ✅ `types/module.ts` 包含 ModuleCard、FunctionLink、UserPermissions 接口定义
- ✅ `constants/modules.ts` 包含 12 个模块的完整配置（每个模块 3-5 个功能链接）
- ✅ `utils/permission.ts` 包含权限过滤函数（当前实现为返回全部模块）
- ✅ 无 TypeScript 类型错误

**12 个业务模块配置清单**:
1. 基础设置与主数据 (basic-settings)
2. 商品管理 MDM/PIM (products)
3. BOM/配方&成本管理 (bom)
4. 场景包/套餐管理 (packages)
5. 价格体系管理 (pricing)
6. 采购与入库管理 (procurement)
7. 库存&仓店库存管理 (inventory)
8. 档期/排期/资源预约 (scheduling)
9. 渠道商品配置 (channels)
10. 订单与履约管理 (orders)
11. 运营&报表/指标看板 (reports)
12. 系统管理/设置/权限 (system)

---

## Phase 3: User Story 1 - 查看所有业务模块菜单 (P1)

**故事目标**: 影院业务人员登录系统后，能看到按业务流程排列的 12 个模块卡片

**独立测试标准**:
- ✅ 访问 `/dashboard` 路径，页面能正常加载
- ✅ 显示 12 个模块卡片，每个卡片包含：名称、描述、图标、功能列表
- ✅ 卡片按照 `order` 字段正确排序（从 1 到 12）
- ✅ 鼠标悬停在卡片上时，显示视觉反馈（阴影、缩放）

### 任务清单

- [ ] T007 [P] [US1] 创建 ModuleCard 组件 `frontend/src/components/common/ModuleCard.tsx`，实现卡片UI（名称、描述、图标、功能列表）
- [ ] T008 [P] [US1] 为 ModuleCard 组件添加悬停样式（boxShadow、transform）和过渡动画
- [ ] T009 [P] [US1] 创建样式文件 `frontend/src/components/common/ModuleCard.module.css` 或使用 Ant Design 的 style props
- [ ] T010 [US1] 替换 Dashboard 页面 `frontend/src/pages/Dashboard/index.tsx`，使用 Ant Design Row/Col 栅格系统渲染 ModuleCard 列表
- [ ] T011 [US1] 在 Dashboard 页面中实现响应式布局（xs=24, sm=12, md=8, lg=6），确保不同屏幕尺寸下正确显示

**验收标准**:
- ✅ ModuleCard 组件能正确渲染模块信息
- ✅ Dashboard 页面显示 12 个模块卡片
- ✅ 卡片按照 order 字段排序（基础设置 → 系统管理）
- ✅ 悬停时卡片有阴影和上移效果
- ✅ 在 1920x1080 分辨率下显示 4 列，1366x768 显示 3 列

**测试场景**:
```typescript
// Acceptance Scenario 1
Given: 用户登录并进入系统首页
When: 页面加载完成
Then: 用户看到 12 个按业务流程排列的模块卡片

// Acceptance Scenario 2
Given: 用户在菜单面板页面
When: 浏览模块卡片
Then: 每个卡片显示模块名称、描述、图标和功能列表

// Acceptance Scenario 3
Given: 用户查看模块卡片
When: 鼠标悬停在某个模块上
Then: 卡片有视觉反馈（阴影、缩放）
```

---

## Phase 4: User Story 2 - 快速访问具体功能 (P1)

**故事目标**: 用户能从菜单面板直接点击模块卡片或功能链接，跳转到对应页面

**独立测试标准**:
- ✅ 点击任意模块卡片，能跳转到该模块的默认页面
- ✅ 点击卡片内的功能链接，能跳转到具体功能页面
- ✅ 跳转后可通过面包屑返回菜单面板
- ✅ 点击响应时间 < 300ms

### 任务清单

- [ ] T012 [P] [US2] 在 ModuleCard 组件中实现卡片点击事件，调用 `navigate(module.defaultPath)`
- [ ] T013 [P] [US2] 在 ModuleCard 组件中实现功能链接点击事件，调用 `navigate(functionLink.path)`
- [ ] T014 [US2] 验证所有模块的 `defaultPath` 和功能链接路径在路由表中已定义（如不存在则添加占位页面）

**验收标准**:
- ✅ 点击卡片能正确跳转到默认页面
- ✅ 点击功能链接能正确跳转到对应页面
- ✅ 跳转后 URL 地址栏路径正确
- ✅ 点击响应即时，无明显延迟

**测试场景**:
```typescript
// Acceptance Scenario 1
Given: 用户在菜单面板页面
When: 点击某个模块卡片
Then: 系统跳转到该模块的默认页面

// Acceptance Scenario 2
Given: 用户在菜单面板页面
When: 点击模块卡片内的具体功能链接（例如"SPU管理"）
Then: 系统直接跳转到该功能页面

// Acceptance Scenario 3
Given: 用户访问某个功能页面后返回
When: 点击面包屑中的"首页"或"工作台"
Then: 返回到菜单面板页面
```

---

## Phase 5: User Story 3 - 按业务流程排序的模块展示 (P2)

**故事目标**: 模块按照业务执行的先后顺序排列，帮助用户快速掌握业务流程

**独立测试标准**:
- ✅ 模块顺序符合业务流程逻辑
- ✅ 新用户能通过模块顺序理解业务上下游关系
- ✅ 排序逻辑稳定，不会因数据加载顺序而改变

### 任务清单

- [ ] T015 [P] [US3] 在 Dashboard 页面中添加模块排序逻辑 `modules.sort((a, b) => a.order - b.order)`
- [ ] T016 [US3] 为每个模块的 `description` 字段添加业务关系说明（例如："先配置商品，再配置 BOM"）

**验收标准**:
- ✅ 模块排列顺序为：1)基础设置 2)商品管理 3)BOM管理 ... 12)系统管理
- ✅ 相邻模块能体现业务上下游关系
- ✅ 模块描述文案清晰易懂

**测试场景**:
```typescript
// Acceptance Scenario 1
Given: 用户查看菜单面板
When: 从上到下、从左到右浏览模块
Then: 模块排列顺序符合业务流程

// Acceptance Scenario 2
Given: 用户阅读模块描述
When: 查看相邻模块的关系
Then: 能够理解业务上下游关系
```

---

## Phase 6: User Story 4 - 模块状态和统计信息 (P3)

**故事目标**: 在模块卡片上显示简要统计信息或待办事项，方便用户快速了解工作状态

**独立测试标准**:
- ✅ 有待办事项的模块显示角标
- ✅ 统计数据准确反映系统状态
- ✅ 开发中的模块显示"开发中"标签

### 任务清单

- [ ] T017 [P] [US4] 在 ModuleCard 组件中添加 Badge 角标渲染逻辑，支持 `module.badge` 和 `functionLink.badge`
- [ ] T018 [P] [US4] 在 ModuleCard 组件中添加状态标签渲染，当 `status === 'developing'` 时显示 Tag 组件
- [ ] T019 [US4] 为部分模块配置示例统计数据（例如：库存模块显示总库存数、订单模块显示待处理订单数）

**验收标准**:
- ✅ 开发中的模块显示橙色 "开发中" Tag
- ✅ 有待办事项的模块显示红点或数字角标
- ✅ 统计数据与实际业务状态一致（当前可使用模拟数据）

**测试场景**:
```typescript
// Acceptance Scenario 1
Given: 用户查看菜单面板
When: 有待处理的业务（例如待审核的价格、待处理的订单）
Then: 相关模块卡片上显示角标或数字提示

// Acceptance Scenario 2
Given: 用户查看模块卡片
When: 卡片显示统计数据（例如库存总量、商品数量）
Then: 数据反映当前系统的真实状态
```

---

## Phase 7: 边缘场景处理

**目标**: 处理权限控制、响应式适配、错误场景等边缘情况

**独立测试标准**:
- ✅ 无权限模块被正确隐藏或禁用
- ✅ 在不同屏幕尺寸下布局正常
- ✅ 加载失败时显示错误提示

### 任务清单

- [ ] T020 [P] 实现权限过滤逻辑，在 Dashboard 页面中调用 `filterModulesByPermission()` 过滤模块（当前阶段返回全部，预留接口）
- [ ] T021 [P] 为响应式布局添加 CSS 媒体查询测试，验证在 1920x1080、1366x768、2560x1440 分辨率下的显示效果
- [ ] T022 [P] 在 Dashboard 页面中添加错误边界 (Error Boundary) 或 try-catch，捕获模块加载失败的情况
- [ ] T023 创建错误提示组件，当模块加载失败时显示错误消息和重试按钮

**验收标准**:
- ✅ 权限过滤函数正确实现（当前返回全部模块，逻辑正确）
- ✅ 在不同分辨率下卡片布局无溢出或重叠
- ✅ 加载失败时显示友好的错误提示

**边缘场景清单**:
- 无权限访问某些模块时 → 隐藏或灰色显示
- 模块功能开发中 → 显示"开发中"标签
- 大屏幕和小屏幕适配 → 响应式布局
- 菜单面板加载失败 → 显示错误提示和重试按钮

---

## Phase 8: 测试与优化

**目标**: 编写单元测试和集成测试，优化性能

**独立测试标准**:
- ✅ 单元测试覆盖率 ≥ 80%
- ✅ 所有关键交互有测试覆盖
- ✅ 性能指标达标（加载 < 2秒，响应 < 300ms）

### 任务清单

#### 单元测试

- [ ] T024 [P] 创建 ModuleCard 组件单元测试 `frontend/src/components/common/ModuleCard.test.tsx`，测试渲染、点击、悬停行为
- [ ] T025 [P] 创建权限过滤函数单元测试 `frontend/src/utils/permission.test.ts`，测试权限过滤逻辑
- [ ] T026 [P] 创建 Dashboard 页面集成测试 `frontend/src/pages/Dashboard/Dashboard.test.tsx`，测试完整的页面渲染和交互

#### 性能优化

- [ ] T027 [P] 为 ModuleCard 组件添加 `React.memo` 优化，避免不必要的重渲染
- [ ] T028 使用 React DevTools Profiler 分析页面渲染性能，确保首次渲染 FCP < 1秒
- [ ] T029 运行性能测试，验证页面加载时间 < 2秒，点击响应 < 300ms

**验收标准**:
- ✅ 所有单元测试通过 (`npm run test`)
- ✅ 测试覆盖率 ≥ 80% (`npm run test:coverage`)
- ✅ 页面加载时间 < 2秒
- ✅ 卡片点击响应 < 300ms
- ✅ 首次渲染 FCP < 1秒

**测试清单**:
```typescript
// ModuleCard.test.tsx
- ✅ should render module name and description
- ✅ should render icon and function links
- ✅ should navigate to defaultPath when card clicked
- ✅ should navigate to specific path when link clicked
- ✅ should show hover effect on mouse enter
- ✅ should display badge when module.badge exists
- ✅ should display "developing" tag when status is developing

// Dashboard.test.tsx
- ✅ should render all 12 module cards
- ✅ should sort modules by order field
- ✅ should filter modules by permissions (预留测试)
- ✅ should display error message on load failure
- ✅ should be responsive on different screen sizes
```

---

## 任务依赖关系

### 依赖图

```
Phase 1 (项目准备)
    ↓
Phase 2 (基础设施)
    ↓
Phase 3 (US1) ← MVP 核心
    ↓
Phase 4 (US2) ← MVP 核心
    ↓
Phase 5 (US3) ← 可选增强
    ↓
Phase 6 (US4) ← 可选增强
    ↓
Phase 7 (边缘场景) ← 完善
    ↓
Phase 8 (测试优化) ← 质量保障
```

### 并行执行机会

**Phase 2 中可并行执行**:
- T003 (类型定义) + T004 (模块配置) + T005 (工具函数) → 3 个独立文件，无依赖

**Phase 3 中可并行执行**:
- T007 (ModuleCard 组件) + T008 (悬停样式) + T009 (样式文件) → 同一组件的不同部分

**Phase 7 中可并行执行**:
- T020 (权限过滤) + T021 (响应式测试) + T022 (错误边界) → 3 个独立功能

**Phase 8 中可并行执行**:
- T024 (ModuleCard 测试) + T025 (权限测试) + T026 (Dashboard 测试) → 3 个独立测试文件
- T027 (React.memo 优化) + T028 (性能分析) → 优化任务可并行

---

## 实施策略

### 增量交付方式

**Iteration 1 (MVP - 1-2天)**:
- Phase 1-4: 基础菜单面板 + 点击跳转
- **交付价值**: 替换 Dashboard，用户能查看和访问所有模块

**Iteration 2 (增强 - 0.5-1天)**:
- Phase 5-6: 优化排序 + 添加统计信息
- **交付价值**: 提升用户体验和信息密度

**Iteration 3 (完善 - 0.5-1天)**:
- Phase 7-8: 边缘场景 + 完整测试
- **交付价值**: 生产就绪，覆盖所有场景

### 并行开发建议

如果有多位开发者:
- **开发者 A**: Phase 2-3 (基础设施 + ModuleCard 组件)
- **开发者 B**: Phase 4 (点击跳转功能)
- **开发者 C**: Phase 8 (测试编写)

---

## 验收清单

### 功能验收

- [ ] 页面能正常加载，显示 12 个模块卡片
- [ ] 卡片按照 order 字段正确排序
- [ ] 鼠标悬停时显示 hover 效果
- [ ] 点击卡片能正确跳转到对应路径
- [ ] 点击功能链接能正确跳转
- [ ] 权限过滤逻辑正常工作（预留）
- [ ] 响应式布局在不同屏幕尺寸下正常显示
- [ ] 开发中的模块显示"开发中"标签
- [ ] 待办事项显示角标

### 代码质量验收

- [ ] 所有新增文件包含 `@spec D001-menu-panel` 注释
- [ ] TypeScript 类型定义完整，无 `any` 类型
- [ ] 通过 ESLint 和 Prettier 检查 (`npm run lint`)
- [ ] 所有组件都有对应的单元测试
- [ ] 测试覆盖率 ≥ 80%

### 性能验收

- [ ] 页面首次加载时间 < 2 秒
- [ ] 卡片点击响应时间 < 300 毫秒
- [ ] 首次渲染 FCP < 1 秒
- [ ] 无控制台错误或警告
- [ ] 支持 100 并发用户访问（压力测试可选）

### 宪法合规验收

- [ ] ✅ 功能分支绑定：所有代码在 `D001-menu-panel` 分支
- [ ] ✅ 代码归属标识：所有文件包含 `@spec D001-menu-panel` 注释
- [ ] ✅ 测试驱动开发：所有组件有单元测试
- [ ] ✅ 组件化架构：遵循 React 组件化设计
- [ ] ✅ 代码质量：TypeScript 类型完整，通过 ESLint 检查

---

## 总结

- **总任务数**: 29 个
- **MVP 任务数**: 14 个 (Phase 1-4)
- **并行执行任务**: 12 个 (标记 [P])
- **用户故事覆盖**: 4 个 (US1, US2, US3, US4)
- **预计工时**: 2-4 天 (MVP 1-2天，完整版 2-4天)

**关键路径**: Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 8 (测试)

**快速交付建议**: 专注于 Phase 1-4，实现 MVP 后尽快交付，然后再迭代 Phase 5-8。
