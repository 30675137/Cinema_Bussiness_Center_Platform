/**
 * @spec T003-e2e-runner
 */

# E2E Test Runner - Development

This directory contains the implementation of the e2e-runner Claude Code Skill.

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
.claude/skills/e2e-runner/
├── scripts/              # Implementation (TypeScript)
│   ├── cli.ts           # CLI entry point
│   ├── config-loader.ts # E2ERunConfig loader & validator
│   ├── credentials-loader.ts # Credentials loader & injector
│   ├── runner.ts        # Playwright test execution
│   ├── reporter.ts      # Test report generator
│   ├── validator.ts     # Configuration validation
│   ├── schemas.ts       # Zod schemas
│   └── utils/           # Utility modules
│       ├── file-utils.ts
│       ├── logger.ts
│       └── error-handler.ts
├── assets/templates/    # Config templates
├── tests/               # Unit & integration tests
│   ├── fixtures/        # Test data
│   └── integration/     # Integration tests
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── skill.md             # Skill documentation (with YAML frontmatter)
```

## Development Workflow

1. **Follow TDD**: Write tests first (Red), implement (Green), refactor
2. **Attribution**: Add `@spec T003-e2e-runner` to all new files
3. **Type Safety**: TypeScript strict mode enabled
4. **Coverage Target**: 80% overall, 90% for critical modules

## Implementation Status

See `specs/T003-e2e-runner/tasks.md` for detailed task breakdown.

**Phase 1: Setup** ✅ Complete
- [x] T001: Directory structure
- [x] T002: package.json
- [x] T003: tsconfig.json
- [x] T004: .gitignore
- [x] T005: @spec attribution

**Phase 2: Foundational** ✅ Complete
- [x] T006-T008: Zod schemas (E2ERunConfig, CredentialsFile, TestReport)
- [x] T009: file-utils.ts (readJsonFile, writeJsonFile, fileExists, ensureDirExists, deleteFile)
- [x] T010: logger.ts (info, success, error, warn, debug, section, step)
- [x] T011: error-handler.ts (custom error classes)
- [x] T012: Unit tests for file-utils (18 tests, 100% pass rate)

**Phase 3: User Story 1 - Execute E2E Tests** ✅ Complete
- [x] T013-T014: config-loader.ts with Zod validation (16 tests)
- [x] T015-T018: runner.ts with Playwright execution (9 tests)
  - generatePlaywrightConfig() - converts E2ERunConfig to Playwright config
  - writePlaywrightConfigFile() - writes temporary config file
  - executePlaywrightTests() - spawns npx playwright test
- [x] T019: cli.ts with command-line interface
  - parseArguments() - handles --config flag
  - runCommand() - orchestrates full execution workflow
  - displayHelp() - shows usage information
- [x] T020: Integration test (3 tests, full end-to-end workflow)

**Test Results**: 46 tests passed (18 file-utils + 16 config-loader + 9 runner + 3 integration)

**Phase 4: User Story 2 - Generate and Persist Test Reports** ✅ Complete
- [x] T021: validateReportDirectory() with --force flag support
- [x] T022: Reporter configuration (JSON + HTML) - completed in Phase 3
- [x] T023-T024: reporter.ts implementation
  - parsePlaywrightJsonReport() - Parse Playwright JSON output
  - generateTestReport() - Create structured TestReport object
  - extractStats() - Count passed/failed/skipped/flaky tests
  - extractFailures() - Extract failure details with screenshots/videos
- [x] T025: Updated cli.ts with 5-step workflow:
  1. Load config
  2. Validate report directory (with --force option)
  3. Generate Playwright config
  4. Execute tests
  5. Generate and save test report
- [x] T026: Integration test (8 tests)
  - validateReportDirectory behavior (force/no-force)
  - parsePlaywrightJsonReport parsing
  - generateTestReport structure and stats
  - Failure extraction with attachments

**Test Results**: 54 tests passed (18 file-utils + 16 config-loader + 9 runner + 3 basic-execution + 8 report-generation)

**Phase 5: User Story 3 - Manage Environment Credentials Securely** ✅ Complete
- [x] T027-T030: credentials-loader.ts implementation (137 lines)
  - loadCredentials() - Load and validate with Zod schema
  - validateEnvProfileMatch() - Ensure config/credentials profiles match
  - injectCredentials() - Set environment variables (E2E_USER_*, E2E_API_*)
  - checkFilePermissions() - Warn for insecure file permissions (Unix)
- [x] T031: Updated cli.ts with 6-step workflow:
  1. Load config
  2. **Load and inject credentials** (new step, conditional on credentials_ref)
  3. Validate report directory
  4. Generate Playwright config
  5. Execute tests
  6. Generate test report
- [x] T032: Created credentials.example.json template
- [x] T033: Integration test (7 tests)
  - Full workflow (load → validate → inject)
  - Environment variable injection
  - Role/service name normalization (hyphens to underscores)
  - File permissions checking

**Test Results**: 78 tests passed (18 file-utils + 16 config-loader + 9 runner + 17 credentials-loader + 3 basic-execution + 8 report-generation + 7 credentials-injection)

**Phase 7: User Story 5 - Integration with test-scenario-author/e2e-test-generator** ✅ Complete
- [x] T037-T039: Workflow integration (7 tests)
  - E2ERunConfig schema already has default testMatch: 'scenarios/**/*.spec.ts'
  - CLI already uses config.testMatch when executing tests
  - Created comprehensive integration tests for workflow scenarios
  - Tests verify auto-discovery of generated tests
  - Tests verify testdata loading compatibility
  - Tests verify nested scenario directories
  - Tests verify env_profile preservation for credentials

**Test Results**: 85 tests passed (18 file-utils + 16 config-loader + 9 runner + 17 credentials-loader + 3 basic-execution + 8 report-generation + 7 credentials-injection + 7 workflow-integration)

**Phase 8: User Story 6 - Validate Run Configuration** ✅ Complete
- [x] T040-T043: Configuration validation (19 tests)
  - validateConfig() - Comprehensive checks (baseURL, env_profile, retries, workers, timeout)
  - checkBaseUrlReachability() - Async HTTP reachability check with 5s timeout
  - CLI validate subcommand - Load, validate, and display config summary
  - Optional --check-reachability flag for baseURL health checks
  - 19 unit tests covering all validation scenarios

**Test Results**: 104 tests passed (18 file-utils + 16 config-loader + 9 runner + 17 credentials-loader + 19 validator + 3 basic-execution + 8 report-generation + 7 credentials-injection + 7 workflow-integration)

**Phase 9: Polish & Cross-Cutting Concerns** ✅ Complete
- [x] T044-T048: Final polish and production readiness
  - Comprehensive error handling already implemented (custom error classes)
  - Cross-platform compatibility verified (path module, shell:true for npx)
  - Created config-template.json with all fields documented
  - Updated skill.md with validate command examples and troubleshooting
  - Full test suite verification: 104 tests, 100% pass rate

**Test Results**: 104 tests passed (100% pass rate, 0 TypeScript errors)

**Production Status**: ✅ **READY FOR PRODUCTION USE**

**Implemented Phases**:
- ✅ Phase 1-2: Setup & Foundational modules
- ✅ Phase 3 (P1): Execute E2E Tests (US1)
- ✅ Phase 4 (P1): Generate Test Reports (US2)
- ✅ Phase 5 (P1): Manage Credentials Securely (US3)
- ✅ Phase 6 (P2): Multi-Browser/Device Testing (US4) - Implemented in Phase 2 via projects array
- ✅ Phase 7 (P2): Workflow Integration (US5)
- ✅ Phase 8 (P3): Validate Configuration (US6)
- ✅ Phase 9: Polish & Cross-Cutting Concerns

**Note**: Phase 6 (Multi-Browser) was already implemented through the `projects` array schema (T006) and runner logic. Users can configure multiple browsers (Chromium, Firefox, WebKit) and device viewports through the Playwright projects configuration.

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (for development)
npm run test:watch
```

## Documentation

- **Spec**: `specs/T003-e2e-runner/spec.md`
- **Data Model**: `specs/T003-e2e-runner/data-model.md`
- **Quick Start**: `specs/T003-e2e-runner/quickstart.md`
- **Tasks**: `specs/T003-e2e-runner/tasks.md`
- **Skill Docs**: `.claude/skills/e2e-runner/skill.md`
