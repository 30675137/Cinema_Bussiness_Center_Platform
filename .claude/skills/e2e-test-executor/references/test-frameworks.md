# Test Frameworks Selection Guide

## Framework Selection Matrix

| Test Type | Technology | Recommended Framework | Reason |
|-----------|-----------|----------------------|--------|
| Backend API | Spring Boot | REST Assured (Java) | Native Java integration, type safety |
| Backend API | Node.js/Express | Jest + Supertest | TypeScript support, fast execution |
| Frontend B端 | React + Ant Design | Playwright | Cross-browser, visual testing |
| Frontend C端 | Taro (微信小程序) | Playwright (H5模式) | Can test H5 version |
| Database | PostgreSQL/Supabase | Direct SQL via client | Fastest, most reliable |
| BOM Inventory | P003/P004 APIs | Jest + Supertest | API calls, easy integration |

## Playwright Configuration

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

## Jest Configuration

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
```

## REST Assured Configuration (Java)

```java
RestAssured.baseURI = "http://localhost:8080";
RestAssured.enableLoggingOfRequestAndResponseIfValidationFails();
```
