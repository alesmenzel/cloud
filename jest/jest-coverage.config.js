/* eslint-disable @typescript-eslint/no-var-requires */
const jestConfig = require('./jest.config.js');

module.exports = {
  ...jestConfig,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
