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

**Next**: Phase 3 (User Story 1) - Execute E2E Tests with Environment Configuration

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
