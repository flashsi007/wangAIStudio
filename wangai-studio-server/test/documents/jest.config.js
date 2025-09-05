module.exports = {
  displayName: 'Documents Module Tests',
  testMatch: ['<rootDir>/test/documents/**/*.spec.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../..',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/documents/**/*.(t|j)s',
    '!src/documents/**/*.spec.ts',
    '!src/documents/**/*.e2e-spec.ts',
  ],
  coverageDirectory: 'coverage/documents',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/test/documents/setup.ts'],
  testTimeout: 30000,
  moduleNameMapping: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
};