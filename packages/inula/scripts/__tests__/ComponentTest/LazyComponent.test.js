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
import { Text } from '../jest/commonComponents';
import { getLogUtils } from '../jest/testUtils';

describe('LazyComponent Test', () => {
  const LogUtils = getLogUtils();
  const mockImport = jest.fn(async (component) => {
    return { default: component };
  });

  it('Inula.lazy()', async () => {
    class LazyComponent extends Inula.Component {
      static defaultProps = { language: 'Java' };

      render() {
        const text = `${this.props.greeting}: ${this.props.language}`;
        return <span>{text}</span>;
      }
    }

    const Lazy = Inula.lazy(() => mockImport(LazyComponent));

    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy greeting="Hi" />
      </Inula.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Loading...']);
    expect(container.textContent).toBe('Loading...');
    expect(container.querySelector('span')).toBe(null);

    await Promise.resolve();
    Inula.render(
      <Inula.Suspense fallback={<Text text="Loading..." />}>
        <Lazy greeting="Goodbye" />
      </Inula.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual([]);
    expect(container.querySelector('span').innerHTML).toBe('Goodbye: Java');
  });

  it('同步解析', async () => {
    const LazyApp = Inula.lazy(() => ({
      then(cb) {
        cb({ default: Text });
      },
    }));

    Inula.render(
      <Inula.Suspense fallback={<div>Loading...</div>}>
        <LazyApp text="Lazy" />
      </Inula.Suspense>,
      container
    );

    expect(LogUtils.getAndClear()).toEqual(['Lazy']);
    expect(container.textContent).toBe('Lazy');
  });

  it('异常捕获边界', async () => {
    class ErrorBoundary extends Inula.Component {
      state = {};
      static getDerivedStateFromError(error) {
        return { message: error.message };
      }
      render() {
        return this.state.message
          ? <h2>Error: {this.state.message}</h2>
          : this.props.children;
      }
    }

    const LazyComponent = () => {
      const [num, setNum] = Inula.useState(0);
      if (num === 2) {
        throw new Error('num is 2');
      } else {
        return (
          <>
            <p id="p">{num}</p>
            <button onClick={() => setNum(num + 1)} />
          </>
        );
      }
    };

    const LazyApp = Inula.lazy(() => mockImport(LazyComponent));

    Inula.render(
      <ErrorBoundary>
        <Inula.Suspense fallback={<div>Loading...</div>}>
          <LazyApp />
        </Inula.Suspense>
      </ErrorBoundary>,
      container
    );
    expect(container.textContent).toBe('Loading...');

    await Promise.resolve();
    Inula.render(
      <ErrorBoundary>
        <Inula.Suspense fallback={<Text text="Loading..." />}>
          <LazyApp />
        </Inula.Suspense>
      </ErrorBoundary>,
      container
    );
    expect(container.textContent).toBe('0');
    container.querySelector('button').click();
    expect(container.textContent).toBe('1');
    jest.spyOn(console, 'error').mockImplementation();
    container.querySelector('button').click();
    expect(container.textContent).toBe('Error: num is 2');
  });

  it('componentDidCatch捕获异常', async () => {
    class ErrorBoundary extends Inula.Component {
      state = {
        catchError: false,
        error: null,
        componentStack: null
      };
      componentDidCatch(error, info) {
        if(error){
          this.setState({
            catchError: true,
            error,
            componentStack: info.componentStack
          });
        }

      }
      render() {
        return this.state.catchError
          ? <h2>Error: {this.state.error.message}</h2>
          : this.props.children;
      }
    }

    const LazyComponent = () => {
      const [num, setNum] = Inula.useState(0);
      if (num === 2) {
        throw new Error('num is 2');
      } else {
        return (
          <>
            <p id="p">{num}</p>
            <button onClick={() => setNum(num + 1)} />
          </>
        );
      }
    };

    const LazyApp = Inula.lazy(() => mockImport(LazyComponent));

    Inula.render(
      <ErrorBoundary>
        <Inula.Suspense fallback={<div>Loading...</div>}>
          <LazyApp />
        </Inula.Suspense>
      </ErrorBoundary>,
      container
    );
    expect(container.textContent).toBe('Loading...');

    await Promise.resolve();
    Inula.render(
      <ErrorBoundary>
        <Inula.Suspense fallback={<Text text="Loading..." />}>
          <LazyApp />
        </Inula.Suspense>
      </ErrorBoundary>,
      container
    );

    expect(container.textContent).toBe('0');
    container.querySelector('button').click();
    expect(container.textContent).toBe('1');
    jest.spyOn(console, 'error').mockImplementation();
    container.querySelector('button').click();
    expect(container.textContent).toBe('Error: num is 2');
  });

  it('#24 配合memo', async () => {
    const fnComp = () => {
      return <h1>inula</h1>;
    };
    const LazyApp = Inula.lazy(() => ({
      then(cb) {
        cb({ default: Inula.memo(() => fnComp, false) });
      },
    }));
    expect(() => {
      Inula.render(
        <Inula.Suspense fallback={<div>Loading...</div>}>
          <LazyApp text="Lazy" />
        </Inula.Suspense>,
        container
      );

      Inula.render(
        <Inula.Suspense fallback={<div>Loading...</div>}>
          <LazyApp text="Lazy" />
        </Inula.Suspense>,
        container
      );
    }).not.toThrow();
  });
});
