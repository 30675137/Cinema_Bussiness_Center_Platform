# E2E Report Configurator

> **@spec T006-e2e-report-configurator**

A Claude Code skill for configuring Playwright test report outputs with standardized directory structures, multiple reporter formats (HTML/JSON/JUnit), and CI/CD integration support.

## Features

- ✅ Configure Playwright reporters (HTML mandatory, JSON/JUnit optional)
- ✅ Create standardized output directory structure (`reports/e2e/{html,json,junit,artifacts}/`)
- ✅ Manage artifact retention policies (screenshots, videos, traces)
- ✅ Update `.gitignore` to exclude report outputs
- ✅ Validate generated configuration correctness
- ✅ Generate CI/CD integration documentation (GitHub Actions, GitLab CI, Jenkins)

## Quick Start

```bash
# 1. Setup HTML reporter (minimal)
/e2e-report-configurator setup

# 2. Run your tests
npx playwright test

# 3. View report
npx playwright show-report reports/e2e/html
```

That's it! For more options, see [Quickstart Guide](./docs/quickstart.md).

## Commands

### `setup` - Configure Reporters

```bash
# HTML only (default)
/e2e-report-configurator setup

# HTML + JSON + JUnit
/e2e-report-configurator setup --format html,json,junit

# Custom output directory
/e2e-report-configurator setup --output test-reports

# Always capture artifacts (debug mode)
/e2e-report-configurator setup --artifacts always
```

**Options**:
- `--format <formats>` - Reporter formats: `html`, `html,json`, `html,json,junit` (default: `html`)
- `--output <path>` - Output directory (default: `reports/e2e`)
- `--artifacts <policy>` - Artifact policy: `on-failure`, `always`, `never` (default: `on-failure`)

### `validate` - Verify Configuration

```bash
/e2e-report-configurator validate
```

**Checks**:
1. ✅ `playwright.config.ts` file exists and has required fields
2. ✅ TypeScript compiles without errors (`npx tsc --noEmit`)
3. ✅ Playwright can load config (`npx playwright test --list`)
4. ✅ Reporter output paths are unique
5. ✅ Output directories exist and are writable

### `docs` - Generate CI/CD Documentation

```bash
/e2e-report-configurator docs
```

Generates `docs/e2e-reports.md` with platform-specific examples for:
- GitHub Actions
- GitLab CI
- Jenkins

## Directory Structure

After running `setup --format html,json,junit`:

```
<project-root>/
├── playwright.config.ts         # Updated with reporter configuration
├── reports/                     # Report output directory (gitignored)
│   └── e2e/
│       ├── html/               # HTML reports
│       ├── json/               # JSON reports
│       ├── junit/              # JUnit XML reports
│       └── artifacts/          # Test artifacts
│           ├── screenshots/
│           ├── videos/
│           └── traces/
├── .gitignore                  # Updated with reports/ entry
└── docs/
    └── e2e-reports.md          # Generated CI/CD documentation
```

## Artifact Retention Policies

| Policy | Screenshot | Video | Trace | Use Case |
|--------|-----------|-------|-------|----------|
| **on-failure** (default) | only-on-failure | retain-on-failure | on-first-retry | Development, CI/CD |
| **always** | on | on | on | Debug sessions |
| **never** | off | off | off | Production smoke tests |

## Reporter Formats

| Format | Type | Output | Use Case |
|--------|------|--------|----------|
| **HTML** | Mandatory | `reports/e2e/html/` | Human-readable reports, local debugging |
| **JSON** | Optional | `reports/e2e/json/results.json` | Data analysis, custom dashboards |
| **JUnit** | Optional | `reports/e2e/junit/results.xml` | CI/CD integration, test visualization |

## Prerequisites

1. **Playwright installed**:
   ```bash
   npm install -D @playwright/test
   ```

2. **Playwright config exists**:
   ```bash
   npm init playwright@latest
   ```

3. **TypeScript installed** (for validation):
   ```bash
   npm install -D typescript
   ```

## Documentation

- 📖 [Quickstart Guide](./docs/quickstart.md) - Get started in 5 minutes
- 📚 [Complete Workflow Guide](./docs/workflow-guide.md) - Detailed workflows and best practices
- 🔧 [Troubleshooting Guide](./docs/troubleshooting.md) - Common issues and solutions
- 📋 [Full Skill Documentation](./skill.md) - Complete command reference

## Examples

### Multi-Format Setup

```bash
/e2e-report-configurator setup --format html,json,junit --output test-reports
```

**Result**:
```
✅ E2E Report Configurator setup completed successfully

📋 Reporters configured: html, json, junit
📁 Output directory: test-reports
📸 Artifact policy: on-failure

✨ Created 7 directories
💾 Config backup: playwright.config.ts.backup-2025-12-30T10-00-00-000Z
📝 Updated .gitignore
```

### CI/CD Integration

```bash
# 1. Configure reporters for CI
/e2e-report-configurator setup --format html,junit --artifacts on-failure

# 2. Generate CI/CD docs
/e2e-report-configurator docs

# 3. Copy workflow to repository
cp docs/e2e-reports.md .github/workflows/e2e-tests.yml
```

### Debug Flaky Tests

```bash
# Enable full artifact capture
/e2e-report-configurator setup --artifacts always

# Run tests
npx playwright test

# Review artifacts
open reports/e2e/artifacts/videos/
open reports/e2e/artifacts/traces/

# Revert to default
/e2e-report-configurator setup --artifacts on-failure
```

## Architecture

### Core Modules

1. **Config Generator** (`scripts/config-generator.ts`) - Generates Playwright reporter configurations
2. **Config Updater** (`scripts/config-updater.ts`) - Updates `playwright.config.ts` with backup/rollback
3. **Directory Manager** (`scripts/directory-manager.ts`) - Creates and manages output directories
4. **Gitignore Updater** (`scripts/gitignore-updater.ts`) - Appends `reports/` to `.gitignore`
5. **Validator** (`scripts/validator.ts`) - Two-layer validation (TypeScript + Playwright runtime)
6. **Docs Generator** (`scripts/docs-generator.ts`) - Generates CI/CD integration documentation
7. **CLI** (`scripts/cli.ts`) - Command-line interface
8. **Logger** (`scripts/logger.ts`) - Structured logging utility
9. **Errors** (`scripts/errors.ts`) - Error message catalog

### Data Flow

```
User Command
    ↓
Command Parser (CLI)
    ↓
Options Validator
    ↓
Directory Manager → Create directories + .gitkeep files
    ↓
Config Generator → Reporter configurations + Artifact policies
    ↓
Config Updater → Update playwright.config.ts (with backup)
    ↓
Gitignore Updater → Update .gitignore
    ↓
Validator → Verify correctness
    ↓
Success Response
```

## Testing

The skill includes comprehensive test coverage:

- **Unit Tests**: 23 tests for validator module
- **Integration Tests**: 15+ tests for each command (setup, validate, docs)
- **Coverage**: 80% threshold for all modules

```bash
# Run all tests
npm test

# Run specific test file
npm test validator.test.ts

# Run with coverage
npm run test:coverage
```

## Implementation Status

- ✅ Phase 0: Research & Architecture
- ✅ Phase 1: Design & Contracts
- ✅ Phase 2: Task Generation
- ✅ Phase 3: HTML Reporter (MVP)
- ✅ Phase 4: Multi-format Reporters
- ✅ Phase 5: Directory Structure Management
- ✅ Phase 6: Artifact Retention Policies
- ✅ Phase 7: Configuration Validation
- ✅ Phase 8: CI/CD Documentation
- ✅ Phase 9: Polish & Documentation

**Progress**: 100% (75/75 tasks completed)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Config file not found | Run `npm init playwright@latest` |
| TypeScript compilation errors | Run `npx tsc --noEmit` for details |
| Playwright runtime error | Run `npx playwright test --list` for details |
| Duplicate output path | Use unique paths for each reporter |
| Directory not writable | Run `chmod 755 <directory>` |

For detailed troubleshooting, see [Troubleshooting Guide](./docs/troubleshooting.md).

## Contributing

This skill follows the Cinema Business Center Platform development standards:

- **Test-Driven Development**: All features have 100% test coverage
- **TypeScript strict mode**: No `any` types
- **@spec annotation**: All files tagged with `@spec T006-e2e-report-configurator`
- **Idempotent operations**: Safe to run multiple times

## License

MIT License - Part of Cinema Business Center Platform

## Related Documentation

- 📖 [Specification](../../specs/T006-e2e-report-configurator/spec.md)
- 🔧 [TypeScript Contracts](../../specs/T006-e2e-report-configurator/contracts/reporter-config.ts)
- 📋 [Implementation Tasks](../../specs/T006-e2e-report-configurator/tasks.md)
- 🔬 [Research Decisions](../../specs/T006-e2e-report-configurator/research.md)

---

**Version**: 1.0.0 | **Last Updated**: 2025-12-30
