# 实现任务：类目管理功能

**分支**: `007-category-management` | **日期**: 2025-01-27 | **规格**: [spec.md](./spec.md)
**总任务数**: 107 | **已完成**: 89 (83%) | **预估时长**: 4-6周
**实施策略**: MVP优先，增量交付

## 用户故事优先级

基于功能规格分析，确定以下用户故事优先级：

**P1 - 核心功能 (MVP)**:
- **US1**: 类目树浏览与基本信息查看 - 基础浏览功能
- **US2**: 类目创建与编辑 - 核心管理功能
- **US3**: 类目状态管理与删除控制 - 业务规则保障

**P2 - 高级功能**:
- **US4**: 属性模板配置 - 高级配置功能
- **US5**: 权限控制与只读模式 - 安全控制

## 技术栈信息

- **语言**: TypeScript 5.9.3
- **框架**: React 19.2.0 + Ant Design 6.1.0
- **构建工具**: Vite 7.2.4
- **状态管理**: TanStack Query 5.90.12 (服务器状态) + Zustand 5.0.9 (客户端状态)
- **Mock服务**: MSW 2.12.4
- **测试**: Vitest 4.0.15 + React Testing Library + Playwright 1.57.0
- **项目类型**: 前端Web应用（单项目）

---

## 阶段1：设置任务（项目初始化）

**阶段目标**: 验证开发环境和基础项目结构

### 设置阶段任务

- [X] T001 验证frontend/目录项目结构符合实施计划
- [X] T002 验证package.json包含所需依赖（React 19.2.0, Ant Design 6.1.0, TanStack Query 5.90.12, Zustand 5.0.9, MSW 2.12.4）
- [X] T003 [P] 验证TypeScript配置（tsconfig.json）启用严格模式
- [X] T004 [P] 验证Vite构建工具（vite.config.ts）配置正确
- [X] T005 [P] 验证ESLint和Prettier配置进行代码格式化
- [X] T006 验证MSW（Mock Service Worker）已配置用于API模拟
- [X] T007 验证测试环境（Vitest + React Testing Library + Playwright）已设置

---

## 阶段2：基础任务（基础设施）

**阶段目标**: 建立类型定义、状态管理、API服务和Mock数据

**⚠️ CRITICAL**: 所有用户故事都依赖此阶段完成

### 基础阶段任务

- [X] T008 [P] 完善Category类型定义在frontend/src/types/category.ts（基于data-model.md）
- [X] T009 [P] 完善CategoryTree类型定义在frontend/src/types/category.ts
- [X] T010 [P] 完善AttributeTemplate和CategoryAttribute类型定义在frontend/src/types/category.ts
- [X] T011 [P] 创建CreateCategoryRequest和UpdateCategoryRequest类型在frontend/src/types/category.ts
- [X] T012 [P] 在frontend/src/services/queryKeys.ts中添加categoryKeys查询键工厂
- [X] T013 [P] 在frontend/src/stores/categoryStore.ts中创建Zustand Store管理UI状态（expandedKeys, selectedCategoryId, searchKeyword, isEditing）
- [X] T014 [P] 在frontend/src/mocks/data/categoryMockData.ts中实现类目Mock数据生成器（支持三级类目结构）
- [X] T015 [P] 在frontend/src/mocks/handlers/categoryHandlers.ts中创建类目API端点的MSW处理器
- [X] T016 [P] 在frontend/src/services/categoryService.ts中增强getCategoryTree方法支持懒加载
- [X] T017 [P] 在frontend/src/services/categoryService.ts中增强getCategoryDetail方法
- [X] T018 [P] 在frontend/src/services/categoryService.ts中添加getCategoryChildren方法（懒加载）
- [X] T019 [P] 在frontend/src/services/categoryService.ts中添加searchCategories方法
- [X] T020 [P] 在frontend/src/services/attributeService.ts中实现属性模板相关API服务方法

**检查点**: 基础任务完成 - 用户故事实现可以开始并行进行

---

## 阶段3：用户故事1 - 类目树浏览与基本信息查看（P1）🎯 MVP

**目标**: 实现类目树结构展示和类目详情查看功能

**独立测试标准**:
- 用户可以浏览完整的类目树结构（一级/二级/三级类目）
- 点击类目节点可以查看详细信息
- 支持展开/收起节点
- 支持搜索类目并自动展开匹配路径

### US1实现任务

- [X] T021 [P] [US1] 在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategoryTreeQuery Hook
- [X] T022 [P] [US1] 在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategoryDetailQuery Hook
- [X] T023 [P] [US1] 在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategoryChildrenQuery Hook（懒加载）
- [X] T024 [P] [US1] 在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategorySearchQuery Hook
- [X] T025 [US1] 在frontend/src/components/Category/CategoryTree.tsx中实现类目树组件（使用Ant Design Tree，启用虚拟滚动）
- [X] T026 [US1] 在frontend/src/components/Category/CategoryTree.tsx中实现树节点展开/收起功能
- [X] T027 [US1] 在frontend/src/components/Category/CategoryTree.tsx中实现节点选择功能（与Zustand Store集成）
- [X] T028 [US1] 在frontend/src/components/Category/CategoryTree.tsx中实现懒加载功能（loadData）
- [X] T029 [US1] 在frontend/src/components/Category/CategoryTree.tsx中实现搜索功能（自动展开匹配路径并高亮）
- [X] T030 [US1] 在frontend/src/components/Category/CategoryDetail.tsx中创建类目详情组件
- [X] T031 [US1] 在frontend/src/components/Category/CategoryDetail.tsx中实现基本信息展示（名称、等级、路径、编码、排序、状态）
- [X] T032 [US1] 在frontend/src/components/Category/CategoryDetail.tsx中实现状态显示（使用Tag/Badge标记启用/停用）
- [X] T033 [US1] 在frontend/src/pages/CategoryManagement/index.tsx中集成CategoryTree和CategoryDetail组件（左右分栏布局）
- [X] T034 [US1] 在frontend/src/pages/CategoryManagement/index.tsx中实现搜索框功能（已在CategoryTree组件中实现）
- [X] T035 [US1] 验证类目树浏览和详情查看功能正常工作

**检查点**: 此时，用户故事1应该完全功能正常且可独立测试

---

## 阶段4：用户故事2 - 类目创建与编辑（P1）

**目标**: 实现类目的创建和编辑功能

**独立测试标准**:
- 管理员可以创建新类目（一级/二级/三级）
- 管理员可以编辑类目基本信息
- 表单验证正常工作
- 创建成功后自动刷新树并选中新节点

### US2实现任务

- [X] T036 [P] [US2] 在frontend/src/hooks/api/useCategoryMutation.ts中创建useCreateCategoryMutation Hook
- [X] T037 [P] [US2] 在frontend/src/hooks/api/useCategoryMutation.ts中创建useUpdateCategoryMutation Hook
- [X] T038 [US2] 在frontend/src/components/Category/CategoryForm.tsx中创建类目表单组件
- [X] T039 [US2] 在frontend/src/components/Category/CategoryForm.tsx中实现表单字段（名称、描述、排序序号、状态）
- [X] T040 [US2] 在frontend/src/components/Category/CategoryForm.tsx中实现表单验证（类目名称必填、排序序号为数字）
- [X] T041 [US2] 在frontend/src/components/Category/CategoryForm.tsx中实现只读字段显示（类目等级、上级类目路径、类目编码）
- [X] T042 [US2] 在frontend/src/services/categoryService.ts中实现createCategory方法
- [X] T043 [US2] 在frontend/src/services/categoryService.ts中实现updateCategory方法
- [X] T044 [US2] 在frontend/src/mocks/handlers/categoryHandlers.ts中添加POST /api/categories处理器
- [X] T045 [US2] 在frontend/src/mocks/handlers/categoryHandlers.ts中添加PUT /api/categories/:id处理器
- [ ] T046 [US2] 在frontend/src/components/Category/CategoryDetail.tsx中添加「编辑」按钮（仅管理员可见）
- [ ] T047 [US2] 在frontend/src/components/Category/CategoryDetail.tsx中实现编辑模式切换功能
- [X] T048 [US2] 在frontend/src/pages/CategoryManagement/index.tsx中添加「新增一级类目」按钮
- [X] T049 [US2] 在frontend/src/components/Category/CategoryTree.tsx中实现右键菜单「新增子类目」功能
- [X] T050 [US2] 在frontend/src/components/Category/CategoryForm.tsx中实现创建成功后自动刷新树并选中新节点
- [X] T051 [US2] 验证类目创建和编辑功能正常工作

**检查点**: 此时，用户故事1和2应该都能独立工作

---

## 阶段5：用户故事3 - 类目状态管理与删除控制（P1）

**目标**: 实现类目状态切换和删除控制功能

**独立测试标准**:
- 管理员可以启用/停用类目
- 停用前显示确认提示
- 系统正确阻止删除已被使用的类目
- 可以删除未使用的类目

### US3实现任务

- [X] T052 [P] [US3] 在frontend/src/hooks/api/useCategoryMutation.ts中创建useUpdateCategoryStatusMutation Hook
- [X] T053 [P] [US3] 在frontend/src/hooks/api/useCategoryMutation.ts中创建useDeleteCategoryMutation Hook
- [X] T054 [US3] 在frontend/src/services/categoryService.ts中实现updateCategoryStatus方法
- [X] T055 [US3] 在frontend/src/services/categoryService.ts中实现deleteCategory方法（包含spuCount检查）
- [X] T056 [US3] 在frontend/src/mocks/handlers/categoryHandlers.ts中添加PUT /api/categories/:id/status处理器
- [X] T057 [US3] 在frontend/src/mocks/handlers/categoryHandlers.ts中添加DELETE /api/categories/:id处理器（包含删除约束逻辑）
- [X] T058 [US3] 在frontend/src/components/Category/CategoryDetail.tsx中实现「启用/停用」按钮
- [X] T059 [US3] 在frontend/src/components/Category/CategoryDetail.tsx中实现停用确认对话框（显示影响说明）
- [X] T060 [US3] 在frontend/src/components/Category/CategoryDetail.tsx中实现「删除」按钮（仅管理员可见）
- [X] T061 [US3] 在frontend/src/components/Category/CategoryDetail.tsx中实现删除按钮禁用逻辑（spuCount > 0时禁用并显示Tooltip）
- [X] T062 [US3] 在frontend/src/components/Category/CategoryTree.tsx中实现状态显示（使用Tag/Badge标记）
- [X] T063 [US3] 验证类目状态管理和删除控制功能正常工作

**检查点**: 此时，用户故事1、2和3应该都能独立工作

---

## 阶段6：用户故事4 - 属性模板配置（P2）

**目标**: 实现类目的属性模板配置功能

**独立测试标准**:
- 管理员可以为类目配置属性模板
- 可以添加、编辑、删除属性
- 属性类型支持（文本/数字/单选/多选）
- 删除属性时检查是否被SPU使用

### US4实现任务

- [X] T064 [P] [US4] 在frontend/src/hooks/api/useAttributeTemplateQuery.ts中创建useAttributeTemplateQuery Hook
- [X] T065 [P] [US4] 在frontend/src/hooks/api/useAttributeTemplateQuery.ts中创建useSaveAttributeTemplateMutation Hook
- [X] T066 [P] [US4] 在frontend/src/hooks/api/useAttributeTemplateQuery.ts中创建useAddAttributeMutation Hook
- [X] T067 [P] [US4] 在frontend/src/hooks/api/useAttributeTemplateQuery.ts中创建useUpdateAttributeMutation Hook
- [X] T068 [P] [US4] 在frontend/src/hooks/api/useAttributeTemplateQuery.ts中创建useDeleteAttributeMutation Hook
- [X] T069 [US4] 在frontend/src/services/attributeService.ts中实现getAttributeTemplate方法
- [X] T070 [US4] 在frontend/src/services/attributeService.ts中实现saveAttributeTemplate方法
- [X] T071 [US4] 在frontend/src/services/attributeService.ts中实现addAttribute、updateAttribute、deleteAttribute方法
- [X] T072 [US4] 在frontend/src/mocks/handlers/categoryHandlers.ts中添加GET /api/attribute-templates/:categoryId处理器
- [X] T073 [US4] 在frontend/src/mocks/handlers/categoryHandlers.ts中添加POST /api/attribute-templates/:categoryId处理器
- [X] T074 [US4] 在frontend/src/mocks/handlers/categoryHandlers.ts中添加属性CRUD处理器
- [X] T075 [US4] 在frontend/src/components/Category/AttributeTemplatePanel.tsx中创建属性模板配置面板组件
- [X] T076 [US4] 在frontend/src/components/Category/AttributeTemplatePanel.tsx中实现属性列表表格展示
- [X] T077 [US4] 在frontend/src/components/Attribute/AttributeForm.tsx中创建属性表单组件
- [X] T078 [US4] 在frontend/src/components/Attribute/AttributeForm.tsx中实现属性类型选择（文本/数字/单选/多选）
- [X] T079 [US4] 在frontend/src/components/Attribute/AttributeForm.tsx中实现可选值输入（单选/多选类型时显示）
- [X] T080 [US4] 在frontend/src/components/Attribute/AttributeForm.tsx中实现表单验证（属性名称必填）
- [X] T081 [US4] 在frontend/src/components/Category/AttributeTemplatePanel.tsx中实现「新增属性」按钮和弹窗
- [X] T082 [US4] 在frontend/src/components/Category/AttributeTemplatePanel.tsx中实现属性编辑功能
- [X] T083 [US4] 在frontend/src/components/Category/AttributeTemplatePanel.tsx中实现属性删除功能（包含使用检查）
- [X] T084 [US4] 在frontend/src/pages/CategoryManagement/index.tsx中集成AttributeTemplatePanel组件
- [X] T085 [US4] 验证属性模板配置功能正常工作

**检查点**: 此时，用户故事1、2、3和4应该都能独立工作

---

## 阶段7：用户故事5 - 权限控制与只读模式（P2）

**目标**: 实现基于角色的权限控制和只读模式

**独立测试标准**:
- 管理员可以看到所有操作按钮
- 非管理员只能看到只读信息
- 权限检查逻辑正确

### US5实现任务

- [ ] T086 [US5] 在frontend/src/services/permissionService.ts中实现hasCategoryManagePermission函数
- [ ] T087 [US5] 在frontend/src/components/Category/CategoryDetail.tsx中根据权限控制「编辑」按钮显示
- [ ] T088 [US5] 在frontend/src/components/Category/CategoryDetail.tsx中根据权限控制「启用/停用」按钮显示
- [ ] T089 [US5] 在frontend/src/components/Category/CategoryDetail.tsx中根据权限控制「删除」按钮显示
- [ ] T090 [US5] 在frontend/src/components/Category/CategoryDetail.tsx中实现只读模式（非管理员时表单不可编辑）
- [ ] T091 [US5] 在frontend/src/pages/CategoryManagement/index.tsx中根据权限控制「新增一级类目」按钮显示
- [ ] T092 [US5] 在frontend/src/components/Category/CategoryTree.tsx中根据权限控制右键菜单显示
- [ ] T093 [US5] 在frontend/src/components/Category/AttributeTemplatePanel.tsx中根据权限控制「新增属性」按钮显示
- [ ] T094 [US5] 在frontend/src/components/Category/AttributeTemplatePanel.tsx中根据权限控制属性行的「编辑」「删除」按钮显示
- [ ] T095 [US5] 验证权限控制功能正常工作（测试管理员和非管理员角色）

**检查点**: 此时，所有用户故事应该都能独立工作

---

## 阶段8：完善与横切关注点（完善与优化）

**目标**: 性能优化、错误处理、用户体验改进

### 完善阶段任务

- [X] T096 [P] 优化类目树渲染性能（虚拟滚动、懒加载、防抖搜索）
- [X] T097 [P] 添加错误处理和用户友好的错误提示
- [X] T098 [P] 添加加载状态指示器
- [X] T099 [P] 实现乐观更新提升用户体验（已通过 TanStack Query 的 setQueryData 和 invalidateQueries 实现）
- [X] T100 [P] 添加表单验证错误提示（已通过 Ant Design Form rules 实现）
- [ ] T101 [P] 优化移动端响应式布局
- [ ] T102 [P] 添加无障碍访问支持（ARIA标签、键盘导航）
- [ ] T103 [P] 更新文档（README.md、API文档）
- [ ] T104 [P] 代码清理和重构
- [ ] T105 运行quickstart.md验证所有功能
- [ ] T106 性能测试（验证1000节点树结构加载时间<2秒）
- [ ] T107 跨浏览器兼容性测试

---

## 依赖关系与执行顺序

### 阶段依赖关系

- **设置（阶段1）**: 无依赖 - 可立即开始
- **基础（阶段2）**: 依赖设置完成 - **阻塞所有用户故事**
- **用户故事（阶段3-7）**: 都依赖基础阶段完成
  - 用户故事可以并行进行（如果有足够人员）
  - 或按优先级顺序进行（P1 → P2）
- **完善（阶段8）**: 依赖所有期望的用户故事完成

### 用户故事依赖关系

- **用户故事1（P1）**: 基础阶段完成后可开始 - 不依赖其他故事
- **用户故事2（P1）**: 基础阶段完成后可开始 - 可集成US1但应独立可测试
- **用户故事3（P1）**: 基础阶段完成后可开始 - 可集成US1/US2但应独立可测试
- **用户故事4（P2）**: 基础阶段完成后可开始 - 可集成US1/US2/US3但应独立可测试
- **用户故事5（P2）**: 基础阶段完成后可开始 - 可集成所有故事但应独立可测试

### 每个用户故事内部

- Hooks → 服务 → 组件 → 页面集成
- 核心实现 → 集成
- 故事完成后再进入下一个优先级

### 并行机会

- 所有设置任务标记[P]的可并行运行
- 所有基础任务标记[P]的可并行运行（在阶段2内）
- 基础阶段完成后，所有用户故事可并行开始（如果团队容量允许）
- 每个用户故事内标记[P]的Hooks可并行开发
- 不同用户故事可由不同团队成员并行工作

---

## 并行示例：用户故事1

```bash
# 启动用户故事1的所有Query Hooks并行开发：
Task: "在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategoryTreeQuery Hook"
Task: "在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategoryDetailQuery Hook"
Task: "在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategoryChildrenQuery Hook"
Task: "在frontend/src/hooks/api/useCategoryQuery.ts中创建useCategorySearchQuery Hook"
```

---

## 实施策略

### MVP优先（仅用户故事1）

1. 完成阶段1：设置
2. 完成阶段2：基础（关键 - 阻塞所有故事）
3. 完成阶段3：用户故事1
4. **停止并验证**: 独立测试用户故事1
5. 如果准备就绪，部署/演示

### 增量交付

1. 完成设置 + 基础 → 基础就绪
2. 添加用户故事1 → 独立测试 → 部署/演示（MVP！）
3. 添加用户故事2 → 独立测试 → 部署/演示
4. 添加用户故事3 → 独立测试 → 部署/演示
5. 添加用户故事4 → 独立测试 → 部署/演示
6. 添加用户故事5 → 独立测试 → 部署/演示
7. 每个故事在不破坏先前故事的情况下增加价值

### 并行团队策略

有多名开发人员时：

1. 团队一起完成设置 + 基础
2. 基础完成后：
   - 开发者A：用户故事1
   - 开发者B：用户故事2
   - 开发者C：用户故事3
3. 故事独立完成和集成

---

## 任务统计

- **总任务数**: 107
- **设置阶段**: 7个任务
- **基础阶段**: 13个任务
- **用户故事1**: 15个任务
- **用户故事2**: 16个任务
- **用户故事3**: 12个任务
- **用户故事4**: 22个任务
- **用户故事5**: 10个任务
- **完善阶段**: 12个任务

## 建议的MVP范围

**最小可行产品（MVP）**: 仅包含用户故事1（类目树浏览与基本信息查看）

**MVP任务数**: 35个任务（阶段1 + 阶段2 + 阶段3）

**MVP预估时长**: 2-3周

---

## 注意事项

- [P] 任务 = 不同文件，无依赖
- [Story] 标签将任务映射到特定用户故事以便追溯
- 每个用户故事应该独立完成和可测试
- 每个任务后或逻辑组后提交
- 在任何检查点停止以独立验证故事
- 避免：模糊任务、同一文件冲突、破坏独立性的跨故事依赖

