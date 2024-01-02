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

import * as Inula from '../../../src/index';
import { Text } from '../jest/commonComponents';
import { getLogUtils } from '../jest/testUtils';

describe('SuspenseComponent Test', () => {
  const LogUtils = getLogUtils();
  const mockImport = jest.fn(async component => {
    return { default: component };
  });

  it('挂载lazy组件', async () => {
    // 用同步的代码来实现异步操作
    class LazyComponent extends Inula.Component {
      render() {
        return <Text text={this.props.num} />;
      }
    }

    const Lazy = Inula.lazy(() => mockImport(LazyComponent));

    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy num={5} />
      </Inula.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading...']);
    expect(container.textContent).toBe('Loading...');

    await Promise.resolve();
    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy num={5} />
      </Inula.Suspense>,
      container
    );
    expect(LogUtils.getAndClear()).toEqual([5]);
    expect(container.querySelector('p').innerHTML).toBe('5');
  });

  it('suspense fallback can be updated', async () => {
    const Lazy = Inula.lazy(() => {
      // wait for 3s
      return new Promise(resolve => setTimeout(resolve({ default: 'text' }), 3000));
    });

    let updateFallback;
    function Fallback() {
      const [show, setShow] = Inula.useState(true);
      updateFallback = () => setShow(!show);
      return <h1>fallback:{show ? 'show' : 'hide'}</h1>;
    }
    const container = document.createElement('div');
    Inula.render(
      <Inula.Suspense fallback={<Fallback />}>
        <Lazy />
      </Inula.Suspense>,
      container
    );
    expect(container.querySelector('h1').innerHTML).toBe('fallback:show');
    updateFallback();
    expect(container.querySelector('h1').innerHTML).toBe('fallback:hide');
  });
});
