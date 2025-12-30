/**
 * @spec T006-e2e-report-configurator
 * Documentation generator for CI/CD integration
 */

import { writeFileContent } from './file-utils'
import { join } from 'path'

/**
 * Documentation options
 */
export interface DocsOptions {
  /** Output directory for generated docs */
  outputDir?: string
  /** Reporter formats configured */
  formats?: string[]
  /** Output directory for reports */
  reportDir?: string
}

/**
 * Generates GitHub Actions workflow documentation
 *
 * @param options - Documentation options
 * @returns GitHub Actions workflow YAML
 */
export function generateGitHubActionsDoc(options: DocsOptions = {}): string {
  const { formats = ['html'], reportDir = 'reports/e2e' } = options

  const hasJUnit = formats.includes('junit')

  return `
# GitHub Actions - Playwright E2E Tests

This workflow runs Playwright tests and uploads test reports as artifacts.

\`\`\`yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

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
          path: ${reportDir}/
          retention-days: 30
${
  hasJUnit
    ? `
      - name: Publish test results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Playwright Tests
          path: ${reportDir}/junit/results.xml
          reporter: java-junit
`
    : ''
}
      - name: Deploy HTML report to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        if: always()
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ${reportDir}/html
          destination_dir: test-reports/\${{ github.run_number }}
\`\`\`

## Key Features

- ✅ Runs on push and pull requests
- ✅ Uploads test reports as artifacts (30 days retention)
${hasJUnit ? '- ✅ Publishes JUnit test results\n' : ''}- ✅ Deploys HTML report to GitHub Pages
- ✅ Timeout protection (60 minutes)
- ✅ npm cache for faster builds

## Configuration

1. **Enable GitHub Pages**:
   - Go to repository Settings > Pages
   - Source: GitHub Actions

2. **View Reports**:
   - HTML Report: \`https://<username>.github.io/<repo>/test-reports/<run-number>\`
   - Artifacts: Actions tab > Workflow run > Artifacts section
`
}

/**
 * Generates GitLab CI pipeline documentation
 *
 * @param options - Documentation options
 * @returns GitLab CI pipeline YAML
 */
export function generateGitLabCIDoc(options: DocsOptions = {}): string {
  const { formats = ['html'], reportDir = 'reports/e2e' } = options

  const hasJUnit = formats.includes('junit')

  return `
# GitLab CI - Playwright E2E Tests

This pipeline runs Playwright tests and uploads test reports.

\`\`\`yaml
# .gitlab-ci.yml

stages:
  - test

e2e-tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.57.0-jammy

  before_script:
    - npm ci

  script:
    - npx playwright test

  artifacts:
    when: always
    paths:
      - ${reportDir}/
    expire_in: 30 days
${
  hasJUnit
    ? `    reports:
      junit: ${reportDir}/junit/results.xml
`
    : ''
}
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
\`\`\`

## Key Features

- ✅ Uses official Playwright Docker image
- ✅ Uploads test reports as artifacts (30 days)
${hasJUnit ? '- ✅ Native JUnit test reports integration\n' : ''}- ✅ Runs on merge requests and default branch
- ✅ npm cache for faster builds

## Viewing Reports

1. **HTML Report**:
   - Go to CI/CD > Jobs > Select job
   - Browse artifacts > ${reportDir}/html/index.html

2. **JUnit Report** (if enabled):
   - Merge Request > Overview > Test summary
   - Shows pass/fail statistics

## Pages Deployment (Optional)

\`\`\`yaml
pages:
  stage: deploy
  dependencies:
    - e2e-tests
  script:
    - mkdir -p public
    - cp -r ${reportDir}/html/* public/
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
\`\`\`

Access at: \`https://<username>.gitlab.io/<project>\`
`
}

/**
 * Generates Jenkins pipeline documentation
 *
 * @param options - Documentation options
 * @returns Jenkins pipeline Groovy script
 */
export function generateJenkinsDoc(options: DocsOptions = {}): string {
  const { formats = ['html'], reportDir = 'reports/e2e' } = options

  const hasJUnit = formats.includes('junit')

  return `
# Jenkins - Playwright E2E Tests

This pipeline runs Playwright tests and publishes HTML reports.

\`\`\`groovy
// Jenkinsfile

pipeline {
  agent {
    docker {
      image 'mcr.microsoft.com/playwright:v1.57.0-jammy'
      args '-u root'
    }
  }

  stages {
    stage('Install Dependencies') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Run E2E Tests') {
      steps {
        sh 'npx playwright test'
      }
    }
  }

  post {
    always {
      // Publish HTML report
      publishHTML([
        allowMissing: false,
        alwaysLinkToLastBuild: true,
        keepAll: true,
        reportDir: '${reportDir}/html',
        reportFiles: 'index.html',
        reportName: 'Playwright Test Report'
      ])
${
  hasJUnit
    ? `
      // Publish JUnit test results
      junit '${reportDir}/junit/results.xml'
`
    : ''
}
      // Archive test artifacts
      archiveArtifacts artifacts: '${reportDir}/**/*', allowEmptyArchive: true
    }
  }
}
\`\`\`

## Key Features

- ✅ Uses official Playwright Docker image
- ✅ Publishes HTML report (accessible via Jenkins UI)
${hasJUnit ? '- ✅ JUnit test result visualization\n' : ''}- ✅ Archives all test artifacts
- ✅ npm cache for faster builds

## Required Plugins

Install these Jenkins plugins:
- **HTML Publisher Plugin**: For HTML report visualization
${hasJUnit ? '- **JUnit Plugin**: For test result charts\n' : ''}- **Docker Pipeline Plugin**: For Docker agent support

## Viewing Reports

1. **HTML Report**:
   - Build page > Playwright Test Report (left sidebar)

${
  hasJUnit
    ? `2. **JUnit Results**:
   - Build page > Test Result (left sidebar)
   - Shows trend graph and test details

`
    : ''
}## Configuration Notes

- HTML report served with CSP relaxed (required for Playwright reports)
- Artifacts retained for all builds
- Failed tests highlighted in JUnit view
`
}

/**
 * Generates complete CI/CD documentation file
 *
 * Combines all CI/CD platform examples into a single markdown file
 *
 * @param options - Documentation options
 * @returns Complete documentation markdown
 */
export function generateCICDDocs(options: DocsOptions = {}): string {
  const { formats = ['html'], reportDir = 'reports/e2e' } = options

  const docs = `# E2E Test Reports - CI/CD Integration

This guide provides configuration examples for running Playwright E2E tests and publishing reports in various CI/CD platforms.

## Current Configuration

- **Reporter formats**: ${formats.join(', ')}
- **Report directory**: \`${reportDir}/\`

## Supported Platforms

${generateGitHubActionsDoc(options)}

---

${generateGitLabCIDoc(options)}

---

${generateJenkinsDoc(options)}

---

## General Best Practices

### 1. Artifact Retention

- Keep reports for 30 days minimum
- Archive failed test artifacts longer for debugging
- Consider storage costs for large trace files

### 2. Performance Optimization

- Use \`npm ci\` instead of \`npm install\` for faster, reliable installs
- Cache node_modules between runs
- Run tests in parallel when possible

### 3. Failure Handling

- Always upload reports even on test failure (\`if: always()\`)
- Configure retry logic for flaky tests in \`playwright.config.ts\`
- Set reasonable timeouts (60 minutes recommended)

### 4. Security

- Never commit secrets to \`playwright.config.ts\`
- Use environment variables for sensitive data
- Restrict artifact access in private repositories

### 5. Report Access

- Deploy HTML reports to static hosting for easy sharing
- Use unique URLs (run number, commit SHA) to avoid overwriting
- Consider authentication for sensitive test results

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail in CI but pass locally | Check Playwright browser version match |
| Reports not uploaded | Verify artifact path matches report directory |
| HTML report blank in CI | Check CSP headers (Jenkins) or MIME types |
| Out of storage | Reduce artifact retention or disable video recording |

## Next Steps

1. Copy the configuration for your CI/CD platform
2. Customize paths and retention periods
3. Add to your repository (\`.github/workflows/\`, \`.gitlab-ci.yml\`, or \`Jenkinsfile\`)
4. Trigger a test run to verify setup
5. Bookmark report URLs for easy access

---

**Generated by**: E2E Report Configurator
**Last Updated**: ${new Date().toISOString().split('T')[0]}
`

  return docs
}

/**
 * Writes CI/CD documentation to file
 *
 * @param options - Documentation options
 * @param outputPath - Output file path (default: 'docs/e2e-reports.md')
 * @returns Path to generated documentation
 *
 * @example
 * ```ts
 * const docPath = await writeCICDDocs({
 *   formats: ['html', 'json', 'junit'],
 *   reportDir: 'reports/e2e'
 * })
 * console.log(`Documentation written to ${docPath}`)
 * ```
 */
export async function writeCICDDocs(
  options: DocsOptions = {},
  outputPath: string = 'docs/e2e-reports.md'
): Promise<string> {
  const content = generateCICDDocs(options)
  await writeFileContent(outputPath, content)
  return outputPath
}
