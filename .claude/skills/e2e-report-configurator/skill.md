---
name: e2e-report-configurator
description: Configure Playwright test report outputs for E2E tests. Standardizes report directory structures, manages multiple report formats (HTML, JSON, JUnit), and configures artifact retention policies.
version: 1.0.0
author: Claude Code
tags:
  - testing
  - e2e
  - playwright
  - reports
  - ci-cd
trigger_keywords:
  - e2e report
  - playwright report
  - test report
  - configure reports
  - html reporter
  - json reporter
  - junit reporter
---

# E2E Report Configurator

**@spec T006-e2e-report-configurator**

## Overview

The E2E Report Configurator is a Claude Code skill that configures Playwright test report outputs for E2E tests. It standardizes report directory structures, manages multiple report formats (HTML, JSON, JUnit), and configures artifact retention policies.

## Features

- ✅ Configure Playwright reporters (HTML mandatory, JSON/JUnit optional)
- ✅ Create standardized output directory structure (`reports/e2e/{html,json,junit,artifacts}/`)
- ✅ Manage artifact retention policies (screenshots, videos, traces)
- ✅ Update `.gitignore` to exclude report outputs
- ✅ Validate generated configuration correctness
- ✅ Generate CI/CD integration documentation

## Commands

### `setup` Command

Configure Playwright reporters and create directory structure.

**Syntax**:
```bash
/e2e-report-configurator setup [options]
```

**Options**:
- `--format` (string, default: `html`): Reporter formats (html, html,json, html,json,junit)
- `--output` (string, default: `reports/e2e`): Base output directory
- `--artifacts` (string, default: `on-failure`): Artifact capture policy (on-failure, always, never)

**Examples**:
```bash
# Minimal setup (HTML only)
/e2e-report-configurator setup

# HTML + JSON reporters
/e2e-report-configurator setup --format html,json

# All formats (HTML + JSON + JUnit)
/e2e-report-configurator setup --format html,json,junit

# Multi-format with custom output
/e2e-report-configurator setup --format html,json,junit --output test-reports

# Always capture artifacts
/e2e-report-configurator setup --artifacts always

# Never capture artifacts
/e2e-report-configurator setup --artifacts never

# CI/CD optimized (HTML + JUnit, no videos)
/e2e-report-configurator setup --format html,junit --artifacts on-failure
```

### `validate` Command

Validate Playwright configuration correctness.

**Syntax**:
```bash
/e2e-report-configurator validate
```

**What this checks**:
1. ✅ `playwright.config.ts` file exists
2. ✅ TypeScript compiles without errors (`npx tsc --noEmit`)
3. ✅ Playwright can load config (`npx playwright test --list`)
4. ✅ Reporter output paths are unique
5. ✅ Output directories exist and are writable

### `docs` Command

Generate CI/CD integration documentation.

**Syntax**:
```bash
/e2e-report-configurator docs
```

**Output**: `docs/e2e-reports.md` with GitHub Actions, GitLab CI, and Jenkins examples.

## Prerequisites

Before using this skill, ensure:

1. **Playwright installed** in your project:
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

4. **Git repository initialized** (for `.gitignore` updates):
   ```bash
   git init
   ```

## Multi-Format Reporter Support

The skill supports three reporter formats that can be used in combination:

### Supported Formats

| Format | Type | Output | Use Case |
|--------|------|--------|----------|
| **HTML** | Mandatory | `reports/e2e/html/` | Human-readable reports, local debugging |
| **JSON** | Optional | `reports/e2e/json/results.json` | Data analysis, custom dashboards, metrics |
| **JUnit** | Optional | `reports/e2e/junit/results.xml` | CI/CD integration, test result visualization |

### Format Combinations

```bash
# Single format (HTML only - minimum requirement)
--format html

# Two formats (HTML + JSON)
--format html,json

# Two formats (HTML + JUnit for CI/CD)
--format html,junit

# All formats (HTML + JSON + JUnit)
--format html,json,junit
```

### Format-Specific Features

**HTML Reporter**:
- Interactive test results viewer
- Screenshots and videos embedded
- Trace viewer integration
- Filter by test status
- `open` option: 'always' | 'never' | 'on-failure'

**JSON Reporter**:
- Machine-readable test results
- Programmatic analysis
- Custom dashboard integration
- Historical trending

**JUnit Reporter**:
- Standard XML format
- Native CI/CD platform integration
- GitHub Actions test reporter
- GitLab CI test reports
- Jenkins JUnit plugin

## Directory Structure

After running `setup --format html,json,junit`, you'll have:

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
    └── e2e-reports.md          # Generated documentation
```

## Architecture

### Core Components

1. **Config Generator** (`scripts/config-generator.ts`): Generates Playwright reporter configurations
2. **Config Updater** (`scripts/config-updater.ts`): Updates `playwright.config.ts` using regex-based replacement
3. **Directory Manager** (`scripts/directory-manager.ts`): Creates and manages output directories
4. **Gitignore Updater** (`scripts/gitignore-updater.ts`): Appends `reports/` to `.gitignore`
5. **Validator** (`scripts/validator.ts`): Two-layer validation (TypeScript + Playwright runtime)
6. **Docs Generator** (`scripts/docs-generator.ts`): Generates CI/CD integration documentation

### Data Flow

```
User Command
    ↓
Command Parser (skill.md)
    ↓
Config Generator → Reporter Config
    ↓
Directory Manager → Create directories
    ↓
Config Updater → Update playwright.config.ts
    ↓
Gitignore Updater → Update .gitignore
    ↓
Validator → Verify correctness
    ↓
Success Response
```

## Implementation Status

- ✅ Phase 0: Research & Architecture
- ✅ Phase 1: Design & Contracts
- ✅ Phase 2: Task Generation
- 🚧 Phase 3: Implementation (in progress)

## Testing Strategy

All components follow TDD approach:

1. **Unit Tests** (Vitest): 100% coverage for core logic
2. **Integration Tests**: Config generation + update workflows
3. **E2E Tests** (optional): Full skill execution scenarios

## Related Documentation

- 📖 [Specification](../../../specs/T006-e2e-report-configurator/spec.md)
- 🔧 [TypeScript Contracts](../../../specs/T006-e2e-report-configurator/contracts/reporter-config.ts)
- 📋 [Implementation Tasks](../../../specs/T006-e2e-report-configurator/tasks.md)
- 📚 [Quick Start Guide](../../../specs/T006-e2e-report-configurator/quickstart.md)
- 🔬 [Research Decisions](../../../specs/T006-e2e-report-configurator/research.md)

## License

MIT License - Part of Cinema Business Center Platform

---

**Version**: 1.0.0 | **Last Updated**: 2025-12-30
