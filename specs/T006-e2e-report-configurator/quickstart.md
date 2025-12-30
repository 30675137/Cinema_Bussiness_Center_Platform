# Quick Start Guide: E2E Report Configurator

**Spec**: T006-e2e-report-configurator | **Version**: 1.0.0 | **Date**: 2025-12-30

## Overview

The **E2E Report Configurator** is a Claude Code skill that configures Playwright test report outputs for E2E tests. It standardizes report directory structures, manages multiple report formats (HTML, JSON, JUnit), and configures artifact retention policies.

**What this skill does**:
- ✅ Configures Playwright reporters (HTML mandatory, JSON/JUnit optional)
- ✅ Creates standardized output directory structure (`reports/e2e/{html,json,junit,artifacts}/`)
- ✅ Manages artifact retention policies (screenshots, videos, traces)
- ✅ Updates `.gitignore` to exclude report outputs
- ✅ Validates generated configuration correctness
- ✅ Generates CI/CD integration documentation

---

## Prerequisites

Before using this skill, ensure:

1. **Playwright installed** in your project:
   ```bash
   npm install -D @playwright/test
   ```

2. **Playwright config exists**:
   ```bash
   # Initialize Playwright if needed
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

---

## Basic Usage

### 1. Setup HTML Reporter (Minimal)

Configure mandatory HTML reporter with default settings:

```bash
/e2e-report-configurator setup
```

**What this does**:
- Updates `playwright.config.ts` with HTML reporter
- Creates directory structure:
  ```
  reports/e2e/
  └── html/
      └── .gitkeep
  ```
- Adds `reports/` to `.gitignore`
- Validates configuration compiles

**Generated config**:
```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
    ['list']
  ]
})
```

---

### 2. Setup Multi-Format Reporters

Configure HTML + JSON + JUnit reporters:

```bash
/e2e-report-configurator setup --format html,json,junit
```

**What this does**:
- Configures all three reporter formats
- Creates full directory structure:
  ```
  reports/e2e/
  ├── html/
  ├── json/
  ├── junit/
  └── artifacts/
      ├── screenshots/
      ├── videos/
      └── traces/
  ```

**Generated config**:
```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['html', { outputFolder: 'reports/e2e/html', open: 'never' }],
    ['json', { outputFile: 'reports/e2e/json/results.json' }],
    ['junit', { outputFile: 'reports/e2e/junit/results.xml' }],
    ['list']
  ]
})
```

---

### 3. Custom Output Directory

Specify a custom output directory:

```bash
/e2e-report-configurator setup --output test-reports
```

**Generated structure**:
```
test-reports/
├── html/
├── json/
├── junit/
└── artifacts/
```

---

### 4. Configure Artifact Retention

Control when to capture test artifacts (screenshots, videos, traces):

```bash
# Capture artifacts only on failure (default)
/e2e-report-configurator setup --artifacts on-failure

# Always capture artifacts
/e2e-report-configurator setup --artifacts always

# Never capture artifacts
/e2e-report-configurator setup --artifacts never
```

**Generated config** (on-failure):
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
})
```

---

## Validate Configuration

Validate your Playwright configuration after manual edits:

```bash
/e2e-report-configurator validate
```

**What this checks**:
1. ✅ `playwright.config.ts` file exists
2. ✅ TypeScript compiles without errors (`npx tsc --noEmit`)
3. ✅ Playwright can load config (`npx playwright test --list`)
4. ✅ Reporter output paths are unique
5. ✅ Output directories exist and are writable

**Example output** (success):
```
✅ Validation passed (3/3 checks)

Checks:
  ✅ File exists: playwright.config.ts found
  ✅ TypeScript validation: Config compiles without errors
  ✅ Playwright runtime validation: Config loaded successfully
```

**Example output** (failure):
```
❌ Validation failed (1/3 checks)

Checks:
  ✅ File exists: playwright.config.ts found
  ❌ TypeScript validation: error TS2322: Type 'number' is not assignable to type 'string'
     Suggestion: Fix type errors in playwright.config.ts
  ⚠️  Playwright runtime validation: outputFolder does not exist
     Suggestion: Create output directory or update path
```

---

## Generate Documentation

Generate CI/CD integration documentation:

```bash
/e2e-report-configurator docs
```

**What this generates**:
- `docs/e2e-reports.md` with:
  - GitHub Actions workflow example
  - GitLab CI configuration example
  - Jenkins pipeline example
  - Artifact retention policies
  - Troubleshooting guide

---

## Common Use Cases

### Use Case 1: Local Development

**Goal**: HTML report with artifacts on failure (minimal disk usage)

```bash
/e2e-report-configurator setup --format html --artifacts on-failure
```

**Run tests**:
```bash
npx playwright test
```

**View report**:
```bash
npx playwright show-report reports/e2e/html
```

---

### Use Case 2: CI/CD Integration

**Goal**: HTML + JUnit reports, no videos (save storage costs)

```bash
/e2e-report-configurator setup --format html,junit --artifacts on-failure
```

**GitHub Actions workflow**:
```yaml
- name: Run E2E tests
  run: npx playwright test

- name: Upload HTML Report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report
    path: reports/e2e/html/
    retention-days: 30

- name: Publish Test Results
  uses: dorny/test-reporter@v1
  if: always()
  with:
    name: Playwright Tests
    path: reports/e2e/junit/results.xml
    reporter: java-junit
```

---

### Use Case 3: Debugging Failed Tests

**Goal**: Maximum debugging information (all artifacts)

```bash
/e2e-report-configurator setup --format html,json --artifacts always
```

**Run tests in debug mode**:
```bash
npx playwright test --debug
```

**Analyze results**:
- HTML report: `reports/e2e/html/index.html`
- JSON data: `reports/e2e/json/results.json`
- Screenshots: `reports/e2e/artifacts/screenshots/`
- Videos: `reports/e2e/artifacts/videos/`
- Traces: `reports/e2e/artifacts/traces/` (view with `npx playwright show-trace`)

---

### Use Case 4: Team Collaboration

**Goal**: Standardize report structure across team

```bash
# 1. Configure reports (run once)
/e2e-report-configurator setup --format html,json,junit

# 2. Commit configuration
git add playwright.config.ts .gitignore
git commit -m "feat: standardize E2E report configuration"

# 3. Team members pull and run tests
git pull
npm install
npx playwright test
```

---

## Command Reference

### `setup` Command

Configure Playwright reporters and create directory structure.

**Syntax**:
```bash
/e2e-report-configurator setup [options]
```

**Options**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--format` | `string` | `html` | Reporter formats (html, html,json, html,json,junit) |
| `--output` | `string` | `reports/e2e` | Base output directory |
| `--artifacts` | `string` | `on-failure` | Artifact capture policy (on-failure, always, never) |

**Examples**:
```bash
# Minimal setup
/e2e-report-configurator setup

# Multi-format with custom output
/e2e-report-configurator setup --format html,json,junit --output test-reports

# Always capture artifacts
/e2e-report-configurator setup --artifacts always
```

---

### `validate` Command

Validate Playwright configuration correctness.

**Syntax**:
```bash
/e2e-report-configurator validate
```

**Exit codes**:
- `0`: Validation passed
- `1`: Validation failed

**Validation layers**:
1. File existence check
2. TypeScript compilation (`tsc --noEmit`)
3. Playwright runtime validation (`playwright test --list`)

---

### `docs` Command

Generate CI/CD integration documentation.

**Syntax**:
```bash
/e2e-report-configurator docs
```

**Output**: `docs/e2e-reports.md`

**Contents**:
- GitHub Actions workflow
- GitLab CI configuration
- Jenkins pipeline
- Artifact retention recommendations
- Troubleshooting guide

---

## Directory Structure Reference

After running `setup --format html,json,junit`, you'll have:

```
<project-root>/
├── playwright.config.ts         # Updated with reporter configuration
├── reports/                     # Report output directory (gitignored)
│   └── e2e/
│       ├── html/               # HTML reports
│       │   ├── index.html
│       │   └── assets/
│       ├── json/               # JSON reports
│       │   └── results.json
│       ├── junit/              # JUnit XML reports
│       │   └── results.xml
│       └── artifacts/          # Test artifacts
│           ├── screenshots/
│           ├── videos/
│           └── traces/
├── .gitignore                  # Updated with reports/ entry
└── docs/
    └── e2e-reports.md          # Generated documentation
```

---

## Troubleshooting

### Issue 1: Permission Denied

**Error**:
```
Error: EACCES: permission denied, mkdir 'reports/e2e/html'
```

**Solution**:
```bash
# Check directory permissions
ls -la reports/

# Fix permissions
chmod -R u+w reports/

# Or use custom output directory
/e2e-report-configurator setup --output /tmp/test-reports
```

---

### Issue 2: TypeScript Validation Failed

**Error**:
```
❌ TypeScript validation: error TS2322: Type 'number' is not assignable to type 'string'
```

**Solution**:
```bash
# Check TypeScript errors manually
npx tsc --noEmit playwright.config.ts

# Fix type errors in playwright.config.ts
# Then re-validate
/e2e-report-configurator validate
```

---

### Issue 3: Playwright Cannot Load Config

**Error**:
```
⚠️  Playwright runtime validation: outputFolder does not exist
```

**Solution**:
```bash
# Create output directories
mkdir -p reports/e2e/html reports/e2e/json reports/e2e/junit

# Or re-run setup
/e2e-report-configurator setup
```

---

### Issue 4: Reports Not Generated

**Symptom**: Tests pass but no reports in `reports/e2e/html/`

**Diagnosis**:
```bash
# Check reporter configuration
grep -A 10 "reporter:" playwright.config.ts

# Verify output path
ls -la reports/e2e/
```

**Solution**:
```bash
# Re-run setup to fix configuration
/e2e-report-configurator setup --format html

# Run tests again
npx playwright test
```

---

### Issue 5: Duplicate Output Paths

**Error**:
```
❌ Validation failed: Duplicate output path: reports/e2e/html
```

**Solution**:
```typescript
// playwright.config.ts - Fix duplicate reporters
reporter: [
  ['html', { outputFolder: 'reports/e2e/html' }],
  // Remove duplicate:
  // ['html', { outputFolder: 'reports/e2e/html' }], // ❌ Duplicate
  ['json', { outputFile: 'reports/e2e/json/results.json' }]
]
```

---

## CI/CD Integration Examples

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test
        continue-on-error: true

      - name: Upload HTML Report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: reports/e2e/html/
          retention-days: 30

      - name: Publish Test Results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Playwright Tests
          path: reports/e2e/junit/results.xml
          reporter: java-junit
```

---

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm ci
    - npx playwright test
  artifacts:
    when: always
    paths:
      - reports/e2e/html/
      - reports/e2e/json/
    reports:
      junit: reports/e2e/junit/results.xml
    expire_in: 30 days
  allow_failure: true
```

---

### Jenkins

```groovy
// Jenkinsfile
pipeline {
    agent any

    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install --with-deps'
            }
        }

        stage('E2E Tests') {
            steps {
                sh 'npx playwright test'
            }
        }
    }

    post {
        always {
            junit 'reports/e2e/junit/results.xml'
            publishHTML([
                reportDir: 'reports/e2e/html',
                reportFiles: 'index.html',
                reportName: 'Playwright Report'
            ])
        }
    }
}
```

---

## Best Practices

### 1. Artifact Retention Strategy

| Environment | Screenshot | Video | Trace | Rationale |
|-------------|------------|-------|-------|-----------|
| **Local Dev** | `only-on-failure` | `retain-on-failure` | `on-first-retry` | Debug failures, minimal disk usage |
| **CI/CD** | `only-on-failure` | `off` | `on-first-retry` | Save storage costs |
| **Debug Session** | `on` | `on` | `on` | Maximum debugging info |
| **Production Smoke Tests** | `only-on-failure` | `off` | `off` | Minimal overhead |

### 2. Report Format Selection

| Format | When to Use | CI/CD Integration |
|--------|-------------|-------------------|
| **HTML** | ✅ Always (mandatory) | Artifact upload, manual review |
| **JSON** | ✅ Data analysis, metrics tracking | Programmatic parsing, dashboards |
| **JUnit** | ✅ CI/CD test result visualization | GitHub/GitLab/Jenkins native integration |

### 3. Directory Naming

- ✅ Use `reports/e2e` (aligns with T001-T004 conventions)
- ❌ Avoid `test-results` (conflicts with Playwright default)
- ❌ Avoid `playwright-report` (too generic)

### 4. Gitignore Configuration

Always add to `.gitignore`:
```gitignore
# Test reports (generated by e2e-report-configurator)
reports/
```

**Never commit**:
- HTML reports (large, binary assets)
- Videos (very large files)
- Traces (large, binary format)

**Consider committing**:
- JSON reports (if small, for historical tracking)
- JUnit XML (if small, for historical tracking)

---

## Advanced Usage

### Incremental Addition

Start with HTML, add formats later:

```bash
# Phase 1: HTML only (MVP)
/e2e-report-configurator setup --format html

# Phase 2: Add JSON for CI analysis
/e2e-report-configurator setup --format html,json

# Phase 3: Add JUnit for CI integration
/e2e-report-configurator setup --format html,json,junit
```

Skill is **idempotent** - safe to run multiple times.

---

### Custom Reporter Options

Manually edit `playwright.config.ts` for advanced options:

```typescript
// Open HTML report automatically on failure
reporter: [
  ['html', {
    outputFolder: 'reports/e2e/html',
    open: 'on-failure' // ⬅️ Custom option
  }]
]
```

Then validate:
```bash
/e2e-report-configurator validate
```

---

## FAQ

**Q: Can I use different output directories for each reporter?**

A: No. The skill enforces standardized directory structure (`reports/e2e/{format}/`) for consistency across T001-T006 E2E testing skills. Use `--output` to change the base path only.

**Q: Is HTML reporter mandatory?**

A: Yes. HTML is the primary human-readable report format and is always included.

**Q: Can I run this skill multiple times?**

A: Yes. The skill is **idempotent** - running it multiple times is safe and will update (not duplicate) configuration.

**Q: What happens if I manually edit `playwright.config.ts`?**

A: Manual edits are preserved. The skill only updates the `reporter` array and artifact settings. Use `/e2e-report-configurator validate` to check correctness.

**Q: How do I remove report configuration?**

A: Manually delete the `reporter` array from `playwright.config.ts` and remove `reports/` from `.gitignore`.

---

## Related Skills

- **T001**: `e2e-scenario-author` - Create E2E test scenarios
- **T002**: `e2e-test-generator` - Generate Playwright tests from scenarios
- **T003**: `e2e-runner` - Execute Playwright tests
- **T004**: `e2e-testdata-planner` - Plan test data lifecycle
- **T006**: `e2e-report-configurator` (this skill)

**Workflow Integration**:
```bash
# 1. Author scenario
/e2e-scenario-author create "User login flow"

# 2. Generate test
/e2e-test-generator generate scenarios/login.yaml

# 3. Configure reports (once)
/e2e-report-configurator setup --format html,json,junit

# 4. Run tests
/e2e-runner run tests/login.spec.ts

# 5. View reports
npx playwright show-report reports/e2e/html
```

---

## Next Steps

1. **Run setup**: `/e2e-report-configurator setup`
2. **Execute tests**: `npx playwright test`
3. **View reports**: `npx playwright show-report reports/e2e/html`
4. **Integrate CI/CD**: Use examples from `/e2e-report-configurator docs`

**Need help?** Check:
- 📖 [Data Model](./data-model.md) - Detailed schema documentation
- 🔧 [TypeScript Contracts](./contracts/reporter-config.ts) - Type definitions
- 🔬 [Research Decisions](./research.md) - Technical rationale
- 📋 [Implementation Plan](./plan.md) - Development roadmap

---

**Quick Start Guide v1.0.0** | T006-e2e-report-configurator | 2025-12-30
