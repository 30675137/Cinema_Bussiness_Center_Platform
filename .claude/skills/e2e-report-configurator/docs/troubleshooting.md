# E2E Report Configurator - Troubleshooting Guide

Common issues and their solutions.

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Validation Errors](#validation-errors)
3. [Reporter Issues](#reporter-issues)
4. [Directory Issues](#directory-issues)
5. [CI/CD Issues](#cicd-issues)
6. [Performance Issues](#performance-issues)

---

## Setup Issues

### Config file not found

**Error**:
```
❌ Config file not found
Code: E1001
```

**Cause**: `playwright.config.ts` does not exist

**Solution**:
```bash
# Initialize Playwright
npm init playwright@latest

# Or specify custom config path
/e2e-report-configurator setup --config custom-playwright.config.ts
```

---

### Backup creation failed

**Error**:
```
❌ Configuration Backup Failed
Code: E1004
```

**Cause**: Insufficient disk space or permission issues

**Solution**:
```bash
# Check disk space
df -h

# Check directory permissions
ls -la

# Free up space or fix permissions
chmod 755 .
```

---

## Validation Errors

### TypeScript compilation failed

**Error**:
```
❌ TypeScript Compilation Failed
Code: E2001
Description: The configuration file has TypeScript syntax errors
```

**Cause**: Invalid TypeScript syntax in `playwright.config.ts`

**Solution**:
```bash
# Run TypeScript compiler to see detailed errors
npx tsc --noEmit

# Common issues:
# - Missing closing braces
# - Invalid type annotations
# - Syntax errors in config
```

**Example Fix**:
```typescript
// ❌ Incorrect (extra comma)
export default defineConfig({
  reporter: [['html'],],  // Extra comma
})

// ✅ Correct
export default defineConfig({
  reporter: [['html']],
})
```

---

### Playwright runtime validation failed

**Error**:
```
❌ Playwright Runtime Validation Failed
Code: E2002
```

**Cause**: Playwright cannot load the configuration

**Solution**:
```bash
# Run Playwright to see detailed errors
npx playwright test --list

# Common issues:
# - Invalid reporter configuration
# - Missing @playwright/test dependency
# - Incorrect config structure
```

**Check**:
```typescript
// Ensure you have this import
import { defineConfig } from '@playwright/test'

// Verify reporter config format
reporter: [
  ['html', { outputFolder: 'reports/html' }],  // ✅ Correct
  ['json', { outputFile: 'reports/results.json' }]  // ✅ Correct
]
```

---

### Reporter path conflict

**Error**:
```
❌ Reporter Path Conflict
Code: E2003
Description: Output path conflict: reports/html overlaps with reports/html/results.json
```

**Cause**: Multiple reporters configured with overlapping paths

**Solution**:
```bash
# Use unique output directories for each reporter
/e2e-report-configurator setup --format html,json --output reports/e2e
```

**Correct Configuration**:
```typescript
reporter: [
  ['html', { outputFolder: 'reports/e2e/html' }],     // ✅ Unique
  ['json', { outputFile: 'reports/e2e/json/results.json' }]  // ✅ Unique
]
```

---

## Reporter Issues

### HTML reporter missing

**Error**:
```
❌ HTML Reporter Required
Code: E4001
```

**Cause**: HTML reporter not included in --format parameter

**Solution**:
```bash
# Always include 'html' in format
/e2e-report-configurator setup --format html,json,junit
```

---

### Invalid reporter format

**Error**:
```
❌ Invalid Reporter Format
Code: E4002
```

**Cause**: Unsupported reporter format specified

**Solution**:
```bash
# Use only supported formats: html, json, junit
/e2e-report-configurator setup --format html,json,junit

# ❌ Invalid
/e2e-report-configurator setup --format html,xml,csv

# ✅ Valid
/e2e-report-configurator setup --format html,json
```

---

## Directory Issues

### Directory creation failed

**Error**:
```
❌ Directory Creation Failed
Code: E3001
```

**Cause**: Insufficient permissions or disk space

**Solution**:
```bash
# Check disk space
df -h

# Check parent directory permissions
ls -la

# Create directory manually with correct permissions
mkdir -p reports/e2e
chmod 755 reports/e2e
```

---

### Directory not writable

**Error**:
```
❌ Directory Not Writable
Code: E3002
Description: The directory exists but is not writable
```

**Cause**: Incorrect directory permissions

**Solution**:
```bash
# Fix directory permissions
chmod 755 reports/e2e

# Verify permissions
ls -la reports/

# Expected output: drwxr-xr-x
```

---

### Directory does not exist

**Error**:
```
❌ Directory Does Not Exist
Code: E3003
```

**Cause**: Required directories were not created

**Solution**:
```bash
# Run setup command to create directories
/e2e-report-configurator setup

# Or create manually
mkdir -p reports/e2e/html
mkdir -p reports/e2e/artifacts/screenshots
mkdir -p reports/e2e/artifacts/videos
mkdir -p reports/e2e/artifacts/traces
```

---

## CI/CD Issues

### Reports not uploaded in GitHub Actions

**Problem**: Artifacts not appearing in GitHub Actions

**Causes & Solutions**:

1. **Incorrect path**:
```yaml
# ❌ Incorrect
path: reports/

# ✅ Correct (match your output directory)
path: reports/e2e/
```

2. **Missing `if: always()`**:
```yaml
# ❌ Won't upload on test failure
- name: Upload test reports
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: reports/e2e/

# ✅ Uploads even if tests fail
- name: Upload test reports
  uses: actions/upload-artifact@v4
  if: always()  # <-- Add this
  with:
    name: playwright-report
    path: reports/e2e/
```

---

### JUnit report not showing in GitLab CI

**Problem**: Test results not appearing in merge request

**Solution**:
```yaml
# Ensure reports section is configured
artifacts:
  when: always
  paths:
    - reports/e2e/
  reports:
    junit: reports/e2e/junit/results.xml  # <-- Add this
```

---

### HTML report blank in Jenkins

**Problem**: HTML report shows blank page

**Cause**: Content Security Policy (CSP) restrictions

**Solution**:

1. **Install HTML Publisher Plugin**
2. **Configure CSP relaxation**:
```groovy
publishHTML([
  allowMissing: false,
  alwaysLinkToLastBuild: true,
  keepAll: true,
  reportDir: 'reports/e2e/html',
  reportFiles: 'index.html',
  reportName: 'Playwright Test Report',
  reportTitles: '',
  useWrapperFileDirectly: true  // <-- Add this
])
```

---

## Performance Issues

### Tests taking too long

**Problem**: Test execution is slow

**Solutions**:

1. **Enable parallel execution**:
```typescript
// playwright.config.ts
export default defineConfig({
  workers: 4,  // Run 4 tests in parallel
})
```

2. **Disable videos in CI**:
```bash
# Use never policy in CI
/e2e-report-configurator setup --artifacts never
```

3. **Use faster browsers**:
```typescript
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Remove webkit and firefox if not needed
  ],
})
```

---

### Large artifact files

**Problem**: Test artifacts consuming too much storage

**Solutions**:

1. **Use on-failure policy**:
```bash
/e2e-report-configurator setup --artifacts on-failure
```

2. **Reduce artifact retention**:
```yaml
# GitHub Actions
- name: Upload test reports
  uses: actions/upload-artifact@v4
  with:
    retention-days: 7  # Instead of 30
```

3. **Disable videos**:
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    video: 'off',  // Disable videos completely
  },
})
```

---

## Common Error Messages

| Error Code | Error Message | Quick Fix |
|------------|---------------|-----------|
| E1001 | Config file not found | Run `npm init playwright@latest` |
| E1002 | Invalid config structure | Add missing fields (reporter, screenshot, video, trace) |
| E2001 | TypeScript compilation failed | Run `npx tsc --noEmit` for details |
| E2002 | Playwright runtime failed | Run `npx playwright test --list` for details |
| E2003 | Reporter path conflict | Use unique output paths for each reporter |
| E3001 | Directory creation failed | Check permissions and disk space |
| E3002 | Directory not writable | Run `chmod 755 <directory>` |
| E4001 | HTML reporter missing | Include 'html' in --format parameter |
| E5001 | Invalid format option | Use: html, html,json, or html,json,junit |
| E5002 | Invalid artifacts policy | Use: on-failure, always, or never |

---

## Getting Help

If you encounter an issue not listed here:

1. **Run validation** to identify the problem:
   ```bash
   /e2e-report-configurator validate
   ```

2. **Check error code** and search this guide

3. **Review logs** for detailed error messages

4. **Check Playwright documentation**:
   - [Playwright Reporters](https://playwright.dev/docs/test-reporters)
   - [Playwright Configuration](https://playwright.dev/docs/test-configuration)

5. **Open an issue**:
   - [GitHub Issues](https://github.com/anthropics/claude-code/issues)

---

**Last Updated**: 2025-12-30
**Version**: 1.0.0
