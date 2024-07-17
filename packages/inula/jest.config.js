/*
 * Copyright (c) 2023 Huawei Technologies Co.,Ltd.
 *
 * openInula is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *
 *          http://license.coscl.org.cn/MulanPSL2
 *
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

module.exports = {
  coverageDirectory: 'coverage',
  resetModules: true,

  rootDir: process.cwd(),

  setupFiles: [require.resolve('./tests/jest/jestEnvironment.js')],

  setupFilesAfterEnv: [require.resolve('./tests/jest/jestSetting.js')],

  testEnvironment: 'jest-environment-jsdom',

  testMatch: [
    // '<rootDir>/tests/InulaXTest/edgeCases/deepVariableObserver.test.tsx',
    // '<rootDir>/tests/InulaXTest/StateManager/StateMap.test.tsx',
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.test.tsx',
  ],

  fakeTimers: { enableGlobally: true },
};
