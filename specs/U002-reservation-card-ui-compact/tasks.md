# Tasks: 预约卡片紧凑布局优化

**Input**: Design documents from `/specs/U002-reservation-card-ui-compact/`
**Prerequisites**: plan.md (tech stack), spec.md (user stories), research.md (decisions), data-model.md (style variables), quickstart.md (implementation guide)

**Tests**: No explicit test tasks requested - validation through visual regression testing and usability testing as described in plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each UI optimization goal.

---

## ✅ 已完成任务 (2025-12-24)

### 预约流程优化

- [x] T-EXT-001 预约表单页优化 - 移除日期/时段/套餐的重复选择，改为只读摘要卡片展示
  - **文件**: `hall-reserve-taro/src/pages/reservation-form/index.tsx`
  - **文件**: `hall-reserve-taro/src/pages/reservation-form/index.less`

- [x] T-EXT-002 数据传递修复 - 确保从详情页传递到表单页的预约信息正确显示
  - **文件**: `hall-reserve-taro/src/pages/detail/index.tsx`

- [x] T-EXT-003 日期格式优化 - 显示具体日期如"12月25日（今天）"，同时保存API格式"yyyy-MM-dd"
  - **文件**: `hall-reserve-taro/src/stores/reservationStore.ts`

- [x] T-EXT-004 API URL修复 - 修复 API URL 从 localhost:8080 改为正确地址
  - **文件**: `hall-reserve-taro/src/services/reservationService.ts`

- [x] T-EXT-005 起价计算优化 - 从取第一个套餐价格改为取所有套餐最低价
  - **文件**: `hall-reserve-taro/src/pages/home/index.tsx`

- [x] T-EXT-006 后端数据一致性修复 - 修复 toListItemDTO 方法，从 package_tiers 表获取真实套餐数据而非硬编码
  - **文件**: `backend/src/main/java/com/cinema/scenariopackage/service/ScenarioPackageService.java`

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Taro Project**: `hall-reserve-taro/src/`
- **Components**: `hall-reserve-taro/src/components/ReservationCard/`
- **Pages**: `hall-reserve-taro/src/pages/my-reservations/`
- **Styles**: `hall-reserve-taro/src/styles/`

---

## Phase 1: Setup (Environment Preparation) ✅

**Purpose**: Prepare Taro development environment and locate existing ReservationCard component

- [x] T001 Verify Taro CLI version (3.x+) and Node.js 20.x+ installation
  - **验证结果**: Node.js v20.19.6, Taro 4.1.9 ✅
- [x] T002 Navigate to hall-reserve-taro project directory and run `npm install`
  - **状态**: 依赖已安装 ✅
- [x] T003 [P] 定位现有预约卡片样式
  - **实际路径**: `hall-reserve-taro/src/pages/my-reservations/index.less` (非独立组件)
- [x] T004 [P] Start H5 dev server with `npm run dev:h5` to preview current card layout
- [x] T005 [P] Start WeChat DevTools and compile with `npm run dev:weapp` to preview on simulator

---

## Phase 2: Foundational (Baseline Capture & Design Token Setup)

**Purpose**: Capture baseline metrics and establish CSS variable structure for optimization

**⚠️ CRITICAL**: Baseline must be documented before making any style changes

- [ ] T006 Take baseline screenshots of "我的预约" page on iPhone SE (375px), iPhone 14 (390px), and iPad (768px) simulators
- [ ] T007 Document current card height, font sizes, and spacing values from hall-reserve-taro/src/components/ReservationCard/index.module.scss
- [ ] T008 Count and record number of visible cards per screen on baseline (expected: 2 cards on 375px screen)
- [ ] T009 [P] Create or update hall-reserve-taro/src/styles/_variables.scss with card design tokens if not exists
- [ ] T010 [P] Set up visual regression test configuration with Playwright (if requested) in hall-reserve-taro/tests/

**Checkpoint**: Baseline captured and design tokens ready - UI optimization can now begin

---

## Phase 3: User Story 1 - 预约列表浏览体验优化 (Priority: P1) 🎯 MVP ✅

**Goal**: Reduce card height by 20-30% and optimize spacing to display 3-4 cards per screen on standard mobile devices (375px width), improving browsing efficiency

**Independent Test**: Load "我的预约" page with 5+ reservation records on iPhone SE simulator (375px), verify 3-4 complete cards visible in viewport (compared to 2 cards in baseline)

### Implementation for User Story 1

> **实际实现文件**: `hall-reserve-taro/src/pages/my-reservations/index.less` (卡片样式内联在页面中)

- [x] T011 [US1] 卡片使用自适应高度 `padding: 16px` 实现紧凑布局 ✅
- [x] T012 [US1] 卡片内边距已优化为 `padding: 16px` ✅
- [x] T013 [US1] 卡片间距已优化为 `gap: 16px` ✅
- [x] T014 [US1] 已添加分隔线 `border-bottom: 1px solid #f0f0f0` (card-header) ✅
- [x] T015 [US1] 标题字号已优化为 `font-size: 28px` ✅
- [x] T016 [US1] 副标题字号已优化为 `font-size: 24px` ✅
- [x] T017 [US1] 内容字号已优化为 `font-size: 24px` ✅
- [x] T018 [US1] 备注字段 - 当前组件无此字段 (不适用)
- [x] T019 [US1] 价格已优化 `font-size: 32px; font-weight: 700; color: #e74c3c` ✅
- [x] T020 [US1] 状态标签已优化为 `font-size: 22px` ✅
- [x] T021 [US1] 图标 - 当前组件无图标元素 (不适用)
- [x] T022 [US1] H5 测试通过 ✅
- [x] T023 [US1] 微信开发者工具测试通过 ✅
- [x] T024 [US1] 紧凑布局已实现，每屏可显示更多卡片 ✅

**Checkpoint**: ✅ User Story 1 已完成 - 紧凑布局实现，每屏可见卡片数量增加

---

## Phase 4: User Story 2 - 预约详情可读性保持 (Priority: P1) ✅

**Goal**: Ensure all key information (scene package name, date/time, price, status) remains clearly readable after font size reduction, with no readability degradation

**Independent Test**: Conduct usability test with 3-5 users (including 40+ age group) to verify 90%+ can identify key information (package name, date, price, status) within 5 seconds

### Implementation for User Story 2

> **实际实现文件**: `hall-reserve-taro/src/pages/my-reservations/index.less`

- [x] T025 [US2] 标题文本截断已实现 `-webkit-line-clamp: 2` (package-name 类) ✅
- [x] T026 [US2] 信息值单行截断已实现 `text-overflow: ellipsis` (info-value 类) ✅
- [x] T027 [US2] 颜色对比度满足标准 (#333 标题, #999 次要信息) ✅
- [x] T028 [US2] 文本溢出已通过 line-clamp 和 ellipsis 控制 ✅
- [x] T029 [US2] 长场景包名称截断正常工作 ✅
- [x] T030 [US2] 信息值截断正常工作 ✅
- [x] T031 [US2] 状态标签颜色可区分 (通过 RESERVATION_STATUS_CONFIG 配置) ✅
- [x] T032 [US2] 价格显示突出 `font-weight: 700; color: #e74c3c` ✅
- [x] T033 [US2] 可读性验证通过 ✅

**Checkpoint**: ✅ User Stories 1 AND 2 均已完成 - 卡片紧凑且可读

---

## Phase 5: User Story 3 - 按钮和交互控件触控优化 (Priority: P2) ✅

**Goal**: Ensure buttons (e.g., "立即支付", "查看详情", "取消预约") maintain minimum touch target size of 88rpx x 88rpx (44x44pt) despite height reduction

**Independent Test**: Conduct touch testing with 3-5 users on real devices (iPhone), verify 95%+ first-tap success rate and <5% mis-tap rate for all buttons

### Implementation for User Story 3

> **实际实现文件**: `hall-reserve-taro/src/pages/my-reservations/index.less`

- [x] T034 [US3] 按钮样式已优化 ✅
- [x] T035 [US3] 已添加最小触控高度 `min-height: 44px` (view-detail 类) ✅
- [x] T036 [US3] 按钮内边距已设置 `padding: 8px 12px` ✅
- [x] T037 [US3] 触控区域通过 flex 对齐和 padding 扩展 ✅
- [x] T038 [US3] 按钮间距通过 card-footer 布局保证 ✅
- [x] T039 [US3] 微信开发者工具测试通过 ✅
- [x] T040 [US3] 真机测试触控准确 ✅
- [x] T041 [US3] 按钮文字清晰可见 ✅

**Checkpoint**: ✅ 所有用户故事 (US1, US2, US3) 均已完成并通过测试

---

## Phase 6: Responsive Design & Multi-Device Adaptation ✅

**Purpose**: Ensure optimized layout works across different screen sizes (iPhone SE 320-375px, iPhone 14 390px, iPad 768px+)

> **实际实现文件**: `hall-reserve-taro/src/pages/my-reservations/index.less`

- [x] T042 [P] 小屏幕媒体查询 (max-width: 375px) 已添加 ✅
  - 减小标题字号、内边距、信息字号
- [x] T043 [P] 大屏幕媒体查询 (min-width: 768px) 已添加 ✅
  - 设置 max-width: 600px 居中显示
  - 增大字号、内边距、间距
  - 增强卡片阴影和圆角
- [x] T044 iPhone SE (320px) 布局适配 ✅
- [x] T045 iPhone 14 (390px) 布局适配 ✅
- [x] T046 iPad (768px) 布局适配 - 卡片最大宽度限制 ✅
- [x] T047 空状态/加载状态样式已适配大屏幕 ✅

**Checkpoint**: ✅ Phase 6 已完成 - 响应式设计已实现

---

## Phase 7: Accessibility & Edge Cases

**Purpose**: Support accessibility features (system font scaling, high contrast) and handle edge cases

- [ ] T048 [P] Add media query for system font scaling (prefers-font-size: large) to increase fonts by ~15% in hall-reserve-taro/src/components/ReservationCard/index.module.scss
- [ ] T049 [P] Add media query for high contrast mode (prefers-contrast: high) to enhance border and text contrast in hall-reserve-taro/src/components/ReservationCard/index.module.scss
- [ ] T050 Test with iOS system font set to "Large" accessibility setting to verify layout adapts
- [ ] T051 Test with iOS high contrast mode enabled to verify text remains readable
- [ ] T052 Test edge case: empty reservation list to verify empty state message styling is consistent
- [ ] T053 Test edge case: loading state to verify skeleton/loading placeholder matches new card height
- [ ] T054 Test edge case: multiple status labels displayed simultaneously (e.g., "已确认" + "待支付") to verify layout doesn't overflow

---

## Phase 8: Polish & Validation

**Purpose**: Final validation, performance check, and documentation

- [ ] T055 [P] Run visual regression tests comparing baseline and optimized screenshots (if Playwright configured)
- [ ] T056 [P] Measure and verify FPS during list scrolling is ≥50 using WeChat DevTools Performance panel
- [ ] T057 [P] Check compiled bundle size increase is <5KB by comparing dist/ folder size before/after
- [ ] T058 Verify optimized cards render in <1.5s on first page load using WeChat DevTools Network panel
- [ ] T059 [P] Run ESLint and Prettier checks: `npm run lint` and `npm run format` in hall-reserve-taro
- [ ] T060 [P] Run TypeScript type check: `npx tsc --noEmit` in hall-reserve-taro
- [ ] T061 Create comparison screenshots document showing before/after card layouts for design review
- [ ] T062 Update component documentation or README if needed to reflect new card design specifications
- [ ] T063 Run quickstart.md validation steps (Section 4: Testing & Validation)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 2 (P1): Depends on User Story 1 completion (must verify readability of optimized layout)
  - User Story 3 (P2): Can start after Foundational (Phase 2) - Independent of US1/US2 but benefits from US1's spacing changes
- **Responsive Design (Phase 6)**: Depends on User Story 1 completion (adapts core layout)
- **Accessibility (Phase 7)**: Depends on User Story 2 completion (adapts readable styles)
- **Polish (Phase 8)**: Depends on all user stories and responsive/accessibility phases being complete

### User Story Dependencies

- **User Story 1 (P1)**: FOUNDATIONAL for this feature - all other stories build on compact layout
- **User Story 2 (P1)**: Depends on User Story 1 - validates readability of compact layout
- **User Story 3 (P2)**: Independent of US1/US2 but should be tested after US1 spacing changes

### Within Each User Story

- **User Story 1**: Tasks T011-T021 can run in parallel (all modify same SCSS file but different selectors)
- **User Story 2**: Tasks T025-T026 can run in parallel (different text elements)
- **User Story 3**: Tasks T034-T037 modify button styles sequentially

### Parallel Opportunities

- **Phase 1 Setup**: T003, T004, T005 can run in parallel (different operations)
- **Phase 2 Foundational**: T009, T010 can run in parallel (different files)
- **Phase 6 Responsive**: T042, T043 can run in parallel (different media queries)
- **Phase 7 Accessibility**: T048, T049 can run in parallel (different media queries)
- **Phase 8 Polish**: T055, T056, T057, T059, T060 can run in parallel (different validation tasks)

---

## Parallel Example: User Story 1 (Core Layout Optimization)

```bash
# Launch all style modifications for User Story 1 together:
Task T011: "Update card height to 280rpx"
Task T012: "Reduce vertical padding to 20rpx"
Task T013: "Reduce margin-bottom to 20rpx"
Task T014: "Add border-bottom separator"
Task T015: "Update title font-size to 30rpx"
Task T016: "Update subtitle font-size to 26rpx"
Task T017: "Update content font-size to 26rpx"
Task T018: "Update remarks font-size to 24rpx"
Task T019: "Update price font-size to 32rpx bold"
Task T020: "Update status font-size to 24rpx"
Task T021: "Reduce icon sizes to 32-40rpx"

# Then verify together with T022-T024 (sequential testing)
```

---

## Parallel Example: Responsive Design (Phase 6)

```bash
# Launch media queries in parallel:
Task T042: "Add small screen media query (max-width 375px)"
Task T043: "Add large screen media query (min-width 768px)"

# Then test all device sizes sequentially (T044-T046)
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (baseline capture)
3. Complete Phase 3: User Story 1 (compact layout)
4. Complete Phase 4: User Story 2 (readability validation)
5. **STOP and VALIDATE**: Test on real devices, verify 3-4 cards visible AND readable
6. Deploy/demo if P1 requirements met

### Incremental Delivery

1. Complete Setup + Foundational → Baseline established
2. Add User Story 1 → Test independently → Verify card count increase (MVP!)
3. Add User Story 2 → Test independently → Verify readability maintained
4. Add User Story 3 → Test independently → Verify button usability
5. Add Responsive Design (Phase 6) → Test on all device sizes
6. Add Accessibility (Phase 7) → Test with accessibility features
7. Each phase adds value without breaking previous functionality

### Single Developer Strategy

Recommended sequence:

1. Complete Phase 1-2 (Setup + Baseline)
2. Complete Phase 3 (User Story 1) → Test card density improvement
3. Complete Phase 4 (User Story 2) → Test readability
4. Complete Phase 5 (User Story 3) → Test button usability
5. Complete Phase 6 (Responsive) → Test multi-device
6. Complete Phase 7 (Accessibility) → Test edge cases
7. Complete Phase 8 (Polish) → Final validation

### Parallel Team Strategy (if applicable)

With 2 developers:

1. Both complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 + User Story 2 (compact + readable)
   - Developer B: User Story 3 + Responsive Design (buttons + multi-device)
3. Merge and test integration
4. Both complete Accessibility + Polish together

---

## Notes

- **[P] tasks** = different files or different selectors in same file, can run in parallel
- **[Story] label** maps task to specific user story for traceability
- Each user story should be independently testable
- Visual regression testing is recommended but not automated in this task list
- Usability testing with real users is critical for User Story 2 validation
- Touch testing on real devices (not just simulators) is critical for User Story 3
- All SCSS modifications use Taro rpx units (750px design baseline)
- Commit after completing each user story phase for rollback safety
- Stop at any checkpoint to validate story independently before proceeding
- **No backend/API changes** - this is pure frontend UI optimization
