# Implementation Plan: E2E测试脚本生成器 (e2e-test-generator)

**Branch**: `T002-e2e-test-generator` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T002-e2e-test-generator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

T002-e2e-test-generator 是一个 Claude Code Skill，用于将 T001-e2e-scenario-author 生成的场景 YAML 文件自动转换为可执行的测试脚本。核心功能包括：

1. **多框架支持**：P1 阶段支持 Playwright（UI + API 测试），P2 阶段扩展支持 Postman Collection 和 REST Client .http 文件
2. **智能代码生成**：基于模板引擎（Jinja2）将 YAML 场景转换为 TypeScript/JSON/HTTP 格式的测试脚本
3. **可扩展性**：通过 action-mappings.yaml 配置文件支持自定义 action → 代码模板的映射规则
4. **安全更新**：使用文件哈希和代码标记检测手动修改，大幅改动时生成新文件供手动合并

**技术方法**：Python 脚本 + Jinja2 模板引擎 + YAML/JSON 解析

## Technical Context

**⚠️ 注意：本功能为 Claude Code Skill，非传统 Web 应用**

**Language/Version**:
- Python 3.8+ (Skill 实现语言)
- TypeScript 5.9.3 (生成的 Playwright 测试脚本)
- JSON (生成的 Postman Collections)
- HTTP (生成的 REST Client 文件)

**Primary Dependencies**:
- PyYAML 6.0+ (YAML 解析)
- Jinja2 3.0+ (代码模板引擎)
- jsonschema (配置文件验证)
- hashlib (文件变更检测)
- pathlib (文件路径处理)

**Input/Output**:
- **Input**: 场景 YAML 文件 (from T001-e2e-scenario-author)
- **Output**:
  - Playwright TypeScript测试脚本 (.spec.ts)
  - Postman Collection v2.1 (.postman_collection.json)
  - REST Client HTTP文件 (.http)
  - Page Object模板 (.ts)

**Testing**:
- pytest (Python 单元测试)
- 集成测试：YAML → 生成代码 → TypeScript编译验证
- 手动测试：运行生成的 Playwright 测试

**Target Platform**:
- Claude Code CLI environment
- 生成的测试脚本运行于：Playwright, Postman/Newman, VS Code REST Client

**Project Type**:
- Claude Code Skill (命令行工具扩展)
- 代码生成器 (YAML → 测试脚本转换器)

**Performance Goals**:
- 单个场景生成 < 1秒
- 批量生成 50 个场景 < 3分钟
- 生成的测试脚本 100% TypeScript 编译通过
- 90% 通过 Playwright dry-run 验证

**Constraints**:
- 必须遵循 Principle 8: Claude Code Skills 开发规范（skill.md, data-model.md, quickstart.md强制要求）
- 必须遵循功能分支绑定、代码归属标识、测试驱动开发
- N/A: 组件化架构、前端技术栈分层、后端架构（不适用于CLI工具）

**Scale/Scope**:
- 支持 T001 生成的所有场景 YAML 格式
- 内置 10-15 个常用 actions 映射
- 支持自定义 action 扩展（via action-mappings.yaml）
- P1: Playwright 框架，P2: Postman + REST Client 框架

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**⚠️ 注意：本功能为 Claude Code Skill，部分Web应用规则标记为 N/A**

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: ✅ 分支 T002-e2e-test-generator 符合格式要求，spec位于 specs/T002-e2e-test-generator/spec.md
- [x] **代码归属标识**: ✅ 所有 Python 脚本、模板文件将包含 `# @spec T002-e2e-test-generator` 注释
- [x] **测试驱动开发**: ✅ Skill 代码将使用 pytest 编写单元测试，核心生成逻辑覆盖率 100%
- [x] **Claude Code Skills 开发规范** (Principle 8): ✅ 必须提供 skill.md, data-model.md, quickstart.md, contracts/
- [ ] **N/A - 组件化架构**: Skill 为 Python CLI 工具，不涉及 React 组件
- [ ] **N/A - 前端技术栈分层**: Skill 不属于 B端/C端 Web 应用
- [ ] **N/A - 数据驱动状态管理**: Skill 为无状态代码生成器
- [x] **代码质量工程化**: ✅ Python 代码将通过 pylint/black 格式化、类型提示（mypy）、pytest 测试
- [ ] **N/A - 后端技术栈约束**: Skill 不访问 Supabase，输出为静态测试脚本文件

### 性能与标准检查：
- [x] **性能标准**: ✅ 单个场景生成 < 1秒，批量生成50个 < 3分钟（见 Technical Context）
- [x] **安全标准**: ✅ 使用 yaml.safe_load() 防止代码注入，jsonschema 验证配置文件
- [ ] **N/A - 可访问性标准**: Skill 为 CLI 工具，生成的测试脚本无 UI

### Claude Code Skills 特定检查（Principle 8）：
- [x] **skill.md 文件**: ✅ 将创建于 `.claude/skills/e2e-test-generator/skill.md`
- [x] **spec.md 文件**: ✅ 已存在于 `specs/T002-e2e-test-generator/spec.md`
- [x] **data-model.md 文件**: ✅ 已生成于 `specs/T002-e2e-test-generator/data-model.md`
- [x] **quickstart.md 文件**: ✅ 已生成于 `specs/T002-e2e-test-generator/quickstart.md`
- [x] **contracts/ 文件**: ✅ 已生成 `contracts/action-mappings-schema.json` 和 `assertion-mappings-schema.json`

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
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
