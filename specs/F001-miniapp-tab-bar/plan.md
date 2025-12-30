# Implementation Plan: 微信小程序底部导航栏

**Branch**: `F001-miniapp-tab-bar` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/F001-miniapp-tab-bar/spec.md`

## Summary

为微信小程序添加底部导航栏（TabBar），包含场地预约、商城、会员、我的四个功能入口。使用 Taro 原生 TabBar 配置实现，确保流畅的页面切换体验和清晰的导航状态指示。

## Technical Context

**Language/Version**:
- C端（客户端/小程序）: TypeScript 5.9.3 + Taro 4.x + React

**Primary Dependencies**:
- Taro 4.1.9（当前项目版本）
- React 18.x
- Taro UI 或 NutUI（如需自定义 TabBar 组件）

**Storage**: 无需数据存储，纯前端配置

**Testing**:
- 微信开发者工具（小程序端测试）
- H5 浏览器测试
- 手工验收测试（导航切换、状态指示）

**Target Platform**:
- 微信小程序（主要）
- H5（次要）

**Project Type**:
- C端 Taro 小程序配置更新

**Performance Goals**:
- 页面切换 < 300ms
- 首屏渲染 < 1.5s
- 导航栏始终流畅响应

**Constraints**:
- 必须使用 Taro 原生 TabBar 配置（app.config.ts）
- 必须符合微信小程序 TabBar 规范（2-5 个 tab 项）
- 图标必须为本地路径，不支持网络图片

**Scale/Scope**:
- 4 个导航项：场地预约、商城、会员、我的
- 4 个 Tab 页面（需创建商城、会员、我的页面）
- 图标资源：8 个（4 个选中态 + 4 个未选中态）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支 F001-miniapp-tab-bar 与 specs/F001-miniapp-tab-bar 对应
- [x] **测试驱动开发**: TabBar 配置无需单元测试，通过手工验收测试验证
- [x] **组件化架构**: 使用 Taro 原生 TabBar，无需自定义组件（除非后续需要自定义样式）
- [x] **前端技术栈分层**: C端使用 Taro 框架 ✓
- [x] **数据驱动状态管理**: TabBar 为静态配置，无状态管理需求
- [x] **代码质量工程化**: TypeScript 类型检查 ✓
- [ ] **后端技术栈约束**: 不涉及后端

### 性能与标准检查：
- [x] **性能标准**: Taro 原生 TabBar 性能最优，切换 < 300ms
- [x] **安全标准**: 不涉及用户输入和数据处理
- [x] **可访问性标准**: TabBar 原生支持屏幕阅读器

## Project Structure

### Documentation (this feature)

```text
specs/F001-miniapp-tab-bar/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal for this feature)
├── quickstart.md        # Phase 1 output
├── contracts/           # Not applicable (no API)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
hall-reserve-taro/
├── src/
│   ├── app.config.ts          # TabBar 配置主文件 ★
│   ├── pages/
│   │   ├── home/              # 场地预约（现有，改为 Tab 页）
│   │   ├── mall/              # 商城（新建 Tab 页）★
│   │   ├── member/            # 会员（新建 Tab 页）★
│   │   └── profile/           # 我的（新建 Tab 页）★
│   └── assets/
│       └── tabbar/            # TabBar 图标资源 ★
│           ├── reserve.png
│           ├── reserve-active.png
│           ├── mall.png
│           ├── mall-active.png
│           ├── member.png
│           ├── member-active.png
│           ├── profile.png
│           └── profile-active.png
└── ...
```

## Complexity Tracking

> 无宪法违反项

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
