# Implementation Plan: E2E 报告配置器 (e2e-report-configurator)

**Branch**: `T006-e2e-report-configurator` | **Date**: 2025-12-30 | **Spec**: [specs/T006-e2e-report-configurator/spec.md](./spec.md)
**Input**: Feature specification from `/specs/T006-e2e-report-configurator/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature implements a Claude Code skill (`/e2e-report-configurator`) to configure E2E test report outputs for Playwright tests. The skill will:
- Configure mandatory HTML reports and optional JSON/JUnit reports
- Standardize output directory structure (`reports/e2e/{html,json,junit,artifacts}/`)
- Manage artifact retention policies (screenshots, videos, traces)
- Validate configuration correctness and generate documentation
- Integrate with existing T001-T004 E2E testing skills

**Technical Approach**: Implement as a conversational Claude Code skill that reads/writes Playwright configuration files, creates directory structures, updates `.gitignore`, and generates documentation following patterns from T001-T004.

## Technical Context

**Language/Version**:
- Skill Implementation: TypeScript 5.9.3 (for script validation and type safety)
- Target Configuration: playwright.config.ts (TypeScript)
- Documentation: Markdown
- Claude Code Skill Runtime: Claude Code CLI

**Primary Dependencies**:
- Playwright @playwright/test (target dependency - skill validates its presence)
- Node.js fs/promises (file system operations)
- YAML parser (for skill.md frontmatter)
- TypeScript compiler (for config validation)

**Storage**:
- File system: Read/write Playwright config files, create directories, update .gitignore
- No database/Supabase dependency (skill operates on local files)

**Testing**:
- Skill functionality tests: Vitest (unit tests for configuration generation logic)
- Integration tests: Test skill commands against sample projects
- Validation tests: Verify generated configurations compile and execute correctly

**Target Platform**:
- Development environment: macOS, Linux, Windows (cross-platform file operations)
- CI/CD environments: GitHub Actions, GitLab CI, Jenkins (must work in all)
- Target projects: Playwright test suites using TypeScript

**Project Type**:
- Claude Code Skill (command-line tool extension)
- Infrastructure tool (configuration management, not user-facing application)

**Performance Goals**:
- Skill execution time: < 10 seconds for setup command
- Configuration validation: < 5 seconds
- Documentation generation: < 3 seconds
- No impact on test execution performance (configuration-only changes)

**Constraints**:
- Must comply with **Principle 8** (Claude Code Skills Development Standards)
- Must include YAML frontmatter in skill.md (mandatory)
- Must provide spec.md, data-model.md, quickstart.md, skill.md
- Must follow T001-T004 directory structure conventions
- Must be idempotent (safe to run multiple times)
- Must not break existing Playwright configurations

**Scale/Scope**:
- Single-purpose skill focused on report configuration
- Targets projects with 10-1000+ Playwright tests
- Supports 1-3 report formats (HTML/JSON/JUnit)
- Manages 4 output directories + .gitignore updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Claude Code Skill 特定检查 (Principle 8):

- [ ] **YAML Frontmatter**: skill.md 必须包含 YAML frontmatter (name, description, version)
- [ ] **必填文档**: 必须包含 spec.md, data-model.md, quickstart.md, skill.md 四个文档
- [ ] **命令格式**: 使用 `/e2e-report-configurator` 格式，支持子命令 (setup, validate, docs)
- [ ] **工作流定义**: skill.md 明确定义对话流程或自动化流程
- [ ] **输出规范**: 生成的配置文件符合 Playwright 规范，目录结构符合 T001-T004 规范
- [ ] **资源文件组织**: 模板文件存放在 `.claude/skills/e2e-report-configurator/assets/templates/`

### 适用的宪法原则检查：

- [ ] **功能分支绑定**: 当前分支 `T006-e2e-report-configurator` 与 active_spec 一致
- [ ] **代码归属标识**: 所有生成的脚本/配置文件包含 `@spec T006` 标识
- [ ] **测试驱动开发**: Skill 功能测试覆盖所有命令 (setup, validate, docs)，至少 3 个真实使用场景
- [ ] **代码质量工程化**: 通过 TypeScript 类型检查、ESLint、Prettier

### N/A (不适用于 Claude Code Skill):

- **组件化架构** (N/A - 非前端组件项目)
- **前端技术栈分层** (N/A - 非前端应用)
- **数据驱动状态管理** (N/A - 无状态工具，基于文件操作)
- **后端技术栈约束** (N/A - 非后端服务)
- **性能标准** (N/A - 工具执行性能要求已在 Technical Context 定义)
- **安全标准** (部分适用 - 文件权限验证，无 XSS/认证需求)
- **可访问性标准** (N/A - 命令行工具，无 UI)

## Project Structure

### Documentation (this feature)

```text
specs/T006-e2e-report-configurator/
├── spec.md              # Feature specification (✅ already created)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (research on Playwright reporters)
├── data-model.md        # Phase 1 output (configuration schemas, directory structures)
├── quickstart.md        # Phase 1 output (quick start guide for skill usage)
├── contracts/           # Phase 1 output (TypeScript types for configuration)
│   └── reporter-config.ts  # Playwright reporter configuration types
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Skill Implementation (Claude Code)

```text
.claude/skills/e2e-report-configurator/
├── skill.md             # Skill definition with YAML frontmatter (✅ MANDATORY)
├── assets/              # Skill resources
│   └── templates/       # Configuration templates
│       ├── playwright-config-html.template.ts
│       ├── playwright-config-multi.template.ts
│       ├── gitignore.template
│       └── e2e-reports-doc.template.md
├── scripts/             # Helper scripts (optional)
│   ├── config-validator.ts
│   └── directory-creator.ts
└── tests/               # Skill tests
    ├── setup-command.test.ts
    ├── validate-command.test.ts
    └── docs-command.test.ts
```

### Generated Output Structure (target project)

```text
<target-project>/
├── playwright.config.ts         # Updated with reporter configuration
├── reports/                     # Report output directory (created)
│   └── e2e/
│       ├── html/               # HTML reports
│       │   └── .gitkeep
│       ├── json/               # JSON reports
│       │   └── .gitkeep
│       ├── junit/              # JUnit XML reports
│       │   └── .gitkeep
│       └── artifacts/          # Test artifacts
│           ├── screenshots/
│           │   └── .gitkeep
│           ├── videos/
│           │   └── .gitkeep
│           └── traces/
│               └── .gitkeep
├── .gitignore                  # Updated with reports/ entry
└── docs/
    └── e2e-reports.md          # Generated documentation
```

**Structure Decision**: Claude Code skill with file-based operations, template-driven configuration generation, and clear separation between skill implementation (.claude/skills/) and spec documentation (specs/T005/). Follows T001-T004 patterns for directory naming and output structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No constitution violations | All checks either passed or marked N/A |

---

## Phase 0: Research & Architecture

### Research Tasks

**NEEDS CLARIFICATION** items extracted from Technical Context and spec.md:

1. **Playwright Reporter Configuration API**
   - Decision needed: How to programmatically update `playwright.config.ts` without breaking existing configuration?
   - Research: Playwright reporters API, configuration merging strategies, TypeScript AST manipulation
   - Questions: Should we use simple string replacement, AST parsing, or template-based generation?

2. **Multi-Format Reporter Configuration**
   - Decision needed: How to configure HTML + JSON + JUnit reporters simultaneously?
   - Research: Playwright reporters array format, output file path conventions, reporter-specific options
   - Questions: How to handle reporter conflicts (same output directory)?

3. **Directory Permission Handling**
   - Decision needed: How to handle directory creation failures (permissions, disk space)?
   - Research: Node.js fs.mkdir error codes, cross-platform permission models, CI environment constraints
   - Questions: Should skill fail hard or create partial structure with warnings?

4. **GitIgnore Update Strategy**
   - Decision needed: How to safely update `.gitignore` without breaking existing patterns?
   - Research: .gitignore parsing libraries, append-only vs. merge strategies
   - Questions: Should we validate .gitignore syntax before/after update?

5. **Configuration Validation Approach**
   - Decision needed: How to validate generated `playwright.config.ts` compiles and works?
   - Research: TypeScript compiler API, Playwright config validation, dry-run execution
   - Questions: Should we run `tsc --noEmit` or `npx playwright test --dry-run`?

6. **CI/CD Integration Patterns**
   - Decision needed: What CI/CD integration examples to include in documentation?
   - Research: GitHub Actions artifacts upload, GitLab CI report formats, Jenkins integration
   - Questions: Should we generate CI config snippets or only provide examples?

### Research Output

Will be consolidated in `research.md` with format:
- **Decision**: [what was chosen and why]
- **Rationale**: [technical justification]
- **Alternatives considered**: [what else was evaluated and why rejected]
- **Implementation notes**: [key technical details for Phase 1]

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all NEEDS CLARIFICATION resolved

### Data Model Design (data-model.md)

Will extract and document:

1. **Reporter Configuration Schema**
   - Entity: `ReporterConfig` (HTML/JSON/JUnit reporter options)
   - Fields: `type`, `outputFolder/outputFile`, `open`, custom options
   - Validation rules: Unique output paths, valid reporter types

2. **Artifact Retention Policy Schema**
   - Entity: `ArtifactRetentionPolicy`
   - Fields: `screenshot`, `video`, `trace` (on/off/only-on-failure/retain-on-failure)
   - Validation rules: Valid retention option values

3. **Directory Structure Schema**
   - Entity: `DirectoryStructure`
   - Relationships: Base path → sub-directories (html/json/junit/artifacts)
   - Validation rules: Path uniqueness, no circular references

4. **Validation Result Schema**
   - Entity: `ValidationResult`
   - Fields: `checks[]`, `status`, `errors[]`, `suggestions[]`
   - State transitions: pending → validating → passed/failed

### API Contracts (contracts/)

Will generate TypeScript type definitions:

```typescript
// contracts/reporter-config.ts

/**
 * @spec T006-e2e-report-configurator
 * Playwright reporter configuration types
 */

export type ReporterFormat = 'html' | 'json' | 'junit';

export type ArtifactRetentionOption =
  | 'on'
  | 'off'
  | 'only-on-failure'
  | 'retain-on-failure'
  | 'on-first-retry';

export interface HTMLReporterConfig {
  type: 'html';
  outputFolder: string;
  open?: 'always' | 'never' | 'on-failure';
}

export interface JSONReporterConfig {
  type: 'json';
  outputFile: string;
}

export interface JUnitReporterConfig {
  type: 'junit';
  outputFile: string;
}

export type ReporterConfig =
  | HTMLReporterConfig
  | JSONReporterConfig
  | JUnitReporterConfig;

export interface ArtifactRetentionPolicy {
  screenshot: ArtifactRetentionOption;
  video: ArtifactRetentionOption;
  trace: ArtifactRetentionOption;
}

export interface DirectoryStructure {
  basePath: string;
  htmlDir: string;
  jsonDir: string;
  junitDir: string;
  artifactsDir: string;
}

export interface ValidationCheck {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  suggestion?: string;
}

export interface ValidationResult {
  overall: 'passed' | 'failed';
  checks: ValidationCheck[];
  timestamp: string;
}

export interface SkillCommandOptions {
  format?: string; // 'html' | 'html,json' | 'html,json,junit'
  output?: string; // Custom output directory
  artifacts?: 'on-failure' | 'always' | 'never';
}
```

### Quickstart Guide (quickstart.md)

Will provide:
1. Installation/setup prerequisites (Playwright installed)
2. Basic usage examples (setup/validate/docs commands)
3. Common troubleshooting scenarios
4. Example generated configurations

### Agent Context Update

After Phase 1 completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will update `.claude/CONTEXT.md` with:
- New technology: Playwright reporters configuration
- New patterns: Report directory structure conventions
- New conventions: Multi-format reporter setup

---

## Next Steps

**After `/speckit.plan` completion**:
1. ✅ Review `research.md` for decision clarity
2. ✅ Validate `data-model.md` schema completeness
3. ✅ Check `contracts/` TypeScript types compile
4. ✅ Read `quickstart.md` for usability
5. Run `/speckit.tasks` to generate Phase 2 implementation tasks

**Phase 2 will be initiated separately** using the `/speckit.tasks` command, which will:
- Generate task breakdown based on Phase 1 design
- Create prioritized implementation plan
- Define test scenarios for TDD workflow
