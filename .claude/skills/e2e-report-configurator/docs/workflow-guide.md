# E2E Report Configurator - Complete Workflow Guide

This guide walks through the complete workflow of setting up, configuring, and validating Playwright test reports using the E2E Report Configurator skill.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Configuration Options](#configuration-options)
4. [Validation](#validation)
5. [CI/CD Integration](#cicd-integration)
6. [Common Workflows](#common-workflows)
7. [Best Practices](#best-practices)

---

## Prerequisites

Before using the E2E Report Configurator, ensure you have:

### 1. Playwright Installed

```bash
npm install -D @playwright/test
```

### 2. Playwright Configuration File

```bash
npm init playwright@latest
```

This creates a `playwright.config.ts` file in your project root.

### 3. TypeScript Installed

```bash
npm install -D typescript
```

### 4. Git Repository Initialized

```bash
git init
```

---

## Initial Setup

### Step 1: Basic HTML Reporter Setup

The simplest setup configures an HTML reporter with default settings:

```bash
/e2e-report-configurator setup
```

**What this does**:
- ✅ Creates `reports/e2e/html/` directory
- ✅ Creates `reports/e2e/artifacts/` subdirectories (screenshots, videos, traces)
- ✅ Updates `playwright.config.ts` with HTML reporter
- ✅ Configures `on-failure` artifact policy
- ✅ Updates `.gitignore` to exclude reports

**Result**:
```
✅ E2E Report Configurator setup completed successfully

📋 Reporters configured: html
📁 Output directory: reports/e2e
📸 Artifact policy: on-failure

✨ Created 5 directories
💾 Config backup: playwright.config.ts.backup-2025-12-30T10-00-00-000Z
📝 Updated .gitignore

Next steps:
  1. Run: npx playwright test
  2. View reports: npx playwright show-report reports/e2e/html
```

### Step 2: Verify Setup

```bash
/e2e-report-configurator validate
```

**What this checks**:
- ✅ Config file exists and has required fields
- ✅ TypeScript compiles without errors
- ✅ Playwright can load the config
- ✅ Reporter paths are unique
- ✅ Output directories are writable

---

## Configuration Options

### Multi-Format Reporters

Configure multiple reporter formats for different use cases:

```bash
# HTML + JSON (for data analysis)
/e2e-report-configurator setup --format html,json

# HTML + JUnit (for CI/CD)
/e2e-report-configurator setup --format html,junit

# All formats
/e2e-report-configurator setup --format html,json,junit
```

**Output structure**:
```
reports/e2e/
├── html/               # Interactive HTML report
│   └── index.html
├── json/               # Machine-readable results
│   └── results.json
├── junit/              # CI/CD integration
│   └── results.xml
└── artifacts/
    ├── screenshots/
    ├── videos/
    └── traces/
```

### Custom Output Directory

Specify a custom output directory:

```bash
/e2e-report-configurator setup --output test-results
```

**Use cases**:
- Match existing project structure
- Separate reports by environment
- Custom CI/CD requirements

### Artifact Retention Policies

Control when to capture test artifacts:

#### 1. `on-failure` (Default - Development)

```bash
/e2e-report-configurator setup --artifacts on-failure
```

**Captures**:
- Screenshots: Only on test failure
- Videos: Record all, delete on success
- Traces: On first retry only

**Best for**: Local development, CI/CD pipelines

#### 2. `always` (Debug Mode)

```bash
/e2e-report-configurator setup --artifacts always
```

**Captures**:
- Screenshots: Every test
- Videos: Every test
- Traces: Every test

**Best for**: Debug sessions, troubleshooting flaky tests

#### 3. `never` (Production Smoke Tests)

```bash
/e2e-report-configurator setup --artifacts never
```

**Captures**:
- Screenshots: Disabled
- Videos: Disabled
- Traces: Disabled

**Best for**: Minimal overhead, production environments

---

## Validation

### Running Validation

```bash
/e2e-report-configurator validate
```

### Understanding Validation Results

#### ✅ Success Example

```
✅ Playwright configuration validation passed

All checks completed successfully:
  ✓ Config structure
  ✓ TypeScript compilation
  ✓ Playwright runtime
  ✓ Reporter paths uniqueness
  ✓ Directory permissions
```

#### ❌ Failure Example

```
❌ Playwright configuration validation failed

Found 2 error(s):
  1. Config missing required "use.screenshot" field
  2. Directory does not exist: reports/e2e/html

💡 Solutions:
  - Add screenshot field to playwright.config.ts
  - Run setup command to create directories
```

### Validation Checks Explained

| Check | Purpose | Common Issues |
|-------|---------|---------------|
| Config structure | Verify required fields exist | Missing reporter, screenshot, video, trace |
| TypeScript compilation | Ensure valid TypeScript syntax | Syntax errors, type mismatches |
| Playwright runtime | Verify Playwright can load config | Invalid reporter config, missing dependencies |
| Reporter paths uniqueness | Prevent path conflicts | Duplicate output directories |
| Directory permissions | Ensure writable directories | Permission errors, missing directories |

---

## CI/CD Integration

### Step 1: Generate Documentation

```bash
/e2e-report-configurator docs
```

This creates `docs/e2e-reports.md` with platform-specific examples for:
- GitHub Actions
- GitLab CI
- Jenkins

### Step 2: Choose Your Platform

#### GitHub Actions Example

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npx playwright test
      - name: Upload test reports
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: reports/e2e/
          retention-days: 30
```

### Step 3: Verify CI/CD Setup

1. Push code to repository
2. Trigger workflow (push, PR, or manual)
3. Check workflow logs for test execution
4. Download artifacts from workflow run
5. View HTML report locally or deploy to Pages

---

## Common Workflows

### Workflow 1: Local Development Setup

```bash
# 1. Initial setup with HTML reporter
/e2e-report-configurator setup

# 2. Validate configuration
/e2e-report-configurator validate

# 3. Run tests
npx playwright test

# 4. View report
npx playwright show-report reports/e2e/html
```

### Workflow 2: CI/CD Preparation

```bash
# 1. Configure HTML + JUnit for CI integration
/e2e-report-configurator setup --format html,junit --artifacts on-failure

# 2. Generate CI/CD documentation
/e2e-report-configurator docs

# 3. Copy relevant configuration to repository
#    (e.g., .github/workflows/e2e-tests.yml)

# 4. Validate setup
/e2e-report-configurator validate
```

### Workflow 3: Debug Flaky Tests

```bash
# 1. Enable full artifact capture
/e2e-report-configurator setup --artifacts always

# 2. Run tests
npx playwright test

# 3. Review artifacts in reports/e2e/artifacts/
#    - Screenshots: Visual state at failure
#    - Videos: Full test execution recording
#    - Traces: Detailed timeline and network logs

# 4. After debugging, revert to on-failure
/e2e-report-configurator setup --artifacts on-failure
```

### Workflow 4: Multi-Environment Setup

```bash
# Development environment
/e2e-report-configurator setup --output reports/dev --artifacts always

# Staging environment
/e2e-report-configurator setup --output reports/staging --artifacts on-failure

# Production environment
/e2e-report-configurator setup --output reports/prod --artifacts never
```

---

## Best Practices

### 1. Version Control

**DO**:
- ✅ Commit `playwright.config.ts`
- ✅ Commit `.gitignore` updates
- ✅ Commit CI/CD workflow files

**DON'T**:
- ❌ Commit `reports/` directory
- ❌ Commit config backups (`.backup-*`)
- ❌ Commit test artifacts

### 2. Artifact Management

- Use `on-failure` policy for most environments (balances debugging needs with storage costs)
- Only use `always` during active debugging sessions
- Configure artifact retention in CI (30 days recommended)
- Clean up old artifacts regularly

### 3. Report Access

- Deploy HTML reports to static hosting (GitHub Pages, Netlify, etc.)
- Use unique URLs (commit SHA, run number) to avoid overwrites
- Consider authentication for sensitive test results
- Keep reports accessible for 30+ days

### 4. Performance Optimization

- Run tests in parallel (`workers: 4` in `playwright.config.ts`)
- Use CI npm cache to speed up installs
- Consider disabling videos in CI (large file size)
- Set reasonable test timeouts

### 5. Security

- Never commit secrets to `playwright.config.ts`
- Use environment variables for sensitive data
- Restrict artifact access in private repositories
- Rotate API keys used in tests

### 6. Validation Cadence

- Run validation after every setup change
- Include validation in pre-commit hooks
- Validate in CI before running tests
- Re-validate after Playwright upgrades

---

## Next Steps

After completing the initial setup:

1. **Configure Test Retries**: Add retry logic in `playwright.config.ts` for flaky tests
2. **Set Up Browsers**: Install specific browser versions with `npx playwright install chromium firefox webkit`
3. **Create Test Scenarios**: Write E2E tests in `tests/` directory
4. **Integrate with CI**: Add workflow file to `.github/workflows/`
5. **Monitor Reports**: Set up alerts for test failures in CI/CD

For more information:
- [Playwright Documentation](https://playwright.dev)
- [E2E Report Configurator README](../README.md)
- [Troubleshooting Guide](./troubleshooting.md)
- [Quickstart Guide](./quickstart.md)

---

**Last Updated**: 2025-12-30
**Version**: 1.0.0
