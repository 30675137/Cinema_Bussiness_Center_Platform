module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/e2e'],
  testMatch: ['**/tests/e2e/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    'tests/e2e/**/*.ts',
    '!tests/e2e/**/*.test.ts',
  ],
};
