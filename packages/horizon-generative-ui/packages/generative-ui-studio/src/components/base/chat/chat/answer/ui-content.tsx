import type { FC } from 'react'
import { memo } from 'react'
import type { ChatItem } from '../../types'
import { Markdown } from '@/components/base/markdown'
import cn from '@/utils/classnames'
import { createElement, render } from '@cloudsop/horizon';
import { DSL, DSLEngine, ErrorBoundary } from '@cloudsop/dsl-engine-web';
import { MutableRefObject, useRef } from 'react';
import { repairJson } from './completeJSON'


type UIContentProps = {
  item: ChatItem
}
const UIContent: FC<UIContentProps> = ({
  item,
}) => {
  const {
    annotation,
    content,
  } = item

  const cacheRef = useRef<DSL[]>([]);

  if (!content) {
    return null;
  }
  let dsl: DSL[];
  try {
    const parsed = JSON.parse(repairJson(content));
    dsl = !Array.isArray(parsed) ? [parsed] : parsed;
  } catch (error) {
    dsl = cacheRef.current;
  }

  const Fallback = () => {
    return createElement(DSLEngine, { data: cacheRef.current });
  };

  return (
    <div
      className="min-w-[600px]"
      ref={(container) => {
        if (container) {
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
    ></div>
  );
}

export default memo(UIContent)
