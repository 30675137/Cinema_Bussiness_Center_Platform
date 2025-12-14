<!-- Sync Impact Report -->
<!-- Version change: 0.0.0 → 1.0.0 -->
<!-- Modified principles: All 5 core principles defined based on project analysis -->
<!-- Added sections: Feature Binding Governance, Development Workflow, Quality Standards -->
<!-- Removed sections: None -->
<!-- Templates requiring updates:
  ✅ .specify/templates/spec-template.md (already aligned)
  ✅ .specify/templates/plan-template.md (requires constitution check update)
  ✅ .specify/templates/tasks-template.md (already aligned)
  ⚠ .specify/templates/commands/*.md (needs verification for agent-specific references)
-->
<!-- Follow-up TODOs: None - all placeholders filled with concrete values -->

# 影院商品管理中台宪法

## 核心原则

### 一、功能分支绑定 (Feature Branch Binding)

每个功能开发必须严格绑定到唯一的规格标识符(specId)。分支命名采用 `feat/<specId>-<slug>` 格式，规格文档存放于 `specs/<specId>-<slug>/spec.md`。系统通过 `.specify/active_spec.txt` 维护当前激活规格的引用。当前 git 分支名中的 specId 必须等于 active_spec 指向路径中的 specId，AI 只允许在"当前分支 + active_spec"范围内修改内容。任何不匹配必须先修正绑定（改分支名或 active_spec），再继续实现。

**基本原理**: 确保每个功能都有明确的规格定义和唯一的开发分支，避免功能冲突和开发混乱，保证代码变更的可追溯性和规格的一致性。

### 二、测试驱动开发 (Test-Driven Development)

测试先行的开发策略是强制性的。所有功能必须先编写测试用例，确保测试失败后再实现功能代码。严格遵循 Red-Green-Refactor 循环：先写测试（Red），实现最小可行代码使测试通过（Green），然后重构优化（Refactor）。使用 Playwright 进行端到端测试，Vitest 进行单元测试，确保关键业务流程的测试覆盖率达到 100%。

**基本原理**: 测试先行保证功能需求的明确性和代码设计的正确性，通过自动化测试确保代码质量和回归预防，提高代码的可维护性和系统的稳定性。

### 三、组件化架构 (Component-Based Architecture)

系统采用原子设计理念的分层组件架构：原子组件（Atoms）、分子组件（Molecules）、有机体（Organisms）、模板（Templates）和页面（Pages）。所有组件必须遵循单一职责原则，具有清晰的 Props 接口定义和 TypeScript 类型注解。使用 React.memo、useMemo、useCallback 进行性能优化，避免不必要的重渲染。

**基本原理**: 组件化架构确保代码的可复用性、可维护性和可测试性，通过清晰的组件层次和性能优化策略，构建高效的用户界面系统。

### 四、数据驱动与状态管理 (Data-Driven & State Management)

使用 Zustand 管理客户端状态，TanStack Query 管理服务器状态，实现数据与 UI 的分离。所有 API 数据获取必须通过 TanStack Query 进行，利用其缓存、重试、后台刷新等特性。本地数据持久化使用 localStorage，Mock 数据使用 MSW（Mock Service Worker）进行模拟。状态变更必须是可预测和可追踪的。

**基本原理**: 数据驱动的方法确保应用状态的一致性和可预测性，通过专业的状态管理工具和缓存策略，提供流畅的用户体验和可靠的数据处理能力。

### 五、代码质量与工程化 (Code Quality & Engineering Excellence)

遵循严格的代码规范和质量标准。使用 TypeScript 5.9.3 确保类型安全，ESLint + Prettier 确保代码风格一致性，Husky + lint-staged 确保提交质量。所有代码必须通过静态分析、单元测试和集成测试。遵循 Git 提交规范（Conventional Commits），使用语义化版本控制。代码审查必须检查功能实现、边界情况处理、性能考虑、测试覆盖和安全考虑。

**基本原理**: 高标准的工程化实践确保代码质量、团队协作效率和项目的长期可维护性，通过自动化工具和规范流程减少人为错误，提升开发效率。

## 开发工作流

### 规格驱动开发 (Specification-Driven Development)

所有功能开发必须基于完整的规格文档。规格文档包含用户场景、验收标准、功能需求、关键实体、成功标准等核心内容。开发前必须仔细阅读和理解规格，确保实现与规格一致。规格文档中的所有功能需求（FR-*）和成功标准（SC-*）都必须在实现中得到验证和满足。

### 分支管理策略 (Branch Management Strategy)

采用功能分支开发模式，每个功能对应独立的开发分支。分支命名严格遵循 `feat/<specId>-<slug>` 格式。开发完成后通过 Pull Request 进行代码审查，审查通过后合并到主分支。禁止直接在主分支进行开发，确保代码质量和变更的可追溯性。

### 持续集成与质量门禁 (Continuous Integration & Quality Gates)

建立完整的质量门禁体系，包括代码规范检查、类型检查、单元测试、集成测试、端到端测试等。所有质量检查必须通过后才能合并代码。使用自动化工具确保质量标准的执行，减少人工审查的工作量和主观性。

## 质量标准

### 性能标准 (Performance Standards)

应用启动时间不超过 3 秒，页面切换响应时间不超过 500 毫秒，数据列表加载支持虚拟滚动优化。必须进行性能监控，使用 Web Vitals 指标评估用户体验。大型数据列表必须使用虚拟滚动或分页加载，避免页面卡顿。

### 安全标准 (Security Standards)

前端必须有完善的输入验证和数据清理机制，使用 Zod 进行数据验证。防止 XSS 攻击，避免在前端存储敏感信息。API 请求必须包含适当的认证和授权机制，处理 Token 过期和刷新逻辑。

### 可访问性标准 (Accessibility Standards)

遵循 WCAG 2.1 AA 级别的可访问性标准，确保键盘导航、屏幕阅读器支持、色彩对比度等要求。所有交互元素必须有明确的焦点指示和语义化的 HTML 结构。

## 治理规则

本宪法作为项目开发的最高指导原则，所有开发活动和代码审查都必须验证其合规性。任何对宪法的修改都必须通过团队讨论和批准，并更新版本号。版本控制遵循语义化版本规则：主版本号（重大变更或不兼容的修改）、次版本号（新功能添加）、修订号（错误修复和澄清）。

当开发实践与宪法原则发生冲突时，应以宪法原则为准，必要时通过正式流程修订宪法。团队成员都有责任和维护宪法的执行，确保项目的长期健康发展。

**版本**: 1.0.0 | **制定日期**: 2025-12-14 | **最后修订**: 2025-12-14