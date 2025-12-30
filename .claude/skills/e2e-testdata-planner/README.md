/**
 * @spec T004-e2e-testdata-planner
 */

# E2E Test Data Planner - Development

This directory contains the implementation of the e2e-testdata-planner Claude Code Skill.

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
.claude/skills/e2e-testdata-planner/
├── scripts/              # Implementation (TypeScript)
│   ├── cli.ts           # CLI entry point
│   ├── blueprint-loader.ts # Blueprint loader & validator
│   ├── strategy-selector.ts # Strategy selector
│   ├── lifecycle-generator.ts # Lifecycle plan generator
│   ├── dependency-resolver.ts # Dependency graph analyzer
│   ├── fixture-codegen.ts # Fixture code generator
│   ├── validator.ts     # Blueprint validator
│   ├── schemas.ts       # Zod schemas
│   ├── providers/       # Data providers (seed/api/db-script)
│   │   ├── seed-provider.ts
│   │   ├── api-provider.ts
│   │   └── db-script-provider.ts
│   └── utils/           # Utility modules
│       ├── file-utils.ts
│       ├── logger.ts
│       └── error-handler.ts
├── assets/templates/    # Templates
│   ├── blueprint-template.yaml
│   ├── seed-template.json
│   ├── db-script-template.sql
│   └── fixture-template.ts
├── tests/               # Unit & integration tests
│   ├── unit/
│   ├── integration/
│   └── fixtures/        # Test data
│       ├── blueprints/
│       ├── seeds/
│       └── expected-output/
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── skill.md             # Skill documentation (with YAML frontmatter)
```

## Development Workflow

1. **Follow TDD**: Write tests first (Red), implement (Green), refactor
2. **Attribution**: Add `@spec T004-e2e-testdata-planner` to all new files
3. **Type Safety**: TypeScript strict mode enabled
4. **Coverage Target**: 80% overall (lines/functions/branches/statements)

## Implementation Status

See `specs/T004-e2e-testdata-planner/tasks.md` for detailed task breakdown.

**Phase 1: Setup** ✅ Complete (Commit: 4eac6e2)
- [x] T001: Skill directory structure
- [x] T002: TypeScript project configuration (package.json, tsconfig.json, ESLint, Prettier)
- [x] T003: Vitest configuration
- [x] T004: Skill documentation (skill.md with YAML frontmatter)
- [x] T005: Project testdata directories (testdata/blueprints, seeds, scripts, logs)

**Phase 2: Foundational** ✅ Complete (Commit: ace59a7)
- [x] T006-T009: Zod schemas (TestdataBlueprint, DataSupplyStrategy, LifecyclePlan, DataProvenance) - 20 tests
- [x] T010: File utilities (loadYaml, loadJson, saveYaml, saveJson, validateFilePath, fileExists) - 19 tests
- [x] T011: Logger (debug, info, warn, error, success, section, step)
- [x] T012: Error handler (6 custom error classes) - 10 tests

**Phase 3: User Story 1 - Define Testdata Blueprints (P1 MVP)** ⏳ In Progress
- [ ] T013-T021: Blueprint loader, validator, and acceptance scenarios

**Phase 4-9**: See tasks.md for full breakdown

**Test Results**: ✅ 49 tests passed (49 passed, 0 failed)
- schemas.test.ts: 20 passed
- file-utils.test.ts: 19 passed
- error-handler.test.ts: 10 passed

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

- **Spec**: `specs/T004-e2e-testdata-planner/spec.md`
- **Plan**: `specs/T004-e2e-testdata-planner/plan.md`
- **Data Model**: `specs/T004-e2e-testdata-planner/data-model.md`
- **Quick Start**: `specs/T004-e2e-testdata-planner/quickstart.md`
- **Tasks**: `specs/T004-e2e-testdata-planner/tasks.md`
- **Skill Docs**: `.claude/skills/e2e-testdata-planner/skill.md`
