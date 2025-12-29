# Implementation Plan: 预约卡片紧凑布局优化

**Branch**: `U002-reservation-card-ui-compact` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/U002-reservation-card-ui-compact/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

优化小程序预约卡片的UI布局,通过减小卡片高度(20-30%)、缩小字体大小和优化间距,使用户在标准移动设备(375px宽屏幕)上一屏能够看到3-4条完整的预约卡片(相比优化前的2条),提升预约列表浏览效率。同时确保可读性不受影响,按钮触控区域符合移动端规范。

**核心技术方案**:
- C端Taro项目样式优化(修改SCSS/CSS变量和组件样式)
- 响应式设计(支持不同屏幕尺寸设备)
- 辅助功能支持(系统字体放大自适应)
- 视觉测试验证(对比优化前后效果)

## Technical Context

**Language/Version**:
- C端（客户端/小程序）: TypeScript 5.9.3 + Taro 3.x + React (本功能仅涉及C端UI优化)

**Primary Dependencies**:
- C端: Taro 3.x, @tarojs/components, SCSS/CSS Modules, Taro UI design tokens(可选)

**Storage**: 无需数据存储(纯UI样式优化)

**Testing**:
- C端: 视觉回归测试(截图对比), 微信开发者工具真机预览, H5浏览器测试(多设备尺寸), 可用性测试(用户识别关键信息的准确率)

**Target Platform**:
- C端: 微信小程序 + H5 (Taro跨端编译)
- 优先适配: iPhone SE(320px-375px宽), iPhone 14(390px宽), iPad(768px宽)

**Project Type**:
- 前端UI样式优化项目(无后端API变更,无数据模型变更)

**Performance Goals**:
- C端: 优化后首屏渲染时间不增加(<1.5s), 卡片渲染不影响滚动FPS(≥50), 样式文件增量<5KB

**Constraints**:
- 必须遵循Taro框架rpx单位规范(750设计稿基准)
- 必须保持与U001-reservation-order-management预约卡片组件的兼容性
- 必须符合移动端触控规范(Apple HIG 44x44pt / Android 48x48dp最小触控区)
- 必须支持辅助功能(系统字体放大时自适应)

**Scale/Scope**:
- C端: 仅修改预约卡片组件样式(ReservationCard.tsx及其SCSS文件)
- 影响范围: "我的预约"列表页(hall-reserve-taro/src/pages/my-reservations/index.tsx)
- 样式变量优化: 字体大小、行高、内外边距、卡片高度

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支`U002-reservation-card-ui-compact`与spec路径一致,符合U模块编号规范 ✅
- [x] **测试驱动开发**: 需编写视觉回归测试和可用性测试,验证卡片高度、字体大小、触控区域符合规格要求 ✅
- [x] **组件化架构**: 优化现有ReservationCard组件样式,遵循原子设计理念,组件可复用 ✅
- [x] **前端技术栈分层**: 本功能仅涉及C端Taro项目,符合技术栈分层规范 ✅
- [x] **数据驱动状态管理**: 纯UI优化,无状态管理变更,现有Zustand状态保持不变 ✅
- [x] **代码质量工程化**: TypeScript类型检查,ESLint/Prettier格式化,样式文件遵循SCSS规范 ✅
- [N/A] **后端技术栈约束**: 纯前端UI优化,不涉及后端API或Supabase集成

### 性能与标准检查：
- [x] **性能标准**: 优化后首屏渲染时间不增加(<1.5s),滚动FPS≥50,样式文件增量<5KB ✅
- [x] **安全标准**: 纯样式优化,无数据验证或XSS风险,不涉及认证授权 ✅
- [x] **可访问性标准**: 必须支持辅助功能(系统字体放大自适应),文字与背景对比度符合WCAG 2.1 AA ✅

**GATE STATUS**: ✅ PASSED - All applicable constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/          # Reusable UI components (Atomic Design)
│   │   ├── atoms/          # Basic UI elements (Button, Input, etc.)
│   │   ├── molecules/      # Component combinations (SearchForm, etc.)
│   │   ├── organisms/      # Complex components (ProductList, etc.)
│   │   └── templates/      # Layout templates (MainLayout, etc.)
│   ├── features/           # Feature-specific modules
│   │   ├── product-management/
│   │   │   ├── components/ # Feature-specific components
│   │   │   ├── hooks/      # Custom hooks
│   │   │   ├── services/   # API services
│   │   │   ├── types/      # TypeScript types
│   │   │   └── utils/      # Utility functions
│   │   └── [other-features]/
│   ├── pages/              # Page components (route-level)
│   ├── hooks/              # Global custom hooks
│   ├── services/           # Global API services
│   ├── stores/             # Zustand stores
│   ├── types/              # Global TypeScript types
│   ├── utils/              # Global utility functions
│   ├── constants/          # Application constants
│   └── assets/             # Static assets
├── public/                 # Public assets and MSW worker
├── tests/                  # Test files
│   ├── __mocks__/         # Mock files
│   ├── fixtures/          # Test data
│   └── utils/             # Test utilities
└── docs/                  # Feature documentation

specs/                      # Feature specifications
├── [###-feature-name]/
│   ├── spec.md           # Feature specification
│   ├── plan.md           # Implementation plan (this file)
│   ├── research.md       # Research findings
│   ├── data-model.md     # Data model design
│   ├── quickstart.md     # Development quickstart
│   └── tasks.md          # Development tasks
└── [other-features]/
```

**Structure Decision**: Frontend-only web application using React with feature-based modular architecture. Components follow Atomic Design principles, business logic is organized by feature modules, and comprehensive testing is maintained at all levels.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations | All constitution principles satisfied |

---

## Phase Completion Summary

### Phase 0: Research ✅ COMPLETED (2025-12-24)

**Key Decisions**:
1. **Responsive Units**: Use Taro rpx (750px design baseline) + CSS variables
2. **Touch Targets**: Minimum 88rpx x 88rpx (Apple HIG 44x44pt compliant)
3. **Typography**: Primary text 28-30rpx, secondary 24-26rpx, price 32rpx bold
4. **Spacing**: Card internal 16-20rpx, card-to-card 16-24rpx, 1rpx separator lines
5. **Text Overflow**: Scene name 2 lines, remarks 1 line with ellipsis
6. **Accessibility**: WCAG 2.1 AA contrast (≥4.5:1), system font scaling support
7. **Testing**: Visual regression (Playwright screenshots) + multi-device validation

**Output**: [research.md](./research.md) - 9 comprehensive research sections

### Phase 1: Design ✅ COMPLETED (2025-12-24)

**Key Artifacts**:
- **data-model.md**: Documented UI-only feature (no data model changes)
- **contracts/**: Skipped (no API changes)
- **quickstart.md**: Complete development guide with 14 SCSS modification points

**Key Design Decisions**:
1. **Card Height Reduction**: 400rpx → 280rpx (-30%)
2. **Font Size Optimization**:
   - Title: 36rpx → 30rpx
   - Subtitle: 30rpx → 26rpx
   - Content: 28rpx → 26rpx
   - Remarks: 26rpx → 24rpx
   - Price: 36rpx → 32rpx (bold)
   - Status: 26rpx → 24rpx
3. **Spacing Optimization**:
   - Vertical padding: 32rpx → 20rpx
   - Card margin: 32rpx → 20rpx
   - Button height: 80rpx → 64rpx (minimum touch area 88rpx maintained)
4. **Multi-Device Support**: Media queries for iPhone SE (320-375px), iPad (768px+)
5. **Accessibility**: System font scaling, high contrast mode support

**Output Files**:
- [data-model.md](./data-model.md) - UI display mappings and style variables
- [quickstart.md](./quickstart.md) - Step-by-step implementation guide

**Agent Context**: Updated CLAUDE.md with "无需数据存储(纯UI样式优化)"

### Post-Design Constitution Re-evaluation ✅ PASSED

All constitution principles remain satisfied:
- ✅ Branch-spec binding intact (U002-reservation-card-ui-compact)
- ✅ Test-driven approach (visual regression + usability tests planned)
- ✅ Component architecture (Taro ReservationCard component)
- ✅ C-end tech stack (Taro 3.x framework only)
- ✅ State management unchanged (Zustand preserved)
- ✅ Code quality standards (TypeScript, ESLint, SCSS modules)
- ✅ Performance targets (<1.5s render, ≥50 FPS, <5KB style increase)
- ✅ Accessibility (WCAG 2.1 AA compliance)

**PLANNING STATUS**: ✅ READY FOR TASK BREAKDOWN (run `/speckit.tasks` next)
