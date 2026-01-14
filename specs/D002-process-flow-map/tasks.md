# Implementation Tasks: 业务端到端流程地图

**Feature**: D002-process-flow-map  
**Created**: 2026-01-14  
**Status**: Ready for Implementation  
**Estimated Total Time**: 4-6 hours

---

## 📋 Task Summary

| Phase | Tasks | Parallelizable | Story | Estimated Time |
|-------|-------|----------------|-------|----------------|
| Phase 1: Setup | 3 | 0 | - | 20 min |
| Phase 2: Foundational | 4 | 3 | - | 45 min |
| Phase 3: US1 | 6 | 3 | US1 | 90 min |
| Phase 4: US2 | 5 | 2 | US2 | 60 min |
| Phase 5: US3 | 2 | 0 | US3 | 20 min |
| Phase 6: US4 | 3 | 1 | US4 | 30 min |
| Phase 7: Polish | 4 | 2 | - | 45 min |
| **Total** | **27** | **11** | **4 stories** | **5.5 hours** |

---

## 🎯 User Story Dependencies

```text
US1 (查看业务流程地图) ← [BLOCKS] ← US3 (点击节点快速进入)
  ↓ (parallel)
US2 (在两种视图间切换)
  ↓ (independent)
US4 (响应式布局支持)
```

**Recommended Implementation Order**:
1. **MVP (First Iteration)**: US1 + US2 → 实现核心功能，可立即交付使用
2. **Enhancement**: US3 → 增强交互体验
3. **Polish**: US4 → 完善响应式支持

**Parallel Opportunities**:
- US1 (流程地图展示) 和 US2 (视图切换) 可部分并行开发
- US3 和 US4 可在 US1/US2 完成后并行开发

---

## Phase 1: Setup (环境准备)

**Goal**: 准备开发环境和依赖

**Tasks**:

- [x] T001 验证 D001 功能完成状态，确认以下文件存在：frontend/src/components/common/ModuleCard.tsx, frontend/src/types/module.ts, frontend/src/constants/modules.ts
- [x] T002 进入前端目录并安装依赖：cd frontend && npm install
- [x] T003 启动开发服务器和测试监听：npm run dev (后台) + npm run test:watch (新终端)

**Acceptance**: 开发服务器运行在 http://localhost:5173，测试监听正常运行

---

## Phase 2: Foundational (基础设施)

**Goal**: 创建类型定义、配置文件和工具函数

**Tasks**:

- [x] T004 [P] 创建视图类型定义 frontend/src/types/view.ts，包含 ViewType enum, ViewState interface, ProcessStage interface
- [x] T005 [P] 创建流程阶段配置 frontend/src/constants/processStages.ts，定义 PROCESS_STAGES 常量（5个阶段）
- [x] T006 [P] 创建视图状态管理工具 frontend/src/utils/viewState.ts，实现 saveViewState, loadViewState, getModulesByStage 函数
- [x] T007 运行 TypeScript 类型检查：npm run type-check，确保无编译错误

**Acceptance**: TypeScript 编译通过，所有基础类型和配置定义完整

**Parallel Execution Example**:
```bash
# 三个开发者可同时工作
Developer 1: 创建 types/view.ts
Developer 2: 创建 constants/processStages.ts
Developer 3: 创建 utils/viewState.ts
# 全部完成后执行 T007
```

---

## Phase 3: User Story 1 - 查看业务流程地图 (P1)

**Story Goal**: 用户能够查看按业务执行顺序排列的流程地图，包含5个阶段和12个业务模块，模块间用箭头连接

**Independent Test Criteria**:
- ✅ 访问 Dashboard 后，流程地图展示5个业务阶段（基础建设→供应生产→营销发布→交易履约→经营洞察）
- ✅ 每个阶段显示标题、副标题和包含的业务模块
- ✅ 模块之间显示蓝色箭头连接，形成完整流程链
- ✅ 页面标题显示"业务端到端流程地图"

**Tasks**:

### T008-T010: 单元测试 (TDD)

- [x] T008 [P] [US1] 编写 ProcessFlowView 组件测试 frontend/src/components/dashboard/ProcessFlowView.test.tsx：验证渲朱5个阶段、阶段副标题、模块卡片
- [x] T009 [P] [US1] 编写 ProcessFlowArrow 组件测试（可选）frontend/src/components/common/ProcessFlowArrow.test.tsx：验证箭头渲染和样式
- [x] T010 [P] [US1] 运行测试验证失败（预期红灯）：npm test -- ProcessFlowView.test.tsx

### T011-T013: 组件实现

- [x] T011 [US1] 实现 ProcessFlowView 组件 frontend/src/components/dashboard/ProcessFlowView.tsx：渲朱5个阶段、模块卡片、流程箭头
- [x] T012 [US1] 创建 ProcessFlowView 样式文件 frontend/src/components/dashboard/ProcessFlowView.css：定义阶段布局、箭头样式、响应式基础
- [ ] T013 [US1] 运行测试验证通过（绿灯）：npm test -- ProcessFlowView.test.tsx

**Acceptance**:
- 单元测试全部通过
- 访问 http://localhost:5173/dashboard，可看到流程地图（暂时手动临时渲染 ProcessFlowView）
- 流程地图展示5个阶段、12个模块、流程箭头

**Parallel Execution Example**:
```bash
# T008-T010 可并行编写测试
Developer 1: ProcessFlowView.test.tsx
Developer 2: ProcessFlowArrow.test.tsx (可选)
# T011-T012 顺序执行（实现 + 样式）
```

---

## Phase 4: User Story 2 - 在两种视图间切换 (P1)

**Story Goal**: 用户可通过标签页式按钮组切换全景视图和流程视图，激活状态高亮，状态保持

**Independent Test Criteria**:
- ✅ Dashboard 顶部显示标签页按钮组："全景视图" | "流程视图"
- ✅ 点击"流程视图"，页面切换到流程地图，标签高亮
- ✅ 点击"全景视图"，页面切换回泳道视图，标签高亮
- ✅ 切换后再切换回来，用户状态（折叠、滚动位置）保持
- ✅ 刷新页面，保持上次选择的视图

**Tasks**:

### T014-T015: 单元测试 (TDD)

- [ ] T014 [P] [US2] 编写 ViewSwitcher 组件测试 frontend/src/components/common/ViewSwitcher.test.tsx：验证两个按钮渲染、激活状态、点击切换回调
- [ ] T015 [P] [US2] 运行测试验证失败（预期红灯）：npm test -- ViewSwitcher.test.tsx

### T016-T018: 组件实现与集成

- [x] T016 [US2] 实现 ViewSwitcher 组件 frontend/src/components/common/ViewSwitcher.tsx + ViewSwitcher.css：标签页式按钮组、激活状态样式
- [x] T017 [US2] 拆分泳道视图组件 frontend/src/components/dashboard/SwimlaneView.tsx：从 Dashboard/index.tsx 迁移现有泳道渲染逻辑
- [x] T018 [US2] 重构 Dashboard 页面 frontend/src/pages/Dashboard/index.tsx：整合 ViewSwitcher + SwimlaneView + ProcessFlowView，实现视图切换逻辑和状态保持

**Acceptance**:
- 单元测试全部通过
- 访问 http://localhost:5173/dashboard，顶部显示视图切换按钮
- 点击按钮可切换视图，激活标签高亮
- 刷新页面保持视图选择

**Parallel Execution Example**:
```bash
# T016-T017 可并行开发
Developer 1: ViewSwitcher.tsx
Developer 2: SwimlaneView.tsx (拆分)
# T018 依赖 T016-T017，必须顺序执行
```

---

## Phase 5: User Story 3 - 点击流程节点快速进入功能 (P2)

**Story Goal**: 用户点击流程地图中的模块卡片或功能链接，快速跳转到对应页面

**Independent Test Criteria**:
- ✅ 点击流程地图中的模块卡片，跳转到模块默认页面
- ✅ 悬停卡片，显示功能快捷链接
- ✅ 点击功能链接，直接进入对应功能页面
- ✅ 浏览器后退按钮返回到流程地图，保持原状态

**Tasks**:

- [x] T019 [US3] 验证 ModuleCard 组件的点击跳转功能在流程视图中正常工作：frontend/src/components/common/ModuleCard.tsx
- [x] T020 [US3] 在 ProcessFlowView 中为每个 ModuleCard 添加 data-testid 属性，编写点击跳转测试：frontend/src/components/dashboard/ProcessFlowView.test.tsx

**Acceptance**:
- 点击流程地图中的模块卡片，成功跳转
- 悬停卡片，显示功能链接
- 后退按钮返回流程地图

**Note**: 此功能主要依赖 D001 ModuleCard 组件，无需新增代码，仅验证集成

---

## Phase 6: User Story 4 - 响应式布局支持 (P3)

**Story Goal**: 流程地图在不同屏幕尺寸下自适应显示（桌面横向、移动纵向）

**Independent Test Criteria**:
- ✅ 桌面端（1920x1080）：流程节点横向排列，箭头水平指向
- ✅ 移动端（375x667）：流程节点纵向排列，箭头纵向指向
- ✅ 调整浏览器窗口，布局平滑过渡

**Tasks**:

- [x] T021 [P] [US4] 添加桌面端响应式样式到 frontend/src/components/dashboard/ProcessFlowView.css：使用 @media (min-width: 992px) 定义横向布局
- [x] T022 [US4] 添加移动端响应式样式到 frontend/src/components/dashboard/ProcessFlowView.css：使用 @media (max-width: 767px) 定义纵向布局
- [x] T023 [US4] 手动测试响应式布局：在 Chrome DevTools 切换设备模拟，验证布局切换

**Acceptance**:
- 桌面端流程图横向排列
- 移动端流程图纵向排列
- 窗口调整时布局平滑过渡

**Parallel Execution Example**:
```bash
# T021 可独立开发
Developer 1: 添加桌面端样式
# T022 依赖 T021 完成后测试，但可提前编写
Developer 2: 添加移动端样式（可并行）
```

---

## Phase 7: Polish & Cross-Cutting Concerns (收尾与优化)

**Goal**: 性能优化、错误处理、代码质量检查

**Tasks**:

- [x] T024 [P] 添加性能优化：在 ProcessFlowView 和 SwimlaneView 使用 React.memo 包裹，避免不必要的重渲染
- [x] T025 [P] 添加空状态处理：在 ProcessFlowView 中检测模块列表为空，显示友好提示“暂无业务模块可展示”
- [x] T026 运行完整测试套件和代码质量检查：npm test && npm run lint && npm run type-check
- [x] T027 提交代码并编写提交信息：git add . && git commit -m "feat(D002): 实现业务端到端流程地图功能"

**Acceptance**:
- 所有测试通过
- ESLint 和 TypeScript 检查通过
- 性能达标：视图切换 < 2秒，首次渲染 < 1秒
- 代码已提交到 D002-process-flow-map 分支

**Parallel Execution Example**:
```bash
# T024-T025 可并行优化
Developer 1: React.memo 优化
Developer 2: 空状态处理
# T026-T027 顺序执行
```

---

## 📊 Implementation Strategy

### MVP Scope (Minimum Viable Product)

**First Delivery (2-3 hours)**:
- ✅ Phase 1: Setup
- ✅ Phase 2: Foundational
- ✅ Phase 3: User Story 1 (流程地图展示)
- ✅ Phase 4: User Story 2 (视图切换)

**MVP Acceptance**:
- 用户可以查看流程地图和泳道地图
- 用户可以在两种视图间切换
- 核心功能完整可用

### Incremental Enhancements

**Second Delivery (1 hour)**:
- ✅ Phase 5: User Story 3 (点击跳转)

**Final Delivery (1 hour)**:
- ✅ Phase 6: User Story 4 (响应式)
- ✅ Phase 7: Polish

---

## ✅ Validation Checklist

### Functional Requirements Coverage

- [ ] **FR-001**: 业务流程地图按执行顺序展示所有模块 → US1
- [ ] **FR-002**: 标签页式视图切换按钮组 → US2
- [ ] **FR-003**: 流程箭头连接所有模块 → US1
- [ ] **FR-004**: 模块卡片展示名称、图标、描述、功能入口 → US1 (复用D001)
- [ ] **FR-005**: 点击流程节点跳转功能页面 → US3
- [ ] **FR-006**: 点击功能链接跳转 → US3 (复用D001)
- [ ] **FR-007**: 切换视图时保持用户状态 → US2
- [ ] **FR-008**: 根据权限过滤模块 → 复用D001逻辑
- [ ] **FR-009**: 视图切换平滑动画 → US2
- [ ] **FR-010**: 空数据友好提示 → Phase 7
- [ ] **FR-011**: 响应式布局 → US4
- [ ] **FR-012**: 防止重复触发切换 → US2

### Success Criteria Coverage

- [ ] **SC-001**: 视图切换 < 2秒 → 通过性能测试验证
- [ ] **SC-002**: 清晰展示12个模块执行顺序 → 人工验收
- [ ] **SC-003**: 90%用户30秒内理解切换功能 → 用户测试（可选）
- [ ] **SC-004**: 主流浏览器无兼容性问题 → 手动跨浏览器测试
- [ ] **SC-005**: 状态保持准确率100% → 自动化测试验证
- [ ] **SC-006**: 桌面端和移动端正常显示 → 响应式测试验证

### Code Quality Gates

- [ ] 所有新文件包含 `@spec D002-process-flow-map` 注释
- [ ] TypeScript 编译无错误：`npm run type-check`
- [ ] ESLint 检查通过：`npm run lint`
- [ ] Prettier 格式化：`npm run format`
- [ ] 单元测试覆盖率 > 80%：`npm run test:coverage`
- [ ] 所有测试通过：`npm test`

---

## 🚀 Getting Started

### Quick Start Commands

```bash
# 1. 验证环境
cd /Users/lining/qoder/Cinema_Bussiness_Center_Platform/frontend
npm run type-check

# 2. 启动开发环境
npm run dev          # Terminal 1: 开发服务器
npm run test:watch   # Terminal 2: 测试监听

# 3. 开始开发（按任务顺序）
# 创建第一个文件
touch src/types/view.ts

# 4. 运行质量检查
npm run lint
npm test
```

### Development Workflow

1. **选择任务**: 从 Phase 2 的 T004 开始
2. **TDD 循环**（如果是组件任务）:
   - 编写测试（Red）
   - 实现功能（Green）
   - 重构优化（Refactor）
3. **验收**: 检查任务的 Acceptance 标准
4. **提交**: 单个任务或相关任务组提交一次

### Recommended Task Execution Order

**Day 1 (3 hours - MVP)**:
```text
Phase 1: T001-T003 (Setup)
Phase 2: T004-T007 (Foundational)
Phase 3: T008-T013 (US1 - 流程地图展示)
Phase 4: T014-T018 (US2 - 视图切换)
→ MVP 交付：核心功能可用
```

**Day 2 (1.5 hours - Enhancement)**:
```text
Phase 5: T019-T020 (US3 - 点击跳转)
Phase 6: T021-T023 (US4 - 响应式)
```

**Day 2 (1 hour - Polish)**:
```text
Phase 7: T024-T027 (性能优化 + 提交)
→ 完整功能交付
```

---

## 📝 Notes

### Dependencies on D001

以下 D001 组件必须可用：
- `frontend/src/components/common/ModuleCard.tsx`
- `frontend/src/types/module.ts`
- `frontend/src/constants/modules.ts`
- `frontend/src/utils/permission.ts`

如果 D001 未完成，需先完成这些文件。

### Performance Optimization Tips

- 使用 `React.memo` 包裹 ProcessFlowView 和 SwimlaneView
- 使用 `useMemo` 缓存 `getModulesByStage` 计算结果
- 使用 `useCallback` 缓存事件处理函数
- 避免在渲染函数中创建新对象/数组

### Common Pitfalls

1. **箭头位置错位**: 确保 `.flow-arrow` 使用 `position: relative`
2. **状态丢失**: 检查 sessionStorage 数据格式（Set 需转换为数组）
3. **TypeScript 错误**: 确保 tsconfig.json 包含路径别名 `@/*`
4. **测试失败**: 确保 ModuleCard 组件添加 `data-testid` 属性

---

**Tasks Generated**: 2026-01-14  
**Total Tasks**: 27  
**Parallelizable**: 11 (41%)  
**Estimated Time**: 5.5 hours  
**Ready for Development**: ✅
