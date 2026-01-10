# Tasks: 品牌创建问题修复 (B001-fix-brand-creation)

**Input**: Design documents from `/specs/B001-fix-brand-creation/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: 包含单元测试任务（spec.md 中要求测试验证）

**Organization**: 任务按功能需求（FR）组织，支持独立实现和测试

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属功能需求（FR1, FR2, FR3）
- 包含精确文件路径

## Path Conventions

- **Frontend**: `frontend/src/pages/mdm-pim/brand/`
- **Hooks**: `frontend/src/pages/mdm-pim/brand/hooks/`
- **Components**: `frontend/src/pages/mdm-pim/brand/components/`
- **Types**: `frontend/src/pages/mdm-pim/brand/types/`
- **Tests**: `frontend/src/pages/mdm-pim/brand/__tests__/`

---

## Phase 1: Setup (准备工作)

**Purpose**: 确认开发环境和理解现有代码

- [ ] T001 启动前端开发服务器验证 MSW mock 正常工作 `cd frontend && npm run dev`
- [ ] T002 确认品牌管理页面可访问 http://localhost:3000/mdm-pim/brands
- [ ] T003 复现缺陷 1：创建品牌后不出现在列表中
- [ ] T004 复现缺陷 2：抽屉中有两个「新建品牌」按钮

---

## Phase 2: Foundational (基础准备)

**Purpose**: 理解现有代码结构，无阻塞性基础任务

**⚠️ 本次修复为 bug fix，无需新建基础设施**

- [ ] T005 审查 `brandService` 实现，确认 API 调用方式 in `frontend/src/pages/mdm-pim/brand/services/brandService.ts`
- [ ] T006 审查 MSW handler 确认数据持久化逻辑 in `frontend/src/mocks/handlers/brandHandlers.ts`

**Checkpoint**: 代码审查完成，可开始修复实现

---

## Phase 3: FR1 - 创建后品牌列表刷新 (Priority: P0) 🎯 MVP

**Goal**: 品牌创建成功后，新品牌立即出现在列表中

**Independent Test**:
1. 创建新品牌
2. 验证成功消息显示
3. 验证新品牌出现在列表中（无需手动刷新）
4. Chrome DevTools Network 显示 GET /api/brands 被调用

### Tests for FR1 (单元测试)

- [ ] T007 [P] [FR1] 编写 `useBrandActions.createBrand` 成功后缓存失效测试 in `frontend/src/pages/mdm-pim/brand/__tests__/useBrandActions.test.ts`

### Implementation for FR1

- [ ] T008 [FR1] 移除 `useBrandActions.ts` 中的内部 `brandApi` mock 实现（第 24-175 行）in `frontend/src/pages/mdm-pim/brand/hooks/useBrandActions.ts`
- [ ] T009 [FR1] 修改 `createBrand` mutation 使用 `brandService.create()` 替代内部 mock in `frontend/src/pages/mdm-pim/brand/hooks/useBrandActions.ts`
- [ ] T010 [FR1] 修改缓存失效逻辑：`queryClient.invalidateQueries({ queryKey: ['brands'] })` in `frontend/src/pages/mdm-pim/brand/hooks/useBrandActions.ts`
- [ ] T011 [FR1] 验证修复：创建品牌后列表自动刷新

**Checkpoint**: FR1 完成 - 品牌创建后列表自动刷新

---

## Phase 4: FR2 - 单一提交按钮 (Priority: P0)

**Goal**: 品牌创建抽屉中只显示一个「新建品牌」按钮

**Independent Test**:
1. 打开品牌创建抽屉
2. 验证只有一个「新建品牌」按钮（在底部 footer）
3. 验证表单区域没有操作按钮

### Tests for FR2 (单元测试)

- [ ] T012 [P] [FR2] 编写 `BrandForm` 组件测试验证无重复按钮 in `frontend/src/pages/mdm-pim/brand/__tests__/BrandForm.test.tsx`

### Implementation for FR2

- [ ] T013 [FR2] 移除 `BrandForm.tsx` 中 `form-actions` 区域（第 324-349 行）in `frontend/src/pages/mdm-pim/brand/components/molecules/BrandForm.tsx`
- [ ] T014 [FR2] 验证 `BrandDrawer.tsx` 的 `footer` prop 正确渲染按钮 in `frontend/src/pages/mdm-pim/brand/components/organisms/BrandDrawer.tsx`
- [ ] T015 [FR2] 验证修复：抽屉中只有一个提交按钮

**Checkpoint**: FR2 完成 - 抽屉中只有一个提交按钮

---

## Phase 5: FR3 - 错误处理和用户反馈 (Priority: P0)

**Goal**: 确保错误处理和用户反馈正确工作

**Independent Test**:
1. 模拟 API 失败
2. 验证错误消息显示
3. 验证表单数据保留

### Implementation for FR3

- [ ] T016 [FR3] 验证 mutation `onError` 回调正确显示错误消息 in `frontend/src/pages/mdm-pim/brand/hooks/useBrandActions.ts`
- [ ] T017 [FR3] 验证创建失败时表单数据不丢失 in `frontend/src/pages/mdm-pim/brand/components/organisms/BrandDrawer.tsx`
- [ ] T018 [FR3] 验证提交期间按钮 `loading` 状态正确

**Checkpoint**: FR3 完成 - 错误处理正常工作

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 整体验证和代码清理

- [ ] T019 运行所有品牌模块单元测试 `npm run test:unit -- --grep "brand"`
- [ ] T020 执行 quickstart.md 中的完整验证流程
- [ ] T021 确保 TypeScript 类型检查通过 `npm run type-check`
- [ ] T022 确保 ESLint 检查通过 `npm run lint`
- [ ] T023 [P] 更新代码注释添加 `@spec B001-fix-brand-creation` 标识

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成
- **FR1 (Phase 3)**: 依赖 Foundational 完成 - 核心修复
- **FR2 (Phase 4)**: 依赖 Foundational 完成 - 可与 FR1 并行
- **FR3 (Phase 5)**: 依赖 FR1 完成（需要验证新的 mutation 行为）
- **Polish (Phase 6)**: 依赖所有 FR 完成

### User Story Dependencies

- **FR1**: 核心修复，无依赖其他 FR
- **FR2**: 独立修复，可与 FR1 并行
- **FR3**: 依赖 FR1（验证新的错误处理）

### Within Each FR

1. 测试任务先行（如有）
2. 核心实现任务
3. 验证任务
4. 检查点确认

### Parallel Opportunities

- T007 和 T012 可并行（不同测试文件）
- FR1 和 FR2 可并行（不同文件，独立修复）
- T019-T023 中标记 [P] 的任务可并行

---

## Parallel Example: FR1 + FR2 并行

```bash
# 并行启动 FR1 和 FR2 的测试任务:
Task: "T007 [P] [FR1] 编写 useBrandActions.createBrand 成功后缓存失效测试"
Task: "T012 [P] [FR2] 编写 BrandForm 组件测试验证无重复按钮"

# FR1 和 FR2 可以由不同开发者并行处理:
# Developer A: T008 → T009 → T010 → T011 (FR1)
# Developer B: T013 → T014 → T015 (FR2)
```

---

## Implementation Strategy

### MVP First (只完成 FR1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational
3. 完成 Phase 3: FR1 - 品牌列表刷新
4. **STOP and VALIDATE**: 测试品牌创建后列表刷新
5. 如果时间紧迫，可先部署 FR1 修复

### Full Fix (完成所有 FR)

1. 完成 Setup + Foundational → 准备就绪
2. 完成 FR1 → 测试 → 列表刷新问题解决
3. 完成 FR2 → 测试 → 重复按钮问题解决
4. 完成 FR3 → 测试 → 错误处理验证
5. 完成 Polish → 全面验证 → 准备发布

### 推荐执行顺序

由于这是 bug fix 且修改范围有限，建议**顺序执行**：

```
T001 → T002 → T003 → T004 (Setup)
  ↓
T005 → T006 (Foundational)
  ↓
T007 → T008 → T009 → T010 → T011 (FR1)
  ↓
T012 → T013 → T014 → T015 (FR2)
  ↓
T016 → T017 → T018 (FR3)
  ↓
T019 → T020 → T021 → T022 → T023 (Polish)
```

---

## Notes

- [P] 任务 = 不同文件，无依赖，可并行
- [Story] 标签将任务映射到具体功能需求
- 每个 FR 应独立可测试
- 每个任务或逻辑组完成后提交
- 在任何检查点停止以独立验证
- 避免：模糊任务、同一文件冲突、跨 FR 依赖

---

## Summary

| 指标 | 值 |
|------|-----|
| 总任务数 | 23 |
| FR1 任务数 | 5 (T007-T011) |
| FR2 任务数 | 4 (T012-T015) |
| FR3 任务数 | 3 (T016-T018) |
| Setup 任务数 | 4 (T001-T004) |
| Foundational 任务数 | 2 (T005-T006) |
| Polish 任务数 | 5 (T019-T023) |
| 可并行任务 | 4 (T007, T012, T023 + FR1/FR2 可并行) |
| MVP 范围 | FR1 (品牌列表刷新) |

---

**Generated**: 2026-01-10
**Spec**: B001-fix-brand-creation
