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

import * as Inula from '../../src/index';
import { Text } from '../jest/commonComponents';
import { getLogUtils } from '../jest/testUtils';

describe('SuspenseComponent Test', () => {
  const LogUtils = getLogUtils();
  const mockImport = jest.fn(async component => {
    return { default: component };
  });

  it('挂载lazy组件', async () => {
    // 用同步的代码来实现异步操作
    const LazyComponent = props => {
      return <Text text={props.num} />;
    };

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

  it('Suspense组件被卸载后lazy组件才完成加载不应该报错', async () => {
    // 创建一个延迟的mock import，模拟异步加载
    let resolvePromise;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    const delayedMockImport = jest.fn(() => delayedPromise);

    const LazyComponent = props => {
      return <Text text={props.num} />;
    };

    const Lazy = Inula.lazy(() => delayedMockImport().then(() => ({ default: LazyComponent })));

    // 渲染Suspense组件
    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy num={10} />
      </Inula.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading...']);
    expect(container.textContent).toBe('Loading...');

    // 在lazy组件完成加载之前卸载Suspense组件
    Inula.render(null, container);
    expect(container.textContent).toBe('');

    // 现在让lazy组件的promise完成
    resolvePromise();

    // 等待promise完成，不应该抛出错误
    await delayedPromise;

    // 验证容器仍然是空的，没有重新渲染
    expect(container.textContent).toBe('');

    // 验证没有错误日志
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('Suspense组件被卸载后lazy组件加载失败不应该报错', async () => {
    // 创建一个会失败的延迟mock import
    let rejectPromise;
    const failedPromise = new Promise((resolve, reject) => {
      rejectPromise = reject;
    });

    const failedMockImport = jest.fn(() => failedPromise);

    const LazyComponent = props => {
      return <Text text={props.num} />;
    };

    const Lazy = Inula.lazy(() => failedMockImport().then(() => ({ default: LazyComponent })));

    // 渲染Suspense组件
    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy num={15} />
      </Inula.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading...']);
    expect(container.textContent).toBe('Loading...');

    // 在lazy组件完成加载之前卸载Suspense组件
    Inula.render(null, container);
    expect(container.textContent).toBe('');

    // 现在让lazy组件的promise失败
    const error = new Error('Failed to load component');
    rejectPromise(error);

    // 等待promise失败，不应该抛出错误
    try {
      await failedPromise;
    } catch (e) {
      // 预期的错误，但不会影响已卸载的组件
    }

    // 验证容器仍然是空的，没有重新渲染
    expect(container.textContent).toBe('');

    // 验证没有错误日志
    expect(LogUtils.getAndClear()).toEqual([]);
  });

  it('多个Suspense组件中卸载一个后，其他组件正常加载', async () => {
    // 创建两个延迟的mock import
    let resolvePromise1, resolvePromise2;
    const delayedPromise1 = new Promise(resolve => {
      resolvePromise1 = resolve;
    });
    const delayedPromise2 = new Promise(resolve => {
      resolvePromise2 = resolve;
    });

    const delayedMockImport1 = jest.fn(() => delayedPromise1);
    const delayedMockImport2 = jest.fn(() => delayedPromise2);

    const LazyComponent1 = () => {
      return <Text text="Component1" />;
    };

    const LazyComponent2 = () => {
      return <Text text="Component2" />;
    };

    const Lazy1 = Inula.lazy(() => delayedMockImport1().then(() => ({ default: LazyComponent1 })));
    const Lazy2 = Inula.lazy(() => delayedMockImport2().then(() => ({ default: LazyComponent2 })));

    // 渲染两个Suspense组件
    Inula.render(
      <div>
        <Inula.Suspense fallback={<Text text="Loading1..." />}>
          <Lazy1 />
        </Inula.Suspense>
        <Inula.Suspense fallback={<Text text="Loading2..." />}>
          <Lazy2 />
        </Inula.Suspense>
      </div>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading1...', 'Loading2...']);
    expect(container.textContent).toBe('Loading1...Loading2...');

    // 卸载第一个Suspense组件
    Inula.render(
      <div>
        <Inula.Suspense fallback={<Text text="Loading2..." />}>
          <Lazy2 />
        </Inula.Suspense>
      </div>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading2...']);
    expect(container.textContent).toBe('Loading2...');

    // 让第一个组件的promise完成（已卸载，不应该影响）
    resolvePromise1();
    await delayedPromise1;

    // 验证容器内容没有变化
    expect(container.textContent).toBe('Loading2...');
    expect(LogUtils.getAndClear()).toEqual([]);

    // 让第二个组件的promise完成
    resolvePromise2();
    await delayedPromise2;

    // 等待一个微任务队列，让组件更新
    await Promise.resolve();

    // 重新渲染以触发更新
    Inula.render(
      <div>
        <Inula.Suspense fallback={<Text text="Loading2..." />}>
          <Lazy2 />
        </Inula.Suspense>
      </div>,
      container
    );

    // 验证第二个组件正常加载
    expect(LogUtils.getAndClear()).toEqual(['Component2']);
    expect(container.textContent).toBe('Component2');
  });
});
