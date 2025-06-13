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
import { checkStateGroup } from '../../src/intl/parser/parseMappingRule';

describe('checkStateGroup function', () => {
  it('should throw an error if state is missing', () => {
    const group = { push: 'missingState' };
    const name = 'currentName';
    const map = { existingState: {} };

    expect(() => {
      checkStateGroup(group, name, map);
    }).toThrowError('The state is missing.');
  });

  it('should throw an error if pop is not 1', () => {
    const group = { pop: '2' };
    const name = 'currentName';
    const map = { existingState: {} };

    expect(() => {
      checkStateGroup(group, name, map);
    }).toThrowError('The value of pop must be 1.');
  });

  it('should not throw an error if state and pop are valid', () => {
    const group = { push: 'existingState', pop: '1' };
    const name = 'currentName';
    const map = { existingState: {} };

    expect(() => {
      checkStateGroup(group, name, map);
    }).not.toThrow();
  });
});
