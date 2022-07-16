module.exports = {
  coverageDirectory: 'coverage',
  resetModules: true,

  rootDir: process.cwd(),

  setupFiles: [require.resolve('./scripts/__tests__/jest/jestEnvironment.js')],

  setupFilesAfterEnv: [require.resolve('./scripts/__tests__/jest/jestSetting.js')],

  testEnvironment: 'jest-environment-jsdom-sixteen',

  testMatch: [
    '<rootDir>/scripts/__tests__/**/*.test.js',
    '<rootDir>/scripts/__tests__/**/*.test.tsx'
  ],

  timers: 'fake',
};
