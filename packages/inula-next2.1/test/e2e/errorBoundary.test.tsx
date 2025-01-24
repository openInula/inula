/*
 * Copyright (c) 2024 Huawei Technologies Co.,Ltd.
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
/**
 * @jsxImportSource @openinula/next
 */

import { describe, expect, vi } from 'vitest';
import { domTest as it } from './utils';
import { lazy, render, ErrorBoundary } from '../../src';

describe('ErrorBoundary', () => {
  it('should render fallback when error', async ({ container }) => {
    const BuggyCounter = () => {
      throw new Error('计数器崩溃了！');

      return <p>当前计数: {count}</p>;
    };

    const App = () => {
      const Fallback = error => <div>{error.message}</div>;
      return (
        <ErrorBoundary fallback={Fallback}>
          <BuggyCounter />
        </ErrorBoundary>
      );
    };

    render(App(), container);
    await vi.waitFor(() => {
      expect(container.innerHTML).toEqual('<div>计数器崩溃了！</div>');
    });
  });

  it('should render children when no error', async ({ container }) => {
    const NormalComponent = () => {
      return <div>正常组件</div>;
    };

    const App = () => {
      const Fallback = error => <div>{error.message}</div>;
      return (
        <ErrorBoundary fallback={Fallback}>
          <NormalComponent />
        </ErrorBoundary>
      );
    };

    render(App(), container);
    await vi.waitFor(() => {
      expect(container.innerHTML).toEqual('<div>正常组件</div>');
    });
  });

  it('should handle nested error boundaries', async ({ container }) => {
    const BuggyComponent = () => {
      throw new Error('内部错误');
      return <div>Bug</div>;
    };

    const MiddleComponent = () => {
      return (
        <div>
          <BuggyComponent />
        </div>
      );
    };

    const App = () => {
      const OuterFallback = error => <div>外部错误: {error.message}</div>;
      const InnerFallback = error => <div>内部错误: {error.message}</div>;

      return (
        <ErrorBoundary fallback={OuterFallback}>
          <div>
            <ErrorBoundary fallback={InnerFallback}>
              <MiddleComponent />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );
    };

    render(App(), container);
    await vi.waitFor(() => {
      expect(container.innerHTML).toEqual('<div><div>内部错误: 内部错误</div></div>');
    });
  });
});
