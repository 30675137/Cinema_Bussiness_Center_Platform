# Implementation Plan: E2E Test Runner

**Branch**: `T003-e2e-runner` | **Date**: 2025-12-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/T003-e2e-runner/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

E2E Test Runner (e2e-runner) is a Claude Code Skill that provides a unified test execution entry point for Playwright E2E tests across multiple environments. It addresses the need for **environment-agnostic test execution** by using E2ERunConfig files to specify environment-specific parameters (baseURL, credentials, retry/parallel settings). The skill integrates with test-scenario-author (T001) and e2e-test-generator (T002) to complete the end-to-end testing workflow: scenario creation → test script generation → test execution with reports.

**Primary Requirements**:
- Execute Playwright tests with environment-specific configuration (staging, UAT, production)
- Securely manage credentials via external file references (credentials_ref)
- Generate and persist test reports (HTML, JSON, screenshots, videos)
- Support multi-browser/device testing via Playwright projects
- Provide configuration validation and clear error messages

**Technical Approach**:
- Implement as TypeScript-based CLI tool using Playwright Test Runner API
- Configuration loader validates E2ERunConfig JSON files against JSON Schema
- Credentials loader merges credentials into Playwright environment variables
- Test runner executes `npx playwright test` with merged configuration
- Report generator consolidates results into structured TestReport format
- Integration with existing skill infrastructure (.claude/skills/e2e-runner/)

## Technical Context

**Project Type**: Claude Code Skill (CLI tool) - Infrastructure/Tool (T### module)

**Language/Version**:
- Implementation: TypeScript 5.x (Node.js 18+)
- Target: Playwright Test Runner integration
- Configuration: JSON (E2ERunConfig, CredentialsFile)
- Documentation: Markdown with YAML frontmatter

**Primary Dependencies**:
- **@playwright/test** (>= 1.40.0): Test execution engine and reporter API
- **Node.js** (>= 18.0.0): Runtime environment
- **fs/promises**: File system operations (config/credentials loading)
- **path**: Path resolution for cross-platform compatibility
- **jsonschema** or **zod**: Configuration validation
- **chalk** (optional): CLI output formatting

**Storage**:
- Configuration files: JSON format in `configs/` directory
- Credentials files: JSON format in `credentials/` directory (gitignored)
- Test reports: HTML/JSON/screenshots in configurable `report_output_dir`
- No persistent database required (stateless tool)

**Testing**:
- Unit tests: Vitest for configuration loader, validator, credentials manager
- Integration tests: Test execution with mock Playwright configs
- E2E validation: Self-test with actual Playwright test execution
- Coverage target: 80% for critical business logic

**Target Platform**:
- CLI execution: macOS, Linux, Windows (Node.js cross-platform)
- CI/CD integration: GitHub Actions, GitLab CI, Jenkins
- Local development: VS Code terminal, iTerm, Command Prompt

**Performance Goals**:
- Configuration validation: < 100ms
- Credential loading: < 50ms
- Test execution overhead: < 5% of total test time
- Report generation: < 5% of total test time

**Constraints**:
- Must comply with Principle 8 (Claude Code Skills standards)
- Must have YAML frontmatter in skill.md (R10.3)
- Must include spec.md, data-model.md, quickstart.md, skill.md (R10.2)
- Must use @spec T003-e2e-runner attribution
- No UI components required (CLI tool, not B端/C端)
- No database/Supabase integration required (reads local config files)

**Scale/Scope**:
- Skill scope: Single CLI command with subcommands (run, validate)
- Expected test scenarios: 10-100 per module
- Configuration files: 3-10 environments (dev, staging, UAT, production)
- Report retention: User-managed (skill generates, user archives)

**Integration Points**:
- test-scenario-author (T001): Consumes scenario YAML files indirectly
- e2e-test-generator (T002): Executes generated .spec.ts files
- Playwright: Direct API integration via programmatic runner
- CI/CD: Invoked via shell commands in pipeline configuration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 必须满足的宪法原则检查：

- [x] **功能分支绑定**: 当前分支名 `T003-e2e-runner` 与 specId 一致 ✅
- [x] **代码归属标识**: 所有实现文件必须包含 `@spec T003-e2e-runner` 注释 ✅
- [x] **测试驱动开发**: 单元测试覆盖配置加载、验证、凭据管理等关键逻辑 (目标 80%) ✅
- [N/A] **组件化架构**: 不适用 (CLI tool, 无 UI 组件)
- [N/A] **前端技术栈分层**: 不适用 (非 B端/C端应用)
- [N/A] **数据驱动状态管理**: 不适用 (无状态 CLI tool)
- [x] **代码质量工程化**: 必须通过 TypeScript 严格模式、ESLint、Prettier 检查 ✅
- [N/A] **后端技术栈约束**: 不适用 (不涉及 Spring Boot/Supabase，仅调用 Playwright API)
- [x] **Claude Code Skills 标准 (Principle 8)**:
  - [x] 使用 T### 前缀 (T003) ✅
  - [x] skill.md 包含 YAML frontmatter ✅ (已创建)
  - [x] spec.md 完整 ✅ (已创建)
  - [x] data-model.md 完整 ✅ (已创建)
  - [x] quickstart.md 完整 ✅ (已创建)

### 性能与标准检查：
- [x] **性能标准**: 配置验证 <100ms, 凭据加载 <50ms, 测试执行开销 <5% ✅
- [x] **安全标准**:
  - [x] 使用 jsonschema/Zod 验证配置文件 ✅
  - [x] 检查凭据文件权限 (warn if > 0600) ✅
  - [x] 确保凭据文件不进入 Git (.gitignore 检查) ✅
- [N/A] **可访问性标准**: 不适用 (CLI tool, 无 UI 界面)

### Skill-Specific 验证：
- [x] **文档完整性**: spec.md, data-model.md, quickstart.md, skill.md 全部齐全 ✅
- [x] **YAML Frontmatter**: skill.md 包含 name, description (含触发关键词), version ✅
- [x] **命令格式**: 使用 `/e2e-runner` 格式调用 ✅
- [x] **错误处理**: 所有错误提供清晰的问题说明和解决建议 (在 spec 中定义)✅
- [x] **集成测试**: 至少 3 个真实场景的测试用例 (基本执行、多环境、凭据管理) ✅

## Project Structure

### Documentation (this feature)

```text
specs/T003-e2e-runner/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Data schemas (completed, will be enhanced in Phase 1)
├── quickstart.md        # Usage guide (completed)
├── contracts/           # Phase 1 output (JSON schemas)
│   ├── E2ERunConfig.schema.json
│   ├── CredentialsFile.schema.json
│   └── TestReport.schema.json
└── checklists/
    └── requirements.md  # Quality checklist (completed)
```

### Source Code (Claude Code Skill)

```text
.claude/skills/e2e-runner/
├── skill.md                        # Skill documentation with YAML frontmatter (completed)
├── scripts/                        # Implementation scripts
│   ├── cli.ts                      # CLI entry point (invoked by /e2e-runner)
│   ├── config-loader.ts            # E2ERunConfig JSON loader & validator
│   ├── credentials-loader.ts       # CredentialsFile loader & env injection
│   ├── runner.ts                   # Playwright test execution wrapper
│   ├── reporter.ts                 # TestReport generator & persistence
│   ├── validator.ts                # Configuration validation logic
│   └── utils/
│       ├── file-utils.ts           # File I/O helpers
│       ├── logger.ts               # CLI output formatting
│       └── error-handler.ts        # Error formatting & suggestions
├── assets/
│   └── templates/
│       └── config-template.json    # E2ERunConfig template for users
├── tests/                          # Unit & integration tests
│   ├── config-loader.test.ts
│   ├── credentials-loader.test.ts
│   ├── validator.test.ts
│   └── fixtures/
│       ├── valid-config.json
│       ├── invalid-config.json
│       └── test-credentials.json
├── package.json                    # Dependencies (@playwright/test, zod, etc.)
└── tsconfig.json                   # TypeScript configuration

# User-facing configuration (created by users)
configs/                            # User's environment configurations
├── saas-staging.json
├── onprem-uat.json
└── production.json

credentials/                        # User's credentials (gitignored)
├── saas-staging.json
└── onprem-uat.json

reports/                            # Generated test reports (gitignored)
└── run-YYYY-MM-DD-HH-MM/
    ├── index.html
    ├── results.json
    ├── screenshots/
    └── videos/
```

**Structure Decision**: CLI-based skill implemented as TypeScript modules with clear separation of concerns (config loading, validation, execution, reporting). No UI components required. Configuration and credentials managed through JSON files in user's project root. Test reports generated to configurable output directory. Follows Claude Code Skills standards (Principle 8) with complete documentation set.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All Constitution checks pass or are marked N/A with valid justification (CLI tool without UI/database).

| Principle | Status | Justification (if N/A) |
|-----------|--------|------------------------|
| 功能分支绑定 | ✅ PASS | Branch `T003-e2e-runner` matches specId |
| 代码归属标识 | ✅ PASS | Will use `@spec T003-e2e-runner` in all implementation files |
| 测试驱动开发 | ✅ PASS | Unit tests for config/credentials loading, target 80% coverage |
| 组件化架构 | N/A | CLI tool, no UI components required |
| 前端技术栈分层 | N/A | Not a B端/C端 application |
| 数据驱动状态管理 | N/A | Stateless CLI tool, no persistent state |
| 代码质量工程化 | ✅ PASS | TypeScript strict mode, ESLint, Prettier |
| 后端技术栈约束 | N/A | No Spring Boot/Supabase integration, only Playwright API |
| Claude Code Skills 标准 | ✅ PASS | All R10.x requirements met (YAML frontmatter, 4 docs) |

---

## Phase 0 & 1 Summary

### Phase 0: Research Complete ✅

All technical unknowns resolved in [research.md](./research.md):

1. **Playwright Programmatic API**: Hybrid approach (generate temp config + npx invocation)
2. **Configuration Validation**: Zod for TypeScript integration, JSON Schema for docs
3. **Credentials Injection**: Environment variables with structured naming (`E2E_USER_<ROLE>_USERNAME`)
4. **Report Directory Uniqueness**: Pre-flight check with --force flag option
5. **Cross-Platform Compatibility**: Node.js `path` module, platform-aware spawn
6. **CI/CD Integration**: Provide templates and examples (GitHub Actions, GitLab CI)

**Key Decisions**:
- TypeScript 5.x + Node.js 18+ for implementation
- Zod for validation (better DX than JSON Schema alone)
- JSON-only config format (no YAML support)
- Playwright-only test framework (no multi-framework support)
- File-based configuration (no TUI)

### Phase 1: Design & Contracts Complete ✅

**Generated Artifacts**:

1. **data-model.md** (671 lines) - ✅ Already completed during spec creation
   - Complete TypeScript interfaces and JSON Schemas
   - Validation rules with error codes (RUNNER_VAL_001 to RUNNER_REPORT_001)
   - Security requirements for credentials

2. **contracts/** - ✅ JSON Schema files generated:
   - `E2ERunConfig.schema.json` - Test execution configuration schema
   - `CredentialsFile.schema.json` - Credentials file schema with security warnings
   - `TestReport.schema.json` - Test report output schema

3. **quickstart.md** (736 lines) - ✅ Already completed during spec creation
   - Prerequisites, installation, basic usage (3 steps)
   - 4 common workflows (multi-env, credentials, multi-browser, parallel)
   - 6 complete examples with code snippets
   - 8 troubleshooting scenarios

4. **skill.md** (565 lines) - ✅ Already completed during spec creation
   - YAML frontmatter with name, description, version
   - Complete usage guide with command parameters
   - 6 detailed examples (basic, multi-env, multi-browser, parallel, selective, CI/CD)
   - Workflow integration diagram

5. **Agent Context** - ✅ Updated CLAUDE.md with:
   - TypeScript, Node.js, Playwright, Zod technologies
   - CLI tool project type
   - Cross-platform compatibility notes

### Re-evaluated Constitution Check ✅

**Post-Phase 1 Validation**:

All checks remain ✅ PASS or N/A with valid justification:

- [x] **功能分支绑定**: Branch `T003-e2e-runner` matches specId ✅
- [x] **代码归属标识**: `@spec T003-e2e-runner` will be added to all implementation files ✅
- [x] **测试驱动开发**: Unit tests planned for config-loader, credentials-loader, validator ✅
- [N/A] **组件化架构**: CLI tool, no UI components
- [N/A] **前端技术栈分层**: Not a B端/C端 application
- [N/A] **数据驱动状态管理**: Stateless CLI tool
- [x] **代码质量工程化**: TypeScript strict mode, ESLint, Prettier configured ✅
- [N/A] **后端技术栈约束**: No Spring Boot/Supabase integration
- [x] **Claude Code Skills 标准 (Principle 8)**:
  - [x] T### prefix (T003-e2e-runner) ✅
  - [x] skill.md with YAML frontmatter ✅
  - [x] spec.md, data-model.md, quickstart.md all complete ✅
  - [x] Contracts (JSON Schemas) generated ✅

**No new violations introduced** during Phase 0 and Phase 1.

---

## Next Steps (Phase 2)

The planning phase is now complete. Next command: `/speckit.tasks`

The tasks command will:
1. Break down implementation into actionable tasks
2. Order tasks by dependency
3. Identify critical path
4. Generate tasks.md file

**Note**: Phase 2 (tasks generation) is NOT part of the `/speckit.plan` command. Stop here and report completion.
