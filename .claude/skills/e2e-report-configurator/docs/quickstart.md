# E2E Report Configurator - Quickstart Guide

Get started with Playwright test report configuration in 5 minutes.

## Prerequisites

```bash
# Install Playwright
npm install -D @playwright/test

# Initialize Playwright (creates playwright.config.ts)
npm init playwright@latest
```

## Quick Setup

### Step 1: Run Setup Command

```bash
/e2e-report-configurator setup
```

This creates:
- `reports/e2e/html/` - HTML test reports
- `reports/e2e/artifacts/` - Screenshots, videos, traces
- Updated `playwright.config.ts` with reporter config
- Updated `.gitignore` to exclude reports

### Step 2: Run Your Tests

```bash
npx playwright test
```

### Step 3: View Report

```bash
npx playwright show-report reports/e2e/html
```

**That's it!** You now have a fully configured Playwright test reporting system.

---

## Common Configurations

### HTML + JSON Reports

```bash
/e2e-report-configurator setup --format html,json
```

### HTML + JUnit (for CI/CD)

```bash
/e2e-report-configurator setup --format html,junit
```

### Always Capture Artifacts (Debug Mode)

```bash
/e2e-report-configurator setup --artifacts always
```

### Custom Output Directory

```bash
/e2e-report-configurator setup --output test-results
```

---

## Validation

Verify your configuration is correct:

```bash
/e2e-report-configurator validate
```

Expected output:
```
✅ Playwright configuration validation passed

All checks completed successfully:
  ✓ Config structure
  ✓ TypeScript compilation
  ✓ Playwright runtime
  ✓ Reporter paths uniqueness
  ✓ Directory permissions
```

---

## CI/CD Integration

Generate platform-specific documentation:

```bash
/e2e-report-configurator docs
```

This creates `docs/e2e-reports.md` with ready-to-use examples for:
- GitHub Actions
- GitLab CI
- Jenkins

---

## Troubleshooting

### Config file not found

**Error**: `Config file not found`

**Solution**:
```bash
npm init playwright@latest
```

### TypeScript compilation errors

**Error**: `TypeScript compilation errors`

**Solution**:
```bash
npx tsc --noEmit  # See detailed errors
```

### Directory not writable

**Error**: `Directory not writable: reports/e2e`

**Solution**:
```bash
chmod 755 reports/e2e
```

---

## Next Steps

- 📖 [Complete Workflow Guide](./workflow-guide.md)
- 🔧 [Troubleshooting Guide](./troubleshooting.md)
- 📚 [Full Documentation](../skill.md)

---

**Last Updated**: 2025-12-30
