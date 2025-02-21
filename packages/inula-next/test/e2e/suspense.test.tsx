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
import { lazy, render, Suspense } from '../../src';

// Add control over the promise resolution
function createMockImport() {
  let resolve: (value: { default: () => JSX.Element }) => void;
  const promise = new Promise(r => {
    resolve = r;
  });

  function Component() {
    return <div>lazy</div>;
  }

  return {
    promise,
    resolve: () => resolve({ default: Component }),
  };
}

describe('lazy', () => {
  it('lazy loading states', async ({ container }) => {
    const mockImport = createMockImport();
    const LazyComponent = lazy(() => mockImport.promise);

    function App() {
      return (
        <Suspense fallback={<div>loading...</div>}>
          <LazyComponent />
        </Suspense>
      );
    }

    render(App(), container);
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>loading...</div>');
    });

    // Resolve the lazy component
    mockImport.resolve();

    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>lazy</div>');
    });
  });

  it('should handle multiple lazy components', async ({ container }) => {
    const mockImport1 = createMockImport();
    const mockImport2 = createMockImport();
    const LazyComponent1 = lazy(() => mockImport1.promise);
    const LazyComponent2 = lazy(() => mockImport2.promise);

    function App() {
      return (
        <Suspense fallback={<div>loading...</div>}>
          <LazyComponent1 />
          <LazyComponent2 />
        </Suspense>
      );
    }

    render(App(), container);
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>loading...</div>');
    });

    // Resolve first component
    mockImport1.resolve();
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>loading...</div>');
    });

    // Resolve second component
    mockImport2.resolve();
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>lazy</div><div>lazy</div>');
    });
  });

  it('should handle nested suspense boundaries', async ({ container }) => {
    const mockImport1 = createMockImport();
    const mockImport2 = createMockImport();
    const LazyOuter = lazy(() => mockImport1.promise);
    const LazyInner = lazy(() => mockImport2.promise);

    function App() {
      return (
        <Suspense fallback={<div>outer loading...</div>}>
          <LazyOuter />
          <Suspense fallback={<div>inner loading...</div>}>
            <LazyInner />
          </Suspense>
        </Suspense>
      );
    }

    render(App(), container);
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>outer loading...</div>');
    });

    mockImport1.resolve();
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>lazy</div><div>inner loading...</div>');
    });

    mockImport2.resolve();
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>lazy</div><div>lazy</div>');
    });
  });

  it('should handle errors in lazy components', async ({ container }) => {
    const mockImport = {
      promise: Promise.reject(new Error('Failed to load')),
    };
    const LazyComponent = lazy(() => mockImport.promise);

    function App() {
      return (
        <Suspense fallback={<div>loading...</div>}>
          <LazyComponent />
        </Suspense>
      );
    }

    render(App(), container);
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('<div>loading...</div>');
    });

    // Let the error propagate
    await expect(mockImport.promise).rejects.toThrow('Failed to load');
  });
});
