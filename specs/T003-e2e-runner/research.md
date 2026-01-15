# Research Findings: E2E Test Runner

**@spec T003-e2e-runner**
**Date**: 2025-12-30
**Phase**: Phase 0 (Outline & Research)

## Overview

This document consolidates research findings for implementing the e2e-runner Claude Code Skill. All technical unknowns from the Technical Context section have been investigated, best practices identified, and implementation decisions documented.

---

## Research Areas

### 1. Playwright Programmatic Test Runner API

**Question**: How to programmatically invoke Playwright tests with custom configuration?

**Research Summary**:

Playwright provides a programmatic test runner API via `@playwright/test` package:

```typescript
import { test as base } from '@playwright/test';
import { defineConfig, devices } from '@playwright/test';

// Method 1: Dynamic config generation + CLI invocation
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

// Method 2: Programmatic execution (recommended for e2e-runner)
import { chromium } from 'playwright';
import { PlaywrightTestConfig } from '@playwright/test';

async function runTests(config: E2ERunConfig) {
  // Generate playwright.config.ts dynamically
  const playwrightConfig: PlaywrightTestConfig = {
    use: {
      baseURL: config.baseURL,
    },
    retries: config.retries || 0,
    workers: config.workers || undefined,
    timeout: config.timeout || 30000,
    reporter: [
      ['html', { outputFolder: `${config.report_output_dir}/html` }],
      ['json', { outputFile: `${config.report_output_dir}/results.json` }],
    ],
    projects: config.projects || [{ name: 'chromium', use: {} }],
  };

  // Execute via child process
  const { spawn } = require('child_process');
  const proc = spawn('npx', [
    'playwright',
    'test',
    '--config',
    './temp-playwright-config.ts',
    config.testMatch || 'scenarios/**/*.spec.ts',
  ]);

  return new Promise((resolve, reject) => {
    proc.on('close', (code) => {
      if (code === 0) resolve(code);
      else reject(new Error(`Tests failed with code ${code}`));
    });
  });
}
```

**Decision**: Use **hybrid approach**:
1. Generate temporary `playwright.config.ts` from E2ERunConfig
2. Invoke `npx playwright test --config <temp-config>` via child_process
3. Parse JSON reporter output for TestReport generation
4. Clean up temp config after execution

**Rationale**:
- Leverages Playwright's native CLI (stable, well-tested)
- Avoids dependency on unstable internal APIs
- Supports all Playwright features (retries, workers, projects)
- Easy to debug (users can run generated config manually)

**Alternatives Considered**:
- ❌ **Direct API usage** (`@playwright/test` internal runner): Unstable, poorly documented
- ❌ **Custom test runner**: Reinvents the wheel, high maintenance cost

**References**:
- https://playwright.dev/docs/test-configuration
- https://playwright.dev/docs/test-reporters#json-reporter

---

### 2. Configuration Validation Strategy

**Question**: Should we use JSON Schema or Zod for E2ERunConfig validation?

**Research Summary**:

| Approach | Pros | Cons |
|----------|------|------|
| **JSON Schema** + AJV | Industry standard, IDE autocomplete support, separate schema files | Verbose, runtime-only validation |
| **Zod** | TypeScript-first, compile-time types, better error messages, composable | Requires TypeScript, learning curve |
| **Both** | Best of both worlds (Zod for TS, JSON Schema for docs) | Maintenance overhead (two schemas) |

**Decision**: Use **Zod** as primary validation with JSON Schema for documentation.

**Implementation**:

```typescript
import { z } from 'zod';

const E2ERunConfigSchema = z.object({
  env_profile: z.string().regex(/^[a-z0-9-]+$/, {
    message: 'env_profile must be lowercase alphanumeric with hyphens',
  }),
  baseURL: z.string().url({ message: 'baseURL must be a valid HTTP/HTTPS URL' }),
  projects: z.array(z.object({
    name: z.string(),
    use: z.record(z.any()).optional(),
  })).optional(),
  credentials_ref: z.string().optional(),
  retries: z.number().int().min(0).max(5).default(0),
  workers: z.number().int().min(1).optional(),
  timeout: z.number().int().min(1000).default(30000),
  report_output_dir: z.string().min(1),
  testMatch: z.string().default('scenarios/**/*.spec.ts'),
});

type E2ERunConfig = z.infer<typeof E2ERunConfigSchema>;

// Usage
function validateConfig(configData: unknown): E2ERunConfig {
  try {
    return E2ERunConfigSchema.parse(configData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.errors.map(e =>
        `${e.path.join('.')}: ${e.message}`
      ).join('\n');
      throw new Error(`Configuration validation failed:\n${formatted}`);
    }
    throw error;
  }
}
```

**Rationale**:
- Zod provides excellent TypeScript integration and type inference
- Clear, user-friendly error messages
- Composable schemas (can reuse for CredentialsFile)
- JSON Schema files in `contracts/` for reference documentation

**Alternatives Considered**:
- ❌ **JSON Schema + AJV**: Less TypeScript-friendly, verbose schemas
- ❌ **Manual validation**: Error-prone, no type safety

**References**:
- https://zod.dev/
- https://json-schema.org/

---

### 3. Credentials Injection Mechanism

**Question**: How to securely inject credentials into Playwright test environment?

**Research Summary**:

Playwright supports multiple credential injection methods:

1. **Environment variables** (recommended):
   ```typescript
   // In e2e-runner
   process.env.TEST_USERNAME = credentials.users[0].username;
   process.env.TEST_PASSWORD = credentials.users[0].password;

   // In test file
   const username = process.env.TEST_USERNAME;
   const password = process.env.TEST_PASSWORD;
   ```

2. **Playwright global setup**:
   ```typescript
   // global-setup.ts
   export default async function globalSetup() {
     const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));
     process.env.credentials = JSON.stringify(credentials);
   }
   ```

3. **Storage state (auth persistence)**:
   ```typescript
   // Pre-authenticate and save state
   await page.context().storageState({ path: 'auth.json' });

   // In config
   use: {
     storageState: 'auth.json',
   }
   ```

**Decision**: Use **environment variables** with structured naming convention.

**Implementation**:

```typescript
// credentials-loader.ts
interface CredentialsFile {
  env_profile: string;
  users?: Array<{
    role: string;
    username: string;
    password: string;
  }>;
  api_keys?: Array<{
    service: string;
    api_key: string;
    api_secret?: string;
  }>;
}

function injectCredentials(credentialsFile: CredentialsFile): void {
  // User credentials
  credentialsFile.users?.forEach((user, index) => {
    process.env[`E2E_USER_${user.role.toUpperCase()}_USERNAME`] = user.username;
    process.env[`E2E_USER_${user.role.toUpperCase()}_PASSWORD`] = user.password;
  });

  // API keys
  credentialsFile.api_keys?.forEach((key) => {
    process.env[`E2E_API_${key.service.toUpperCase()}_KEY`] = key.api_key;
    if (key.api_secret) {
      process.env[`E2E_API_${key.service.toUpperCase()}_SECRET`] = key.api_secret;
    }
  });
}

// In test files (auto-generated by e2e-test-generator)
const username = process.env.E2E_USER_ADMIN_USERNAME!;
const password = process.env.E2E_USER_ADMIN_PASSWORD!;
```

**Rationale**:
- Simple, widely supported pattern
- No Playwright-specific dependencies
- Works across all test frameworks
- Clear naming convention (`E2E_USER_<ROLE>_USERNAME`)

**Alternatives Considered**:
- ❌ **Global setup**: Complex, requires additional file
- ❌ **Storage state**: Only works for browser auth, not API keys

**Security Considerations**:
- File permissions check (warn if credentials file > 0600)
- Validate env_profile match between config and credentials
- Clear env vars after test execution

**References**:
- https://playwright.dev/docs/test-parameterize#passing-environment-variables

---

### 4. Report Directory Uniqueness Enforcement

**Question**: How to ensure report_output_dir is unique to prevent overwriting previous reports?

**Research Summary**:

**Option 1: Pre-flight check** (fail if exists):
```typescript
if (fs.existsSync(config.report_output_dir)) {
  throw new Error(`Report directory already exists: ${config.report_output_dir}`);
}
```

**Option 2: Auto-append timestamp** (modify user's config):
```typescript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
config.report_output_dir = `${config.report_output_dir}-${timestamp}`;
```

**Option 3: --force flag** (overwrite with user consent):
```typescript
if (fs.existsSync(config.report_output_dir) && !options.force) {
  throw new Error(`Report directory exists. Use --force to overwrite.`);
}
```

**Decision**: Use **Option 1 (pre-flight check)** as default with **Option 3 (--force flag)** as fallback.

**Implementation**:

```typescript
function validateReportDirectory(reportDir: string, force: boolean): void {
  if (fs.existsSync(reportDir)) {
    if (force) {
      console.warn(`⚠️  Overwriting existing report directory: ${reportDir}`);
      fs.rmSync(reportDir, { recursive: true });
    } else {
      throw new Error(
        `Report directory already exists: ${reportDir}\n` +
        `Use --force to overwrite, or specify a unique directory name.\n` +
        `Suggested format: ./reports/run-$(date +%Y-%m-%d-%H-%M-%S)`
      );
    }
  }
}
```

**Rationale**:
- Prevents accidental report loss (default behavior)
- Provides clear error message with suggested fix
- Allows intentional overwrite with explicit flag
- User controls directory naming (no magic behavior)

**Alternatives Considered**:
- ❌ **Auto-timestamp**: Violates user's specified config, unexpected behavior
- ❌ **Always overwrite**: Risk of data loss

**Best Practice Recommendation** (in quickstart.md):
```bash
# Recommended report directory format
TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
jq --arg dir "./reports/run-$TIMESTAMP" '.report_output_dir = $dir' config.json > tmp.json
/e2e-runner run --config tmp.json
```

---

### 5. Cross-Platform Compatibility (Windows/macOS/Linux)

**Question**: How to ensure e2e-runner works consistently across all platforms?

**Research Summary**:

**Key Platform Differences**:

| Platform | Path Separator | Shell | Playwright Browser Install |
|----------|----------------|-------|----------------------------|
| Windows  | `\` (also accepts `/`) | cmd.exe, PowerShell | `npx playwright install` |
| macOS    | `/` | bash, zsh | `npx playwright install` |
| Linux    | `/` | bash | `npx playwright install --with-deps` |

**Decision**: Use Node.js `path` module for all path operations, avoid shell-specific commands.

**Implementation**:

```typescript
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

// ✅ Cross-platform path handling
const configPath = path.resolve(process.cwd(), 'configs', 'saas-staging.json');
const reportDir = path.join(config.report_output_dir, 'html');

// ✅ Cross-platform command execution
function runPlaywright(configFile: string): Promise<void> {
  const isWindows = process.platform === 'win32';
  const npxCommand = isWindows ? 'npx.cmd' : 'npx';

  const proc = spawn(npxCommand, [
    'playwright',
    'test',
    '--config',
    configFile,
  ], {
    stdio: 'inherit', // Show Playwright output in real-time
    shell: isWindows, // Required for Windows .cmd files
  });

  return new Promise((resolve, reject) => {
    proc.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`Exit code: ${code}`));
    });
  });
}

// ✅ Cross-platform file permissions check
async function checkCredentialsPermissions(filePath: string): Promise<void> {
  if (process.platform === 'win32') {
    // Windows doesn't use Unix permissions, skip check
    return;
  }

  const stats = await fs.stat(filePath);
  const mode = stats.mode & 0o777;
  if (mode > 0o600) {
    console.warn(
      `⚠️  WARNING: Credentials file has loose permissions (${mode.toString(8)}).\n` +
      `   Recommended: chmod 600 ${filePath}`
    );
  }
}
```

**Rationale**:
- `path` module handles platform differences automatically
- `spawn` with `shell: isWindows` supports .cmd files on Windows
- Permission checks skipped on Windows (not applicable)
- No shell-specific scripts (bash/PowerShell)

**Testing Strategy**:
- CI matrix: Ubuntu, macOS, Windows Server
- Test all commands on each platform
- Validate path resolution edge cases (UNC paths on Windows)

**References**:
- https://nodejs.org/api/path.html
- https://nodejs.org/api/child_process.html#child_processspawncommand-args-options

---

### 6. CI/CD Integration Best Practices

**Question**: How should e2e-runner be used in CI/CD pipelines?

**Research Summary**:

**Common CI/CD Requirements**:
1. Install Playwright browsers in CI environment
2. Store credentials securely (secrets management)
3. Upload test reports as artifacts
4. Fail build on test failures

**Decision**: Provide CI/CD templates and documentation, do NOT build CI-specific features into e2e-runner.

**GitHub Actions Example** (to be included in quickstart.md):

```yaml
name: E2E Tests

on: [push, pull_request]

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
          chmod 600 credentials/saas-staging.json

      - name: Run E2E tests
        run: |
          /e2e-runner run --config configs/saas-staging.json

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: ./reports/
          retention-days: 30
```

**GitLab CI Example**:

```yaml
e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - npm ci
    - echo "$STAGING_CREDENTIALS" > credentials/saas-staging.json
    - /e2e-runner run --config configs/saas-staging.json
  artifacts:
    when: always
    paths:
      - ./reports/
    expire_in: 30 days
```

**Rationale**:
- CI/CD integration is pipeline-specific, not skill-specific
- e2e-runner remains platform-agnostic
- Users have full control over their pipeline configuration
- Examples cover 80% use cases

**Out of Scope**:
- ❌ Built-in secrets management
- ❌ CI-specific commands (`/e2e-runner ci`)
- ❌ Automatic artifact upload

**References**:
- https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts
- https://docs.gitlab.com/ee/ci/pipelines/job_artifacts.html

---

## Technology Choices Summary

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Language** | TypeScript 5.x | Type safety, Playwright native support |
| **Runtime** | Node.js 18+ | Cross-platform, async/await, fs/promises |
| **Test Runner** | Playwright Test (npx) | Mature, feature-rich, well-documented |
| **Validation** | Zod | TypeScript-first, excellent DX, composable |
| **Config Format** | JSON | Simple, widely supported, IDE-friendly |
| **CLI Framework** | Native Node.js | No dependency bloat, simple to debug |
| **Output Formatting** | Chalk (optional) | Better UX, color-coded messages |

---

## Implementation Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| **Playwright version incompatibility** | Document minimum version (>= 1.40), check at runtime |
| **Credentials leak to Git** | Pre-flight check for .gitignore, file permission warnings |
| **Report overwrite** | Pre-flight directory existence check, --force flag |
| **Cross-platform path issues** | Use Node.js `path` module exclusively |
| **Test execution timeout** | Configurable timeout, clear error messages |
| **Config validation failures** | Zod provides detailed error messages with field paths |

---

## Open Questions Resolved

### Q: Should we support YAML config files in addition to JSON?

**Answer**: No, JSON only.

**Reasoning**:
- JSON is more widely supported (no parser dependency)
- Simpler to validate (JSON Schema, Zod)
- Consistent with Playwright's native config format
- Users can convert YAML → JSON if needed

### Q: Should we auto-detect the test framework (Playwright vs Jest)?

**Answer**: No, Playwright only.

**Reasoning**:
- Spec explicitly states Playwright as the target framework
- Adding multi-framework support significantly increases complexity
- Jest E2E tests have different configuration patterns
- T002-e2e-test-generator only generates Playwright scripts

### Q: Should we provide a TUI (Terminal UI) for configuration?

**Answer**: No, file-based configuration only.

**Reasoning**:
- CLI tool should be scriptable and CI/CD-friendly
- TUI adds dependency (ink, blessed) and complexity
- Configuration files are more auditable and version-controlled
- Quickstart guide provides templates and examples

---

## Next Steps (Phase 1)

With all research complete, proceed to Phase 1 design:

1. **Enhance data-model.md**: Add Zod schema definitions, validation rules
2. **Generate contracts/**: Create JSON Schema files for IDE support
3. **Update agent context**: Add TypeScript, Zod, Playwright to tech stack
4. **Re-validate Constitution Check**: Ensure all decisions align with principles

---

## References

- [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright Reporters](https://playwright.dev/docs/test-reporters)
- [Zod Documentation](https://zod.dev/)
- [Node.js Path Module](https://nodejs.org/api/path.html)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-30
**Status**: Research Complete ✅
