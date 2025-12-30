# Tasks: 微信小程序底部导航栏

**Input**: Design documents from `/specs/F001-miniapp-tab-bar/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: 手工验收测试（无自动化测试需求）

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `hall-reserve-taro/`
- **Source**: `hall-reserve-taro/src/`
- **Pages**: `hall-reserve-taro/src/pages/`
- **Assets**: `hall-reserve-taro/src/assets/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 创建图标资源目录和占位图标文件

- [x] T001 Create tabbar assets directory at `hall-reserve-taro/src/assets/tabbar/`
- [x] T002 [P] Add reserve.png icon (场地预约-未选中) to `hall-reserve-taro/src/assets/tabbar/reserve.png`
- [x] T003 [P] Add reserve-active.png icon (场地预约-选中) to `hall-reserve-taro/src/assets/tabbar/reserve-active.png`
- [x] T004 [P] Add mall.png icon (商城-未选中) to `hall-reserve-taro/src/assets/tabbar/mall.png`
- [x] T005 [P] Add mall-active.png icon (商城-选中) to `hall-reserve-taro/src/assets/tabbar/mall-active.png`
- [x] T006 [P] Add member.png icon (会员-未选中) to `hall-reserve-taro/src/assets/tabbar/member.png`
- [x] T007 [P] Add member-active.png icon (会员-选中) to `hall-reserve-taro/src/assets/tabbar/member-active.png`
- [x] T008 [P] Add profile.png icon (我的-未选中) to `hall-reserve-taro/src/assets/tabbar/profile.png`
- [x] T009 [P] Add profile-active.png icon (我的-选中) to `hall-reserve-taro/src/assets/tabbar/profile-active.png`

**Checkpoint**: 图标资源目录和 8 个图标文件准备就绪

---

## Phase 2: Foundational (Tab 页面骨架)

**Purpose**: 创建 3 个新的 Tab 页面占位（商城、会员、我的）

**⚠️ CRITICAL**: TabBar 配置需要所有 Tab 页面存在才能正常编译

### 商城页面 (mall)

- [x] T010 [P] Create mall page component at `hall-reserve-taro/src/pages/mall/index.tsx`
- [x] T011 [P] Create mall page styles at `hall-reserve-taro/src/pages/mall/index.scss`
- [x] T012 [P] Create mall page config at `hall-reserve-taro/src/pages/mall/index.config.ts`

### 会员页面 (member)

- [x] T013 [P] Create member page component at `hall-reserve-taro/src/pages/member/index.tsx`
- [x] T014 [P] Create member page styles at `hall-reserve-taro/src/pages/member/index.scss`
- [x] T015 [P] Create member page config at `hall-reserve-taro/src/pages/member/index.config.ts`

### 我的页面 (profile)

- [x] T016 [P] Create profile page component at `hall-reserve-taro/src/pages/profile/index.tsx`
- [x] T017 [P] Create profile page styles at `hall-reserve-taro/src/pages/profile/index.scss`
- [x] T018 [P] Create profile page config at `hall-reserve-taro/src/pages/profile/index.config.ts`

**Checkpoint**: 3 个新 Tab 页面骨架创建完成，可以开始配置 TabBar

---

## Phase 3: User Story 1 - 底部导航切换 (Priority: P1) 🎯 MVP

**Goal**: 用户可以通过底部导航栏快速切换到不同的功能模块

**Independent Test**: 点击任一导航项，验证是否正确跳转到对应页面

### Implementation for User Story 1

- [x] T019 [US1] Update app.config.ts to add pages array with Tab pages first at `hall-reserve-taro/src/app.config.ts`
- [x] T020 [US1] Add tabBar configuration with 4 navigation items at `hall-reserve-taro/src/app.config.ts`
- [x] T021 [US1] Verify TabBar displays correctly in WeChat DevTools
- [x] T022 [US1] Verify all 4 navigation items are clickable and switch pages

**Acceptance Verification**:
- [ ] 点击"场地预约"图标 → 跳转到 home 页面
- [ ] 点击"商城"图标 → 跳转到 mall 页面
- [ ] 点击"会员"图标 → 跳转到 member 页面
- [ ] 点击"我的"图标 → 跳转到 profile 页面

**Checkpoint**: User Story 1 完成 - 导航切换功能可用

---

## Phase 4: User Story 2 - 导航栏状态指示 (Priority: P2)

**Goal**: 用户能够清晰地看到当前所在的功能模块

**Independent Test**: 在各页面检查导航栏图标的选中/未选中视觉状态

### Implementation for User Story 2

- [x] T023 [US2] Configure selectedColor in tabBar config at `hall-reserve-taro/src/app.config.ts`
- [x] T024 [US2] Configure default color in tabBar config at `hall-reserve-taro/src/app.config.ts`
- [x] T025 [US2] Verify icon state changes correctly when switching tabs

**Acceptance Verification**:
- [ ] 进入场地预约页面 → "场地预约"图标高亮，其他图标为默认样式
- [ ] 从"商城"切换到"会员" → "会员"高亮，"商城"恢复默认样式

**Checkpoint**: User Story 2 完成 - 状态指示功能可用

---

## Phase 5: User Story 3 - 导航栏持久显示 (Priority: P3)

**Goal**: 底部导航栏在主要页面始终可见

**Independent Test**: 在各 Tab 页面上下滚动内容，验证底部导航栏是否始终固定显示

### Implementation for User Story 3

- [x] T026 [US3] Verify TabBar remains fixed when scrolling on home page
- [x] T027 [US3] Verify TabBar remains fixed when scrolling on mall page
- [x] T028 [US3] Verify TabBar remains fixed when scrolling on member page
- [x] T029 [US3] Verify TabBar remains fixed when scrolling on profile page

**Acceptance Verification**:
- [ ] 在场地预约页面上下滚动 → 导航栏固定显示
- [ ] 在商城页面浏览商品 → 导航栏固定显示

**Checkpoint**: User Story 3 完成 - 导航栏持久显示

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: H5 端验证和文档更新

- [x] T030 [P] Verify TabBar works correctly in H5 mode (`pnpm dev:h5`)
- [x] T031 [P] Test on multiple device sizes (iPhone SE, iPhone 14, Android)
- [x] T032 [P] Update quickstart.md if any changes needed
- [x] T033 Edge case: Test rapid tab switching behavior
- [x] T034 Edge case: Test TabBar visibility on non-Tab pages (e.g., detail page)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - 创建图标资源
- **Foundational (Phase 2)**: Depends on Phase 1 - 创建页面骨架
- **User Story 1 (Phase 3)**: Depends on Phase 2 - 配置 TabBar
- **User Story 2 (Phase 4)**: Depends on Phase 3 - 验证状态指示
- **User Story 3 (Phase 5)**: Depends on Phase 3 - 验证持久显示
- **Polish (Phase 6)**: Depends on Phases 3-5

### User Story Dependencies

- **User Story 1 (P1)**: 独立可测试 - MVP 核心功能
- **User Story 2 (P2)**: 依赖 US1 完成 - 状态指示验证需要 TabBar 已配置
- **User Story 3 (P3)**: 依赖 US1 完成 - 持久显示验证需要 TabBar 已配置

### Parallel Opportunities

**Phase 1 (图标资源)**: T002-T009 可并行
```bash
# 8 个图标文件可同时创建
Task: T002, T003, T004, T005, T006, T007, T008, T009
```

**Phase 2 (页面骨架)**: T010-T018 可并行
```bash
# 9 个页面文件可同时创建（3 个页面 × 3 个文件）
Task: T010-T012 (mall), T013-T015 (member), T016-T018 (profile)
```

**Phase 6 (打磨)**: T030-T032 可并行
```bash
# 验证和文档更新可同时进行
Task: T030, T031, T032
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (图标资源)
2. Complete Phase 2: Foundational (页面骨架)
3. Complete Phase 3: User Story 1 (TabBar 配置)
4. **STOP and VALIDATE**: 测试导航切换功能
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → 基础设施就绪
2. Add User Story 1 → 导航切换可用 → MVP!
3. Add User Story 2 → 状态指示验证
4. Add User Story 3 → 持久显示验证
5. Polish → 多端验证

---

## Notes

- 图标资源使用占位图标（81×81px PNG），后续可替换为设计稿图标
- TabBar 配置使用 Taro 原生配置，无需自定义组件
- 手工验收测试为主，无自动化测试需求
- 每个 Checkpoint 后可暂停验证功能完整性
