module.exports = {
  rootDir: '../',
  clearMocks: true,
  errorOnDeprecated: true,
  testEnvironment: 'jsdom',
  testMatch: ['<rootDir>/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/coverage/'],
};
