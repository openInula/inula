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

  setupFiles: [require.resolve('./__tests__/jest/jestEnvironment.js')],

  setupFilesAfterEnv: [require.resolve('./__tests__/jest/jestSetting.js')],

  testEnvironment: 'jest-environment-jsdom',

  testMatch: [
    // '<rootDir>/scripts/__tests__/InulaXTest/edgeCases/deepVariableObserver.test.tsx',
    // '<rootDir>/scripts/__tests__/InulaXTest/StateManager/StateMap.test.tsx',
    '<rootDir>/__tests__/**/*.test.js',
    '<rootDir>/__tests__/**/*.test.tsx',
  ],

  fakeTimers: { enableGlobally: true },
};
