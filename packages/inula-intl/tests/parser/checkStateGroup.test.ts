/*
 * Copyright (c) Huawei Technologies Co., Ltd. 2023-2023. All rights reserved.
 */
import { checkStateGroup } from '../../src/parser/parseMappingRule';

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
