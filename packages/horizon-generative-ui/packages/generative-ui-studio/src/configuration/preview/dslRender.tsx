import { createElement, render, unmountComponentAtNode } from '@cloudsop/horizon';
import { DSL, DSLEngine, ErrorBoundary } from '@cloudsop/dsl-engine-web';
import { MutableRefObject, useEffect, useRef } from 'react';
import { Spin } from 'antd';

export const useDSLRender = () => {
  const cachesRef = useRef<Map<number, MutableRefObject<DSL[]>>>(new Map());

  const rendererRef = useRef(null);

  useEffect(() => {
    return () => {
      cachesRef.current = null;
    };
  }, []);

  if (!rendererRef.current) {
    rendererRef.current = memoize((content: string, index: number, streaming: boolean = false) => {
      // Initialize cache for this index if it doesn't exist
      if (!cachesRef.current.has(index)) {
        cachesRef.current.set(index, { current: [] });
      }

      // Get the cache for this specific index
      const cache = cachesRef.current.get(index)!;

      // Pass the specific cache to renderDsl
      return renderDsl(content, streaming, cache);
    });
  }
  return rendererRef.current;
};
const renderDsl = (
  content: string,
  streaming: boolean = false,
  cacheRef: MutableRefObject<DSL[] | undefined>,
) => {
  if (!content) {
    return null;
  }
  let dsl: DSL[];
  try {
    const parsed = JSON.parse(content);
    dsl = !Array.isArray(parsed) ? [parsed] : parsed;
  } catch (error) {
    if (streaming) {
      dsl = cacheRef.current;
    } else {
      return (
        <div>
          Parse error:
          <code>{content}</code>
        </div>
      );
    }
  }

  const Fallback = () => {
    return createElement(
      ErrorBoundary,
      {
        fallback: function () {
          return ' ';
        },
      },
      createElement(DSLEngine, { data: cacheRef.current, enableErrorBoundary: false }),
    );
  };

  return (
    <Spin spinning={streaming} wrapperClassName="after:!bg-black after:!bg-opacity-70">
      <div
        className="min-w-[600px] min-h-8"
        ref={(container) => {
          if (container) {
            unmountComponentAtNode(container);
            render(
              createElement(
                ErrorBoundary,
                { fallback: createElement(Fallback) },
                createElement(DSLEngine, { data: dsl, enableErrorBoundary: false }),
              ),
              container,
              () => {
                cacheRef.current = dsl;
              },
            );
          }
        }}
      />
    </Spin>
  );
};

/**
 * 创建一个缓存函数，对输入相同的参数返回缓存的结果
 * @param {Function} fn - 需要被缓存的函数
 * @returns {Function} - 带有缓存功能的新函数
 */
export function memoize(fn) {
  // 创建一个缓存对象
  const cache = new Map();

  // 返回一个新函数，这个函数会检查缓存中是否有结果
  return function (...args) {
    // 将参数转换为字符串作为缓存的键
    const key = JSON.stringify(args);

    // 检查缓存中是否已有此键
    if (cache.has(key)) {
      return cache.get(key);
    }

    // 如果缓存中没有，调用原函数计算结果
    const result = fn.apply(this, args);

    // 将结果存入缓存
    cache.set(key, result);
    return result;
  };
}
