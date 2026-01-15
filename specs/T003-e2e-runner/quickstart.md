# Quick Start: E2E Test Runner

**@spec T003-e2e-runner**

Get started with e2e-runner in 5 minutes. This guide walks you through basic usage, common workflows, and troubleshooting.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Common Workflows](#common-workflows)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before using e2e-runner, ensure you have:

- ✅ **Node.js** 18+ installed
- ✅ **Playwright** installed (`npm install -D @playwright/test`)
- ✅ **Test scenarios** created (via `/test-scenario-author`)
- ✅ **Test scripts** generated (via `/e2e-test-generator`)

Verify your setup:

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check Playwright version
npx playwright --version  # Should be >= 1.40.0

# Verify test scripts exist
ls scenarios/**/*.spec.ts
```

---

## Installation

The e2e-runner skill is part of the Claude Code Skills suite. No additional installation is required.

**Verify skill availability**:

```bash
# List available skills
claude code skills list | grep e2e-runner
```

---

## Basic Usage

### 1. Create a Run Configuration File

Create a JSON file defining your test environment:

**`configs/saas-staging.json`**:
```json
{
  "env_profile": "saas-staging",
  "baseURL": "https://staging.cinema.com",
  "report_output_dir": "./reports/run-2025-12-30-14-30"
}
```

### 2. Run Tests

Execute tests using the e2e-runner skill:

```bash
/e2e-runner run --config configs/saas-staging.json
```

**Expected output**:
```
🚀 E2E Test Runner - Starting execution

📋 Configuration:
   Environment: saas-staging
   Base URL: https://staging.cinema.com
   Workers: 4 (default)
   Retries: 0 (default)

🔍 Discovered 10 test files:
   - scenarios/inventory/E2E-INVENTORY-001.spec.ts
   - scenarios/order/E2E-ORDER-001.spec.ts
   - ...

⏳ Running tests...

✅ Test Results:
   Total: 10
   Passed: 8
   Failed: 2
   Duration: 45.3s

📊 Report generated:
   HTML: ./reports/run-2025-12-30-14-30/index.html
   JSON: ./reports/run-2025-12-30-14-30/results.json
```

### 3. View Test Report

Open the HTML report in your browser:

```bash
# macOS
open ./reports/run-2025-12-30-14-30/index.html

# Linux
xdg-open ./reports/run-2025-12-30-14-30/index.html

# Windows
start ./reports/run-2025-12-30-14-30/index.html
```

---

## Common Workflows

### Workflow 1: Multi-Environment Testing

Test the same scripts across staging, UAT, and production:

**Step 1**: Create environment-specific configs

`configs/saas-staging.json`:
```json
{
  "env_profile": "saas-staging",
  "baseURL": "https://staging.cinema.com",
  "credentials_ref": "credentials/saas-staging.json",
  "report_output_dir": "./reports/staging-2025-12-30"
}
```

`configs/onprem-uat.json`:
```json
{
  "env_profile": "onprem-uat",
  "baseURL": "https://uat.cinema-onprem.com",
  "credentials_ref": "credentials/onprem-uat.json",
  "report_output_dir": "./reports/uat-2025-12-30"
}
```

**Step 2**: Run tests in each environment

```bash
# Staging
/e2e-runner run --config configs/saas-staging.json

# UAT
/e2e-runner run --config configs/onprem-uat.json
```

**Step 3**: Compare reports

```bash
# View staging report
open ./reports/staging-2025-12-30/index.html

# View UAT report
open ./reports/uat-2025-12-30/index.html
```

---

### Workflow 2: Secure Credentials Management

Avoid hardcoding credentials in config files:

**Step 1**: Create credentials file (outside Git)

`credentials/saas-staging.json`:
```json
{
  "env_profile": "saas-staging",
  "users": [
    {
      "role": "admin",
      "username": "admin@cinema.com",
      "password": "SecurePassword123!"
    }
  ]
}
```

**Step 2**: Secure the credentials file

```bash
# Set file permissions (owner read/write only)
chmod 600 credentials/saas-staging.json

# Add to .gitignore
echo "credentials/" >> .gitignore
```

**Step 3**: Reference in run config

`configs/saas-staging.json`:
```json
{
  "env_profile": "saas-staging",
  "baseURL": "https://staging.cinema.com",
  "credentials_ref": "credentials/saas-staging.json",
  "report_output_dir": "./reports/run-2025-12-30"
}
```

**Step 4**: Run tests (credentials auto-loaded)

```bash
/e2e-runner run --config configs/saas-staging.json
```

---

### Workflow 3: Multi-Browser Testing

Test across Chrome, Firefox, and Mobile Safari:

**Step 1**: Create config with multiple projects

`configs/multi-browser.json`:
```json
{
  "env_profile": "saas-staging",
  "baseURL": "https://staging.cinema.com",
  "projects": [
    {
      "name": "Desktop Chrome",
      "use": {
        "browserName": "chromium",
        "viewport": { "width": 1920, "height": 1080 }
      }
    },
    {
      "name": "Desktop Firefox",
      "use": {
        "browserName": "firefox",
        "viewport": { "width": 1920, "height": 1080 }
      }
    },
    {
      "name": "Mobile Safari",
      "use": {
        "browserName": "webkit",
        "viewport": { "width": 375, "height": 667 },
        "isMobile": true
      }
    }
  ],
  "report_output_dir": "./reports/multi-browser-2025-12-30"
}
```

**Step 2**: Run tests across all browsers

```bash
/e2e-runner run --config configs/multi-browser.json
```

**Expected output**:
```
✅ Test Results:
   Desktop Chrome: 10/10 passed
   Desktop Firefox: 9/10 passed (1 flaky)
   Mobile Safari: 8/10 passed (2 failures)
```

---

### Workflow 4: Parallel Execution with Retries

Speed up tests with parallel workers and retry flaky tests:

**Step 1**: Create config with parallelism

`configs/parallel.json`:
```json
{
  "env_profile": "saas-staging",
  "baseURL": "https://staging.cinema.com",
  "workers": 8,
  "retries": 2,
  "timeout": 60000,
  "report_output_dir": "./reports/parallel-2025-12-30"
}
```

**Step 2**: Run tests

```bash
/e2e-runner run --config configs/parallel.json
```

**Performance comparison**:
```
Serial (workers=1): 180s
Parallel (workers=8): 45s (75% faster)
```

---

## Examples

### Example 1: Minimal Configuration

Run tests with minimal config (defaults applied):

`configs/minimal.json`:
```json
{
  "env_profile": "dev",
  "baseURL": "http://localhost:3000",
  "report_output_dir": "./reports/dev-test"
}
```

```bash
/e2e-runner run --config configs/minimal.json
```

**Defaults applied**:
- `workers`: CPU cores (e.g., 8)
- `retries`: 0
- `timeout`: 30000ms
- `testMatch`: `scenarios/**/*.spec.ts`

---

### Example 2: Full-Featured Configuration

Use all available configuration options:

`configs/full.json`:
```json
{
  "env_profile": "saas-staging",
  "baseURL": "https://staging.cinema.com",
  "projects": [
    {
      "name": "chromium",
      "use": { "browserName": "chromium" }
    }
  ],
  "credentials_ref": "credentials/saas-staging.json",
  "retries": 2,
  "workers": 4,
  "timeout": 60000,
  "report_output_dir": "./reports/full-run-2025-12-30",
  "testMatch": "scenarios/inventory/**/*.spec.ts"
}
```

```bash
/e2e-runner run --config configs/full.json
```

---

### Example 3: CI/CD Integration

Run e2e-runner in CI pipeline (GitHub Actions):

`.github/workflows/e2e-tests.yml`:
```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Create credentials file
        run: |
          mkdir -p credentials
          echo '${{ secrets.STAGING_CREDENTIALS }}' > credentials/saas-staging.json

      - name: Run E2E tests
        run: |
          /e2e-runner run --config configs/saas-staging.json

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: ./reports/run-*/
          retention-days: 30
```

**Secrets setup** (GitHub repository settings):
```json
STAGING_CREDENTIALS = {
  "env_profile": "saas-staging",
  "users": [
    {
      "role": "admin",
      "username": "ci-admin@cinema.com",
      "password": "${{ secrets.CI_ADMIN_PASSWORD }}"
    }
  ]
}
```

---

### Example 4: Selective Test Execution

Run only inventory module tests:

`configs/inventory-only.json`:
```json
{
  "env_profile": "saas-staging",
  "baseURL": "https://staging.cinema.com",
  "testMatch": "scenarios/inventory/**/*.spec.ts",
  "report_output_dir": "./reports/inventory-2025-12-30"
}
```

```bash
/e2e-runner run --config configs/inventory-only.json
```

**Alternative glob patterns**:
```json
// Single scenario
"testMatch": "scenarios/inventory/E2E-INVENTORY-001.spec.ts"

// All smoke tests (by naming convention)
"testMatch": "scenarios/**/*-smoke.spec.ts"

// Multiple modules
"testMatch": "scenarios/{inventory,order}/**/*.spec.ts"
```

---

## Troubleshooting

### Issue 1: "Configuration file not found"

**Error**:
```
❌ Error: Configuration file not found: configs/missing.json
```

**Solution**:
```bash
# Verify file path
ls configs/missing.json

# Check current directory
pwd

# Use absolute path if needed
/e2e-runner run --config /absolute/path/to/configs/saas-staging.json
```

---

### Issue 2: "Credentials file not found"

**Error**:
```
❌ Error: Credentials file not found: credentials/saas-staging.json
```

**Solution**:
```bash
# Check if credentials file exists
ls credentials/saas-staging.json

# Verify credentials_ref path in config
cat configs/saas-staging.json | grep credentials_ref

# Create credentials file if missing
mkdir -p credentials
cat > credentials/saas-staging.json <<EOF
{
  "env_profile": "saas-staging",
  "users": [
    {
      "role": "admin",
      "username": "admin@cinema.com",
      "password": "your-password"
    }
  ]
}
EOF

# Secure the file
chmod 600 credentials/saas-staging.json
```

---

### Issue 3: "baseURL unreachable"

**Error**:
```
❌ Error: baseURL unreachable: https://staging.cinema.com
```

**Solution**:
```bash
# Check network connectivity
ping staging.cinema.com

# Test baseURL manually
curl -I https://staging.cinema.com

# Check VPN/proxy settings
# Update baseURL in config if environment changed
```

---

### Issue 4: "Report directory already exists"

**Error**:
```
❌ Error: Report directory already exists: ./reports/run-2025-12-30-14-30
```

**Solution**:
```bash
# Use unique report directory name
# Update config with timestamp:
{
  "report_output_dir": "./reports/run-$(date +%Y-%m-%d-%H-%M-%S)"
}

# Or delete old report
rm -rf ./reports/run-2025-12-30-14-30

# Or use --force flag (if implemented)
/e2e-runner run --config configs/saas-staging.json --force
```

---

### Issue 5: "Test timeout exceeded"

**Error**:
```
❌ Test timeout exceeded: 30000ms
```

**Solution**:
```json
// Increase timeout in config
{
  "timeout": 60000  // 60 seconds
}

// Or increase globally in playwright.config.ts
export default defineConfig({
  timeout: 60000
});
```

---

### Issue 6: "Playwright not installed"

**Error**:
```
❌ Error: Playwright not installed or version incompatible
```

**Solution**:
```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Verify installation
npx playwright --version  # Should be >= 1.40.0
```

---

### Issue 7: "No test files matched"

**Error**:
```
❌ Error: No test files matched pattern: scenarios/**/*.spec.ts
```

**Solution**:
```bash
# Check test files exist
ls scenarios/**/*.spec.ts

# Generate test scripts first
/test-scenario-author create
/e2e-test-generator generate E2E-INVENTORY-001

# Update testMatch pattern in config
{
  "testMatch": "scenarios/**/*.spec.ts"  // Verify pattern
}
```

---

### Issue 8: "env_profile mismatch"

**Error**:
```
❌ Error: env_profile mismatch - config: 'saas-staging', credentials: 'saas-production'
```

**Solution**:
```bash
# Ensure env_profile matches in both files
cat configs/saas-staging.json | grep env_profile
cat credentials/saas-staging.json | grep env_profile

# Update credentials file to match
{
  "env_profile": "saas-staging"  // Must match config
}
```

---

## Best Practices

### ✅ Do's

- **Use unique report directories**: Include timestamp in `report_output_dir`
  ```json
  "report_output_dir": "./reports/run-2025-12-30-14-30-15"
  ```

- **Secure credentials files**: Always `chmod 600` and add to `.gitignore`
  ```bash
  chmod 600 credentials/*.json
  echo "credentials/" >> .gitignore
  ```

- **Validate configs before running**: Use `/e2e-runner validate` (if available)
  ```bash
  /e2e-runner validate --config configs/saas-staging.json
  ```

- **Use environment-specific configs**: Separate configs for dev/staging/production
  ```
  configs/
  ├── dev.json
  ├── saas-staging.json
  ├── onprem-uat.json
  └── production.json
  ```

- **Leverage parallelism**: Set `workers` to CPU cores for faster execution
  ```json
  "workers": 8
  ```

### ❌ Don'ts

- **Don't commit credentials**: Never commit credentials files to Git
  ```bash
  # BAD: git add credentials/saas-staging.json
  ```

- **Don't reuse report directories**: Avoid overwriting previous reports
  ```json
  // BAD: "report_output_dir": "./reports/latest"
  // GOOD: "report_output_dir": "./reports/run-2025-12-30-14-30"
  ```

- **Don't hardcode baseURL in tests**: Use config-driven baseURL
  ```typescript
  // BAD: await page.goto('https://staging.cinema.com');
  // GOOD: await page.goto('/'); // Uses baseURL from config
  ```

- **Don't skip validation**: Always validate configs, especially in CI
  ```bash
  # BAD: /e2e-runner run --config invalid.json
  # GOOD: /e2e-runner validate --config configs/saas-staging.json && \
  #       /e2e-runner run --config configs/saas-staging.json
  ```

---

## Next Steps

After mastering the basics:

1. **Read the full spec**: `specs/T003-e2e-runner/spec.md`
2. **Explore data models**: `specs/T003-e2e-runner/data-model.md`
3. **Integrate with CI/CD**: See Example 3 above
4. **Create custom projects**: Define browser/device configurations
5. **Monitor test trends**: Analyze JSON reports over time

---

## Additional Resources

- **Spec**: `specs/T003-e2e-runner/spec.md`
- **Data Model**: `specs/T003-e2e-runner/data-model.md`
- **Skill Documentation**: `.claude/skills/e2e-runner/skill.md`
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Test Scenario Author**: `specs/T005-e2e-scenario-author/quickstart.md`
- **Test Generator**: `specs/T002-e2e-test-generator/quickstart.md`

---

**Version**: 1.0.0
**Last Updated**: 2025-12-30
