/*
 * Copyright (c) 2020 Huawei Technologies Co.,Ltd.
 *
 * InulaJS is licensed under Mulan PSL v2.
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

import * as Inula from '../../../libs/inula/index';
import { getLogUtils } from '../jest/testUtils';

describe('Component Error Test', () => {
  const LogUtils = getLogUtils();
  it('createElement不能为null或undefined', () => {
    const NullElement = null;
    const UndefinedElement = undefined;

    jest.spyOn(console, 'error').mockImplementation();
    expect(() => {
      Inula.render(<NullElement />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: null');

    expect(() => {
      Inula.render(<UndefinedElement />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: undefined');

    const App = () => {
      return <AppChild />;
    };

    let AppChild = () => {
      return (
        <NullElement />
      );
    };

    expect(() => {
      Inula.render(<App />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: null');

    AppChild = () => {
      return (
        <UndefinedElement />
      );
    };

    expect(() => {
      Inula.render(<App />, document.createElement('div'));
    }).toThrow('Component type is invalid, got: undefined');
  });
});
